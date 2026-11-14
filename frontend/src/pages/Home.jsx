import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { getTrilingualCity } from '../services/cityTranslations';
import { 
  Search, Calendar, MapPin, Shield, Compass, Clock, Award, Users, Bus, 
  ArrowRightLeft, Sparkles, Navigation, CheckCircle2, ChevronRight, Zap
} from 'lucide-react';
import heroBusImage from '../assets/hero_bus.jpg';

export default function Home() {
  const navigate = useNavigate();
  const bookingSectionRef = useRef(null);
  
  const [fromList, setFromList] = useState([]);
  const [toList, setToList] = useState([]);
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [departureDate, setDepartureDate] = useState('');

  useEffect(() => {
    loadRouteOptions();
  }, []);

  const loadRouteOptions = async () => {
    try {
      const data = await api.routes.getAll();
      if (data.success && data.routes && data.routes.length > 0) {
        const starts = [...new Set(data.routes.map(r => r.startingLocation))];
        const dests = [...new Set(data.routes.map(r => r.destination))];
        setFromList(starts);
        setToList(dests);
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
  };

  // Swap Origin and Destination
  const handleSwapStations = () => {
    const temp = fromInput;
    setFromInput(toInput);
    setToInput(temp);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!fromInput || !toInput || !departureDate) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    navigate(`/schedules?from=${encodeURIComponent(fromInput)}&to=${encodeURIComponent(toInput)}&date=${departureDate}`);
  };

  const scrollToBooking = () => {
    if (bookingSectionRef.current) {
      bookingSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Get current date formatted for min date attribute
  const todayStr = new Date().toISOString().split('T')[0];

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
          
          {/* Booking Section Topic Header (Centered in the middle) */}
          <div className="text-center mb-8 pb-4 border-b border-slate-800/80 max-w-xl mx-auto space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <span>Select Your Journey</span>
              <span className="text-xs font-bold text-cyan-400 bg-cyan-950/70 px-2.5 py-0.5 rounded-full border border-cyan-800/50">
                Direct Line
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              ඔබගේ ආරම්භක ස්ථානය සහ ගමනාන්තය තෝරා පහසුවෙන්ම ආසන වෙන්කරගන්න
            </p>
          </div>

          {/* Booking Inputs Form */}
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            
            {/* Origin Input (Light color in both Light & Dark mode) */}
            <div className="md:col-span-4 space-y-1.5 bg-white p-3 rounded-2xl border border-slate-200 focus-within:border-cyan-500 hover:border-slate-300 transition-colors shadow-md">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <span className="text-cyan-600 mr-1">📍</span>
                <span>Leaving From</span>
                <span className="text-slate-500 text-[10px] ml-1 font-medium">(පිටත්වන ස්ථානය / புறப்படும் இடம்)</span>
              </label>
              <select
                required
                value={fromInput}
                onChange={(e) => setFromInput(e.target.value)}
                className={`w-full bg-transparent font-bold text-sm focus:outline-none cursor-pointer py-1 ${
                  fromInput ? 'text-slate-900' : 'text-slate-500 font-normal'
                }`}
              >
                <option value="" disabled className="bg-white text-slate-500">
                  Select Departure City (පිටත්වන නගරය තෝරන්න)
                </option>
                {fromList.map(city => (
                  <option key={city} value={city} className="bg-white text-slate-900 font-semibold">
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

            {/* Destination Input (Light color in both Light & Dark mode) */}
            <div className="md:col-span-4 space-y-1.5 bg-white p-3 rounded-2xl border border-slate-200 focus-within:border-cyan-500 hover:border-slate-300 transition-colors shadow-md">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <span className="text-indigo-600 mr-1">🏁</span>
                <span>Going To</span>
                <span className="text-slate-500 text-[10px] ml-1 font-medium">(ගමනාන්තය / சேருமிடம்)</span>
              </label>
              <select
                required
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                className={`w-full bg-transparent font-bold text-sm focus:outline-none cursor-pointer py-1 ${
                  toInput ? 'text-slate-900' : 'text-slate-500 font-normal'
                }`}
              >
                <option value="" disabled className="bg-white text-slate-500">
                  Select Destination (ගමනාන්තය තෝරන්න)
                </option>
                {toList.map(city => (
                  <option key={city} value={city} className="bg-white text-slate-900 font-semibold">
                    {getTrilingualCity(city)}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Input (Light color in both Light & Dark mode) */}
            <div className="md:col-span-3 space-y-1.5 bg-white p-3 rounded-2xl border border-slate-200 focus-within:border-cyan-500 hover:border-slate-300 transition-colors shadow-md">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <span className="text-emerald-600 mr-1">📅</span>
                <span>Travel Date</span>
                <span className="text-slate-500 text-[10px] ml-1 font-medium">(ගමන් දිනය / பயண தேதி)</span>
              </label>
              <input
                type="date"
                required
                min={todayStr}
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full bg-transparent text-slate-900 font-bold text-sm focus:outline-none py-1 [color-scheme:light]"
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
