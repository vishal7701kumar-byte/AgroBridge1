import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, MessageSquare, Send, CheckCheck, Bell, ShieldCheck, 
  Smartphone, Sparkles, RefreshCw, Check, Info, PhoneCall, ExternalLink
} from 'lucide-react';
import { whatsappAPI } from '../services/api';

export default function FarmerWhatsAppPage({ currentUser, onNavigate, onLogout }) {
  const [profile, setProfile] = useState({
    whatsappNumber: '+91 98260 12345',
    isLinked: true,
    notificationPreferences: {
      orderUpdates: true,
      paymentUpdates: true,
      driverUpdates: true,
      aiAlerts: true,
      inventoryAlerts: true
    }
  });
  const [phoneInput, setPhoneInput] = useState('+91 98260 12345');
  const [notifications, setNotifications] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "🌾 *Welcome to AgroBridge WhatsApp Assistant!*\nNamaste Ramesh Patel! You can query live order status, today's sales, crop inventory, and AI market alerts directly here.\n\nReply with any command below or type your query:",
      time: '10:30 AM'
    },
    {
      id: 2,
      sender: 'bot',
      text: "📈 *AI Market Alert:*\nTomato demand is showing an increasing trend (+28%) in your region.\nConsider reviewing your available stock and pricing.",
      time: '11:15 AM'
    }
  ]);
  const [inputCmd, setInputCmd] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [toast, setToast] = useState(null);
  const chatEndRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [resStatus, resNotifs] = await Promise.all([
        whatsappAPI.getStatus(),
        whatsappAPI.getNotifications()
      ]);
      if (resStatus.data?.profile) {
        setProfile(resStatus.data.profile);
        setPhoneInput(resStatus.data.profile.whatsappNumber);
      }
      if (resNotifs.data?.notifications) {
        setNotifications(resNotifs.data.notifications);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSavePreferences = async () => {
    try {
      setSavingPrefs(true);
      await whatsappAPI.connect({
        whatsappNumber: phoneInput,
        notificationPreferences: profile.notificationPreferences,
        farmerName: currentUser?.name || 'Ramesh Patel'
      });
      showToast('WhatsApp preferences and number updated successfully!');
      loadData();
    } catch (e) {
      showToast('Failed to update preferences', 'error');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleTogglePref = (key) => {
    setProfile(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [key]: !prev.notificationPreferences[key]
      }
    }));
  };

  const handleSendTestAlert = async () => {
    try {
      const res = await whatsappAPI.sendTest();
      if (res.data?.success) {
        showToast('Simulated WhatsApp alert dispatched to ' + profile.whatsappNumber);
        loadData();
        if (res.data.notification) {
          setChatMessages(prev => [
            ...prev,
            {
              id: Date.now(),
              sender: 'bot',
              text: res.data.notification.message,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      }
    } catch (e) {
      showToast('Failed to send test notification', 'error');
    }
  };

  const handleSendCommand = async (cmdText) => {
    const query = (cmdText || inputCmd).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    setInputCmd('');

    try {
      const res = await whatsappAPI.sendCommand(query);
      if (res.data?.success) {
        setChatMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: res.data.response,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (e) {
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: '⚠️ AgroBridge WhatsApp assistant is offline or unable to respond. Please try again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const quickCommands = [
    "My orders",
    "Order status",
    "My products",
    "Today's sales",
    "My earnings",
    "Add product",
    "AI insights",
    "Help"
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans pb-24">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border text-sm font-semibold ${
          toast.type === 'error' ? 'bg-rose-950/90 border-rose-600 text-rose-100' : 'bg-emerald-950/90 border-emerald-600 text-emerald-100'
        } backdrop-blur-md animate-fadeIn`}>
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast.msg}</span>
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
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                    WhatsApp Farmer Assistant
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium">
                      Zero-App Solution
                    </span>
                  </h1>
                  <p className="text-xs md:text-sm text-slate-400">
                    Interact with AgroBridge via WhatsApp: automated order alerts, driver OTPs, and instant command querying.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Prototype Simulation (Twilio / Meta WhatsApp API Ready)
            </span>
            <button
              onClick={handleSendTestAlert}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition"
            >
              <Bell className="w-4 h-4" />
              Test Notification
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Connection Status</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                  profile.isLinked ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${profile.isLinked ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                  {profile.isLinked ? 'WhatsApp Connected' : 'Not Connected'}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Registered WhatsApp Mobile Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+91 98260 12345"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    onClick={handleSavePreferences}
                    disabled={savingPrefs}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
                  >
                    {savingPrefs ? 'Saving...' : 'Update'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Farmer account is verified for real-time dispatch alerts without third-party app installations.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800/80">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-emerald-400" />
                  Automatic Event Notifications
                </h3>

                {[
                  { key: 'orderUpdates', label: 'New Order Received & Confirmed', desc: 'Alert when consumers or bulk buyers order your crops' },
                  { key: 'paymentUpdates', label: 'Direct Payment & UTR Credits', desc: 'Instant confirmation when escrow releases funds to bank' },
                  { key: 'driverUpdates', label: 'Driver Assigned & Farm Pickup OTP', desc: 'Driver contact, vehicle number, and 4-digit pickup OTP' },
                  { key: 'aiAlerts', label: 'Important AI Market Alerts', desc: 'Regional mandi price surges & recommended listing windows' },
                  { key: 'inventoryAlerts', label: 'Low Inventory & Perishable Warnings', desc: 'Reminders when crop stock is depleting or nearing harvest peak' }
                ].map(item => (
                  <div 
                    key={item.key} 
                    onClick={() => handleTogglePref(item.key)}
                    className="flex items-start justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 hover:border-slate-700 cursor-pointer transition"
                  >
                    <div className="space-y-0.5 pr-3">
                      <div className="text-xs font-semibold text-slate-200">{item.label}</div>
                      <div className="text-[11px] text-slate-400">{item.desc}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                      profile.notificationPreferences[item.key] ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 bg-slate-900'
                    }`}>
                      {profile.notificationPreferences[item.key] && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleSavePreferences}
                  disabled={savingPrefs}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20"
                >
                  {savingPrefs ? 'Saving Preferences...' : 'Save Notification Preferences'}
                </button>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  Recent WhatsApp Alerts
                </h3>
                <span className="text-xs text-slate-400 font-mono">{notifications.length} Alerts</span>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    No WhatsApp alerts recorded yet. Click "Test Notification" above.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 whitespace-pre-line font-mono bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          <div className="lg:col-span-7 space-y-4">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[740px]">
              
              <div className="bg-[#075E54] text-white p-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-lg font-bold border-2 border-emerald-400">
                      🌾
                    </div>
                    <span className="w-3 h-3 bg-emerald-400 border-2 border-[#075E54] rounded-full absolute bottom-0 right-0"></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-wide">AgroBridge Kisan Assistant</h3>
                    <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse"></span>
                      Online | Official Business Bot
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-emerald-100 text-xs font-mono">
                  <span>Prototype Sandbox</span>
                </div>
              </div>

              <div className="flex-1 bg-[#0B141A] p-4 overflow-y-auto space-y-3.5 border-b border-slate-800">
                
                <div className="text-center my-2">
                  <span className="bg-slate-800/80 text-slate-400 text-[10px] px-3 py-1 rounded-full border border-slate-700 font-mono">
                    Messages are end-to-end encrypted • AgroBridge Direct Telephony
                  </span>
                </div>

                {chatMessages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-3.5 shadow-md ${
                      msg.sender === 'user' 
                        ? 'bg-[#005C4B] text-emerald-50 rounded-br-none' 
                        : 'bg-[#202C33] text-slate-100 rounded-bl-none border border-slate-700/50'
                    }`}>
                      <p className="text-xs whitespace-pre-line leading-relaxed">
                        {msg.text}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1.5 text-[10px] text-slate-400 font-mono">
                        <span>{msg.time}</span>
                        {msg.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="bg-[#111B21] p-3 border-t border-slate-800/80 space-y-2">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Tap to Send Quick WhatsApp Command:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {quickCommands.map(cmd => (
                    <button
                      key={cmd}
                      onClick={() => handleSendCommand(cmd)}
                      className="px-3 py-1 rounded-full bg-slate-800/90 hover:bg-emerald-600/30 text-emerald-300 hover:text-white border border-slate-700 hover:border-emerald-500 text-xs font-mono transition"
                    >
                      "{cmd}"
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#202C33] p-3 flex items-center gap-2 border-t border-slate-800">
                <input
                  type="text"
                  value={inputCmd}
                  onChange={(e) => setInputCmd(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendCommand()}
                  placeholder="Type a command (e.g. 'Order status', 'Today's sales')..."
                  className="flex-1 bg-[#2A3942] border border-transparent focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none"
                />
                <button
                  onClick={() => handleSendCommand()}
                  className="p-2.5 bg-[#00A884] hover:bg-[#029071] text-slate-950 font-bold rounded-xl transition shrink-0"
                  title="Send to AgroBridge WhatsApp Assistant"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
