import React from 'react';
import { X, ArrowLeft } from 'lucide-react';
import SmartPriceComparisonContent from './SmartPriceComparisonContent';

export default function SmartPriceComparisonModal({ isOpen, onClose, product, onAddToCart }) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-teal-500/40 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-teal-500 transition-colors"
              title="Back to marketplace"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">📊 Smart Price Comparison</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  SIH MVP
                </span>
              </div>
              <p className="text-xs text-slate-400">Direct Farm-to-Fork Disintermediation Transparency Engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <SmartPriceComparisonContent
          productId={product.id}
          initialProduct={product}
          onAddToCart={onAddToCart}
          onClose={onClose}
        />

        {/* Bottom Close Bar */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Back to Marketplace
          </button>
        </div>

      </div>
    </div>
  );
}
