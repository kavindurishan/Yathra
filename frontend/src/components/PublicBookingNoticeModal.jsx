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
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 transition-all transform scale-100 p-6 sm:p-8"
      >
        {/* Subtle Ambient Glow Effect */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/15 dark:bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
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
        <div className="space-y-2 mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
            {settings.modalTitle || 'Public Booking Launching Soon'}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            {settings.modalMessage || 'Online seat reservations for Expressway Intercity routes are undergoing final system readiness checks and will be accessible to the general public soon.'}
          </p>
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

          {/* Card 2: Public Expressway Network (COMING SOON) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 relative overflow-hidden flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">🚌</span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-200/60 dark:border-amber-800/50">
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span>In Development</span>
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                Public Intercity Coaches
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                Direct highway booking across Galle, Matara, Kandy, and Colombo Fort.
              </p>
            </div>
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 py-1.5 px-2 bg-slate-100 dark:bg-slate-900/60 rounded-xl text-center">
              Opening to the public soon
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
