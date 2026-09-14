const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const dataService = require('../services/dataService');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get all marketplace products (supports category, search, assured, filter)
router.get('/products', (req, res) => {
  const products = dataService.getProducts(req.query);
  res.json({ success: true, count: products.length, data: products });
});

// Bulk Buyer Wholesale Marketplace Products
router.get('/bulk/products', (req, res) => {
  const products = dataService.getProducts(req.query);
  res.json({ success: true, count: products.length, data: products });
});

// Get Best Prices Near You (Top deals with highest percentage savings)
router.get('/products/best-prices-near-you', (req, res) => {
  const bestDeals = dataService.getBestPricesNearYou();
  res.json({ success: true, count: bestDeals.length, data: bestDeals });
});

// Smart Price Comparison API
router.get('/products/:id/price-comparison', (req, res) => {
  const comparison = dataService.getProductPriceComparison(req.params.id);
  if (!comparison) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  res.json({
    success: true,
    data: comparison,
    productName: comparison.productName,
    agroBridgePrice: comparison.agroBridgePrice,
    marketPrice: comparison.marketPrice,
    regionalAveragePrice: comparison.regionalAveragePrice,
    aiFairPrice: comparison.aiFairPrice,
    savings: comparison.savings,
    savingsPercentage: comparison.savingsPercentage,
    priceStatus: comparison.priceStatus,
    aiRecommendation: comparison.aiRecommendation
  });
});

// 7-Day Price History API
router.get('/products/:id/price-history', (req, res) => {
  const history = dataService.getProductPriceHistory(req.params.id);
  res.json({ success: true, count: history.length, data: history });
});

// Register Price Alert API
router.post('/products/:id/price-alert', (req, res) => {
  const { targetPrice, consumerEmail } = req.body;
  const product = dataService.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  const alert = dataService.createPriceAlert({
    productId: req.params.id,
    consumerEmail: consumerEmail || req.user?.email || 'consumer@agrobridge.demo',
    targetPrice: parseFloat(targetPrice) || (product.price_per_kg - 2),
    productName: product.product_name
  });

  res.status(201).json({
    success: true,
    message: `Price drop alert registered for ${product.product_name} at target price ₹${alert.targetPrice}/kg!`,
    data: alert
  });
});

// Get Price Alerts
router.get('/price-alerts', (req, res) => {
  const email = req.query.email || req.user?.email || 'consumer@agrobridge.demo';
  const alerts = dataService.getPriceAlerts(email);
  res.json({ success: true, count: alerts.length, data: alerts });
});

// Single product details
router.get('/products/:id', (req, res) => {
  const product = dataService.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  res.json({ success: true, data: product });
});

// General image upload endpoint (accepts base64 data URI or image URL)
router.post('/upload', protect, (req, res) => {
  try {
    const { image, url } = req.body;
    const raw = image || url;
    if (!raw) {
      return res.status(400).json({ success: false, error: 'Image data or URL is required' });
    }

    // Check if base64 data URL
    const matches = raw.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const mime = matches[1].toLowerCase();
      let ext = 'jpg';
      if (mime.includes('png')) ext = 'png';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';

      const buffer = Buffer.from(matches[2], 'base64');
      const filename = `produce_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}.${ext}`;
      const uploadDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      return res.status(201).json({
        success: true,
        url: `/uploads/${filename}`,
        message: 'Image uploaded and saved successfully'
      });
    }

    // If already a URL or path
    return res.json({
      success: true,
      url: raw,
      message: 'Image referenced successfully'
    });
  } catch (err) {
    console.error('Upload processing error:', err);
    res.status(500).json({ success: false, error: 'Failed to process image upload' });
  }
});

// Add image to product
router.post('/products/:id/images', protect, (req, res) => {
  const { url, alt } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, error: 'Image URL or data is required' });
  }
  const updated = dataService.addProductImage(req.params.id, { url, alt: alt || 'Product photo' });
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  res.status(201).json({ success: true, message: 'Product image added successfully', data: updated });
});

// Set product primary image
router.put('/products/:id/images/primary', protect, (req, res) => {
  const { index, url } = req.body;
  const updated = dataService.setPrimaryImage(req.params.id, index !== undefined ? index : url);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Product or image not found' });
  }
  res.json({ success: true, message: 'Primary photo updated', data: updated });
});

