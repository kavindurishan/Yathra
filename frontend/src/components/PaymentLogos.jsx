import React from 'react';
import visaImg from '../assets/payment/visa_logo.png';
import mastercardImg from '../assets/payment/mastercard_logo.png';
import amexImg from '../assets/payment/amex_logo.png';

/**
 * High-fidelity Payment Brand Logos matching authentic Sri Lankan transit standards (Magiya.lk)
 * Supporting Visa, Mastercard, and American Express (AMEX)
 */
export function VisaLogo({ className = "h-5 sm:h-6 w-auto" }) {
  return (
    <img 
      src={visaImg} 
      alt="Visa" 
      className={`${className} object-contain transition-transform duration-200 hover:scale-105`} 
      loading="lazy" 
    />
  );
}

export function MastercardLogo({ className = "h-6 sm:h-7 w-auto" }) {
  return (
    <img 
      src={mastercardImg} 
      alt="Mastercard" 
      className={`${className} object-contain transition-transform duration-200 hover:scale-105`} 
      loading="lazy" 
    />
  );
}

export function AmexLogo({ className = "h-5 sm:h-6 w-auto" }) {
  return (
    <img 
      src={amexImg} 
      alt="American Express (AMEX)" 
      className={`${className} object-contain transition-transform duration-200 hover:scale-105`} 
      loading="lazy" 
    />
  );
}

export default function WeAcceptPaymentStrip({ showTitle = true, className = "" }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {showTitle && (
        <span className="text-xs sm:text-sm font-medium text-slate-400 block tracking-wide select-none">
          We accept
        </span>
      )}
      <div className="flex items-center space-x-4 sm:space-x-5">
        <div className="flex items-center justify-center" title="Visa">
          <VisaLogo className="h-5 sm:h-6" />
        </div>
        <div className="flex items-center justify-center" title="Mastercard">
          <MastercardLogo className="h-6 sm:h-7" />
        </div>
        <div className="flex items-center justify-center" title="American Express (AMEX)">
          <AmexLogo className="h-5 sm:h-6" />
        </div>
      </div>
    </div>
  );
}
