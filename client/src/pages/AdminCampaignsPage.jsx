import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Sparkles, Calendar, Plus, Trash2, Power, TrendingUp, 
  CloudRain, Sun, Zap, CheckCircle, AlertTriangle, RefreshCw, 
  MessageSquare, PhoneCall, Radio, BarChart3, Filter, Tag, Info, 
  ShieldCheck, Check, Clock, Percent, Layers, X
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell 
} from 'recharts';
import { campaignAPI, smartOffersAPI } from '../services/api';

export default function AdminCampaignsPage({ currentUser, onNavigate, onLogout }) {
  const [campaigns, setCampaigns] = useState([]);
  const [intelligence, setIntelligence] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toast, setToast] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New campaign form state
  const [form, setForm] = useState({
    festivalName: '',
    tagline: '',
    targetCommodities: 'Wheat, Rice',
    discountPercent: 10,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    bannerTheme: 'amber'
  });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [campRes, intelRes, weatherRes] = await Promise.all([
        campaignAPI.getCampaigns(),
        campaignAPI.getAIIntelligence().catch(() => ({ data: { data: null } })),
        smartOffersAPI.getWeather().catch(() => ({ data: { data: null } }))
      ]);

      if (campRes.data?.data) {
        setCampaigns(campRes.data.data);
      }
      if (intelRes.data?.data) {
        setIntelligence(intelRes.data.data);
      }
      if (weatherRes.data?.data) {
        setWeatherData(weatherRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load campaigns data', err);
      showToast('Error loading campaign intelligence.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleCampaign = async (campaign) => {
    const newStatus = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const res = await campaignAPI.updateCampaign(campaign.id, { status: newStatus });
      if (res.data?.success) {
        setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, status: newStatus } : c));
        showToast('Campaign ' + campaign.name + ' set to ' + newStatus);
      }
    } catch (err) {
      showToast('Failed to update campaign status.');
    }
  };

  const handleDeleteCampaign = async (id, name) => {
    if (!window.confirm('Are you sure you want to delete campaign ' + name + '?')) return;
    try {
      const res = await campaignAPI.deleteCampaign(id);
      if (res.data?.success) {
        setCampaigns(prev => prev.filter(c => c.id !== id));
        showToast('Campaign ' + name + ' removed.');
      }
    } catch (err) {
      showToast('Failed to delete campaign.');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.festivalName) {
      showToast('Please enter a festival or campaign name.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.festivalName,
        tagline: form.tagline || 'Special seasonal offer for farmers and consumers',
        targetCommodities: form.targetCommodities.split(',').map(s => s.trim()).filter(Boolean),
        discountPercent: Number(form.discountPercent) || 10,
        startDate: form.startDate,
        endDate: form.endDate,
        bannerTheme: form.bannerTheme,
        status: 'ACTIVE'
      };

      const res = await campaignAPI.createCampaign(payload);
      if (res.data?.success && res.data.data) {
        setCampaigns(prev => [res.data.data, ...prev]);
        setCreateModalOpen(false);
        setForm({
          festivalName: '',
          tagline: '',
          targetCommodities: 'Wheat, Rice',
          discountPercent: 10,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          bannerTheme: 'amber'
        });
        showToast("✓ Festival campaign '" + payload.name + "' launched successfully!");
      }
    } catch (err) {
      showToast('Failed to create festival campaign.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  const cropDemandData = intelligence?.cropDemand || [
    { crop: 'Wheat', demandScore: 92, surge: '+24%' },
    { crop: 'Basmati Rice', demandScore: 88, surge: '+18%' },
    { crop: 'Desi Tomato', demandScore: 84, surge: '+15%' },
    { crop: 'Nashik Onion', demandScore: 95, surge: '+32%' },
    { crop: 'Alphonso Mango', demandScore: 91, surge: '+28%' },
    { crop: 'Organic Potato', demandScore: 78, surge: '+10%' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-slate-100">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-emerald-950 border border-emerald-500/50 text-emerald-200 text-xs font-bold shadow-2xl flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate ? onNavigate('/admin') : window.history.back()}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            title="Back to Admin Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
                <span>🤖 AI Campaigns & Telephony Governance</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SIH26033
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Seasonal Demand AI, Festival Pricing Engines, WhatsApp Assistant & IVR Voice Gateway Hub
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/40 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Launch Festival Campaign</span>
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors text-xs font-bold"
          >
            <RefreshCw className={'w-4 h-4 ' + (loading ? 'animate-spin text-amber-400' : '')} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Prototype Simulation Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 p-4 sm:p-5 flex items-start gap-4 shadow-lg">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="text-xs leading-relaxed space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-200">
            <span>Prototype Simulation Notice & Production Readiness</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/30 text-amber-300 border border-amber-500/50 uppercase tracking-wider">
              Production Ready Abstraction
            </span>
          </div>
          <p className="text-slate-300">
            This governance console demonstrates AI-driven agricultural demand prediction and festival offer automation for Smart India Hackathon.
            WhatsApp notifications utilize webhook-ready simulated pipes that connect to Meta Graph API, and IVR callbacks simulate Exotel/Twilio voice gateways with sub-150ms DTMF parsing.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Campaigns</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {campaigns.filter(c => c.status === 'ACTIVE').length}
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>AI Demand Match Rate: 94.2%</span>
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Seasonal Surge Index</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            +38.5%
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Diwali + Harvest Pre-ordering surge
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>WhatsApp Farmer Opt-ins</span>
            <MessageSquare className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-400">
            {intelligence?.telephonyStats?.whatsappOptIns || '142'}
          </div>
          <p className="text-[11px] text-teal-300/80 font-medium">
            8 templates active • 0% bounce
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>IVR Voice Callbacks</span>
            <PhoneCall className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-400">
            {intelligence?.telephonyStats?.ivrCallbacks || '89'}
          </div>
          <p className="text-[11px] text-indigo-300/80 font-medium">
            Toll-Free 1800-AGRO-BRIDGE
          </p>
        </div>
      </div>

      {/* Grid: Recharts Demand Index & Telephony Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Crop Demand Index */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                <span>AI Crop Demand Forecast Index</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Aggregated purchase intention & seasonal festival consumption multiplier (0-100)
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              AI-assisted forecast
            </span>
          </div>

          {/* Bar Chart */}
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropDemandData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis 
                  dataKey="crop" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#fbbf24' }}
                />
                <Bar dataKey="demandScore" radius={[6, 6, 0, 0]}>
                  {cropDemandData.map((entry, index) => (
                    <Cell 
                      key={'cell-' + index} 
                      fill={entry.demandScore > 90 ? '#f59e0b' : entry.demandScore > 80 ? '#10b981' : '#6366f1'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* AI Decision Support Disclaimer */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Recommendations calculated by AgroBridge Seasonal Decision Engine based on regional weather & festive calendar.</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 shrink-0 font-bold">96.4% Model Confidence</span>
          </div>
        </div>

        {/* Telephony & Gateway Status Hub */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl space-y-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-teal-400" />
              <span>Telephony Gateways</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time connectivity health of inclusive telephony services
            </p>
          </div>

          <div className="space-y-4">
            {/* WhatsApp Business API Gateway */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-teal-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
                  <MessageSquare className="w-4 h-4 text-teal-400" />
                  <span>WhatsApp Cloud API</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  🟢 ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Webhooks ready for Meta Cloud API. Event-driven alerts active for orders, payouts, and AI insights.
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Throughput: 12 msg/sec</span>
                <span className="text-teal-400 font-bold">Sandbox Active</span>
              </div>
            </div>

            {/* IVR Voice Gateway */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                  <PhoneCall className="w-4 h-4 text-indigo-400" />
                  <span>IVR Toll-Free Gateway</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  🟢 ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Keypad phone service on 1800-AGRO-BRIDGE. Synthesizes bilingual audio in Hindi and English.
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>DTMF Latency: 118ms</span>
                <span className="text-indigo-400 font-bold">SIP Trunk Ready</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Simulated Call Back Rate:</span>
            <span className="font-bold text-white">100% (Instant)</span>
          </div>
        </div>
      </div>

      {/* Festival Campaigns Management Section */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>Festival & Seasonal Campaigns</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Manage automated AI discount banners and targeted crop incentives for consumers and bulk buyers
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
            {['ALL', 'ACTIVE', 'PAUSED'].map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={'px-3 py-1.5 rounded-lg text-xs font-bold transition-all ' + (
                  statusFilter === f 
                    ? 'bg-amber-500 text-slate-950 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Campaign Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCampaigns.map((camp) => (
            <div 
              key={camp.id}
              className="rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all p-5 flex flex-col justify-between space-y-4 shadow-lg group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      {camp.festival || 'Seasonal Fest'}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                      {camp.name}
                    </h3>
                  </div>
                  <span className={'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase ' + (
                    camp.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  )}>
                    {camp.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {camp.tagline}
                </p>

                {/* Target Commodities Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(camp.targetCommodities || []).map((crop, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-medium">
                      🌾 {crop}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Percent className="w-3.5 h-3.5" />
                  <span>{camp.discountPercent}% OFF</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleCampaign(camp)}
                    className={'p-1.5 rounded-lg border transition-colors ' + (
                      camp.status === 'ACTIVE'
                        ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-amber-400'
                        : 'bg-emerald-950 border-emerald-700 text-emerald-300 hover:bg-emerald-900'
                    )}
                    title={camp.status === 'ACTIVE' ? 'Pause Campaign' : 'Activate Campaign'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCampaign(camp.id, camp.name)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-800 transition-colors"
                    title="Delete Campaign"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Create New Festival Campaign */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>AI Automated Campaign Launcher</span>
              </div>
              <h3 className="text-xl font-black text-white">Launch Festival Campaign</h3>
              <p className="text-xs text-slate-400">
                Configures real-time smart badges on consumer marketplace and bulk buyer portal
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Campaign / Festival Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Makar Sankranti Harvest Mega Fest"
                  value={form.festivalName}
                  onChange={e => setForm({ ...form, festivalName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Tagline / Consumer Callout
                </label>
                <input
                  type="text"
                  placeholder="e.g. Celebrate harvest with directly sourced organic pulses and grains"
                  value={form.tagline}
                  onChange={e => setForm({ ...form, tagline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Target Crops (CSV)
                  </label>
                  <input
                    type="text"
                    value={form.targetCommodities}
                    onChange={e => setForm({ ...form, targetCommodities: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={form.discountPercent}
                    onChange={e => setForm({ ...form, discountPercent: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/40 transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Launching...' : 'Activate Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
