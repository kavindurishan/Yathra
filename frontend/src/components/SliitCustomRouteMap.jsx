import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_SLIIT_SHUTTLES } from '../data/sliitTransitData';

// Fix Leaflet's default marker icon issue with bundlers (Vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function SliitCustomRouteMap({
  shuttle,
  inspectedStop = null,
  mapLayerType = 'custom', // 'custom' | 'satellite'
  isInteractive = true,
  onMapClick = null,
  onStopClick = null,
  isLive = true,
  focusBusKey = 0 // Increment to trigger map flyTo bus location
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userInteractedRef = useRef(false);
  const lastFittedRouteRef = useRef(null);
  const lastInspectedStopRef = useRef(null);
  const layersRef = useRef({
    tileLayer: null,
    currentLayerType: null,
    polyline: null,
    markers: [],
    busMarker: null,
    busLat: null,
    busLng: null,
    drawnRouteId: null
  });

  // Fit Whole Route helper (on user demand)
  const fitWholeRoute = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const rawStops = (shuttle?.stops && shuttle.stops.length > 0)
      ? shuttle.stops
      : (DEFAULT_SLIIT_SHUTTLES.find(d => d.routeId === shuttle?.routeId)?.stops || DEFAULT_SLIIT_SHUTTLES[0].stops);
    const validStops = rawStops.filter(s => typeof s.lat === 'number' && typeof s.lng === 'number');
    if (validStops.length > 0) {
      userInteractedRef.current = false;
      const bounds = L.latLngBounds(validStops.map(s => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  };

  // Center & Fly to Bus helper
  const flyToBus = () => {
    userInteractedRef.current = true;
    const map = mapInstanceRef.current;
    const { busLat, busLng, busMarker } = layersRef.current;
    if (map && typeof busLat === 'number' && typeof busLng === 'number') {
      map.flyTo([busLat, busLng], 15, { animate: true, duration: 1 });
      if (busMarker) {
        setTimeout(() => {
          busMarker.openPopup();
        }, 600);
      }
    }
  };

  // Clean up Leaflet map instance on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
      layersRef.current = {
        tileLayer: null,
        currentLayerType: null,
        polyline: null,
        markers: [],
        busMarker: null,
        busLat: null,
        busLng: null,
        drawnRouteId: null,
        hasFittedInitialBounds: false
      };
      lastFittedRouteRef.current = null;
      lastInspectedStopRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map if not already initialized
    if (!mapInstanceRef.current) {
      if (mapContainerRef.current._leaflet_id) {
        delete mapContainerRef.current._leaflet_id;
      }

      const map = L.map(mapContainerRef.current, {
        center: [6.9147, 79.9729], // Default SLIIT Malabe Campus
        zoom: 13,
        zoomControl: true,
        attributionControl: false
      });

      // Reset layers reference for fresh new map instance
      layersRef.current = {
        tileLayer: null,
        currentLayerType: null,
        polyline: null,
        markers: [],
        busMarker: null,
        busLat: null,
        busLng: null,
        drawnRouteId: null,
        hasFittedInitialBounds: false
      };
      lastFittedRouteRef.current = null;
      lastInspectedStopRef.current = null;

      // Track manual user panning and zooming so background updates never override user's view
      map.on('movestart', (e) => {
        if (e && e.originalEvent) {
          userInteractedRef.current = true;
        }
      });
      map.on('zoomstart', (e) => {
        if (e && e.originalEvent) {
          userInteractedRef.current = true;
        }
      });

      // Track zoom level to declutter halt text when zoomed out so live bus stands out clearly
      const handleZoomCheck = () => {
        if (!mapContainerRef.current) return;
        if (map.getZoom() < 13) {
          mapContainerRef.current.classList.add('map-zoomed-far');
        } else {
          mapContainerRef.current.classList.remove('map-zoomed-far');
        }
      };
      map.on('zoomend', handleZoomCheck);
      handleZoomCheck();

      mapInstanceRef.current = map;

      // Handle Map Click for Admin Manual Route Builder
      if (onMapClick) {
        map.on('click', (e) => {
          onMapClick(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)));
        });
      }
    }

    const map = mapInstanceRef.current;
    const layers = layersRef.current;

    // 1. Tile Layer Management based on layerType (only switch when layer type changes)
    if (!layers.tileLayer || layers.currentLayerType !== mapLayerType || !map.hasLayer(layers.tileLayer)) {
      if (layers.tileLayer) {
        map.removeLayer(layers.tileLayer);
      }

      if (mapLayerType === 'satellite') {
        // High-res Google Hybrid Satellite (Google imagery + street names & city labels)
        layers.tileLayer = L.tileLayer(
          'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
          { maxZoom: 20, attribution: '© Google Maps' }
        ).addTo(map);
      } else {
        // Official Google Maps Standard Road Map (Clean roads, towns, highways, Sri Lanka landmarks)
        layers.tileLayer = L.tileLayer(
          'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
          { maxZoom: 20, attribution: '© Google Maps' }
        ).addTo(map);
      }
      layers.currentLayerType = mapLayerType;
    }

    // Force Leaflet to calculate container size and load tiles immediately
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 400);

    // Get stops from shuttle, or fallback to DEFAULT_SLIIT_SHUTTLES if missing
    const rawStops = (shuttle?.stops && shuttle.stops.length > 0)
      ? shuttle.stops
      : (DEFAULT_SLIIT_SHUTTLES.find(d => d.routeId === shuttle?.routeId)?.stops || DEFAULT_SLIIT_SHUTTLES[0].stops);

    // Filter valid coordinates
    const validStops = rawStops.filter(s => typeof s.lat === 'number' && typeof s.lng === 'number');
    if (validStops.length === 0) return;

    const latLngs = validStops.map(s => [s.lat, s.lng]);

    // 2. Only Redraw Route Polyline and Stops if Route Changed (Prevents flickering during live GPS streaming)
    const routeIdentifier = shuttle?.routeId || shuttle?._id || 'default-route';
    const isNewRoute = routeIdentifier !== lastFittedRouteRef.current;
    if (isNewRoute) {
      lastFittedRouteRef.current = routeIdentifier;
      userInteractedRef.current = false;
    }

    const shouldRedrawRoute = isNewRoute || layers.drawnRouteId !== routeIdentifier || !layers.polyline;

    if (shouldRedrawRoute) {
      // Clear Existing Polyline and Markers
      if (layers.polyline) {
        map.removeLayer(layers.polyline);
        layers.polyline = null;
      }
      layers.markers.forEach(m => map.removeLayer(m));
      layers.markers = [];

      // 3. Draw Custom Manual Road Polyline connecting all sequential manual waypoints
      layers.polyline = L.polyline(latLngs, {
        color: '#0284c7', // Sky Blue
        weight: 6,
        opacity: 0.92,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Glowing underlay line
      layers.glowPolyline = L.polyline(latLngs, {
        color: '#38bdf8',
        weight: 11,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      layers.markers.push(layers.glowPolyline);

      // Fetch authentic road curves from OSRM so the route follows real streets on Google Maps
      if (latLngs.length >= 2) {
        const sampleRate = Math.max(1, Math.ceil(latLngs.length / 25));
        const sampled = latLngs.filter((_, idx) => idx % sampleRate === 0 || idx === latLngs.length - 1);
        const coordsStr = sampled.map(([lat, lng]) => `${lng},${lat}`).join(';');
        fetch(`https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`)
          .then(res => res.json())
          .then(data => {
            if (data && data.code === 'Ok' && data.routes && data.routes[0]) {
              const roadLatLngs = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
              if (layers.polyline) layers.polyline.setLatLngs(roadLatLngs);
              if (layers.glowPolyline) layers.glowPolyline.setLatLngs(roadLatLngs);
            }
          })
          .catch(() => {
            // Keep straight-line fallback if OSRM is unreachable
          });
      }

      // 4. Create Custom Numbered Stop Markers along the route
      validStops.forEach((stop, index) => {
        const isFirst = index === 0;
        const isLast = index === validStops.length - 1;
        const isInspected = inspectedStop === stop.name;

        let bgClass = 'background: #0284c7; color: #ffffff;';
        if (isFirst) bgClass = 'background: #10b981; color: #ffffff;';
        if (isLast) bgClass = 'background: #2563eb; color: #ffffff;';
        if (isInspected) bgClass = 'background: #f59e0b; color: #ffffff; transform: scale(1.3); box-shadow: 0 0 14px #f59e0b;';

        const stopHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; user-select: none;">
            <div style="width: 24px; height: 24px; border-radius: 50%; ${bgClass} border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 10px; font-family: monospace;">
              ${index + 1}
            </div>
            <div class="halt-label" style="position: absolute; bottom: -20px; white-space: nowrap; background: rgba(15, 23, 42, 0.9); color: #ffffff; padding: 1px 6px; border-radius: 5px; font-size: 9px; font-weight: 800; border: 1px solid rgba(255,255,255,0.2); pointer-events: none; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
              ${stop.name}
            </div>
          </div>
        `;

        const stopIcon = L.divIcon({
          className: 'custom-stop-point',
          html: stopHtml,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon }).addTo(map);

        // Popup Content for Halts
        const popupContent = `
          <div style="font-family: system-ui, sans-serif; font-size: 12px; line-height: 1.4; padding: 4px; min-width: 170px;">
            <div style="font-size: 10px; font-weight: 800; color: #0284c7; text-transform: uppercase;">
              ${isFirst ? '🟢 Starting Terminal' : isLast ? '🎓 Destination Terminal' : `📍 Halt #${index + 1}`}
            </div>
            <div style="font-size: 14px; font-weight: 900; color: #0f172a; margin-top: 2px;">
              ${stop.name}
            </div>
            ${stop.nameSi ? `<div style="font-size: 11px; color: #64748b; font-weight: 600;">${stop.nameSi}</div>` : ''}
            <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #334155;">
              <span>⏱️ Scheduled Time: <b>${stop.timeOffset || '--'}</b></span><br/>
              <span>📏 Distance from Start: <b>${stop.km || 0} km</b></span><br/>
              <span style="font-family: monospace; color: #94a3b8; font-size: 10px;">${stop.lat.toFixed(4)}, ${stop.lng.toFixed(4)}</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        if (onStopClick) {
          marker.on('click', () => onStopClick(stop.name));
        }

        layers.markers.push(marker);
      });

      layers.drawnRouteId = routeIdentifier;
    }

    // ==============================================================
    // 5. DRAW OR SMOOTHLY MOVE PROMINENT LIVE BUS GPS RADAR MARKER
    // ==============================================================
    const loc = shuttle.currentLocation || {};
    const busLat = loc.lat || (validStops[0] && validStops[0].lat);
    const busLng = loc.lng || (validStops[0] && validStops[0].lng);
    layers.busLat = busLat;
    layers.busLng = busLng;

    if (typeof busLat === 'number' && typeof busLng === 'number') {
      const busHtml = `
        <div style="position: relative; width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; cursor: pointer; user-select: none;">
          
          <!-- Outer Pulsing Radar Waves (Ultra-prominent even when zoomed out) -->
          <div style="position: absolute; width: 88px; height: 88px; border-radius: 50%; background: rgba(245, 158, 11, 0.4); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; pointer-events: none;"></div>
          <div style="position: absolute; width: 62px; height: 62px; border-radius: 50%; background: rgba(245, 158, 11, 0.3); pointer-events: none;"></div>
          
          <!-- Top Floating Live Badge -->
          <div style="position: absolute; top: -2px; left: 50%; transform: translateX(-50%); white-space: nowrap; background: #0f172a; color: #fbbf24; border: 2px solid #f59e0b; padding: 2px 9px; border-radius: 9999px; font-size: 10px; font-weight: 900; box-shadow: 0 4px 12px rgba(0,0,0,0.6); display: flex; align-items: center; gap: 5px; z-index: 50;">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #22c55e; animation: pulse 1s infinite;"></span>
            <span>🚍 LIVE: ${shuttle.busNumber || 'WP NB-5208'}</span>
          </div>

          <!-- Main 3D Glowing Amber Bus Sphere -->
          <div style="position: relative; width: 46px; height: 46px; border-radius: 50%; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%); border: 3px solid #ffffff; box-shadow: 0 6px 20px rgba(217, 119, 6, 0.85); display: flex; align-items: center; justify-content: center; z-index: 40;">
            <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 6v6"></path>
              <path d="M15 6v6"></path>
              <path d="M2 12h19.6"></path>
              <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4c-1.1 0-2.1.8-2.4 1.8l-1.4 5C0 13.2 0 13.6 0 14c0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"></path>
              <circle cx="6.5" cy="17.5" r="2.5" fill="#1e293b"></circle>
              <circle cx="16.5" cy="17.5" r="2.5" fill="#1e293b"></circle>
            </svg>
          </div>

          <!-- Bottom Location Indicator Pill -->
          <div style="position: absolute; bottom: -2px; left: 50%; transform: translateX(-50%); white-space: nowrap; background: #0f172a; color: #ffffff; border: 1.5px solid #38bdf8; padding: 2px 8px; border-radius: 7px; font-size: 9px; font-weight: 800; box-shadow: 0 3px 8px rgba(0,0,0,0.4); z-index: 50;">
            📍 ${loc.currentHalt || shuttle.origin} (${loc.speed || 38} km/h)
          </div>

        </div>
      `;

      const busIcon = L.divIcon({
        className: 'prominent-bus-live-marker',
        html: busHtml,
        iconSize: [100, 100],
        iconAnchor: [50, 50]
      });

      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; font-size: 12px; line-height: 1.4; padding: 6px; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 900; color: #16a34a; background: #dcfce7; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              ● LIVE GPS ACTIVE
            </span>
            <span style="font-family: monospace; font-weight: 900; background: #0f172a; color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-size: 10px;">
              ${shuttle.busNumber}
            </span>
          </div>

          <div style="font-size: 14px; font-weight: 900; color: #0f172a;">
            ${shuttle.routeName}
          </div>
          
          <div style="margin-top: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #64748b;">දැන් තියෙන තැන:</span>
              <b style="color: #0284c7;">${loc.currentHalt || shuttle.origin}</b>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #64748b;">ඊළඟ නැවතුම:</span>
              <b style="color: #059669;">${loc.nextHalt || 'SLIIT Campus'} (${loc.nextHaltEta || '--'})</b>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">වේගය:</span>
              <b style="color: #d97706;">⚡ ${loc.speed || 38} km/h</b>
            </div>
          </div>

          <div style="margin-top: 8px; display: flex; align-items: center; justify-content: space-between; font-size: 11px; padding-top: 6px; border-top: 1px solid #e2e8f0;">
            <span>රියදුරු: <b>${shuttle.driverName || 'Campus Driver'}</b></span>
            <a href="tel:${shuttle.driverPhone}" style="color: #0284c7; font-weight: bold; text-decoration: none;">📞 අමතන්න</a>
          </div>
        </div>
      `;

      if (layers.busMarker && map.hasLayer(layers.busMarker)) {
        // Smoothly update location without rebuilding or flickering!
        layers.busMarker.setLatLng([busLat, busLng]);
        layers.busMarker.setIcon(busIcon);
        const popup = layers.busMarker.getPopup();
        if (popup) popup.setContent(popupHtml);
      } else {
        layers.busMarker = L.marker([busLat, busLng], { icon: busIcon, zIndexOffset: 99999 }).addTo(map);
        layers.busMarker.bindPopup(popupHtml);
      }
    }

    // 6. Viewport fitting:
    // (routeIdentifier and isNewRoute were already determined at the start of this effect)

    // Explicit stop inspection
    if (inspectedStop && inspectedStop !== lastInspectedStopRef.current) {
      lastInspectedStopRef.current = inspectedStop;
      const targetStop = validStops.find(s => s.name === inspectedStop);
      if (targetStop) {
        userInteractedRef.current = true;
        map.flyTo([targetStop.lat, targetStop.lng], 15, { animate: true, duration: 0.8 });
        return;
      }
    } else if (!inspectedStop) {
      lastInspectedStopRef.current = null;
    }

    // ONLY fit bounds when:
    // 1. It is a completely new corridor or map instance just initialized
    // 2. AND the user has NOT manually interacted / zoomed / panned the map
    // NEVER zoom out automatically during live telemetry updates or when user is looking at the map!
    if ((isNewRoute || !layers.hasFittedInitialBounds) && !userInteractedRef.current && latLngs.length > 0) {
      layers.hasFittedInitialBounds = true;
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

  }, [shuttle, inspectedStop, mapLayerType, isLive]);

  // Handle focusBusKey trigger
  useEffect(() => {
    if (focusBusKey > 0) {
      flyToBus();
    }
  }, [focusBusKey]);

  return (
    <div className="absolute inset-0 w-full h-full select-none">
      <style>{`
        .leaflet-top.leaflet-left {
          top: 56px !important;
          left: 14px !important;
        }
        .map-zoomed-far .custom-stop-point .halt-label {
          display: none !important;
        }
        .prominent-bus-live-marker {
          z-index: 99999 !important;
        }
        .leaflet-container {
          background-color: #0f172a !important;
        }
      `}</style>

      <div 
        ref={mapContainerRef} 
        className="w-full h-full z-0"
        style={{ minHeight: '360px', height: '100%' }}
      />

      {/* Floating Map Controls (Focus Bus & Fit Route) */}
      <div className="absolute bottom-14 sm:bottom-16 right-3 z-[400] flex flex-col items-end space-y-2">
        {/* Reset / Fit Whole Route Button */}
        <button
          type="button"
          onClick={fitWholeRoute}
          className="px-3 py-1.5 rounded-xl bg-slate-900/95 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-[11px] shadow-xl flex items-center space-x-1.5 transition-all border border-slate-700/80 cursor-pointer backdrop-blur-md"
          title="මුළු බස් මාර්ගයම එකවර බලාගන්න (Fit Whole Route)"
        >
          <span>🗺️</span>
          <span>Fit Route (මුළු මාර්ගය)</span>
        </button>

        {/* Focus Live Bus Button */}
        <button
          type="button"
          onClick={flyToBus}
          className="px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-2xl flex items-center space-x-1.5 transition-all transform hover:scale-105 border-2 border-white cursor-pointer"
          title="Map එක කෙලින්ම බස් රථය දැන් තිබෙන තැනට Focus කරන්න"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
          <span>🎯 Focus Bus (දැන් බස් එක මෙතන)</span>
        </button>
      </div>
    </div>
  );
}
