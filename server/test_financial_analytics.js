const http = require('http');

const PORT = 5000;
let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition, message) {
  if (condition) {
    passedAssertions++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedAssertions++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

function request(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n===============================================================');
  console.log('  AGROBRIDGE FINANCIAL ANALYTICS & PROFIT SYSTEM TEST SUITE');
  console.log('===============================================================\n');

  let farmerToken = null;
  let adminToken = null;
  let consumerToken = null;
  let driverToken = null;

  // 1. Role Authentication
  console.log('--- 1. Authenticating Roles ---');
  try {
    const fAuth = await request('POST', '/api/auth/login', {}, { email: 'farmer@agrobridge.demo', password: 'Demo@123' });
    assert(fAuth.status === 200 && fAuth.body?.token, 'Farmer login successful and returned JWT');
    farmerToken = fAuth.body?.token;

    const aAuth = await request('POST', '/api/auth/login', {}, { email: 'admin@agrobridge.demo', password: 'Demo@123' });
    assert(aAuth.status === 200 && aAuth.body?.token, 'Admin login successful and returned JWT');
    adminToken = aAuth.body?.token;

    const cAuth = await request('POST', '/api/auth/login', {}, { email: 'consumer@agrobridge.demo', password: 'Demo@123' });
    assert(cAuth.status === 200 && cAuth.body?.token, 'Consumer login successful and returned JWT');
    consumerToken = cAuth.body?.token;

    const dAuth = await request('POST', '/api/auth/login', {}, { email: 'driver@agrobridge.demo', password: 'Demo@123' });
    assert(dAuth.status === 200 && dAuth.body?.token, 'Driver login successful and returned JWT');
    driverToken = dAuth.body?.token;
  } catch (err) {
    console.error('Authentication step failed:', err);
    process.exit(1);
  }

  // 2. Farmer Financial Summary & Transparent Formula
  console.log('\n--- 2. Farmer Financial Summary & Transparent Formula ---');
  const fSummaryRes = await request('GET', '/api/farmer/financial-summary', {
    Authorization: `Bearer ${farmerToken}`
  });
  assert(fSummaryRes.status === 200, 'GET /api/farmer/financial-summary returns 200 OK');
  const sumData = fSummaryRes.body?.data;
  assert(sumData !== undefined, 'Summary payload present');
  assert(sumData.monthlyRevenue === 45000, `Monthly Revenue equals ₹45,000 (got ₹${sumData?.monthlyRevenue})`);
  assert(sumData.estimatedExpenses === 12000, `Estimated Expenses equals ₹12,000 (got ₹${sumData?.estimatedExpenses})`);
  assert(sumData.estimatedNetProfit === 33000, `Estimated Net Profit equals ₹33,000 (got ₹${sumData?.estimatedNetProfit})`);
  assert(sumData.profitMargin === 73.3, `Profit Margin is exactly 73.3% (got ${sumData?.profitMargin}%)`);
  assert(sumData.completedOrders === 32, `Completed Orders count is 32 (got ${sumData?.completedOrders})`);
  assert(sumData.pendingPayments === 5000, `Pending Earnings equals ₹5,000 (got ₹${sumData?.pendingPayments})`);
  assert(sumData.formula !== undefined, 'Transparent mathematical formula breakdown is provided');

  // 3. Farmer Expenses CRUD Lifecycle
  console.log('\n--- 3. Farmer Expenses CRUD Lifecycle ---');
  const expListRes = await request('GET', '/api/farmer/expenses', {
    Authorization: `Bearer ${farmerToken}`
  });
  assert(expListRes.status === 200, 'GET /api/farmer/expenses returns 200 OK');
  assert(Array.isArray(expListRes.body?.data), 'Expenses list is an array');
  assert(expListRes.body?.monthlyTotal === 12000, `Initial monthly expenses total is ₹12,000 (got ₹${expListRes.body?.monthlyTotal})`);

  // Add Expense
  const addExpRes = await request('POST', '/api/farmer/expenses', {
    Authorization: `Bearer ${farmerToken}`
  }, {
    expenseName: 'Automated Drip Emitters #3',
    category: 'Irrigation',
    amount: 1500,
    date: '2026-09-12',
    notes: 'Micro-irrigation line repairs'
  });
  assert(addExpRes.status === 201, 'POST /api/farmer/expenses created new expense (HTTP 201)');
  const createdExpId = addExpRes.body?.data?._id || addExpRes.body?.data?.id;
  assert(createdExpId !== undefined, `Created expense ID received: ${createdExpId}`);

  // Update Expense
  const updateExpRes = await request('PUT', `/api/farmer/expenses/${createdExpId}`, {
    Authorization: `Bearer ${farmerToken}`
  }, {
    amount: 1800,
    notes: 'Micro-irrigation line repairs + valve replacement'
  });
  assert(updateExpRes.status === 200, 'PUT /api/farmer/expenses/:id updated expense (HTTP 200)');
  assert(updateExpRes.body?.data?.amount === 1800, 'Updated expense amount is ₹1,800');

  // Delete Expense
  const deleteExpRes = await request('DELETE', `/api/farmer/expenses/${createdExpId}`, {
    Authorization: `Bearer ${farmerToken}`
  });
  assert(deleteExpRes.status === 200, 'DELETE /api/farmer/expenses/:id deleted expense (HTTP 200)');

  // 4. Farmer Monthly Profit Analysis & Product Breakdown
  console.log('\n--- 4. Farmer Profit Analysis & Product Breakdown ---');
  const profitTrendRes = await request('GET', '/api/farmer/monthly-profit?filter=3-months', {
    Authorization: `Bearer ${farmerToken}`
  });
  assert(profitTrendRes.status === 200, 'GET /api/farmer/monthly-profit returns 200 OK');
  assert(Array.isArray(profitTrendRes.body?.data?.monthlyTrend), 'Monthly trend is an array');
  assert(profitTrendRes.body?.data?.monthlyTrend?.length >= 3, 'Trend contains at least 3 months (July, Aug, Sep 2026)');

  const prodProfitRes = await request('GET', '/api/farmer/product-profit', {
    Authorization: `Bearer ${farmerToken}`
  });
  assert(prodProfitRes.status === 200, 'GET /api/farmer/product-profit returns 200 OK');
  assert(Array.isArray(prodProfitRes.body?.data?.products), 'Product profit items array present');
  const topCrops = prodProfitRes.body?.data?.topProfitable || [];
  assert(topCrops.length === 3, 'Top 3 Profitable Crops identified');
  assert(topCrops[0]?.name === 'Tomato', `Top crop is Tomato (got ${topCrops[0]?.name})`);
  assert(topCrops[1]?.name === 'Potato', `Second crop is Potato (got ${topCrops[1]?.name})`);
  assert(topCrops[2]?.name === 'Onion', `Third crop is Onion (got ${topCrops[2]?.name})`);

  // 5. Farmer CSV Export
  console.log('\n--- 5. Farmer CSV Export ---');
  const farmerCSVRes = await request('GET', '/api/farmer/report/csv?month=September%202026', {
    Authorization: `Bearer ${farmerToken}`
  });
  assert(farmerCSVRes.status === 200, 'GET /api/farmer/report/csv returns 200 OK');
  assert(typeof farmerCSVRes.body === 'string' && farmerCSVRes.body.includes('Gross Revenue'), 'CSV contains Gross Revenue header');
  assert(farmerCSVRes.body.includes('Estimated Net Profit'), 'CSV contains Estimated Net Profit disclaimer header');

  // 6. Admin Platform Revenue Summary
  console.log('\n--- 6. Admin Platform Revenue Summary ---');
  const adminSummaryRes = await request('GET', '/api/admin/revenue-summary', {
    Authorization: `Bearer ${adminToken}`
  });
  assert(adminSummaryRes.status === 200, 'GET /api/admin/revenue-summary returns 200 OK');
  const aSum = adminSummaryRes.body?.data;
  assert(aSum.totalTransactionValue === 500000, `Total Transaction Value is ₹5,00,000 (got ₹${aSum?.totalTransactionValue})`);
  assert(aSum.farmerPayout === 450000, `Farmer Payout is ₹4,50,000 (got ₹${aSum?.farmerPayout})`);
  assert(aSum.platformCommission === 15000, `Platform Commission is ₹15,000 (got ₹${aSum?.platformCommission})`);
  assert(aSum.deliveryRevenue === 20000, `Delivery Revenue is ₹20,000 (got ₹${aSum?.deliveryRevenue})`);
  assert(aSum.refunds === 5000, `Refunds total ₹5,000 (got ₹${aSum?.refunds})`);
  assert(aSum.netPlatformRevenue === 30000, `Net Platform Revenue is ₹30,000 (got ₹${aSum?.netPlatformRevenue})`);
  assert(aSum.operatingCosts === 10000, `Operating Costs is ₹10,000 (got ₹${aSum?.operatingCosts})`);
  assert(aSum.estimatedPlatformProfit === 20000, `Estimated Platform Profit is ₹20,000 (got ₹${aSum?.estimatedPlatformProfit})`);

  // 7. Admin Operating Expenses CRUD Lifecycle
  console.log('\n--- 7. Admin Operating Expenses CRUD Lifecycle ---');
  const aExpRes = await request('GET', '/api/admin/expenses', {
    Authorization: `Bearer ${adminToken}`
  });
  assert(aExpRes.status === 200, 'GET /api/admin/expenses returns 200 OK');
  assert(aExpRes.body?.monthlyTotal === 10000, `Operating costs monthly total is ₹10,000 (got ₹${aExpRes.body?.monthlyTotal})`);

  // Add Platform Expense
  const addAExp = await request('POST', '/api/admin/expenses', {
    Authorization: `Bearer ${adminToken}`
  }, {
    expenseName: 'Redis Cluster Memory Upgrade',
    category: 'Server Infrastructure',
    amount: 2500,
    date: '2026-09-10',
    notes: 'In-memory caching upgrade'
  });
  assert(addAExp.status === 201, 'POST /api/admin/expenses created operating cost (HTTP 201)');
  const createdAExpId = addAExp.body?.data?._id || addAExp.body?.data?.id;

  // Update Platform Expense
  const updateAExp = await request('PUT', `/api/admin/expenses/${createdAExpId}`, {
    Authorization: `Bearer ${adminToken}`
  }, {
    amount: 2800
  });
  assert(updateAExp.status === 200, 'PUT /api/admin/expenses/:id updated expense (HTTP 200)');
  assert(updateAExp.body?.data?.amount === 2800, 'Updated expense amount is ₹2,800');

  // Delete Platform Expense
  const deleteAExp = await request('DELETE', `/api/admin/expenses/${createdAExpId}`, {
    Authorization: `Bearer ${adminToken}`
  });
  assert(deleteAExp.status === 200, 'DELETE /api/admin/expenses/:id deleted expense (HTTP 200)');

  // 8. Admin Transaction Ledger with Filters
  console.log('\n--- 8. Admin Transaction Ledger with Filters ---');
  const txListRes = await request('GET', '/api/admin/revenue/transactions?page=1&limit=10', {
    Authorization: `Bearer ${adminToken}`
  });
  assert(txListRes.status === 200, 'GET /api/admin/revenue/transactions returns 200 OK');
  assert(Array.isArray(txListRes.body?.data), 'Transactions list is an array');
  assert(txListRes.body?.pagination?.total > 0, `Total transactions found: ${txListRes.body?.pagination?.total}`);

  // Filter by userType
  const consumerTx = await request('GET', '/api/admin/revenue/transactions?userType=CONSUMER', {
    Authorization: `Bearer ${adminToken}`
  });
  assert(consumerTx.status === 200, 'Filter by userType=CONSUMER returns 200 OK');
  const allConsumer = consumerTx.body?.data?.every(t => t.userType === 'CONSUMER');
  assert(allConsumer, 'All filtered transactions match CONSUMER userType');

  // 9. Admin CSV Report
  console.log('\n--- 9. Admin CSV Report ---');
  const adminCSVRes = await request('GET', '/api/admin/report/csv?period=September%202026', {
    Authorization: `Bearer ${adminToken}`
  });
  assert(adminCSVRes.status === 200, 'GET /api/admin/report/csv returns 200 OK');
  assert(typeof adminCSVRes.body === 'string' && adminCSVRes.body.includes('Total Transaction Value'), 'CSV contains Total Transaction Value');
  assert(adminCSVRes.body.includes('Estimated Platform Profit'), 'CSV contains Estimated Platform Profit');

  // 10. Role-Based Access Control (RBAC) Security Verification
  console.log('\n--- 10. Role-Based Access Control (RBAC) Security Verification ---');
  
  // Consumer blocked from Farmer financial summary
  const cBlockFarmer = await request('GET', '/api/farmer/financial-summary', {
    Authorization: `Bearer ${consumerToken}`
  });
  assert(cBlockFarmer.status === 403, `Consumer blocked from Farmer Financial Summary (HTTP ${cBlockFarmer.status})`);

  // Consumer blocked from Admin revenue
  const cBlockAdmin = await request('GET', '/api/admin/revenue-summary', {
    Authorization: `Bearer ${consumerToken}`
  });
  assert(cBlockAdmin.status === 403, `Consumer blocked from Admin Revenue Summary (HTTP ${cBlockAdmin.status})`);

  // Driver blocked from Farmer expenses
  const dBlockFarmerExp = await request('GET', '/api/farmer/expenses', {
    Authorization: `Bearer ${driverToken}`
  });
  assert(dBlockFarmerExp.status === 403, `Driver blocked from Farmer Expenses (HTTP ${dBlockFarmerExp.status})`);

  // Driver blocked from Admin transactions
  const dBlockAdminTx = await request('GET', '/api/admin/revenue/transactions', {
    Authorization: `Bearer ${driverToken}`
  });
  assert(dBlockAdminTx.status === 403, `Driver blocked from Admin Transactions (HTTP ${dBlockAdminTx.status})`);

  // Farmer blocked from Admin revenue
  const fBlockAdmin = await request('GET', '/api/admin/revenue-summary', {
    Authorization: `Bearer ${farmerToken}`
  });
  assert(fBlockAdmin.status === 403, `Farmer blocked from Admin Revenue (HTTP ${fBlockAdmin.status})`);

  // Unauthenticated blocked
  const unauthRes = await request('GET', '/api/farmer/monthly-profit');
  assert(unauthRes.status === 401, `Unauthenticated request returns 401 Unauthorized (HTTP ${unauthRes.status})`);

  console.log('\n===============================================================');
  console.log(`  TEST RESULTS: ${passedAssertions} PASSED, ${failedAssertions} FAILED`);
  console.log('===============================================================\n');

  if (failedAssertions > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test runner encountered error:', err);
  process.exit(1);
});
