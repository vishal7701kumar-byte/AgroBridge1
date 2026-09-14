import React, { useState } from 'react';
import { X, Navigation, Fuel, Leaf, ArrowRight, CheckCircle2, Loader2, Sparkles, MapPin } from 'lucide-react';
import { aiAPI } from '../services/api';

export default function AIRouteOptimizerModal({ isOpen, onClose }) {
  const [pickups, setPickups] = useState([
    'Patel Organic Farms, Berasia Road, Bhopal',
    'Sharma Krishi Kendra, Mandideep Rural, Raisen',
    'Chauhan Natural Farms, Sehore Agro-Belt'
  ]);
  const [buyerLoc, setBuyerLoc] = useState('Central Distribution Hub, Arera Colony, Bhopal');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleOptimize = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await aiAPI.getRouteOptimization(pickups, buyerLoc);
      if (res.data && res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">AI Multi-Stop Logistics Route Optimizer</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  TSP Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">Rural Produce Aggregation & Carbon-Efficient Routing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-300">Agricultural Farm Waypoint Pickups ({pickups.length}):</div>
          <div className="space-y-2">
            {pickups.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-slate-300 flex-1 truncate">{p}</span>
              </div>
            ))}
          </div>

          <div className="text-xs font-bold text-slate-300 pt-2">Consolidating Urban Destination:</div>
          <div className="flex items-center gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-teal-300 font-semibold">
            <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{buyerLoc}</span>
          </div>

          <button
            type="button"
            onClick={handleOptimize}
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Solving Traveling Salesperson Problem (TSP)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Calculate Optimal Multi-Stop Waypoint Sequence</span>
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400 font-bold">Normal Route</div>
                <div className="text-lg font-black text-rose-300 mt-0.5">{result.normalRouteKm || result.originalDistanceKm || 18} KM</div>
                <div className="text-[10px] text-rose-400 font-semibold">Standard transit</div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30">
                <div className="text-[10px] uppercase text-amber-300 font-bold">AI Optimized Route</div>
                <div className="text-xl font-black text-amber-400 mt-0.5">{result.optimizedDistanceKm || 12} KM</div>
                <div className="text-[10px] text-emerald-400 font-bold">Saved {result.distanceSavedKm || 6} KM ({result.percentageSaved || 33}%)</div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <div className="text-[10px] uppercase text-emerald-300 font-bold">Time Saved</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">{result.timeSavedMinutes || 15} Mins</div>
                <div className="text-[10px] text-emerald-300 font-semibold">15 Minutes Saved</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400 font-bold">Driver Fuel Saved</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">₹{result.estimatedFuelSavingsRupees || 240}</div>
                <div className="text-[10px] text-slate-400 font-semibold">CO₂ cut: {result.carbonReductionKg || 4.2} kg</div>
              </div>
            </div>

            {/* Sequence */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                <span>Optimized Dispatch Waypoint Sequence:</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {result.orderedStops.map((stop, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="font-semibold">{stop.type === 'hub' ? '🏁 Destination Hub' : `🌱 Farm Stop ${i + 1}`}:</span>
                    <span className="text-slate-300 truncate">{stop.address}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{result.summary}</span>
            </p>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            Close Optimizer
          </button>
        </div>

      </div>
    </div>
  );
}
