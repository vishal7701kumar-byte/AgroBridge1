import React from 'react';
import { ArrowRight, ShieldCheck, TrendingUp, ShoppingBag, Building2, Truck, ShieldAlert } from 'lucide-react';

export default function RoleSelectionPage({ onNavigate }) {
  const roles = [
    {
      id: 'farmer',
      roleKey: 'FARMER',
      title: 'FARMER',
      emoji: '👨‍🌾',
      icon: TrendingUp,
      description: 'Sell your agricultural products directly and earn better prices.',
      buttonText: 'Continue as Farmer',
      loginRoute: '/farmer/login',
      accentColor: 'emerald',
      cardBg: 'from-emerald-950/40 via-slate-900/90 to-slate-950',
      borderHover: 'hover:border-emerald-500/60 hover:shadow-emerald-500/20',
      btnGradient: 'from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400',
      badge: 'Direct Producer',
      demoEmail: 'farmer@agrobridge.demo'
    },
    {
      id: 'consumer',
      roleKey: 'CONSUMER',
      title: 'CONSUMER',
      emoji: '🛒',
      icon: ShoppingBag,
      description: 'Buy fresh products directly from farmers at transparent prices.',
      buttonText: 'Continue as Consumer',
      loginRoute: '/consumer/login',
      accentColor: 'teal',
      cardBg: 'from-teal-950/40 via-slate-900/90 to-slate-950',
      borderHover: 'hover:border-teal-500/60 hover:shadow-teal-500/20',
      btnGradient: 'from-teal-500 to-cyan-500 text-slate-950 hover:from-teal-400 hover:to-cyan-400',
      badge: 'Farm to Fork',
      demoEmail: 'consumer@agrobridge.demo'
    },
    {
      id: 'bulk-buyer',
      roleKey: 'BULK_BUYER',
      title: 'BULK BUYER',
      emoji: '🏢',
      icon: Building2,
      description: 'Purchase agricultural products in bulk for your business.',
      buttonText: 'Continue as Bulk Buyer',
      loginRoute: '/bulk-buyer/login',
      accentColor: 'indigo',
      cardBg: 'from-indigo-950/40 via-slate-900/90 to-slate-950',
      borderHover: 'hover:border-indigo-500/60 hover:shadow-indigo-500/20',
      btnGradient: 'from-indigo-500 to-blue-500 text-white hover:from-indigo-400 hover:to-blue-400',
      badge: 'B2B Wholesale',
      demoEmail: 'bulkbuyer@agrobridge.demo'
    },
    {
      id: 'driver',
      roleKey: 'DRIVER',
      title: 'DRIVER',
      emoji: '🚚',
      icon: Truck,
      description: 'Join our logistics network and deliver agricultural products.',
      buttonText: 'Continue as Driver',
      loginRoute: '/driver/login',
      accentColor: 'amber',
      cardBg: 'from-amber-950/40 via-slate-900/90 to-slate-950',
      borderHover: 'hover:border-amber-500/60 hover:shadow-amber-500/20',
      btnGradient: 'from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400',
      badge: 'Cold-Chain Fleet',
      demoEmail: 'driver@agrobridge.demo'
    },
    {
      id: 'admin',
      roleKey: 'ADMIN',
      title: 'ADMIN',
      emoji: '👨‍💼',
      icon: ShieldAlert,
      description: 'Manage and monitor the AgroBridge platform.',
      buttonText: 'Continue as Admin',
      loginRoute: '/admin/login',
      accentColor: 'violet',
      cardBg: 'from-violet-950/40 via-slate-900/90 to-slate-950',
      borderHover: 'hover:border-violet-500/60 hover:shadow-violet-500/20',
      btnGradient: 'from-violet-500 to-fuchsia-500 text-white hover:from-violet-400 hover:to-fuchsia-400',
      badge: 'Platform Control',
      demoEmail: 'admin@agrobridge.demo'
    }
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[250px] bg-teal-600/10 blur-[110px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl mx-auto w-full relative z-10">
        
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Role-Based Authentication Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">AgroBridge</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 font-medium">
            Choose how you want to continue
          </p>
        </div>

        {/* 5 Professional Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                onClick={() => onNavigate(role.loginRoute)}
                className={`group relative rounded-3xl p-7 border border-slate-800/90 bg-gradient-to-b ${role.cardBg} backdrop-blur-xl shadow-xl transition-all duration-300 ${role.borderHover} hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between`}
              >
                <div>
                  {/* Top Badge & Emoji Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                      {role.emoji}
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300">
                      {role.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-black text-white tracking-tight mb-2 group-hover:text-emerald-300 transition-colors">
                    {role.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed min-h-[48px]">
                    "{role.description}"
                  </p>
                </div>

                {/* Continue Button */}
                <div className="mt-7 pt-4 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(role.loginRoute);
                    }}
                    className={`w-full py-3.5 px-5 rounded-2xl font-bold text-sm bg-gradient-to-r ${role.btnGradient} shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 group-hover:shadow-xl`}
                  >
                    <span>{role.buttonText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="mt-3 text-center">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Demo Account: <span className="text-slate-400 font-mono">{role.demoEmail}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Assurance Guarantee Note */}
        <div className="mt-12 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-center max-w-2xl mx-auto">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Strict role isolation active: Accounts registered for one role cannot access alternate role portals.</span>
          </p>
        </div>

      </div>
    </div>
  );
}
