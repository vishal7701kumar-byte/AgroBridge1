const mongoose = require('mongoose');

const whatsAppNotificationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  farmerId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'ORDER_RECEIVED',
      'ORDER_CONFIRMED',
      'PAYMENT_RECEIVED',
      'DRIVER_ASSIGNED',
      'PICKUP_COMPLETED',
      'ORDER_DELIVERED',
      'ORDER_CANCELLED',
      'LOW_INVENTORY',
      'AI_MARKET_ALERT'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['SENT', 'DELIVERED', 'READ'],
    default: 'DELIVERED'
  },
  metadata: {
    type: Object,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.models.WhatsAppNotification || mongoose.model('WhatsAppNotification', whatsAppNotificationSchema);
