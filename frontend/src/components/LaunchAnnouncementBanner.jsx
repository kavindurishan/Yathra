import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, X, GraduationCap } from 'lucide-react';
import { useLaunchSettings } from '../context/LaunchSettingsContext';

export default function LaunchAnnouncementBanner() {
  const { settings } = useLaunchSettings();
  const [dismissed, setDismissed] = useState(false);

  // If public booking is already fully enabled, or user dismissed, don't show the early access banner
  if (settings.publicBookingActive || !settings.launchBannerEnabled || dismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white text-xs sm:text-sm py-2.5 px-4 sm:px-6 relative z-30 border-b border-indigo-500/20 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 flex-1 min-w-0">
          <span className="shrink-0 inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] sm:text-xs font-black uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Early Access</span>
          </span>
          <p className="font-semibold truncate text-slate-200">
            {settings.bannerMessage || 'SLIIT Campus Transit Hub is now LIVE! Public expressway booking will open soon.'}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Link
            to="/sliit-transit"
            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-sm shadow-cyan-500/20 hover:scale-[1.02] cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Open Campus Hub</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Dismiss Announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
