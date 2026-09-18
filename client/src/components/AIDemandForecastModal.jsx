import React, { useState, useEffect } from 'react';
import { 
  X, 
  TrendingUp, 
  Sparkles, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  BarChart3, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Database, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { aiAPI } from '../services/api';

export default function AIDemandForecastModal({ isOpen, onClose, initialCommodity = 'Tomato' }) {
  const [commodity, setCommodity] = useState(initialCommodity);
  const [region, setRegion] = useState('Bhopal');
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [showWhyFactors, setShowWhyFactors] = useState(false);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const res = await aiAPI.getDemandForecast(commodity, region);
      if (res.data && res.data.success) {
        setForecast(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching demand forecast:', err);
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

  const maxQtlInHorizon = forecast?.forecastDays?.length 
    ? Math.max(...forecast.forecastDays.map(f => f.projectedDemandQuintals || 0), 40)
    : 100;

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
              <p className="text-xs text-slate-400">Grounded in APMC Daily Inflows & Consumption Equilibrium</p>
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
              <option value="Cucumber">Cucumber</option>
              <option value="Apple">Apple (Shimla / Royal)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Consuming Hub Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Bhopal">Bhopal Urban & Industrial Hub</option>
              <option value="Indore">Indore Metro & Commercial Center</option>
              <option value="Sehore">Sehore Rural Aggregation Mandi</option>
              <option value="Ujjain">Ujjain Religious & Urban Belt</option>
              <option value="Jabalpur">Jabalpur Eastern Agricultural Corridor</option>
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
                <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                  {forecast.demandLevel || 'Steady Regional Inflow'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                <div className="text-[10px] uppercase text-emerald-300 font-bold">Price Momentum</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">
                  {forecast.expectedPriceTrend || '→ Stable'}
                </div>
                <div className="text-[10px] text-emerald-300 font-semibold mt-0.5">
                  7d vs 14d APMC Average
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400 font-bold">Forecast Reliability</div>
                <div className="text-xl font-black text-teal-300 mt-0.5">
                  {forecast.forecastReliability || 'High'}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  {forecast.forecastReliabilityDetail || 'Validated APMC Feeds'}
                </div>
              </div>
            </div>

            {/* Cold Start Notice (Honest Disclosure) */}
            {(forecast.coldStart || forecast.isColdStart || forecast.coldStartNote) && (
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200/90 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-amber-300">Marketplace Cold-Start Disclosure: </span>
                  {forecast.coldStartNote || 'AgroBridge is still collecting local order history. Current forecast is primarily based on available historical market data.'}
                </div>
              </div>
            )}

            {/* 7-Day Day-by-Day Forecast Bars */}
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-3">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>Daily Demand Timeline & Intake Pressure</span>
                </span>
                <span className="text-[10px] text-slate-400">Direct Delivery Target</span>
              </div>

              <div className="space-y-2">
                {(forecast.forecastDays || []).map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                    <span className="w-20 text-slate-400 font-mono text-[11px]">{f.day}</span>
                    <div className="flex-1 bg-slate-900 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          f.demandLevel === 'SURGING'
                            ? 'bg-rose-500'
                            : f.demandLevel === 'HIGH'
                            ? 'bg-emerald-500'
                            : 'bg-teal-500'
                        }`}
                        style={{ width: `${Math.min(100, (f.projectedDemandQuintals / maxQtlInHorizon) * 100)}%` }}
                      />
                    </div>
                    <span className="w-16 text-right font-bold text-slate-200">{f.projectedDemandQuintals} Q</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      f.demandLevel === 'SURGING'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : f.demandLevel === 'HIGH'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    }`}>
                      {f.demandLevel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expandable "Why am I seeing this?" Factor Breakdown */}
            <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowWhyFactors(!showWhyFactors)}
                className="w-full px-4 py-3 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-400" />
                  <span>Why am I seeing this forecast? (Explainable AI Factors)</span>
                </span>
                {showWhyFactors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showWhyFactors && (
                <div className="px-4 pb-4 pt-1 space-y-2.5 border-t border-slate-800/80 animate-fadeIn">
                  <div className="text-[11px] text-slate-400">
                    Model inputs evaluated for {commodity} in {region}:
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(forecast.whyFactors || forecast.reasons || []).map((reason, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </li>
                    ))}
                    {(forecast.factorsConsidered || []).map((factor, j) => (
                      <li key={`factor-${j}`} className="flex items-start gap-2 text-slate-400 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 mt-1.5 ml-1 mr-0.5" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                  {forecast.farmerSuggestion && (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-emerald-300/90 leading-relaxed mt-2">
                      💡 <strong>Action Insight:</strong> {forecast.farmerSuggestion}
                    </div>
                  )}
                </div>
              )}
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

            {/* Verified Data Source Provenance Card */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Source: <strong>Government of India AGMARKNET (data.gov.in)</strong>
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Live Government Grounding
              </span>
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
