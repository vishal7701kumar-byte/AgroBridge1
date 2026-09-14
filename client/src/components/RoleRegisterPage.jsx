import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Home,
  Building,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Sprout
} from 'lucide-react';
import { authAPI } from '../services/api';

export default function RoleRegisterPage({ roleConfig, onNavigate, onRegisterSuccess }) {
  // Common state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState('Madhya Pradesh');
  const [city, setCity] = useState('Bhopal');

  // Farmer specific
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [district, setDistrict] = useState('Bhopal');

  // Consumer specific
  const [address, setAddress] = useState('');

  // Bulk buyer specific
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Distributor');
  const [businessAddress, setBusinessAddress] = useState('');

  // Driver specific
  const [vehicleType, setVehicleType] = useState('Pickup Truck');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleCapacity, setVehicleCapacity] = useState('1.5 Tons');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify confirmation password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        role: roleConfig.roleKey,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirmPassword,
        state,
        city
      };

      if (roleConfig.roleKey === 'FARMER') {
        payload.farmName = farmName.trim() || `${name}'s Farm`;
        payload.farmLocation = farmLocation.trim() || 'Rural Agriculture Area';
        payload.district = district.trim() || 'Bhopal';
      } else if (roleConfig.roleKey === 'CONSUMER') {
        payload.address = address.trim() || 'Residential Address';
      } else if (roleConfig.roleKey === 'BULK_BUYER') {
        payload.businessName = businessName.trim() || `${name} Enterprises`;
        payload.businessType = businessType;
        payload.businessAddress = businessAddress.trim() || 'Commercial District';
      } else if (roleConfig.roleKey === 'DRIVER') {
        payload.vehicleType = vehicleType;
        payload.vehicleNumber = vehicleNumber.trim() || 'MP 04 Z 0000';
        payload.vehicleCapacity = vehicleCapacity.trim() || '1.0 Ton';
      }

      const res = await authAPI.register(payload);

      if (res.data && res.data.success) {
        localStorage.setItem('agrobridge_token', res.data.token);
        localStorage.setItem('agrobridge_user', JSON.stringify(res.data.user));
        onRegisterSuccess(res.data.user, res.data.redirectUrl);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Registration failed. Please check network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-8 relative">
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] ${roleConfig.ambientGlow} blur-[140px] rounded-full pointer-events-none`} />

      <div className="max-w-2xl w-full relative z-10">
        
        {/* Navigation back */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate(roleConfig.loginRoute)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {roleConfig.roleKey.replace('_', ' ')} Login</span>
          </button>

          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${roleConfig.badgeTheme}`}>
            {roleConfig.roleKey.replace('_', ' ')} Registration
          </span>
        </div>

        {/* Form Container */}
        <div className={`bg-gradient-to-b ${roleConfig.cardBg} border ${roleConfig.cardBorder} rounded-3xl p-6 sm:p-9 shadow-2xl backdrop-blur-2xl space-y-6`}>
          
          {/* Header */}
          <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
            <div className={`w-14 h-14 rounded-2xl ${roleConfig.iconBox} flex items-center justify-center text-3xl shadow-lg ring-1 ring-white/10`}>
              {roleConfig.emoji}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {roleConfig.roleKey === 'FARMER' && 'Register as Farmer'}
                {roleConfig.roleKey === 'CONSUMER' && 'Register as Consumer'}
                {roleConfig.roleKey === 'BULK_BUYER' && 'Bulk Buyer Registration'}
                {roleConfig.roleKey === 'DRIVER' && 'Driver Partner Registration'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Join AgroBridge direct agricultural network
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-600/80 text-rose-200 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* SECTION 1: Personal & Auth Info */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Personal & Account Credentials</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className={`w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none ${roleConfig.focusBorder}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className={`w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none ${roleConfig.focusBorder}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className={`w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none ${roleConfig.focusBorder}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Madhya Pradesh"
                    className={`w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none ${roleConfig.focusBorder}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password (min 6 chars) *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none ${roleConfig.focusBorder}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none ${roleConfig.focusBorder}`}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Role-Specific Details */}
            {roleConfig.roleKey === 'FARMER' && (
              <div className="pt-3 border-t border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5" />
                  <span>Farm Details</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Farm Name *</label>
                    <input
                      type="text"
                      required
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      placeholder="e.g. Kisan Shanti Farm"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Farm Location *</label>
                    <input
                      type="text"
                      required
                      value={farmLocation}
                      onChange={(e) => setFarmLocation(e.target.value)}
                      placeholder="e.g. Berasia Road"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">District *</label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Bhopal"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {roleConfig.roleKey === 'CONSUMER' && (
              <div className="pt-3 border-t border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Delivery Address</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Delivery Address *</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House/Flat No., Apartment, Street name"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Bhopal"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {roleConfig.roleKey === 'BULK_BUYER' && (
              <div className="pt-3 border-t border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  <span>Business Information</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Business Name *</label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Royal Grand Hotel & Kitchen"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Business Type *</label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Restaurant">Restaurant</option>
                      <option value="Hotel">Hotel</option>
                      <option value="Retail Shop">Retail Shop</option>
                      <option value="Food Processing Company">Food Processing Company</option>
                      <option value="Distributor">Distributor</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Business Address *</label>
                    <input
                      type="text"
                      required
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      placeholder="Commercial street, Plot / Shop No."
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {roleConfig.roleKey === 'DRIVER' && (
              <div className="pt-3 border-t border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Vehicle & Logistics Details</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Type *</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Bike">Bike</option>
                      <option value="Pickup Truck">Pickup Truck</option>
                      <option value="Mini Truck">Mini Truck</option>
                      <option value="Truck">Truck</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Number *</label>
                    <input
                      type="text"
                      required
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      placeholder="e.g. MP 04 GA 4892"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Capacity *</label>
                    <input
                      type="text"
                      required
                      value={vehicleCapacity}
                      onChange={(e) => setVehicleCapacity(e.target.value)}
                      placeholder="e.g. 1.5 Tons"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                  ℹ️ Note: Driver accounts are initialized with <span className="font-bold underline">OFFLINE</span> status upon registration. You can toggle your active status on the Driver Dashboard.
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r ${roleConfig.btnGradient} shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-4 disabled:opacity-50`}
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Complete {roleConfig.roleKey.replace('_', ' ')} Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Return to Login */}
          <div className="pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate(roleConfig.loginRoute)}
                className={`font-bold underline ${roleConfig.textAccent} hover:brightness-125 transition-colors`}
              >
                Login here
              </button>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
