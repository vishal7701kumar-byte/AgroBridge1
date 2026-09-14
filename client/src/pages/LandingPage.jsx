import React, { useState } from 'react';
import FutureInsightsChart from '../components/FutureInsightsChart';
import { 
  Sprout, ArrowRight, ShieldCheck, MapPin, Truck, TrendingUp, 
  Sparkles, DollarSign, CheckCircle2, ChevronRight, Menu, X, 
  Users, ShoppingCart, Lock, Cpu, BarChart3, Clock, AlertTriangle, 
  Store, Building2, UserCheck, Shield, ChevronDown, Check, ArrowDown
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
      tagline: 'Manage your farm and sell your products.',
      emoji: '👨‍🌾',
      route: '/farmer/login',
      btnText: 'LOGIN AS FARMER',
      badge: 'Direct Producer',
      glow: 'hover:border-emerald-500/60 hover:shadow-emerald-500/10',
      accent: 'text-emerald-400',
      btnBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black',
      features: ['List Crop Harvests', 'Manage Incoming Orders', 'AI Demand Forecasting', 'Smart Price Advisory']
    },
    {
      role: 'CONSUMER',
      title: 'Consumer',
      tagline: 'Shop fresh products directly from farmers.',
      emoji: '🛒',
      route: '/consumer/login',
      btnText: 'LOGIN AS CONSUMER',
      badge: 'Farm-to-Table',
      glow: 'hover:border-teal-500/60 hover:shadow-teal-500/10',
      accent: 'text-teal-400',
      btnBg: 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-black',
      features: ['Browse Fresh Harvests', 'Compare Market Prices', 'Quick-Commerce Cart', 'Live GPS Tracking']
    },
    {
      role: 'BULK_BUYER',
      title: 'Bulk Buyer',
      tagline: 'Purchase agricultural products in bulk.',
      emoji: '🏢',
      route: '/bulk-buyer/login',
      btnText: 'LOGIN AS BULK BUYER',
      badge: 'Commercial / B2B',
      glow: 'hover:border-indigo-500/60 hover:shadow-indigo-500/10',
      accent: 'text-indigo-400',
      btnBg: 'bg-indigo-500 hover:bg-indigo-400 text-white font-black',
      features: ['Post Commercial RFQs', 'Wholesale Contracts', 'Direct Farm Discovery', 'Bulk Fleet Delivery']
    },
    {
      role: 'DRIVER',
      title: 'Driver Partner',
      tagline: 'Manage deliveries and earn with AgroBridge.',
      emoji: '🚚',
      route: '/driver/login',
      btnText: 'LOGIN AS DRIVER',
      badge: 'Rural Logistics',
      glow: 'hover:border-amber-500/60 hover:shadow-amber-500/10',
      accent: 'text-amber-400',
      btnBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black',
      features: ['Smart Route Dispatch', 'Farm Gate OTP Pickup', 'Doorstep Verification', 'Instant Escrow Payout']
    },
    {
      role: 'ADMIN',
      title: 'Admin / APMC',
      tagline: 'Manage and monitor the AgroBridge platform.',
      emoji: '👨‍💼',
      route: '/admin/login',
      btnText: 'ADMIN LOGIN',
      badge: 'System Governance',
      glow: 'hover:border-violet-500/60 hover:shadow-violet-500/10',
      accent: 'text-violet-400',
      btnBg: 'bg-violet-500 hover:bg-violet-400 text-white font-black',
      features: ['Central Operations Audit', '5-Role Directory Management', 'Platform Telemetry', 'Dispute Resolution']
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden font-sans">

      {/* ========================================================================= */}
      {/* 1. STICKY NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Tagline */}
          <div 
            onClick={() => scrollToSection('home')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  AGROBRIDGE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Direct
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium tracking-wide">From Farm to Home</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {[
              { label: 'Home', id: 'home' },
              { label: 'About', id: 'about' },
              { label: 'How It Works', id: 'how-it-works' },
              { label: 'Features', id: 'features' },
              { label: 'AI Technology', id: 'ai-technology' },
              { label: 'Price Transparency', id: 'price-transparency' },
              { label: 'Contact', id: 'contact' }
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

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => scrollToSection('login')}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl shadow-sm transition-all"
            >
              Login
            </button>
            <button
              onClick={() => scrollToSection('login')}
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
              { label: 'Home', id: 'home' },
              { label: 'About', id: 'about' },
              { label: 'How It Works', id: 'how-it-works' },
              { label: 'Features', id: 'features' },
              { label: 'AI Technology', id: 'ai-technology' },
              { label: 'Price Transparency', id: 'price-transparency' },
              { label: 'Contact', id: 'contact' }
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
                onClick={() => scrollToSection('login')}
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
      <section id="home" className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Highlight Badges */}
              <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2 p-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-xs shadow-inner">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                  <span>🌾</span> Direct Farmers
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 font-bold border border-teal-500/30">
                  <span>💰</span> Fair Prices
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                  <span>🚚</span> Smart Delivery
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Fresh From Farmers.{' '}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Directly To Your Home.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                AgroBridge connects farmers directly with consumers using <strong>AI-powered insights</strong>, 
                <strong>transparent pricing</strong>, and <strong>smart logistics</strong>. Bypassing unnecessary 
                middlemen so farmers earn more and consumers pay less.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onNavigate('/consumer/login')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                >
                  <Sprout className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>Explore Marketplace</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection('login')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Login to AgroBridge</span>
                </button>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl font-black text-emerald-400">88%</div>
                  <div className="text-[11px] text-slate-400 font-medium">Direct to Farmer</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-teal-400">22%+</div>
                  <div className="text-[11px] text-slate-400 font-medium">Consumer Savings</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-amber-400">15-30m</div>
                  <div className="text-[11px] text-slate-400 font-medium">Smart Dispatch</div>
                </div>
              </div>

            </div>

            {/* Right Agri-Tech Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-emerald-500/30 p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5">
                
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Live Agri-Logistics Engine</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Bhopal Cluster
                  </span>
                </div>

                {/* 3-Point Network Card */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🌾</span>
                      <div>
                        <div className="font-bold text-white">Patel Organic Farms</div>
                        <div className="text-[10px] text-slate-400">Berasia Road Cluster (Origin)</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      Harvested 6:30 AM
                    </span>
                  </div>

                  <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 via-amber-400 to-teal-400 my-1 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900 border border-amber-400 flex items-center justify-center text-[10px]">
                      🚚
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🏠</span>
                      <div>
                        <div className="font-bold text-white">Consumer Doorstep</div>
                        <div className="text-[10px] text-slate-400">Arera Colony, Bhopal</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md">
                      ETA: 18 mins
                    </span>
                  </div>
                </div>

                {/* Live Value Proposition Meter */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/20">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">AgroBridge Price</div>
                    <div className="text-lg font-black text-emerald-400">₹25 <span className="text-xs text-slate-400">/kg</span></div>
                    <div className="text-[10px] text-emerald-300/80">Direct from Farmer</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Retail Mandi Ref</div>
                    <div className="text-lg font-black text-slate-400 line-through">₹32 <span className="text-xs text-slate-500">/kg</span></div>
                    <div className="text-[10px] text-emerald-400 font-bold">You Save ₹7/kg (22%)</div>
                  </div>
                </div>

                {/* AI-Assisted Guarantee */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>AI-Assisted Dispatch & Escrow Payment Protection Enabled</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PROBLEM SECTION */}
      {/* ========================================================================= */}
      <section id="about" className="py-20 bg-slate-900/50 border-t border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Current Market Inefficiency</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              The Problem We Are Solving
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Multiple intermediaries in the traditional agricultural supply chain reduce farmer earnings
              and significantly increase the final price paid by consumers.
            </p>
          </div>

          {/* Visual Traditional Flow */}
          <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 text-center">
              Traditional Multi-Tier Agricultural Intermediary Chain
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
              {[
                { emoji: '👨‍🌾', label: 'Farmer', note: 'Receives ~30-35% value' },
                { emoji: '🤝', label: 'Commission Agent', note: 'Mandi fee + commission' },
                { emoji: '🏢', label: 'Wholesaler', note: 'Storage markup + transit' },
                { emoji: '🏪', label: 'Retailer', note: 'High shelf margin' },
                { emoji: '🛒', label: 'Consumer', note: 'Pays inflated prices' }
              ].map((step, idx) => (
                <div key={idx} className="relative flex flex-col items-center text-center p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="text-3xl mb-2">{step.emoji}</div>
                  <div className="text-sm font-bold text-white">{step.label}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{step.note}</div>
                  {idx < 4 && (
                    <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-600 font-bold z-10">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 5 Problem Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Farmers May Receive Lower Returns',
                desc: 'Without direct market reach, smallholder farmers often receive less than a third of the ultimate retail consumer price.',
                icon: '❌',
                border: 'border-rose-500/30'
              },
              {
                title: 'Consumers May Pay Higher Prices',
                desc: 'Each layer of middleman, transportation handoff, and storage adds cost without adding fresh agricultural quality.',
                icon: '❌',
                border: 'border-rose-500/30'
              },
              {
                title: 'Limited Price Transparency',
                desc: 'Lack of verified benchmark data creates information asymmetry, leaving both farmers and buyers uncertain about fair value.',
                icon: '❌',
                border: 'border-rose-500/30'
              },
              {
                title: 'Inefficient Rural Logistics',
                desc: 'Unorganized transit leads to post-harvest damage, slow delivery, and perishable crop spoilage before reaching urban hubs.',
                icon: '❌',
                border: 'border-rose-500/30'
              },
              {
                title: 'Product Information May Be Unclear',
                desc: 'Shoppers rarely know which farm grew their food, when it was picked, or how fresh the produce actually is.',
                icon: '❌',
                border: 'border-rose-500/30'
              },
              {
                title: 'Broken Farmer-Consumer Direct Connect',
                desc: 'Traditional structures completely prevent producers and consumers from communicating, building trust, or establishing fair trade.',
                icon: '❌',
                border: 'border-rose-500/30'
              }
            ].map((prob, i) => (
              <div key={i} className={`p-6 rounded-2xl bg-slate-950 border ${prob.border} space-y-3`}>
                <div className="text-2xl">{prob.icon}</div>
                <h3 className="text-base font-bold text-white">{prob.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{prob.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. OUR SOLUTION SECTION */}
      {/* ========================================================================= */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Digital Disintermediation</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Introducing AgroBridge
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Connecting Farmers, Consumers and Smart Logistics on One Digital Platform.
            </p>
          </div>

          {/* Model Comparison Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            
            {/* Traditional Model */}
            <div className="p-7 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Traditional Model</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 font-bold border border-rose-500/30">
                  Multiple Intermediaries
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 py-6 text-sm font-bold text-slate-300">
                <span className="px-3 py-2 rounded-xl bg-slate-800">👨‍🌾 Farmer</span>
                <span className="text-rose-400 font-black">➔</span>
                <span className="px-3 py-2 rounded-xl bg-slate-800 text-rose-300 border border-rose-500/30">Middlemen (4+ Handoffs)</span>
                <span className="text-rose-400 font-black">➔</span>
                <span className="px-3 py-2 rounded-xl bg-slate-800">🛒 Consumer</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-2 border-t border-slate-800 pt-4">
                <li>• Farmers receive only ~30–35% of total consumer payment</li>
                <li>• Inflated prices due to compounded commission layers</li>
                <li>• Zero direct visibility on harvest provenance</li>
              </ul>
            </div>

            {/* AgroBridge Model */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-emerald-950/40 to-slate-900 border border-emerald-500/40 space-y-5 shadow-xl shadow-emerald-500/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">AgroBridge Direct Model</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                  Direct Disintermediation
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 py-6 text-sm font-bold text-white">
                <span className="px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">🌾 Farmer</span>
                <span className="text-emerald-400 font-black">➔</span>
                <span className="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20">🌐 AgroBridge AI</span>
                <span className="text-emerald-400 font-black">➔</span>
                <span className="px-3 py-2 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300">🛒 Consumer</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 border-t border-emerald-500/20 pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>88% Guaranteed Value</strong> goes straight to the Farmer</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>20-25% Potential Savings</strong> for Consumers vs retail markets</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>Smart Driver Routing</strong> for quick 15-30 min farm dispatch</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Solution Checklist Pillars */}
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-6 text-center">
              7 Built-in Platform Capabilities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold text-slate-200">
              {[
                'Direct Farmer-to-Consumer Marketplace',
                'Transparent Price Comparison',
                'AI-Assisted Demand Insights',
                'Smart Price Recommendations',
                'Smart Driver Assignment',
                'Location-Based Delivery',
                'Live Order Tracking'
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>NPCI Escrow Security</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. HOW IT WORKS SECTION */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 bg-slate-900/40 border-t border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <span>🔄</span> Step-by-Step Flow
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              How AgroBridge Works
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              A transparent, automated 7-step journey from rural farm harvest to your family doorstep.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: 'STEP 1',
                actor: '👨‍🌾 Farmer',
                action: 'Lists Products',
                desc: 'Uploads photos, sets direct price, specifies quantity & harvest location.',
                icon: '🌾'
              },
              {
                step: 'STEP 2',
                actor: '🛒 Consumer',
                action: 'Browses Fresh Products',
                desc: 'Filters by category, explores farm origins, and reviews harvest freshness.',
                icon: '🔍'
              },
              {
                step: 'STEP 3',
                actor: '💰 Price Comparison',
                action: 'Compares Prices',
                desc: 'Views transparent comparison vs local retail benchmarks before adding to cart.',
                icon: '📊'
              },
              {
                step: 'STEP 4',
                actor: '💳 Demo Payment',
                action: 'Order Placed',
                desc: 'Order confirmed with demo UPI/Card; payment safely locked in AgroBridge Escrow.',
                icon: '🔒'
              },
              {
                step: 'STEP 5',
                actor: '🤖 Smart Logistics',
                action: 'Selects Suitable Driver',
                desc: 'AI matching assigns nearby driver based on distance, rating & capacity.',
                icon: '🚚'
              },
              {
                step: 'STEP 6',
                actor: '📦 Delivery',
                action: 'Driver Delivers Produce',
                desc: 'Driver confirms farm gate pickup OTP and drives direct to doorstep.',
                icon: '🛣️'
              },
              {
                step: 'STEP 7',
                actor: '🗺️ Live Tracking',
                action: 'Customer Confirms OTP',
                desc: 'Live Leaflet map tracks delivery; customer OTP releases escrow to farmer wallet.',
                icon: '🏠'
              }
            ].map((s, idx) => (
              <div key={idx} className="relative p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-emerald-500/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      {s.step}
                    </span>
                    <span className="text-2xl">{s.icon}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-400">{s.actor}</div>
                  <h3 className="text-base font-black text-white mt-1">{s.action}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}

            {/* Quick Summary Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/60 to-slate-950 border border-emerald-500/40 flex flex-col justify-center items-center text-center space-y-3">
              <div className="text-3xl">✨</div>
              <h4 className="text-base font-black text-emerald-300">Complete Transparency</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every transaction is protected by Escrow and verified via dual OTPs at farm gate and doorstep.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. WHO CAN USE AGROBRIDGE SECTION */}
      {/* ========================================================================= */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Multi-Role Ecosystem</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              One Platform. Multiple Users.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Tailored portals designed for every participant in the agricultural commerce supply chain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {roleLogins.map((roleCard) => (
              <div 
                key={roleCard.role}
                className={`p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4 transition-all ${roleCard.glow}`}
              >
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl">
                    {roleCard.emoji}
                  </div>
                  <div>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${roleCard.accent}`}>
                      {roleCard.badge}
                    </span>
                    <h3 className="text-xl font-black text-white">{roleCard.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{roleCard.tagline}</p>
                  
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    {roleCard.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onNavigate(roleCard.route)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs ${roleCard.btnBg} transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5`}
                >
                  <span>{roleCard.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. LOGIN SECTION (PRIMARY CALLOUT) */}
      {/* ========================================================================= */}
      <section id="login" className="py-20 bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950 border-t border-b border-emerald-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/10">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Role-Based Portal Access</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Login to AgroBridge
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Choose your role to continue. Each role is authenticated with isolated JWT tokens and role-specific workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {roleLogins.map((role) => (
              <div
                key={`login-card-${role.role}`}
                className="p-6 rounded-3xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 flex flex-col justify-between items-center text-center space-y-5 shadow-2xl transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {role.emoji}
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">{role.title}</h3>
                  <p className="text-xs text-slate-400 leading-snug">{role.tagline}</p>
                </div>

                <button
                  onClick={() => onNavigate(role.route)}
                  className={`w-full py-3 px-4 rounded-xl text-xs uppercase tracking-wider ${role.btnBg} transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5`}
                >
                  <span>{role.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Direct Demo Credentials Helper */}
          <div className="mt-12 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 max-w-2xl mx-auto text-center space-y-2">
            <div className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pre-Configured Demo Credentials (Password: Demo@123)</span>
            </div>
            <p className="text-xs text-slate-400">
              Farmer: <code className="text-emerald-300 font-mono">farmer@agrobridge.demo</code> • 
              Consumer: <code className="text-teal-300 font-mono">consumer@agrobridge.demo</code> • 
              Driver: <code className="text-amber-300 font-mono">driver@agrobridge.demo</code>
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FEATURES SECTION */}
      {/* ========================================================================= */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Comprehensive Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Smart Features for Modern Agriculture
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Combining cutting-edge software with ground-level agricultural needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🤖',
                title: 'AI-Assisted Insights',
                desc: 'Regional demand forecasting and real-time pricing guidance to assist farmers with harvest planning.'
              },
              {
                icon: '💰',
                title: 'Price Transparency',
                desc: 'Side-by-side market reference benchmarks and a verified 88% direct farmer revenue allocation.'
              },
              {
                icon: '📍',
                title: 'Location-Based Marketplace',
                desc: 'Discover nearby farm clusters, fresh produce harvests, and local food producers near your district.'
              },
              {
                icon: '🚚',
                title: 'Smart Logistics',
                desc: 'Multi-parameter driver selection prioritizing proximity, vehicle capacity, active load, and driver rating.'
              },
              {
                icon: '🗺️',
                title: 'Live Delivery Tracking',
                desc: 'Track orders on an interactive OpenStreetMap Leaflet map with 3-point coordinates from farm to doorstep.'
              },
              {
                icon: '🌾',
                title: 'Direct From Farmers',
                desc: 'Connect consumers directly with independent producers, cutting commission agents and holding escrow safely.'
              }
            ].map((feat, i) => (
              <div key={i} className="p-7 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 space-y-3.5 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. AI TECHNOLOGY SECTION */}
      {/* ========================================================================= */}
      <section id="ai-technology" className="py-20 bg-slate-900/50 border-t border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5 text-teal-400" />
              <span>Machine Learning & Heuristics</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Powered by AI-Assisted Intelligence
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Transparent, algorithmic assistance to optimize commercial agricultural decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* AI 1: Demand Forecasting */}
            <div className="p-7 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center text-2xl">
                🤖
              </div>
              <h3 className="text-lg font-bold text-white">AI-Assisted Demand Forecasting</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Helps understand product demand trends across regions. Analyzes historical consumption curves, 
                festival seasonality, and regional volume projections to help farmers plan optimal sowing and harvest cycles.
              </p>
              <div className="text-[11px] font-semibold text-teal-300 bg-teal-950/40 p-2.5 rounded-xl border border-teal-500/20">
                ✓ 7-Day Regional Trend Curves • Bhopal District Focus
              </div>
            </div>

            {/* AI 2: Price Recommendation */}
            <div className="p-7 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl">
                💰
              </div>
              <h3 className="text-lg font-bold text-white">AI-Assisted Price Recommendations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provides fair price guidance. Computes an equitable pricing corridor between APMC mandi wholesale 
                rates and retail market averages, recommending direct prices that reward farmers while preserving consumer savings.
              </p>
              <div className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/20">
                ✓ Mandi Benchmark Analysis • Grade-Based Multipliers
              </div>
            </div>

            {/* AI 3: Smart Driver Assignment */}
            <div className="p-7 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-2xl">
                🚚
              </div>
              <h3 className="text-lg font-bold text-white">AI-Assisted Smart Driver Assignment</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Selects the most suitable driver partner based on 5 multi-factor criteria:
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 pl-2 border-l-2 border-amber-500/40">
                <li>• Real-time Driver Availability & Online Status</li>
                <li>• Proximity Distance to Farm Gate Pickup</li>
                <li>• Vehicle Payload Capacity vs Order Weight</li>
                <li>• Driver Historical Rating (4.8+ Star Average)</li>
                <li>• Current Active Deliveries Load</li>
              </ul>
            </div>

          </div>

          {/* Interactive Recharts Future Insights Feature */}
          <div className="mt-14">
            <FutureInsightsChart initialRole="farmer" showHeader={true} />
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. PRICE TRANSPARENCY SECTION */}
      {/* ========================================================================= */}
      <section id="price-transparency" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Cost Breakdown</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Know What You Pay For
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Transparent price information helps consumers make informed purchasing decisions 
              while ensuring farmers receive the rightful share of their hard work.
            </p>
          </div>

          {/* Pricing Comparison Showcase Card */}
          <div className="max-w-4xl mx-auto rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 sm:p-10 shadow-2xl space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl">
                  🍅
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Fresh Hybrid Tomato (Grade A+)</h3>
                  <p className="text-xs text-slate-400">Harvested fresh today from Patel Organic Farms, Bhopal</p>
                </div>
              </div>
              <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Verified Direct Farm Deal
              </span>
            </div>

            {/* Price Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-1">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🌾 AgroBridge Direct</div>
                <div className="text-3xl font-black text-white">₹25 <span className="text-sm font-normal text-slate-400">/kg</span></div>
                <div className="text-[11px] text-emerald-300 font-medium">Direct from Farmer</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">🏪 Market Reference</div>
                <div className="text-3xl font-black text-slate-400 line-through">₹32 <span className="text-sm font-normal text-slate-500">/kg</span></div>
                <div className="text-[11px] text-slate-500 font-medium">Local Retail Benchmark</div>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 space-y-1">
                <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">💰 Potential Savings</div>
                <div className="text-3xl font-black text-emerald-400">₹7 <span className="text-sm font-normal text-emerald-200">/kg</span></div>
                <div className="text-[11px] text-emerald-200 font-bold">22% Direct Savings</div>
              </div>
            </div>

            {/* Value Share Bar (88% to Farmer) */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Where does your ₹25 go?</span>
                <span className="text-emerald-400">88% Goes Directly to Farmer</span>
              </div>
              <div className="h-4 w-full rounded-full bg-slate-800 flex overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '88%' }} title="88% Direct to Farmer" />
                <div className="h-full bg-amber-400" style={{ width: '8%' }} title="8% Logistics Fee" />
                <div className="h-full bg-teal-400" style={{ width: '4%' }} title="4% Platform Fee" />
              </div>
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Farmer: <strong>₹22.00 (88%)</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Rural Logistics: <strong>₹2.00 (8%)</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                  <span>Platform Operations: <strong>₹1.00 (4%)</strong></span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. MAP AND TRACKING SECTION */}
      {/* ========================================================================= */}
      <section id="map-tracking" className="py-20 bg-slate-900/50 border-t border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>OpenStreetMap & Leaflet Integration</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Track Your Order From Farm to Home
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Consumers can track live delivery progress using real-time location telemetry on OpenStreetMap.
            </p>
          </div>

          {/* 3-Point Visual Flow Container */}
          <div className="max-w-5xl mx-auto p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              
              {/* Point 1: Farmer Pickup */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2 text-center md:text-left">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto md:mx-0">
                  🌾
                </div>
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Pickup Location</div>
                <h4 className="text-base font-bold text-white">Farmer Farm Gate</h4>
                <p className="text-xs text-slate-400">
                  Exact geo-coordinates recorded at listing. Verified with Farm Gate OTP upon driver arrival.
                </p>
              </div>

              {/* Point 2: Moving Driver */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-2 text-center md:text-left">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl mx-auto md:mx-0">
                  🚚
                </div>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Live Location</div>
                <h4 className="text-base font-bold text-white">Driver Partner Telemetry</h4>
                <p className="text-xs text-slate-400">
                  Moving vehicle GPS updates regularly via telemetry. Real-time ETA computed using Haversine formulas.
                </p>
              </div>

              {/* Point 3: Consumer Doorstep */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-teal-500/30 space-y-2 text-center md:text-left">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-2xl mx-auto md:mx-0">
                  🏠
                </div>
                <div className="text-xs font-bold text-teal-400 uppercase tracking-wider">Delivery Destination</div>
                <h4 className="text-base font-bold text-white">Consumer Doorstep</h4>
                <p className="text-xs text-slate-400">
                  Confirmed on interactive map during checkout. Final delivery confirmed via Customer OTP.
                </p>
              </div>

            </div>

            {/* Live Map Telemetry Note */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Zero paid API keys needed: Powered by open-source OpenStreetMap and Leaflet tiles.</span>
              </div>
              <button
                onClick={() => onNavigate('/consumer/login')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold whitespace-nowrap"
              >
                Test Live Tracking ➔
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 12. SIH PROJECT SECTION */}
      {/* ========================================================================= */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <span>🇮🇳</span> Smart India Hackathon Prototype
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Built for Smarter Agricultural Commerce
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
              AgroBridge is engineered to address five foundational national challenges in agricultural commerce:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {[
                { title: 'Agricultural Market Accessibility', desc: 'Giving rural smallholders direct access to high-demand urban consumers.' },
                { title: 'Price Transparency & Fair Wages', desc: 'Clear comparative benchmarks ensuring 88% farmer revenue retention.' },
                { title: 'Consumer Access to Fresh Produce', desc: 'Same-day harvested crops delivered straight to urban households.' },
                { title: 'Rural Logistics Coordination', desc: 'Automated matching of local pickup trucks to reduce post-harvest transit waste.' },
                { title: 'Digital Agriculture Adoption', desc: 'Easy-to-use role portals with bilingual and clean mobile-first UI.' },
                { title: 'Safe Financial Settlement', desc: 'Mock Escrow payment architecture protecting both farmers and buyers.' }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <h4 className="text-xs font-bold text-emerald-400">{item.title}</h4>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 13. CALL TO ACTION (CTA) SECTION */}
      {/* ========================================================================= */}
      <section className="py-20 bg-slate-900/60 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-3xl mx-auto shadow-xl shadow-emerald-500/25">
            🌾
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Ready to Bridge the Gap Between Farms and Consumers?
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Experience fair trade, AI-assisted decision making, and transparent rural logistics today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('/consumer/login')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Explore AgroBridge</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('login')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Choose Your Login</span>
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 14. CONTACT SECTION */}
      {/* ========================================================================= */}
      <section id="contact" className="py-16 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Inquiries & Support</h4>
              <p className="text-sm font-bold text-white">support@agrobridge.demo</p>
              <p className="text-xs text-slate-500 mt-1">24/7 AgroBridge Technical Team</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">Headquarters</h4>
              <p className="text-sm font-bold text-white">Madhya Pradesh Hub</p>
              <p className="text-xs text-slate-500 mt-1">Bhopal Agri-Cluster & Logistics Center</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Platform Status</h4>
              <p className="text-sm font-bold text-emerald-400 flex items-center justify-center md:justify-start gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>All 5 Portals Operational</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">Smart India Hackathon Prototype</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 15. FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Logo & Tagline */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sprout className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <span className="text-lg font-black text-white">AgroBridge</span>
                <p className="text-xs text-slate-400">From Farm to Home</p>
              </div>
            </div>

            {/* Mission Statement */}
            <p className="text-xs text-slate-400 text-center md:text-right max-w-md font-medium">
              "Empowering Farmers. Reducing Consumer Costs. Strengthening Local Economy."
            </p>

          </div>

          {/* Nav Links in Footer */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-semibold border-t border-b border-slate-900 py-4">
            <button onClick={() => scrollToSection('home')} className="hover:text-emerald-400 transition-colors">Home</button>
            <button onClick={() => scrollToSection('about')} className="hover:text-emerald-400 transition-colors">About</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-emerald-400 transition-colors">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-emerald-400 transition-colors">How It Works</button>
            <button onClick={() => scrollToSection('price-transparency')} className="hover:text-emerald-400 transition-colors">Price Transparency</button>
            <button onClick={() => scrollToSection('login')} className="hover:text-emerald-400 transition-colors">Login</button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-center">
            <div>© 2026 AgroBridge. All rights reserved.</div>
            <div className="text-emerald-400/80 font-medium">Built for Smart India Hackathon.</div>
          </div>

        </div>
      </footer>

    </div>
  );
}
