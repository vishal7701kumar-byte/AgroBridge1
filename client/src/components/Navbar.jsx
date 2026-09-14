import React from 'react';
import { Sprout, LogOut, Shield, User, ArrowLeft, Key } from 'lucide-react';

export default function Navbar({ currentUser, activeRoute, onNavigate, onLogout, onShowDemoGuide }) {
  const getRoleBadge = (role) => {
    switch (role) {
      case 'FARMER':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'CONSUMER':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      case 'BULK_BUYER':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'DRIVER':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'ADMIN':
        return 'bg-violet-500/20 text-violet-300 border-violet-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const isAuthPage = activeRoute.includes('/login') || activeRoute.includes('/register') || activeRoute === '/';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('/')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">AgroBridge</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Direct
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Farm-to-Fork Disintermediation Network</p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          
          {/* Demo Guide Helper Button */}
          <button
            onClick={onShowDemoGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition-all"
            title="View 5 Demo Accounts"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Demo Credentials</span>
          </button>

          {/* Back to Home Landing Page */}
          {activeRoute !== '/' && (
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
              title="Return to AgroBridge Landing Page"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </button>
          )}

          {/* Current User Pill & Logout */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-200">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{currentUser.email}</div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadge(currentUser.role)} uppercase tracking-wider`}>
                {currentUser.role.replace('_', ' ')}
              </span>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-500/40 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('/login')}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-extrabold shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all"
            >
              Select Role
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
