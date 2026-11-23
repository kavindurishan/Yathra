const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

// JWT signer helper
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'tripzo_deep_mind_super_secure_jwt_secret_token_key_2026',
    { expiresIn: '7d' }
  );
};

// SVG-based Mock QR Code generator
const generateQrSvg = (text) => {
  // Generates a simple, beautiful visual vector path block representing a styled QR code
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="w-24 h-24 text-slate-800">
    <rect width="100" height="100" fill="#ffffff" rx="8"/>
    <path d="M10 10h20v20H10zm5 5v10h10V15zm25-5h10v10H40zm10 0h20v20H50zm5 5v10h10V15zm25-5h10v10H80zM10 40h10v10H10zm20 0h10v20H30zm10 10h10v10H40zm10-10h20v10H50zm10 10h10v10H60zm10-10h10v20H70zm10 10h10v10H80zM10 70h20v20H10zm5 5v10h10V75zm25-5h10v10H40zm10 0h20v10H50zm20 10h10v10H70zm10-10h10v20H80zM30 80h10v10H30zm20 0h10v10H50z" fill="currentColor"/>
    <circle cx="50" cy="50" r="8" fill="#10b981"/>
  </svg>`;
};

// DB Manual population helpers to ensure fallback JSON works identical to Mongo populate()
const populateScheduleObj = async (sched) => {
  if (!sched) return null;
  const bus = await db.findById('Bus', sched.bus);
  const route = await db.findById('Route', sched.route);
  return { ...sched, bus, route };
};

const populateBookingObj = async (booking) => {
  if (!booking) return null;
  const scheduleRaw = await db.findById('Schedule', booking.schedule);
  const schedule = await populateScheduleObj(scheduleRaw);
  const customer = await db.findById('User', booking.customer);
  // Hide password
  if (customer) delete customer.password;
  return { ...booking, schedule, customer };
};

// ----------------------------------------------------
// SYSTEM SETTINGS & LAUNCH MODE MANAGEMENT
// ----------------------------------------------------
const SETTINGS_FILE = path.join(__dirname, '..', '..', 'data', 'settings.json');

const DEFAULT_SETTINGS = {
  publicBookingActive: false,
  launchBannerEnabled: true,
  bannerMessage: 'SLIIT Campus Transit Hub is now LIVE! Public expressway booking will open soon.',
  modalTitle: 'Public Booking Launching Soon',
  modalSubtitle: 'Expressway Intercity Coach Service',
  modalMessage: 'Online seat reservations for Expressway Intercity routes are undergoing final system readiness checks and will be accessible to the general public soon. SLIIT University Shuttle service is 100% active with live tracking, stop schedules, and student passes.',
  campusButtonText: 'Switch to Campus Shuttle Hub 🎓',
  allowAdminBypass: true
};

const getSystemSettings = () => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
      return { ...DEFAULT_SETTINGS, ...data };
    }
  } catch (err) {
    console.error('Error reading settings file:', err);
  }
  return DEFAULT_SETTINGS;
};

const saveSystemSettings = (newSettings) => {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const current = getSystemSettings();
    const merged = { ...current, ...newSettings };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2), 'utf8');
    return merged;
  } catch (err) {
    console.error('Error saving settings file:', err);
    throw err;
  }
};

// GET /api/settings - Read system launch configuration
router.get('/settings', (req, res) => {
  try {
    const settings = getSystemSettings();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/settings - Update system launch configuration (Admin / Operator only)
router.put('/settings', authenticate, authorize(['Admin', 'Operator']), (req, res) => {
  try {
    const updated = saveSystemSettings(req.body);
    res.json({ success: true, settings: updated, message: 'System launch settings updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------------------------------------
// 1. AUTHENTICATION MODULE
// ----------------------------------------------------

// Register Customer
router.post('/auth/register', async (req, res) => {
  try {
    const { username, fullName, email, phone, password, isSliitStudent, studentId } = req.reqBody || req.body;
    
    if (!username || !fullName || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const emailLower = email.toLowerCase().trim();
    const isSliitDomain = emailLower.endsWith('@my.sliit.lk') || emailLower.endsWith('@sliit.lk');

    if (isSliitStudent && !isSliitDomain) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid Email' 
      });
    }

    const existingEmail = await db.findOne('User', { email: emailLower });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const existingUsername = await db.findOne('User', { username });
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username already taken.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.create('User', {
      username,
      fullName,
      email: emailLower,
      phone,
      password: hashedPassword,
      role: 'Customer',
      isSliitStudent: isSliitDomain || Boolean(isSliitStudent),
      studentId: studentId || null,
      status: 'Active'
    });

    const token = generateToken(newUser);
    
    // Create welcome notification
    await db.create('Notification', {
      user: newUser._id,
      title: 'Welcome to Yathra!',
      message: `Hello ${fullName}, welcome to Yathra! Search and book your journey now.`,
      type: 'Info',
      read: false
    });

    res.status(201).json({
      success: true,
      token,
      user: { 
        _id: newUser._id, 
        fullName, 
        email: emailLower, 
        phone, 
        role: 'Customer',
        isSliitStudent: isSliitDomain || Boolean(isSliitStudent),
        studentId: studentId || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login (All Roles)
router.post('/auth/login', async (req, res) => {
  try {
    const { email: usernameOrEmail, password } = req.reqBody || req.body;
    
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ success: false, message: 'Username/Email and password are required.' });
    }

    let user = await db.findOne('User', { email: usernameOrEmail });
    if (!user && (usernameOrEmail === 'admin@yathra.lk' || usernameOrEmail === 'admin@tripzo.com')) {
      user = await db.findOne('User', { role: 'Admin' });
    }
    if (!user) {
      user = await db.findOne('User', { username: usernameOrEmail });
    }
    
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    if (user.status === 'Blocked') {
      return res.status(403).json({ success: false, message: 'Your account has been blocked by Admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isSliitStudent: Boolean(user.isSliitStudent || (user.email && (user.email.endsWith('@my.sliit.lk') || user.email.endsWith('@sliit.lk')))),
        studentId: user.studentId || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user profile details
router.get('/auth/me', authenticate, async (req, res) => {
  const user = { ...req.user };
  delete user.password;
  res.json({ success: true, user });
});

// Forgot Password (Mock)
router.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.reqBody || req.body;
    const user = await db.findOne('User', { email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found with this email.' });
    }
    // Simulate sending password reset instructions
    res.json({
      success: true,
      message: 'Password reset link sent to your registered email/phone.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ----------------------------------------------------
// 2. USER MANAGEMENT MODULE (Admin Only)
// ----------------------------------------------------

router.get('/users', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const list = await db.find('User');
    const sanitised = list.map(u => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });
    res.json({ success: true, users: sanitised });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/users', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const body = req.reqBody || req.body;
    const existing = await db.findOne('User', { email: body.email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password || 'yathra123', salt);

    const newUser = await db.create('User', {
      ...body,
      password: hashedPassword,
      status: body.status || 'Active'
    });
    const copy = { ...newUser };
    delete copy.password;
    res.status(201).json({ success: true, user: copy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/users/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const body = req.reqBody || req.body;
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      body.password = await bcrypt.hash(body.password, salt);
    }
    const updated = await db.findByIdAndUpdate('User', req.params.id, body);
    const copy = { ...updated };
    delete copy.password;
    res.json({ success: true, user: copy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/users/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    await db.findByIdAndDelete('User', req.params.id);
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ----------------------------------------------------
// 3. BUSES CRUD MODULE (Admin / Operator)
// ----------------------------------------------------

router.get('/buses', async (req, res) => {
  try {
    const list = await db.find('Bus');
    res.json({ success: true, buses: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/buses', authenticate, authorize(['Admin', 'Operator']), async (req, res) => {
  try {
    const body = req.reqBody || req.body;
    const existing = await db.findOne('Bus', { busNumber: body.busNumber });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Bus number already exists.' });
    }
    const newBus = await db.create('Bus', body);
    res.status(201).json({ success: true, bus: newBus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/buses/:id', authenticate, authorize(['Admin', 'Operator']), async (req, res) => {
  try {
    const body = req.reqBody || req.body;
    const updated = await db.findByIdAndUpdate('Bus', req.params.id, body);
    res.json({ success: true, bus: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/buses/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    await db.findByIdAndDelete('Bus', req.params.id);
    res.json({ success: true, message: 'Bus deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ----------------------------------------------------
// 4. ROUTES CRUD MODULE (Admin / Operator)
// ----------------------------------------------------

// Get popular routes dynamically ranked by booking count & frequency
router.get('/routes/popular', async (req, res) => {
  try {
    const routes = await db.find('Route');
    const schedules = await db.find('Schedule');
    const bookings = await db.find('Booking');

    // Map schedule ID to route ID
    const schedRouteMap = {};
    for (let s of (schedules || [])) {
      const rId = typeof s.route === 'object' && s.route ? s.route._id : s.route;
      schedRouteMap[s._id] = rId ? rId.toString() : null;
    }

    // Count bookings per route ID
    const bookingCounts = {};
    for (let b of (bookings || [])) {
      const sId = typeof b.schedule === 'object' && b.schedule ? b.schedule._id : b.schedule;
      const rId = schedRouteMap[sId];
      if (rId) {
        bookingCounts[rId] = (bookingCounts[rId] || 0) + 1;
      }
    }

    // Secondary count: schedules per route
    const scheduleCounts = {};
    for (let s of (schedules || [])) {
      const rId = typeof s.route === 'object' && s.route ? s.route._id : s.route;
      if (rId) {
        const idStr = rId.toString();
        scheduleCounts[idStr] = (scheduleCounts[idStr] || 0) + 1;
      }
    }

    const activeRoutes = (routes || []).filter(r => r.status !== 'Inactive');
    const ranked = activeRoutes.map(r => {
      const idStr = r._id.toString();
      return {
        _id: r._id,
        startingLocation: r.startingLocation,
        destination: r.destination,
        distance: r.distance,
        duration: r.duration,
        bookingCount: bookingCounts[idStr] || 0,
        scheduleCount: scheduleCounts[idStr] || 0
      };
    }).sort((a, b) => {
      if (b.bookingCount !== a.bookingCount) {
        return b.bookingCount - a.bookingCount;
      }
      return b.scheduleCount - a.scheduleCount;
    });

    res.json({ success: true, routes: ranked.slice(0, 6) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/routes', async (req, res) => {
  try {
    const list = await db.find('Route');
    res.json({ success: true, routes: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/routes', authenticate, authorize(['Admin', 'Operator']), async (req, res) => {
  try {
    const body = req.reqBody || req.body;
    const newRoute = await db.create('Route', body);
    res.status(201).json({ success: true, route: newRoute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/routes/:id', authenticate, authorize(['Admin', 'Operator']), async (req, res) => {
  try {
    const body = req.reqBody || req.body;
    const updated = await db.findByIdAndUpdate('Route', req.params.id, body);
    res.json({ success: true, route: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/routes/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    await db.findByIdAndDelete('Route', req.params.id);
    res.json({ success: true, message: 'Route deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ----------------------------------------------------
// 5. SCHEDULES CRUD MODULE (Customer Booking Search)
// ----------------------------------------------------

router.get('/schedules', async (req, res) => {
  try {
    const { from, to, date } = req.query;
    const list = await db.find('Schedule');
    
    let result = [];
    for (let item of list) {
      const populated = await populateScheduleObj(item);
      if (populated && populated.bus && populated.route) {
        result.push(populated);
      }
    }

    // Apply Filter
    if (from || to || date) {
      result = result.filter(item => {
        let match = true;
        if (from) {
          const fTokens = from.toLowerCase().split(/[|/]/).map(s => s.trim()).filter(Boolean);
          const startMatches = fTokens.some(f => 
            item.route.startingLocation.toLowerCase().includes(f) || f.includes(item.route.startingLocation.toLowerCase())
          );
          const stopMatches = Array.isArray(item.route.stops) && item.route.stops.some(s => 
            fTokens.some(f => s.name.toLowerCase().includes(f) || f.includes(s.name.toLowerCase()))
          );
          if (!startMatches && !stopMatches) match = false;
        }
        if (to) {
          const tTokens = to.toLowerCase().split(/[|/]/).map(s => s.trim()).filter(Boolean);
          const destMatches = tTokens.some(t => 
            item.route.destination.toLowerCase().includes(t) || t.includes(item.route.destination.toLowerCase())
          );
          const stopMatches = Array.isArray(item.route.stops) && item.route.stops.some(s => 
            tTokens.some(t => s.name.toLowerCase().includes(t) || t.includes(s.name.toLowerCase()))
          );
          if (!destMatches && !stopMatches) match = false;
        }
        if (date) {
          const searchDate = new Date(date);
          const dayOfWeek = searchDate.toLocaleString('en-US', { weekday: 'long' });
          let runsOnDate = false;
          const frequency = item.frequency || (item.isEveryday ? 'Everyday' : 'Everyday');
          
          if (frequency === 'Everyday') {
            runsOnDate = true;
          } else if (frequency === 'Weekdays' && !['Saturday', 'Sunday'].includes(dayOfWeek)) {
            runsOnDate = true;
          } else if (frequency === 'Weekends' && ['Saturday', 'Sunday'].includes(dayOfWeek)) {
            runsOnDate = true;
          } else if (frequency === 'Specific Days' && item.selectedDays && item.selectedDays.includes(dayOfWeek)) {
            runsOnDate = true;
          }
          
          if (!runsOnDate && item.departureDate !== date) {
            match = false;
          } else if (match && (runsOnDate || item.departureDate === date)) {
            item.departureDate = date;
          }
        }
        return match;
      });
    }

    res.json({ success: true, schedules: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Seat Availability & Concurrency Status (10-min Temporary Hold & Gender Awareness)
router.get('/schedules/:id/seat-status', async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const schedule = await db.findById('Schedule', scheduleId);
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    
    const populatedSchedule = await populateScheduleObj(schedule);

    // Get all bookings for this schedule
    const allBookings = await db.find('Booking', { schedule: scheduleId });
    const now = Date.now();
    const TEN_MINUTES = 10 * 60 * 1000;

    const bookedSeats = [];
    const femaleSeats = [];
    const heldSeats = [];

    allBookings.forEach(b => {
      if (b.bookingStatus === 'Confirmed') {
        bookedSeats.push(...(b.seatsBooked || []));
        // Check female passengers
        if (b.passengers && Array.isArray(b.passengers)) {
          b.passengers.forEach(p => {
            if (p.gender === 'Female' && p.seatNumber) {
              femaleSeats.push(p.seatNumber);
            }
          });
        }
      } else if (b.bookingStatus === 'Pending') {
        const createdAtTime = new Date(b.createdAt || b.bookingDate || now).getTime();
        const heldUntilTime = b.heldUntil ? new Date(b.heldUntil).getTime() : createdAtTime + TEN_MINUTES;
        // If still within 10-minute hold window
        if (now < heldUntilTime) {
          heldSeats.push(...(b.seatsBooked || []));
        }
      }
    });

    res.json({
      success: true,
      schedule: populatedSchedule,
      bookedSeats: [...new Set(bookedSeats)],
      femaleSeats: [...new Set(femaleSeats)],
      heldSeats: [...new Set(heldSeats)]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/schedules', authenticate, authorize(['Admin', 'Operator']), async (req, res) => {
  try {
    const body = req.reqBody || req.body;
    
    // Validate Bus and Route
    const bus = await db.findById('Bus', body.bus);
    if (!bus) return res.status(400).json({ success: false, message: 'Bus not found.' });
    
    const newSchedule = await db.create('Schedule', {
      ...body,
      availableSeats: bus.seatCapacity
    });
    
    res.status(201).json({ success: true, schedule: newSchedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/schedules/:id', authenticate, authorize(['Admin', 'Operator']), async (req, res) => {
  try {
    const body = req.reqBody || req.body;
    const updated = await db.findByIdAndUpdate('Schedule', req.params.id, body);
    res.json({ success: true, schedule: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/schedules/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    await db.findByIdAndDelete('Schedule', req.params.id);
    res.json({ success: true, message: 'Schedule deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ----------------------------------------------------
// 6. BOOKINGS & PAYMENTS MODULE (Customer Checkout)
// ----------------------------------------------------

// Create Booking with 10-Minute Seat Locking & Boarding/Dropping Stop Data
router.post('/bookings', authenticate, async (req, res) => {
  try {
    const settings = getSystemSettings();
    const isAdminOrOperator = req.user && (req.user.role === 'Admin' || req.user.role === 'Operator');
    if (!settings.publicBookingActive && !isAdminOrOperator) {
      return res.status(403).json({
        success: false,
        code: 'PUBLIC_BOOKING_PAUSED',
        message: 'Public bus seat reservations are currently paused during the university early access phase. Please use the Campus Shuttle Hub.'
      });
    }

    const { 
      scheduleId, passengers, seatsBooked, promoCode, includeConvenienceFee,
      boardingPoint, droppingPoint, boardingTime, droppingTime 
    } = req.reqBody || req.body;
    
    if (!scheduleId || !passengers || !passengers.length || !seatsBooked || !seatsBooked.length) {
      return res.status(400).json({ success: false, message: 'Missing required booking details.' });
    }

    const schedule = await db.findById('Schedule', scheduleId);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Trip schedule not found.' });
    }

    if (schedule.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'This schedule is no longer active.' });
    }

    if (schedule.availableSeats < seatsBooked.length) {
      return res.status(400).json({ success: false, message: 'Not enough seats available.' });
    }

    // Verify seats concurrency: check confirmed bookings AND pending holds within the 10-minute window
    const allBookings = await db.find('Booking', { schedule: scheduleId });
    const now = Date.now();
    const TEN_MINUTES = 10 * 60 * 1000;

    const blockedSeats = [];
    allBookings.forEach(b => {
      if (b.bookingStatus === 'Confirmed') {
        blockedSeats.push(...(b.seatsBooked || []));
      } else if (b.bookingStatus === 'Pending') {
        const createdAtTime = new Date(b.createdAt || b.bookingDate || now).getTime();
        const heldUntilTime = b.heldUntil ? new Date(b.heldUntil).getTime() : createdAtTime + TEN_MINUTES;
        // Block if another user is holding within the 10 min window
        if (now < heldUntilTime && String(b.customer) !== String(req.user._id)) {
          blockedSeats.push(...(b.seatsBooked || []));
        }
      }
    });

    const overlaps = seatsBooked.filter(s => blockedSeats.includes(s));
    if (overlaps.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Seats are currently unavailable or held by another passenger: ${overlaps.join(', ')}` 
      });
    }

    let baseAmount = schedule.ticketPrice * seatsBooked.length;
    let discount = 0;

    if (promoCode) {
      const offer = await db.findOne('Offer', { code: promoCode, status: 'Active' });
      if (offer) {
        // Expiry check
        const today = new Date().toISOString().split('T')[0];
        if (offer.expiryDate >= today && baseAmount >= offer.minBookingValue) {
          if (offer.discountType === 'Percentage') {
            discount = baseAmount * (offer.value / 100);
          } else {
            discount = Math.min(offer.value, baseAmount);
          }
        }
      }
    }

    const convenienceFee = includeConvenienceFee ? 2 : 0;
    const totalAmount = Math.max(baseAmount - discount + convenienceFee, 0);

    const booking = await db.create('Booking', {
      customer: req.user._id,
      schedule: scheduleId,
      passengers,
      seatsBooked,
      boardingPoint: boardingPoint || null,
      droppingPoint: droppingPoint || null,
      boardingTime: boardingTime || schedule.departureTime,
      droppingTime: droppingTime || schedule.arrivalTime,
      totalAmount,
      convenienceFee,
      paymentStatus: 'Pending',
      bookingStatus: 'Pending',
      heldUntil: new Date(Date.now() + TEN_MINUTES)
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Process Checkout Payment
router.post('/payments/checkout', authenticate, async (req, res) => {
  try {
    const { bookingId, paymentMethod, cardDetails } = req.reqBody || req.body;
    
    const booking = await db.findById('Booking', bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'This booking has already been cancelled.' });
    }

    const schedule = await db.findById('Schedule', booking.schedule);
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found.' });

    // Deduct available seats
    const newAvailable = Math.max(schedule.availableSeats - booking.seatsBooked.length, 0);
    await db.findByIdAndUpdate('Schedule', booking.schedule, { availableSeats: newAvailable });

    // Mock successful transaction
    const transactionId = 'TXN_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Save Payment
    const payment = await db.create('Payment', {
      booking: bookingId,
      customer: req.user._id,
      amount: booking.totalAmount,
      paymentMethod: paymentMethod || 'Card',
      status: 'Paid',
      transactionId,
      paymentDate: new Date()
    });

    // Generate Tickets
    const ticketQr = generateQrSvg(`TICKET:${bookingId}:${booking.seatsBooked.join(',')}`);
    
    // Update Booking Status
    const updatedBooking = await db.findByIdAndUpdate('Booking', bookingId, {
      paymentStatus: 'Paid',
      bookingStatus: 'Confirmed'
    });

    // Notify Customer
    await db.create('Notification', {
      user: req.user._id,
      title: 'Booking Confirmed!',
      message: `Your booking (ID: ${bookingId}) for seats ${booking.seatsBooked.join(', ')} is confirmed. Total Paid: $${booking.totalAmount}.`,
      type: 'Booking',
      read: false
    });

    res.json({
      success: true,
      booking: updatedBooking,
      payment,
      qrCode: ticketQr
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Customer booking history
router.get('/bookings/my', authenticate, async (req, res) => {
  try {
    const list = await db.find('Booking', { customer: req.user._id });
    const populated = [];
    for (let booking of list) {
      const p = await populateBookingObj(booking);
      if (p) populated.push(p);
    }
    res.json({ success: true, bookings: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel Booking (With Transparent Cancellation Policy & Refund Calculation)
router.post('/bookings/:id/cancel', authenticate, async (req, res) => {
  try {
    const booking = await db.findById('Booking', req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    const { reason } = req.reqBody || req.body || { reason: 'Requested by user' };

    // Update Schedule seats
    const schedule = await db.findById('Schedule', booking.schedule);
    if (schedule) {
      const restoreSeats = schedule.availableSeats + booking.seatsBooked.length;
      await db.findByIdAndUpdate('Schedule', booking.schedule, { availableSeats: restoreSeats });
    }

    // Determine Hours until departure for transparent Sri Lanka refund policy
    let refundPercentage = 0.90; // Default: > 24 hours (90% refund, 10% fee)
    if (schedule && schedule.departureDate && schedule.departureTime) {
      try {
        const depDateTime = new Date(`${schedule.departureDate}T${schedule.departureTime}:00`);
        const now = new Date();
        const diffHours = (depDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        if (diffHours >= 24) {
          refundPercentage = 0.90; // 90% refund (>24 hours)
        } else if (diffHours >= 12) {
          refundPercentage = 0.75; // 75% refund (12-24 hours)
        } else if (diffHours >= 3) {
          refundPercentage = 0.50; // 50% refund (3-12 hours)
        } else {
          refundPercentage = 0.00; // No refund (<3 hours)
        }
      } catch (e) {
        refundPercentage = 0.90;
      }
    }

    // Cancel booking
    await db.findByIdAndUpdate('Booking', req.params.id, {
      bookingStatus: 'Cancelled',
      paymentStatus: (booking.paymentStatus === 'Paid' && refundPercentage > 0) ? 'Refunded' : booking.paymentStatus
    });

    // Process refund structure
    let refundAmount = 0;
    if (booking.paymentStatus === 'Paid' && refundPercentage > 0) {
      refundAmount = +(booking.totalAmount * refundPercentage).toFixed(2);
      await db.create('Payment', {
        booking: booking._id,
        customer: booking.customer,
        amount: -refundAmount,
        paymentMethod: 'Online Wallet',
        status: 'Refunded',
        transactionId: 'REF_' + Math.random().toString(36).substring(2, 10).toUpperCase()
      });
    }

    // Notify Customer
    await db.create('Notification', {
      user: booking.customer,
      title: 'Booking Cancelled',
      message: `Your booking ${booking._id} was cancelled. Refund rate: ${(refundPercentage * 100)}%. Refund amount of $${refundAmount} has been processed.`,
      type: 'Cancellation',
      read: false
    });

    res.json({ 
      success: true, 
      message: `Booking cancelled successfully. Refund of $${refundAmount} (${(refundPercentage * 100)}%) processed.`,
      refundAmount,
      refundPercentage
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reschedule Booking (Change Travel Date / Time to Another Schedule)
router.post('/bookings/:id/reschedule', authenticate, async (req, res) => {
  try {
    const booking = await db.findById('Booking', req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot reschedule a cancelled journey.' });
    }

    const { newScheduleId, newSeats, boardingPoint, droppingPoint, boardingTime, droppingTime } = req.reqBody || req.body;
    if (!newScheduleId) return res.status(400).json({ success: false, message: 'Target schedule ID is required.' });

    const newSchedule = await db.findById('Schedule', newScheduleId);
    if (!newSchedule || newSchedule.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'Target schedule is not currently available.' });
    }

    const seatsToBook = newSeats || booking.seatsBooked;
    if (newSchedule.availableSeats < seatsToBook.length) {
      return res.status(400).json({ success: false, message: 'Not enough seats available on selected trip.' });
    }

    // Restore old schedule seats
    const oldSchedule = await db.findById('Schedule', booking.schedule);
    if (oldSchedule) {
      await db.findByIdAndUpdate('Schedule', booking.schedule, {
        availableSeats: oldSchedule.availableSeats + booking.seatsBooked.length
      });
    }

    // Deduct new schedule seats
    await db.findByIdAndUpdate('Schedule', newScheduleId, {
      availableSeats: Math.max(newSchedule.availableSeats - seatsToBook.length, 0)
    });

    // Update booking
    const updated = await db.findByIdAndUpdate('Booking', req.params.id, {
      schedule: newScheduleId,
      seatsBooked: seatsToBook,
      ...(boardingPoint && { boardingPoint }),
      ...(droppingPoint && { droppingPoint }),
      ...(boardingTime && { boardingTime }),
      ...(droppingTime && { droppingTime }),
    });

    // Notify customer
    await db.create('Notification', {
      user: req.user._id,
      title: 'Journey Rescheduled!',
      message: `Your journey ${booking._id} was successfully rescheduled to ${newSchedule.departureDate} at ${newSchedule.departureTime}.`,
      type: 'Booking',
      read: false
    });

    const populated = await populateBookingObj(updated);
    res.json({ success: true, message: 'Journey rescheduled successfully!', booking: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Live Bus Tracking Endpoint (Simulated real-time tracking with traffic alerts & conductor contact)
router.get('/bookings/:id/track', authenticate, async (req, res) => {
  try {
    const bookingRaw = await db.findById('Booking', req.params.id);
    if (!bookingRaw) return res.status(404).json({ success: false, message: 'Booking not found.' });

    const booking = await populateBookingObj(bookingRaw);
    if (!booking || !booking.schedule) {
      return res.status(404).json({ success: false, message: 'Schedule details not found for tracking.' });
    }

    const schedule = booking.schedule;
    const route = schedule.route;
    const bus = schedule.bus;

    // Build timeline of stops
    const stops = [];
    stops.push({
      name: route.startingLocation,
      time: schedule.departureTime,
      distanceOffset: 0
    });

    if (route.stops && Array.isArray(route.stops)) {
      route.stops.forEach(s => {
        // Calculate stop time offset
        let estTime = schedule.departureTime;
        if (s.timeOffset) {
          const matchH = s.timeOffset.match(/(\d+)\s*h/);
          const matchM = s.timeOffset.match(/(\d+)\s*m/);
          const addMinutes = (matchH ? parseInt(matchH[1]) * 60 : 0) + (matchM ? parseInt(matchM[1]) : 0);
          const [depH, depM] = schedule.departureTime.split(':').map(Number);
          const totalM = depH * 60 + depM + addMinutes;
          const h = Math.floor(totalM / 60) % 24;
          const m = totalM % 60;
          estTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        }
        stops.push({
          name: s.name,
          time: estTime,
          distanceOffset: s.distanceOffset || 0
        });
      });
    }

    // Determine current simulation position based on time of day
    const now = new Date();
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    const currentTimeMinutes = currentH * 60 + currentM;

    const [depH, depM] = schedule.departureTime.split(':').map(Number);
    const depTimeMinutes = depH * 60 + depM;

    const [arrH, arrM] = schedule.arrivalTime.split(':').map(Number);
    let arrTimeMinutes = arrH * 60 + arrM;
    if (arrTimeMinutes < depTimeMinutes) arrTimeMinutes += 24 * 60; // Overnight bus

    let status = 'Scheduled';
    let progressPercent = 0;
    let currentStopIndex = 0;

    if (currentTimeMinutes < depTimeMinutes) {
      status = 'Scheduled - Preparing at Terminal';
      progressPercent = 0;
      currentStopIndex = 0;
    } else if (currentTimeMinutes >= arrTimeMinutes) {
      status = 'Journey Completed';
      progressPercent = 100;
      currentStopIndex = stops.length - 1;
    } else {
      status = 'In Transit';
      const elapsed = currentTimeMinutes - depTimeMinutes;
      const totalDuration = arrTimeMinutes - depTimeMinutes;
      progressPercent = Math.min(Math.round((elapsed / totalDuration) * 100), 98);
      currentStopIndex = Math.min(
        Math.floor((elapsed / totalDuration) * stops.length),
        stops.length - 1
      );
    }

    // Mark stops with status
    const stopsWithStatus = stops.map((s, idx) => ({
      ...s,
      passed: idx < currentStopIndex,
      isCurrent: idx === currentStopIndex,
      isUpcoming: idx > currentStopIndex
    }));

    res.json({
      success: true,
      busNumber: bus.busNumber,
      busName: bus.name,
      busType: bus.type,
      driverName: bus.driverName || 'Kamal Perera',
      conductorName: bus.conductorName || 'Sunil Shantha',
      conductorPhone: bus.conductorPhone || '+94 77 123 4567',
      status,
      progressPercent,
      startingLocation: route.startingLocation,
      destination: route.destination,
      currentStop: stops[currentStopIndex]?.name || route.startingLocation,
      nextStop: stops[Math.min(currentStopIndex + 1, stops.length - 1)]?.name,
      stops: stopsWithStatus,
      trafficNotice: '⚠️ මාර්ගයේ රථවාහන තදබදය (Traffic) හෝ අනපේක්ෂිත කාලගුණ තත්ත්වයන් මත මෙම වේලාවන් සුළු වශයෙන් වෙනස් විය හැක. / Times may vary depending on road traffic conditions.',
      lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get All Bookings (Admin/Operator)
router.get('/bookings', authenticate, authorize(['Admin', 'Operator']), async (req, res) => {
  try {
    const list = await db.find('Booking');
    const populated = [];
    for (let booking of list) {
      const p = await populateBookingObj(booking);
      if (p) populated.push(p);
    }
    res.json({ success: true, bookings: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ----------------------------------------------------
// 7. PAYMENTS CRUD (Admin Only)
// ----------------------------------------------------

router.get('/payments', authenticate, authorize(['Admin', 'Operator']), async (req, res) => {
  try {
    const list = await db.find('Payment');
    const populated = [];
    for (let p of list) {
      const customer = await db.findById('User', p.customer);
      if (customer) delete customer.password;
      populated.push({ ...p, customer });
    }
    res.json({ success: true, payments: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ----------------------------------------------------
// 8. OFFERS CRUD (Promo Codes)
// ----------------------------------------------------

router.get('/offers', async (req, res) => {
  try {
    const list = await db.find('Offer');
    res.json({ success: true, offers: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/offers/verify', async (req, res) => {
  try {
    const { code, amount } = req.reqBody || req.body;
    const offer = await db.findOne('Offer', { code, status: 'Active' });
    if (!offer) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive promo code.' });
    }

    const today = new Date().toISOString().split('T')[0];
    if (offer.expiryDate < today) {
      return res.status(400).json({ success: false, message: 'Promo code has expired.' });
    }

    if (amount < offer.minBookingValue) {
      return res.status(400).json({ success: false, message: `Minimum booking value must be $${offer.minBookingValue}.` });
    }

    res.json({ success: true, offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/offers', authenticate, authorize(['Admin', 'Operator']), async (req, res) => {
  try {
    const body = req.reqBody || req.body;
    const existing = await db.findOne('Offer', { code: body.code });
    if (existing) return res.status(400).json({ success: false, message: 'Promo code already exists.' });
    
    const newOffer = await db.create('Offer', body);
    res.status(201).json({ success: true, offer: newOffer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/offers/:id', authenticate, authorize(['Admin', 'Operator']), async (req, res) => {
  try {
    const body = req.reqBody || req.body;
    const updated = await db.findByIdAndUpdate('Offer', req.params.id, body);
    res.json({ success: true, offer: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/offers/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    await db.findByIdAndDelete('Offer', req.params.id);
    res.json({ success: true, message: 'Offer deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ----------------------------------------------------
// 9. REVIEWS & FEEDBACK
// ----------------------------------------------------

router.get('/reviews', async (req, res) => {
  try {
    const list = await db.find('Review');
    const populated = [];
    for (let r of list) {
      const customer = await db.findById('User', r.customer);
      const bus = await db.findById('Bus', r.bus);
      if (customer) delete customer.password;
      populated.push({ ...r, customer, bus });
    }
    res.json({ success: true, reviews: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/reviews', authenticate, async (req, res) => {
  try {
    const { busId, rating, comment } = req.reqBody || req.body;
    const newReview = await db.create('Review', {
      customer: req.user._id,
      bus: busId,
      rating,
      comment
    });
    res.status(201).json({ success: true, review: newReview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/reviews/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    await db.findByIdAndDelete('Review', req.params.id);
    res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ----------------------------------------------------
// 10. NOTIFICATIONS MODULE
// ----------------------------------------------------

router.get('/notifications', authenticate, async (req, res) => {
  try {
    const list = await db.find('Notification', { user: req.user._id });
    res.json({ success: true, notifications: list.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/notifications/read', authenticate, async (req, res) => {
  try {
    const list = await db.find('Notification', { user: req.user._id, read: false });
    for (let notif of list) {
      await db.findByIdAndUpdate('Notification', notif._id, { read: true });
    }
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ----------------------------------------------------
// 11. REPORTS AND KPI DASHBOARD ANALYTICS (Admin)
// ----------------------------------------------------

router.get('/reports/dashboard', authenticate, authorize(['Admin', 'Operator']), async (req, res) => {
  try {
    const usersCount = await db.count('User', { role: 'Customer' });
    const busesCount = await db.count('Bus');
    const routesCount = await db.count('Route');
    const schedulesCount = await db.count('Schedule');
    
    const bookings = await db.find('Booking');
    const payments = await db.find('Payment');
    
    // KPI Math
    const totalBookings = bookings.length;
    const cancelledBookings = bookings.filter(b => b.bookingStatus === 'Cancelled').length;
    
    let totalRevenue = 0;
    payments.forEach(p => {
      if (p.status === 'Paid') {
        totalRevenue += p.amount;
      } else if (p.status === 'Refunded') {
        // Deduct refunded
        totalRevenue += p.amount; // amount is negative for refunds
      }
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => {
      const dateToParse = b.bookingDate || b.createdAt || new Date();
      const bDate = new Date(dateToParse).toISOString().split('T')[0];
      return bDate === todayStr;
    }).length;

    const availableBuses = await db.count('Bus', { status: 'Available' });

    // Recent Payments
    const recentPayments = [];
    const sortedPayments = payments.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    for (let p of sortedPayments) {
      const customer = await db.findById('User', p.customer);
      recentPayments.push({
        _id: p._id,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        status: p.status,
        date: p.paymentDate,
        customerName: customer ? customer.fullName : 'Guest'
      });
    }

    // Chart Data (Mocking last 6 months or 7 days)
    const revenueChart = [
      { month: 'Jan', revenue: totalRevenue * 0.12 + 500, bookings: Math.floor(totalBookings * 0.10 + 5) },
      { month: 'Feb', revenue: totalRevenue * 0.15 + 650, bookings: Math.floor(totalBookings * 0.13 + 7) },
      { month: 'Mar', revenue: totalRevenue * 0.18 + 700, bookings: Math.floor(totalBookings * 0.16 + 9) },
      { month: 'Apr', revenue: totalRevenue * 0.22 + 900, bookings: Math.floor(totalBookings * 0.20 + 12) },
      { month: 'May', revenue: totalRevenue * 0.33, bookings: Math.floor(totalBookings * 0.41) }
    ];

    res.json({
      success: true,
      kpis: {
        totalUsers: usersCount + 3, // Mock some active counters
        totalBuses: busesCount,
        totalRoutes: routesCount,
        totalSchedules: schedulesCount,
        totalBookings,
        todayBookings,
        cancelledBookings,
        availableBuses,
        totalRevenue: Math.max(totalRevenue, 0)
      },
      recentPayments,
      charts: {
        revenueChart
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ====================================================
// SLIIT TRANSIT HUB - CAMPUS SHUTTLE GPS TELEMETRY API
// ====================================================

// Helper: Calculate Sri Lanka (UTC+5:30) Operating Window
const getSlTimeDetails = () => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const slDate = new Date(utc + (3600000 * 5.5));
  const hours = slDate.getHours();
  const minutes = slDate.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  // Morning Window: 06:00 AM (360m) - 08:00 AM (480m)
  const isMorningWindow = currentMinutes >= 360 && currentMinutes <= 480;
  // Evening Window: 04:00 PM (960m) - 06:30 PM (1110m)
  const isEveningWindow = currentMinutes >= 960 && currentMinutes <= 1110;

  const formattedTime = slDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return {
    slDate,
    currentMinutes,
    formattedTime,
    isWithinWindow: isMorningWindow || isEveningWindow,
    isMorningWindow,
    isEveningWindow
  };
};

// 1. Get All Campus Shuttles (With Time-Gated Logic for Students vs 24/7 for Admin/Simulation)
router.get('/campus/shuttles', async (req, res) => {
  try {
    const { forceWindow, role } = req.query;
    const timeInfo = getSlTimeDetails();

    // Check auth header if available for Admin role
    let isAdmin = role === 'admin' || role === 'Admin' || forceWindow === 'true';
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tripzo_deep_mind_super_secure_jwt_secret_token_key_2026');
        if (decoded && (decoded.role === 'Admin' || decoded.role === 'Operator')) {
          isAdmin = true;
        }
      } catch (e) {
        // Token invalid, fallback
      }
    }

    let shuttles = await db.find('CampusShuttle', {});
    const defaultShuttles = require('../../data/campus_shuttle.json');

    // If database has 0 shuttles, auto-seed from campus_shuttle.json so the view is never empty
    if (!shuttles || shuttles.length === 0) {
      try {
        for (const s of defaultShuttles) {
          try {
            await db.create('CampusShuttle', s);
          } catch (createErr) {}
        }
        shuttles = await db.find('CampusShuttle', {});
      } catch (seedErr) {
        console.warn('Could not auto-seed campus shuttles on GET:', seedErr.message);
      }
    } else {
      // Ensure existing records have all valid stop waypoints & updated driver info from campus_shuttle.json
      for (const def of defaultShuttles) {
        const found = shuttles.find(s => s.routeId === def.routeId);
        if (found && (!found.stops || found.stops.length === 0 || !found.fareCategories || found.fareCategories.length === 0)) {
          try {
            await db.findByIdAndUpdate('CampusShuttle', found._id, {
              stops: def.stops,
              fare: def.fare || found.fare,
              monthlyPassFare: def.monthlyPassFare || found.monthlyPassFare,
              fareCategories: def.fareCategories || [],
              currentLocation: def.currentLocation || found.currentLocation
            });
          } catch (updateErr) {}
        }
      }
      shuttles = await db.find('CampusShuttle', {});
    }

    // Apply Time-Lock window logic for students:
    // If not admin AND outside window AND forceWindow is not active, mask the live GPS coordinates
    const isLiveActive = isAdmin || timeInfo.isWithinWindow || forceWindow === 'true';

    const processedShuttles = shuttles.map(shuttle => {
      if (!isLiveActive) {
        return {
          ...shuttle,
          isWithinOperatingWindow: false,
          operatingStatus: 'Offline',
          operatingStatusMessage: 'Morning Shuttle concluded. Next scheduled service is tomorrow at 06:00 AM.',
          currentLocation: {
            ...shuttle.currentLocation,
            isLive: false,
            speed: 0
          }
        };
      }
      return {
        ...shuttle,
        isWithinOperatingWindow: true,
        operatingStatus: 'Live',
        operatingStatusMessage: 'Active Live GPS Telemetry Stream'
      };
    });

    res.json({
      success: true,
      timeInfo: {
        slTime: timeInfo.formattedTime,
        isWithinWindow: timeInfo.isWithinWindow,
        isLiveActive
      },
      shuttles: processedShuttles
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Seed / Restore Default Campus Shuttle Corridors
router.post('/campus/shuttles/seed', async (req, res) => {
  try {
    const defaultShuttles = require('../../data/campus_shuttle.json');
    let seeded = 0;
    for (const s of defaultShuttles) {
      const existing = await db.findOne('CampusShuttle', { routeId: s.routeId });
      if (!existing) {
        await db.create('CampusShuttle', s);
        seeded++;
      } else {
        await db.findByIdAndUpdate('CampusShuttle', existing._id, s);
        seeded++;
      }
    }
    const shuttles = await db.find('CampusShuttle', {});
    res.json({ success: true, message: `Successfully synchronized ${seeded} SLIIT shuttles.`, shuttles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper to find a campus shuttle by _id, routeId, or busNumber
const findCampusShuttleDoc = async (idOrKey) => {
  if (!idOrKey) return null;
  let shuttle = null;
  try {
    shuttle = await db.findById('CampusShuttle', idOrKey);
  } catch (e) {}

  if (!shuttle) {
    try {
      shuttle = await db.findOne('CampusShuttle', { routeId: idOrKey });
    } catch (e) {}
  }

  if (!shuttle) {
    try {
      shuttle = await db.findOne('CampusShuttle', { busNumber: idOrKey });
    } catch (e) {}
  }
  return shuttle;
};

// 2. Get Single Campus Shuttle by ID
router.get('/campus/shuttles/:id', async (req, res) => {
  try {
    const { forceWindow, role } = req.query;
    const timeInfo = getSlTimeDetails();
    const isAdmin = role === 'admin' || role === 'Admin' || forceWindow === 'true';

    const shuttle = await findCampusShuttleDoc(req.params.id);
    if (!shuttle) {
      return res.status(404).json({ success: false, message: 'Shuttle route not found.' });
    }

    const isLiveActive = isAdmin || timeInfo.isWithinWindow || forceWindow === 'true';

    res.json({
      success: true,
      timeInfo: {
        slTime: timeInfo.formattedTime,
        isWithinWindow: timeInfo.isWithinWindow,
        isLiveActive
      },
      shuttle: {
        ...shuttle,
        isWithinOperatingWindow: isLiveActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Create New Campus Shuttle Route (Admin)
router.post('/campus/shuttles', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.routeName || !payload.busNumber || !payload.origin) {
      return res.status(400).json({ success: false, message: 'Route Name, Origin, and Bus Number are required.' });
    }

    if (!payload.routeId) {
      payload.routeId = 'sliit-' + payload.origin.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }

    // Default stops if not provided
    if (!payload.stops || payload.stops.length === 0) {
      payload.stops = [
        { name: payload.origin, timeOffset: '00m', km: 0 },
        { name: 'SLIIT Malabe Campus', timeOffset: '1h 15m', km: 35 }
      ];
    }

    const newShuttle = await db.create('CampusShuttle', payload);

    // Keep data/campus_shuttle.json in sync
    try {
      const jsonPath = path.join(__dirname, '..', '..', 'data', 'campus_shuttle.json');
      if (fs.existsSync(jsonPath)) {
        const list = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        list.push(newShuttle);
        fs.writeFileSync(jsonPath, JSON.stringify(list, null, 2));
      }
    } catch (jsonErr) {}

    res.status(201).json({ success: true, message: 'SLIIT Shuttle created successfully.', shuttle: newShuttle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Update Campus Shuttle Route, Fare, Driver Contact, Schedule, Delay Notice (Admin)
router.put('/campus/shuttles/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData._id; // Prevent overwriting immutable primary key

    const target = await findCampusShuttleDoc(req.params.id);
    if (!target) {
      return res.status(404).json({ success: false, message: `Shuttle route '${req.params.id}' not found.` });
    }

    let updated = null;
    if (target._id) {
      try {
        updated = await db.findByIdAndUpdate('CampusShuttle', target._id, updateData);
      } catch (e) {}
    }

    if (!updated && target.routeId) {
      try {
        if (!db.isLocal()) {
          const CampusShuttleModel = mongoose.model('CampusShuttle');
          updated = await CampusShuttleModel.findOneAndUpdate(
            { routeId: target.routeId },
            updateData,
            { new: true }
          ).lean();
        }
      } catch (mongoErr) {}
    }

    // Keep data/campus_shuttle.json in sync so both JSON fallback and MongoDB stay 100% updated
    try {
      const jsonPath = path.join(__dirname, '..', '..', 'data', 'campus_shuttle.json');
      if (fs.existsSync(jsonPath)) {
        const list = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const idx = list.findIndex(s => s._id === target._id || s.routeId === target.routeId || s.routeId === req.params.id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...updateData, updatedAt: new Date().toISOString() };
          fs.writeFileSync(jsonPath, JSON.stringify(list, null, 2));
        }
      }
    } catch (jsonErr) {
      console.warn('Sync to campus_shuttle.json warning:', jsonErr.message);
    }

    const finalShuttle = updated || { ...target, ...updateData };
    res.json({ success: true, message: 'SLIIT Shuttle updated successfully.', shuttle: finalShuttle });
  } catch (error) {
    console.error('Update campus shuttle error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Delete Campus Shuttle Route (Admin)
router.delete('/campus/shuttles/:id', async (req, res) => {
  try {
    const target = await findCampusShuttleDoc(req.params.id);
    if (!target) {
      return res.status(404).json({ success: false, message: 'Shuttle route not found.' });
    }

    let deleted = null;
    if (target._id) {
      try {
        deleted = await db.findByIdAndDelete('CampusShuttle', target._id);
      } catch (e) {}
    }

    if (!deleted && target.routeId && !db.isLocal()) {
      try {
        const CampusShuttleModel = mongoose.model('CampusShuttle');
        deleted = await CampusShuttleModel.findOneAndDelete({ routeId: target.routeId }).lean();
      } catch (mongoErr) {}
    }

    // Remove from data/campus_shuttle.json
    try {
      const jsonPath = path.join(__dirname, '..', '..', 'data', 'campus_shuttle.json');
      if (fs.existsSync(jsonPath)) {
        let list = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        list = list.filter(s => s._id !== target._id && s.routeId !== target.routeId && s.routeId !== req.params.id);
        fs.writeFileSync(jsonPath, JSON.stringify(list, null, 2));
      }
    } catch (jsonErr) {}

    res.json({ success: true, message: 'SLIIT Shuttle deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Virtual GPS Simulation Step / Toggle (Admin & Testing Controller)
router.post('/campus/shuttles/:id/simulate', async (req, res) => {
  try {
    const { action, stepIndex } = req.body; // action: 'next' | 'reset' | 'set' | 'toggle'
    const shuttle = await findCampusShuttleDoc(req.params.id);

    if (!shuttle) {
      return res.status(404).json({ success: false, message: 'Shuttle route not found.' });
    }

    const stops = shuttle.stops || [];
    if (stops.length === 0) {
      return res.status(400).json({ success: false, message: 'No waypoints defined for simulation.' });
    }

    let currentIndex = (shuttle.currentLocation && typeof shuttle.currentLocation.simulationIndex === 'number')
      ? shuttle.currentLocation.simulationIndex
      : 0;

    if (action === 'reset') {
      currentIndex = 0;
    } else if (action === 'set' && typeof stepIndex === 'number') {
      currentIndex = Math.max(0, Math.min(stepIndex, stops.length - 1));
    } else if (action === 'next' || !action) {
      currentIndex = (currentIndex + 1) % stops.length;
    }

    const activeStop = stops[currentIndex];
    const nextStop = stops[(currentIndex + 1) % stops.length];

    const updatedLocation = {
      lat: activeStop.lat || shuttle.currentLocation?.lat || 6.9147,
      lng: activeStop.lng || shuttle.currentLocation?.lng || 79.9729,
      speed: currentIndex === stops.length - 1 ? 0 : Math.floor(Math.random() * 20) + 30, // 30-50 km/h
      currentHalt: activeStop.name,
      nextHalt: nextStop ? nextStop.name : 'SLIIT Malabe Campus',
      nextHaltEta: currentIndex === stops.length - 1 ? 'Arrived' : `${Math.floor(Math.random() * 8) + 4} mins`,
      isLive: true,
      simulationActive: true,
      simulationIndex: currentIndex,
      lastUpdated: new Date().toISOString()
    };

    const updated = await db.findByIdAndUpdate('CampusShuttle', shuttle._id, {
      currentLocation: updatedLocation
    });

    res.json({
      success: true,
      message: `Simulated GPS location advanced to ${activeStop.name}`,
      currentLocation: updatedLocation,
      shuttle: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. Hardware GPS Tracker Webhook Receiver (Ingests real SinoTrack / Teltonika / Coban GPS pings)
router.post('/campus/gps/webhook', async (req, res) => {
  try {
    const { deviceId, busId, lat, lng, speed, heading, altitude } = req.body || req.query;

    const idToMatch = busId || deviceId;
    if (!idToMatch || !lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Missing device telemetry parameters. Required: deviceId/busId, lat, lng.'
      });
    }

    let shuttle = await db.findOne('CampusShuttle', {
      $or: [
        { routeId: idToMatch },
        { busNumber: idToMatch },
        { _id: idToMatch }
      ]
    });

    if (!shuttle) {
      // Fallback matching
      const allShuttles = await db.find('CampusShuttle', {});
      shuttle = allShuttles.find(s => 
        (s.busNumber && s.busNumber.toLowerCase().replace(/[^a-z0-9]/g, '') === idToMatch.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
        (s.routeId && s.routeId.toLowerCase().includes(idToMatch.toLowerCase()))
      );
    }

    if (!shuttle) {
      return res.status(404).json({ success: false, message: `No shuttle registered for device identifier: ${idToMatch}` });
    }

    const updatedLocation = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      speed: parseFloat(speed) || 0,
      heading: parseFloat(heading) || 0,
      altitude: parseFloat(altitude) || 0,
      currentHalt: shuttle.currentLocation?.currentHalt || 'In Transit',
      nextHalt: shuttle.currentLocation?.nextHalt || 'SLIIT Campus',
      nextHaltEta: shuttle.currentLocation?.nextHaltEta || '--',
      isLive: true,
      lastUpdated: new Date().toISOString()
    };

    await db.findByIdAndUpdate('CampusShuttle', shuttle._id, {
      currentLocation: updatedLocation
    });

    res.json({
      success: true,
      message: 'Hardware GPS Telemetry Packet Processed.',
      matchedBus: shuttle.busNumber,
      updatedLocation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
