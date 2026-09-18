const express = require('express');
const router = express.Router();
const ivrService = require('../services/ivrService');

// Toll-free info & IVR menu
router.get('/status', (req, res) => {
  res.json({
    success: true,
    serviceNumber: ivrService.getTollFreeNumber(),
    menu: ivrService.getMenu(),
    isSimulation: true,
    provider: 'Exotel / Twilio Telephony Abstraction'
  });
});

// Receive missed call from farmer
router.post('/missed-call', (req, res) => {
  const { farmerPhone, farmerId } = req.body;
  const result = ivrService.triggerMissedCall({
    farmerPhone: farmerPhone || '+91 98260 12345',
    farmerId: farmerId || 'farmer@agrobridge.demo'
  });
  res.json(result);
});

// Initiate automated callback
router.post('/callback', (req, res) => {
  const { sessionId } = req.body;
  res.json({
    success: true,
    sessionId: sessionId || 'ivr_' + Date.now(),
    callStatus: 'ON_CALL',
    message: 'Callback connected. Playing IVR main menu in Hindi & English.'
  });
});

// Process keypad selection (DTMF option 1 to 5)
router.post('/select-option', (req, res) => {
  const { sessionId, option, language } = req.body;
  const result = ivrService.handleOptionSelect({
    sessionId,
    option: option || '1',
    language: language || 'hi'
  });
  res.json(result);
});

// Retrieve call history log
router.get('/history', (req, res) => {
  const farmerId = req.query.farmerId || 'farmer@agrobridge.demo';
  const history = ivrService.getCallHistory(farmerId);
  res.json({ success: true, history, count: history.length });
});

module.exports = router;
