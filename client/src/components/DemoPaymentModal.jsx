import React, { useState } from 'react';
import { X, ShieldCheck, QrCode, CreditCard, Landmark, CheckCircle2, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function DemoPaymentModal({ isOpen, onClose, totalAmount, onPaymentSuccess }) {
  const [method, setMethod] = useState('upi'); // upi, card, netbanking
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState('select'); // select, processing, confirmed

  if (!isOpen) return null;

  const handlePay = () => {
    setProcessing(true);
    setStep('processing');
    setTimeout(() => {
      setStep('confirmed');
      setTimeout(() => {
        onPaymentSuccess({
          payment_method: method === 'upi' ? 'UPI Escrow (Instant)' : method === 'card' ? 'Visa/Mastercard Escrow' : 'NetBanking Escrow',
          transaction_id: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
          amount: totalAmount,
          escrow_status: 'FUNDS_LOCKED'
        });
      }, 1000);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-teal-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AgroBridge Escrow Payment</h3>
              <p className="text-xs text-slate-400">Step 9 Demo Payment Simulation • 100% Escrow Protected</p>
            </div>
          </div>
          {step !== 'processing' && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {step === 'select' && (
          <div className="space-y-5">
            {/* Amount Summary */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Total Payable Amount</div>
                <div className="text-2xl font-black text-teal-400">₹{totalAmount.toLocaleString('en-IN')}</div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Escrow Locked</span>
                </span>
                <div className="text-[10px] text-slate-500 mt-1">Zero Middleman APMC Cut</div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('upi')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  method === 'upi'
                    ? 'bg-teal-500/20 border-teal-500 text-white shadow-lg shadow-teal-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <QrCode className="w-5 h-5 text-teal-400" />
                <span className="text-xs font-bold">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  method === 'card'
                    ? 'bg-teal-500/20 border-teal-500 text-white shadow-lg shadow-teal-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-5 h-5 text-teal-400" />
                <span className="text-xs font-bold">Card</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('netbanking')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  method === 'netbanking'
                    ? 'bg-teal-500/20 border-teal-500 text-white shadow-lg shadow-teal-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Landmark className="w-5 h-5 text-teal-400" />
                <span className="text-xs font-bold">NetBanking</span>
              </button>
            </div>

            {/* Method Details */}
            {method === 'upi' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                <div className="inline-block p-3 rounded-2xl bg-white text-slate-950 shadow-inner">
                  <div className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-400 rounded-xl">
                    <QrCode className="w-20 h-20 text-slate-900" />
                    <span className="text-[9px] font-bold text-slate-700">SCAN TO PAY UPI</span>
                  </div>
                </div>
                <div className="text-xs font-mono font-bold text-teal-300">
                  agrobridge.escrow@icici
                </div>
                <p className="text-[11px] text-slate-400">
                  Instant escrow authorization via PhonePe, Google Pay, or Paytm.
                </p>
              </div>
            )}

            {method === 'card' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Demo Card Number</label>
                  <input
                    readOnly
                    value="4242 •••• •••• 9102"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Valid Thru</label>
                    <input
                      readOnly
                      value="08/29"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">CVV</label>
                    <input
                      readOnly
                      value="•••"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'netbanking' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="text-slate-400 font-semibold mb-2">Select Escrow Integrated Bank</div>
                {['State Bank of India (Agri-Portal)', 'HDFC Bank Direct Escrow', 'ICICI Agri-Pay', 'Bank of Baroda'].map((bank, i) => (
                  <label key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 cursor-pointer text-slate-200">
                    <input type="radio" name="bank" defaultChecked={i === 0} className="accent-teal-500" />
                    <span>{bank}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Escrow guarantee disclaimer */}
            <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/30 flex items-start gap-2.5 text-[11px] text-teal-200">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                <strong>Zero Risk Guarantee:</strong> Funds remain securely locked in AgroBridge Smart Escrow. Farmer & Transporter are credited only after Farm Gate & Delivery OTP handoffs.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePay}
                className="flex-1 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-xl shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Authorize ₹{totalAmount}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-12 h-12 text-teal-400 animate-spin mx-auto" />
            <div className="text-base font-bold text-white">Contacting National Escrow Gateway...</div>
            <p className="text-xs text-slate-400">Authorizing demo transaction and creating smart contract lock...</p>
          </div>
        )}

        {step === 'confirmed' && (
          <div className="py-10 text-center space-y-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
            <div className="text-lg font-bold text-white">Payment Authorized & Escrow Locked!</div>
            <p className="text-xs text-slate-400">Finalizing order & dispatching nearest logistics driver...</p>
          </div>
        )}

      </div>
    </div>
  );
}
