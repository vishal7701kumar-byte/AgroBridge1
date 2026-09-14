const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const dataService = require('../services/dataService');
const financialService = require('../services/financialService');

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

// SIH Feature 9: Waste Reduction Alerts
router.get('/waste-alerts', (req, res) => {
  const farmerId = req.user?.email || 'farmer@agrobridge.demo';
  const alerts = dataService.getWasteAlerts(farmerId);
  res.json({ success: true, data: alerts });
});

router.post('/notify-bulk-buyers', (req, res) => {
  const { cropId, discountedPrice } = req.body;
  const farmerId = req.user?.email || 'farmer@agrobridge.demo';
  const result = dataService.notifyBulkBuyersDiscount({ cropId, farmerId, discountedPrice });
  res.json({ success: true, data: result });
});

// =============================================================================
// FARMER FINANCIAL ANALYTICS & EXPENSE MANAGEMENT APIS
// =============================================================================

// GET /api/farmer/financial-summary
router.get('/financial-summary', (req, res) => {
  try {
    const farmerId = req.user?.email || 'farmer@agrobridge.demo';
    const summary = financialService.getFarmerFinancialSummary(farmerId);
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/farmer/monthly-profit
router.get('/monthly-profit', (req, res) => {
  try {
    const farmerId = req.user?.email || 'farmer@agrobridge.demo';
    const filter = req.query.filter || '3-months';
    const profitData = financialService.getFarmerMonthlyProfit(farmerId, filter);
    res.json({ success: true, data: profitData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/farmer/product-profit
router.get('/product-profit', (req, res) => {
  try {
    const farmerId = req.user?.email || 'farmer@agrobridge.demo';
    const productProfit = financialService.getFarmerProductProfit(farmerId);
    res.json({ success: true, data: productProfit });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/farmer/expenses
router.get('/expenses', (req, res) => {
  try {
    const farmerId = req.user?.email || 'farmer@agrobridge.demo';
    const expenses = financialService.getFarmerExpenses(farmerId, req.query);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/farmer/expenses
router.post('/expenses', (req, res) => {
  try {
    const farmerId = req.user?.email || 'farmer@agrobridge.demo';
    const { expenseName, category, amount, date, notes } = req.body;

    if (!expenseName || amount === undefined || isNaN(amount)) {
      return res.status(400).json({ success: false, error: 'Expense name and valid amount are required' });
    }

    const created = financialService.addFarmerExpense(farmerId, { expenseName, category, amount, date, notes });
    res.status(201).json({ success: true, message: 'Expense added successfully', data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/farmer/expenses/:id
router.put('/expenses/:id', (req, res) => {
  try {
    const farmerId = req.user?.email || 'farmer@agrobridge.demo';
    const updated = financialService.updateFarmerExpense(farmerId, req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Expense not found or unauthorized' });
    }
    res.json({ success: true, message: 'Expense updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/farmer/expenses/:id
router.delete('/expenses/:id', (req, res) => {
  try {
    const farmerId = req.user?.email || 'farmer@agrobridge.demo';
    const deleted = financialService.deleteFarmerExpense(farmerId, req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Expense not found or unauthorized' });
    }
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/farmer/report/csv
router.get('/report/csv', (req, res) => {
  try {
    const farmerId = req.user?.email || 'farmer@agrobridge.demo';
    const month = req.query.month || 'September 2026';
    const csvContent = financialService.generateFarmerFinancialReportCSV(farmerId, month);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="AgroBridge_Farmer_Report_${month.replace(/\s+/g, '_')}.csv"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
