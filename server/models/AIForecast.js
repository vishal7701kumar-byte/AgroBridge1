const mongoose = require('mongoose');

const aiForecastSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  product: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'Vegetables'
  },
  demandScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  recommendation: {
    type: String,
    required: true
  },
  suggestedOffer: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.8
  },
  forecastPeriod: {
    type: String,
    default: 'Next 7 Days'
  },
  season: {
    type: String,
    default: 'Monsoon'
  },
  weatherImpact: {
    type: String,
    default: 'High humidity & rainfall increasing demand for fresh farm harvest'
  },
  festivalImpact: {
    type: String,
    default: 'Festive season demand spike anticipated'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.models.AIForecast || mongoose.model('AIForecast', aiForecastSchema);
