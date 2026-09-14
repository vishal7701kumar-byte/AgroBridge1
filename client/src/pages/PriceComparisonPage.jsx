import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, CheckCircle2 } from 'lucide-react';
import SmartPriceComparisonContent from '../components/SmartPriceComparisonContent';
import { consumerAPI } from '../services/api';

export default function PriceComparisonPage({ currentRoute, onNavigate }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Extract ID from route e.g. /consumer/product/prod_1/compare-price
  let productId = 'prod_1';
  if (currentRoute) {
    const match = currentRoute.match(/\/consumer\/product\/([^/]+)\/compare-price/);
    if (match && match[1]) {
      productId = match[1];
    }
  }

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await consumerAPI.getProductById(productId);
        if (res.data && res.data.success) {
          setProduct(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load product for comparison page:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = (item) => {
    // Add to cart in localStorage / state
    try {
      const existing = JSON.parse(localStorage.getItem('agrobridge_cart') || '[]');
      const foundIdx = existing.findIndex(p => p.id === item.id);
      if (foundIdx > -1) {
        existing[foundIdx].quantity_kg = (existing[foundIdx].quantity_kg || 1) + 1;
      } else {
        existing.push({
          id: item.id,
          product_name: item.product_name,
          price_per_kg: item.price_per_kg,
          quantity_kg: 1,
          farm_name: item.farm_name
        });
      }
      localStorage.setItem('agrobridge_cart', JSON.stringify(existing));
      setToast(`Added ${item.product_name} to direct farm cart!`);
      setTimeout(() => setToast(null), 3500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-teal-950 border border-teal-500 text-teal-100 shadow-2xl text-xs font-semibold flex items-center gap-2.5 backdrop-blur-xl">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/consumer/dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-teal-500 text-xs font-semibold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Consumer Marketplace</span>
        </button>

        <button
          onClick={() => onNavigate('/consumer/dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-slate-950 border border-teal-500/40 text-xs font-bold transition-all cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Go to Cart</span>
        </button>
      </div>

      {/* Smart Price Comparison Content */}
      <SmartPriceComparisonContent
        productId={productId}
        initialProduct={product}
        onAddToCart={handleAddToCart}
        onClose={() => onNavigate('/consumer/dashboard')}
      />

    </div>
  );
}
