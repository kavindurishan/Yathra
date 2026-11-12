import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import YathraBrandLogo from './YathraBrandLogo';
import WeAcceptPaymentStrip from './PaymentLogos';
import { 
  Phone, Mail, MapPin, Clock, ShieldCheck, 
  Bus, Compass, Heart, ArrowRight, Shield, X, 
  MessageSquare, Lock, Navigation, Sparkles, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function Footer() {
  const [activePolicy, setActivePolicy] = useState(null);

  const policyContents = {
    'Terms of Service': {
      title: 'Terms of Service',
      titleSi: 'සේවා කොන්දේසි (Terms of Service)',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>Welcome to Yathra. By accessing or reserving bus seats via our digital mobility platform, you agree to comply with these terms.</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li>Seat reservations are verified and confirmed in real time with authorized bus operators.</li>
            <li>Passengers must present their digital QR ticket or valid PNR reference along with identification prior to boarding.</li>
            <li>Yathra facilitates seat reservations and schedule telemetry in compliance with Sri Lankan National Transport Commission (NTC) and Provincial Transport Authorities guidelines.</li>
          </ul>
        </div>
      )
    },
    'Privacy Policy': {
      title: 'Privacy Policy',
      titleSi: 'පෞද්ගලිකත්ව ප්‍රතිපත්තිය (Privacy Policy)',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>Yathra is dedicated to safeguarding passenger privacy and personal data protection.</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li>Contact information (phone number, email) is strictly used for ticket dispatch, SMS booking confirmation, and conductor live trip updates.</li>
            <li>All electronic payment transactions are encrypted using bank-grade 256-bit SSL protocols. Yathra never stores raw credit or debit card data.</li>
            <li>Real-time GPS coordinates are broadcast solely for live transit tracking and route telemetry during designated trips.</li>
          </ul>
        </div>
      )
    },
    'Cookie Policy': {
      title: 'Cookie Policy',
      titleSi: 'කුකීස් ප්‍රතිපත්තිය (Cookie Policy)',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>Yathra uses local session storage and essential cookies to provide a smooth, secure reservation journey.</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li>Session Authentication: Safely keeps you signed in across schedule selections and checkout screens.</li>
            <li>Preferences: Retains your selected theme (dark/light) and recent travel corridor selections.</li>
            <li>We do not sell passenger search information or deploy third-party intrusive tracking scripts.</li>
          </ul>
        </div>
      )
    },
    'Ticket Policy': {
      title: 'Ticket Policy',
      titleSi: 'ප්‍රවේශපත්‍ර ප්‍රතිපත්තිය (Ticket Policy)',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>Official ticketing rules applicable to all Expressway and Intercity coach services:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li>Passengers are requested to be present at the terminal or highway interchange halt at least <strong>15 minutes</strong> before scheduled departure.</li>
            <li>Digital boarding passes with QR codes displayed on smartphones are 100% valid. Physical printouts are not mandatory.</li>
            <li><strong>Women Priority Seats:</strong> Designated seats are reserved for female travelers to guarantee passenger safety and comfort on long-distance routes.</li>
          </ul>
        </div>
      )
    },
    'Refund Policy': {
      title: 'Refund & Cancellation Policy',
      titleSi: 'මුදල් ආපසු ගෙවීම් සහ අවලංගු කිරීමේ ප්‍රතිපත්තිය',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>Transparent cancellation tiers based on hours remaining before scheduled coach departure:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li><strong>More than 24 hours prior to departure:</strong> 90% refund.</li>
            <li><strong>12 to 24 hours prior to departure:</strong> 75% refund.</li>
            <li><strong>3 to 12 hours prior to departure:</strong> 50% refund.</li>
            <li><strong>Less than 3 hours prior to departure:</strong> Non-refundable.</li>
            <li><strong>Free Rescheduling:</strong> Change journey date or time within 5 minutes without any deduction.</li>
          </ul>
        </div>
      )
    }
  };

  const policyLinks = [
    'Terms of Service',
    'Privacy Policy',
    'Cookie Policy',
    'Ticket Policy',
    'Refund Policy'
  ];

  return (
    <footer className="relative w-full no-print bg-[#060b17] text-slate-300 border-t border-slate-800/80 overflow-hidden font-sans">
      
      {/* Subtle Expressway Road Grid & Ambient Glow Pattern (Sri Lankan Transit aesthetic) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" 
        aria-hidden="true"
      />
      <div 
        className="absolute -top-32 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" 
        aria-hidden="true"
      />
      <div 
        className="absolute -bottom-32 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" 
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        
        {/* ========================================================== */}
        {/* TOP BRAND HEADER ROW                                       */}
        {/* ========================================================== */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-10 border-b border-slate-800/80">
          <div className="flex items-center space-x-4">
            {/* Header Brand Logo */}
            <div className="p-1 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-md">
              <YathraBrandLogo 
                className="h-10 sm:h-12 w-auto object-contain" 
                forceTheme="dark" 
                animated={false} 
              />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wider uppercase font-mono">
                  YATHRA
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  National Transit
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
                Your Journey, Our Priority.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-300 shadow-sm flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>A KRM Group Brand</span>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* 4-COLUMN CONTENT GRID (Magiya & Sri Lankan Transit System) */}
        {/* ========================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 py-10 border-b border-slate-800/80">
          
          {/* Column 1: About & Network Trust (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest block">
              About Yathra Transit
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sri Lanka's premier digital intercity bus booking platform. Connecting Colombo with Western, Southern, Central, Northern, and Highland transit corridors through scheduled expressway coaches with real-time GPS telemetry.
            </p>
            
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>NTC &amp; Provincial Transport Authority Compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant Digital Boarding QR Ticket Pass</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Live Satellite GPS Telemetry &amp; Speed Tracking</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="flex items-center space-x-2 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1">Follow:</span>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-cyan-600/20 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-300 flex items-center justify-center transition-all text-xs font-bold"
                title="Facebook"
              >
                f
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-cyan-600/20 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-300 flex items-center justify-center transition-all text-xs font-bold"
                title="Instagram"
              >
                in
              </a>
              <a 
                href="https://wa.me/94771234567" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-emerald-600/20 border border-slate-800 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400 flex items-center justify-center transition-all text-xs font-bold"
                title="WhatsApp Transit Hotline"
              >
                wa
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-rose-600/20 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-all text-xs font-bold"
                title="YouTube"
              >
                yt
              </a>
            </div>
          </div>

          {/* Column 2: Popular Transit Corridors (Magiya style, Span 3) */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest block">
              Popular Express Corridors
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/schedules?from=Colombo&to=Galle" className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center justify-between group">
                  <span>Colombo ⇄ Galle (E01)</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-cyan-400">1h 20m</span>
                </Link>
              </li>
              <li>
                <Link to="/schedules?from=Colombo&to=Matara" className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center justify-between group">
                  <span>Colombo ⇄ Matara (E01)</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-cyan-400">1h 50m</span>
                </Link>
              </li>
              <li>
                <Link to="/schedules?from=Kadawatha&to=Kandy" className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center justify-between group">
                  <span>Kadawatha ⇄ Kandy (E04)</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-cyan-400">2h 15m</span>
                </Link>
              </li>
              <li>
                <Link to="/schedules?from=Panadura&to=Kandy" className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center justify-between group">
                  <span>Panadura ⇄ Kandy (Route 17)</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-cyan-400">3h 30m</span>
                </Link>
              </li>
              <li>
                <Link to="/schedules?from=Colombo&to=Jaffna" className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center justify-between group">
                  <span>Colombo ⇄ Jaffna (A9 Express)</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-cyan-400">6h 30m</span>
                </Link>
              </li>
              <li>
                <Link to="/schedules?from=Colombo&to=Badulla" className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center justify-between group">
                  <span>Colombo ⇄ Badulla (Highland)</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-cyan-400">5h 10m</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation & Passenger Tools (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest block">
              Passenger Links
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  Find Available Buses
                </Link>
              </li>
              <li>
                <Link to="/schedules" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  Live Timetables
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  About Yathra
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  Contact &amp; Support
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-slate-500 hover:text-slate-300 transition-colors">
                  Operator Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: 24/7 Transit Support Desk (Magiya style, Span 3) */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest block">
              24/7 Transit Support Desk
            </span>
            <p className="text-xs text-slate-400">
              Assisting passengers islandwide with coach schedules, cancellations &amp; live tracking.
            </p>

            <div className="space-y-2.5 pt-1 text-xs">
              <a 
                href="tel:+94112345678" 
                className="flex items-center space-x-2.5 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">General Hotline</span>
                  <span className="font-mono font-bold text-xs text-cyan-400 group-hover:text-cyan-300">+94 11 234 5678</span>
                </div>
              </a>

              <a 
                href="https://wa.me/94771234567" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center space-x-2.5 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">WhatsApp Coach Desk</span>
                  <span className="font-mono font-bold text-xs text-emerald-400 group-hover:text-emerald-300">+94 77 123 4567</span>
                </div>
              </a>

              <div className="flex items-start space-x-2 text-[11px] text-slate-400 pt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>Bastian Mawatha Bus Stand, Pettah / Fort, Colombo 11</span>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================== */}
        {/* PAYMENT BADGES & SECURITY TRUST ROW                        */}
        {/* ========================================================== */}
        <div className="py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800/80">
          
          {/* "We accept" strip with Official VISA, Mastercard, and AMEX logos */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <WeAcceptPaymentStrip />

            {/* Sri Lankan Domestic Payment Partners */}
            <div className="flex items-center space-x-2 pt-1 sm:pt-6 sm:pl-5 sm:border-l sm:border-slate-800/80">
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-cyan-400 font-mono text-[10px] font-bold tracking-wider">
                LankaPay
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-[10px] font-bold tracking-wider">
                LankaQR
              </span>
            </div>
          </div>

          {/* 256-Bit SSL Encrypted Trust Badge */}
          <div className="flex items-center space-x-2.5 text-xs text-slate-400 bg-slate-900/60 border border-slate-800/80 px-4 py-2.5 rounded-xl shadow-xs">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>256-Bit SSL Encrypted &amp; Secure Digital Payment Network</span>
          </div>
        </div>

        {/* ========================================================== */}
        {/* POLICY LINKS (Exact words from user's image)               */}
        {/* ========================================================== */}
        <div className="py-5 flex flex-wrap items-center gap-x-6 sm:gap-x-8 gap-y-2 border-b border-slate-800/80">
          {policyLinks.map((policy) => (
            <button
              key={policy}
              type="button"
              onClick={() => setActivePolicy(policy)}
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer text-left"
            >
              {policy}
            </button>
          ))}
        </div>

        {/* ========================================================== */}
        {/* BOTTOM COPYRIGHT & CREDITS (Exact words from user's image)  */}
        {/* ========================================================== */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs sm:text-sm">
          <div className="space-y-1">
            <p className="text-slate-400 font-normal">
              &copy; 2026 Yathra. All Rights Reserved.
            </p>
            <p className="text-[11px] sm:text-xs text-slate-500 font-normal">
              A Technology Division of KRM Group
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-slate-300 font-normal flex items-center flex-wrap gap-1">
              <span>Designed &amp; Developed with</span>
              <span className="text-rose-500 font-bold inline-block mx-0.5">♡</span>
              <span>by</span>
              <a 
                href="#krm" 
                onClick={(e) => { e.preventDefault(); }}
                className="text-sky-400 hover:text-sky-300 font-semibold hover:underline"
              >
                KRM Technologies
              </a>
            </p>
          </div>
        </div>

      </div>

      {/* ========================================================== */}
      {/* INTERACTIVE POLICY DRAWER MODAL                            */}
      {/* ========================================================== */}
      {activePolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 text-white relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>{policyContents[activePolicy]?.title}</span>
                </h3>
                <span className="text-[10px] text-slate-400">{policyContents[activePolicy]?.titleSi}</span>
              </div>
              <button
                type="button"
                onClick={() => setActivePolicy(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto pr-1">
              {policyContents[activePolicy]?.content}
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActivePolicy(null)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </footer>
  );
}
