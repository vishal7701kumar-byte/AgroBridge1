/**
 * AgroBridge Government Mandi Price Integration Service
 * 
 * PRIMARY SOURCE:
 * Government of India's Open Government Data (OGD) Platform: https://data.gov.in/
 * Dataset: "Current Daily Price of Various Commodities from Various Markets (Mandi)"
 * Resource ID: 9ef84268-d588-465a-a308-a864a43d0070
 * 
 * SECURITY & TRUTH-IN-DATA GUARANTEES:
 * 1. API key is strictly read from backend environment (process.env.OGD_API_KEY)
 *    and NEVER exposed to frontend clients.
 * 2. Prices are preserved in original ₹/quintal and converted to ₹/kg (₹/quintal ÷ 100).
 * 3. Filter-aware in-memory and persistent caching avoids rate-limit exhaustion.
 * 4. Cache metadata indicates fetch time, source date, and staleness flag.
 * 5. STRICT TRUTH: If government data is unavailable or uncataloged, fake prices
 *    are NEVER fabricated.
 */

const fs = require('fs');
const path = require('path');

// Read Environment Configurations with documented defaults
function getEnvConfig() {
  const apiKey = process.env.OGD_API_KEY ||
    process.env.DATA_GOV_IN_API_KEY ||
    process.env.AGMARKNET_API_KEY ||
    process.env.GOV_MANDI_API_KEY ||
    '';

  const resourceId = process.env.OGD_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070';
  const apiBaseUrl = process.env.OGD_API_BASE_URL || 'https://api.data.gov.in/resource';
  const cacheTtlSeconds = parseInt(process.env.MANDI_PRICE_CACHE_TTL, 10) || 900; // 15 mins default

  return {
    apiKey,
    resourceId,
    apiBaseUrl,
    cacheTtlMs: cacheTtlSeconds * 1000
  };
}

const CACHE_FILE_PATH = path.join(__dirname, '../data/gov_mandi_cache.json');

// Memory Cache Store: baseline + filter-keyed query cache
let inMemoryCache = {
  lastSync: null,
  source: 'Government of India OGD Platform',
  dataset: 'Current Daily Price of Various Commodities from Various Markets (Mandi)',
  resourceId: '9ef84268-d588-465a-a308-a864a43d0070',
  records: []
};

const queryCacheMap = new Map();

// Commodity Synonym Mapping Dictionary
const COMMODITY_SYNONYMS = {
  'tomato': 'Tomato',
  'tomatoes': 'Tomato',
  'tamatar': 'Tomato',
  'potato': 'Potato',
  'potatoes': 'Potato',
  'aloo': 'Potato',
  'alu': 'Potato',
  'onion': 'Onion',
  'onions': 'Onion',
  'pyaz': 'Onion',
  'pyaaz': 'Onion',
  'wheat': 'Wheat',
  'gehu': 'Wheat',
  'gehun': 'Wheat',
  'cucumber': 'Cucumber',
  'cucumbers': 'Cucumber',
  'kheera': 'Cucumber',
  'apple': 'Apple',
  'apples': 'Apple',
  'seb': 'Apple',
  'soybean': 'Soyabean',
  'soyabean': 'Soyabean',
  'garlic': 'Garlic',
  'lahsun': 'Garlic',
  'rice': 'Rice',
  'chawal': 'Rice',
  'paddy': 'Rice',
  'gram': 'Gram',
  'chana': 'Gram',
  'mustard': 'Mustard',
  'sarson': 'Mustard'
};

/**
 * Initialize cache from persistent disk file
 */
function initCache() {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const content = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
      const parsed = JSON.parse(content);
      inMemoryCache.records = parsed.records || [];
      inMemoryCache.lastSync = parsed.lastSync || new Date().toISOString();
      console.log(`[GovMandiService] Loaded ${inMemoryCache.records.length} government mandi records from cache file.`);
    } else {
      inMemoryCache.records = [];
      inMemoryCache.lastSync = null;
    }
  } catch (err) {
    console.error('[GovMandiService] Failed to load cache file:', err.message);
  }
}

initCache();

/**
 * Resolve canonical crop name from synonyms
 */
function matchCommodityName(inputName) {
  if (!inputName) return null;
  const lower = inputName.toLowerCase().trim();

  for (const [key, canonical] of Object.entries(COMMODITY_SYNONYMS)) {
    if (lower.includes(key) || key.includes(lower)) {
      return canonical;
    }
  }
  return inputName.trim();
}

