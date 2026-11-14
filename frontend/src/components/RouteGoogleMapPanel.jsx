import React, { useEffect, useRef, useState } from 'react';
import { X, ExternalLink, Layers } from 'lucide-react';
import { getTrilingualCity } from '../services/cityTranslations';
import { buildExternalGoogleMapsUrl, findMatchingRoute } from '../services/routesData';

/**
 * Authentic Sri Lankan City & Transit Hub Coordinates
 */
const SRI_LANKAN_CITIES = {
  'colombo': [6.9344, 79.8510],
  'colombo fort': [6.9344, 79.8510],
  'pettah': [6.9360, 79.8528],
  'makumbura': [6.8436, 79.9678],
  'kottawa': [6.8436, 79.9678],
  'kadawatha': [7.0016, 79.9540],
  'kandy': [7.2906, 80.6337],
  'galle': [6.0367, 80.2170],
  'matara': [5.9485, 80.5353],
  'badulla': [6.9934, 81.0550],
  'jaffna': [9.6615, 80.0255],
  'anuradhapura': [8.3114, 80.4037],
  'kurunegala': [7.4863, 80.3623],
  'nuwara eliya': [6.9497, 80.7891],
  'panadura': [6.7132, 79.9074],
  'kaduwela': [6.9344, 79.9839],
  'negombo': [7.2008, 79.8736],
  'katunayake': [7.1702, 79.8856],
  'trincomalee': [8.5874, 81.2152],
  'batticaloa': [7.7170, 81.7000],
  'hambantota': [6.1246, 81.1185],
  'tangalle': [6.0243, 80.7941],
  'weligama': [5.9734, 80.4285],
  'hikkaduwa': [6.1407, 80.1017],
  'bentota': [6.4260, 80.0031],
  'aluthgama': [6.4260, 80.0031],
  'kalutara': [6.5854, 79.9607],
  'moratuwa': [6.7730, 79.8816],
  'dehiwala': [6.8511, 79.8659],
  'nugegoda': [6.8649, 79.8997],
  'battaramulla': [6.8990, 79.9230],
  'malabe': [6.9042, 79.9547],
  'kegalle': [7.2514, 80.3464],
  'mawanella': [7.2525, 80.4469],
  'peradeniya': [7.2685, 80.5960],
  'nittambuwa': [7.1444, 80.0956],
  'warakapola': [7.2241, 80.1989],
  'dambulla': [7.8742, 80.6511],
  'sigiriya': [7.9570, 80.7603],
  'polonnaruwa': [7.9403, 81.0188],
  'matale': [7.4675, 80.6234],
  'bandarawela': [6.8306, 80.9906],
  'ella': [6.8667, 81.0466],
  'haputale': [6.7681, 80.9575],
  'ratnapura': [6.6828, 80.4037],
  'avissawella': [6.9538, 80.2078],
  'monaragala': [6.8728, 81.3507],
  'wellawaya': [6.7408, 81.1017],
  'ampara': [7.2912, 81.6724],
  'kilinochchi': [9.3803, 80.3770],
  'vavuniya': [8.7542, 80.4982],
  'mannar': [8.9810, 79.9044],
  'puttalam': [8.0362, 79.8283],
  'chilaw': [7.5758, 79.7953],
  'kataragama': [6.4167, 81.3333]
};

function getCityCoords(cityName) {
  if (!cityName) return [6.9344, 79.8510];
  const normalized = cityName.toLowerCase().trim();
  for (const [key, coords] of Object.entries(SRI_LANKAN_CITIES)) {
    if (normalized === key || normalized.includes(key) || key.includes(normalized)) {
      return coords;
    }
  }
  return [6.9344, 79.8510];
}

/**
 * Authentic Highway & Main Road Waypoints for realistic road curving in Sri Lanka
 */
