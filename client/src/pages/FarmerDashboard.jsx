import React, { useState, useEffect } from 'react';
import {
  Sprout, TrendingUp, Package, DollarSign, MapPin, Plus, CheckCircle,
  RefreshCw, Sparkles, X, Pencil, Trash2, AlertTriangle, LineChart,
  Upload, Image as ImageIcon, Star, MessageSquare, ShieldAlert, CheckCircle2,
  Send, Check, ShieldCheck, Bell, Award, Clock
} from 'lucide-react';
import { farmerAPI, consumerAPI } from '../services/api';
import AIDecisionModal from '../components/AIDecisionModal';
import AIDemandForecastModal from '../components/AIDemandForecastModal';
import FutureInsightsChart from '../components/FutureInsightsChart';
import AgroProductImage, { getProductImage, FALLBACK_CATEGORY_IMAGES, DEFAULT_FOOD_IMAGE } from '../components/AgroProductImage';

export default function FarmerDashboard({ currentUser, onLogout }) {
  const [data, setData] = useState(null);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showDemandModal, setShowDemandModal] = useState(false);
  const [showStatusDetailsModal, setShowStatusDetailsModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Customer Reviews & Complaints state
  const [feedbacks, setFeedbacks] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [respondingComplaintId, setRespondingComplaintId] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  // Real-time Notifications & Bulk Orders state
  const [notifications, setNotifications] = useState([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [selectedOrderNotification, setSelectedOrderNotification] = useState(null);
  const [bulkOrders, setBulkOrders] = useState([]);
  const [bulkFeedbacks, setBulkFeedbacks] = useState([]);
  const [processingOrderAction, setProcessingOrderAction] = useState(false);

  // New crop form state (with multi-photo)
  const [cropName, setCropName] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [quantityKg, setQuantityKg] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [quality, setQuality] = useState('Grade A+');
  const [unit, setUnit] = useState('kg');
  const [farmLocation, setFarmLocation] = useState('Bhopal Rural Cluster, MP');
  const [imagePreview, setImagePreview] = useState('');
  const [imagesList, setImagesList] = useState([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // Edit crop state (with multi-photo)
  const [editingCrop, setEditingCrop] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('Vegetables');
  const [editQuantityKg, setEditQuantityKg] = useState('');
  const [editPricePerKg, setEditPricePerKg] = useState('');
  const [editQuality, setEditQuality] = useState('Grade A+');
  const [editUnit, setEditUnit] = useState('kg');
  const [editLocation, setEditLocation] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editImagesList, setEditImagesList] = useState([]);
  const [editNewPhotoUrl, setEditNewPhotoUrl] = useState('');

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchNotifications = async () => {
    try {
      const res = await farmerAPI.getNotifications();
      if (res.data && res.data.success) {
        setNotifications(res.data.data || []);
      }
    } catch (e) {}
  };

  const fetchBulkData = async () => {
    try {
      const [ordRes, fbRes] = await Promise.allSettled([
        farmerAPI.getBulkOrders(),
        farmerAPI.getBulkFeedback(currentUser?.email || 'farmer@agrobridge.demo')
      ]);
      if (ordRes.status === 'fulfilled' && ordRes.value.data?.success) {
        setBulkOrders(ordRes.value.data.data || []);
      }
      if (fbRes.status === 'fulfilled' && fbRes.value.data?.success) {
        setBulkFeedbacks(fbRes.value.data.data || fbRes.value.data.feedbacks || []);
      }
    } catch (e) {}
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [dashRes, prodRes, fbRes, cmpRes] = await Promise.allSettled([
        farmerAPI.getDashboard(),
        consumerAPI.getProduceCatalog(),
        farmerAPI.getMyFeedback(currentUser?.email || 'farmer@agrobridge.demo'),
        farmerAPI.getComplaints()
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.data?.success) {
        setData(dashRes.value.data.data);
      }
      if (prodRes.status === 'fulfilled' && prodRes.value.data?.success) {
        setCrops(prodRes.value.data.data);
      }
      if (fbRes.status === 'fulfilled' && fbRes.value.data?.success) {
        setFeedbacks(fbRes.value.data.data || []);
      }
      if (cmpRes.status === 'fulfilled' && cmpRes.value.data?.success) {
        setComplaints(cmpRes.value.data.data || []);
      }
      await fetchNotifications();
      await fetchBulkData();
    } catch (err) {
      console.error('Failed to load farmer stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // 5-second real-time notification polling
    const pollInterval = setInterval(() => {
      fetchNotifications();
      fetchBulkData();
    }, 5000);
    return () => clearInterval(pollInterval);
  }, []);

  const handleAcceptBulkOrder = async (orderId, notifId = null) => {
    setProcessingOrderAction(true);
    try {
      const res = await farmerAPI.updateBulkOrderStatus(orderId, 'FARMER_ACCEPTED');
      if (res.data && res.data.success) {
        showToastMsg(`✓ Bulk Order #${orderId} accepted! Logistics dispatched.`);
        if (notifId) await farmerAPI.markNotificationRead(notifId);
        setSelectedOrderNotification(null);
        fetchStats();
        fetchNotifications();
        fetchBulkData();
      }
    } catch (err) {
      showToastMsg('Failed to accept bulk order.');
    } finally {
      setProcessingOrderAction(false);
    }
  };

  const handleDeclineBulkOrder = async (orderId, notifId = null) => {
    setProcessingOrderAction(true);
    try {
      const res = await farmerAPI.updateBulkOrderStatus(orderId, 'FARMER_DECLINED');
      if (res.data && res.data.success) {
        showToastMsg(`Bulk Order #${orderId} declined. Buyer notified.`);
        if (notifId) await farmerAPI.markNotificationRead(notifId);
        setSelectedOrderNotification(null);
        fetchStats();
        fetchNotifications();
        fetchBulkData();
      }
    } catch (err) {
      showToastMsg('Failed to decline bulk order.');
    } finally {
      setProcessingOrderAction(false);
    }
  };

  const handleImageFileChange = (e, isEdit = false) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      showToastMsg('Please upload a valid JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToastMsg('Image size must be under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      let finalUrl = reader.result;
      try {
        const uploadRes = await farmerAPI.uploadImage({ image: reader.result, name: file.name });
        if (uploadRes.data && uploadRes.data.success && uploadRes.data.url) {
          finalUrl = uploadRes.data.url;
        }
      } catch (err) {
        console.warn('Upload API fallback to data URL:', err);
      }

      const newImg = {
        url: finalUrl,
        alt: isEdit ? editName : cropName,
        isPrimary: isEdit ? editImagesList.length === 0 : imagesList.length === 0
      };
      if (isEdit) {
        setEditImagesList(prev => [...prev, newImg]);
        setEditImage(finalUrl);
      } else {
        setImagesList(prev => [...prev, newImg]);
        setImagePreview(finalUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const addPhotoToAddList = (url) => {
    if (!url || !url.trim()) return;
    const newImg = {
      url: url.trim(),
      alt: cropName || 'Produce photo',
      isPrimary: imagesList.length === 0
    };
    setImagesList(prev => [...prev, newImg]);
    setNewPhotoUrl('');
    if (imagesList.length === 0) setImagePreview(url.trim());
  };

  const setPrimaryInAddList = (idx) => {
    setImagesList(prev => prev.map((img, i) => ({
      ...img,
      isPrimary: (i === idx)
    })));
    if (imagesList[idx]) setImagePreview(imagesList[idx].url);
  };

  const removePhotoFromAddList = (idx) => {
    const wasPrimary = imagesList[idx]?.isPrimary;
    const remaining = imagesList.filter((_, i) => i !== idx);
    if (wasPrimary && remaining.length > 0) {
      remaining[0].isPrimary = true;
      setImagePreview(remaining[0].url);
    } else if (remaining.length === 0) {
      setImagePreview('');
    }
    setImagesList(remaining);
  };

  const addPhotoToEditList = (url) => {
    if (!url || !url.trim()) return;
    const newImg = {
      url: url.trim(),
      alt: editName || 'Produce photo',
      isPrimary: editImagesList.length === 0
    };
    setEditImagesList(prev => [...prev, newImg]);
    setEditNewPhotoUrl('');
    if (editImagesList.length === 0) setEditImage(url.trim());
  };

  const setPrimaryInEditList = (idx) => {
    setEditImagesList(prev => prev.map((img, i) => ({
      ...img,
      isPrimary: (i === idx)
    })));
    if (editImagesList[idx]) setEditImage(editImagesList[idx].url);
  };

  const removePhotoFromEditList = (idx) => {
    const wasPrimary = editImagesList[idx]?.isPrimary;
    const remaining = editImagesList.filter((_, i) => i !== idx);
    if (wasPrimary && remaining.length > 0) {
      remaining[0].isPrimary = true;
      setEditImage(remaining[0].url);
    } else if (remaining.length === 0) {
      setEditImage('');
    }
    setEditImagesList(remaining);
  };

  const handleAddCrop = async (e) => {
    e.preventDefault();
    try {
      const finalImages = imagesList.length > 0
        ? imagesList
        : (imagePreview ? [{ url: imagePreview, alt: cropName, isPrimary: true }] : []);

      const primary = finalImages.find(i => i.isPrimary) || finalImages[0];

      const payload = {
        product_name: cropName,
        category,
        quantity_kg: parseFloat(quantityKg),
        price_per_kg: parseFloat(pricePerKg),
        quality,
        unit: unit || 'kg',
        location: farmLocation || 'Bhopal Rural Cluster, MP',
        image: primary ? primary.url : undefined,
        images: finalImages.length > 0 ? finalImages : undefined,
        shelf_life_days: category === 'Vegetables' ? 7 : 120
      };
      const res = await farmerAPI.listCrop(payload);
      if (res.data && res.data.success) {
        showToastMsg(`Harvest ${cropName} listed successfully on AgroBridge!`);
        setShowAddModal(false);
        setCropName('');
        setQuantityKg('');
        setPricePerKg('');
        setImagePreview('');
        setImagesList([]);
        setNewPhotoUrl('');
        fetchStats();
      }
    } catch (err) {
      showToastMsg('Failed to list crop. Please check inputs.');
    }
  };

  const openEditModal = (crop) => {
    setEditingCrop(crop);
    setEditName(crop.product_name || crop.name || '');
    setEditCategory(crop.category || 'Vegetables');
    setEditQuantityKg(crop.quantity_kg || crop.available_kg || '');
    setEditPricePerKg(crop.price_per_kg || '');
    setEditQuality(crop.quality || 'Grade A+');
    setEditUnit(crop.unit || 'kg');
    setEditLocation(crop.location || 'Bhopal Rural Cluster, MP');
    const displayImg = getProductImage(crop);
    setEditImage(crop.image || displayImg);

    const initialImgs = (crop.images && crop.images.length > 0)
      ? crop.images.map((img, idx) => ({
          url: typeof img === 'string' ? img : img.url,
          alt: typeof img === 'string' ? crop.product_name : (img.alt || crop.product_name),
          isPrimary: typeof img === 'object' && img.isPrimary !== undefined ? Boolean(img.isPrimary) : (idx === 0)
        }))
      : (displayImg ? [{ url: displayImg, alt: crop.product_name, isPrimary: true }] : []);

    setEditImagesList(initialImgs);
    setEditNewPhotoUrl('');
  };

  const handleSaveEditCrop = async (e) => {
    e.preventDefault();
    if (!editingCrop) return;
    try {
      const primary = editImagesList.find(i => i.isPrimary) || editImagesList[0];
      const payload = {
        product_name: editName,
        category: editCategory,
        quantity_kg: parseFloat(editQuantityKg),
        price_per_kg: parseFloat(editPricePerKg),
        quality: editQuality,
        unit: editUnit || 'kg',
        location: editLocation || 'Bhopal Rural Cluster, MP',
        image: primary ? primary.url : (editImage || undefined),
        images: editImagesList.length > 0 ? editImagesList : undefined
      };
      const res = await farmerAPI.updateCrop(editingCrop.id, payload);
      if (res.data && res.data.success) {
        showToastMsg(`Crop listing updated successfully!`);
        setEditingCrop(null);
        fetchStats();
      }
    } catch (err) {
      showToastMsg('Failed to update crop listing.');
    }
  };

  const handleRespondComplaint = async (complaintId) => {
    if (!responseText.trim()) return;
    setSubmittingResponse(true);
    try {
      const res = await farmerAPI.respondToComplaint(complaintId, responseText.trim());
      if (res.data?.success) {
        showToastMsg('Your response has been sent to the buyer and recorded in the dispute file.');
        setRespondingComplaintId(null);
        setResponseText('');
        fetchStats();
      }
    } catch (err) {
      showToastMsg('Failed to submit response.');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleDeleteCrop = async (crop) => {
    if (!window.confirm(`Are you sure you want to remove "${crop.product_name}" from the active marketplace?`)) {
      return;
    }
    try {
      const res = await farmerAPI.deleteCrop(crop.id);
      if (res.data && res.data.success) {
        showToastMsg(`Crop listing "${crop.product_name}" removed.`);
        fetchStats();
      }
    } catch (err) {
      showToastMsg('Failed to delete crop listing.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-emerald-950 border border-emerald-500 text-emerald-100 shadow-2xl text-xs font-semibold flex items-center gap-2.5 backdrop-blur-xl">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-3xl shadow-inner">
            👨‍🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{currentUser.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                Farmer Portal
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentUser.farmName || 'Patel Organic Farms'} — {currentUser.farmLocation || 'Berasia Road'}, {currentUser.district || 'Bhopal'}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Notification Bell 🔔 with live unread badge */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors flex items-center justify-center"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white animate-pulse">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 z-50 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Farmer Notifications</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {notifications.filter(n => !n.read).length} unread
                  </span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-xl border text-xs space-y-2 transition-all ${
                          notif.read
                            ? 'bg-slate-950/60 border-slate-800/60 text-slate-400'
                            : 'bg-slate-950 border-amber-500/40 text-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                            {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
                            <span>{notif.title}</span>
                          </span>
                          <span className="text-[9px] text-slate-500 shrink-0">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {notif.message}
                        </p>

                        {(notif.type === 'NEW_BULK_ORDER' || notif.orderData) && (
                          <div className="pt-1 flex items-center justify-between border-t border-slate-900">
                            <span className="text-[10px] text-indigo-400 font-bold">Bulk Purchase Requisition</span>
                            <button
                              onClick={() => {
                                setSelectedOrderNotification(notif);
                                setShowNotificationsDropdown(false);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] shadow-sm transition-colors"
                            >
                              Review & Act
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={fetchStats}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
          
          <button
            onClick={() => setShowDemandModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-teal-500/40 text-teal-300 hover:bg-teal-950/40 font-bold text-xs transition-all"
          >
            <LineChart className="w-4 h-4 text-teal-400" />
            <span>AI Demand Forecast</span>
          </button>

          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40 font-bold text-xs transition-all"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>AI Price Advisory</span>
          </button>

          <button
            onClick={() => {
              if (['TEMPORARILY_UNLISTED', 'SUSPENDED', 'BANNED'].includes(data?.accountStatus)) {
                showToastMsg(`Action Restricted: Account is currently ${data.accountStatus.replace(/_/g, ' ')}. Product listing is disabled.`);
                return;
              }
              setShowAddModal(true);
            }}
            disabled={['TEMPORARILY_UNLISTED', 'SUSPENDED', 'BANNED'].includes(data?.accountStatus)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
              ['TEMPORARILY_UNLISTED', 'SUSPENDED', 'BANNED'].includes(data?.accountStatus)
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
            title={['TEMPORARILY_UNLISTED', 'SUSPENDED', 'BANNED'].includes(data?.accountStatus) ? 'Listing disabled while account is unlisted or suspended' : 'List Harvest Crop'}
          >
            <Plus className="w-4 h-4" />
            <span>List Harvest Crop</span>
          </button>
        </div>
      </div>

      {/* Account Status Alert Banners */}
      {data?.accountStatus === 'TEMPORARILY_UNLISTED' && (
        <div className="rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 p-5 shadow-xl shadow-amber-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 border border-amber-500/30">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-sm">
                  Marketplace Action Active
                </span>
                <h3 className="text-base font-extrabold text-amber-300">
                  ⚠️ ACCOUNT TEMPORARILY UNLISTED
                </h3>
              </div>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                Your products are currently hidden from the AgroBridge Consumer and Bulk Buyer marketplaces. Existing orders and in-progress deliveries will continue normally without disruption.
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-amber-200/90 font-medium pt-1">
                <span>Reason: <strong className="text-white">{data.statusReason || 'Quality dispute review'}</strong></span>
                {data.unlistedUntil && (
                  <span>Unlisted Until: <strong className="text-white">{new Date(data.unlistedUntil).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</strong></span>
                )}
                <span>Verified Complaints: <strong className="text-rose-400">{data.verifiedComplaintsCount || 0}</strong></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
            <button
              onClick={() => setShowStatusDetailsModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <span>VIEW DETAILS</span>
            </button>
          </div>
        </div>
      )}

      {data?.accountStatus === 'WARNING' && (
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-300">⚠️ Formal Advisory Notice on Record</h4>
              <p className="text-[11px] text-slate-300">
                {data.statusReason || 'A customer dispute has been verified. Please inspect produce quality and packing standards.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowStatusDetailsModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition-all shrink-0"
          >
            Review Details
          </button>
        </div>
      )}

      {(data?.accountStatus === 'SUSPENDED' || data?.accountStatus === 'BANNED') && (
        <div className="rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5 border border-rose-500/30">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white">
                  Compliance Action
                </span>
                <h3 className="text-base font-extrabold text-rose-300">
                  ⛔ ACCOUNT {data.accountStatus.replace(/_/g, ' ')}
                </h3>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl">
                {data.statusReason || 'Your farmer account has been restricted by platform administration due to compliance violations.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowStatusDetailsModal(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md transition-all shrink-0 self-end md:self-center"
          >
            VIEW DETAILS
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="text-xs font-bold uppercase text-slate-400 flex items-center justify-between">
            <span>Active Listings</span>
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{crops.length || 5}</div>
          <p className="text-[11px] text-emerald-400 font-semibold">Available for direct purchase</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="text-xs font-bold uppercase text-slate-400 flex items-center justify-between">
            <span>Total Harvest Yield</span>
            <Sprout className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">4,250 <span className="text-sm font-normal text-slate-400">kg</span></div>
          <p className="text-[11px] text-slate-400">Graded Grade A / Grade A+</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="text-xs font-bold uppercase text-slate-400 flex items-center justify-between">
            <span>Monthly Realization</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">₹1,28,400</div>
          <p className="text-[11px] text-emerald-400 font-semibold">100% Escrow Disbursed</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="text-xs font-bold uppercase text-slate-400 flex items-center justify-between">
            <span>Direct Price Advantage</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">+24.2%</div>
          <p className="text-[11px] text-slate-400">Higher than local APMC Mandi rates</p>
        </div>
      </div>

      {/* Produce Inventory & Mandi Rates Comparative Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Produce Table with full CRUD actions */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" />
              <span>Current Platform Crop Listings ({crops.length})</span>
            </h2>
            <span className="text-xs text-slate-400">Farmer CRUD Management</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3">Crop</th>
                  <th className="pb-3">Grade</th>
                  <th className="pb-3">Available</th>
                  <th className="pb-3">Direct Price</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {crops.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-semibold text-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-800 bg-slate-950 shadow-inner">
                          <AgroProductImage
                            src={getProductImage(c)}
                            alt={c.product_name}
                            category={c.category}
                            className="w-full h-full object-cover"
                            aspectRatio=""
                          />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{c.product_name}</div>
                          <div className="text-[10px] text-slate-400 font-normal flex items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">{c.category}</span>
                            {c.images && c.images.length > 1 && (
                              <span className="text-emerald-400 text-[9px] font-semibold">
                                📷 {c.images.length} photos
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                        {c.quality || 'Grade A'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300">{c.quantity_kg || c.available_kg} kg</td>
                    <td className="py-3 font-bold text-white">₹{c.price_per_kg}/kg</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active Direct
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                          title="Edit Listing"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCrop(c)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-800 transition-colors"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Disintermediation Price Comparison */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Mandi vs AgroBridge Realization</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time APMC Mandi rates vs AgroBridge direct farm-gate payments:
          </p>

          <div className="space-y-3 pt-2">
            {[
              { commodity: 'Wheat (Sharbati)', mandiRate: 31, agroBridgeRate: 38, bonus: '+22.5%' },
              { commodity: 'Tomato (Hybrid)', mandiRate: 22, agroBridgeRate: 28, bonus: '+27.2%' },
              { commodity: 'Onion (Red)', mandiRate: 21, agroBridgeRate: 26, bonus: '+23.8%' },
              { commodity: 'Soybean (Yellow)', mandiRate: 39, agroBridgeRate: 46, bonus: '+17.9%' }
            ].map((rate, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{rate.commodity}</div>
                  <div className="text-[10px] text-slate-500">Mandi Middleman: ₹{rate.mandiRate}/kg</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-extrabold text-emerald-400">₹{rate.agroBridgeRate}/kg</div>
                  <div className="text-[10px] font-bold text-emerald-500">{rate.bonus}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => setShowAIModal(true)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Calculate Dynamic Crop Pricing</span>
            </button>
            <button
              onClick={() => setShowDemandModal(true)}
              className="w-full py-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <LineChart className="w-3.5 h-3.5 text-teal-400" />
              <span>Forecast Regional Demand Trend</span>
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* FEATURE 1: FUTURE MARKET & DEMAND FORECASTING (AI-ASSISTED) */}
      {/* ========================================================================= */}
      <div className="mt-8">
        <FutureInsightsChart initialRole="farmer" showHeader={true} />
      </div>

      {/* ========================================================================= */}
      {/* FEATURE 4 & 5: CUSTOMER REVIEWS & COMPLAINTS SECTIONS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        
        {/* Customer Ratings & Feedback Section */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Customer Ratings & Reviews</h3>
                <p className="text-[11px] text-slate-400">Feedback from verified delivered orders</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-amber-400 flex items-center gap-1 justify-end">
                <span>
                  {feedbacks.length
                    ? (feedbacks.reduce((a, b) => a + b.overallRating, 0) / feedbacks.length).toFixed(1)
                    : '5.0'}
                </span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{feedbacks.length} Verified Reviews</span>
            </div>
          </div>

          {feedbacks.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No customer reviews yet. Reviews will automatically appear here once buyers confirm delivery.
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {feedbacks.map((fb) => (
                <div key={fb.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{fb.consumer_name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" />
                          Verified Buyer
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">{fb.product_name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400">
                      <span>{fb.overallRating}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "{fb.review}"
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1 border-t border-slate-900 flex-wrap">
                    <span>Quality: <strong className="text-slate-300">{fb.ratings?.quality || 5}★</strong></span>
                    <span>Experience: <strong className="text-slate-300">{fb.ratings?.farmerExperience || 5}★</strong></span>
                    <span>Packaging: <strong className="text-slate-300">{fb.ratings?.packaging || 5}★</strong></span>
                    <span>Accuracy: <strong className="text-slate-300">{fb.ratings?.accuracy || 5}★</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Disputes & Complaints Section */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Customer Disputes & Complaints</h3>
                <p className="text-[11px] text-slate-400">Respond to buyer quality or quantity issues</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
              {complaints.length} Tickets
            </span>
          </div>

          {complaints.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              ✓ Zero active disputes! Your produce handling and packaging are in 100% good standing.
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {complaints.map((cmp) => (
                <div key={cmp.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Ticket {cmp.id}</span>
                        <span className="text-[10px] font-mono text-slate-400">Order #{cmp.order_id}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{cmp.product_name} • Buyer: {cmp.consumer_name}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      cmp.status === 'RESOLVED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {cmp.status}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-200">{cmp.title}</div>
                    <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{cmp.description}</p>
                  </div>

                  {cmp.evidence_urls && cmp.evidence_urls.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">Buyer Evidence:</span>
                      {cmp.evidence_urls.map((url, idx) => (
                        <a key={idx} href={url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg overflow-hidden border border-slate-800 block">
                          <img src={url} alt="Proof" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Existing Farmer Response */}
                  {cmp.farmer_response ? (
                    <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs">
                      <span className="text-emerald-400 font-bold block text-[10px] uppercase">Your Submitted Response:</span>
                      <p className="text-slate-300 italic mt-0.5">"{cmp.farmer_response}"</p>
                    </div>
                  ) : respondingComplaintId === cmp.id ? (
                    /* Response input box */
                    <div className="space-y-2 pt-1">
                      <textarea
                        rows={2}
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Write your explanation or resolution proposal (e.g., replacement batch or explanation of harvest sorting)..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => { setRespondingComplaintId(null); setResponseText(''); }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={submittingResponse}
                          onClick={() => handleRespondComplaint(cmp.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-sm"
                        >
                          {submittingResponse ? 'Submitting...' : 'Send Response'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setRespondingComplaintId(cmp.id); setResponseText(''); }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Submit Farmer Response</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* SECTION: Wholesale Commercial Purchase Orders */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xl shadow-inner">
              🏢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Wholesale Bulk Order Requisitions</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono">
                  {bulkOrders.length} Contracts
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Review, accept, or decline large commercial requisitions from certified wholesale buyers
              </p>
            </div>
          </div>
          <button
            onClick={fetchBulkData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Orders</span>
          </button>
        </div>

        {bulkOrders.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No bulk orders received yet. Active platform listings with wholesale MOQ will receive commercial inquiries here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3">Requisition ID</th>
                  <th className="pb-3">Buyer & Facility</th>
                  <th className="pb-3">Produce & Qty</th>
                  <th className="pb-3">Contract Value</th>
                  <th className="pb-3">Target Date</th>
                  <th className="pb-3">Lifecycle Status</th>
                  <th className="pb-3 text-right">Farmer Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {bulkOrders.map((order) => {
                  const isNotified = order.status === 'FARMER_NOTIFIED' || order.status === 'PENDING';
                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5">
                        <div className="font-mono text-white font-bold">{order.id}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <div className="text-white font-semibold">{order.buyer_name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{order.delivery_address}</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <div className="text-white font-bold">{order.product_name}</div>
                        <div className="text-[11px] text-indigo-300 font-mono">
                          {order.quantity_kg.toLocaleString('en-IN')} kg @ ₹{order.unit_price}/kg
                        </div>
                      </td>
                      <td className="py-3.5 font-mono text-emerald-400 font-bold text-sm">
                        ₹{order.total_amount.toLocaleString('en-IN')}
                        <div className="text-[9px] text-slate-500 font-sans font-normal">Escrow Guaranteed</div>
                      </td>
                      <td className="py-3.5 text-slate-300 font-mono text-[11px]">
                        {order.expected_delivery_date || 'Within 48 hrs'}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider inline-flex items-center gap-1.5 ${
                          order.status === 'FARMER_NOTIFIED' || order.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                            : order.status === 'FARMER_ACCEPTED' || order.status === 'PROCESSING' || order.status === 'DRIVER_ASSIGNED' || order.status === 'PICKED_UP' || order.status === 'OUT_FOR_DELIVERY'
                            ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                            : order.status === 'DELIVERED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                          {order.status === 'FARMER_NOTIFIED' && <Clock className="w-3 h-3" />}
                          {order.status === 'DELIVERED' && <Check className="w-3 h-3" />}
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        {isNotified ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              disabled={processingOrderAction}
                              onClick={() => handleDeclineBulkOrder(order.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 text-xs font-bold transition-all border border-slate-700"
                            >
                              Decline
                            </button>
                            <button
                              disabled={processingOrderAction}
                              onClick={() => handleAcceptBulkOrder(order.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono">
                            {order.status === 'FARMER_DECLINED' ? 'Declined by Farm' : 'In Fulfillment Pipeline'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION: Bulk Buyer Verified Feedback & Reputation */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl shadow-inner">
              ⭐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Verified Bulk Buyer Reviews & Reputation</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  ✓ VERIFIED PROCUREMENT ONLY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-dimensional rating scorecard submitted by commercial enterprises after verified order delivery
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
            <div className="text-2xl font-black text-amber-400">
              {bulkFeedbacks.length > 0
                ? (bulkFeedbacks.reduce((acc, f) => acc + (f.overallRating || 5), 0) / bulkFeedbacks.length).toFixed(1)
                : '5.0'}
            </div>
            <div>
              <div className="flex items-center gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {bulkFeedbacks.length} Verified Wholesale Review{bulkFeedbacks.length === 1 ? '' : 's'}
              </div>
            </div>
          </div>
        </div>

        {/* 6-Dimension Scorecard Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Crop Quality', key: 'cropQuality', fallback: 5.0, icon: '🌾' },
            { label: 'Crating / Packing', key: 'packaging', fallback: 4.8, icon: '📦' },
            { label: 'Weighing Accuracy', key: 'punctuality', fallback: 5.0, icon: '⚖️' },
            { label: 'Dispatch Punctuality', key: 'punctuality', fallback: 4.9, icon: '⏱️' },
            { label: 'Communication', key: 'communication', fallback: 5.0, icon: '💬' },
            { label: 'Pricing Fairness', key: 'pricingFairness', fallback: 4.9, icon: '🏷️' }
          ].map((dim, idx) => {
            const avgScore = bulkFeedbacks.length > 0
              ? (bulkFeedbacks.reduce((acc, f) => acc + (f.ratings?.[dim.key] || dim.fallback), 0) / bulkFeedbacks.length).toFixed(1)
              : dim.fallback.toFixed(1);
            return (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-base">{dim.icon}</span>
                  <span className="text-xs font-black text-white font-mono">{avgScore} / 5</span>
                </div>
                <div className="text-[11px] font-bold text-slate-300 leading-tight">{dim.label}</div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full rounded-full"
                    style={{ width: `${(parseFloat(avgScore) / 5) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Verified Feedback Cards */}
        {bulkFeedbacks.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No verified wholesale reviews yet. Feedback will be unlocked once wholesale buyers receive their delivered shipments.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bulkFeedbacks.map((fb) => (
              <div key={fb.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{fb.buyer_name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        <span>Verified Bulk Buyer</span>
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Procured: <span className="text-slate-200 font-semibold">{fb.product_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-lg text-amber-400 font-mono font-bold text-xs">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{fb.overallRating || 5.0}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{fb.review}"
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-900 font-mono">
                  <span>Order Ref: #{fb.order_id}</span>
                  <span>{new Date(fb.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: List Harvest Crop */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-400" />
                <span>List New Harvest Produce</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCrop} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Crop Name *</label>
                <input
                  type="text"
                  required
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="e.g. Sharbati Wheat Grade A"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Grains">Grains</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Pulses">Pulses</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quality Grade</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Grade A+">Grade A+ (Export Quality)</option>
                    <option value="Grade A">Grade A (Standard)</option>
                    <option value="Grade B">Grade B (Processing)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price / Unit (₹) *</label>
                  <input
                    type="number"
                    required
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(e.target.value)}
                    placeholder="e.g. 32"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit of Measure</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="Ltr">Ltr (Liter)</option>
                    <option value="Dozen">Dozen</option>
                    <option value="Bunch">Bunch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Farm Origin / Location</label>
                  <input
                    type="text"
                    value={farmLocation}
                    onChange={(e) => setFarmLocation(e.target.value)}
                    placeholder="e.g. Sehore Farm Cluster, MP"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Feature 2: Product Multi-Photo System (Upload, Primary Toggle, Remove) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-200">
                    Product Photos Gallery ({imagesList.length} photos added)
                  </label>
                  <span className="text-[10px] text-emerald-400 font-semibold">★ First photo is Primary</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Upload from Device</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={(e) => handleImageFileChange(e, false)}
                        className="hidden"
                      />
                    </label>

                    <div className="flex items-center gap-1.5 flex-1 min-w-[220px]">
                      <input
                        type="url"
                        value={newPhotoUrl}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        placeholder="Paste image URL (https://...)"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => addPhotoToAddList(newPhotoUrl)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  {/* Sample Produce Presets */}
                  <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                    <span className="text-[10px] text-slate-500 font-medium">Quick sample photos:</span>
                    {[
                      { name: '🍅 Tomato', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80' },
                      { name: '🌾 Wheat', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80' },
                      { name: '🧅 Onion', url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80' },
                      { name: '🥔 Potato', url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80' },
                      { name: '🥕 Carrot', url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80' }
                    ].map((sample, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => addPhotoToAddList(sample.url)}
                        className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-400 hover:text-white transition-colors"
                      >
                        {sample.name}
                      </button>
                    ))}
                  </div>

                  {/* Thumbnails Gallery */}
                  {imagesList.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-2">
                      {imagesList.map((img, idx) => (
                        <div
                          key={idx}
                          className={`relative rounded-2xl overflow-hidden border p-1 group flex flex-col justify-between ${
                            img.isPrimary
                              ? 'border-emerald-500 bg-emerald-950/20'
                              : 'border-slate-800 bg-slate-950'
                          }`}
                        >
                          <div className="h-20 w-full rounded-xl overflow-hidden relative">
                            <AgroProductImage
                              src={img.url}
                              alt={`Produce ${idx + 1}`}
                              category={category}
                              className="w-full h-full object-cover"
                              aspectRatio=""
                            />
                            {img.isPrimary && (
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-slate-950 shadow">
                                ★ Primary
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removePhotoFromAddList(idx)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors"
                              title="Remove photo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>

                          {!img.isPrimary && (
                            <button
                              type="button"
                              onClick={() => setPrimaryInAddList(idx)}
                              className="mt-1.5 w-full py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-colors"
                            >
                              Set as Primary
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  List Produce
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Produce Listing (CRUD Update) */}
      {editingCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-emerald-400" />
                <span>Edit Produce Listing</span>
              </h3>
              <button onClick={() => setEditingCrop(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCrop} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Crop Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Grains">Grains</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Pulses">Pulses</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quality Grade</label>
                  <select
                    value={editQuality}
                    onChange={(e) => setEditQuality(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Grade A+">Grade A+ (Export Quality)</option>
                    <option value="Grade A">Grade A (Standard)</option>
                    <option value="Grade B">Grade B (Processing)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    value={editQuantityKg}
                    onChange={(e) => setEditQuantityKg(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price / Unit (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editPricePerKg}
                    onChange={(e) => setEditPricePerKg(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit of Measure</label>
                  <select
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="Ltr">Ltr (Liter)</option>
                    <option value="Dozen">Dozen</option>
                    <option value="Bunch">Bunch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Farm Origin / Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g. Sehore Farm Cluster, MP"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Feature 2: Product Multi-Photo System (Edit Modal) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-200">
                    Product Photos Gallery ({editImagesList.length} photos)
                  </label>
                  <span className="text-[10px] text-emerald-400 font-semibold">★ Click to Set Primary</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={(e) => handleImageFileChange(e, true)}
                        className="hidden"
                      />
                    </label>

                    <div className="flex items-center gap-1.5 flex-1 min-w-[220px]">
                      <input
                        type="url"
                        value={editNewPhotoUrl}
                        onChange={(e) => setEditNewPhotoUrl(e.target.value)}
                        placeholder="Paste image URL (https://...)"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => addPhotoToEditList(editNewPhotoUrl)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  {/* Thumbnails Gallery in Edit Modal */}
                  {editImagesList.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-2">
                      {editImagesList.map((img, idx) => (
                        <div
                          key={idx}
                          className={`relative rounded-2xl overflow-hidden border p-1 group flex flex-col justify-between ${
                            img.isPrimary
                              ? 'border-emerald-500 bg-emerald-950/20'
                              : 'border-slate-800 bg-slate-950'
                          }`}
                        >
                          <div className="h-20 w-full rounded-xl overflow-hidden relative">
                            <AgroProductImage
                              src={img.url}
                              alt={`Photo ${idx + 1}`}
                              category={editCategory}
                              className="w-full h-full object-cover"
                              aspectRatio=""
                            />
                            {img.isPrimary && (
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-slate-950 shadow">
                                ★ Primary
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removePhotoFromEditList(idx)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors"
                              title="Remove photo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>

                          {!img.isPrimary && (
                            <button
                              type="button"
                              onClick={() => setPrimaryInEditList(idx)}
                              className="mt-1.5 w-full py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-colors"
                            >
                              Set Primary
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingCrop(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Price Advisory Modal */}
      <AIDecisionModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        initialCommodity="Tomato"
      />

      {/* AI Demand Forecast Modal */}
      <AIDemandForecastModal
        isOpen={showDemandModal}
        onClose={() => setShowDemandModal(false)}
        initialCommodity="Tomato"
      />

      {/* Modal: Farmer Order Action Modal (from Notification Bell) */}
      {selectedOrderNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Commercial Order Requisition</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Order Ref: #{selectedOrderNotification.orderId || selectedOrderNotification.orderData?.id || 'Pending'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderNotification(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification message & details */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-1">
              <span className="text-indigo-300 font-bold block">{selectedOrderNotification.title}</span>
              <p className="text-slate-300 leading-relaxed">{selectedOrderNotification.message}</p>
            </div>

            {selectedOrderNotification.orderData && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Buyer Organization</span>
                    <span className="font-bold text-white">{selectedOrderNotification.orderData.buyer_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Crop / Commodity</span>
                    <span className="font-bold text-emerald-400">{selectedOrderNotification.orderData.product_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Requested Volume</span>
                    <span className="font-mono text-white font-bold">{selectedOrderNotification.orderData.quantity_kg} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Total Payout Amount</span>
                    <span className="font-mono text-emerald-400 font-black text-sm">
                      ₹{selectedOrderNotification.orderData.total_amount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-900">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Delivery Destination</span>
                    <span className="text-slate-300">{selectedOrderNotification.orderData.delivery_address}</span>
                  </div>
                  {selectedOrderNotification.orderData.expected_delivery_date && (
                    <div className="col-span-2">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Target Dispatch Date</span>
                      <span className="text-slate-300 font-mono">{selectedOrderNotification.orderData.expected_delivery_date}</span>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Escrow Guaranteed upon farm gate dispatch & delivery verification.</span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={processingOrderAction}
                onClick={() => handleDeclineBulkOrder(
                  selectedOrderNotification.orderId || selectedOrderNotification.orderData?.id,
                  selectedOrderNotification.id
                )}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 text-xs font-bold transition-all border border-slate-700"
              >
                ✕ Decline Order
              </button>
              <button
                type="button"
                disabled={processingOrderAction}
                onClick={() => handleAcceptBulkOrder(
                  selectedOrderNotification.orderId || selectedOrderNotification.orderData?.id,
                  selectedOrderNotification.id
                )}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{processingOrderAction ? 'Processing...' : '✓ Accept Bulk Order'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Status Details Modal */}
      {showStatusDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${data?.accountStatus === 'TEMPORARILY_UNLISTED' || data?.accountStatus === 'WARNING' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Account Status Dossier</h3>
                  <span className="text-[11px] text-slate-400">Official AgroBridge Policy Compliance</span>
                </div>
              </div>
              <button
                onClick={() => setShowStatusDetailsModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Standing</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                    data?.accountStatus === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : data?.accountStatus === 'WARNING' || data?.accountStatus === 'TEMPORARILY_UNLISTED'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {data?.accountStatus?.replace(/_/g, ' ') || 'ACTIVE'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Action Justification</span>
                  <p className="text-xs text-slate-200 mt-0.5">
                    {data?.statusReason || 'Standard platform operational standing.'}
                  </p>
                </div>

                {data?.unlistedUntil && (
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Scheduled Restoration Date:</span>
                    <span className="font-bold text-amber-300 font-mono">
                      {new Date(data.unlistedUntil).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )}

                {data?.adminNotes && (
                  <div className="pt-2 border-t border-slate-900">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Administrative Guidance Notes</span>
                    <p className="text-xs text-slate-300 mt-0.5 italic">
                      "{data.adminNotes}"
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Important Rights & Protections</span>
                </h4>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Existing orders and scheduled logistics continue normally.</li>
                  <li>Escrow payouts for fulfilled deliveries remain 100% guaranteed.</li>
                  <li>Customer dispute responses can be filed directly in the complaints section.</li>
                  <li>Status can be reviewed and restored early upon complaint resolution.</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowStatusDetailsModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
