const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const userService = require('../services/userService');
const dataService = require('../services/dataService');
const financialService = require('../services/financialService');

// All routes under /api/admin/* require authentication and ADMIN role
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/dashboard-stats', async (req, res, next) => {
  try {
    const allUsers = await userService.listUsers();
    
    const roleCounts = {
      FARMER: allUsers.filter(u => u.role === 'FARMER').length,
      CONSUMER: allUsers.filter(u => u.role === 'CONSUMER').length,
      BULK_BUYER: allUsers.filter(u => u.role === 'BULK_BUYER').length,
      DRIVER: allUsers.filter(u => u.role === 'DRIVER').length,
      ADMIN: allUsers.filter(u => u.role === 'ADMIN').length
    };

    res.json({
      success: true,
      data: {
        totalUsers: allUsers.length,
        roleCounts,
        systemHealth: {
          uptimeSeconds: Math.floor(process.uptime()),
          status: 'OPERATIONAL',
          database: 'CONNECTED',
          authEngine: 'JWT-HS256',
          encryption: 'BCRYPT-10'
        },
        recentUsers: allUsers.slice(-6).reverse(),
        auditLog: [
          { timestamp: new Date().toISOString(), event: 'Admin Session Authenticated', role: 'ADMIN', ip: req.ip || '127.0.0.1' },
          { timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), event: 'Role Validation Enforced', detail: 'Cross-role mismatch blocked safely', severity: 'INFO' },
          { timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), event: 'Demo Accounts Verified', detail: '5 Primary Roles Active', severity: 'SUCCESS' }
        ]
      }
    });
  } catch (err) {
    next(err);
  }
});

// =============================================================
// ADMIN FARMER MANAGEMENT & COMPLAINT ACTION SYSTEM
// =============================================================

