const express = require('express');
const router = express.Router();
const govMandiService = require('../services/govMandiService');

// Get all normalized government mandi prices
router.get('/prices', (req, res) => {
  try {
    const { commodity, state, market } = req.query;
    const prices = govMandiService.getAllNormalizedMandiPrices({ commodity, state, market });
    
    res.json({
      success: true,
      count: prices.length,
      source: 'Government of India (data.gov.in / Agmarknet)',
      resourceId: govMandiService.RESOURCE_ID,
      data: prices
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Mandi Benchmark for specific commodity
router.get('/commodity/:name', (req, res) => {
  try {
    const { district, state } = req.query;
    const benchmark = govMandiService.getCommodityMandiBenchmark(req.params.name, district, state);
    res.json({
      success: true,
      data: benchmark
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Force refresh government data if API key configured
router.post('/refresh', async (req, res) => {
  try {
    const { commodity, state, market, limit } = req.body;
    const result = await govMandiService.fetchFromGovAPI({ commodity, state, market, limit });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Integration health and cache status
router.get('/status', (req, res) => {
  try {
    const status = govMandiService.getStatus();
    res.json({ success: true, data: status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
