const mongoose = require('mongoose');

const whatsAppUserSchema = new mongoose.Schema({
  farmerId: {
    type: String,
    required: true,
    index: true
  },
  farmerName: {
    type: String,
    default: 'Farmer Partner'
  },
  whatsappNumber: {
    type: String,
    required: true
  },
  isLinked: {
    type: Boolean,
    default: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  notificationPreferences: {
    orderUpdates: { type: Boolean, default: true },
    paymentUpdates: { type: Boolean, default: true },
    driverUpdates: { type: Boolean, default: true },
    aiAlerts: { type: Boolean, default: true },
    inventoryAlerts: { type: Boolean, default: true }
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.models.WhatsAppUser || mongoose.model('WhatsAppUser', whatsAppUserSchema);
