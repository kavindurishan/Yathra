import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Clock, ArrowRight, ShieldCheck, X, Sparkles
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
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300"
        onClick={closeNoticeModal}
      />

      {/* Main Clean White & Red Modal Dialog */}
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg bg-white border border-red-200/90 rounded-3xl shadow-2xl shadow-red-500/15 overflow-hidden z-10 transition-all transform scale-100 p-6 sm:p-9 text-center"
      >
        {/* Animated Glowing Red Line at the Top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse" />

        {/* Ambient Red Glow in Background */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeNoticeModal}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close Dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Centered Red Beacon / Icon Badge */}
        <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-red-50 border-2 border-red-200/90 flex items-center justify-center text-red-600 shadow-xl shadow-red-500/15 mb-5 mt-1">
          {/* Animated radar ping around the icon */}
          <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-red-400/30" />
          <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 relative z-10" />
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-black uppercase tracking-wider mb-4">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <span>Early Access Stage • Phase 1 Active</span>
        </div>

        {/* Prominent Center Headline */}
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-3">
          {settings?.modalTitle || 'Public Booking Launching Soon'}
        </h2>

        {/* Concise Attractive English Subtitle / Message */}
        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-md mx-auto mb-7">
          {settings?.modalMessage || 'Online seat reservations for Expressway Intercity routes will be accessible to the general public soon. SLIIT University Shuttle service is 100% active with live tracking and seat reservations.'}
        </p>

        {/* Only One Primary Action Button (Campus Mode) */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoToCampus}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-red-600/25 hover:shadow-red-600/40 hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center space-x-2.5 cursor-pointer"
          >
            <GraduationCap className="w-5 h-5" />
            <span>{settings?.campusButtonText || 'Switch to Campus Shuttle Hub 🎓'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={closeNoticeModal}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors py-1 cursor-pointer block mx-auto"
          >
            Continue Browsing
          </button>
        </div>

        {/* Discreet Admin Bypass Link (Only for logged-in Admins) */}
        {isAdmin && (
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center space-x-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium">Admin Mode:</span>
            <button
              type="button"
              onClick={handleAdminBypass}
              className="text-red-600 hover:underline font-bold cursor-pointer"
            >
              Bypass restriction for testing →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
