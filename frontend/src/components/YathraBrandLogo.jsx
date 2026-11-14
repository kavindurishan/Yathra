import React, { useMemo } from 'react';
import yathraLogoLight from '../assets/yathra_logo_transparent.png';
import yathraLogoDark from '../assets/yathra_logo_dark_transparent.png';
import yathraLogoOriginal from '../assets/yathra_logo.png';

import yathraSinhalaLogoLight from '../assets/yathra_sinhala_logo_transparent.png';
import yathraSinhalaLogoDark from '../assets/yathra_sinhala_logo_dark_transparent.png';
import yathraSinhalaLogoOriginal from '../assets/yathra_sinhala_logo.png';

// Global session start anchor so all instances (Header, Footer, Modals) animate in 100% lockstep sync
if (typeof window !== 'undefined' && !window.__YATHRA_ANIM_SYNC_BASE) {
  window.__YATHRA_ANIM_SYNC_BASE = Date.now();
}

export default function YathraBrandLogo({ 
  className = "h-13 sm:h-15", 
  isSplash = false,
  showTagline = false,
  animated = true,
  forceTheme = null // 'light' | 'dark' | null (auto)
}) {
  // Compute synchronized animation phase delay so header and footer logos animate in exact unison
  const syncStyle = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    const base = window.__YATHRA_ANIM_SYNC_BASE || Date.now();
    const elapsedSec = ((Date.now() - base) / 1000).toFixed(4);
    return {
      '--yathra-sync-delay': `-${elapsedSec}s`,
      animationDelay: `-${elapsedSec}s`
    };
  }, []);

  return (
    <div 
      className="flex items-center space-x-2 select-none group cursor-pointer"
      style={animated ? syncStyle : undefined}
    >
      {/* 3D Perspective Card Viewport */}
      <div 
        className={`relative inline-flex items-center justify-center transition-all duration-300 group-hover:scale-[1.03] perspective-1000 ${
          isSplash ? 'p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl' : ''
        }`}
      >
        {/* Invisible spacer image: seamlessly secures width & height geometry from className across all screen sizes */}
        <img 
          src={yathraLogoLight} 
          alt="" 
          aria-hidden="true" 
          className={`${className} w-auto object-contain invisible pointer-events-none select-none`}
        />

        {/* 3D Dual-sided Flip Card */}
        <div 
          className={`absolute inset-0 w-full h-full preserve-3d transition-transform duration-500 ${
            animated ? 'animate-yathra-3d-flip' : ''
          }`}
          style={animated ? syncStyle : undefined}
          title="Yathra Transit • English / සිංහල"
        >
          {/* ================= FRONT FACE: ENGLISH LOGO ================= */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center backface-hidden [transform:rotateY(0deg)]">
            <div className={`relative w-full h-full flex items-center justify-center overflow-hidden rounded-md ${animated ? 'animate-yathra-glide' : ''}`}>
              
              {/* Light Mode English Logo */}
              {(forceTheme === 'light' || !forceTheme) && (
                <img 
                  src={yathraLogoLight} 
                  alt="Yathra English Logo" 
                  className={`${forceTheme ? 'block' : 'dark:hidden block'} w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:translate-x-0.5`}
                  onError={(e) => {
                    e.currentTarget.src = yathraLogoOriginal;
                  }}
                />
              )}

              {/* Dark Mode English Logo */}
              {(forceTheme === 'dark' || !forceTheme) && (
                <img 
                  src={yathraLogoDark} 
                  alt="Yathra English Logo" 
                  className={`${forceTheme ? 'block' : 'hidden dark:block'} w-full h-full object-contain filter drop-shadow-[0_2px_10px_rgba(255,255,255,0.18)] transition-transform duration-300 group-hover:translate-x-0.5`}
                  onError={(e) => {
                    e.currentTarget.src = yathraLogoLight;
                  }}
                />
              )}

              {/* Luxury Light Sheen Beam on English Face */}
              {animated && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/20 to-transparent animate-yathra-sheen pointer-events-none" />
                </div>
              )}
            </div>

            {/* Single Dedicated Animated GPS Location Pin for English Logo */}
            <div 
              className="absolute pointer-events-none"
              style={{
                top: '16.5%',
                left: '68.2%',
                width: '5.2%',
                height: '23%',
                perspective: '600px'
              }}
              title="Live GPS Tracking Active"
            >
              <div className={`w-full h-full flex items-center justify-center ${animated ? 'animate-yathra-pin' : ''}`}>
                <svg 
                  viewBox="0 0 24 32" 
                  className={`w-full h-full ${
                    forceTheme === 'dark' 
                      ? 'text-cyan-400 fill-cyan-400 filter drop-shadow-[0_2px_8px_rgba(56,189,248,0.85)]' 
                      : forceTheme === 'light'
                      ? 'text-sky-600 fill-sky-600 filter drop-shadow-[0_2px_5px_rgba(2,132,199,0.7)]'
                      : 'text-sky-600 fill-sky-600 dark:text-cyan-400 dark:fill-cyan-400 filter drop-shadow-[0_2px_5px_rgba(2,132,199,0.7)] dark:drop-shadow-[0_2px_8px_rgba(56,189,248,0.85)]'
                  }`}
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12zm0 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
                </svg>
              </div>

              {animated && (
                <span 
                  className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full opacity-85 animate-yathra-radar pointer-events-none ${
                    forceTheme === 'dark' 
                      ? 'bg-cyan-400' 
                      : forceTheme === 'light'
                      ? 'bg-sky-500'
                      : 'bg-sky-500 dark:bg-cyan-400'
                  }`} 
                />
              )}
            </div>
          </div>

          {/* ================= BACK FACE: SINHALA LOGO ================= */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center backface-hidden [transform:rotateY(180deg)]">
            <div className={`relative w-full h-full flex items-center justify-center overflow-hidden rounded-md ${animated ? 'animate-yathra-glide' : ''}`}>
              
              {/* Light Mode Sinhala Logo */}
              {(forceTheme === 'light' || !forceTheme) && (
                <img 
                  src={yathraSinhalaLogoLight} 
                  alt="යාත්‍රා Sinhala Logo" 
                  className={`${forceTheme ? 'block' : 'dark:hidden block'} w-full h-full object-contain filter drop-shadow-[0_1px_3px_rgba(2,132,199,0.7)] transition-transform duration-300 group-hover:translate-x-0.5`}
                  onError={(e) => {
                    e.currentTarget.src = yathraSinhalaLogoOriginal;
                  }}
                />
              )}

              {/* Dark Mode Sinhala Logo */}
              {(forceTheme === 'dark' || !forceTheme) && (
                <img 
                  src={yathraSinhalaLogoDark} 
                  alt="යාත්‍රා Sinhala Logo" 
                  className={`${forceTheme ? 'block' : 'hidden dark:block'} w-full h-full object-contain filter drop-shadow-[0_2px_12px_rgba(56,189,248,0.55)] transition-transform duration-300 group-hover:translate-x-0.5`}
                  onError={(e) => {
                    e.currentTarget.src = yathraSinhalaLogoLight;
                  }}
                />
              )}

              {/* Luxury Light Sheen Beam on Sinhala Face */}
              {animated && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/20 to-transparent animate-yathra-sheen pointer-events-none" />
                </div>
              )}
            </div>

            {/* Single Dedicated Animated GPS Location Pin for Sinhala Logo */}
            <div 
              className="absolute pointer-events-none"
              style={{
                top: '16.5%',
                left: '69.2%',
                width: '5.2%',
                height: '23%',
                perspective: '600px'
              }}
              title="Live GPS Tracking Active"
            >
              <div className={`w-full h-full flex items-center justify-center ${animated ? 'animate-yathra-pin' : ''}`}>
                <svg 
                  viewBox="0 0 24 32" 
                  className={`w-full h-full ${
                    forceTheme === 'dark' 
                      ? 'text-cyan-400 fill-cyan-400 filter drop-shadow-[0_2px_8px_rgba(56,189,248,0.85)]' 
                      : forceTheme === 'light'
                      ? 'text-sky-600 fill-sky-600 filter drop-shadow-[0_2px_5px_rgba(2,132,199,0.7)]'
                      : 'text-sky-600 fill-sky-600 dark:text-cyan-400 dark:fill-cyan-400 filter drop-shadow-[0_2px_5px_rgba(2,132,199,0.7)] dark:drop-shadow-[0_2px_8px_rgba(56,189,248,0.85)]'
                  }`}
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12zm0 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
                </svg>
              </div>

              {animated && (
                <span 
                  className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full opacity-85 animate-yathra-radar pointer-events-none ${
                    forceTheme === 'dark' 
                      ? 'bg-cyan-400' 
                      : forceTheme === 'light'
                      ? 'bg-sky-500'
                      : 'bg-sky-500 dark:bg-cyan-400'
                  }`} 
                />
              )}
            </div>
          </div>

        </div>
      </div>

      {showTagline && (
        <div className="hidden sm:flex flex-col justify-center">
          <span className="font-black text-xs uppercase tracking-widest text-primary-600 dark:text-primary-400 leading-tight">
            යාත්‍රා Transit
          </span>
          <span className="text-[9px] text-slate-400 font-bold leading-none">
            Online Bus Booking
          </span>
        </div>
      )}
    </div>
  );
}
