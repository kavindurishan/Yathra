import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import YathraBrandLogo from '../components/YathraBrandLogo';
import { 
  ShieldCheck, ShieldAlert, KeyRound, ArrowLeft, 
  Delete, Sparkles, Lock, Unlock, HelpCircle
} from 'lucide-react';

export default function AdminPinGate() {
  const navigate = useNavigate();
  const { loginWithPin } = useAuth();
  
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Listen to physical keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (loading) return;

      if (e.key >= '0' && e.key <= '9') {
        if (pin.length < 6) {
          handleDigitPress(e.key);
        }
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        if (pin.length >= 4) {
          submitPin(pin);
        }
      } else if (e.key === 'Escape') {
        setPin('');
        setError('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, loading]);

  const handleDigitPress = (digit) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError('');
      if (nextPin.length === 4) {
        submitPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const submitPin = async (candidatePin) => {
    setLoading(true);
    setError('');
    try {
      const res = await loginWithPin(candidatePin);
      if (!res.success) {
        triggerShake(res.message || 'Incorrect PIN code');
      }
    } catch (err) {
      triggerShake('Failed to verify PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = (errMsg) => {
    setError(errMsg);
    setShake(true);
    setTimeout(() => {
      setShake(false);
      setPin('');
    }, 600);
  };

  const numpadDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between items-center p-4 sm:p-6 select-none relative overflow-hidden font-sans">
      {/* Background Ambience / Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Brand */}
      <div className="w-full max-w-md flex items-center justify-between z-10 pt-4">
        <button
          onClick={() => navigate('/')}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer group"
          title="Return to Public Site"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Exit to Public Portal</span>
        </button>

        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Terminal Gate</span>
        </span>
      </div>

      {/* Center Console Card */}
      <div className="w-full max-w-sm flex flex-col items-center z-10 my-auto py-6">
        
        {/* Brand Icon */}
        <div className="mb-4 flex flex-col items-center">
          <YathraBrandLogo className="h-14 sm:h-16 w-auto drop-shadow-lg" forceTheme="dark" />
          <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-[11px] font-black uppercase tracking-wider">
            <Lock className="w-3 h-3 text-indigo-400" />
            <span>Master Console Lock</span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center space-y-1 mb-6">
          <h1 className="text-2xl font-black text-white tracking-tight">
            Enter Admin PIN
          </h1>
          <p className="text-xs text-slate-400 font-medium max-w-xs">
            Authenticate session directly without username and password.
          </p>
        </div>

        {/* PIN Indicators (4-6 Circles) */}
        <div className={`flex items-center justify-center space-x-3 mb-6 transition-transform ${shake ? 'animate-bounce text-rose-500' : ''}`}>
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  isFilled
                    ? 'bg-cyan-400 border-cyan-300 shadow-lg shadow-cyan-500/50 scale-110'
                    : 'border-slate-700 bg-slate-900/60'
                } ${shake ? '!border-rose-500 !bg-rose-500/40 shadow-rose-500/50' : ''}`}
              />
            );
          })}
        </div>

        {/* Error / Status Message */}
        <div className="h-6 mb-4 flex items-center justify-center">
          {loading ? (
            <span className="text-xs font-bold text-cyan-400 flex items-center space-x-1.5 animate-pulse">
              <span className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span>Verifying Terminal PIN...</span>
            </span>
          ) : error ? (
            <span className="text-xs font-bold text-rose-400 flex items-center space-x-1 bg-rose-950/60 px-3 py-1 rounded-lg border border-rose-800/50">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-500">
              Use physical keyboard or on-screen numpad
            </span>
          )}
        </div>

        {/* On-Screen Touch Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
          {numpadDigits.map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={loading}
              onClick={() => handleDigitPress(digit)}
              className="h-14 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:bg-cyan-600/30 border border-slate-800 hover:border-slate-700 text-xl font-bold text-white shadow-md transition-all flex items-center justify-center cursor-pointer active:scale-95"
            >
              {digit}
            </button>
          ))}

          {/* Clear Button */}
          <button
            type="button"
            disabled={loading || pin.length === 0}
            onClick={handleClear}
            className="h-14 rounded-2xl bg-slate-900/60 hover:bg-slate-800 active:bg-slate-700 border border-slate-800/80 text-xs font-bold text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
          >
            CLEAR
          </button>

          {/* 0 Button */}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDigitPress('0')}
            className="h-14 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:bg-cyan-600/30 border border-slate-800 hover:border-slate-700 text-xl font-bold text-white shadow-md transition-all flex items-center justify-center cursor-pointer active:scale-95"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            disabled={loading || pin.length === 0}
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-slate-900/60 hover:bg-slate-800 active:bg-slate-700 border border-slate-800/80 text-slate-300 hover:text-white transition-all flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Footer copyright */}
      <div className="w-full text-center py-2 text-[11px] font-semibold text-slate-600 z-10">
        &copy; {new Date().getFullYear()} Yathra Mobility Enterprise • Secure Console Gateway
      </div>
    </div>
  );
}