// Remove product image
router.delete('/products/:id/images', protect, (req, res) => {
  const { index, url } = req.body;
  const updated = dataService.removeProductImage(req.params.id, index !== undefined ? index : url);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Product or image not found' });
  }
  res.json({ success: true, message: 'Product image removed', data: updated });
});

// Get product quality verification details
router.get('/products/:id/quality', (req, res) => {
  const prod = dataService.getProductById(req.params.id);
  if (!prod) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  res.json({
    success: true,
    data: {
      productId: prod.id,
      productName: prod.product_name,
      quality: prod.quality,
      qualityScore: prod.qualityScore || 85,
      qualityStatus: prod.qualityStatus || 'PENDING',
      isAssured: Boolean(prod.isAssured),
      verificationChecks: prod.verificationChecks || {},
      verifiedAt: prod.verifiedAt,
      verifiedBy: prod.verifiedBy
    }
  });
});

// Admin verify product quality & AgroBridge Assured status
router.put('/admin/products/:id/verify', protect, authorize('ADMIN'), (req, res) => {
  const { status, score, qualityScore, checks, verificationChecks, notes } = req.body;
  const updated = dataService.verifyProductQuality(req.params.id, {
    status,
    score,
    qualityScore,
    checks,
    verificationChecks,
    notes,
    adminName: req.user.name || 'AgroBridge QA Cell'
  });
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  res.json({
    success: true,
    message: `Product quality status updated to ${updated.qualityStatus}. Assured: ${updated.isAssured ? 'YES' : 'NO'}`,
    data: updated
  });
});

// Admin list all products for quality review
router.get('/admin/products/quality-review', protect, authorize('ADMIN'), (req, res) => {
  const products = dataService.getProducts();
  res.json({
    success: true,
    count: products.length,
    data: products.map(p => ({
      id: p.id,
      name: p.product_name,
      category: p.category,
      farmer_name: p.farmer_name,
      price_per_kg: p.price_per_kg,
      quality: p.quality,
      qualityScore: p.qualityScore || 80,
      qualityStatus: p.qualityStatus || 'PENDING',
      isAssured: Boolean(p.isAssured),
      verificationChecks: p.verificationChecks || {},
      verifiedAt: p.verifiedAt,
      images: p.images
    }))
  });
});

// Farmer lists new crop (Create)
router.post('/products', protect, authorize('FARMER'), (req, res) => {
  const { product_name, name, category, quantity_kg, quantity, price_per_kg, price, unit, quality, shelf_life_days, image, images, description, location } = req.body;
  const prodName = product_name || name;
  const prodPrice = price_per_kg || price;
  const prodQty = quantity_kg || quantity;

  if (!prodName || !prodQty || !prodPrice) {
    return res.status(400).json({ success: false, error: 'Crop name, quantity, and price are required' });
  }

  const newProduct = dataService.addProduct({
    farmer_id: req.user.email,
    farmer_name: req.user.name,
    farm_name: req.user.farmName || `${req.user.name}'s Farm`,
    product_name: prodName,
    name: prodName,
    category: category || 'Vegetables',
    quantity_kg: parseFloat(prodQty),
    quantity: parseFloat(prodQty),
    price_per_kg: parseFloat(prodPrice),
    price: parseFloat(prodPrice),
    unit: unit || 'kg',
    quality: quality || 'Grade A',
    shelf_life_days: parseInt(shelf_life_days) || 7,
    harvest_date: 'Today',
    location: location || req.user.farmLocation || `${req.user.district || 'Bhopal'}, MP`,
    district: req.user.district || 'Bhopal',
    lat: 23.4000,
    lon: 77.4300,
    image: image,
    images: images,
    description: description || 'Fresh harvest direct from field.'
  });

  if (newProduct && newProduct.error) {
    return res.status(newProduct.code || 403).json({ success: false, error: newProduct.error });
  }

  res.status(201).json({ success: true, message: 'Harvest crop listed successfully!', data: newProduct });
});

