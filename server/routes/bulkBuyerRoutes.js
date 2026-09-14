const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes under /api/bulk-buyer/* require authentication and BULK_BUYER role
router.use(protect);
router.use(authorize('BULK_BUYER'));

router.get('/dashboard-stats', (req, res) => {
  res.json({
    success: true,
    data: {
      businessName: req.user.businessName || 'Mehta Agro Wholesalers & Hotel Supplies',
      businessType: req.user.businessType || 'Distributor',
      totalProcuredVolumeTons: 64.5,
      activeContractsCount: 5,
      averageVolumeDiscount: '18.4%',
      pendingProcurementValue: 348000,
      activeBulkContracts: [
        { id: 'cnt_101', commodity: 'Premium Wheat (Grade A)', volumeTons: 25.0, supplier: 'Bhopal Farmer Cluster', ratePerTon: 34000, fulfillment: '85%', status: 'In Transit' },
        { id: 'cnt_102', commodity: 'Processing Tomatoes', volumeTons: 15.0, supplier: 'Vidisha Organic Hub', ratePerTon: 24000, fulfillment: '100%', status: 'Completed' },
        { id: 'cnt_103', commodity: 'Yellow Soya Bean', volumeTons: 20.0, supplier: 'Sehore Growers Co-op', ratePerTon: 42000, fulfillment: '40%', status: 'Scheduled' }
      ],
      marketBulkRequests: [
        { rfqId: 'RFQ-882', item: 'Onions (Red)', quantityRequired: '10 Metric Tons', targetPrice: '₹22/kg', quotesReceived: 4 }
      ]
    }
  });
});

module.exports = router;
