import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, PhoneCall, PhoneForwarded, PhoneOff, Volume2, 
  Mic, CheckCircle, Radio, Clock, Shield, Sparkles, RefreshCw, Key
} from 'lucide-react';
import { ivrAPI } from '../services/api';

export default function FarmerIVRPage({ currentUser, onNavigate, onLogout }) {
  const [phoneNumber, setPhoneNumber] = useState('+91 98260 12345');
  const [callState, setCallState] = useState('IDLE'); // IDLE, RINGING_OUT, CALLBACK_RINGING, ON_CALL, COMPLETED
  const [sessionId, setSessionId] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [activeVoiceResponse, setActiveVoiceResponse] = useState(null);
  const [history, setHistory] = useState([]);
  const [enableTTS, setEnableTTS] = useState(true);
  const [language, setLanguage] = useState('hi'); // 'hi' or 'en'
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadHistory = async () => {
    try {
      const res = await ivrAPI.getHistory();
      if (res.data?.history) {
        setHistory(res.data.history);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const speakVoice = (text, lang = 'hi-IN') => {
    if (!enableTTS) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'en' ? 'en-IN' : 'hi-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleGiveMissedCall = async () => {
    setCallState('RINGING_OUT');
    setActiveVoiceResponse(null);
    setSelectedOption(null);

    try {
      const res = await ivrAPI.sendMissedCall({ farmerPhone: phoneNumber });
      if (res.data?.success) {
        setSessionId(res.data.sessionId);
        showToast('Missed call received at 1800-AGRO-BRIDGE!');

        setTimeout(() => {
          setCallState('CALLBACK_RINGING');
          speakVoice('कॉल आ रही है, एग्रोब्रिज किसान सेवा', 'hi');
        }, 2500);
      }
    } catch (e) {
      setCallState('IDLE');
      showToast('Telephony error. Please try again.');
    }
  };

  const handleAnswerCallback = async () => {
    setCallState('ON_CALL');
    try {
      await ivrAPI.initiateCallback(sessionId);
      const greeting = language === 'en'
        ? "Welcome to AgroBridge. Press 1 for latest order status. Press 2 for today's sales. Press 3 for payment information. Press 4 for AI market alert. Press 5 for customer support."
        : "नमस्ते! एग्रोब्रिज किसान सेवा में आपका स्वागत है। नवीनतम ऑर्डर स्थिति के लिए 1 दबाएं। आज की बिक्री के लिए 2 दबाएं। भुगतान जानकारी के लिए 3 दबाएं। एआई मंडी भाव अलर्ट के लिए 4 दबाएं। ग्राहक सहायता के लिए 5 दबाएं।";
      
      setActiveVoiceResponse({
        label: 'Main IVR Audio Menu Playing',
        voiceResponseText: greeting,
        summary: 'Listening to Main Menu Options (1 to 5)...'
      });

      speakVoice(greeting, language);
    } catch (e) {
      console.error(e);
    }
  };

  const handleKeypadPress = async (key) => {
    if (callState !== 'ON_CALL') return;
    setSelectedOption(key);

    try {
      const res = await ivrAPI.selectOption(sessionId, key, language);
      if (res.data?.success) {
        setActiveVoiceResponse(res.data);
        speakVoice(res.data.voiceResponseText, language);
        loadHistory();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleHangup = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallState('COMPLETED');
  };

  const handleReset = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallState('IDLE');
    setSelectedOption(null);
    setActiveVoiceResponse(null);
  };

  const ivrOptions = [
    { key: '1', title: 'Latest Order Status', desc: "Press 1 for active delivery status" },
    { key: '2', title: "Today's Sales", desc: "Press 2 for volume & gross sales" },
    { key: '3', title: 'Payment Information', desc: 'Press 3 for bank transfer & UTR' },
    { key: '4', title: 'AI Market Alert', desc: 'Press 4 for price trends & safe price floor' },
    { key: '5', title: 'Customer Support', desc: 'Press 5 for helpline representative' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans pb-24">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border text-sm font-semibold bg-emerald-950/90 border-emerald-600 text-emerald-100 backdrop-blur-md animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/farmer/dashboard')}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Back to Farmer Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                    IVR / Missed Call Farmer Service
                    <span className="text-xs bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 rounded-full font-medium">
                      Zero-Internet Telephony
                    </span>
                  </h1>
                  <p className="text-xs md:text-sm text-slate-400">
                    Inclusive voice automation for basic keypad feature phones: Give a missed call, receive automated voice callback.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Prototype Simulation (Exotel / Twilio Telephony Abstraction)
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-950/80 via-teal-950/80 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">
              National Farmer Toll-Free Helpline
            </span>
            <div className="text-3xl md:text-4xl font-black text-white font-mono tracking-wider">
              1800-AGRO-BRIDGE
            </div>
            <div className="text-xs text-slate-400 font-mono">
              (1800-247-6274 / +91 79998 12345) • Zero Mobile Recharge Deducted
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-3.5 py-2 rounded-xl text-xs">
              <Volume2 className="w-4 h-4 text-teal-400" />
              <label className="cursor-pointer flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={enableTTS}
                  onChange={(e) => setEnableTTS(e.target.checked)}
                  className="rounded border-slate-700 text-teal-500 focus:ring-0"
                />
                Browser Voice Audio (TTS)
              </label>
            </div>

            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1 rounded-lg transition ${language === 'hi' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-lg transition ${language === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                Interactive Telephony Simulation Console
              </h2>
              <span className="text-xs font-mono text-slate-500">Keypad Phone Emulation</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-mono">
              <div className={`p-2 rounded-xl border ${callState === 'RINGING_OUT' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-950/60 border-slate-800 text-slate-400'}`}>
                1. Missed Call
              </div>
              <div className={`p-2 rounded-xl border ${callState === 'CALLBACK_RINGING' ? 'bg-teal-500/20 border-teal-500 text-teal-300 animate-pulse' : 'bg-slate-950/60 border-slate-800 text-slate-400'}`}>
                2. Auto Callback
              </div>
              <div className={`p-2 rounded-xl border ${callState === 'ON_CALL' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-slate-950/60 border-slate-800 text-slate-400'}`}>
                3. DTMF Menu
              </div>
              <div className={`p-2 rounded-xl border ${callState === 'COMPLETED' ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-slate-950/60 border-slate-800 text-slate-400'}`}>
                4. Voice Response
              </div>
            </div>

            {callState === 'IDLE' && (
              <div className="space-y-4 p-5 bg-slate-950/60 border border-slate-800 rounded-2xl text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-2xl">
                  📞
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Give Missed Call from Registered Phone</h3>
                  <p className="text-xs text-slate-400">
                    System will detect your caller ID and initiate an automated voice callback within 3 seconds.
                  </p>
                </div>

                <div className="max-w-xs mx-auto space-y-2">
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-center text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleGiveMissedCall}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                  >
                    <PhoneCall className="w-4 h-4" />
                    Give Missed Call to 1800-AGRO-BRIDGE
                  </button>
                </div>
              </div>
            )}

            {callState === 'RINGING_OUT' && (
              <div className="p-8 bg-amber-950/20 border border-amber-500/30 rounded-2xl text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto animate-ping">
                  <PhoneCall className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-300">Dialing 1800-AGRO-BRIDGE...</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">Ringing... (Simulating 2 rings before carrier disconnect)</p>
                </div>
              </div>
            )}

            {callState === 'CALLBACK_RINGING' && (
              <div className="p-8 bg-teal-950/20 border border-teal-500/40 rounded-2xl text-center space-y-5 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center mx-auto">
                  <PhoneForwarded className="w-8 h-8 text-teal-400" />
                </div>
                <div>
                  <span className="text-xs font-bold text-teal-400 uppercase tracking-widest block">Incoming Telephony Callback</span>
                  <h3 className="text-xl font-bold text-white mt-1">AgroBridge Kisan Helpline</h3>
                  <p className="text-xs text-slate-400 font-mono">Calling your phone: {phoneNumber}</p>
                </div>

                <div className="flex justify-center gap-4 pt-2">
                  <button
                    onClick={handleAnswerCallback}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                  >
                    <PhoneCall className="w-4 h-4" />
                    Answer Call
                  </button>
                  <button
                    onClick={handleHangup}
                    className="px-6 py-2.5 bg-rose-700 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-2"
                  >
                    <PhoneOff className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              </div>
            )}

            {callState === 'ON_CALL' && (
              <div className="space-y-5 p-5 bg-slate-950 border border-emerald-500/30 rounded-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-emerald-400 rounded-full animate-ping"></span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">CALL ACTIVE (00:42)</span>
                  </div>
                  <button
                    onClick={handleHangup}
                    className="px-3 py-1 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <PhoneOff className="w-3.5 h-3.5" />
                    End Call
                  </button>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-teal-400 font-semibold">
                      <Volume2 className="w-4 h-4 animate-bounce" />
                      {activeVoiceResponse?.label || 'IVR Voice Engine Playing'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Language: {language === 'hi' ? 'Hindi' : 'English'}</span>
                  </div>
                  <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono leading-relaxed">
                    "{activeVoiceResponse?.voiceResponseText || 'Welcome to AgroBridge...'}"
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Press Option on Keypad (or tap below):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ivrOptions.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => handleKeypadPress(opt.key)}
                        className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                          selectedOption === opt.key 
                            ? 'bg-emerald-600/30 border-emerald-500 text-white' 
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-sm shrink-0">
                          {opt.key}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{opt.title}</div>
                          <div className="text-[10px] text-slate-400">{opt.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {callState === 'COMPLETED' && (
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">IVR Call Completed</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Duration: 42 Seconds • Telephony Gateway Logged
                  </p>
                </div>
                {activeVoiceResponse && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 text-left font-mono">
                    <span className="text-emerald-400 font-bold block mb-1">Final Spoken Output:</span>
                    {activeVoiceResponse.voiceResponseText}
                  </div>
                )}
                <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700"
                >
                  Start New IVR Call Session
                </button>
              </div>
            )}

          </div>

          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Farmer Telephony Call Log
              </h3>
              <span className="text-xs font-mono text-slate-400">{history.length} Sessions</span>
            </div>

            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {history.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No previous IVR sessions recorded.
                </div>
              ) : (
                history.map(item => (
                  <div key={item.id} className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-emerald-400" />
                        {item.selectedOptionLabel || 'Missed Call Session'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 font-mono bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                      {item.voiceResponseText}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                      <span>Dialed: Option [{item.selectedOption || '1'}]</span>
                      <span>Status: {item.callStatus}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
