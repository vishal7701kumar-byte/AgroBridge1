import React, { useState } from 'react';
import { 
  ArrowLeft, MapPin, CheckCircle, CreditCard, Truck, ShieldCheck, 
  Clock, Check, Sparkles, Navigation, ArrowRight, QrCode, DollarSign 
} from 'lucide-react';
import { consumerAPI } from '../services/api';
import LocationPickerMap from '../components/LocationPickerMap';

const SAVED_ADDRESSES = [
  {
    id: 'addr_1',
    title: 'Home (Default)',
    address: 'Flat 402, Green Meadows Heights, Arera Colony, Bhopal, MP - 462016',
    lat: 23.2185,
    lon: 77.4320
  },
  {
    id: 'addr_2',
    title: 'Work / Office',
    address: 'Plot 12, IT Park Road, Badwai, Bhopal, MP - 462038',
    lat: 23.3100,
    lon: 77.4200
  }
];

export default function CheckoutPage({ onNavigate, currentUser }) {
  const [currentStep, setCurrentStep] = useState(1); // 1: Address, 2: Map, 3: Delivery, 4: Payment, 5: Success

  // Form State
  const [selectedSavedAddr, setSelectedSavedAddr] = useState('addr_1');
  const [customAddress, setCustomAddress] = useState(SAVED_ADDRESSES[0].address);
  const [city, setCity] = useState('Bhopal');
  const [state, setState] = useState('Madhya Pradesh');
  const [lat, setLat] = useState(SAVED_ADDRESSES[0].lat);
  const [lon, setLon] = useState(SAVED_ADDRESSES[0].lon);

  // Delivery Method State
  const [deliveryMethod, setDeliveryMethod] = useState('farm_express'); // 'farm_express' | 'morning_slot'

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'CARD' | 'COD'
  const [upiApp, setUpiApp] = useState('gpay');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Completed Order State
  const [createdOrder, setCreatedOrder] = useState(null);
  const [createdDelivery, setCreatedDelivery] = useState(null);

  // Demo Cart Items
  const cartItems = [
    { product_id: 'prod_1', product_name: 'Organic Hybrid Tomatoes', quantity_kg: 3, price_per_kg: 28, subtotal: 84, farm_name: 'Patel Organic Farms', lat: 23.4000, lon: 77.4300 },
    { product_id: 'prod_3', product_name: 'Crunchy Seedless Cucumbers', quantity_kg: 2, price_per_kg: 25, subtotal: 50, farm_name: 'Anita Bai Organic Farms', lat: 23.5251, lon: 77.8081 }
  ];

  const itemsTotal = cartItems.reduce((acc, i) => acc + i.subtotal, 0);
  const deliveryFee = deliveryMethod === 'farm_express' ? 35 : 25;
  const platformFee = 5;
  const totalAmount = itemsTotal + deliveryFee + platformFee;

  const handleLocationPicked = (loc) => {
    setLat(loc.latitude);
    setLon(loc.longitude);
  };

  const handleExecutePayment = async () => {
    setProcessingPayment(true);
    try {
      // 1. Process Demo Payment
      const payRes = await consumerAPI.processDemoPayment({
        amount: totalAmount,
        paymentMethod: paymentMethod === 'COD' ? 'Cash on Delivery' : `Demo ${paymentMethod} Escrow`
      });

      // 2. Place Order & Auto-create Delivery
      const orderPayload = {
        items: cartItems,
        delivery_address: customAddress,
        deliveryAddress: {
          address: customAddress,
          city,
          state,
          latitude: lat,
          longitude: lon
        },
        payment_method: paymentMethod === 'COD' ? 'Cash on Delivery' : 'Escrow Direct UPI',
        demo_payment_ref: payRes.data?.data?.transactionId || `PAY-${Date.now()}`
      };

      const orderRes = await consumerAPI.placeOrder(orderPayload);

      if (orderRes.data && orderRes.data.success) {
        setCreatedOrder(orderRes.data.data.order);
        setCreatedDelivery(orderRes.data.data.delivery);
        setCurrentStep(5); // Transition to Payment Success
      }
    } catch (err) {
      console.error('Payment execution failed:', err);
      alert('Order placement error. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={() => onNavigate('/consumer/dashboard')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Return</span>
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-white flex items-center gap-2 justify-center">
            <span>🌾</span>
            <span>AgroBridge Direct Checkout</span>
          </h1>
          <p className="text-xs text-emerald-400 font-semibold">100% Escrow Protected Farm Direct Disintermediation</p>
        </div>
        <div className="w-20" />
      </div>

      {/* 5-Step Visual Stepper (Only on Steps 1-4) */}
      {currentStep < 5 && (
        <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
          {[
            { step: 1, title: 'Address', icon: '📍' },
            { step: 2, title: 'Map Pin', icon: '🗺️' },
            { step: 3, title: 'Delivery', icon: '🚚' },
            { step: 4, title: 'Payment', icon: '💳' }
          ].map((s) => (
            <div
              key={s.step}
              onClick={() => {
                if (s.step < currentStep) setCurrentStep(s.step);
              }}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer ${
                currentStep === s.step
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/20'
                  : currentStep > s.step
                  ? 'bg-slate-900 border-slate-700 text-teal-400'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
              }`}
            >
              <div className="text-sm sm:text-base font-bold mb-0.5">{s.icon}</div>
              <div className="text-[11px] sm:text-xs font-extrabold">{s.title}</div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 1: DELIVERY ADDRESS */}
      {/* ============================================================ */}
      {currentStep === 1 && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-2xl animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Select Delivery Address</h2>
              <p className="text-xs text-slate-400">Choose where fresh farm produce should be delivered</p>
            </div>
          </div>

          {/* Saved Addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SAVED_ADDRESSES.map((a) => (
              <div
                key={a.id}
                onClick={() => {
                  setSelectedSavedAddr(a.id);
                  setCustomAddress(a.address);
                  setLat(a.lat);
                  setLon(a.lon);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedSavedAddr === a.id
                    ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{a.title}</span>
                  </span>
                  {selectedSavedAddr === a.id && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-xs leading-relaxed">{a.address}</p>
              </div>
            ))}
          </div>

          {/* Custom Address Input */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Or Enter / Edit Address Line:
            </label>
            <textarea
              rows={2}
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
              placeholder="Flat / House No, Street, Landmark, Area"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentStep(2)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Confirm & Pin Location on Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 2: LOCATION CONFIRMATION ON MAP */}
      {/* ============================================================ */}
      {currentStep === 2 && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-2xl animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Interactive Map Location</h2>
              <p className="text-xs text-slate-400">Ensure driver delivers straight to your exact doorstep</p>
            </div>
          </div>

          <LocationPickerMap
            initialLat={lat}
            initialLon={lon}
            initialAddress={customAddress}
            onLocationSelect={handleLocationPicked}
          />

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-3.5 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Continue to Delivery Options</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 3: DELIVERY METHOD */}
      {/* ============================================================ */}
      {currentStep === 3 && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-2xl animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Select Delivery Method</h2>
              <p className="text-xs text-slate-400">Direct rural cold-chain transport straight from farm clusters</p>
            </div>
          </div>

          <div className="space-y-4">
            <div
              onClick={() => setDeliveryMethod('farm_express')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                deliveryMethod === 'farm_express'
                  ? 'bg-emerald-500/10 border-emerald-500 shadow-xl shadow-emerald-500/10'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Direct Farm Express (Same Day)</h3>
                    <p className="text-xs text-emerald-400">Direct dispatch within 60-90 minutes of order</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-white">₹35</span>
                  <div className="text-[10px] text-slate-500">Logistics fee</div>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Temperature-shielded rural aggregator truck will pick up from the farm gate and deliver to your address.
              </p>
            </div>

            <div
              onClick={() => setDeliveryMethod('morning_slot')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                deliveryMethod === 'morning_slot'
                  ? 'bg-emerald-500/10 border-emerald-500 shadow-xl shadow-emerald-500/10'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm">
                    🌅
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Morning Fresh Harvest Slot (6 AM - 8 AM)</h3>
                    <p className="text-xs text-teal-400">Harvested at 4:30 AM tomorrow and delivered crisp</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-white">₹25</span>
                  <div className="text-[10px] text-slate-500">Economy rate</div>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Vegetables and milk are harvested before dawn and dropped off at your doorstep by 7:30 AM.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3.5 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 4: PAYMENT (DEMO ONLINE & COD) */}
      {/* ============================================================ */}
      {currentStep === 4 && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-2xl animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg">
              4
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Secure Escrow Payment</h2>
              <p className="text-xs text-slate-400">Funds released to farmer only upon OTP delivery verification</p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'UPI', label: 'UPI (QR / Apps)', icon: '📱' },
              { id: 'CARD', label: 'Cards & NetBanking', icon: '💳' },
              { id: 'COD', label: 'Cash on Delivery', icon: '💵' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPaymentMethod(p.id)}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  paymentMethod === p.id
                    ? 'bg-emerald-500/10 border-emerald-500 text-white ring-2 ring-emerald-500/20'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xl mb-1">{p.icon}</div>
                <div className="text-xs font-bold">{p.label}</div>
              </button>
            ))}
          </div>

          {/* UPI Apps & QR Simulator */}
          {paymentMethod === 'UPI' && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4 text-center">
              <div className="inline-block p-4 bg-white rounded-2xl shadow-xl">
                {/* SVG Simulated QR code */}
                <div className="w-32 h-32 bg-slate-100 flex flex-col items-center justify-center border-2 border-dashed border-slate-400 rounded-xl text-slate-800">
                  <QrCode className="w-16 h-16 text-slate-900" />
                  <span className="text-[9px] font-mono font-bold mt-1">UPI: agrobridge@demo</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">Scan QR code or pay using UPI apps</p>
              <div className="flex justify-center gap-3">
                {['gpay', 'phonepe', 'paytm'].map((app) => (
                  <button
                    key={app}
                    type="button"
                    onClick={() => setUpiApp(app)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize border ${
                      upiApp === app ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {app}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bill Summary */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Items Total ({cartItems.length} crops)</span>
              <span>₹{itemsTotal}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Direct Cold-Chain Delivery</span>
              <span>₹{deliveryFee}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Platform Fee</span>
              <span>₹{platformFee}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-extrabold text-white">
              <span>Grand Total</span>
              <span className="text-emerald-400 text-base">₹{totalAmount}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-3.5 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleExecutePayment}
              disabled={processingPayment}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {processingPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Securing Escrow Vault...</span>
                </>
              ) : (
                <>
                  <span>Pay ₹{totalAmount} & Confirm Order</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 5: PAYMENT SUCCESS & ORDER CONFIRMED */}
      {/* ============================================================ */}
      {currentStep === 5 && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 space-y-6 shadow-2xl text-center animate-fadeIn">
          
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-xl shadow-emerald-500/20 animate-bounce">
            🎉
          </div>

          <div>
            <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              Payment Status: SUCCESS (Escrow Secured)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
              ORDER CONFIRMED!
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Your order <strong className="font-mono text-emerald-300">{createdOrder?.id || 'ORD-9102'}</strong> has been placed directly with the farm.
            </p>
          </div>

          {/* Details Summary Card */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3 max-w-lg mx-auto text-xs">
            <div className="flex justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Order ID:</span>
              <span className="font-mono font-bold text-white">{createdOrder?.id || 'ORD-9102'}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Delivery ID:</span>
              <span className="font-mono font-bold text-amber-300">{createdDelivery?.id || 'DEL-4091'}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Total Paid:</span>
              <span className="font-bold text-emerald-400 text-sm">₹{totalAmount}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Delivery Address:</span>
              <span className="font-medium text-slate-200 text-right max-w-[220px] truncate">{customAddress}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Farmer Source:</span>
              <span className="font-medium text-emerald-400">Ramesh Patel (Patel Organic Farms)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Estimated Delivery:</span>
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Within 60-90 mins</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate(`/consumer/orders/${createdOrder?.id || 'ORD-9102'}/track`)}
              className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4" />
              <span>TRACK ORDER ON LIVE MAP</span>
            </button>

            <button
              onClick={() => onNavigate('/consumer/dashboard')}
              className="py-3.5 px-6 rounded-2xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
