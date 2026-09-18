import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT token into requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('agrobridge_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const authAPI = {
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },
  getMe: async () => {
    return await api.get('/auth/me');
  },
  logout: () => {
    localStorage.removeItem('agrobridge_token');
    localStorage.removeItem('agrobridge_user');
  }
};

export const farmerAPI = {
  getDashboard: async () => {
    return await api.get('/farmer/dashboard-stats');
  },
  listCrop: async (cropData) => {
    return await api.post('/products', cropData);
  },
  updateCrop: async (id, cropData) => {
    return await api.put(`/products/${id}`, cropData);
  },
  deleteCrop: async (id) => {
    return await api.delete(`/products/${id}`);
  },
  getMyProducts: async () => {
    return await api.get('/products');
  },
  uploadImage: async (imageData) => {
    return await api.post('/upload', imageData);
  },
  uploadProductImage: async (id, imageData) => {
    return await api.post(`/products/${id}/images`, imageData);
  },
  setPrimaryImage: async (id, indexOrUrl) => {
    return await api.put(`/products/${id}/images/primary`, typeof indexOrUrl === 'number' ? { index: indexOrUrl } : { url: indexOrUrl });
  },
  removeImage: async (id, indexOrUrl) => {
    return await api.delete(`/products/${id}/images`, { data: typeof indexOrUrl === 'number' ? { index: indexOrUrl } : { url: indexOrUrl } });
  },
  getComplaints: async () => {
    return await api.get('/farmers/complaints');
  },
  respondToComplaint: async (id, response) => {
    return await api.put(`/farmers/complaints/${id}/respond`, { response });
  },
  getMyFeedback: async (farmerId) => {
    return await api.get(`/farmers/${farmerId}/feedback`);
  },
  getBulkFeedback: async (farmerId) => {
    return await api.get(`/farmers/${farmerId}/bulk-feedback`);
  },
  getBulkOrders: async () => {
    return await api.get('/farmers/bulk-orders');
  },
  updateBulkOrderStatus: async (id, status) => {
    return await api.put(`/bulk-orders/${id}/status`, { status });
  },
  getNotifications: async () => {
    return await api.get('/notifications');
  },
  markNotificationRead: async (id) => {
    return await api.put(`/notifications/${id}/read`);
  },
  getWasteAlerts: async () => {
    return await api.get('/farmer/waste-alerts');
  },
  notifyBulkBuyersDiscount: async (payload) => {
    return await api.post('/farmer/notify-bulk-buyers', payload);
  },
  // Farmer Financial Analytics & Expense Management
  getFinancialSummary: async () => {
    return await api.get('/farmer/financial-summary');
  },
  getMonthlyProfit: async (filter = '3-months') => {
    return await api.get(`/farmer/monthly-profit?filter=${filter}`);
  },
  getProductProfit: async () => {
    return await api.get('/farmer/product-profit');
  },
  getExpenses: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return await api.get(`/farmer/expenses${q ? `?${q}` : ''}`);
  },
  addExpense: async (expenseData) => {
    return await api.post('/farmer/expenses', expenseData);
  },
  updateExpense: async (id, expenseData) => {
    return await api.put(`/farmer/expenses/${id}`, expenseData);
  },
  deleteExpense: async (id) => {
    return await api.delete(`/farmer/expenses/${id}`);
  },
  downloadFinancialReport: async (month = 'September 2026') => {
    return await api.get(`/farmer/report/csv?month=${encodeURIComponent(month)}`, { responseType: 'blob' });
  }
};

