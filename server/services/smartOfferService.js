/**
 * AgroBridge AI Smart Offers & Demand Forecasting Engine
 * Produces weather-aware, seasonal, and festival-driven promotional deals for Consumers
 * and Bulk Buyers. Includes configurable Festival Campaign management for Admin.
 */

const crypto = require('crypto');

// 1. Regional Weather Snapshots (Bhopal / Central India Agri Belt)
let weatherSnapshot = {
  id: 'wth_bhopal_central',
  region: 'Bhopal & Sehore Agri-Corridor',
  currentCondition: 'Rainy & Humid',
  icon: '🌧️',
  temperatureC: 27.2,
  rainProbabilityPct: 82,
  humidityPct: 86,
  windSpeedKmh: 14.5,
  advisory: 'Active monsoon showers across Malwa-Bhopal belt. High humidity increases demand for fresh farm harvest over stored inventory.',
  isDemoData: true,
  recordedAt: new Date().toISOString(),
  sevenDayForecast: [
    { day: 'Mon', temp: 27, condition: 'Heavy Rain', icon: '🌧️', rainProb: 85 },
    { day: 'Tue', temp: 28, condition: 'Light Showers', icon: '🌦️', rainProb: 65 },
    { day: 'Wed', temp: 29, condition: 'Cloudy', icon: '☁️', rainProb: 40 },
    { day: 'Thu', temp: 30, condition: 'Partly Sunny', icon: '⛅', rainProb: 30 },
    { day: 'Fri', temp: 28, condition: 'Thunderstorm', icon: '⛈️', rainProb: 80 },
    { day: 'Sat', temp: 27, condition: 'Showers', icon: '🌧️', rainProb: 75 },
    { day: 'Sun', temp: 29, condition: 'Clear Skies', icon: '🌤️', rainProb: 25 }
  ]
};

// 2. Configurable Festival Calendar & Campaigns
let festivalCampaigns = [
  {
    id: 'camp_fest_1',
    festivalName: 'Diwali Mahotsav Agri Festival',
    date: '2026-11-01',
    region: 'Central India (MP, Maharashtra, Gujarat)',
    productCategories: ['Vegetables', 'Fruits', 'Spices'],
    offerPercentage: 15,
    campaignStatus: 'ACTIVE',
    targetAudience: 'BOTH',
    triggerType: 'FESTIVAL',
    bannerImageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
    description: 'Special festive farm harvest pricing directly from verified smallholder farmers.',
    totalOrders: 184,
    revenueGenerated: 245000,
    createdAt: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'camp_fest_2',
    festivalName: 'Navratri Fresh Fruit & Puja Basket',
    date: '2026-10-12',
    region: 'All Regions',
    productCategories: ['Fruits', 'Dairy', 'Organic'],
    offerPercentage: 12,
    campaignStatus: 'SCHEDULED',
    targetAudience: 'CONSUMER',
    triggerType: 'FESTIVAL',
    bannerImageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800',
    description: 'Direct farm-fresh fruit baskets and dairy essentials for fasting and celebrations.',
    totalOrders: 92,
    revenueGenerated: 115000,
    createdAt: '2026-09-05T12:00:00.000Z'
  },
  {
    id: 'camp_fest_3',
    festivalName: 'Monsoon Harvest Vegetable Drive',
    date: '2026-09-15',
    region: 'Bhopal, Indore, Raisen',
    productCategories: ['Vegetables'],
    offerPercentage: 10,
    campaignStatus: 'ACTIVE',
    targetAudience: 'CONSUMER',
    triggerType: 'WEATHER',
    bannerImageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800',
    description: 'Weather-optimized fresh farm vegetables harvested within 12 hours of delivery.',
    totalOrders: 312,
    revenueGenerated: 380000,
    createdAt: '2026-09-10T09:00:00.000Z'
  }
];

