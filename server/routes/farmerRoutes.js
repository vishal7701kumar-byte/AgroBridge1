const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const dataService = require('../services/dataService');

// All routes under /api/farmer/* require authentication and FARMER role
router.use(protect);
router.use(authorize('FARMER'));

router.get('/dashboard-stats', (req, res) => {
  const farmerStatus = dataService.getFarmerAccountStatus(req.user.email);
  const complaintSummary = dataService.getFarmerComplaintSummary(req.user.email);

  res.json({
    success: true,
    data: {
      farmName: req.user.farmName || 'Patel Organic Farms',
      accountStatus: farmerStatus.status,
      statusReason: farmerStatus.statusReason,
      unlistedUntil: farmerStatus.unlistedUntil,
      statusUpdatedAt: farmerStatus.statusUpdatedAt,
      adminNotes: farmerStatus.adminNotes,
      verifiedComplaintsCount: complaintSummary.verifiedCount,
      totalComplaintsCount: complaintSummary.totalComplaints,
      activeListingsCount: 8,
      totalYieldKg: 4250,
      monthlyEarnings: 128400,
      pendingDispatches: 3,
      recentCrops: [
        { id: 'crop_1', name: 'Fresh Sharbati Wheat', category: 'Grains', grade: 'Grade A', quantityKg: 1500, pricePerKg: 38, status: 'Listed', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80' },
        { id: 'crop_2', name: 'Organic Hybrid Tomatoes', category: 'Vegetables', grade: 'Grade A+', quantityKg: 850, pricePerKg: 28, status: 'Ready for Dispatch', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80' },
        { id: 'crop_3', name: 'Red Nashik Onions', category: 'Vegetables', grade: 'Grade A', quantityKg: 1200, pricePerKg: 26, status: 'Listed', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80' },
        { id: 'crop_4', name: 'Yellow Soya Beans', category: 'Grains', grade: 'Grade B', quantityKg: 700, pricePerKg: 46, status: 'Sold', image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=600&auto=format&fit=crop&q=80' }
      ],
      marketRates: [
        { commodity: 'Wheat (Sharbati)', mandiRate: 31, agroBridgeRate: 38, bonus: '+22.5%' },
        { commodity: 'Tomato (Hybrid)', mandiRate: 22, agroBridgeRate: 28, bonus: '+27.2%' },
        { commodity: 'Onion (Red)', mandiRate: 21, agroBridgeRate: 26, bonus: '+23.8%' },
        { commodity: 'Soybean (Yellow)', mandiRate: 39, agroBridgeRate: 46, bonus: '+17.9%' }
      ]
    }
  });
});

module.exports = router;
