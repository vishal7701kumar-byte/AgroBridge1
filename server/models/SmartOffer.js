const mongoose = require('mongoose');

const smartOfferSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['WEATHER', 'SEASONAL', 'FESTIVAL', 'AI_RECOMMENDED'],
    required: true
  },
  targetAudience: {
    type: String,
    enum: ['CONSUMER', 'BULK_BUYER', 'BOTH'],
    default: 'CONSUMER'
  },
  productId: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'Vegetables'
  },
  originalPrice: {
    type: Number,
    required: true
  },
  offerPrice: {
    type: Number,
    required: true
  },
  discountPercentage: {
    type: Number,
    required: true
  },
  farmerId: {
    type: String,
    default: 'farmer@agrobridge.demo'
  },
  farmerName: {
    type: String,
    default: 'Ramesh Patel'
  },
  farmerLocation: {
    type: String,
    default: 'Berasia Road, Bhopal'
  },
  image: {
    type: String,
    required: true
  },
  badgeText: {
    type: String,
    default: 'AI Special Offer'
  },
  moqKg: {
    type: Number,
    default: 1
  },
  availableQtyKg: {
    type: Number,
    default: 100
  },
  marketRefPrice: {
    type: Number,
    default: 0
  },
  estimatedDeliveryHours: {
    type: Number,
    default: 4
  },
  reason: {
    type: String,
    default: 'AI-assisted seasonal demand'
  },
  validUntil: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.models.SmartOffer || mongoose.model('SmartOffer', smartOfferSchema);
