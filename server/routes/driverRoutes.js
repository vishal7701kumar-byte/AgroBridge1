const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const userService = require('../services/userService');

// All routes under /api/driver/* require authentication and DRIVER role
router.use(protect);
router.use(authorize('DRIVER'));

router.get('/dashboard-stats', (req, res) => {
  res.json({
    success: true,
    data: {
      driverName: req.user.name,
      vehicleType: req.user.vehicleType || 'Pickup Truck',
      vehicleNumber: req.user.vehicleNumber || 'MP 04 GA 4892',
      vehicleCapacity: req.user.vehicleCapacity || '1.5 Tons',
      driverStatus: req.user.driverStatus || 'OFFLINE',
      todayEarnings: 2450,
      completedTrips: 18,
      rating: 4.9,
      assignedDeliveries: [
        {
          id: 'DEL-4091',
          pickup: 'Patel Organic Farms, Berasia',
          dropoff: 'FreshMart Distribution Hub, Govindpura',
          distanceKm: 28.4,
          payloadKg: 1200,
          payout: 1450,
          status: 'Ready for Pickup',
          items: '1200kg Grade A Tomatoes'
        },
        {
          id: 'DEL-4092',
          pickup: 'Anita Bai Farm, Gulabganj',
          dropoff: 'Hotel Green Park, MP Nagar',
          distanceKm: 34.1,
          payloadKg: 650,
          payout: 1000,
          status: 'Scheduled',
          items: '650kg Sharbati Wheat'
        }
      ]
    }
  });
});

router.put('/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['ONLINE', 'OFFLINE'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be ONLINE or OFFLINE' });
    }

    const updated = await userService.updateUser(req.user._id, { driverStatus: status });
    res.json({
      success: true,
      message: `Driver status switched to ${status}`,
      driverStatus: status,
      data: { status },
      user: updated
    });
  } catch (err) {
    next(err);
  }
});

router.put('/location', async (req, res, next) => {
  try {
    const { latitude, longitude, lat, lon } = req.body;
    const finalLat = latitude !== undefined ? latitude : lat;
    const finalLon = longitude !== undefined ? longitude : lon;
    const dataService = require('../services/dataService');
    const updated = dataService.updateDriverLocation(req.user.email, { latitude: finalLat, longitude: finalLon });
    if (!updated) {
      return res.status(400).json({ success: false, error: 'Valid latitude and longitude required' });
    }
    res.json({
      success: true,
      message: 'Driver location updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