// Farmer updates crop (Update)
router.put('/products/:id', protect, authorize('FARMER'), (req, res) => {
  const { product_name, price_per_kg, quantity_kg, quality, category, image, images, unit, location, description } = req.body;
  const updated = dataService.updateProduct(req.params.id, {
    ...(product_name && { product_name, name: product_name }),
    ...(price_per_kg !== undefined && { price_per_kg: parseFloat(price_per_kg), price: parseFloat(price_per_kg) }),
    ...(quantity_kg !== undefined && { quantity_kg: parseFloat(quantity_kg), available_kg: parseFloat(quantity_kg) }),
    ...(quality && { quality }),
    ...(category && { category }),
    ...(unit && { unit }),
    ...(location && { location }),
    ...(description && { description }),
    ...(image && { image }),
    ...(images && { images })
  });

  if (!updated) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  res.json({ success: true, message: 'Product listing updated successfully', data: updated });
});

// Farmer deletes crop (Delete)
router.delete('/products/:id', protect, authorize('FARMER'), (req, res) => {
  const deleted = dataService.deleteProduct(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  res.json({ success: true, message: 'Product listing deleted successfully', data: deleted });
});

// Get orders
router.get('/orders', protect, (req, res) => {
  const user = req.user;
  const filter = user.role === 'ADMIN'
    ? {}
    : user.role === 'FARMER'
    ? { farmer_id: user.email }
    : { buyer_id: user.email };

  const orders = dataService.getOrders(filter);
  res.json({ success: true, count: orders.length, data: orders });
});

// Get single order details
router.get('/orders/:id', protect, (req, res) => {
  const order = dataService.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  res.json({ success: true, data: order });
});

// Demo Payment Gateway
router.post('/payments/demo', protect, (req, res) => {
  const { orderId, amount, paymentMethod } = req.body;
  const paymentResult = dataService.processDemoPayment({ orderId, amount, paymentMethod });
  res.json({
    success: true,
    message: 'Demo payment authorized and secured in AgroBridge Escrow',
    data: paymentResult
  });
});

// Place new order & auto-create delivery
router.post('/orders', protect, (req, res) => {
  const { items, delivery_address, deliveryAddress, payment_method, demo_payment_ref, latitude, longitude } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ success: false, error: 'Order items are required' });
  }

  const totalKg = items.reduce((acc, i) => acc + (parseFloat(i.quantity_kg || i.quantity) || 1), 0);
  const totalAmount = items.reduce((acc, i) => acc + (parseFloat(i.subtotal || (i.price_per_kg * i.quantity_kg) || (i.price * i.quantity)) || 0), 0);

  const finalDest = delivery_address || deliveryAddress?.address || req.user.address || req.user.businessAddress || 'Bhopal City Center, MP';

  const result = dataService.createOrder({
    buyer_id: req.user.email,
    buyer_name: req.user.name,
    buyer_role: req.user.role,
    items,
    total_quantity_kg: totalKg,
    total_amount: totalAmount,
    delivery_address: finalDest,
    deliveryAddress: {
      address: finalDest,
      latitude: parseFloat(latitude || deliveryAddress?.latitude || 23.2185),
      longitude: parseFloat(longitude || deliveryAddress?.longitude || 77.4320)
    },
    payment_method: payment_method || 'Escrow Direct UPI',
    demo_payment_ref: demo_payment_ref || `DEMO-PAY-${Date.now().toString().slice(-6)}`
  });

  if (result && result.error) {
    return res.status(result.code || 403).json({ success: false, error: result.error });
  }

  res.status(201).json({
    success: true,
    message: 'Order created successfully and dispatch assigned to driver!',
    data: result
  });
});

// Create delivery endpoint
router.post('/deliveries', protect, (req, res) => {
  const { order_id, orderId } = req.body;
  const targetId = order_id || orderId;
  const existing = dataService.getDeliveryById(targetId);
  if (existing) {
    return res.status(200).json({ success: true, data: existing });
  }

  const newDel = {
    id: `DEL-${Math.floor(1000 + Math.random() * 9000)}`,
    order_id: targetId || `ORD-${Date.now()}`,
    driver_id: 'driver@agrobridge.demo',
    driver_name: 'Vikram Singh',
    driver_phone: '+91 98264 44556',
    vehicle_type: 'Pickup Truck (1.5 Ton)',
    vehicle_number: 'MP 04 GA 4892',
    pickup_location: 'Patel Organic Farms, Berasia Road, Bhopal',
    dropoff_location: 'Arera Colony, Bhopal',
    status: 'driver_assigned',
    ...req.body
  };
  dataService.deliveries.unshift(newDel);
  res.status(201).json({ success: true, message: 'Delivery created successfully', data: newDel });
});