// List all registered farmers with metrics, status & risk insight
router.get('/farmers', async (req, res, next) => {
  try {
    const list = dataService.getAdminFarmersList();
    res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (err) {
    next(err);
  }
});

// Get detailed farmer dossier profile
router.get('/farmers/:id', async (req, res, next) => {
  try {
    const profile = dataService.getAdminFarmerProfile(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Farmer profile not found' });
    }
    res.json({
      success: true,
      data: profile
    });
  } catch (err) {
    next(err);
  }
});

// Get farmer complaints
router.get('/farmers/:id/complaints', async (req, res, next) => {
  try {
    const complaints = dataService.getFarmerComplaints(req.params.id);
    res.json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (err) {
    next(err);
  }
});

// Get AI Risk insight for a farmer
router.get('/farmers/:id/risk', async (req, res, next) => {
  try {
    const risk = dataService.calculateFarmerRiskInsight(req.params.id);
    res.json({
      success: true,
      data: risk
    });
  } catch (err) {
    next(err);
  }
});

// Update farmer status (WARNING, UNDER_REVIEW, TEMPORARILY_UNLISTED, SUSPENDED, BANNED)
router.put('/farmers/:id/status', async (req, res, next) => {
  try {
    const { status, reason, duration, notes, complaintIds } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const dsResult = dataService.updateFarmerAccountStatus(req.params.id, {
      status,
      reason,
      duration,
      notes,
      complaintIds,
      adminUser: req.user
    });

    try {
      await userService.updateFarmerStatus(req.params.id, { status, reason, duration, notes });
    } catch (e) {
      // Non-fatal
    }

    res.json({
      success: true,
      message: `Farmer status updated to ${status}`,
      data: dsResult
    });
  } catch (err) {
    next(err);
  }
});

// Restore farmer to ACTIVE
router.put('/farmers/:id/restore', async (req, res, next) => {
  try {
    const { notes } = req.body;
    const dsResult = dataService.restoreFarmerStatus(req.params.id, {
      adminUser: req.user,
      notes
    });

    try {
      await userService.restoreFarmer(req.params.id, notes);
    } catch (e) {}

    res.json({
      success: true,
      message: 'Farmer account restored to Active status and products relisted',
      data: dsResult
    });
  } catch (err) {
    next(err);
  }
});

// Admin views all complaints
router.get('/complaints', (req, res, next) => {
  try {
    const list = dataService.getAllComplaints(req.query);
    res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (err) {
    next(err);
  }
});

// Admin reviews complaint (decision: VALID / INVALID / NEED_MORE_INFO, severity: LOW / MEDIUM / HIGH / CRITICAL)
router.put('/complaints/:id/review', (req, res, next) => {
  try {
    const { decision, severity, adminNotes } = req.body;
    const result = dataService.adminReviewComplaint(req.params.id, {
      decision,
      severity,
      adminNotes,
      adminUser: req.user
    });

    if (!result.success) {
      return res.status(result.code || 400).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      message: `Complaint marked as ${decision} with severity ${result.complaint.severity}`,
      data: result.complaint
    });
  } catch (err) {
    next(err);
  }
});

// Complaint Analytics & Trends
router.get('/complaint-analytics', (req, res, next) => {
  try {
    const analytics = dataService.getComplaintAnalytics();
    res.json({
      success: true,
      data: analytics
    });
  } catch (err) {
    next(err);
  }
});

// Admin Audit Logs
router.get('/audit-logs', (req, res, next) => {
  try {
    const logs = dataService.getAdminAuditLogs(req.query);
    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err) {
    next(err);
  }
});

// =============================================================================
// ADMIN PLATFORM REVENUE & FINANCIAL ANALYTICS APIS
// =============================================================================

// GET /api/admin/revenue-summary
router.get('/revenue-summary', (req, res) => {
  try {
    const summary = financialService.getAdminRevenueSummary();
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/revenue-trend
router.get('/revenue-trend', (req, res) => {
  try {
    const filter = req.query.filter || '3-months';
    const trend = financialService.getAdminRevenueTrend(filter);
    res.json({ success: true, data: trend });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/revenue-by-category
router.get('/revenue-by-category', (req, res) => {
  try {
    const categories = financialService.getAdminRevenueByCategory();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/revenue-by-user-type
router.get('/revenue-by-user-type', (req, res) => {
  try {
    const userTypes = financialService.getAdminRevenueByUserType();
    res.json({ success: true, data: userTypes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/top-farmers
router.get('/top-farmers', (req, res) => {
  try {
    const farmers = financialService.getAdminTopFarmers();
    res.json({ success: true, data: farmers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/top-products
router.get('/top-products', (req, res) => {
  try {
    const products = financialService.getAdminTopProducts();
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/delivery-financials
router.get('/delivery-financials', (req, res) => {
  try {
    const delivery = financialService.getAdminDeliveryFinancials();
    res.json({ success: true, data: delivery });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/refund-analytics
router.get('/refund-analytics', (req, res) => {
  try {
    const refunds = financialService.getAdminRefundAnalytics();
    res.json({ success: true, data: refunds });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/expenses (Operating Costs)
router.get('/expenses', (req, res) => {
  try {
    const expenses = financialService.getPlatformExpenses(req.query);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/expenses
router.post('/expenses', (req, res) => {
  try {
    const { expenseName, category, amount, date, notes } = req.body;
    if (!expenseName || amount === undefined || isNaN(amount)) {
      return res.status(400).json({ success: false, error: 'Expense name and valid amount are required' });
    }
    const created = financialService.addPlatformExpense({ expenseName, category, amount, date, notes });
    res.status(201).json({ success: true, message: 'Platform expense recorded', data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/expenses/:id
router.put('/expenses/:id', (req, res) => {
  try {
    const updated = financialService.updatePlatformExpense(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Platform expense not found' });
    }
    res.json({ success: true, message: 'Platform expense updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/expenses/:id
router.delete('/expenses/:id', (req, res) => {
  try {
    const deleted = financialService.deletePlatformExpense(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Platform expense not found' });
    }
    res.json({ success: true, message: 'Platform expense removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/revenue/transactions
router.get('/revenue/transactions', (req, res) => {
  try {
    const transactions = financialService.getAdminTransactions(req.query);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/report/csv
router.get('/report/csv', (req, res) => {
  try {
    const period = req.query.period || 'September 2026';
    const csvContent = financialService.generateAdminRevenueReportCSV(period);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="AgroBridge_Platform_Revenue_Report_${period.replace(/\s+/g, '_')}.csv"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/ai-insights
router.get('/ai-insights', (req, res) => {
  try {
    const insights = financialService.getAdminAIInsights();
    res.json({ success: true, data: insights });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
