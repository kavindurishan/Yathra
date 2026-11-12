import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getTrilingualCity } from '../services/cityTranslations';
import { 
  X, Compass, MapPin, Clock, Phone, MessageSquare, 
  RefreshCcw, AlertTriangle, CheckCircle, Navigation, Bus
} from 'lucide-react';

export default function LiveBusTrackerModal({ bookingId, onClose }) {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [mapViewMode, setMapViewMode] = useState('busLocation'); // 'busLocation' | 'routePath' | 'inspectStop'
  const [inspectedStop, setInspectedStop] = useState(null);

  useEffect(() => {
    loadTracking();
    const interval = setInterval(() => {
      loadTracking();
    }, 15000); // 15s auto-refresh for live GPS telemetry
    return () => clearInterval(interval);
  }, [bookingId]);

  const loadTracking = async () => {
    if (!trackingData) setLoading(true);
    else setRefreshing(true);
    setError('');

    try {
      const data = await api.bookings.track(bookingId);
      if (data.success) {
        setTrackingData(data);
      } else {
        setError(data.message || 'Tracking details unavailable.');
      }
    } catch (err) {
      setError(err.message || 'Could not fetch live bus location.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getCleanPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 border border-primary-500/40 flex items-center justify-center text-primary-400">
              <Bus className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-lg tracking-tight">Live Bus Tracker</h3>
                <span className="text-[10px] bg-primary-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Real-Time
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-semibold">
                {trackingData ? `${trackingData.busName} (${trackingData.busNumber})` : 'Tracking Vehicle GPS'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadTracking}
              disabled={refreshing}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
              title="Refresh Live Location"
            >
              <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">Contacting transit GPS satellite...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-50 dark:bg-rose-950/20 text-accent-rose text-sm font-semibold rounded-2xl border border-rose-200">
              {error}
            </div>
          ) : trackingData ? (
            <>
              {/* Progress & Live Status Banner */}
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                      Live Transit Status
                    </span>
                    <h4 className="font-black text-base text-slate-900 dark:text-white">
                      {trackingData.status}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 block">Route Progress</span>
                    <span className="text-sm font-black text-primary-600 dark:text-primary-400 font-mono">
                      {trackingData.progressPercent}% Completed
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${trackingData.progressPercent}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400 pt-1">
                  <span>Current Stop: <strong className="text-slate-850 dark:text-white">{trackingData.currentStop}</strong></span>
                  {trackingData.nextStop && (
                    <span>Next Stop: <strong className="text-primary-600 dark:text-primary-400">{trackingData.nextStop}</strong></span>
                  )}
                </div>
              </div>

              {/* RED TRAFFIC DISCLAIMER: EXACT REQUIREMENT FROM USER */}
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-900/50 rounded-2xl flex items-start space-x-2.5 text-rose-600 dark:text-rose-400 shadow-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <div className="text-xs leading-relaxed">
                  <p className="font-extrabold text-rose-700 dark:text-rose-300">
                    * මාර්ගයේ රථවාහන තදබදය (Traffic) හෝ අනපේක්ෂිත කාලගුණ තත්ත්වයන් මත මෙම වේලාවන් වෙනස් විය හැක.
                  </p>
                  <p className="text-[11px] font-semibold opacity-90 mt-0.5">
                    (Times may vary depending on road traffic conditions. Contact conductor for exact live location.)
                  </p>
                </div>
              </div>

              {/* LIVE SATELLITE GPS BUS LOCATION MAP */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Navigation className="w-4 h-4 text-primary-500" />
                      <span>Live GPS Vehicle Tracking Map</span>
                    </span>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                      Live Telemetry
                    </span>
                  </div>

                  {/* Map View Mode Tabs */}
                  <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setInspectedStop(null);
                        setMapViewMode('busLocation');
                      }}
                      className={`px-3 py-1 rounded-lg transition-all text-[11px] flex items-center space-x-1 ${
                        mapViewMode === 'busLocation' && !inspectedStop
                          ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm font-black'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Bus Spot / ස්ථානය</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInspectedStop(null);
                        setMapViewMode('routePath');
                      }}
                      className={`px-3 py-1 rounded-lg transition-all text-[11px] flex items-center space-x-1 ${
                        mapViewMode === 'routePath' && !inspectedStop
                          ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm font-black'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Route Path / මාර්ගය</span>
                    </button>
                    {inspectedStop && (
                      <span className="px-2.5 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-[10px] font-black">
                        Halt: {inspectedStop}
                      </span>
                    )}
                  </div>
                </div>

                {/* Google Map Embedded Frame */}
                <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-lg h-64 sm:h-80 w-full bg-slate-950">
                  <iframe
                    title={`Live Bus Location: ${trackingData.currentStop || trackingData.startingLocation}`}
                    src={
                      inspectedStop
                        ? `https://maps.google.com/maps?q=${encodeURIComponent(inspectedStop + ' Bus Stand Sri Lanka')}&t=m&z=15&output=embed`
                        : mapViewMode === 'busLocation'
                        ? `https://maps.google.com/maps?q=${encodeURIComponent((trackingData.currentStop || trackingData.startingLocation) + ', Sri Lanka')}&t=m&z=14&output=embed`
                        : `https://maps.google.com/maps?saddr=${encodeURIComponent((trackingData.currentStop || trackingData.startingLocation) + ', Sri Lanka')}&daddr=${
                            (trackingData.stops || [])
                              .filter(s => !s.passed && !s.isCurrent)
                              .slice(0, 4)
                              .map(s => `to:${encodeURIComponent(s.name + ', Sri Lanka')}`)
                              .join('+') 
                              ? `${(trackingData.stops || []).filter(s => !s.passed && !s.isCurrent).slice(0, 4).map(s => `to:${encodeURIComponent(s.name + ', Sri Lanka')}`).join('+')}+to:${encodeURIComponent(trackingData.destination + ', Sri Lanka')}`
                              : encodeURIComponent(trackingData.destination + ', Sri Lanka')
                          }&output=embed`
                    }
                    className="w-full h-full border-0 filter brightness-[0.92] contrast-[1.05]"
                    loading="lazy"
                    allowFullScreen=""
                  />

                  {/* Top-Right Controls */}
                  <div className="absolute top-3 right-3 z-10 flex items-center space-x-2">
                    {inspectedStop && (
                      <button
                        type="button"
                        onClick={() => setInspectedStop(null)}
                        className="px-2.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] backdrop-blur-md shadow-md flex items-center space-x-1"
                      >
                        <RefreshCcw className="w-3 h-3" />
                        <span>Back to Bus</span>
                      </button>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent((trackingData.currentStop || trackingData.startingLocation) + ', Sri Lanka')}&destination=${encodeURIComponent(trackingData.destination + ', Sri Lanka')}&travelmode=driving`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white font-bold text-[10px] backdrop-blur-md shadow-md flex items-center space-x-1.5 hover:scale-105 transition-all"
                    >
                      <Compass className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="hidden sm:inline">Open Navigation</span>
                    </a>
                  </div>

                  {/* Bottom Map HUD Status Bar */}
                  <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 border border-slate-700/90 rounded-xl p-3 text-xs backdrop-blur-md shadow-xl flex items-center justify-between text-white">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary-500/20 border border-primary-500/40 flex items-center justify-center text-primary-400 shrink-0">
                        <Bus className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-xs text-white">{trackingData.busNumber}</span>
                          <span className="text-[10px] text-cyan-300 font-semibold truncate max-w-[140px] sm:max-w-none">
                            {trackingData.busName}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 font-medium">
                          📍 Current: <strong className="text-white font-bold">{getTrilingualCity(trackingData.currentStop)}</strong>
                          {trackingData.nextStop && (
                            <span className="text-cyan-300 ml-2">➔ Next: <strong>{getTrilingualCity(trackingData.nextStop)}</strong></span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[8px] font-extrabold text-slate-400 uppercase block tracking-wider">GPS Ping</span>
                      <span className="text-[11px] font-mono font-black text-emerald-400">
                        {trackingData.lastUpdated || 'Live'}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-between px-1">
                  <span>🛰️ බස් රථයේ සජීවී GPS පිහිටීම තත්පර 15 කට වරක් ස්වයංක්‍රීයව යාවත්කාලීන වේ.</span>
                  <span className="font-mono text-[10px] text-primary-600 dark:text-primary-400 font-bold">Auto-sync active</span>
                </p>
              </div>

              {/* Conductor & Driver Card */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">
                    Conductor & Crew In-Charge
                  </span>
                  <p className="font-black text-sm text-slate-850 dark:text-white">
                    {trackingData.conductorName} <span className="text-slate-400 font-normal">({trackingData.conductorPhone})</span>
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500">
                    Driver: {trackingData.driverName} &bull; Plate: {trackingData.busNumber}
                  </p>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <a
                    href={`tel:${getCleanPhone(trackingData.conductorPhone)}`}
                    className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/10 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`https://wa.me/${getCleanPhone(trackingData.conductorPhone)}?text=Hello%20Conductor,%20I%20am%20a%20passenger%20on%20Yathra%20Booking%20${bookingId}.%20Where%20is%20the%20bus%20now?`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/10 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Stop by Stop Roadmap */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Route Stops & Arrival Estimates
                </span>

                <div className="space-y-2 border-l-2 border-slate-200 dark:border-slate-800 ml-3 pl-4">
                  {trackingData.stops.map((stop, sIdx) => {
                    const isPassed = stop.passed;
                    const isCurrent = stop.isCurrent;

                    return (
                      <div 
                        key={sIdx} 
                        onClick={() => setInspectedStop(inspectedStop === stop.name ? null : stop.name)}
                        className={`relative flex items-center justify-between py-2 px-2.5 -ml-2.5 rounded-xl cursor-pointer transition-colors ${
                          inspectedStop === stop.name 
                            ? 'bg-primary-50 dark:bg-primary-950/40 ring-1 ring-primary-500/50' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/40'
                        }`}
                        title="Click to pinpoint this stop on Google Map"
                      >
                        {/* Dot indicator */}
                        <div className={`absolute -left-[14px] w-3.5 h-3.5 rounded-full border-2 ${
                          isCurrent 
                            ? 'bg-primary-500 border-white ring-4 ring-primary-500/30' 
                            : isPassed 
                            ? 'bg-emerald-500 border-white dark:border-slate-900' 
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'
                        }`} />

                        <div className="space-y-0.5">
                          <p className={`text-xs font-bold ${
                            isCurrent 
                              ? 'text-primary-600 dark:text-primary-400 font-black' 
                              : isPassed 
                              ? 'text-slate-500 dark:text-slate-400 line-through' 
                              : 'text-slate-850 dark:text-white'
                          }`}>
                            {getTrilingualCity(stop.name)}
                            {isCurrent && (
                              <span className="ml-2 text-[10px] bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded font-black inline-block">
                                Current Location
                              </span>
                            )}
                            {inspectedStop === stop.name && (
                              <span className="ml-2 text-[10px] bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded font-black inline-block">
                                Map Focused
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="text-right flex items-center space-x-2">
                          <span className={`text-[11px] font-mono font-bold ${
                            isCurrent ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            {stop.time}
                          </span>
                          <span className="text-[10px] text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                            View ➔
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
