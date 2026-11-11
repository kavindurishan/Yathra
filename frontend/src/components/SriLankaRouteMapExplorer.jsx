import React, { useState } from 'react';
import { 
  Navigation, MapPin, Compass, Clock, CheckCircle2, 
  ArrowRight, Sparkles, ExternalLink, RefreshCw, Bus 
} from 'lucide-react';
import { 
  SRI_LANKA_BUS_ROUTES, 
  buildGoogleMapsRouteUrl, 
  buildExternalGoogleMapsUrl 
} from '../services/routesData';

export default function SriLankaRouteMapExplorer({ 
  initialRouteId = 'colombo-kandy',
  onSelectRouteForBooking = null 
}) {
  const [selectedRouteKey, setSelectedRouteKey] = useState(initialRouteId);
  const [inspectedStop, setInspectedStop] = useState(null);

  const activeRoute = SRI_LANKA_BUS_ROUTES[selectedRouteKey] || SRI_LANKA_BUS_ROUTES['colombo-kandy'];
  const googleMapUrl = buildGoogleMapsRouteUrl(activeRoute, inspectedStop);
  const externalGoogleMapsUrl = buildExternalGoogleMapsUrl(activeRoute);

  const handleRouteSwitch = (key) => {
    setSelectedRouteKey(key);
    setInspectedStop(null); // Reset inspected stop
  };

  const handleStopClick = (stopName) => {
    if (inspectedStop === stopName) {
      setInspectedStop(null); // Toggle off, return to full route
    } else {
      setInspectedStop(stopName);
    }
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6">
      
      {/* Header & Route Tabs */}
      <div className="space-y-4 border-b border-slate-800/80 pb-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1.5">
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sri Lankan National Transit Bus Routes & Stops</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {activeRoute.name}
            </h3>
            <p className="text-xs sm:text-sm text-cyan-300/80 font-medium mt-0.5">
              {activeRoute.nameSi} &bull; <span className="text-slate-400">{activeRoute.corridor}</span>
            </p>
          </div>

          {/* Quick Route Stats Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Route No:</span>
              <span className="text-cyan-400 font-extrabold">{activeRoute.routeNumber}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Distance:</span>
              <span className="text-white font-extrabold">{activeRoute.distance}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Est. Duration:</span>
              <span className="text-emerald-400 font-extrabold">{activeRoute.duration}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Stops:</span>
              <span className="text-indigo-400 font-extrabold">{activeRoute.stops.length} Halts</span>
            </div>
          </div>
        </div>

        {/* Route Selector Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1">
            Corridors:
          </span>
          {Object.entries(SRI_LANKA_BUS_ROUTES).map(([key, r]) => {
            const isSelected = selectedRouteKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleRouteSwitch(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold shrink-0 transition-all flex items-center space-x-1.5 border ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20 font-black'
                    : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                }`}
              >
                <Bus className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-cyan-400'}`} />
                <span>{r.routeNumber} ({r.defaultFrom} ⇄ {r.defaultTo})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Embedded Google Map with Real Waypoint Trajectory */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl h-80 sm:h-[420px] w-full bg-slate-950">
        <iframe
          key={`${selectedRouteKey}-${inspectedStop || 'full'}`}
          title={`Sri Lankan Transit Route Map: ${activeRoute.name}`}
          src={googleMapUrl}
          className="w-full h-full border-0 filter brightness-[0.92] contrast-[1.05]"
          loading="lazy"
          allowFullScreen=""
        />

        {/* Top Floating Controls */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none gap-2">
          {/* Active View Indicator */}
          <div className="pointer-events-auto bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-white backdrop-blur-md shadow-lg flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">
              {inspectedStop ? (
                <>📍 Inspecting Bus Stand: <strong className="text-cyan-400">{inspectedStop}</strong></>
              ) : (
                <>🛣️ Full Transit Route & Highway Trajectory</>
              )}
            </span>
          </div>

          <div className="flex items-center space-x-2 pointer-events-auto">
            {inspectedStop && (
              <button
                type="button"
                onClick={() => setInspectedStop(null)}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs backdrop-blur-md shadow-lg flex items-center gap-1 transition-all"
                title="Reset to view the entire route line"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset to Full Route</span>
              </button>
            )}

            <a
              href={externalGoogleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-xs backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-all hover:scale-105"
              title="Open full Google Maps driving navigation with all waypoints"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Open in Google Maps</span>
              <ExternalLink className="w-3 h-3 text-cyan-400/80" />
            </a>
          </div>
        </div>

        {/* Bottom Floating Route HUD */}
        <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 border border-slate-700/90 rounded-2xl p-3 sm:p-4 text-xs backdrop-blur-md shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between text-white gap-3">
          <div className="flex items-start sm:items-center space-x-3">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-lg shrink-0">
              🚍
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-sm text-white">{activeRoute.name}</span>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded font-bold">
                  {activeRoute.highway}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                From: <strong className="text-white">{activeRoute.origin}</strong> ➔ To: <strong className="text-cyan-300">{activeRoute.destination}</strong>
              </p>
            </div>
          </div>

          {onSelectRouteForBooking && (
            <button
              type="button"
              onClick={() => onSelectRouteForBooking(activeRoute.defaultFrom, activeRoute.defaultTo)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs shadow-md shadow-cyan-500/20 transition-all hover:scale-105 flex items-center justify-center space-x-1.5 shrink-0"
            >
              <span>Book Seats on this Route</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* AUTHENTIC WAYPOINT STOP STEPPER (Directly as requested by user) */}
      {/* ============================================================== */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-black text-base text-white flex items-center gap-2">
              <span className="text-cyan-400">📍</span>
              <span>All Intermediate Waypoints & Stopping Towns ({activeRoute.stops.length} Points)</span>
            </h4>
            <p className="text-xs text-slate-400">
              නැවතුමක් මත ක්ලික් කර එම ස්ථානය Google Map එකේ සමීපව (Zoom In) පරීක්ෂා කරන්න.
            </p>
          </div>

          <span className="text-[11px] text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-800/40 px-3 py-1 rounded-xl self-start sm:self-auto">
            Click any stop to inspect on Google Map
          </span>
        </div>

        {/* Waypoint Chips Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {activeRoute.stops.map((stop, sIdx) => {
            const isFirst = sIdx === 0;
            const isLast = sIdx === activeRoute.stops.length - 1;
            const isInspected = inspectedStop === stop.name;

            return (
              <button
                key={sIdx}
                type="button"
                onClick={() => handleStopClick(stop.name)}
                className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between relative group ${
                  isInspected
                    ? 'bg-cyan-950/90 border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-500/20'
                    : isFirst
                    ? 'bg-slate-950 border-emerald-500/50 hover:border-emerald-400'
                    : isLast
                    ? 'bg-slate-950 border-rose-500/50 hover:border-rose-400'
                    : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
                      isFirst 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : isLast 
                        ? 'bg-rose-500/20 text-rose-400' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      #{sIdx + 1}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">
                      +{stop.time}
                    </span>
                  </div>

                  <p className="font-extrabold text-xs text-white leading-tight line-clamp-1 group-hover:text-cyan-300">
                    {stop.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">
                    {stop.nameSi}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-bold">{stop.km} km</span>
                  <span className={`font-bold transition-colors ${
                    isInspected ? 'text-cyan-300 underline' : 'text-slate-400 group-hover:text-cyan-400'
                  }`}>
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
}