/**
 * Normalize raw government record from data.gov.in
 * Preserves original ₹/quintal, and provides ₹/kg equivalent (÷ 100)
 */
function normalizeRecord(raw) {
  if (!raw) return null;

  const minQtl = parseFloat(raw.min_price !== undefined ? raw.min_price : raw.minimumPrice);
  const maxQtl = parseFloat(raw.max_price !== undefined ? raw.max_price : raw.maximumPrice);
  const modalQtl = parseFloat(raw.modal_price !== undefined ? raw.modal_price : raw.modalPrice);

  const minimumPrice = !isNaN(minQtl) ? Math.round(minQtl) : null;
  const maximumPrice = !isNaN(maxQtl) ? Math.round(maxQtl) : null;
  const modalPrice = !isNaN(modalQtl) ? Math.round(modalQtl) : null;

  const minPricePerKg = minimumPrice !== null ? Math.round((minimumPrice / 100) * 10) / 10 : null;
  const maxPricePerKg = maximumPrice !== null ? Math.round((maximumPrice / 100) * 10) / 10 : null;
  const modalPricePerKg = modalPrice !== null ? Math.round((modalPrice / 100) * 10) / 10 : null;

  const config = getEnvConfig();

  return {
    commodity: (raw.commodity || '').trim(),
    variety: (raw.variety || 'FAQ').trim(),
    grade: (raw.grade || 'FAQ').trim(),
    state: (raw.state || '').trim(),
    district: (raw.district || '').trim(),
    market: (raw.market || '').trim(),
    arrivalDate: (raw.arrival_date || raw.arrivalDate || '').trim(),
    minimumPrice,
    maximumPrice,
    modalPrice,
    priceUnit: '₹/quintal',
    modalPricePerKg,
    minPricePerKg,
    maxPricePerKg,
    unitConversion: '₹/kg = ₹/quintal ÷ 100',
    source: 'Government of India OGD Platform',
    sourceDataset: 'Current Daily Price of Various Commodities from Various Markets (Mandi)',
    resourceId: config.resourceId,
    isGovernmentData: true
  };
}

/**
 * Generate a deterministic cache key for a given set of filters
 */
function buildCacheKey(filters = {}) {
  const c = (filters.commodity || '').toLowerCase().trim();
  const s = (filters.state || '').toLowerCase().trim();
  const d = (filters.district || '').toLowerCase().trim();
  const m = (filters.market || '').toLowerCase().trim();
  const v = (filters.variety || '').toLowerCase().trim();
  const g = (filters.grade || '').toLowerCase().trim();
  const dt = (filters.date || '').toLowerCase().trim();
  return `mandi:${c}_${s}_${d}_${m}_${v}_${g}_${dt}`;
}

/**
 * Fetch fresh data from data.gov.in API
 */
async function fetchFromGovAPI(filters = {}) {
  const config = getEnvConfig();
  if (!config.apiKey) {
    return {
      success: false,
      error: 'OGD_API_KEY is not configured in backend environment variables.',
      records: []
    };
  }

  const endpointUrl = `${config.apiBaseUrl}/${config.resourceId}`;
  const queryParams = new URLSearchParams({
    'api-key': config.apiKey,
    'format': 'json',
    'limit': filters.limit ? String(filters.limit) : '100'
  });

  if (filters.offset) {
    queryParams.append('offset', String(filters.offset));
  }

  if (filters.commodity) {
    const canonical = matchCommodityName(filters.commodity) || filters.commodity;
    queryParams.append('filters[commodity]', canonical);
  }
  if (filters.state) {
    queryParams.append('filters[state]', filters.state);
  }
  if (filters.district) {
    queryParams.append('filters[district]', filters.district);
  }
  if (filters.market) {
    queryParams.append('filters[market]', filters.market);
  }

  const url = `${endpointUrl}?${queryParams.toString()}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OGD Platform responded with HTTP ${response.status}`);
    }

    const json = await response.json();
    const rawRecords = Array.isArray(json.records) ? json.records : [];

    if (rawRecords.length > 0) {
      const normalized = rawRecords.map(normalizeRecord).filter(Boolean);
      updateCacheRecords(rawRecords);
      return { success: true, count: normalized.length, records: normalized, isLive: true };
    }

    return { success: true, count: 0, records: [], isLive: true };
  } catch (err) {
    // Safe logging without leaking secrets or tokens
    console.error('[GovMandiService] OGD fetch error:', err.name === 'AbortError' ? 'Network Timeout' : err.message);
    return { success: false, error: err.name === 'AbortError' ? 'Government API request timed out' : err.message, records: [] };
  }
}

