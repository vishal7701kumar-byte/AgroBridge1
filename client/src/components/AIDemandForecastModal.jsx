import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Sparkles, MapPin, Calendar, CheckCircle2, AlertCircle, BarChart3, Loader2 } from 'lucide-react';
import { aiAPI } from '../services/api';

export default function AIDemandForecastModal({ isOpen, onClose, initialCommodity = 'Tomato' }) {
  const [commodity, setCommodity] = useState(initialCommodity);
  const [region, setRegion] = useState('Bhopal');
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState(null);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const res = await aiAPI.getDemandForecast(commodity, region);
      if (res.data && res.data.success) {
        setForecast(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchForecast();
    }
  }, [isOpen, commodity, region]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">AI Regional Demand Forecasting</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  7-Day Predictive
                </span>
              </div>
              <p className="text-xs text-slate-400">Deep Machine Learning Supply-Demand Equilibrium Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Crop / Commodity</label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Tomato">Tomato (Hybrid / Desi)</option>
              <option value="Wheat">Wheat (Sharbati / Lokwan)</option>
              <option value="Onion">Onion (Nasik Red)</option>
              <option value="Soybean">Soybean (Yellow)</option>
              <option value="Potato">Potato (Jyoti / Kufri)</option>
              <option value="Cauliflower">Cauliflower</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Consuming Hub Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Bhopal">Bhopal Urban & Industrial</option>
              <option value="Indore">Indore Metro & Commercial</option>
              <option value="Sehore">Sehore Rural Aggregation</option>
              <option value="Ujjain">Ujjain Religious & Urban Hub</option>
              <option value="Jabalpur">Jabalpur Eastern Hub</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
            <div className="text-xs text-slate-400">Evaluating multi-district consumer intake & mandi arrival curves...</div>
          </div>
        ) : forecast ? (
          <div className="space-y-5 animate-fadeIn">
            
            {/* Top Stat Highlights */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400 font-bold">7-Day Projected Need</div>
                <div className="text-xl font-black text-white mt-0.5">
                  {forecast.totalWeeklyProjectedDemandQuintals} <span className="text-xs font-normal text-slate-400">Qtls</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Surging Urban Inflow</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                <div className="text-[10px] uppercase text-emerald-300 font-bold">Price Momentum</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">{forecast.expectedPriceTrend}</div>
                <div className="text-[10px] text-emerald-300 font-semibold mt-0.5">Higher Farm Realization</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400 font-bold">Market Confidence</div>
                <div className="text-xl font-black text-teal-300 mt-0.5">{forecast.confidenceScore || 94}%</div>
                <div className="text-[10px] text-slate-400 font-semibold mt-0.5">High Confidence</div>
              </div>
            </div>

            {/* 7-Day Day-by-Day Forecast Bars */}
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-3">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>Daily Demand Timeline & Pressure</span>
                </span>
                <span className="text-[10px] text-slate-400">Direct Delivery Target</span>
              </div>

              <div className="space-y-2">
                {forecast.forecastDays.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                    <span className="w-20 text-slate-400 font-mono text-[11px]">{f.day}</span>
                    <div className="flex-1 bg-slate-900 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          f.demandLevel === 'SURGING'
                            ? 'bg-rose-500'
                            : f.demandLevel === 'HIGH'
                            ? 'bg-emerald-500'
                            : 'bg-teal-500'
                        }`}
                        style={{ width: `${Math.min(100, (f.projectedDemandQuintals / 350) * 100)}%` }}
                      />
                    </div>
                    <span className="w-16 text-right font-bold text-slate-200">{f.projectedDemandQuintals} Q</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      f.demandLevel === 'SURGING'
                        ? 'bg-rose-500/20 text-rose-300'
                        : f.demandLevel === 'HIGH'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-teal-500/20 text-teal-300'
                    }`}>
                      {f.demandLevel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bilingual AI Farmer Advisory */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 to-slate-950 border border-emerald-500/30 space-y-2">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>AI Advisory for Farmers & Producers:</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {forecast.aiAdvisory}
              </p>
              {forecast.hindiAdvisory && (
                <p className="text-xs text-emerald-200/90 font-medium pt-1 border-t border-emerald-900/60 leading-relaxed">
                  📢 <strong>किसान सलाह:</strong> {forecast.hindiAdvisory}
                </p>
              )}
            </div>

          </div>
        ) : null}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            Close Forecast
          </button>
        </div>

      </div>
    </div>
  );
}
