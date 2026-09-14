import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { aiAPI } from '../services/api';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

const COMMODITY_OPTIONS = [
  { value: 'Tomato', label: '🍅 Organic Hybrid Tomatoes' },
  { value: 'Wheat', label: '🌾 Sharbati Premium Wheat' },
  { value: 'Onion', label: '🧅 Red Nashik Onions' },
  { value: 'Potato', label: '🥔 Fresh Golden Potatoes' },
  { value: 'Cucumber', label: '🥒 Seedless Cucumbers' },
  { value: 'Spinach', label: '🥬 Baby Spinach (Palak)' },
  { value: 'Soybean', label: '🌱 Yellow Soya Beans' },
  { value: 'Apple', label: '🍎 Shimla Royal Apples' },
  { value: 'Banana', label: '🍌 Robusta Bananas' },
  { value: 'Rice', label: '🍚 Long Grain Basmati Rice' }
];

export default function FutureInsightsChart({ initialRole = 'farmer', compact = false, showHeader = true }) {
  const [activeRole, setActiveRole] = useState(initialRole.toLowerCase()); // 'farmer' or 'consumer'
  const [commodity, setCommodity] = useState('Tomato');
  const [period, setPeriod] = useState('7d'); // '7d', '30d', '3m'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await aiAPI.getFutureInsights(commodity, period, activeRole.toUpperCase());
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch future insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [commodity, period, activeRole]);

  const points = data?.points || [];

  return (
    <div className={`rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-md ${compact ? 'text-xs' : ''}`}>
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      {showHeader && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                AI-Assisted Forecast
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-800/80 border border-slate-700/60 text-slate-400">
                Demo Forecast Data
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {data?.confidenceScore || 92}% Confidence Score
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Future Market & Demand Dynamics</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
              Predictive models projecting agricultural supply, seasonal demand surges, and farm-gate fair pricing trends.
            </p>
          </div>

          {/* Role Toggle Switch */}
          <div className="flex items-center self-start md:self-auto bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveRole('farmer')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeRole === 'farmer'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>👨‍🌾 Farmer View</span>
              <span className="text-[10px] opacity-75">(Demand kg)</span>
            </button>
            <button
              onClick={() => setActiveRole('consumer')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeRole === 'consumer'
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🛒 Consumer View</span>
              <span className="text-[10px] opacity-75">(Price ₹)</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and control bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-5 pb-4">
        {/* Commodity selector dropdown */}
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <label className="text-xs font-bold text-slate-400 whitespace-nowrap">Commodity:</label>
          <select
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
          >
            {COMMODITY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Time period toggle pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '3m', label: '3 Months' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setPeriod(t.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                period === t.id
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
          <button
            onClick={fetchInsights}
            title="Refresh forecast data"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metric summary badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            {activeRole === 'farmer' ? 'Projected Total Demand' : 'Current Market Rate'}
          </span>
          <div className="text-lg sm:text-xl font-black text-white mt-0.5">
            {activeRole === 'farmer'
              ? `${(data?.projectedDemandTotal || 0).toLocaleString()} ${data?.unit || 'kg'}`
              : `₹${data?.currentMarketPrice || 28} / ${data?.unit || 'kg'}`}
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3" />
            {data?.trend || '+14% Rising'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            {activeRole === 'farmer' ? 'Market Trend Direction' : 'Avg Forecasted Price'}
          </span>
          <div className="text-lg sm:text-xl font-black text-emerald-400 mt-0.5">
            {activeRole === 'farmer'
              ? (data?.trend || 'HIGH DEMAND')
              : `₹${data?.averagePriceOverPeriod || 28.5} / ${data?.unit || 'kg'}`}
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5">
            Volatility: {data?.volatility || 'Low'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            Forecast Horizon
          </span>
          <div className="text-lg sm:text-xl font-black text-teal-300 mt-0.5">
            {period === '7d' ? '7-Day Rolling' : period === '30d' ? '30-Day Monthly' : 'Quarterly (3M)'}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
            Harvest Lag: {data?.harvestLag || '3 days'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            AI Model Confidence
          </span>
          <div className="text-lg sm:text-xl font-black text-amber-400 mt-0.5">
            {data?.confidenceScore || 92.4}%
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5">
            Historical + APMC Feeds
          </span>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="mt-4 pt-2 pb-2 bg-slate-950/40 rounded-2xl border border-slate-800/50 p-2 sm:p-4">
        {loading ? (
          <div className="h-64 sm:h-72 flex flex-col items-center justify-center gap-2 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs font-mono">Computing predictive regressions & trendlines...</span>
          </div>
        ) : (
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#334155' }}
                  domain={['auto', 'auto']}
                  unit={activeRole === 'farmer' ? ` ${data?.unit || 'kg'}` : ' ₹'}
                />
                <Tooltip content={<CustomTooltip activeRole={activeRole} unit={data?.unit} />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
                  formatter={(value) => <span className="text-slate-300 font-semibold">{value}</span>}
                />

                {activeRole === 'farmer' ? (
                  <>
                    {/* Historical demand up to current point (solid) */}
                    <Line
                      type="monotone"
                      dataKey="demand"
                      name="Historical Demand (Observed)"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#10b981', strokeWidth: 1.5, stroke: '#064e3b' }}
                      activeDot={{ r: 6, fill: '#34d399' }}
                      connectNulls={false}
                    />
                    {/* Forecasted demand from current point onwards (dashed) */}
                    <Line
                      type="monotone"
                      dataKey="forecastDemand"
                      name="AI Projected Demand (Forecast)"
                      stroke="#34d399"
                      strokeWidth={2.5}
                      strokeDasharray="5 5"
                      dot={{ r: 4, fill: '#34d399', strokeWidth: 1.5, stroke: '#064e3b' }}
                      activeDot={{ r: 6, fill: '#6ee7b7' }}
                      connectNulls={false}
                    />
                  </>
                ) : (
                  <>
                    {/* Historical price up to current point (solid) */}
                    <Line
                      type="monotone"
                      dataKey="price"
                      name="Observed Price (₹/kg)"
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#06b6d4', strokeWidth: 1.5, stroke: '#164e63' }}
                      activeDot={{ r: 6, fill: '#22d3ee' }}
                      connectNulls={false}
                    />
                    {/* Forecasted price from current point onwards (dashed) */}
                    <Line
                      type="monotone"
                      dataKey="forecastPrice"
                      name="Projected Price Trend (₹/kg)"
                      stroke="#22d3ee"
                      strokeWidth={2.5}
                      strokeDasharray="5 5"
                      dot={{ r: 4, fill: '#22d3ee', strokeWidth: 1.5, stroke: '#164e63' }}
                      activeDot={{ r: 6, fill: '#67e8f9' }}
                      connectNulls={false}
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Advisory card */}
      <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/20 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1 text-xs">
          <div className="font-bold text-slate-200 mb-0.5">
            {activeRole === 'farmer' ? '🌾 Farmer Dispatch Advisory' : '🛒 Consumer Purchase Guidance'}
          </div>
          <p className="text-slate-400 leading-relaxed">
            {activeRole === 'farmer' ? data?.farmerAdvisory : data?.consumerAdvisory}
          </p>
        </div>
      </div>

      {/* MANDATORY DISCLAIMER */}
      <div className="mt-3 pt-3 border-t border-slate-900 flex items-center gap-2 text-[11px] text-slate-500">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500/80" />
        <span>
          <strong className="text-slate-400">AI-Assisted Forecast:</strong> {data?.disclaimer || 'Predictions are generated using historical trends and demo data models. Actual mandi spot rates and retail prices may vary.'}
        </span>
      </div>
    </div>
  );
}

// Custom Tooltip component for Recharts
function CustomTooltip({ active, payload, label, activeRole, unit = 'kg' }) {
  if (active && payload && payload.length) {
    const item = payload[0]?.payload;
    const isForecast = item?.isForecast;
    const value = payload.find(p => p.value !== null)?.value;

    return (
      <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1">
        <div className="font-bold text-white flex items-center gap-2">
          <span>{label}</span>
          {isForecast ? (
            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500/20 border border-amber-500/40 text-amber-300">
              AI Forecast
            </span>
          ) : (
            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
              Historical
            </span>
          )}
        </div>
        <div className="text-slate-300 font-mono">
          {activeRole === 'farmer' ? (
            <span>Demand: <strong className="text-emerald-400">{value ? `${value.toLocaleString()} ${unit}` : 'N/A'}</strong></span>
          ) : (
            <span>Price: <strong className="text-teal-400">₹{value} / {unit}</strong></span>
          )}
        </div>
        <div className="text-[10px] text-slate-500">
          Confidence: {item?.confidencePct || 92}%
        </div>
      </div>
    );
  }
  return null;
}
