import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  TrendingUp, 
  Calculator, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  BarChart3, 
  Database, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight 
} from 'lucide-react';
import { aiAPI } from '../services/api';
import PriceHistoryForecastChart from './PriceHistoryForecastChart';

export default function AIDecisionModal({ isOpen, onClose, initialCommodity = 'Tomato' }) {
  const [commodity, setCommodity] = useState(initialCommodity);
  const [grade, setGrade] = useState('Grade A');
  const [quantityKg, setQuantityKg] = useState(500);
  const [farmerPriceInput, setFarmerPriceInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const [showWhyFactors, setShowWhyFactors] = useState(false);
  const [historyRecords, setHistoryRecords] = useState([]);

  useEffect(() => {
    if (isOpen) {
      handleCalculate();
    }
  }, [isOpen]);

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const priceVal = farmerPriceInput ? parseFloat(farmerPriceInput) : null;
      const res = await aiAPI.getPriceRecommendation(commodity, grade, quantityKg, priceVal, 'Bhopal');
      if (res.data && res.data.success) {
        setResult(res.data.data);
        if (!farmerPriceInput && res.data.data.recommendedDirectRate) {
          setFarmerPriceInput(String(res.data.data.recommendedDirectRate));
        }
      }

      // Fetch historical price records for interactive chart preview
      const histRes = await aiAPI.getPriceHistory({ commodity, market: 'Bhopal', days: 30 });
      if (histRes.data && histRes.data.success) {
        setHistoryRecords(histRes.data.data || []);
      }
    } catch (err) {
      console.error('Error in price recommendation calculation:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const mandiRate = result?.mandiBenchmarkRate || result?.currentMarketReference?.pricePerKg || 0;
  const effectiveFarmerPrice = parseFloat(farmerPriceInput) || result?.recommendedDirectRate || mandiRate;
  const qty = parseFloat(quantityKg) || 500;
  const grossFarmer = Math.round(effectiveFarmerPrice * qty);
  const grossMandi = Math.round(mandiRate * qty);
  const grossDiff = grossFarmer - grossMandi;
  const commSavings = Math.round(grossMandi * 0.07);
  const totalRealization = grossDiff + commSavings;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">AgroBridge AI Price Advisory</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Real APMC Grounding
                </span>
              </div>
              <p className="text-xs text-slate-400">Government Mandi Benchmark & Statistical Future Forecasting</p>
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
        <form onSubmit={handleCalculate} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Commodity</label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Tomato">Tomato (Hybrid / Desi)</option>
              <option value="Wheat">Wheat (Sharbati / Lokwan)</option>
              <option value="Onion">Onion (Nasik Red)</option>
              <option value="Soybean">Soybean (Yellow)</option>
              <option value="Potato">Potato (Jyoti / Kufri)</option>
              <option value="Cauliflower">Cauliflower</option>
              <option value="Cucumber">Cucumber</option>
              <option value="Apple">Apple (Shimla / Royal)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Quality Grade</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Grade A+">Grade A+ (Premium Lot)</option>
              <option value="Grade A">Grade A (Standard)</option>
              <option value="Grade B">Grade B (Processing)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Harvest Quantity (kg)</label>
            <input
              type="number"
              min="10"
              max="50000"
              value={quantityKg}
              onChange={(e) => setQuantityKg(e.target.value)}
              placeholder="e.g. 500"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Your Asking Price (₹/kg)
            </label>
            <input
              type="number"
              step="0.5"
              value={farmerPriceInput}
              onChange={(e) => setFarmerPriceInput(e.target.value)}
              placeholder="e.g. 28"
              className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-emerald-300 font-bold focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="sm:col-span-4 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              <span>{loading ? 'Evaluating Mandi Data & Statistical Band...' : 'Update AI Price Recommendation'}</span>
            </button>
          </div>
        </form>

        {/* Results Card */}
        {result && (
          <div className="space-y-5 animate-fadeIn">
            
            {/* STRICT THREE-WAY PRICE SEPARATION */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* SECTION A: Government Mandi Reference */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">A. Mandi Benchmark</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                    Reference Only
                  </span>
                </div>
                <div className="text-2xl font-black text-white">
                  ₹{mandiRate}<span className="text-xs font-normal text-slate-400">/kg</span>
                </div>
                <div className="text-[11px] text-slate-300 font-medium">
                  ₹{Math.round(mandiRate * 100)} / quintal
                </div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                  Source: AGMARKNET (data.gov.in)
                  <div className="text-[9px] text-slate-500 mt-0.5">
                    {result.currentMarketReference?.dataDate || 'Latest APMC Trading Day'}
                  </div>
                </div>
              </div>

              {/* SECTION B: AI Future Forecast */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-amber-400">B. AI 7-Day Forecast</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                    {result.aiForecast?.forecastReliability || 'Medium'} Reliability
                  </span>
                </div>
                <div className="text-2xl font-black text-amber-300">
                  {result.aiForecast?.rangePerKg || `₹${Math.round(mandiRate * 0.95)}–₹${Math.round(mandiRate * 1.15)}/kg`}
                </div>
                <div className="text-[11px] text-amber-200/90 font-medium flex items-center gap-1">
                  <span>{result.aiForecast?.expectedTrendSymbol || '↗'}</span>
                  <span>{result.aiForecast?.expectedTrend || 'Increasing'} Trend</span>
                </div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                  Ridge Auto-Regressive Band
                  <div className="text-[9px] text-slate-500 mt-0.5">
                    Statistical range (not a guarantee)
                  </div>
                </div>
              </div>

              {/* SECTION C: Farmer Listing Price (Farmer Set) */}
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-emerald-300">C. Your Listing Price</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    100% Autonomous
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-400">
                  ₹{effectiveFarmerPrice}<span className="text-xs font-normal text-slate-400">/kg</span>
                </div>
                <div className="text-[11px] text-emerald-300 font-medium">
                  {effectiveFarmerPrice >= mandiRate ? `+₹${Math.round((effectiveFarmerPrice - mandiRate) * 10) / 10}/kg vs mandi` : 'Below mandi benchmark'}
                </div>
                <div className="text-[10px] text-slate-300 pt-1 border-t border-emerald-900/60">
                  Direct Sale on AgroBridge
                  <div className="text-[9px] text-emerald-400/80 mt-0.5 font-medium">
                    AI never alters your selling price
                  </div>
                </div>
              </div>

            </div>

            {/* ESTIMATED ADDITIONAL REALIZATION (Transparent Financial Comparison) */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-emerald-950/30 border border-emerald-500/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    Estimated Additional Realization vs. Local APMC Mandi
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Transparent comparison for {qty} kg harvest yield (disintermediation advantage)
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-2xl font-black text-emerald-400">
                    +₹{totalRealization.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-emerald-300 font-semibold">
                    Gross Value + Commission Savings
                  </div>
                </div>
              </div>

              {/* Itemized Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">AgroBridge Listing Gross</div>
                  <div className="font-bold text-white mt-0.5">₹{grossFarmer.toLocaleString('en-IN')}</div>
                  <div className="text-[9px] text-slate-500">₹{effectiveFarmerPrice}/kg × {qty}kg</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Mandi Benchmark Gross</div>
                  <div className="font-bold text-slate-300 mt-0.5">₹{grossMandi.toLocaleString('en-IN')}</div>
                  <div className="text-[9px] text-slate-500">₹{mandiRate}/kg × {qty}kg</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Direct Price Difference</div>
                  <div className="font-bold text-emerald-300 mt-0.5">
                    {grossDiff >= 0 ? `+₹${grossDiff.toLocaleString('en-IN')}` : `-₹${Math.abs(grossDiff).toLocaleString('en-IN')}`}
                  </div>
                  <div className="text-[9px] text-slate-500">({effectiveFarmerPrice} - {mandiRate}) × {qty}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                  <div className="text-[10px] text-emerald-300">Middleman Fee Avoided</div>
                  <div className="font-bold text-emerald-400 mt-0.5">+₹{commSavings.toLocaleString('en-IN')}</div>
                  <div className="text-[9px] text-emerald-300/80">~7% APMC commission cut saved</div>
                </div>
              </div>

              {/* Honest Realization Disclaimer */}
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Notice:</strong> Estimated Additional Realization represents the gross financial difference compared to the local APMC benchmark rate, plus middleman commission savings. It does not account for farm-level seed, fertilizer, electricity, or labor costs.
                </span>
              </div>
            </div>

            {/* INTERACTIVE CHART TOGGLE & PREVIEW */}
            <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowChart(!showChart)}
                className="w-full px-4 py-3 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>Interactive Historical APMC Trend & 7-Day Forecast Curve</span>
                </span>
                {showChart ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showChart && (
                <div className="p-4 border-t border-slate-800 animate-fadeIn">
                  <PriceHistoryForecastChart
                    commodity={commodity}
                    market="Bhopal"
                    historyRecords={historyRecords}
                    forecastRecords={result.dailyForecasts || []}
                    daysFilter={30}
                    loading={false}
                  />
                </div>
              )}
            </div>

            {/* Explainable Factor Card ("Why This Estimate?") */}
            <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowWhyFactors(!showWhyFactors)}
                className="w-full px-4 py-3 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <span>Why This Estimate? (Explainable Methodology)</span>
                </span>
                {showWhyFactors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showWhyFactors && (
                <div className="px-4 pb-4 pt-1 space-y-2 border-t border-slate-800 text-xs text-slate-300 animate-fadeIn">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>AGMARKNET Mandi Grounding:</strong> Model anchors to verified daily modal wholesale transaction records published by the Directorate of Marketing & Inspection.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Grade Quality Differential:</strong> {grade} lots attract commercial premiums from bulk institutional buyers directly on AgroBridge.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Intermediary Commission Elimination:</strong> Direct farm-to-buyer transactions eliminate arbitrary 6% to 8% adhatya (brokerage) deductions.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bilingual AI Farmer Advisory Note */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-200">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>AI Price Advisory Insight:</span>
              </div>
              <p className="leading-relaxed">
                {result.aiAdvisory || `Direct sale bypassing APMC commission agents realizes ₹${result.extraEarningsPerKg}/kg additional value. Recommended price locks high buyer demand on AgroBridge.`}
              </p>
            </div>

          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            Close Advisory
          </button>
        </div>

      </div>
    </div>
  );
}
