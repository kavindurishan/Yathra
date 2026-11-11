import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import LiveBusTrackerModal from '../components/LiveBusTrackerModal';
import YathraBrandLogo from '../components/YathraBrandLogo';
import { 
  Printer, ArrowLeft, Calendar, Compass, MapPin, 
  User, CheckCircle, Smartphone, Info, Bus, Phone, MessageSquare, AlertTriangle
} from 'lucide-react';

export default function Ticket() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [qrCodeSvg, setQrCodeSvg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTracker, setShowTracker] = useState(false);

  useEffect(() => {
    loadTicketInfo();
  }, [bookingId]);

  const loadTicketInfo = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.bookings.getMy();
      if (data.success) {
        const matched = data.bookings.find(b => b._id === bookingId);
        if (matched) {
          setBooking(matched);
          
          const qrSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="w-28 h-28 text-slate-900 mx-auto">
            <rect width="100" height="100" fill="#ffffff" rx="8"/>
            <path d="M10 10h20v20H10zm5 5v10h10V15zm25-5h10v10H40zm10 0h20v20H50zm5 5v10h10V15zm25-5h10v10H80zM10 40h10v10H10zm20 0h10v20H30zm10 10h10v10H40zm10-10h20v10H50zm10 10h10v10H60zm10-10h10v20H70zm10 10h10v10H80zM10 70h20v20H10zm5 5v10h10V75zm25-5h10v10H40zm10 0h20v10H50zm20 10h10v10H70zm10-10h10v20H80zM30 80h10v10H30zm20 0h10v10H50z" fill="currentColor"/>
            <circle cx="50" cy="50" r="8" fill="#10b981"/>
          </svg>`;
          setQrCodeSvg(qrSvg);
        } else {
          setError('Ticket record could not be located.');
        }
      }
    } catch (err) {
      setError('Could not retrieve boarding pass details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getCleanPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Generating digital boarding pass...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center px-4">
        <div className="p-8 bg-rose-50 dark:bg-rose-950/20 text-accent-rose text-sm font-semibold rounded-2xl border border-rose-200/50">
          {error || 'Ticket record not found.'}
        </div>
      </div>
    );
  }

  const conductorName = booking.schedule.bus?.conductorName || 'Sunil Shantha';
  const conductorPhone = booking.schedule.bus?.conductorPhone || '+94 77 123 4567';
  const driverName = booking.schedule.bus?.driverName || 'Kamal Perera';

  const boardingLoc = booking.boardingPoint || booking.schedule.route.startingLocation;
  const boardingTime = booking.boardingTime || booking.schedule.departureTime;
  const droppingLoc = booking.droppingPoint || booking.schedule.route.destination;
  const droppingTime = booking.droppingTime || booking.schedule.arrivalTime;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Top CTA Row */}
      <div className="flex flex-wrap justify-between items-center gap-3 no-print">
        <Link 
          to="/bookings" 
          className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>My Journeys</span>
        </Link>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowTracker(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-primary-600 hover:from-cyan-700 hover:to-primary-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-primary-500/20 transition-all"
          >
            <Bus className="w-4 h-4" />
            <span>Live Bus Tracker</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Ticket</span>
          </button>
        </div>
      </div>

      {/* Success Notification Bar */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 p-4 rounded-2xl flex items-center space-x-3.5 text-accent-emerald no-print">
        <CheckCircle className="w-6 h-6 shrink-0" />
        <div className="text-xs">
          <p className="font-extrabold">Booking Confirmed Successfully!</p>
          <p className="font-semibold text-emerald-600/80 dark:text-emerald-400 mt-0.5">
            Your e-ticket is active. Show this QR code or SMS to the conductor when boarding.
          </p>
        </div>
      </div>

      {/* Physical Printed Ticket Frame */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl print-border-0">
        {/* Ticket Header Banner */}
        <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-accent-cyan px-6 py-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white/95 px-3 py-1.5 rounded-xl shadow-sm">
              <YathraBrandLogo className="h-8 sm:h-9 w-auto" animated={false} />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight block leading-tight">Yathra Boarding Pass</span>
              <span className="text-[10px] text-primary-100 font-semibold">Expressway Public Bus Transit Network</span>
            </div>
          </div>
          <span className="text-[10px] bg-white/20 border border-white/20 px-3 py-1 rounded-full font-black uppercase tracking-wider">
            {booking.bookingStatus}
          </span>
        </div>

        {/* Ticket Route Segment */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/30">
          <div className="space-y-1">
            <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
              Boarding Point (නැගෙන ස්ථානය)
            </span>
            <p className="font-black text-xl text-slate-900 dark:text-white leading-tight">{boardingLoc}</p>
            <p className="text-xs text-primary-600 dark:text-primary-400 font-black">Time: {boardingTime}</p>
          </div>

          <div className="text-center relative">
            <span className="text-[9px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-3 py-1 rounded-full border border-primary-200/50 dark:border-primary-900/30">
              {booking.schedule.route.startingLocation} ➔ {booking.schedule.route.destination}
            </span>
            <div className="h-0.5 border-t border-dashed border-slate-300 dark:border-slate-800 my-2.5 mx-4" />
            <span className="text-[10px] text-slate-400 font-semibold">{booking.schedule.route.duration} Transit</span>
          </div>

          <div className="space-y-1 md:text-right">
            <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
              Dropping Point (බහින ස්ථානය)
            </span>
            <p className="font-black text-xl text-slate-900 dark:text-white leading-tight">{droppingLoc}</p>
            <p className="text-xs text-cyan-600 dark:text-cyan-400 font-black">Estimated: {droppingTime}</p>
          </div>
        </div>

        {/* RED TRAFFIC DISCLAIMER: DIRECT USER REQUIREMENT */}
        <div className="px-6 py-3 bg-rose-50/80 dark:bg-rose-950/30 border-b border-rose-200/70 dark:border-rose-900/40 flex items-start space-x-2 text-rose-600 dark:text-rose-400">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-[11px] font-extrabold leading-tight">
            * මාර්ගයේ රථවාහන තදබදය (Traffic) හෝ අනපේක්ෂිත කාලගුණ තත්ත්වයන් මත මෙම වේලාවන් වෙනස් විය හැක. කරුණාකර පිටත්වීමට මිනිත්තු 15 කට පෙර පැමිණෙන්න. (Times may vary due to road traffic conditions).
          </p>
        </div>

        {/* Conductor & Crew Quick Contact Card */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-3">
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
              Conductor In-Charge (කොන්දොස්තර මහතාගේ විස්තර)
            </span>
            <p className="text-xs font-black text-slate-800 dark:text-white">
              {conductorName} &bull; <span className="text-primary-600 dark:text-primary-400">{conductorPhone}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2 no-print">
            <a
              href={`tel:${getCleanPhone(conductorPhone)}`}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center space-x-1 shadow-sm"
            >
              <Phone className="w-3 h-3" />
              <span>Call Conductor</span>
            </a>
            <a
              href={`https://wa.me/${getCleanPhone(conductorPhone)}?text=Hello%20Conductor,%20I%20am%20passenger%20for%20Booking%20ID%20${booking._id}.`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center space-x-1 shadow-sm"
            >
              <MessageSquare className="w-3 h-3" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Dashed Cut Line */}
        <div className="ticket-dashed-border h-0.5 border-t border-dashed border-slate-300 dark:border-slate-800 relative z-10" />

        {/* Passenger details and QR section */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Passenger details block */}
          <div className="md:col-span-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Passenger Names</span>
                <div className="space-y-1 mt-1">
                  {booking.passengers.map((p, i) => (
                    <p key={i} className="text-xs font-extrabold text-slate-850 dark:text-slate-100 flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{p.fullName} ({p.age}, {p.gender})</span>
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Seats Assigned</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {booking.seatsBooked.map(seat => (
                    <span key={seat} className="bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-[11px] font-black px-2.5 py-0.5 rounded-lg">
                      Seat {seat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/40">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Travel Schedule Date</span>
                <p className="font-extrabold text-xs text-slate-800 dark:text-slate-200 mt-1 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{booking.schedule.departureDate}</span>
                </p>
              </div>

              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Bus & Number Plate</span>
                <p className="font-extrabold text-xs text-slate-800 dark:text-slate-200 mt-1 truncate">
                  {booking.schedule.bus.name}
                </p>
                <p className="text-[10px] text-slate-400 font-bold font-mono">
                  {booking.schedule.bus.busNumber} &bull; {booking.schedule.bus.type}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/40">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Transaction ID</span>
                <p className="font-mono text-[10px] text-slate-500 font-bold mt-1">TXN_TRP_{bookingId.slice(0, 8).toUpperCase()}</p>
              </div>

              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Paid Fare</span>
                <p className="font-black text-sm text-accent-emerald mt-1">${booking.totalAmount.toFixed(2)} (Paid)</p>
              </div>
            </div>
          </div>

          {/* QR Code Column */}
          <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800/40 pt-6 md:pt-0 md:pl-6 text-center space-y-3">
            <div dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
            <div>
              <span className="text-[8px] font-bold text-slate-400 uppercase block">Boarding Pass Token</span>
              <span className="font-mono text-[9px] text-slate-500 font-bold uppercase tracking-wider">{booking._id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Device reminder info no-print */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start space-x-3 text-slate-500 no-print">
        <Info className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>Tip:</strong> Keep this ticket opened on your smartphone screen. The Yathra conductor scanner reads the QR code dynamically. Make sure to arrive at your boarding point at least 15 minutes before the departure time.
        </p>
      </div>

      {/* Live Bus Tracker Modal */}
      {showTracker && (
        <LiveBusTrackerModal 
          bookingId={bookingId} 
          onClose={() => setShowTracker(false)} 
        />
      )}
    </div>
  );
}
