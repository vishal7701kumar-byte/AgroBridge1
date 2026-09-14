/**
 * Automated Verification Script for AgroBridge Role-Based Auth
 */
const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting AgroBridge Role-Based Auth Automated Verification...\n');
  let passed = 0;
  let total = 0;

  function assert(condition, testName, extra = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${extra}`);
    }
  }

  try {
    // 1. Health check
    const health = await makeRequest('/api/health');
    assert(health.status === 200 && health.data.status === 'healthy', 'System Health Check');

    // 2. Demo logins
    const roles = [
      { role: 'FARMER', email: 'farmer@agrobridge.demo' },
      { role: 'CONSUMER', email: 'consumer@agrobridge.demo' },
      { role: 'BULK_BUYER', email: 'bulkbuyer@agrobridge.demo' },
      { role: 'DRIVER', email: 'driver@agrobridge.demo' },
      { role: 'ADMIN', email: 'admin@agrobridge.demo' }
    ];

    const tokens = {};

    for (const r of roles) {
      const res = await makeRequest('/api/auth/login', 'POST', {
        email: r.email,
        password: 'Demo@123',
        role: r.role
      });
      assert(res.status === 200 && res.data.token && res.data.user.role === r.role, `Login Demo ${r.role} (${r.email})`);
      if (res.data && res.data.token) {
        tokens[r.role] = res.data.token;
      }
    }

    // 3. Cross-Role Rejections
    console.log('\n--- Testing Strict Cross-Role Validation ---');

    // FARMER trying to login as CONSUMER
    const cross1 = await makeRequest('/api/auth/login', 'POST', {
      email: 'farmer@agrobridge.demo',
      password: 'Demo@123',
      role: 'CONSUMER'
    });
    assert(
      cross1.status === 403 &&
      cross1.data.roleMismatch === true &&
      cross1.data.error === 'This account is registered as a Farmer. Please login through the Farmer Login page.',
      'Reject Farmer login on Consumer portal with exact error message',
      JSON.stringify(cross1.data)
    );

    // CONSUMER trying to login as DRIVER
    const cross2 = await makeRequest('/api/auth/login', 'POST', {
      email: 'consumer@agrobridge.demo',
      password: 'Demo@123',
      role: 'DRIVER'
    });
    assert(
      cross2.status === 403 &&
      cross2.data.error === 'This account is registered as a Consumer. Please login through the Consumer Login page.',
      'Reject Consumer login on Driver portal'
    );

    // DRIVER trying to login as FARMER
    const cross3 = await makeRequest('/api/auth/login', 'POST', {
      email: 'driver@agrobridge.demo',
      password: 'Demo@123',
      role: 'FARMER'
    });
    assert(
      cross3.status === 403 &&
      cross3.data.error === 'This account is registered as a Driver. Please login through the Driver Login page.',
      'Reject Driver login on Farmer portal'
    );

    // BULK BUYER trying to login as CONSUMER
    const cross4 = await makeRequest('/api/auth/login', 'POST', {
      email: 'bulkbuyer@agrobridge.demo',
      password: 'Demo@123',
      role: 'CONSUMER'
    });
    assert(
      cross4.status === 403 &&
      cross4.data.error === 'This account is registered as a Bulk Buyer. Please login through the Bulk Buyer Login page.',
      'Reject Bulk Buyer login on Consumer portal'
    );

    // ADMIN trying to login as FARMER
    const cross5 = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@agrobridge.demo',
      password: 'Demo@123',
      role: 'FARMER'
    });
    assert(
      cross5.status === 403 &&
      cross5.data.error === 'This account is registered as a Admin. Please login through the Admin Login page.',
      'Reject Admin login on Farmer portal'
    );

    // 4. Registration Flow
    console.log('\n--- Testing Role Registrations ---');

    // Register Farmer
    const newFarmer = await makeRequest('/api/auth/register', 'POST', {
      name: 'Ravi Kumar',
      email: `ravi_${Date.now()}@testfarm.com`,
      password: 'Password@123',
      confirmPassword: 'Password@123',
      phone: '+91 9988776655',
      role: 'FARMER',
      farmName: 'Kumar Organic Greens',
      farmLocation: 'Hoshangabad Road',
      state: 'Madhya Pradesh',
      district: 'Bhopal'
    });
    assert(newFarmer.status === 201 && newFarmer.data.user.role === 'FARMER' && newFarmer.data.user.farmName === 'Kumar Organic Greens', 'Register Farmer successfully');

    // Register Driver -> Status must be OFFLINE
    const newDriver = await makeRequest('/api/auth/register', 'POST', {
      name: 'Sunil Verma',
      email: `sunil_${Date.now()}@driver.com`,
      password: 'Password@123',
      confirmPassword: 'Password@123',
      phone: '+91 9988112233',
      role: 'DRIVER',
      vehicleType: 'Pickup Truck',
      vehicleNumber: 'MP 04 Z 9999',
      vehicleCapacity: '1.2 Tons',
      city: 'Bhopal',
      state: 'Madhya Pradesh'
    });
    assert(newDriver.status === 201 && newDriver.data.user.role === 'DRIVER' && newDriver.data.user.driverStatus === 'OFFLINE', 'Register Driver with default status OFFLINE');

    // Reject Admin Public Registration
    const adminReg = await makeRequest('/api/auth/register', 'POST', {
      name: 'Fake Admin',
      email: `fakeadmin_${Date.now()}@admin.com`,
      password: 'Password@123',
      confirmPassword: 'Password@123',
      role: 'ADMIN'
    });
    assert(adminReg.status === 403, 'Block Public Admin Registration');

    // 5. Protected Routes Authorization
    console.log('\n--- Testing Protected Routes ---');

    // Farmer accessing /api/farmer/dashboard-stats
    const farmerStats = await makeRequest('/api/farmer/dashboard-stats', 'GET', null, tokens['FARMER']);
    assert(farmerStats.status === 200 && farmerStats.data.success, 'Farmer can access /api/farmer/*');

    // Farmer accessing /api/admin/dashboard-stats (must be 403)
    const farmerOnAdmin = await makeRequest('/api/admin/dashboard-stats', 'GET', null, tokens['FARMER']);
    assert(farmerOnAdmin.status === 403, 'Farmer blocked from /api/admin/*');

    // Admin accessing /api/admin/dashboard-stats
    const adminStats = await makeRequest('/api/admin/dashboard-stats', 'GET', null, tokens['ADMIN']);
    assert(adminStats.status === 200 && adminStats.data.success, 'Admin can access /api/admin/*');

    // Unauthenticated access
    const noToken = await makeRequest('/api/farmer/dashboard-stats', 'GET', null, null);
    assert(noToken.status === 401, 'Unauthenticated request receives 401');

    console.log(`\n🎉 Verification Completed: ${passed}/${total} Tests Passed!`);
    if (passed === total) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal Test Error:', err);
    process.exit(1);
  }
}

// Give server 1 sec before starting tests
setTimeout(runTests, 1000);