export const consumerAPI = {
  getDashboard: async () => {
    return await api.get('/consumer/dashboard-stats');
  },
  getProduceCatalog: async (category = '', search = '') => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await api.get(`/products${queryString}`);
  },
  placeOrder: async (orderData) => {
    return await api.post('/orders', orderData);
  },
  getOrders: async () => {
    return await api.get('/orders');
  },
  getOrderById: async (id) => {
    return await api.get(`/orders/${id}`);
  },
  getDeliveries: async () => {
    return await api.get('/deliveries');
  },
  getDeliveryTracking: async (id) => {
    return await api.get(`/deliveries/${id}/track`);
  },
  processDemoPayment: async (paymentData) => {
    return await api.post('/payments/demo', paymentData);
  },
  getProductById: async (id) => {
    return await api.get(`/products/${id}`);
  },
  getProductQuality: async (id) => {
    return await api.get(`/products/${id}/quality`);
  },
  getPriceComparison: async (id) => {
    return await api.get(`/products/${id}/price-comparison`);
  },
  getPriceHistory: async (id) => {
    return await api.get(`/products/${id}/price-history`);
  },
  createPriceAlert: async (id, targetPrice) => {
    return await api.post(`/products/${id}/price-alert`, { targetPrice });
  },
  getBestPricesNearYou: async () => {
    return await api.get('/products/best-prices-near-you');
  },
  submitFeedback: async (feedbackData) => {
    return await api.post('/feedback', feedbackData);
  },
  getProductFeedback: async (productId) => {
    return await api.get(`/products/${productId}/feedback`);
  },
  fileComplaint: async (complaintData) => {
    return await api.post('/complaints', complaintData);
  },
  getMyComplaints: async () => {
    return await api.get('/complaints/my');
  },
  getDigitalReceipt: async (orderId) => {
    return await api.get(`/receipt/${orderId}`);
  }
};

export const bulkBuyerAPI = {
  getDashboard: async () => {
    return await api.get('/bulk-buyer/dashboard-stats');
  },
  getRFQs: async () => {
    return await api.get('/rfqs');
  },
  createRFQ: async (rfqData) => {
    return await api.post('/rfqs', rfqData);
  },
  placeBulkOrder: async (orderData) => {
    return await api.post('/orders', orderData);
  },
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.assured) params.append('assured', 'true');
    if (filters.filter) params.append('filter', filters.filter);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await api.get(`/products${queryString}`);
  },
  createBulkOrder: async (orderData) => {
    return await api.post('/bulk-orders', orderData);
  },
  getMyBulkOrders: async () => {
    return await api.get('/bulk-orders');
  },
  getBulkOrderById: async (id) => {
    return await api.get(`/bulk-orders/${id}`);
  },
  updateBulkOrderStatus: async (id, status) => {
    return await api.put(`/bulk-orders/${id}/status`, { status });
  },
  getAIBestDeal: async (dealData) => {
    return await api.post('/ai/best-deal', dealData);
  },
  submitBulkFeedback: async (feedbackData) => {
    return await api.post('/bulk-feedback', feedbackData);
  },
  getFarmerBulkFeedback: async (farmerId) => {
    return await api.get(`/farmers/${farmerId}/bulk-feedback`);
  }
};

export const driverAPI = {
  getDashboard: async () => {
    return await api.get('/driver/dashboard-stats');
  },
  updateStatus: async (status) => {
    return await api.put('/driver/status', { status });
  },
  updateLocation: async (coords) => {
    return await api.put('/drivers/location', coords);
  },
  getDeliveries: async () => {
    return await api.get('/deliveries');
  },
  acceptDelivery: async (id) => {
    return await api.put(`/deliveries/${id}/accept`);
  },
  verifyPickup: async (id, otp) => {
    return await api.post(`/deliveries/${id}/verify-pickup`, { otp });
  },
  verifyDelivery: async (id, otp) => {
    return await api.post(`/deliveries/${id}/verify-delivery`, { otp });
  },
  updateDeliveryStatus: async (id, status) => {
    return await api.put(`/deliveries/${id}/status`, { status });
  }
};

