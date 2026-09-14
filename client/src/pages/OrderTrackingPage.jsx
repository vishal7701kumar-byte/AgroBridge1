import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Truck, MapPin, CheckCircle2, Clock, Navigation, 
  ShieldCheck, Phone, RefreshCw, Check, Sparkles, AlertCircle 
} from 'lucide-react';
import { consumerAPI } from '../services/api';
import DeliveryMap from '../components/DeliveryMap';

const TRACKING_STEPS = [
  { key: 'ORDER_CONFIRMED', label: 'Order Confirmed', icon: '📝' },
  { key: 'PAYMENT_SUCCESSFUL', label: 'Payment Secured', icon: '🔒' },
  { key: 'FARMER_PREPARING', label: 'Farmer Preparing Harvest', icon: '🌾' },
  { key: 'DRIVER_ASSIGNED', label: 'Driver Assigned', icon: '🚚' },
  { key: 'PICKED_UP', label: 'Order Picked Up', icon: '📦' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🛣️' },
  { key: 'DELIVERED', label: 'Delivered to Doorstep', icon: '🏠' }
];

export default function OrderTrackingPage({ currentRoute, onNavigate }) {
  // Extract order/delivery ID from route: /consumer/orders/:id/track
  const match = currentRoute.match(/\/orders\/([^/?#]+)\/track/);
  const targetId = match ? match[1] : 'ORD-9102';

  const [trackData, setTrackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pollingCount, setPollingCount] = useState(0);

  const fetchTracking = async () => {
    try {
      const res = await consumerAPI.getDeliveryTracking(targetId);
      if (res.data && res.data.success) {
        setTrackData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load tracking data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and 10-second polling
  useEffect(() => {
    fetchTracking();
    const interval = setInterval(() => {
      fetchTracking();
      setPollingCount(p => p + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, [targetId]);

  if (loading && !trackData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm font-semibold">Connecting to live driver telemetry...</p>
        </div>
      </div>
    );
  }

  const status = trackData?.deliveryStatus || 'OUT_FOR_DELIVERY';

  // Map status to current step index (0-6)
  let activeStepIndex = 5; // Default: OUT_FOR_DELIVERY
  if (status === 'ORDER_CONFIRMED') activeStepIndex = 1;
  else if (status === 'FARMER_PREPARING') activeStepIndex = 2;
  else if (status === 'DRIVER_ASSIGNED') activeStepIndex = 3;
  else if (status === 'PICKED_UP') activeStepIndex = 4;
  else if (status === 'OUT_FOR_DELIVERY') activeStepIndex = 5;
  else if (status === 'DELIVERED') activeStepIndex = 6;

  const distanceRemaining = trackData?.estimatedDistanceKm || 4.2;
  const etaMinutes = trackData?.estimatedTimeMinutes || 12;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={() => onNavigate('/consumer/dashboard')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-lg font-bold text-white">Live Farm-to-Fork Order Tracking</h1>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="text-xs font-mono text-emerald-400">Order #{trackData?.orderId || targetId}</span>
        </div>

        <button
          onClick={fetchTracking}
          title="Refresh Live Telemetry"
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Live Status Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/40 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 animate-bounce" />
                <span>{status === 'DELIVERED' ? 'ORDER DELIVERED' : 'DRIVER ON THE WAY'}</span>
              </span>
              <span className="text-[11px] text-slate-400">• Telemetry Live</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {status === 'DELIVERED' ? 'Your produce has been delivered!' : 'Your fresh harvest is on its way!'}
            </h2>
            <p className="text-xs text-slate-300">
              Driver Partner: <strong className="text-white">{trackData?.driverInfo?.name || 'Vikram Singh'}</strong> ({trackData?.driverInfo?.vehicleType || 'Pickup Truck'})
            </p>
          </div>

          <div className="flex items-center gap-6 bg-slate-950/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Distance</div>
              <div className="text-base font-extrabold text-emerald-400">
                {status === 'DELIVERED' ? '0 KM' : `${distanceRemaining} KM away`}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">ETA</div>
              <div className="text-base font-extrabold text-amber-400 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{status === 'DELIVERED' ? 'Delivered' : `~${etaMinutes} mins`}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Delivery Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Live OpenStreetMap Route</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Auto-polling every 10s
          </span>
        </div>

        <DeliveryMap
          pickupLocation={trackData?.pickupLocation}
          deliveryLocation={trackData?.deliveryLocation}
          driverLocation={trackData?.driverLocation}
          estimatedDistanceKm={distanceRemaining}
          estimatedTimeMinutes={etaMinutes}
        />
      </div>

      {/* Dynamic Progress Timeline */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span>⏱️</span>
          <span>Order Fulfillment Timeline</span>
        </h3>

        <div className="relative">
          {/* Timeline connecting line */}
          <div className="absolute top-5 left-4 right-4 h-0.5 bg-slate-800 -z-0 hidden md:block" />

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 relative z-10">
            {TRACKING_STEPS.map((step, idx) => {
              const isDone = idx <= activeStepIndex;
              const isCurrent = idx === activeStepIndex;

              return (
                <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base transition-all ${
                      isCurrent
                        ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/30 shadow-lg shadow-emerald-500/30 scale-110'
                        : isDone
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-950 border border-slate-800 text-slate-600'
                    }`}
                  >
                    {isDone ? '✓' : step.icon}
                  </div>
                  <span
                    className={`text-[11px] font-bold leading-tight ${
                      isCurrent ? 'text-emerald-300' : isDone ? 'text-slate-200' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Details Grid: Product Summary, Farmer Info, Driver Profile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Product Summary */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">📦 Produce Package</span>
          <div className="space-y-2 text-xs">
            {trackData?.orderSummary?.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-slate-300 pb-1.5 border-b border-slate-800/60">
                <span>{item.product_name}</span>
                <span className="font-bold">{item.quantity_kg} kg</span>
              </div>
            )) || (
              <div className="flex justify-between text-slate-300">
                <span>Organic Hybrid Tomatoes</span>
                <span className="font-bold">3 kg</span>
              </div>
            )}
            <div className="pt-2 flex justify-between font-bold text-white text-xs">
              <span>Total Amount:</span>
              <span className="text-emerald-400 font-mono">₹{trackData?.orderSummary?.totalAmount || 240}</span>
            </div>
          </div>
        </div>

        {/* Farmer Information */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">🌾 Farm Gate Origin</span>
          <div className="text-sm font-bold text-white mt-1">Ramesh Patel</div>
          <div className="text-slate-400">{trackData?.pickupLocation?.address || 'Patel Organic Farms, Berasia Road, Bhopal'}</div>
          <div className="pt-2 text-[11px] text-emerald-400 font-semibold">
            ✓ Farm Gate Pickup OTP: <strong className="font-mono text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{trackData?.pickupOtp || '4891'}</strong>
          </div>
        </div>

        {/* Driver Partner Profile */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">🚚 Assigned Driver Partner</span>
          <div className="text-sm font-bold text-white mt-1">{trackData?.driverInfo?.name || 'Vikram Singh'}</div>
          <div className="text-slate-400">
            Vehicle: {trackData?.driverInfo?.vehicleType || 'Pickup Truck (1.5 Ton)'}<br/>
            Reg: <strong className="font-mono text-slate-200">{trackData?.driverInfo?.vehicleNumber || 'MP 04 GA 4892'}</strong>
          </div>
          <div className="pt-2 text-[11px] text-teal-400 font-semibold">
            ✓ Your Delivery Handover OTP: <strong className="font-mono text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{trackData?.deliveryOtp || '7234'}</strong>
          </div>
        </div>

      </div>

    </div>
  );
}
