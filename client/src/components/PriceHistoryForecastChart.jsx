import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts';
import { Calendar, TrendingUp, Info } from 'lucide-react';

export default function PriceHistoryForecastChart({
  commodity = 'Tomato',
  market = 'Bhopal',
  historyRecords = [],
  forecastRecords = [],
  daysFilter = 30,
  onDaysFilterChange,
  loading = false
}) {
  // Combine historical and future forecast points chronologically
  const chartData = [];

  (historyRecords || []).forEach(r => {
    chartData.push({
      date: r.arrivalDate || 'N/A',
      modalPrice: r.modalPricePerKg,
      minPrice: r.minPricePerKg,
      maxPrice: r.maxPricePerKg,
      modalQuintal: r.modalPrice,
      isForecast: false,
      type: 'Observed Government Mandi'
    });
  });

  // Connect last historical point to first forecast point to avoid chart gap
  if (chartData.length > 0 && forecastRecords && forecastRecords.length > 0) {
    const lastHist = chartData[chartData.length - 1];
    chartData[chartData.length - 1] = {
      ...lastHist,
      projectedModal: lastHist.modalPrice,
      projectedMin: lastHist.minPrice,
      projectedMax: lastHist.maxPrice
    };
  }

  (forecastRecords || []).forEach(f => {
    chartData.push({
      date: `+Day ${f.dayOffset}`,
      modalPrice: null,
      projectedModal: f.projectedModalPricePerKg,
      projectedMin: f.projectedMinPricePerKg,
      projectedMax: f.projectedMaxPricePerKg,
      modalQuintal: f.projectedModalQuintal,
      isForecast: true,
      type: 'AI Forecast Estimate'
    });
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload;

    return (
      <div className="rounded-xl bg-slate-900/95 border border-slate-700 p-3 shadow-2xl text-xs space-y-1.5 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1">
          <span className="font-bold text-white">{label}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
            d.isForecast
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {d.isForecast ? 'AI Forecast' : 'Govt Mandi'}
          </span>
        </div>

        {d.isForecast ? (
          <>
            <div className="flex items-center justify-between gap-4 text-amber-300 font-bold">
              <span>Estimated Range:</span>
              <span>₹{d.projectedMin} – ₹{d.projectedMax}/kg</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-slate-300 text-[11px]">
              <span>Expected Modal:</span>
              <span className="font-bold text-white">₹{d.projectedModal}/kg</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Equivalent: ₹{d.modalQuintal}/quintal
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 text-emerald-400 font-bold">
              <span>Observed Modal:</span>
              <span>₹{d.modalPrice}/kg</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-slate-400 text-[11px]">
              <span>Mandi Range:</span>
              <span>₹{d.minPrice} – ₹{d.maxPrice}/kg</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Reported: ₹{d.modalQuintal}/quintal
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-5">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-extrabold text-white">
              Price History & Forecast Projection
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              ₹/kg
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {commodity} at {market} APMC Mandi — Unit: ₹/kg (₹/quintal ÷ 100)
          </p>
        </div>

        {/* 7d / 30d / 90d Filter Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 self-stretch sm:self-auto justify-center">
          {[7, 30, 90].map(days => (
            <button
              key={days}
              type="button"
              onClick={() => onDaysFilterChange && onDaysFilterChange(days)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                daysFilter === days
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-3 text-slate-400 text-xs">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading historical mandi time-series...</span>
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center space-y-2 p-6 bg-slate-950/50 rounded-2xl border border-slate-800/50">
          <Info className="w-8 h-8 text-slate-500" />
          <p className="text-xs font-bold text-slate-300">
            No historical market records found for {commodity} in {market}.
          </p>
          <p className="text-[11px] text-slate-500 max-w-md">
            Government mandi records may not have active trading arrivals reported for the selected filters.
          </p>
        </div>
      ) : (
        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="histGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              
              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fontSize: 10 }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 10 }}
                tickLine={false}
                domain={['auto', 'auto']}
                unit="₹"
              />

              <RechartsTooltip content={<CustomTooltip />} />

              {/* Shaded Area for historical price */}
              <Area
                type="monotone"
                dataKey="modalPrice"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#histGradient)"
                name="Historical Mandi Price"
                connectNulls={false}
                isAnimationActive={false}
              />

              {/* Dashed Line for AI Future Forecast */}
              <Line
                type="monotone"
                dataKey="projectedModal"
                stroke="#f59e0b"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: '#f59e0b' }}
                name="AI Projected Price"
                connectNulls={true}
                isAnimationActive={false}
              />

              {/* Upper & Lower Forecast Bounds */}
              <Line
                type="monotone"
                dataKey="projectedMax"
                stroke="#fbbf24"
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
                name="Forecast Upper Bound"
                connectNulls={true}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="projectedMin"
                stroke="#fbbf24"
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
                name="Forecast Lower Bound"
                connectNulls={true}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Legend & Provenance Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400" />
            <span className="text-slate-300 font-semibold">Observed Government Mandi Rate</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-400 border-b border-dashed border-amber-400" />
            <span className="text-amber-300 font-semibold">AI Future Forecast Range</span>
          </span>
        </div>
        <div className="text-slate-500 text-[10px]">
          Source: AGMARKNET / data.gov.in
        </div>
      </div>

    </div>
  );
}
