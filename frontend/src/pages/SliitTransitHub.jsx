import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Bus, MapPin, Compass, Navigation, Phone, MessageSquare, 
  Clock, Shield, AlertTriangle, CheckCircle2, RefreshCw, 
  Layers, ExternalLink, Sparkles, ChevronRight, Play, Eye, EyeOff,
  CreditCard, ArrowLeft, Radio, GraduationCap, LogIn, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DEFAULT_SLIIT_SHUTTLES } from '../data/sliitTransitData';
import SliitCustomRouteMap from '../components/SliitCustomRouteMap';

export default function SliitTransitHub() {
  const navigate = useNavigate();
  const [shuttles, setShuttles] = useState(DEFAULT_SLIIT_SHUTTLES);
  const [selectedShuttleId, setSelectedShuttleId] = useState('sliit-panadura');
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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    loadShuttles(false);
    
    // Auto-poll live coordinates every 8 seconds
    const interval = setInterval(() => {
      loadShuttles(false);
    }, 8000);
    return () => clearInterval(interval);
  }, [forceWindowActive]);

  const loadShuttles = async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) setLoading(true);
    setError('');
    try {
      const res = await api.campus.getAll(forceWindowActive);
      if (res && res.success && res.shuttles && res.shuttles.length > 0) {
        setShuttles(res.shuttles);
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

  const activeShuttle = shuttles.find(s => (s.routeId === selectedShuttleId || s._id === selectedShuttleId)) || shuttles[0] || DEFAULT_SLIIT_SHUTTLES[0];

  // Handle Simulation Step (advances the virtual bus forward)
  const handleAdvanceSimulation = async () => {
    if (!activeShuttle) return;
    try {
      const res = await api.campus.simulateStep(activeShuttle._id || activeShuttle.routeId, 'next');
      if (res && res.success) {
        loadShuttles(false);
        setFocusBusKey(prev => prev + 1);
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
      }
    }
  };

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
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 border border-blue-900/40 p-6 sm:p-8 shadow-2xl text-white">
        
        {/* Glow Orb Overlays */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-3 max-w-2xl">
            {/* Top Pill Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                <span>SLIIT Malabe Campus Transit Hub</span>
              </span>
              <span className="text-[11px] font-bold text-amber-300 bg-amber-950/60 border border-amber-800/40 px-2.5 py-0.5 rounded-full">
                🎓 Exclusive Student Fleet
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              SLIIT Shuttle <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">Live GPS Radar</span>
            </h1>

            <p className="text-xs sm:text-sm text-blue-200/90 font-medium leading-relaxed">
              SLIIT මාලඹේ වෙත ධාවනය වන නිල බස් සේවාවේ සැබෑ මාර්ගය (Custom Road Path), සජීවී GPS පිහිටීම, ගමන් ගාස්තු, රියදුරු දුරකථන අංක සහ සියලු නැවතුම් තොරතුරු.
            </p>
          </div>

          {/* Time Window & Telemetry Mode Pill */}
          <div className="bg-slate-900/90 border border-blue-900/60 rounded-2xl p-4 backdrop-blur-md shadow-xl space-y-2.5 shrink-0 sm:min-w-[280px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Operating Window:</span>
              <span className="text-[10px] font-mono font-black text-blue-400">
                06:00 AM - 08:00 AM
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-xs font-black">
                {isLive ? '🟢 Live GPS Telemetry Active' : '🟡 Scheduled Service Window'}
              </span>
            </div>

            {/* Simulator Toggle for Testing */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400" />
                <span>🧪 Test Window Switch</span>
              </span>
              <button
                type="button"
                onClick={() => setForceWindowActive(!forceWindowActive)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  forceWindowActive 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Toggle between Live (06:00-08:00 AM) and Scheduled View"
              >
                {forceWindowActive ? 'Live Mode Active' : 'Enable Live Test'}
              </button>
            </div>
          </div>

        </div>

        {/* Route Selector Tabs (All 4 User Routes) */}
        <div className="mt-6 pt-5 border-t border-blue-900/50 space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-blue-300 block">
            Select Shuttle Corridor (ධාවන මාර්ගය තෝරන්න):
          </span>

          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
            {shuttles.map((shuttle) => {
              const isSelected = (shuttle.routeId === selectedShuttleId || shuttle._id === selectedShuttleId);
              return (
                <button
                  key={shuttle._id || shuttle.routeId}
                  type="button"
                  onClick={() => {
                    setSelectedShuttleId(shuttle.routeId || shuttle._id);
                    setInspectedStop(null);
                  }}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black shrink-0 transition-all flex items-center space-x-2 border cursor-pointer ${
                    isSelected
                      ? 'bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/25 scale-[1.02]'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
                  }`}
                >
                  <Bus className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-400'}`} />
                  <span>{shuttle.routeName}</span>
                </button>
              );
            })}
          </div>
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

      {activeShuttle && (
        <div className="space-y-6">
          
          {/* ============================================================== */}
          {/* LIVE GPS RADAR MAP CANVAS WITH CUSTOM ROAD POLYLINE            */}
          {/* ============================================================== */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-2xl h-[440px] sm:h-[520px] w-full bg-slate-950 flex flex-col">
            
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
                key={`${activeShuttle.routeId}-${mapEngine}-${inspectedStop || 'full'}-${loc.simulationIndex || 0}`}
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
                    <>📍 Inspected Bus Stand: <strong className="text-cyan-300">{inspectedStop}</strong></>
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
                    title="Exact Custom Shuttle Road Path (නියම බස් පාර)"
                  >
                    <span>🛣️</span>
                    <span className="text-[11px]">Exact Path (නියම පාර)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMapEngine('satellite')}
                    className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all cursor-pointer ${
                      mapEngine === 'satellite'
                        ? 'bg-blue-600 text-white font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Real Satellite Aerial View (චන්ද්‍රිකා සිතියම)"
                  >
                    <span>🛰️</span>
                    <span className="text-[11px]">Satellite</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMapEngine('google')}
                    className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all cursor-pointer ${
                      mapEngine === 'google'
                        ? 'bg-blue-600 text-white font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Google Directions with enforced waypoints"
                  >
                    <span>🗺️</span>
                    <span className="text-[11px]">Google</span>
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

                {/* Live Simulation Trigger (To step the bus along its custom route) */}
                <button
                  type="button"
                  onClick={handleAdvanceSimulation}
                  className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] shadow-lg flex items-center gap-1 transition-all cursor-pointer"
                  title="Simulate advancing bus forward along its route"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Step Bus</span>
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

          {/* ============================================================== */}
          {/* KEY DETAILS GRID: Fare, Driver Contact, Times, Occupancy       */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Ticket Fare (ගමන් ගාස්තු) */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Ticket Fare (ගමන් ගාස්තු)</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">Rs. {activeShuttle.fare}</span>
                  <span className="text-xs text-slate-500 font-semibold">/ single ride</span>
                </div>
                <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                  Monthly Pass: Rs. {activeShuttle.monthlyPassFare}
                </p>
              </div>

              <span className="text-[10px] text-slate-400 font-medium border-t border-slate-100 dark:border-slate-800/80 pt-2 block">
                Direct payment to conductor or monthly student season pass.
              </span>
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

          {/* Active Traffic / Delay Announcement */}
          {activeShuttle.delayNotice && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 rounded-2xl flex items-start space-x-3 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <h5 className="font-black text-xs uppercase tracking-wider">Live Route Announcement</h5>
                <p className="text-xs font-semibold mt-0.5">
                  {activeShuttle.delayNotice}
                </p>
              </div>
            </div>
          )}

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

                return (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => handleStopClick(stop.name)}
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
                        {stop.timeOffset && (
                          <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                            {stop.timeOffset}
                          </span>
                        )}
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
      )}

    </div>
  );
}
