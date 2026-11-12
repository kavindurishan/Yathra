import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { getTrilingualCity } from '../services/cityTranslations';
import { 
  Search, Calendar, MapPin, Shield, Compass, Clock, Award, Users, Bus, 
  ArrowRightLeft, Sparkles, Navigation, CheckCircle2, ChevronRight, Zap
} from 'lucide-react';
import heroBusImage from '../assets/hero_bus.jpg';
import SriLankaRouteMapExplorer from '../components/SriLankaRouteMapExplorer';

export default function Home() {
  const navigate = useNavigate();
  const bookingSectionRef = useRef(null);
  
  const [fromList, setFromList] = useState([]);
  const [toList, setToList] = useState([]);
  const [fromInput, setFromInput] = useState('Makumbura');
  const [toInput, setToInput] = useState('Galle');
  const [departureDate, setDepartureDate] = useState('');
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    loadRouteOptions();
    loadOffers();
  }, []);

  const loadRouteOptions = async () => {
    try {
      const data = await api.routes.getAll();
      if (data.success && data.routes && data.routes.length > 0) {
        const starts = [...new Set(data.routes.map(r => r.startingLocation))];
        const dests = [...new Set(data.routes.map(r => r.destination))];
        setFromList(starts);
        setToList(dests);
        
        if (starts.length > 0) setFromInput(starts[0]);
        if (dests.length > 0) setToInput(dests[0]);
      } else {
        setOfflineRoutes();
      }
    } catch (err) {
      console.warn('Failed to load route options, using verified defaults');
      setOfflineRoutes();
    }
  };

  const setOfflineRoutes = () => {
    const defaultStarts = ['Makumbura', 'Colombo Fort', 'Kadawatha', 'Kandy', 'Panadura', 'Kaduwela', 'Galle'];
    const defaultDests = ['Galle', 'Matara', 'Kandy', 'Badulla', 'Jaffna', 'Anuradhapura', 'Kurunegala', 'Nuwara Eliya', 'Colombo Fort'];
    setFromList(defaultStarts);
    setToList(defaultDests);
    setFromInput('Makumbura');
    setToInput('Galle');
  };

  const loadOffers = async () => {
    try {
      const data = await api.offers.getAll();
      if (data.success && data.offers) {
        setOffers(data.offers.slice(0, 3));
      }
    } catch (err) {
      setOffers([
        { code: 'YATHRA10', value: 10, discountType: 'Percentage', minBookingValue: 10 },
        { code: 'WELCOME50', value: 5, discountType: 'Fixed', minBookingValue: 20 }
      ]);
    }
  };

  // Swap Origin and Destination
  const handleSwapStations = () => {
    const temp = fromInput;
    setFromInput(toInput);
    setToInput(temp);
  };

  // Quick Expressway Route preset selection
  const handleQuickRoute = (from, to) => {
    setFromInput(from);
    setToInput(to);
    if (!departureDate) {
      setDepartureDate(todayStr);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!fromInput || !toInput || !departureDate) return;
    navigate(`/schedules?from=${encodeURIComponent(fromInput)}&to=${encodeURIComponent(toInput)}&date=${departureDate}`);
  };

  const scrollToBooking = () => {
    if (bookingSectionRef.current) {
      bookingSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Get current date formatted for min date attribute
  const todayStr = new Date().toISOString().split('T')[0];

  // Dynamic route statistics helper for Sri Lankan corridors
  const getRouteDetails = (from, to) => {
    const f = (from || '').toLowerCase();
    const t = (to || '').toLowerCase();

    if ((f.includes('galle') && (t.includes('colombo') || t.includes('makumbura') || t.includes('kottawa'))) ||
        ((f.includes('colombo') || f.includes('makumbura') || f.includes('kottawa')) && t.includes('galle'))) {
      return { distance: '118 km', duration: '1h 20m', highway: 'E01 Southern Expressway', corridor: 'Southern Highway Corridor' };
    }
    if ((f.includes('matara') && (t.includes('colombo') || t.includes('makumbura'))) ||
        ((f.includes('colombo') || f.includes('makumbura')) && t.includes('matara'))) {
      return { distance: '158 km', duration: '1h 50m', highway: 'E01 Southern Expressway', corridor: 'Southern Coastal Route' };
    }
    if ((f.includes('kandy') && (t.includes('colombo') || t.includes('kadawatha'))) ||
        ((f.includes('colombo') || f.includes('kadawatha')) && t.includes('kandy'))) {
      return { distance: '115 km', duration: '2h 15m', highway: 'E04 Central Expressway & A1', corridor: 'Central Hill Corridor' };
    }
    if (f.includes('jaffna') || t.includes('jaffna')) {
      return { distance: '395 km', duration: '6h 30m', highway: 'A9 / E04 Express', corridor: 'Northern Direct Line' };
    }
    if (f.includes('badulla') || t.includes('badulla')) {
      return { distance: '218 km', duration: '5h 10m', highway: 'Highland Mountain Route', corridor: 'Uva Province Corridor' };
    }
    return { distance: '~120 km', duration: '1h 45m', highway: 'National Transit Corridor', corridor: 'Intercity Express Corridor' };
  };

  const routeInfo = getRouteDetails(fromInput, toInput);

  // Sri Lankan Google Maps Directions URL dynamically plotting the exact driven transit route
  const mapOrigin = encodeURIComponent(`${fromInput || 'Colombo Fort'}, Sri Lanka`);
  const mapDestination = encodeURIComponent(`${toInput || 'Galle'}, Sri Lanka`);
  const googleMapEmbedUrl = `https://maps.google.com/maps?saddr=${mapOrigin}&daddr=${mapDestination}&output=embed`;
  const externalGoogleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${mapOrigin}&destination=${mapDestination}&travelmode=transit`;

  return (
    <div className="space-y-16 pb-20 select-none">
      
      {/* ============================================================== */}
      {/* HERO SECTION: High Quality Bus Image + Clean Modern Lighting   */}
      {/* ============================================================== */}
      <section 
        className="relative min-h-[640px] sm:min-h-[720px] bg-slate-950 flex flex-col justify-center items-center overflow-hidden py-16 sm:py-24 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBusImage})` }}
      >
        {/* Balanced modern gradient overlays: Preserves the authentic photo details while maintaining razor-sharp contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/80" />
        <div className="absolute inset-0 bg-radial-at-c from-cyan-500/10 via-transparent to-slate-950/90 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center z-10 w-full text-center space-y-8">
          
          {/* Top Tagline Badge (English with Sinhala subtext) */}
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-400/30 backdrop-blur-md shadow-lg shadow-cyan-500/10 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-cyan-300 tracking-wider uppercase">
              Next-Gen Expressway Transit
            </span>
            <span className="text-[11px] text-slate-400 font-semibold border-l border-slate-700 pl-2">
              අධිවේගී මගී ප්‍රවාහන ජාලය
            </span>
          </div>

          {/* Primary Headline (Mainly English with elegant Sinhala subtitle) */}
          <div className="space-y-3 max-w-4xl animate-fade-in">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-tight uppercase font-sans">
              Ride In Comfort <br className="hidden sm:inline" />
              Across <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">Sri Lanka</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-300 font-medium max-w-2xl mx-auto drop-shadow-md">
              Effortless expressway & intercity coach bookings with confirmed seats and real-time GPS tracking.
            </p>
            <p className="text-xs sm:text-sm text-cyan-400/90 font-semibold tracking-wide">
              දිවයින පුරා සුවපහසු හා ආරක්ෂිත ගමනාන්තයකට පහසුවෙන්ම යාත්‍රා කරන්න
            </p>
          </div>

          {/* Direct CTA Buttons: 'Book Seats Online / මෙතනින් Bookings දාන්න' */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              onClick={scrollToBooking}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-base shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] transition-all transform flex flex-col items-center justify-center leading-tight cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span>Book Seats Online</span>
                <span className="text-lg">→</span>
              </span>
              <span className="text-[11px] text-cyan-100 font-normal opacity-90 mt-0.5">
                මෙතනින් Bookings දාන්න
              </span>
            </button>

            <a
              href="#route-map-section"
              className="px-6 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white font-bold text-sm backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span>Explore Live Map (සිතියම)</span>
            </a>
          </div>

          {/* Feature Trust Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl pt-4 text-left">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-md flex items-center space-x-3">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 text-lg">⚡</span>
              <div>
                <span className="text-white font-bold text-xs block">Instant E-Ticket</span>
                <span className="text-slate-400 text-[11px]">ක්ෂණික SMS සහ QR Ticket</span>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-md flex items-center space-x-3">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-lg">🛰️</span>
              <div>
                <span className="text-white font-bold text-xs block">Live GPS Fleet</span>
                <span className="text-slate-400 text-[11px]">සජීවී බස් ධාවන සිතියම</span>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-md flex items-center space-x-3">
              <span className="p-2 rounded-xl bg-pink-500/10 text-pink-400 text-lg">👩</span>
              <div>
                <span className="text-white font-bold text-xs block">Female Safe Seats</span>
                <span className="text-slate-400 text-[11px]">කාන්තා වෙන්කළ ආසන</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* MAIN UNIFIED BOOKING DOCK & LIVE SEARCH ENGINE                 */}
      {/* ============================================================== */}
      <section ref={bookingSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="w-full bg-slate-900/95 dark:bg-slate-950/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Select Your Journey</span>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded-full border border-cyan-800/50">
                  Direct Line
                </span>
              </h2>
              <p className="text-xs text-slate-400">ඔබගේ ආරම්භක ස්ථානය සහ ගමනාන්තය තෝරා පහසුවෙන්ම ආසන වෙන්කරගන්න</p>
            </div>

            {/* Popular Highway Quick Route Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mr-1">Fast Lanes:</span>
              <button 
                type="button"
                onClick={() => handleQuickRoute('Colombo', 'Kandy')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950/80 border border-slate-700 hover:border-cyan-500 text-xs font-semibold text-slate-300 hover:text-cyan-300 transition-all"
              >
                Colombo ⇄ Kandy (01)
              </button>
              <button 
                type="button"
                onClick={() => handleQuickRoute('Panadura', 'Kandy')}
                className="px-2.5 py-1 rounded-lg bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/80 text-xs font-extrabold text-cyan-300 transition-all shadow-sm"
              >
                Panadura ⇄ Kandy (17)
              </button>
              <button 
                type="button"
                onClick={() => handleQuickRoute('Makumbura', 'Galle')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950/80 border border-slate-700 hover:border-cyan-500 text-xs font-semibold text-slate-300 hover:text-cyan-300 transition-all"
              >
                MMC ⇄ Galle (E01)
              </button>
              <button 
                type="button"
                onClick={() => handleQuickRoute('Kadawatha', 'Kandy')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950/80 border border-slate-700 hover:border-cyan-500 text-xs font-semibold text-slate-300 hover:text-cyan-300 transition-all"
              >
                Kadawatha ⇄ Kandy (E04)
              </button>
              <button 
                type="button"
                onClick={() => handleQuickRoute('Colombo Fort', 'Matara')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950/80 border border-slate-700 hover:border-cyan-500 text-xs font-semibold text-slate-300 hover:text-cyan-300 transition-all"
              >
                Colombo ⇄ Matara
              </button>
            </div>
          </div>

          {/* Booking Inputs Form */}
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            
            {/* Origin Input */}
            <div className="md:col-span-4 space-y-1.5 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 focus-within:border-cyan-500 transition-colors">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="text-cyan-400 mr-1">📍</span>
                <span>Leaving From</span>
                <span className="text-slate-400 text-[10px] ml-1 font-medium">(පිටත්වන ස්ථානය / புறப்படும் இடம்)</span>
              </label>
              <select
                value={fromInput}
                onChange={(e) => setFromInput(e.target.value)}
                className="w-full bg-transparent text-slate-100 font-bold text-sm focus:outline-none cursor-pointer py-1"
              >
                {fromList.map(city => (
                  <option key={city} value={city} className="bg-slate-900 text-white font-semibold">
                    {getTrilingualCity(city)}
                  </option>
                ))}
              </select>
            </div>

            {/* Station Swap Button */}
            <div className="md:col-span-1 flex justify-center py-2 md:py-0">
              <button
                type="button"
                onClick={handleSwapStations}
                title="Swap Leaving & Going To (ස්ථාන මාරු කරන්න / இடங்களை மாற்றுக)"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-cyan-600 border border-slate-700 hover:border-cyan-400 text-white flex items-center justify-center transition-all shadow-md group cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4 text-cyan-300 group-hover:rotate-180 transition-transform duration-300" />
              </button>
            </div>

            {/* Destination Input */}
            <div className="md:col-span-4 space-y-1.5 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 focus-within:border-cyan-500 transition-colors">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="text-indigo-400 mr-1">🏁</span>
                <span>Going To</span>
                <span className="text-slate-400 text-[10px] ml-1 font-medium">(ගමනාන්තය / சேருமிடம்)</span>
              </label>
              <select
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                className="w-full bg-transparent text-slate-100 font-bold text-sm focus:outline-none cursor-pointer py-1"
              >
                {toList.map(city => (
                  <option key={city} value={city} className="bg-slate-900 text-white font-semibold">
                    {getTrilingualCity(city)}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Input */}
            <div className="md:col-span-3 space-y-1.5 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 focus-within:border-cyan-500 transition-colors">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="text-emerald-400 mr-1">📅</span>
                <span>Travel Date</span>
                <span className="text-slate-400 text-[10px] ml-1 font-medium">(ගමන් දිනය / பயண தேதி)</span>
              </label>
              <input
                type="date"
                required
                min={todayStr}
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full bg-transparent text-slate-100 font-bold text-sm focus:outline-none py-1 [color-scheme:dark]"
              />
            </div>

            {/* Submit Action Button */}
            <div className="md:col-span-12 pt-2">
              <button
                type="submit"
                className="w-full py-4 rounded-2xl font-black text-white bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex flex-col items-center justify-center leading-tight cursor-pointer"
              >
                <span className="flex items-center gap-2 text-base">
                  <Search className="w-5 h-5" />
                  <span>Search Available Buses</span>
                  <span>→</span>
                </span>
                <span className="text-[11px] text-cyan-100 font-medium opacity-90 mt-0.5">
                  ලබාගත හැකි බස් රථ සොයන්න • பேருந்துகளைத் தேடுக
                </span>
              </button>
            </div>

          </form>

        </div>
      </section>

      {/* ============================================================== */}
      {/* SRI LANKAN BUS ROUTES & GOOGLE MAPS TRANSIT EXPLORER           */}
      {/* ============================================================== */}
      <section id="route-map-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <SriLankaRouteMapExplorer 
          initialRouteId="colombo-kandy"
          onSelectRouteForBooking={(f, t) => {
            setFromInput(f);
            setToInput(t);
            scrollToBooking();
          }}
        />
      </section>

      {/* ============================================================== */}
      {/* PROMOS & EXCLUSIVE VOUCHERS                                    */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-baseline mb-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Exclusive Yathra Promos
            </h3>
            <span className="text-xs text-slate-400">විශේෂ වට්ටම් සහ දීමනා කේත</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map(offer => (
            <div 
              key={offer.code} 
              className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl flex justify-between items-center relative overflow-hidden shadow-lg"
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-cyan-500/10 blur-xl pointer-events-none" />
              <div className="space-y-1.5 z-10">
                <span className="text-[10px] font-bold tracking-wider text-cyan-400 uppercase">
                  Discount Voucher • වට්ටම් කූපන්
                </span>
                <h4 className="font-extrabold text-lg text-white">
                  Save {offer.discountType === 'Percentage' ? `${offer.value}%` : `$${offer.value}`} on your next trip!
                </h4>
                <p className="text-xs text-slate-400 font-semibold">
                  Valid for bookings above ${offer.minBookingValue}
                </p>
              </div>
              <div className="flex flex-col items-center bg-slate-900 border border-slate-700 rounded-2xl p-3 border-dashed z-10">
                <span className="text-[9px] uppercase font-bold text-slate-400 mb-0.5">Use Code</span>
                <span className="font-extrabold text-sm tracking-wider text-cyan-400">{offer.code}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* TRUST BADGES & GUARANTEES                                      */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl shadow-sm">
            <div className="w-12 h-12 bg-primary-50 dark:bg-cyan-950/40 text-cyan-400 rounded-2xl flex items-center justify-center mb-4 shadow-md shadow-cyan-500/10">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white mb-1">100% Secured Payments</h4>
            <span className="text-[11px] text-slate-400 font-semibold block mb-2">ආරක්ෂිත ඩිජිටල් ගෙවීම්</span>
            <p className="text-xs text-slate-500">Bank-grade encrypted gateway for all major Visa, Mastercard, and LankaQR transactions.</p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-400 rounded-2xl flex items-center justify-center mb-4 shadow-md shadow-emerald-500/10">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white mb-1">On-Time Expressway Fleet</h4>
            <span className="text-[11px] text-slate-400 font-semibold block mb-2">නියමිත වේලාවට පිටත්වීම</span>
            <p className="text-xs text-slate-500">Dedicated expressway time tables monitored closely to eliminate terminal waiting.</p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-400 rounded-2xl flex items-center justify-center mb-4 shadow-md shadow-indigo-500/10">
              <Bus className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white mb-1">Verified Bus Quality</h4>
            <span className="text-[11px] text-slate-400 font-semibold block mb-2">තහවුරු කළ සුඛෝපභෝගී පහසුකම්</span>
            <p className="text-xs text-slate-500">Equipped with luxury reclining seats, TV entertainment, Wi-Fi and phone charging docks.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
