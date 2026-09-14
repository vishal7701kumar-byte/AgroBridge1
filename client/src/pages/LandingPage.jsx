import React, { useState } from 'react';
import FutureInsightsChart from '../components/FutureInsightsChart';
import { 
  Sprout, ArrowRight, ShieldCheck, MapPin, Truck, TrendingUp, 
  Sparkles, DollarSign, CheckCircle2, ChevronRight, Menu, X, 
  Users, ShoppingCart, Lock, Cpu, BarChart3, Clock, AlertTriangle, 
  Store, Building2, UserCheck, Shield, ChevronDown, Check, ArrowDown,
  ExternalLink, RefreshCw, Zap, Navigation, Award, Layers, Compass,
  HelpCircle, FileText, Globe
} from 'lucide-react';

export default function LandingPage({ onNavigate, currentUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      tagline: 'Manage your farm, list crops, and sell directly with zero middleman deductions.',
      emoji: '👨‍🌾',
      route: '/farmer/login',
      btnText: 'LOGIN AS FARMER',
      badge: 'Primary Producer',
      glow: 'hover:border-emerald-500/60 hover:shadow-emerald-500/10',
      accent: 'text-emerald-400',
      btnBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black',
      features: ['List Crop Harvests Directly', 'AI 14-Day Price Advisory', 'AI Crop Quality Verification', 'Direct Wholesale Deal Matching']
    },
    {
      role: 'CONSUMER',
      title: 'Consumer',
      tagline: 'Shop farm-fresh produce with complete price transparency and live delivery tracking.',
      emoji: '🛒',
      route: '/consumer/login',
      btnText: 'LOGIN AS CONSUMER',
      badge: 'Farm-to-Table',
      glow: 'hover:border-teal-500/60 hover:shadow-teal-500/10',
      accent: 'text-teal-400',
      btnBg: 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-black',
      features: ['Browse Fresh Local Harvests', 'Compare Mandi vs Farm Prices', 'AgroBridge Assured Certified Produce', 'Live 3-Point GPS Delivery Map']
    },
    {
      role: 'BULK_BUYER',
      title: 'Bulk Buyer',
      tagline: 'Source high-volume agricultural commodities directly with intelligent RFQ deal matching.',
      emoji: '🏢',
      route: '/bulk-buyer/login',
      btnText: 'LOGIN AS BULK BUYER',
      badge: 'Commercial / B2B',
      glow: 'hover:border-indigo-500/60 hover:shadow-indigo-500/10',
      accent: 'text-indigo-400',
      btnBg: 'bg-indigo-500 hover:bg-indigo-400 text-white font-black',
      features: ['Procure Volume Tiers with Discounts', 'MCDA Best Deal Supplier Matching', 'Smart Price Negotiation Bot', 'Scheduled Fleet Deliveries']
    },
    {
      role: 'DRIVER',
      title: 'Driver Partner',
      tagline: 'Empowering rural logistics with AI route optimization and dual-OTP verified handovers.',
      emoji: '🚚',
      route: '/driver/login',
      btnText: 'LOGIN AS DRIVER',
      badge: 'Smart Rural Logistics',
      glow: 'hover:border-amber-500/60 hover:shadow-amber-500/10',
      accent: 'text-amber-400',
      btnBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black',
      features: ['AI Route Optimization (33% Distance Saved)', 'Farm Gate Pickup OTP Verification', 'Turn-by-Turn Delivery Navigation', 'Instant Escrow Handover Payouts']
    },
    {
      role: 'ADMIN',
      title: 'Admin / APMC',
      tagline: 'Centralized oversight, farmer compliance audits, and platform telemetry monitoring.',
      emoji: '👨‍💼',
      route: '/admin/login',
      btnText: 'ADMIN LOGIN',
      badge: 'System Governance',
      glow: 'hover:border-violet-500/60 hover:shadow-violet-500/10',
      accent: 'text-violet-400',
      btnBg: 'bg-violet-500 hover:bg-violet-400 text-white font-black',
      features: ['Central Operations Audit & Telemetry', 'Farmer Verification & Sanction Toggles', 'Product Moderation & Quality Signoff', 'Consumer Dispute & Escrow Resolution']
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden font-sans">

      {/* ========================================================================= */}
      {/* 1. STICKY NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Tagline */}
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
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">Connecting Farmers. Consumers. Technology.</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {[
              { label: 'Home', id: 'hero' },
              { label: 'About Us', id: 'problem' },
              { label: 'How It Works', id: 'how-it-works' },
              { label: 'Features', id: 'features' },
              { label: 'Why AgroBridge', id: 'why-agrobridge' },
              { label: 'Comparison', id: 'comparison' },
              { label: 'References', id: 'references' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="px-3 py-2 text-xs xl:text-sm font-semibold text-slate-300 hover:text-emerald-400 rounded-xl hover:bg-slate-900/60 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => scrollToSection('login')}
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
              onClick={() => scrollToSection('login')}
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
            {[
              { label: 'Home', id: 'hero' },
              { label: 'About Us', id: 'problem' },
              { label: 'How It Works', id: 'how-it-works' },
              { label: 'Features', id: 'features' },
              { label: 'Why AgroBridge', id: 'why-agrobridge' },
              { label: 'Comparison', id: 'comparison' },
              { label: 'References', id: 'references' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-300 hover:text-emerald-400 rounded-lg hover:bg-slate-900/60 transition-colors"
              >
                {item.label}
              </button>
            ))}
            <div className="pt-3 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => scrollToSection('login')}
                className="flex-1 py-2 text-xs font-bold text-slate-200 bg-slate-900 border border-slate-700 rounded-xl"
              >
                Login
              </button>
              <button
                onClick={() => scrollToSection('roles')}
                className="flex-1 py-2 text-xs font-black text-slate-950 bg-emerald-400 rounded-xl shadow-md shadow-emerald-500/20"
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
                  <span>🌾</span> Direct Farmer Marketplace
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 font-bold border border-teal-500/30">
                  <span>🤖</span> AI-Assisted Insights
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                  <span>🚚</span> Smart Logistics
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30">
                  <span>💰</span> Transparent Pricing
                </span>
              </div>

              {/* Exact Prompt Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Connecting Farmers{' '}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Directly to Consumers.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                A modern AI-assisted agricultural marketplace streamlining the farm-to-table journey with real-time price transparency, intelligent logistics routing, and direct market access for rural producers and urban buyers.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => scrollToSection('features')}
                  className="w-full sm:w-auto px-8 py-4 text-sm font-black text-slate-950 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:brightness-110 rounded-2xl shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>Explore Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollToSection('login')}
                  className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>Login / Choose Role</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </button>
              </div>

              {/* Platform Metrics Highlights */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                  <div className="text-xl font-black text-emerald-400">5 Roles</div>
                  <div className="text-xs text-slate-400 mt-0.5">Unified Portals</div>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                  <div className="text-xl font-black text-teal-400">0% Cut</div>
                  <div className="text-xs text-slate-400 mt-0.5">Middlemen Fees</div>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                  <div className="text-xl font-black text-amber-400">33% Saved</div>
                  <div className="text-xs text-slate-400 mt-0.5">Route Distance</div>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                  <div className="text-xl font-black text-cyan-400">100% Escrow</div>
                  <div className="text-xs text-slate-400 mt-0.5">Dual-OTP Security</div>
                </div>
              </div>

            </div>

            {/* Right Interactive Visual Flow Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl shadow-emerald-500/10">
                
                <div className="flex items-center justify-between pb-5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Live Supply Chain Pipeline</span>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-mono">AgroBridge Flow</span>
                </div>

                {/* Vertical Step Workflow Visual */}
                <div className="py-6 space-y-4 relative">
                  <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-emerald-500 via-teal-500 to-amber-500 opacity-30" />

                  {/* Node 1: Farmer */}
                  <div className="relative flex items-center gap-4 p-3 rounded-2xl bg-slate-950/70 border border-emerald-500/30">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl shrink-0 z-10">
                      👨‍🌾
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Origin: Rural Producer</div>
                      <div className="text-sm font-bold text-white">Farmer / FPO Cluster</div>
                      <div className="text-[11px] text-slate-400">Direct crop harvest listing at fair base MSP</div>
                    </div>
                  </div>

                  {/* Flow Indicator */}
                  <div className="flex justify-center -my-2 relative z-10">
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-xs">
                      ↓
                    </div>
                  </div>

                  {/* Node 2: AgroBridge Marketplace & AI */}
                  <div className="relative flex items-center gap-4 p-3 rounded-2xl bg-slate-950/70 border border-teal-500/30">
                    <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xl shrink-0 z-10">
                      🤖
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-teal-400 uppercase tracking-wider">Intelligent Core</div>
                      <div className="text-sm font-bold text-white">Digital Marketplace & AI Pricing</div>
                      <div className="text-[11px] text-slate-400">Demand forecast, fair-price comparison, deal match</div>
                    </div>
                  </div>

                  {/* Flow Indicator */}
                  <div className="flex justify-center -my-2 relative z-10">
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-xs">
                      ↓
                    </div>
                  </div>

                  {/* Node 3: Consumer & Bulk Buyer */}
                  <div className="relative flex items-center gap-4 p-3 rounded-2xl bg-slate-950/70 border border-cyan-500/30">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xl shrink-0 z-10">
                      🛒
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Terminal Demand</div>
                      <div className="text-sm font-bold text-white">Consumer & Bulk Buyer</div>
                      <div className="text-[11px] text-slate-400">Farm-to-table groceries & B2B procurement</div>
                    </div>
                  </div>

                  {/* Flow Indicator */}
                  <div className="flex justify-center -my-2 relative z-10">
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-xs">
                      ↓
                    </div>
                  </div>

                  {/* Node 4: Smart Logistics */}
                  <div className="relative flex items-center gap-4 p-3 rounded-2xl bg-slate-950/70 border border-amber-500/30">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl shrink-0 z-10">
                      🚚
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Fulfillment</div>
                      <div className="text-sm font-bold text-white">Smart Logistics & Live Tracking</div>
                      <div className="text-[11px] text-slate-400">Leaflet 3-point GPS map & Dual-OTP escrow</div>
                    </div>
                  </div>

                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Supply Chain Efficiency</span>
                  <span className="font-bold text-emerald-400">Optimized Farm-to-Fork</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PROBLEM SECTION */}
      {/* ========================================================================= */}
      <section id="problem" className="py-20 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-rose-400 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
              Supply Chain Friction
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              The Traditional Supply Chain Breakdown
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Agricultural commodities currently pass through multiple speculative layers before reaching consumer plates, increasing waste and inflating retail markups.
            </p>
          </div>

          {/* Traditional Intermediary Horizontal Flowchart */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 overflow-x-auto">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Conventional Multi-Tier Agricultural Distribution (Fragmented & Opaque)</span>
            </div>
            
            <div className="flex items-center min-w-[760px] justify-between text-center gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex-1">
                <div className="text-base mb-1">👨‍🌾</div>
                <div className="font-bold text-white">Farmer</div>
                <div className="text-[10px] text-rose-400">Receives 30-35%</div>
              </div>
              <div className="text-slate-600 font-bold">➔</div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex-1">
                <div className="text-base mb-1">⚖️</div>
                <div className="font-bold text-slate-300">Commission Agent</div>
                <div className="text-[10px] text-slate-400">+8-12% Cut</div>
              </div>
              <div className="text-slate-600 font-bold">➔</div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex-1">
                <div className="text-base mb-1">🏛️</div>
                <div className="font-bold text-slate-300">APMC Mandi Wholesaler</div>
                <div className="text-[10px] text-slate-400">+15-20% Markup</div>
              </div>
              <div className="text-slate-600 font-bold">➔</div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex-1">
                <div className="text-base mb-1">📦</div>
                <div className="font-bold text-slate-300">Regional Sub-Wholesaler</div>
                <div className="text-[10px] text-slate-400">+10-15% Markup</div>
              </div>
              <div className="text-slate-600 font-bold">➔</div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex-1">
                <div className="text-base mb-1">🏪</div>
                <div className="font-bold text-slate-300">Local Retailer</div>
                <div className="text-[10px] text-slate-400">+20-30% Margin</div>
              </div>
              <div className="text-slate-600 font-bold">➔</div>
              <div className="p-3 rounded-xl bg-slate-900 border border-rose-500/30 flex-1">
                <div className="text-base mb-1">🛒</div>
                <div className="font-bold text-white">Consumer</div>
                <div className="text-[10px] text-rose-400">Pays 250-300%</div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <span className="text-rose-400 font-medium">⚠️ 40%–60% of retail price consumed by speculative intermediaries</span>
              <span className="text-amber-400 font-medium">⚠️ 20%–30% post-harvest transit losses due to uncoordinated logistics</span>
            </div>
          </div>

          {/* 5 Problem Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Limited Price Transparency</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Farmers lack direct terminal market visibility, accepting lowball prices while consumers face arbitrary retail markups.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Multiple Intermediaries</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                4 to 6 tiers of brokers and commission agents extract margin at every step without contributing real value or freshness.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Logistics Challenges</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unorganized rural freight, empty return journeys, and lack of real-time route optimization cause high transit waste.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Limited Market Reach</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Smallholder farmers remain confined to mandis within a 15km radius, missing out on higher urban and commercial demand.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Lack of Demand Insights</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cultivation and harvest decisions occur without actionable predictive insights, resulting in recurring glut and price crashes.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. AGROBRIDGE SOLUTION SECTION */}
      {/* ========================================================================= */}
      <section id="solution" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              The AgroBridge Solution
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              One Unified Agricultural Ecosystem
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              AgroBridge directly bridges rural producers with urban consumers and bulk commercial purchasers, coordinated by algorithmic dispatch and transparent pricing.
            </p>
          </div>

          {/* Direct Ecosystem Solution Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center">
              
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-emerald-500/40 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl font-bold">
                  👨‍🌾
                </div>
                <h3 className="text-lg font-bold text-white">Direct Farmer / FPO</h3>
                <p className="text-xs text-slate-400">
                  Sets MSP floor price, verifies crop freshness via AI, and retains 75–80% of final consumer realization.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/90 border border-teal-500/40 space-y-3 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-teal-500 text-slate-950 font-black text-[10px] tracking-wider uppercase">
                  Zero Intermediaries
                </div>
                <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto text-2xl font-bold">
                  🌱
                </div>
                <h3 className="text-lg font-bold text-white">AgroBridge Platform</h3>
                <p className="text-xs text-slate-400">
                  Real-time price comparison, smart driver assignment, and escrow payment protection for both parties.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950/80 border border-cyan-500/40 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto text-2xl font-bold">
                  🛒
                </div>
                <h3 className="text-lg font-bold text-white">Consumer & Bulk Buyer</h3>
                <p className="text-xs text-slate-400">
                  Enjoys 15–25% savings over supermarket prices, verified Grade A harvests, and doorstep GPS tracking.
                </p>
              </div>

            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs">
              <div className="text-slate-300 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Direct Farmer Realization: 75–80%</span>
              </div>
              <div className="text-slate-300 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Consumer Grocery Savings: 20–25%</span>
              </div>
              <div className="text-slate-300 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Logistics Transit Spoilage: &lt; 4%</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. HOW IT WORKS (7 STEPS) */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 bg-slate-900/30 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-400 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
              End-to-End Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              How AgroBridge Works
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              A 7-step transparent, verifiable lifecycle from farm harvest to consumer doorstep.
            </p>
          </div>

          {/* 7 Visual Step Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative group hover:border-emerald-500/50 transition-all">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/30">
                1
              </div>
              <div className="text-2xl">🌱</div>
              <h3 className="text-xs font-bold text-white">Farmer Lists Produce</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Farmer uploads photo, quantity, harvest date, and baseline price with AI quality grading.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative group hover:border-emerald-500/50 transition-all">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/30">
                2
              </div>
              <div className="text-2xl">🔍</div>
              <h3 className="text-xs font-bold text-white">Consumer Discovers</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Consumers search fresh hyperlocal harvests filtered by farm distance and verified quality.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative group hover:border-teal-500/50 transition-all">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 font-black text-xs flex items-center justify-center border border-teal-500/30">
                3
              </div>
              <div className="text-2xl">📊</div>
              <h3 className="text-xs font-bold text-white">Price Transparency</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Live side-by-side comparison reveals mandi benchmark, direct farm rate, and net savings.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative group hover:border-teal-500/50 transition-all">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 font-black text-xs flex items-center justify-center border border-teal-500/30">
                4
              </div>
              <div className="text-2xl">🔒</div>
              <h3 className="text-xs font-bold text-white">Secure Order Flow</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Payment enters simulated escrow vault, safeguarding funds until verified delivery.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative group hover:border-amber-500/50 transition-all">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center border border-amber-500/30">
                5
              </div>
              <div className="text-2xl">🤖</div>
              <h3 className="text-xs font-bold text-white">Smart Logistics</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                AI dispatches the optimal nearby driver and generates a fuel-optimized waypoint sequence.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative group hover:border-amber-500/50 transition-all">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center border border-amber-500/30">
                6
              </div>
              <div className="text-2xl">🗺️</div>
              <h3 className="text-xs font-bold text-white">Delivery Tracking</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Live 3-point telemetry shows Farm pickup, transit vehicle movement, and consumer dropoff.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative group hover:border-cyan-500/50 transition-all">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-black text-xs flex items-center justify-center border border-cyan-500/30">
                7
              </div>
              <div className="text-2xl">✅</div>
              <h3 className="text-xs font-bold text-white">Successful Delivery</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Consumer verifies cargo with OTP; escrow auto-disburses instant payout to the farmer.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FEATURES SECTION (8 FEATURE CARDS) */}
      {/* ========================================================================= */}
      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Platform Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Core Platform Capabilities
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Engineered with advanced algorithms, geospatial routing, and transparent e-commerce standards for Indian agriculture.
            </p>
          </div>

          {/* 8 Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Direct Farmer Marketplace</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Eliminates speculative middlemen, letting individual farmers and FPOs sell directly to consumers and bulk institutions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">AI-Assisted Demand Insights</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                14-day price and demand projections advising farmers when to harvest and sell to capture maximum market value.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Smart Price Comparison</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant side-by-side comparison of direct farm rates against local APMC mandis and retail grocery benchmarks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Smart Driver Assignment</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated multi-criteria dispatch matching nearest rural drivers based on cargo capacity and route proximity.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Navigation className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Map-Based Logistics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Integrated OpenStreetMap and Leaflet routing computing shortest road paths and cutting fuel waste by 33%.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Nearby Products Discovery</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Geolocated sorting prioritizing crops harvested within your district, guaranteeing maximum peak freshness.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Transparent Pricing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Itemized cost breakdown displaying exact farmer payout, logistics fee, and platform operational charges.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Live Order Tracking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time 5-stage order status updates, vehicle speed telemetry, and dynamic ETA predictions for every delivery.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. AI SECTION (AI-ASSISTED AGRICULTURE & LIVE CHART) */}
      {/* ========================================================================= */}
      <section id="ai-technology" className="py-20 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Algorithmic Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              🤖 AI-Assisted Agriculture
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Intelligent algorithmic decision support designed to advise—not replace—human judgment across the agricultural chain.
            </p>
            <div className="inline-block text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Advisory Decision Support • Grounded in Empirical Market Feed Data
            </div>
          </div>

          {/* 4 AI Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                📈
              </div>
              <h3 className="text-sm font-bold text-white">Demand Forecasting</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates historical mandis inflow, local consumption velocity, and seasonal seasonality patterns.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
                💰
              </div>
              <h3 className="text-sm font-bold text-white">Price Recommendation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generates optimal price bands protecting farmer minimum safe price (MSP) while remaining competitive.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                🚚
              </div>
              <h3 className="text-sm font-bold text-white">Smart Driver Selection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Multi-factor matching optimizing transit proximity, vehicle load rating, and driver availability score.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                ⚡
              </div>
              <h3 className="text-sm font-bold text-white">Smart Actionable Insights</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated waste risk alerts (e.g. unsold produce discounts) and optimal bulk buyer match recommendations.
              </p>
            </div>

          </div>

          {/* Interactive Live Chart Embed on Landing Page */}
          <div className="pt-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white">Live Future Market & Demand Graph</h3>
              <p className="text-xs text-slate-400">Interactive preview of AI-Assisted trend modeling for both Farmers and Consumers.</p>
            </div>
            <div className="rounded-3xl bg-slate-950 border border-slate-800 p-4 sm:p-6 shadow-2xl">
              <FutureInsightsChart initialRole="farmer" compact={false} showHeader={true} />
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. MAP & LOGISTICS SECTION */}
      {/* ========================================================================= */}
      <section id="logistics" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              Geospatial Operations
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              🗺️ Smart Logistics, Powered by Location
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Dynamic rural-to-urban route orchestration reducing transport friction and transit delays.
            </p>
          </div>

          {/* 4-Step Logistics Workflow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 1</div>
              <h3 className="text-sm font-bold text-white">Farm Gate Pickup</h3>
              <p className="text-xs text-slate-400">
                Driver arrives at verified farm coordinates. Farmer confirms load via secure 4-digit pickup OTP.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 2</div>
              <h3 className="text-sm font-bold text-white">Smart Assignment</h3>
              <p className="text-xs text-slate-400">
                Automated matching factors in return hauls to eliminate deadhead mileage for rural fleet partners.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 3</div>
              <h3 className="text-sm font-bold text-white">Optimized Route</h3>
              <p className="text-xs text-slate-400">
                OpenStreetMap algorithm compresses transit distances (18 km ➔ 12 km), shaving 15+ minutes off deliveries.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 4</div>
              <h3 className="text-sm font-bold text-white">Doorstep Dropoff</h3>
              <p className="text-xs text-slate-400">
                Consumer verifies fresh produce condition and provides delivery OTP to complete escrow disbursement.
              </p>
            </div>

          </div>

          {/* Logistics Feature Checklist */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>3-Point Live Telemetry (Farm, Driver, Consumer)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Turn-by-Turn Leaflet Route Waypoints</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dual-Gate Cryptographic OTP Validation</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Real-Time Speed & Traffic ETA Calculations</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. ROLE SECTION (5 CARDS WITH CONTINUE BUTTONS) */}
      {/* ========================================================================= */}
      <section id="roles" className="py-20 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Tailored Portals
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Designed for Every Agricultural Stakeholder
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Specialized dashboards engineered for the distinct operational workflows of all 5 platform roles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {roleLogins.map(role => (
              <div 
                key={role.role}
                className="p-6 rounded-3xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex flex-col justify-between transition-all"
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
                  <ul className="space-y-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                    {role.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => onNavigate(role.route)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 ${role.btnBg}`}
                  >
                    <span>Continue as {role.title}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. LOGIN SECTION (CHOOSE YOUR ROLE) */}
      {/* ========================================================================= */}
      <section id="login" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Role Authentication
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Choose Your Role
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Select your role below to access your dedicated dashboard and authenticated tools.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {roleLogins.map(role => (
              <div
                key={`login-${role.role}`}
                className={`group relative rounded-3xl bg-slate-900/70 border border-slate-800 p-6 flex flex-col justify-between transition-all duration-300 ${role.glow}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl group-hover:scale-110 transition-transform">{role.emoji}</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${role.accent} bg-slate-950 border border-slate-800`}>
                      {role.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white">{role.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{role.tagline}</p>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => onNavigate(role.route)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 ${role.btnBg}`}
                  >
                    <span>{role.btnText}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Demo Mode Credentials Notice */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 max-w-2xl mx-auto text-center space-y-1 text-xs text-slate-400">
            <div className="font-bold text-slate-300 flex items-center justify-center gap-1.5">
              <span>🔑</span> SIH Hackathon Evaluation Credentials
            </div>
            <p>
              Pre-seeded accounts are active for all 5 roles with default demo password: <code className="text-emerald-400 bg-slate-950 px-2 py-0.5 rounded font-mono font-bold">Demo@123</code>
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. WHY AGROBRIDGE IS DIFFERENT (8 DIMENSIONS) */}
      {/* ========================================================================= */}
      <section id="why-agrobridge" className="py-20 bg-slate-900/30 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-400 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
              Comparative Advantage
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Why AgroBridge Is Different
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              A comprehensive dimensional comparison against conventional channels and typical digital storefronts.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-4 sm:p-5">Dimension</th>
                    <th className="p-4 sm:p-5 text-rose-400">Traditional Mandi Supply Chain</th>
                    <th className="p-4 sm:p-5 text-amber-400">Typical Online Marketplace</th>
                    <th className="p-4 sm:p-5 text-emerald-400 bg-emerald-500/5">AgroBridge Platform</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  
                  <tr className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-white">1. Direct Producer Access</td>
                    <td className="p-4 sm:p-5 text-slate-400">No (Blocked by commission agents)</td>
                    <td className="p-4 sm:p-5 text-slate-400">Rare (Third-party resellers & aggregators)</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-emerald-500/5">✓ 100% Direct Farm-Gate Sourcing</td>
                  </tr>

                  <tr className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-white">2. Price Transparency</td>
                    <td className="p-4 sm:p-5 text-slate-400">Opaque (Undisclosed cuts & commissions)</td>
                    <td className="p-4 sm:p-5 text-slate-400">Fixed Retail (Hidden platform margin)</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-emerald-500/5">✓ Real-time Mandi vs Farm Side-by-Side</td>
                  </tr>

                  <tr className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-white">3. Intermediary Layers</td>
                    <td className="p-4 sm:p-5 text-rose-400">4 to 6 Speculative Middlemen</td>
                    <td className="p-4 sm:p-5 text-amber-400">Warehouses, Dark Stores & Aggregators</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-emerald-500/5">✓ Zero Middlemen (Point-to-Point)</td>
                  </tr>

                  <tr className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-white">4. Quality Verification</td>
                    <td className="p-4 sm:p-5 text-slate-400">Unstandardized manual inspection</td>
                    <td className="p-4 sm:p-5 text-slate-400">Generic marketing claims</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-emerald-500/5">✓ AgroBridge Assured 4-Pillar Certification</td>
                  </tr>

                  <tr className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-white">5. Smart Route Optimization</td>
                    <td className="p-4 sm:p-5 text-slate-400">Static, uncoordinated hauling</td>
                    <td className="p-4 sm:p-5 text-slate-400">Standard hub-and-spoke delivery</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-emerald-500/5">✓ AI Waypoints Saving 33% Mileage</td>
                  </tr>

                  <tr className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-white">6. AI Price Intelligence</td>
                    <td className="p-4 sm:p-5 text-slate-400">None (Farmers take distress prices)</td>
                    <td className="p-4 sm:p-5 text-slate-400">Surge algorithms favoring platform</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-emerald-500/5">✓ 14-Day Demand & MSP Forecasting</td>
                  </tr>

                  <tr className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-white">7. Dual-OTP Escrow Security</td>
                    <td className="p-4 sm:p-5 text-slate-400">Informal credit, delayed 30-60 days</td>
                    <td className="p-4 sm:p-5 text-slate-400">Standard centralized merchant vault</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-emerald-500/5">✓ Dual OTP (Pickup + Dropoff Payout)</td>
                  </tr>

                  <tr className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-white">8. Stakeholder Inclusivity</td>
                    <td className="p-4 sm:p-5 text-slate-400">Fragmented, distrustful interactions</td>
                    <td className="p-4 sm:p-5 text-slate-400">Consumer-only centric design</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-emerald-500/5">✓ 5 Unified Portals (Farmer, Buyer, Driver, Admin)</td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 12. UNIQUE VALUE PROPOSITION (6 PILLARS) */}
      {/* ========================================================================= */}
      <section id="uvp" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Core Value Pillars
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Our 6 Core Value Pillars
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Foundational principles driving real economic and operational transformation for Indian agriculture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg">
                🤝
              </div>
              <h3 className="text-base font-bold text-white">1. Direct Connection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct economic relationship between primary agricultural producers and terminal buyers, dismantling exploitative commission chains.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-lg">
                🤖
              </div>
              <h3 className="text-base font-bold text-white">2. AI-Assisted Decision Support</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Data-driven crop valuation and demand forecasting empowering smallholders with commercial intelligence previously reserved for corporate agribusiness.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-lg">
                💰
              </div>
              <h3 className="text-base font-bold text-white">3. Price Transparency</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clear visibility into mandi benchmark indices, ensuring fair farm realizations and genuine cost savings for households and businesses.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg">
                🚚
              </div>
              <h3 className="text-base font-bold text-white">4. Smart Logistics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                On-demand rural fleet matching reducing food miles, turnaround delays, and perishable spoilage through algorithmic route compaction.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-lg">
                📍
              </div>
              <h3 className="text-base font-bold text-white">5. Location-Aware Commerce</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hyperlocal harvest discovery powered by OpenStreetMap coordinates, boosting regional food security and community economic resilience.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-lg">
                🛡️
              </div>
              <h3 className="text-base font-bold text-white">6. End-to-End Ecosystem</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complete lifecycle governance from seed to harvest listing, escrow payments, verified feedback, and administrative dispute resolution.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 13. COMPARISON SECTION (AGROBRIDGE VS SOLUTIONS) */}
      {/* ========================================================================= */}
      <section id="comparison" className="py-20 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-400 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
              Market Benchmarking
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Comparative Solution Analysis
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              How AgroBridge stacks up against general solution categories in the agritech and retail ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Category 1: Traditional APMC */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-rose-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Legacy Channel</span>
                <span className="text-xs text-slate-400">APMC Mandi</span>
              </div>
              <h3 className="text-lg font-bold text-white">Conventional APMC Mandi System</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Physical wholesale auction markets dependent on licensed commission agents (arhtiyas), physical weighments, and multiple transport steps.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Farmer Realization:</span>
                  <span className="font-bold text-rose-400">30% – 35%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Middlemen Tiers:</span>
                  <span className="font-bold text-rose-400">4 – 6 Layers</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Transit Time:</span>
                  <span className="font-bold text-slate-400">36 – 48 Hours</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Price Transparency:</span>
                  <span className="font-bold text-rose-400">Opaque</span>
                </div>
              </div>
            </div>

            {/* Category 2: Generic E-Commerce */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Digital Retail</span>
                <span className="text-xs text-slate-400">Online Grocery</span>
              </div>
              <h3 className="text-lg font-bold text-white">Typical Online Grocery Platforms</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Centralized dark-store aggregators that purchase from wholesale consolidators and resell to consumers at marked-up prices.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Farmer Realization:</span>
                  <span className="font-bold text-amber-400">40% – 45%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Middlemen Tiers:</span>
                  <span className="font-bold text-amber-400">Aggregators & Hubs</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Transit Time:</span>
                  <span className="font-bold text-slate-400">24 – 36 Hours</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Price Transparency:</span>
                  <span className="font-bold text-amber-400">Moderate</span>
                </div>
              </div>
            </div>

            {/* Category 3: AgroBridge */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-emerald-500/50 space-y-4 relative shadow-xl shadow-emerald-500/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">SIH Solution</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">AgroBridge</span>
              </div>
              <h3 className="text-lg font-bold text-white">AgroBridge Smart AgriTech</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct peer-to-peer agricultural marketplace integrating AI price intelligence, verified crop quality, and 3-point GPS delivery routing.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Farmer Realization:</span>
                  <span className="font-bold text-emerald-400">75% – 80%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Middlemen Tiers:</span>
                  <span className="font-bold text-emerald-400">Zero (Direct)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Transit Time:</span>
                  <span className="font-bold text-emerald-400">4 – 8 Hours (Same Day)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Price Transparency:</span>
                  <span className="font-bold text-emerald-400">100% Itemized</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 14. PROJECT ARCHITECTURE FLOWCHART */}
      {/* ========================================================================= */}
      <section id="architecture" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              System Engineering
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Platform System Architecture
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              High-performance, modular full-stack engineering powering real-time agricultural operations.
            </p>
          </div>

          {/* Architecture Flowchart Diagram */}
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center text-center text-xs">
              
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2">
                <div className="text-xl">💻</div>
                <div className="font-bold text-white">Frontend Client</div>
                <div className="text-[11px] text-emerald-400">React 18 + Tailwind</div>
                <p className="text-[10px] text-slate-400">Responsive SPAs for all 5 roles, Recharts & Leaflet</p>
              </div>

              <div className="text-slate-500 font-mono text-sm hidden md:block">
                ➔ REST / JSON ➔
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-teal-500/30 space-y-2">
                <div className="text-xl">⚙️</div>
                <div className="font-bold text-white">Backend Server</div>
                <div className="text-[11px] text-teal-400">Node.js + Express 4</div>
                <p className="text-[10px] text-slate-400">JWT Authentication, RBAC, Escrow state engine</p>
              </div>

              <div className="text-slate-500 font-mono text-sm hidden md:block">
                ➔ Queries & Feeds ➔
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-2">
                <div className="text-xl">🗄️</div>
                <div className="font-bold text-white">Persistence Store</div>
                <div className="text-[11px] text-cyan-400">MongoDB / Mongoose</div>
                <p className="text-[10px] text-slate-400">Role models, listings, orders, feedback & telemetry</p>
              </div>

            </div>

            <div className="pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <Cpu className="w-4 h-4" />
                  <span>AI & Machine Learning Engine (Python / FastAPI)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Time-series forecasting for 14-day price projections, MCDA deal matching algorithm, and computer vision quality inspection pipelines.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-2">
                <div className="flex items-center gap-2 font-bold text-indigo-400">
                  <Navigation className="w-4 h-4" />
                  <span>Geospatial Mapping & Routing Engine (OSRM / Leaflet)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  OpenStreetMap road network ingestion, waypoint path compaction, proximity driver dispatch, and 3-point live delivery telemetry.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 15. TECHNOLOGY STACK SECTION */}
      {/* ========================================================================= */}
      <section id="technology" className="py-20 bg-slate-900/30 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              Stack Specifications
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Technology Stack
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Engineered with proven, modern, and open-source frameworks for maximum reliability and scalability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                <Layers className="w-4 h-4" />
                <span>Frontend Client</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>• <strong>React 18.3</strong> with Vite 5.3 bundler</li>
                <li>• <strong>Tailwind CSS 3.4</strong> modern design system</li>
                <li>• <strong>Lucide React</strong> accessible icons</li>
                <li>• <strong>Recharts 3.10</strong> interactive trend analytics</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 font-bold text-teal-400 text-sm">
                <Cpu className="w-4 h-4" />
                <span>Backend & Security</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>• <strong>Node.js & Express 4.19</strong> REST API</li>
                <li>• <strong>JSON Web Tokens (JWT)</strong> authentication</li>
                <li>• <strong>Bcrypt.js</strong> cryptographic password hashing</li>
                <li>• <strong>Role-Based Access Control (RBAC)</strong> guards</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 font-bold text-cyan-400 text-sm">
                <BarChart3 className="w-4 h-4" />
                <span>Data & Persistence</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>• <strong>MongoDB & Mongoose 8.5</strong> document store</li>
                <li>• In-memory high-speed seed fallback for demo</li>
                <li>• ACID transaction simulation for escrow payouts</li>
                <li>• Fast indexing on coordinates & product tags</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>AI & Analytics</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>• <strong>Python & FastAPI</strong> microservice layer</li>
                <li>• <strong>Scikit-Learn</strong> time-series prediction models</li>
                <li>• <strong>MCDA Algorithm</strong> 9-factor supplier deal matching</li>
                <li>• Computer vision freshness & quality scoring</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 font-bold text-indigo-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Geospatial Mapping</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>• <strong>Leaflet 1.9</strong> interactive map canvas</li>
                <li>• <strong>OpenStreetMap</strong> global tile layers</li>
                <li>• <strong>Nominatim</strong> reverse-geocoding API</li>
                <li>• OSRM-compatible turn-by-turn road geometry</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 font-bold text-purple-400 text-sm">
                <Shield className="w-4 h-4" />
                <span>Ecosystem Governance</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>• Dual-gate OTP cargo handover verification</li>
                <li>• Verified purchaser review & feedback limits</li>
                <li>• Admin sanction toggles (Warn, Unlist, Suspend)</li>
                <li>• 3-stage consumer complaint resolution workflow</li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 16. IMPACT SECTION (6 IMPACT DIMENSIONS) */}
      {/* ========================================================================= */}
      <section id="impact" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Socio-Economic Value
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Tangible Agricultural & Social Impact
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Measurable benefits delivered across the agricultural value chain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xl">📱</div>
              <h3 className="text-sm font-bold text-white">1. Digital Access for Smallholders</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connects marginal farmers with direct digital markets, eliminating their total dependency on local cartel brokers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xl">⚖️</div>
              <h3 className="text-sm font-bold text-white">2. Transparent Pricing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ensures fair remuneration aligned with real market values and prevents arbitrary commission deductions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xl">🧠</div>
              <h3 className="text-sm font-bold text-white">3. Data-Assisted Farm Decisions</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enables informed harvesting, reducing distress dumping and optimizing crop revenue through forecast models.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xl">🚚</div>
              <h3 className="text-sm font-bold text-white">4. Smarter Rural Logistics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reduces food wastage and transportation costs through consolidated point-to-point route optimization.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xl">🥗</div>
              <h3 className="text-sm font-bold text-white">5. Easier Fresh Discovery</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provides consumers and bulk buyers with high-quality, traceable agricultural produce at competitive prices.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xl">🌐</div>
              <h3 className="text-sm font-bold text-white">6. Location-Based Commerce</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Shortens supply chains and promotes local agricultural economies through geospatial demand-supply matching.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 17. REFERENCES & DATA SOURCES SECTION */}
      {/* ========================================================================= */}
      <section id="references" className="py-20 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-400 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
              Foundations & Research
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Academic References & Data Standards
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              AgroBridge is conceptualized and built adhering to official guidelines, research literature, and open geospatial standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Smart India Hackathon (SIH26033)</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Problem Statement SIH26033: AI-powered direct agricultural marketplace bridging farmers, consumers, and bulk buyers with smart logistics.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-teal-400" />
                <span>Agmarknet & e-NAM (Govt of India)</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                National agricultural market price standards and commodity classification references. <em>(Future direct API integration planned)</em>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-cyan-400" />
                <span>ICAR Agricultural Research</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Post-harvest loss mitigation protocols and shelf-life metrics for perishable horticulture crops across Central Indian districts.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>OpenStreetMap & Leaflet GIS</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Open-access geospatial road cartography and Nominatim API for geocoding coordinates across Madhya Pradesh clusters.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span>Python & FastAPI ML Ecosystem</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Statistical regression and Multi-Criteria Decision Analysis (MCDA) mathematical foundations for multi-variable supplier scoring.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>W3C & React Architecture Standards</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Component modularity, Web Content Accessibility Guidelines (WCAG), and responsive layout standards for high rural usability.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 18. PROTOTYPE & EVALUATION DISCLAIMER SECTION */}
      {/* ========================================================================= */}
      <section id="disclaimer" className="py-12 bg-slate-950 border-b border-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Prototype & Demonstration Notice</span>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl mx-auto leading-relaxed">
              AgroBridge is an original software demonstration prototype engineered for evaluation under the Smart India Hackathon. All simulated datasets, price indices, and algorithmic recommendations are provided for educational and evaluation purposes. Future integrations with national agricultural databases (e.g., e-NAM, Agmarknet) and third-party logistics APIs are planned for production deployment.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 19. CALL TO ACTION SECTION */}
      {/* ========================================================================= */}
      <section id="cta" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
            <Sprout className="w-8 h-8 text-slate-950" />
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to Experience a Smarter Agricultural Marketplace?
            </h2>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Join progressive farmers, conscious consumers, and commercial buyers transforming the future of Indian agriculture.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('/consumer/login')}
              className="w-full sm:w-auto px-8 py-4 text-sm font-black text-slate-950 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:brightness-110 rounded-2xl shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Consumer Marketplace</span>
              <ShoppingCart className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('/farmer/login')}
              className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Register as a Farmer</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={() => scrollToSection('login')}
              className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-2xl shadow-sm transition-all"
            >
              View All 5 Portals
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 20. FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-900 bg-slate-950 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Sprout className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <span className="text-xl font-black text-white">AgroBridge</span>
                  <p className="text-xs text-emerald-400 font-medium">Smart India Hackathon Prototype (SIH26033)</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Connecting Farmers. Consumers. Technology. An AI-powered direct agricultural marketplace streamlining supply chains, ensuring fair farm realizations, and reducing post-harvest losses.
              </p>
              <div className="text-xs text-slate-500">
                Built with precision for Smart India Hackathon Problem Statement SIH26033.
              </div>
            </div>

            {/* Platform Links */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Platform</h4>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => scrollToSection('hero')} className="hover:text-emerald-400 transition-colors">Home</button></li>
                <li><button onClick={() => scrollToSection('problem')} className="hover:text-emerald-400 transition-colors">About Us</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-emerald-400 transition-colors">How It Works</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-emerald-400 transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('why-agrobridge')} className="hover:text-emerald-400 transition-colors">Why AgroBridge</button></li>
                <li><button onClick={() => scrollToSection('comparison')} className="hover:text-emerald-400 transition-colors">Comparison</button></li>
              </ul>
            </div>

            {/* 5 Portals */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">5 Dedicated Portals</h4>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => onNavigate('/farmer/login')} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><span>👨‍🌾</span> Farmer Portal</button></li>
                <li><button onClick={() => onNavigate('/consumer/login')} className="hover:text-teal-400 transition-colors flex items-center gap-1.5"><span>🛒</span> Consumer Market</button></li>
                <li><button onClick={() => onNavigate('/bulk-buyer/login')} className="hover:text-indigo-400 transition-colors flex items-center gap-1.5"><span>🏢</span> Bulk Buyer Desk</button></li>
                <li><button onClick={() => onNavigate('/driver/login')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5"><span>🚚</span> Driver Fleet</button></li>
                <li><button onClick={() => onNavigate('/admin/login')} className="hover:text-violet-400 transition-colors flex items-center gap-1.5"><span>👨‍💼</span> Admin APMC</button></li>
              </ul>
            </div>

            {/* Technology & Standards */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Technology</h4>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => scrollToSection('architecture')} className="hover:text-emerald-400 transition-colors">System Architecture</button></li>
                <li><button onClick={() => scrollToSection('ai-technology')} className="hover:text-emerald-400 transition-colors">AI Forecasting</button></li>
                <li><button onClick={() => scrollToSection('logistics')} className="hover:text-emerald-400 transition-colors">OpenStreetMap GIS</button></li>
                <li><button onClick={() => scrollToSection('references')} className="hover:text-emerald-400 transition-colors">Data Standards</button></li>
                <li><button onClick={() => scrollToSection('disclaimer')} className="hover:text-emerald-400 transition-colors">Prototype Notice</button></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center">
            <div>© 2026 AgroBridge Platform. All rights reserved.</div>
            <div className="text-emerald-400 font-medium">Connecting Farmers. Consumers. Technology.</div>
            <div>Problem Statement SIH26033 Prototype</div>
          </div>

        </div>
      </footer>

    </div>
  );
}
