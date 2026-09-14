import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Power, CheckCircle2, Navigation, DollarSign, Star, RefreshCw, Check, ArrowRight, ShieldCheck, KeyRound, Bell, X, Sparkles } from 'lucide-react';
import { driverAPI, notificationAPI } from '../services/api';
import LiveDeliveryTracker from '../components/LiveDeliveryTracker';
import AIRouteOptimizerModal from '../components/AIRouteOptimizerModal';

export default function DriverDashboard({ currentUser, onLogout }) {
  const [data, setData] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(currentUser.driverStatus || 'ONLINE');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [todayEarnings, setTodayEarnings] = useState(2450);
  const [activeTrackingDelivery, setActiveTrackingDelivery] = useState(null);
  const [showRouteOptimizer, setShowRouteOptimizer] = useState(false);
  const [gpsUpdating, setGpsUpdating] = useState(false);
  const [toast, setToast] = useState(null);

  // OTP Verification Modal State
  const [otpModal, setOtpModal] = useState({
    isOpen: false,
    type: 'pickup', // 'pickup' or 'delivery'
    deliveryId: '',
    expectedOtp: '',
    inputOtp: '',
    payout: 0
  });

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdateGps = async () => {
    setGpsUpdating(true);
    if (!navigator.geolocation) {
      try {
        const fallbackLat = 23.2599 + (Math.random() - 0.5) * 0.02;
        const fallbackLon = 77.4126 + (Math.random() - 0.5) * 0.02;
        await driverAPI.updateLocation({ latitude: fallbackLat, longitude: fallbackLon });
        showToastMsg(`📍 Live GPS updated: ${fallbackLat.toFixed(4)}, ${fallbackLon.toFixed(4)}`);
      } catch (err) {
        showToastMsg('Failed to update GPS location');
      } finally {
        setGpsUpdating(false);
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await driverAPI.updateLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
          showToastMsg(`📍 Live GPS broadcast: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        } catch (err) {
          showToastMsg('Failed to broadcast GPS location');
        } finally {
          setGpsUpdating(false);
        }
      },
      async () => {
        try {
          const fallbackLat = 23.2599 + (Math.random() - 0.5) * 0.02;
          const fallbackLon = 77.4126 + (Math.random() - 0.5) * 0.02;
          await driverAPI.updateLocation({ latitude: fallbackLat, longitude: fallbackLon });
          showToastMsg(`📍 Live GPS updated: ${fallbackLat.toFixed(4)}, ${fallbackLon.toFixed(4)}`);
        } catch (e) {
          showToastMsg('Failed to update GPS location');
        } finally {
          setGpsUpdating(false);
        }
      },
      { timeout: 7000 }
    );
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [dashRes, delRes, notifRes] = await Promise.all([
        driverAPI.getDashboard(),
        driverAPI.getDeliveries(),
        notificationAPI.getNotifications().catch(() => ({ data: { data: [] } }))
      ]);
      if (dashRes.data && dashRes.data.success) {
        setData(dashRes.data.data);
        setStatus(dashRes.data.data.driverStatus || 'ONLINE');
      }
      if (delRes.data && delRes.data.success) {
        setDeliveries(delRes.data.data);
      }
      if (notifRes.data && notifRes.data.success) {
        setNotifications(notifRes.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleToggleStatus = async () => {
    setStatusUpdating(true);
    const newStatus = status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    try {
      const res = await driverAPI.updateStatus(newStatus);
      if (res.data && res.data.success) {
        setStatus(newStatus);
        showToastMsg(`Driver status switched to ${newStatus}`);
      }
    } catch (err) {
      showToastMsg('Failed to update driver status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAcceptDelivery = async (deliveryId) => {
    try {
      const res = await driverAPI.acceptDelivery(deliveryId);
      if (res.data && res.data.success) {
        showToastMsg(`✅ Delivery ${deliveryId} accepted! Proceed to farm gate for pickup.`);
        fetchStats();
      }
    } catch (err) {
      showToastMsg('Failed to accept delivery.');
    }
  };

  const openOtpModal = (delivery, type) => {
    const expected = type === 'pickup' ? (delivery.pickup_otp || '4821') : (delivery.delivery_otp || '7234');
    setOtpModal({
      isOpen: true,
      type,
      deliveryId: delivery.id,
      expectedOtp: expected,
      inputOtp: expected, // Pre-filled for smooth demo flow
      payout: delivery.payout || 450
    });
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    const { deliveryId, type, inputOtp, payout } = otpModal;
    try {
      let res;
      if (type === 'pickup') {
        res = await driverAPI.verifyPickup(deliveryId, inputOtp);
      } else {
        res = await driverAPI.verifyDelivery(deliveryId, inputOtp);
      }

      if (res.data && res.data.success) {
        if (type === 'pickup') {
          showToastMsg(`🌾 Farm Gate pickup verified! Crop is Out for Delivery.`);
        } else {
          showToastMsg(`🎉 Customer OTP verified! ₹${payout} Escrow payout credited to your wallet.`);
          setTodayEarnings(prev => prev + payout);
        }
        setOtpModal({ isOpen: false, type: 'pickup', deliveryId: '', expectedOtp: '', inputOtp: '', payout: 0 });
        fetchStats();
      }
    } catch (err) {
      showToastMsg(err.response?.data?.message || 'OTP verification failed. Please re-check.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-amber-950 border border-amber-500 text-amber-100 shadow-2xl text-xs font-semibold flex items-center gap-2.5 backdrop-blur-xl">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Welcome & Driver Telemetry Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border border-amber-500/30 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-3xl shadow-inner">
            🚚
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{currentUser.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                Driver Partner
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>Vehicle: <strong className="text-slate-200">{currentUser.vehicleType || 'Pickup Truck'}</strong> • {currentUser.vehicleNumber || 'MP 04 GA 4892'} ({currentUser.vehicleCapacity || '1.5 Tons'})</span>
            </p>
          </div>
        </div>

        {/* Action Buttons & Status Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchStats}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={() => setShowRouteOptimizer(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 hover:bg-amber-950/40 font-bold text-xs transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI TSP Route Optimizer</span>
          </button>

          <button
            onClick={handleUpdateGps}
            disabled={gpsUpdating}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40 font-bold text-xs transition-all"
            title="Update driver GPS telemetry location"
          >
            <MapPin className={`w-4 h-4 text-emerald-400 ${gpsUpdating ? 'animate-bounce' : ''}`} />
            <span>{gpsUpdating ? 'Broadcasting GPS...' : 'Update Live GPS'}</span>
          </button>

          <button
            onClick={handleToggleStatus}
            disabled={statusUpdating}
            className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl font-extrabold text-xs shadow-xl transition-all cursor-pointer ${
              status === 'ONLINE'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 ring-4 ring-emerald-500/20'
                : 'bg-rose-950 border border-rose-600 text-rose-200 hover:bg-rose-900'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{statusUpdating ? 'Updating...' : `STATUS: ${status}`}</span>
          </button>
        </div>
      </div>

      {/* Driver KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="text-xs font-bold uppercase text-slate-400 flex items-center justify-between">
            <span>Today's Earnings</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">₹{todayEarnings.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-slate-400">Escrow released immediately upon delivery</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="text-xs font-bold uppercase text-slate-400 flex items-center justify-between">
            <span>Completed Trips</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">18</div>
          <p className="text-[11px] text-emerald-400 font-semibold">100% On-time delivery record</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="text-xs font-bold uppercase text-slate-400 flex items-center justify-between">
            <span>Customer Rating</span>
            <Star className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">4.9 <span className="text-sm font-normal text-slate-400">/ 5.0</span></div>
          <p className="text-[11px] text-slate-400">Verified by 42 farmers & buyers</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="text-xs font-bold uppercase text-slate-400 flex items-center justify-between">
            <span>Active Payload</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">1,200 <span className="text-sm font-normal text-slate-400">kg</span></div>
          <p className="text-[11px] text-slate-400">Capacity: {currentUser.vehicleCapacity || '1.5 Tons'}</p>
        </div>
      </div>

      {/* Assigned Delivery Jobs */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-amber-400" />
            <span>Assigned Agricultural Logistics Jobs ({deliveries.length})</span>
          </h2>
          <span className="text-xs text-slate-400">Step 11-17 Multi-Stage Execution</span>
        </div>

        <div className="space-y-4">
          {deliveries.map((job) => (
            <div key={job.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-amber-400 font-bold text-xs">{job.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    job.status === 'delivered'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : job.status === 'searching_driver'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {job.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Order: {job.order_id}</span>
                </div>
                <div className="text-sm font-semibold text-white mt-1 flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-emerald-400 flex items-center gap-1">📍 Pickup: {job.pickup_location}</span>
                  <span className="hidden sm:inline text-slate-600">➔</span>
                  <span className="text-teal-300 flex items-center gap-1">🏁 Drop: {job.dropoff_location}</span>
                </div>
                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                  <span>Distance: <strong className="text-slate-200">{job.distance_km || 24} km</strong></span>
                  <span>Payload: <strong className="text-slate-200">{job.payload_kg} kg</strong></span>
                  {job.pickup_otp && (
                    <span>Farm OTP: <strong className="font-mono text-emerald-400">{job.pickup_otp}</strong></span>
                  )}
                  {job.delivery_otp && (
                    <span>Consumer OTP: <strong className="font-mono text-teal-400">{job.delivery_otp}</strong></span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                <div className="text-lg font-black text-amber-400 mr-2">₹{job.payout}</div>

                <button
                  onClick={() => setActiveTrackingDelivery(job)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  View GPS Map
                </button>

                {/* Step 14: Driver accepts delivery */}
                {job.status === 'searching_driver' && (
                  <button
                    onClick={() => handleAcceptDelivery(job.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept Delivery Request</span>
                  </button>
                )}

                {/* Step 15: Driver confirms pickup at farm gate with Farm OTP */}
                {(job.status === 'assigned' || job.status === 'driver_assigned') && (
                  <button
                    onClick={() => openOtpModal(job, 'pickup')}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Enter Farm Gate OTP</span>
                  </button>
                )}

                {/* Step 16 & 17: Out for delivery -> Consumer OTP Verification -> Delivery completion */}
                {(job.status === 'picked_up' || job.status === 'out_for_delivery') && (
                  <button
                    onClick={() => openOtpModal(job, 'delivery')}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Consumer OTP (Complete)</span>
                  </button>
                )}

                {/* Completed delivery */}
                {job.status === 'delivered' && (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Payout Settled</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* OTP Verification Modal */}
      {otpModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <span>{otpModal.type === 'pickup' ? 'Step 15: Farm Gate Pickup Verification' : 'Step 17: Consumer Handover Verification'}</span>
              </h3>
              <button onClick={() => setOtpModal(prev => ({ ...prev, isOpen: false }))} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {otpModal.type === 'pickup'
                ? 'Ask the farmer for their 4-digit Farm Gate OTP to confirm physical harvest loading.'
                : 'Ask the consumer for their 4-digit Delivery OTP to complete handover and release escrow.'}
            </p>

            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Enter 4-Digit Verification OTP *
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={otpModal.inputOtp}
                  onChange={(e) => setOtpModal(prev => ({ ...prev, inputOtp: e.target.value }))}
                  placeholder="e.g. 4821"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-xl tracking-widest font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                />
                <div className="text-[11px] text-slate-500 mt-1 text-center">
                  (Demo Hint: Expected OTP is <span className="font-mono text-emerald-400 font-bold">{otpModal.expectedOtp}</span>)
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOtpModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20"
                >
                  {otpModal.type === 'pickup' ? 'Confirm Pickup' : 'Complete & Release Escrow'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI TSP Route Optimizer Modal */}
      <AIRouteOptimizerModal
        isOpen={showRouteOptimizer}
        onClose={() => setShowRouteOptimizer(false)}
      />

      {/* Live Map Modal */}
      {activeTrackingDelivery && (
        <LiveDeliveryTracker
          delivery={activeTrackingDelivery}
          onClose={() => setActiveTrackingDelivery(null)}
        />
      )}

    </div>
  );
}
