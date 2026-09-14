import React, { useState, useEffect } from 'react';
import { X, Truck, MapPin, CheckCircle, Navigation, Clock, ShieldCheck } from 'lucide-react';

export default function LiveDeliveryTracker({ delivery, onClose }) {
  const [progressPercent, setProgressPercent] = useState(65);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgressPercent(prev => (prev >= 95 ? 65 : prev + 5));
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  if (!delivery) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Live Disintermediation GPS Tracker</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                  {delivery.id || 'DEL-4091'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Direct Farm-to-Fork Chain of Custody Telemetry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Map Route Simulation */}
        <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-6 overflow-hidden">
          
          {/* Subtle grid lines */}
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

          <div className="relative z-10 space-y-6">
            
            {/* 3-Point Delivery Route Map Graphic */}
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                <span>3-Point Disintermediation Route</span>
                <span className="text-amber-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Live ETA: {delivery.eta_minutes || 18} Mins
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative">
                {/* 1. Farm Location (Pickup) */}
                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-emerald-400">1. Farm Location (Pickup)</span>
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">🌱</span>
                  </div>
                  <div className="text-xs font-bold text-white truncate">{delivery.pickup_location || 'Patel Organic Farms, Berasia'}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Lat: 23.4000° N, Lon: 77.4300° E</div>
                </div>

                {/* 2. Driver Location (Moving) */}
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-1 relative overflow-hidden">
                  <div className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-amber-300">2. Driver Location (Moving)</span>
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">🚚</span>
                  </div>
                  <div className="text-xs font-bold text-amber-200 truncate">{delivery.driver_name || 'Vikram Singh'} en route</div>
                  <div className="text-[10px] text-amber-400/80 font-mono">Speed: 42 km/h • Transit: {progressPercent}%</div>
                </div>

                {/* 3. Consumer Location (Dropoff) */}
                <div className="p-3 rounded-xl bg-slate-950 border border-teal-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-teal-400">3. Consumer Location (Dropoff)</span>
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 font-bold text-xs flex items-center justify-center">🏠</span>
                  </div>
                  <div className="text-xs font-bold text-white truncate">{delivery.dropoff_location || 'Arera Colony, Bhopal'}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Lat: 23.2185° N, Lon: 77.4320° E</div>
                </div>
              </div>

              {/* Connecting Dynamic Route Bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-semibold">
                  <span className="text-emerald-400">Farm Gate Dispatched</span>
                  <span className="text-amber-400">Driver Transit ({progressPercent}%)</span>
                  <span className="text-teal-400">Consumer Doorstep</span>
                </div>
                <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-teal-400 transition-all duration-700 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Live GPS Telemetry Status Box */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-amber-400" />
                  <span>Assigned Transporter: {delivery.driver_name || 'Vikram Singh'}</span>
                </div>
                <div className="text-xs text-white mt-0.5">
                  Vehicle: {delivery.vehicle_type || 'Pickup Truck'} • <strong className="font-mono">{delivery.vehicle_number || 'MP 04 GA 4892'}</strong>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Estimated Arrival</div>
                  <div className="text-sm font-bold text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{delivery.eta_minutes || 18} mins</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Delivery OTP</div>
                  <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    OTP: {delivery.delivery_otp || '7234'}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Dual-Gate OTP Escrow Protected</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Close Tracker
          </button>
        </div>

      </div>
    </div>
  );
}
