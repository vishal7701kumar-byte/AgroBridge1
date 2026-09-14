import React, { useState, useEffect } from 'react';
import { 
  X, TrendingUp, TrendingDown, Sparkles, ShieldCheck, 
  Calendar, AlertCircle, RefreshCw, BarChart2, DollarSign, Info
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  Tooltip, CartesianGrid, ReferenceLine, AreaChart, Area
} from 'recharts';
import { aiAPI } from '../services/api';

const CROPS = [
  { name: 'Tomato', label: 'Fresh Tomatoes 🍅', icon: '🍅' },
  { name: 'Potato', label: 'Golden Potatoes 🥔', icon: '🥔' },
  { name: 'Onion', label: 'Red Onions 🧅', icon: '🧅' },
  { name: 'Wheat', label: 'Sharbati Wheat 🌾', icon: '🌾' },
  { name: 'Cucumber', label: 'Crisp Cucumbers 🥒', icon: '🥒' },
  { name: 'Apple', label: 'Royal Apples 🍎', icon: '🍎' }
];

export default function AICropPricePredictionModal({ isOpen, onClose, initialCrop = 'Tomato' }) {
  const [selectedCrop, setSelectedCrop] = useState(initialCrop);
  const [loading, setLoading] = useState(true);
  const [predictionData, setPredictionData] = useState(null);

  useEffect(() => {
    if (initialCrop) setSelectedCrop(initialCrop);
  }, [initialCrop]);

  useEffect(() => {
    if (isOpen) {
      fetchPrediction(selectedCrop);
    }
  }, [isOpen, selectedCrop]);

  const fetchPrediction = async (crop) => {
    setLoading(true);
    try {
      const res = await aiAPI.getPricePrediction(crop);
      if (res.data && res.data.success) {
        setPredictionData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch AI price prediction:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 text-slate-100">
        
        {/* Header Strip */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  AI Crop Price Prediction Engine
                </h2>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  AI-Based Prediction
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Econometric predictive modeling over regional Mandi benchmarks, arrivals, and institutional requisitions.
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

        {/* Crop Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CROPS.map(c => (
            <button
              key={c.name}
              onClick={() => setSelectedCrop(c.name)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCrop.toLowerCase() === c.name.toLowerCase()
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-105'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="min-h-[300px] flex flex-col items-center justify-center gap-3 py-16">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Synthesizing multi-horizon market trajectory...</p>
          </div>
        ) : predictionData ? (
          <div className="space-y-6">

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-slate-400">Current Farm Price</span>
                <div className="mt-2 text-xl sm:text-2xl font-black text-white">
                  ₹{predictionData.currentPrice}<span className="text-xs font-normal text-slate-400">/kg</span>
                </div>
                <span className="text-[10px] text-emerald-400 mt-1">Direct AgroBridge rate</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-slate-400">Mandi Benchmark</span>
                <div className="mt-2 text-xl sm:text-2xl font-black text-slate-300">
                  ₹{predictionData.mandiPrice}<span className="text-xs font-normal text-slate-400">/kg</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1">APMC auction rate</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-600/40 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Minimum Safe Price
                </span>
                <div className="mt-2 text-xl sm:text-2xl font-black text-amber-300">
                  ₹{predictionData.minSafePrice}<span className="text-xs font-normal text-amber-400/80">/kg</span>
                </div>
                <span className="text-[10px] text-amber-400/80 mt-1">Farmer break-even floor</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Next 7 Days
                </span>
                <div className="mt-2 text-xl sm:text-2xl font-black text-emerald-400 flex items-center gap-1">
                  <span>₹{predictionData.predicted7d}</span>
                  <span className="text-base font-normal">📈</span>
                </div>
                <span className="text-[10px] text-emerald-300 mt-1 font-semibold">
                  +{Math.round(((predictionData.predicted7d - predictionData.currentPrice) / predictionData.currentPrice) * 100)}% expected
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-500/40 col-span-2 sm:col-span-1 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-teal-300 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Next 14 Days
                </span>
                <div className="mt-2 text-xl sm:text-2xl font-black text-teal-300 flex items-center gap-1">
                  <span>₹{predictionData.predicted14d}</span>
                  <span className="text-base font-normal">📈</span>
                </div>
                <span className="text-[10px] text-teal-300 mt-1 font-semibold">
                  +{Math.round(((predictionData.predicted14d - predictionData.currentPrice) / predictionData.currentPrice) * 100)}% projected
                </span>
              </div>
            </div>

            {/* AI Recommendation Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xl">
                🤖
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                  <span>AI Strategic Recommendation</span>
                  <span className="text-[10px] font-mono text-slate-400">Confidence: {predictionData.confidencePercentage}%</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  "{predictionData.aiRecommendation}"
                </p>
              </div>
            </div>

            {/* Interactive Recharts Graph */}
            <div className="space-y-3 bg-slate-950/80 border border-slate-800 rounded-3xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-emerald-400" />
                    <span>21-Day Price Trend & Forecast Horizon</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    X-Axis: Days (-7 Historical ➔ Day 0 Today ➔ +14 Projected) • Y-Axis: Price (₹/kg)
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span> Historical
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Predicted
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Safe Floor
                  </span>
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictionData.timeline} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false}
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={predictionData.minSafePrice} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Safe Floor', fill: '#f59e0b', fontSize: 10, position: 'insideBottomRight' }} />
                    <Line 
                      type="monotone" 
                      dataKey="historicalPrice" 
                      stroke="#94a3b8" 
                      strokeWidth={2.5} 
                      dot={{ r: 3, fill: '#94a3b8' }} 
                      name="Historical Price" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predictedPrice" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      strokeDasharray="5 5"
                      dot={{ r: 4, fill: '#10b981' }} 
                      activeDot={{ r: 6 }}
                      name="Predicted Price" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Footer Transparency Disclaimer */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
              <Info className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{predictionData.disclaimer}</span>
            </div>

          </div>
        ) : null}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            Close Insight
          </button>
        </div>

      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-xl text-xs space-y-1">
        <div className="font-bold text-white border-b border-slate-800 pb-1 flex items-center justify-between gap-3">
          <span>{data.label || label}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
            data.type === 'Historical' ? 'bg-slate-800 text-slate-400' :
            data.type === 'Current' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {data.type}
          </span>
        </div>
        {data.historicalPrice && (
          <div className="text-slate-300 flex justify-between gap-4">
            <span>Historical:</span>
            <span className="font-mono font-bold">₹{data.historicalPrice}/kg</span>
          </div>
        )}
        {data.predictedPrice && (
          <div className="text-emerald-400 flex justify-between gap-4">
            <span>AI Forecast:</span>
            <span className="font-mono font-bold">₹{data.predictedPrice}/kg 📈</span>
          </div>
        )}
        <div className="text-amber-400/80 flex justify-between gap-4 text-[10px]">
          <span>Min Safe Floor:</span>
          <span className="font-mono font-bold">₹{data.minSafePrice}/kg</span>
        </div>
      </div>
    );
  }
  return null;
}
