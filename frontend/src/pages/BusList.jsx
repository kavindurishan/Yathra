import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { getTrilingualCity } from '../services/cityTranslations';
import RouteGoogleMapPanel from '../components/RouteGoogleMapPanel';
import { 
  Wifi, BatteryCharging, Tv, ShieldAlert, 
  Clock, ArrowRight, ChevronDown, ChevronUp, AlertTriangle,
  Navigation, MapPin, Compass
} from 'lucide-react';

export default function BusList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';

  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [mobileMapOpen, setMobileMapOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedStopsId, setExpandedStopsId] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    loadSchedules();
  }, [from, to, date]);

  const loadSchedules = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.schedules.getAll(from, to, date);
      if (data.success) {
        setSchedules(data.schedules);
        if (data.schedules && data.schedules.length > 0) {
          setSelectedSchedule(data.schedules[0]);
        }
      }
    } catch (err) {
      setError('Could not retrieve schedules. Please ensure the backend is running.');
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  const getFacilityIcon = (facility) => {
    if (facility === 'Wi-Fi') return <Wifi className="w-3.5 h-3.5" title="Wi-Fi" />;
    if (facility === 'Charging') return <BatteryCharging className="w-3.5 h-3.5" title="Charging Docks" />;
    if (facility === 'TV') return <Tv className="w-3.5 h-3.5" title="TV Screens" />;
    return null;
  };

  const calculateStopTime = (baseTime, timeOffset) => {
    if (!baseTime) return '--:--';
    if (!timeOffset) return baseTime;
    try {
      const matchH = timeOffset.match(/(\d+)\s*h/);
      const matchM = timeOffset.match(/(\d+)\s*m/);
      const addMinutes = (matchH ? parseInt(matchH[1]) * 60 : 0) + (matchM ? parseInt(matchM[1]) : 0);
      const [h, m] = baseTime.split(':').map(Number);
      const totalMinutes = h * 60 + m + addMinutes;
      const finalH = Math.floor(totalMinutes / 60) % 24;
      const finalM = totalMinutes % 60;
      return `${String(finalH).padStart(2, '0')}:${String(finalM).padStart(2, '0')}`;
    } catch (e) {
      return baseTime;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header Search Info Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Search Results</span>
          <div className="flex items-center space-x-2.5 mt-1 flex-wrap gap-y-1">
            <h2 className="font-extrabold text-xl sm:text-2xl text-slate-950 dark:text-white">{getTrilingualCity(from)}</h2>
            <ArrowRight className="w-5 h-5 text-primary-500 shrink-0" />
            <h2 className="font-extrabold text-xl sm:text-2xl text-slate-950 dark:text-white">{getTrilingualCity(to)}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-semibold">{date ? new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'All Dates'}</p>
        </div>
        <button 
          onClick={() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            navigate('/');
          }}
          className="px-4 py-2 rounded-lg text-xs font-bold text-primary-500 bg-primary-50 dark:bg-primary-950/20 hover:bg-primary-100/50 transition-colors border border-primary-100 dark:border-primary-900/30 cursor-pointer"
        >
          Modify Search
        </button>
      </div>

      {/* Main Split-Screen Grid Layout: Bus List (7 cols) + Google Map Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Bus Schedules List */}
        <div className="lg:col-span-7 space-y-4">
          {/* Available Buses Count */}
          {!loading && !error && schedules.length > 0 && (
            <div className="flex items-center justify-between px-1">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Available Buses <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">({schedules.length} found)</span>
              </p>
              <span className="text-[11px] font-semibold text-primary-500 hidden sm:inline-block">
                Select any bus to inspect its live Google Map route
              </span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-500">Searching active schedules...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/20 text-accent-rose text-sm font-semibold rounded-2xl border border-rose-200/50">
              {error}
            </div>
          ) : schedules.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
              <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">No schedules found</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1.5">
                We couldn't find any active schedules for the selected route and date.
              </p>
            </div>
          ) : (
            schedules.map(item => {
              const isSelected = (selectedSchedule?._id === item._id) || (!selectedSchedule && schedules[0]?._id === item._id);

              return (
                <div 
                  key={item._id} 
                  onClick={() => setSelectedSchedule(item)}
                  className={`bg-white dark:bg-slate-900 border ${
                    isSelected 
                      ? 'border-primary-500 ring-2 ring-primary-500/20 dark:ring-primary-400/20 shadow-md' 
                      : 'border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  } rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden cursor-pointer`}
                >
                  {/* Visual side-badge for luxury or active selection */}
                  {item.bus.type === 'Luxury' && (
                    <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-primary-500 to-accent-cyan" />
                  )}

                  {/* Bus and Service Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">{item.bus.name}</span>
                        <span className="text-[10px] font-bold text-primary-500 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded-md uppercase tracking-wider">{item.bus.type}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{item.bus.busNumber}</span>
                      </div>

                      {isSelected && (
                        <span className="hidden sm:inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                          <span>Active on Map</span>
                        </span>
                      )}
                    </div>

                    {/* Trip Itinerary Visual Timeline */}
                    <div className="flex items-center space-x-4">
                      <div className="shrink-0 text-center">
                        <span className="block font-extrabold text-base text-slate-800 dark:text-white leading-none">{item.departureTime}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 block max-w-[130px] truncate" title={getTrilingualCity(item.route?.startingLocation || from)}>
                          {getTrilingualCity(item.route?.startingLocation || from)}
                        </span>
                      </div>

                      <div className="flex-1 flex items-center space-x-2 group">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                        <div className="flex-1 h-0.5 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center relative">
                          <span className="absolute -top-3.5 text-[9px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-2 flex items-center space-x-1.5">
                            <Clock className="w-3 h-3 text-slate-350" />
                            <span>{item.route.duration}</span>
                          </span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                      </div>

                      <div className="shrink-0 text-center">
                        <span className="block font-extrabold text-base text-slate-800 dark:text-white leading-none">{item.arrivalTime}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 block max-w-[130px] truncate" title={getTrilingualCity(item.route?.destination || to)}>
                          {getTrilingualCity(item.route?.destination || to)}
                        </span>
                      </div>
                    </div>

                    {/* Stops Preview & Interactive Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] font-bold border-t border-slate-200/70 dark:border-slate-800/60">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <span className="text-slate-800 dark:text-slate-200 font-extrabold">Route via:</span>
                        {item.route.stops.slice(0, 2).map((stop, idx) => (
                          <span key={idx} className="bg-slate-200/90 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs">
                            {getTrilingualCity(stop.name)}
                          </span>
                        ))}
                        {item.route.stops.length > 2 && (
                          <span className="text-[10px] text-primary-600 dark:text-primary-400 font-black bg-primary-50 dark:bg-primary-950/40 border border-primary-200/50 dark:border-primary-800/40 px-1.5 py-0.5 rounded-md">
                            +{item.route.stops.length - 2} stops
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Interactive View on Map Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSchedule(item);
                            if (window.innerWidth < 1024) {
                              setMobileMapOpen(true);
                            }
                          }}
                          className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-primary-500 text-white border-primary-400 shadow-xs'
                              : 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border-primary-200/50 dark:border-primary-800/40 hover:bg-primary-100'
                          }`}
                          title="View this bus route on Google Map"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>{isSelected ? 'Mapped' : 'View on Map'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedStopsId(expandedStopsId === item._id ? null : item._id);
                          }}
                          className="text-primary-600 dark:text-primary-400 hover:underline flex items-center space-x-1 text-[11px] font-bold py-1 cursor-pointer"
                        >
                          <span>{expandedStopsId === item._id ? 'Hide' : 'Stops'}</span>
                          {expandedStopsId === item._id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Stops Timeline Drawer with Red Traffic Warning */}
                    {expandedStopsId === item._id && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-3 mt-2">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-850">
                          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                            Intermediate Expressway & City Stops (ඇස්තමේන්තුගත වේලාවන්)
                          </span>
                          <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400">
                            {item.route.stops.length + 2} Total Points
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/50 dark:border-slate-800">
                            <p className="font-extrabold text-slate-900 dark:text-white truncate" title={getTrilingualCity(item.route.startingLocation)}>
                              {getTrilingualCity(item.route.startingLocation)}
                            </p>
                            <p className="text-[10px] font-bold text-primary-600 dark:text-primary-400">{item.departureTime} (Departure)</p>
                          </div>
                          {item.route.stops.map((stop, sIdx) => {
                            const estTime = calculateStopTime(item.departureTime, stop.timeOffset);
                            return (
                              <div key={sIdx} className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/50 dark:border-slate-800">
                                <p className="font-bold text-slate-800 dark:text-slate-200 truncate" title={getTrilingualCity(stop.name)}>
                                  {getTrilingualCity(stop.name)}
                                </p>
                                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Est: {estTime}</p>
                              </div>
                            );
                          })}
                          <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/50 dark:border-slate-800">
                            <p className="font-extrabold text-slate-900 dark:text-white truncate" title={getTrilingualCity(item.route.destination)}>
                              {getTrilingualCity(item.route.destination)}
                            </p>
                            <p className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400">{item.arrivalTime} (Destination)</p>
                          </div>
                        </div>

                        {/* RED COLOR DISCLAIMER: EXACT REQUIREMENT FROM USER */}
                        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-900/50 rounded-lg flex items-start space-x-2 text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                          <p className="text-[11px] font-extrabold leading-tight">
                            * මාර්ගයේ රථවාහන තදබදය (Traffic) හෝ අනපේක්ෂිත හේතූන් මත මෙම වේලාවන් වෙනස් විය හැක. (Times may vary depending on road traffic conditions.)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Facilities List (Wi-Fi, AC etc.) & Fare */}
                  <div className="flex md:flex-col items-center md:items-start justify-between md:justify-center border-t border-slate-100 dark:border-slate-800/40 md:border-t-0 pt-3 md:pt-0 md:pl-5 md:border-l border-slate-200/50 md:min-w-[130px] gap-4">
                    <div className="flex space-x-1.5 text-slate-400">
                      {item.bus.facilities.map((fac, i) => (
                        <div key={i} className="p-1.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 flex items-center justify-center">
                          {getFacilityIcon(fac)}
                        </div>
                      ))}
                    </div>

                    <div className="flex md:flex-col items-end md:items-start justify-between w-full md:w-auto md:space-y-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ticket Fare</span>
                        <div className="flex items-baseline space-x-0.5">
                          <span className="font-extrabold text-2xl text-slate-800 dark:text-white leading-none">${item.ticketPrice}</span>
                          <span className="text-[10px] font-bold text-slate-400">/seat</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-right">
                        <span className="text-[10px] font-bold text-slate-500">
                          {item.availableSeats} Seats left
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                          navigate(`/schedules/${item._id}`);
                        }}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs tracking-wide shadow-md shadow-primary-500/10 hover:shadow-primary-500/25 hover:scale-[1.02] transition-all cursor-pointer"
                      >
                        Select Seats
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Google Maps Route Panel ("එතනින් එහා පැත්තේ" - Sticky on desktop) */}
        <div className="hidden lg:block lg:col-span-5 sticky top-24">
          <RouteGoogleMapPanel 
            activeSchedule={selectedSchedule || schedules[0]} 
            from={from} 
            to={to} 
          />
        </div>
      </div>

      {/* Floating Map Button on Mobile (< lg) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setMobileMapOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-black px-4 py-3 rounded-full shadow-2xl flex items-center space-x-2 border border-white/20 transition-all cursor-pointer"
        >
          <Navigation className="w-4 h-4 text-white animate-pulse" />
          <span className="text-xs">View Route Map</span>
        </button>
      </div>

      {/* Mobile Route Map Modal */}
      {mobileMapOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full sm:max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col">
            <RouteGoogleMapPanel
              activeSchedule={selectedSchedule || schedules[0]}
              from={from}
              to={to}
              onClose={() => setMobileMapOpen(false)}
              isModal={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
