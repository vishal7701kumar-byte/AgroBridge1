import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, MapPin, Clock, CheckCircle2, Truck, Sparkles, RefreshCw, 
  ShoppingCart, X, Plus, Minus, ShieldCheck, ArrowRight, Search, 
  BarChart2, TrendingDown, DollarSign, Store, Check, Info, Heart, Flame,
  LifeBuoy, Star, HelpCircle, FileText
} from 'lucide-react';
import { consumerAPI, smartOffersAPI } from '../services/api';
import AgroProductImage, { getProductImage } from '../components/AgroProductImage';
import LiveDeliveryTracker from '../components/LiveDeliveryTracker';
import DemoPaymentModal from '../components/DemoPaymentModal';
import SmartPriceComparisonModal from '../components/SmartPriceComparisonModal';
import FutureInsightsChart from '../components/FutureInsightsChart';
import AICropPricePredictionModal from '../components/AICropPricePredictionModal';

export default function ConsumerDashboard({ currentUser, onLogout, onNavigate }) {
  const [catalog, setCatalog] = useState([]);
  const [bestDeals, setBestDeals] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [assuredFilter, setAssuredFilter] = useState('all'); // 'all' | 'assured' | 'non_assured'
  const [predictionCrop, setPredictionCrop] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState(['prod_1', 'prod_3']);
  const [cart, setCart] = useState([
    { id: 'prod_1', product_name: 'Organic Hybrid Tomatoes', price_per_kg: 28, quantity_kg: 3, unit: 'kg', farm_name: 'Patel Organic Farms' }
  ]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeTrackingDelivery, setActiveTrackingDelivery] = useState(null);
  const [compareProduct, setCompareProduct] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [smartOffers, setSmartOffers] = useState([]);
  const [weatherAlert, setWeatherAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderToast, setOrderToast] = useState(null);

  const showNotification = (msg) => {
    setOrderToast(msg);
    setTimeout(() => setOrderToast(null), 3500);
  };

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const [prodRes, delRes, dealsRes, smartOffersRes, weatherRes] = await Promise.all([
        consumerAPI.getProduceCatalog(selectedCategory, searchQuery),
        consumerAPI.getDeliveries(),
        consumerAPI.getBestPricesNearYou().catch(() => ({ data: { data: [] } })),
        smartOffersAPI.getConsumerOffers().catch(() => ({ data: { data: [] } })),
        smartOffersAPI.getWeather().catch(() => ({ data: { data: null } }))
      ]);
      if (prodRes.data && prodRes.data.success) {
        setCatalog(prodRes.data.data);
      }
      if (delRes.data && delRes.data.success) {
        setDeliveries(delRes.data.data);
      }
      if (dealsRes.data && dealsRes.data.success) {
        setBestDeals(dealsRes.data.data);
      }
      if (smartOffersRes.data && smartOffersRes.data.data) {
        setSmartOffers(smartOffersRes.data.data);
      }
      if (weatherRes.data && weatherRes.data.data) {
        setWeatherAlert(weatherRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchCatalog();
  };

  const addToCart = (product) => {
    const price = product.price_per_kg || product.price || 25;
    const name = product.product_name || product.name || 'Produce';
    const unit = product.unit || 'kg';
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity_kg: item.quantity_kg + 1 } : item);
      }
      return [...prev, {
        id: product.id,
        product_name: name,
        price_per_kg: price,
        unit: unit,
        quantity_kg: 1,
        farm_name: product.farm_name || product.farmer_name || 'Patel Organic Farms'
      }];
    });
    showNotification(`Added ${name} to cart!`);
  };

  const updateCartQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity_kg + delta;
        return newQ > 0 ? { ...item, quantity_kg: newQ } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(prev => prev.filter(item => item !== id));
      showNotification('Removed from Wishlist');
    } else {
      setWishlist(prev => [...prev, id]);
      showNotification('Saved to Wishlist');
    }
  };

  const getItemCartQuantity = (id) => {
    const item = cart.find(c => c.id === id);
    return item ? item.quantity_kg : 0;
  };

  const totalCartAmount = cart.reduce((acc, item) => acc + (item.price_per_kg * item.quantity_kg), 0);
  const totalCartKg = cart.reduce((acc, item) => acc + item.quantity_kg, 0);

  const startCheckout = () => {
    if (!cart.length) return;
    if (onNavigate) {
      onNavigate('/consumer/checkout');
    } else {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    setShowPaymentModal(false);
    try {
      const orderPayload = {
        items: cart.map(c => ({
          product_id: c.id,
          product_name: c.product_name,
          farm_name: c.farm_name,
          quantity_kg: c.quantity_kg,
          price_per_kg: c.price_per_kg,
          subtotal: c.price_per_kg * c.quantity_kg
        })),
        delivery_address: currentUser?.address || 'Flat 402, Green Meadows Heights, Arera Colony, Bhopal',
        payment_method: paymentDetails.payment_method || 'Escrow Protected UPI'
      };

      const res = await consumerAPI.placeOrder(orderPayload);
      if (res.data && res.data.success) {
        setCart([]);
        setShowCartModal(false);
        showNotification(`Order ${res.data.data.order.id} placed! Driver assigned.`);
        fetchCatalog();
        if (onNavigate) {
          onNavigate(`/consumer/orders/${res.data.data.order.id}/track`);
        }
      }
    } catch (err) {
      showNotification('Order creation failed.');
    }
  };

  const handleOpenComparison = (product) => {
    setCompareProduct(product);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      
      {/* Toast Notification */}
      {orderToast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-emerald-950 border border-emerald-500/50 text-emerald-200 text-xs font-bold shadow-2xl flex items-center gap-2.5 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{orderToast}</span>
        </div>
      )}

      {/* QUICK-COMMERCE APP HEADER */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Brand & Delivery Location Badge */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🌾</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold text-white tracking-tight">AgroBridge Fresh</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                    Direct Harvest
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 font-medium">
                  "Better Prices for Farmers. Lower Prices for Consumers. Smarter Logistics with AI."
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Delivering to:</span>
              <span className="font-bold text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5">
                <span>Arera Colony, Bhopal</span>
                <span className="text-[10px] text-emerald-400">• 60-90m</span>
              </span>
            </div>
          </div>

          {/* Search, Wishlist & Cart Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tomatoes, wheat, mangoes..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </form>

            {/* Support & Dispute Center Button */}
            <button
              onClick={() => onNavigate && onNavigate('/consumer/support')}
              className="px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-teal-300 hover:text-white hover:border-teal-500/50 text-xs font-bold transition-all flex items-center gap-1.5"
              title="Dispute & Help Center"
            >
              <LifeBuoy className="w-4 h-4 text-teal-400" />
              <span className="hidden sm:inline">Support</span>
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => showNotification(`Wishlist contains ${wishlist.length} saved crops`)}
              className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-rose-400 hover:bg-slate-800 transition-colors relative"
              title="Saved Produce"
            >
              <Heart className="w-5 h-5 fill-rose-500/20" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => setShowCartModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>₹{totalCartAmount}</span>
              <span className="w-4 h-4 rounded-full bg-slate-950 text-emerald-300 text-[10px] flex items-center justify-center font-extrabold">
                {cart.length}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Commerce Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 scrollbar-none border-t border-slate-800/80">
          {[
            { id: 'All', label: 'All Items', icon: '🧺' },
            { id: 'Vegetables', label: 'Vegetables', icon: '🥬' },
            { id: 'Fruits', label: 'Fruits', icon: '🍎' },
            { id: 'Grains', label: 'Grains', icon: '🌾' },
            { id: 'Pulses', label: 'Pulses', icon: '🫘' },
            { id: 'Dairy', label: 'Dairy', icon: '🥛' },
            { id: 'Seasonal', label: 'Seasonal', icon: '🥭' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-105'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* 3-Way AgroBridge Assured Quality Filter Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quality Certification:</span>
            <div className="inline-flex rounded-xl p-0.5 bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => setAssuredFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  assuredFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Produce ({catalog.length})
              </button>
              <button
                type="button"
                onClick={() => setAssuredFilter('assured')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  assuredFilter === 'assured'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>✓ AgroBridge Assured ({catalog.filter(p => p.isAssured).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setAssuredFilter('non_assured')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  assuredFilter === 'non_assured'
                    ? 'bg-slate-800 text-amber-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Direct Local Farm ({catalog.filter(p => !p.isAssured).length})
              </button>
            </div>
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Grade A Quality + 100% Replacement Guarantee</span>
          </div>
        </div>
      </div>

      {/* SECTION: 🌦️ SMART OFFERS & SEASONAL / FESTIVAL AI SPECIALS */}
      {smartOffers.length > 0 && (
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border border-amber-500/30 p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🌦️</span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">Smart Offers For You</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    AI Demand specials
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Real-time weather, seasonal immunity & upcoming festival price cuts direct from local farms
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {weatherAlert?.current && (
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                  <span>{weatherAlert.current.icon}</span>
                  <span>{weatherAlert.current.condition} • {weatherAlert.current.temp}°C</span>
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950 border border-slate-800 text-slate-400">
                Prototype Simulation
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {smartOffers.map((offer) => (
              <div 
                key={offer.id}
                className="rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-amber-500/40 p-4 flex flex-col justify-between space-y-3 shadow-lg group transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <span>{offer.icon || '✨'}</span>
                      <span>{offer.badge || 'Smart Offer'}</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400">
                      {offer.discountPercent}% OFF
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {offer.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      {offer.description}
                    </p>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] text-slate-400 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="italic leading-snug">{offer.reason || 'AI-assisted demand forecast'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">
                      ₹{offer.discountedPrice}
                      <span className="text-[10px] font-normal text-slate-400">/{offer.unit}</span>
                    </div>
                    {offer.originalPrice && (
                      <div className="text-[10px] text-slate-500 line-through">
                        ₹{offer.originalPrice}/{offer.unit}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => addToCart({
                      id: offer.id,
                      product_name: offer.productName,
                      price_per_kg: offer.discountedPrice,
                      unit: offer.unit || 'kg',
                      farm_name: 'Direct Farm Special'
                    })}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
            <span>💡 AI-assisted forecast • Suggested offers dynamically tuned for festival & weather surges.</span>
            <span className="font-mono text-emerald-400 font-bold">Safe MSP Guaranteed</span>
          </div>
        </div>
      )}

      {/* SECTION: 🔥 SMART DEALS & BEST PRICES SHOWCASE */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <div>
              <h2 className="text-lg font-bold text-white">Smart Deals Near You</h2>
              <p className="text-xs text-slate-400">Largest price difference vs mandi/retail markups</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Value Ranked</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(bestDeals.length ? bestDeals : catalog.slice(0, 4).map(p => ({
            productId: p.id,
            productName: p.product_name,
            image: p.image,
            category: p.category,
            agroBridgePrice: p.price_per_kg || p.price,
            marketPrice: p.marketPrice || Math.round((p.price_per_kg || 25) * 1.28),
            savings: (p.marketPrice || Math.round((p.price_per_kg || 25) * 1.28)) - (p.price_per_kg || 25),
            savingsPercentage: 22,
            farmerName: p.farmer_name,
            farmName: p.farm_name,
            unit: p.unit || 'kg'
          }))).map((deal, idx) => (
            <div 
              key={idx}
              className="rounded-2xl bg-slate-950 border border-slate-800 p-3.5 space-y-3 hover:border-emerald-500/50 transition-all flex flex-col justify-between group"
            >
              <div 
                onClick={() => onNavigate && onNavigate(`/consumer/product/${deal.productId}`)}
                className="cursor-pointer"
              >
                <div className="relative w-full h-36 rounded-xl overflow-hidden mb-2.5">
                  <AgroProductImage
                    src={getProductImage(deal)}
                    alt={deal.productName}
                    category={deal.category || 'Vegetables'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-500 text-slate-950 shadow-md">
                    💰 Save ₹{deal.savings}
                  </div>
                  {deal.isAssured && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[9px] font-black bg-slate-950/90 border border-emerald-500/60 text-emerald-300 flex items-center gap-1 shadow-md">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Assured</span>
                    </div>
                  )}
                </div>

                <div className="text-xs font-bold text-white line-clamp-1">{deal.productName}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">{deal.farmName || deal.farmerName}</div>

                <div className="mt-2 flex items-baseline justify-between">
                  <div>
                    <div className="text-base font-black text-emerald-400">
                      ₹{deal.agroBridgePrice}
                      <span className="text-[10px] font-normal text-slate-400"> / {deal.unit || 'kg'}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 line-through">Market: ₹{deal.marketPrice}</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {deal.savingsPercentage}% OFF
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex gap-2">
                <button
                  onClick={() => {
                    const match = catalog.find(c => c.id === deal.productId);
                    handleOpenComparison(match || deal);
                  }}
                  className="flex-1 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <BarChart2 className="w-3 h-3 text-teal-400" />
                  <span>Compare</span>
                </button>
                <button
                  onClick={() => addToCart({
                    id: deal.productId,
                    product_name: deal.productName,
                    price_per_kg: deal.agroBridgePrice,
                    farm_name: deal.farmName,
                    unit: deal.unit || 'kg'
                  })}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
                  title="Add to Cart"
                >
                  ADD
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION: 🌾 FRESH FROM FARMERS (QUICK-COMMERCE PRODUCT GRID) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🌾</span>
              <span>Fresh From Farmers ({catalog.length} Available)</span>
            </h2>
            <p className="text-xs text-slate-400">Direct from field • No cold storage markups • 88% to farmers</p>
          </div>
          <span className="text-xs text-emerald-400 font-semibold hidden sm:inline">
            ✓ Harvested Today
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {catalog.filter((p) => {
            if (assuredFilter === 'assured') return Boolean(p.isAssured);
            if (assuredFilter === 'non_assured') return !p.isAssured;
            return true;
          }).map((prod) => {
            const agroPrice = prod.price_per_kg || prod.price || 25;
            const marketRef = prod.marketPrice || Math.round(agroPrice * 1.28);
            const savings = Math.max(0, marketRef - agroPrice);
            const savingsPct = Math.round((savings / marketRef) * 100);
            const itemQty = getItemCartQuantity(prod.id);
            const isFav = wishlist.includes(prod.id);

            return (
              <div
                key={prod.id}
                className="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 space-y-3 hover:border-emerald-500/50 transition-all flex flex-col justify-between group shadow-xl"
              >
                <div>
                  {/* Large Product Image with Fallback */}
                  <div 
                    onClick={() => onNavigate && onNavigate(`/consumer/product/${prod.id}`)}
                    className="relative w-full h-48 rounded-2xl overflow-hidden cursor-pointer mb-3"
                  >
                    <AgroProductImage
                      src={getProductImage(prod)}
                      alt={prod.product_name}
                      category={prod.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Direct Farmer Badge */}
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[10px] font-bold text-emerald-300 flex items-center gap-1 shadow-lg">
                      <span>🌾</span>
                      <span>Direct Farm</span>
                    </div>

                    {/* AgroBridge Assured Quality Badge */}
                    {prod.isAssured && (
                      <div className="absolute top-2.5 left-28 px-2 py-1 rounded-xl bg-emerald-950/90 backdrop-blur-md border border-emerald-500/50 text-[10px] font-bold text-emerald-300 flex items-center gap-1 shadow-lg">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>Assured</span>
                      </div>
                    )}

                    {/* Wishlist Icon */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(prod.id);
                      }}
                      className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-slate-950/80 backdrop-blur text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-400 text-rose-400' : ''}`} />
                    </button>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="uppercase font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                      {prod.category}
                    </span>
                    <span className="text-slate-400 font-semibold">1 {prod.unit || 'KG'}</span>
                  </div>

                  <h3 
                    onClick={() => onNavigate && onNavigate(`/consumer/product/${prod.id}`)}
                    className="text-base font-extrabold text-white mt-1 hover:text-emerald-400 transition-colors cursor-pointer line-clamp-1"
                  >
                    {prod.product_name || prod.name}
                  </h3>

                  <div className="text-xs text-emerald-300 font-semibold mt-0.5">
                    👨‍🌾 {prod.farmer_name || 'Ramesh Patel'}
                  </div>

                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{prod.location || 'Bhopal, MP'}</span>
                  </div>

                  {/* Dynamic Savings Badge */}
                  <div className="mt-3 p-2 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Market: <span className="line-through">₹{marketRef}</span></span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <span>💰 Save ₹{savings}</span>
                      <span className="text-[10px] text-emerald-500">({savingsPct}%)</span>
                    </span>
                  </div>
                </div>

                {/* Pricing & Add to Cart Controls */}
                <div className="pt-3 border-t border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-black text-white">
                        ₹{agroPrice}
                        <span className="text-xs font-normal text-slate-400"> / {prod.unit || 'kg'}</span>
                      </div>
                      <div className="text-[10px] text-emerald-400 font-semibold">Farm Gate Rate</div>
                    </div>

                    {/* Smooth Add / Quantity Incrementer */}
                    {itemQty === 0 ? (
                      <button
                        onClick={() => addToCart(prod)}
                        className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                      >
                        ADD
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-1">
                        <button
                          onClick={() => updateCartQuantity(prod.id, -1)}
                          className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold hover:bg-emerald-500/40"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white px-1">{itemQty}</span>
                        <button
                          onClick={() => updateCartQuantity(prod.id, 1)}
                          className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold hover:bg-emerald-500/40"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Dual Action Buttons: Compare Price & AI Price Forecast */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleOpenComparison(prod)}
                      className="py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <BarChart2 className="w-3 h-3 text-teal-400" />
                      <span>Compare</span>
                    </button>
                    <button
                      onClick={() => setPredictionCrop(prod.product_name || prod.name || 'Tomato')}
                      className="py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 hover:text-emerald-100 font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                      title="View AI 14-Day Price Forecast"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>AI Forecast</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION: 📈 FUTURE MARKET & PRICE TRENDS (AI-ASSISTED FORECAST) */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📈</span>
              <h2 className="text-lg font-bold text-white">Future Market & Price Trends</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                AI-Assisted Forecast
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-horizon price predictions (7-day, 30-day, 3-month) to help household consumers budget smart and purchase in-season produce directly from farms.
            </p>
          </div>
        </div>

        <FutureInsightsChart initialRole="consumer" showHeader={false} />
      </div>

      {/* SIH EDUCATIONAL SECTION: WHY AGROBRIDGE PRICES ARE DIFFERENT */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🌾</span>
              <span>Why AgroBridge Prices Are Different</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Fewer intermediaries can help improve price transparency and reduce unnecessary retail markups.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
            SIH Problem Statement
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Traditional Supply Chain Flow */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-rose-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-300 uppercase tracking-wider">Traditional Supply Chain</span>
              <span className="text-[10px] text-rose-400 font-bold">Multiple Hidden Cuts</span>
            </div>

            <div className="space-y-2 text-xs font-semibold">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-between">
                <span>👨‍🌾 Farmer</span>
                <span className="text-slate-500 text-[10px]">Realizes only 30-40%</span>
              </div>
              <div className="text-center text-slate-600 font-black">↓</div>
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-200 flex items-center justify-between">
                <span>Commission Agent (Mandi APMC)</span>
                <span className="text-rose-400 text-[10px]">+8-10% Cut</span>
              </div>
              <div className="text-center text-slate-600 font-black">↓</div>
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-200 flex items-center justify-between">
                <span>Wholesaler & Storage Middleman</span>
                <span className="text-rose-400 text-[10px]">+12-15% Cut</span>
              </div>
              <div className="text-center text-slate-600 font-black">↓</div>
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-200 flex items-center justify-between">
                <span>City Retailer / Supermarket</span>
                <span className="text-rose-400 text-[10px]">+20-25% Margin</span>
              </div>
              <div className="text-center text-slate-600 font-black">↓</div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-between">
                <span>🛒 Consumer</span>
                <span className="text-rose-400 text-[10px]">Pays +40% to +60% Higher</span>
              </div>
            </div>
          </div>

          {/* AgroBridge Direct Model */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-teal-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-teal-300 uppercase tracking-wider">AgroBridge Direct Model</span>
              <span className="text-[10px] text-teal-400 font-bold">100% Transparent</span>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-lg">👨‍🌾</span>
                  <span>Farmer (Direct Producer)</span>
                </span>
                <span className="text-emerald-400 font-black">Receives 88% Share</span>
              </div>

              <div className="text-center text-teal-400 font-black flex items-center justify-center gap-2">
                <span>↓</span>
                <span className="text-[10px] font-bold bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full border border-teal-500/30">
                  AgroBridge Rural Logistics (8%) + Platform Fee (4%)
                </span>
                <span>↓</span>
              </div>

              <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/40 text-teal-200 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-lg">🛒</span>
                  <span>Consumer</span>
                </span>
                <span className="text-teal-400 font-black">Saves ~20-25% Directly</span>
              </div>
            </div>

            {/* 5 Core Benefits List */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <Check className="w-4 h-4 shrink-0" />
                <span>Better price transparency: Consumers know exactly where their money goes.</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <Check className="w-4 h-4 shrink-0" />
                <span>Direct farmer connection: Real farm-gate harvest freshly delivered in 24 hours.</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <Check className="w-4 h-4 shrink-0" />
                <span>Fair farmer remuneration: 88% directly credited via escrow to farmer wallets.</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION: 🚚 LIVE ORDER DISPATCH & TRACKING */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <span>Active Deliveries & Tracking ({deliveries.length})</span>
          </h2>
          <span className="text-xs text-slate-400">Real-time GPS Tracking</span>
        </div>

        <div className="space-y-3">
          {deliveries.map((del) => (
            <div key={del.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-400">{del.id}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-500/30 uppercase">
                    {(del.status || '').replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400">Order: {del.order_id}</span>
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Pickup: {del.pickup_location} ➔ Dropoff: {del.dropoff_location}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Driver: <strong className="text-slate-300">{del.driver_name || 'Assigned Transporter'}</strong> • Delivery OTP: <span className="font-mono font-bold text-emerald-400">{del.delivery_otp}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {(del.status === 'delivered' || del.status === 'DELIVERED') && (
                  <button
                    onClick={() => onNavigate && onNavigate(`/consumer/orders/${del.order_id || del.id}/feedback`)}
                    className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-xs border border-amber-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Rate this order and farmer"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Rate Farmer</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate(`/consumer/orders/${del.id}/track`);
                    } else {
                      setActiveTrackingDelivery(del);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-xs border border-emerald-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Live GPS Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Modal */}
      {showCartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                <span>Direct Farm Cart ({cart.length} items)</span>
              </h3>
              <button onClick={() => setShowCartModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!cart.length ? (
              <div className="text-center py-8 text-slate-400 text-xs">Your farm cart is empty.</div>
            ) : (
              <>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{item.product_name}</div>
                        <div className="text-[10px] text-emerald-400 font-semibold">{item.farm_name}</div>
                        <div className="text-[11px] text-slate-400">₹{item.price_per_kg}/{item.unit || 'kg'}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-900 rounded-xl p-1 border border-slate-800">
                          <button
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className="p-1 text-slate-400 hover:text-white cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-white px-1">{item.quantity_kg} {item.unit || 'kg'}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className="p-1 text-slate-400 hover:text-white cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-xs font-bold text-white w-14 text-right">
                          ₹{item.price_per_kg * item.quantity_kg}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Direct Farmer Payment (100% Escrow):</span>
                    <span className="text-white font-semibold">₹{totalCartAmount}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Rural Direct Cold-Chain Logistics:</span>
                    <span className="text-emerald-400 font-semibold">₹35 (Standard Express)</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                    <span>Total Estimated:</span>
                    <span className="text-emerald-400">₹{totalCartAmount + 35}</span>
                  </div>
                </div>

                <button
                  onClick={startCheckout}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Proceed to Multi-Step Checkout (₹{totalCartAmount + 35})</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Demo Payment Modal */}
      <DemoPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        totalAmount={totalCartAmount}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Smart Price Comparison Modal */}
      <SmartPriceComparisonModal
        isOpen={Boolean(compareProduct)}
        onClose={() => setCompareProduct(null)}
        product={compareProduct}
        onAddToCart={addToCart}
      />

      {/* Live Map Tracker */}
      {activeTrackingDelivery && (
        <LiveDeliveryTracker
          delivery={activeTrackingDelivery}
          onClose={() => setActiveTrackingDelivery(null)}
        />
      )}

      {/* AI Crop Price Prediction Modal */}
      <AICropPricePredictionModal
        isOpen={Boolean(predictionCrop)}
        onClose={() => setPredictionCrop(null)}
        cropName={predictionCrop || 'Tomato'}
      />

    </div>
  );
}