function getRoadWaypoints(startCity, destCity) {
  const s = (startCity || '').toLowerCase();
  const d = (destCity || '').toLowerCase();

  // Colombo <-> Kandy (A1 Main Road Corridor)
  if ((s.includes('colombo') && d.includes('kandy')) || (s.includes('kandy') && d.includes('colombo'))) {
    const pts = [
      [6.9344, 79.8510], // Colombo Pettah
      [6.9610, 79.8890], // Peliyagoda
      [7.0016, 79.9540], // Kadawatha
      [7.1444, 80.0956], // Nittambuwa
      [7.2241, 80.1989], // Warakapola
      [7.2514, 80.3464], // Kegalle
      [7.2525, 80.4469], // Mawanella
      [7.2564, 80.5218], // Kadugannawa
      [7.2685, 80.5960], // Peradeniya
      [7.2906, 80.6337]  // Kandy
    ];
    return s.includes('kandy') ? pts.reverse() : pts;
  }

  // Colombo <-> Galle (Southern Expressway E01)
  if ((s.includes('colombo') || s.includes('makumbura')) && d.includes('galle')) {
    return [
      [6.9344, 79.8510], // Colombo
      [6.8436, 79.9678], // Makumbura
      [6.5925, 80.0632], // Dodangoda
      [6.3533, 80.1656], // Kurundugahahetekma
      [6.0682, 80.2520], // Pinnaduwa
      [6.0367, 80.2170]  // Galle
    ];
  }

  // Galle <-> Colombo
  if (s.includes('galle') && (d.includes('colombo') || d.includes('makumbura'))) {
    return [
      [6.0367, 80.2170],
      [6.0682, 80.2520],
      [6.3533, 80.1656],
      [6.5925, 80.0632],
      [6.8436, 79.9678],
      [6.9344, 79.8510]
    ];
  }

  // Colombo <-> Matara (E01 Expressway Corridor)
  if ((s.includes('colombo') || s.includes('makumbura')) && d.includes('matara')) {
    return [
      [6.9344, 79.8510],
      [6.8436, 79.9678],
      [6.5925, 80.0632],
      [6.3533, 80.1656],
      [6.0682, 80.2520],
      [5.9734, 80.4285], // Weligama
      [5.9485, 80.5353]  // Matara
    ];
  }

  // Panadura <-> Kandy (Route 17 Bypass)
  if ((s.includes('panadura') && d.includes('kandy')) || (s.includes('kandy') && d.includes('panadura'))) {
    const pts = [
      [6.7132, 79.9074], // Panadura
      [6.8649, 79.8997], // Nugegoda
      [6.8990, 79.9230], // Battaramulla
      [6.9042, 79.9547], // Malabe
      [6.9344, 79.9839], // Kaduwela
      [7.0425, 80.0242], // Weliweriya
      [7.0789, 80.0382], // Belummahara
      [7.1444, 80.0956], // Nittambuwa
      [7.2241, 80.1989], // Warakapola
      [7.2514, 80.3464], // Kegalle
      [7.2525, 80.4469], // Mawanella
      [7.2564, 80.5218], // Kadugannawa
      [7.2906, 80.6337]  // Kandy
    ];
    return s.includes('kandy') ? pts.reverse() : pts;
  }

  // Colombo <-> Jaffna (A9 Northern Direct)
  if ((s.includes('colombo') && d.includes('jaffna')) || (s.includes('jaffna') && d.includes('colombo'))) {
    const pts = [
      [6.9344, 79.8510],
      [7.2008, 79.8736], // Negombo
      [7.5758, 79.7953], // Chilaw
      [8.0362, 79.8283], // Puttalam
      [8.3114, 80.4037], // Anuradhapura
      [8.7542, 80.4982], // Vavuniya
      [9.3803, 80.3770], // Kilinochchi
      [9.6615, 80.0255]  // Jaffna
    ];
    return s.includes('jaffna') ? pts.reverse() : pts;
  }

  // Colombo <-> Badulla
  if ((s.includes('colombo') && d.includes('badulla')) || (s.includes('badulla') && d.includes('colombo'))) {
    const pts = [
      [6.9344, 79.8510],
      [6.9538, 80.2078], // Avissawella
      [6.6828, 80.4037], // Ratnapura
      [6.6508, 80.7011], // Balangoda
      [6.7681, 80.9575], // Beragala
      [6.8306, 80.9906], // Bandarawela
      [6.9934, 81.0550]  // Badulla
    ];
    return s.includes('badulla') ? pts.reverse() : pts;
  }

  return [getCityCoords(startCity), getCityCoords(destCity)];
}

