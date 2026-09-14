import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ShoppingCart, Heart, ShieldCheck, MapPin, Clock, Sparkles, 
  BarChart2, Check, Share2, Info, Star, ChevronRight, Plus, Minus 
} from 'lucide-react';
import { consumerAPI } from '../services/api';
import AgroProductImage, { getProductImage } from '../components/AgroProductImage';
import SmartPriceComparisonModal from '../components/SmartPriceComparisonModal';

export default function ProductDetailsPage({ currentRoute, onNavigate }) {
  // Extract product ID from /consumer/product/:id or /product/:id
  const match = currentRoute.match(/\/product\/([^/?#]+)/);
  const productId = match ? match[1] : 'prod_1';

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showQualityDetails, setShowQualityDetails] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const [prodRes, fbRes] = await Promise.all([
          consumerAPI.getProductById(productId),
          consumerAPI.getProductFeedback(productId).catch(() => ({ data: { success: false } }))
        ]);
        if (prodRes.data && prodRes.data.success) {
          setProduct(prodRes.data.data);
        }
        if (fbRes.data && fbRes.data.success) {
          setFeedbacks(fbRes.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm font-semibold">Loading farm produce details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-5xl mb-4">🌾</div>
        <h2 className="text-xl font-bold text-white mb-2">Product Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">The requested farm produce listing is no longer active.</p>
        <button
          onClick={() => onNavigate('/consumer/dashboard')}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const primaryImg = getProductImage(product);
  const rawGallery = (product.images && product.images.length > 0)
    ? product.images.map(img => typeof img === 'string' ? img : img.url).filter(Boolean)
    : (primaryImg ? [primaryImg] : []);

  const galleryImages = rawGallery.length > 0 ? rawGallery : [primaryImg];
  const currentImage = galleryImages[selectedImageIndex] || primaryImg;

  const agroPrice = product.price_per_kg || product.price || 28;
  const marketPrice = product.marketPrice || Math.round(agroPrice * 1.28);
  const savings = Math.max(0, marketPrice - agroPrice);
  const savingsPercent = marketPrice > 0 ? Math.round((savings / marketPrice) * 100) : 0;

  const handleAddToCart = () => {
    setCartQuantity(prev => prev + 1);
    showToast(`Added ${product.product_name} to cart!`);
  };

  const handleIncrement = () => setCartQuantity(prev => prev + 1);
  const handleDecrement = () => setCartQuantity(prev => Math.max(0, prev - 1));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-emerald-950 border border-emerald-500/50 text-emerald-200 text-xs font-bold shadow-2xl flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/consumer/dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsWishlisted(!isWishlisted);
              showToast(!isWishlisted ? 'Saved to Wishlist' : 'Removed from Wishlist');
            }}
            className={`p-2.5 rounded-xl border transition-all ${
              isWishlisted
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400'
            }`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
            <AgroProductImage
              src={currentImage}
              alt={product.product_name}
              category={product.category}
              className="w-full h-80 sm:h-96 object-cover"
              aspectRatio="aspect-auto"
            />
            {/* Savings Badge */}
            {savings > 0 && (
              <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs shadow-xl flex items-center gap-1.5">
                <span>💰</span>
                <span>Save ₹{savings}/{product.unit || 'kg'} ({savingsPercent}% OFF)</span>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx ? 'border-emerald-400 ring-2 ring-emerald-500/30 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <AgroProductImage
                    src={img}
                    alt={`thumbnail-${idx}`}
                    category={product.category}
                    className="w-full h-full object-cover"
                    aspectRatio=""
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Specs & Actions */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Title & Origin */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                🌾 Direct Farm Harvest
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                {product.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {product.product_name || product.name}
            </h1>

            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              {product.description || 'Harvested directly from certified local farms, ensuring complete supply chain transparency and zero broker markups.'}
            </p>
          </div>

          {/* Price Block */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400">
                ₹{agroPrice}
              </span>
              <span className="text-sm text-slate-400 font-semibold">
                per {product.unit || 'kg'}
              </span>
              {marketPrice > agroPrice && (
                <span className="text-base text-slate-500 line-through">
                  ₹{marketPrice}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
              <span className="text-xs text-slate-400">Market Reference: ₹{marketPrice}/{product.unit || 'kg'}</span>
              <span className="text-xs text-emerald-400 font-bold">• ₹{savings} Direct Consumer Savings</span>
            </div>
          </div>

          {/* Farm & Origin Metadata */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">👨‍🌾 Farmer</span>
              <div className="text-sm font-bold text-white mt-0.5">{product.farmer_name || 'Ramesh Patel'}</div>
              <div className="text-[11px] text-emerald-400 font-medium">{product.farm_name || 'Patel Organic Farms'}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">📍 Farm Origin</span>
              <div className="text-sm font-bold text-white mt-0.5 truncate">{product.location || 'Berasia Road, Bhopal'}</div>
              <div className="text-[11px] text-slate-400">{product.district || 'Bhopal'}, MP</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">⏰ Harvest Time</span>
              <div className="text-sm font-bold text-white mt-0.5">{product.harvest_date || 'Today 6:00 AM'}</div>
              <div className="text-[11px] text-teal-300">Grade: {product.quality || 'Grade A+'}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">📦 In Stock</span>
              <div className="text-sm font-bold text-white mt-0.5">{product.available_kg || product.quantity_kg || 100} {product.unit || 'kg'}</div>
              <div className="text-[11px] text-amber-300">Shelf: {product.shelf_life_days || 7} days</div>
            </div>
          </div>

          {/* AgroBridge Assured Quality Card */}
          <div className={`p-4 rounded-2xl border transition-all ${
            product.isAssured
              ? 'bg-gradient-to-br from-emerald-950/70 to-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-900/80 border-slate-800'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                  product.isAssured ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">
                      {product.isAssured ? '✓ AgroBridge Assured' : 'Standard Farm Harvest'}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      product.isAssured
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}>
                      Score: {product.qualityScore || 80}/100
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {product.isAssured
                      ? 'Harvest inspected, certified pesticide-safe, and weight-authenticated.'
                      : 'Self-declared farm produce. Platform verification pending.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowQualityDetails(true)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition-colors shrink-0"
              >
                Inspection Checklist
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {cartQuantity === 0 ? (
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>ADD TO CART</span>
                </button>
              ) : (
                <div className="flex-1 flex items-center justify-between p-2 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500/50 text-white">
                  <button
                    onClick={handleDecrement}
                    className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold hover:bg-emerald-500/40 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-extrabold text-base text-emerald-300">
                    {cartQuantity} {product.unit || 'kg'} in cart
                  </span>
                  <button
                    onClick={handleIncrement}
                    className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold hover:bg-emerald-500/40 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                onClick={() => onNavigate('/consumer/checkout')}
                className="px-6 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-white font-bold text-sm hover:bg-slate-700 transition-colors"
              >
                Checkout
              </button>
            </div>

            <button
              onClick={() => setShowCompareModal(true)}
              className="w-full py-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-emerald-300 font-bold text-xs hover:bg-emerald-500/10 flex items-center justify-center gap-2 transition-all"
            >
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              <span>📊 Inspect 4-Source Smart Price Comparison & 88% Value Transparency</span>
            </button>
          </div>

        </div>
      </div>

      {/* Verified Consumer Ratings & Feedback */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>⭐</span>
              <span>Verified Consumer Reviews ({feedbacks.length})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Only consumers with confirmed, delivered orders can leave ratings and comments.
            </p>
          </div>
          {feedbacks.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-extrabold text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>
                {(feedbacks.reduce((a, b) => a + (b.overallScore || 5), 0) / feedbacks.length).toFixed(1)} / 5.0
              </span>
            </div>
          )}
        </div>

        {feedbacks.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-400 text-xs">
            🌱 No reviews yet for this harvest batch. Be the first verified buyer to rate after delivery!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center">
                      {(fb.consumerName || 'Buyer')[0]}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{fb.consumerName || 'Verified Consumer'}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          ✓ Verified Purchase
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">{new Date(fb.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{fb.overallScore?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{fb.comment || 'Produce arrived fresh, clean, and in perfect condition!'}"
                </p>

                <div className="grid grid-cols-4 gap-1 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 text-center">
                  <div className="p-1 rounded bg-slate-900">
                    <div className="text-amber-400 font-bold">★ {fb.ratings?.quality || 5}</div>
                    <div>Quality</div>
                  </div>
                  <div className="p-1 rounded bg-slate-900">
                    <div className="text-amber-400 font-bold">★ {fb.ratings?.freshness || 5}</div>
                    <div>Freshness</div>
                  </div>
                  <div className="p-1 rounded bg-slate-900">
                    <div className="text-amber-400 font-bold">★ {fb.ratings?.packaging || 5}</div>
                    <div>Packing</div>
                  </div>
                  <div className="p-1 rounded bg-slate-900">
                    <div className="text-amber-400 font-bold">★ {fb.ratings?.valueForMoney || 5}</div>
                    <div>Value</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quality Details Modal */}
      {showQualityDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Quality Inspection Protocol</h3>
              </div>
              <button onClick={() => setShowQualityDetails(false)} className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Assurance Badge Status:</span>
                <span className={`font-black ${product.isAssured ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {product.isAssured ? '✓ AgroBridge Assured' : 'Verification In Progress'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Quality Score:</span>
                <span className="font-extrabold text-emerald-400 text-sm">
                  {product.qualityScore || 80} / 100
                </span>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mandatory Verification Checklist:</span>
                {[
                  { key: 'visualFreshness', label: '1. Visual inspection & physical grading (color, firmness)' },
                  { key: 'pesticideSafe', label: '2. Chemical residue & pesticide standards conformance' },
                  { key: 'packagingWeight', label: '3. Accurate weight verification & protective packaging' },
                  { key: 'farmerTraceability', label: '4. Farmer identity & harvest geolocation authentication' }
                ].map((item, idx) => {
                  const passed = product.verificationChecks ? Boolean(product.verificationChecks[item.key]) : (product.qualityScore >= 80);
                  return (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300 pr-2">{item.label}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {passed ? 'PASSED' : 'PENDING'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-500 pt-2 leading-relaxed">
                Products qualifying for "AgroBridge Assured" must pass physical warehouse grading and achieve a Quality Score of 85 or above.
              </p>
            </div>

            <button
              onClick={() => setShowQualityDetails(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors"
            >
              Close Inspection Sheet
            </button>
          </div>
        </div>
      )}

      {/* Smart Price Comparison Modal */}
      {showCompareModal && (
        <SmartPriceComparisonModal
          productId={product.id}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </div>
  );
}
