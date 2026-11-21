import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  X, Check, Undo2, Trash2, Save, MapPin, Compass, 
  Layers, Navigation, Sparkles, AlertCircle, Eye, RefreshCw
} from 'lucide-react';
import { SRI_LANKAN_WAYPOINT_PRESETS } from '../data/sriLankaJunctions';

// Fix Leaflet's default marker icon issue with bundlers (Vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Haversine distance in km
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Number((R * c).toFixed(1));
}

// Find nearest preset Sri Lankan junction within 1.8km
function findNearestPreset(lat, lng) {
  let nearest = null;
  let minDis = 1.8; // max 1.8 km
  for (let p of SRI_LANKAN_WAYPOINT_PRESETS) {
    const dis = calculateDistanceKm(lat, lng, p.lat, p.lng);
    if (dis < minDis) {
      minDis = dis;
      nearest = p;
    }
  }
  return nearest;
}

export default function RouteDrawingStudio({
  shuttle,
  isOpen,
  onClose,
  onSave
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    tileLayer: null,
    polyline: null,
    glowPolyline: null,
    markers: []
  });

  // State
  const [waypoints, setWaypoints] = useState([]);
  const [mapLayerType, setMapLayerType] = useState('roadmap'); // 'roadmap' | 'satellite'
  const [snapToRoads, setSnapToRoads] = useState(true);
  const [loadingRoadSnap, setLoadingRoadSnap] = useState(false);
  const [snappedPolylineCoords, setSnappedPolylineCoords] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [activeEditingIndex, setActiveEditingIndex] = useState(null);

  // Initialize existing stops when shuttle is provided
  useEffect(() => {
    if (shuttle && shuttle.stops && shuttle.stops.length > 0) {
      const initial = shuttle.stops.map((s, idx) => ({
        id: 'wp-' + Date.now() + '-' + idx,
        name: s.name || `Point #${idx + 1}`,
        nameSi: s.nameSi || '',
        lat: Number(s.lat),
        lng: Number(s.lng),
        km: Number(s.km || 0),
        timeOffset: s.timeOffset || (idx === 0 ? '00m' : `+${idx * 8}m`)
      })).filter(s => !isNaN(s.lat) && !isNaN(s.lng));
      setWaypoints(initial);
    } else {
      setWaypoints([]);
    }
  }, [shuttle]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [6.9147, 79.9729],
        zoom: 12,
        zoomControl: true,
        attributionControl: false
      });

      mapInstanceRef.current = map;

      // Handle Click on Map to add new waypoint
      map.on('click', (e) => {
        handleMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    const map = mapInstanceRef.current;
    const layers = layersRef.current;

    // Tile Layer
    if (layers.tileLayer) {
      map.removeLayer(layers.tileLayer);
    }

    if (mapLayerType === 'satellite') {
      layers.tileLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);
    } else {
      layers.tileLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
      ).addTo(map);
    }

    // Fit initial bounds if waypoints exist
    if (waypoints.length > 0) {
      const bounds = L.latLngBounds(waypoints.map(w => [w.lat, w.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }

    return () => {
      // Keep map instance alive or clean up on modal close
    };
  }, [isOpen, mapLayerType]);

  // Handle map click to add a point
  const handleMapClick = (lat, lng) => {
    const latRounded = Number(lat.toFixed(5));
    const lngRounded = Number(lng.toFixed(5));

    // Try finding nearest preset town/junction
    const nearest = findNearestPreset(latRounded, lngRounded);
    const newIdx = waypoints.length;

    let defaultName = `Point #${newIdx + 1}`;
    let defaultNameSi = `ලක්ෂ්‍යය #${newIdx + 1}`;
    if (nearest) {
      defaultName = nearest.name;
      defaultNameSi = nearest.nameSi || nearest.name;
    } else if (newIdx === 0) {
      defaultName = shuttle?.origin || 'Start Point';
      defaultNameSi = 'ආරම්භක නැවතුම';
    }

    // Calculate distance from previous point
    let cumDist = 0;
    if (waypoints.length > 0) {
      const prev = waypoints[waypoints.length - 1];
      cumDist = (prev.km || 0) + calculateDistanceKm(prev.lat, prev.lng, latRounded, lngRounded);
    }

    const newWp = {
      id: 'wp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      name: defaultName,
      nameSi: defaultNameSi,
      lat: latRounded,
      lng: lngRounded,
      km: Number(cumDist.toFixed(1)),
      timeOffset: newIdx === 0 ? '00m' : `+${newIdx * 8}m`
    };

    setWaypoints(prev => [...prev, newWp]);
  };

  // Re-fetch Road Snapped geometry from OSRM when waypoints change
  useEffect(() => {
    if (!isOpen) return;

    if (waypoints.length < 2) {
      setSnappedPolylineCoords([]);
      setTotalDistance(0);
      return;
    }

    // Calculate straight line distance fallback
    let dist = 0;
    for (let i = 1; i < waypoints.length; i++) {
      dist += calculateDistanceKm(waypoints[i-1].lat, waypoints[i-1].lng, waypoints[i].lat, waypoints[i].lng);
    }
    setTotalDistance(Number(dist.toFixed(1)));

    if (!snapToRoads) {
      setSnappedPolylineCoords([]);
      return;
    }

    // Fetch real road curves from OSRM
    const fetchOsrmSnappedRoute = async () => {
      setLoadingRoadSnap(true);
      try {
        // Include all waypoints so no intermediate stops are skipped
        let latLngs = [];
        let dist = 0;

        if (waypoints.length <= 70) {
          const coordsStr = waypoints.map(w => `${w.lng},${w.lat}`).join(';');
          const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.code === 'Ok' && data.routes && data.routes[0]) {
            latLngs = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            dist = data.routes[0].distance || 0;
          }
        } else {
          const chunkSize = 50;
          for (let i = 0; i < waypoints.length - 1; i += (chunkSize - 1)) {
            const chunk = waypoints.slice(i, Math.min(waypoints.length, i + chunkSize));
            if (chunk.length < 2) break;
            const coordsStr = chunk.map(w => `${w.lng},${w.lat}`).join(';');
            const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.code === 'Ok' && data.routes && data.routes[0]) {
              const seg = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
              dist += (data.routes[0].distance || 0);
              if (latLngs.length > 0) {
                latLngs = latLngs.concat(seg.slice(1));
              } else {
                latLngs = latLngs.concat(seg);
              }
            } else {
              latLngs = latLngs.concat(chunk.map(w => [w.lat, w.lng]));
            }
          }
        }

        if (latLngs.length > 0) {
          setSnappedPolylineCoords(latLngs);
          if (dist) {
            setTotalDistance(Number((dist / 1000).toFixed(1)));
          }
        } else {
          setSnappedPolylineCoords([]);
        }
      } catch (e) {
        console.warn('OSRM road snapping fallback to direct lines:', e);
        setSnappedPolylineCoords([]);
      } finally {
        setLoadingRoadSnap(false);
      }
    };

    const timer = setTimeout(fetchOsrmSnappedRoute, 300);
    return () => clearTimeout(timer);
  }, [waypoints, snapToRoads, isOpen]);

  // Update Leaflet layers (markers & polyline) on map
  useEffect(() => {
    if (!isOpen || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const layers = layersRef.current;

    // Clear old line & markers
    if (layers.polyline) map.removeLayer(layers.polyline);
    if (layers.glowPolyline) map.removeLayer(layers.glowPolyline);
    layers.markers.forEach(m => map.removeLayer(m));
    layers.markers = [];

    if (waypoints.length === 0) return;

    // Line coordinates: use snapped road curve if available, otherwise direct waypoints
    const lineCoords = (snappedPolylineCoords.length > 0 && snapToRoads)
      ? snappedPolylineCoords
      : waypoints.map(w => [w.lat, w.lng]);

    // Draw Glowing Polyline along the road
    layers.glowPolyline = L.polyline(lineCoords, {
      color: '#38bdf8',
      weight: 10,
      opacity: 0.4,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    layers.polyline = L.polyline(lineCoords, {
      color: '#0284c7', // Cyan Blue
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Place Draggable Numbered Markers on each waypoint
    waypoints.forEach((wp, index) => {
      const isFirst = index === 0;
      const isLast = index === waypoints.length - 1;

      let bg = 'background: #0284c7; color: white;';
      if (isFirst) bg = 'background: #10b981; color: white;';
      if (isLast) bg = 'background: #2563eb; color: white;';

      const html = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: grab; user-select: none;">
          <div style="width: 28px; height: 28px; border-radius: 50%; ${bg} border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 11px; font-family: monospace;">
            ${index + 1}
          </div>
          <div style="position: absolute; bottom: -22px; white-space: nowrap; background: rgba(15, 23, 42, 0.95); color: #ffffff; padding: 2px 7px; border-radius: 6px; font-size: 10px; font-weight: 800; border: 1px solid rgba(255,255,255,0.2); pointer-events: none; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
            ${wp.name}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'drawing-waypoint-marker',
        html,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([wp.lat, wp.lng], { 
        icon, 
        draggable: true,
        zIndexOffset: index === 0 || index === waypoints.length - 1 ? 500 : 200
      }).addTo(map);

      // Drag listener to adjust point position along the road
      marker.on('dragend', (e) => {
        const newLat = Number(e.target.getLatLng().lat.toFixed(5));
        const newLng = Number(e.target.getLatLng().lng.toFixed(5));
        setWaypoints(prev => prev.map((item, i) => {
          if (i === index) {
            return { ...item, lat: newLat, lng: newLng };
          }
          return item;
        }));
      });

      // Click to edit or delete marker
      marker.on('click', () => {
        setActiveEditingIndex(index);
      });

      layers.markers.push(marker);
    });

  }, [waypoints, snappedPolylineCoords, snapToRoads, isOpen]);

  // Undo last clicked waypoint
  const handleUndo = () => {
    if (waypoints.length === 0) return;
    setWaypoints(prev => prev.slice(0, -1));
  };

  // Clear all waypoints to start drawing from scratch
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all points and start drawing from scratch?')) {
      setWaypoints([]);
      setSnappedPolylineCoords([]);
    }
  };

  // Save drawn route and commit to parent
  const handleSave = () => {
    if (waypoints.length < 2) {
      alert('Please add at least 2 points on the map (Starting point and Destination) to save a route.');
      return;
    }

    // Format stops for backend database
    const formattedStops = waypoints.map((wp, idx) => ({
      name: wp.name,
      nameSi: wp.nameSi || wp.name,
      timeOffset: wp.timeOffset || (idx === 0 ? '00m' : `+${idx * 8}m`),
      km: wp.km || Number((idx * 3.5).toFixed(1)),
      lat: wp.lat,
      lng: wp.lng
    }));

    onSave(formattedStops);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-6xl h-[94vh] bg-slate-900 border-2 border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black">
              ✏️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-white">
                  Interactive Route Drawing Studio
                </h3>
                <span className="text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full">
                  {shuttle?.routeName || 'Custom Route'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                සිතියම මත කෙලින්ම Click කරමින් බස් රථය යන නියම පාර (Exact Road Path) අඳින්න.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Switcher: Roadmap vs Satellite */}
            <div className="inline-flex p-0.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setMapLayerType('roadmap')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mapLayerType === 'roadmap' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Roadmap
              </button>
              <button
                type="button"
                onClick={() => setMapLayerType('satellite')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mapLayerType === 'satellite' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Satellite
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Map Drawing Canvas */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden">
          
          <div 
            ref={mapContainerRef} 
            className="w-full h-full cursor-crosshair z-0"
          />

          {/* Top Instruction Banner on Map */}
          <div className="absolute top-3 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="pointer-events-auto px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-white text-xs shadow-xl flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-extrabold">
                {waypoints.length === 0 ? (
                  <span>👇 ආරම්භක නැවතුම (Start Point) තැබීමට සිතියම මත Click කරන්න</span>
                ) : (
                  <span>👇 ඊළඟ නැවතුම / පාරේ ස්ථානය තැබීමට සිතියම මත Click කරන්න (Points: <strong className="text-cyan-300">{waypoints.length}</strong>)</span>
                )}
              </span>
            </div>

            {/* Quick Status Pill */}
            <div className="pointer-events-auto px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-xs font-mono font-black text-cyan-300 shadow-xl flex items-center space-x-2">
              <span>📏 {totalDistance} km</span>
              <span className="text-slate-500">|</span>
              <span>📍 {waypoints.length} Points</span>
              {loadingRoadSnap && (
                <span className="text-[10px] text-amber-400 font-sans font-bold flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Snapping Road...</span>
                </span>
              )}
            </div>
          </div>

          {/* Inline Edit Popup for selected waypoint */}
          {activeEditingIndex !== null && waypoints[activeEditingIndex] && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 w-80 p-4 rounded-2xl bg-slate-900/95 border-2 border-blue-500 text-white text-xs shadow-2xl backdrop-blur-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-black text-cyan-400">
                  Edit Point #{activeEditingIndex + 1}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveEditingIndex(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block">Stop Name (English)</label>
                  <input
                    type="text"
                    value={waypoints[activeEditingIndex].name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setWaypoints(prev => prev.map((wp, i) => i === activeEditingIndex ? { ...wp, name: val } : wp));
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-950 font-bold text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block">Sinhala Name (සිංහල)</label>
                  <input
                    type="text"
                    value={waypoints[activeEditingIndex].nameSi || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setWaypoints(prev => prev.map((wp, i) => i === activeEditingIndex ? { ...wp, nameSi: val } : wp));
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-950 font-bold text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setWaypoints(prev => prev.filter((_, i) => i !== activeEditingIndex));
                    setActiveEditingIndex(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px]"
                >
                  Delete Point
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEditingIndex(null)}
                  className="px-3.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px]"
                >
                  Done
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Action Controls Dock */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Left Actions: Snap toggle, Undo, Clear */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            
            {/* Snap to Roads Toggle */}
            <label className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-bold cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={snapToRoads}
                onChange={(e) => setSnapToRoads(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
              <span>🛣️ Snap to Real Roads (පාර දිගේ Smooth වීම)</span>
            </label>

            {/* Undo Button */}
            <button
              type="button"
              disabled={waypoints.length === 0}
              onClick={handleUndo}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                waypoints.length === 0
                  ? 'opacity-40 border-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
              }`}
              title="Undo last placed point"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo Last Point (අවසන් ලක්ෂ්‍යය මකන්න)</span>
            </button>

            {/* Clear All Button */}
            <button
              type="button"
              disabled={waypoints.length === 0}
              onClick={handleClearAll}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                waypoints.length === 0
                  ? 'opacity-40 border-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/60'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All (මුල සිට අඳින්න)</span>
            </button>
          </div>

          {/* Right Actions: Cancel & Save */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel (අවලංගු කරන්න)
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black text-xs shadow-xl shadow-blue-500/25 flex items-center space-x-2 transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>💾 Save & Apply Route ({waypoints.length} Points)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
