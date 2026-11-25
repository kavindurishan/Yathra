import React, { useState, useEffect } from 'react';
import { 
  Bus, MapPin, Phone, MessageSquare, Clock, CreditCard, 
  Plus, Edit, Trash2, RefreshCw, Play, CheckCircle2, 
  AlertTriangle, Navigation, Shield, Compass, Sparkles, X, Save, Layers,
  ChevronUp, ChevronDown, ArrowUpDown, Tag, Check, ListPlus, Bookmark, BellRing
} from 'lucide-react';
import { api } from '../services/api';
import SliitCustomRouteMap from '../components/SliitCustomRouteMap';
import RouteDrawingStudio from '../components/RouteDrawingStudio';
import { SRI_LANKAN_WAYPOINT_PRESETS } from '../data/sriLankaJunctions';
import { DEFAULT_SLIIT_SHUTTLES } from '../data/sliitTransitData';

export default function ManageSliitTransit() {
  const [shuttles, setShuttles] = useState(DEFAULT_SLIIT_SHUTTLES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMapPreviewOpen, setIsMapPreviewOpen] = useState(false);
  const [isRouteStudioOpen, setIsRouteStudioOpen] = useState(false);
  const [studioShuttle, setStudioShuttle] = useState(null);
  const [selectedShuttle, setSelectedShuttle] = useState(null);
  const [previewShuttle, setPreviewShuttle] = useState(null);
  const [mapLayerType, setMapLayerType] = useState('custom'); // 'custom' | 'satellite'

  // Form State
  const [formData, setFormData] = useState({
    routeId: '',
    routeNumber: '',
    routeName: '',
    routeNameSi: '',
    origin: '',
    destination: 'SLIIT Malabe Campus',
    busNumber: '',
    busName: '',
    busType: 'AC Luxury Coach',
    fare: 250,
    monthlyPassFare: 6500,
    driverName: '',
    driverPhone: '',
    driverWhatsapp: '',
    conductorName: '',
    conductorPhone: '',
    seatCapacity: 45,
    availableSeats: 15,
    occupancyStatus: 'Seats Available',
    departureTimeMorning: '06:15 AM',
    arrivalTimeMorning: '07:45 AM',
    departureTimeEvening: '04:45 PM',
    arrivalTimeEvening: '06:15 PM',
    delayNotice: '',
    status: 'Active',
    fareCategories: [],
    stops: []
  });

  // State for Category-Based Stage Pricing Form
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    categoryName: '',
    categoryNameSi: '',
    fromStop: '',
    toStop: 'SLIIT Malabe Campus',
    fare: '',
    monthlyPassFare: '',
    intermediateStops: [],
    description: ''
  });
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [newIntermediateStopInput, setNewIntermediateStopInput] = useState('');

  // Quick Service Status & Disruption Notice Modal state
  const [isQuickNoticeModalOpen, setIsQuickNoticeModalOpen] = useState(false);
  const [quickNoticeTarget, setQuickNoticeTarget] = useState(null);
  const [quickStatus, setQuickStatus] = useState('Active');
  const [quickNotice, setQuickNotice] = useState('');
  const [quickSaving, setQuickSaving] = useState(false);

  const handleOpenQuickNotice = (shuttle) => {
    setQuickNoticeTarget(shuttle);
    setQuickStatus(shuttle.status || 'Active');
    setQuickNotice(shuttle.delayNotice || '');
    setIsQuickNoticeModalOpen(true);
  };

  const handleSaveQuickNotice = async () => {
    if (!quickNoticeTarget) return;
    setQuickSaving(true);
    try {
      const targetId = quickNoticeTarget._id || quickNoticeTarget.routeId;
      const updatedData = {
        status: quickStatus,
        delayNotice: quickStatus === 'Active' ? quickNotice.trim() : (quickNotice.trim() || 'Shuttle bus is placed under scheduled maintenance and will not operate.')
      };

      // Optimistic update
      setShuttles(prev => prev.map(s => {
        if (s._id === targetId || s.routeId === targetId) {
          return { ...s, ...updatedData };
        }
        return s;
      }));

      await api.campus.update(targetId, updatedData);
      showNotification(`Updated service status & notice for ${quickNoticeTarget.routeName}`);
      setIsQuickNoticeModalOpen(false);
    } catch (err) {
      alert('Failed to update status: ' + (err.message || 'Error occurred'));
    } finally {
      setQuickSaving(false);
    }
  };

  // New Waypoint Form State for manual route editing
  const [newWaypoint, setNewWaypoint] = useState({
    name: '',
    nameSi: '',
    timeOffset: '+10m',
    km: 5,
    lat: 6.9000,
    lng: 79.9500
  });

  // Inline editing state for individual halts
  const [editingStopIndex, setEditingStopIndex] = useState(null);
  const [editingStopData, setEditingStopData] = useState({
    name: '',
    nameSi: '',
    timeOffset: '+10m',
    km: 0,
    lat: 6.9000,
    lng: 79.9500
  });

  useEffect(() => {
    loadShuttles();
  }, []);

  const loadShuttles = async () => {
    setLoading(true);
    setError('');
    try {
      // Force admin full view (24/7 telemetry)
      const res = await api.campus.getAll(true, 'admin');
      if (res && res.success && res.shuttles && res.shuttles.length > 0) {
        setShuttles(res.shuttles);
      } else if (res && res.success && res.shuttles && res.shuttles.length === 0) {
        // If the database has 0 corridors, auto-seed the official 4 SLIIT corridors
        await handleSeedDefaults(false);
      }
    } catch (err) {
      console.warn('Live telemetry load warning:', err);
      setError('Backend server connection issue: ' + (err.message || 'Server offline') + '. Showing local SLIIT corridor presets.');
      // Keep DEFAULT_SLIIT_SHUTTLES as fallback so the admin screen is never empty
      if (!shuttles || shuttles.length === 0) {
        setShuttles(DEFAULT_SLIIT_SHUTTLES);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDefaults = async (showNotificationMsg = true) => {
    setLoading(true);
    try {
      const res = await api.campus.seedDefaults();
      if (res && res.success && res.shuttles && res.shuttles.length > 0) {
        setShuttles(res.shuttles);
        if (showNotificationMsg) showNotification('Restored official 4 SLIIT Campus Shuttle corridors.');
      } else {
        setShuttles(DEFAULT_SLIIT_SHUTTLES);
      }
    } catch (err) {
      console.warn('Seed defaults error:', err);
      setShuttles(DEFAULT_SLIIT_SHUTTLES);
      if (showNotificationMsg) showNotification('Loaded default SLIIT corridor presets locally.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleOpenCreate = () => {
    setSelectedShuttle(null);
    setFormData({
      routeId: 'sliit-new-' + Date.now().toString().slice(-4),
      routeNumber: 'SLIIT-SH-0' + (shuttles.length + 1),
      routeName: '',
      routeNameSi: '',
      origin: '',
      destination: 'SLIIT Malabe Campus',
      busNumber: '',
      busName: 'SLIIT Campus Express',
      busType: 'AC Luxury Coach',
      fare: 250,
      monthlyPassFare: 6500,
      driverName: '',
      driverPhone: '+94 77 ',
      driverWhatsapp: '9477',
      conductorName: '',
      conductorPhone: '',
      seatCapacity: 45,
      availableSeats: 15,
      occupancyStatus: 'Seats Available',
      departureTimeMorning: '06:15 AM',
      arrivalTimeMorning: '07:45 AM',
      departureTimeEvening: '04:45 PM',
      arrivalTimeEvening: '06:15 PM',
      delayNotice: 'Operating smoothly on schedule.',
      status: 'Active',
      fareCategories: [
        {
          id: 'fc-' + Date.now().toString().slice(-4) + '-1',
          categoryName: 'Start Town to SLIIT',
          categoryNameSi: '',
          fromStop: 'Start Town',
          toStop: 'SLIIT Malabe Campus',
          fare: 250,
          monthlyPassFare: 6500,
          intermediateStops: ['Start Town'],
          description: 'Full corridor stage'
        }
      ],
      stops: [
        { name: 'Start Town', nameSi: '', timeOffset: '00m', km: 0, lat: 6.9000, lng: 79.9000 },
        { name: 'SLIIT Malabe Campus', nameSi: '', timeOffset: '1h 15m', km: 35, lat: 6.9147, lng: 79.9729 }
      ]
    });
    setCategoryForm({
      id: '',
      categoryName: '',
      categoryNameSi: '',
      fromStop: '',
      toStop: 'SLIIT Malabe Campus',
      fare: '',
      monthlyPassFare: '',
      intermediateStops: [],
      description: ''
    });
    setIsEditingCategory(false);
    setNewIntermediateStopInput('');
    setNewWaypoint({
      name: '',
      nameSi: '',
      timeOffset: '+10m',
      km: 5,
      lat: 6.9000,
      lng: 79.9500
    });
    setEditingStopIndex(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (shuttle) => {
    setSelectedShuttle(shuttle);
    setFormData({
      routeId: shuttle.routeId || shuttle._id,
      routeNumber: shuttle.routeNumber || '',
      routeName: shuttle.routeName || '',
      routeNameSi: shuttle.routeNameSi || '',
      origin: shuttle.origin || '',
      destination: shuttle.destination || 'SLIIT Malabe Campus',
      busNumber: shuttle.busNumber || '',
      busName: shuttle.busName || '',
      busType: shuttle.busType || 'AC Luxury Coach',
      fare: shuttle.fare !== undefined ? shuttle.fare : 250,
      monthlyPassFare: shuttle.monthlyPassFare !== undefined ? shuttle.monthlyPassFare : 6500,
      driverName: shuttle.driverName || '',
      driverPhone: shuttle.driverPhone || '',
      driverWhatsapp: shuttle.driverWhatsapp || '',
      conductorName: shuttle.conductorName || '',
      conductorPhone: shuttle.conductorPhone || '',
      seatCapacity: shuttle.seatCapacity || 45,
      availableSeats: shuttle.availableSeats !== undefined ? shuttle.availableSeats : 15,
      occupancyStatus: shuttle.occupancyStatus || 'Seats Available',
      departureTimeMorning: shuttle.departureTimeMorning || '06:15 AM',
      arrivalTimeMorning: shuttle.arrivalTimeMorning || '07:45 AM',
      departureTimeEvening: shuttle.departureTimeEvening || '04:45 PM',
      arrivalTimeEvening: shuttle.arrivalTimeEvening || '06:15 PM',
      delayNotice: shuttle.delayNotice || 'Operating smoothly on schedule.',
      status: shuttle.status || 'Active',
      fareCategories: (shuttle.fareCategories && shuttle.fareCategories.length > 0)
        ? JSON.parse(JSON.stringify(shuttle.fareCategories))
        : [
            {
              id: 'fc-' + Date.now().toString().slice(-4) + '-1',
              categoryName: `${shuttle.origin || 'Main Town'} to SLIIT`,
              categoryNameSi: '',
              fromStop: shuttle.origin || '',
              toStop: shuttle.destination || 'SLIIT Malabe Campus',
              fare: shuttle.fare !== undefined ? shuttle.fare : 250,
              monthlyPassFare: shuttle.monthlyPassFare !== undefined ? shuttle.monthlyPassFare : 6500,
              intermediateStops: shuttle.stops ? shuttle.stops.map(s => s.name) : [],
              description: 'Standard corridor stage'
            }
          ],
      stops: shuttle.stops ? [...shuttle.stops] : []
    });
    setCategoryForm({
      id: '',
      categoryName: '',
      categoryNameSi: '',
      fromStop: '',
      toStop: 'SLIIT Malabe Campus',
      fare: '',
      monthlyPassFare: '',
      intermediateStops: [],
      description: ''
    });
    setIsEditingCategory(false);
    setNewIntermediateStopInput('');
    setEditingStopIndex(null);
    setNewWaypoint({
      name: '',
      nameSi: '',
      timeOffset: '+10m',
      km: shuttle.stops && shuttle.stops.length > 0 ? (shuttle.stops[shuttle.stops.length - 1].km || 0) + 4 : 5,
      lat: 6.9100,
      lng: 79.9600
    });
    setIsEditModalOpen(true);
  };

  // Add or update a fare category in formData
  const handleSaveCategory = (e) => {
    if (e) e.preventDefault();
    if (!categoryForm.categoryName.trim()) {
      alert('Please enter a Category / Stage Name (e.g. Panadura to SLIIT).');
      return;
    }
    const fareNum = Number(categoryForm.fare);
    if (isNaN(fareNum) || fareNum <= 0) {
      alert('Please enter a valid fare amount in Rs. (e.g. 180).');
      return;
    }

    const newCat = {
      id: categoryForm.id || ('fc-' + Date.now().toString().slice(-6)),
      categoryName: categoryForm.categoryName.trim(),
      categoryNameSi: categoryForm.categoryNameSi.trim() || categoryForm.categoryName.trim(),
      fromStop: categoryForm.fromStop.trim() || formData.origin || 'Boarding Point',
      toStop: categoryForm.toStop.trim() || 'SLIIT Malabe Campus',
      fare: fareNum,
      monthlyPassFare: Number(categoryForm.monthlyPassFare) || Math.round(fareNum * 25),
      intermediateStops: categoryForm.intermediateStops || [],
      description: categoryForm.description.trim() || ''
    };

    setFormData(prev => {
      const existingCats = prev.fareCategories || [];
      const idx = existingCats.findIndex(c => c.id === newCat.id);
      let updated;
      if (idx !== -1) {
        updated = [...existingCats];
        updated[idx] = newCat;
      } else {
        updated = [...existingCats, newCat];
      }
      return {
        ...prev,
        fareCategories: updated,
        fare: prev.fare || newCat.fare
      };
    });

    setCategoryForm({
      id: '',
      categoryName: '',
      categoryNameSi: '',
      fromStop: '',
      toStop: 'SLIIT Malabe Campus',
      fare: '',
      monthlyPassFare: '',
      intermediateStops: [],
      description: ''
    });
    setIsEditingCategory(false);
    setNewIntermediateStopInput('');
  };

  const handleStartEditCategory = (cat) => {
    setCategoryForm({
      id: cat.id,
      categoryName: cat.categoryName,
      categoryNameSi: cat.categoryNameSi || '',
      fromStop: cat.fromStop || '',
      toStop: cat.toStop || 'SLIIT Malabe Campus',
      fare: cat.fare,
      monthlyPassFare: cat.monthlyPassFare || '',
      intermediateStops: cat.intermediateStops ? [...cat.intermediateStops] : [],
      description: cat.description || ''
    });
    setIsEditingCategory(true);
  };

  const handleCancelEditCategory = () => {
    setCategoryForm({
      id: '',
      categoryName: '',
      categoryNameSi: '',
      fromStop: '',
      toStop: 'SLIIT Malabe Campus',
      fare: '',
      monthlyPassFare: '',
      intermediateStops: [],
      description: ''
    });
    setIsEditingCategory(false);
    setNewIntermediateStopInput('');
  };

  const handleDeleteCategory = (catId) => {
    setFormData(prev => ({
      ...prev,
      fareCategories: (prev.fareCategories || []).filter(c => c.id !== catId)
    }));
    if (categoryForm.id === catId) {
      handleCancelEditCategory();
    }
  };

  const handleAddIntermediateStop = () => {
    const trimmed = newIntermediateStopInput.trim();
    if (!trimmed) return;
    if (categoryForm.intermediateStops.includes(trimmed)) {
      setNewIntermediateStopInput('');
      return;
    }
    setCategoryForm(prev => ({
      ...prev,
      intermediateStops: [...prev.intermediateStops, trimmed]
    }));
    setNewIntermediateStopInput('');
  };

  const handleRemoveIntermediateStop = (stopName) => {
    setCategoryForm(prev => ({
      ...prev,
      intermediateStops: prev.intermediateStops.filter(s => s !== stopName)
    }));
  };

  const handleToggleRouteStopInCategory = (stopName) => {
    if (categoryForm.intermediateStops.includes(stopName)) {
      handleRemoveIntermediateStop(stopName);
    } else {
      setCategoryForm(prev => ({
        ...prev,
        intermediateStops: [...prev.intermediateStops, stopName]
      }));
    }
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        fare: Number(formData.fare) || (formData.fareCategories?.[0]?.fare) || 0,
        monthlyPassFare: Number(formData.monthlyPassFare) || (formData.fareCategories?.[0]?.monthlyPassFare) || 0,
        seatCapacity: Number(formData.seatCapacity) || 45,
        availableSeats: Number(formData.availableSeats) >= 0 ? Number(formData.availableSeats) : 0,
        fareCategories: formData.fareCategories || [],
        stops: formData.stops || selectedShuttle?.stops || []
      };

      if (selectedShuttle) {
        // Update existing
        const targetId = selectedShuttle._id || selectedShuttle.routeId || formData.routeId;
        
        // Optimistic UI update so the cards reflect changes immediately
        setShuttles(prev => prev.map(s => {
          if (s._id === targetId || s.routeId === targetId || s.routeId === formData.routeId) {
            return { ...s, ...payload };
          }
          return s;
        }));

        try {
          await api.campus.update(targetId, payload);
        } catch (apiErr) {
          console.warn('Backend update sync warning:', apiErr);
        }
        showNotification(`Successfully updated ${formData.routeName}`);
      } else {
        // Create new
        const res = await api.campus.create(payload);
        if (res && res.shuttle) {
          setShuttles(prev => [...prev, res.shuttle]);
        }
        showNotification(`Successfully added ${formData.routeName}`);
      }
      setIsEditModalOpen(false);
      loadShuttles();
    } catch (err) {
      alert('Save failed: ' + (err.message || 'Error occurred'));
    }
  };

  const handleDelete = async (shuttleOrId, name) => {
    const id = typeof shuttleOrId === 'object' ? (shuttleOrId._id || shuttleOrId.routeId) : shuttleOrId;
    const routeName = name || (typeof shuttleOrId === 'object' ? shuttleOrId.routeName : 'this route');
    if (!window.confirm(`Are you sure you want to delete the route "${routeName}"?`)) return;
    try {
      await api.campus.delete(id);
      showNotification(`Deleted ${routeName}`);
      loadShuttles();
    } catch (err) {
      alert('Delete failed: ' + (err.message || 'Error'));
    }
  };

  // Open Interactive Route Drawing Studio for a shuttle
  const handleOpenRouteStudio = (shuttle) => {
    setStudioShuttle(shuttle);
    setIsRouteStudioOpen(true);
  };

  // Save drawn route from interactive studio
  const handleSaveDrawnRoute = async (formattedStops) => {
    if (!studioShuttle) return;
    try {
      const updatedData = {
        ...studioShuttle,
        stops: formattedStops,
        origin: formattedStops[0]?.name || studioShuttle.origin,
        destination: formattedStops[formattedStops.length - 1]?.name || studioShuttle.destination
      };
      await api.campus.update(studioShuttle._id || studioShuttle.routeId, updatedData);
      showNotification(`Successfully saved drawn route for ${studioShuttle.routeName} (${formattedStops.length} stops)`);
      setIsRouteStudioOpen(false);
      loadShuttles();
    } catch (err) {
      alert('Save failed: ' + (err.message || 'Error occurred'));
    }
  };

  // Virtual GPS Simulator Step
  const handleSimulateStep = async (shuttleOrId, action = 'next') => {
    const id = typeof shuttleOrId === 'object' ? (shuttleOrId._id || shuttleOrId.routeId) : shuttleOrId;
    try {
      const res = await api.campus.simulateStep(id, action);
      if (res.success) {
        showNotification(`Advanced virtual bus along its custom road route.`);
        loadShuttles();
      }
    } catch (err) {
      alert('Simulation error: ' + (err.message || 'Error'));
    }
  };

  // Open Map Preview Modal (admin always has access; time gate is on the student-facing page)
  const handleOpenMapPreview = (shuttle) => {
    setPreviewShuttle(shuttle);
    setIsMapPreviewOpen(true);
  };

  return (
    <div className="space-y-6 select-none p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      
      {/* Top Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider mb-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>SLIIT Transit Administration & Dispatch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Manage SLIIT Campus Shuttles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage student bus routes, road waypoints, stage fares, driver contacts, and live GPS simulator.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            type="button"
            onClick={loadShuttles}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-sm"
            title="Refresh Fleet Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => handleSeedDefaults(true)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
            title="Restore or synchronize official default SLIIT shuttle routes"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Restore Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Corridor</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadShuttles}
            className="px-2.5 py-1 rounded-lg bg-amber-200/60 dark:bg-amber-900/60 hover:bg-amber-200 font-bold text-xs cursor-pointer transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && shuttles.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800/60 border border-slate-300/60 dark:border-slate-800 p-5 space-y-4">
              <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded-md w-1/3"></div>
              <div className="h-10 bg-slate-300 dark:bg-slate-700 rounded-md w-3/4"></div>
              <div className="h-20 bg-slate-300 dark:bg-slate-700 rounded-xl"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && shuttles.length === 0 && (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
            <Bus className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">No Shuttle Corridors Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Your database currently has no SLIIT campus corridors configured. You can instantly load the official routes or create a new custom route.
            </p>
          </div>
          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              type="button"
              onClick={() => handleSeedDefaults(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Load Official 4 SLIIT Routes</span>
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-all cursor-pointer"
            >
              + Create Custom Route
            </button>
          </div>
        </div>
      )}

      {/* Fleet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(shuttles || []).map((shuttle) => {
          const loc = shuttle.currentLocation || {};
          return (
            <div 
              key={shuttle._id || shuttle.routeId} 
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                
                {/* Title & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                      {shuttle.routeNumber || 'SLIIT-SH'}
                    </span>
                    <h3 className="font-black text-base text-slate-900 dark:text-white mt-1 leading-snug">
                      {shuttle.routeName}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${
                      shuttle.status === 'Active'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                        : shuttle.status === 'Maintenance'
                        ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 animate-pulse'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300'
                    }`}>
                      {shuttle.status === 'Maintenance' && <span>🔧</span>}
                      {shuttle.status === 'Active' && <span>🟢</span>}
                      {shuttle.status === 'Inactive' && <span>🔴</span>}
                      <span>{shuttle.status === 'Maintenance' ? 'Maintenance (Map Hidden)' : shuttle.status}</span>
                    </span>
                  </div>
                </div>

                {/* Subtitle / Sinhala */}
                {shuttle.routeNameSi && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {shuttle.routeNameSi}
                  </p>
                )}

                {/* Key Details Grid */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800/60 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Single Fare</span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">Rs. {shuttle.fare}</span>
                    <span className="text-[9px] text-amber-600 dark:text-amber-400 block font-semibold">Daily to Bus</span>
                    {shuttle.fareCategories && shuttle.fareCategories.length > 0 && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-blue-100/70 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold">
                        🏷️ {shuttle.fareCategories.length} Stages
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Driver</span>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate block">
                      {shuttle.driverName || 'Not Set'}
                    </span>
                    <a
                      href={`tel:${shuttle.driverPhone}`}
                      className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center space-x-1 truncate mt-0.5"
                    >
                      <Phone className="w-2.5 h-2.5" />
                      <span>{shuttle.driverPhone || '--'}</span>
                    </a>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Morning Run</span>
                    <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 block">
                      {shuttle.departureTimeMorning}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-semibold">ETA: {shuttle.arrivalTimeMorning}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Evening Run</span>
                    <span className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400 block">
                      {shuttle.departureTimeEvening}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-semibold">ETA: {shuttle.arrivalTimeEvening}</span>
                  </div>
                </div>

                {/* Category Fare Stages Preview */}
                {shuttle.fareCategories && shuttle.fareCategories.length > 0 && (
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 dark:border-amber-800/60 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Fare Categories ({shuttle.fareCategories.length})</span>
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 font-bold">Stage Pricing</span>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
                      {shuttle.fareCategories.map((cat, cIdx) => (
                        <div 
                          key={cat.id || cIdx} 
                          className="p-2 rounded-xl bg-white/90 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 shadow-2xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-xs text-slate-900 dark:text-white truncate">
                                {cat.categoryName}
                              </span>
                              {cat.categoryNameSi && (
                                <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                                  ({cat.categoryNameSi})
                                </span>
                              )}
                            </div>
                            {cat.intermediateStops && cat.intermediateStops.length > 0 ? (
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                Stops: <strong>{cat.intermediateStops.slice(0, 3).join(', ')}{cat.intermediateStops.length > 3 ? ` +${cat.intermediateStops.length - 3} more` : ''}</strong>
                              </p>
                            ) : (
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                Boarding: {cat.fromStop}
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-xs shadow-xs">
                              Rs. {cat.fare}
                            </span>
                            
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Waypoints list preview */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                    <span>Manual Route Waypoints ({shuttle.stops?.length || 0} Halts)</span>
                    <span className="text-blue-500 font-mono">Sequential Path</span>
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800">
                    {(shuttle.stops || []).map((st, i) => (
                      <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-800">
                        #{i + 1} {st.name}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Active Service Notice Banner on Card */}
              {shuttle.delayNotice && (
                <div className={`p-2.5 rounded-2xl border text-xs flex items-start space-x-2.5 ${
                  shuttle.status === 'Maintenance'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/80 text-rose-800 dark:text-rose-300'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/80 text-amber-800 dark:text-amber-300'
                }`}>
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[10px] uppercase tracking-wider">
                        {shuttle.status === 'Maintenance' ? '🔧 Maintenance Alert' : '📢 Active Service Notice'}
                      </span>
                    </div>
                    <p className="font-bold text-xs leading-snug">{shuttle.delayNotice}</p>
                  </div>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(shuttle)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                    title="Edit Route, Driver, Bus, Fare, Times, and Waypoints"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenQuickNotice(shuttle)}
                    className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                    title="Quickly change Service Status (Active/Maintenance) or broadcast emergency notice"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                    <span>Status / Notice</span>
                  </button>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenRouteStudio(shuttle)}
                    className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-[11px] flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
                    title="Click to manually draw or trace the bus route directly on the map"
                  >
                    <span>✏️</span>
                    <span>Draw on Map</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenMapPreview(shuttle)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex items-center space-x-1 transition-all cursor-pointer"
                    title="Preview route path"
                  >
                    <Navigation className="w-3 h-3 text-cyan-500" />
                    <span>Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSimulateStep(shuttle, 'next')}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex items-center space-x-1 transition-all cursor-pointer"
                    title="Advance virtual bus forward to the next stop"
                  >
                    <Play className="w-3 h-3 text-blue-500 fill-blue-500" />
                    <span>Step</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(shuttle)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                    title="Delete Route"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* QUICK SERVICE STATUS & OPERATIONAL NOTICE MODAL (URGENT ALERT)  */}
      {/* ============================================================== */}
      {isQuickNoticeModalOpen && quickNoticeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Service Status & Alert Broadcast
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {quickNoticeTarget.routeName} ({quickNoticeTarget.busNumber})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsQuickNoticeModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Service Status Radio Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                1. Service Operational Status:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'Active', label: '🟢 Active', desc: 'Normal Operation (Live Map ON)' },
                  { value: 'Maintenance', label: '🔧 Maintenance', desc: 'Maintenance (Map Hidden & Alert)' },
                  { value: 'Inactive', label: '🔴 Suspended', desc: 'Service Suspended' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setQuickStatus(opt.value);
                      if (opt.value === 'Maintenance') {
                        setQuickNotice('Shuttle bus is placed under scheduled maintenance and will not operate.');
                      } else if (opt.value === 'Active') {
                        setQuickNotice('');
                      } else if (opt.value === 'Inactive') {
                        setQuickNotice('Shuttle service on this corridor is temporarily suspended.');
                      }
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      quickStatus === opt.value
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/30'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                    }`}
                  >
                    <span className="font-black text-xs text-slate-900 dark:text-white">{opt.label}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Preset Buttons for Real-world Student Notifications */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                2. Quick Notice Presets (Click to choose instantly):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {[
                  { label: '🚫 Evening shuttle will not operate today', text: 'Evening return shuttle from SLIIT Malabe will not operate today.' },
                  { label: '⚠️ Tomorrow shuttle service suspended', text: 'Tomorrow SLIIT shuttle service on this corridor will not operate. Please arrange alternate transport.' },
                  { label: '🔧 Shuttle placed under maintenance', text: 'Shuttle bus is placed under scheduled maintenance and will not operate.' },
                  { label: '🚨 Full service cancelled for today', text: 'Both morning and evening shuttle services are cancelled for today.' },
                  { label: '⏰ Evening bus departs Malabe at 05:30 PM', text: 'Evening return shuttle will depart SLIIT Malabe 30 minutes late at 05:30 PM.' },
                  { label: '🌧️ Adverse weather / traffic delay', text: 'Adverse weather and heavy traffic congestion may cause a 15-20 min delay.' },
                  { label: '✅ Normal operation on schedule (Clear)', text: 'Normal Traffic. Operating smoothly on schedule.' }
                ].map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuickNotice(p.text);
                      if (p.label.toLowerCase().includes('maintenance')) {
                        setQuickStatus('Maintenance');
                      }
                    }}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-rose-400 text-left text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Notice Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Notice Message Text (Broadcast to Students):
              </label>
              <textarea
                rows={2}
                value={quickNotice}
                onChange={(e) => setQuickNotice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs"
                placeholder="e.g. Evening return shuttle from SLIIT Malabe will not operate today."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsQuickNoticeModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuickNotice}
                disabled={quickSaving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black text-xs shadow-md shadow-rose-600/20 flex items-center space-x-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{quickSaving ? 'Broadcasting...' : 'Save & Broadcast to Students'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT / CREATE MODAL WITH COMPREHENSIVE MANUAL ROUTE BUILDER    */}
      {/* ============================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedShuttle ? `Edit Corridor: ${formData.routeName}` : 'Create New SLIIT Campus Route'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure road waypoints, stage fares, schedules, and driver contacts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSubmit} className="p-4 sm:p-6 space-y-6 text-xs">
              
              {/* SECTION 1: Route & Corridor Identity */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>1. Route & Service Identity</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 dark:text-slate-300">Route Name</label>
                    <input
                      type="text"
                      required
                      value={formData.routeName}
                      onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                      placeholder="Panadura ⇄ SLIIT Malabe Shuttle"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 dark:text-slate-300">Route Tagline / Subtitle</label>
                    <input
                      type="text"
                      value={formData.routeNameSi}
                      onChange={(e) => setFormData({ ...formData, routeNameSi: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                      placeholder="e.g. Express Student Coach"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 dark:text-slate-300">Route Code</label>
                    <input
                      type="text"
                      value={formData.routeNumber}
                      onChange={(e) => setFormData({ ...formData, routeNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                      placeholder="SLIIT-SH-01"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 dark:text-slate-300">Origin Town</label>
                    <input
                      type="text"
                      required
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                      placeholder="Panadura Bus Stand"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 dark:text-slate-300">Destination</label>
                    <input
                      type="text"
                      required
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                      placeholder="SLIIT Malabe Campus"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 dark:text-slate-300">Service Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        let newDelayNotice = formData.delayNotice || '';
                        if (newStatus === 'Maintenance') {
                          newDelayNotice = 'Shuttle bus is placed under scheduled maintenance and will not operate.';
                        } else if (newStatus === 'Inactive') {
                          newDelayNotice = 'Shuttle service on this corridor is temporarily suspended.';
                        } else if (newStatus === 'Active') {
                          newDelayNotice = '';
                        }
                        setFormData({
                          ...formData,
                          status: newStatus,
                          delayNotice: newDelayNotice
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold cursor-pointer"
                    >
                      <option value="Active">🟢 Active (Live Telemetry ON)</option>
                      <option value="Maintenance">🟡 Maintenance (Schedules active, Map alerts)</option>
                      <option value="Inactive">🔴 Inactive (Service Suspended)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Vehicle & Passenger Capacity */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-wider">
                  <Bus className="w-3.5 h-3.5" />
                  <span>2. Vehicle & Capacity</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 dark:text-slate-300">Bus Registration No.</label>
                    <input
                      type="text"
                      required
                      value={formData.busNumber}
                      onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                      placeholder="WP NB-5208"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 dark:text-slate-300">Bus Label / Model Name</label>
                    <input
                      type="text"
                      value={formData.busName}
                      onChange={(e) => setFormData({ ...formData, busName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                      placeholder="SLIIT Panadura Luxury Coach"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 dark:text-slate-300">Bus Category / Type</label>
                    <select
                      value={formData.busType}
                      onChange={(e) => setFormData({ ...formData, busType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold cursor-pointer"
                    >
                      <option value="AC Luxury Coach">AC Luxury Coach</option>
                      <option value="Semi Luxury">Semi Luxury Coach</option>
                      <option value="Express Non-AC">Express Non-AC Coach</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 dark:text-slate-300">Total Seat Capacity</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.seatCapacity === 0 ? 0 : (formData.seatCapacity || '')}
                      onChange={(e) => setFormData({ ...formData, seatCapacity: e.target.value === '' ? '' : Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 dark:text-slate-300">Available Seats</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.availableSeats === 0 ? 0 : (formData.availableSeats || '')}
                      onChange={(e) => setFormData({ ...formData, availableSeats: e.target.value === '' ? '' : Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 dark:text-slate-300">Occupancy Status</label>
                    <select
                      value={formData.occupancyStatus}
                      onChange={(e) => setFormData({ ...formData, occupancyStatus: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold cursor-pointer"
                    >
                      <option value="Seats Available">Seats Available</option>
                      <option value="Standing Only">Standing Only</option>
                      <option value="Bus Full">Bus Full</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Driver & Crew Contacts */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-wider">
                  <Phone className="w-3.5 h-3.5" />
                  <span>3. Driver & Crew Contacts</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 dark:text-slate-300">Driver Name</label>
                    <input
                      type="text"
                      value={formData.driverName}
                      onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                      placeholder="e.g. Chaminda Jayalath"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 dark:text-slate-300">Driver Phone</label>
                    <input
                      type="text"
                      value={formData.driverPhone}
                      onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                      placeholder="+94 76 688 8078"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 dark:text-slate-300">WhatsApp (94xxxxxxxxx)</label>
                    <input
                      type="text"
                      value={formData.driverWhatsapp}
                      onChange={(e) => setFormData({ ...formData, driverWhatsapp: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                      placeholder="94766888078"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 dark:text-slate-300">Conductor Name</label>
                    <input
                      type="text"
                      value={formData.conductorName}
                      onChange={(e) => setFormData({ ...formData, conductorName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                      placeholder="Sunil Shantha"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-extrabold text-slate-700 dark:text-slate-300">Conductor Phone</label>
                    <input
                      type="text"
                      value={formData.conductorPhone}
                      onChange={(e) => setFormData({ ...formData, conductorPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                      placeholder="+94 71 456 7890"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Category-Based Stage Pricing & Fares */}
              <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border-2 border-amber-300/70 dark:border-amber-800/70 space-y-5">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 dark:border-amber-900/40 pb-3">
                  <div>
                    <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-wider">
                      <Tag className="w-4 h-4" />
                      <span>4. Category Fares & Intermediate Stops</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Configure fares for different boarding stages (e.g. Panadura to SLIIT - Rs.180, Moratuwa to SLIIT - Rs.150, Dehiwala to SLIIT - Rs.120) and assign intermediate stops.
                    </p>
                  </div>


                </div>

                {/* List of Configured Fare Categories */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Configured Price Categories ({formData.fareCategories?.length || 0} Stages)</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Students see these options clearly</span>
                  </div>

                  {(!formData.fareCategories || formData.fareCategories.length === 0) ? (
                    <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs text-slate-400">
                      No customized category tiers yet. Base route fare (Rs. {formData.fare}) will apply. Use the form below to add stages.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {formData.fareCategories.map((cat, idx) => (
                        <div 
                          key={cat.id || idx}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 shadow-xs hover:border-amber-400 transition-colors"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-1">
                              <div>
                                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                                  Stage #{idx + 1}
                                </span>
                                <h4 className="font-black text-xs text-slate-900 dark:text-white leading-tight">
                                  {cat.categoryName}
                                </h4>
                                {cat.categoryNameSi && (
                                  <p className="text-[10px] text-slate-500 font-medium">
                                    {cat.categoryNameSi}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center space-x-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditCategory(cat)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Edit category"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Delete category"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Fares highlight */}
                            <div className="flex items-baseline space-x-2 pt-1">
                              <span className="text-base font-black text-slate-900 dark:text-white">
                                Rs. {cat.fare}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                / ride
                              </span>
                              
                            </div>

                            {/* Intermediate Stops Tags */}
                            <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                                Intermediate Halts Included:
                              </span>
                              {cat.intermediateStops && cat.intermediateStops.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {cat.intermediateStops.map((st, sIdx) => (
                                    <span 
                                      key={sIdx}
                                      className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300"
                                    >
                                      <span>{st}</span>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">No sub-stops assigned (covers {cat.fromStop})</span>
                              )}
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sub-form: Add or Edit a Category */}
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-300/60 dark:border-amber-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 font-black text-xs text-amber-700 dark:text-amber-300">
                      <ListPlus className="w-4 h-4" />
                      <span>{isEditingCategory ? 'Edit Fare Category / Stage' : 'Add New Fare Category (අලුත් ගාස්තු කාණ්ඩයක් ඇතුළත් කරන්න)'}</span>
                    </div>
                    {isEditingCategory && (
                      <button
                        type="button"
                        onClick={handleCancelEditCategory}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                      >
                        Cancel Editing
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-700 dark:text-slate-300">
                        Category / Stage Name (English)
                      </label>
                      <input
                        type="text"
                        value={categoryForm.categoryName}
                        onChange={(e) => setCategoryForm({ ...categoryForm, categoryName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                        placeholder="e.g. Panadura to SLIIT"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-700 dark:text-slate-300">
                        Category Name (සිංහල)
                      </label>
                      <input
                        type="text"
                        value={categoryForm.categoryNameSi}
                        onChange={(e) => setCategoryForm({ ...categoryForm, categoryNameSi: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                        placeholder="e.g. පානදුර සිට SLIIT දක්වා"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-700 dark:text-slate-300">
                        Boarding From (ආරම්භක නැවතුම)
                      </label>
                      <input
                        type="text"
                        value={categoryForm.fromStop}
                        onChange={(e) => setCategoryForm({ ...categoryForm, fromStop: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                        placeholder="e.g. Panadura or Moratuwa"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-700 dark:text-slate-300">
                        Single Ride Fare (ගාස්තුව - Rs.)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={categoryForm.fare}
                        onChange={(e) => setCategoryForm({ ...categoryForm, fare: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                        placeholder="e.g. 180"
                      />
                    </div>



                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-700 dark:text-slate-300">
                        Section Description / Note
                      </label>
                      <input
                        type="text"
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                        placeholder="e.g. Panadura & Moratuwa junction zone"
                      />
                    </div>
                  </div>

                  {/* Intermediate Stops Adder for this Category */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <span className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-500" />
                          <span>Intermediate Stops (මෙම මිලට අදාළ අතරමැදි නැවතුම්)</span>
                        </span>
                        <p className="text-[10px] text-slate-500">
                          මෙම ගාස්තුව යටතේ සිසුන්ට නැගීමට හැකි අතරමැදි නැවතුම් පහතින් එකතු කරන්න හෝ තෝරන්න.
                        </p>
                      </div>
                    </div>

                    {/* Quick Toggle from Existing Route Halts */}
                    {formData.stops && formData.stops.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                          Quick-Pick From Current Route Halts (ක්ලික් කර අමුණන්න):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {formData.stops.map((st, i) => {
                            const isIncluded = categoryForm.intermediateStops.includes(st.name);
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleToggleRouteStopInCategory(st.name)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                                  isIncluded
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                <span>{isIncluded ? '✓' : '+'}</span>
                                <span>{st.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Manual Stop Text Adder */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                        Or Type Any Intermediate Stop Name (නැවතුමේ නම ලියා එකතු කරන්න):
                      </span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newIntermediateStopInput}
                          onChange={(e) => setNewIntermediateStopInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddIntermediateStop();
                            }
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-xs"
                          placeholder="e.g. Pinwatta, Walana, Gorakana, Katubedda Junction..."
                        />
                        <button
                          type="button"
                          onClick={handleAddIntermediateStop}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs transition-all cursor-pointer"
                        >
                          + Add Stop (එකතු කරන්න)
                        </button>
                      </div>
                    </div>

                    {/* Tagged stops chips preview */}
                    {categoryForm.intermediateStops.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          Selected Stops for this Category ({categoryForm.intermediateStops.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {categoryForm.intermediateStops.map((st, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs font-bold"
                            >
                              <span>{st}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveIntermediateStop(st)}
                                className="text-amber-600 hover:text-amber-900 dark:hover:text-white cursor-pointer ml-1"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2">
                    {isEditingCategory && (
                      <button
                        type="button"
                        onClick={handleCancelEditCategory}
                        className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveCategory}
                      className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md shadow-amber-600/20 flex items-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isEditingCategory ? 'Update Category (යාවත්කාලීන කරන්න)' : 'Save Category (කාණ්ඩය සුරකින්න)'}</span>
                    </button>
                  </div>
                </div>

                {/* Corridor Baseline Fares & Timetable Grid */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                    Corridor Baseline Defaults & Schedule Times (මූලික ගාස්තු සහ ධාවන වේලාවන්)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Single Ride Fare */}
                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-700 dark:text-slate-300">Default Base Fare (ගාස්තුව - Rs.)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.fare === 0 ? 0 : (formData.fare || '')}
                        onChange={(e) => setFormData({ ...formData, fare: e.target.value === '' ? '' : Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                        placeholder="e.g. 250"
                      />
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {[120, 150, 180, 200, 250].map(f => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setFormData({ ...formData, fare: f })}
                            className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            Rs. {f}
                          </button>
                        ))}
                      </div>
                    </div>



                    {/* Morning Departure Time */}
                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-700 dark:text-slate-300">Morning Departure Time (ආරම්භක වේලාව)</label>
                      <input
                        type="text"
                        value={formData.departureTimeMorning || ''}
                        onChange={(e) => setFormData({ ...formData, departureTimeMorning: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                        placeholder="06:15 AM"
                      />
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {['06:00 AM', '06:10 AM', '06:15 AM', '06:30 AM'].map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setFormData({ ...formData, departureTimeMorning: t })}
                            className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Morning SLIIT Arrival ETA */}
                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-700 dark:text-slate-300">Morning SLIIT Arrival ETA (ළඟාවීම)</label>
                      <input
                        type="text"
                        value={formData.arrivalTimeMorning || ''}
                        onChange={(e) => setFormData({ ...formData, arrivalTimeMorning: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                        placeholder="07:45 AM"
                      />
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {['07:30 AM', '07:45 AM', '08:00 AM', '08:15 AM'].map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setFormData({ ...formData, arrivalTimeMorning: t })}
                            className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Evening SLIIT Departure */}
                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-700 dark:text-slate-300">Evening SLIIT Departure (සවස පිටත්වීම)</label>
                      <input
                        type="text"
                        value={formData.departureTimeEvening || ''}
                        onChange={(e) => setFormData({ ...formData, departureTimeEvening: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                        placeholder="04:45 PM"
                      />
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {['04:30 PM', '04:45 PM', '05:00 PM', '05:40 PM'].map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setFormData({ ...formData, departureTimeEvening: t })}
                            className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Evening Return Arrival ETA */}
                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-700 dark:text-slate-300">Evening Arrival ETA (සවස ළඟාවීම)</label>
                      <input
                        type="text"
                        value={formData.arrivalTimeEvening || ''}
                        onChange={(e) => setFormData({ ...formData, arrivalTimeEvening: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                        placeholder="06:15 PM"
                      />
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {['06:00 PM', '06:15 PM', '06:30 PM', '08:00 PM'].map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setFormData({ ...formData, arrivalTimeEvening: t })}
                            className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: Traffic & Delay Announcement */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 font-black text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>5. Live Delay Notice & Announcements (ප්‍රමාද දැනුම්දීම්)</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, delayNotice: '', status: 'Active' })}
                      className="px-2 py-0.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      ✅ On Schedule
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, delayNotice: 'Heavy traffic reported. Expected delay of approx 15 minutes.' })}
                      className="px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      ⚠️ 15m Delay
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, delayNotice: 'Slow traffic due to adverse weather and heavy rain.' })}
                      className="px-2 py-0.5 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      🌧️ Heavy Rain
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, delayNotice: 'ශිෂ්‍ය බස් රථය නඩත්තු කටයුතු (Scheduled Maintenance) සඳහා යොමු කර ඇති බැවින් ධාවනය නොවේ.', status: 'Maintenance' })}
                      className="px-2 py-0.5 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      🔧 Maintenance
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={formData.delayNotice || ''}
                  onChange={(e) => setFormData({ ...formData, delayNotice: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  placeholder="e.g. Normal Traffic. Operating smoothly on schedule."
                />
              </div>

              {/* Note about Route Map & Drawing Studio */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-black text-xs text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <span>🛣️</span>
                    <span>Route Waypoints & Road Path (නැවතුම් සහ ගමන් මාර්ගය)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    මෙම මාර්ගයේ දැනට නැවතුම් <b>{selectedShuttle?.stops?.length || formData.stops?.length || 0}</b> ක් ඇත. සිතියම මත නැවතුම් වෙනස් කිරීමට හෝ අලුතින් ඇඳීමට <b>'Draw on Map'</b> භාවිතා කරන්න.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    handleOpenRouteStudio(selectedShuttle || formData);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto shrink-0"
                >
                  ✏️ Open Draw on Map Studio
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-500/25 flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Shuttle Details (තොරතුරු සුරකින්න)</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SHUTTLE MAP PREVIEW MODAL                                      */}
      {/* ============================================================== */}
      {isMapPreviewOpen && previewShuttle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl h-[550px] overflow-hidden shadow-2xl flex flex-col">
            
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <h4 className="font-black text-sm text-white">{previewShuttle.routeName}</h4>
                  <p className="text-[10px] text-blue-300 font-semibold">
                    Sequential Custom Road Line: {previewShuttle.stops?.length || 0} Waypoint Halts
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* View Switcher: Custom Road vs Satellite */}
                <div className="inline-flex p-0.5 bg-slate-800 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setMapLayerType('custom')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                      mapLayerType === 'custom' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Custom Road
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapLayerType('satellite')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                      mapLayerType === 'satellite' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Satellite
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMapPreviewOpen(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Custom Leaflet Map Frame */}
            <div className="relative flex-1 bg-slate-950">
              <SliitCustomRouteMap
                shuttle={previewShuttle}
                mapLayerType={mapLayerType}
                isLive={true}
              />

              {/* Overlay HUD */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-3 rounded-2xl text-white text-xs flex flex-wrap items-center justify-between gap-2 z-10">
                <div className="flex items-center space-x-2">
                  <Bus className="w-4 h-4 text-blue-400" />
                  <span className="font-extrabold">{previewShuttle.busNumber}</span>
                  <span className="text-slate-400">|</span>
                  <span>Driver: <strong>{previewShuttle.driverName} ({previewShuttle.driverPhone})</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">Speed: {previewShuttle.currentLocation?.speed || 40} km/h</span>
                  <span className="text-blue-300 font-bold">Fare: Rs. {previewShuttle.fare}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Interactive Map Route Drawing Studio */}
      <RouteDrawingStudio
        isOpen={isRouteStudioOpen}
        shuttle={studioShuttle}
        onClose={() => setIsRouteStudioOpen(false)}
        onSave={handleSaveDrawnRoute}
      />

    </div>
  );
}