export const adminAPI = {
  getDashboard: async () => {
    return await api.get('/admin/dashboard-stats');
  },
  getUsers: async (role = '') => {
    return await api.get(`/auth/users${role ? `?role=${role}` : ''}`);
  },
  getAllOrders: async () => {
    return await api.get('/orders');
  },
  getAllDeliveries: async () => {
    return await api.get('/deliveries');
  },
  getProductsForReview: async () => {
    return await api.get('/admin/products/quality-review');
  },
  verifyProduct: async (id, verificationData) => {
    return await api.put(`/admin/products/${id}/verify`, verificationData);
  },
  getAllComplaints: async (status = '') => {
    return await api.get(`/admin/complaints${status ? `?status=${status}` : ''}`);
  },
  updateComplaint: async (id, updateData) => {
    return await api.put(`/admin/complaints/${id}`, updateData);
  },
  // Advanced Farmer Management & Complaint Action System
  getFarmers: async () => {
    return await api.get('/admin/farmers');
  },
  getFarmerProfile: async (id) => {
    return await api.get(`/admin/farmers/${id}`);
  },
  getFarmerComplaints: async (id) => {
    return await api.get(`/admin/farmers/${id}/complaints`);
  },
  getFarmerRiskInsight: async (id) => {
    return await api.get(`/admin/farmers/${id}/risk`);
  },
  updateFarmerStatus: async (id, statusData) => {
    return await api.put(`/admin/farmers/${id}/status`, statusData);
  },
  restoreFarmer: async (id, notes = '') => {
    return await api.put(`/admin/farmers/${id}/restore`, { notes });
  },
  reviewComplaint: async (id, reviewData) => {
    return await api.put(`/admin/complaints/${id}/review`, reviewData);
  },
  getComplaintAnalytics: async () => {
    return await api.get('/admin/complaint-analytics');
  },
  getAuditLogs: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return await api.get(`/admin/audit-logs${q ? `?${q}` : ''}`);
  },
  // Admin Platform Revenue Analytics & Operating Costs
  getRevenueSummary: async () => {
    return await api.get('/admin/revenue-summary');
  },
  getRevenueTrend: async (filter = '3-months') => {
    return await api.get(`/admin/revenue-trend?filter=${filter}`);
  },
  getRevenueByCategory: async () => {
    return await api.get('/admin/revenue-by-category');
  },
  getRevenueByUserType: async () => {
    return await api.get('/admin/revenue-by-user-type');
  },
  getTopFarmers: async () => {
    return await api.get('/admin/top-farmers');
  },
  getTopProducts: async () => {
    return await api.get('/admin/top-products');
  },
  getDeliveryFinancials: async () => {
    return await api.get('/admin/delivery-financials');
  },
  getRefundAnalytics: async () => {
    return await api.get('/admin/refund-analytics');
  },
  getExpenses: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return await api.get(`/admin/expenses${q ? `?${q}` : ''}`);
  },
  addExpense: async (expenseData) => {
    return await api.post('/admin/expenses', expenseData);
  },
  updateExpense: async (id, expenseData) => {
    return await api.put(`/admin/expenses/${id}`, expenseData);
  },
  deleteExpense: async (id) => {
    return await api.delete(`/admin/expenses/${id}`);
  },
  getTransactions: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return await api.get(`/admin/revenue/transactions${q ? `?${q}` : ''}`);
  },
  getAIInsights: async () => {
    return await api.get('/admin/ai-insights');
  },
  downloadRevenueReport: async (period = 'September 2026') => {
    return await api.get(`/admin/report/csv?period=${encodeURIComponent(period)}`, { responseType: 'blob' });
  }
};

export const aiAPI = {
  getPriceRecommendation: async (commodity, grade, quantityKg, farmerPrice = null, market = 'Bhopal') => {
    return await api.post('/ai/price-recommendation', { 
      commodity, 
      grade, 
      quantityKg, 
      farmerPrice, 
      farmerListingPrice: farmerPrice,
      market 
    });
  },
  getDemandForecast: async (commodity, region) => {
    return await api.post('/ai/demand-forecast', { commodity, region });
  },
  getRouteOptimization: async (pickups, buyerLoc) => {
    return await api.post('/ai/route-optimize', { pickups, buyerLoc });
  },
  getFutureInsights: async (commodity, period, role) => {
    return await api.post('/ai/future-insights', { commodity, period, role });
  },
  getPricePrediction: async (crop) => {
    return await api.get(`/ai/price-prediction/${crop}`);
  },
  scanQuality: async (image, cropName) => {
    return await api.post('/ai/quality-scan', { image, cropName });
  },
  evaluateNegotiation: async (dealData) => {
    return await api.post('/ai/negotiate', dealData);
  },
  getCropCalendar: async () => {
    return await api.get('/ai/crop-calendar');
  },
  chat: async (params, language = 'en') => {
    if (typeof params === 'object' && params !== null) {
      return await api.post('/ai/chat', params);
    }
    return await api.post('/ai/chat', { query: params, language });
  },
  // Farmer AI Decision Support System Methods
  getFarmerDemandForecast: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return await api.get(`/ai/demand-forecast${q ? `?${q}` : ''}`);
  },
  getFarmerPriceForecast: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return await api.get(`/ai/price-forecast${q ? `?${q}` : ''}`);
  },
  getMarketInsight: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return await api.get(`/ai/market-insight${q ? `?${q}` : ''}`);
  },
  getPriceHistory: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return await api.get(`/market-prices/history${q ? `?${q}` : ''}`);
  },
  getModelStatus: async () => {
    return await api.get('/ai/model-status');
  },
  getDataSources: async () => {
    return await api.get('/ai/data-sources');
  },
  refreshMarketData: async (data = {}) => {
    return await api.post('/ai/refresh-market-data', data);
  }
};

