import React, { useState, useRef, useEffect } from 'react';
import { Send, PhoneCall, Video, MoreVertical, X, CheckCheck, Sparkles, MessageSquare } from 'lucide-react';

export default function WhatsAppBotModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'नमस्ते किसान भाई! 🙏 AgroBridge WhatsApp सेवा में आपका स्वागत है।\n\nआप किसी भी समय ताजा भाव, ऑर्डर और AI सलाह जान सकते हैं। नीचे दिए गए बटनों पर क्लिक करें या टाइप करें:\n\n• *PRICE TOMATO* - ताजा भाव\n• *ORDERS* - सक्रिय ऑर्डर्स\n• *PREDICTION* - 14 दिनों का AI अनुमान\n• *PAYMENT* - बैंक ट्रांसफर स्थिति',
      time: '10:30 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const upper = query.toUpperCase();

      if (upper.includes('PRICE') || upper.includes('BHAV') || upper.includes('RATE')) {
        reply = '🍅 *टमाटर (Hybrid Tomato) ताजा मंडी व AgroBridge भाव:*\n\n' +
          '• AgroBridge Assured दर: *₹28/kg* (सीधा भुगतान)\n' +
          '• स्थानीय APMC मंडी दर: ₹16/kg (कमीशन -8%)\n' +
          '• खुदरा बाजार (Retail): ₹36/kg\n\n' +
          '💡 *AI सलाह:* स्थानीय मांग मजबूत है। अगले सप्ताह तक भाव ₹34-₹36/kg तक जा सकते हैं। Grade A लॉट AgroBridge पर लिस्ट करें!';
      } else if (upper.includes('ORDER')) {
        reply = '📦 *आपके सक्रिय ऑर्डर्स (Active Orders):*\n\n' +
          '1. *#ORD-8921*: 200 kg टमाटर\n' +
          '   स्थिति: स्वीकृत ✅ (स्वीकृत दर ₹28/kg)\n' +
          '   खरीदार: GreenMart Supermarket, Bhopal\n' +
          '   कुल राशि: ₹5,600\n' +
          '   पिकअप समय: कल सुबह 8:30 AM\n\n' +
          '2. *#ORD-8910*: 500 kg नासिक प्याज\n' +
          '   स्थिति: ट्रांजिट में 🚚\n' +
          '   ड्राइवर: राजू यादव (MP-04-HE-2194)';
      } else if (upper.includes('PREDICT') || upper.includes('FORECAST') || upper.includes('ANUMAN')) {
        reply = '📈 *AgroBridge 14-दिन का AI भाव अनुमान (Bhopal/Indore Region):*\n\n' +
          '• *टमाटर*: ₹28 ➔ ₹36/kg (तेजी 📈 +28%)\n' +
          '• *प्याज*: ₹24 ➔ ₹22/kg (स्थिर ⚖️)\n' +
          '• *आलू*: ₹18 ➔ ₹23/kg (मांग में वृद्धि 📈)\n' +
          '• *लहसुन*: ₹120 ➔ ₹140/kg (मजबूत निर्यात मांग 🚀)\n\n' +
          '🔍 *कौतूहल:* बारिश के कारण आवक कम होने की संभावना है, जिससे सब्जियों के भाव में तेजी बनी रहेगी।';
      } else if (upper.includes('PAYMENT') || upper.includes('PAISA') || upper.includes('BANK')) {
        reply = '💳 *सीधा बैंक ट्रांसफर स्थिति (Direct Farmer Payout):*\n\n' +
          '• पिछला भुगतान: *₹8,450* (सफल ✅)\n' +
          '• बैंक खाता: SBI A/c *******4921 (Ramesh Kumar)\n' +
          '• UTR: AGRO77218941092\n' +
          '• पेंडिंग क्लीयरेंस: ₹0.00 (शून्य बकाया)\n\n' +
          'AgroBridge पर डिलीवरी सत्यापित होते ही 100% राशि सीधे खाते में बिना बिचौलियों के ट्रांसफर होती है।';
      } else {
        reply = `🙏 धन्यवाद किसान भाई! आपके संदेश "${query}" के आधार पर:\n\n` +
          'AgroBridge AI आपके खेत के पास सर्वोत्तम खरीदार और रीयल-टाइम भाव उपलब्ध कराता है।\n\n' +
          'तुरंत जानकारी के लिए कृपया टाइप करें:\n• *PRICE*\n• *ORDERS*\n• *PREDICTION*\n• *PAYMENT*';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  const quickCommands = [
    { label: 'PRICE TOMATO', query: 'PRICE TOMATO' },
    { label: '📦 ORDERS', query: 'ORDERS' },
    { label: '📈 PREDICTION', query: 'PREDICTION' },
    { label: '💳 PAYMENT', query: 'PAYMENT' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#EFEAE2] rounded-2xl shadow-2xl border border-gray-300 max-w-md w-full overflow-hidden flex flex-col h-[600px] max-h-[92vh]">
        {/* WhatsApp Green Top Header */}
        <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold text-lg shadow">
                🌱
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-300 border-2 border-[#075E54] rounded-full"></span>
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide flex items-center space-x-1.5">
                <span>AgroBridge Kisan Bot</span>
                <span className="bg-[#25D366] text-[10px] text-white px-1.5 py-0.2 rounded font-semibold">VERIFIED</span>
              </h3>
              <p className="text-[11px] text-emerald-200">
                {isTyping ? 'टाइप कर रहा है...' : 'ऑनलाइन • +91 79998 12345'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-emerald-100">
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prototype simulation alert bar */}
        <div className="bg-[#128C7E]/90 text-white text-[11px] px-3 py-1 flex items-center justify-between font-medium">
          <span className="flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Interactive WhatsApp Bot Simulation (SIH Demo Mode)</span>
          </span>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">24x7 Live</span>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#E5DDD5]/60 bg-[radial-gradient(#c8c3ba_1px,transparent_1px)] [background-size:16px_16px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 text-xs shadow-sm relative leading-relaxed whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-[#DCF8C6] text-gray-900 rounded-tr-none'
                    : 'bg-white text-gray-900 rounded-tl-none'
                }`}
              >
                <div>{msg.text}</div>
                <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] text-gray-400">
                  <span>{msg.time}</span>
                  {msg.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg px-3 py-2 text-xs shadow-sm flex items-center space-x-1.5 text-gray-500">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Command Chips */}
        <div className="bg-[#f0f2f5] px-3 py-2 border-t border-gray-200 flex items-center space-x-1.5 overflow-x-auto text-xs">
          <span className="text-[10px] text-gray-400 font-bold shrink-0 uppercase">कमांड्स:</span>
          {quickCommands.map((cmd) => (
            <button
              key={cmd.label}
              onClick={() => handleSend(cmd.query)}
              className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 rounded-full text-[11px] font-medium border border-gray-300 shadow-sm shrink-0 transition-colors"
            >
              {cmd.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="bg-[#f0f2f5] px-3 py-2.5 flex items-center space-x-2 border-t border-gray-200"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="संदेश या कमांड टाइप करें..."
            className="flex-1 bg-white rounded-full px-4 py-2 text-xs border border-gray-300 focus:outline-none focus:border-[#075E54] focus:ring-1 focus:ring-[#075E54]"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`p-2.5 rounded-full text-white shadow transition-transform ${
              inputText.trim()
                ? 'bg-[#075E54] hover:bg-[#128C7E] active:scale-95'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
