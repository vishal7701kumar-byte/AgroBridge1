import React, { useState, useEffect } from 'react';
import { 
  X, AlertTriangle, Sparkles, DollarSign, Users, Bell, 
  CheckCircle2, Clock, ArrowRight, RefreshCw, Check
} from 'lucide-react';
import { farmerAPI } from '../services/api';

export default function AIWasteAlertModal({ isOpen, onClose, onAlertsUpdated }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [broadcastingId, setBroadcastingId] = useState(null);
  const [successNotifiedId, setSuccessNotifiedId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchAlerts();
    }
  }, [isOpen]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await farmerAPI.getWasteAlerts();
      if (res.data && res.data.success) {
        setAlerts(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch waste alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotifyBulkBuyers = async (alert) => {
    setBroadcastingId(alert.cropId);
    try {
      const res = await farmerAPI.notifyBulkBuyersDiscount({
        cropId: alert.cropId,
        discountedPrice: alert.suggestedPrice
      });
      if (res.data && res.data.success) {
        setSuccessNotifiedId(alert.cropId);
        setTimeout(() => setSuccessNotifiedId(null), 4000);
        if (onAlertsUpdated) onAlertsUpdated();
      }
    } catch (err) {
      console.error('Failed to notify bulk buyers:', err);
    } finally {
      setBroadcastingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 text-slate-100">
        
        {/* Header Strip */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  AI Waste Reduction & Alert System
                </h2>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  Zero Waste AI
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Proactively detects unsold inventory past the freshness threshold and alerts regional bulk buyers.
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

        {loading ? (
          <div className="min-h-[260px] flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-xs text-slate-400">Scanning inventory shelf-life parameters...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Zero Waste Detected!</h4>
            <p className="text-xs text-slate-400">All current harvests have high turnover rates and are within safe freshness limits.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const isNotified = successNotifiedId === alert.cropId;
              const isBroadcasting = broadcastingId === alert.cropId;

              return (
                <div
                  key={alert.cropId}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-amber-500/30 hover:border-amber-500/60 transition-all space-y-4 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={alert.image}
                        alt={alert.productName}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-800 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-white">{alert.productName}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Unsold: {alert.daysUnsold} Days
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span>Remaining: <strong className="text-slate-200">{alert.remainingKg} kg</strong></span>
                          <span>•</span>
                          <span>Original: <strong>₹{alert.currentPrice}/kg</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                      <span className="text-[11px] text-slate-400">AI Suggested 5% Discount:</span>
                      <div className="text-2xl font-black text-emerald-400">
                        ₹{alert.suggestedPrice}<span className="text-xs font-normal text-slate-400">/kg</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendation Box */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      {alert.aiAdvisory}
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 text-xs text-indigo-300 font-semibold">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <span>Nearby Potential Buyers: <strong>{alert.nearbyBuyersCount} Commercial Entities</strong></span>
                    </div>

                    <button
                      onClick={() => handleNotifyBulkBuyers(alert)}
                      disabled={isBroadcasting || isNotified}
                      className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        isNotified
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 shadow-lg shadow-amber-500/20'
                      }`}
                    >
                      {isBroadcasting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Broadcasting Alert...</span>
                        </>
                      ) : isNotified ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Bulk Buyers Notified!</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4" />
                          <span>Apply 5% Off & Notify Bulk Buyers</span>
                        </>
                      )}
                    </button>
                  </div>

                  {isNotified && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-[11px] text-emerald-200 flex items-center gap-2 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Broadcast sent! 12 nearby restaurant and wholesale buyers have received high-priority alerts with your special ₹{alert.suggestedPrice}/kg rate.
                      </span>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
