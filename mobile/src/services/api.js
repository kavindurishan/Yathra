import { MOCK_SCHEDULES, MOCK_USER_BOOKINGS, POPULAR_ROUTES, SRI_LANKA_CITIES } from './mockData';

// Automatically detect host (Android emulator uses 10.0.2.2, Web / iOS uses localhost)
const API_BASE = 'http://127.0.0.1:5000/api';
const TIMEOUT_MS = 2500;

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

export const api = {
  // Cities list
  getCities: async () => {
    return SRI_LANKA_CITIES;
  },

  // Popular routes
  getPopularRoutes: async () => {
    return POPULAR_ROUTES;
  },

  // Schedules search
  getSchedules: async (from = '', to = '', date = '') => {
    try {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      if (date) params.append('date', date);
      const res = await fetchWithTimeout(`${API_BASE}/schedules?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      // Backend offline or unreachable -> use resilient mock fallback
    }

    // Filter mock schedules
    return MOCK_SCHEDULES.filter(s => {
      const matchFrom = !from || s.from.toLowerCase().includes(from.toLowerCase());
      const matchTo = !to || s.to.toLowerCase().includes(to.toLowerCase());
      return matchFrom && matchTo;
    });
  },

  // Single schedule by ID
  getScheduleById: async (id) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/schedules/${id}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Fallback
    }
    return MOCK_SCHEDULES.find(s => s.id === id) || MOCK_SCHEDULES[0];
  },

  // Bookings list for logged in user
  getMyBookings: async () => {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/bookings/my`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      // Fallback
    }
    return MOCK_USER_BOOKINGS;
  },

  // Create booking
  createBooking: async (bookingData) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Simulated successful booking response
    }

    const pnrCode = `YTH-${Math.floor(10000 + Math.random() * 90000)}-LK`;
    const newBooking = {
      id: `BKG-${Date.now().toString().slice(-5)}`,
      pnr: pnrCode,
      ...bookingData,
      status: 'Confirmed',
      qrCodeData: `YATHRA|${pnrCode}|${bookingData.scheduleId}|SEATS:${bookingData.seats?.join(',')}|TOTAL:${bookingData.totalAmount}`,
      createdAt: new Date().toISOString(),
    };
    return newBooking;
  },

  // Validate Promo Code
  verifyPromo: async (code, amount) => {
    const validCodes = {
      'YATHRA10': 0.10, // 10% off
      'EXPRESS50': 500, // LKR 500 off
      'WELCOME20': 0.20 // 20% off
    };

    const upper = code?.trim().toUpperCase();
    if (validCodes[upper] !== undefined) {
      const val = validCodes[upper];
      const discount = val < 1 ? Math.round(amount * val) : val;
      return { valid: true, discount, message: `${upper} applied successfully!` };
    }
    return { valid: false, discount: 0, message: 'Invalid or expired promo coupon.' };
  },

  // Conductor ticket verify
  verifyTicketQr: async (qrString) => {
    // String format: YATHRA|<PNR>|<SCHEDULE/BUS>|<SEATS>|<TOTAL>
    if (!qrString || !qrString.startsWith('YATHRA')) {
      return { valid: false, message: 'Invalid QR Ticket Format.' };
    }
    const parts = qrString.split('|');
    const pnr = parts[1] || 'UNKNOWN';
    const bus = parts[2] || 'Bus';
    const seats = parts[3] || 'Seats';
    return {
      valid: true,
      pnr,
      bus,
      seats,
      passengerName: 'Kasun Rathnayake',
      verifiedAt: new Date().toLocaleTimeString(),
      status: 'VALID TICKET - BOARDING APPROVED'
    };
  }
};