// 3. AI Smart Offers Catalog for Consumers
let consumerSmartOffers = [
  {
    id: 'c_offer_1',
    title: 'Rainy Week Essentials Basket',
    type: 'WEATHER',
    badgeText: '🌦️ Weather-Based Offer',
    productId: 'prod_1',
    productName: 'Organic Hybrid Tomatoes',
    category: 'Vegetables',
    originalPrice: 32,
    offerPrice: 28,
    discountPercentage: 12.5,
    farmerId: 'farmer@agrobridge.demo',
    farmerName: 'Ramesh Patel',
    farmerLocation: 'Berasia Road, Bhopal',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600',
    moqKg: 1,
    availableQtyKg: 450,
    reason: 'AI-assisted weather forecast: High monsoon humidity increases demand for quick-drying fresh farm tomatoes.',
    validUntil: '2026-09-24T23:59:59.000Z',
    isActive: true
  },
  {
    id: 'c_offer_2',
    title: 'Monsoon Fresh Green Produce',
    type: 'SEASONAL',
    badgeText: '🌾 Seasonal Harvest Special',
    productId: 'prod_2',
    productName: 'Fresh Chandramukhi Potatoes',
    category: 'Vegetables',
    originalPrice: 24,
    offerPrice: 20,
    discountPercentage: 16.7,
    farmerId: 'suresh@agrobridge.demo',
    farmerName: 'Suresh Patel',
    farmerLocation: 'Hoshangabad Agro Belt',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600',
    moqKg: 2,
    availableQtyKg: 600,
    reason: 'AI seasonal recommendation: Peak harvest yield from Narmada basin with zero intermediary storage cost.',
    validUntil: '2026-09-26T23:59:59.000Z',
    isActive: true
  },
  {
    id: 'c_offer_3',
    title: 'Festival Fresh Kitchen Basket',
    type: 'FESTIVAL',
    badgeText: '🎉 Festival Special',
    productId: 'prod_3',
    productName: 'Nasik Red Onions (Premium Lot)',
    category: 'Vegetables',
    originalPrice: 28,
    offerPrice: 24,
    discountPercentage: 14.3,
    farmerId: 'amit@agrobridge.demo',
    farmerName: 'Amit Verma',
    farmerLocation: 'Sehore Organic Cooperative',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600',
    moqKg: 2,
    availableQtyKg: 500,
    reason: 'Upcoming festive demand surge. Direct farm pickup bundled for maximum consumer grocery savings.',
    validUntil: '2026-09-30T23:59:59.000Z',
    isActive: true
  },
  {
    id: 'c_offer_4',
    title: 'Personalized Kitchen Pick',
    type: 'AI_RECOMMENDED',
    badgeText: '🤖 AI Recommendation',
    productId: 'prod_4',
    productName: 'Fresh Shimla Green Apples',
    category: 'Fruits',
    originalPrice: 120,
    offerPrice: 105,
    discountPercentage: 12.5,
    farmerId: 'anita@agrobridge.demo',
    farmerName: 'Anita Sharma',
    farmerLocation: 'Kullu Orchard Partner',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600',
    moqKg: 1,
    availableQtyKg: 200,
    reason: 'Based on your previous fresh basket orders, sweet crisp Grade A apples are highly recommended.',
    validUntil: '2026-09-25T23:59:59.000Z',
    isActive: true
  }
];

// 4. Bulk Buyer Smart Offers & Wholesale Alerts
let bulkBuyerOffers = [
  {
    id: 'b_offer_1',
    productName: 'Nasik Red Onions (Wholesale Lot)',
    category: 'Vegetables',
    moqKg: 250,
    availableQtyKg: 3500,
    farmerPrice: 21,
    marketRefPrice: 26,
    bulkDiscountPct: 15,
    estimatedDelivery: 'Within 18 Hours',
    demandAlert: 'AI-Assisted Bulk Demand Alert: Festival demand for onions is showing an increasing trend (+28%).',
    suggestedAction: 'Consider reviewing your bulk requirement before prices adjust.',
    farmerName: 'Amit Verma & Sehore FPO',
    farmerLocation: 'Sehore, MP',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600',
    isActive: true
  },
  {
    id: 'b_offer_2',
    productName: 'Organic Hybrid Tomatoes (Crate Grade A)',
    category: 'Vegetables',
    moqKg: 200,
    availableQtyKg: 2800,
    farmerPrice: 24,
    marketRefPrice: 30,
    bulkDiscountPct: 12,
    estimatedDelivery: 'Within 12 Hours',
    demandAlert: 'AI-Assisted Demand Alert: Tomato volume absorption rising in commercial hospitality sector.',
    suggestedAction: 'Lock in minimum safe price floor with direct farm contract.',
    farmerName: 'Patel Organic Farms',
    farmerLocation: 'Berasia, Bhopal',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600',
    isActive: true
  },
  {
    id: 'b_offer_3',
    productName: 'Fresh Chandramukhi Potatoes (Bulk Sacks)',
    category: 'Vegetables',
    moqKg: 500,
    availableQtyKg: 8000,
    farmerPrice: 17,
    marketRefPrice: 22,
    bulkDiscountPct: 10,
    estimatedDelivery: 'Within 24 Hours',
    demandAlert: 'AI-Assisted Demand Alert: High cold-storage demand ahead of festival confectionery manufacturing.',
    suggestedAction: 'Request bulk quotation to secure priority freight transit.',
    farmerName: 'Suresh Patel (Narmada Valley)',
    farmerLocation: 'Hoshangabad, MP',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600',
    isActive: true
  }
];

class SmartOfferService {
  getWeather() {
    return weatherSnapshot;
  }

  getFestivals() {
    return festivalCampaigns;
  }

  getConsumerSmartOffers() {
    return consumerSmartOffers.filter(o => o.isActive);
  }

  getBulkBuyerSmartOffers() {
    return bulkBuyerOffers.filter(o => o.isActive);
  }