/**
 * Update persistent memory and disk cache with newly received records
 */
function updateCacheRecords(newRawRecords) {
  if (!Array.isArray(newRawRecords) || newRawRecords.length === 0) return;

  const existingMap = new Map();
  inMemoryCache.records.forEach(r => {
    const key = `${r.state}_${r.market}_${r.commodity}_${r.variety || ''}_${r.arrival_date || r.arrivalDate || ''}`.toLowerCase();
    existingMap.set(key, r);
  });

  newRawRecords.forEach(r => {
    const key = `${r.state}_${r.market}_${r.commodity}_${r.variety || ''}_${r.arrival_date || r.arrivalDate || ''}`.toLowerCase();
    existingMap.set(key, r);
  });

  inMemoryCache.records = Array.from(existingMap.values());
  inMemoryCache.lastSync = new Date().toISOString();

  try {
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(inMemoryCache, null, 2), 'utf8');
  } catch (err) {
    console.error('[GovMandiService] Failed to persist cache to disk:', err.message);
  }
}

/**
 * Core normalized API: Get Market Prices with Filtering, Caching & Pagination
 * 
 * Matches exact prompt requirement:
 * GET /api/market-prices?commodity=Tomato&state=Madhya%20Pradesh&limit=20
 */
async function getMarketPrices(filters = {}) {
  const config = getEnvConfig();
  const cacheKey = buildCacheKey(filters);
  const now = Date.now();

  // 1. Check Query Cache
  const cachedQuery = queryCacheMap.get(cacheKey);
  if (cachedQuery && (now - cachedQuery.fetchedAt) < config.cacheTtlMs) {
    return {
      ...cachedQuery.payload,
      cache: {
        used: true,
        fetchedAt: new Date(cachedQuery.fetchedAt).toISOString(),
        sourceDate: cachedQuery.sourceDate,
        isStale: false
      }
    };
  }

  // 2. Query filter matches against local baseline records
  let matchedRecords = inMemoryCache.records.map(normalizeRecord).filter(Boolean);

  if (filters.commodity) {
    const canonical = matchCommodityName(filters.commodity) || filters.commodity;
    matchedRecords = matchedRecords.filter(r =>
      r.commodity.toLowerCase().includes(canonical.toLowerCase()) ||
      canonical.toLowerCase().includes(r.commodity.toLowerCase())
    );
  }

  if (filters.state) {
    const stateTerm = filters.state.toLowerCase().trim();
    matchedRecords = matchedRecords.filter(r =>
      r.state.toLowerCase().includes(stateTerm)
    );
  }

  if (filters.district) {
    const districtTerm = filters.district.toLowerCase().trim();
    matchedRecords = matchedRecords.filter(r =>
      r.district.toLowerCase().includes(districtTerm)
    );
  }

  if (filters.market) {
    const marketTerm = filters.market.toLowerCase().trim();
    matchedRecords = matchedRecords.filter(r =>
      r.market.toLowerCase().includes(marketTerm)
    );
  }

  if (filters.variety) {
    const varietyTerm = filters.variety.toLowerCase().trim();
    matchedRecords = matchedRecords.filter(r =>
      r.variety.toLowerCase().includes(varietyTerm)
    );
  }

  if (filters.grade) {
    const gradeTerm = filters.grade.toLowerCase().trim();
    matchedRecords = matchedRecords.filter(r =>
      r.grade.toLowerCase().includes(gradeTerm)
    );
  }

  if (filters.date) {
    const dateTerm = filters.date.toLowerCase().trim();
    matchedRecords = matchedRecords.filter(r =>
      r.arrivalDate.toLowerCase().includes(dateTerm)
    );
  }

  // Deduplicate and sort by arrivalDate descending
  const seenMap = new Map();
  matchedRecords.forEach(r => {
    const dedupeKey = `${r.state}_${r.market}_${r.commodity}_${r.arrivalDate}`.toLowerCase();
    if (!seenMap.has(dedupeKey)) {
      seenMap.set(dedupeKey, r);
    }
  });

  let sortedRecords = Array.from(seenMap.values()).sort((a, b) => {
    return (b.arrivalDate || '').localeCompare(a.arrivalDate || '');
  });

  // Handle Pagination
  const limit = Math.max(1, Math.min(100, parseInt(filters.limit, 10) || 20));
  const offset = Math.max(0, parseInt(filters.offset, 10) || 0);
  const paginatedRecords = sortedRecords.slice(offset, offset + limit);

  const latestSourceDate = sortedRecords.length > 0 ? sortedRecords[0].arrivalDate : null;
  const lastUpdated = inMemoryCache.lastSync
    ? inMemoryCache.lastSync.split('T')[0]
    : (latestSourceDate || new Date().toISOString().split('T')[0]);

  // Check if cached data is older than TTL
  const cacheAgeMs = inMemoryCache.lastSync ? (now - new Date(inMemoryCache.lastSync).getTime()) : 0;
  const isStale = cacheAgeMs > config.cacheTtlMs;

  const resultPayload = {
    success: true,
    source: {
      name: 'Government of India Open Government Data Platform',
      dataset: 'Current Daily Price of Various Commodities from Various Markets (Mandi)',
      isLive: !isStale && config.apiKey ? true : false,
      sourceUrl: 'https://data.gov.in/'
    },
    filters: {
      commodity: filters.commodity || null,
      state: filters.state || null,
      district: filters.district || null,
      market: filters.market || null,
      variety: filters.variety || null,
      grade: filters.grade || null,
      date: filters.date || null
    },
    lastUpdated,
    totalRecords: sortedRecords.length,
    limit,
    offset,
    records: paginatedRecords,
    cache: {
      used: true,
      fetchedAt: inMemoryCache.lastSync || new Date().toISOString(),
      sourceDate: latestSourceDate,
      isStale,
      note: isStale ? 'Latest available government data may be outdated.' : null
    },
    error: null
  };

  // If no records match, return clean empty result (No fake prices)
  if (paginatedRecords.length === 0) {
    resultPayload.records = [];
    resultPayload.message = 'No government mandi price records found for the selected filters.';
  }

  // Cache query payload
  queryCacheMap.set(cacheKey, {
    fetchedAt: now,
    sourceDate: latestSourceDate,
    payload: resultPayload
  });

  return resultPayload;
}

