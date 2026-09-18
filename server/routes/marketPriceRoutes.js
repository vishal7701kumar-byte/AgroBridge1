const express = require('express');
const router = express.Router();
const govMandiService = require('../services/govMandiService');

/**
 * GET /api/market-prices
 * 
 * Filterable real agricultural market price data from Government of India OGD Platform.
 * Supports query parameters:
 *  - commodity (e.g. Tomato)
 *  - state (e.g. Madhya Pradesh)
 *  - district (e.g. Bhopal)
 *  - market (e.g. Bhopal)
 *  - variety (e.g. Hybrid)
 *  - grade (e.g. FAQ)
 *  - date (e.g. 18/09/2026)
 *  - limit (e.g. 20)
 *  - offset (e.g. 0)
 * 
 * Example:
 * GET /api/market-prices?commodity=Tomato&state=Madhya%20Pradesh&limit=20
 */
router.get('/', async (req, res) => {
  try {
    // 1. Sanitize & validate query parameters
    const sanitizeStr = (val) => {
      if (!val || typeof val !== 'string') return null;
      return val.trim().replace(/[$<>{}]/g, '').substring(0, 100);
    };

    const filters = {
      commodity: sanitizeStr(req.query.commodity),
      state: sanitizeStr(req.query.state),
      district: sanitizeStr(req.query.district),
      market: sanitizeStr(req.query.market),
      variety: sanitizeStr(req.query.variety),
      grade: sanitizeStr(req.query.grade),
      date: sanitizeStr(req.query.date),
      limit: req.query.limit ? parseInt(req.query.limit, 10) : 20,
      offset: req.query.offset ? parseInt(req.query.offset, 10) : 0
    };

    // 2. Fetch normalized market prices from government service
    const result = await govMandiService.getMarketPrices(filters);

    return res.json(result);
  } catch (err) {
    // Safe logging without leaking secrets or tokens
    console.error('[MarketPriceRoutes] Error processing request:', err.message);
    return res.status(500).json({
      success: false,
      source: {
        name: 'Government of India Open Government Data Platform',
        dataset: 'Current Daily Price of Various Commodities from Various Markets (Mandi)',
        isLive: false
      },
      filters: {},
      records: [],
      error: 'Government mandi price data is currently unavailable.'
    });
  }
});

/**
 * GET /api/market-prices/history
 * Returns historical time-series mandi records (7d, 30d, 90d) for interactive Recharts graphs
 */
router.get('/history', (req, res) => {
  try {
    const commodity = req.query.commodity || 'Tomato';
    const market = req.query.market || 'Bhopal';
    const days = parseInt(req.query.days, 10) || 30;

    const history = govMandiService.getHistoricalPrices(commodity, market, days);

    return res.json({
      success: true,
      commodity,
      market,
      days,
      count: history.length,
      unit: '₹/kg',
      source: 'Government of India OGD Platform (data.gov.in / AGMARKNET)',
      data: history
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, data: [] });
  }
});

/**
 * GET /api/market-prices/latest
 * Returns the most recent observed benchmark record for a commodity and market
 */
router.get('/latest', (req, res) => {
  try {
    const commodity = req.query.commodity || 'Tomato';
    const market = req.query.market || 'Bhopal';
    const history = govMandiService.getHistoricalPrices(commodity, market, 30);
    const latest = history.length > 0 ? history[history.length - 1] : null;

    if (!latest) {
      return res.json({
        success: false,
        message: 'No recent mandi records found for the requested commodity/market',
        data: null
      });
    }

    return res.json({
      success: true,
      commodity,
      market,
      latestPricePerKg: latest.modalPricePerKg,
      latestPriceQuintal: latest.modalPriceQuintal,
      date: latest.date,
      source: 'Government of India OGD Platform (data.gov.in / AGMARKNET)',
      data: latest
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/market-prices/filters
 * Returns unique commodities, states, districts, and markets for interactive UI selectors
 */
router.get('/filters', (req, res) => {
  try {
    const options = govMandiService.getFilterOptions();
    return res.json({
      success: true,
      data: options
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/market-prices/status
 * Reports OGD platform connection, cache TTL, and masked key configuration
 */
router.get('/status', (req, res) => {
  try {
    const status = govMandiService.getStatus();
    return res.json({
      success: true,
      data: status
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/market-prices/refresh
 * Forces fresh fetch from data.gov.in API
 */
router.post('/refresh', async (req, res) => {
  try {
    const { commodity, state, district, market, limit } = req.body || {};
    const result = await govMandiService.fetchFromGovAPI({ commodity, state, district, market, limit });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
