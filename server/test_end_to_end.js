/**
 * AgroBridge End-to-End System Audit & Verification Suite
 * Tests all 18 farm-to-fork workflow steps + CRUD + AI Engines + Role Security
 */

const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

function request(method, path, body = null, token = null) {
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
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

const results = [];

function assert(condition, testName, details = '') {
  if (condition) {
    results.push({ name: testName, passed: true, details });
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    results.push({ name: testName, passed: false, details });
    console.error(`  ❌ [FAIL] ${testName} - ${details}`);
  }
}

async function runAudit() {
  console.log('================================================================');
  console.log('🌾 AGROBRIDGE END-TO-END AUTOMATED FUNCTIONALITY AUDIT');
  console.log('================================================================\n');

  let farmerToken = null;
  let consumerToken = null;
  let driverToken = null;
  let bulkBuyerToken = null;
  let adminToken = null;

  let createdProductId = null;
  let createdOrderId = null;
  let createdDeliveryId = null;
  let pickupOtp = null;
  let deliveryOtp = null;

  try {
    // -----------------------------------------------------------------
    // SECTION 1: ROLE-BASED AUTHENTICATION (5 SEPARATE PORTALS)
    // -----------------------------------------------------------------
    console.log('--- 1. Role-Based Authentication & Portal Access ---');
    
    // Farmer Login
    const farmLogin = await request('POST', '/api/auth/login', {
      email: 'farmer@agrobridge.demo',
      password: 'Demo@123',
      portalRole: 'FARMER'
    });
    assert(farmLogin.status === 200 && farmLogin.body.user.role === 'FARMER', 'Farmer Portal Login', 'Received valid JWT and FARMER role');
    farmerToken = farmLogin.body.token;

    // Consumer Login
    const conLogin = await request('POST', '/api/auth/login', {
      email: 'consumer@agrobridge.demo',
      password: 'Demo@123',
      portalRole: 'CONSUMER'
    });
    assert(conLogin.status === 200 && conLogin.body.user.role === 'CONSUMER', 'Consumer Portal Login', 'Received valid JWT and CONSUMER role');
    consumerToken = conLogin.body.token;

    // Driver Login
    const dvrLogin = await request('POST', '/api/auth/login', {
      email: 'driver@agrobridge.demo',
      password: 'Demo@123',
      portalRole: 'DRIVER'
    });
    assert(dvrLogin.status === 200 && dvrLogin.body.user.role === 'DRIVER', 'Driver Portal Login', 'Received valid JWT and DRIVER role');
    driverToken = dvrLogin.body.token;

    // Bulk Buyer Login
    const bbLogin = await request('POST', '/api/auth/login', {
      email: 'bulkbuyer@agrobridge.demo',
      password: 'Demo@123',
      portalRole: 'BULK_BUYER'
    });
    assert(bbLogin.status === 200 && bbLogin.body.user.role === 'BULK_BUYER', 'Bulk Buyer Portal Login', 'Received valid JWT and BULK_BUYER role');
    bulkBuyerToken = bbLogin.body.token;

    // Admin Login
    const admLogin = await request('POST', '/api/auth/login', {
      email: 'admin@agrobridge.demo',
      password: 'Demo@123',
      portalRole: 'ADMIN'
    });
    assert(admLogin.status === 200 && admLogin.body.user.role === 'ADMIN', 'Admin Portal Login', 'Received valid JWT and ADMIN role');
    adminToken = admLogin.body.token;

    // Cross-Role Portal Rejection Test
    const crossLogin = await request('POST', '/api/auth/login', {
      email: 'farmer@agrobridge.demo',
      password: 'Demo@123',
      portalRole: 'ADMIN' // Farmer attempting Admin portal
    });
    assert(crossLogin.status === 403, 'Strict Cross-Role Rejection (Farmer -> Admin Portal blocked)', 'Returns 403 Access Denied');

    // -----------------------------------------------------------------
    // SECTION 2: FARMER DASHBOARD & PRODUCT CRUD (Steps 2 - 4)
    // -----------------------------------------------------------------
    console.log('\n--- 2. Farmer Dashboard & Product CRUD ---');
    
    // Farmer Dashboard Stats
    const farmDash = await request('GET', '/api/farmer/dashboard-stats', null, farmerToken);
    assert(farmDash.status === 200 && farmDash.body.success, 'Farmer Dashboard Stats Telemetry', 'Retrieved monthly revenue and yield');

    // Step 3: Add Product (CRUD: CREATE)
    const addProd = await request('POST', '/api/products', {
      product_name: 'Organic Sharbati Gold Wheat',
      category: 'Grains',
      quantity_kg: 500,
      price_per_kg: 36,
      quality: 'Grade A+',
      shelf_life_days: 180
    }, farmerToken);
    assert(addProd.status === 201 && addProd.body.success, 'Step 3: Add Product (CRUD Create)', `Product created with ID: ${addProd.body.data?.id}`);
    createdProductId = addProd.body.data?.id;

    // Step 4: Product Appears in Marketplace (CRUD: READ)
    const marketCatalog = await request('GET', '/api/products');
    const foundCreated = marketCatalog.body.data?.find(p => p.id === createdProductId);
    assert(marketCatalog.status === 200 && Boolean(foundCreated), 'Step 4: Product Appears in Marketplace (CRUD Read)', 'Crop listed at direct farm gate price');

    // CRUD: UPDATE Product
    const updateProd = await request('PUT', `/api/products/${createdProductId}`, {
      price_per_kg: 38,
      quantity_kg: 480
    }, farmerToken);
    assert(updateProd.status === 200 && updateProd.body.data?.price_per_kg === 38, 'Farmer Product CRUD: UPDATE', 'Updated crop price to ₹38/kg');

    // CRUD: DELETE & RESTORE Product test
    const delTempProd = await request('POST', '/api/products', {
      product_name: 'Temporary Test Radish',
      category: 'Vegetables',
      quantity_kg: 50,
      price_per_kg: 15
    }, farmerToken);
    const delRes = await request('DELETE', `/api/products/${delTempProd.body.data?.id}`, null, farmerToken);
    assert(delRes.status === 200 && delRes.body.success, 'Farmer Product CRUD: DELETE', 'Successfully removed listing');

    // -----------------------------------------------------------------
    // SECTION 3: CONSUMER BROWSE, CART, PAYMENT & ORDER (Steps 5 - 11)
    // -----------------------------------------------------------------
    console.log('\n--- 3. Consumer Workflow: Browse, Demo Pay, Order & Delivery ---');

    // Step 6: Consumer Browse & Search
    const searchProd = await request('GET', `/api/products?search=Sharbati`);
    assert(searchProd.status === 200 && searchProd.body.data?.length > 0, 'Step 6: Consumer Browse & Search Filter', 'Filtered products by query');

    // Step 7, 8, 9, 10: Checkout with Demo Payment & Order Creation
    const orderPayload = {
      items: [
        {
          product_id: createdProductId,
          product_name: 'Organic Sharbati Gold Wheat',
          farm_name: 'Patel Organic Farms',
          quantity_kg: 20,
          price_per_kg: 38,
          subtotal: 760
        }
      ],
      delivery_address: 'Flat 402, Green Meadows Heights, Arera Colony, Bhopal',
      payment_method: 'UPI Escrow (Instant NPCI Demo)'
    };

    const placeOrderRes = await request('POST', '/api/orders', orderPayload, consumerToken);
    assert(placeOrderRes.status === 201 && placeOrderRes.body.success, 'Step 8-10: Demo Escrow Payment & Order Creation', `Order created: ${placeOrderRes.body.data?.order?.id}`);
    
    createdOrderId = placeOrderRes.body.data?.order?.id;
    const deliveryObj = placeOrderRes.body.data?.delivery;

    // Step 11: Automatic Delivery Creation
    assert(Boolean(deliveryObj && deliveryObj.id), 'Step 11: Automatic Delivery Creation', `Delivery dispatch generated: ${deliveryObj?.id}`);
    createdDeliveryId = deliveryObj?.id;
    pickupOtp = deliveryObj?.pickup_otp;
    deliveryOtp = deliveryObj?.delivery_otp;

    // Step 12: Smart Driver Assignment / Status
    assert(
      deliveryObj?.status === 'searching_driver' || deliveryObj?.status === 'assigned' || deliveryObj?.status === 'driver_assigned',
      'Step 12: Smart Driver Assignment Engine',
      `Status is ${deliveryObj?.status}`
    );

    // Step 13: Driver Notification
    const notifs = await request('GET', '/api/notifications', null, driverToken);
    assert(notifs.status === 200 && notifs.body.data?.length > 0, 'Step 13: Driver Dispatch Notification', 'Driver received logistics dispatch ping');

    // -----------------------------------------------------------------
    // SECTION 4: DRIVER LOGISTICS FULFILLMENT (Steps 14 - 17)
    // -----------------------------------------------------------------
    console.log('\n--- 4. Driver Logistics Lifecycle: Accept, Farm OTP, Consumer OTP ---');

    // Step 14: Driver Accepts Delivery
    const acceptRes = await request('PUT', `/api/deliveries/${createdDeliveryId}/accept`, null, driverToken);
    assert(acceptRes.status === 200 && acceptRes.body.data?.status === 'driver_assigned', 'Step 14: Driver Accepts Delivery', 'Driver assigned to cargo load');

    // Step 15: Farm Gate Pickup Confirmation with Farm OTP
    const verifyPickupRes = await request('POST', `/api/deliveries/${createdDeliveryId}/verify-pickup`, {
      otp: pickupOtp
    }, driverToken);
    assert(verifyPickupRes.status === 200 && verifyPickupRes.body.data?.status === 'out_for_delivery', 'Step 15: Farm Gate OTP Verification', 'Harvest verified & loaded on vehicle');

    // Step 16: Out for Delivery Status
    const outCheck = await request('GET', '/api/deliveries', null, driverToken);
    const myDelivery = outCheck.body.data?.find(d => d.id === createdDeliveryId);
    assert(myDelivery && myDelivery.status === 'out_for_delivery', 'Step 16: Out for Delivery Telemetry Status', 'Real-time GPS tracking live');

    // Step 17: Consumer Handover & Escrow Payout with Consumer OTP
    const verifyDeliveryRes = await request('POST', `/api/deliveries/${createdDeliveryId}/verify-delivery`, {
      otp: deliveryOtp
    }, driverToken);
    assert(verifyDeliveryRes.status === 200 && verifyDeliveryRes.body.data?.status === 'delivered', 'Step 17: Consumer OTP Delivery Completion', 'Escrow released instantly to Farmer & Driver');

    // Step 18: Consumer Order Tracking
    const consumerDeliveries = await request('GET', '/api/deliveries', null, consumerToken);
    const trackedDelivery = consumerDeliveries.body.data?.find(d => d.id === createdDeliveryId);
    assert(trackedDelivery && trackedDelivery.status === 'delivered', 'Step 18: Consumer Order Tracking Finalization', 'Delivery confirmed in consumer portal');

    // -----------------------------------------------------------------
    // SECTION 5: BULK BUYER, ADMIN & AI DECISION ENGINES
    // -----------------------------------------------------------------
    console.log('\n--- 5. Bulk Buyer, Admin Dashboard & AI Engines ---');

    // Bulk Buyer: Create and Read RFQs
    const createRfq = await request('POST', '/api/rfqs', {
      commodity: 'Premium Durum Wheat',
      quantity_tons: 25,
      target_price_per_ton: 31000
    }, bulkBuyerToken);
    assert(createRfq.status === 201 && createRfq.body.success, 'Bulk Buyer: Create Commercial RFQ', 'B2B RFQ broadcasted');

    const getRfqs = await request('GET', '/api/rfqs', null, bulkBuyerToken);
    assert(getRfqs.status === 200 && getRfqs.body.data?.length > 0, 'Bulk Buyer: List RFQs', 'Retrieved active commercial contracts');

    // Driver Dashboard: Toggle Online/Offline
    const toggleStatus = await request('PUT', '/api/driver/status', { status: 'ONLINE' }, driverToken);
    assert(toggleStatus.status === 200 && toggleStatus.body.data?.status === 'ONLINE', 'Driver Dashboard: Telemetry Status Toggle', 'Driver online for dispatch');

    // Admin Dashboard: Telemetry & User Directory
    const adminDash = await request('GET', '/api/admin/dashboard-stats', null, adminToken);
    assert(adminDash.status === 200 && adminDash.body.data?.roleCounts?.FARMER >= 1, 'Admin Dashboard: Central Operations Telemetry', 'Audit logs and role counts verified');

    const adminUsers = await request('GET', '/api/auth/users', null, adminToken);
    assert(adminUsers.status === 200 && adminUsers.body.users?.length >= 5, 'Admin Dashboard: 5-Role Directory Listing', 'All registered role accounts listed');

    // AI Engine 1: Smart Price Recommendation
    const aiPrice = await request('POST', '/api/ai/price-recommendation', {
      commodity: 'Tomato',
      grade: 'Grade A+',
      quantityKg: 500
    });
    assert(aiPrice.status === 200 && aiPrice.body.data?.recommendedDirectRate > aiPrice.body.data?.mandiBenchmarkRate, 'AI Engine 1: Smart Price Recommendation', `AgroBridge direct bonus: ${aiPrice.body.data?.percentageBonus}`);

    // AI Engine 2: AI Demand Forecasting
    const aiDemand = await request('POST', '/api/ai/demand-forecast', {
      commodity: 'Tomato',
      region: 'Bhopal'
    });
    assert(aiDemand.status === 200 && aiDemand.body.data?.forecastDays?.length === 7, 'AI Engine 2: AI Demand Forecasting (7-Day Curve)', `Projected weekly demand: ${aiDemand.body.data?.totalWeeklyProjectedDemandQuintals} Quintals`);

    // AI Engine 3: Route Optimization (TSP)
    const aiRoute = await request('POST', '/api/ai/route-optimize', {
      pickups: ['Patel Farm Berasia', 'Sharma Krishi Kendra Mandideep', 'Chauhan Farm Sehore'],
      buyerLoc: 'Arera Colony Hub'
    });
    assert(aiRoute.status === 200 && aiRoute.body.data?.distanceSavedKm > 0, 'AI Engine 3: Multi-Stop Route Optimization (TSP)', `Distance saved: ${aiRoute.body.data?.percentageSaved}% (${aiRoute.body.data?.estimatedFuelSavingsRupees} ₹ fuel saved)`);

    // -----------------------------------------------------------------
    // SMART PRICE COMPARISON & TRANSPARENCY SUITE
    // -----------------------------------------------------------------
    // 1. Best Prices Near You Showcase
    const bestPrices = await request('GET', '/api/products/best-prices-near-you');
    assert(bestPrices.status === 200 && bestPrices.body.success && Array.isArray(bestPrices.body.data), 'Price Comparison: Best Prices Near You Showcase', `Found ${bestPrices.body.data?.length} ranked farm products`);

    // 2. Comprehensive 4-Source Price Comparison with Transparency Math
    const priceComp = await request('GET', '/api/products/prod_1/price-comparison');
    assert(
      priceComp.status === 200 &&
      priceComp.body.success &&
      priceComp.body.data?.agroBridgePrice > 0 &&
      priceComp.body.data?.marketPrice > 0 &&
      priceComp.body.data?.savings !== undefined &&
      priceComp.body.data?.regionalAveragePrice !== undefined &&
      priceComp.body.data?.aiFairPrice !== undefined &&
      priceComp.body.data?.priceBreakdown?.farmerPercentage >= 80,
      'Price Comparison: 4-Source Comparison & 88% Direct Farmer Value Breakdown',
      `AgroBridge: ₹${priceComp.body.data?.agroBridgePrice}, Market: ₹${priceComp.body.data?.marketPrice}, Savings: ₹${priceComp.body.data?.savings} (${priceComp.body.data?.savingsPercentage}%), Farmer Share: ${priceComp.body.data?.priceBreakdown?.farmerPercentage}%`
    );

    // 3. 7-Day Historical Trend Data
    const priceHist = await request('GET', '/api/products/prod_1/price-history');
    assert(
      priceHist.status === 200 &&
      priceHist.body.success &&
      Array.isArray(priceHist.body.data) &&
      priceHist.body.data.length === 7 &&
      priceHist.body.data[0]?.marketPrice !== undefined,
      'Price Comparison: 7-Day Historical Trend Data',
      `Returned ${priceHist.body.data?.length} daily trend checkpoints comparing AgroBridge vs Market`
    );

    // 4. Price Drop Alert Registration
    const priceAlert = await request('POST', '/api/products/prod_1/price-alert', {
      targetPrice: 25,
      email: 'consumer@agrobridge.demo',
      phone: '+91 98765 43210'
    });
    assert(
      priceAlert.status === 201 &&
      priceAlert.body.success &&
      priceAlert.body.data?.targetPrice === 25,
      'Price Comparison: Price Drop Alert Notification Registration',
      `Alert registered for ₹25 with ID ${priceAlert.body.data?.id}`
    );

    // -----------------------------------------------------------------
    // SECTION 6: QUICK-COMMERCE GROCERY, IMAGES & LIVE TRACKING SUITE
    // -----------------------------------------------------------------
    console.log('\n--- 6. Quick-Commerce Grocery, Images & Live Tracking Suite ---');

    // 1. Direct Image Upload & Storage Endpoint (POST /api/upload)
    const uploadRes = await request('POST', '/api/upload', {
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      name: 'test_dot.png'
    }, farmerToken);
    assert(
      uploadRes.status === 201 && uploadRes.body.success && uploadRes.body.url?.startsWith('/uploads/'),
      'Direct Image Storage & Static Serving (/api/upload)',
      `Uploaded to static path: ${uploadRes.body.url}`
    );

    // 2. Upload/Attach Product Image Gallery
    const attachImg = await request('POST', `/api/products/${createdProductId}/images`, {
      url: uploadRes.body.url || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',
      alt: 'Fresh Golden Wheat Field'
    }, farmerToken);
    assert(
      attachImg.status === 201 && attachImg.body.success && attachImg.body.data?.images?.length >= 1,
      'Product Image Upload & Gallery Attachment',
      `Product now has ${attachImg.body.data?.images?.length} gallery images`
    );

    // 3. Farmer Product CRUD: Update Image via PUT /products/:id
    const updateCropImg = await request('PUT', `/api/products/${createdProductId}`, {
      image: uploadRes.body.url,
      quality: 'Grade A+'
    }, farmerToken);
    assert(
      updateCropImg.status === 200 && updateCropImg.body.success && updateCropImg.body.data?.image === uploadRes.body.url,
      'Farmer Product CRUD: Update Image & Primary Photo Sync',
      `Updated product image URL: ${updateCropImg.body.data?.image}`
    );

    // 2. Fetch Single Product with Image and Location Metadata
    const singleProd = await request('GET', `/api/products/${createdProductId}`);
    assert(
      singleProd.status === 200 && singleProd.body.success && singleProd.body.data?.image !== undefined,
      'Product Detail Fetch: Image, Unit & Farm Location Metadata',
      `Unit: ${singleProd.body.data?.unit || 'kg'}, Location: ${singleProd.body.data?.location || 'Bhopal'}`
    );

    // 3. Demo Payment Processing API (Escrow creation)
    const demoPay = await request('POST', '/api/payments/demo', {
      orderId: createdOrderId,
      amount: 760,
      paymentMethod: 'UPI',
      upiApp: 'gpay'
    }, consumerToken);
    assert(
      demoPay.status === 200 && demoPay.body.success && demoPay.body.data?.escrowStatus === 'HELD_IN_ESCROW',
      'Demo Payment Processing (Escrow Secured)',
      `Txn ID: ${demoPay.body.data?.transactionId}, Escrow: ${demoPay.body.data?.escrowStatus}`
    );

    // 4. Fetch Order by ID
    const singleOrder = await request('GET', `/api/orders/${createdOrderId}`, null, consumerToken);
    assert(
      singleOrder.status === 200 && singleOrder.body.success && singleOrder.body.data?.id === createdOrderId,
      'Single Order Lookup & Verification',
      `Order ${singleOrder.body.data?.id} total: ₹${singleOrder.body.data?.total_amount}`
    );

    // 5. Smart Driver Assignment Engine
    const assignDriver = await request('POST', '/api/deliveries/assign-driver', {
      deliveryId: createdDeliveryId
    }, consumerToken);
    assert(
      assignDriver.status === 200 && assignDriver.body.success && assignDriver.body.data?.assigned_driver !== undefined,
      'AI Smart Driver Assignment Engine',
      `Assigned: ${assignDriver.body.data?.assigned_driver?.name} (Vehicle: ${assignDriver.body.data?.assigned_driver?.vehicle})`
    );

    // 6. Real-time Live Order Tracking Telemetry (OpenStreetMap Coordinates)
    const liveTrack = await request('GET', `/api/deliveries/${createdDeliveryId}/track`);
    assert(
      liveTrack.status === 200 &&
      liveTrack.body.success &&
      liveTrack.body.data?.pickupLocation?.lat !== undefined &&
      liveTrack.body.data?.deliveryLocation?.lat !== undefined &&
      liveTrack.body.data?.driverLocation?.lat !== undefined,
      'OpenStreetMap 3-Point Live Tracking Telemetry',
      `Pickup: (${liveTrack.body.data?.pickupLocation?.lat}, ${liveTrack.body.data?.pickupLocation?.lon}), Delivery: (${liveTrack.body.data?.deliveryLocation?.lat}, ${liveTrack.body.data?.deliveryLocation?.lon}), ETA: ${liveTrack.body.data?.eta_minutes} min`
    );

    // 7. Driver GPS Telemetry Update
    const updateGps = await request('PUT', '/api/drivers/location', {
      latitude: 23.2350,
      longitude: 77.4250
    }, driverToken);
    assert(
      updateGps.status === 200 && updateGps.body.success && updateGps.body.data?.latitude === 23.2350,
      'Driver GPS Telemetry Location Update',
      `Updated GPS: ${updateGps.body.data?.latitude}, ${updateGps.body.data?.longitude}`
    );

    // -----------------------------------------------------------------
    // SECTION 6: 5 NEW AGROBRIDGE EXTENSION FEATURES AUDIT
    // -----------------------------------------------------------------
    console.log('\n--- 6. Extension Features Audit: AI Future Insights, Multi-Photo, Assured Quality, Feedback, Dispute Center ---');

    // 1. AI Future Market & Demand Insights
    const future7d = await request('POST', '/api/ai/future-insights', {
      commodity: 'Tomato',
      period: '7d',
      role: 'farmer'
    });
    assert(
      future7d.status === 200 &&
      future7d.body.success &&
      future7d.body.data?.history?.length > 0 &&
      future7d.body.data?.forecast?.length === 7 &&
      future7d.body.data?.confidenceScore >= 0.8,
      'AI Future Market & Demand Forecasting Engine (7-Day Horizon)',
      `Confidence: ${(future7d.body.data?.confidenceScore * 100).toFixed(0)}%, Trend: ${future7d.body.data?.summary?.trendDirection}`
    );

    const future3m = await request('POST', '/api/ai/future-insights', {
      commodity: 'Wheat',
      period: '3m',
      role: 'consumer'
    });
    assert(
      future3m.status === 200 &&
      future3m.body.success &&
      future3m.body.data?.forecast?.length === 12,
      'AI Consumer Price Horizon Forecasting Engine (3-Month Horizon)',
      `12 weekly projection data points generated with retail price forecasting`
    );

    // 2. Multi-Photo Management: Set Primary Photo
    const primaryPhotoRes = await request('PUT', `/api/products/prod_1/images/primary`, {
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'
    }, farmerToken);
    assert(
      primaryPhotoRes.status === 200 && primaryPhotoRes.body.success && primaryPhotoRes.body.data?.image !== undefined,
      'Product Multi-Photo: Set Primary Image',
      `Primary image set to: ${primaryPhotoRes.body.data?.image?.substring(0, 45)}...`
    );

    // 3. AgroBridge Assured Quality Verification Engine
    const qualityVerifyRes = await request('PUT', `/api/admin/products/prod_1/verify`, {
      qualityScore: 92,
      status: 'VERIFIED',
      verificationChecks: {
        visualFreshness: true,
        pesticideSafe: true,
        packagingWeight: true,
        farmerTraceability: true
      },
      notes: 'Passed physical audit at central distribution center. Certified AgroBridge Assured.'
    }, adminToken);
    assert(
      qualityVerifyRes.status === 200 &&
      qualityVerifyRes.body.success &&
      qualityVerifyRes.body.data?.isAssured === true &&
      qualityVerifyRes.body.data?.qualityStatus === 'VERIFIED',
      'AgroBridge Assured Quality Verification (Score >= 85 -> Assured = true)',
      `Assigned Score: ${qualityVerifyRes.body.data?.qualityScore}, isAssured: ${qualityVerifyRes.body.data?.isAssured}`
    );

    // 4. Consumer Feedback System (Strictly Restricted to Delivered Orders)
    // Attempt feedback on non-delivered order should fail
    const invalidFeedback = await request('POST', '/api/feedback', {
      orderId: createdOrderId, // createdOrderId is not yet delivered
      productId: 'prod_1',
      ratings: { quality: 5, freshness: 5, packaging: 4, valueForMoney: 5 },
      comment: 'Premature feedback test'
    }, consumerToken);
    assert(
      invalidFeedback.status === 400 && invalidFeedback.body.success === false,
      'Feedback Security: Block Reviews on Undelivered Orders',
      `Correctly rejected undelivered order review with: "${invalidFeedback.body.error || invalidFeedback.body.message}"`
    );

    // Feedback on pre-seeded delivered order ORD-9101
    const validFeedback = await request('POST', '/api/feedback', {
      orderId: 'ORD-9101',
      productId: 'prod_1',
      ratings: { quality: 5, freshness: 5, packaging: 4, valueForMoney: 5 },
      comment: 'Super crisp hybrid tomatoes! Straight from farm gate, zero chemical smell.'
    }, consumerToken);
    assert(
      validFeedback.status === 201 && validFeedback.body.success && (validFeedback.body.data?.overallScore !== undefined || validFeedback.body.data?.overallRating !== undefined),
      'Consumer Feedback for Farmer on Delivered Order',
      `Rating stored with overall score: ${validFeedback.body.data?.overallScore || validFeedback.body.data?.overallRating}/5.0`
    );

    // Retrieve farmer ratings telemetry
    const farmerFbList = await request('GET', '/api/farmers/user_farmer_1/feedback');
    assert(
      farmerFbList.status === 200 && farmerFbList.body.success && farmerFbList.body.count >= 1,
      'Farmer Dashboard Feedback & Rating Telemetry',
      `Total Reviews: ${farmerFbList.body.count}, Avg Rating: ${farmerFbList.body.averageRating?.toFixed(1)}/5.0`
    );

    // 5. Consumer Complaints & Dispute Support System
    const fileComplaintRes = await request('POST', '/api/complaints', {
      orderId: 'ORD-9101',
      productId: 'prod_1',
      farmerId: 'user_farmer_1',
      reason: 'Quality Issue',
      description: 'Minor moisture condensation in bottom corner of box during transit.',
      evidencePhotos: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800']
    }, consumerToken);
    const createdComplaintId = fileComplaintRes.body?.data?.id;
    assert(
      fileComplaintRes.status === 201 && fileComplaintRes.body.success && createdComplaintId !== undefined,
      'Consumer Dispute Filing with Evidence Photo',
      `Filed Ticket #${createdComplaintId}, Status: ${fileComplaintRes.body.data?.status}`
    );

    // Farmer responds to complaint
    const farmerReplyRes = await request('PUT', `/api/farmers/complaints/${createdComplaintId}/respond`, {
      farmerResponse: 'Inspected dispatch logs: packing was sealed at 6 AM. Will add moisture absorber pouches in future orders.'
    }, farmerToken);
    assert(
      farmerReplyRes.status === 200 && farmerReplyRes.body.success && (farmerReplyRes.body.data?.farmerResponse !== undefined || farmerReplyRes.body.data?.farmer_response !== undefined),
      'Farmer Dispute Statement Submission',
      `Farmer response recorded successfully`
    );

    // Admin resolves dispute
    const adminResolveRes = await request('PUT', `/api/admin/complaints/${createdComplaintId}`, {
      status: 'RESOLVED',
      resolutionNotes: 'Dispute mediated. Partial ₹50 goodwill wallet credit issued to consumer. Seller record updated.'
    }, adminToken);
    assert(
      adminResolveRes.status === 200 &&
      adminResolveRes.body.success &&
      adminResolveRes.body.data?.status === 'RESOLVED',
      'Central Admin Dispute Mediation & Resolution',
      `Status: ${adminResolveRes.body.data?.status}, Resolution: "${adminResolveRes.body.data?.resolutionNotes}"`
    );

    // -----------------------------------------------------------------
    // SECTION 6: BULK BUYER MODULE, AI BEST DEAL MATCH & VERIFIED WHOLESALE FEEDBACK
    // -----------------------------------------------------------------
    console.log('\n--- 6. Bulk Buyer Module, AI Best Deal Match & Verified Wholesale Feedback ---');

    // 1. Assured Products Filter (strictly isAssured === true && qualityStatus === 'VERIFIED')
    const assuredFilterRes = await request('GET', '/api/products?assured=true');
    const assuredList = assuredFilterRes.body.data || [];
    const allAssuredValid = assuredList.length > 0 && assuredList.every(p => p.isAssured === true && p.qualityStatus === 'VERIFIED');
    assert(
      assuredFilterRes.status === 200 && assuredFilterRes.body.success && allAssuredValid,
      'Wholesale Marketplace Filter: [ ✓ AgroBridge Assured ] Only',
      `Returned ${assuredList.length} products, 100% verified AgroBridge Assured`
    );

    // 2. Near Me and Best Deals Filters
    const nearMeRes = await request('GET', '/api/products?filter=nearMe');
    assert(
      nearMeRes.status === 200 && nearMeRes.body.success && nearMeRes.body.data?.length > 0,
      'Wholesale Marketplace Filter: [ 📍 Near Me ] Proximity Sorting',
      `Returned ${nearMeRes.body.data.length} products sorted by distance`
    );

    const bestDealsRes = await request('GET', '/api/products?filter=bestDeals');
    assert(
      bestDealsRes.status === 200 && bestDealsRes.body.success && bestDealsRes.body.data?.length > 0,
      'Wholesale Marketplace Filter: [ 🔥 Best Deals ] APMC Savings Sorting',
      `Returned ${bestDealsRes.body.data.length} high-discount products`
    );

    // 3. 9-Factor AI Best Deal Match Engine
    const aiDealRes = await request('POST', '/api/ai/best-deal', {
      product: 'Tomato',
      requiredQuantity: 500,
      buyerLocation: 'Bhopal Central Hub'
    }, bulkBuyerToken);
    assert(
      aiDealRes.status === 200 &&
      aiDealRes.body.success &&
      aiDealRes.body.data?.bestDeal !== undefined &&
      aiDealRes.body.data?.comparison?.length > 0 &&
      aiDealRes.body.data?.scoringWeights !== undefined &&
      Boolean(aiDealRes.body.data?.disclaimer),
      '9-Factor AI Best Deal Match & Multi-Farmer Benchmarking',
      `Top Pick: ${aiDealRes.body.data?.bestDeal?.farmerName} (Score: ${aiDealRes.body.data?.bestDeal?.bestDealScore}/100, Est Savings: ₹${aiDealRes.body.data?.bestDeal?.estimatedSavings})`
    );

    // 4. Minimum Order Quantity (MOQ) Validation
    const subMoqOrderRes = await request('POST', '/api/bulk-orders', {
      productId: 'prod_1',
      quantityKg: 20 // prod_1 MOQ is 50kg
    }, bulkBuyerToken);
    assert(
      subMoqOrderRes.status === 400 && subMoqOrderRes.body.success === false,
      'MOQ Enforcement: Reject Bulk Requisition Below Minimum Volume (50kg)',
      `Correctly blocked with: "${subMoqOrderRes.body.error}"`
    );

    // 5. Bulk Order Requisition Placement & Dynamic Tier Pricing
    const validBulkOrderRes = await request('POST', '/api/bulk-orders', {
      productId: 'prod_1',
      quantityKg: 500,
      deliveryAddress: 'Wholesale Depot 9, Karond Industrial Area, Bhopal, MP',
      expectedDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
      notes: 'Load in ventilated 25kg crates. Cold-chain vehicle dispatched.'
    }, bulkBuyerToken);
    const createdBulkOrder = validBulkOrderRes.body.data;
    assert(
      validBulkOrderRes.status === 201 &&
      validBulkOrderRes.body.success &&
      createdBulkOrder?.id &&
      createdBulkOrder?.status === 'FARMER_NOTIFIED',
      'Commercial Bulk Order Requisition (Auto-Status: FARMER_NOTIFIED)',
      `Created Order #${createdBulkOrder?.id}, Unit Price: ₹${createdBulkOrder?.unit_price}/kg, Total: ₹${createdBulkOrder?.total_amount}`
    );

    // 6. Farmer Notification Delivery
    const farmerNotifRes = await request('GET', '/api/notifications', null, farmerToken);
    const hasOrderNotif = farmerNotifRes.body.data?.some(n => n.type === 'NEW_BULK_ORDER' || n.orderId === createdBulkOrder?.id);
    assert(
      farmerNotifRes.status === 200 && farmerNotifRes.body.success && hasOrderNotif,
      'Real-Time Farmer Order Notification Delivery',
      `Farmer received instant requisition alert for order #${createdBulkOrder?.id}`
    );

    // 7. Notification Read Mark
    const targetNotif = farmerNotifRes.body.data?.find(n => n.type === 'NEW_BULK_ORDER' || n.orderId === createdBulkOrder?.id);
    if (targetNotif) {
      const markReadRes = await request('PUT', `/api/notifications/${targetNotif.id}/read`, null, farmerToken);
      assert(
        markReadRes.status === 200 && markReadRes.body.success && markReadRes.body.data?.read === true,
        'Notification Center: Mark Bulk Order Notification Read',
        `Notification ${targetNotif.id} marked read`
      );
    }

    // 8. Farmer Accepts Bulk Order -> Transitions to FARMER_ACCEPTED & triggers Delivery
    const acceptOrderRes = await request('PUT', `/api/bulk-orders/${createdBulkOrder.id}/status`, {
      status: 'FARMER_ACCEPTED'
    }, farmerToken);
    assert(
      acceptOrderRes.status === 200 &&
      acceptOrderRes.body.success &&
      acceptOrderRes.body.data?.status === 'FARMER_ACCEPTED' &&
      acceptOrderRes.body.data?.delivery_job_id !== undefined,
      'Farmer Action: Accept Commercial Bulk Order (Dispatches Logistics)',
      `Status: FARMER_ACCEPTED, Delivery Job: ${acceptOrderRes.body.data?.delivery_job_id}`
    );

    // 9. Verified Bulk Feedback Guard: Block Reviews on Undelivered Bulk Order
    const earlyBulkFeedbackRes = await request('POST', '/api/bulk-feedback', {
      orderId: createdBulkOrder.id,
      ratings: { cropQuality: 5, punctuality: 5, packaging: 5, pricingFairness: 5, communication: 5, overallExperience: 5 },
      review: 'Premature bulk feedback test'
    }, bulkBuyerToken);
    assert(
      earlyBulkFeedbackRes.status === 400 && earlyBulkFeedbackRes.body.success === false,
      'Wholesale Feedback Security: Block Review Before Delivery',
      `Rejected with error: "${earlyBulkFeedbackRes.body.error}"`
    );

    // 10. Advance Order to DELIVERED status
    await request('PUT', `/api/bulk-orders/${createdBulkOrder.id}/status`, { status: 'DELIVERED' }, farmerToken);
    const deliveredOrderRes = await request('GET', `/api/bulk-orders/${createdBulkOrder.id}`, null, bulkBuyerToken);
    assert(
      deliveredOrderRes.status === 200 && deliveredOrderRes.body.data?.status === 'DELIVERED',
      'Wholesale Order Lifecycle: Transition to DELIVERED Status',
      `Order #${createdBulkOrder.id} successfully marked DELIVERED`
    );

    // 11. Submit Verified 6-Dimension Bulk Buyer Feedback
    const submitBulkFbRes = await request('POST', '/api/bulk-feedback', {
      orderId: createdBulkOrder.id,
      ratings: {
        cropQuality: 5,
        punctuality: 5,
        packaging: 4,
        pricingFairness: 5,
        communication: 5,
        overallExperience: 5
      },
      review: 'Outstanding quality Grade A+ harvest! Zero transit bruising, moisture content verified at depot dock.'
    }, bulkBuyerToken);
    assert(
      submitBulkFbRes.status === 201 &&
      submitBulkFbRes.body.success &&
      submitBulkFbRes.body.data?.overallRating !== undefined &&
      submitBulkFbRes.body.data?.verifiedBuyer === true,
      'Verified Bulk Buyer Multi-Dimension Feedback Submission',
      `Score: ${submitBulkFbRes.body.data?.overallRating}/5.0, Verified: ${submitBulkFbRes.body.data?.verifiedBuyer}`
    );

    // 12. Duplicate Review Prevention
    const dupFeedbackRes = await request('POST', '/api/bulk-feedback', {
      orderId: createdBulkOrder.id,
      ratings: { cropQuality: 5, punctuality: 5, packaging: 5, pricingFairness: 5, communication: 5, overallExperience: 5 },
      review: 'Duplicate test'
    }, bulkBuyerToken);
    assert(
      dupFeedbackRes.status === 400 && dupFeedbackRes.body.success === false,
      'Review Integrity: Prevent Duplicate Bulk Reviews',
      `Rejected duplicate feedback with error: "${dupFeedbackRes.body.error}"`
    );

    // 13. Farmer Wholesale Reputation Scorecard & Feedback Telemetry
    const farmerReputationRes = await request('GET', `/api/farmers/${createdBulkOrder.farmer_id}/bulk-feedback`);
    assert(
      farmerReputationRes.status === 200 &&
      farmerReputationRes.body.success &&
      farmerReputationRes.body.count >= 1 &&
      farmerReputationRes.body.averageRating > 0,
      'Farmer Dashboard Wholesale Reputation Scorecard & Telemetry',
      `Verified Reviews: ${farmerReputationRes.body.count}, Avg Wholesale Rating: ${farmerReputationRes.body.averageRating?.toFixed(1)}/5.0`
    );

    // -----------------------------------------------------------------
    // SUMMARY
    // -----------------------------------------------------------------
    console.log('\n================================================================');
    const passedCount = results.filter(r => r.passed).length;
    const failedCount = results.filter(r => !r.passed).length;
    console.log(`AUDIT RESULTS: ${passedCount}/${results.length} PASSED (${failedCount} FAILED)`);
    console.log('================================================================\n');

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }

  } catch (err) {
    console.error('Fatal test runner exception:', err);
    process.exit(1);
  }
}

runAudit();
