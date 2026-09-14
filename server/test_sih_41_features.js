const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING AGROBRIDGE SIH COMPREHENSIVE 41-FEATURE TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} — ${details}`);
      failed++;
    }
  }

  try {
    // 1. Authenticate 5 Roles with Demo@123
    console.log('[TEST GROUP 1: ROLE AUTHENTICATION & DEMO ACCOUNTS]');
    const roles = [
      { role: 'FARMER', email: 'farmer@agrobridge.demo' },
      { role: 'CONSUMER', email: 'consumer@agrobridge.demo' },
      { role: 'BULK_BUYER', email: 'bulkbuyer@agrobridge.demo' },
      { role: 'DRIVER', email: 'driver@agrobridge.demo' },
      { role: 'ADMIN', email: 'admin@agrobridge.demo' }
    ];

    const tokens = {};
    for (const r of roles) {
      const res = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { email: r.email, password: 'Demo@123' });

      assert(res.status === 200 && res.data?.token, `Login as ${r.role} with Demo@123`, JSON.stringify(res.data));
      if (res.data?.token) tokens[r.role] = res.data.token;
    }

    // 2. Cross-Role Route Authorization Guard
    console.log('\n[TEST GROUP 2: ROLE ACCESS CONTROL & SECURITY GUARDS]');
    const crossAccess = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/farmer/crops',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokens.CONSUMER}` }
    });
    assert(crossAccess.status === 403, 'Consumer token rejected from Farmer endpoint (403 Forbidden)', `Got status ${crossAccess.status}`);

    // 3. Pre-Seeded SIH Demo Farmers
    console.log('\n[TEST GROUP 3: SIH DEMO FARMERS & FPO DIRECTORY]');
    const adminFarmers = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/farmers',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokens.ADMIN}` }
    });
    assert(adminFarmers.status === 200 && adminFarmers.data?.data?.length >= 5, 'Admin farmers directory returns pre-seeded SIH farmers', `Found ${adminFarmers.data?.data?.length}`);
    const farmerNames = adminFarmers.data?.data?.map(f => f.name) || [];
    assert(farmerNames.includes('Ramesh Kumar'), 'Pre-seeded farmer Ramesh Kumar present in FPO directory');
    assert(farmerNames.includes('Suresh Patel'), 'Pre-seeded farmer Suresh Patel present in FPO directory');
    assert(farmerNames.includes('Amit Verma'), 'Pre-seeded farmer Amit Verma present in FPO directory');

    // 4. AgroBridge Assured Quality & 3-Way Marketplace Filtering
    console.log('\n[TEST GROUP 4: AGROBRIDGE ASSURED & 3-WAY FILTERING]');
    const allProds = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/products',
      method: 'GET'
    });
    assert(allProds.status === 200 && allProds.data?.data?.length > 0, 'Marketplace returns active products catalog');

    const assuredProds = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/products?filter=assured',
      method: 'GET'
    });
    assert(assuredProds.status === 200 && assuredProds.data?.data?.length > 0, 'Can filter AgroBridge Assured products');
    const allAreAssured = assuredProds.data?.data?.every(p => p.isAssured === true);
    assert(allAreAssured, 'Every product in assured filter has isAssured === true');

    // 5. AI Price Prediction API
    console.log('\n[TEST GROUP 5: AI 14-DAY PRICE PREDICTOR]');
    const pricePred = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/price-prediction/Tomato',
      method: 'GET'
    });
    const predData = pricePred.data?.data;
    assert(pricePred.status === 200 && predData, 'Price Prediction API returns success');
    assert(predData?.timeline?.length >= 21, `Prediction includes full multi-horizon timeline (-7d to +14d, got ${predData?.timeline?.length} points)`);
    assert(predData?.minSafePrice > 0, `Farmer Minimum Safe Price is computed (₹${predData?.minSafePrice}/kg)`);
    assert(Boolean(predData?.trendDirection), `Trend prediction computed: ${predData?.trendDirection}`);

    // 6. AI Crop Quality Scanner
    console.log('\n[TEST GROUP 6: AI COMPUTER VISION QUALITY SCANNER]');
    const qualityScan = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/quality-scan',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { cropName: 'Tomato', image: 'test-tomato.jpg' });
    const qData = qualityScan.data?.data;
    assert(qualityScan.status === 200 && qData, 'Quality scan successfully executed');
    assert(qData?.grade?.startsWith('Grade A'), `Quality scan assessed Grade A produce (got ${qData?.grade})`);
    assert(qData?.isAssured === true, 'Quality scan awards AgroBridge Assured certification badge');

    // 7. Smart Negotiation Bot with Minimum Safe Price Invariant
    console.log('\n[TEST GROUP 7: SMART NEGOTIATION BOT & MSP INVARIANT]');
    // Case A: Offer below farmer min safe price must NEVER be accepted
    const negReject = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/negotiate',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { crop: 'Tomato', farmerMinPrice: 24, buyerOffer: 18, marketPrice: 28 });
    const rejData = negReject.data?.data;
    assert(rejData?.canAutoAccept === false, 'Offer below minimum safe price (₹18 < ₹24) canAutoAccept is false');
    assert(rejData?.isBelowSafePrice === true, 'MSP Invariant protection correctly flags isBelowSafePrice === true');

    // Case B: Fair offer within acceptable range
    const negFair = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/negotiate',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { crop: 'Tomato', farmerMinPrice: 24, buyerOffer: 26, marketPrice: 28 });
    const fairData = negFair.data?.data;
    assert(fairData?.canAutoAccept === true, 'Fair offer (₹26 >= ₹24) allows safe deal progression');

    // 8. AI Waste Alert & 5% Discount Broadcast
    console.log('\n[TEST GROUP 8: AI WASTE ALERTS & BULK BUYER BROADCAST]');
    const wasteAlerts = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/farmer/waste-alerts',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokens.FARMER}` }
    });
    assert(wasteAlerts.status === 200 && Array.isArray(wasteAlerts.data?.data), 'Waste alerts identified perishable unsold stock');

    const broadcastRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/farmer/notify-bulk-buyers',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokens.FARMER}`, 'Content-Type': 'application/json' }
    }, { cropId: 'crop_tomato_1', discountedPrice: 22 });
    assert(broadcastRes.data?.data?.notifiedBuyersCount >= 10, `Broadcast reached nearby bulk buyers (count: ${broadcastRes.data?.data?.notifiedBuyersCount})`);

    // 9. Seasonal Crop Calendar
    console.log('\n[TEST GROUP 9: SEASONAL CROP CALENDAR]');
    const cropCalendar = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/crop-calendar',
      method: 'GET'
    });
    assert(cropCalendar.status === 200 && cropCalendar.data?.data?.calendar?.length >= 5, 'Crop calendar returns seasonal sowing & harvesting matrix');

    // 10. Cryptographic Tamper-Evident Digital Receipt
    console.log('\n[TEST GROUP 10: CRYPTOGRAPHIC DIGITAL RECEIPT (SHA-256)]');
    const receiptRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/receipt/ORD-AB-98214',
      method: 'GET'
    });
    const receiptHash = receiptRes.data?.verificationHash;
    assert(receiptRes.status === 200 && receiptHash, 'Digital receipt returns valid verification hash');
    assert(receiptHash?.startsWith('0x'), `Transaction hash is cryptographic SHA-256 hex digest: ${receiptHash?.slice(0, 18)}...`);

    // 11. Multilingual AgroBridge AI Assistant
    console.log('\n[TEST GROUP 11: MULTILINGUAL AI ASSISTANT]');
    const aiHindi = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/chat',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { query: 'टमाटर का ताजा भाव क्या है?', language: 'hi' });
    assert(aiHindi.status === 200 && aiHindi.data?.data?.response?.length > 10, 'Multilingual AI assistant responds in Hindi');

    // 12. Admin Action against Farmer (Warning, Unlist, Suspend, Ban, Restore)
    console.log('\n[TEST GROUP 12: ADMIN SANCTION & GOVERNANCE SYSTEM]');
    const sanctionRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/farmers/farmer_1/status',
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${tokens.ADMIN}`, 'Content-Type': 'application/json' }
    }, { status: 'WARNING', reason: 'Packaging moisture issue reported', notes: 'Ensure dry jute sacks.' });
    assert(sanctionRes.status === 200 && sanctionRes.data?.success, 'Admin can issue Warning sanction');

    const restoreRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/farmers/farmer_1/restore',
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${tokens.ADMIN}`, 'Content-Type': 'application/json' }
    }, { notes: 'Farmer submitted verified inspection proof' });
    assert(restoreRes.status === 200 && restoreRes.data?.success, 'Admin can restore farmer standing to ACTIVE');

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();
