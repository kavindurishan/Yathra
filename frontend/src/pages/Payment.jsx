import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import SeatMap from '../components/SeatMap';
import { 
  CreditCard, Wallet, Landmark, Banknote, ShieldCheck, 
  Lock, Calendar, HelpCircle, ArrowRight, AlertTriangle, AlertCircle, CheckCircle2, Clock
} from 'lucide-react';

export default function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form State
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [policyAgreed, setPolicyAgreed] = useState(true);

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.bookings.getMy();
      if (data.success) {
        const matched = data.bookings.find(b => b._id === bookingId);
        if (matched) {
          setBooking(matched);
        } else {
          setError('Booking record not found.');
        }
      }
    } catch (err) {
      setError('Could not retrieve checkout details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!policyAgreed) {
      alert('Please acknowledge and agree to the Cancellation & Refund Policy before proceeding.');
      return;
    }

    setProcessing(true);
    try {
      const data = await api.bookings.pay({
        bookingId,
        paymentMethod,
        cardDetails: paymentMethod === 'Card' ? { cardNumber, expiry, cvv, cardName } : undefined
      });

      if (data.success) {
        navigate(`/ticket/${bookingId}`);
      } else {
        alert(data.message || 'Payment processing failed.');
      }
    } catch (err) {
      alert(err.message || 'Network processing error.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Initializing checkout transaction...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center px-4">
        <div className="p-8 bg-rose-50 dark:bg-rose-950/20 text-accent-rose text-sm font-semibold rounded-2xl border border-rose-200/50">
          {error || 'Booking details not found.'}
        </div>
      </div>
    );
  }

  const boardingLoc = booking.boardingPoint || booking.schedule.route.startingLocation;
  const boardingTime = booking.boardingTime || booking.schedule.departureTime;
  const droppingLoc = booking.droppingPoint || booking.schedule.route.destination;
  const droppingTime = booking.droppingTime || booking.schedule.arrivalTime;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Payment Selection Panel */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-primary-500" />
              <span>Choose Payment Method</span>
            </h3>

            {/* Methods Selectors grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: 'Card', name: 'Credit/Debit Card', icon: CreditCard },
                { id: 'Online Wallet', name: 'Online Wallet / LankaPay', icon: Wallet },
                { id: 'Bank Transfer', name: 'Bank Transfer', icon: Landmark },
                { id: 'Cash', name: 'Cash Counter / MMC', icon: Banknote },
              ].map(method => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex flex-col items-center p-4 rounded-2xl border-2 font-bold text-center gap-2 select-none transition-all ${isSelected ? 'bg-primary-50/40 border-primary-500 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400 shadow-md shadow-primary-500/10' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 hover:bg-slate-100/50'}`}
                  >
                    <Icon className="w-6 h-6 shrink-0" />
                    <span className="text-[11px] leading-tight">{method.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Nested Interactive Card Form */}
            {paymentMethod === 'Card' ? (
              <form onSubmit={handlePaymentSubmit} className="space-y-5">
                <div className="bg-gradient-to-tr from-slate-900 via-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 text-white space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary-600/10 blur-2xl pointer-events-none" />
                  
                  {/* Card Header visual */}
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Yathra Digital Transit Card</span>
                    <div className="w-10 h-6 rounded bg-white/10 flex items-center justify-center font-black text-[9px] tracking-widest">VISA</div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Card Number</span>
                    <p className="font-mono text-xl tracking-widest text-slate-200">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </p>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Cardholder Name</span>
                      <p className="font-bold text-xs tracking-wide truncate max-w-[180px] uppercase">
                        {cardName || 'YOUR FULL NAME'}
                      </p>
                    </div>
                    <div className="flex space-x-5">
                      <div className="space-y-1 text-right">
                        <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Expires</span>
                        <p className="font-mono text-xs font-bold">{expiry || 'MM/YY'}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">CVV</span>
                        <p className="font-mono text-xs font-bold">{cvv || '•••'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kasun Perera"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      maxLength="19"
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expiration Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      maxLength="5"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Security Code (CVV)</label>
                    <input
                      type="password"
                      required
                      maxLength="4"
                      placeholder="•••"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                  </div>
                </div>

                {/* ADVANCE REFUND & CANCELLATION POLICY DISCLOSURE (PROMINENT ALERT) */}
                <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300/80 dark:border-amber-900/60 p-5 rounded-2xl space-y-3 text-amber-900 dark:text-amber-300 shadow-sm">
                  <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-200">
                    <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <h4 className="font-black text-sm">
                      Refund & Cancellation Policy Disclosure (ගෙවීම කිරීමට පෙර සැලකිලිමත් වන්න)
                    </h4>
                  </div>

                  <p className="text-xs font-semibold leading-relaxed text-amber-850 dark:text-amber-300/90">
                    ගෙවීම සම්පූර්ණ කිරීමට පෙර කරුණාකර අපගේ අවලංගු කිරීමේ සහ මුදල් ආපසු ගෙවීමේ නීතිරීති (Refund Tiers) පිළිබඳව සැලකිලිමත් වන්න:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold pt-1">
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/40 text-center shadow-xs">
                      <span className="text-[10px] text-slate-400 block">&gt; 24 Hours Prior</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm block">90% Refund</span>
                      <span className="text-[9px] text-slate-400 block">(10% fee)</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/40 text-center shadow-xs">
                      <span className="text-[10px] text-slate-400 block">12 - 24 Hours</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm block">75% Refund</span>
                      <span className="text-[9px] text-slate-400 block">(25% fee)</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/40 text-center shadow-xs">
                      <span className="text-[10px] text-slate-400 block">3 - 12 Hours</span>
                      <span className="text-amber-600 dark:text-amber-400 font-black text-sm block">50% Refund</span>
                      <span className="text-[9px] text-slate-400 block">(50% fee)</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/40 text-center shadow-xs">
                      <span className="text-[10px] text-slate-400 block">&lt; 3 Hours Prior</span>
                      <span className="text-rose-600 dark:text-rose-400 font-black text-sm block">0% (No Refund)</span>
                      <span className="text-[9px] text-slate-400 block">Non-refundable</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-center space-x-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      💡 <strong>නොමිලේ දිනය මාරු කිරීම (Free Rescheduling):</strong> මුදල් අහිමි වීමකින් තොරව ඔබගේ ගමන වෙනත් දිනයකට හෝ වේලාවකට මිනිත්තු 5ක් ඇතුළත පහසුවෙන්ම නොමිලේ මාරු කරගත හැක.
                    </span>
                  </div>

                  <label className="flex items-start space-x-2.5 pt-2 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policyAgreed}
                      onChange={(e) => setPolicyAgreed(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-amber-400 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      I have read and agree to the Cancellation & Refund Policy (මම මුදල් ආපසු ගෙවීමේ කොන්දේසි කියවා එකඟ වෙමි).
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={processing || !policyAgreed}
                  className="w-full mt-6 py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all text-sm uppercase tracking-wider flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{processing ? 'Authorizing Payment...' : `Pay $${booking.totalAmount.toFixed(2)}`}</span>
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                  You have selected <strong className="text-slate-900 dark:text-white">{paymentMethod}</strong>. No online credentials are required for this transaction. The reservation code will be immediately saved, and you can pay during boarding or arrival at the bus interchange counter.
                </p>

                {/* ADVANCE REFUND & CANCELLATION POLICY DISCLOSURE (PROMINENT ALERT) */}
                <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300/80 dark:border-amber-900/60 p-5 rounded-2xl space-y-3 text-amber-900 dark:text-amber-300 shadow-sm">
                  <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-200">
                    <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <h4 className="font-black text-sm">
                      Refund & Cancellation Policy Disclosure (ගෙවීම කිරීමට පෙර සැලකිලිමත් වන්න)
                    </h4>
                  </div>

                  <p className="text-xs font-semibold leading-relaxed text-amber-850 dark:text-amber-300/90">
                    ගෙවීම සම්පූර්ණ කිරීමට පෙර කරුණාකර අපගේ අවලංගු කිරීමේ සහ මුදල් ආපසු ගෙවීමේ නීතිරීති (Refund Tiers) පිළිබඳව සැලකිලිමත් වන්න:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold pt-1">
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/40 text-center">
                      <span className="text-[10px] text-slate-400 block">&gt; 24 Hours Prior</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm block">90% Refund</span>
                      <span className="text-[9px] text-slate-400 block">(10% fee)</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/40 text-center">
                      <span className="text-[10px] text-slate-400 block">12 - 24 Hours</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm block">75% Refund</span>
                      <span className="text-[9px] text-slate-400 block">(25% fee)</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/40 text-center">
                      <span className="text-[10px] text-slate-400 block">3 - 12 Hours</span>
                      <span className="text-amber-600 dark:text-amber-400 font-black text-sm block">50% Refund</span>
                      <span className="text-[9px] text-slate-400 block">(50% fee)</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/40 text-center">
                      <span className="text-[10px] text-slate-400 block">&lt; 3 Hours Prior</span>
                      <span className="text-rose-600 dark:text-rose-400 font-black text-sm block">0% (No Refund)</span>
                      <span className="text-[9px] text-slate-400 block">Non-refundable</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-center space-x-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      💡 <strong>නොමිලේ දිනය මාරු කිරීම (Free Rescheduling):</strong> මුදල් අහිමි වීමකින් තොරව ඔබගේ ගමන වෙනත් දිනයකට හෝ වේලාවකට මිනිත්තු 5ක් ඇතුළත පහසුවෙන්ම නොමිලේ මාරු කරගත හැක.
                    </span>
                  </div>

                  <label className="flex items-start space-x-2.5 pt-2 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policyAgreed}
                      onChange={(e) => setPolicyAgreed(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-amber-400 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      I have read and agree to the Cancellation & Refund Policy (මම මුදල් ආපසු ගෙවීමේ කොන්දේසි කියවා එකඟ වෙමි).
                    </span>
                  </label>
                </div>

                <button
                  onClick={handlePaymentSubmit}
                  disabled={processing || !policyAgreed}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl shadow-lg shadow-primary-500/20 transition-all text-sm uppercase tracking-wider flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{processing ? 'Saving Reservation...' : 'Confirm Booking'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Itinerary Booking Review Card */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900 text-white border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary-500/10 blur-2xl pointer-events-none" />
            
            <h3 className="font-black text-lg text-white border-b border-slate-800 pb-3">
              Booking Review
            </h3>

            <div className="space-y-4">
              <div className="flex items-center space-x-3.5">
                <div>
                  <span className="block text-[8px] font-bold text-slate-500 uppercase">Boarding Point</span>
                  <p className="font-extrabold text-sm text-slate-200 truncate">{boardingLoc}</p>
                  <p className="text-[10px] text-primary-400 font-bold">{boardingTime}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="block text-[8px] font-bold text-slate-500 uppercase">Dropping Point</span>
                  <p className="font-extrabold text-sm text-slate-200 truncate">{droppingLoc}</p>
                  <p className="text-[10px] text-cyan-400 font-bold">{droppingTime}</p>
                </div>
              </div>

              {/* Red Traffic Disclaimer on Checkout */}
              <div className="p-2.5 bg-rose-950/40 border border-rose-900/60 rounded-xl text-rose-300 text-[10px] font-bold flex items-start space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
                <span>* මාර්ගයේ රථවාහන තදබදය (Traffic) මත මෙම වේලාවන් සුළු වශයෙන් වෙනස් විය හැක.</span>
              </div>

              <div>
                <span className="block text-[8px] font-bold text-slate-500 uppercase">Travel Date</span>
                <p className="font-bold text-xs text-slate-200">{booking.schedule.departureDate}</p>
              </div>

              <div>
                <span className="block text-[8px] font-bold text-slate-500 uppercase">Selected Seats</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {booking.seatsBooked.map(seat => (
                    <span key={seat} className="bg-primary-950/80 border border-primary-700/60 text-primary-300 text-[10px] font-black px-2.5 py-0.5 rounded-lg">
                      Seat {seat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-3">
                <span className="block text-[8px] font-bold text-slate-500 uppercase mb-2">Seating Arrangement</span>
                <div className="bg-slate-950/60 p-2 rounded-2xl border border-slate-800">
                  <SeatMap 
                    readOnly={true}
                    capacity={booking.schedule.bus.seatCapacity}
                    busType={booking.schedule.bus.type}
                    selectedSeats={booking.seatsBooked}
                    bookedSeats={[]}
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-400">Total Payable</span>
                <span className="font-black text-2xl text-cyan-400">${booking.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
