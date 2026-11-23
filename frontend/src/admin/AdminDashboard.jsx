import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useLaunchSettings } from '../context/LaunchSettingsContext';
import { 
  Users, Bus, Calendar, Landmark, BookOpen, AlertOctagon, 
  TrendingUp, CircleDollarSign, Clock, ShieldAlert, ArrowRight,
  Sparkles, CheckCircle2, Eye, ShieldCheck, GraduationCap, KeyRound
} from 'lucide-react';
// Recharts charts
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid, BarChart, Bar, Legend
} from 'recharts';

export default function AdminDashboard() {
  const { settings, updateSettings, openNoticeModal } = useLaunchSettings();
  const [toggleLoading, setToggleLoading] = useState(false);
  const [toggleSuccessMsg, setToggleSuccessMsg] = useState('');
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');

  const [kpis, setKpis] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleTogglePublicBooking = async () => {
    setToggleLoading(true);
    setToggleSuccessMsg('');
    try {
      const nextState = !settings.publicBookingActive;
      await updateSettings({ publicBookingActive: nextState });
      setToggleSuccessMsg(nextState ? 'Public Booking is now LIVE for all users!' : 'Public Booking switched to Maintenance / Staging mode.');
      setTimeout(() => setToggleSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setToggleLoading(false);
    }
  };

  const handleSaveNewPin = async () => {
    if (!newPinInput || newPinInput.trim().length < 4) {
      alert('PIN must be at least 4 digits.');
      return;
    }
    try {
      await updateSettings({ adminSecurityPin: newPinInput.trim() });
      localStorage.setItem('yathra_admin_pin', newPinInput.trim());
      setIsEditingPin(false);
      setToggleSuccessMsg(`Admin Terminal PIN updated to: ${newPinInput.trim()}`);
      setTimeout(() => setToggleSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async (retryCount = 0) => {
    try {
      if (retryCount === 0) setLoading(true);
      setError('');
      
      const data = await api.reports.getDashboard();
      if (data.success) {
        setKpis(data.kpis);
        setRecentPayments(data.recentPayments);
        setChartData(data.charts.revenueChart);
        setLoading(false);
      } else {
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      if (retryCount < 3) {
        console.warn(`Dashboard fetch failed (attempt ${retryCount + 1}), retrying...`, err);
        setTimeout(() => loadDashboardStats(retryCount + 1), 800);
      } else {
        console.error('Dashboard fetch error:', err);
        setError('Could not connect to the reporting service. Please ensure the backend server is running.');
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] space-y-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Compiling fleet analytics and KPI counters...</p>
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/20 text-accent-rose text-sm font-semibold rounded-2xl border border-rose-200/50">
        {error}
      </div>
    );
  }

  const kpiList = [
    { name: 'Total Revenue', value: `$${kpis.totalRevenue.toLocaleString()}`, change: '+14% this month', icon: CircleDollarSign, color: 'text-accent-emerald bg-emerald-50 dark:bg-emerald-950/20' },
    { name: 'Total Users', value: kpis.totalUsers, change: 'Active accounts', icon: Users, color: 'text-primary-500 bg-primary-50 dark:bg-primary-950/20' },
    { name: 'Total Bookings', value: kpis.totalBookings, change: `${kpis.todayBookings} bookings today`, icon: BookOpen, color: 'text-accent-cyan bg-cyan-50 dark:bg-cyan-950/20' },
    { name: 'Available Buses', value: `${kpis.availableBuses} / ${kpis.totalBuses}`, change: 'Fleet ready', icon: Bus, color: 'text-accent-amber bg-amber-50 dark:bg-amber-950/20' },
    { name: 'Cancelled Bookings', value: kpis.cancelledBookings, change: 'Refund processing active', icon: AlertOctagon, color: 'text-accent-rose bg-rose-50 dark:bg-rose-950/20' },
    { name: 'Trip Schedules', value: kpis.totalSchedules, change: 'Active routes', icon: Calendar, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">Dashboard Overview</h2>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Real-time fleet operation cockpit metrics</p>
      </div>

      {/* Platform Rollout & Launch Mode Control */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm overflow-hidden relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Platform Rollout & Launch Control
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Control public access. When paused, normal customers will see the professional Launch Notice modal directing them to Campus Shuttle Mode. Admins retain full unrestricted access.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={openNoticeModal}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Preview Customer Modal</span>
            </button>

            <Link
              to="/admin/sliit-transit"
              className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center space-x-1.5 hover:bg-blue-100 transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Manage Campus Shuttles</span>
            </Link>
          </div>
        </div>

        {/* Feature Switches Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
          {/* Switch 1: Public Bus Booking */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Bus className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  Public Intercity Bus Booking
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {settings.publicBookingActive 
                  ? 'All customers can select seats and book expressway buses.'
                  : 'Booking locked for normal customers (Admins retain full access).'
                }
              </p>
              <div className="pt-1">
                {settings.publicBookingActive ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Live to Public</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>Maintenance Mode (Staging)</span>
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleTogglePublicBooking}
              disabled={toggleLoading}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.publicBookingActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              title={settings.publicBookingActive ? 'Click to pause public bookings' : 'Click to activate public bookings'}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  settings.publicBookingActive ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Switch 2: Campus Shuttle Early Access */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  University Shuttle Mode (SLIIT Transit)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Primary active service for campus students with live GPS tracking and stops.
              </p>
              <div className="pt-1">
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>100% Operational</span>
                </span>
              </div>
            </div>

            <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
              Active Now
            </div>
          </div>
        </div>

        {/* Master Admin Security PIN Quick Management */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <KeyRound className="w-3.5 h-3.5" />
            </span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              Master Terminal Access PIN:
            </span>
            <span className="font-mono font-black text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800/40 tracking-wider">
              {settings.adminSecurityPin || '2026'}
            </span>
            <span className="text-slate-400 text-[11px] font-medium">(Quick console access without email/password)</span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {isEditingPin ? (
              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  maxLength={6}
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="New PIN (4-6 digits)"
                  className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-28 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={handleSaveNewPin}
                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingPin(false)}
                  className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xs hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setNewPinInput(settings.adminSecurityPin || '2026');
                  setIsEditingPin(true);
                }}
                className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold text-xs cursor-pointer flex items-center space-x-1"
              >
                <span>Change Master PIN</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback message */}
        {toggleSuccessMsg && (
          <div className="mt-4 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/70 dark:border-emerald-800/40 flex items-center space-x-1.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{toggleSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
        {kpiList.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{kpi.name}</span>
                <span className="block text-2xl font-extrabold text-slate-900 dark:text-white leading-none">{kpi.value}</span>
                <span className="block text-[10px] text-slate-500 font-semibold">{kpi.change}</span>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${kpi.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              <span>Revenue vs Booking Analytics</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">Monthly aggregation data metrics</span>
          </div>

          <div className="h-64 text-xs font-medium">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f66ff" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f66ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#A0AEC0" />
                <YAxis stroke="#A0AEC0" />
                <Tooltip />
                <Legend verticalAlign="top" height={36}/>
                <Area type="monotone" name="Revenue ($)" dataKey="revenue" stroke="#4f66ff" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" name="Bookings Count" dataKey="bookings" stroke="#06b6d4" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-850 dark:text-white flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-accent-cyan" />
            <span>Recent Payments</span>
          </h3>

          <div className="space-y-3.5 max-h-64 overflow-y-auto">
            {recentPayments.length === 0 ? (
              <div className="text-center p-8 text-xs text-slate-400">No payment events logged yet</div>
            ) : (
              recentPayments.map(p => (
                <div key={p._id} className="flex justify-between items-center text-xs font-semibold pb-3 border-b border-slate-105 dark:border-slate-850 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <p className="text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{p.customerName}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{new Date(p.date).toLocaleDateString()} via {p.paymentMethod}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${p.status === 'Refunded' ? 'text-accent-rose' : 'text-accent-emerald'}`}>
                      {p.status === 'Refunded' ? `-$${Math.abs(p.amount)}` : `+$${p.amount}`}
                    </p>
                    <span className="text-[9px] uppercase font-bold text-slate-400">{p.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
