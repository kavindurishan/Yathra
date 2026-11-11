import React from 'react';

export default function SeatMap({ 
  capacity = 54, 
  busType = 'Normal', 
  bookedSeats = [], 
  femaleSeats = [],
  heldSeats = [],
  selectedSeats = [], 
  onSeatSelect,
  onAdjacentFemaleNotice,
  readOnly = false 
}) {
  const isLuxury = busType === 'Luxury' || busType === 'Super Luxury' || busType === 'AC';
  
  // For Ashok Leyland Non-AC buses: standard 2x3 seating (5 seats per row + rear bench)
  // For Luxury AC buses: standard 2x2 seating (4 seats per row)
  const leftSeatsPerRow = 2; // Always 2 seats on the left (Window A, Aisle B)
  const rightSeatsPerRow = isLuxury ? 2 : 3; // Luxury has 2 on right (C, D), Leyland has 3 on right (C, D, E)
  const standardRowCapacity = leftSeatsPerRow + rightSeatsPerRow; // 5 for Leyland, 4 for Luxury
  
  // Calculate regular rows count (saving 5 seats for the rear bench in 50+ seat Leyland buses)
  const hasRearBench = !isLuxury && capacity >= 48;
  const regularCapacity = hasRearBench ? capacity - 5 : capacity;
  const rowsCount = Math.max(1, Math.ceil(regularCapacity / standardRowCapacity));

  const rows = [];
  let seatCounter = 0;

  for (let r = 1; r <= rowsCount; r++) {
    const leftRowSeats = [];
    const rightRowSeats = [];

    // Left 2 seats: Column A (Window), Column B (Aisle)
    const leftLetters = ['A', 'B'];
    for (let i = 0; i < leftSeatsPerRow; i++) {
      if (seatCounter < regularCapacity) {
        const seatNum = `${r}${leftLetters[i]}`;
        leftRowSeats.push({
          number: seatNum,
          row: r,
          col: leftLetters[i],
          side: 'left',
          type: i === 0 ? 'Window' : 'Aisle',
          isBooked: bookedSeats.includes(seatNum),
          isFemale: femaleSeats.includes(seatNum),
          isHeld: heldSeats.includes(seatNum),
          isSelected: selectedSeats.includes(seatNum)
        });
        seatCounter++;
      }
    }

    // Right seats: Column C (Aisle), Column D (Middle for Leyland / Window for Luxury), Column E (Window for Leyland)
    const rightLetters = isLuxury ? ['C', 'D'] : ['C', 'D', 'E'];
    for (let i = 0; i < rightSeatsPerRow; i++) {
      if (seatCounter < regularCapacity) {
        const seatNum = `${r}${rightLetters[i]}`;
        rightRowSeats.push({
          number: seatNum,
          row: r,
          col: rightLetters[i],
          side: 'right',
          type: isLuxury 
            ? (i === 1 ? 'Window' : 'Aisle')
            : (i === 2 ? 'Window' : i === 1 ? 'Middle' : 'Aisle'),
          isBooked: bookedSeats.includes(seatNum),
          isFemale: femaleSeats.includes(seatNum),
          isHeld: heldSeats.includes(seatNum),
          isSelected: selectedSeats.includes(seatNum)
        });
        seatCounter++;
      }
    }

    rows.push({
      rowNumber: r,
      leftSeats: leftRowSeats,
      rightSeats: rightRowSeats
    });
  }

  // Rear Bench Seats for Lanka Ashok Leyland (5 continuous seats at the rear)
  const rearBenchSeats = [];
  if (hasRearBench) {
    const benchRow = rowsCount + 1;
    const benchLetters = ['B1', 'B2', 'B3', 'B4', 'B5'];
    for (let i = 0; i < 5; i++) {
      const seatNum = `${benchRow}${benchLetters[i]}`;
      rearBenchSeats.push({
        number: seatNum,
        row: benchRow,
        col: benchLetters[i],
        side: 'rear',
        type: i === 0 || i === 4 ? 'Window' : 'Middle',
        isBooked: bookedSeats.includes(seatNum),
        isFemale: femaleSeats.includes(seatNum),
        isHeld: heldSeats.includes(seatNum),
        isSelected: selectedSeats.includes(seatNum)
      });
    }
  }

  // Solo Female Proximity detection
  const getAdjacentSeats = (seat) => {
    const r = seat.row;
    const c = seat.col;
    if (seat.side === 'left') {
      if (c === 'A') return [`${r}B`];
      if (c === 'B') return [`${r}A`];
    } else if (seat.side === 'right') {
      if (isLuxury) {
        if (c === 'C') return [`${r}D`];
        if (c === 'D') return [`${r}C`];
      } else {
        if (c === 'C') return [`${r}D`];
        if (c === 'D') return [`${r}C`, `${r}E`];
        if (c === 'E') return [`${r}D`];
      }
    } else if (seat.side === 'rear') {
      const idx = ['B1', 'B2', 'B3', 'B4', 'B5'].indexOf(c);
      const adj = [];
      if (idx > 0) adj.push(`${r}${['B1', 'B2', 'B3', 'B4', 'B5'][idx - 1]}`);
      if (idx < 4) adj.push(`${r}${['B1', 'B2', 'B3', 'B4', 'B5'][idx + 1]}`);
      return adj;
    }
    return [];
  };

  const handleSeatClick = (seat) => {
    if (readOnly || seat.isBooked || seat.isHeld) return;
    
    // Check female adjacent warning
    if (!seat.isSelected && onAdjacentFemaleNotice) {
      const adjSeats = getAdjacentSeats(seat);
      const femaleAdj = adjSeats.find(sNum => femaleSeats.includes(sNum));
      if (femaleAdj) {
        onAdjacentFemaleNotice(seat.number, femaleAdj);
      }
    }

    if (onSeatSelect) onSeatSelect(seat.number);
  };

  const renderSeatButton = (seat) => {
    let seatStyle = 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-sm';
    let icon = null;
    let title = `Seat ${seat.number} (${seat.type})`;

    if (seat.isSelected) {
      seatStyle = 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30 scale-105 ring-2 ring-emerald-400/50';
      title += ' - Selected (තෝරාගත් ආසනය)';
    } else if (seat.isFemale) {
      seatStyle = 'bg-pink-100 dark:bg-pink-950/70 border-pink-400 dark:border-pink-800 text-pink-700 dark:text-pink-300 cursor-not-allowed';
      icon = '👩';
      title += ' - Booked by Female Passenger (කාන්තා ආසනය)';
    } else if (seat.isBooked) {
      seatStyle = 'bg-slate-200 dark:bg-slate-850 border-slate-300 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed';
      title += ' - Already Booked';
    } else if (seat.isHeld) {
      seatStyle = 'bg-amber-100 dark:bg-amber-950/70 border-amber-400 dark:border-amber-700 text-amber-700 dark:text-amber-300 cursor-not-allowed';
      icon = '⏳';
      title += ' - Held (Checkout in progress)';
    } else {
      if (!readOnly) seatStyle += ' hover:border-cyan-400 dark:hover:border-cyan-400 hover:scale-105 cursor-pointer';
    }

    const disabled = readOnly || seat.isBooked || seat.isHeld;

    return (
      <button
        key={seat.number}
        type="button"
        onClick={() => handleSeatClick(seat)}
        disabled={disabled}
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border-2 text-[10px] font-bold flex flex-col items-center justify-center transition-all select-none ${seatStyle}`}
        title={title}
      >
        <span className="leading-tight flex items-center justify-center space-x-0.5">
          {icon && <span className="text-[8px] leading-none">{icon}</span>}
          <span>{seat.number}</span>
        </span>
        <span className="text-[7px] font-semibold opacity-60 leading-none mt-0.5">
          {seat.type === 'Window' ? 'W' : seat.type === 'Middle' ? 'M' : 'A'}
        </span>
      </button>
    );
  };

  return (
    <div className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm ${readOnly ? 'p-2 border-0 shadow-none bg-transparent dark:bg-transparent' : ''}`}>
      {!readOnly && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Select Bus Seats</span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 px-2.5 py-0.5 rounded-full">
                  {selectedSeats.length} Selected
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isLuxury ? 'Luxury AC Coach • 2x2 Seating' : 'Lanka Ashok Leyland Non-AC • 2x3 Seating'}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                {isLuxury ? '2x2 Expressway VIP' : '2x3 Leyland RHD'}
              </span>
            </div>
          </div>

          {/* Seat Map Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-[11px]">
            <div className="flex items-center space-x-1.5">
              <div className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0" />
              <span className="font-semibold text-slate-600 dark:text-slate-400">Available</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-4 h-4 rounded bg-emerald-500 border-2 border-emerald-400 shrink-0 flex items-center justify-center text-[8px] text-white font-bold">✓</div>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Selected</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 shrink-0" />
              <span className="font-semibold text-slate-500 dark:text-slate-500">Booked</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-4 h-4 rounded bg-pink-100 dark:bg-pink-950/70 border border-pink-400 text-[8px] flex items-center justify-center shrink-0">👩</div>
              <span className="font-semibold text-pink-700 dark:text-pink-300">Female (කාන්තා)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-4 h-4 rounded bg-amber-100 dark:bg-amber-950/70 border border-amber-400 text-[8px] flex items-center justify-center shrink-0">⏳</div>
              <span className="font-semibold text-amber-700 dark:text-amber-300">Held (10m)</span>
            </div>
          </div>
        </>
      )}

      {/* ================= PHYSICAL SRI LANKAN BUS FRAME ================= */}
      <div 
        className="mx-auto border-4 border-slate-300 dark:border-slate-800 rounded-[34px] p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 relative overflow-hidden shadow-xl transition-all duration-300"
        style={{ maxWidth: isLuxury ? '330px' : '390px' }}
      >
        {/* Windshield Header */}
        <div className="h-5 w-3/4 mx-auto bg-gradient-to-b from-slate-200 dark:from-cyan-950/40 to-transparent border-t-2 border-slate-400 dark:border-cyan-500/40 rounded-t-xl mb-4 flex items-center justify-center">
          <span className="text-[9px] uppercase font-black text-slate-500 dark:text-cyan-400 tracking-widest">
            Windshield • ඉදිරිපස වීදුරුව
          </span>
        </div>

        {/* Front Cabin Header: ENTRANCE DOOR (LEFT) vs DRIVER CABIN (RIGHT) */}
        <div className="flex justify-between items-center pb-4 mb-5 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
          
          {/* FRONT LEFT: PASSENGER ENTRANCE DOOR (ඇතුල්වීම) */}
          <div className="flex items-center space-x-2">
            <div 
              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-400 dark:border-emerald-700 text-[9px] font-extrabold text-emerald-700 dark:text-emerald-300 flex flex-col items-center leading-tight shadow-sm"
              title="Front Passenger Entry Door (ඉදිරිපස දොර - ඇතුල්වීම)"
            >
              <span>🚪 Door</span>
              <span className="text-[8px] font-bold">ඇතුල්වීම</span>
            </div>
            <span className="text-[8px] text-slate-400 font-medium leading-none">
              Conductor<br/>Deck
            </span>
          </div>

          <div className="text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider">
            ▲ Front ▲
          </div>

          {/* FRONT RIGHT: DRIVER CABIN (රියදුරු අසුන - RHD) */}
          <div className="flex items-center space-x-2">
            <div className="text-right leading-none">
              <span className="text-[9px] font-bold text-slate-700 dark:text-white block">Driver</span>
              <span className="text-[8px] text-slate-400 font-semibold">රියදුරු</span>
            </div>
            <div 
              className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-900 border-2 border-slate-400 dark:border-cyan-500 text-slate-700 dark:text-cyan-400 flex flex-col items-center justify-center shadow-md"
              title="Driver Cabin - Right Hand Drive (රියදුරු අසුන)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                <path d="M2 12h20"/>
              </svg>
              <span className="text-[7px] font-black uppercase mt-0.5">RHD</span>
            </div>
          </div>
        </div>

        {/* ================= SEATS MATRIX ================= */}
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.rowNumber} className="flex justify-between items-center">
              
              {/* LEFT SIDE: 2 SEATS ROW (Window A, Aisle B) */}
              <div className="flex space-x-1.5 sm:space-x-2">
                {row.leftSeats.map((seat) => renderSeatButton(seat))}
              </div>

              {/* CENTRAL AISLE (ගමන් මග) */}
              <div className="text-[8px] font-mono font-bold text-slate-400 dark:text-slate-600 select-none px-1">
                R{row.rowNumber}
              </div>

              {/* RIGHT SIDE: 3 SEATS ROW for Leyland (C, D, E) / 2 SEATS ROW for Luxury (C, D) */}
              <div className="flex space-x-1.5 sm:space-x-2">
                {row.rightSeats.map((seat) => renderSeatButton(seat))}
              </div>
            </div>
          ))}
        </div>

        {/* REAR LEFT EXIT DOOR (Lanka Ashok Leyland Non-AC Specification) */}
        {!isLuxury && (
          <div className="mt-4 pt-3 border-t-2 border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div 
              className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-400 dark:border-rose-700 text-[9px] font-extrabold text-rose-700 dark:text-rose-300 flex items-center space-x-1.5 shadow-sm"
              title="Rear Passenger Exit Door (පිටුපස දොර - පිටවීම)"
            >
              <span>🚪 Rear Door</span>
              <span className="text-[8px] font-bold">පිටවීම</span>
            </div>
            <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400">
              Emergency Exit Passage
            </span>
          </div>
        )}

        {/* REAR 5-BENCH SEATS (Lanka Ashok Leyland Standard Back Row) */}
        {hasRearBench && rearBenchSeats.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center gap-1 sm:gap-1.5">
              {rearBenchSeats.map((seat) => renderSeatButton(seat))}
            </div>
            <span className="text-[7px] uppercase font-bold text-slate-400 dark:text-slate-600 block text-center mt-1">
              Rear 5-Seat Bench • පසුපස දිගු ආසන පෙළ
            </span>
          </div>
        )}

        {/* Rear Engine Footer */}
        <div className="mt-4 pt-2 border-t border-slate-200 dark:border-slate-850 text-center text-[8px] uppercase tracking-widest font-extrabold text-slate-400 dark:text-slate-600">
          Rear Engine &bull; Sri Lanka Transit Fleet
        </div>
      </div>
    </div>
  );
}
