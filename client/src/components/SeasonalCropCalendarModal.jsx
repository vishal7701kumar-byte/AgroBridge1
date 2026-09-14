import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Sparkles, TrendingUp, Sun, CloudRain, 
  MapPin, CheckCircle2, Info, RefreshCw, Compass
} from 'lucide-react';
import { aiAPI } from '../services/api';

export default function SeasonalCropCalendarModal({ isOpen, onClose }) {
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchCalendar();
    }
  }, [isOpen]);

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const res = await aiAPI.getCropCalendar();
      if (res.data && res.data.success) {
        setCalendarData(res.data.data);
        if (res.data.data.calendar?.length > 0) {
          setSelectedCrop(res.data.data.calendar[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch seasonal calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 text-slate-100">
        
        {/* Header Strip */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Seasonal AI Crop Recommendation Calendar
                </h2>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/40">
                  AI-Based Recommendation
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                AI optimization model combining historical APMC demand, regional weather patterns, and soil conditions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="min-h-[300px] flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
            <p className="text-xs text-slate-400">Synthesizing agronomic seasonality matrix...</p>
          </div>
        ) : calendarData ? (
          <div className="space-y-6">

            {/* Top Recommended Crop Spotlight */}
            {selectedCrop && (
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-teal-950/70 via-slate-900 to-emerald-950/70 border border-teal-500/40 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl p-3 bg-slate-950/80 border border-slate-800 rounded-2xl shadow-inner">
                      {selectedCrop.emoji}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-black text-teal-400 tracking-wider">Top Recommended Crop</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                          Demand Score: {selectedCrop.demandRating}/100
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-white flex items-center gap-2">
                        <span>{selectedCrop.crop}</span>
                        <span className="text-sm font-semibold text-slate-400">({selectedCrop.hindiName})</span>
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-2xl">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Expected Price Band</span>
                      <div className="text-lg font-black text-emerald-400">{selectedCrop.expectedPriceBand}</div>
                    </div>
                    <div className="border-l border-slate-800 pl-4">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Expected Demand</span>
                      <div className="text-lg font-black text-white">{selectedCrop.expectedDemand}</div>
                    </div>
                  </div>
                </div>

                {/* Agronomic Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-400" /> Optimal Planting Month
                    </span>
                    <div className="text-sm font-bold text-white mt-1">{selectedCrop.recommendedPlantingMonth}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Peak Harvest Window
                    </span>
                    <div className="text-sm font-bold text-emerald-300 mt-1">{selectedCrop.expectedHarvestMonth}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 sm:col-span-2 lg:col-span-1">
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-amber-400" /> Soil & Climate Suitability
                    </span>
                    <div className="text-xs font-semibold text-slate-200 mt-1 truncate">{selectedCrop.soilRequirement}</div>
                  </div>
                </div>

                {/* AI Rationale */}
                <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-teal-500/20 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <p>
                    <strong>AI Agronomic Rationale:</strong> {selectedCrop.aiRationale}
                  </p>
                </div>
              </div>
            )}

            {/* Other Recommended Crops Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Full Agronomic Calendar Portfolio
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {calendarData.calendar?.map((c) => (
                  <div
                    key={c.crop}
                    onClick={() => setSelectedCrop(c)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                      selectedCrop?.crop === c.crop
                        ? 'bg-teal-500/10 border-teal-500/60 shadow-lg shadow-teal-500/10'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{c.emoji}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-900 border border-slate-700 text-slate-300">
                        {c.expectedDemand}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{c.crop}</div>
                      <div className="text-[11px] text-emerald-400 font-bold">{c.expectedPriceBand}</div>
                    </div>
                    <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5 flex justify-between">
                      <span>Plant: {c.recommendedPlantingMonth.split('-')[0]}</span>
                      <span>Harvest: {c.expectedHarvestMonth.split('-')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Disclaimer */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
              <Info className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{calendarData.aiAdvisory}</span>
            </div>

          </div>
        ) : null}

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            Close Calendar
          </button>
        </div>

      </div>
    </div>
  );
}
