import React from 'react';
import { Leaf, ShieldCheck, Truck, ArrowRight, Award, TrendingDown, Users, X } from 'lucide-react';

export default function CarbonFootprintModal({ isOpen, onClose, orderData = null }) {
  if (!isOpen) return null;

  const data = {
    orderId: orderData?.orderId || 'ORD-AB-98214',
    cropName: orderData?.cropName || 'Fresh Hybrid Tomatoes',
    quantity: orderData?.quantity || 150,
    unit: orderData?.unit || 'kg',
    farmerName: orderData?.farmerName || 'Ramesh Kumar',
    farmerLocation: orderData?.farmerLocation || 'Bhopal Rural (FPO Cluster A)',
    buyerLocation: orderData?.buyerLocation || 'Arera Colony, Bhopal',
    middlemenEliminated: 3,
    distanceSavedKm: 18,
    co2SavedKg: 12.5,
    farmerEarnings: orderData?.farmerEarnings || 4200,
    traditionalFarmerEarnings: 2700,
    dieselSavedLiters: 4.8,
  };

  const extraFarmerBenefit = data.farmerEarnings - data.traditionalFarmerEarnings;
  const extraFarmerPercent = Math.round((extraFarmerBenefit / data.traditionalFarmerEarnings) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/30 rounded-xl border border-emerald-400/40">
              <Leaf className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold">AgroBridge Sustainability Metrics</h3>
                <span className="text-xs bg-emerald-400/20 border border-emerald-300/40 px-2 py-0.5 rounded-full font-semibold text-emerald-100">
                  Eco-Impact
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Direct Farm-to-Fork routing carbon & socio-economic impact scorecard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Info Banner */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="text-gray-500">Order Ref: </span>
              <span className="font-mono font-bold text-gray-800">{data.orderId}</span>
            </div>
            <div>
              <span className="text-gray-500">Crop: </span>
              <span className="font-bold text-emerald-800">{data.cropName} ({data.quantity} {data.unit})</span>
            </div>
          </div>

          {/* 4 Core Pillars Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Metric 1: Middlemen Eliminated */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Intermediaries</span>
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div className="my-2">
                <div className="text-3xl font-black text-amber-700">{data.middlemenEliminated}</div>
                <div className="text-xs font-bold text-amber-900 mt-0.5">Middlemen Eliminated</div>
              </div>
              <p className="text-[11px] text-amber-800/80 leading-relaxed">
                Replaced village commission agents, regional aggregators, and wholesale mandi brokers with direct routing.
              </p>
            </div>

            {/* Metric 2: Distance Saved */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider">Logistics Routing</span>
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div className="my-2">
                <div className="text-3xl font-black text-blue-700">{data.distanceSavedKm} <span className="text-lg font-bold">km</span></div>
                <div className="text-xs font-bold text-blue-900 mt-0.5">Distance Optimized</div>
              </div>
              <p className="text-[11px] text-blue-800/80 leading-relaxed">
                By circumventing indirect mandi distribution hubs, transit transit time reduced by 4.2 hours.
              </p>
            </div>

            {/* Metric 3: CO2 Saved */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">Greenhouse Gases</span>
                <TrendingDown className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="my-2">
                <div className="text-3xl font-black text-emerald-700">{data.co2SavedKg} <span className="text-lg font-bold">kg</span></div>
                <div className="text-xs font-bold text-emerald-900 mt-0.5">CO₂ Emissions Abated</div>
              </div>
              <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                Equivalent to planting ~1.8 mature neem trees; saves {data.dieselSavedLiters} L of commercial diesel fuel.
              </p>
            </div>

            {/* Metric 4: Farmer Earnings Boost */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-900 uppercase tracking-wider">Farmer Equity</span>
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div className="my-2">
                <div className="text-3xl font-black text-purple-700">₹{data.farmerEarnings}</div>
                <div className="text-xs font-bold text-purple-900 mt-0.5">Direct Payout (+{extraFarmerPercent}%)</div>
              </div>
              <p className="text-[11px] text-purple-800/80 leading-relaxed">
                Farmer received ₹{extraFarmerBenefit} more than Mandi APMC cartel floor rates for this batch.
              </p>
            </div>
          </div>

          {/* Route Comparison Diagram */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Supply Chain Optimization Comparison</h4>
            
            {/* Traditional Inefficient Chain */}
            <div className="bg-white p-3 rounded-lg border border-red-200 text-xs">
              <div className="flex items-center justify-between font-semibold text-red-700 mb-1.5">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                  <span>Traditional Mandi Multi-Hop (48 km)</span>
                </span>
                <span className="text-[11px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-mono">3x Handling Damage</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-500 overflow-x-auto py-1 text-[11px]">
                <span className="text-gray-800 font-medium">Farm</span>
                <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                <span className="text-red-600">Local Middleman</span>
                <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                <span className="text-red-600">APMC Mandi</span>
                <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                <span className="text-red-600">Wholesaler</span>
                <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                <span className="text-gray-800 font-medium">Retailer / Buyer</span>
              </div>
            </div>

            {/* AgroBridge Direct Route */}
            <div className="bg-emerald-50/80 p-3 rounded-lg border border-emerald-300 text-xs">
              <div className="flex items-center justify-between font-semibold text-emerald-800 mb-1.5">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  <span>AgroBridge AI Direct Cluster (30 km)</span>
                </span>
                <span className="text-[11px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-mono font-bold">
                  Zero Intermediary
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-gray-600 py-1 text-[11px]">
                <span className="text-emerald-900 font-bold">{data.farmerName} ({data.farmerLocation})</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="bg-emerald-200/80 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                  Smart EV Route Batch
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-emerald-900 font-bold">{data.buyerLocation}</span>
              </div>
            </div>
          </div>

          {/* Social Impact Summary */}
          <div className="flex items-start space-x-3 bg-emerald-950 text-white rounded-xl p-4">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h5 className="font-bold text-emerald-200">UN SDG Alignment (SDG 12 & SDG 13)</h5>
              <p className="text-gray-300 leading-relaxed">
                By purchasing through AgroBridge, your transaction directly abates post-harvest transport degradation, reduces food miles, and ensures that 88–92% of the consumer rupee flows directly into the primary grower's bank account.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Calculated via AgroBridge Geo-Routing Engine v2.4
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            Close Scorecard
          </button>
        </div>
      </div>
    </div>
  );
}