// Live Delivery Tracking Endpoint
router.get('/deliveries/:id/track', (req, res) => {
  const trackData = dataService.getDeliveryTrackData(req.params.id);
  if (!trackData) {
    return res.status(404).json({ success: false, error: 'Tracking data not found' });
  }
  res.json({ success: true, data: trackData });
});

// Smart Driver Assignment
router.post('/deliveries/assign-driver', (req, res) => {
  const { deliveryId, delivery_id, orderId, order_id } = req.body;
  const targetId = deliveryId || delivery_id || orderId || order_id;
  const result = dataService.assignSmartDriver(targetId);
  if (!result) {
    return res.status(404).json({ success: false, error: 'Delivery job not found' });
  }
  res.json({ success: true, message: 'AI Driver Assignment completed', data: result });
});

// Update Driver GPS Coordinates
router.put(['/drivers/location', '/driver/location'], (req, res) => {
  const { latitude, longitude, lat, lon } = req.body;
  const updated = dataService.updateDriverLocation(req.user?.email || 'driver@agrobridge.demo', {
    latitude: latitude !== undefined ? latitude : lat,
    longitude: longitude !== undefined ? longitude : lon
  });
  if (!updated) {
    return res.status(400).json({ success: false, error: 'Valid latitude and longitude required' });
  }
  res.json({ success: true, message: 'Driver location coordinates updated successfully', data: updated });
});

// Get deliveries
router.get('/deliveries', protect, (req, res) => {
  const user = req.user;
  const filter = user.role === 'DRIVER' ? { driver_id: user.email } : {};
  const deliveries = dataService.getDeliveries(filter);
  res.json({ success: true, count: deliveries.length, data: deliveries });
});

// Step 14: Driver accepts delivery
router.put('/deliveries/:id/accept', protect, authorize('DRIVER'), (req, res) => {
  const updated = dataService.acceptDelivery(req.params.id, req.user);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Delivery job not found' });
  }
  res.json({ success: true, message: 'Delivery job accepted successfully', data: updated });
});

// Step 15: Driver confirms pickup with Farm Gate OTP
router.post('/deliveries/:id/verify-pickup', protect, authorize('DRIVER'), (req, res) => {
  const { otp } = req.body;
  const result = dataService.verifyPickup(req.params.id, otp);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json({ success: true, message: 'Farm pickup verified! Status set to Out for Delivery.', data: result.delivery });
});

// Step 17: Driver completes delivery with Customer OTP & releases escrow
router.post('/deliveries/:id/verify-delivery', protect, authorize('DRIVER'), (req, res) => {
  const { otp } = req.body;
  const result = dataService.verifyDelivery(req.params.id, otp);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json({
    success: true,
    message: 'Delivery verified! Escrow payment released to driver and farmer.',
    data: {
      ...result.delivery,
      status: result.delivery.status,
      order: result.order,
      payout: result.payout
    }
  });
});

// RFQs
router.get('/rfqs', protect, (req, res) => {
  const rfqs = dataService.getRFQs();
  res.json({ success: true, data: rfqs });
});

router.post('/rfqs', protect, authorize('BULK_BUYER'), (req, res) => {
  const { commodity, quantity_tons, target_price_per_ton } = req.body;
  const newRfq = dataService.addRFQ({
    buyer_id: req.user.email,
    buyer_name: req.user.businessName || req.user.name,
    commodity: commodity || 'Wheat',
    quantity_tons: parseFloat(quantity_tons) || 10,
    target_price_per_ton: parseFloat(target_price_per_ton) || 30000
  });
  res.status(201).json({ success: true, message: 'Commercial RFQ submitted', data: newRfq });
});

// Notifications
router.get('/notifications', protect, (req, res) => {
  const list = dataService.getNotifications({ role: req.user.role, recipient: req.user.email });
  res.json({ success: true, count: list.length, data: list });
});

router.put('/notifications/:id/read', protect, (req, res) => {
  const updated = dataService.markNotificationRead(req.params.id);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Notification not found' });
  }
  res.json({ success: true, message: 'Notification marked as read', data: updated });
});

// =============================================================
// BULK BUYER ORDERS & VERIFIED WHOLESALE FEEDBACK APIS
// =============================================================

