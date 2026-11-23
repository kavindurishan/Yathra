import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bus, GraduationCap, Sparkles, Clock, CheckCircle2, 
  ArrowRight, ShieldCheck, X, AlertTriangle, Compass, MapPin
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
      {/* Dark Dim Backdrop with Blur */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
        onClick={closeNoticeModal}
      />

      {/* Main Glassmorphic Modal Dialog */}
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 transition-all transform scale-100 p-6 sm:p-8 pt-7 sm:pt-9"
      >
        {/* Animated Top Red & White Glowing Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-white to-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.7)] animate-pulse" />

        {/* Subtle Ambient Glow Effect */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/15 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeNoticeModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close Dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Pill */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 text-cyan-700 dark:text-cyan-300 text-xs font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span>Early Access Stage • Phase 1 Active</span>
          </span>
        </div>

        {/* Title and Subtitle */}
        <div className="space-y-2 mb-5">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
            {settings.modalTitle || 'Public Booking Launching Soon'}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            {settings.modalMessage || 'Online seat reservations for Expressway Intercity routes are undergoing final system readiness checks and will be accessible to the general public soon.'}
          </p>
        </div>

        {/* Red & White Alert Notification Banner with Ping Animation */}
        <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-white/80 to-rose-500/10 dark:from-red-950/60 dark:via-slate-900 dark:to-rose-950/60 border-l-4 border-l-red-500 border border-red-300/80 dark:border-red-800/50 shadow-md relative overflow-hidden animate-fade-in">
          {/* Shimmer light bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent animate-pulse" />

          <div className="flex items-start space-x-3 relative z-10">
            {/* Animated Red Beacon Ping */}
            <div className="relative flex h-3.5 w-3.5 mt-0.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600 shadow-xs shadow-red-500" />
            </div>

            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                  Temporary Restriction
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-extrabold text-[9px] uppercase tracking-wider shadow-xs">
                  Public Booking Closed
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                Intercity bus reservations are currently paused for public customers. Please switch to <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">Campus Shuttle Mode</strong> to view routes and reserve your shuttle seat.
              </p>
            </div>
          </div>
        </div>

        {/* Operational Status Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
          {/* Card 1: University Shuttle (ACTIVE) */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 relative overflow-hidden flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">🎓</span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Active & Live</span>
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                SLIIT Campus Transit
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                Panadura, Kandy & Colombo express routes with live GPS bus tracker & timetable.
              </p>
            </div>
            <button
              onClick={handleGoToCampus}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              <span>Explore Shuttle Mode</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Public Expressway Network (TEMPORARILY CLOSED) */}
          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-300/80 dark:border-rose-900/60 relative overflow-hidden flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">🚌</span>
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-[10px] font-black uppercase tracking-wider border border-red-300 dark:border-red-800/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  <span>Closed for Staging</span>
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                Public Intercity Coaches
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                Expressway routes across Galle, Matara, Kandy & Fort will open to regular passengers soon.
              </p>
            </div>
            <div className="text-[11px] font-bold text-red-600 dark:text-red-400 py-1.5 px-2 bg-red-100/80 dark:bg-red-950/60 rounded-xl text-center border border-red-200 dark:border-red-900/40">
              Online Booking Paused
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={closeNoticeModal}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
          >
            Continue Browsing
          </button>

          <button
            onClick={handleGoToCampus}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            <span>{settings.campusButtonText || 'Switch to Campus Shuttle Hub 🎓'}</span>
          </button>
        </div>

        {/* Admin Special Bypass Notice (Only visible when logged in as Admin) */}
        {isAdmin && (
          <div className="mt-4 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="font-bold text-indigo-900 dark:text-indigo-200">
                Admin Privilege: You can bypass this restriction for testing.
              </span>
            </div>
            <button
              onClick={handleAdminBypass}
              className="ml-3 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shrink-0 cursor-pointer transition-colors shadow-xs"
            >
              Bypass as Admin →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