/**
 * Get benchmark mandi price for a specific commodity (used in product comparison)
 */
function getCommodityMandiBenchmark(productName, preferredDistrict = 'Bhopal', preferredState = 'Madhya Pradesh') {
  const canonicalCrop = matchCommodityName(productName);

  if (!canonicalCrop) {
    return {
      available: false,
      commodity: productName,
      modalPricePerKg: null,
      minPricePerKg: null,
      maxPricePerKg: null,
      minimumPrice: null,
      maximumPrice: null,
      modalPrice: null,
      priceUnit: '₹/quintal',
      mandiDetails: null,
      message: `Government mandi price data is currently unavailable for "${productName}". This crop is not cataloged in current APMC daily feeds.`,
      isGovernmentVerified: false,
      source: 'Government of India OGD Platform'
    };
  }

  const normalizedRecords = inMemoryCache.records
    .map(normalizeRecord)
    .filter(r => r && r.commodity.toLowerCase() === canonicalCrop.toLowerCase() && r.modalPricePerKg !== null);

  if (normalizedRecords.length === 0) {
    return {
      available: false,
      commodity: canonicalCrop,
      modalPricePerKg: null,
      minPricePerKg: null,
      maxPricePerKg: null,
      minimumPrice: null,
      maximumPrice: null,
      modalPrice: null,
      priceUnit: '₹/quintal',
      mandiDetails: null,
      message: `Government mandi price data is currently unavailable for ${canonicalCrop}. No active mandi arrival reports found for today.`,
      isGovernmentVerified: false,
      source: 'Government of India OGD Platform'
    };
  }

  // 1. Try to match district
  let match = normalizedRecords.find(r =>
    r.district.toLowerCase() === (preferredDistrict || '').toLowerCase()
  );

  // 2. Try to match state
  if (!match) {
    match = normalizedRecords.find(r =>
      r.state.toLowerCase() === (preferredState || '').toLowerCase()
    );
  }

  // 3. Fallback to first available national record
  if (!match) {
    match = normalizedRecords[0];
  }

  const config = getEnvConfig();

  return {
    available: true,
    commodity: match.commodity,
    variety: match.variety,
    grade: match.grade,
    state: match.state,
    district: match.district,
    market: match.market,
    arrivalDate: match.arrivalDate,
    minimumPrice: match.minimumPrice,
    maximumPrice: match.maximumPrice,
    modalPrice: match.modalPrice,
    priceUnit: '₹/quintal',
    modalPricePerKg: match.modalPricePerKg,
    minPricePerKg: match.minPricePerKg,
    maxPricePerKg: match.maxPricePerKg,
    unitConversion: '₹/kg = ₹/quintal ÷ 100',
    isGovernmentVerified: true,
    source: 'Government of India OGD Platform',
    resourceId: config.resourceId,
    sourceDataset: 'Current Daily Price of Various Commodities from Various Markets (Mandi)',
    lastUpdated: inMemoryCache.lastSync || match.arrivalDate
  };
}