// Create new bulk order
router.post('/bulk-orders', protect, (req, res) => {
  const { product_id, productId, quantity_kg, quantityKg, quantity, delivery_address, deliveryAddress, expected_delivery_date, expectedDate, notes } = req.body;
  const result = dataService.createBulkOrder({
    product_id: product_id || productId,
    quantity_kg: quantity_kg || quantityKg || quantity,
    delivery_address: delivery_address || deliveryAddress || req.user.businessAddress || req.user.address,
    expected_delivery_date: expected_delivery_date || expectedDate,
    notes,
    buyer_id: req.user.email,
    buyer_name: req.user.businessName || req.user.name,
    buyer_business: req.user.businessName || 'Wholesale Buyer',
    buyer_phone: req.user.phone || '+91 98260 11223'
  });

  if (!result.success) {
    return res.status(result.code || 400).json({ success: false, error: result.error });
  }

  res.status(201).json({
    success: true,
    message: 'Bulk purchase order created and farmer notified!',
    data: result.order
  });
});

// Get buyer or farmer bulk orders
router.get('/bulk-orders', protect, (req, res) => {
  const user = req.user;
  let filter = {};
  if (user.role === 'BULK_BUYER') {
    filter.buyer_id = user.email;
  } else if (user.role === 'FARMER') {
    filter.farmer_id = user.email;
  }
  const list = dataService.getBulkOrders(filter);
  res.json({ success: true, count: list.length, data: list });
});

// Get single bulk order
router.get('/bulk-orders/:id', protect, (req, res) => {
  const order = dataService.getBulkOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Bulk order not found' });
  }
  res.json({ success: true, data: order });
});

// Update bulk order status (FARMER_ACCEPTED, FARMER_DECLINED, DELIVERED, etc.)
router.put('/bulk-orders/:id/status', protect, (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, error: 'Status is required' });
  }
  const result = dataService.updateBulkOrderStatus(req.params.id, status, req.user);
  if (!result.success) {
    return res.status(result.code || 400).json({ success: false, error: result.error });
  }
  res.json({ success: true, message: `Bulk order status updated to ${status}`, data: result.order });
});

// Farmer views their incoming bulk orders
router.get('/farmers/bulk-orders', protect, authorize('FARMER'), (req, res) => {
  const list = dataService.getBulkOrders({ farmer_id: req.user.email });
  res.json({ success: true, count: list.length, data: list });
});

// Submit verified bulk buyer feedback (STRICTLY ON DELIVERED STATUS)
router.post('/bulk-feedback', protect, (req, res) => {
  const { orderId, ratings, review } = req.body;
  if (!orderId) {
    return res.status(400).json({ success: false, error: 'Bulk Order ID is required' });
  }
  const result = dataService.createBulkFeedback({
    orderId,
    buyerEmail: req.user.email,
    buyerName: req.user.businessName || req.user.name,
    ratings,
    review
  });
  if (!result.success) {
    return res.status(result.code || 400).json({ success: false, error: result.error });
  }
  res.status(201).json({
    success: true,
    message: 'Verified bulk buyer feedback submitted successfully!',
    data: result.feedback
  });
});

// Get farmer bulk feedback telemetry
router.get('/farmers/:id/bulk-feedback', (req, res) => {
  const result = dataService.getFarmerBulkFeedback(req.params.id);
  res.json(result);
});

// =============================================================
// FEATURE 4: VERIFIED CONSUMER FEEDBACK & RATINGS FOR FARMER
// =============================================================

// Submit feedback for a delivered order item (Verified Purchasers Only)
router.post('/feedback', protect, authorize('CONSUMER'), (req, res) => {
  const { orderId, productId, ratings, review } = req.body;
  if (!orderId || !productId) {
    return res.status(400).json({ success: false, error: 'Order ID and Product ID are required to submit feedback' });
  }

  const result = dataService.addFeedback({
    orderId,
    productId,
    consumerEmail: req.user.email,
    consumerName: req.user.name,
    ratings,
    review
  });

  if (!result.success) {
    return res.status(result.code || 400).json({ success: false, error: result.error });
  }

  res.status(201).json({
    success: true,
    message: 'Thank you! Your verified feedback and rating have been recorded.',
    data: result.feedback
  });
});

