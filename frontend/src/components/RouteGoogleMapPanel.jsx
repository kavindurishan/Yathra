import React, { useState } from 'react';
import { 
  Navigation, MapPin, Compass, ExternalLink, RefreshCw, 
  Layers, X, Bus, CheckCircle2, ChevronRight, AlertCircle
} from 'lucide-react';
import { getTrilingualCity } from '../services/cityTranslations';
import { 
  findMatchingRoute, 
  buildGoogleMapsRouteUrl, 
  buildExternalGoogleMapsUrl 
} from '../services/routesData';

export default function RouteGoogleMapPanel({
  activeSchedule = null,
  from = '',
  to = '',
  onClose = null,
  isModal = false
}) {
  const [mapLayerType, setMapLayerType] = useState('roadmap'); // 'roadmap' | 'satellite'
  const [inspectedStop, setInspectedStop] = useState(null);

  // Derive starting location and destination
  const scheduleRoute = activeSchedule?.route;
  const startCity = scheduleRoute?.startingLocation || from || 'Colombo';
  const destCity = scheduleRoute?.destination || to || 'Kandy';

  // Match closest authentic Sri Lankan route dataset for highway & waypoint fidelity
  const presetRoute = findMatchingRoute(startCity, destCity);

  // Merge schedule with authentic route waypoints
  const effectiveStops = (scheduleRoute?.stops && scheduleRoute.stops.length > 0)
    ? scheduleRoute.stops.map(s => {
        const matched = presetRoute?.stops?.find(ps => ps.name.toLowerCase() === s.name.toLowerCase());
        return {
          name: s.name,
          nameSi: matched?.nameSi || s.name,
          time: s.timeOffset || matched?.time || '',
          km: matched?.km || ''
        };
      })
    : (presetRoute?.stops || [
        { name: startCity, nameSi: getTrilingualCity(startCity), time: '00m', km: 0 },
        { name: destCity, nameSi: getTrilingualCity(destCity), time: 'Arrival', km: '' }
      ]);

  const effectiveRoute = {
    ...presetRoute,
    ...(scheduleRoute || {}),
    origin: startCity,
    destination: destCity,
    stops: effectiveStops
  };

  const googleMapUrl = buildGoogleMapsRouteUrl(
    effectiveRoute, 
    inspectedStop, 
    mapLayerType === 'satellite' ? 'k' : 'm'
  );
  const externalMapsUrl = buildExternalGoogleMapsUrl(effectiveRoute);

  const handleStopClick = (stopName) => {
    if (inspectedStop === stopName) {
      setInspectedStop(null); // Return to full route
    } else {
      setInspectedStop(stopName);
    }
  };

  return (
    <div className={`w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col ${
      isModal ? 'h-[85vh] sm:h-[88vh]' : 'h-[640px] sm:h-[700px]'
    }`}>
      
      {/* ============================================================== */}
      {/* PANEL HEADER & CONTROLS                                        */}
      {/* ============================================================== */}
      <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 flex flex-col gap-2.5">
        
        {/* Top Line: Route Title & App / Close Buttons */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Active Route Title Badge */}
          <div className="flex items-center space-x-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                {getTrilingualCity(startCity)} ⇄ {getTrilingualCity(destCity)}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                {effectiveRoute.highway || effectiveRoute.routeNumber || 'Sri Lankan Highway Corridor'}
              </p>
            </div>
          </div>

          {/* External App Link & Modal Close */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <a
              href={externalMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-extrabold flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
              title="Open full driving directions in Google Maps App"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Google Maps App</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>

            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                title="Close Map"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Second Line: Two Views Switcher (Roadmap vs Satellite) */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-primary-500" />
            <span>Map Views:</span>
          </span>

          {/* Segmented Two-View Switcher Tabs */}
          <div className="inline-flex p-0.5 bg-slate-200/80 dark:bg-slate-800/90 rounded-xl text-xs font-extrabold">
            {/* View 1: Roadmap View */}
            <button
              type="button"
              onClick={() => setMapLayerType('roadmap')}
              className={`px-3 py-1 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
                mapLayerType === 'roadmap'
                  ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="View Standard Roadmap (සාමාන්‍ය මාර්ග සිතියම)"
            >
              <span>🗺️</span>
              <span>Roadmap (මාර්ග)</span>
            </button>

            {/* View 2: Satellite View */}
            <button
              type="button"
              onClick={() => setMapLayerType('satellite')}
              className={`px-3 py-1 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
                mapLayerType === 'satellite'
                  ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="View Satellite Imagery (චන්ද්‍රිකා සිතියම)"
            >
              <span>🛰️</span>
              <span>Satellite (චන්ද්‍රිකා)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* GOOGLE MAP EMBED CANVAS                                        */}
      {/* ============================================================== */}
      <div className="relative flex-1 min-h-[260px] bg-slate-100 dark:bg-slate-950 overflow-hidden">
        
        {/* Authentic Google Maps Embed Frame */}
        <iframe
          key={`${startCity}-${destCity}-${inspectedStop || 'full'}-${mapLayerType}`}
          title={`Sri Lankan Transit Map - ${startCity} to ${destCity}`}
          src={googleMapUrl}
          className="w-full h-full border-0 filter brightness-[0.96] contrast-[1.02]"
          loading="lazy"
          allowFullScreen=""
        />

        {/* Floating Top Banner on Map: Active Inspection Status */}
        <div className="absolute top-2.5 left-2.5 right-2.5 pointer-events-none flex items-center justify-between gap-2">
          <div className="pointer-events-auto bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-white text-xs shadow-lg flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-bold truncate max-w-[200px] sm:max-w-xs">
              {inspectedStop ? (
                <>📍 <span className="text-cyan-300 font-black">{inspectedStop}</span> Bus Stand</>
              ) : (
                <>🛣️ Full Route & Waypoints Line</>
              )}
            </span>
          </div>

          {inspectedStop && (
            <button
              type="button"
              onClick={() => setInspectedStop(null)}
              className="pointer-events-auto px-2.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-black shadow-lg flex items-center space-x-1 transition-all cursor-pointer"
              title="Reset map view to the full origin-destination route"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Full Route (සම්පූර්ණ මාර්ගය)</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* INTERMEDIATE STOPS & TOWNS INSPECTION CHIPS                     */}
      {/* ============================================================== */}
      <div className="p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-950/90 border-t border-slate-200/80 dark:border-slate-800 max-h-[170px] sm:max-h-[190px] overflow-y-auto space-y-2">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-black text-slate-800 dark:text-slate-200">
            <MapPin className="w-3.5 h-3.5 text-primary-500" />
            <span>Route Halts & Waypoints ({effectiveStops.length})</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            Click stop to inspect (සිතියමේ බලන්න)
          </span>
        </div>

        {/* Horizontal Wrap Chips */}
        <div className="flex flex-wrap gap-1.5">
          {effectiveStops.map((stop, sIdx) => {
            const isFirst = sIdx === 0;
            const isLast = sIdx === effectiveStops.length - 1;
            const isInspected = inspectedStop === stop.name;

            return (
              <button
                key={sIdx}
                type="button"
                onClick={() => handleStopClick(stop.name)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center space-x-1.5 cursor-pointer ${
                  isInspected
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-md ring-2 ring-cyan-500/30'
                    : isFirst
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                    : isLast
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-100'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-primary-400'
                }`}
                title={`Inspect ${stop.name} Bus Stand on Google Maps`}
              >
                <span className="text-[9px] opacity-70">
                  {isFirst ? '🟢 Start:' : isLast ? '🔴 Dest:' : `#${sIdx + 1}`}
                </span>
                <span>{stop.name}</span>
                {stop.time && (
                  <span className="text-[9px] opacity-75 font-mono">
                    ({stop.time})
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
}
