const mongoose = require('mongoose');

const festivalCampaignSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  festivalName: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  region: {
    type: String,
    default: 'Madhya Pradesh (Central Agri-Belt)'
  },
  productCategories: {
    type: [String],
    default: ['Vegetables', 'Fruits', 'Spices']
  },
  offerPercentage: {
    type: Number,
    default: 12
  },
  campaignStatus: {
    type: String,
    enum: ['ACTIVE', 'SCHEDULED', 'PAUSED', 'COMPLETED'],
    default: 'ACTIVE'
  },
  targetAudience: {
    type: String,
    enum: ['CONSUMER', 'BULK_BUYER', 'BOTH'],
    default: 'BOTH'
  },
  triggerType: {
    type: String,
    enum: ['FESTIVAL', 'SEASON', 'WEATHER', 'DEMAND_TREND', 'INVENTORY'],
    default: 'FESTIVAL'
  },
  bannerImageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600'
  },
  description: {
    type: String,
    default: 'Special festive farm harvest pricing directly from producers'
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  revenueGenerated: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.models.FestivalCampaign || mongoose.model('FestivalCampaign', festivalCampaignSchema);
