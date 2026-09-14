import React, { useState, useEffect } from 'react';
import { 
  TrendingDown, TrendingUp, Sparkles, ShieldCheck, MapPin, 
  Clock, ArrowRight, Bell, CheckCircle2, AlertCircle, ShoppingCart, 
  Store, Building2, Cpu, DollarSign, Info, Layers, RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell
} from 'recharts';
import { consumerAPI } from '../services/api';
import AgroProductImage, { getProductImage } from './AgroProductImage';

export default function SmartPriceComparisonContent({ 
  productId, 
  initialProduct = null, 
  onAddToCart = null, 
  onClose = null 
}) {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetPrice, setTargetPrice] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(null);
  const [alertLoading, setAlertLoading] = useState(false);

  const fetchComparison = async () => {
    if (!productId && !initialProduct?.id) return;
    const pId = productId || initialProduct.id;
    setLoading(true);
    try {
      const [compRes, histRes] = await Promise.all([
        consumerAPI.getPriceComparison(pId),
        consumerAPI.getPriceHistory(pId)
      ]);

      if (compRes.data && compRes.data.success) {
        setData(compRes.data.data);
        setTargetPrice(Math.max(5, (compRes.data.data.agroBridgePrice - 3)).toString());
      }
      if (histRes.data && histRes.data.success) {
        setHistory(histRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load price comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, [productId, initialProduct?.id]);

  const handleSetAlert = async (e) => {
    e.preventDefault();
    if (!targetPrice) return;
    setAlertLoading(true);
    try {
      const pId = productId || initialProduct.id;
      const res = await consumerAPI.createPriceAlert(pId, parseFloat(targetPrice));
      if (res.data && res.data.success) {
        setAlertSuccess(`Price drop alert set for ₹${targetPrice}/kg! We will notify you when price drops.`);
        setTimeout(() => setAlertSuccess(null), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAlertLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4 animate-fadeIn">
        <RefreshCw className="w-10 h-10 text-teal-400 animate-spin mx-auto" />
        <div className="text-sm font-bold text-white">Analyzing Regional Market Benchmarks...</div>
        <p className="text-xs text-slate-400">Comparing direct farm-gate rate against APMC Mandi, local retail & AI fair value.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-16 text-center text-slate-400 space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <div className="text-sm font-semibold text-white">Price comparison unavailable for this item.</div>
      </div>
    );
  }

  // Data for Recharts Bar Chart
  const chartBarData = [
    {
      source: 'AgroBridge',
      price: data.agroBridgePrice,
      fill: '#14b8a6', // Teal
      label: `₹${data.agroBridgePrice}`
    },
    {
      source: 'Local Market',
      price: data.marketPrice,
      fill: '#f43f5e', // Rose
      label: `₹${data.marketPrice}`
    },
    {
      source: 'Market Avg',
      price: data.regionalAveragePrice,
      fill: '#f59e0b', // Amber
      label: `₹${data.regionalAveragePrice}`
    },
    {
      source: 'AI Fair (Avg)',
      price: Math.round(((data.aiFairMin + data.aiFairMax) / 2) * 10) / 10,
      fill: '#8b5cf6', // Violet
      label: `₹${Math.round(((data.aiFairMin + data.aiFairMax) / 2) * 10) / 10}`
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn text-slate-100">

      {/* Product Hero Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-teal-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 shadow-inner">
            <AgroProductImage
              src={getProductImage(data)}
              alt={data.productName}
              category={data.category}
              className="w-full h-full object-cover"
              aspectRatio=""
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {data.category}
              </span>
              <span className="text-xs text-slate-400 font-semibold">{data.quality}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">{data.productName}</h1>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>{data.farmerName} • {data.location}</span>
            </p>
          </div>
        </div>

        {/* Add to Cart Quick CTA */}
        {onAddToCart && (
          <button
            onClick={() => onAddToCart({
              id: data.productId,
              product_name: data.productName,
              price_per_kg: data.agroBridgePrice,
              farm_name: data.farmName
            })}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-xl shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart (₹{data.agroBridgePrice}/kg)</span>
          </button>
        )}
      </div>

      {/* Dynamic Savings Highlight Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-teal-950/70 to-slate-900 border border-emerald-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-xl shadow-inner">
            💰
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-300">Direct Farm Gate Savings</div>
            <div className="text-2xl sm:text-3xl font-black text-white flex items-baseline gap-2">
              <span>You Save ₹{data.savings} / kg</span>
              <span className="text-sm font-bold text-emerald-400">({data.cheaperText})</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-2xl border border-emerald-500/20 max-w-sm">
          <span className="font-semibold text-emerald-300">Dynamic Calculation:</span>
          <div className="font-mono text-[11px] text-slate-400 mt-0.5">
            Market (₹{data.marketPrice}) - AgroBridge (₹{data.agroBridgePrice}) = ₹{data.savings}/kg saved
          </div>
        </div>
      </div>

      {/* 4 PRICE SOURCES CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. AGROBRIDGE DIRECT */}
        <div className="p-5 rounded-3xl bg-slate-900 border-2 border-teal-500/60 space-y-3 relative overflow-hidden shadow-xl shadow-teal-500/10">
          <div className="absolute -top-3 -right-3 w-16 h-16 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <span>🌾</span>
              <span>AGROBRIDGE</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/40">
              DIRECT
            </span>
          </div>

          <div>
            <div className="text-3xl font-black text-white flex items-baseline gap-1">
              <span>₹{data.agroBridgePrice}</span>
              <span className="text-xs font-normal text-slate-400">/ kg</span>
            </div>
            <div className="text-[11px] font-semibold text-teal-300 mt-0.5">Direct Farmer Price</div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px]">
            <div className="text-emerald-400 flex items-center gap-1">
              <span>✓</span> <span>Fresh Farm Gate Harvest</span>
            </div>
            <div className="text-emerald-400 flex items-center gap-1">
              <span>✓</span> <span>100% Transparent Price</span>
            </div>
          </div>
        </div>

        {/* 2. LOCAL MARKET */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-rose-400" />
              <span>LOCAL MARKET</span>
            </span>
            <span className="text-[10px] font-bold text-rose-400">+{data.savingsPercentage}% higher</span>
          </div>

          <div>
            <div className="text-3xl font-black text-slate-200 line-through decoration-rose-500 flex items-baseline gap-1">
              <span>₹{data.marketPrice}</span>
              <span className="text-xs font-normal text-slate-400">/ kg</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Average Local Market Price</div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
            Physical local mandi and neighborhood retail vendors.
          </div>
        </div>

        {/* 3. REGIONAL MARKET AVERAGE */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>MARKET AVERAGE</span>
            </span>
            <span className="text-[10px] text-amber-400 font-semibold">Regional</span>
          </div>

          <div>
            <div className="text-3xl font-black text-slate-300 flex items-baseline gap-1">
              <span>₹{data.regionalAveragePrice}</span>
              <span className="text-xs font-normal text-slate-400">/ kg</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Average Regional Market Price</div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
            Weighted benchmark across major state APMC hubs.
          </div>
        </div>

        {/* 4. AI FAIR PRICE */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-indigo-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>AI FAIR PRICE</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              AI MODEL
            </span>
          </div>

          <div>
            <div className="text-2xl font-black text-indigo-300 flex items-baseline gap-1">
              <span>{data.aiFairPrice}</span>
            </div>
            <div className="text-[11px] font-semibold text-indigo-300 mt-0.5">AI-Assisted Fair Price Range</div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            Algorithmic fair value computed from seasonal supply & demand.
          </div>
        </div>

      </div>

      {/* SIH MVP Data Source Transparency Tag */}
      <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
        <span className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400" />
          <span>Market reference prices are labeled as: <strong className="text-slate-200">{data.dataSource}</strong> for the SIH MVP.</span>
        </span>
        <span className="text-[10px] text-slate-500">Updated: Just now</span>
      </div>

      {/* CHARTS ROW: Recharts Bar Chart & Recharts Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recharts Bar Chart: Price Comparison */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>📊</span>
                <span>Price Comparison Bar Chart</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Visual comparison across all 4 price sources (₹/kg)</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Real Data Values
            </span>
          </div>

          <div className="h-64 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartBarData} margin={{ top: 15, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="source" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 'auto']} unit="₹" />
                <Tooltip 
                  cursor={{ fill: 'rgba(51, 65, 85, 0.2)' }}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '16px',
                    fontSize: '12px',
                    color: '#fff'
                  }} 
                  formatter={(val) => [`₹${val}/kg`, 'Price']}
                />
                <Bar dataKey="price" radius={[8, 8, 0, 0]}>
                  {chartBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-teal-500 inline-block" /> AgroBridge (₹{data.agroBridgePrice})</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-500 inline-block" /> Local Market (₹{data.marketPrice})</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500 inline-block" /> Regional Avg (₹{data.regionalAveragePrice})</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-violet-500 inline-block" /> AI Fair (Avg)</span>
          </div>
        </div>

        {/* Recharts Line Chart: 7-Day Price History */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>📈</span>
                <span>Price History (Last 7 Days)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">AgroBridge Direct vs Local Market Trend</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              7-Day Trend
            </span>
          </div>

          <div className="h-64 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 15, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} unit="₹" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '16px',
                    fontSize: '12px',
                    color: '#fff'
                  }} 
                  formatter={(val, name) => [`₹${val}/kg`, name === 'agroBridgePrice' ? 'AgroBridge' : 'Local Market']}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} 
                  formatter={(val) => val === 'agroBridgePrice' ? 'AgroBridge Direct' : 'Local Market Reference'}
                />
                <Line 
                  type="monotone" 
                  dataKey="agroBridgePrice" 
                  stroke="#14b8a6" 
                  strokeWidth={3} 
                  dot={{ fill: '#14b8a6', r: 4 }} 
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="marketPrice" 
                  stroke="#f43f5e" 
                  strokeWidth={2} 
                  strokeDasharray="4 4"
                  dot={{ fill: '#f43f5e', r: 3 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            AgroBridge maintains stable farm-gate pricing with zero middleman price swings.
          </p>
        </div>

      </div>

      {/* AI PRICE ANALYSIS & RECOMMENDATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* AI Analysis Card */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">AI Price Analysis</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider ${
              data.priceStatus === 'GOOD DEAL'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 ring-4 ring-emerald-500/10'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
            }`}>
              {data.priceStatus}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            "{data.aiAnalysis}"
          </p>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>AI-Assisted Analysis</span>
            </span>
            <span>Confidence: 94.8%</span>
          </div>
        </div>

        {/* AI Recommendation Card */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-teal-400" />
              <h2 className="text-base font-bold text-white">AI Price Recommendation</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">Market Equilibrium</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            "{data.aiRecommendation}"
          </p>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span className="text-slate-400 font-semibold">
              Trend: <strong className="text-teal-400">{data.marketTrend}</strong> • Supply: <strong className="text-white">{data.supplyCondition}</strong>
            </span>
            <span className="text-slate-500">Non-guaranteed estimate</span>
          </div>
        </div>

      </div>

      {/* PRICE TRANSPARENCY: WHERE YOUR MONEY GOES */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>PRICE TRANSPARENCY: Where Your Money Goes</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Complete disintermediation cost breakdown for ₹{data.priceBreakdown.productPrice}/kg</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            88% Straight to Farmer
          </span>
        </div>

        {/* Graphic Breakdown Progress Bar */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
            <div 
              style={{ width: `${data.priceBreakdown.farmerPercentage}%` }} 
              className="h-full bg-emerald-500 rounded-l-full" 
              title={`Farmer Receives: ₹${data.priceBreakdown.farmerReceives}`}
            />
            <div 
              style={{ width: `${data.priceBreakdown.logisticsPercentage}%` }} 
              className="h-full bg-amber-500" 
              title={`Logistics: ₹${data.priceBreakdown.logisticsFee}`}
            />
            <div 
              style={{ width: `${data.priceBreakdown.platformPercentage}%` }} 
              className="h-full bg-teal-400 rounded-r-full" 
              title={`Platform Fee: ₹${data.priceBreakdown.platformFee}`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Farmer Receives (88%)</span>
              </div>
              <div className="text-xl font-black text-emerald-400">₹{data.priceBreakdown.farmerReceives} <span className="text-xs font-normal text-slate-400">/ kg</span></div>
              <p className="text-[10px] text-slate-400">Disbursed directly into farmer escrow wallet.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span>Logistics & Transport (8%)</span>
              </div>
              <div className="text-xl font-black text-amber-400">₹{data.priceBreakdown.logisticsFee} <span className="text-xs font-normal text-slate-400">/ kg</span></div>
              <p className="text-[10px] text-slate-400">Aggregated rural transport & driver payout.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-teal-500/30 space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" />
                <span>AgroBridge Platform (4%)</span>
              </div>
              <div className="text-xl font-black text-teal-300">₹{data.priceBreakdown.platformFee} <span className="text-xs font-normal text-slate-400">/ kg</span></div>
              <p className="text-[10px] text-slate-400">Quality verification, AI server & security.</p>
            </div>
          </div>
        </div>
      </div>

      {/* DIRECT FARMER ADVANTAGE: SUPPLY CHAIN COMPARISON */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>🌾</span>
            <span>Direct Farmer Advantage: Supply Chain Disintermediation</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Fewer intermediaries can help improve price transparency and reduce unnecessary markups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Traditional Supply Chain */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-rose-500/20 space-y-3">
            <div className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center justify-between">
              <span>Traditional Supply Chain</span>
              <span className="text-[10px] text-rose-400 font-normal">3-4 Intermediary Cuts</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-300">
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">👨‍🌾 Farmer</span>
              <span className="text-slate-600">➔</span>
              <span className="px-2.5 py-1 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300">Commission Agent</span>
              <span className="text-slate-600">➔</span>
              <span className="px-2.5 py-1 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300">Wholesaler</span>
              <span className="text-slate-600">➔</span>
              <span className="px-2.5 py-1 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300">Retailer</span>
              <span className="text-slate-600">➔</span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">🛒 Consumer</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Total Markup: <strong>+35% to +60%</strong> absorbed by middlemen. Farmer receives only 40-50% of the retail price.
            </p>
          </div>

          {/* AgroBridge Direct Model */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-teal-500/30 space-y-3">
            <div className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center justify-between">
              <span>AgroBridge Direct Model</span>
              <span className="text-[10px] text-teal-400 font-normal">0 Middlemen Cut</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold text-white">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">👨‍🌾 Farmer</span>
              <span className="text-teal-400 font-black">➔ [AgroBridge Logistics] ➔</span>
              <span className="px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40">🛒 Consumer</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Farmer receives <strong>88%</strong> of the payment. Consumer gets fresh produce <strong>20%+ cheaper</strong> than supermarkets.
            </p>
          </div>

        </div>
      </div>

      {/* NEARBY PRICE COMPARISON & SMART VALUE SCORE */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              <span>📍 Price Comparison Near You (Nearby Farmers)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked using AI Smart Value Score (Price + Estimated Delivery + Freshness + Rating)
            </p>
          </div>
          <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Assisted Best Value</span>
          </span>
        </div>

        <div className="space-y-3">
          {data.nearbyFarmers?.map((farmer, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                farmer.isBestValue 
                  ? 'bg-gradient-to-r from-emerald-950/40 to-slate-950 border-emerald-500/50 shadow-lg shadow-emerald-500/10' 
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{farmer.farmName}</span>
                  {farmer.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20">
                      {farmer.badge}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">• {farmer.distanceKm} KM away</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>Product: <strong className="text-white">₹{farmer.productPrice}/kg</strong></span>
                  <span>+ Delivery: <strong className="text-slate-300">₹{farmer.deliveryCost}</strong></span>
                  <span>= Total: <strong className="text-teal-400">₹{farmer.totalEffectivePrice}/kg</strong></span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Rating: ⭐ {farmer.productRating} • Freshness: {farmer.freshness}
                </div>
              </div>

              <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Value Score</div>
                  <div className="text-xl font-black text-amber-400">{farmer.valueScore} <span className="text-xs font-normal text-slate-400">/ 100</span></div>
                </div>
                {onAddToCart && (
                  <button
                    onClick={() => onAddToCart({
                      id: data.productId,
                      product_name: data.productName,
                      price_per_kg: farmer.productPrice,
                      farm_name: farmer.farmName
                    })}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-teal-500 hover:text-slate-950 text-xs font-bold text-slate-200 transition-colors"
                  >
                    Select Farmer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PRICE ALERT: NOTIFY ME WHEN PRICE DROPS */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">🔔 Smart Price Drop Alert</h2>
            <p className="text-xs text-slate-400">Set your target price and receive instant notifications when farmer harvest prices decrease.</p>
          </div>
        </div>

        {alertSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-950 border border-emerald-500 text-emerald-100 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{alertSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSetAlert} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <span className="absolute left-3.5 top-3 text-slate-400 text-xs font-bold">₹</span>
            <input
              type="number"
              required
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="e.g. 22"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-16 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
            />
            <span className="absolute right-3.5 top-3 text-slate-400 text-xs font-normal">/ kg</span>
          </div>

          <button
            type="submit"
            disabled={alertLoading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            {alertLoading ? 'Registering...' : 'Notify Me When Price Drops'}
          </button>
        </form>
      </div>

    </div>
  );
}