export default function RouteGoogleMapPanel({
  activeSchedule = null,
  from = '',
  to = '',
  onClose = null,
  isModal = false
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef(null);
  const tileLayerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapLayerType, setMapLayerType] = useState('roadmap'); // 'roadmap' or 'satellite'

  // Derive starting location and destination
  const scheduleRoute = activeSchedule?.route;
  const startCity = scheduleRoute?.startingLocation || from || 'Colombo';
  const destCity = scheduleRoute?.destination || to || 'Kandy';

  const presetRoute = findMatchingRoute(startCity, destCity);
  const effectiveRoute = {
    ...presetRoute,
    ...(scheduleRoute || {}),
    origin: startCity,
    destination: destCity
  };
  const externalMapsUrl = buildExternalGoogleMapsUrl(effectiveRoute);

  // Initialize Leaflet with official Sri Lankan Google Maps tiles (ZERO "More options" white box!)
  useEffect(() => {
    let checkInterval = null;

    const initMap = () => {
      if (!window.L || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const L = window.L;

      // Create Leaflet map instance centered on Sri Lanka
      const map = L.map(mapContainerRef.current, {
        center: [7.8731, 80.7718],
        zoom: 8,
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: true
      });

      // Google Maps Tile Layer:
      // 'lyrs=m': Google Roadmap with Sri Lankan road network & city labels
      // 'lyrs=y': Google Hybrid Satellite with roads and labels
      const tileUrl = mapLayerType === 'satellite'
        ? 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        : 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps'
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Group for polylines and markers
      const layersGroup = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      layersGroupRef.current = layersGroup;
      setMapLoaded(true);

      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    };

    if (window.L) {
      initMap();
    } else {
      checkInterval = setInterval(() => {
        if (window.L) {
          clearInterval(checkInterval);
          initMap();
        }
      }, 100);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Google Maps layer when switched between Roadmap and Satellite
  const toggleMapLayer = () => {
    if (!mapInstanceRef.current || !window.L) return;
    const nextType = mapLayerType === 'roadmap' ? 'satellite' : 'roadmap';
    setMapLayerType(nextType);

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const tileUrl = nextType === 'satellite'
      ? 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
      : 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

    const newTileLayer = window.L.tileLayer(tileUrl, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps'
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTileLayer;
  };

  // Draw Route Polyline & Markers whenever startCity or destCity changes
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !layersGroupRef.current || !window.L) return;

    const L = window.L;
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;

    group.clearLayers();

    const startCoords = getCityCoords(startCity);
    const destCoords = getCityCoords(destCity);

    // Circular glowing marker matching Google Maps pin style
    const createCircleIcon = (color = '#2563EB') => L.divIcon({
      className: 'custom-circle-icon',
      html: `
        <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 26px; height: 26px; border-radius: 50%; background: ${color}35; border: 1.5px solid rgba(255, 255, 255, 0.95); box-shadow: 0 0 10px ${color}40;"></div>
          <div style="position: relative; width: 12px; height: 12px; border-radius: 50%; background: ${color}; border: 2.5px solid #FFFFFF; box-shadow: 0 2px 5px rgba(0,0,0,0.35);"></div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -14]
    });

    // Start Pin Marker
    const startMarker = L.marker(startCoords, { icon: createCircleIcon('#2563EB') })
      .bindPopup(`<div style="font-family: inherit; font-size: 12px; font-weight: bold; text-align: center; padding: 2px;">
        <span style="color: #2563EB; font-size: 10px; text-transform: uppercase; display: block; font-weight: 800;">Departure</span>
        ${getTrilingualCity(startCity)}
      </div>`)
      .addTo(group);

    // Destination Pin Marker
    const destMarker = L.marker(destCoords, { icon: createCircleIcon('#2563EB') })
      .bindPopup(`<div style="font-family: inherit; font-size: 12px; font-weight: bold; text-align: center; padding: 2px;">
        <span style="color: #059669; font-size: 10px; text-transform: uppercase; display: block; font-weight: 800;">Destination</span>
        ${getTrilingualCity(destCity)}
      </div>`)
      .addTo(group);

    // Authentic Road Waypoints
    const fallbackWaypoints = getRoadWaypoints(startCity, destCity);

    const drawPolyline = (points) => {
      // Outer subtle highway casing
      L.polyline(points, {
        color: '#93C5FD',
        weight: 9,
        opacity: 0.45,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(group);

      // Primary Vibrant Route Polyline
      const primaryLine = L.polyline(points, {
        color: '#2563EB',
        weight: 5,
        opacity: 0.92,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(group);

      try {
        const bounds = primaryLine.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 11
          });
        }
      } catch (err) {
        // Fallback
      }
    };

    drawPolyline(fallbackWaypoints);

    // Dynamic OSRM driving curve geometry
    let isCancelled = false;
    const fetchOSRMGeometry = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) return;
        const data = await res.json();

        if (!isCancelled && data.routes && data.routes[0]?.geometry?.coordinates?.length > 0) {
          const osrmPoints = data.routes[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);
          group.clearLayers();
          startMarker.addTo(group);
          destMarker.addTo(group);
          drawPolyline(osrmPoints);
        }
      } catch (e) {
        // Fallback remains active
      }
    };

    fetchOSRMGeometry();

    return () => {
      isCancelled = true;
    };
  }, [startCity, destCity, mapLoaded]);

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] lg:h-[620px] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-950 flex flex-col">
      
      {/* Map DOM Container - Pure Sri Lankan Google Map (NO iframe, NO "More options" white bar!) */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full z-10" 
        style={{ minHeight: '100%' }}
      />

      {/* Floating Top Controls (Minimal, clean, no clutter) */}
      <div className="absolute top-3 left-14 right-3 z-20 flex items-center justify-between pointer-events-none">
        
        {/* Route Title Badge */}
        <div className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-slate-200/80 dark:border-slate-700/80 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[170px] sm:max-w-xs">
            {getTrilingualCity(startCity)} ⇄ {getTrilingualCity(destCity)}
          </span>
          <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 px-2 py-0.5 rounded-full border border-cyan-200/50 dark:border-cyan-800/40 hidden sm:inline-block">
            Google Map
          </span>
        </div>

        {/* Action Controls: Layer Switch & External App Link */}
        <div className="pointer-events-auto flex items-center space-x-2">
          <button
            type="button"
            onClick={toggleMapLayer}
            className="bg-white/95 dark:bg-slate-900/95 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-white px-2.5 py-1.5 rounded-full shadow-lg border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-extrabold flex items-center space-x-1 transition-all cursor-pointer"
            title="Toggle Google Satellite / Map View"
          >
            <Layers className="w-3.5 h-3.5 text-primary-500" />
            <span className="capitalize">{mapLayerType === 'roadmap' ? 'Satellite' : 'Roadmap'}</span>
          </button>

          <a
            href={externalMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-full shadow-lg text-xs font-extrabold flex items-center space-x-1.5 transition-all cursor-pointer"
            title="Open in Google Maps App"
          >
            <span className="text-[11px]">App</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Mobile Modal Close Button */}
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-white shadow-lg border border-slate-200 dark:border-slate-700 transition-transform active:scale-95 cursor-pointer"
              title="Close Map"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
