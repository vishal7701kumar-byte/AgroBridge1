const mongoose = require('mongoose');

const weatherSnapshotSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  region: {
    type: String,
    required: true
  },
  currentCondition: {
    type: String,
    default: 'Rainy'
  },
  temperatureC: {
    type: Number,
    default: 26.5
  },
  rainProbabilityPct: {
    type: Number,
    default: 85
  },
  humidityPct: {
    type: Number,
    default: 88
  },
  windSpeedKmh: {
    type: Number,
    default: 14
  },
  advisory: {
    type: String,
    default: 'Monsoon rains active across Bhopal agri-corridor. Harvest quick-drying vegetables promptly.'
  },
  sevenDayForecast: {
    type: Array,
    default: []
  },
  isDemoData: {
    type: Boolean,
    default: true
  },
  recordedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.models.WeatherSnapshot || mongoose.model('WeatherSnapshot', weatherSnapshotSchema);
