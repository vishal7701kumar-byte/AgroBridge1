import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Plus, Calendar, Tag, Trash2, Pencil, Search, 
  Filter, ArrowLeft, TrendingDown, Layers, CheckCircle2, 
  AlertCircle, RefreshCw, Sprout, Droplets, Wrench, Users,
  Shield, Package, Truck, Zap, Home
} from 'lucide-react';
import { farmerAPI } from '../services/api';

const CATEGORIES = [
  { name: 'Seeds', emoji: '🌱', icon: Sprout },
  { name: 'Irrigation', emoji: '💧', icon: Droplets },
  { name: 'Equipment', emoji: '🚜', icon: Wrench },
  { name: 'Labour', emoji: '👷', icon: Users },
  { name: 'Fertilizer', emoji: '🌿', icon: Sprout },
  { name: 'Pest Control', emoji: '🛡', icon: Shield },
  { name: 'Packaging', emoji: '📦', icon: Package },
  { name: 'Transportation', emoji: '🚚', icon: Truck },
  { name: 'Electricity', emoji: '⚡', icon: Zap },
  { name: 'Other', emoji: '🏠', icon: Home }
];

export default function FarmerExpensesPage({ currentUser, onNavigate, onLogout }) {
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
    category: 'Seeds',
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
      const res = await farmerAPI.getExpenses({ search, category: selectedCategory });
      if (res.data && res.data.success) {
        setExpenses(res.data.data || []);
        setMonthlyTotal(res.data.monthlyTotal || 0);
        setCategoryTotals(res.data.categoryBreakdown || {});
      }
    } catch (err) {
      console.error('Failed to load farm expenses:', err);
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
      category: 'Seeds',
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
    if (!form.expenseName || !form.amount || isNaN(form.amount) || form.amount <= 0) {
      showToastMsg('Please enter a valid expense name and positive amount', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingExpense) {
        await farmerAPI.updateExpense(editingExpense.id, form);
        showToastMsg('Expense updated successfully');
      } else {
        await farmerAPI.addExpense(form);
        showToastMsg('Expense added successfully');
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await farmerAPI.deleteExpense(id);
      showToastMsg('Expense deleted');
      fetchExpenses();
    } catch (err) {
      console.error(err);
      showToastMsg('Failed to delete expense', 'error');
    }
  };

  const getCategoryObj = (catName) => {
    return CATEGORIES.find(c => c.name.toLowerCase() === (catName || '').toLowerCase()) || CATEGORIES[9];
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border backdrop-blur-md animate-fadeIn text-xs font-bold ${
          toast.type === 'error' ? 'bg-rose-950/90 border-rose-600 text-rose-100' : 'bg-emerald-950/90 border-emerald-600 text-emerald-100'
        }`}>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Top Header & Navigation */}
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
              <h1 className="text-2xl font-black text-white">💸 Farm Expenses</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30">
                Operating Costs
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Track seeds, irrigation, fertilizer, labour, and logistics for transparent net profit calculations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/farmer/profit')}
            className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
          >
            📊 View Profit Analysis
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-rose-500/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">This Month's Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-white">
            ₹{monthlyTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400">September 2026 farm operating total</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Expense Items</span>
            <Layers className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-black text-white">{expenses.length} Records</div>
          <div className="text-[11px] text-slate-400">Across 10 standard farm categories</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Cost Center</span>
            <Tag className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">
            {Object.keys(categoryTotals).length > 0 
              ? Object.entries(categoryTotals).sort((a,b) => b[1]-a[1])[0][0] 
              : 'Labour'}
          </div>
          <div className="text-[11px] text-slate-400">Accounted in net profit formulas</div>
        </div>

      </div>

      {/* Category Pills Filter Bar */}
      <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              selectedCategory === '' 
                ? 'bg-emerald-500 text-slate-950 shadow-md' 
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
                selectedCategory === cat.name 
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md' 
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
              {categoryTotals[cat.name] && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 ml-1">
                  ₹{categoryTotals[cat.name].toLocaleString('en-IN')}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expenses by name or notes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200"
        >
          Filter
        </button>
        <button
          type="button"
          onClick={() => { setSearch(''); setSelectedCategory(''); }}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs text-slate-400"
        >
          Reset
        </button>
      </form>

      {/* Expenses History Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Expense Ledger</span>
            <span className="text-xs font-normal text-slate-400">({expenses.length} items logged)</span>
          </h2>
          <span className="text-[11px] text-slate-400">Currency: ₹ (INR)</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading expense ledger...</span>
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
              💸
            </div>
            <div className="text-sm font-bold text-white">No expenses found</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't recorded any expenses matching the criteria. Click "+ Add Expense" to log costs.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 rounded-xl"
            >
              + Add First Expense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Expense Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Amount (₹)</th>
                  <th className="p-4">Notes</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {expenses.map(exp => {
                  const catObj = getCategoryObj(exp.category);
                  return (
                    <tr key={exp.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 font-bold text-white">
                        {exp.expenseName}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px]">
                          <span>{catObj.emoji}</span>
                          <span>{exp.category}</span>
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 font-mono text-[11px]">
                        {exp.date ? new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="p-4 text-right font-black text-rose-400 text-sm">
                        ₹{parseFloat(exp.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-slate-400 max-w-xs truncate text-[11px]">
                        {exp.notes || '—'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(exp)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edit expense"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                            title="Delete expense"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">
                  {editingExpense ? 'Edit Farm Expense' : 'Add New Farm Expense'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Record input costs to keep your Net Profit calculations accurate.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Expense Name *</label>
                <input
                  type="text"
                  required
                  value={form.expenseName}
                  onChange={(e) => setForm({ ...form, expenseName: e.target.value })}
                  placeholder="e.g. Hybrid Tomato Seeds, Field Labour"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.name} value={cat.name}>
                        {cat.emoji} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="e.g. 2400"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Date *</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Notes / Receipts (Optional)</label>
                <textarea
                  rows="3"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Provide vendor details, bill number, or crop batch allocation..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black flex items-center gap-2"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>{editingExpense ? 'Save Changes' : 'Record Expense'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
