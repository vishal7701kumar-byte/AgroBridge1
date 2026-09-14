const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes under /api/consumer/* require authentication and CONSUMER role
router.use(protect);
router.use(authorize('CONSUMER'));

router.get('/dashboard-stats', (req, res) => {
  res.json({
    success: true,
    data: {
      deliveryAddress: req.user.address || 'Flat 402, Green Meadows Heights, Arera Colony',
      city: req.user.city || 'Bhopal',
      activeOrders: 2,
      savedAmountTotal: 3420,
      freshProduceCatalog: [
        { id: 'prod_1', name: 'Farm-Fresh Tomatoes', farmer: 'Ramesh Patel', pricePerKg: 30, mandiCompare: 42, farmOrigin: 'Berasia, Bhopal', harvestDate: 'Harvested Today 6 AM', image: '🍅' },
        { id: 'prod_2', name: 'Crunchy Seedless Cucumbers', farmer: 'Anita Bai', pricePerKg: 25, mandiCompare: 35, farmOrigin: 'Gulabganj, Vidisha', harvestDate: 'Harvested Today 5 AM', image: '🥒' },
        { id: 'prod_3', name: 'Fresh Green Capsicum', farmer: 'Mukesh Yadav', pricePerKg: 45, mandiCompare: 60, farmOrigin: 'Mandideep, Raisen', harvestDate: 'Harvested Yesterday', image: '🫑' },
        { id: 'prod_4', name: 'Organic Red Carrots', farmer: 'Suresh Verma', pricePerKg: 38, mandiCompare: 50, farmOrigin: 'Ichhawar, Sehore', harvestDate: 'Harvested Today 7 AM', image: '🥕' }
      ],
      recentOrders: [
        { orderId: 'AGRO-ORD-9102', items: 'Tomatoes 5kg, Capsicum 2kg', total: 240, status: 'Out for Delivery', eta: '25 mins' },
        { orderId: 'AGRO-ORD-8831', items: 'Sharbati Wheat Flour 10kg, Carrots 3kg', total: 540, status: 'Delivered', deliveredAt: 'Yesterday 4:30 PM' }
      ]
    }
  });
});

module.exports = router;