/**
 * Return all unique filter options (commodities, states, districts, markets)
 */
function getFilterOptions() {
  const commodities = new Set();
  const states = new Set();
  const districts = new Set();
  const markets = new Set();

  inMemoryCache.records.forEach(r => {
    if (r.commodity) commodities.add(r.commodity.trim());
    if (r.state) states.add(r.state.trim());
    if (r.district) districts.add(r.district.trim());
    if (r.market) markets.add(r.market.trim());
  });

  return {
    commodities: Array.from(commodities).sort(),
    states: Array.from(states).sort(),
    districts: Array.from(districts).sort(),
    markets: Array.from(markets).sort()
  };
}

/**
 * Integration health and cache status
 */
function getStatus() {
  const config = getEnvConfig();
  const hasKey = Boolean(config.apiKey);
  return {
    service: 'AgroBridge Government Mandi Price Service',
    provider: 'Government of India Open Government Data Platform (data.gov.in / AGMARKNET)',
    dataset: 'Current Daily Price of Various Commodities from Various Markets (Mandi)',
    resourceId: config.resourceId,
    apiBaseUrl: config.apiBaseUrl,
    apiKeyConfigured: hasKey,
    apiKeyMasked: hasKey ? '***KEY_CONFIGURED_ON_SERVER***' : 'NOT_CONFIGURED',
    cachedRecordsCount: inMemoryCache.records.length,
    lastSync: inMemoryCache.lastSync,
    cacheTtlSeconds: config.cacheTtlMs / 1000,
    supportedCommodities: Object.values(COMMODITY_SYNONYMS)
  };
}

/**
 * Backward-compatible helper for /api/mandi/prices
 */
function getAllNormalizedMandiPrices(filters = {}) {
  let list = inMemoryCache.records.map(normalizeRecord).filter(Boolean);

  if (filters.commodity) {
    const canonical = matchCommodityName(filters.commodity) || filters.commodity;
    list = list.filter(r => r.commodity.toLowerCase().includes(canonical.toLowerCase()));
  }

  if (filters.state) {
    list = list.filter(r => r.state.toLowerCase().includes(filters.state.toLowerCase()));
  }

  if (filters.market) {
    list = list.filter(r => r.market.toLowerCase().includes(filters.market.toLowerCase()));
  }

  return list;
}

/**
 * Get historical time-series mandi records for a commodity and market
 * Supports 7d, 30d, 90d periods for Recharts charts and ML models
 */
function getHistoricalPrices(commodity, market, days = 30) {
  if (!commodity) return [];
  const canonical = matchCommodityName(commodity) || commodity;

  let matches = inMemoryCache.records
    .filter(r => {
      const c = (r.commodity || '').toLowerCase();
      const m = (r.market || '').toLowerCase();
      const matchCrop = c.includes(canonical.toLowerCase()) || canonical.toLowerCase().includes(c);
      const matchMkt = !market || m.includes(market.toLowerCase()) || market.toLowerCase().includes(m);
      return matchCrop && matchMkt;
    })
    .map(normalizeRecord)
    .filter(Boolean);

  // If no records for specific market, fallback to any regional market trading this crop
  if (matches.length === 0) {
    matches = inMemoryCache.records
      .filter(r => {
        const c = (r.commodity || '').toLowerCase();
        return c.includes(canonical.toLowerCase()) || canonical.toLowerCase().includes(c);
      })
      .map(normalizeRecord)
      .filter(Boolean);
  }

  // Parse DD/MM/YYYY dates for chronological sorting
  function parseDate(str) {
    if (!str) return 0;
    const parts = str.split('/');
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
    }
    return new Date(str).getTime() || 0;
  }

  matches.sort((a, b) => parseDate(a.arrivalDate) - parseDate(b.arrivalDate));

  const horizon = parseInt(days, 10) || 30;
  return matches.slice(-horizon);
}

module.exports = {
  getMarketPrices,
  getCommodityMandiBenchmark,
  getHistoricalPrices,
  getFilterOptions,
  getAllNormalizedMandiPrices,
  fetchFromGovAPI,
  matchCommodityName,
  normalizeRecord,
  getStatus,
  getEnvConfig,
  RESOURCE_ID: '9ef84268-d588-465a-a308-a864a43d0070',
  BASE_URL: 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070'
};

