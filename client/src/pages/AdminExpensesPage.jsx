import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Plus, Calendar, Tag, Trash2, Pencil, Search, 
  Filter, ArrowLeft, TrendingDown, Layers, CheckCircle2, 
  AlertCircle, RefreshCw, Server, Cpu, Code, Megaphone,
  Users, MapPin, Wrench, Package, ArrowRight
} from 'lucide-react';
import { adminAPI } from '../services/api';

const PLATFORM_CATEGORIES = [
  { name: 'Server Infrastructure', emoji: '🖥️', icon: Server, color: 'text-sky-400 bg-sky-950/40 border-sky-800/60' },
  { name: 'AI Services', emoji: '🤖', icon: Cpu, color: 'text-purple-400 bg-purple-950/40 border-purple-800/60' },
  { name: 'Development', emoji: '💻', icon: Code, color: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/60' },
  { name: 'Marketing', emoji: '📢', icon: Megaphone, color: 'text-amber-400 bg-amber-950/40 border-amber-800/60' },
  { name: 'Employee / Support', emoji: '👥', icon: Users, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60' },
  { name: 'Map Services', emoji: '🗺️', icon: MapPin, color: 'text-rose-400 bg-rose-950/40 border-rose-800/60' },
  { name: 'Maintenance', emoji: '🛠️', icon: Wrench, color: 'text-teal-400 bg-teal-950/40 border-teal-800/60' },
  { name: 'Other', emoji: '📦', icon: Package, color: 'text-slate-400 bg-slate-800/40 border-slate-700/60' }
];

export default function AdminExpensesPage({ currentUser, onNavigate, onLogout }) {
  const [expenses, setExpenses] = useState([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [toast, setToast] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [form, setForm] = useState({
    expenseName: '',
    category: 'Server Infrastructure',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getExpenses({ search, category: selectedCategory });
      if (res.data && res.data.success) {
        setExpenses(res.data.data || []);
        setMonthlyTotal(res.data.monthlyTotal || 0);
        setCategoryTotals(res.data.categoryBreakdown || {});
      }
    } catch (err) {
      console.error('Failed to load platform operating costs:', err);
      showToastMsg('Failed to load expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExpenses();
  };

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setForm({
      expenseName: '',
      category: 'Server Infrastructure',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setForm({
      expenseName: exp.expenseName,
      category: exp.category,
      amount: exp.amount,
      date: exp.date ? new Date(exp.date).toISOString().split('T')[0] : '',
      notes: exp.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.expenseName.trim() || !form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      showToastMsg('Please enter a valid expense name and positive amount', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingExpense) {
        await adminAPI.updateExpense(editingExpense._id || editingExpense.id, {
          expenseName: form.expenseName.trim(),
          category: form.category,
          amount: Number(form.amount),
          date: form.date,
          notes: form.notes.trim()
        });
        showToastMsg('Operating cost updated successfully');
      } else {
        await adminAPI.addExpense({
          expenseName: form.expenseName.trim(),
          category: form.category,
          amount: Number(form.amount),
          date: form.date,
          notes: form.notes.trim()
        });
        showToastMsg('Operating cost recorded successfully');
      }
      setShowModal(false);
      fetchExpenses();
    } catch (err) {
      console.error(err);
      showToastMsg('Failed to save expense', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove the operating cost "${name}"?`)) return;
    try {
      await adminAPI.deleteExpense(id);
      showToastMsg('Operating cost removed');
      fetchExpenses();
    } catch (err) {
      console.error(err);
      showToastMsg('Failed to delete expense', 'error');
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
            <span className="text-slate-400">Operating Costs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              🛠️
            </span>
            Platform Operating Cost Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track and audit operational overheads (cloud servers, AI inferencing, engineering, support) used in computing Net Platform Profit.
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
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Record Operating Cost
          </button>
        </div>
      </div>

      {/* KPI Cards & Breakdown Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Total Monthly Operating Costs */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-purple-950/20 border border-purple-500/30 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              Total Operating Costs (Sep 2026)
            </span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white tracking-tight">
              ₹{monthlyTotal.toLocaleString('en-IN')}
            </span>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Deducted from ₹30,000 Net Revenue ➔ ₹20,000 Net Profit
            </p>
          </div>
        </div>

        {/* Categories Logged */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cost Allocation Categories
            </span>
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white tracking-tight">
              {Object.keys(categoryTotals).length} / {PLATFORM_CATEGORIES.length} Active
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Top category: {Object.entries(categoryTotals).sort((a,b) => b[1] - a[1])[0]?.[0] || 'Infrastructure'}
            </p>
          </div>
        </div>

        {/* Formula Transparency Note */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Net Profit Formula
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-300 space-y-1">
            <div className="font-mono text-slate-200">
              Net Rev (₹30,000) - Ops Costs (₹10,000) = <strong className="text-emerald-400">₹20,000 Net Profit</strong>
            </div>
            <p className="text-[11px] text-slate-400">
              Accurate cost logging prevents inflation of platform profitability metrics.
            </p>
          </div>
        </div>

      </div>

      {/* Category Pills & Breakdown */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Quick Filter by Operational Department
          </span>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory('')}
              className="text-xs text-purple-400 hover:text-purple-300 underline font-medium"
            >
              Clear filter
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              selectedCategory === ''
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/20'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            All Categories ({expenses.length})
          </button>
          {PLATFORM_CATEGORIES.map(cat => {
            const amount = categoryTotals[cat.name] || 0;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(isSelected ? '' : cat.name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                    : `${cat.color} hover:bg-opacity-70`
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
                {amount > 0 && (
                  <span className="ml-1 font-mono text-[11px] opacity-80">
                    ₹{amount.toLocaleString('en-IN')}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expense Management Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        
        {/* Controls: Search & Refresh */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expenses by title or note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </form>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchExpenses}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors text-xs"
              title="Refresh Expenses"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-3" />
            <p className="text-sm font-medium">Loading platform operating expenses...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-16 text-center text-slate-500 border border-dashed border-slate-800/80 rounded-xl">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-300">No Operating Expenses Recorded</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {search || selectedCategory 
                ? 'No matching expenses found for your current filter.' 
                : 'Click "Record Operating Cost" to log server, AI, or maintenance overheads.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Expense Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Notes / Vendor</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {expenses.map((exp) => {
                  const catConfig = PLATFORM_CATEGORIES.find(c => c.name === exp.category) || PLATFORM_CATEGORIES[7];
                  return (
                    <tr key={exp._id || exp.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {exp.expenseName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium text-[11px] border ${catConfig.color}`}>
                          <span>{catConfig.emoji}</span>
                          <span>{exp.category}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{exp.date ? new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                        {exp.notes || <span className="text-slate-600 italic">No notes</span>}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-rose-400 font-mono text-sm whitespace-nowrap">
                        -₹{Number(exp.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(exp)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edit Expense"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(exp._id || exp.id, exp.expenseName)}
                            className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-900/60 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 transition-colors"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {editingExpense ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
                {editingExpense ? 'Edit Operating Cost' : 'Record Operating Cost'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Expense Title / Purpose *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Cloud Hosting & Kubernetes Nodes"
                  value={form.expenseName}
                  onChange={(e) => setForm({ ...form, expenseName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    {PLATFORM_CATEGORIES.map(c => (
                      <option key={c.name} value={c.name}>
                        {c.emoji} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 3500"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Date of Expenditure *
                </label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes / Vendor Reference
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Monthly EC2, RDS and S3 backup tier invoice"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingExpense ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
