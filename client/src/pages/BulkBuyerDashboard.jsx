import React, { useState, useEffect } from 'react';
import {
  Building, TrendingUp, FileText, CheckCircle2, ShieldCheck, RefreshCw,
  Send, Layers, Plus, X, Search, Filter, Star, Sparkles, Check, Clock,
  Truck, MapPin, AlertCircle, ArrowRight, ChevronRight, Scale, Award,
  Info, Calendar, DollarSign, Package, Eye
} from 'lucide-react';
import { bulkBuyerAPI, consumerAPI, smartOffersAPI } from '../services/api';
import AgroProductImage from '../components/AgroProductImage';
import SmartNegotiationModal from '../components/SmartNegotiationModal';
import AICropPricePredictionModal from '../components/AICropPricePredictionModal';

export default function BulkBuyerDashboard({ currentUser, onLogout, onNavigate, initialRoute }) {
  // Navigation tabs: 'marketplace' | 'compare' | 'orders' | 'contracts'
  const [activeTab, setActiveTab] = useState(() => {
    if (window.location.pathname.includes('/compare')) return 'compare';
    if (window.location.pathname.includes('/orders')) return 'orders';
    return 'marketplace';
  });

  const [data, setData] = useState(null);
  const [rfqs, setRfqs] = useState([]);
  const [products, setProducts] = useState([]);
  const [bulkOrders, setBulkOrders] = useState([]);
  const [buyerOffers, setBuyerOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // SIH Modals State
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [negotiationProduct, setNegotiationProduct] = useState(null);
  const [predictionCrop, setPredictionCrop] = useState(null);

  // Marketplace Filter State
  // 'all' | 'assured' | 'direct' | 'nearMe' | 'bestDeals' | 'aiRecommended'
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals state
  const [rfqModal, setRfqModal] = useState(false);
  const [productDetailsModal, setProductDetailsModal] = useState(null);
  const [orderModalProduct, setOrderModalProduct] = useState(null);
  const [feedbackOrder, setFeedbackOrder] = useState(null);

  // RFQ form state
  const [rfqCommodity, setRfqCommodity] = useState('Sharbati Premium Wheat');
  const [rfqVolumeTons, setRfqVolumeTons] = useState('20');
  const [rfqTargetPrice, setRfqTargetPrice] = useState('32000');

  // Bulk Order form state
  const [orderQuantityKg, setOrderQuantityKg] = useState(100);
  const [orderDeliveryAddress, setOrderDeliveryAddress] = useState(
    currentUser?.businessAddress || currentUser?.address || 'Wholesale Depot 4, Karond Mandi Road, Bhopal, MP'
  );
  const [orderExpectedDate, setOrderExpectedDate] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 2);
    return d.toISOString().slice(0, 10);
  });
  const [orderNotes, setOrderNotes] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);

  // AI Best Deal state
  const [dealCommodity, setDealCommodity] = useState('Tomato');
  const [dealQuantityKg, setDealQuantityKg] = useState('500');
  const [dealLocation, setDealLocation] = useState('Bhopal Wholesale Depot');
  const [aiDealResult, setAiDealResult] = useState(null);
  const [aiDealLoading, setAiDealLoading] = useState(false);

  // Verified Feedback form state (6 dimensions)
  const [fbRatings, setFbRatings] = useState({
    cropQuality: 5,
    punctuality: 5,
    packaging: 5,
    pricingFairness: 5,
    communication: 5,
    overallExperience: 5
  });
  const [fbReview, setFbReview] = useState('');
  const [fbSubmitting, setFbSubmitting] = useState(false);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, rfqRes, ordRes, offersRes] = await Promise.allSettled([
        bulkBuyerAPI.getDashboard(),
        bulkBuyerAPI.getRFQs(),
        bulkBuyerAPI.getMyBulkOrders(),
        smartOffersAPI.getBuyerOffers()
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.data?.success) {
        setData(dashRes.value.data.data);
      }
      if (rfqRes.status === 'fulfilled' && rfqRes.value.data?.success) {
        setRfqs(rfqRes.value.data.data);
      }
      if (ordRes.status === 'fulfilled' && ordRes.value.data?.success) {
        setBulkOrders(ordRes.value.data.data);
      }
      if (offersRes.status === 'fulfilled' && offersRes.value.data?.data) {
        setBuyerOffers(offersRes.value.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch bulk buyer data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products with backend filters
  const fetchProducts = async () => {
    try {
      const params = {};
      if (activeFilter === 'assured') {
        params.assured = 'true';
      } else if (activeFilter !== 'all') {
        params.filter = activeFilter;
      }
      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await bulkBuyerAPI.getProducts(params);
      if (res.data && res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [activeFilter, selectedCategory, searchQuery]);

  // Execute AI Best Deal search
  const handleRunAIBestDeal = async (overrideCommodity = null) => {
    setAiDealLoading(true);
    try {
      const targetComm = overrideCommodity || dealCommodity;
      const res = await bulkBuyerAPI.getAIBestDeal({
        product: targetComm,
        requiredQuantity: parseFloat(dealQuantityKg) || 500,
        buyerLocation: dealLocation
      });
      if (res.data && res.data.success) {
        setAiDealResult(res.data.data);
      }
    } catch (err) {
      showToastMsg('Failed to calculate AI Best Deal.');
    } finally {
      setAiDealLoading(false);
    }
  };

  // Auto-run AI best deal when switching to compare tab if not yet loaded
  useEffect(() => {
    if (activeTab === 'compare' && !aiDealResult) {
      handleRunAIBestDeal();
    }
  }, [activeTab]);

  // Handle RFQ creation
  const handleCreateRFQ = async (e) => {
    e.preventDefault();
    try {
      const res = await bulkBuyerAPI.createRFQ({
        commodity: rfqCommodity,
        quantity_tons: parseFloat(rfqVolumeTons),
        target_price_per_ton: parseFloat(rfqTargetPrice)
      });
      if (res.data && res.data.success) {
        showToastMsg(`Commercial RFQ for ${rfqVolumeTons} Tons of ${rfqCommodity} broadcast!`);
        setRfqModal(false);
        fetchData();
      }
    } catch (err) {
      showToastMsg('Failed to post RFQ.');
    }
  };

  // Handle Bulk Order placement
  const handlePlaceBulkOrder = async (e) => {
    e.preventDefault();
    if (!orderModalProduct) return;

    setOrderSubmitting(true);
    try {
      const res = await bulkBuyerAPI.createBulkOrder({
        product_id: orderModalProduct.id,
        quantity_kg: parseFloat(orderQuantityKg),
        delivery_address: orderDeliveryAddress,
        expected_delivery_date: orderExpectedDate,
        notes: orderNotes
      });

      if (res.data && res.data.success) {
        showToastMsg(`✓ Bulk Order #${res.data.data.id} placed! Farmer ${orderModalProduct.farmer_name} has been notified.`);
        setOrderModalProduct(null);
        setProductDetailsModal(null);
        setActiveTab('orders');
        fetchData();
        fetchProducts();
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to submit bulk order.';
      showToastMsg(errMsg);
    } finally {
      setOrderSubmitting(false);
    }
  };

  // Handle Verified Bulk Feedback submission
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackOrder) return;

    setFbSubmitting(true);
    try {
      const res = await bulkBuyerAPI.submitBulkFeedback({
        orderId: feedbackOrder.id,
        ratings: fbRatings,
        review: fbReview
      });

      if (res.data && res.data.success) {
        showToastMsg('✓ Verified bulk buyer review submitted! Thank you for rating the farmer.');
        setFeedbackOrder(null);
        setFbReview('');
        fetchData();
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to submit feedback.';
      showToastMsg(errMsg);
    } finally {
      setFbSubmitting(false);
    }
  };

  // Calculate dynamic unit price for bulk order based on tiers
  const getDynamicTierPrice = (prod, qty) => {
    if (!prod) return 0;
    const baseP = prod.price_per_kg || prod.price || 25;
    if (prod.bulkPricingTiers && prod.bulkPricingTiers.length > 0) {
      const sorted = [...prod.bulkPricingTiers].sort((a, b) => b.minQty - a.minQty);
      const matched = sorted.find(t => qty >= t.minQty);
      if (matched) return matched.pricePerKg;
    }
    return baseP;
  };

  const currentDynamicPrice = orderModalProduct ? getDynamicTierPrice(orderModalProduct, orderQuantityKg) : 0;
  const currentTotalAmount = orderModalProduct ? Math.round(currentDynamicPrice * orderQuantityKg) : 0;
  const currentMarketAmount = orderModalProduct ? Math.round((orderModalProduct.marketPrice || (currentDynamicPrice * 1.3)) * orderQuantityKg) : 0;
  const currentSavings = Math.max(0, currentMarketAmount - currentTotalAmount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-indigo-950 border border-indigo-500 text-indigo-100 shadow-2xl text-xs font-semibold flex items-center gap-2.5 backdrop-blur-xl animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-950/90 via-slate-900 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center text-3xl shadow-inner">
            🏢
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{currentUser?.name || 'Commercial Procurement'}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase">
                Bulk Buyer B2B
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-indigo-400" />
              <span>{currentUser?.businessName || 'Mehta Agro Wholesalers & Hotel Supplies'} • <strong className="text-slate-300">{currentUser?.businessType || 'Distributor'}</strong> ({currentUser?.city || 'Bhopal'})</span>
            </p>
            <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
              "Better Prices for Farmers. Lower Prices for Consumers. Smarter Logistics with AI."
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => { fetchData(); fetchProducts(); }}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/40 font-bold text-xs transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI Best Deal Match</span>
          </button>
          <button
            onClick={() => setRfqModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Create Wholesale RFQ</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'marketplace'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Wholesale Marketplace</span>
        </button>

        <button
          onClick={() => setActiveTab('compare')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'compare'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Scale className="w-4 h-4 text-amber-400" />
          <span>AI Best Deal & Farmer Comparison</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>My Bulk Orders ({bulkOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contracts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'contracts'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Contracts & RFQs</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: WHOLESALE PRODUCT MARKETPLACE */}
      {/* ========================================================================= */}
      {activeTab === 'marketplace' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Filter Bar & Search */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* 6 Specialized Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  All Products
                </button>

                <button
                  onClick={() => setActiveFilter('assured')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeFilter === 'assured'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-emerald-950/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/40'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>✓ AgroBridge Assured</span>
                </button>

                <button
                  onClick={() => setActiveFilter('direct')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeFilter === 'direct'
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>🌾 Direct From Farmers</span>
                </button>

                <button
                  onClick={() => setActiveFilter('nearMe')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeFilter === 'nearMe'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>📍 Near Me</span>
                </button>

                <button
                  onClick={() => setActiveFilter('bestDeals')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeFilter === 'bestDeals'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>🔥 Best Deals</span>
                </button>

                <button
                  onClick={() => setActiveFilter('aiRecommended')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeFilter === 'aiRecommended'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-purple-950/30 text-purple-300 border border-purple-500/40 hover:bg-purple-900/40'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>🤖 AI Recommended</span>
                </button>
              </div>

              {/* Category Quick Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">All Categories</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Grains">Grains</option>
                  <option value="Pulses">Pulses</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Seasonal">Seasonal Fruits</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Product Name, Farmer Name, Category, Location, or District..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* SECTION: 🌾 BULK BUYER SMART OFFERS & AI DEMAND ALERTS */}
          {buyerOffers.length > 0 && (
            <div className="rounded-3xl bg-slate-900/90 border border-indigo-500/30 p-6 space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🌾</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">Wholesale Smart Offers & Volume Tier Pricing</h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                        AI B2B Demand Engine
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Tiered wholesale discounts & seasonal pre-order contracts with guaranteed farmer fulfillment
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950 border border-slate-800 text-slate-400">
                  Prototype Simulation
                </span>
              </div>

              {/* AI Surge Banner if applicable */}
              {buyerOffers[0]?.aiDemandSurgeAlert && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-200">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🚨</span>
                    <span className="font-semibold">{buyerOffers[0].aiDemandSurgeAlert}</span>
                  </div>
                  <span className="text-[11px] font-mono text-amber-300 shrink-0">Hedge Spike Risk</span>
                </div>
              )}

              {/* Buyer Offer Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {buyerOffers.map((offer) => (
                  <div 
                    key={offer.id}
                    className="rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 p-5 flex flex-col justify-between space-y-4 shadow-lg group transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                            {offer.category}
                          </span>
                          <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {offer.commodity}
                          </h3>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          MOQ: {offer.moqKg} kg
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span>Base Rate:</span>
                        <strong className="text-white font-bold">₹{offer.basePrice}/kg</strong>
                      </div>

                      {/* Tier Pricing Table */}
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1.5 text-[11px]">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Volume Discount Tiers:
                        </div>
                        {(offer.tiers || []).map((tier, idx) => (
                          <div key={idx} className="flex items-center justify-between text-slate-300">
                            <span>{tier.tier}</span>
                            <span className="font-mono text-emerald-400 font-bold">
                              ₹{tier.pricePerKg}/kg (-{tier.discountPercent}%)
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span className="italic leading-snug">{offer.reason || 'AI-assisted forecast based on available regional data'}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">
                        {offer.confidence || 95}% Confidence
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setRfqCommodity(offer.commodity);
                          setRfqVolumeTons(((offer.moqKg || 500) / 1000).toString());
                          setRfqModal(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                      >
                        Procure at Tier
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/60">
                <span>💡 AI-assisted forecast • Suggested wholesale contract rate based on festive surge & harvest supply velocity.</span>
                <span className="font-mono text-indigo-400 font-bold">Safe Mandi Disintermediation</span>
              </div>
            </div>
          )}

          {/* Active Filter Description Banner */}
          <div className="flex items-center justify-between px-2 text-xs text-slate-400">
            <div>
              Showing <strong className="text-white">{products.length}</strong> wholesale commodities
              {activeFilter === 'assured' && <span className="text-emerald-400 font-semibold ml-1.5">• Filtered by Verified AgroBridge Assured</span>}
              {activeFilter === 'nearMe' && <span className="text-blue-400 font-semibold ml-1.5">• Sorted by nearest farm gate proximity</span>}
              {activeFilter === 'bestDeals' && <span className="text-amber-400 font-semibold ml-1.5">• Ranked by highest Mandi & Retail savings</span>}
              {activeFilter === 'aiRecommended' && <span className="text-purple-400 font-semibold ml-1.5">• AI top-tier quality score match</span>}
            </div>
            <button
              onClick={() => setActiveTab('compare')}
              className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
            >
              <span>Compare Farmers with AI</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-500 space-y-2">
              <Package className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">No wholesale products match the selected criteria.</p>
              <button
                onClick={() => { setActiveFilter('all'); setSelectedCategory('All'); setSearchQuery(''); }}
                className="text-xs text-indigo-400 hover:underline font-bold"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => {
                const moq = prod.minimum_bulk_order_kg || 50;
                const baseP = prod.price_per_kg || prod.price;
                const marketP = prod.marketPrice || Math.round(baseP * 1.28);
                const savingsPct = Math.round(((marketP - baseP) / marketP) * 100);

                return (
                  <div
                    key={prod.id}
                    className="group rounded-3xl bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/50 p-5 space-y-4 shadow-xl transition-all hover:shadow-indigo-500/10 flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Top Badges */}
                    <div className="space-y-3">
                      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                        <AgroProductImage
                          product={prod}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                        {/* Badges Overlay */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
                          {prod.isAssured && prod.qualityStatus === 'VERIFIED' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/90 text-slate-950 flex items-center gap-1 shadow-md">
                              <ShieldCheck className="w-3 h-3" />
                              <span>✓ AgroBridge Assured</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-900/90 text-slate-300 border border-slate-700">
                              Direct Harvest
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-900/90 text-indigo-300 border border-indigo-500/30">
                            {prod.category}
                          </span>
                        </div>

                        {savingsPct > 0 && (
                          <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg text-[10px] font-black bg-amber-500 text-slate-950 shadow-md">
                            Save {savingsPct}% vs Retail
                          </div>
                        )}

                        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-slate-300">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-400" />
                            <span>{prod.district || 'Bhopal'}, MP</span>
                          </span>
                          <span className="font-mono text-slate-300 font-bold">
                            Stock: {prod.available_kg || prod.quantity_kg} kg
                          </span>
                        </div>
                      </div>

                      {/* Title & Farmer Info */}
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {prod.product_name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span>👨‍🌾 {prod.farmer_name}</span>
                          <span>•</span>
                          <span className="text-slate-400">{prod.farm_name}</span>
                        </p>
                      </div>

                      {/* MOQ & Price Banner */}
                      <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800/90 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-slate-400">Direct Farm Gate Rate</div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-black text-emerald-400">₹{baseP}</span>
                            <span className="text-xs text-slate-400 font-semibold">/ kg</span>
                            <span className="text-xs text-slate-500 line-through font-mono">₹{marketP}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] uppercase font-bold text-indigo-400">Min Order Qty</div>
                          <div className="text-sm font-black text-white">{moq} <span className="text-[11px] font-normal text-slate-400">kg</span></div>
                        </div>
                      </div>

                      {/* Tiered discounts preview */}
                      {prod.bulkPricingTiers && prod.bulkPricingTiers.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 overflow-x-auto pb-1">
                          <span className="text-indigo-400 font-bold whitespace-nowrap">Volume Tiers:</span>
                          {prod.bulkPricingTiers.slice(0, 3).map((t, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 whitespace-nowrap">
                              {t.minQty}+kg: <strong>₹{t.pricePerKg}</strong> ({t.discountPct}% off)
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setProductDetailsModal(prod)}
                          className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>Details</span>
                        </button>

                        <button
                          onClick={() => {
                            setOrderModalProduct(prod);
                            setOrderQuantityKg(moq);
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5"
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>Order ({moq}kg+)</span>
                        </button>
                      </div>

                      {/* AI Negotiation and 14d Price Prediction Quick Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setNegotiationProduct(prod);
                            setShowNegotiationModal(true);
                          }}
                          className="py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                          title="Open AI Smart Negotiation Bot"
                        >
                          <Scale className="w-3 h-3 text-amber-400" />
                          <span>🤝 Negotiate</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPredictionCrop(prod.product_name)}
                          className="py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                          title="View 14-Day Price Forecast"
                        >
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span>🔮 Forecast</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AI BEST DEAL & FARMER COMPARISON (/bulk-buyer/compare) */}
      {/* ========================================================================= */}
      {activeTab === 'compare' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Query Header */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/50 border border-purple-500/30 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span>AI Best Deal Match & Multi-Farmer Decision Matrix</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Evaluates candidate farmers using 9 weighted factors: Price (25), Available Qty (15), Distance (10), Delivery Cost (10), Farmer Rating (10), Lab Quality Score (15), AgroBridge Assured (10), Reliability (5).
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-purple-300 font-mono bg-purple-950/60 border border-purple-500/40 px-3 py-1.5 rounded-xl">
                <span>AI Advisory Engine v2.4</span>
              </div>
            </div>

            {/* Input form for comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Target Commodity</label>
                <select
                  value={dealCommodity}
                  onChange={(e) => setDealCommodity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Tomato">Organic Hybrid Tomatoes</option>
                  <option value="Wheat">Sharbati Premium Wheat</option>
                  <option value="Onion">Red Nashik Onions</option>
                  <option value="Potato">Golden Kufri Potatoes</option>
                  <option value="Cucumber">Seedless Cucumbers</option>
                  <option value="Soybean">Yellow Soya Beans</option>
                  <option value="Rice">Aged Basmati Rice</option>
                  <option value="Dal">Desi Toor Dal</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Required Quantity (kg)</label>
                <input
                  type="number"
                  value={dealQuantityKg}
                  onChange={(e) => setDealQuantityKg(e.target.value)}
                  min="50"
                  step="50"
                  placeholder="e.g. 500"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => handleRunAIBestDeal()}
                  disabled={aiDealLoading}
                  className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {aiDealLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Computing 9 Factors...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Calculate Best Deal</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* AI Result Spotlight Card */}
          {aiDealResult && aiDealResult.topRecommendation && (
            <div className="rounded-3xl bg-slate-900/90 border border-purple-500/40 p-6 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-slate-800">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center text-3xl shadow-inner shrink-0">
                    🏆
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500 text-slate-950 uppercase tracking-wide">
                        AI TOP RECOMMENDATION
                      </span>
                      <span className="text-xs text-purple-300 font-mono">
                        Score: {aiDealResult.topRecommendation.bestDealScore}/100
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white mt-1">
                      {aiDealResult.topRecommendation.farmerName} — {aiDealResult.topRecommendation.farmName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Supplying <strong className="text-white">{aiDealResult.topRecommendation.productName}</strong> ({aiDealResult.topRecommendation.location}) • {aiDealResult.topRecommendation.distanceKm} km transit
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Best Deal Unit Price</div>
                    <div className="text-2xl font-black text-emerald-400">
                      ₹{aiDealResult.topRecommendation.dealPricePerKg} <span className="text-xs text-slate-400 font-normal">/ kg</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Total: ₹{aiDealResult.topRecommendation.totalOrderAmount.toLocaleString('en-IN')} ({aiDealResult.requiredQuantityKg} kg)
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const prod = products.find(p => p.id === aiDealResult.topRecommendation.productId);
                      if (prod) {
                        setOrderModalProduct(prod);
                        setOrderQuantityKg(parseFloat(dealQuantityKg) || 500);
                      }
                    }}
                    className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
                  >
                    <span>Place Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Justification Reasons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Why AI Selected This Deal:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {aiDealResult.topRecommendation.reasonsToBuy.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 9 Factors Score Bars */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>9-Factor Evaluation Breakdown</span>
                    <span className="text-purple-400 font-mono text-[11px]">{aiDealResult.topRecommendation.bestDealScore} / 100 pts</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    {aiDealResult.topRecommendation.factors && Object.entries(aiDealResult.topRecommendation.factors).map(([k, f]) => (
                      <div key={k} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
                        <span className="text-slate-400">{f.label}</span>
                        <span className="font-mono font-bold text-slate-200">{f.score} / {f.max}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Disclaimer */}
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-[11px] text-purple-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-purple-400 shrink-0" />
                <span><strong>AI-Assisted Forecast & Matching:</strong> {aiDealResult.disclaimer}</span>
              </div>
            </div>
          )}

          {/* Full Farmer Comparison Matrix Table */}
          {aiDealResult && aiDealResult.comparisonMatrix && (
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-indigo-400" />
                  <span>Comparative Multi-Farmer Benchmarking</span>
                </h3>
                <span className="text-xs text-slate-400">Comparing {aiDealResult.comparisonMatrix.length} Suppliers</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="pb-3">Farmer & Farm</th>
                      <th className="pb-3">Location & Distance</th>
                      <th className="pb-3">Wholesale Rate</th>
                      <th className="pb-3">Available Stock</th>
                      <th className="pb-3">Assured Lab Quality</th>
                      <th className="pb-3">Farmer Rating</th>
                      <th className="pb-3">Total Estimated Cost</th>
                      <th className="pb-3">AI Score</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {aiDealResult.comparisonMatrix.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5">
                          <div className="font-bold text-white">{row.farmer}</div>
                          <div className="text-[10px] text-slate-400">{row.farm}</div>
                        </td>
                        <td className="py-3.5 text-slate-300">{row.location}</td>
                        <td className="py-3.5 font-bold text-emerald-400">{row.ratePerKg} / kg</td>
                        <td className="py-3.5 text-slate-200">{row.availableStock}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.assured.includes('Yes') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {row.assured} ({row.qualityScore})
                          </span>
                        </td>
                        <td className="py-3.5 text-amber-400 font-bold">{row.rating}</td>
                        <td className="py-3.5 font-bold text-white">{row.totalCost}</td>
                        <td className="py-3.5 font-mono font-bold text-purple-400">{row.bestDealScore}</td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => {
                              const prod = products.find(p => p.id === row.productId);
                              if (prod) {
                                setOrderModalProduct(prod);
                                setOrderQuantityKg(parseFloat(dealQuantityKg) || 500);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition-colors"
                          >
                            Select Farmer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MY BULK ORDERS & LIVE TRACKING */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-400" />
                <span>Wholesale Orders & Dispatch Lifecycle</span>
              </h2>
              <p className="text-xs text-slate-400">
                Live monitoring from farmer acceptance through pickup, transit, and verified delivery.
              </p>
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Orders</span>
            </button>
          </div>

          {bulkOrders.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-500 space-y-2">
              <Package className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">No bulk orders placed yet.</p>
              <button
                onClick={() => setActiveTab('marketplace')}
                className="text-xs text-indigo-400 hover:underline font-bold"
              >
                Browse wholesale marketplace to place an order
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {bulkOrders.map((ord) => {
                const isDelivered = ord.status === 'DELIVERED';
                const statusColor =
                  ord.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                  ord.status === 'OUT_FOR_DELIVERY' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                  ord.status === 'FARMER_ACCEPTED' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                  ord.status === 'FARMER_DECLINED' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                  'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';

                return (
                  <div
                    key={ord.id}
                    className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl"
                  >
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xl font-bold font-mono">
                          📦
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base font-bold text-white">{ord.id}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusColor}`}>
                              {ord.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Placed on {new Date(ord.created_at).toLocaleDateString()} • Expected: <strong>{ord.expected_delivery_date}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-lg font-black text-emerald-400">
                            ₹{(ord.total_amount || 0).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {ord.quantity_kg} kg @ ₹{ord.unit_price}/kg
                          </div>
                        </div>

                        {/* Verified Feedback Button (Strictly on DELIVERED) */}
                        {isDelivered ? (
                          <button
                            onClick={() => {
                              setFeedbackOrder(ord);
                              setFbReview('');
                            }}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                          >
                            <Star className="w-3.5 h-3.5 fill-current text-white" />
                            <span>Give Verified Feedback</span>
                          </button>
                        ) : (
                          <div
                            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-500 cursor-not-allowed"
                            title="Feedback unlocks strictly after shipment is delivered."
                          >
                            Feedback upon delivery
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Details & Farmer Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Commodity Ordered</span>
                        <div className="font-bold text-white text-sm">{ord.product_name}</div>
                        <div className="text-slate-400">Volume: {ord.quantity_kg} kg</div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Supplying Producer</span>
                        <div className="font-bold text-white text-sm">{ord.farmer_name}</div>
                        <div className="text-slate-400">{ord.farm_name}</div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Destination Facility</span>
                        <div className="font-bold text-white text-sm truncate">{ord.delivery_address}</div>
                        <div className="text-slate-400">Carrier: {ord.delivery_job_id ? 'AgroBridge Smart Dispatch' : 'Assigning'}</div>
                      </div>
                    </div>

                    {/* Order Lifecycle Progress Timeline */}
                    {ord.timeline && ord.timeline.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Status Timeline</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                          {ord.timeline.map((step, sIdx) => (
                            <div key={sIdx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] space-y-0.5">
                              <div className="font-bold text-indigo-300 uppercase text-[10px]">
                                {step.status.replace(/_/g, ' ')}
                              </div>
                              <div className="text-slate-300 truncate">{step.note}</div>
                              <div className="text-[9px] text-slate-500">{new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CONTRACTS & RFQS (PRESERVED FUNCTIONALITY) */}
      {/* ========================================================================= */}
      {activeTab === 'contracts' && (
        <div className="space-y-8 animate-fadeIn">
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs font-bold uppercase text-slate-400 flex items-center justify-between">
                <span>Procured Volume</span>
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-black text-white">64.5 <span className="text-sm font-normal text-slate-400">Tons</span></div>
              <p className="text-[11px] text-indigo-400 font-semibold">Across 12 farmer clusters</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs font-bold uppercase text-slate-400 flex items-center justify-between">
                <span>Active Contracts</span>
                <FileText className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-black text-white">5</div>
              <p className="text-[11px] text-slate-400">Fulfillment rate 96.8%</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs font-bold uppercase text-slate-400 flex items-center justify-between">
                <span>Volume Discount</span>
                <TrendingUp className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-black text-indigo-400">18.4%</div>
              <p className="text-[11px] text-slate-400">Saved vs APMC commission agents</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs font-bold uppercase text-slate-400 flex items-center justify-between">
                <span>Procurement Pipeline</span>
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-black text-white">₹3,48,000</div>
              <p className="text-[11px] text-slate-400">Escrow Protected Contracts</p>
            </div>
          </div>

          {/* Active Bulk Procurement Contracts */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>Active Commercial Supply Contracts</span>
              </h2>
              <span className="text-xs text-slate-400">Direct Farmer Producer Clusters</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="pb-3">Contract ID</th>
                    <th className="pb-3">Commodity</th>
                    <th className="pb-3">Supplier Group</th>
                    <th className="pb-3">Committed Volume</th>
                    <th className="pb-3">Rate / Ton</th>
                    <th className="pb-3">Fulfillment</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {[
                    { id: 'cnt_101', commodity: 'Premium Wheat (Grade A)', volumeTons: 25.0, supplier: 'Bhopal Farmer Cluster', ratePerTon: 34000, fulfillment: '85%', status: 'In Transit' },
                    { id: 'cnt_102', commodity: 'Processing Tomatoes', volumeTons: 15.0, supplier: 'Vidisha Organic Hub', ratePerTon: 24000, fulfillment: '100%', status: 'Completed' },
                    { id: 'cnt_103', commodity: 'Yellow Soya Bean', volumeTons: 20.0, supplier: 'Sehore Growers Co-op', ratePerTon: 42000, fulfillment: '40%', status: 'Scheduled' }
                  ].map((cnt) => (
                    <tr key={cnt.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 font-mono text-indigo-400 font-bold">{cnt.id}</td>
                      <td className="py-3.5 font-semibold text-white">{cnt.commodity}</td>
                      <td className="py-3.5 text-slate-300">{cnt.supplier}</td>
                      <td className="py-3.5 text-slate-200 font-semibold">{cnt.volumeTons} MT</td>
                      <td className="py-3.5 font-bold text-slate-100">₹{cnt.ratePerTon.toLocaleString('en-IN')}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: cnt.fulfillment }} />
                          </div>
                          <span className="text-[10px] text-slate-400">{cnt.fulfillment}</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                          {cnt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active RFQs Table */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-400" />
                <span>Commercial Requests for Quotation (RFQs) ({rfqs.length})</span>
              </h2>
              <button
                onClick={() => setRfqModal(true)}
                className="text-xs text-indigo-400 hover:underline font-semibold"
              >
                + Post New RFQ
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rfqs.map((rfq) => (
                <div key={rfq.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-indigo-400 font-bold text-xs">{rfq.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      {rfq.status}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white">{rfq.commodity}</div>
                  <div className="text-xs text-slate-400">
                    Quantity: <strong className="text-slate-200">{rfq.quantity_tons} Metric Tons</strong> • Target: <strong className="text-emerald-400">₹{rfq.target_price_per_ton.toLocaleString('en-IN')}/Ton</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
                    {rfq.quotes_received || 0} quotes received from verified farmer clusters
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: PRODUCT DETAILS & TIERED PRICING VIEW */}
      {/* ========================================================================= */}
      {productDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{productDetailsModal.product_name}</h3>
                  <p className="text-xs text-slate-400">{productDetailsModal.farm_name} • {productDetailsModal.district}, MP</p>
                </div>
              </div>
              <button
                onClick={() => setProductDetailsModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Image & Quality Badge */}
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              <AgroProductImage product={productDetailsModal} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                {productDetailsModal.isAssured ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-lg">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>✓ AgroBridge Assured Quality</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/90 text-slate-300 border border-slate-700">
                    Direct Farm Produce
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed">
              {productDetailsModal.description || 'Premium farm gate produce harvested directly from verified agricultural clusters.'}
            </p>

            {/* Quality Checks */}
            {productDetailsModal.verificationChecks && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Quality Assurance Audit</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400">✓ Farm Origin Inspected</span>
                  <span className="flex items-center gap-1.5 text-emerald-400">✓ Zero Chemical Residue</span>
                  <span className="flex items-center gap-1.5 text-emerald-400">✓ Moisture Content Certified</span>
                  <span className="flex items-center gap-1.5 text-emerald-400">✓ Size & Weight Standardized</span>
                </div>
              </div>
            )}

            {/* Tiered Pricing Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-indigo-400" />
                <span>Tiered Volume Pricing Schedule</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(productDetailsModal.bulkPricingTiers || []).map((tier, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                    <div className="text-[11px] font-bold text-slate-400">{tier.minQty}+ kg</div>
                    <div className="text-base font-black text-emerald-400">₹{tier.pricePerKg}/kg</div>
                    <div className="text-[10px] text-indigo-400 font-bold">{tier.discountPct}% Discount</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setProductDetailsModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const p = productDetailsModal;
                  setProductDetailsModal(null);
                  setOrderModalProduct(p);
                  setOrderQuantityKg(p.minimum_bulk_order_kg || 50);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span>Request Bulk Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: BULK PURCHASE ORDER PLACEMENT WITH DYNAMIC CALCULATOR */}
      {/* ========================================================================= */}
      {orderModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Place Bulk Purchase Order</h3>
                  <p className="text-xs text-slate-400">{orderModalProduct.product_name} • {orderModalProduct.farmer_name}</p>
                </div>
              </div>
              <button onClick={() => setOrderModalProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceBulkOrder} className="space-y-4">
              {/* Quantity Selector with MOQ */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">Order Quantity (kg) *</label>
                  <span className="text-[11px] text-indigo-400 font-semibold">
                    MOQ: {orderModalProduct.minimum_bulk_order_kg || 50} kg • Max: {orderModalProduct.available_kg} kg
                  </span>
                </div>
                <input
                  type="number"
                  required
                  min={orderModalProduct.minimum_bulk_order_kg || 50}
                  max={orderModalProduct.available_kg || 10000}
                  step="10"
                  value={orderQuantityKg}
                  onChange={(e) => setOrderQuantityKg(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                />

                {/* Quick select volume buttons */}
                <div className="flex items-center gap-2 mt-2">
                  {[50, 100, 250, 500, 1000].filter(q => q >= (orderModalProduct.minimum_bulk_order_kg || 50)).map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setOrderQuantityKg(q)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                        orderQuantityKg === q
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {q} kg
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Live Price Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-2">
                <div className="text-xs font-bold uppercase text-slate-400 flex items-center justify-between">
                  <span>Dynamic Volume Pricing Summary</span>
                  <span className="text-indigo-400 font-mono">AgroBridge Direct</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Unit Rate (Applied Volume Tier):</span>
                  <span className="font-bold text-emerald-400 text-sm">₹{currentDynamicPrice} / kg</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Estimated Total Amount:</span>
                  <span className="font-black text-white text-base">₹{currentTotalAmount.toLocaleString('en-IN')}</span>
                </div>
                {currentSavings > 0 && (
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 pt-1 border-t border-slate-800/80">
                    <span>Estimated Retail / APMC Savings:</span>
                    <span className="font-bold">Save ₹{currentSavings.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Delivery Facility Address */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Receiving Facility Address *</label>
                <input
                  type="text"
                  required
                  value={orderDeliveryAddress}
                  onChange={(e) => setOrderDeliveryAddress(e.target.value)}
                  placeholder="e.g. Warehouse 3, Karond Mandi Road, Bhopal"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Expected Delivery Date */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Expected Delivery Date *</label>
                <input
                  type="date"
                  required
                  value={orderExpectedDate}
                  onChange={(e) => setOrderExpectedDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Packaging / Delivery Instructions</label>
                <textarea
                  rows="2"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Please load in heavy-duty ventilated crates. Need morning dock receiving."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Info Notice */}
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Submitting this order will instantly notify <strong>Farmer {orderModalProduct.farmer_name}</strong>. Once accepted, an automated smart logistics dispatch will be generated.</span>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOrderModalProduct(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={orderSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  {orderSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Notifying Farmer...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Submit Bulk Order</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VERIFIED BULK BUYER FEEDBACK (STRICTLY ON DELIVERED) */}
      {/* ========================================================================= */}
      {feedbackOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Star className="w-5 h-5 fill-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Verified Bulk Buyer Review</h3>
                  <p className="text-xs text-slate-400">Order #{feedbackOrder.id} • {feedbackOrder.product_name}</p>
                </div>
              </div>
              <button onClick={() => setFeedbackOrder(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>✓ Verified delivered wholesale shipment from <strong>{feedbackOrder.farmer_name}</strong></span>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              {/* 6 Dimensions of Feedback */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Rate Supplier on 6 Commercial Dimensions (1-5 Stars):
                </span>

                {[
                  { key: 'cropQuality', label: '1. Crop Quality & Grading Standard' },
                  { key: 'punctuality', label: '2. Delivery Punctuality & Readiness' },
                  { key: 'packaging', label: '3. Packaging & Loading Handling' },
                  { key: 'pricingFairness', label: '4. Pricing Fairness & Transparency' },
                  { key: 'communication', label: '5. Farmer Communication & Coordination' },
                  { key: 'overallExperience', label: '6. Overall Commercial Procurement Experience' }
                ].map((dim) => (
                  <div key={dim.key} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-300">{dim.label}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFbRatings(prev => ({ ...prev, [dim.key]: star }))}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= fbRatings[dim.key]
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Written Review */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Commercial Review & Feedback *</label>
                <textarea
                  rows="3"
                  required
                  value={fbReview}
                  onChange={(e) => setFbReview(e.target.value)}
                  placeholder="Share details on harvest freshness, transport condition, verified weights, and whether you would order again..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackOrder(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={fbSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                >
                  {fbSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Recording Feedback...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Publish Verified Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: WHOLESALE RFQ MODAL */}
      {/* ========================================================================= */}
      {rfqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-400" />
                <span>Create Commercial Wholesale RFQ</span>
              </h3>
              <button onClick={() => setRfqModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRFQ} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Commodity *</label>
                <input
                  type="text"
                  required
                  value={rfqCommodity}
                  onChange={(e) => setRfqCommodity(e.target.value)}
                  placeholder="e.g. Sharbati Premium Wheat"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity (Metric Tons) *</label>
                  <input
                    type="number"
                    required
                    value={rfqVolumeTons}
                    onChange={(e) => setRfqVolumeTons(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Price (₹ / Ton) *</label>
                  <input
                    type="number"
                    required
                    value={rfqTargetPrice}
                    onChange={(e) => setRfqTargetPrice(e.target.value)}
                    placeholder="e.g. 32000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setRfqModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
                >
                  Broadcast RFQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Negotiation Bot Modal */}
      <SmartNegotiationModal
        isOpen={showNegotiationModal}
        onClose={() => setShowNegotiationModal(false)}
        crop={negotiationProduct || products[0] || { product_name: 'Hybrid Tomato', price_per_kg: 28 }}
        onDealFinalized={(deal) => {
          showToastMsg(`✓ Negotiated Wholesale Agreement reached at ₹${deal.agreedPrice}/kg!`);
          fetchProducts();
        }}
      />

      {/* AI Crop Price Prediction Modal */}
      <AICropPricePredictionModal
        isOpen={Boolean(predictionCrop)}
        onClose={() => setPredictionCrop(null)}
        cropName={predictionCrop || 'Wheat'}
      />
    </div>
  );
}
