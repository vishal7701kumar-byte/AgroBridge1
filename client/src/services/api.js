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
  }
};

export const aiAPI = {
  getPriceRecommendation: async (commodity, grade, quantityKg) => {
    return await api.post('/ai/price-recommendation', { commodity, grade, quantityKg });
  },
  getDemandForecast: async (commodity, region) => {
    return await api.post('/ai/demand-forecast', { commodity, region });
  },
  getRouteOptimization: async (pickups, buyerLoc) => {
    return await api.post('/ai/route-optimize', { pickups, buyerLoc });
  },
  getFutureInsights: async (commodity, period, role) => {
    return await api.post('/ai/future-insights', { commodity, period, role });
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

export default api;
