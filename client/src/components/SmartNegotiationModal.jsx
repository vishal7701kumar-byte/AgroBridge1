import React, { useState, useEffect } from 'react';
import { 
  X, Scale, ShieldAlert, CheckCircle2, TrendingUp, 
  ArrowRight, Sparkles, AlertTriangle, Check, DollarSign
} from 'lucide-react';
import { aiAPI } from '../services/api';

export default function SmartNegotiationModal({ 
  isOpen, 
  onClose, 
  orderData, 
  onAccept, 
  onReject, 
  onCounterOffer 
}) {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [showCounterInput, setShowCounterInput] = useState(false);

  const crop = orderData?.product_name || orderData?.productName || 'Fresh Tomatoes';
  const buyerName = orderData?.buyer_name || orderData?.buyerName || orderData?.buyer_business || 'ABC Food Processing';
  const quantityKg = orderData?.quantity_kg || orderData?.quantityKg || 500;
  const buyerOffer = orderData?.unit_price || orderData?.offeredPrice || 28;
  const farmerPrice = orderData?.farmerPrice || 35;
  const farmerMinSafePrice = orderData?.minSafePrice || 24;

  useEffect(() => {
    if (isOpen) {
      fetchAnalysis();
    }
  }, [isOpen, crop, buyerOffer]);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const res = await aiAPI.evaluateNegotiation({
        crop,
        farmerMinPrice: farmerMinSafePrice,
        buyerOffer,
        marketPrice: farmerPrice
      });
      if (res.data && res.data.success) {
        setAnalysis(res.data.data);
        setCounterPrice(res.data.data.suggestedCounterOffer || farmerPrice);
      }
    } catch (err) {
      console.error('Failed to evaluate negotiation:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 text-slate-100">
        
        {/* Header Strip */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Smart Negotiation Assistant
                </h2>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
                  AI Deal Arbitrage
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates buyer offer against market benchmarks & preserves your Minimum Safe Price.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offer Summary Banner */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Wholesale Requisition</span>
            <h3 className="text-base font-black text-white">{crop} ({quantityKg} kg)</h3>
            <p className="text-xs text-slate-400">Buyer: <span className="text-slate-200 font-semibold">{buyerName}</span></p>
          </div>
          <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
            <span className="text-xs text-slate-400">Buyer Offer:</span>
            <div className="text-2xl font-black text-indigo-400">
              ₹{buyerOffer}<span className="text-xs font-normal text-slate-400">/kg</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Total: ₹{(buyerOffer * quantityKg).toLocaleString()}</span>
          </div>
        </div>

        {/* 3-Way Price Comparative Strip */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Your Listed Price</span>
            <div className="text-lg sm:text-xl font-black text-white mt-1">₹{farmerPrice}/kg</div>
            <span className="text-[10px] text-slate-500">Preferred return</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-600/40">
            <span className="text-[11px] font-semibold text-amber-300">Min Safe Price</span>
            <div className="text-lg sm:text-xl font-black text-amber-400 mt-1">₹{farmerMinSafePrice}/kg</div>
            <span className="text-[10px] text-amber-500/80">Break-even floor</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/40">
            <span className="text-[11px] font-semibold text-indigo-300">Buyer Offer</span>
            <div className="text-lg sm:text-xl font-black text-indigo-400 mt-1">₹{buyerOffer}/kg</div>
            <span className="text-[10px] text-indigo-300/80">Offered rate</span>
          </div>
        </div>

        {/* AI Negotiation Analysis Box */}
        {analysis && (
          <div className={`p-4 sm:p-5 rounded-2xl border ${
            analysis.isBelowSafePrice 
              ? 'bg-rose-950/30 border-rose-600/50 text-rose-200' 
              : 'bg-indigo-950/30 border-indigo-500/40 text-indigo-200'
          } space-y-3`}>
            <div className="flex items-start gap-3">
              {analysis.isBelowSafePrice ? (
                <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
                <div className="font-black text-white flex items-center gap-2">
                  <span>AI Advisory Recommendation</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-900 border border-slate-700">
                    Range: {analysis.recommendedRange?.formatted}
                  </span>
                </div>
                <p className="text-slate-300 font-medium">
                  {analysis.aiRecommendation}
                </p>
              </div>
            </div>

            {/* Invariant Warning if below safe price */}
            {analysis.isBelowSafePrice && (
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-600/60 text-[11px] text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>Safety Rule Enforced:</strong> Auto-accepting deals below Minimum Safe Price is disabled to protect farmer profitability.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Counter Offer Input Box */}
        {showCounterInput && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-3 animate-fadeIn">
            <label className="text-xs font-bold text-white block">
              Enter Your Counter Offer Price (₹/kg):
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min={farmerMinSafePrice}
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-black text-base focus:border-indigo-500 outline-none"
                />
              </div>
              <button
                onClick={() => {
                  if (onCounterOffer) onCounterOffer(counterPrice);
                  onClose();
                }}
                disabled={parseFloat(counterPrice) < farmerMinSafePrice}
                className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white text-xs font-black transition-all shadow-md shadow-indigo-500/20"
              >
                Send Counter Offer
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              AI suggested counter price: <span className="text-indigo-400 font-bold">₹{analysis?.suggestedCounterOffer || farmerPrice}/kg</span>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              if (onReject) onReject();
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 hover:border-rose-600/40 border border-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            Reject Offer
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowCounterInput(!showCounterInput)}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all"
            >
              {showCounterInput ? 'Hide Counter' : 'Counter Offer'}
            </button>

            <button
              onClick={() => {
                if (onAccept) onAccept();
                onClose();
              }}
              disabled={analysis?.isBelowSafePrice}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-black transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Accept Offer</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
