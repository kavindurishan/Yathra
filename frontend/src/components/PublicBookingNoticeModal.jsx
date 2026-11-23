import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Clock, ArrowRight, ShieldCheck, X, Sparkles, Bus
} from 'lucide-react';
import { useLaunchSettings } from '../context/LaunchSettingsContext';

export default function PublicBookingNoticeModal({ onBypassAdmin }) {
  const navigate = useNavigate();
  const { isNoticeModalOpen, closeNoticeModal, settings, isAdmin } = useLaunchSettings();

  if (!isNoticeModalOpen) return null;

  const handleGoToCampus = () => {
    closeNoticeModal();
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    navigate('/sliit-transit');
  };

  const handleAdminBypass = () => {
    closeNoticeModal();
    if (onBypassAdmin) {
      onBypassAdmin();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in select-none cursor-pointer"
      onClick={closeNoticeModal}
    >
      {/* Dark Dim Backdrop with Glassmorphic Blur */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 pointer-events-none"
      />

      {/* Main Luxury Obsidian VIP Boarding Pass */}
      <div 
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-slate-900/95 text-white border-2 border-red-500/80 rounded-3xl shadow-2xl shadow-red-600/25 overflow-hidden z-10 transition-all transform scale-100 backdrop-blur-xl cursor-default"
      >
        {/* Animated Top Glowing Laser Accent Line (Amber to Crimson) */}
        <div className="h-2 bg-gradient-to-r from-amber-400 via-red-500 to-rose-600 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse" />

        {/* Ambient Glow Orbs behind the ticket */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Boarding Pass Body (Left Info + Right Tear-off Stub) */}
        <div className="p-6 sm:p-7 flex flex-col md:flex-row items-stretch justify-between gap-6 relative">
          
          {/* Perforated Ticket Notches (Cutouts on left & right borders) */}
          <div className="hidden md:block absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950 border border-slate-800 shadow-inner z-20" />
          <div className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950 border border-slate-800 shadow-inner z-20" />

          {/* Left Main Ticket Section */}
          <div className="flex-1 space-y-4">
            
            {/* Top Barcode Header / Ticket Category */}
            <div className="flex items-center justify-between border-b border-dashed border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-[10px] tracking-wider uppercase font-mono shadow-xs">
                  ★ VIP ACCESS
                </span>
                <span className="text-slate-400 font-mono text-xs tracking-wider">
                  YT-LUXURY-2026
                </span>
              </div>

              <div className="flex items-center space-x-1.5 font-mono text-xs font-extrabold text-red-400">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                <span>STANDBY MODE</span>
              </div>
            </div>

            {/* Title with Shimmer & Ellipsis Animation */}
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-100 to-amber-200">
                <span>Public Booking Launching Soon</span>
                <span className="inline-block animate-pulse text-red-400 ml-0.5">...</span>
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-300 font-medium leading-relaxed">
                {settings?.modalMessage || 'Intercity highway seat reservations are currently undergoing final fleet readiness checks. SLIIT University Shuttle routes are 100% active and booking right now.'}
              </p>
            </div>

            {/* Operational Matrix Status Blocks */}
            <div className="grid grid-cols-2 gap-2.5 pt-1 text-left font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 shadow-inner">
                <span className="text-[10px] text-slate-400 block font-sans font-semibold">
                  INTERCITY EXPRESSWAY
                </span>
                <span className="text-xs font-black text-rose-400 flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span>TESTING IN PROGRESS</span>
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 shadow-inner">
                <span className="text-[10px] text-amber-300 block font-sans font-semibold">
                  CAMPUS SHUTTLE
                </span>
                <span className="text-xs font-black text-amber-400 flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>100% BOARDING NOW</span>
                </span>
              </div>
            </div>

          </div>

          {/* Dashed Tear-Off Divider */}
          <div className="hidden md:block border-l-2 border-dashed border-slate-800 relative my-1" />

          {/* Right Ticket Stub Section: Campus Boarding Action */}
          <div className="md:w-56 flex flex-col justify-between items-center text-center p-4 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-inner">
            <div className="space-y-2 my-auto py-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-red-600/35 text-2xl border border-red-400/40 transform hover:rotate-6 transition-transform">
                🎓
              </div>
              <div>
                <span className="block font-black text-white text-sm tracking-tight">
                  Gate S-01 Open
                </span>
                <span className="block text-[11px] text-slate-400 font-medium">
                  SLIIT Campus Transit
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoToCampus}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs shadow-lg shadow-red-600/40 hover:shadow-red-600/60 hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Board Shuttle Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Ticket Barcode Footer Strip */}
        <div className="bg-slate-950/90 border-t border-slate-800/80 py-2.5 px-6 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span className="text-amber-400 font-bold flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>YATHRA VIP BOARDING</span>
          </span>
          <span className="tracking-widest text-slate-500">
            ||| | |||| || | ||||| | ||
          </span>
          <span className="text-slate-500 text-[10px] font-mono tracking-wider hidden sm:inline">
            TAP ANYWHERE OUTSIDE TO DISMISS
          </span>
        </div>

        {/* Discreet Admin Bypass Link (Only for logged-in Admins) */}
        {isAdmin && (
          <div className="bg-slate-950 px-6 py-2 border-t border-slate-800/50 flex items-center justify-center space-x-2 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium">Admin Mode:</span>
            <button
              type="button"
              onClick={handleAdminBypass}
              className="text-red-400 hover:underline font-bold cursor-pointer"
            >
              Bypass restriction for testing →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
