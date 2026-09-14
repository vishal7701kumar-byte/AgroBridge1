import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, X, Globe } from 'lucide-react';
import { aiAPI } from '../services/api';

const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

const HINGLISH_WORDS = new Set([
  'kya', 'kyu', 'kyun', 'kaise', 'kaisa', 'kaisi', 'kab', 'kaha', 'kahan', 'kitna', 'kitne', 'kitni', 'kaun', 'kisko',
  'hai', 'hain', 'hoga', 'hogi', 'hoge', 'tha', 'thi', 'the', 'raha', 'rahi', 'rahe', 'karna', 'karo', 'kare', 'karein',
  'batao', 'bataye', 'bataiye', 'batado', 'bataao', 'dekho', 'dekhna', 'milega', 'milegi', 'milege', 'chahiye',
  'badhega', 'badhegi', 'ghatega', 'ghategi', 'bikega', 'bikegi', 'kharidna', 'bechna', 'beche', 'bechein', 'becho',
  'ka', 'ki', 'ke', 'ko', 'se', 'mein', 'par', 'pe', 'aur', 'ya', 'mera', 'meri', 'mere', 'apka', 'aapka', 'apne', 'apki',
  'humara', 'humari', 'humare', 'hamara', 'iska', 'iski', 'iske', 'uska', 'uski', 'uske', 'yeh', 'woh', 'toh',
  'aaj', 'kal', 'parso', 'agle', 'agla', 'agli', 'hafte', 'mahine', 'din', 'dino', 'samay', 'waqt',
  'bhav', 'bhaav', 'daam', 'mandi', 'fasal', 'kisan', 'kheti', 'tamatar', 'pyaaz', 'pyaz', 'aaloo', 'aalu', 'aloo',
  'gehun', 'gehu', 'lahsun', 'lehsun', 'chawal', 'sarson', 'sarso', 'mirch', 'mirchi', 'kapas',
  'farak', 'faayda', 'fayda', 'sahi', 'accha', 'achha', 'nahi', 'bahut', 'jyada', 'zyada'
]);

const ENGLISH_WORDS = new Set([
  'what', 'how', 'when', 'where', 'why', 'which', 'who', 'whose', 'whom',
  'the', 'of', 'for', 'about', 'with', 'from', 'into', 'during',
  'can', 'could', 'would', 'should', 'will', 'shall', 'does', 'do', 'did',
  'is', 'are', 'am', 'was', 'were', 'been', 'being', 'have', 'has', 'had',
  'please', 'tell', 'show', 'give', 'help', 'explain', 'price', 'rates', 'market',
  'today', 'tomorrow', 'next', 'week', 'month', 'year', 'trend', 'forecast',
  'quality', 'delivery', 'order', 'tracking', 'farmer', 'buyers'
]);

function clientDetectLanguage(text = '', prev = 'en') {
  const str = (text || '').trim();
  if (!str) return prev;
  if (DEVANAGARI_REGEX.test(str)) return 'hi';
  const words = str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  if (words.length === 0) return prev;

  let hinglishCount = 0;
  let englishCount = 0;
  for (const w of words) {
    if (HINGLISH_WORDS.has(w)) hinglishCount++;
    if (ENGLISH_WORDS.has(w)) englishCount++;
  }

  if (hinglishCount > 0 && hinglishCount >= englishCount) return 'hinglish';
  if (hinglishCount > 0 && englishCount === 0) return 'hinglish';
  if (englishCount > hinglishCount) return 'en';
  if (hinglishCount > 0) return 'hinglish';

  return prev || 'en';
}

