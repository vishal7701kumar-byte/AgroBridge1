import React, { useState } from 'react';
import { 
  Sprout, ArrowRight, ShieldCheck, MapPin, Truck, TrendingUp, 
  Sparkles, DollarSign, CheckCircle2, ChevronRight, Menu, X, 
  Users, ShoppingCart, Lock, Cpu, BarChart3, Clock, AlertTriangle, 
  Store, Building2, UserCheck, Shield, ChevronDown, Check, ArrowDown,
  ExternalLink, RefreshCw, Zap, Navigation, Award, Layers, Compass,
  HelpCircle, FileText, Globe, MessageSquare, PhoneCall, CloudRain,
  Sun, Gift, Sparkle, HeartHandshake, ArrowUpRight
} from 'lucide-react';

export default function LandingPage({ onNavigate, currentUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeOfferTab, setActiveOfferTab] = useState('seasonal');

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const roleLogins = [
    {
      role: 'FARMER',
      title: 'Farmer',
      tagline: 'Sell your crops directly at fair prices with zero middleman cuts, AI crop valuation & instant alerts.',
      emoji: '🌾',
      loginRoute: '/farmer/login',
      registerRoute: '/farmer/register',
      badge: 'Primary Producer',
      glow: 'hover:border-emerald-500/60 hover:shadow-emerald-500/10',
      accent: 'text-emerald-400',
      btnBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black',
      features: [
        'Direct Crop Harvest Listing',
        'AI 14-Day Price Advisory & MSP',
        'WhatsApp Assistant Notifications',
        'IVR Missed Call Telephony (2G)'
      ]
    },
    {
      role: 'CONSUMER',
      title: 'Consumer',
      tagline: 'Shop fresh produce harvested from local farms with full price transparency and live delivery tracking.',
      emoji: '🛒',
      loginRoute: '/consumer/login',
      registerRoute: '/consumer/register',
      badge: 'Farm-to-Table',
      glow: 'hover:border-teal-500/60 hover:shadow-teal-500/10',
      accent: 'text-teal-400',
      btnBg: 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-black',
      features: [
        'Browse Hyperlocal Fresh Harvests',
        'Direct Farm vs Mandi Price Transparency',
        'AgroBridge Assured Quality Certification',
        'Live 3-Point GPS Delivery Map'
      ]
    },
    {
      role: 'BULK_BUYER',
      title: 'Bulk Buyer',
      tagline: 'Source commercial agricultural commodities directly with tiered volume discounts and smart deal matching.',
      emoji: '🏢',
      loginRoute: '/bulk-buyer/login',
      registerRoute: '/bulk-buyer/register',
      badge: 'Commercial / B2B',
      glow: 'hover:border-indigo-500/60 hover:shadow-indigo-500/10',
      accent: 'text-indigo-400',
      btnBg: 'bg-indigo-500 hover:bg-indigo-400 text-white font-black',
      features: [
        'Procure Volume Tiers with Discounts',
        'MCDA Supplier Deal Matching',
        'Direct RFP & Scheduled Deliveries',
        'Institutional Escrow Contract Settlement'
      ]
    },
    {
      role: 'DRIVER',
      title: 'Driver Partner',
      tagline: 'Empowering rural logistics partners with AI route compaction, zero deadhead miles & instant escrow payouts.',
      emoji: '🚚',
      loginRoute: '/driver/login',
      registerRoute: '/driver/register',
      badge: 'Smart Rural Logistics',
      glow: 'hover:border-amber-500/60 hover:shadow-amber-500/10',
      accent: 'text-amber-400',
      btnBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black',
      features: [
        'AI Route Optimization (33% Distance Saved)',
        'Farm Gate Pickup OTP Verification',
        'Turn-by-Turn Waypoint Navigation',
        'Instant Dropoff Escrow Payouts'
      ]
    },
    {
      role: 'ADMIN',
      title: 'Admin / APMC',
      tagline: 'Centralized oversight, farmer compliance verification, dispute resolution, and platform operations.',
      emoji: '🛡️',
      loginRoute: '/admin/login',
      registerRoute: null,
      badge: 'System Governance',
      glow: 'hover:border-violet-500/60 hover:shadow-violet-500/10',
      accent: 'text-violet-400',
      btnBg: 'bg-violet-500 hover:bg-violet-400 text-white font-black',
      features: [
        'Central Operations Telemetry & Audit',
        'Farmer KYC Verification & Approvals',
        'AI Campaign & Offer Management',
        'Consumer Escrow Dispute Resolution'
      ]
    }
  ];

  const keyFeatures = [
    {
      title: 'AI Price Intelligence',
      tagline: '14-day price forecasting & APMC benchmark tracking to protect farmer margins.',
      icon: TrendingUp,
      accent: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Smart Offers',
      tagline: 'Weather-driven, festive, and seasonal discounts dynamically matched to harvest supply.',
      icon: Sparkles,
      accent: 'text-teal-400',
      bg: 'bg-teal-500/10 border-teal-500/20'
    },
    {
      title: 'Direct Marketplace',
      tagline: 'Seamless farm-gate to consumer purchase channels eliminating commission brokers.',
      icon: Sprout,
      accent: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20'
    },
    {
      title: 'Smart Logistics',
      tagline: 'Automated driver dispatch matching capacity and distance with 33% saved transit mileage.',
      icon: Navigation,
      accent: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20'
    },
    {
      title: 'Live Tracking',
      tagline: 'Real-time 3-point GPS telemetry showing farm pickup, driver transit, and doorstep delivery.',
      icon: MapPin,
      accent: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      title: 'Farmer Profit Analytics',
      tagline: 'Deep visibility into profit margins, disintermediation savings, and crop revenue trends.',
      icon: BarChart3,
      accent: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20'
    },
    {
      title: 'WhatsApp Assistant',
      tagline: 'Instant order alerts, inventory updates, and crop advice via WhatsApp without installing any app.',
      icon: MessageSquare,
      accent: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20'
    },
    {
      title: 'IVR Accessibility',
      tagline: 'Toll-free missed-call callback and bilingual voice telephony for farmers on basic feature phones.',
      icon: PhoneCall,
      accent: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20'
    }
  ];

  const smartOfferItems = [
    {
      id: 'seasonal',
      tabLabel: 'Seasonal Offers',
      icon: Sun,
      title: 'Summer Harvest Freshness Pass',
      category: 'Seasonal Recommendation',
      tag: 'AI-Assisted',
      highlight: 'Up to 24% Off Mandi Rates',
      description: 'Algorithmic bundling of seasonal produce at peak harvest window when crop sweetness is optimal and post-harvest shelf life is highest.',
      metrics: [
        { label: 'Harvest Age', val: '< 8 hrs' },
        { label: 'Shelf Life Score', val: '96/100' },
        { label: 'Farmer Direct Payout', val: '78%' }
      ],
      sampleProducts: ['Ratnagiri Alphonso Mango', 'Fresh Sweet Corn', 'Crisp Cucumbers']
    },
    {
      id: 'weather',
      tabLabel: 'Weather-Based Offers',
      icon: CloudRain,
      title: 'Pre-Monsoon Crop Storage Liquidation',
      category: 'Weather-Triggered Dynamic Pricing',
      tag: 'AI-Assisted',
      highlight: 'Moisture Risk Pre-Emption',
      description: 'Dynamic price adjustments triggered by impending rainfall telemetry in Central MP, safeguarding farmers against moisture loss while delivering grocery value.',
      metrics: [
        { label: 'Rain Telemetry', val: 'Heavy in 48h' },
        { label: 'Risk Mitigation', val: 'High Priority' },
        { label: 'Buyer Discount', val: '18% Instant' }
      ],
      sampleProducts: ['Pukhraj Potatoes', 'Desi Onions', 'Dry Garlic Bulbs']
    },
    {
      id: 'festival',
      tabLabel: 'Festival Offers',
      icon: Gift,
      title: 'Navratri & Diwali Festive Food Hamper',
      category: 'Festive Surge Planning',
      tag: 'AI-Assisted',
      highlight: 'Curated Ritual Freshness',
      description: 'Pre-harvest contract deals for high-demand festive staples, matching urban demand surges directly to regional grower clusters with locked pricing.',
      metrics: [
        { label: 'Surge Projection', val: '+45% Demand' },
        { label: 'Locked Floor MSP', val: 'Guaranteed' },
        { label: 'Household Savings', val: '₹140 / pack' }
      ],
      sampleProducts: ['Organic Rock Salt Produce', 'Fresh Sabudana Batches', 'Green Cardamom']
    },
    {
      id: 'forecast',
      tabLabel: 'Demand Forecast',
      icon: TrendingUp,
      title: '14-Day Demand & Price Forecasting',
      category: 'Predictive Market Trend',
      tag: 'AI-Assisted',
      highlight: 'Forward Price Lock Advisory',
      description: 'Multi-variable time series projection advising buyers to procure upcoming crop cycles ahead of expected mandi price inflation.',
      metrics: [
        { label: 'Confidence Score', val: '94.2%' },
        { label: 'Mandi Trend', val: 'Bullish (+12%)' },
        { label: 'Harvest Window', val: 'Next 5-10 Days' }
      ],
      sampleProducts: ['Hybrid Red Tomatoes', 'Nashik Red Onions', 'Shimla Green Apples']
    },
    {
      id: 'personalized',
      tabLabel: 'Personalized Deals',
      icon: HeartHandshake,
      title: 'Curated Farm-to-Doorstep Subscriptions',
      category: 'Behavioral Recommendation',
      tag: 'AI-Assisted',
      highlight: 'Tailored Weekly Farm Baskets',
      description: 'Algorithmic matching of household consumption frequencies to nearby farmers cultivating certified Grade A produce within a 25km radius.',
      metrics: [
        { label: 'Transit Distance', val: '< 18 km' },
        { label: 'Delivery Schedule', val: 'Twice Weekly' },
        { label: 'Net Annual Savings', val: '₹8,400+' }
      ],
      sampleProducts: ['Mixed Salad Greens', 'Organic Cherry Tomatoes', 'Fresh Farm Mint']
    }
  ];

  const currentOffer = smartOfferItems.find(item => item.id === activeOfferTab) || smartOfferItems[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden font-sans">

      {/* ========================================================================= */}
      {/* 1. NAVBAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* AgroBridge Logo */}
          <div 
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  AgroBridge
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  SIH26033
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">Connecting Farmers Directly to Consumers</p>
            </div>
          </div>

          {/* Clean Navigation Links */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-3">
            <button
              onClick={() => scrollToSection('hero')}
              className="px-3.5 py-2 text-sm font-semibold text-slate-300 hover:text-emerald-400 rounded-xl hover:bg-slate-900/60 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('/consumer/login')}
              className="px-3.5 py-2 text-sm font-semibold text-slate-300 hover:text-emerald-400 rounded-xl hover:bg-slate-900/60 transition-colors flex items-center gap-1.5"
            >
              <span>Marketplace</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="px-3.5 py-2 text-sm font-semibold text-slate-300 hover:text-emerald-400 rounded-xl hover:bg-slate-900/60 transition-colors"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('smart-offers')}
              className="px-3.5 py-2 text-sm font-semibold text-slate-300 hover:text-emerald-400 rounded-xl hover:bg-slate-900/60 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Smart Offers</span>
            </button>
            <button
              onClick={() => scrollToSection('accessibility')}
              className="px-3.5 py-2 text-sm font-semibold text-slate-300 hover:text-emerald-400 rounded-xl hover:bg-slate-900/60 transition-colors"
            >
              Accessibility
            </button>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => onNavigate('/login')}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl shadow-sm transition-all"
            >
              Login
            </button>
            <button
              onClick={() => scrollToSection('roles')}
              className="px-4 py-2 text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:brightness-110 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => onNavigate('/login')}
              className="sm:hidden px-3 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 rounded-lg"
            >
              Login
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-800 bg-slate-950/98 px-5 py-4 space-y-2 animate-fadeIn">
            <button
              onClick={() => scrollToSection('hero')}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-300 hover:text-emerald-400 rounded-lg hover:bg-slate-900/60 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('/consumer/login'); }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-300 hover:text-emerald-400 rounded-lg hover:bg-slate-900/60 transition-colors flex items-center justify-between"
            >
              <span>Marketplace</span>
              <ArrowUpRight className="w-4 h-4 text-slate-500" />
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-300 hover:text-emerald-400 rounded-lg hover:bg-slate-900/60 transition-colors"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('smart-offers')}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-300 hover:text-emerald-400 rounded-lg hover:bg-slate-900/60 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Smart Offers</span>
            </button>
            <button
              onClick={() => scrollToSection('accessibility')}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-300 hover:text-emerald-400 rounded-lg hover:bg-slate-900/60 transition-colors"
            >
              Accessibility
            </button>
            <div className="pt-3 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('/login'); }}
                className="flex-1 py-2 text-xs font-bold text-slate-200 bg-slate-900 border border-slate-700 rounded-xl text-center"
              >
                Login
              </button>
              <button
                onClick={() => scrollToSection('roles')}
                className="flex-1 py-2 text-xs font-black text-slate-950 bg-emerald-400 rounded-xl shadow-md shadow-emerald-500/20 text-center"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================================= */}
      <section id="hero" className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Highlight Badges */}
              <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2 p-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-xs shadow-inner">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                  <span>🌾</span> Direct Farm Sourcing
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 font-bold border border-teal-500/30">
                  <span>🤖</span> AI-Assisted Intelligence
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                  <span>🚚</span> Smart Logistics
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30">
                  <span>💰</span> Zero Middlemen
                </span>
              </div>

              {/* Exact Requested Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Connecting Farmers{' '}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Directly to Consumers
                </span>
              </h1>

              {/* Exact Requested Subheadline */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                An AI-assisted agricultural marketplace connecting farmers, consumers, bulk buyers and logistics in one integrated ecosystem.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onNavigate('/consumer/login')}
                  className="w-full sm:w-auto px-8 py-4 text-sm font-black text-slate-950 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:brightness-110 rounded-2xl shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Explore Marketplace</span>
                </button>
                <button
                  onClick={() => scrollToSection('roles')}
                  className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>Get Started</span>
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                </button>
              </div>

              {/* Key Platform Value Indicators */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                <div className="bg-slate-900/50 p-3.5 rounded-2xl border border-slate-800/60">
                  <div className="text-2xl font-black text-emerald-400">0% Cut</div>
                  <div className="text-xs text-slate-400 mt-0.5">No Middleman Fees</div>
                </div>
                <div className="bg-slate-900/50 p-3.5 rounded-2xl border border-slate-800/60">
                  <div className="text-2xl font-black text-teal-400">14-Day</div>
                  <div className="text-xs text-slate-400 mt-0.5">AI Price Forecast</div>
                </div>
                <div className="bg-slate-900/50 p-3.5 rounded-2xl border border-slate-800/60">
                  <div className="text-2xl font-black text-amber-400">33% Saved</div>
                  <div className="text-xs text-slate-400 mt-0.5">Logistics Route Path</div>
                </div>
                <div className="bg-slate-900/50 p-3.5 rounded-2xl border border-slate-800/60">
                  <div className="text-2xl font-black text-cyan-400">100% Escrow</div>
                  <div className="text-xs text-slate-400 mt-0.5">Dual-OTP Security</div>
                </div>
              </div>

            </div>

            {/* Right Agritech Hero Visual Showcase */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-7 shadow-2xl shadow-emerald-500/10">
                
                {/* Header status */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">AgroBridge Live Ecosystem</span>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">Real-Time Hub</span>
                </div>

                {/* Direct Supply Chain Flow Showcase */}
                <div className="py-5 space-y-3 relative">
                  
                  {/* Step 1: Farmer */}
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg">
                        🌾
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Direct Farm Listing</div>
                        <div className="text-[11px] text-slate-400">Fresh harvest priced at fair base MSP</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      78% Return
                    </span>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center text-slate-600 text-xs -my-1">
                    ↓
                  </div>

                  {/* Step 2: AI Core */}
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-teal-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-lg">
                        🤖
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">AI Price & Demand Engine</div>
                        <div className="text-[11px] text-slate-400">Mandi comparison & Smart Offers</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md">
                      AI-Assisted
                    </span>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center text-slate-600 text-xs -my-1">
                    ↓
                  </div>

                  {/* Step 3: Smart Logistics */}
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
                        🚚
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Smart Rural Logistics</div>
                        <div className="text-[11px] text-slate-400">Leaflet GPS map & dual-OTP escrow</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      33% Compact
                    </span>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center text-slate-600 text-xs -my-1">
                    ↓
                  </div>

                  {/* Step 4: Consumer Delivery */}
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-lg">
                        🛒
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Consumer & Bulk Buyer</div>
                        <div className="text-[11px] text-slate-400">Grade A produce delivered to doorstep</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                      22% Saved
                    </span>
                  </div>

                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Verified Farm-to-Fork Protocol</span>
                  </span>
                  <button 
                    onClick={() => onNavigate('/login')}
                    className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Enter Platform →
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ROLE-BASED ACCESS ("CHOOSE YOUR ROLE") */}
      {/* ========================================================================= */}
      <section id="roles" className="py-20 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Platform Authentication
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Choose Your Role
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Select your role below to access your dedicated portal with tailored tools and real-time workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {roleLogins.map(role => (
              <div 
                key={role.role}
                className={`p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col justify-between transition-all duration-300 ${role.glow}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{role.emoji}</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${role.accent} bg-slate-900 border border-slate-800`}>
                      {role.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{role.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{role.tagline}</p>
                  </div>
                  <ul className="space-y-2 pt-3 border-t border-slate-800/80 text-[11px] text-slate-300">
                    {role.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 space-y-2">
                  <button
                    onClick={() => onNavigate(role.loginRoute)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 ${role.btnBg}`}
                  >
                    <span>Login as {role.title}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {role.registerRoute ? (
                    <button
                      onClick={() => onNavigate(role.registerRoute)}
                      className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all text-center"
                    >
                      Register
                    </button>
                  ) : (
                    <div className="py-2 text-[11px] text-slate-500 text-center font-medium">
                      Admin Access Only
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Demonstration Credentials Note */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 max-w-2xl mx-auto text-center space-y-1 text-xs text-slate-400">
            <div className="font-bold text-slate-200 flex items-center justify-center gap-1.5">
              <span>🔑</span> SIH Hackathon Evaluation Demo Access
            </div>
            <p>
              Pre-configured test accounts are enabled for all roles with default demo password: <code className="text-emerald-400 bg-slate-950 px-2 py-0.5 rounded font-mono font-bold">Demo@123</code>
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. KEY PLATFORM FEATURES */}
      {/* ========================================================================= */}
      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Core Platform Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Built for High-Efficiency Agriculture
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Every feature is engineered to eliminate friction, guarantee fair pricing, and ensure seamless delivery from farm gate to consumer.
            </p>
          </div>

          {/* 8 Concise Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyFeatures.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={i}
                  className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 transition-all space-y-3"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${feat.bg} ${feat.accent}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feat.tagline}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. AI-POWERED SMART OFFERS */}
      {/* ========================================================================= */}
      <section id="smart-offers" className="py-20 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-extrabold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Assisted Market Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              AI-Powered Smart Offers
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Dynamic agricultural pricing and automated recommendations synchronized with real-time seasonal, meteorological, and festive demand cycles.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 max-w-3xl mx-auto">
            {smartOfferItems.map(item => {
              const TabIcon = item.icon;
              const isActive = activeOfferTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveOfferTab(item.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{item.tabLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Active Smart Offer Detailed Card */}
          <div className="p-8 rounded-3xl bg-slate-950 border border-emerald-500/40 shadow-2xl relative overflow-hidden">
            
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>{currentOffer.tag}</span>
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800 font-medium">
                    {currentOffer.category}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white leading-snug">
                  {currentOffer.title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  {currentOffer.description}
                </p>

                <div className="pt-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Active Produce in this Offer:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentOffer.sampleProducts.map((prod, i) => (
                      <span key={i} className="text-xs px-3 py-1 rounded-xl bg-slate-900 text-slate-200 border border-slate-800">
                        {prod}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Algorithmic Signals</span>
                  <span className="text-xs font-black text-teal-400 bg-teal-500/15 px-2.5 py-1 rounded-lg border border-teal-500/30">
                    {currentOffer.highlight}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  {currentOffer.metrics.map((m, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-sm sm:text-base font-black text-white">{m.val}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{m.label}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onNavigate('/consumer/login')}
                  className="w-full py-3 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Claim Offer in Marketplace</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FARMER ACCESSIBILITY ("BUILT FOR EVERY FARMER") */}
      {/* ========================================================================= */}
      <section id="accessibility" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Inclusive Rural Access
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Built for Every Farmer
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Designed to ensure 100% digital inclusion whether the farmer possesses a modern 5G smartphone or a basic 2G feature phone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 1. Smartphone Access */}
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-emerald-500/30 hover:border-emerald-500/60 transition-all space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-2xl">
                  📱
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Web + WhatsApp
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Smartphone Access</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Engineered for progressive farmers utilizing 4G/5G mobile connectivity with intuitive visual interfaces.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Responsive web dashboard with real-time earnings analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WhatsApp Assistant for automated order alerts and chat queries</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI camera crop freshness grading & certificate generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant digital wallet payouts protected by escrow</span>
                </li>
              </ul>

              <button
                onClick={() => onNavigate('/farmer/login')}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Launch Farmer Portal & WhatsApp</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Basic Phone Access */}
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-teal-500/30 hover:border-teal-500/60 transition-all space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/15 text-teal-400 flex items-center justify-center text-2xl">
                  ☎️
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
                  Missed Call / IVR
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Basic Phone Access</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Tailored for marginal smallholders in low-connectivity areas using basic keypad feature phones.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Toll-free <strong>1800-AGRO-BRIDGE</strong> missed call automatic callback</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Bilingual interactive voice response (Hindi & English)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Audio readout of today's mandi benchmark rates & active orders</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Zero internet or application installation required</span>
                </li>
              </ul>

              <button
                onClick={() => onNavigate('/farmer/login')}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Simulate IVR Telephony Call</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FINAL CTA */}
      {/* ========================================================================= */}
      <section id="cta" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
            <Sprout className="w-8 h-8 text-slate-950" />
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Build a Smarter Farm-to-Consumer Journey
            </h2>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Join progressive farmers, conscious consumers, and commercial buyers transforming the future of Indian agriculture.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => scrollToSection('roles')}
              className="w-full sm:w-auto px-8 py-4 text-sm font-black text-slate-950 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:brightness-110 rounded-2xl shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Start with AgroBridge</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('/consumer/login')}
              className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <span>Explore Marketplace</span>
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-900 bg-slate-950 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* AgroBridge Brand Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Sprout className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <span className="text-xl font-black text-white">AgroBridge</span>
                  <p className="text-xs text-emerald-400 font-medium">Smart India Hackathon Prototype (SIH26033)</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                An AI-assisted agricultural marketplace connecting farmers, consumers, bulk buyers and logistics in one integrated ecosystem.
              </p>
              <div className="text-xs text-slate-500">
                Empowering producers with transparent pricing & zero middleman exploitation.
              </div>
            </div>

            {/* Platform Quick Links */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">AgroBridge</h4>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => scrollToSection('hero')} className="hover:text-emerald-400 transition-colors">Home</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-emerald-400 transition-colors">About Us</button></li>
                <li><button onClick={() => scrollToSection('smart-offers')} className="hover:text-emerald-400 transition-colors">Smart Offers</button></li>
                <li><button onClick={() => scrollToSection('accessibility')} className="hover:text-emerald-400 transition-colors">Farmer Accessibility</button></li>
              </ul>
            </div>

            {/* Marketplace & Portals */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Marketplace & Roles</h4>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => onNavigate('/consumer/login')} className="hover:text-teal-400 transition-colors flex items-center gap-1.5"><span>🛒</span> Marketplace</button></li>
                <li><button onClick={() => onNavigate('/farmer/login')} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><span>🌾</span> Farmer Portal</button></li>
                <li><button onClick={() => onNavigate('/bulk-buyer/login')} className="hover:text-indigo-400 transition-colors flex items-center gap-1.5"><span>🏢</span> Bulk Buyer Desk</button></li>
                <li><button onClick={() => onNavigate('/driver/login')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5"><span>🚚</span> Driver Fleet</button></li>
                <li><button onClick={() => onNavigate('/admin/login')} className="hover:text-violet-400 transition-colors flex items-center gap-1.5"><span>🛡️</span> Admin Governance</button></li>
              </ul>
            </div>

            {/* Compliance & Legal */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Legal & Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => onNavigate('/login')} className="hover:text-emerald-400 transition-colors">Login / Authentication</button></li>
                <li><a href="mailto:support@agrobridge.in" className="hover:text-emerald-400 transition-colors">Contact Support</a></li>
                <li><span className="text-slate-500">Privacy Policy</span></li>
                <li><span className="text-slate-500">Terms of Service</span></li>
                <li><span className="text-slate-500">Escrow Guarantee</span></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center">
            <div>© 2026 AgroBridge Platform. All rights reserved.</div>
            <div className="text-emerald-400 font-medium">Connecting Farmers Directly to Consumers</div>
            <div>Problem Statement SIH26033 Prototype</div>
          </div>

        </div>
      </footer>

    </div>
  );
}
