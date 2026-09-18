const mongoose = require('mongoose');

const ivrRequestSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  farmerPhone: {
    type: String,
    required: true
  },
  farmerId: {
    type: String,
    default: 'farmer@agrobridge.demo'
  },
  serviceNumber: {
    type: String,
    default: '1800-AGRO-BRIDGE (1800-247-6274)'
  },
  callDirection: {
    type: String,
    enum: ['MISSED_CALL', 'CALLBACK'],
    default: 'MISSED_CALL'
  },
  callStatus: {
    type: String,
    enum: [
      'MISSED_CALL_RECEIVED',
      'CALLBACK_INITIATED',
      'ON_CALL',
      'COMPLETED',
      'FAILED'
    ],
    default: 'MISSED_CALL_RECEIVED'
  },
  selectedOption: {
    type: String,
    enum: ['1', '2', '3', '4', '5', null],
    default: null
  },
  selectedOptionLabel: {
    type: String,
    default: null
  },
  voiceResponseText: {
    type: String,
    default: ''
  },
  durationSeconds: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.models.IVRRequest || mongoose.model('IVRRequest', ivrRequestSchema);
