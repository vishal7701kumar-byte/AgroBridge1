const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');

// Link / update WhatsApp number & preferences
router.post('/connect', (req, res) => {
  const farmerId = req.user ? req.user.email : (req.body.farmerId || 'farmer@agrobridge.demo');
  const { whatsappNumber, notificationPreferences, farmerName } = req.body;

  if (!whatsappNumber) {
    return res.status(400).json({ success: false, message: 'WhatsApp number is required' });
  }

  const result = whatsappService.connectNumber(farmerId, {
    whatsappNumber,
    notificationPreferences,
    farmerName
  });

  res.json(result);
});

// Check WhatsApp connection status & profile
router.get('/status', (req, res) => {
  const farmerId = req.user ? req.user.email : (req.query.farmerId || 'farmer@agrobridge.demo');
  const profile = whatsappService.getProfile(farmerId);
  res.json({ success: true, profile, isSimulation: true });
});

// Fetch WhatsApp notification history
router.get('/notifications', (req, res) => {
  const farmerId = req.user ? req.user.email : (req.query.farmerId || 'farmer@agrobridge.demo');
  const notifications = whatsappService.getNotifications(farmerId);
  res.json({ success: true, notifications, count: notifications.length });
});

// Send test notification
router.post('/test', (req, res) => {
  const farmerId = req.user ? req.user.email : (req.body.farmerId || 'farmer@agrobridge.demo');
  const result = whatsappService.sendTestNotification(farmerId);
  res.json(result);
});

// Send command to WhatsApp Bot Simulator
router.post('/command', (req, res) => {
  const farmerId = req.user ? req.user.email : (req.body.farmerId || 'farmer@agrobridge.demo');
  const { command } = req.body;

  if (!command) {
    return res.status(400).json({ success: false, message: 'Command is required' });
  }

  const result = whatsappService.processCommand(farmerId, command);
  res.json(result);
});

module.exports = router;
