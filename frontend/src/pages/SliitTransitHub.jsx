import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Bus, MapPin, Compass, Navigation, Phone, MessageSquare, 
  Clock, Shield, AlertTriangle, CheckCircle2, RefreshCw, 
  Layers, ExternalLink, Sparkles, ChevronRight, Play, Eye, EyeOff,
  CreditCard, ArrowLeft, Radio, GraduationCap, LogIn, ShieldCheck,
  Tag, Bookmark, Check, Wrench, BellRing, AlertOctagon, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DEFAULT_SLIIT_SHUTTLES } from '../data/sliitTransitData';
import SliitCustomRouteMap from '../components/SliitCustomRouteMap';

export default function SliitTransitHub() {
  const navigate = useNavigate();
  const [shuttles, setShuttles] = useState(DEFAULT_SLIIT_SHUTTLES);
  const [selectedShuttleId, setSelectedShuttleId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const r = params.get('route');
      if (r) return r;
    }
    return 'sliit-panadura';
  });

  // Handler to switch corridor & sync with URL
  const handleSelectShuttle = (routeId) => {
    setSelectedShuttleId(routeId);
    setInspectedStop(null);
    setSelectedBoardingStop('');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('route', routeId);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Listen to popstate (back/forward in browser)
  useEffect(() => {
    const onPop = () => {
      const params = new URLSearchParams(window.location.search);
      const r = params.get('route');
      if (r) setSelectedShuttleId(r);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Test Mode & Simulation State
  const { user, login } = useAuth();
  const [fastLoginLoading, setFastLoginLoading] = useState(false);

  const isSliitStudent = Boolean(
    user?.isSliitStudent || 
    (user?.email && (user.email.toLowerCase().endsWith('@my.sliit.lk') || user.email.toLowerCase().endsWith('@sliit.lk')))
  );

  const handleQuickStudentLogin = async () => {
    setFastLoginLoading(true);
    try {
      await login('it21004567@my.sliit.lk', 'sliit123');
    } catch (e) {
      console.error(e);
    } finally {
      setFastLoginLoading(false);
    }
  };

  const [forceWindowActive, setForceWindowActive] = useState(true);
  // Map Engine & Layer: 'custom' (Leaflet manual road polyline) | 'google' (Google Directions) | 'satellite' (Esri World Imagery)
  const [mapEngine, setMapEngine] = useState('custom'); 
  const [inspectedStop, setInspectedStop] = useState(null);
  const [serverTimeInfo, setServerTimeInfo] = useState(null);
  const [focusBusKey, setFocusBusKey] = useState(0);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  // Active Shuttle (declared before useEffects and handlers)
  const activeShuttle = shuttles.find(s => (s.routeId === selectedShuttleId || s._id === selectedShuttleId)) || shuttles[0] || DEFAULT_SLIIT_SHUTTLES[0];

  // Selected Boarding Stop for Stage Fare Calculator
  const [selectedBoardingStop, setSelectedBoardingStop] = useState('');

  // Helper: Find category and exact fare for any given stop or halt
  const getStopFareInfo = (stopName, shuttle = activeShuttle) => {
    if (!shuttle) return { fare: 180, categoryName: 'Stage Fare', categoryNameSi: '', monthlyPassFare: 4500 };
    const cleanName = (stopName || '').toLowerCase().trim();

    // 1. Direct match on stop's own fare property
    const stopObj = shuttle.stops?.find(s => s.name?.toLowerCase().trim() === cleanName);
    if (stopObj && typeof stopObj.fare === 'number' && stopObj.fare > 0) {
      return {
        fare: stopObj.fare,
        categoryName: stopObj.fareCategory || 'Stage Fare',
        categoryNameSi: '',
        monthlyPassFare: Math.round(stopObj.fare * 25)
      };
    }

    // 2. Match against category intermediateStops or fromStop
    if (shuttle.fareCategories && shuttle.fareCategories.length > 0) {
      const match = shuttle.fareCategories.find(c => 
        (c.fromStop && c.fromStop.toLowerCase().trim() === cleanName) ||
        (c.intermediateStops && c.intermediateStops.some(is => is.toLowerCase().trim() === cleanName))
      );
      if (match) {
        return {
          fare: match.fare,
          categoryName: match.categoryName,
          categoryNameSi: match.categoryNameSi || '',
          monthlyPassFare: match.monthlyPassFare || Math.round(match.fare * 25),
          category: match
        };
      }
      // Fallback to first category
      return {
        fare: shuttle.fareCategories[0].fare,
        categoryName: shuttle.fareCategories[0].categoryName,
        categoryNameSi: shuttle.fareCategories[0].categoryNameSi || '',
        monthlyPassFare: shuttle.fareCategories[0].monthlyPassFare || Math.round(shuttle.fareCategories[0].fare * 25),
        category: shuttle.fareCategories[0]
      };
    }

    return {
      fare: shuttle.fare || 180,
      categoryName: 'Standard Shuttle Fare',
      categoryNameSi: 'සාමාන්‍ය ගමන් ගාස්තුව',
      monthlyPassFare: shuttle.monthlyPassFare || 4500
    };
  };

  // Compile full set of boarding stops including intermediate stops
  const allBoardingStops = React.useMemo(() => {
    if (!activeShuttle) return [];
    const set = new Set();
    (activeShuttle.stops || []).forEach(s => {
      if (s.name && !s.name.includes('SLIIT')) set.add(s.name);
    });
    (activeShuttle.fareCategories || []).forEach(c => {
      if (c.fromStop && !c.fromStop.includes('SLIIT')) set.add(c.fromStop);
      (c.intermediateStops || []).forEach(is => {
        if (is && !is.includes('SLIIT')) set.add(is);
      });
    });
    return Array.from(set);
  }, [activeShuttle]);

  const currentBoarding = selectedBoardingStop || allBoardingStops[0] || activeShuttle.origin || 'Panadura';
  const currentFareInfo = getStopFareInfo(currentBoarding, activeShuttle);

  const loadShuttles = async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) setLoading(true);
    setError('');
    try {
      const res = await api.campus.getAll(forceWindowActive);
      if (res && res.success && res.shuttles && res.shuttles.length > 0) {
        // Ensure all shuttles have valid coordinates & latest stops from defaults if missing
        const enhanced = res.shuttles.map(s => {
          const def = DEFAULT_SLIIT_SHUTTLES.find(d => d.routeId === s.routeId);
          let item = { ...s };
          if (def && (!s.stops || s.stops.length === 0 || typeof s.stops[0]?.lat !== 'number')) {
            item = {
              ...def,
              ...item,
              stops: def.stops,
              currentLocation: item.currentLocation || def.currentLocation
            };
          }
          if (def && (!item.fareCategories || item.fareCategories.length === 0)) {
            item.fareCategories = def.fareCategories;
          }
          return item;
        });
        setShuttles(enhanced);
        if (res.timeInfo) {
          setServerTimeInfo(res.timeInfo);
        }
      }
    } catch (err) {
      console.warn('Backend live telemetry fetch warning:', err);
      // Fallback to DEFAULT_SLIIT_SHUTTLES
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  // Handle Simulation Step (advances the virtual bus forward)
  const handleAdvanceSimulation = async (shouldFocusMap = false) => {
    if (!activeShuttle) return;
    try {
      const res = await api.campus.simulateStep(activeShuttle._id || activeShuttle.routeId, 'next');
      if (res && res.success) {
        loadShuttles(false);
        if (shouldFocusMap) {
          setFocusBusKey(prev => prev + 1);
        }
      }
    } catch (e) {
      console.error('Error advancing simulation:', e);
      // Local step advance fallback
      if (activeShuttle.stops && activeShuttle.stops.length > 0) {
        setShuttles(prev => prev.map(sh => {
          if (sh.routeId === activeShuttle.routeId || sh._id === activeShuttle._id) {
            const curIdx = (sh.currentLocation?.simulationIndex || 0) + 1;
            const nextIdx = curIdx % sh.stops.length;
            const stop = sh.stops[nextIdx];
            const nextStop = sh.stops[(nextIdx + 1) % sh.stops.length];
            return {
              ...sh,
              currentLocation: {
                ...sh.currentLocation,
                simulationIndex: nextIdx,
                lat: stop.lat,
                lng: stop.lng,
                currentHalt: stop.name,
                nextHalt: nextStop ? nextStop.name : 'SLIIT Campus',
                speed: Math.floor(35 + Math.random() * 20),
                isLive: true
              }
            };
          }
          return sh;
        }));
        if (shouldFocusMap) {
          setFocusBusKey(prev => prev + 1);
        }
      }
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    loadShuttles(false);
    
    // Auto-poll live coordinates every 8 seconds
    const interval = setInterval(() => {
      loadShuttles(false);
    }, 8000);
    return () => clearInterval(interval);
  }, [forceWindowActive]);

  // Continuous Live GPS Simulation Stream (Advances bus along waypoints every 5s without interrupting user zoom)
  useEffect(() => {
    if (!isLiveStreaming) return;
    const streamTimer = setInterval(() => {
      handleAdvanceSimulation(false); // false = never hijack map zoom level!
    }, 5000);
    return () => clearInterval(streamTimer);
  }, [isLiveStreaming, activeShuttle?.routeId, activeShuttle?._id]);

  const handleStopClick = (stopName) => {
    if (inspectedStop === stopName) {
      setInspectedStop(null);
    } else {
      setInspectedStop(stopName);
    }
  };

  // Build embedded Google Maps Directions URL with authentic waypoints
  const buildShuttleMapUrl = (shuttle, stopToInspect) => {
    if (!shuttle) return '';

    if (stopToInspect) {
      const stopObj = (shuttle.stops || []).find(s => s.name === stopToInspect);
      if (stopObj && stopObj.lat && stopObj.lng) {
        return `https://maps.google.com/maps?q=${stopObj.lat},${stopObj.lng}&z=16&output=embed`;
      }
      return `https://maps.google.com/maps?q=${encodeURIComponent(stopToInspect + ' Bus Stand Sri Lanka')}&z=15&output=embed`;
    }

    const origin = (shuttle.stops && shuttle.stops[0]?.lat)
      ? `${shuttle.stops[0].lat},${shuttle.stops[0].lng}`
      : encodeURIComponent(shuttle.origin + ', Sri Lanka');

    const destination = (shuttle.stops && shuttle.stops[shuttle.stops.length - 1]?.lat)
      ? `${shuttle.stops[shuttle.stops.length - 1].lat},${shuttle.stops[shuttle.stops.length - 1].lng}`
      : encodeURIComponent(shuttle.destination + ', Sri Lanka');

    // Include ALL intermediate stops using exact Lat/Lng coordinates so Google Maps cannot skip the custom route!
    let waypointsParam = '';
    if (shuttle.stops && shuttle.stops.length > 2) {
      const middleStops = shuttle.stops.slice(1, -1);
      const chosen = middleStops.map(s => (s.lat && s.lng) ? `${s.lat},${s.lng}` : encodeURIComponent(s.name + ', Sri Lanka'));
      waypointsParam = chosen.map(w => `to:${w}`).join('+');
    }

    const daddr = waypointsParam ? `${waypointsParam}+to:${destination}` : destination;
    return `https://maps.google.com/maps?saddr=${origin}&daddr=${daddr}&output=embed`;
  };

  const isLive = Boolean(forceWindowActive || activeShuttle?.isWithinOperatingWindow);
  const loc = activeShuttle?.currentLocation || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 select-none">
      
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/');
            }
          }}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:text-blue-600 transition-all shadow-xs cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Go Back (ආපසු යන්න)</span>
        </button>

        <div className="flex items-center space-x-2 text-xs">
          <span className="hidden sm:inline text-slate-500 dark:text-slate-400 font-medium">SLIIT Campus Fleet Telemetry</span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-black font-mono">
            LIVE v2.5 • Custom Road Engine
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* HERO SECTION: SLIIT Official Brand Aesthetics & Shuttle Radar   */}
      {/* ============================================================== */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 border border-blue-900/40 p-7 sm:p-10 shadow-2xl text-white text-center">
        
        {/* Glow Orb Overlays */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center space-y-4">
          
          {/* Top Pill Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-black uppercase tracking-wider shadow-inner">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>SLIIT Malabe Campus Transit Hub</span>
            </span>

            <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-800/40 px-3 py-1 rounded-full shadow-inner">
              <span>🎓</span>
              <span>Exclusive Student Fleet</span>
            </span>

            <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 rounded-full shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live GPS Telemetry Active</span>
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            SLIIT Shuttle <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">Live GPS Radar</span>
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm text-blue-200/90 font-medium leading-relaxed max-w-2xl mx-auto">
            SLIIT මාලඹේ වෙත ධාවනය වන නිල බස් සේවාවේ සැබෑ මාර්ගය (Custom Road Path), සජීවී GPS පිහිටීම, ගමන් ගාස්තු, රියදුරු දුරකථන අංක සහ සියලු නැවතුම් තොරතුරු.
          </p>

        </div>

      </div>

      {/* ============================================================== */}
      {/* DEDICATED SHUTTLE CORRIDOR SELECTOR & MULTI-BROWSER LAUNCHER   */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Select Shuttle Corridor</span>
                <span className="text-xs font-bold text-slate-400 font-normal">| ධාවන මාර්ගය තෝරන්න</span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ශිෂ්‍ය බස් රථයේ සජීවී GPS පිහිටීම, ගාස්තු සහ නැවතුම් බලාගැනීමට පහතින් අදාළ මාර්ගය තෝරන්න.
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-xl self-start sm:self-auto">
            {shuttles.length} Active Corridors
          </span>
        </div>

        {/* Corridor Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {shuttles.map((shuttle) => {
            const isSelected = (shuttle.routeId === selectedShuttleId || shuttle._id === selectedShuttleId);
            const minFare = shuttle.fareCategories?.length > 0 ? Math.min(...shuttle.fareCategories.map(c => c.fare)) : shuttle.fare;
            const maxFare = shuttle.fareCategories?.length > 0 ? Math.max(...shuttle.fareCategories.map(c => c.fare)) : shuttle.fare;

            return (
              <div
                key={shuttle._id || shuttle.routeId}
                onClick={() => handleSelectShuttle(shuttle.routeId || shuttle._id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative group ${
                  isSelected
                    ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30 shadow-md scale-[1.01]'
                    : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:bg-white dark:hover:bg-slate-900'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {shuttle.routeId?.replace('sliit-', '').toUpperCase()}
                    </span>
                    {shuttle.status === 'Maintenance' && (
                      <span className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1 shadow-xs">
                        <span>🔧</span>
                        <span>Maintenance</span>
                      </span>
                    )}
                    {shuttle.status === 'Inactive' && (
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-700 text-white text-[9px] font-black uppercase tracking-wider">
                        <span>🔴 Suspended</span>
                      </span>
                    )}
                  </div>

                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    )}
                  </div>

                  <h3 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {shuttle.routeName}
                  </h3>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                    <span>🚍 {shuttle.busNumber}</span>
                    <span>• Dep: <strong className="text-emerald-600 dark:text-emerald-400">{shuttle.departureTimeMorning}</strong></span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="font-extrabold text-slate-700 dark:text-slate-300">
                    {shuttle.fareCategories && shuttle.fareCategories.length > 1
                      ? `Rs. ${minFare} - Rs. ${maxFare}`
                      : `Rs. ${shuttle.fare}`}
                  </span>
                  <span className={`text-[10px] font-black flex items-center gap-1 ${
                    isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                  }`}>
                    {isSelected ? '● Selected Active' : 'Select Corridor ➔'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ============================================================== */}
      {/* SLIIT STUDENT AUTHENTICATION BANNER (ක්‍රමය 01)                   */}
      {/* ============================================================== */}
      <div className={`rounded-3xl p-5 border transition-all ${
        isSliitStudent 
          ? 'bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-teal-500/10 border-emerald-500/30 dark:bg-emerald-950/20 dark:border-emerald-800/50' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-950/40 border-blue-200 dark:border-blue-900/60 shadow-md'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              isSliitStudent 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
            }`}>
              {isSliitStudent ? <CheckCircle2 className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {isSliitStudent ? 'SLIIT Student Verified ✅' : 'SLIIT Student Email Login'}
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  isSliitStudent 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' 
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                }`}>
                  {isSliitStudent ? 'Authorized Student Access' : 'Exclusive Access System'}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isSliitStudent ? (
                  <span>
                    සාදරයෙන් පිළිගනිමු, <strong>{user.fullName || 'SLIIT Student'}</strong> ({user.email}). ඔබගේ SLIIT Student ID: <strong className="font-mono text-blue-600 dark:text-blue-400">{user.studentId || 'IT21004567'}</strong>. ඔබ සඳහා සජීවී GPS සහ Shuttle සේවාවන් විවෘතව ඇත.
                  </span>
                ) : (
                  <span>
                    SLIIT Shuttle බස් සේවාව සිසුන්ට පමණක් සීමා කිරීමට <strong>@my.sliit.lk</strong> හෝ <strong>@sliit.lk</strong> විද්‍යුත් තැපෑලෙන් ලොග් වන්න.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isSliitStudent ? (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Student ID Verified</span>
                </span>
              </div>
            ) : (
              <>
                <Link
                  to="/login?type=sliit"
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>🎓 SLIIT Login</span>
                </Link>

                <Link
                  to="/register?type=sliit"
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition-all border border-slate-300 dark:border-slate-700 flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>📝 Student Register</span>
                </Link>

                <button
                  type="button"
                  onClick={handleQuickStudentLogin}
                  disabled={fastLoginLoading}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                  title="Test immediately with it21004567@my.sliit.lk"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{fastLoginLoading ? 'Verifying...' : '⚡ 1-Click Student Test'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {activeShuttle && (() => {
        const isMaintenance = activeShuttle.status === 'Maintenance';
        const isInactive = activeShuttle.status === 'Inactive';
        const isMaintenanceOrInactive = isMaintenance || isInactive;
        const noticeLower = (activeShuttle.delayNotice || '').toLowerCase();
        const hasUrgentNotice = Boolean(
          activeShuttle.delayNotice &&
          !noticeLower.includes('normal traffic') &&
          !noticeLower.includes('operating smoothly')
        );
        const isEveningNotice = noticeLower.includes('හවස') || noticeLower.includes('evening') || noticeLower.includes('සවස');
        const isTomorrowNotice = noticeLower.includes('හෙට') || noticeLower.includes('tomorrow');
        const isCancellation = noticeLower.includes('නැත') || noticeLower.includes('නොවේ') || noticeLower.includes('cancel') || noticeLower.includes('නවතා');

        const showAlertBanner = isMaintenanceOrInactive || hasUrgentNotice;

        return (
          <div className="space-y-6">

            {/* ============================================================== */}
            {/* PROMINENT ANIMATED RED OPERATIONAL ALERT BANNER (HIGH PRIORITY)  */}
            {/* ============================================================== */}
            {showAlertBanner && (
              <div className={`rounded-3xl border-2 p-5 sm:p-6 shadow-2xl transition-all relative overflow-hidden ${
                isMaintenanceOrInactive || isCancellation
                  ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 border-red-300 dark:border-red-500 shadow-red-600/30 ring-4 ring-red-500/25'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 border-amber-300 shadow-amber-500/30'
              }`}>
                
                {/* Background animated caution stripes */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
                  
                  <div className="flex items-start space-x-4">
                    {/* Pulsing Animated Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shrink-0 shadow-lg relative">
                      <span className="w-4 h-4 rounded-full bg-white animate-ping absolute -top-1 -right-1" />
                      {isMaintenanceOrInactive ? (
                        <Wrench className="w-7 h-7 text-white animate-pulse" />
                      ) : (
                        <AlertTriangle className="w-7 h-7 text-white animate-bounce" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-white text-red-700 text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                          <span>{isMaintenanceOrInactive ? 'Vehicle Under Maintenance' : 'Urgent Operational Notice'}</span>
                        </span>

                        {isEveningNotice && (
                          <span className="px-2.5 py-0.5 rounded-full bg-black/40 text-amber-200 text-[10px] font-extrabold border border-amber-300/40">
                            🌙 අද සවස සේවාව (Evening Shuttle)
                          </span>
                        )}

                        {isTomorrowNotice && (
                          <span className="px-2.5 py-0.5 rounded-full bg-black/40 text-sky-200 text-[10px] font-extrabold border border-sky-300/40">
                            📅 හෙට දිනට අදාළයි (Tomorrow Notice)
                          </span>
                        )}

                        {isCancellation && (
                          <span className="px-2.5 py-0.5 rounded-full bg-black/40 text-white text-[10px] font-extrabold border border-white/30">
                            🚫 ධාවනය නොවේ (No Service)
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
                        {activeShuttle.delayNotice || (isMaintenance ? 'බස් රථය නඩත්තු කටයුතු (Maintenance) සඳහා නවතා ඇත.' : 'බස් සේවාවේ විශේෂ දැනුම්දීමක් පවතී.')}
                      </h3>

                      <p className="text-xs text-white/90 font-medium">
                        {isMaintenanceOrInactive
                          ? 'මෙම බස් රථය නඩත්තු කටයුතු සඳහා යොමු කර ඇති බැවින් සජීවී සිතියම තාවකාලිකව අක්‍රිය කර ඇත. වැඩිදුර තොරතුරු සඳහා රියදුරු අමතන්න.'
                          : 'සිසුන්ගේ අවධානය පිණිසයි: ඉහත දැක්වෙන විශේෂ නිවේදනය අනුව ඔබගේ ගමන් සැලසුම් සකස් කරගන්න.'}
                      </p>
                    </div>
                  </div>

                  {/* Immediate Action Buttons */}
                  <div className="flex items-center space-x-2 shrink-0 self-stretch sm:self-auto justify-end">
                    <a
                      href={`tel:${activeShuttle.driverPhone}`}
                      className="px-4 py-2.5 rounded-2xl bg-white text-red-700 hover:bg-red-50 font-black text-xs transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-red-600" />
                      <span>Call Driver ({activeShuttle.driverPhone})</span>
                    </a>
                  </div>

                </div>
              </div>
            )}
          
                    {/* ============================================================== */}
          {/* KEY DETAILS GRID: Fare, Driver Contact, Times, Occupancy       */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Ticket Fare (ගමන් ගාස්තු) - All Stages Displayed Separately */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Ticket Fare (ගමන් ගාස්තු)</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1.5 my-1">
                {activeShuttle.fareCategories && activeShuttle.fareCategories.length > 0 ? (
                  activeShuttle.fareCategories.map((cat, cIdx) => (
                    <div
                      key={cat.id || cIdx}
                      className="flex items-center justify-between py-1 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/60 dark:border-slate-800 text-xs"
                    >
                      <div className="flex items-center space-x-1.5 truncate pr-2">
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/90 text-amber-800 dark:text-amber-300">
                          Stage #{cIdx + 1}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {cat.categoryName || `${cat.fromStop} to SLIIT`}
                        </span>
                      </div>
                      <span className="font-black text-slate-900 dark:text-white shrink-0 text-sm">
                        Rs. {cat.fare}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">Rs. {activeShuttle.fare}</span>
                    <span className="text-xs text-slate-500 font-semibold">/ single ride</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2 flex flex-col space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">
                  Direct daily cash payment to bus conductor. (දිනපතා බස් රථයේදී ගෙවිය යුතුය)
                </span>
                <a
                  href="#fare-stages"
                  className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center space-x-1"
                >
                  <span>View All Intermediate Stops & Calculator ➔</span>
                </a>
              </div>
            </div>

            {/* Card 2: Driver Contact (රියදුරු දුරකථන අංකය) */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Driver Contact (රියදුරු)</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                  {activeShuttle.driverName || 'Campus Driver'}
                </h4>
                <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                  {activeShuttle.driverPhone || '+94 77 123 4567'}
                </p>
              </div>

              {/* Action Buttons: Instant Call & WhatsApp */}
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <a
                  href={`tel:${activeShuttle.driverPhone}`}
                  className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] flex items-center justify-center space-x-1 transition-all cursor-pointer"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Driver</span>
                </a>
                <a
                  href={`https://wa.me/${activeShuttle.driverWhatsapp || '94771234567'}?text=Hello%20Driver,%20I%20am%20waiting%20for%20the%20SLIIT%20Shuttle`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer"
                  title="WhatsApp Driver"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Card 3: Shuttle Timetable (ගමන් වේලාවන්) */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Schedule (වේලාවන්)</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">Morning Departure:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">{activeShuttle.departureTimeMorning}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">SLIIT Arrival ETA:</span>
                  <span className="font-black text-slate-900 dark:text-white">{activeShuttle.arrivalTimeMorning}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">Evening Return:</span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400">{activeShuttle.departureTimeEvening}</span>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 font-medium border-t border-slate-100 dark:border-slate-800/80 pt-2 block">
                Monday to Friday academic weekdays.
              </span>
            </div>

            {/* Card 4: Occupancy & Seat Availability */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Bus Occupancy (ආසන)</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Bus className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black border ${
                  activeShuttle.occupancyStatus === 'Seats Available'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                    : activeShuttle.occupancyStatus === 'Bus Full'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                }`}>
                  {activeShuttle.occupancyStatus}
                </span>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  Capacity: {activeShuttle.seatCapacity} Luxury Reclining Seats
                </p>
              </div>

              <span className="text-[10px] text-slate-400 font-medium border-t border-slate-100 dark:border-slate-800/80 pt-2 block">
                AC Luxury Coach with phone charging ports.
              </span>
            </div>

          </div>

{/* Operational notice moved to high-visibility top red banner */}

          {/* ============================================================== */}
          {/* LIVE GPS RADAR MAP CANVAS OR MAINTENANCE LOCKOUT DISPLAY       */}
          {/* ============================================================== */}
          {isMaintenanceOrInactive ? (
            /* Maintenance Lockout Notice replacing the interactive map */
            <div className="relative rounded-3xl overflow-hidden border-2 border-rose-500/80 dark:border-rose-600 shadow-2xl h-[440px] sm:h-[500px] w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
              
              {/* Radial gradient background */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-950/40 via-slate-950 to-slate-950 pointer-events-none" />
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#f43f5e_1px,transparent_1px),linear-gradient(to_bottom,#f43f5e_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

              <div className="relative z-10 max-w-lg space-y-4">
                
                {/* Big Animated Icon */}
                <div className="relative mx-auto w-20 h-20 rounded-3xl bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-2xl shadow-rose-600/40">
                  <span className="absolute -inset-1 rounded-3xl bg-rose-500/30 animate-ping opacity-75" />
                  <Wrench className="w-10 h-10 text-rose-500 animate-pulse relative z-10" />
                </div>

                <div className="space-y-1.5">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-black uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>{isMaintenance ? '🔧 Vehicle Under Scheduled Maintenance' : '🚫 Shuttle Service Suspended'}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    සජීවී සිතියම තාවකාලිකව අක්‍රියයි (Live GPS Radar Offline)
                  </h3>

                  <p className="text-xs sm:text-sm text-rose-200 font-semibold leading-relaxed">
                    {activeShuttle.delayNotice || 'මෙම බස් රථය නඩත්තු කටයුතු සඳහා යොමු කර ඇති බැවින් සිතියම සහ සජීවී GPS පිහිටීම නොපෙන්වයි.'}
                  </p>
                </div>

                {/* Helpful Contact Box */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2 backdrop-blur-md text-left">
                  <div className="flex items-center justify-between text-[11px] font-bold border-b border-slate-800 pb-2">
                    <span>Corridor: <strong className="text-white">{activeShuttle.routeName}</strong></span>
                    <span className="font-mono text-rose-400 font-bold">{activeShuttle.busNumber}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    නැවත ධාවනය ආරම්භ කරන වේලාව හෝ විකල්ප ප්‍රවාහන පහසුකම් පිළිබඳ තොරතුරු සඳහා රියදුරු අමතන්න.
                  </p>
                  <div className="flex items-center justify-center space-x-2 pt-1">
                    <a
                      href={`tel:${activeShuttle.driverPhone}`}
                      className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Driver ({activeShuttle.driverPhone})</span>
                    </a>
                    <a
                      href={`https://wa.me/${activeShuttle.driverWhatsapp || '94771234567'}?text=Hello%20Driver,%20is%20the%20SLIIT%20Shuttle%20operating%20today?`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer"
                      title="WhatsApp Driver"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* Normal Interactive GPS Radar Map Canvas */
            <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-2xl h-[440px] sm:h-[520px] w-full bg-slate-950">
            
            {/* Map Engine Render */}
            {mapEngine === 'google' ? (
              <iframe
                key={`${activeShuttle.routeId}-${inspectedStop || 'full'}-google-${loc.simulationIndex || 0}`}
                title={`SLIIT Shuttle GPS Radar - ${activeShuttle.routeName}`}
                src={buildShuttleMapUrl(activeShuttle, inspectedStop)}
                className="w-full h-full border-0 filter brightness-[0.96] contrast-[1.02]"
                loading="lazy"
                allowFullScreen=""
              />
            ) : (
              <SliitCustomRouteMap
                key={`${activeShuttle.routeId}-${mapEngine}`}
                shuttle={activeShuttle}
                inspectedStop={inspectedStop}
                mapLayerType={mapEngine}
                isLive={isLive}
                onStopClick={handleStopClick}
                focusBusKey={focusBusKey}
              />
            )}

            {/* Top Floating Controls on Map */}
            <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between pointer-events-none gap-2 z-10">
              
              {/* Active Halt Indicator */}
              <div className="pointer-events-auto bg-slate-900/90 border border-slate-700/80 px-3.5 py-1.5 rounded-xl text-xs text-white backdrop-blur-md shadow-xl flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'} shrink-0`} />
                <span className="font-bold">
                  {inspectedStop ? (
                    <>
                      📍 Inspected: <strong className="text-cyan-300">{inspectedStop}</strong>
                      <span className="ml-1.5 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px]">
                        Rs. {getStopFareInfo(inspectedStop, activeShuttle).fare}
                      </span>
                    </>
                  ) : isLive ? (
                    <>🚍 Next Halt: <strong className="text-cyan-300">{loc.nextHalt || 'SLIIT Campus'}</strong> ({loc.nextHaltEta || '--'})</>
                  ) : (
                    <>📅 Route: <strong className="text-blue-300">{activeShuttle.origin} ➔ SLIIT</strong></>
                  )}
                </span>
              </div>

              {/* Right Map Action Buttons */}
              <div className="flex items-center space-x-2 pointer-events-auto flex-wrap gap-y-1">
                
                {/* 3-Engine View Switcher: Custom Road vs Google Maps vs Satellite */}
                <div className="inline-flex p-0.5 bg-slate-900/95 border border-slate-700 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setMapEngine('custom')}
                    className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all cursor-pointer ${
                      mapEngine === 'custom'
                        ? 'bg-blue-600 text-white font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Authentic Google Maps Road View with Real Road-Snapped Bus Route"
                  >
                    <span>🛣️</span>
                    <span className="text-[11px]">Google Roads (නියම පාර)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMapEngine('satellite')}
                    className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all cursor-pointer ${
                      mapEngine === 'satellite'
                        ? 'bg-blue-600 text-white font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Real Google Satellite Aerial View (චන්ද්‍රිකා සිතියම)"
                  >
                    <span>🛰️</span>
                    <span className="text-[11px]">Google Satellite</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMapEngine('google')}
                    className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all cursor-pointer ${
                      mapEngine === 'google'
                        ? 'bg-blue-600 text-white font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Google Maps Driving Directions Navigation"
                  >
                    <span>🗺️</span>
                    <span className="text-[11px]">Google Directions</span>
                  </button>
                </div>

                {/* Reset to Full Route */}
                {inspectedStop && (
                  <button
                    type="button"
                    onClick={() => setInspectedStop(null)}
                    className="px-2.5 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Full Route</span>
                  </button>
                )}

                {/* Continuous Live Stream Toggle */}
                <button
                  type="button"
                  onClick={() => setIsLiveStreaming(prev => !prev)}
                  className={`px-2.5 py-1 rounded-xl font-black text-[11px] shadow-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    isLiveStreaming
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600'
                  }`}
                  title={isLiveStreaming ? 'Click to Pause live telemetry streaming' : 'Click to Resume live GPS streaming'}
                >
                  <span className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-emerald-300 animate-ping' : 'bg-slate-400'}`} />
                  <span>{isLiveStreaming ? '🔴 LIVE GPS Active' : '⏸️ Stream Paused'}</span>
                </button>

                {/* Find Bus Quick Button */}
                <button
                  type="button"
                  onClick={() => {
                    setInspectedStop(null);
                    setFocusBusKey(prev => prev + 1);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] shadow-lg flex items-center gap-1 transition-all cursor-pointer"
                  title="Focus map directly on the live bus position"
                >
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  <span>🎯 Bus එක කොහෙද</span>
                </button>

                {/* Manual Step Button */}
                <button
                  type="button"
                  onClick={() => handleAdvanceSimulation(false)}
                  className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] shadow-lg flex items-center gap-1 transition-all cursor-pointer"
                  title="Simulate advancing bus forward along its route"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Step</span>
                </button>
              </div>
            </div>

            {/* Bottom HUD Bar on Map */}
            <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3 sm:p-4 text-xs backdrop-blur-md shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between text-white gap-3 z-10">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                  <Bus className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-sm text-white">{activeShuttle.routeName}</span>
                    <span className="font-mono text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-extrabold">
                      {activeShuttle.busNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {isLive ? (
                      <>Current Halt: <strong className="text-emerald-400">{loc.currentHalt || activeShuttle.origin}</strong> ➔ Heading towards <strong className="text-cyan-300">{loc.nextHalt || 'SLIIT Campus'}</strong></>
                    ) : (
                      <>Parked at SLIIT Campus • Next morning service departs at <strong className="text-emerald-400">{activeShuttle.departureTimeMorning}</strong></>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Speed:</span>
                  <span className="font-mono font-black text-emerald-400">{isLive ? `${loc.speed || 38} km/h` : '0 km/h (Parked)'}</span>
                </div>
                <div className="text-right pl-3 border-l border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">SLIIT Arrival ETA:</span>
                  <span className="font-extrabold text-blue-300">{activeShuttle.arrivalTimeMorning}</span>
                </div>
              </div>
            </div>

          </div>
          )}

          {/* ============================================================== */}
          {/* STUDENT STAGE-BASED FARE CATEGORIES & BOARDING CALCULATOR      */}
          {/* ============================================================== */}
          <div id="fare-stages" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider mb-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Student Stage Fares • ගමන් ගාස්තු කාණ්ඩ</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Shuttle Fare Categories & Boarding Halts (ගාස්තු කාණ්ඩ සහ නැවතුම්)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  ශිෂ්‍ය බස් රථයේ ගාස්තුව ඔබ ගොඩවන නැවතුම (Stage) අනුව වෙනස් වේ. ඔබගේ නැවතුම තෝරා අදාළ ගාස්තුව සහ අතරමැදි නැවතුම් පහතින් පරීක්ෂා කරන්න.
                </p>
              </div>

              {/* Quick Boarding Selector */}
              <div className="flex items-center space-x-2 self-start md:self-auto bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0">
                <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 pl-2">
                  📍 Boarding From:
                </span>
                <select
                  value={currentBoarding}
                  onChange={(e) => {
                    setSelectedBoardingStop(e.target.value);
                    handleStopClick(e.target.value);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-black text-slate-900 dark:text-white cursor-pointer shadow-2xs focus:ring-2 focus:ring-blue-500"
                >
                  {(allBoardingStops || []).map((stopName, idx) => {
                    const stopFare = getStopFareInfo(stopName, activeShuttle);
                    return (
                      <option key={idx} value={stopName}>
                        {stopName} (Rs. {stopFare.fare})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Personalized Fare Banner / HUD */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-blue-500/10 border-2 border-amber-400/50 dark:border-amber-600/50 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md shadow-amber-500/30">
                  <span className="text-lg">Rs</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs uppercase font-black tracking-wider text-amber-700 dark:text-amber-300">
                      Your Calculated Fare (ඔබ සඳහා ගාස්තුව)
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-[10px] font-mono font-black text-slate-800 dark:text-slate-200">
                      Boarding at: <strong>{currentBoarding}</strong>
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                      Rs. {currentFareInfo.fare}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">
                      one-way to SLIIT Malabe Campus
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                    Category: <strong className="text-amber-600 dark:text-amber-400">{currentFareInfo.categoryName}</strong>
                    {currentFareInfo.categoryNameSi && <span> ({currentFareInfo.categoryNameSi})</span>}
                    {' '}• ගෙවීම: <strong className="text-amber-600 dark:text-amber-400 font-bold">දිනපතා බස් රථයේදී කොන්දොස්තරට (Daily Cash Payment)</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-start md:self-auto shrink-0">
                <span className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Student ID Validated</span>
                </span>
              </div>
            </div>

            {/* Categories Comparison Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>All Configured Fare Stages for {activeShuttle.routeName}</span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">Click any halt to select</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {(activeShuttle.fareCategories || []).map((cat, idx) => {
                  const isCatActive = currentFareInfo.categoryName === cat.categoryName;
                  return (
                    <div
                      key={cat.id || idx}
                      onClick={() => {
                        setSelectedBoardingStop(cat.fromStop || cat.intermediateStops?.[0] || '');
                      }}
                      className={`p-4 rounded-2xl transition-all border flex flex-col justify-between space-y-3 cursor-pointer group ${
                        isCatActive
                          ? 'bg-gradient-to-br from-amber-50/90 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/30 border-amber-500 ring-2 ring-amber-500/30 shadow-md scale-[1.01]'
                          : 'bg-slate-50/80 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            isCatActive 
                              ? 'bg-amber-500 text-slate-950 font-black' 
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            Stage #{idx + 1}
                          </span>
                          <span className="text-base font-black text-slate-900 dark:text-white">
                            Rs. {cat.fare}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {cat.categoryName}
                          </h4>
                          {cat.categoryNameSi && (
                            <p className="text-[11px] text-slate-500 font-medium">
                              {cat.categoryNameSi}
                            </p>
                          )}
                          <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                            Daily Fare: Rs. {cat.fare}
                          </p>
                        </div>

                        {cat.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                            {cat.description}
                          </p>
                        )}
                      </div>

                      {/* Intermediate Halts in this Category */}
                      <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Intermediate Boarding Stops (අතරමැදි නැවතුම්):
                        </span>
                        {cat.intermediateStops && cat.intermediateStops.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {cat.intermediateStops.map((halt, hIdx) => {
                              const isHaltSelected = currentBoarding?.toLowerCase() === halt?.toLowerCase();
                              return (
                                <button
                                  key={hIdx}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBoardingStop(halt);
                                    handleStopClick(halt);
                                  }}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                    isHaltSelected
                                      ? 'bg-blue-600 text-white shadow-xs font-black'
                                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                                  }`}
                                  title={`Click to select ${halt} and view on map`}
                                >
                                  {halt}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">From {cat.fromStop} directly to SLIIT</span>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ============================================================== */}
          {/* INTERACTIVE WAYPOINT HALTS STEPPER                             */}
          {/* ============================================================== */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>Route Halts & Stopping Waypoints ({activeShuttle.stops?.length || 0} Towns)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  නැවතුමක් මත ක්ලික් කර එම ස්ථානය Map එකේ සමීපව (Zoom In) පරීක්ෂා කරන්න.
                </p>
              </div>

              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 px-3 py-1 rounded-xl self-start sm:self-auto">
                Click any stop to inspect on Map
              </span>
            </div>

            {/* Stepper Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {(activeShuttle.stops || []).map((stop, sIdx) => {
                const isFirst = sIdx === 0;
                const isLast = sIdx === (activeShuttle.stops.length - 1);
                const isInspected = inspectedStop === stop.name;
                const stopFareInfo = getStopFareInfo(stop.name, activeShuttle);

                return (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => {
                      handleStopClick(stop.name);
                      setSelectedBoardingStop(stop.name);
                    }}
                    className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between group cursor-pointer ${
                      isInspected
                        ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-500 ring-2 ring-blue-500/40 shadow-md'
                        : isFirst
                        ? 'bg-slate-50 dark:bg-slate-950 border-emerald-300 dark:border-emerald-800 hover:border-emerald-500'
                        : isLast
                        ? 'bg-slate-50 dark:bg-slate-950 border-blue-300 dark:border-blue-800 hover:border-blue-500'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded ${
                          isFirst ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                          isLast ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                          'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          #{sIdx + 1}
                        </span>
                        {!isLast && stopFareInfo?.fare ? (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/60">
                            Rs. {stopFareInfo.fare}
                          </span>
                        ) : stop.timeOffset ? (
                          <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                            {stop.timeOffset}
                          </span>
                        ) : null}
                      </div>

                      <p className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight group-hover:text-blue-500">
                        {stop.name}
                      </p>
                      {stop.nameSi && (
                        <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">
                          {stop.nameSi}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-semibold">{stop.km ? `${stop.km} km` : ''}</span>
                      <span className={`font-bold ${isInspected ? 'text-blue-600 dark:text-blue-400 underline' : 'text-slate-400 group-hover:text-blue-500'}`}>
                        {isInspected ? 'Active' : 'Inspect'} ➔
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

          </div>
        );
      })()}

    </div>
  );
}