  getAIForecast({ crop = 'Tomato', season = 'Monsoon', region = 'Bhopal' }) {
    const scores = {
      'Tomato': { score: 84, trend: 'High demand trend', offer: '8% seasonal offer', reason: 'Monsoon rain impact + regional culinary demand spike', conf: 0.82 },
      'Onion': { score: 88, trend: 'Surging demand trend', offer: '12% festival pre-order offer', reason: 'Upcoming festival season + retail supply shrinkage', conf: 0.86 },
      'Potato': { score: 76, trend: 'Moderate-high demand trend', offer: '10% volume discount', reason: 'Cold-storage offloading + steady consumer consumption', conf: 0.79 },
      'Apple': { score: 81, trend: 'High seasonal demand', offer: '10% fresh arrival discount', reason: 'Fresh northern orchard harvest arrivals', conf: 0.84 }
    };

    const target = scores[crop] || {
      score: 75,
      trend: 'Estimated steady demand trend',
      offer: '5% seasonal offer',
      reason: 'Based on available historical mandi data and weather conditions',
      conf: 0.75
    };

    return {
      product: crop,
      category: 'Agricultural Produce',
      region: region || 'Central MP',
      demandScore: target.score,
      recommendation: target.trend,
      suggestedOffer: target.offer,
      reason: target.reason,
      confidence: target.conf,
      forecastPeriod: 'Next 7 to 14 Days',
      season: season || 'Monsoon',
      disclaimer: 'AI-assisted decision support. Not a guaranteed forecast. Based on available market and weather data.'
    };
  }

  // Admin Campaign Management
  createCampaign(campaignData) {
    const newCamp = {
      id: 'camp_' + Date.now(),
      festivalName: campaignData.festivalName || 'New Seasonal Campaign',
      date: campaignData.date || new Date().toISOString().split('T')[0],
      region: campaignData.region || 'Madhya Pradesh',
      productCategories: campaignData.productCategories || ['Vegetables'],
      offerPercentage: parseFloat(campaignData.offerPercentage) || 10,
      campaignStatus: campaignData.campaignStatus || 'ACTIVE',
      targetAudience: campaignData.targetAudience || 'BOTH',
      triggerType: campaignData.triggerType || 'FESTIVAL',
      bannerImageUrl: campaignData.bannerImageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
      description: campaignData.description || 'Special farm offer directly from growers',
      totalOrders: 0,
      revenueGenerated: 0,
      createdAt: new Date().toISOString()
    };
    festivalCampaigns.unshift(newCamp);
    return { success: true, campaign: newCamp };
  }

  updateCampaign(id, updateData) {
    const idx = festivalCampaigns.findIndex(c => c.id === id);
    if (idx === -1) return { success: false, message: 'Campaign not found' };
    festivalCampaigns[idx] = {
      ...festivalCampaigns[idx],
      ...updateData
    };
    return { success: true, campaign: festivalCampaigns[idx] };
  }

  deleteCampaign(id) {
    const idx = festivalCampaigns.findIndex(c => c.id === id);
    if (idx === -1) return { success: false, message: 'Campaign not found' };
    const removed = festivalCampaigns.splice(idx, 1);
    return { success: true, campaign: removed[0] };
  }

  getAIIntelligenceDashboard() {
    return {
      kpiSummary: {
        totalActiveOffers: consumerSmartOffers.length + bulkBuyerOffers.length,
        consumerOffersCount: consumerSmartOffers.length,
        bulkBuyerOffersCount: bulkBuyerOffers.length,
        festivalCampaignsCount: festivalCampaigns.filter(c => c.triggerType === 'FESTIVAL').length,
        seasonalCampaignsCount: festivalCampaigns.filter(c => c.triggerType === 'SEASON').length,
        weatherCampaignsCount: festivalCampaigns.filter(c => c.triggerType === 'WEATHER').length,
        avgDiscountPct: 12.8,
        conversionRatePct: 24.6
      },
      demandTrends: [
        { crop: 'Tomato', demandScore: 84, trend: '+28%', projectedVolKg: 12500 },
        { crop: 'Onion', demandScore: 88, trend: '+34%', projectedVolKg: 18000 },
        { crop: 'Potato', demandScore: 76, trend: '+14%', projectedVolKg: 14000 },
        { crop: 'Apple', demandScore: 81, trend: '+22%', projectedVolKg: 6200 },
        { crop: 'Garlic', demandScore: 79, trend: '+18%', projectedVolKg: 3100 }
      ],
      regionalDemandBreakdown: [
        { region: 'Bhopal Urban & Suburbs', sharePct: 38, activeDemandLevel: 'Very High' },
        { region: 'Indore Commercial Hub', sharePct: 32, activeDemandLevel: 'High' },
        { region: 'Sehore & Raisen Agri-Belt', sharePct: 18, activeDemandLevel: 'Moderate' },
        { region: 'Hoshangabad River Basin', sharePct: 12, activeDemandLevel: 'Moderate' }
      ],
      campaigns: festivalCampaigns,
      weather: weatherSnapshot
    };
  }
}

module.exports = new SmartOfferService();
