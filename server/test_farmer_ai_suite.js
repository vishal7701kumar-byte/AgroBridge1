const http = require('http');

const BASE_URL = 'http://localhost:5000';

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runFarmerAISuite() {
  console.log('====================================================');
  console.log('🤖 AGROBRIDGE FARMER AI DECISION SUPPORT TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Model Status Telemetry
    console.log('--- 1. AI Microservice & Model Status ---');
    const statusRes = await makeRequest('/api/ai/model-status');
    assert(statusRes.status === 200, 'GET /api/ai/model-status returns HTTP 200');
    assert(statusRes.data.success === true, 'Success flag is true');
    const statusPayload = statusRes.data.data || statusRes.data;
    assert(statusPayload.status === 'operational', 'Model status is operational');
    assert(statusPayload.activeEngine.includes('FastAPI') || statusPayload.activeEngine.includes('Python') || statusPayload.activeEngine.includes('Node.js'), `Active engine identified: ${statusPayload.activeEngine}`);
    assert(statusPayload.modelVersion.includes('ridge'), `Model version: ${statusPayload.modelVersion}`);

    // 2. Data Sources & Cache Depth
    console.log('\n--- 2. Grounding Data Sources & AGMARKNET Cache ---');
    const sourcesRes = await makeRequest('/api/ai/data-sources');
    assert(sourcesRes.status === 200, 'GET /api/ai/data-sources returns HTTP 200');
    const sourcesData = sourcesRes.data.data?.primarySource || sourcesRes.data.primarySource || sourcesRes.data.data;
    assert(sourcesData.recordsCached >= 500, `Cached records count is >= 500 (got ${sourcesData.recordsCached})`);
    assert(sourcesData.resourceId.includes('9ef84268'), `Resource ID 9ef84268 (data.gov.in) confirmed: ${sourcesData.resourceId}`);

    // 3. Price History Time-Series API
    console.log('\n--- 3. Historical Mandi Price Time-Series ---');
    const histRes = await makeRequest('/api/market-prices/history?commodity=Tomato&market=Bhopal&days=30');
    assert(histRes.status === 200, 'GET /api/market-prices/history returns HTTP 200');
    assert(Array.isArray(histRes.data.data), 'History records is an array');
    assert(histRes.data.data.length > 0, `History contains records (got ${histRes.data.data.length})`);
    assert(histRes.data.data[0].modalPrice > 0, `Modal price is positive number (₹${histRes.data.data[0].modalPrice}/kg)`);
    assert(histRes.data.unit === '₹/kg', 'Normalized unit is ₹/kg');

    // 4. AI Demand Forecasting
    console.log('\n--- 4. AI Demand Forecasting ---');
    const demandRes = await makeRequest('/api/ai/demand-forecast?commodity=Tomato&market=Bhopal&forecastDays=7');
    assert(demandRes.status === 200, 'GET /api/ai/demand-forecast returns HTTP 200');
    const demandPayload = demandRes.data.data || demandRes.data;
    assert(Boolean(demandPayload.demandLevel), `Demand level classified (${demandPayload.demandLevel})`);
    assert(['Increasing', 'Stable', 'Decreasing'].includes(demandPayload.trend), `Trend direction classified (${demandPayload.trend})`);
    assert(Array.isArray(demandPayload.reasons) && demandPayload.reasons.length >= 1, 'Explainable AI "Why?" factors provided');
    assert(Boolean(demandPayload.farmerSuggestion), 'Farmer action suggestion provided');
    assert(typeof demandPayload.coldStart === 'boolean', 'Cold-start boolean indicator present');

    // 5. AI Price Advisory & Strict 3-Way Separation
    console.log('\n--- 5. AI Price Advisory & Strict 3-Way Separation ---');
    const priceRes = await makeRequest('/api/ai/price-forecast?commodity=Tomato&market=Bhopal&forecastDays=7&farmerListingPrice=29');
    assert(priceRes.status === 200, 'GET /api/ai/price-forecast returns HTTP 200');
    const pricePayload = priceRes.data.data || priceRes.data;
    assert(Boolean(pricePayload.currentMarketReference), 'A. Government Mandi Reference object present');
    assert(typeof pricePayload.currentMarketReference.pricePerKg === 'number' && pricePayload.currentMarketReference.pricePerKg > 0, `A. Benchmark price: ₹${pricePayload.currentMarketReference.pricePerKg}/kg`);
    assert(Boolean(pricePayload.aiForecast), 'B. AI Forecast object present');
    assert(typeof pricePayload.aiForecast.minPerKg === 'number' && typeof pricePayload.aiForecast.maxPerKg === 'number', `B. Projected range: ${pricePayload.aiForecast.rangePerKg}`);
    assert(Boolean(pricePayload.farmerListingPrice), 'C. Farmer Listing Price object present');
    assert(pricePayload.farmerListingPrice.pricePerKg === 29, `C. Farmer Listing Price preserved exactly: ₹${pricePayload.farmerListingPrice.pricePerKg}/kg`);
    assert(Boolean(pricePayload.farmerListingPrice.farmerAutonomyNote), 'Farmer autonomy disclaimer present');

    // 6. Comprehensive Market Insight Synthesis
    console.log('\n--- 6. Market Insight Synthesis ---');
    const insightRes = await makeRequest('/api/ai/market-insight?commodity=Tomato&market=Bhopal&farmerListingPrice=29');
    assert(insightRes.status === 200, 'GET /api/ai/market-insight returns HTTP 200');
    const insightPayload = insightRes.data.data || insightRes.data;
    assert(Boolean(insightPayload.marketActivity || insightPayload.headline), 'Market activity indicator generated');
    assert(Boolean(insightPayload.aiInsight || insightPayload.insight || insightPayload.synthesisNarrative), `Full synthesis narrative generated: "${insightPayload.aiInsight}"`);

    // 7. Multi-Commodity Decision Coverage
    console.log('\n--- 7. Multi-Commodity Decision Coverage ---');
    const testCrops = ['Potato', 'Onion', 'Wheat', 'Soyabean', 'Cucumber', 'Apple'];
    for (const crop of testCrops) {
      const res = await makeRequest(`/api/ai/price-forecast?commodity=${crop}`);
      const p = res.data.data || res.data;
      assert(res.status === 200 && res.data.success === true, `Price forecast supported for ${crop} (Benchmark: ₹${p?.currentMarketReference?.pricePerKg}/kg)`);
    }

    console.log('\n====================================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed === 0) {
      console.log('🎉 ALL FARMER AI DECISION SUPPORT TESTS PASSED WITH 100% SUCCESS!');
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runFarmerAISuite();
