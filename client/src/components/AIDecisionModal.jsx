import React, { useState } from 'react';
import { X, Sparkles, TrendingUp, Calculator, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { aiAPI } from '../services/api';

export default function AIDecisionModal({ isOpen, onClose, initialCommodity = 'Tomato' }) {
  const [commodity, setCommodity] = useState(initialCommodity);
  const [grade, setGrade] = useState('Grade A');
  const [quantityKg, setQuantityKg] = useState(500);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await aiAPI.getPriceRecommendation(commodity, grade, quantityKg);
      if (res.data && res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AgroBridge AI Decision Engine</h3>
              <p className="text-xs text-slate-400">APMC Mandi Benchmark Analysis & Disintermediation Premium</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleCalculate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Commodity</label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Tomato">Tomato (Hybrid)</option>
              <option value="Wheat">Sharbati Wheat</option>
              <option value="Onion">Red Onion</option>
              <option value="Soybean">Yellow Soybean</option>
              <option value="Cucumber">Cucumber</option>
              <option value="Carrot">Organic Carrot</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Quality Grade</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Grade A+">Grade A+ (Premium)</option>
              <option value="Grade A">Grade A (Standard)</option>
              <option value="Grade B">Grade B (Processing)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Harvest Quantity</label>
            <input
              type="number"
              value={quantityKg}
              onChange={(e) => setQuantityKg(e.target.value)}
              placeholder="Quantity in kg"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="sm:col-span-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              <span>{loading ? 'Analyzing Market Mandis...' : 'Run AI Price Recommendation'}</span>
            </button>
          </div>
        </form>

        {/* Results Card */}
        {result && (
          <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400 font-bold">Mandi Middleman Rate</div>
                <div className="text-lg font-black text-slate-300 line-through">₹{result.mandiBenchmarkRate}/kg</div>
                <div className="text-[10px] text-rose-400 font-semibold">-8% Commission cut</div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                <div className="text-[10px] uppercase text-emerald-300 font-bold">AgroBridge Direct Rate</div>
                <div className="text-xl font-black text-emerald-400">₹{result.recommendedDirectRate}/kg</div>
                <div className="text-[10px] text-emerald-300 font-bold">{result.percentageBonus} Realization</div>
              </div>

              <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/40 col-span-2 sm:col-span-1">
                <div className="text-[10px] uppercase text-teal-300 font-bold">Net Extra Profit</div>
                <div className="text-xl font-black text-teal-300">+₹{result.totalExtraEarnings.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-teal-400 font-semibold">For {result.quantityKg} kg yield</div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{result.aiAdvisory}</span>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
