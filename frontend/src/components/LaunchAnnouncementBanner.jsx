import React from 'react';
import { useLaunchSettings } from '../context/LaunchSettingsContext';

export default function LaunchAnnouncementBanner() {
  const { settings } = useLaunchSettings();

  // If public booking is already fully enabled, or launch banner disabled, do not show
  if (settings?.publicBookingActive || !settings?.launchBannerEnabled) {
    return null;
  }

  const messageText = settings?.bannerMessage || 'SLIIT Campus Transit Hub is now LIVE! Public booking will launching soon...';

  return (
    <div className="relative z-30 w-full overflow-hidden bg-slate-950 border-b border-cyan-500/30 py-2.5 shadow-lg shadow-cyan-500/5 select-none">
      
      {/* Left & Right Gradient Fade Masks for smooth seamless edge entry & exit */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

      {/* Continuous Infinite Marquee Track (Non-Stop Motion - Does NOT pause on cursor hover) */}
      <div className="animate-continuous-marquee whitespace-nowrap">
        
        {/* Stream Segment 1 */}
        <div className="flex items-center space-x-8 px-4">
          <span className="inline-flex items-center space-x-2 text-xs sm:text-sm font-semibold text-white tracking-wide">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="text-cyan-400 font-black uppercase text-[10px] tracking-wider bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80">
              ANNOUNCEMENT
            </span>
            <span className="text-white font-bold">{messageText}</span>
          </span>

          <span className="text-slate-700 text-sm font-black">• • •</span>

          <span className="inline-flex items-center space-x-2 text-xs sm:text-sm font-semibold text-white tracking-wide">
            <span className="text-cyan-400 text-xs">🎓</span>
            <span className="text-white font-bold">{messageText}</span>
          </span>

          <span className="text-slate-700 text-sm font-black">• • •</span>
        </div>

        {/* Stream Segment 2 (Duplicate for smooth 100% gapless continuous marquee loop) */}
        <div className="flex items-center space-x-8 px-4">
          <span className="inline-flex items-center space-x-2 text-xs sm:text-sm font-semibold text-white tracking-wide">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="text-cyan-400 font-black uppercase text-[10px] tracking-wider bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80">
              ANNOUNCEMENT
            </span>
            <span className="text-white font-bold">{messageText}</span>
          </span>

          <span className="text-slate-700 text-sm font-black">• • •</span>

          <span className="inline-flex items-center space-x-2 text-xs sm:text-sm font-semibold text-white tracking-wide">
            <span className="text-cyan-400 text-xs">🎓</span>
            <span className="text-white font-bold">{messageText}</span>
          </span>

          <span className="text-slate-700 text-sm font-black">• • •</span>
        </div>

      </div>

    </div>
  );
}
