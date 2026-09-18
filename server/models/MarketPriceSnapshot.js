const mongoose = require('mongoose');

/**
 * MarketPriceSnapshot Schema
 * 
 * Standalone collection for storing Government of India (data.gov.in / Agmarknet)
 * mandi market price snapshots.
 * 
 * STRICT ARCHITECTURAL RULE:
 * This collection is kept strictly separate from farmer product listings.
 * Farmer selling prices are never overwritten by government reference prices.
 */
const marketPriceSnapshotSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true
  },
  commodity: {
    type: String,
    required: true,
    index: true
  },
  variety: {
    type: String,
    default: 'FAQ'
  },
  grade: {
    type: String,
    default: 'FAQ'
  },
  state: {
    type: String,
    required: true,
    index: true
  },
  district: {
    type: String,
    index: true
  },
  market: {
    type: String,
    required: true,
    index: true
  },
  arrivalDate: {
    type: String,
    required: true
  },
  minimumPrice: {
    type: Number,
    required: true
  },
  maximumPrice: {
    type: Number,
    required: true
  },
  modalPrice: {
    type: Number,
    required: true
  },
  priceUnit: {
    type: String,
    default: '₹/quintal'
  },
  modalPricePerKg: {
    type: Number
  },
  minPricePerKg: {
    type: Number
  },
  maxPricePerKg: {
    type: Number
  },
  source: {
    type: String,
    default: 'Government of India OGD Platform'
  },
  sourceDataset: {
    type: String,
    default: 'Current Daily Price of Various Commodities from Various Markets (Mandi)'
  },
  resourceId: {
    type: String,
    default: '9ef84268-d588-465a-a308-a864a43d0070'
  },
  sourceDate: {
    type: String
  },
  fetchedAt: {
    type: Date,
    default: Date.now
  },
  filters: {
    commodity: String,
    state: String,
    district: String,
    market: String
  },
  isGovernmentData: {
    type: Boolean,
    default: true
  },
  cacheKey: {
    type: String,
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.MarketPriceSnapshot || mongoose.model('MarketPriceSnapshot', marketPriceSnapshotSchema);
