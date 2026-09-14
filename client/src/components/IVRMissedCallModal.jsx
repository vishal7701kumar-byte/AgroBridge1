import React, { useState } from 'react';
import { PhoneCall, PhoneForwarded, PhoneOff, Volume2, Mic, CheckCircle, MessageSquare, X, Radio } from 'lucide-react';

export default function IVRMissedCallModal({ isOpen, onClose }) {
  const [phone, setPhone] = useState('+91 98260 12345');
  const [language, setLanguage] = useState('hi');
  const [callState, setCallState] = useState('IDLE'); // IDLE, RINGING_OUT, INCOMING, ON_CALL, COMPLETED
  const [dialedKey, setDialedKey] = useState(null);
  const [smsNotification, setSmsNotification] = useState(null);

  if (!isOpen) return null;

  const handleGiveMissedCall = () => {
    setCallState('RINGING_OUT');
    setSmsNotification(null);
    setDialedKey(null);

    setTimeout(() => {
      // 2 rings finished -> call disconnected, callback initiated
      setCallState('INCOMING');
    }, 2500);
  };

  const handleAnswerCall = () => {
    setCallState('ON_CALL');
  };

  const handleKeyPress = (key) => {
    setDialedKey(key);
    if (key === '1') {
      setTimeout(() => {
        setSmsNotification({
          title: 'AgroBridge SMS Alert Sent',
          message: 'AgroBridge: नमस्ते! आपकी 200kg टमाटर उपज ₹28/kg पर लिस्ट हो गई है। 12 थोक खरीदारों को सूचना भेजी गई है। UTR: AB-772189.',
        });
      }, 1200);
    }
  };

  const handleHangup = () => {
    setCallState('COMPLETED');
  };

  const handleReset = () => {
    setCallState('IDLE');
    setDialedKey(null);
    setSmsNotification(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-green-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
              <PhoneCall className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold">AgroBridge IVR & Missed Call</h3>
                <span className="text-[10px] bg-teal-400/20 text-teal-200 border border-teal-300/30 px-2 py-0.5 rounded-full font-semibold">
                  Zero-Internet Feature
                </span>
              </div>
              <p className="text-xs text-teal-100/80 mt-0.5">
                Inclusive voice automation for feature phones & non-smartphone farmers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-teal-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Toll-Free Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 text-center">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
              National Farmer Toll-Free Number
            </span>
            <div className="text-2xl font-black text-emerald-950 font-mono tracking-wide">
              1800-AGRO-BRIDGE
            </div>
            <div className="text-xs text-emerald-700 font-mono mt-0.5">(1800-247-6274 / +91 79998 12345)</div>
            <p className="text-xs text-gray-600 mt-2">
              किसान केवल 1 मिस्ड कॉल देकर तुरंत रीयल-टाइम मंडी भाव व ऑर्डर लिस्टिंग की जानकारी पा सकते हैं।
            </p>
          </div>

          {/* Interactive Simulation Sandbox */}
          {callState === 'IDLE' && (
            <div className="space-y-4 border border-gray-200 rounded-xl p-4 bg-gray-50/70">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Radio className="w-4 h-4 text-emerald-600" />
                <span>Test Telephony Flow (Interactive Simulator)</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">किसान का मोबाइल नंबर (Mobile No):</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">पसंदीदा भाषा (Preferred Dialect):</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'hi', label: 'हिन्दी (Hindi)' },
                      { id: 'en', label: 'English' },
                      { id: 'reg', label: 'मालवी / क्षेत्रीय' },
                    ].map((lang) => (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setLanguage(lang.id)}
                        className={`p-2 rounded-lg text-center border font-medium transition-all ${
                          language === lang.id
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGiveMissedCall}
                  className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow flex items-center justify-center space-x-2 transition-colors"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Give Missed Call to 1800-AGRO-BRIDGE</span>
                </button>
              </div>
            </div>
          )}

          {/* Ringing Out Simulation */}
          {callState === 'RINGING_OUT' && (
            <div className="border border-yellow-200 bg-yellow-50/80 rounded-xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-yellow-200 border-2 border-yellow-400 mx-auto flex items-center justify-center animate-pulse">
                <PhoneForwarded className="w-6 h-6 text-yellow-800" />
              </div>
              <h4 className="text-sm font-bold text-yellow-900">Calling 1800-AGRO-BRIDGE...</h4>
              <p className="text-xs text-yellow-800 font-mono">Tring... Tring... (Ring 2 of 2)</p>
              <p className="text-[11px] text-gray-600">
                Missed call recorded at server. Automatic callback server initiating instant voice call...
              </p>
            </div>
          )}

          {/* Incoming Call Simulation */}
          {callState === 'INCOMING' && (
            <div className="border-2 border-emerald-400 bg-emerald-50 rounded-xl p-6 text-center space-y-4 animate-bounce">
              <div className="w-14 h-14 rounded-full bg-emerald-600 mx-auto flex items-center justify-center shadow-lg text-white">
                <PhoneCall className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">AgroBridge Kisan Vani</h4>
                <p className="text-xs text-emerald-700 font-mono">+91 1800-AGRO-BRIDGE • Incoming IVR Call</p>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleHangup}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-full flex items-center space-x-1.5 shadow"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Decline</span>
                </button>
                <button
                  onClick={handleAnswerCall}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full flex items-center space-x-1.5 shadow-md"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Answer Call</span>
                </button>
              </div>
            </div>
          )}

          {/* Active Call State & Keypad */}
          {callState === 'ON_CALL' && (
            <div className="border border-gray-200 rounded-xl p-5 bg-gray-900 text-white space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div>
                    <span className="text-xs font-bold block text-emerald-300">Live IVR Call in Progress</span>
                    <span className="text-[10px] text-gray-400 font-mono">00:24 • AgroBridge Automated Agent</span>
                  </div>
                </div>
                <button
                  onClick={handleHangup}
                  className="p-2 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors"
                >
                  <PhoneOff className="w-4 h-4" />
                </button>
              </div>

              {/* Voice Synthesizer Transcript */}
              <div className="bg-gray-950 p-3.5 rounded-lg border border-gray-800 text-xs space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-[11px]">
                  <Volume2 className="w-4 h-4 animate-bounce" />
                  <span>IVR Spoken Audio (Live Synthesizer Transcript):</span>
                </div>
                <p className="text-gray-200 leading-relaxed italic bg-gray-900/80 p-2.5 rounded border border-gray-800 text-[11px]">
                  {dialedKey === '1'
                    ? '"बहुत-बहुत धन्यवाद! आपकी 200 kg टमाटर उपज ₹28/किग्रा भाव पर AgroBridge पर लिस्ट हो गई है। आपके मोबाइल पर SMS भेज दिया गया है। शुभ दिन!"'
                    : '"नमस्ते किसान भाई! AgroBridge किसान वाणी में आपका स्वागत है। आपके क्षेत्र भोपाल में आज टमाटर का उच्चतम भाव ₹28/किग्रा है। अपनी 200 किग्रा उपज AgroBridge Assured पर बेचने के लिए कीपैड पर 1 दबाएं। सहायता के लिए 9 दबाएं।"'}
                </p>
              </div>

              {/* Interactive Keypad */}
              <div>
                <span className="text-[10px] text-gray-400 font-bold block mb-2 uppercase tracking-wider text-center">
                  Press Dial Key to Respond
                </span>
                <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
                    <button
                      key={key}
                      onClick={() => handleKeyPress(key)}
                      className={`h-9 rounded-lg font-mono text-xs font-bold transition-all ${
                        dialedKey === key
                          ? 'bg-emerald-500 text-black scale-95'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SMS Notification Banner if triggered */}
          {smsNotification && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-start space-x-3 text-xs animate-in fade-in">
              <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-emerald-950 flex items-center space-x-1">
                  <span>{smsNotification.title}</span>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                </h5>
                <p className="text-emerald-800 mt-1 font-mono text-[11px] bg-white p-2 rounded border border-emerald-200">
                  {smsNotification.message}
                </p>
              </div>
            </div>
          )}

          {callState === 'COMPLETED' && (
            <div className="text-center py-4 space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-gray-900">Call Ended Successfully</h4>
              <p className="text-xs text-gray-600">
                The farmer receives instantaneous voice guidance and SMS confirmation without any active data plan or app download.
              </p>
              <button
                onClick={handleReset}
                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg"
              >
                Restart Demo Simulator
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <span className="text-[11px] text-gray-500">
            Complies with Telecom Regulatory Authority of India (TRAI) IVR Standards
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
