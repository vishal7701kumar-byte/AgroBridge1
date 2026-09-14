import React, { useState } from 'react';
import {
  Sprout,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Building,
  AlertTriangle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { authAPI } from '../services/api';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function RoleLoginPage({ roleConfig, onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorData, setErrorData] = useState(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Fill pre-configured demo account
  const handleFillDemo = () => {
    setEmail(roleConfig.demoEmail);
    if (roleConfig.roleKey === 'BULK_BUYER') {
      setBusinessName('Mehta Agro Wholesalers & Hotel Supplies');
    }
    setPassword('Demo@123');
    setErrorData(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorData(null);

    try {
      const payload = {
        role: roleConfig.roleKey,
        email: email.trim(),
        password: password
      };

      if (roleConfig.roleKey === 'BULK_BUYER' && businessName) {
        payload.businessName = businessName.trim();
      }

      const res = await authAPI.login(payload);

      if (res.data && res.data.success) {
        localStorage.setItem('agrobridge_token', res.data.token);
        localStorage.setItem('agrobridge_user', JSON.stringify(res.data.user));
        onLoginSuccess(res.data.user, res.data.redirectUrl);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setErrorData(err.response.data);
      } else {
        setErrorData({
          error: 'Connection error: Unable to contact AgroBridge server. Please ensure the backend is running.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden`}>
      
      {/* Dynamic Background Atmospheric Glow based on role theme */}
      <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 w-[550px] h-[350px] ${roleConfig.ambientGlow} blur-[140px] rounded-full pointer-events-none`} />

      <div className="max-w-md w-full relative z-10">
        
        {/* Navigation back to Role Selection */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Role Selection</span>
          </button>

          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${roleConfig.badgeTheme}`}>
            {roleConfig.roleKey.replace('_', ' ')}
          </span>
        </div>

        {/* Card Container */}
        <div className={`bg-gradient-to-b ${roleConfig.cardBg} border ${roleConfig.cardBorder} rounded-3xl p-7 sm:p-9 shadow-2xl backdrop-blur-2xl space-y-6`}>
          
          {/* Brand & Role Header */}
          <div className="text-center space-y-2">
            <div className={`w-16 h-16 rounded-2xl ${roleConfig.iconBox} flex items-center justify-center mx-auto shadow-xl shadow-black/40 ring-1 ring-white/20 text-3xl`}>
              {roleConfig.emoji}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {roleConfig.pageTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
              "{roleConfig.subtitle}"
            </p>
          </div>

          {/* 1-Click Fill Demo Account Pill */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex items-center justify-between gap-2">
            <div className="text-left">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Demo Account</span>
              </div>
              <div className="text-xs font-mono text-slate-300 truncate max-w-[210px]">
                {roleConfig.demoEmail}
              </div>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white border border-slate-700 transition-all"
            >
              Fill Credentials
            </button>
          </div>

          {/* ERROR ALERT BANNER (With strict role mismatch detector) */}
          {errorData && (
            <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-600/80 text-rose-200 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{errorData.error}</span>
              </div>

              {/* Special 1-Click Redirect if Cross-Role Error detected */}
              {errorData.roleMismatch && errorData.correctLoginPath && (
                <div className="pt-2 border-t border-rose-900/60 flex items-center justify-between">
                  <span className="text-[11px] text-rose-300 font-medium">Wrong portal selected:</span>
                  <button
                    type="button"
                    onClick={() => onNavigate(errorData.correctLoginPath)}
                    className="px-3 py-1 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>Go to {errorData.actualRoleDisplayName} Login</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Bulk Buyer specific: Business Name (Optional) */}
            {roleConfig.roleKey === 'BULK_BUYER' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Business Name (Optional)</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Mehta Agro Wholesalers"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {roleConfig.emailLabel || 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required={roleConfig.roleKey !== 'BULK_BUYER' || !businessName}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={roleConfig.demoEmail}
                  className={`w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none ${roleConfig.focusBorder} transition-colors`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none ${roleConfig.focusBorder} transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-slate-400">Remember me on this device</span>
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r ${roleConfig.btnGradient} shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-3 disabled:opacity-50`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <span>{roleConfig.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Link / Admin restriction note */}
          <div className="pt-4 border-t border-slate-800/80 text-center">
            {roleConfig.roleKey === 'ADMIN' ? (
              <div className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                🔒 <span className="font-semibold text-slate-300">Restricted Portal:</span> Admin accounts are strictly predefined and managed by AgroBridge Operations. Public registration is prohibited.
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Don't have a {roleConfig.roleKey.replace('_', ' ').toLowerCase()} account yet?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate(roleConfig.registerRoute)}
                  className={`font-bold underline ${roleConfig.textAccent} hover:brightness-125 transition-colors`}
                >
                  Register here
                </button>
              </p>
            )}
          </div>

        </div>

        {/* AgroBridge Brand Footer */}
        <div className="mt-6 text-center text-[11px] text-slate-500">
          🌱 <span className="text-slate-400 font-semibold">AgroBridge Secure Gateway</span> • 256-bit Encrypted Farm Disintermediation
        </div>

      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        roleTitle={roleConfig.roleKey.replace('_', ' ')}
        initialEmail={email || roleConfig.demoEmail}
      />

    </div>
  );
}
