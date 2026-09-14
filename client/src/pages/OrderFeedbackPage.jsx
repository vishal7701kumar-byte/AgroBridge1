import React, { useState, useEffect } from 'react';
import { consumerAPI } from '../services/api';
import {
  Star,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  PackageCheck,
  Send,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

export default function OrderFeedbackPage({ currentRoute, onNavigate }) {
  // Extract order ID from route: e.g. /consumer/orders/:id/feedback or /orders/:id/feedback
  const pathParts = currentRoute.split('/');
  const feedbackIdx = pathParts.indexOf('feedback');
  const orderId = feedbackIdx > 0 ? pathParts[feedbackIdx - 1] : 'ORD-9101';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState('');

  // 4 Specific Criteria Ratings (1-5)
  const [ratings, setRatings] = useState({
    quality: 5,
    farmerExperience: 5,
    packaging: 5,
    accuracy: 5
  });

  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState(null);

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      try {
        const res = await consumerAPI.getOrderById(orderId);
        if (res.data?.success && res.data?.data) {
          const ord = res.data.data;
          setOrder(ord);
          if (ord.items && ord.items.length > 0) {
            setSelectedProductId(ord.items[0].product_id || ord.items[0].id);
          }
        } else {
          setError('Order details could not be found.');
        }
      } catch (err) {
        console.error('Error loading order:', err);
        setError('Order could not be loaded. Please ensure you are logged in.');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  const setCriteriaRating = (field, val) => {
    setRatings(prev => ({ ...prev, [field]: val }));
  };

  const overallRating = Math.round(
    ((ratings.quality + ratings.farmerExperience + ratings.packaging + ratings.accuracy) / 4) * 10
  ) / 10;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!order) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await consumerAPI.submitFeedback({
        orderId: order.id,
        productId: selectedProductId,
        ratings,
        review
      });
      if (res.data?.success && res.data?.data) {
        setSubmittedFeedback(res.data.data);
      } else {
        setError(res.data?.error || 'Failed to submit feedback.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to submit feedback. Ensure your order is delivered.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono">Verifying purchase credentials for {orderId}...</p>
      </div>
    );
  }

  const isDelivered = order && (order.status || '').toLowerCase() === 'delivered';
  const selectedItem = order?.items?.find(i => (i.product_id === selectedProductId || i.id === selectedProductId)) || order?.items?.[0];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fadeIn">
      {/* Top back button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate('/consumer/dashboard')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Consumer Dashboard</span>
        </button>
        <span className="text-[11px] font-mono text-slate-500">Order: #{orderId}</span>
      </div>

      {/* Main card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Success View */}
        {submittedFeedback ? (
          <div className="text-center py-8 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-3xl animate-bounce">
              ⭐
            </div>
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Purchaser Review Published
              </span>
              <h2 className="text-2xl font-black text-white pt-2">Thank You for Supporting Local Farmers!</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Your feedback has been published on {submittedFeedback.farmer_name}’s profile with an overall rating of <strong className="text-emerald-400">{submittedFeedback.overallRating}★</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">{submittedFeedback.product_name}</span>
                <span className="font-mono text-emerald-400 font-bold">{submittedFeedback.overallRating} / 5.0</span>
              </div>
              <p className="text-slate-400 italic">"{submittedFeedback.review}"</p>
            </div>

            <div className="pt-3 flex justify-center gap-3">
              <button
                onClick={() => onNavigate('/consumer/dashboard')}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : !isDelivered ? (
          /* Order Not Delivered Warning */
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-2xl">
              <PackageCheck className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">Order In Transit / Unverified</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              AgroBridge strictly guarantees authentic reviews: feedback can only be submitted after your order has been physically verified and delivered by the driver OTP.
            </p>
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 max-w-xs mx-auto text-xs font-mono text-amber-400">
              Current Order Status: {(order?.status || 'In Transit').toUpperCase()}
            </div>
            <button
              onClick={() => onNavigate(`/consumer/orders/${orderId}/track`)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              Track Live Delivery
            </button>
          </div>
        ) : (
          /* Feedback Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Purchaser Review
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Delivery Verified</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Rate Your Direct Farm Produce
                </h1>
                <p className="text-xs text-slate-400">
                  Help local farmers maintain high standards and transparent pricing on AgroBridge.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500">Overall Score</span>
                <div className="text-2xl font-black text-emerald-400 flex items-center gap-1 justify-end">
                  <span>{overallRating}</span>
                  <Star className="w-5 h-5 fill-emerald-400 text-emerald-400" />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-600/50 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Produce Item Selector */}
            {order?.items && order.items.length > 1 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Select Purchased Item to Review:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {order.items.map((item) => (
                    <div
                      key={item.product_id || item.id}
                      onClick={() => setSelectedProductId(item.product_id || item.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedProductId === (item.product_id || item.id)
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{item.product_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {item.quantity_kg || item.quantity} kg • {item.farm_name || 'Direct Farm'}
                        </div>
                      </div>
                      {selectedProductId === (item.product_id || item.id) && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected item badge */}
            {selectedItem && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg">
                    🌾
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{selectedItem.product_name}</div>
                    <div className="text-[11px] text-slate-400">
                      Farmer: <strong className="text-emerald-400">{selectedItem.farm_name || 'Local Producer'}</strong>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-300">
                  {selectedItem.quantity_kg || selectedItem.quantity} kg • ₹{selectedItem.subtotal || selectedItem.price_per_kg * 5}
                </span>
              </div>
            )}

            {/* Rating Criteria Matrix */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Multi-Criteria Evaluation (1 - 5 Stars)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Quality & Freshness */}
                <StarRatingRow
                  label="Produce Quality & Freshness"
                  subtitle="Texture, crispness, natural aroma"
                  value={ratings.quality}
                  onChange={(v) => setCriteriaRating('quality', v)}
                />

                {/* 2. Farmer Experience */}
                <StarRatingRow
                  label="Farmer Experience & Honesty"
                  subtitle="Grade accuracy and authenticity"
                  value={ratings.farmerExperience}
                  onChange={(v) => setCriteriaRating('farmerExperience', v)}
                />

                {/* 3. Packaging & Cleanliness */}
                <StarRatingRow
                  label="Packaging & Hygiene"
                  subtitle="Crates/bags, clean harvest handling"
                  value={ratings.packaging}
                  onChange={(v) => setCriteriaRating('packaging', v)}
                />

                {/* 4. Accuracy of Listing */}
                <StarRatingRow
                  label="Accuracy of Listing"
                  subtitle="Weight delivered vs order quantity"
                  value={ratings.accuracy}
                  onChange={(v) => setCriteriaRating('accuracy', v)}
                />
              </div>
            </div>

            {/* Quick recommendation chips */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-300">Quick Tags (Click to append):</label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Super fresh produce',
                  'Excellent direct packaging',
                  'Sweet and fully ripe',
                  'Exact harvest weight',
                  'Far better than mandi quality',
                  'Will reorder weekly'
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setReview(prev => prev ? `${prev} ${chip}.` : `${chip}.`)}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-300 transition-colors"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Written Review Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Detailed Consumer Review (Optional but recommended):</span>
                <span className="text-[10px] text-slate-500 font-mono">{review.length} chars</span>
              </label>
              <textarea
                rows={4}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Describe your cooking experience, freshness, shelf life, and whether you recommend this farmer to other buyers..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs tracking-wide shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Publishing Verified Feedback...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Publish Verified Farmer Review ({overallRating}★)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Sub-component for interactive 5-star row
function StarRatingRow({ label, subtitle, value, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold text-white">{label}</div>
          <div className="text-[10px] text-slate-500">{subtitle}</div>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-400">{hover || value} / 5</span>
      </div>

      <div className="flex items-center gap-1.5 pt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="p-1 rounded-lg hover:scale-110 transition-transform focus:outline-none"
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                star <= (hover || value)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-700'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
