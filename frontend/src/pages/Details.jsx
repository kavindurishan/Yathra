import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getTrilingualCity } from '../services/cityTranslations';
import SeatMap from '../components/SeatMap';
import { 
  Wifi, BatteryCharging, Tv, Clock, MapPin, 
  ArrowRight, ShieldAlert, Award, Tag, Sparkles, AlertTriangle, Info, CheckCircle2
} from 'lucide-react';

export default function Details() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Seat state
  const [bookedSeats, setBookedSeats] = useState([]);
  const [femaleSeats, setFemaleSeats] = useState([]);
  const [heldSeats, setHeldSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [includeConvenienceFee, setIncludeConvenienceFee] = useState(true);
  
  // Stop selection state
  const [boardingPoint, setBoardingPoint] = useState('');
  const [droppingPoint, setDroppingPoint] = useState('');
  const [boardingTime, setBoardingTime] = useState('');
  const [droppingTime, setDroppingTime] = useState('');

  // Gender warning state
  const [adjacentFemaleNotice, setAdjacentFemaleNotice] = useState(null);

  // Passenger state
  const [passengers, setPassengers] = useState({}); // { '2A': { fullName: '', age: '', gender: 'Male' } }
  
  // Offer state
  const [promoInput, setPromoInput] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [appliedOffer, setAppliedOffer] = useState(null);

  useEffect(() => {
    loadScheduleDetails();
  }, [id]);

  // Helper to calculate stop time based on base departure time and timeOffset
  const calculateStopTime = (baseTime, timeOffset) => {
    if (!baseTime) return '--:--';
    if (!timeOffset) return baseTime;
    try {
      const matchH = timeOffset.match(/(\d+)\s*h/);
      const matchM = timeOffset.match(/(\d+)\s*m/);
      const addMinutes = (matchH ? parseInt(matchH[1]) * 60 : 0) + (matchM ? parseInt(matchM[1]) : 0);
      const [h, m] = baseTime.split(':').map(Number);
      const totalMinutes = h * 60 + m + addMinutes;
      const finalH = Math.floor(totalMinutes / 60) % 24;
      const finalM = totalMinutes % 60;
      return `${String(finalH).padStart(2, '0')}:${String(finalM).padStart(2, '0')}`;
    } catch (e) {
      return baseTime;
    }
  };

  const loadScheduleDetails = async () => {
    setLoading(true);
    setError('');
    try {
      // First try seat-status endpoint which includes concurrency locks & female seats
      const data = await api.schedules.getSeatStatus(id);
      if (data.success && data.schedule) {
        const item = data.schedule;
        setSchedule(item);
        setBookedSeats(data.bookedSeats || []);
        setFemaleSeats(data.femaleSeats || []);
        setHeldSeats(data.heldSeats || []);

        // Initialize Boarding & Dropping points
        const startLoc = item.route.startingLocation;
        const destLoc = item.route.destination;
        setBoardingPoint(startLoc);
        setBoardingTime(item.departureTime);
        setDroppingPoint(destLoc);
        setDroppingTime(item.arrivalTime);
      } else {
        // Fallback to getAll
        const allData = await api.schedules.getAll();
        if (allData.success) {
          const item = allData.schedules.find(s => s._id === id);
          if (item) {
            setSchedule(item);
            setBoardingPoint(item.route.startingLocation);
            setBoardingTime(item.departureTime);
            setDroppingPoint(item.route.destination);
            setDroppingTime(item.arrivalTime);
          } else {
            setError('Schedule details not found.');
          }
        }
      }
    } catch (err) {
      setError('Could not retrieve trip details.');
    } finally {
      setLoading(false);
    }
  };

  // Compile full list of stops with calculated times and trilingual city names
  const getBoardingOptions = () => {
    if (!schedule || !schedule.route) return [];
    const list = [
      { 
        name: schedule.route.startingLocation, 
        time: schedule.departureTime, 
        label: `${getTrilingualCity(schedule.route.startingLocation)} (${schedule.departureTime} - Main Terminal)` 
      }
    ];
    if (schedule.route.stops && Array.isArray(schedule.route.stops)) {
      schedule.route.stops.forEach(s => {
        const time = calculateStopTime(schedule.departureTime, s.timeOffset);
        list.push({ 
          name: s.name, 
          time, 
          label: `${getTrilingualCity(s.name)} (${time})` 
        });
      });
    }
    return list;
  };

  const getDroppingOptions = () => {
    if (!schedule || !schedule.route) return [];
    const list = [];
    if (schedule.route.stops && Array.isArray(schedule.route.stops)) {
      schedule.route.stops.forEach(s => {
        const time = calculateStopTime(schedule.departureTime, s.timeOffset);
        list.push({ 
          name: s.name, 
          time, 
          label: `${getTrilingualCity(s.name)} (${time})` 
        });
      });
    }
    list.push({
      name: schedule.route.destination,
      time: schedule.arrivalTime,
      label: `${getTrilingualCity(schedule.route.destination)} (${schedule.arrivalTime} - End Terminal)`
    });
    return list;
  };

  const handleBoardingChange = (selectedName) => {
    setBoardingPoint(selectedName);
    const options = getBoardingOptions();
    const match = options.find(o => o.name === selectedName);
    if (match) setBoardingTime(match.time);
  };

  const handleDroppingChange = (selectedName) => {
    setDroppingPoint(selectedName);
    const options = getDroppingOptions();
    const match = options.find(o => o.name === selectedName);
    if (match) setDroppingTime(match.time);
  };

  const handleSeatSelect = (seatNum) => {
    let updated;
    if (selectedSeats.includes(seatNum)) {
      updated = selectedSeats.filter(s => s !== seatNum);
      setSelectedSeats(updated);
      
      const copy = { ...passengers };
      delete copy[seatNum];
      setPassengers(copy);

      if (adjacentFemaleNotice && adjacentFemaleNotice.seat === seatNum) {
        setAdjacentFemaleNotice(null);
      }
    } else {
      updated = [...selectedSeats, seatNum];
      setSelectedSeats(updated);
      
      setPassengers({
        ...passengers,
        [seatNum]: { fullName: '', age: '', gender: 'Male' }
      });
    }

    setDiscountAmount(0);
    setPromoSuccess('');
    setPromoError('');
    setAppliedOffer(null);
  };

  const handleAdjacentFemaleNotice = (seatNum, adjSeat) => {
    setAdjacentFemaleNotice({
      seat: seatNum,
      adjacentSeat: adjSeat,
      message: `ආසනය ${seatNum} තෝරාගෙන ඇත. ඊට යාබද ආසනය (${adjSeat}) කාන්තාවක් (Solo Female Traveller) විසින් වෙන්කරගෙන ඇත. කාන්තා මගීන්ගේ සුවපහසුව හා ආරක්ෂාව පිළිබඳ සැලකිලිමත් වන්න.`
    });
  };

  const handlePassengerChange = (seatNum, field, value) => {
    setPassengers({
      ...passengers,
      [seatNum]: {
        ...passengers[seatNum],
        [field]: value
      }
    });
  };

  const handleVerifyPromo = async (e) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    setDiscountAmount(0);
    setAppliedOffer(null);

    if (!selectedSeats.length) {
      setPromoError('Please select seats first.');
      return;
    }

    if (!promoInput) return;

    const baseAmount = schedule.ticketPrice * selectedSeats.length;

    try {
      const data = await api.offers.verify(promoInput, baseAmount);
      if (data.success) {
        const offer = data.offer;
        let discount = 0;
        if (offer.discountType === 'Percentage') {
          discount = baseAmount * (offer.value / 100);
        } else {
          discount = Math.min(offer.value, baseAmount);
        }
        setDiscountAmount(discount);
        setAppliedOffer(offer);
        setPromoSuccess(`Voucher applied! Saved $${discount.toFixed(2)}`);
      } else {
        setPromoError('Invalid promo code');
      }
    } catch (err) {
      setPromoError(err.message || 'Promo code validation failed');
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedSeats.length) {
      alert('Please select at least one seat.');
      return;
    }

    const passArray = [];
    for (let seat of selectedSeats) {
      const p = passengers[seat];
      if (!p || !p.fullName || !p.age) {
        alert(`Please complete the details for passenger in Seat ${seat}`);
        return;
      }
      passArray.push({
        fullName: p.fullName,
        age: parseInt(p.age),
        gender: p.gender,
        seatNumber: seat
      });
    }

    try {
      const data = await api.bookings.create({
        scheduleId: schedule._id,
        passengers: passArray,
        seatsBooked: selectedSeats,
        boardingPoint: boardingPoint || schedule.route.startingLocation,
        droppingPoint: droppingPoint || schedule.route.destination,
        boardingTime: boardingTime || schedule.departureTime,
        droppingTime: droppingTime || schedule.arrivalTime,
        promoCode: appliedOffer ? appliedOffer.code : undefined,
        includeConvenienceFee
      });

      if (data.success) {
        navigate(`/payment/${data.booking._id}`);
      } else {
        alert(data.message || 'Checkout failed');
      }
    } catch (err) {
      alert(err.message || 'Checkout error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading seat layouts and intermediate stop schedules...</p>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center px-4">
        <div className="p-8 bg-rose-50 dark:bg-rose-950/20 text-accent-rose text-sm font-semibold rounded-2xl border border-rose-200/50">
          {error || 'Schedule details not found.'}
        </div>
      </div>
    );
  }

  const basePrice = schedule.ticketPrice * selectedSeats.length;
  const convenienceFee = (selectedSeats.length > 0 && includeConvenienceFee) ? 2 : 0;
  const finalPrice = Math.max(basePrice - discountAmount + convenienceFee, 0);

  const boardingOptions = getBoardingOptions();
  const droppingOptions = getDroppingOptions();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Route header details */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary-500/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 z-10 relative">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-primary-400 bg-primary-950/60 border border-primary-800/40 px-3 py-1 rounded-full inline-block">
              Expressway Intercity Transit
            </span>
            <div className="flex items-center space-x-3">
              <h2 className="font-black text-2xl sm:text-3xl tracking-tight">{getTrilingualCity(schedule.route.startingLocation)}</h2>
              <ArrowRight className="w-6 h-6 text-cyan-400 shrink-0" />
              <h2 className="font-black text-2xl sm:text-3xl tracking-tight">{getTrilingualCity(schedule.route.destination)}</h2>
            </div>
            <p className="text-xs text-slate-300 font-semibold flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>📅 {schedule.departureDate}</span>
              <span>&bull;</span>
              <span>⏰ Departure: {schedule.departureTime}</span>
              <span>&bull;</span>
              <span>⏱️ Total Duration: {schedule.route.duration}</span>
            </p>

            {schedule.route.stops && schedule.route.stops.length > 0 && (
              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 pt-1.5 text-xs">
                <span className="font-extrabold text-cyan-300">Route via:</span>
                {schedule.route.stops.map((stop, sIdx) => (
                  <span 
                    key={sIdx} 
                    className="bg-slate-800/90 text-slate-100 border border-slate-700/80 px-2.5 py-0.5 rounded-md font-bold text-[11px] shadow-sm"
                  >
                    {stop.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Bus Operator Fleet</span>
              <p className="font-bold text-base text-white">{schedule.bus.name}</p>
              <div className="flex items-center justify-end space-x-2 mt-1">
                <span className="text-[10px] font-mono font-bold bg-slate-700 text-slate-200 px-2 py-0.5 rounded">
                  {schedule.bus.busNumber}
                </span>
                <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded uppercase">
                  {schedule.bus.type}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Boarding Point & Dropping Point Selector with Red Traffic Advisory Note */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <MapPin className="w-5 h-5 text-primary-500 shrink-0" />
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Choose Boarding & Dropping Points (නැගෙන සහ බහින නැවතුම් තෝරන්න)
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Select intermediate expressway interchanges or city pickup points with estimated times
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Boarding Point */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Boarding Point (බස් රථයට නැගෙන ස්ථානය / ஏறும் இடம்)
            </label>
            <select
              value={boardingPoint}
              onChange={(e) => handleBoardingChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-sm"
            >
              {boardingOptions.map((opt, i) => (
                <option key={i} value={opt.name}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 pt-1">
              <span>Pickup Point: <strong>{getTrilingualCity(boardingPoint)}</strong></span>
              <span>Pickup Time: <strong className="text-primary-600 dark:text-primary-400">{boardingTime}</strong></span>
            </div>
          </div>

          {/* Dropping Point */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Dropping Point (බස් රථයෙන් බසින ස්ථානය / இறங்கும் இடம்)
            </label>
            <select
              value={droppingPoint}
              onChange={(e) => handleDroppingChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-sm"
            >
              {droppingOptions.map((opt, i) => (
                <option key={i} value={opt.name}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 pt-1">
              <span>Drop Point: <strong>{getTrilingualCity(droppingPoint)}</strong></span>
              <span>Estimated Drop Time: <strong className="text-cyan-600 dark:text-cyan-400">{droppingTime}</strong></span>
            </div>
          </div>
        </div>

        {/* RED COLOR DISCLAIMER: EXACT REQUIREMENT FROM USER */}
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-300/80 dark:border-rose-900/50 rounded-2xl flex items-start space-x-2.5 text-rose-600 dark:text-rose-400 shadow-sm animate-pulse-slow">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <div className="text-xs leading-relaxed">
            <p className="font-extrabold text-rose-700 dark:text-rose-300">
              * මාර්ගයේ රථවාහන තදබදය (Traffic) හෝ අනපේක්ෂිත කාලගුණ තත්ත්වයන් මත මෙම වේලාවන් වෙනස් විය හැක.
            </p>
            <p className="text-[11px] font-semibold opacity-90 mt-0.5">
              (Times may vary depending on road traffic conditions. Please arrive at least 15 minutes prior to the estimated arrival time.)
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Seat Map, Right Booking Checkout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Seat Map */}
        <div className="lg:col-span-5 space-y-4">
          <SeatMap 
            capacity={schedule.bus.seatCapacity}
            busType={schedule.bus.type}
            bookedSeats={bookedSeats}
            femaleSeats={femaleSeats}
            heldSeats={heldSeats}
            selectedSeats={selectedSeats}
            onSeatSelect={handleSeatSelect}
            onAdjacentFemaleNotice={handleAdjacentFemaleNotice}
          />

          {/* Seat Hold Concurrency Active Banner */}
          {selectedSeats.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300/70 dark:border-amber-800/40 p-4 rounded-2xl flex items-start space-x-3 text-amber-800 dark:text-amber-300 text-xs shadow-sm">
              <Clock className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-extrabold">⏱️ 10-Minute Seat Hold Lock Active (ආසන අත්හිටුවීමේ කාලය)</p>
                <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400/90 mt-0.5">
                  Your selected seats ({selectedSeats.join(', ')}) are held exclusively for 10 minutes while you complete checkout. Other passengers cannot take them.
                </p>
              </div>
            </div>
          )}

          {/* Adjacent Female Passenger Notice Toast */}
          {adjacentFemaleNotice && (
            <div className="bg-pink-50 dark:bg-pink-950/30 border border-pink-300/80 dark:border-pink-800/50 p-4 rounded-2xl flex items-start space-x-3 text-pink-800 dark:text-pink-300 text-xs shadow-sm">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-pink-600 dark:text-pink-400" />
              <div>
                <p className="font-extrabold">👩 කාන්තා මගී ආසන ආරක්ෂාව (Female-Friendly Adjacent Seat Notice)</p>
                <p className="text-[11px] font-semibold text-pink-700 dark:text-pink-400/90 mt-0.5">
                  {adjacentFemaleNotice.message}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Passenger Forms & Fare Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleCheckoutSubmit} className="space-y-6">
            {/* Passenger Information Cards */}
            {selectedSeats.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm space-y-3">
                <Sparkles className="w-12 h-12 text-primary-500 mx-auto" />
                <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Ready to reserve your seats?</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Click on the available seats in the bus layout to start your booking. Real-time seats, gender protection, and secure checkout.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-primary-500" />
                    <span>Passenger Information ({selectedSeats.length} Seats)</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-semibold">Government ID / Passport Match</span>
                </div>

                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                  {selectedSeats.map((seat) => (
                    <div key={seat} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 rounded-2xl space-y-3 relative">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                          <span>Passenger for</span>
                          <span className="bg-primary-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                            Seat {seat}
                          </span>
                        </span>
                        {passengers[seat]?.gender === 'Female' && (
                          <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 px-2 py-0.5 rounded-full border border-pink-200 dark:border-pink-800">
                            👩 Female Passenger (Protected)
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1.5">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Kasun Perera"
                            value={passengers[seat]?.fullName || ''}
                            onChange={(e) => handlePassengerChange(seat, 'fullName', e.target.value)}
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Age</label>
                          <input
                            type="number"
                            required
                            min="2"
                            max="100"
                            placeholder="Age"
                            value={passengers[seat]?.age || ''}
                            onChange={(e) => handlePassengerChange(seat, 'age', e.target.value)}
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Gender</label>
                          <select
                            value={passengers[seat]?.gender || 'Male'}
                            onChange={(e) => handlePassengerChange(seat, 'gender', e.target.value)}
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white cursor-pointer"
                          >
                            <option value="Male">Male (පුරුෂ)</option>
                            <option value="Female">Female (ස්ත්‍රී - Protected)</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Apply Promo Form */}
            {selectedSeats.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Discount Promo Code
                </span>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter Code (e.g. YATHRA10)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-black uppercase focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyPromo}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-extrabold rounded-xl text-xs transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-[11px] text-accent-rose font-bold mt-2">{promoError}</p>}
                {promoSuccess && <p className="text-[11px] text-accent-emerald font-bold mt-2 flex items-center space-x-1"><Sparkles className="w-4 h-4" /> <span>{promoSuccess}</span></p>}
              </div>
            )}

            {/* Pricing Breakdown Panel */}
            {selectedSeats.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  Fare Summary & Details
                </h3>

                <div className="space-y-2.5 text-xs font-semibold text-slate-500">
                  <div className="flex justify-between">
                    <span>Selected Boarding Point</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{boardingPoint} ({boardingTime})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Selected Dropping Point</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{droppingPoint} ({droppingTime})</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>Base Ticket Fare (${schedule.ticketPrice} x {selectedSeats.length})</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">${basePrice.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-accent-emerald font-bold">
                      <span>Promo Discount applied ({appliedOffer?.code})</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-1">
                    <label className="flex items-center space-x-2 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeConvenienceFee}
                        onChange={(e) => setIncludeConvenienceFee(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-800 text-primary-600 focus:ring-primary-500 bg-slate-50 dark:bg-slate-950"
                      />
                      <span className="text-slate-500 font-semibold">Convenience Fee</span>
                    </label>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">${convenienceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-3 text-sm font-extrabold text-slate-900 dark:text-white">
                    <span>Total Payment Due</span>
                    <span className="text-primary-600 dark:text-primary-400 text-xl font-black">${finalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Quick Refund & Cancellation Policy Notice */}
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-[11px] text-amber-900 dark:text-amber-300 font-semibold space-y-1">
                  <div className="flex items-center space-x-1.5 font-extrabold text-amber-800 dark:text-amber-200">
                    <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Refund & Reschedule Policy (මුදල් ආපසු ගෙවීමේ දැනුවත් කිරීම):</span>
                  </div>
                  <p className="leading-tight text-[10px]">
                    පිටත්වීමට &gt;24h පෙර: 90% refund | 12-24h පෙර: 75% | 3-12h පෙර: 50% | නොමිලේ ගමන් දිනය මාරු කිරීමේ (Free Reschedule) පහසුකම හිමිවේ.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-2xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all flex items-center justify-center space-x-2 text-sm uppercase tracking-wider"
                >
                  <span>Proceed to Secure Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