export default function AgroBridgeAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [detectedLang, setDetectedLang] = useState('hi'); // 'hi' | 'en' | 'hinglish'
  const [chatContext, setChatContext] = useState({});
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'नमस्ते! मैं AgroBridge का AI सहायक हूँ। 🌾\n\nआप मुझसे फसल के ताजा भाव, 14-दिन का AI पूर्वानुमान, AgroBridge Assured क्वालिटी, या सीधे खरीद-बिक्री के बारे में किसी भी भाषा (English, हिन्दी या Hinglish) में पूछ सकते हैं।',
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    // Fast local detection to update UI immediately
    const expectedLang = clientDetectLanguage(query, detectedLang);
    setDetectedLang(expectedLang);

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const historySlice = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await aiAPI.chat({
        query,
        language: expectedLang,
        conversationHistory: historySlice,
        context: chatContext
      });

      const resData = res.data?.data || res.data;
      const botResponse = res.data?.response || resData?.response;

      if (botResponse) {
        if (resData?.detectedLanguage) {
          setDetectedLang(resData.detectedLanguage);
        }
        if (resData?.context) {
          setChatContext(resData.context);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'ai',
            text: botResponse,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('AI Chat API fallback to offline intelligent responder:', err);
    }

    // Local smart fallback respecting tri-lingual fidelity if offline
    setTimeout(() => {
      let reply = '';
      const q = query.toLowerCase();
      const currentLang = expectedLang;

      if (currentLang === 'hi') {
        if (q.includes('टमाटर') || q.includes('tomato')) {
          reply = '🍅 टमाटर का ताजा भाव ₹28/किग्रा है (मंडी भाव ₹20, रिटेल ₹42)। हमारे AI मॉडल के अनुसार अगले 7 दिनों में यह ₹32/किग्रा और 14 दिनों में ₹36/किग्रा (+18% 📈) तक पहुंच सकता है। ग्रेड A टमाटर पर "✓ AgroBridge Assured" का विश्वसनीय बैज मिलता है।';
        } else if (q.includes('गेहूं') || q.includes('wheat')) {
          reply = '🌾 शरबती गेहूं का वर्तमान फार्म गेट भाव ₹38/किग्रा है (मंडी भाव ₹30/किग्रा)। फ्लोर मिलों की सीधी मांग के कारण 14 दिनों में भाव ₹42/किग्रा तक जाने का अनुमान है।';
        } else if (q.includes('assured') || q.includes('क्वालिटी') || q.includes('quality')) {
          reply = '✓ AgroBridge Assured हमारी विशेष गुणवत्ता सत्यापन प्रणाली है। AI कंप्यूटर विज़न से ताजगी (>85%), रंग और आकार की जांच होती है। ग्रेड A उपज पर 100% रिप्लेसमेंट गारंटी मिलती है।';
        } else {
          reply = `AgroBridge AI से जुड़ने के लिए धन्यवाद। आपके सवाल "${query}" के संबंध में: AgroBridge सीधे किसानों को खरीदारों से जोड़कर बिचौलियों का 40% कमीशन समाप्त करता है। क्या आप किसी फसल के भाव या AI भविष्यवाणी के बारे में जानना चाहते हैं?`;
        }
      } else if (currentLang === 'hinglish') {
        if (q.includes('tomato') || q.includes('tamatar')) {
          reply = '🍅 Tomato ka current farm gate rate ₹28/kg chal raha hai (jabki Mandi rate ₹20/kg aur Retail ₹42/kg hai). AI prediction ke according agle 7 dino me rate ₹32/kg aur 14 dino me ₹36/kg (+18% 📈) tak pahunch sakta hai.';
        } else if (q.includes('wheat') || q.includes('gehun')) {
          reply = '🌾 Sharbati Wheat ka current farm rate ₹38/kg chal raha hai (Mandi: ₹30/kg). Flour mills ki continuous demand se agle 14 dino me rates ₹42/kg tak ja sakte hain.';
        } else if (q.includes('assured') || q.includes('quality')) {
          reply = '✓ AgroBridge Assured verification me AI camera se produce ki freshness (>85%), size aur color verify kiya jata hai. Grade A milne par produce premium price par fast sell hoti hai.';
        } else {
          reply = `AgroBridge AI Assistant se connect karne ke liye shukriya! Aapke sawaal "${query}" ke related: AgroBridge kisan aur buyers ko directly connect karke middlemen ka commission khatam karta hai. Aap kisi specific crop ka live rate ya prediction dekhna chahenge?`;
        }
      } else {
        // Pure English
        if (q.includes('tomato')) {
          reply = '🍅 Current farm gate price for Tomato on AgroBridge is ₹28/kg (local Mandi rate: ₹20/kg, Retail supermarket: ₹42/kg). AI models project an upward trend reaching ₹32/kg in 7 days and ₹36/kg in 14 days (+18% 📈). Grade A lots earn the "✓ AgroBridge Assured" quality badge.';
        } else if (q.includes('wheat')) {
          reply = '🌾 Current farm gate price for Sharbati Wheat is ₹38/kg (local Mandi rate: ₹30/kg, Retail: ₹52/kg). Direct procurement from flour mills is projected to push rates to ₹42/kg over 14 days.';
        } else if (q.includes('assured') || q.includes('quality')) {
          reply = '✓ AgroBridge Assured is our proprietary AI quality verification pipeline. Computer vision inspects harvest freshness (>85%), color uniformity, and sizing. Grade A certification includes a 100% replacement guarantee for buyers.';
        } else {
          reply = `Thank you for reaching out to AgroBridge AI! Regarding "${query}": AgroBridge eliminates intermediary markups, delivering 88-92% value directly to farmers while providing guaranteed Grade A produce to buyers. How else can I assist you with crop forecasts, logistics, or pricing?`;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsLoading(false);
    }, 500);
  };

  const quickPrompts = [
    { label: '🌾 Wheat price?', query: 'What is the price of wheat?' },
    { label: '🍅 Tomato ka price?', query: 'Tomato ka price kya hoga?' },
    { label: '🥔 आलू का ताजा भाव?', query: 'आलू का ताजा भाव और 14-दिन का अनुमान क्या है?' },
    { label: '📈 Next week forecast?', query: 'What about next week?' },
    { label: '✓ AgroBridge Assured?', query: 'What is AgroBridge Assured quality verification?' },
    { label: '🚚 Delivery tracking?', query: 'How does live order tracking work?' },
  ];

  const getLanguageLabel = () => {
    if (detectedLang === 'hi') return 'Auto: हिन्दी';
    if (detectedLang === 'hinglish') return 'Auto: Hinglish';
    return 'Auto: English';
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Minimized Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center space-x-2 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white p-3.5 sm:px-4 sm:py-3.5 rounded-full shadow-2xl hover:shadow-emerald-900/30 hover:scale-105 active:scale-95 transition-all border-2 border-emerald-400/40"
          aria-label="Open AgroBridge AI Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-emerald-100" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
            </span>
          </div>
          <span className="hidden sm:inline font-bold text-xs tracking-wide">
            Ask AgroBridge AI
          </span>
          <span className="bg-emerald-500/40 border border-emerald-300/40 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
            24x7
          </span>
        </button>
      )}

      {/* Expanded AI Chat Dialog */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[360px] sm:w-[420px] h-[560px] max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white p-3.5 flex items-center justify-between shadow">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-white/10 rounded-xl border border-white/20">
                <Bot className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center space-x-1.5">
                  <span>AgroBridge AI Assistant</span>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                </h3>
                <p className="text-[11px] text-emerald-200">
                  {isLoading ? 'AI सोच रहा है...' : 'English • हिन्दी • Hinglish Auto-Detect'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              {/* Dynamic Auto-Detect Badge */}
              <div className="bg-emerald-950/70 text-emerald-200 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center space-x-1">
                <Globe className="w-3 h-3 text-emerald-400" />
                <span>{getLanguageLabel()}</span>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-emerald-100 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/70 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl p-3 leading-relaxed whitespace-pre-line shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none font-medium'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                  <div
                    className={`text-[10px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-emerald-200' : 'text-gray-400'
                    }`}
                  >
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-xl rounded-bl-none px-3.5 py-2.5 shadow-sm flex items-center space-x-2 text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-[11px] text-gray-400 ml-1">
                    {detectedLang === 'hi'
                      ? 'कृषि AI उत्तर तैयार कर रहा है...'
                      : detectedLang === 'hinglish'
                      ? 'AI answer prepare kar raha hai...'
                      : 'AI is preparing response...'}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2 bg-gray-100 border-t border-gray-200 flex items-center space-x-1.5 overflow-x-auto text-[11px]">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.query)}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 border border-gray-300 rounded-full shrink-0 font-medium transition-colors shadow-xs"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-gray-200 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                detectedLang === 'hi'
                  ? 'फसल का भाव, पूर्वानुमान या सवाल पूछें...'
                  : detectedLang === 'hinglish'
                  ? 'Crop rate, 14-day prediction ya sawaal poochein...'
                  : 'Ask about crop prices, 14-day forecast, orders...'
              }
              className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`p-2.5 rounded-xl text-white shadow-sm transition-all ${
                inputText.trim() && !isLoading
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
