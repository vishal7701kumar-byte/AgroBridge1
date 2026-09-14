import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, ArrowLeft, Download,
  RefreshCw, Package, Users, Truck, AlertTriangle, ShieldCheck,
  BarChart3, PieChart, Layers, HelpCircle, ArrowRight, CheckCircle2,
  Sparkles, ExternalLink, Calendar, Filter
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { adminAPI } from '../services/api';

export default function AdminRevenuePage({ currentUser, onNavigate, onLogout }) {
  const [selectedFilter, setSelectedFilter] = useState('3-months');
  const [loading, setLoading] = useState(true);
  
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userTypes, setUserTypes] = useState(null);
  const [topFarmers, setTopFarmers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [deliveryData, setDeliveryData] = useState(null);
  const [refundData, setRefundData] = useState(null);
  const [aiInsights, setAIInsights] = useState([]);
  const [toast, setToast] = useState(null);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, trendRes, catRes, userRes, farmRes, prodRes, delRes, refRes, insRes] = await Promise.allSettled([
        adminAPI.getRevenueSummary(),
        adminAPI.getRevenueTrend(selectedFilter),
        adminAPI.getRevenueByCategory(),
        adminAPI.getRevenueByUserType(),
        adminAPI.getTopFarmers(),
        adminAPI.getTopProducts(),
        adminAPI.getDeliveryFinancials(),
        adminAPI.getRefundAnalytics(),
        adminAPI.getAIInsights()
      ]);

      if (sumRes.status === 'fulfilled' && sumRes.value.data?.success) setSummary(sumRes.value.data.data);
      if (trendRes.status === 'fulfilled' && trendRes.value.data?.success) setTrend(trendRes.value.data.data?.trend || []);
      if (catRes.status === 'fulfilled' && catRes.value.data?.success) setCategories(catRes.value.data.data || []);
      if (userRes.status === 'fulfilled' && userRes.value.data?.success) setUserTypes(userRes.value.data.data);
      if (farmRes.status === 'fulfilled' && farmRes.value.data?.success) setTopFarmers(farmRes.value.data.data || []);
      if (prodRes.status === 'fulfilled' && prodRes.value.data?.success) setTopProducts(prodRes.value.data.data || []);
      if (delRes.status === 'fulfilled' && delRes.value.data?.success) setDeliveryData(delRes.value.data.data);
      if (refRes.status === 'fulfilled' && refRes.value.data?.success) setRefundData(refRes.value.data.data);
      if (insRes.status === 'fulfilled' && insRes.value.data?.success) setAIInsights(insRes.value.data.data || []);
    } catch (err) {
      console.error('Failed to load admin revenue analytics:', err);
      showToastMsg('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedFilter]);

  const handleDownloadCSV = async () => {
    try {
      const res = await adminAPI.downloadRevenueReport('September 2026');
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AgroBridge_Platform_Revenue_Report_Sep_2026.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showToastMsg('Platform report downloaded successfully');
    } catch (err) {
      console.error(err);
      showToastMsg('Failed to download report', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border backdrop-blur-md animate-fadeIn text-xs font-bold ${
          toast.type === 'error' ? 'bg-rose-950/90 border-rose-600 text-rose-100' : 'bg-emerald-950/90 border-emerald-600 text-emerald-100'
        }`}>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate ? onNavigate('/admin/dashboard') : window.history.back()}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Back to Admin Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">💰 Platform Revenue Analytics</h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/30">
                Financial Audit
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly distinguishing Gross Transaction Throughput from AgroBridge Platform Revenue and Operating Profit.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('/admin/expenses')}
            className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
          >
            ⚙️ Operating Expenses
          </button>
          <button
            onClick={() => onNavigate('/admin/revenue/transactions')}
            className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
          >
            📋 Transaction Ledger
          </button>
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* 8 Core Admin Revenue Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: Total Transaction Value */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">1. Total Transaction Value</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">
            ₹{(summary?.totalTransactionValue || 500000).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400">
            Total money processed through 340 completed customer orders.
          </p>
        </div>

        {/* CARD 2: Farmer Payout */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">2. Farmer Payout</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">
            ₹{(summary?.farmerPayout || 450000).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400">
            Directly disbursed to producers (90% of total order throughput).
          </p>
        </div>

        {/* CARD 3: Platform Commission */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">3. Platform Commission</span>
            <BarChart3 className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-black text-teal-300">
            ₹{(summary?.platformCommission || 15000).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400">
            Net commission earned from configured transaction fees (3%).
          </p>
        </div>

        {/* CARD 4: Delivery Revenue */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">4. Delivery Revenue</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-300">
            ₹{(summary?.deliveryRevenue || 20000).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400">
            Delivery charges collected from residential & commercial buyers.
          </p>
        </div>

        {/* CARD 5: Refunds */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">5. Refunds</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400">
            ₹{(summary?.refunds || 5000).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400">
            Total refunded amounts on 4 disputed/cancelled orders.
          </p>
        </div>

        {/* CARD 6: Net Platform Revenue */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-teal-950/30 to-slate-900 border border-teal-500/40 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider">6. Net Platform Revenue</span>
            <DollarSign className="w-4 h-4 text-teal-300" />
          </div>
          <div className="text-3xl font-black text-teal-300">
            ₹{(summary?.netPlatformRevenue || 30000).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400">
            Commission (15k) + Delivery (20k) - Refunds (5k).
          </p>
        </div>

        {/* CARD 7: Operating Costs */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">7. Operating Costs</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-400">
            ₹{(summary?.operatingCosts || 10000).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400">
            AWS Servers (3.5k), AI (2k), Maps (1.2k), Dev (1.8k), Support (1.5k).
          </p>
        </div>

        {/* CARD 8: Estimated Platform Profit */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/60 space-y-1.5 shadow-xl shadow-emerald-500/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">8. Estimated Platform Profit</span>
            <Sparkles className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="text-3xl font-black text-emerald-300">
            ₹{(summary?.estimatedPlatformProfit || 20000).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400">
            Net Revenue (₹30,000) minus Operating Costs (₹10,000).
          </p>
        </div>

      </div>

      {/* Visual Revenue Breakdown Flow Diagram */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>💳 Transparent Order Revenue Flow Breakdown</span>
            </h3>
            <p className="text-xs text-slate-400">
              Visualizing how each ₹1,000 paid by a customer is distributed transparently with zero hidden markups.
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            Configured Logic: 90% Farm / 5% Commission / 5% Logistics
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center text-xs">
          
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-2xl">🛒</div>
            <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Customer Pays</div>
            <div className="text-2xl font-black text-white">₹1,000</div>
            <div className="text-[11px] text-slate-500">Gross order value via digital escrow</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-2">
            <div className="text-2xl">🌾</div>
            <div className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Farmer Receives</div>
            <div className="text-2xl font-black text-emerald-400">₹900 (90%)</div>
            <div className="text-[11px] text-slate-500">Disbursed immediately on OTP confirmation</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-teal-500/40 space-y-2">
            <div className="text-2xl">🏢</div>
            <div className="text-teal-400 font-bold uppercase tracking-wider text-[10px]">Platform Commission</div>
            <div className="text-2xl font-black text-teal-300">₹50 (5%)</div>
            <div className="text-[11px] text-slate-500">Maintains technology & farmer matching</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2">
            <div className="text-2xl">🚚</div>
            <div className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">Delivery Revenue</div>
            <div className="text-2xl font-black text-amber-300">₹50 (5%)</div>
            <div className="text-[11px] text-slate-500">₹40 paid to driver, ₹10 logistics margin</div>
          </div>

        </div>
      </div>

      {/* Monthly Revenue Trend Chart (Recharts) */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-white">📈 Monthly Platform Revenue & Profit Trend</h2>
            <p className="text-xs text-slate-400">Comparing Transaction Volume, Platform Revenue, Operating Cost, and Profit.</p>
          </div>

          {/* Timeline Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            {['this-month', 'last-month', '3-months', '6-months', 'this-year'].map(f => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedFilter === f ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {f.replace('-', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff', fontSize: '12px' }}
                formatter={(val, name) => [`₹${val.toLocaleString('en-IN')}`, name]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="totalTransactionValue" name="Total Transaction Value" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="platformRevenue" name="Platform Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="operatingCost" name="Operating Cost" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="estimatedProfit" name="Estimated Profit" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown & User Type Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Revenue by Product Category */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white">Revenue by Product Category</h3>
            <span className="text-[10px] text-slate-400">September 2026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Category</th>
                  <th className="p-3">Orders</th>
                  <th className="p-3 text-right">Transaction Value</th>
                  <th className="p-3 text-right">Platform Fee</th>
                  <th className="p-3 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {categories.map(cat => (
                  <tr key={cat.category} className="hover:bg-slate-900/40">
                    <td className="p-3 font-bold text-white flex items-center gap-1.5">
                      <span>{cat.icon}</span>
                      <span>{cat.category}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-400">{cat.totalOrders}</td>
                    <td className="p-3 text-right font-bold text-white">₹{cat.transactionValue.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-bold text-teal-400">₹{cat.platformRevenue.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right text-slate-400 font-mono">{cat.sharePercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue by User Type */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white">Revenue by User Type</h3>
            <span className="text-[10px] text-slate-400">Consumer vs B2B</span>
          </div>

          <div className="space-y-3">
            
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <span>🛒</span> Consumer Orders (Retail)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 font-mono">285 Orders</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Transaction Value:</span>
                <span className="font-black text-white">₹3,20,000 (64%)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Platform Commission:</span>
                <span className="font-bold text-teal-400">₹9,600</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <span>🏢</span> Bulk Buyer Orders (B2B)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 font-mono">55 Orders</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Transaction Value:</span>
                <span className="font-black text-white">₹1,80,000 (36%)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Platform Commission:</span>
                <span className="font-bold text-teal-400">₹5,400</span>
              </div>
            </div>

          </div>

          <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800/80">
            Total Orders: <strong>340</strong> | Total Commission: <strong>₹15,000</strong>
          </div>
        </div>

      </div>

      {/* Top Farmers & Top Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Farmers */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <span>🏆 Top Farmers by Sales Volume</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Farmer</th>
                  <th className="p-3">Orders</th>
                  <th className="p-3 text-right">Sales Value</th>
                  <th className="p-3 text-right">Est. Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {topFarmers.map(f => (
                  <tr key={f.farmerId} className="hover:bg-slate-900/40">
                    <td className="p-3">
                      <div className="font-bold text-white">#{f.rank} {f.farmerName}</div>
                      <div className="text-[10px] text-slate-400">{f.farmName}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-400">{f.orders}</td>
                    <td className="p-3 text-right font-black text-white">₹{f.salesValue.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-bold text-emerald-400">₹{f.estimatedFarmerProfit.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performing Products */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <span>🔥 Top Performing Products</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Product</th>
                  <th className="p-3">Qty Sold</th>
                  <th className="p-3 text-right">Order Value</th>
                  <th className="p-3 text-right">Platform Cut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {topProducts.map(p => (
                  <tr key={p.rank} className="hover:bg-slate-900/40">
                    <td className="p-3">
                      <div className="font-bold text-white">#{p.rank} {p.productName}</div>
                      <div className="text-[10px] text-slate-400">{p.category}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-400">{p.quantitySold} {p.unit}</td>
                    <td className="p-3 text-right font-black text-white">₹{p.transactionValue.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-bold text-teal-400">₹{p.platformRevenue.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Delivery Financials & Refund Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Delivery Logistics Analytics */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Delivery Logistics Financials</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">340 Deliveries</span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Charges Collected</div>
              <div className="text-lg font-black text-amber-300 mt-1">₹{(deliveryData?.deliveryChargesCollected || 20000).toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Driver Payout</div>
              <div className="text-lg font-black text-slate-300 mt-1">₹{(deliveryData?.driverPayout || 16000).toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 text-center">
              <div className="text-[10px] text-emerald-400 uppercase">Logistics Margin</div>
              <div className="text-lg font-black text-emerald-400 mt-1">₹{(deliveryData?.logisticsMargin || 4000).toLocaleString('en-IN')}</div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Formula: Logistics Margin = Delivery Charges Collected (₹20,000) minus Driver Payouts (₹16,000).
          </p>
        </div>

        {/* Refund Analytics */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Refund Analytics</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono">
              1.18% Refund Rate
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Total Refund Amount</div>
              <div className="text-xl font-black text-rose-400 mt-1">₹{(refundData?.totalRefundAmount || 5000).toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-slate-500">Across 4 disputed orders</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Primary Dispute Cause</div>
              <div className="text-sm font-bold text-white mt-1">Transit Bruising</div>
              <div className="text-[10px] text-slate-500">54% of all refund tickets</div>
            </div>
          </div>
        </div>

      </div>

      {/* Understanding Platform Revenue (Transparency Guide) */}
      <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-teal-400" />
          <h3 className="text-base font-black text-white">Understanding Platform Revenue & Financial Transparency</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-bold text-white">Total Transaction Value (TTV)</div>
            <p className="text-slate-400 leading-relaxed">
              Gross money processed through completed customer purchases. <strong>Not platform income</strong>.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-bold text-emerald-400">Farmer Payout (90%)</div>
            <p className="text-slate-400 leading-relaxed">
              Disbursed directly to primary producers and FPOs on dual-OTP verified delivery.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-bold text-teal-400">Net Platform Revenue</div>
            <p className="text-slate-400 leading-relaxed">
              Platform Commission (₹15k) + Delivery Margin (₹4k) - Refunds (₹5k) = <strong>₹30,000</strong>.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-bold text-amber-400">Estimated Platform Profit</div>
            <p className="text-slate-400 leading-relaxed">
              Net Platform Revenue (₹30k) minus Operating Costs (₹10k) = <strong>₹20,000</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* AI-Assisted Platform Financial Insights */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-violet-500/30 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h3 className="text-base font-black text-white">🤖 AI-Assisted Platform Financial Insights</h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">Automated Audit Analysis</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiInsights.map(ins => (
            <div key={ins.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-xs font-bold text-violet-400 uppercase tracking-wider">{ins.title}</div>
              <p className="text-xs text-slate-300 leading-relaxed">"{ins.message}"</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
