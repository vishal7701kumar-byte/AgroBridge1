import React, { useState, useEffect } from 'react';
import {
  DollarSign, ArrowLeft, Download, RefreshCw, Search, Filter,
  Calendar, Layers, CheckCircle2, AlertTriangle, ArrowRight,
  TrendingUp, Truck, ShieldCheck, ChevronLeft, ChevronRight, FileText
} from 'lucide-react';
import { adminAPI } from '../services/api';

export default function AdminTransactionsPage({ currentUser, onNavigate, onLogout }) {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [userType, setUserType] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [paymentStatus, setPaymentStatus] = useState('ALL');
  const [orderStatus, setOrderStatus] = useState('ALL');
  const [page, setPage] = useState(1);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchTransactions = async (overridePage = page) => {
    setLoading(true);
    try {
      const params = {
        page: overridePage,
        limit: 15,
        search: search.trim() || undefined,
        userType: userType !== 'ALL' ? userType : undefined,
        category: category !== 'ALL' ? category : undefined,
        paymentStatus: paymentStatus !== 'ALL' ? paymentStatus : undefined,
        orderStatus: orderStatus !== 'ALL' ? orderStatus : undefined
      };

      const res = await adminAPI.getTransactions(params);
      if (res.data && res.data.success) {
        setTransactions(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
      showToastMsg('Failed to load transaction ledger', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
    setPage(1);
  }, [userType, category, paymentStatus, orderStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTransactions(1);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setPage(newPage);
    fetchTransactions(newPage);
  };

  const handleDownloadCSV = async () => {
    try {
      const res = await adminAPI.downloadRevenueReport('September 2026');
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AgroBridge_Transaction_Ledger_Sep_2026.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showToastMsg('Transaction report downloaded successfully');
    } catch (err) {
      console.error(err);
      showToastMsg('Failed to download report', 'error');
    }
  };

  // Rollups of current visible transactions
  const totalValueSum = transactions.reduce((acc, tx) => acc + (tx.totalOrderValue || 0), 0);
  const totalCommSum = transactions.reduce((acc, tx) => acc + (tx.platformCommission || 0), 0);
  const totalFarmerSum = transactions.reduce((acc, tx) => acc + (tx.farmerPayout || 0), 0);

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

      {/* Header & Nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
            <button 
              onClick={() => onNavigate ? onNavigate('admin') : window.history.back()} 
              className="flex items-center gap-1 hover:text-emerald-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Admin Portal
            </button>
            <span>/</span>
            <button 
              onClick={() => onNavigate ? onNavigate('admin-revenue') : null}
              className="hover:text-emerald-300 transition-colors"
            >
              Platform Revenue
            </button>
            <span>/</span>
            <span className="text-slate-400">Transaction Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              📑
            </span>
            Platform Transaction & Escrow Ledger
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Detailed, immutable audit trail of each order, buyer payment, farmer payout, platform commission, and logistics fee.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate && onNavigate('admin-revenue')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold transition-all shadow-sm"
          >
            <ArrowRight className="w-4 h-4 text-emerald-400" />
            Revenue Analytics
          </button>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" /> Export Ledger (CSV)
          </button>
        </div>
      </div>

      {/* Ledger Rollup Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Filtered Volume</span>
            <p className="text-xl font-black text-white mt-0.5">{pagination.total} Transactions</p>
          </div>
          <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Page Order Value</span>
            <p className="text-xl font-black text-sky-400 mt-0.5">₹{totalValueSum.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-2 rounded-lg bg-sky-950 text-sky-400 border border-sky-800/40">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Page Farmer Payouts</span>
            <p className="text-xl font-black text-emerald-400 mt-0.5">₹{totalFarmerSum.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/40">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Page Platform Comm.</span>
            <p className="text-xl font-black text-purple-400 mt-0.5">₹{totalCommSum.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-2 rounded-lg bg-purple-950 text-purple-400 border border-purple-800/40">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID, Buyer, Farmer, Crop..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </form>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            
            {/* Buyer Type */}
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Buyer Types</option>
              <option value="CONSUMER">Consumer</option>
              <option value="BULK_BUYER">Bulk Buyer</option>
            </select>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Categories</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Grains">Grains</option>
              <option value="Pulses">Pulses</option>
            </select>

            {/* Payment Status */}
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="PAID">Paid / Settled</option>
              <option value="ESCROW_HOLDING">Escrow Holding</option>
              <option value="DISBURSED">Disbursed</option>
              <option value="REFUNDED">Refunded</option>
            </select>

            {/* Order Status */}
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Order Statuses</option>
              <option value="DELIVERED">Delivered</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="PICKED_UP">Picked Up</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="REFUNDED">Refunded</option>
            </select>

            <button
              onClick={() => fetchTransactions(page)}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
            <p className="text-sm font-medium">Loading platform transaction ledger...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-20 text-center text-slate-500 border border-dashed border-slate-800/80 rounded-xl">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-300">No Transactions Found</p>
            <p className="text-xs text-slate-500 mt-1">Try relaxing your search query or filter selections.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Buyer</th>
                  <th className="py-3 px-4">Farmer</th>
                  <th className="py-3 px-4">Item & Quantity</th>
                  <th className="py-3 px-4 text-right">Order Value</th>
                  <th className="py-3 px-4 text-right">Farmer Net</th>
                  <th className="py-3 px-4 text-right">Fee Split</th>
                  <th className="py-3 px-4 text-center">Payment Status</th>
                  <th className="py-3 px-4 text-center">Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => {
                  return (
                    <tr key={tx._id || tx.id} className="hover:bg-slate-800/30 transition-colors">
                      
                      {/* Order ID & Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-white">
                          #{tx.orderId}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{tx.orderDate ? new Date(tx.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}</span>
                        </div>
                      </td>

                      {/* Buyer */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{tx.customerName || 'Customer'}</div>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                          tx.userType === 'BULK_BUYER' 
                            ? 'bg-purple-950/60 text-purple-300 border border-purple-800/50' 
                            : 'bg-sky-950/60 text-sky-300 border border-sky-800/50'
                        }`}>
                          {tx.userType === 'BULK_BUYER' ? '🏢 Bulk Buyer' : '🛒 Consumer'}
                        </span>
                      </td>

                      {/* Farmer */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-emerald-400">{tx.farmerName || 'Farmer'}</div>
                        <div className="text-[11px] text-slate-500">Verified Producer</div>
                      </td>

                      {/* Item & Quantity */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{tx.productName}</div>
                        <div className="text-[11px] text-slate-400">
                          {tx.quantity} kg • <span className="text-slate-500">{tx.category}</span>
                        </div>
                      </td>

                      {/* Order Value */}
                      <td className="py-3.5 px-4 text-right font-black text-white font-mono text-sm whitespace-nowrap">
                        ₹{Number(tx.totalOrderValue).toLocaleString('en-IN')}
                      </td>

                      {/* Farmer Net Payout */}
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-bold whitespace-nowrap">
                        ₹{Number(tx.farmerPayout).toLocaleString('en-IN')}
                        <div className="text-[10px] text-slate-500">
                          {Math.round((tx.farmerPayout / tx.totalOrderValue) * 100)}% of order
                        </div>
                      </td>

                      {/* Split: Comm + Delivery */}
                      <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-300 whitespace-nowrap">
                        <div>Comm: <span className="text-purple-400 font-semibold">₹{tx.platformCommission}</span></div>
                        <div>Deliv: <span className="text-amber-400 font-semibold">₹{tx.deliveryCharge || 0}</span></div>
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          tx.paymentStatus === 'PAID' || tx.paymentStatus === 'DISBURSED'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                            : tx.paymentStatus === 'REFUNDED'
                            ? 'bg-rose-950/60 text-rose-400 border-rose-800/60'
                            : 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                        }`}>
                          {tx.paymentStatus === 'PAID' && <CheckCircle2 className="w-3 h-3" />}
                          {tx.paymentStatus === 'ESCROW_HOLDING' && <ShieldCheck className="w-3 h-3" />}
                          <span>{tx.paymentStatus}</span>
                        </span>
                      </td>

                      {/* Order Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          tx.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                            : tx.orderStatus === 'REFUNDED'
                            ? 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                            : 'bg-sky-950/40 text-sky-400 border-sky-800/40'
                        }`}>
                          {tx.orderStatus}
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
            <div>
              Showing page <strong className="text-white">{pagination.page}</strong> of <strong className="text-white">{pagination.pages}</strong> ({pagination.total} total items)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="font-mono px-2 text-slate-300">
                {pagination.page} / {pagination.pages}
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
