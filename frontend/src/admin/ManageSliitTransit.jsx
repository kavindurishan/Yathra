import React, { useState, useEffect } from 'react';
import { 
  Bus, MapPin, Phone, MessageSquare, Clock, CreditCard, 
  Plus, Edit, Trash2, RefreshCw, Play, CheckCircle2, 
  AlertTriangle, Navigation, Shield, Compass, Sparkles, X, Save, Layers,
  ChevronUp, ChevronDown, ArrowUpDown
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
    stops: []
  });

  // New Waypoint Form State for manual route editing
  const [newWaypoint, setNewWaypoint] = useState({
    name: '',
    nameSi: '',
    timeOffset: '+10m',
    km: 5,
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
      stops: [
        { name: 'Start Town', nameSi: 'ආරම්භක නැවතුම', timeOffset: '00m', km: 0, lat: 6.9000, lng: 79.9000 },
        { name: 'SLIIT Malabe Campus', nameSi: 'SLIIT මාලඹේ ප්‍රධාන පිවිසුම', timeOffset: '1h 15m', km: 35, lat: 6.9147, lng: 79.9729 }
      ]
    });
    setNewWaypoint({
      name: '',
      nameSi: '',
      timeOffset: '+10m',
      km: 5,
      lat: 6.9000,
      lng: 79.9500
    });
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
      fare: shuttle.fare || 250,
      monthlyPassFare: shuttle.monthlyPassFare || 6500,
      driverName: shuttle.driverName || '',
      driverPhone: shuttle.driverPhone || '',
      driverWhatsapp: shuttle.driverWhatsapp || '',
      conductorName: shuttle.conductorName || '',
      conductorPhone: shuttle.conductorPhone || '',
      seatCapacity: shuttle.seatCapacity || 45,
      availableSeats: shuttle.availableSeats || 0,
      occupancyStatus: shuttle.occupancyStatus || 'Seats Available',
      departureTimeMorning: shuttle.departureTimeMorning || '06:15 AM',
      arrivalTimeMorning: shuttle.arrivalTimeMorning || '07:45 AM',
      departureTimeEvening: shuttle.departureTimeEvening || '04:45 PM',
      arrivalTimeEvening: shuttle.arrivalTimeEvening || '06:15 PM',
      delayNotice: shuttle.delayNotice || '',
      status: shuttle.status || 'Active',
      stops: shuttle.stops || []
    });
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

  // Click on map in Admin to capture coordinates for new manual road waypoint
  const handleMapAddWaypoint = (lat, lng) => {
    setNewWaypoint(prev => ({
      ...prev,
      lat,
      lng
    }));
  };

  // Select verified preset Sri Lankan junction
  const handleSelectPreset = (e) => {
    const selectedName = e.target.value;
    if (!selectedName) return;
    const preset = SRI_LANKAN_WAYPOINT_PRESETS.find(p => p.name === selectedName);
    if (preset) {
      setNewWaypoint({
        name: preset.name,
        nameSi: preset.nameSi,
        lat: preset.lat,
        lng: preset.lng,
        timeOffset: '+10m',
        km: formData.stops && formData.stops.length > 0 ? (formData.stops[formData.stops.length - 1].km || 0) + 4 : 4
      });
    }
  };

  // Add waypoint to stops array
  const handleAddWaypoint = () => {
    if (!newWaypoint.name.trim()) {
      alert('Please enter a stop / road waypoint name or pick from the presets.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      stops: [
        ...prev.stops,
        {
          name: newWaypoint.name.trim(),
          nameSi: newWaypoint.nameSi.trim() || newWaypoint.name.trim(),
          timeOffset: newWaypoint.timeOffset || '+10m',
          km: Number(newWaypoint.km) || 0,
          lat: Number(newWaypoint.lat) || 6.9000,
          lng: Number(newWaypoint.lng) || 79.9500
        }
      ]
    }));
    // Reset inputs
    setNewWaypoint({
      name: '',
      nameSi: '',
      timeOffset: '+10m',
      km: (Number(newWaypoint.km) || 0) + 4,
      lat: 6.9100,
      lng: 79.9600
    });
  };

  // Move waypoint up in sequence
  const handleMoveStopUp = (index) => {
    if (index === 0) return;
    const stopsCopy = [...formData.stops];
    const temp = stopsCopy[index - 1];
    stopsCopy[index - 1] = stopsCopy[index];
    stopsCopy[index] = temp;
    setFormData({ ...formData, stops: stopsCopy });
  };

  // Move waypoint down in sequence
  const handleMoveStopDown = (index) => {
    if (index === formData.stops.length - 1) return;
    const stopsCopy = [...formData.stops];
    const temp = stopsCopy[index + 1];
    stopsCopy[index + 1] = stopsCopy[index];
    stopsCopy[index] = temp;
    setFormData({ ...formData, stops: stopsCopy });
  };

  // Delete waypoint from sequence
  const handleDeleteStop = (index) => {
    const stopsCopy = [...formData.stops];
    stopsCopy.splice(index, 1);
    setFormData({ ...formData, stops: stopsCopy });
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedShuttle) {
        // Update existing
        await api.campus.update(selectedShuttle._id, formData);
        showNotification(`Successfully updated ${formData.routeName}`);
      } else {
        // Create new
        await api.campus.create(formData);
        showNotification(`Successfully added ${formData.routeName}`);
      }
      setIsEditModalOpen(false);
      loadShuttles();
    } catch (err) {
      alert('Save failed: ' + (err.message || 'Error occurred'));
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the route "${name}"?`)) return;
    try {
      await api.campus.delete(id);
      showNotification(`Deleted ${name}`);
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
  const handleSimulateStep = async (id, action = 'next') => {
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

  // Open Map Preview Modal
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
            ශිෂ්‍ය බස් මාර්ග (Manual Road Waypoints), ගමන් ගාස්තු, රියදුරු සම්බන්ධතා සහ සජීවී GPS Simulator කළමනාකරණය.
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
            <span>Add New Corridor (නව මාර්ගයක්)</span>
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

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 border ${
                    shuttle.status === 'Active'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                  }`}>
                    {shuttle.status}
                  </span>
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
                    <span className="text-[9px] text-slate-400 block font-semibold">Pass: Rs. {shuttle.monthlyPassFare}</span>
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

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => handleSimulateStep(shuttle._id, 'next')}
                    className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
                    title="Advance virtual bus forward to the next stop"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Simulate Step</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenRouteStudio(shuttle)}
                    className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-[11px] flex items-center space-x-1 shadow-sm transition-all transform hover:scale-105 cursor-pointer"
                    title="Click to manually draw or trace the bus route directly on the map"
                  >
                    <span>✏️</span>
                    <span>Draw on Map (පාර අඳින්න)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenMapPreview(shuttle)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex items-center space-x-1 transition-all cursor-pointer"
                  >
                    <Navigation className="w-3 h-3 text-cyan-500" />
                    <span>Preview Path</span>
                  </button>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(shuttle)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all cursor-pointer"
                    title="Edit Route & Waypoints"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(shuttle._id, shuttle.routeName)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
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
                  බස් රථය ගමන් කරන නියම පාර (Custom Road Stops), ගාස්තු සහ රියදුරු තොරතුරු manually ඇතුළත් කරන්න.
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
              
              {/* Basic Route Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Route Name English */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Route Name (English)</label>
                  <input
                    type="text"
                    required
                    value={formData.routeName}
                    onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                    placeholder="e.g. Panadura ⇄ SLIIT Malabe Shuttle"
                  />
                </div>

                {/* Route Name Sinhala */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Route Name (සිංහල)</label>
                  <input
                    type="text"
                    value={formData.routeNameSi}
                    onChange={(e) => setFormData({ ...formData, routeNameSi: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                    placeholder="e.g. පානදුර ⇄ SLIIT මාලඹේ සේවාව"
                  />
                </div>

                {/* Route Code */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Route Code</label>
                  <input
                    type="text"
                    value={formData.routeNumber}
                    onChange={(e) => setFormData({ ...formData, routeNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono font-bold"
                    placeholder="e.g. SLIIT-SH-01"
                  />
                </div>

                {/* Origin */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Origin (ආරම්භක නැවතුම)</label>
                  <input
                    type="text"
                    required
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                    placeholder="e.g. Panadura Bus Stand"
                  />
                </div>

                {/* Destination */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Destination (ගමනාන්තය)</label>
                  <input
                    type="text"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                    placeholder="SLIIT Malabe Campus"
                  />
                </div>

                {/* Bus Number */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Bus Registration No.</label>
                  <input
                    type="text"
                    required
                    value={formData.busNumber}
                    onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono font-bold"
                    placeholder="e.g. WP ND-5842"
                  />
                </div>

                {/* Ticket Fare (Rs) */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Single Ride Fare (ගාස්තුව - Rs.)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.fare}
                    onChange={(e) => setFormData({ ...formData, fare: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                  />
                </div>

                {/* Monthly Pass Fare */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Monthly Pass Fare (මාසික පාස් - Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.monthlyPassFare}
                    onChange={(e) => setFormData({ ...formData, monthlyPassFare: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                  />
                </div>

                {/* Driver Name */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Driver Name (රියදුරු නම)</label>
                  <input
                    type="text"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                    placeholder="e.g. Saman Kumara"
                  />
                </div>

                {/* Driver Phone Number */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Driver Phone (දුරකථන අංකය)</label>
                  <input
                    type="text"
                    value={formData.driverPhone}
                    onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                    placeholder="e.g. +94 77 894 1234"
                  />
                </div>

                {/* Driver WhatsApp */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">WhatsApp (94xxxxxxxxx)</label>
                  <input
                    type="text"
                    value={formData.driverWhatsapp}
                    onChange={(e) => setFormData({ ...formData, driverWhatsapp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                    placeholder="e.g. 94778941234"
                  />
                </div>

                {/* Morning Run Departure */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Morning Departure Time</label>
                  <input
                    type="text"
                    value={formData.departureTimeMorning}
                    onChange={(e) => setFormData({ ...formData, departureTimeMorning: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                    placeholder="06:15 AM"
                  />
                </div>

                {/* Morning Run SLIIT Arrival ETA */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Morning SLIIT Arrival ETA</label>
                  <input
                    type="text"
                    value={formData.arrivalTimeMorning}
                    onChange={(e) => setFormData({ ...formData, arrivalTimeMorning: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                    placeholder="07:45 AM"
                  />
                </div>

                {/* Evening Run Departure */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Evening SLIIT Departure</label>
                  <input
                    type="text"
                    value={formData.departureTimeEvening}
                    onChange={(e) => setFormData({ ...formData, departureTimeEvening: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                    placeholder="04:45 PM"
                  />
                </div>

                {/* Occupancy Status */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Occupancy Status</label>
                  <select
                    value={formData.occupancyStatus}
                    onChange={(e) => setFormData({ ...formData, occupancyStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold cursor-pointer"
                  >
                    <option value="Seats Available">Seats Available (ආසන ඇත)</option>
                    <option value="Standing Only">Standing Only (හිටගෙන යා හැක)</option>
                    <option value="Bus Full">Bus Full (රථය පිරී ඇත)</option>
                  </select>
                </div>

              </div>

              {/* Traffic / Delay Notice */}
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 dark:text-slate-300">Traffic / Delay Announcement (ප්‍රමාද දැනුම්දීම)</label>
                <input
                  type="text"
                  value={formData.delayNotice}
                  onChange={(e) => setFormData({ ...formData, delayNotice: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                  placeholder="e.g. Normal Traffic. Operating smoothly on schedule."
                />
              </div>

              {/* ============================================================== */}
              {/* 🛣️ CUSTOM MANUAL ROUTE & ROAD WAYPOINTS EDITOR                 */}
              {/* ============================================================== */}
              <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800 space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Compass className="w-4 h-4 text-blue-500" />
                      <span>Custom Route Waypoints & Road Sequence ({formData.stops?.length || 0} Halts)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      බස් රථය ගමන් කරන නියම පාරේ පිළිවෙළට නැවතුම් සහ හන්දි එක් කරන්න. සිතියම මත ක්ලික් කරද ලක්ෂ්‍ය එකතු කළ හැක.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      handleOpenRouteStudio(selectedShuttle || formData);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <span>✏️ Launch Route Drawing Studio (සිතියම මත අඳින්න)</span>
                  </button>
                </div>

                {/* Live Route Preview Map Inside Form */}
                <div className="h-56 sm:h-64 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-md">
                  <SliitCustomRouteMap
                    shuttle={{ ...formData, stops: formData.stops }}
                    mapLayerType="custom"
                    onMapClick={handleMapAddWaypoint}
                  />
                </div>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                  <span>💡 Tip: ඉහත සිතියමේ පාර මත ඕනෑම තැනක් ක්ලික් කළ විට, එම ස්ථානයේ Lat/Lng පහත Form එකට ස්වයංක්‍රීයව ලැබේ.</span>
                </p>

                {/* Add New Waypoint Form Card */}
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-blue-900 dark:text-blue-300 flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Road Waypoint / Halt (නව නැවතුමක් එක් කරන්න)</span>
                    </span>

                    {/* Preset Picker Dropdown */}
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-bold text-slate-500">Quick Presets:</span>
                      <select
                        onChange={handleSelectPreset}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled>-- Select Verified Sri Lankan Junction --</option>
                        {SRI_LANKAN_WAYPOINT_PRESETS.map((p, idx) => (
                          <option key={idx} value={p.name}>
                            {p.town} - {p.name} ({p.nameSi})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 block">Waypoint Name (English)</label>
                      <input
                        type="text"
                        value={newWaypoint.name}
                        onChange={(e) => setNewWaypoint({ ...newWaypoint, name: e.target.value })}
                        placeholder="e.g. William Junction"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 block">Sinhala Name (සිංහල)</label>
                      <input
                        type="text"
                        value={newWaypoint.nameSi}
                        onChange={(e) => setNewWaypoint({ ...newWaypoint, nameSi: e.target.value })}
                        placeholder="e.g. විලියම් හන්දිය"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block">Time Offset</label>
                      <input
                        type="text"
                        value={newWaypoint.timeOffset}
                        onChange={(e) => setNewWaypoint({ ...newWaypoint, timeOffset: e.target.value })}
                        placeholder="+15m"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block">Distance (km)</label>
                      <input
                        type="number"
                        value={newWaypoint.km}
                        onChange={(e) => setNewWaypoint({ ...newWaypoint, km: Number(e.target.value) })}
                        placeholder="12"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                      />
                    </div>

                    <div className="col-span-3">
                      <label className="text-[10px] font-bold text-slate-500 block">Latitude (GPS)</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={newWaypoint.lat}
                        onChange={(e) => setNewWaypoint({ ...newWaypoint, lat: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 block">Longitude (GPS)</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={newWaypoint.lng}
                        onChange={(e) => setNewWaypoint({ ...newWaypoint, lng: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                      />
                    </div>

                    <div className="col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={handleAddWaypoint}
                        className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* Ordered List of Sequential Waypoints */}
                <div className="space-y-1.5 max-h-60 overflow-y-auto p-2 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  {(formData.stops || []).map((stop, sIdx) => {
                    const isFirst = sIdx === 0;
                    const isLast = sIdx === formData.stops.length - 1;

                    return (
                      <div 
                        key={sIdx} 
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs shadow-2xs hover:border-blue-400 transition-colors"
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-black text-[10px] ${
                            isFirst ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                            isLast ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            #{sIdx + 1}
                          </span>

                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white">
                              {stop.name}
                            </span>
                            {stop.nameSi && (
                              <span className="text-[10px] text-slate-400 ml-1.5">
                                ({stop.nameSi})
                              </span>
                            )}
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {stop.timeOffset && <span className="text-blue-600 dark:text-blue-400 font-bold mr-2">⏱️ {stop.timeOffset}</span>}
                              {stop.km !== undefined && <span className="mr-2">📏 {stop.km} km</span>}
                              <span className="opacity-75">{Number(stop.lat || 0).toFixed(4)}, {Number(stop.lng || 0).toFixed(4)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Controls (Move Up, Move Down, Delete) */}
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            disabled={isFirst}
                            onClick={() => handleMoveStopUp(sIdx)}
                            className={`p-1 rounded-lg border transition-all cursor-pointer ${
                              isFirst 
                                ? 'opacity-30 border-slate-200 dark:border-slate-800 cursor-not-allowed' 
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                            }`}
                            title="Move Waypoint Earlier in Sequence"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            disabled={isLast}
                            onClick={() => handleMoveStopDown(sIdx)}
                            className={`p-1 rounded-lg border transition-all cursor-pointer ${
                              isLast 
                                ? 'opacity-30 border-slate-200 dark:border-slate-800 cursor-not-allowed' 
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                            }`}
                            title="Move Waypoint Later in Sequence"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteStop(sIdx)}
                            className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-1 transition-all cursor-pointer"
                            title="Remove Stop"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>

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
                  <span>Save Shuttle Route (සුරකින්න)</span>
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
