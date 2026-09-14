import React, { useState, useEffect } from 'react';
import { consumerAPI } from '../services/api';
import {
  LifeBuoy,
  AlertTriangle,
  Send,
  Clock,
  CheckCircle2,
  Image,
  ArrowLeft,
  MessageSquare,
  ShieldAlert,
  ChevronRight,
  Plus
} from 'lucide-react';

const ISSUE_CATEGORIES = [
  { value: 'DAMAGED_PRODUCE', label: 'Damaged or Bruised Produce', emoji: '🍎' },
  { value: 'QUALITY_ISSUE', label: 'Quality Below Stated Grade', emoji: '🔍' },
  { value: 'INCORRECT_QUANTITY', label: 'Weight or Quantity Shortage', emoji: '⚖️' },
  { value: 'PACKAGING_DEFECT', label: 'Torn or Compromised Packaging', emoji: '📦' },
  { value: 'LATE_DELIVERY', label: 'Excessive Transit Delay', emoji: '⏱️' },
  { value: 'OTHER', label: 'Other Operational Issue', emoji: '💬' }
];

const SAMPLE_EVIDENCE_PHOTOS = [
  'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80'
];

export default function ConsumerSupportPage({ onNavigate, currentUser }) {
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'file'
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form State
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [issueCategory, setIssueCategory] = useState('QUALITY_ISSUE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceList, setEvidenceList] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, ordersRes] = await Promise.all([
        consumerAPI.getMyComplaints(),
        consumerAPI.getOrders()
      ]);

      if (ticketsRes.data?.success) {
        setTickets(ticketsRes.data.data || []);
      }
      if (ordersRes.data?.success) {
        const ords = ordersRes.data.data || [];
        setOrders(ords);
        if (ords.length > 0) {
          setSelectedOrderId(ords[0].id);
          if (ords[0].items && ords[0].items.length > 0) {
            setSelectedProductId(ords[0].items[0].product_id || ords[0].items[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load support data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderChange = (ordId) => {
    setSelectedOrderId(ordId);
    const ord = orders.find(o => o.id === ordId);
    if (ord && ord.items && ord.items.length > 0) {
      setSelectedProductId(ord.items[0].product_id || ord.items[0].id);
    }
  };

  const handleAddEvidenceUrl = () => {
    if (evidenceUrl && evidenceUrl.trim()) {
      setEvidenceList(prev => [...prev, evidenceUrl.trim()]);
      setEvidenceUrl('');
    }
  };

  const handleRemoveEvidence = (idx) => {
    setEvidenceList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderId || !title.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      const res = await consumerAPI.fileComplaint({
        orderId: selectedOrderId,
        productId: selectedProductId,
        issueCategory,
        title: title.trim(),
        description: description.trim(),
        evidenceUrls: evidenceList.length > 0 ? evidenceList : (evidenceUrl ? [evidenceUrl.trim()] : [])
      });

      if (res.data?.success && res.data?.data) {
        setNotification({ type: 'success', message: `Dispute ticket ${res.data.data.id} filed successfully!` });
        setTitle('');
        setDescription('');
        setEvidenceList([]);
        setEvidenceUrl('');
        setActiveTab('tickets');
        await loadData();
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to submit complaint. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <button
            onClick={() => onNavigate('/consumer/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Marketplace</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">AgroBridge Support & Dispute Center</h1>
              <p className="text-xs text-slate-400">Escrow-backed consumer protection, quality disputes, and order assistance.</p>
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'tickets'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>My Support Tickets</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950 font-mono">
              {tickets.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'file'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>File New Dispute</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`my-4 p-4 rounded-2xl border text-xs flex items-center justify-between ${
          notification.type === 'error'
            ? 'bg-rose-950/80 border-rose-600 text-rose-200'
            : 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="font-bold underline ml-2">Dismiss</button>
        </div>
      )}

      {/* TAB 1: TICKETS LIST */}
      {activeTab === 'tickets' && (
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="text-center py-16 text-slate-500 font-mono text-xs">
              Loading support tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto text-2xl">
                🛡️
              </div>
              <h3 className="text-base font-bold text-white">No Dispute Tickets Filed</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                All your orders are in good standing. If you encounter any transit defect, weight shortage, or quality mismatch, file a ticket to engage escrow mediation.
              </p>
              <button
                onClick={() => setActiveTab('file')}
                className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
              >
                File an Issue
              </button>
            </div>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl"
              >
                {/* Ticket Top bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/70">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-white px-2 py-0.5 rounded bg-slate-800">
                      {t.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      Order #{t.order_id} • <strong className="text-emerald-400">{t.product_name}</strong>
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Farmer: {t.farmer_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={t.status} />
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(t.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Complaint Title and Description */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                      {t.issue_category?.replace('_', ' ')}
                    </span>
                    <h4 className="text-sm font-bold text-white">{t.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-1">
                    {t.description}
                  </p>
                </div>

                {/* Evidence Photos */}
                {t.evidence_urls && t.evidence_urls.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                      <Image className="w-3 h-3" />
                      <span>Consumer Evidence Photos ({t.evidence_urls.length})</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {t.evidence_urls.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-16 h-16 rounded-xl overflow-hidden border border-slate-700 hover:border-emerald-500 transition-colors block"
                        >
                          <img src={url} alt="Evidence" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Farmer Response Card */}
                {t.farmer_response && (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-emerald-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Farmer Explanation ({t.farmer_name})</span>
                      </span>
                      {t.farmer_responded_at && (
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(t.farmer_responded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 leading-relaxed italic">
                      "{t.farmer_response}"
                    </p>
                  </div>
                )}

                {/* Admin Resolution Card */}
                {t.admin_notes && (
                  <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/40 space-y-1 text-xs">
                    <div className="text-teal-300 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                      <span>AgroBridge Resolution Action</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {t.admin_notes}
                    </p>
                    {t.resolved_at && (
                      <span className="text-[10px] font-mono text-slate-500 block">
                        Resolved on {new Date(t.resolved_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: FILE DISPUTE FORM */}
      {activeTab === 'file' && (
        <form onSubmit={handleSubmit} className="mt-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-lg font-black text-white">File Produce Dispute or Quality Complaint</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Disputes freeze escrow payouts until review. Please attach clear photos for expedited resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Select Order */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Select Order:</label>
              <select
                value={selectedOrderId}
                onChange={(e) => handleOrderChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    #{o.id} — ₹{o.total_amount} ({o.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Product in Order */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Select Affected Produce:</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                {selectedOrder?.items?.map((item) => (
                  <option key={item.product_id || item.id} value={item.product_id || item.id}>
                    {item.product_name} ({item.quantity_kg || item.quantity} kg)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Issue Category Radio/Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Category of Dispute:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {ISSUE_CATEGORIES.map((cat) => (
                <div
                  key={cat.value}
                  onClick={() => setIssueCategory(cat.value)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all text-xs flex items-center gap-2 ${
                    issueCategory === cat.value
                      ? 'bg-teal-950/50 border-teal-500/60 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base">{cat.emoji}</span>
                  <span className="font-semibold leading-tight">{cat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Dispute Headline:</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Bruised tomatoes in upper crate layer / 1kg weight shortage"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Detailed Description:</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what was received versus what was ordered, condition upon delivery unboxing, and desired remedy..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none leading-relaxed"
            />
          </div>

          {/* Evidence Photo Upload / URLs */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Evidence Photo URL (Attach proof):</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="Paste direct image URL (https://...)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono"
              />
              <button
                type="button"
                onClick={handleAddEvidenceUrl}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
              >
                Add Photo
              </button>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[10px] text-slate-500 font-medium">Quick sample proofs:</span>
              {SAMPLE_EVIDENCE_PHOTOS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setEvidenceList(prev => [...prev, sample])}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  + Sample Photo {idx + 1}
                </button>
              ))}
            </div>

            {/* List of added evidence */}
            {evidenceList.length > 0 && (
              <div className="flex items-center gap-2 pt-2 flex-wrap">
                {evidenceList.map((url, idx) => (
                  <div key={idx} className="relative group w-14 h-14 rounded-xl overflow-hidden border border-teal-500/50">
                    <img src={url} alt="Evidence preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveEvidence(idx)}
                      className="absolute inset-0 bg-black/60 text-white text-xs font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs tracking-wide shadow-xl shadow-teal-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Filing Dispute Ticket...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Ticket to Farmer & AgroBridge Support</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = (status || 'SUBMITTED').toUpperCase();
  if (s === 'RESOLVED') {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" />
        RESOLVED
      </span>
    );
  }
  if (s === 'IN_PROGRESS') {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        IN PROGRESS
      </span>
    );
  }
  if (s === 'UNDER_REVIEW') {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        UNDER REVIEW
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1">
      <AlertTriangle className="w-3 h-3" />
      SUBMITTED
    </span>
  );
}