export const notificationAPI = {
  getNotifications: async () => {
    return await api.get('/notifications');
  },
  markAsRead: async (id) => {
    return await api.put(`/notifications/${id}/read`);
  }
};

export const whatsappAPI = {
  connect: async (data) => {
    return await api.post('/whatsapp/connect', data);
  },
  getStatus: async (farmerId) => {
    return await api.get(`/whatsapp/status${farmerId ? `?farmerId=${encodeURIComponent(farmerId)}` : ''}`);
  },
  getNotifications: async (farmerId) => {
    return await api.get(`/whatsapp/notifications${farmerId ? `?farmerId=${encodeURIComponent(farmerId)}` : ''}`);
  },
  sendTest: async (farmerId) => {
    return await api.post('/whatsapp/test', { farmerId });
  },
  sendCommand: async (command, farmerId) => {
    return await api.post('/whatsapp/command', { command, farmerId });
  }
};

export const ivrAPI = {
  getStatus: async () => {
    return await api.get('/ivr/status');
  },
  sendMissedCall: async (data = {}) => {
    return await api.post('/ivr/missed-call', data);
  },
  initiateCallback: async (sessionId) => {
    return await api.post('/ivr/callback', { sessionId });
  },
  selectOption: async (sessionId, option, language = 'hi') => {
    return await api.post('/ivr/select-option', { sessionId, option, language });
  },
  getHistory: async (farmerId) => {
    return await api.get(`/ivr/history${farmerId ? `?farmerId=${encodeURIComponent(farmerId)}` : ''}`);
  }
};

export const smartOffersAPI = {
  getWeather: async () => {
    return await api.get('/weather');
  },
  getFestivals: async () => {
    return await api.get('/festivals');
  },
  getConsumerOffers: async () => {
    return await api.get('/consumer/smart-offers');
  },
  getBuyerOffers: async () => {
    return await api.get('/buyer/smart-offers');
  },
  getForecast: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return await api.get(`/ai/forecast${q ? `?${q}` : ''}`);
  },
  generateOffer: async (data) => {
    return await api.post('/ai/generate-offer', data);
  }
};

export const campaignAPI = {
  getCampaigns: async () => {
    return await api.get('/admin/campaigns');
  },
  createCampaign: async (campaignData) => {
    return await api.post('/admin/campaigns', campaignData);
  },
  updateCampaign: async (id, campaignData) => {
    return await api.put(`/admin/campaigns/${id}`, campaignData);
  },
  deleteCampaign: async (id) => {
    return await api.delete(`/admin/campaigns/${id}`);
  },
  getAIIntelligence: async () => {
    return await api.get('/admin/ai-intelligence');
  }
};

export const mandiAPI = {
  getPrices: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return await api.get(`/mandi/prices${q ? `?${q}` : ''}`);
  },
  getCommodityPrices: async (commodity, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return await api.get(`/mandi/commodity/${encodeURIComponent(commodity)}${q ? `?${q}` : ''}`);
  },
  refreshPrices: async () => {
    return await api.post('/mandi/refresh');
  },
  getStatus: async () => {
    return await api.get('/mandi/status');
  }
};

export const marketPriceAPI = {
  getMarketPrices: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return await api.get(`/market-prices${q ? `?${q}` : ''}`);
  },
  getFilterOptions: async () => {
    return await api.get('/market-prices/filters');
  },
  getStatus: async () => {
    return await api.get('/market-prices/status');
  },
  refresh: async (payload = {}) => {
    return await api.post('/market-prices/refresh', payload);
  }
};

export default api;



