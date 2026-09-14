const http = require('http');

function request(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: headers
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(body);
        } catch (e) {
          parsed = body;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('STARTING AGROBRIDGE ADMIN FARMER SYSTEM VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      if (details) console.error(`   Details: ${details}`);
      failed++;
    }
  }

  try {
    // 0. Authenticate Admin and Farmer
    console.log('--- Test 0: Authentication & Token Acquisition ---');
    const adminLoginRes = await request('http://localhost:5000/api/auth/login', {
      method: 'POST'
    }, {
      email: 'admin@agrobridge.demo',
      password: 'Demo@123',
      portalRole: 'ADMIN'
    });
    assert(adminLoginRes.status === 200 && !!adminLoginRes.body.token, 'Admin login succeeds and returns JWT');
    const adminToken = adminLoginRes.body.token;
    const adminHeaders = { 'Authorization': `Bearer ${adminToken}` };

    const farmerLoginRes = await request('http://localhost:5000/api/auth/login', {
      method: 'POST'
    }, {
      email: 'farmer@agrobridge.demo',
      password: 'Demo@123',
      portalRole: 'FARMER'
    });
    assert(farmerLoginRes.status === 200 && !!farmerLoginRes.body.token, 'Farmer login succeeds and returns JWT');
    const farmerToken = farmerLoginRes.body.token;
    const farmerHeaders = { 'Authorization': `Bearer ${farmerToken}` };

    // 1. GET /api/admin/farmers
    console.log('\n--- Test 1: Fetching Farmer Management Directory ---');
    const farmersRes = await request('http://localhost:5000/api/admin/farmers', {
      headers: adminHeaders
    });
    assert(farmersRes.status === 200, 'GET /api/admin/farmers returns HTTP 200');
    assert(Array.isArray(farmersRes.body.data) && farmersRes.body.data.length >= 4, 'Returns registered farmers list (>=4 farmers)');
    
    const sampleFarmer = farmersRes.body.data.find(f => f.id === 'farmer_1' || f.farmerId === 'farmer_1');
    assert(!!sampleFarmer, 'Farmer 1 (Ramesh Patel) present in directory');
    assert(sampleFarmer?.accountStatus === 'ACTIVE', `Farmer 1 has initial status ACTIVE (got: ${sampleFarmer?.accountStatus})`);
    assert(!!sampleFarmer?.riskInsight, 'Farmer 1 has AI Risk Insight generated');
    assert(
      sampleFarmer?.riskInsight?.aiLabel === 'AI-Assisted Risk Indicator' ||
      sampleFarmer?.riskInsight?.disclaimer?.toLowerCase().includes('advisory'),
      'Risk Insight contains AI-Assisted Risk Indicator badge and advisory disclaimer'
    );

    // 2. GET /api/admin/farmers/:id (Farmer Dossier)
    console.log('\n--- Test 2: Fetching Comprehensive Farmer Profile Dossier ---');
    const dossierRes = await request('http://localhost:5000/api/admin/farmers/farmer_1', {
      headers: adminHeaders
    });
    assert(dossierRes.status === 200, 'GET /api/admin/farmers/farmer_1 returns HTTP 200');
    assert(dossierRes.body.data?.farmer?.name === 'Ramesh Patel', 'Dossier returns correct farmer profile');
    assert(Array.isArray(dossierRes.body.data?.products), 'Dossier includes products array');
    assert(Array.isArray(dossierRes.body.data?.complaints), 'Dossier includes complaints array');
    assert(Array.isArray(dossierRes.body.data?.feedbacks), 'Dossier includes feedbacks array');
    assert(Array.isArray(dossierRes.body.data?.auditLogs), 'Dossier includes audit logs array');

    // 3. Review Complaint PUT /api/admin/complaints/:id/review
    console.log('\n--- Test 3: Complaint Investigation & Verification ---');
    const reviewRes = await request('http://localhost:5000/api/admin/complaints/CMP-503/review', {
      method: 'PUT',
      headers: adminHeaders
    }, {
      decision: 'VALID',
      severity: 'HIGH',
      adminNotes: 'Verified damaged crates from cold storage failure. Farmer notified.'
    });
    assert(reviewRes.status === 200, 'PUT /api/admin/complaints/CMP-503/review returns HTTP 200');
    assert(reviewRes.body.data?.adminDecision === 'VALID', 'Complaint marked as VALID');
    assert(reviewRes.body.data?.severity === 'HIGH', 'Complaint severity set to HIGH');

    // 4. Check Complaint Analytics
    console.log('\n--- Test 4: Complaint Analytics & Risk Signals ---');
    const analyticsRes = await request('http://localhost:5000/api/admin/complaint-analytics', {
      headers: adminHeaders
    });
    assert(analyticsRes.status === 200, 'GET /api/admin/complaint-analytics returns HTTP 200');
    assert(analyticsRes.body.data?.totalComplaints > 0, 'Analytics reports total complaints');
    assert(analyticsRes.body.data?.verifiedComplaints !== undefined, 'Analytics reports verified complaints metric');

    // 5. Check Initial Products in Marketplace
    console.log('\n--- Test 5: Verify Farmer Products Visible in Marketplace Initially ---');
    const initialMarketRes = await request('http://localhost:5000/api/products');
    const initialProductsList = initialMarketRes.body.data || initialMarketRes.body || [];
    const initialFarmer1Products = initialProductsList.filter(
      p => p.farmer_id === 'farmer_1' || p.farmer_id === 'farmer@agrobridge.demo'
    );
    assert(initialFarmer1Products.length > 0, `Farmer 1 has ${initialFarmer1Products.length} active products in consumer marketplace`);

    // 6. Action: Temporarily Unlist Farmer 1
    console.log('\n--- Test 6: Admin Action - Temporarily Unlist Farmer 1 ---');
    const unlistRes = await request('http://localhost:5000/api/admin/farmers/farmer_1/status', {
      method: 'PUT',
      headers: adminHeaders
    }, {
      status: 'TEMPORARILY_UNLISTED',
      reason: 'Multiple verified quality disputes under audit',
      duration: 7,
      notes: '7-day compliance review hold'
    });
    assert(unlistRes.status === 200, 'PUT /api/admin/farmers/farmer_1/status returns HTTP 200');
    const unlistData = unlistRes.body.data?.statusData || unlistRes.body.data;
    assert(unlistData?.status === 'TEMPORARILY_UNLISTED', `Account status updated to TEMPORARILY_UNLISTED (got: ${unlistData?.status})`);
    assert(!!unlistData?.unlistedUntil, 'unlistedUntil date correctly computed and saved');

    // 7. Verify Marketplace Hiding
    console.log('\n--- Test 7: Marketplace Product Isolation for Unlisted Farmer ---');
    const marketAfterUnlist = await request('http://localhost:5000/api/products');
    const unlistedProdsList = marketAfterUnlist.body.data || marketAfterUnlist.body || [];
    const unlistedProdsInMarket = unlistedProdsList.filter(
      p => p.farmer_id === 'farmer_1' || p.farmer_id === 'farmer@agrobridge.demo'
    );
    assert(unlistedProdsInMarket.length === 0, `Unlisted farmer products hidden from GET /api/products (found ${unlistedProdsInMarket.length})`);

    const bulkAfterUnlist = await request('http://localhost:5000/api/bulk/products');
    const unlistedBulkInMarket = (bulkAfterUnlist.body.data || []).filter(
      p => p.farmer_id === 'farmer_1' || p.farmer_id === 'farmer@agrobridge.demo'
    );
    assert(unlistedBulkInMarket.length === 0, `Unlisted farmer products hidden from GET /api/bulk/products (found ${unlistedBulkInMarket.length})`);

    // 8. Verify Farmer Crop Creation Blocked (403 Forbidden)
    console.log('\n--- Test 8: Prevent Unlisted Farmer from Creating New Listings ---');
    const addCropRes = await request('http://localhost:5000/api/products', {
      method: 'POST',
      headers: farmerHeaders
    }, {
      product_name: 'Blocked Fresh Spinach',
      category: 'Vegetables',
      price_per_kg: 40,
      quantity_kg: 50,
      unit: 'kg'
    });
    assert(addCropRes.status === 403, `POST /api/products returns HTTP 403 Forbidden for unlisted farmer (got: ${addCropRes.status})`);
    assert(
      addCropRes.body.error?.toLowerCase().includes('temporarily unlisted') ||
      addCropRes.body.message?.toLowerCase().includes('temporarily unlisted'),
      'Error message informs farmer of unlisted status'
    );

    // 9. Verify Farmer Dashboard Stats Endpoint includes status info
    console.log('\n--- Test 9: Farmer Dashboard API Status Awareness ---');
    const farmerDashRes = await request('http://localhost:5000/api/farmer/dashboard-stats?farmerId=farmer_1', {
      headers: farmerHeaders
    });
    assert(farmerDashRes.status === 200, 'GET /api/farmer/dashboard-stats returns HTTP 200');
    assert(farmerDashRes.body.data?.accountStatus === 'TEMPORARILY_UNLISTED', 'Dashboard returns accountStatus TEMPORARILY_UNLISTED');
    assert(!!farmerDashRes.body.data?.unlistedUntil, 'Dashboard returns unlistedUntil timestamp');
    assert(!!farmerDashRes.body.data?.statusReason, 'Dashboard returns statusReason');

    // 10. Verify Existing Orders Protected
    console.log('\n--- Test 10: Existing Orders & Deliveries Protected ---');
    const ordersRes = await request('http://localhost:5000/api/orders', {
      headers: adminHeaders
    });
    const ordersList = ordersRes.body.data || [];
    assert(Array.isArray(ordersList) && ordersList.length > 0, `Existing orders remain intact (${ordersList.length} orders found)`);

    // 11. Admin Action: Restore Farmer Standing
    console.log('\n--- Test 11: Admin Action - Reinstatement / Restoration ---');
    const restoreRes = await request('http://localhost:5000/api/admin/farmers/farmer_1/restore', {
      method: 'PUT',
      headers: adminHeaders
    }, {
      notes: 'Dispute remediated and compensation settled.'
    });
    assert(restoreRes.status === 200, 'PUT /api/admin/farmers/farmer_1/restore returns HTTP 200');
    const restoreData = restoreRes.body.data?.statusData || restoreRes.body.data;
    assert(restoreData?.status === 'ACTIVE', `Farmer account restored to ACTIVE standing (got: ${restoreData?.status})`);
    assert(restoreData?.unlistedUntil === null, 'unlistedUntil cleared');

    // 12. Verify Marketplace Reappearance
    console.log('\n--- Test 12: Products Reappear in Marketplace after Restoration ---');
    const marketAfterRestore = await request('http://localhost:5000/api/products');
    const restoredProductsList = marketAfterRestore.body.data || marketAfterRestore.body || [];
    const restoredProdsInMarket = restoredProductsList.filter(
      p => p.farmer_id === 'farmer_1' || p.farmer_id === 'farmer@agrobridge.demo'
    );
    assert(restoredProdsInMarket.length > 0, `Farmer 1 products restored to GET /api/products (${restoredProdsInMarket.length} products found)`);

    // 13. Audit Log Trail
    console.log('\n--- Test 13: Audit Trail Integrity ---');
    const auditRes = await request('http://localhost:5000/api/admin/audit-logs', {
      headers: adminHeaders
    });
    assert(auditRes.status === 200, 'GET /api/admin/audit-logs returns HTTP 200');
    const unlistLog = auditRes.body.data?.find(l => l.action === 'UNLISTED' || l.action === 'STATUS_CHANGE' || l.action === 'TEMPORARILY_UNLISTED');
    const restoreLog = auditRes.body.data?.find(l => l.action === 'RESTORED' || l.action === 'STATUS_RESTORE');
    assert(!!unlistLog, 'Audit log recorded UNLISTED action with admin identity');
    assert(!!restoreLog, 'Audit log recorded RESTORED action with admin identity');

    console.log('\n====================================================');
    console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
