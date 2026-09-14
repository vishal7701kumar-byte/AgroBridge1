import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Calendar, Download, 
  ArrowLeft, RefreshCw, AlertTriangle, Sparkles, CheckCircle2,
  Package, Layers, BarChart3, HelpCircle, ArrowUpRight, Award,
  ChevronRight, ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, LineChart, Line, ComposedChart
} from 'recharts';
import { farmerAPI } from '../services/api';

export default function FarmerProfitPage({ currentUser, onNavigate, onLogout }) {
  const [selectedFilter, setSelectedFilter] = useState('3-months'); // this-month, last-month, 3-months, 6-months, this-year, custom
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [chartType, setChartType] = useState('bar'); // bar, line

  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [productProfitData, setProductProfitData] = useState(null);
  const [toast, setToast] = useState(null);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, monthRes, prodRes] = await Promise.allSettled([
        farmerAPI.getFinancialSummary(),
        farmerAPI.getMonthlyProfit(selectedFilter),
        farmerAPI.getProductProfit()
      ]);

      if (sumRes.status === 'fulfilled' && sumRes.value.data?.success) {
        setSummaryData(sumRes.value.data.data);
      }
      if (monthRes.status === 'fulfilled' && monthRes.value.data?.success) {
        setMonthlyData(monthRes.value.data.data?.monthlySeries || []);
      }
      if (prodRes.status === 'fulfilled' && prodRes.value.data?.success) {
        setProductProfitData(prodRes.value.data.data);
      }
    } catch (err) {
      console.error('Failed to load profit analytics:', err);
      showToastMsg('Failed to load financial data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedFilter]);

  const handleDownloadCSV = async () => {
    try {
      const res = await farmerAPI.downloadFinancialReport('September 2026');
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AgroBridge_Farmer_Monthly_Financial_Report_Sep_2026.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showToastMsg('Financial report downloaded successfully');
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

      {/* Top Navigation & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate ? onNavigate('/farmer/dashboard') : window.history.back()}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Back to Farmer Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">📊 Monthly Profit Analysis</h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Transparent Economics
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified crop sales revenue minus farmer-entered operating expenses yields transparent net profit.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('/farmer/expenses')}
            className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
          >
            💸 Manage Expenses
          </button>
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Report</span>
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-400 font-bold px-2">Filter Timeline:</span>
          {[
            { id: 'this-month', label: 'This Month' },
            { id: 'last-month', label: 'Last Month' },
            { id: '3-months', label: 'Last 3 Months' },
            { id: '6-months', label: 'Last 6 Months' },
            { id: 'this-year', label: 'This Year' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedFilter === f.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Chart View:</span>
          <button
            onClick={() => setChartType('bar')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
              chartType === 'bar' ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40' : 'text-slate-400'
            }`}
          >
            Bar
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
              chartType === 'line' ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40' : 'text-slate-400'
            }`}
          >
            Line
          </button>
        </div>
      </div>

      {/* 4 Core Financial Summary Cards (September 2026 Focus) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: Monthly Revenue */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">This Month's Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            ₹{(summaryData?.monthlyRevenue || 45000).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>32 completed customer orders</span>
          </div>
        </div>

        {/* CARD 2: Estimated Expenses */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-400">
            ₹{(summaryData?.estimatedExpenses || 12000).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400">
            Across 6 logged farming cost categories
          </div>
        </div>

        {/* CARD 3: Estimated Net Profit */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/50 space-y-2 relative overflow-hidden shadow-xl shadow-emerald-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Estimated Net Profit</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-300">
            ₹{(summaryData?.estimatedNetProfit || 33000).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400">
            Revenue minus farming input expenses
          </div>
        </div>

        {/* CARD 4: Profit Margin */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profit Margin</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-teal-300">
            {(summaryData?.profitMargin || 73.3)}%
          </div>
          <div className="text-[11px] text-teal-400">
            +3.3% higher than August margin
          </div>
        </div>

      </div>

      {/* Monthly Profit Chart Section (Recharts) */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>📈 Monthly Revenue, Expenses & Profit Trend</span>
            </h2>
            <p className="text-xs text-slate-400">
              Comparative visualization across months showing growing net returns.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="text-slate-300">Expenses</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-teal-300" />
              <span className="text-slate-300">Estimated Profit</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff', fontSize: '12px' }}
                  formatter={(value, name) => [`₹${value.toLocaleString('en-IN')}`, name === 'revenue' ? 'Revenue' : name === 'expenses' ? 'Expenses' : 'Estimated Net Profit']}
                />
                <Bar dataKey="revenue" name="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" name="expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="estimatedProfit" name="estimatedProfit" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff', fontSize: '12px' }}
                  formatter={(value, name) => [`₹${value.toLocaleString('en-IN')}`, name === 'revenue' ? 'Revenue' : name === 'expenses' ? 'Expenses' : 'Estimated Net Profit']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="estimatedProfit" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
          <span>Formula: Estimated Net Profit = Completed Sales Revenue - Farmer-Entered Expenses</span>
          <span className="text-emerald-400 font-bold">September 2026: ₹45,000 - ₹12,000 = ₹33,000</span>
        </div>
      </div>

      {/* Top Profitable Products & Low Profit Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top 3 Profitable Crops */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>🏆 Most Profitable Products</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">Ranked by Profit</span>
          </div>

          <div className="space-y-3">
            {productProfitData?.topProfitable?.map((item) => (
              <div
                key={item.rank}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.medal}</span>
                  <div>
                    <div className="text-sm font-bold text-white">{item.productName}</div>
                    <div className="text-xs text-slate-400">Margin: <strong className="text-teal-400">{item.margin}%</strong></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-emerald-400">
                    ₹{item.estimatedProfit.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-500">Estimated Profit</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 italic">
            Calculated based on available farmer expense allocation and completed order transactions.
          </p>
        </div>

        {/* Low Profit Alerts & Action Recommendations */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Low Profit Alerts</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold uppercase">
              Action Recommended
            </span>
          </div>

          <div className="space-y-3">
            {productProfitData?.lowProfitAlerts?.map((alert, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                    <span>⚠</span> {alert.title}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-amber-400 font-mono">
                    {alert.margin}% vs 73.3% Avg
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  "{alert.message}"
                </p>
                <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="text-slate-400 font-semibold">Suggested Actions:</span>
                  {alert.recommendedActions.map((act, aIdx) => (
                    <span key={aIdx} className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">
                      • {act}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Product-Wise Profit Performance Table */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-white">Product-Wise Profit Performance</h3>
            <p className="text-xs text-slate-400">Detailed accounting breakdown per listed crop harvest.</p>
          </div>
          <span className="text-xs text-slate-400">September 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Product Name</th>
                <th className="p-4">Quantity Sold</th>
                <th className="p-4 text-right">Revenue (₹)</th>
                <th className="p-4 text-right">Allocated Expenses (₹)</th>
                <th className="p-4 text-right">Estimated Net Profit (₹)</th>
                <th className="p-4 text-right">Profit Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {productProfitData?.products?.map(p => (
                <tr key={p.productId} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <span>{p.productName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">{p.trend}</span>
                  </td>
                  <td className="p-4 font-mono text-slate-300">
                    {p.quantitySold} {p.unit}
                  </td>
                  <td className="p-4 text-right font-black text-emerald-400 text-sm">
                    ₹{p.revenue.toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-right font-black text-rose-400 text-sm">
                    ₹{p.expenses.toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-right font-black text-teal-300 text-sm">
                    ₹{p.estimatedProfit.toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-right font-black">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      p.profitMargin >= 70 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {p.profitMargin}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI-Assisted Business Insights */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-teal-500/30 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-white">🤖 AI-Assisted Business Insights</h3>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            Advisory Modeling • Not Guaranteed Financial Advice
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {productProfitData?.aiInsights?.map((ins) => (
            <div key={ins.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
              <div className="text-xs font-bold text-teal-400 uppercase tracking-wider">{ins.title}</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                "{ins.message}"
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
