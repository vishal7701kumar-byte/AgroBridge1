import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Users, Server, Activity, Lock, RefreshCw, CheckCircle2, 
  ShoppingBag, Truck, FileText, ShieldCheck, LifeBuoy, AlertTriangle, 
  Check, X, Star, ThumbsUp, MessageSquare, AlertCircle, Eye, AlertOctagon,
  HelpCircle, History, Sparkles, Filter, ChevronRight, MessageCircle, Ban,
  Clock, Search, Calendar, ShieldX, UserX, UserCheck
} from 'lucide-react';
import { adminAPI } from '../services/api';
import AgroProductImage, { getProductImage } from '../components/AgroProductImage';

export default function AdminDashboard({ currentUser, onLogout, onNavigate, initialRoute }) {
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [productsForReview, setProductsForReview] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [complaintAnalytics, setComplaintAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  
  const [activeTab, setActiveTab] = useState('farmers'); // farmers, complaints, analytics, audit, quality, users, orders, deliveries
  const [loading, setLoading] = useState(true);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('');
  const [complaintFilter, setComplaintFilter] = useState('');
  const [adminToast, setAdminToast] = useState(null);

  // Farmer Dossier Profile Modal State (/admin/farmers/:id)
  const [selectedFarmerDossier, setSelectedFarmerDossier] = useState(null);
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [dossierTab, setDossierTab] = useState('overview'); // overview, products, complaints, feedbacks, audit
  const [loadingDossier, setLoadingDossier] = useState(false);

  // Farmer Action Modal State (Warning, Review, Unlist, Restore, Suspend, Ban)
  const [actionModal, setActionModal] = useState({ open: false, type: '', farmer: null });
  const [actionForm, setActionForm] = useState({ reason: '', duration: 7, notes: '' });
  const [submittingAction, setSubmittingAction] = useState(false);

  // Complaint Review & Verification Modal State
  const [reviewModal, setReviewModal] = useState({ open: false, complaint: null, decision: 'VALID', severity: 'MEDIUM', adminNotes: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Farmer Directory Filters
  const [farmerSearch, setFarmerSearch] = useState('');
  const [farmerStatusFilter, setFarmerStatusFilter] = useState('ALL');
  const [farmerRiskFilter, setFarmerRiskFilter] = useState('ALL');

  // Verification modal state
  const [selectedProductToVerify, setSelectedProductToVerify] = useState(null);
  const [verifyForm, setVerifyForm] = useState({
    score: 90,
    status: 'VERIFIED',
    notes: '',
    visualFreshness: true,
    pesticideSafe: true,
    packagingWeight: true,
    farmerTraceability: true
  });

  // Complaint resolve modal state (legacy quick-resolve)
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolveForm, setResolveForm] = useState({
    status: 'RESOLVED',
    resolutionNotes: ''
  });

  const showToast = (msg) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(null), 3500);
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [dashRes, usersRes, ordRes, delRes, prodRes, compRes, farmRes, analyticsRes, auditRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getUsers(selectedRoleFilter),
        adminAPI.getAllOrders(),
        adminAPI.getAllDeliveries(),
        adminAPI.getProductsForReview().catch(() => ({ data: { data: [] } })),
        adminAPI.getAllComplaints(complaintFilter).catch(() => ({ data: { data: [] } })),
        adminAPI.getFarmers().catch(() => ({ data: { data: [] } })),
        adminAPI.getComplaintAnalytics().catch(() => ({ data: { data: null } })),
        adminAPI.getAuditLogs().catch(() => ({ data: { data: [] } }))
      ]);

      if (dashRes.data && dashRes.data.success) setData(dashRes.data.data);
      if (usersRes.data && usersRes.data.success) setUsers(usersRes.data.users);
      if (ordRes.data && ordRes.data.success) setOrders(ordRes.data.data);
      if (delRes.data && delRes.data.success) setDeliveries(delRes.data.data);
      if (prodRes.data && prodRes.data.success) setProductsForReview(prodRes.data.data || []);
      if (compRes.data && compRes.data.success) setComplaints(compRes.data.data || []);
      if (farmRes.data && farmRes.data.success) setFarmers(farmRes.data.data || []);
      if (analyticsRes.data && analyticsRes.data.success) setComplaintAnalytics(analyticsRes.data.data);
      if (auditRes.data && auditRes.data.success) setAuditLogs(auditRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedRoleFilter, complaintFilter]);

  // Route sync for /admin/farmers
  useEffect(() => {
    if (initialRoute === '/admin/farmers' || initialRoute?.startsWith('/admin/farmers')) {
      setActiveTab('farmers');
      const parts = initialRoute.split('/');
      if (parts[3]) {
        handleOpenDossier(parts[3]);
      }
    }
  }, [initialRoute]);

  const handleOpenDossier = async (farmerId) => {
    setLoadingDossier(true);
    setDossierModalOpen(true);
    setDossierTab('overview');
    try {
      const res = await adminAPI.getFarmerProfile(farmerId);
      if (res.data && res.data.success) {
        setSelectedFarmerDossier(res.data.data);
      }
    } catch (e) {
      showToast('Failed to load farmer profile dossier.');
    } finally {
      setLoadingDossier(false);
    }
  };

  const handleOpenActionModal = (farmer, type) => {
    const defaultReasons = {
      WARNING: 'Advisory notice regarding customer dispute and packaging standards compliance.',
      UNDER_REVIEW: 'Dispute tickets under formal administrative compliance inspection.',
      TEMPORARILY_UNLISTED: 'Multiple verified customer quality complaints pending dispute settlement.',
      RESTORE: 'Administrative review completed and standard marketplace standing reinstated.',
      SUSPEND: 'Severe compliance failure or unresolved repeated quality disputes.',
      BANNED: 'Critical breach of platform terms of service and fraudulent conduct.'
    };
    setActionModal({ open: true, type, farmer });
    setActionForm({
      reason: defaultReasons[type] || '',
      duration: type === 'TEMPORARILY_UNLISTED' ? 7 : 0,
      notes: ''
    });
  };

  const handleExecuteFarmerAction = async (e) => {
    if (e) e.preventDefault();
    if (!actionModal.farmer) return;
    setSubmittingAction(true);
    try {
      const farmerId = actionModal.farmer.id || actionModal.farmer.farmerId;
      if (actionModal.type === 'RESTORE') {
        const res = await adminAPI.restoreFarmer(farmerId, actionForm.notes);
        if (res.data && res.data.success) {
          showToast(`✓ Farmer ${actionModal.farmer.name} restored to ACTIVE standing! Products relisted.`);
        }
      } else {
        const res = await adminAPI.updateFarmerStatus(farmerId, {
          status: actionModal.type,
          reason: actionForm.reason,
          duration: actionForm.duration,
          notes: actionForm.notes
        });
        if (res.data && res.data.success) {
          showToast(`✓ Farmer status updated to ${actionModal.type.replace(/_/g, ' ')}!`);
        }
      }
      setActionModal({ open: false, type: '', farmer: null });
      await fetchStats();
      if (dossierModalOpen && selectedFarmerDossier) {
        handleOpenDossier(farmerId);
      }
    } catch (err) {
      showToast('Failed to update farmer status.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleOpenReviewModal = (comp) => {
    setReviewModal({
      open: true,
      complaint: comp,
      decision: comp.adminDecision || 'VALID',
      severity: comp.severity || 'MEDIUM',
      adminNotes: comp.adminNotes || comp.resolutionNotes || ''
    });
  };

  const handleSubmitReview = async (e) => {
    if (e) e.preventDefault();
    if (!reviewModal.complaint) return;
    setSubmittingReview(true);
    try {
      const res = await adminAPI.reviewComplaint(reviewModal.complaint.id, {
        decision: reviewModal.decision,
        severity: reviewModal.severity,
        adminNotes: reviewModal.adminNotes
      });
      if (res.data && res.data.success) {
        showToast(`✓ Dispute #${reviewModal.complaint.id} marked as ${reviewModal.decision} (${reviewModal.severity})!`);
        setReviewModal({ open: false, complaint: null, decision: 'VALID', severity: 'MEDIUM', adminNotes: '' });
        await fetchStats();
      }
    } catch (err) {
      showToast('Failed to submit complaint review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getFarmerStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          label: 'ACTIVE',
          icon: '✓'
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          label: 'WARNING',
          icon: '⚠️'
        };
      case 'UNDER_REVIEW':
        return {
          bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          label: 'UNDER REVIEW',
          icon: '🔍'
        };
      case 'TEMPORARILY_UNLISTED':
        return {
          bg: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
          label: 'TEMPORARILY UNLISTED',
          icon: '⏳'
        };
      case 'SUSPENDED':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          label: 'SUSPENDED',
          icon: '⛔'
        };
      case 'BANNED':
        return {
          bg: 'bg-red-700/30 text-red-200 border-red-600',
          label: 'BANNED',
          icon: '🚫'
        };
      default:
        return {
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          label: status || 'ACTIVE',
          icon: '•'
        };
    }
  };

  const getRiskBadge = (riskInsight) => {
    const level = riskInsight?.riskLevel || 'LOW RISK';
    const score = riskInsight?.riskScore ?? 10;
    if (level === 'HIGH RISK' || score >= 70) {
      return {
        bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        dot: 'bg-rose-500',
        label: 'HIGH RISK',
        score
      };
    }
    if (level === 'MEDIUM RISK' || score >= 35) {
      return {
        bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        dot: 'bg-amber-500',
        label: 'MEDIUM RISK',
        score
      };
    }
    return {
      bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      dot: 'bg-emerald-500',
      label: 'LOW RISK',
      score
    };
  };

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

  const handleOpenVerify = (prod) => {
    setSelectedProductToVerify(prod);
    setVerifyForm({
      score: prod.qualityScore || 85,
      status: prod.qualityStatus || 'VERIFIED',
      notes: prod.verificationNotes || '',
      visualFreshness: prod.verificationChecks?.visualFreshness ?? true,
      pesticideSafe: prod.verificationChecks?.pesticideSafe ?? true,
      packagingWeight: prod.verificationChecks?.packagingWeight ?? true,
      farmerTraceability: prod.verificationChecks?.farmerTraceability ?? true
    });
  };

  const handleVerifySubmit = async (statusOverride) => {
    if (!selectedProductToVerify) return;
    const finalStatus = statusOverride || verifyForm.status;
    try {
      const res = await adminAPI.verifyProduct(selectedProductToVerify.id, {
        status: finalStatus,
        qualityScore: Number(verifyForm.score),
        verificationChecks: {
          visualFreshness: verifyForm.visualFreshness,
          pesticideSafe: verifyForm.pesticideSafe,
          packagingWeight: verifyForm.packagingWeight,
          farmerTraceability: verifyForm.farmerTraceability
        },
        notes: verifyForm.notes
      });
      if (res.data && res.data.success) {
        showToast(`Product quality updated to ${finalStatus}!`);
        setSelectedProductToVerify(null);
        fetchStats();
      }
    } catch (err) {
      showToast('Failed to update quality verification.');
    }
  };

  const handleOpenResolve = (comp) => {
    setSelectedComplaint(comp);
    setResolveForm({
      status: comp.status === 'RESOLVED' ? 'RESOLVED' : 'RESOLVED',
      resolutionNotes: comp.resolutionNotes || 'Dispute reviewed. Escrow credit authorized for consumer and seller warned.'
    });
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      const res = await adminAPI.updateComplaint(selectedComplaint.id, {
        status: resolveForm.status,
        resolutionNotes: resolveForm.resolutionNotes
      });
      if (res.data && res.data.success) {
        showToast(`Dispute #${selectedComplaint.id} marked as ${resolveForm.status}!`);
        setSelectedComplaint(null);
        fetchStats();
      }
    } catch (err) {
      showToast('Failed to update dispute status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Toast Alert */}
      {adminToast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-violet-950 border border-violet-500/50 text-violet-200 text-xs font-bold shadow-2xl flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-violet-400" />
          <span>{adminToast}</span>
        </div>
      )}
      
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-violet-950/80 via-slate-900 to-slate-900 border border-violet-500/30 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/20 border border-violet-500/40 text-violet-400 flex items-center justify-center text-3xl shadow-inner">
            👨‍💼
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{currentUser.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40 uppercase">
                Platform Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-violet-400" />
              <span>AgroBridge Central Operations • Role Authorization Tower</span>
            </p>
          </div>
        </div>

        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-violet-400' : ''}`} />
          <span className="text-xs font-semibold">Refresh Telemetry</span>
        </button>
      </div>

      {/* Role Distribution Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { role: 'FARMER', label: 'Farmers', emoji: '👨‍🌾', count: data?.roleCounts?.FARMER || 1, color: 'text-emerald-400' },
          { role: 'CONSUMER', label: 'Consumers', emoji: '🛒', count: data?.roleCounts?.CONSUMER || 1, color: 'text-teal-400' },
          { role: 'BULK_BUYER', label: 'Bulk Buyers', emoji: '🏢', count: data?.roleCounts?.BULK_BUYER || 1, color: 'text-indigo-400' },
          { role: 'DRIVER', label: 'Drivers', emoji: '🚚', count: data?.roleCounts?.DRIVER || 1, color: 'text-amber-400' },
          { role: 'ADMIN', label: 'Admins', emoji: '👨‍💼', count: data?.roleCounts?.ADMIN || 1, color: 'text-violet-400' }
        ].map((item) => (
          <div
            key={item.role}
            onClick={() => {
              setSelectedRoleFilter(selectedRoleFilter === item.role ? '' : item.role);
              setActiveTab('users');
            }}
            className={`p-4 rounded-2xl bg-slate-900/90 border cursor-pointer transition-all ${
              selectedRoleFilter === item.role
                ? 'border-violet-500 shadow-lg shadow-violet-500/10'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-2xl mb-1">
              <span>{item.emoji}</span>
              <span className={`text-2xl font-black ${item.color}`}>{item.count}</span>
            </div>
            <div className="text-xs font-bold text-slate-300">{item.label}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Filter users below</div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => {
            setActiveTab('farmers');
            onNavigate?.('/admin/farmers');
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'farmers' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-300" />
          <span>👨‍🌾 Farmer Management ({farmers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'complaints' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <LifeBuoy className="w-4 h-4 text-amber-300" />
          <span>⚠️ Disputes & Review ({complaints.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4 text-indigo-300" />
          <span>📊 Dispute Analytics</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'audit' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4 text-violet-300" />
          <span>📜 Action History ({auditLogs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('quality')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'quality' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-teal-300" />
          <span>Quality Verification ({productsForReview.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'users' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'orders' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders ({orders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('deliveries')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'deliveries' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Deliveries ({deliveries.length})</span>
        </button>
      </div>

      {/* TAB: FARMER MANAGEMENT */}
      {activeTab === 'farmers' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-6 animate-fadeIn">
          {/* Header & Policy Summary */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <span>👨‍🌾 Admin Farmer Management & Compliance</span>
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {farmers.length} Registered Producers
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Direct oversight of farmer standing, complaint action protocols, temporary marketplace unlisting, and AI Risk Insights.
              </p>
            </div>

            {/* Threshold policy badge */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Complaint Action Framework</span>
              </div>
              <p className="text-[10px] text-slate-400">
                1 Complaint: Review only • 2 Verified: Warning Suggestion • 3+ Verified: Temporary Unlisting. Human Admin approval mandatory.
              </p>
            </div>
          </div>

          {/* Quick KPI summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Farmers</span>
              <span className="text-xl font-black text-white">{farmers.length}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-emerald-500 block">Active Standing</span>
              <span className="text-xl font-black text-emerald-400">
                {farmers.filter(f => f.accountStatus === 'ACTIVE').length}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-amber-500 block">Warnings Active</span>
              <span className="text-xl font-black text-amber-400">
                {farmers.filter(f => f.accountStatus === 'WARNING').length}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-blue-400 block">Under Review</span>
              <span className="text-xl font-black text-blue-300">
                {farmers.filter(f => f.accountStatus === 'UNDER_REVIEW').length}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-orange-500 block">Temp. Unlisted</span>
              <span className="text-xl font-black text-orange-400">
                {farmers.filter(f => f.accountStatus === 'TEMPORARILY_UNLISTED').length}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-rose-500 block">Suspended / Ban</span>
              <span className="text-xl font-black text-rose-400">
                {farmers.filter(f => f.accountStatus === 'SUSPENDED' || f.accountStatus === 'BANNED').length}
              </span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={farmerSearch}
                onChange={(e) => setFarmerSearch(e.target.value)}
                placeholder="Search by farmer name, farm, district, or email..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <select
                value={farmerStatusFilter}
                onChange={(e) => setFarmerStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="ALL">Status: All Statuses</option>
                <option value="ACTIVE">Status: ACTIVE</option>
                <option value="WARNING">Status: WARNING</option>
                <option value="UNDER_REVIEW">Status: UNDER REVIEW</option>
                <option value="TEMPORARILY_UNLISTED">Status: TEMPORARILY UNLISTED</option>
                <option value="SUSPENDED">Status: SUSPENDED</option>
                <option value="BANNED">Status: BANNED</option>
              </select>

              <select
                value={farmerRiskFilter}
                onChange={(e) => setFarmerRiskFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="ALL">Risk: All Levels</option>
                <option value="LOW RISK">Risk: LOW RISK</option>
                <option value="MEDIUM RISK">Risk: MEDIUM RISK</option>
                <option value="HIGH RISK">Risk: HIGH RISK</option>
              </select>
            </div>
          </div>

          {/* Farmers Directory Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Farmer Profile</th>
                  <th className="py-3.5 px-4 font-bold">Account Status</th>
                  <th className="py-3.5 px-4 font-bold">AI Risk Indicator</th>
                  <th className="py-3.5 px-4 font-bold">Inventory</th>
                  <th className="py-3.5 px-4 font-bold">Customer Trust</th>
                  <th className="py-3.5 px-4 font-bold">Disputes</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {farmers
                  .filter(f => {
                    const matchQ = !farmerSearch || (
                      f.name?.toLowerCase().includes(farmerSearch.toLowerCase()) ||
                      f.farmName?.toLowerCase().includes(farmerSearch.toLowerCase()) ||
                      f.location?.toLowerCase().includes(farmerSearch.toLowerCase()) ||
                      f.email?.toLowerCase().includes(farmerSearch.toLowerCase())
                    );
                    const matchStatus = farmerStatusFilter === 'ALL' || f.accountStatus === farmerStatusFilter;
                    const matchRisk = farmerRiskFilter === 'ALL' || f.riskInsight?.riskLevel === farmerRiskFilter;
                    return matchQ && matchStatus && matchRisk;
                  })
                  .map((farmer) => {
                    const statusBadge = getFarmerStatusBadge(farmer.accountStatus);
                    const riskBadge = getRiskBadge(farmer.riskInsight);

                    return (
                      <tr key={farmer.id || farmer.farmerId} className="hover:bg-slate-900/60 transition-colors">
                        {/* Profile */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600/30 to-teal-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-black text-sm shrink-0">
                              {farmer.name?.charAt(0) || 'F'}
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm flex items-center gap-1.5">
                                <span>{farmer.name}</span>
                              </div>
                              <div className="text-xs text-emerald-400 font-medium">{farmer.farmName}</div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <span>📍 {farmer.location}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Account Status */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${statusBadge.bg}`}>
                              <span>{statusBadge.icon}</span>
                              <span>{statusBadge.label}</span>
                            </span>
                            {farmer.accountStatus === 'TEMPORARILY_UNLISTED' && farmer.unlistedUntil && (
                              <div className="text-[10px] text-amber-300 font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                                <span>Until: {new Date(farmer.unlistedUntil).toLocaleDateString()}</span>
                              </div>
                            )}
                            {farmer.statusReason && farmer.accountStatus !== 'ACTIVE' && (
                              <div className="text-[10px] text-slate-400 max-w-xs truncate" title={farmer.statusReason}>
                                Reason: {farmer.statusReason}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* AI Risk Indicator */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${riskBadge.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${riskBadge.dot}`} />
                              <span>{riskBadge.label} ({riskBadge.score}/100)</span>
                            </span>
                            <div className="text-[9px] text-slate-500 font-medium">
                              AI-Assisted Risk Indicator
                            </div>
                          </div>
                        </td>

                        {/* Inventory & Volume */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="text-white font-bold">{farmer.totalProducts} active crops</div>
                            <div className="text-[11px] text-slate-400">{farmer.totalOrders} total orders</div>
                          </div>
                        </td>

                        {/* Customer Trust */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="text-amber-400 font-bold flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span>{farmer.averageRating}★</span>
                            </div>
                            <div className="text-[10px] text-slate-400">{farmer.totalFeedbacks} reviews</div>
                          </div>
                        </td>

                        {/* Complaints */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="text-slate-300 text-xs font-semibold">
                              {farmer.totalComplaints} filed
                            </div>
                            {farmer.verifiedComplaints > 0 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 inline-block">
                                ⚠️ {farmer.verifiedComplaints} Verified
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-400 font-semibold">
                                ✓ 0 Verified
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleOpenDossier(farmer.id || farmer.farmerId)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 border border-slate-700 transition-colors"
                              title="View Full Profile Dossier"
                            >
                              <Eye className="w-3 h-3 text-emerald-400" />
                              <span>View Profile</span>
                            </button>

                            {/* Conditional Action Buttons */}
                            {farmer.accountStatus === 'TEMPORARILY_UNLISTED' ? (
                              <button
                                onClick={() => handleOpenActionModal(farmer, 'RESTORE')}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-[11px] font-bold border border-emerald-500/40 transition-colors flex items-center gap-1"
                                title="Restore Farmer to Active Status"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Restore</span>
                              </button>
                            ) : farmer.accountStatus === 'SUSPENDED' || farmer.accountStatus === 'BANNED' ? (
                              <button
                                onClick={() => handleOpenActionModal(farmer, 'RESTORE')}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-[11px] font-bold border border-emerald-500/40 transition-colors flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Reinstate</span>
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleOpenActionModal(farmer, 'WARNING')}
                                  className="px-2 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30 transition-colors"
                                  title="Send Official Platform Warning"
                                >
                                  Warning
                                </button>
                                <button
                                  onClick={() => handleOpenActionModal(farmer, 'UNDER_REVIEW')}
                                  className="px-2 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-[11px] font-bold border border-blue-500/30 transition-colors"
                                  title="Put Farmer Account Under Review"
                                >
                                  Review
                                </button>
                                <button
                                  onClick={() => handleOpenActionModal(farmer, 'TEMPORARILY_UNLISTED')}
                                  className="px-2 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-slate-950 text-[11px] font-bold border border-orange-500/40 transition-colors"
                                  title="Temporarily Unlist Products from Marketplaces"
                                >
                                  Unlist
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => handleOpenActionModal(farmer, 'BANNED')}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-400 border border-transparent hover:border-rose-800 transition-colors"
                              title="Ban Farmer Account"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: USERS */}
      {activeTab === 'users' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-400" />
              <span>Registered Accounts Directory</span>
            </h2>
            {selectedRoleFilter && (
              <button onClick={() => setSelectedRoleFilter('')} className="text-xs text-violet-400 hover:underline">
                Clear Filter ({selectedRoleFilter})
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Assigned Role</th>
                  <th className="pb-3">Role Details</th>
                  <th className="pb-3">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {users.map((u) => (
                  <tr key={u._id || u.userId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-semibold text-white">{u.name}</td>
                    <td className="py-3 font-mono text-slate-300">{u.email}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getRoleBadge(u.role)}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {u.role === 'FARMER' && (u.farmName || 'Organic Farm')}
                      {u.role === 'CONSUMER' && (u.address || 'Residential')}
                      {u.role === 'BULK_BUYER' && (u.businessName || 'Commercial Wholesaler')}
                      {u.role === 'DRIVER' && `${u.vehicleType || 'Truck'} (${u.driverStatus || 'OFFLINE'})`}
                      {u.role === 'ADMIN' && 'Central Control'}
                    </td>
                    <td className="py-3 text-slate-400">{u.city || 'Bhopal'}, {u.state || 'MP'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS */}
      {activeTab === 'orders' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-violet-400" />
            <span>Platform-wide Disintermediation Orders ({orders.length})</span>
          </h2>

          <div className="space-y-3">
            {orders.map((ord) => (
              <div key={ord.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-violet-400 font-bold text-xs">{ord.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase">
                      {ord.status}
                    </span>
                    <span className="text-xs text-slate-400">Buyer: {ord.buyer_name}</span>
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    Items: {ord.items.map(i => `${i.product_name} (${i.quantity_kg}kg)`).join(', ')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-white">₹{ord.total_amount}</div>
                  <div className="text-[11px] text-emerald-400 font-semibold">{ord.payment_method}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DELIVERIES */}
      {activeTab === 'deliveries' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-violet-400" />
            <span>Logistics Dispatch Telemetry ({deliveries.length})</span>
          </h2>

          <div className="space-y-3">
            {deliveries.map((del) => (
              <div key={del.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-400 font-bold text-xs">{del.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                      {del.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-300">Driver: {del.driver_name} ({del.vehicle_number})</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Pickup: {del.pickup_location} ➔ Drop: {del.dropoff_location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-amber-400">₹{del.payout} Payout</div>
                  <div className="text-[11px] text-slate-400">Distance: {del.distance_km} km</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: QUALITY VERIFICATION */}
      {activeTab === 'quality' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>AgroBridge Assured Quality Verification ({productsForReview.length})</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enforce physical grading, lab/pesticide conformance, and weight authentication before granting Assured certification.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              Standard: Score ≥ 85 = Assured
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productsForReview.map((prod) => {
              const isAss = prod.isAssured || (prod.qualityStatus === 'VERIFIED' && (prod.qualityScore || 0) >= 85);
              return (
                <div key={prod.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono bg-slate-900 text-slate-400">
                        {prod.id}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${
                        prod.qualityStatus === 'VERIFIED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : prod.qualityStatus === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : prod.qualityStatus === 'NEEDS_UPDATE'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {prod.qualityStatus || 'PENDING'}
                      </span>
                    </div>

                    <div className="flex gap-3 items-center">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-800 shrink-0 bg-slate-950">
                        <AgroProductImage
                          src={getProductImage(prod)}
                          alt={prod.product_name}
                          category={prod.category}
                          className="w-full h-full object-cover"
                          aspectRatio=""
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">{prod.product_name}</div>
                        <div className="text-xs text-slate-400 mt-0.5 truncate">👨‍🌾 {prod.farmer_name || prod.farm_name}</div>
                        <div className="text-xs text-emerald-400 font-bold mt-1">₹{prod.price_per_kg || prod.price}/kg</div>
                      </div>
                    </div>

                    <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Quality Score:</span>
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className={isAss ? 'text-emerald-400' : 'text-slate-300'}>
                          {prod.qualityScore || 0}/100
                        </span>
                        {isAss && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-black border border-emerald-500/30">
                            ✓ Assured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenVerify(prod)}
                    className="w-full mt-2 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-xs border border-emerald-500/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Review & Certify</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: COMPLAINTS & DISPUTES */}
      {activeTab === 'complaints' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-black text-white">
                  Complaint Monitoring & Action System ({complaints.length})
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Admin review tribunal for customer disputes. Complaints marked as VALID affect farmer compliance standing.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {['', 'SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setComplaintFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    complaintFilter === status
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {status ? status.replace('_', ' ') : 'ALL DISPUTES'}
                </button>
              ))}
            </div>
          </div>

          {/* Complaint Threshold System Guidance Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-amber-300 block text-xs">
                  AgroBridge Complaint Threshold Protocol (Zero Automated Punishment)
                </span>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                  <strong>1 complaint:</strong> Logged without action • <strong>2 complaints:</strong> Warning suggestion to Admin • <strong>3+ verified:</strong> Temporary Unlisting suggestion. Human administrative review is strictly required before any punitive or unlisting action is taken.
                </p>
              </div>
            </div>
          </div>

          {complaints.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-400 text-xs">
              No active dispute tickets found for the selected filter.
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((comp) => {
                const isVerified = comp.isVerified === true || comp.adminDecision === 'VALID';
                const severity = comp.severity || 'MEDIUM';
                const severityColors = {
                  LOW: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                  MEDIUM: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                  HIGH: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
                  CRITICAL: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                };

                return (
                  <div key={comp.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-amber-400">#{comp.id}</span>
                        
                        {/* Status */}
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase ${
                          comp.status === 'RESOLVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : comp.status === 'UNDER_REVIEW'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : comp.status === 'IN_PROGRESS'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}>
                          {comp.status}
                        </span>

                        {/* Severity Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${severityColors[severity] || severityColors.MEDIUM}`}>
                          Severity: {severity}
                        </span>

                        {/* Admin Decision Badge */}
                        {comp.adminDecision ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                            comp.adminDecision === 'VALID'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : comp.adminDecision === 'INVALID'
                              ? 'bg-slate-800 text-slate-300 border-slate-700'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          }`}>
                            {comp.adminDecision === 'VALID' ? '✓ Verified Valid' : comp.adminDecision === 'INVALID' ? '✕ Invalid / Dismissed' : 'ℹ️ Need More Info'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700 uppercase">
                            ⏳ Pending Admin Review
                          </span>
                        )}

                        <span className="text-xs text-slate-400">
                          Order: <strong className="text-white">{comp.orderId || comp.order_id}</strong>
                        </span>
                      </div>

                      <div className="text-xs text-slate-400">
                        Filed {new Date(comp.createdAt || comp.created_at).toLocaleDateString()} by <strong className="text-slate-200">{comp.consumerName || comp.consumer_name}</strong>
                      </div>
                    </div>

                    {/* Produce & Producer Info */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="text-slate-400">Produce: </span>
                        <strong className="text-emerald-400 font-bold">{comp.productName || comp.product_name}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Target Farmer: </span>
                        <button
                          onClick={() => handleOpenDossier(comp.farmerId || comp.farmer_id)}
                          className="text-amber-400 hover:underline font-bold"
                        >
                          👨‍🌾 {comp.farmerName || comp.farmer_name || 'Assigned Farmer'}
                        </button>
                      </div>
                      <div>
                        <span className="text-slate-400">Category: </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                          {comp.issueCategory || comp.issue_category || 'QUALITY_ISSUE'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Buyer Grievance */}
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center justify-between">
                          <span>🛒 Consumer Grievance: {comp.reason || comp.title}</span>
                        </div>
                        <p className="text-slate-300 italic">
                          "{comp.description}"
                        </p>
                        {(comp.evidencePhotos || comp.evidence_urls) && (comp.evidencePhotos?.length > 0 || comp.evidence_urls?.length > 0) && (
                          <div className="pt-2">
                            <span className="text-[10px] text-slate-400 block mb-1">Evidence Photos:</span>
                            <div className="flex gap-2">
                              {(comp.evidencePhotos || comp.evidence_urls).map((img, idx) => (
                                <img
                                  key={idx}
                                  src={typeof img === 'string' ? img : img.url}
                                  alt={`evidence-${idx}`}
                                  className="w-14 h-14 rounded-lg object-cover border border-slate-700"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Farmer Response & Admin Notes */}
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">
                          👨‍🌾 Producer Statement
                        </div>
                        {comp.farmerResponse || comp.farmer_response ? (
                          <p className="text-slate-300 italic">
                            "{comp.farmerResponse || comp.farmer_response}"
                          </p>
                        ) : (
                          <p className="text-slate-500 text-xs italic">
                            No response submitted yet by farmer.
                          </p>
                        )}

                        {(comp.adminNotes || comp.resolutionNotes) && (
                          <div className="pt-2 border-t border-slate-800 space-y-1">
                            <span className="text-[10px] font-bold text-amber-400 uppercase">
                              Admin Review Notes ({comp.reviewedBy || 'Admin'}):
                            </span>
                            <p className="text-slate-300 text-xs italic">
                              "{comp.adminNotes || comp.resolutionNotes}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Toolbar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenDossier(comp.farmerId || comp.farmer_id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-800 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>View Farmer Dossier</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenReviewModal(comp)}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Review & Verify Dispute</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: DISPUTE ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <span>Complaint & Dispute Intelligence Analytics</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Holistic platform grievance metrics, category distributions, severity analysis, and high-dispute producers.
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Disputes Filed</span>
              <div className="text-2xl font-black text-white">{complaintAnalytics?.totalComplaints ?? complaints.length}</div>
              <span className="text-[10px] text-slate-500">Across all orders</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Resolved Disputes</span>
              <div className="text-2xl font-black text-emerald-400">{complaintAnalytics?.resolvedCount ?? 0}</div>
              <span className="text-[10px] text-emerald-500/80 font-semibold">Mediated & settled</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-indigo-400">Resolution Rate</span>
              <div className="text-2xl font-black text-indigo-300">{complaintAnalytics?.resolutionRate ?? 100}%</div>
              <span className="text-[10px] text-slate-500">High efficiency handling</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-rose-400">Verified Valid Issues</span>
              <div className="text-2xl font-black text-rose-400">
                {complaintAnalytics?.byDecision?.VALID ?? complaints.filter(c => c.isVerified).length}
              </div>
              <span className="text-[10px] text-rose-400/80 font-semibold">Proved quality failures</span>
            </div>
          </div>

          {/* Breakdown Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* By Severity */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                By Severity Classification
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { level: 'CRITICAL', color: 'bg-rose-500 text-rose-300', count: complaintAnalytics?.bySeverity?.CRITICAL ?? 0 },
                  { level: 'HIGH', color: 'bg-orange-500 text-orange-300', count: complaintAnalytics?.bySeverity?.HIGH ?? 0 },
                  { level: 'MEDIUM', color: 'bg-amber-500 text-amber-300', count: complaintAnalytics?.bySeverity?.MEDIUM ?? 0 },
                  { level: 'LOW', color: 'bg-emerald-500 text-emerald-300', count: complaintAnalytics?.bySeverity?.LOW ?? 0 }
                ].map(item => (
                  <div key={item.level} className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="font-bold text-slate-300">{item.level}</span>
                    <span className="font-black px-2 py-0.5 rounded bg-slate-950 text-white font-mono">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Admin Decision */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                By Administrative Verdict
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'VALID (Verified)', count: complaintAnalytics?.byDecision?.VALID ?? 0, color: 'text-rose-400' },
                  { label: 'INVALID (Dismissed)', count: complaintAnalytics?.byDecision?.INVALID ?? 0, color: 'text-slate-400' },
                  { label: 'NEED MORE INFO', count: complaintAnalytics?.byDecision?.NEED_MORE_INFO ?? 0, color: 'text-blue-400' },
                  { label: 'PENDING REVIEW', count: complaintAnalytics?.byDecision?.PENDING ?? 0, color: 'text-amber-400' }
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className={`font-bold ${item.color}`}>{item.label}</span>
                    <span className="font-black px-2 py-0.5 rounded bg-slate-950 text-white font-mono">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Complaint Farmers */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                Producers with Verified Disputes
              </h3>
              <div className="space-y-2 text-xs">
                {(complaintAnalytics?.topComplaintFarmers || []).length === 0 ? (
                  <div className="text-slate-500 text-center py-6">
                    No verified complaints against any producers.
                  </div>
                ) : (
                  (complaintAnalytics?.topComplaintFarmers || []).map(f => (
                    <div key={f.farmerId} className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <div>
                        <div className="font-bold text-white">{f.farmerName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{f.farmerId}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          {f.count} Verified
                        </span>
                        <button
                          onClick={() => handleOpenDossier(f.farmerId)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Open Dossier"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: AUDIT LOGS & ACTION HISTORY */}
      {activeTab === 'audit' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-violet-400" />
                <span>Admin Action History & Policy Audit Log ({auditLogs.length})</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Immutable audit trail of all farmer status changes, temporary unlisting, and dispute reviews.
              </p>
            </div>
            <button
              onClick={fetchStats}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No administrative actions logged yet.
              </div>
            ) : (
              auditLogs.map((log) => {
                const actionColors = {
                  WARNING_SENT: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                  UNLISTED: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
                  RESTORED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                  UNDER_REVIEW: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
                  SUSPENDED: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                  BANNED: 'bg-red-800/30 text-red-200 border-red-600',
                  COMPLAINT_REVIEWED: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                };

                return (
                  <div key={log.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase ${actionColors[log.action] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                          {log.action?.replace(/_/g, ' ')}
                        </span>
                        <span className="font-bold text-white">
                          Target: {log.farmerName} ({log.farmerId})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="text-slate-300">
                      <strong>Reason / Justification:</strong> {log.reason}
                    </div>

                    {log.durationDays && (
                      <div className="text-amber-300 text-[11px] font-mono">
                        ⏳ Duration: {log.durationDays} Days • Unlisted Until: {new Date(log.unlistedUntil).toLocaleDateString()}
                      </div>
                    )}

                    {log.notes && (
                      <div className="text-slate-400 text-[11px] italic bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
                        Admin Note: "{log.notes}"
                      </div>
                    )}

                    <div className="text-[10px] text-slate-500 pt-1 flex items-center justify-between">
                      <span>Action authorized by: <strong className="text-slate-400">{log.adminName}</strong> ({log.adminId})</span>
                      <span className="font-mono text-slate-600">ID: {log.id}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Quality Verification Modal */}
      {selectedProductToVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Quality Audit & Certification</h3>
              </div>
              <button
                onClick={() => setSelectedProductToVerify(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-800 bg-slate-900">
                <AgroProductImage
                  src={getProductImage(selectedProductToVerify)}
                  alt={selectedProductToVerify.product_name}
                  category={selectedProductToVerify.category}
                  className="w-full h-full object-cover"
                  aspectRatio=""
                />
              </div>
              <div>
                <div className="text-sm font-bold text-white">{selectedProductToVerify.product_name}</div>
                <div className="text-xs text-slate-400">Producer: {selectedProductToVerify.farmer_name || selectedProductToVerify.farm_name}</div>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mandatory Verification Protocol:</span>
              {[
                { key: 'visualFreshness', label: '1. Visual inspection & physical grading passed' },
                { key: 'pesticideSafe', label: '2. Chemical residue & pesticide limits within safety bands' },
                { key: 'packagingWeight', label: '3. Accurate weight verification & protective packaging' },
                { key: 'farmerTraceability', label: '4. Farmer identity & farm geolocation authenticated' }
              ].map((item) => (
                <label
                  key={item.key}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700"
                >
                  <span className="text-xs text-slate-300">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(verifyForm[item.key])}
                    onChange={(e) => setVerifyForm({ ...verifyForm, [item.key]: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                  />
                </label>
              ))}
            </div>

            {/* Quality Score Slider */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Assigned Quality Score:</span>
                <span className={`text-base font-black ${verifyForm.score >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {verifyForm.score} / 100
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={verifyForm.score}
                onChange={(e) => setVerifyForm({ ...verifyForm, score: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="text-[10px] text-slate-400">
                {verifyForm.score >= 85 
                  ? '✓ Qualifies for "AgroBridge Assured" quality badge upon approval.' 
                  : '⚠️ Score below 85: Will be standard listing without Assured badge.'}
              </div>
            </div>

            {/* Admin Notes */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Verification Audit Notes:</label>
              <textarea
                value={verifyForm.notes}
                onChange={(e) => setVerifyForm({ ...verifyForm, notes: e.target.value })}
                placeholder="E.g., Inspected at central sorting center. Moisture 12%, pesticide report verified clean."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleVerifySubmit('VERIFIED')}
                className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors"
              >
                Approve (VERIFIED)
              </button>
              <button
                type="button"
                onClick={() => handleVerifySubmit('NEEDS_UPDATE')}
                className="py-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-bold text-xs border border-blue-500/40 transition-colors"
              >
                Request Update
              </button>
              <button
                type="button"
                onClick={() => handleVerifySubmit('REJECTED')}
                className="py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs border border-rose-500/40 transition-colors"
              >
                Reject Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Resolution Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleResolveSubmit} className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Mediate Dispute #{selectedComplaint.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400">Order: <strong className="text-white">{selectedComplaint.orderId}</strong></div>
                <div className="text-slate-400">Buyer: <strong className="text-white">{selectedComplaint.consumerName}</strong></div>
                <div className="text-slate-400">Reason: <strong className="text-amber-300">{selectedComplaint.reason}</strong></div>
                <div className="text-slate-300 italic mt-1">"{selectedComplaint.description}"</div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Update Ticket Status:</label>
                <select
                  value={resolveForm.status}
                  onChange={(e) => setResolveForm({ ...resolveForm, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="IN_PROGRESS">IN PROGRESS (Escrow Hold)</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Resolution Notes / Action Taken:</label>
                <textarea
                  value={resolveForm.resolutionNotes}
                  onChange={(e) => setResolveForm({ ...resolveForm, resolutionNotes: e.target.value })}
                  placeholder="E.g., Refund issued from escrow to consumer wallet. Seller received official quality reprimand."
                  rows={3}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors"
              >
                Submit Resolution
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. COMPLAINT REVIEW & VERIFICATION MODAL                     */}
      {/* ============================================================ */}
      {reviewModal.open && reviewModal.complaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSubmitReview}
            className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Dispute Investigation & Verification</h3>
                  <p className="text-[11px] text-slate-400">Ticket ID: #{reviewModal.complaint.id} • Order: {reviewModal.complaint.orderId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReviewModal({ open: false, complaint: null, decision: 'VALID', severity: 'MEDIUM', adminNotes: '' })}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Complaint Summary Details */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Complainant (Buyer)</span>
                  <span className="text-white font-medium">{reviewModal.complaint.consumerName || reviewModal.complaint.consumerId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Respondent (Farmer)</span>
                  <span className="text-white font-medium">{reviewModal.complaint.farmerName || reviewModal.complaint.farmerId}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Dispute Classification</span>
                <span className="text-amber-300 font-bold">{reviewModal.complaint.reason}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Buyer Statement</span>
                <p className="text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 text-[11px] italic">
                  "{reviewModal.complaint.description}"
                </p>
              </div>
            </div>

            {/* Admin Verification Decision */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Administrative Finding:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'VALID', label: 'VALID DISPUTE', desc: 'Farmer at fault. Adds to verified record & affects risk profile.', color: 'border-rose-500/50 bg-rose-500/10 text-rose-300' },
                  { value: 'INVALID', label: 'INVALID / FRIVOLOUS', desc: 'Buyer error / ungrounded. Excluded from farmer risk score.', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' },
                  { value: 'NEED_MORE_INFO', label: 'PENDING INFO', desc: 'Evidence inconclusive. Awaiting buyer or farmer proof.', color: 'border-amber-500/50 bg-amber-500/10 text-amber-300' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setReviewModal({ ...reviewModal, decision: opt.value })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      reviewModal.decision === opt.value
                        ? `${opt.color} ring-2 ring-indigo-500`
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-[11px]">{opt.label}</div>
                    <div className="text-[9px] text-slate-400 mt-1 line-clamp-2">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Assignment */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Assigned Severity Level:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'LOW', label: 'LOW', desc: 'Minor flaw / packaging delay' },
                  { value: 'MEDIUM', label: 'MEDIUM', desc: 'Moderate spoilage / mismatch' },
                  { value: 'HIGH', label: 'HIGH', desc: 'Severe rot / weight defect' },
                  { value: 'CRITICAL', label: 'CRITICAL', desc: 'Toxic / pesticide / fraud' }
                ].map((sev) => (
                  <button
                    key={sev.value}
                    type="button"
                    onClick={() => setReviewModal({ ...reviewModal, severity: sev.value })}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      reviewModal.severity === sev.value
                        ? 'border-indigo-500 bg-indigo-500/20 text-white font-bold ring-1 ring-indigo-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold block">{sev.label}</span>
                    <span className="text-[8px] text-slate-500 block leading-tight mt-0.5">{sev.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Audit Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">
                Investigation Findings & Justification:
              </label>
              <textarea
                value={reviewModal.adminNotes}
                onChange={(e) => setReviewModal({ ...reviewModal, adminNotes: e.target.value })}
                placeholder="Detail verification steps: photos checked, moisture report, batch numbers, buyer outreach..."
                rows={3}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Protocol Notice */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Compliance Policy:</strong> Only complaints marked <em>VALID</em> increment the farmer's verified complaint counter and factor into the AI-Assisted Risk Engine.
              </span>
            </div>

            {/* Modal Buttons */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setReviewModal({ open: false, complaint: null, decision: 'VALID', severity: 'MEDIUM', adminNotes: '' })}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {submittingReview ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Save Finding & Update Risk</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. FARMER ADMINISTRATIVE ACTION MODAL                        */}
      {/* ============================================================ */}
      {actionModal.open && actionModal.farmer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleExecuteFarmerAction}
            className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 shadow-2xl overflow-hidden"
          >
            {/* Action Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  actionModal.type === 'RESTORE'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : actionModal.type === 'TEMPORARILY_UNLISTED'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    : actionModal.type === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : actionModal.type === 'UNDER_REVIEW'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}>
                  {actionModal.type === 'RESTORE' && <UserCheck className="w-5 h-5" />}
                  {actionModal.type === 'WARNING' && <AlertTriangle className="w-5 h-5" />}
                  {actionModal.type === 'UNDER_REVIEW' && <Clock className="w-5 h-5" />}
                  {actionModal.type === 'TEMPORARILY_UNLISTED' && <Clock className="w-5 h-5" />}
                  {(actionModal.type === 'SUSPEND' || actionModal.type === 'BANNED') && <Ban className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {actionModal.type === 'RESTORE' && 'Restore Farmer Standing'}
                    {actionModal.type === 'WARNING' && 'Issue Formal Warning Notice'}
                    {actionModal.type === 'UNDER_REVIEW' && 'Put Account Under Review'}
                    {actionModal.type === 'TEMPORARILY_UNLISTED' && 'Temporarily Unlist from Marketplaces'}
                    {actionModal.type === 'SUSPEND' && 'Suspend Farmer Account'}
                    {actionModal.type === 'BANNED' && 'Permanently Ban Farmer Account'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Producer: <span className="text-white font-bold">{actionModal.farmer.name}</span> ({actionModal.farmer.farmName || actionModal.farmer.location})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActionModal({ open: false, type: '', farmer: null })}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Farmer Current Standing Mini Card */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Current Platform Standing</span>
                <span className="text-slate-300 font-medium">
                  {actionModal.farmer.accountStatus || 'ACTIVE'} • {actionModal.farmer.verifiedComplaintsCount || 0} Verified Complaints
                </span>
              </div>
              <div className="text-right space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Active Products</span>
                <span className="text-white font-bold">{actionModal.farmer.totalProducts || 0} crops</span>
              </div>
            </div>

            {/* Special Config for TEMPORARILY_UNLISTED: Duration & Date Preview */}
            {actionModal.type === 'TEMPORARILY_UNLISTED' && (
              <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-orange-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Unlisting Duration:</span>
                    </span>
                    <p className="text-[10px] text-slate-400">Select period before automated eligibility reinstatement</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[3, 7, 14, 30].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setActionForm({ ...actionForm, duration: days })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          Number(actionForm.duration) === days
                            ? 'bg-orange-500 text-slate-950 shadow-md'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {days}d
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Scheduled Unlisting End Date:</span>
                  <span className="text-orange-400 font-mono font-bold">
                    {new Date(Date.now() + (Number(actionForm.duration) || 7) * 86400000).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="text-[10px] text-orange-200/80 space-y-1">
                  <p><strong>System Impact:</strong></p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                    <li>All products hidden from Consumer Marketplace and Bulk Buyer Marketplace.</li>
                    <li>Farmer is blocked from adding new crop listings.</li>
                    <li>Active deliveries and in-transit orders remain completely intact for delivery.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Special Impact Callout for RESTORE */}
            {actionModal.type === 'RESTORE' && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Reinstatement Impact</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Restores farmer to <strong>ACTIVE</strong> standing. All active products will immediately reappear across consumer and bulk marketplaces. The farmer will be able to list new harvest crops again.
                </p>
              </div>
            )}

            {/* High-Risk Alert for SUSPEND or BAN */}
            {(actionModal.type === 'SUSPEND' || actionModal.type === 'BANNED') && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-xs text-rose-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Critical Action Warning</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {actionModal.type === 'BANNED'
                    ? 'Permanent platform ban. Farmer is barred indefinitely, inventory delisted, and login restricted.'
                    : 'Indefinite suspension. Products hidden from marketplace until administrative dispute resolution.'}
                </p>
              </div>
            )}

            {/* Reason Field */}
            {actionModal.type !== 'RESTORE' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  Official Action Reason (Visible to Farmer):
                </label>
                <input
                  type="text"
                  value={actionForm.reason}
                  onChange={(e) => setActionForm({ ...actionForm, reason: e.target.value })}
                  placeholder="Official justification for this action..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {/* Internal Admin Audit Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">
                Internal Audit Documentation & Notes:
              </label>
              <textarea
                value={actionForm.notes}
                onChange={(e) => setActionForm({ ...actionForm, notes: e.target.value })}
                placeholder="Log notes for internal audit trail (investigation ticket IDs, call logs, rationale)..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Modal Buttons */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setActionModal({ open: false, type: '', farmer: null })}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAction}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 ${
                  actionModal.type === 'RESTORE'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                    : actionModal.type === 'TEMPORARILY_UNLISTED'
                    ? 'bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-orange-500/20'
                    : actionModal.type === 'WARNING'
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                    : actionModal.type === 'UNDER_REVIEW'
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                }`}
              >
                {submittingAction ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>
                    {actionModal.type === 'RESTORE' && 'Confirm Reinstatement'}
                    {actionModal.type === 'WARNING' && 'Dispatch Warning'}
                    {actionModal.type === 'UNDER_REVIEW' && 'Set Under Review'}
                    {actionModal.type === 'TEMPORARILY_UNLISTED' && 'Confirm Unlisting'}
                    {actionModal.type === 'SUSPEND' && 'Confirm Suspension'}
                    {actionModal.type === 'BANNED' && 'Confirm Permanent Ban'}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. COMPREHENSIVE FARMER DOSSIER MODAL (/admin/farmers/:id)  */}
      {/* ============================================================ */}
      {dossierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Top Bar */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
              {loadingDossier || !selectedFarmerDossier ? (
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
                  <span className="text-sm font-bold text-slate-300">Retrieving Farmer Compliance Record...</span>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-lg font-black shrink-0">
                    {selectedFarmerDossier.farmer.name?.[0] || 'F'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-lg font-black text-white">{selectedFarmerDossier.farmer.name}</h3>
                      {(() => {
                        const b = getFarmerStatusBadge(selectedFarmerDossier.farmer.accountStatus);
                        return (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${b.bg}`}>
                            {b.icon} {b.label}
                          </span>
                        );
                      })()}
                      {selectedFarmerDossier.riskInsight && (() => {
                        const rb = getRiskBadge(selectedFarmerDossier.riskInsight.level);
                        return (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${rb.bg}`}>
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>{rb.label} ({selectedFarmerDossier.riskInsight.score})</span>
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedFarmerDossier.farmer.farmName} • {selectedFarmerDossier.farmer.location} • Contact: {selectedFarmerDossier.farmer.email}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setDossierModalOpen(false);
                  setSelectedFarmerDossier(null);
                }}
                className="text-slate-400 hover:text-white text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body */}
            {loadingDossier || !selectedFarmerDossier ? (
              <div className="p-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
                <span className="text-xs font-medium">Synthesizing platform transactions, dispute records, and risk signals...</span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* AI-Assisted Risk Engine Card */}
                {selectedFarmerDossier.riskInsight && (
                  <div className="rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white tracking-wide">
                              AI-Assisted Farmer Risk Indicator
                            </span>
                            <span className="text-[9px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                              Diagnostic Engine v2.4
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Multi-factor scoring based on verified customer disputes, severity weights, ratings, and order volume.
                          </p>
                        </div>
                      </div>

                      {/* Score Meter */}
                      <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk Score</span>
                          <span className="text-lg font-black text-white">
                            {selectedFarmerDossier.riskInsight.score} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                          </span>
                        </div>
                        <div className="w-24 bg-slate-800 h-3 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              selectedFarmerDossier.riskInsight.score >= 60
                                ? 'bg-rose-500'
                                : selectedFarmerDossier.riskInsight.score >= 30
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, selectedFarmerDossier.riskInsight.score)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Risk Factor Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block">Verified Disputes</span>
                        <span className="text-base font-black text-white">
                          {selectedFarmerDossier.riskInsight.factors?.verifiedComplaints || 0}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block">Total Complaints</span>
                        <span className="text-base font-black text-slate-300">
                          {selectedFarmerDossier.riskInsight.factors?.totalComplaints || 0}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block">Resolution Rate</span>
                        <span className="text-base font-black text-emerald-400">
                          {selectedFarmerDossier.riskInsight.factors?.resolutionRate || '100%'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block">Buyer Rating</span>
                        <span className="text-base font-black text-amber-400">
                          ★ {selectedFarmerDossier.riskInsight.factors?.averageRating?.toFixed?.(1) || '4.5'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block">Fulfillment Volume</span>
                        <span className="text-base font-black text-white">
                          {selectedFarmerDossier.riskInsight.factors?.orderHistoryVolume || 0} orders
                        </span>
                      </div>
                    </div>

                    {/* AI Recommendation */}
                    <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300 space-y-1">
                      <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Diagnostic Recommendation:</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        {selectedFarmerDossier.riskInsight.recommendation}
                      </p>
                    </div>

                    {/* Mandatory Disclaimer */}
                    <div className="text-[10px] text-slate-500 italic bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50 flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>AI-Assisted Risk Indicator Disclaimer:</strong> {selectedFarmerDossier.riskInsight.disclaimer || 'This risk index is an automated diagnostic advisory tool to assist human decision-making. No disciplinary actions are automated. Administrative interventions require explicit human administrator review and authorization.'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Sub-Tabs Bar */}
                <div className="flex border-b border-slate-800 gap-2">
                  {[
                    { id: 'overview', label: 'Overview & Standing', count: null },
                    { id: 'products', label: 'Active Inventory', count: selectedFarmerDossier.products?.length },
                    { id: 'complaints', label: 'Dispute Record', count: selectedFarmerDossier.complaints?.length },
                    { id: 'feedback', label: 'Buyer Reviews', count: selectedFarmerDossier.feedbacks?.length },
                    { id: 'audit', label: 'Admin Action History', count: selectedFarmerDossier.auditLogs?.length }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setDossierTab(tab.id)}
                      className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                        dossierTab === tab.id
                          ? 'border-emerald-500 text-emerald-400'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {tab.count !== null && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* SUBTAB: OVERVIEW */}
                {dossierTab === 'overview' && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Farm Estate</span>
                        <span className="text-white font-bold">{selectedFarmerDossier.farmer.farmName}</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Geographic Base</span>
                        <span className="text-white font-bold">{selectedFarmerDossier.farmer.location}</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Sales</span>
                        <span className="text-emerald-400 font-bold">₹{selectedFarmerDossier.farmer.totalSales?.toLocaleString() || 0}</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Orders</span>
                        <span className="text-white font-bold">{selectedFarmerDossier.farmer.totalOrders || 0}</span>
                      </div>
                    </div>

                    {/* Status details & unlisting timeline */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-indigo-400" />
                        <span>Platform Standing Details</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Current Standing</span>
                          <span className="text-slate-200 font-semibold">{selectedFarmerDossier.farmer.accountStatus}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Status Last Updated</span>
                          <span className="text-slate-300 font-mono text-[11px]">
                            {selectedFarmerDossier.farmer.statusUpdatedAt
                              ? new Date(selectedFarmerDossier.farmer.statusUpdatedAt).toLocaleString()
                              : 'Account Creation'}
                          </span>
                        </div>
                        {selectedFarmerDossier.farmer.unlistedUntil && (
                          <div className="col-span-2 p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-300">
                            <span className="text-[10px] uppercase font-bold block">Scheduled Unlisting Expiry:</span>
                            <span className="font-mono font-bold text-xs">
                              {new Date(selectedFarmerDossier.farmer.unlistedUntil).toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="col-span-2">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Official Status Reason:</span>
                          <p className="text-slate-300 text-xs mt-0.5">
                            {selectedFarmerDossier.farmer.statusReason || 'Good standing with full marketplace listing privileges.'}
                          </p>
                        </div>
                        {selectedFarmerDossier.farmer.adminNotes && (
                          <div className="col-span-2">
                            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Admin Audit Notes:</span>
                            <p className="text-slate-400 text-xs italic mt-0.5">
                              {selectedFarmerDossier.farmer.adminNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB: PRODUCTS */}
                {dossierTab === 'products' && (
                  <div className="space-y-3">
                    {(!selectedFarmerDossier.products || selectedFarmerDossier.products.length === 0) ? (
                      <div className="p-8 text-center text-slate-500 text-xs bg-slate-950 rounded-2xl border border-slate-800">
                        No products currently cataloged for this producer.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedFarmerDossier.products.map((prod) => (
                          <div key={prod.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-800 bg-slate-900">
                              <AgroProductImage
                                src={getProductImage(prod)}
                                alt={prod.product_name}
                                category={prod.category}
                                className="w-full h-full object-cover"
                                aspectRatio=""
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white text-xs truncate">{prod.product_name}</span>
                                {prod.is_assured && (
                                  <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                    ASSURED
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                ₹{prod.price}/{prod.unit || 'kg'} • Stock: {prod.stock} {prod.unit || 'kg'}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                Category: {prod.category} • ID: {prod.id}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* SUBTAB: COMPLAINTS */}
                {dossierTab === 'complaints' && (
                  <div className="space-y-3">
                    {(!selectedFarmerDossier.complaints || selectedFarmerDossier.complaints.length === 0) ? (
                      <div className="p-8 text-center text-emerald-400 text-xs bg-slate-950 rounded-2xl border border-slate-800">
                        ✓ No complaints filed against this farmer. Pristine compliance record!
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {selectedFarmerDossier.complaints.map((c) => (
                          <div key={c.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-white">#{c.id}</span>
                                <span className="text-[10px] text-slate-500">Order: {c.orderId}</span>
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${
                                  c.adminDecision === 'VALID'
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                    : c.adminDecision === 'INVALID'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                }`}>
                                  {c.adminDecision || 'UNREVIEWED'}
                                </span>
                                {c.severity && (
                                  <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-slate-800 text-slate-300">
                                    {c.severity}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handleOpenReviewModal(c)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-[10px] font-bold border border-indigo-500/30 transition-colors"
                              >
                                Review Dispute
                              </button>
                            </div>
                            <div className="text-xs">
                              <span className="text-amber-300 font-semibold">{c.reason}</span>
                              <p className="text-slate-400 text-[11px] mt-0.5 italic">"{c.description}"</p>
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-900">
                              <span>Buyer: {c.consumerName || c.consumerId}</span>
                              <span>{c.date || (c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recent')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* SUBTAB: FEEDBACK */}
                {dossierTab === 'feedback' && (
                  <div className="space-y-3">
                    {(!selectedFarmerDossier.feedbacks || selectedFarmerDossier.feedbacks.length === 0) ? (
                      <div className="p-8 text-center text-slate-500 text-xs bg-slate-950 rounded-2xl border border-slate-800">
                        No direct buyer ratings or reviews recorded yet.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {selectedFarmerDossier.feedbacks.map((f, idx) => (
                          <div key={f.id || idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <div className="flex text-amber-400">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3.5 h-3.5 ${i < (f.rating || 5) ? 'fill-amber-400' : 'text-slate-700'}`}
                                    />
                                  ))}
                                </div>
                                <span className="font-bold text-white text-xs">{f.consumerName || 'Verified Buyer'}</span>
                              </div>
                              <span className="text-[10px] text-slate-500">
                                {f.date || (f.createdAt ? new Date(f.createdAt).toLocaleDateString() : 'Recent')}
                              </span>
                            </div>
                            <p className="text-slate-300 text-[11px] italic">"{f.comment}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* SUBTAB: AUDIT LOG */}
                {dossierTab === 'audit' && (
                  <div className="space-y-2.5">
                    {(!selectedFarmerDossier.auditLogs || selectedFarmerDossier.auditLogs.length === 0) ? (
                      <div className="p-8 text-center text-slate-500 text-xs bg-slate-950 rounded-2xl border border-slate-800">
                        No administrative interventions logged for this farmer.
                      </div>
                    ) : (
                      selectedFarmerDossier.auditLogs.map((log) => (
                        <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-indigo-300">{log.actionType?.replace(/_/g, ' ')}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-slate-300 text-[11px]">{log.reason || log.notes || 'Status modified'}</p>
                          <div className="text-[10px] text-slate-500 flex items-center justify-between">
                            <span>Status shift: {log.previousStatus} ➔ <strong>{log.newStatus}</strong></span>
                            <span>Admin: {log.adminName}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Dossier Footer Action Bar */}
            {selectedFarmerDossier && (
              <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="text-xs text-slate-400">
                  Take Administrative Compliance Action:
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedFarmerDossier.farmer.accountStatus !== 'ACTIVE' && (
                    <button
                      type="button"
                      onClick={() => handleOpenActionModal(selectedFarmerDossier.farmer, 'RESTORE')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/40 transition-colors flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Restore Standing</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenActionModal(selectedFarmerDossier.farmer, 'WARNING')}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition-colors"
                  >
                    Send Warning
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenActionModal(selectedFarmerDossier.farmer, 'UNDER_REVIEW')}
                    className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-bold text-xs border border-blue-500/40 transition-colors"
                  >
                    Put Under Review
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenActionModal(selectedFarmerDossier.farmer, 'TEMPORARILY_UNLISTED')}
                    className="px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 font-bold text-xs border border-orange-500/40 transition-colors flex items-center gap-1"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Temporarily Unlist</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenActionModal(selectedFarmerDossier.farmer, 'SUSPEND')}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs border border-rose-500/40 transition-colors"
                  >
                    Suspend
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenActionModal(selectedFarmerDossier.farmer, 'BANNED')}
                    className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 font-bold text-xs border border-rose-800/80 transition-colors flex items-center gap-1"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Ban Farmer</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