// Get feedback for a specific farmer
router.get('/farmers/:id/feedback', (req, res) => {
  const list = dataService.getFarmerFeedbacks(req.params.id);
  const avg = list.length
    ? Math.round((list.reduce((acc, f) => acc + f.overallRating, 0) / list.length) * 10) / 10
    : 5.0;

  res.json({
    success: true,
    count: list.length,
    averageRating: avg,
    data: list
  });
});

// Get feedback for a specific product
router.get('/products/:id/feedback', (req, res) => {
  const list = dataService.getProductFeedbacks(req.params.id);
  const avg = list.length
    ? Math.round((list.reduce((acc, f) => acc + f.overallRating, 0) / list.length) * 10) / 10
    : 5.0;

  res.json({
    success: true,
    count: list.length,
    averageRating: avg,
    data: list
  });
});

// =============================================================
// FEATURE 5: CONSUMER COMPLAINT & SUPPORT SYSTEM
// =============================================================

// File a new complaint/dispute ticket
router.post('/complaints', protect, authorize('CONSUMER'), (req, res) => {
  const { orderId, productId, issueCategory, reason, title, description, evidenceUrls, evidencePhotos } = req.body;
  const compTitle = title || reason || 'Produce Grievance';
  if (!orderId || !description) {
    return res.status(400).json({ success: false, error: 'Order ID and description are required' });
  }

  const result = dataService.createComplaint({
    orderId,
    productId,
    consumerEmail: req.user.email,
    consumerName: req.user.name,
    issueCategory: issueCategory || reason || 'QUALITY_ISSUE',
    reason: reason || title || 'Quality Issue',
    title: compTitle,
    description,
    evidenceUrls,
    evidencePhotos
  });

  if (!result.success) {
    return res.status(result.code || 400).json({ success: false, error: result.error });
  }

  res.status(201).json({
    success: true,
    message: `Support ticket ${result.complaint.id} created successfully. Our team and farmer will review it.`,
    data: result.complaint
  });
});

// Get logged-in consumer's complaints
router.get('/complaints/my', protect, authorize('CONSUMER'), (req, res) => {
  const list = dataService.getConsumerComplaints(req.user.email);
  res.json({ success: true, count: list.length, data: list });
});

// Farmer views complaints related to their produce
router.get('/farmers/complaints', protect, authorize('FARMER'), (req, res) => {
  const list = dataService.getFarmerComplaints(req.user.email);
  res.json({ success: true, count: list.length, data: list });
});

// Farmer responds to a complaint
router.put('/farmers/complaints/:id/respond', protect, authorize('FARMER'), (req, res) => {
  const { response, farmerResponse } = req.body;
  const text = (response || farmerResponse || '').trim();
  if (!text) {
    return res.status(400).json({ success: false, error: 'Response text is required' });
  }

  const result = dataService.farmerRespondComplaint(req.params.id, req.user.email, text);
  if (!result.success) {
    return res.status(result.code || 400).json({ success: false, error: result.error });
  }

  res.json({
    success: true,
    message: 'Your response has been submitted to the consumer and recorded in the dispute file.',
    data: result.complaint
  });
});

// Admin views all complaints
router.get('/admin/complaints', protect, authorize('ADMIN'), (req, res) => {
  const list = dataService.getAllComplaints(req.query);
  res.json({ success: true, count: list.length, data: list });
});

// Admin updates or resolves a complaint
router.put('/admin/complaints/:id', protect, authorize('ADMIN'), (req, res) => {
  const { status, adminNotes, resolutionNotes, resolutionAction } = req.body;
  const result = dataService.adminUpdateComplaint(req.params.id, {
    status,
    adminNotes: adminNotes || resolutionNotes,
    resolutionNotes: resolutionNotes || adminNotes,
    resolutionAction
  });

  if (!result.success) {
    return res.status(result.code || 400).json({ success: false, error: result.error });
  }

  res.json({
    success: true,
    message: `Complaint ticket ${req.params.id} updated to status: ${result.complaint.status}`,
    data: result.complaint
  });
});

// SIH Feature 22: Cryptographic Tamper-Evident Digital Receipt (SHA-256)
router.get('/receipt/:orderId', (req, res) => {
  const receipt = dataService.generateDigitalReceipt(req.params.orderId);
  res.json(receipt);
});

module.exports = router;
