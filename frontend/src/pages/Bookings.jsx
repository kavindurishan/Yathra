import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { getTrilingualCity } from '../services/cityTranslations';
import SeatMap from '../components/SeatMap';
import LiveBusTrackerModal from '../components/LiveBusTrackerModal';
import { 
  Calendar, Ticket, ChevronRight, XCircle, Info, 
  MapPin, AlertCircle, RefreshCcw, Compass, Bus, Phone, MessageSquare, AlertTriangle, ArrowRight
} from 'lucide-react';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [activeTrackingId, setActiveTrackingId] = useState(null);
  
  // Cancellation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Personal issues');
  const [cancelling, setCancelling] = useState(false);

  // Reschedule Modal State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  const [alternativeSchedules, setAlternativeSchedules] = useState([]);
  const [selectedNewScheduleId, setSelectedNewScheduleId] = useState('');
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduleTimeLeft, setRescheduleTimeLeft] = useState(300); // 5 minutes (300 seconds)

  useEffect(() => {
    let timer;
    if (rescheduleModalOpen) {
      setRescheduleTimeLeft(300); // Reset to 5 minutes
      timer = setInterval(() => {
        setRescheduleTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [rescheduleModalOpen]);

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    loadMyBookings();
  }, []);

  const loadMyBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.bookings.getMy();
      if (data.success) {
        setBookings(data.bookings.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (err) {
      setError('Could not retrieve bookings history. Please verify the backend.');
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setCancelModalOpen(true);
  };

  const calculateRefundEstimate = (booking) => {
    if (!booking || !booking.schedule) return { percentage: 90, amount: booking?.totalAmount * 0.9 };
    try {
      const depDateTime = new Date(`${booking.schedule.departureDate}T${booking.schedule.departureTime}:00`);
      const now = new Date();
      const diffHours = (depDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (diffHours >= 24) return { percentage: 90, amount: (booking.totalAmount * 0.9).toFixed(2), tier: '> 24 hours prior' };
      if (diffHours >= 12) return { percentage: 75, amount: (booking.totalAmount * 0.75).toFixed(2), tier: '12 - 24 hours prior' };
      if (diffHours >= 3) return { percentage: 50, amount: (booking.totalAmount * 0.50).toFixed(2), tier: '3 - 12 hours prior' };
      return { percentage: 0, amount: '0.00', tier: '< 3 hours prior (Non-refundable)' };
    } catch (e) {
      return { percentage: 90, amount: (booking.totalAmount * 0.9).toFixed(2), tier: 'Standard Tier' };
    }
  };

  const handleConfirmCancellation = async () => {
    if (!selectedBooking) return;
    setCancelling(true);
    try {
      const data = await api.bookings.cancel(selectedBooking._id, cancelReason);
      if (data.success) {
        setCancelModalOpen(false);
        setSelectedBooking(null);
        setCancelReason('Personal issues');
        loadMyBookings();
      } else {
        alert(data.message || 'Cancellation request was rejected.');
      }
    } catch (err) {
      alert(err.message || 'Could not process cancellation.');
    } finally {
      setCancelling(false);
    }
  };

  const handleOpenReschedule = async (booking) => {
    setRescheduleBooking(booking);
    setRescheduleModalOpen(true);
    setRescheduleError('');
    setLoadingAlternatives(true);

    try {
      const from = booking.schedule.route.startingLocation;
      const to = booking.schedule.route.destination;
      const data = await api.schedules.getAll(from, to);
      if (data.success) {
        // Filter out current schedule and show upcoming active schedules
        const alts = data.schedules.filter(s => s._id !== booking.schedule._id && s.status === 'Active');
        setAlternativeSchedules(alts);
        if (alts.length > 0) {
          setSelectedNewScheduleId(alts[0]._id);
        }
      }
    } catch (err) {
      setRescheduleError('Failed to load alternative trip schedules.');
    } finally {
      setLoadingAlternatives(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleBooking || !selectedNewScheduleId) return;
    setRescheduling(true);
    setRescheduleError('');

    try {
      const data = await api.bookings.reschedule(rescheduleBooking._id, {
        newScheduleId: selectedNewScheduleId
      });

      if (data.success) {
        setRescheduleModalOpen(false);
        setRescheduleBooking(null);
        loadMyBookings();
      } else {
        setRescheduleError(data.message || 'Reschedule failed.');
      }
    } catch (err) {
      setRescheduleError(err.message || 'Could not process rescheduling.');
    } finally {
      setRescheduling(false);
    }
  };

  const getCleanPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading booking records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center space-x-3.5">
        <div className="w-10 h-10 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center">
          <Ticket className="w-5.5 h-5.5 animate-pulse-slow" />
        </div>
        <div>
          <h2 className="font-extrabold text-2xl text-slate-900 dark:text-white leading-tight">My Yathra Journeys</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Manage your road transit boarding passes, live tracking, and rescheduling</p>
        </div>
      </div>

      {error ? (
        <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/20 text-accent-rose text-sm font-semibold rounded-2xl border border-rose-200/50">
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm space-y-4">
          <Compass className="w-12 h-12 text-slate-350 mx-auto" />
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">No active journeys</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't booked any bus boarding tickets yet. Let's find your first premium journey!
          </p>
          <Link
            to="/"
            className="inline-flex px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs"
          >
            Find Buses
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => {
            const isConfirmed = booking.bookingStatus === 'Confirmed';
            const isCancelled = booking.bookingStatus === 'Cancelled';
            const isPending = booking.bookingStatus === 'Pending';
            
            const boardingLoc = booking.boardingPoint || booking.schedule.route.startingLocation;
            const boardingTime = booking.boardingTime || booking.schedule.departureTime;
            const droppingLoc = booking.droppingPoint || booking.schedule.route.destination;
            const droppingTime = booking.droppingTime || booking.schedule.arrivalTime;

            const conductorName = booking.schedule.bus?.conductorName || 'Sunil Shantha';
            const conductorPhone = booking.schedule.bus?.conductorPhone || '+94 77 123 4567';

            return (
              <div 
                key={booking._id} 
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                {/* Visual Status strip */}
                <div className={`absolute left-0 top-0 h-full w-1.5 ${isConfirmed ? 'bg-accent-emerald' : isCancelled ? 'bg-accent-rose' : 'bg-accent-amber'}`} />

                {/* Header info */}
                <div className="flex justify-between items-start pl-2">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Booking Reference</span>
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{booking._id}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isConfirmed ? 'bg-emerald-50 text-accent-emerald border-emerald-100 dark:bg-emerald-950/20' : isCancelled ? 'bg-rose-50 text-accent-rose border-rose-100 dark:bg-rose-950/20' : 'bg-amber-50 text-accent-amber border-amber-100 dark:bg-amber-950/20'}`}>
                      {booking.bookingStatus}
                    </span>
                  </div>
                </div>

                {/* Routing info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 pl-6">
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase">Boarding Point (නැගෙන ස්ථානය / ஏறும் இடம்)</span>
                    <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200 truncate">{getTrilingualCity(boardingLoc)}</p>
                    <p className="text-[10px] text-primary-600 dark:text-primary-400 font-bold">Time: {boardingTime}</p>
                  </div>
                  <div className="text-center no-print">
                    <span className="text-[9px] font-bold text-slate-400">{booking.schedule.route.duration}</span>
                    <div className="h-0.5 border-t border-dashed border-slate-200 dark:border-slate-855 my-1 mx-4" />
                    <span className="text-[9px] text-slate-400 font-mono">{booking.schedule.bus?.busNumber}</span>
                  </div>
                  <div className="sm:text-right">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase">Dropping Point (බහින ස්ථානය / இறங்கும் இடம்)</span>
                    <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200 truncate">{getTrilingualCity(droppingLoc)}</p>
                    <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">Estimated: {droppingTime}</p>
                  </div>
                </div>

                {/* RED TRAFFIC DISCLAIMER */}
                <div className="p-2.5 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl flex items-center space-x-2 text-rose-600 dark:text-rose-400 text-[11px] font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>* මාර්ගයේ රථවාහන තදබදය (Traffic) මත මෙම වේලාවන් වෙනස් විය හැක. (Times may vary due to road traffic conditions).</span>
                </div>

                {/* Passenger list & Conductor row */}
                <div className="flex flex-wrap items-center justify-between pl-2 text-xs font-semibold text-slate-500 gap-4 pt-1">
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="font-bold text-slate-400 mr-1.5">Seats ({booking.seatsBooked.length}):</span>
                    {booking.seatsBooked.map(s => (
                      <span key={s} className="bg-slate-100 dark:bg-slate-850 border border-slate-200/40 dark:border-slate-800 text-[10px] font-bold px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-400">Crew:</span>
                      <a
                        href={`tel:${getCleanPhone(conductorPhone)}`}
                        className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center space-x-1"
                        title="Call Conductor"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{conductorPhone}</span>
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-400">Total:</span>
                      <span className="font-extrabold text-sm text-slate-800 dark:text-white ml-1.5">${booking.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {expandedBookingId === booking._id && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 rounded-xl space-y-3">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Seating Arrangement Review</span>
                    <div className="flex justify-center bg-white dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800/40 max-w-sm mx-auto shadow-inner">
                      <SeatMap 
                        readOnly={true}
                        capacity={booking.schedule.bus.seatCapacity}
                        busType={booking.schedule.bus.type}
                        selectedSeats={booking.seatsBooked}
                        bookedSeats={[]}
                      />
                    </div>
                  </div>
                )}

                {/* Actions Bar */}
                <div className="flex flex-wrap justify-between items-center pl-2 pt-3 border-t border-slate-100 dark:border-slate-800/40 gap-3">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Travel Date: {booking.schedule.departureDate}</span>
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Live Tracker Button */}
                    <button
                      type="button"
                      onClick={() => setActiveTrackingId(booking._id)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 font-bold text-xs border border-cyan-200 dark:border-cyan-800/50 flex items-center space-x-1 transition-colors"
                    >
                      <Bus className="w-3.5 h-3.5" />
                      <span>Live Tracker</span>
                    </button>

                    {/* View Boarding Pass */}
                    {(isConfirmed || isPending) && (
                      <>
                        <button
                          type="button"
                          onClick={() => setExpandedBookingId(expandedBookingId === booking._id ? null : booking._id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-colors flex items-center space-x-1"
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>{expandedBookingId === booking._id ? 'Hide Layout' : 'Seat Layout'}</span>
                        </button>
                        
                        <Link
                          to={`/ticket/${booking._id}`}
                          className="px-3.5 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 transition-all flex items-center space-x-1"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>Boarding Pass</span>
                        </Link>
                      </>
                    )}

                    {/* Reschedule Trip Trigger */}
                    {isConfirmed && (
                      <button
                        onClick={() => handleOpenReschedule(booking)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-900/40 hover:bg-blue-100 transition-colors flex items-center space-x-1"
                      >
                        <RefreshCcw className="w-3.5 h-3.5" />
                        <span>Reschedule</span>
                      </button>
                    )}

                    {/* Cancellation Trigger */}
                    {isConfirmed && (
                      <button
                        onClick={() => handleCancelClick(booking)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 text-accent-rose dark:bg-rose-950/20 dark:text-rose-400 font-bold text-xs border border-rose-200/50 dark:border-rose-900/30 hover:bg-rose-100 transition-colors flex items-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Bus Tracker Modal */}
      {activeTrackingId && (
        <LiveBusTrackerModal 
          bookingId={activeTrackingId} 
          onClose={() => setActiveTrackingId(null)} 
        />
      )}

      {/* Reschedule Modal Overlay */}
      {rescheduleModalOpen && rescheduleBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center space-x-3 text-primary-600">
              <RefreshCcw className="w-7 h-7 shrink-0" />
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">Reschedule Journey</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Change travel date or departure time without penalty
                </p>
              </div>
            </div>

            {/* 5-Minute Reschedule Lock Window Timer */}
            <div className="bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 p-3.5 rounded-2xl flex items-center justify-between text-xs shadow-xs">
              <div className="flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
                <div>
                  <span className="font-extrabold text-primary-900 dark:text-primary-200 block">
                    ⏱️ Reschedule Window: මිනිත්තු 5ක වෙන්කිරීමේ කාලය
                  </span>
                  <span className="text-[10px] text-primary-700 dark:text-primary-400 font-semibold">
                    නව ආසනය තහවුරු කිරීමට ඔබට මිනිත්තු 5ක් (5 Mins) හිමිවේ.
                  </span>
                </div>
              </div>
              <span className={`font-mono font-black text-sm px-2.5 py-1 rounded-xl shadow-xs text-white ${rescheduleTimeLeft < 60 ? 'bg-rose-600 animate-pulse' : 'bg-primary-600'}`}>
                {formatCountdown(rescheduleTimeLeft)}
              </span>
            </div>

            {rescheduleTimeLeft === 0 && (
              <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-200">
                Reschedule time window (5 minutes) has expired. Please close and re-open to check seat availability.
              </div>
            )}

            {rescheduleError && (
              <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-200">
                {rescheduleError}
              </div>
            )}

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Current Trip Details:</span>
              <p className="font-extrabold text-slate-800 dark:text-white">
                {getTrilingualCity(rescheduleBooking.schedule.route.startingLocation)} ➔ {getTrilingualCity(rescheduleBooking.schedule.route.destination)}
              </p>
              <p className="text-slate-500 font-semibold">
                Date: {rescheduleBooking.schedule.departureDate} &bull; Time: {rescheduleBooking.schedule.departureTime}
              </p>
            </div>

            {loadingAlternatives ? (
              <div className="py-8 text-center text-xs font-bold text-slate-400">
                Finding alternative schedules...
              </div>
            ) : alternativeSchedules.length === 0 ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-700 text-xs font-semibold rounded-2xl border border-amber-200">
                No alternative scheduled trips found on this route. Please check back later.
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Select New Schedule Date & Time:
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {alternativeSchedules.map(alt => (
                    <label 
                      key={alt._id}
                      className={`block p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                        selectedNewScheduleId === alt._id 
                          ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/30' 
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="radio" 
                            name="newSchedule" 
                            checked={selectedNewScheduleId === alt._id} 
                            onChange={() => setSelectedNewScheduleId(alt._id)}
                            className="text-primary-600 focus:ring-primary-500"
                          />
                          <div>
                            <span className="font-black text-slate-850 dark:text-white">{alt.departureDate}</span>
                            <span className="ml-2 font-bold text-primary-600 dark:text-primary-400">at {alt.departureTime}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{alt.bus.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRescheduleModalOpen(false)}
                className="py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                disabled={rescheduling || !selectedNewScheduleId || rescheduleTimeLeft === 0}
                className="py-3 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-xl text-xs shadow-md shadow-primary-500/20 transition-all disabled:opacity-50"
              >
                {rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transparent Cancellation Modal Overlay */}
      {cancelModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center space-x-3.5 text-accent-rose">
              <AlertCircle className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="font-black text-lg text-slate-950 dark:text-white leading-tight">Confirm Cancellation</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Booking ID: {selectedBooking._id}</p>
              </div>
            </div>

            {/* Transparent Sri Lankan Bus Cancellation Policy Breakdown */}
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-900/50 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-amber-200 dark:border-amber-900/40">
                <span className="font-extrabold uppercase tracking-wider text-[10px]">Cancellation Refund Tier:</span>
                <span className="font-black text-xs text-amber-700 dark:text-amber-400">
                  {calculateRefundEstimate(selectedBooking).tier}
                </span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span>Total Payment:</span>
                <span>${selectedBooking.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between font-extrabold text-sm text-emerald-700 dark:text-emerald-400 pt-1 border-t border-amber-200 dark:border-amber-900/40">
                <span>Calculated Refund ({calculateRefundEstimate(selectedBooking).percentage}%):</span>
                <span>${calculateRefundEstimate(selectedBooking).amount}</span>
              </div>
              <p className="text-[10px] text-amber-700 dark:text-amber-400/90 leading-tight pt-1">
                Policy: &gt;24h = 90% refund | 12-24h = 75% | 3-12h = 50% | &lt;3h = 0%. Refund processed directly to your wallet/bank.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cancellation Reason</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
              >
                <option value="Personal issues">Personal issues / Family emergency</option>
                <option value="Schedule overlap">Change of travel itinerary</option>
                <option value="Bad weather">Inclement weather warnings</option>
                <option value="Alternative transit">Selected alternative transit method</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCancelModalOpen(false);
                  setSelectedBooking(null);
                }}
                className="py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancellation}
                disabled={cancelling}
                className="py-3 bg-accent-rose hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-rose-500/10 transition-all disabled:opacity-50"
              >
                {cancelling ? 'Processing...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
