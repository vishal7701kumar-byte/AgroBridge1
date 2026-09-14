import React, { useState } from 'react';
import { 
  X, Camera, Upload, Sparkles, CheckCircle2, ShieldCheck, 
  Award, RefreshCw, AlertCircle, Check, ArrowRight, Eye
} from 'lucide-react';
import { aiAPI } from '../services/api';

const SAMPLE_CROPS = [
  {
    name: 'Tomatoes',
    label: 'Fresh Vine Tomatoes 🍅',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Potatoes',
    label: 'Golden Harvest Potatoes 🥔',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Onions',
    label: 'Red Nashik Onions 🧅',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Cucumbers',
    label: 'Crisp Green Cucumbers 🥒',
    image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&auto=format&fit=crop&q=80'
  }
];

export default function AICropQualityScannerModal({ isOpen, onClose, onApplyScanToCrop }) {
  const [selectedImage, setSelectedImage] = useState(SAMPLE_CROPS[0].image);
  const [cropName, setCropName] = useState(SAMPLE_CROPS[0].name);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setScanResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sample) => {
    setSelectedImage(sample.image);
    setCropName(sample.name);
    setUploadedFileName('');
    setScanResult(null);
  };

  const handleStartScan = async () => {
    setIsScanning(true);
    setScanResult(null);

    try {
      // Small simulated delay to display neural scan animation
      await new Promise(r => setTimeout(r, 1200));
      const res = await aiAPI.scanQuality(selectedImage, cropName);
      if (res.data && res.data.success) {
        setScanResult(res.data.data);
      }
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleApply = () => {
    if (scanResult && onApplyScanToCrop) {
      onApplyScanToCrop({
        quality: scanResult.grade,
        isAssured: scanResult.isAssuredEligible,
        recommendedPrice: scanResult.recommendedPrice,
        image: selectedImage
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 text-slate-100">
        
        {/* Header Strip */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  AI Crop Quality Scanner
                </h2>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  AgroVision AI
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Computer vision inspection: Moisture, pigmentation, uniform dimension, and freshness verification.
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

        {/* Image Selection & Upload Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Left: Interactive Preview with Laser Scan Effect */}
          <div className="space-y-3">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center group shadow-inner">
              <img
                src={selectedImage}
                alt="Crop preview for AI scanning"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Laser Scan Beam Animation */}
              {isScanning && (
                <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[1px] pointer-events-none flex flex-col justify-between overflow-hidden">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scan" />
                  <div className="p-3 bg-slate-950/80 backdrop-blur-md text-center text-xs font-bold text-emerald-300">
                    🔍 Extracting cellular pigmentation & dimension metrics...
                  </div>
                </div>
              )}

              {/* AgroBridge Assured Overlaid Badge if Grade A */}
              {scanResult?.isAssured && (
                <div className="absolute top-3 left-3 bg-slate-950/90 border border-emerald-500/60 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-1.5 animate-fadeIn">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-black text-emerald-300 tracking-wide">
                    ✓ AGROBRIDGE ASSURED
                  </span>
                </div>
              )}
            </div>

            {/* Quick Upload or Pick Controls */}
            <div className="flex items-center gap-2">
              <label className="flex-1 cursor-pointer py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>{uploadedFileName ? 'Change Photo' : 'Upload Harvest Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleStartScan}
                disabled={isScanning}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Quality</span>
                  </>
                )}
              </button>
            </div>

            {/* Sample Crops Row */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Or pick a demo harvest crop:</span>
              <div className="grid grid-cols-4 gap-2">
                {SAMPLE_CROPS.map(s => (
                  <button
                    key={s.name}
                    onClick={() => handleSelectSample(s)}
                    className={`p-1.5 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 transition-all ${
                      selectedImage === s.image
                        ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <img src={s.image} alt={s.name} className="w-8 h-8 rounded-lg object-cover" />
                    <span className="truncate w-full text-center text-[10px]">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Analysis Results & Metrics Breakdown */}
          <div className="space-y-4">
            {scanResult ? (
              <div className="space-y-4 animate-fadeIn">
                
                {/* Result Grade Card */}
                <div className={`p-4 sm:p-5 rounded-2xl border ${
                  scanResult.qualityGrade === 'A' 
                    ? 'bg-gradient-to-br from-emerald-950/60 via-slate-900 to-teal-950/60 border-emerald-500/40'
                    : 'bg-slate-950 border-slate-800'
                } space-y-3`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-extrabold text-emerald-400 tracking-wider">AI Quality Grade</span>
                      <div className="text-3xl font-black text-white flex items-center gap-2">
                        <span>Grade {scanResult.qualityGrade}</span>
                        {scanResult.qualityGrade === 'A' && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Premium Quality
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-2xl font-black">
                      {scanResult.qualityGrade}
                    </div>
                  </div>

                  {/* AgroBridge Assured Award Banner */}
                  {scanResult.isAssured && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-200">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>✓ AGROBRIDGE ASSURED AWARDED</span>
                        </div>
                        <p className="text-[11px] text-emerald-300/80">
                          Exceeds Grade A threshold (&gt;85% freshness). Displays premium trust badge on consumer & bulk buyer marketplaces.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scores Matrix */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 font-semibold">Freshness</span>
                    <div className="text-lg font-black text-emerald-400 mt-1">{scanResult.freshnessScore}</div>
                    <span className="text-[9px] text-emerald-500/80">Moisture retention</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 font-semibold">Color Score</span>
                    <div className="text-lg font-black text-teal-300 mt-1">{scanResult.colorScore}</div>
                    <span className="text-[9px] text-teal-400/80">Pigmentation</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 font-semibold">Size Score</span>
                    <div className="text-lg font-black text-amber-300 mt-1">{scanResult.sizeScore}</div>
                    <span className="text-[9px] text-amber-400/80">Uniformity</span>
                  </div>
                </div>

                {/* Recommended Price Callout */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold">AI Recommended Price</span>
                    <div className="text-2xl font-black text-white">
                      ₹{scanResult.recommendedPrice}<span className="text-xs font-normal text-slate-400">/kg</span>
                    </div>
                    <span className="text-[10px] text-emerald-400">
                      +₹{scanResult.recommendedPrice - scanResult.mandiPriceBenchmark}/kg above Mandi auction rate
                    </span>
                  </div>
                  {onApplyScanToCrop && (
                    <button
                      onClick={handleApply}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                    >
                      <span>Apply to Crop</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Narrative Summary */}
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  {scanResult.recommendationSummary}
                </p>

              </div>
            ) : (
              <div className="min-h-[260px] rounded-2xl bg-slate-950/50 border border-dashed border-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/60 text-slate-400 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="space-y-1 max-w-xs">
                  <h4 className="text-sm font-bold text-white">Ready for Quality Scan</h4>
                  <p className="text-xs text-slate-400">
                    Upload or select a harvest photo and click <span className="text-emerald-400 font-semibold">"Analyze Quality"</span> to evaluate Grade A qualification.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800/80">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            Close Scanner
          </button>
        </div>

      </div>
    </div>
  );
}
