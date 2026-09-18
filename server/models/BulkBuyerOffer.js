const mongoose = require('mongoose');

const bulkBuyerOfferSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  productName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'Vegetables'
  },
  moqKg: {
    type: Number,
    required: true
  },
  availableQtyKg: {
    type: Number,
    required: true
  },
  farmerPrice: {
    type: Number,
    required: true
  },
  marketRefPrice: {
    type: Number,
    required: true
  },
  bulkDiscountPct: {
    type: Number,
    default: 10
  },
  estimatedDelivery: {
    type: String,
    default: 'Within 24 Hours'
  },
  demandAlert: {
    type: String,
    default: 'High seasonal demand trend'
  },
  suggestedAction: {
    type: String,
    default: 'Consider reviewing your bulk requirement.'
  },
  farmerName: {
    type: String,
    default: 'Patel Organic Farms'
  },
  farmerLocation: {
    type: String,
    default: 'Berasia, Bhopal'
  },
  image: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.models.BulkBuyerOffer || mongoose.model('BulkBuyerOffer', bulkBuyerOfferSchema);
