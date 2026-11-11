const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { connectDB, db } = require('./config/db');
const apiRouter = require('./routes/api');

// Initialize config
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Seed function to pre-populate database with rich data
const seedDatabase = async () => {
  try {
    const userCount = await db.count('User');
    if (userCount > 0) {
      console.log('🌱 Database already seeded.');
      return;
    }

    console.log('🌱 Seeding default Yathra database records...');

    // 1. Seed Users (with hashed passwords)
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const operatorPass = await bcrypt.hash('operator123', salt);
    const customerPass = await bcrypt.hash('customer123', salt);

    const admin = await db.create('User', {
      username: 'admin',
      fullName: 'Yathra Administrator',
      email: 'admin@yathra.lk',
      phone: '+94 77 123 4567',
      password: adminPass,
      role: 'Admin',
      status: 'Active'
    });

    const operator = await db.create('User', {
      username: 'operator',
      fullName: 'Southern Transit Operators',
      email: 'operator@yathra.lk',
      phone: '+94 77 987 6543',
      password: operatorPass,
      role: 'Operator',
      status: 'Active'
    });

    const customer = await db.create('User', {
      username: 'kavindu',
      fullName: 'Kavindu Rishan',
      email: 'customer@yathra.lk',
      phone: '+94 71 555 4444',
      password: customerPass,
      role: 'Customer',
      status: 'Active'
    });

    console.log('✅ Seeded Users: Admin, Operator, Customer');

    // 2. Seed Buses (KRM Fleet)
    const busesData = [
      { busNumber: 'NE-2004', name: 'KRM Blue King', type: 'Luxury', seatCapacity: 49, facilities: ['Wi-Fi', 'Charging', 'AC', 'TV'], conductorName: 'Sunil Shantha', conductorPhone: '+94 77 123 4567', driverName: 'Kamal Perera', image: '/hero_bus.jpg', status: 'Available' },
      { busNumber: 'NF-4582', name: 'KRM Royal Express', type: 'Super Luxury', seatCapacity: 45, facilities: ['Wi-Fi', 'Charging', 'AC', 'TV'], conductorName: 'Nimal Bandara', conductorPhone: '+94 71 889 2233', driverName: 'Upul Jayasinghe', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600', status: 'Available' },
      { busNumber: 'NJ-6721', name: 'KRM Highway Star', type: 'Semi Luxury', seatCapacity: 54, facilities: ['Charging', 'AC'], conductorName: 'Ruwan Kumara', conductorPhone: '+94 76 445 1199', driverName: 'Sanath Silva', image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=600', status: 'Available' },
      { busNumber: 'NC-9856', name: 'KRM Silver Line', type: 'Normal', seatCapacity: 54, facilities: ['Charging'], conductorName: 'Lalith Gamage', conductorPhone: '+94 70 332 5566', driverName: 'Pradeep Chaminda', image: 'https://images.unsplash.com/photo-1562620644-65ab47390225?auto=format&fit=crop&q=80&w=600', status: 'Available' },
      { busNumber: 'NB-3478', name: 'KRM Night Rider', type: 'Luxury', seatCapacity: 49, facilities: ['Wi-Fi', 'Charging', 'AC', 'TV'], conductorName: 'Ajith Rohana', conductorPhone: '+94 78 991 4455', driverName: 'Kasun Rathnayake', image: '/hero_bus.jpg', status: 'On Trip' },
      { busNumber: 'NE-5623', name: 'KRM Blue Diamond', type: 'Super Luxury', seatCapacity: 45, facilities: ['Wi-Fi', 'Charging', 'AC', 'TV'], conductorName: 'Dhammika Priyantha', conductorPhone: '+94 72 114 7788', driverName: 'Nuwan Sampath', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600', status: 'Available' },
      { busNumber: 'NF-7814', name: 'KRM Viking Express', type: 'Normal', seatCapacity: 54, facilities: ['Charging'], conductorName: 'Sarath Fonseka', conductorPhone: '+94 75 889 0011', driverName: 'Anura Kumara', image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=600', status: 'Maintenance' },
      { busNumber: 'NJ-2349', name: 'KRM City Rider', type: 'Semi Luxury', seatCapacity: 54, facilities: ['Charging', 'AC'], conductorName: 'Mahinda Bandara', conductorPhone: '+94 77 662 3344', driverName: 'Rohan de Silva', image: 'https://images.unsplash.com/photo-1562620644-65ab47390225?auto=format&fit=crop&q=80&w=600', status: 'Available' },
      { busNumber: 'NC-4567', name: 'KRM Golden Eagle', type: 'Luxury', seatCapacity: 49, facilities: ['Wi-Fi', 'Charging', 'AC', 'TV'], conductorName: 'Chandana Perera', conductorPhone: '+94 71 223 9988', driverName: 'Thushara Fernando', image: '/hero_bus.jpg', status: 'Available' },
      { busNumber: 'NB-8902', name: 'KRM Road Master', type: 'Normal', seatCapacity: 54, facilities: ['Charging'], conductorName: 'Kapila Wijesinghe', conductorPhone: '+94 76 554 1122', driverName: 'Sujith Ranasinghe', image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=600', status: 'Available' },
      { busNumber: 'NE-7451', name: 'KRM Royal Blue', type: 'Luxury', seatCapacity: 49, facilities: ['Wi-Fi', 'Charging', 'AC', 'TV'], conductorName: 'Indika Samantha', conductorPhone: '+94 78 334 5566', driverName: 'Bandula Gunawardena', image: '/hero_bus.jpg', status: 'Available' },
      { busNumber: 'NF-3208', name: 'KRM Express Star', type: 'Semi Luxury', seatCapacity: 54, facilities: ['Charging', 'AC'], conductorName: 'Sumith Jayakody', conductorPhone: '+94 70 998 7766', driverName: 'Chathura Senanayake', image: 'https://images.unsplash.com/photo-1562620644-65ab47390225?auto=format&fit=crop&q=80&w=600', status: 'On Trip' }
    ];

    const createdBuses = {};
    for (let b of busesData) {
      const bus = await db.create('Bus', b);
      createdBuses[b.busNumber] = bus;
    }
    console.log(`✅ Seeded ${busesData.length} KRM Buses`);

    // 3. Seed Routes with complete intermediate stops
    const routesData = [
      {
        startingLocation: 'Colombo', destination: 'Kandy', distance: 115, duration: '3h 30m', status: 'Active',
        stops: [
          { name: 'Peliyagoda', distanceOffset: 8, timeOffset: '15m' },
          { name: 'Kadawatha', distanceOffset: 16, timeOffset: '30m' },
          { name: 'Yakkala', distanceOffset: 32, timeOffset: '55m' },
          { name: 'Nittambuwa', distanceOffset: 40, timeOffset: '1h 10m' },
          { name: 'Warakapola', distanceOffset: 56, timeOffset: '1h 40m' },
          { name: 'Ambepussa', distanceOffset: 60, timeOffset: '1h 50m' },
          { name: 'Kegalle', distanceOffset: 78, timeOffset: '2h 20m' },
          { name: 'Mawanella', distanceOffset: 90, timeOffset: '2h 45m' },
          { name: 'Kadugannawa', distanceOffset: 102, timeOffset: '3h 05m' },
          { name: 'Peradeniya', distanceOffset: 109, timeOffset: '3h 20m' },
          { name: 'Kandy', distanceOffset: 115, timeOffset: '3h 30m' }
        ]
      },
      {
        startingLocation: 'Colombo', destination: 'Galle', distance: 120, duration: '2h 30m', status: 'Active',
        stops: [
          { name: 'Wellawatte', distanceOffset: 6, timeOffset: '12m' },
          { name: 'Dehiwala', distanceOffset: 10, timeOffset: '18m' },
          { name: 'Mount Lavinia', distanceOffset: 13, timeOffset: '24m' },
          { name: 'Ratmalana', distanceOffset: 16, timeOffset: '30m' },
          { name: 'Moratuwa', distanceOffset: 20, timeOffset: '38m' },
          { name: 'Panadura', distanceOffset: 28, timeOffset: '50m' },
          { name: 'Wadduwa', distanceOffset: 35, timeOffset: '1h 00m' },
          { name: 'Kalutara', distanceOffset: 43, timeOffset: '1h 12m' },
          { name: 'Beruwala', distanceOffset: 55, timeOffset: '1h 28m' },
          { name: 'Aluthgama', distanceOffset: 60, timeOffset: '1h 35m' },
          { name: 'Bentota', distanceOffset: 64, timeOffset: '1h 40m' },
          { name: 'Kosgoda', distanceOffset: 74, timeOffset: '1h 52m' },
          { name: 'Balapitiya', distanceOffset: 82, timeOffset: '2h 02m' },
          { name: 'Ambalangoda', distanceOffset: 86, timeOffset: '2h 08m' },
          { name: 'Hikkaduwa', distanceOffset: 100, timeOffset: '2h 20m' },
          { name: 'Galle', distanceOffset: 120, timeOffset: '2h 30m' }
        ]
      },
      {
        startingLocation: 'Colombo', destination: 'Matara', distance: 160, duration: '3h 30m', status: 'Active',
        stops: [
          { name: 'Dehiwala', distanceOffset: 10, timeOffset: '18m' },
          { name: 'Moratuwa', distanceOffset: 20, timeOffset: '35m' },
          { name: 'Panadura', distanceOffset: 28, timeOffset: '48m' },
          { name: 'Kalutara', distanceOffset: 43, timeOffset: '1h 10m' },
          { name: 'Beruwala', distanceOffset: 55, timeOffset: '1h 25m' },
          { name: 'Aluthgama', distanceOffset: 60, timeOffset: '1h 32m' },
          { name: 'Bentota', distanceOffset: 64, timeOffset: '1h 38m' },
          { name: 'Ambalangoda', distanceOffset: 86, timeOffset: '2h 05m' },
          { name: 'Hikkaduwa', distanceOffset: 100, timeOffset: '2h 20m' },
          { name: 'Galle', distanceOffset: 120, timeOffset: '2h 45m' },
          { name: 'Unawatuna', distanceOffset: 126, timeOffset: '2h 55m' },
          { name: 'Habaraduwa', distanceOffset: 133, timeOffset: '3h 05m' },
          { name: 'Koggala', distanceOffset: 137, timeOffset: '3h 10m' },
          { name: 'Ahangama', distanceOffset: 143, timeOffset: '3h 18m' },
          { name: 'Weligama', distanceOffset: 148, timeOffset: '3h 24m' },
          { name: 'Mirissa', distanceOffset: 153, timeOffset: '3h 28m' },
          { name: 'Matara', distanceOffset: 160, timeOffset: '3h 30m' }
        ]
      },
      {
        startingLocation: 'Colombo', destination: 'Badulla', distance: 230, duration: '6h', status: 'Active',
        stops: [
          { name: 'Maharagama', distanceOffset: 15, timeOffset: '25m' },
          { name: 'Kottawa', distanceOffset: 20, timeOffset: '35m' },
          { name: 'Homagama', distanceOffset: 25, timeOffset: '45m' },
          { name: 'Padukka', distanceOffset: 35, timeOffset: '1h 00m' },
          { name: 'Hanwella', distanceOffset: 42, timeOffset: '1h 12m' },
          { name: 'Avissawella', distanceOffset: 58, timeOffset: '1h 35m' },
          { name: 'Eheliyagoda', distanceOffset: 72, timeOffset: '1h 55m' },
          { name: 'Kuruwita', distanceOffset: 88, timeOffset: '2h 20m' },
          { name: 'Ratnapura', distanceOffset: 100, timeOffset: '2h 40m' },
          { name: 'Pelmadulla', distanceOffset: 118, timeOffset: '3h 10m' },
          { name: 'Balangoda', distanceOffset: 142, timeOffset: '3h 50m' },
          { name: 'Belihuloya', distanceOffset: 158, timeOffset: '4h 20m' },
          { name: 'Pambahinna', distanceOffset: 164, timeOffset: '4h 30m' },
          { name: 'Haputale', distanceOffset: 188, timeOffset: '5h 05m' },
          { name: 'Diyatalawa', distanceOffset: 198, timeOffset: '5h 20m' },
          { name: 'Bandarawela', distanceOffset: 208, timeOffset: '5h 35m' },
          { name: 'Hali-Ela', distanceOffset: 222, timeOffset: '5h 50m' },
          { name: 'Badulla', distanceOffset: 230, timeOffset: '6h 00m' }
        ]
      },
      {
        startingLocation: 'Colombo', destination: 'Jaffna', distance: 400, duration: '8h', status: 'Active',
        stops: [
          { name: 'Kadawatha', distanceOffset: 16, timeOffset: '25m' },
          { name: 'Nittambuwa', distanceOffset: 40, timeOffset: '55m' },
          { name: 'Warakapola', distanceOffset: 56, timeOffset: '1h 20m' },
          { name: 'Kurunegala', distanceOffset: 95, timeOffset: '2h 10m' },
          { name: 'Dambulla', distanceOffset: 160, timeOffset: '3h 30m' },
          { name: 'Kekirawa', distanceOffset: 185, timeOffset: '4h 00m' },
          { name: 'Maradankadawala', distanceOffset: 198, timeOffset: '4h 15m' },
          { name: 'Mihintale', distanceOffset: 218, timeOffset: '4h 40m' },
          { name: 'Medawachchiya', distanceOffset: 245, timeOffset: '5h 10m' },
          { name: 'Vavuniya', distanceOffset: 270, timeOffset: '5h 40m' },
          { name: 'Omanthai', distanceOffset: 285, timeOffset: '6h 00m' },
          { name: 'Puliyankulam', distanceOffset: 300, timeOffset: '6h 20m' },
          { name: 'Mankulam', distanceOffset: 325, timeOffset: '6h 50m' },
          { name: 'Kilinochchi', distanceOffset: 355, timeOffset: '7h 25m' },
          { name: 'Paranthan', distanceOffset: 362, timeOffset: '7h 35m' },
          { name: 'Elephant Pass', distanceOffset: 372, timeOffset: '7h 45m' },
          { name: 'Chavakachcheri', distanceOffset: 388, timeOffset: '7h 55m' },
          { name: 'Jaffna', distanceOffset: 400, timeOffset: '8h 00m' }
        ]
      },
      {
        startingLocation: 'Colombo', destination: 'Anuradhapura', distance: 205, duration: '4h 30m', status: 'Active',
        stops: [
          { name: 'Kadawatha', distanceOffset: 16, timeOffset: '25m' },
          { name: 'Nittambuwa', distanceOffset: 40, timeOffset: '55m' },
          { name: 'Warakapola', distanceOffset: 56, timeOffset: '1h 20m' },
          { name: 'Polgahawela', distanceOffset: 78, timeOffset: '1h 50m' },
          { name: 'Kurunegala', distanceOffset: 95, timeOffset: '2h 15m' },
          { name: 'Wariyapola', distanceOffset: 115, timeOffset: '2h 45m' },
          { name: 'Padeniya', distanceOffset: 125, timeOffset: '3h 00m' },
          { name: 'Galgamuwa', distanceOffset: 155, timeOffset: '3h 35m' },
          { name: 'Thambuttegama', distanceOffset: 175, timeOffset: '4h 00m' },
          { name: 'Talawa', distanceOffset: 190, timeOffset: '4h 15m' },
          { name: 'Anuradhapura', distanceOffset: 205, timeOffset: '4h 30m' }
        ]
      },
      {
        startingLocation: 'Colombo', destination: 'Kurunegala', distance: 95, duration: '2h 30m', status: 'Active',
        stops: [
          { name: 'Peliyagoda', distanceOffset: 8, timeOffset: '15m' },
          { name: 'Kadawatha', distanceOffset: 16, timeOffset: '28m' },
          { name: 'Yakkala', distanceOffset: 32, timeOffset: '50m' },
          { name: 'Nittambuwa', distanceOffset: 40, timeOffset: '1h 05m' },
          { name: 'Warakapola', distanceOffset: 56, timeOffset: '1h 30m' },
          { name: 'Ambepussa', distanceOffset: 60, timeOffset: '1h 38m' },
          { name: 'Alawwa', distanceOffset: 68, timeOffset: '1h 52m' },
          { name: 'Polgahawela', distanceOffset: 78, timeOffset: '2h 08m' },
          { name: 'Kurunegala', distanceOffset: 95, timeOffset: '2h 30m' }
        ]
      },
      {
        startingLocation: 'Kandy', destination: 'Nuwara Eliya', distance: 80, duration: '2h 30m', status: 'Active',
        stops: [
          { name: 'Peradeniya', distanceOffset: 7, timeOffset: '15m' },
          { name: 'Gampola', distanceOffset: 20, timeOffset: '40m' },
          { name: 'Ulapane', distanceOffset: 28, timeOffset: '55m' },
          { name: 'Nawalapitiya Junction', distanceOffset: 36, timeOffset: '1h 10m' },
          { name: 'Pussellawa', distanceOffset: 48, timeOffset: '1h 35m' },
          { name: 'Ramboda', distanceOffset: 60, timeOffset: '1h 55m' },
          { name: 'Labukele', distanceOffset: 70, timeOffset: '2h 15m' },
          { name: 'Nuwara Eliya', distanceOffset: 80, timeOffset: '2h 30m' }
        ]
      },
      {
        startingLocation: 'Panadura', destination: 'Malabe', distance: 45, duration: '2h', status: 'Active',
        stops: [
          { name: 'Moratuwa', distanceOffset: 8, timeOffset: '20m' },
          { name: 'Katubedda', distanceOffset: 12, timeOffset: '30m' },
          { name: 'Ratmalana', distanceOffset: 15, timeOffset: '40m' },
          { name: 'Mount Lavinia', distanceOffset: 18, timeOffset: '50m' },
          { name: 'Dehiwala', distanceOffset: 21, timeOffset: '1h 00m' },
          { name: 'Kalubowila', distanceOffset: 24, timeOffset: '1h 10m' },
          { name: 'Kohuwala', distanceOffset: 26, timeOffset: '1h 15m' },
          { name: 'Nugegoda', distanceOffset: 29, timeOffset: '1h 25m' },
          { name: 'Pitakotte', distanceOffset: 33, timeOffset: '1h 35m' },
          { name: 'Thalawathugoda', distanceOffset: 37, timeOffset: '1h 45m' },
          { name: 'Hokandara', distanceOffset: 41, timeOffset: '1h 52m' },
          { name: 'Arangala', distanceOffset: 43, timeOffset: '1h 56m' },
          { name: 'Malabe', distanceOffset: 45, timeOffset: '2h 00m' }
        ]
      },
      {
        startingLocation: 'Kaduwela', destination: 'Gampaha', distance: 35, duration: '1h 15m', status: 'Active',
        stops: [
          { name: 'Biyagama', distanceOffset: 6, timeOffset: '15m' },
          { name: 'Malwana', distanceOffset: 12, timeOffset: '25m' },
          { name: 'Dekatana', distanceOffset: 18, timeOffset: '38m' },
          { name: 'Dompe', distanceOffset: 24, timeOffset: '50m' },
          { name: 'Weliweriya', distanceOffset: 29, timeOffset: '1h 02m' },
          { name: 'Gampaha', distanceOffset: 35, timeOffset: '1h 15m' }
        ]
      }
    ];

    const createdRoutes = [];
    for (let r of routesData) {
      const route = await db.create('Route', r);
      createdRoutes.push(route);
    }
    console.log(`✅ Seeded ${routesData.length} Routes with stops`);

    // 4. Seed Schedules (Trips)
    const today = new Date().toISOString().split('T')[0];

    const scheduleConfigs = [
      { busNum: 'NE-2004', routeIdx: 0, time: '06:30', arr: '10:00', price: 15 },
      { busNum: 'NC-4567', routeIdx: 0, time: '13:00', arr: '16:30', price: 16 },
      { busNum: 'NJ-6721', routeIdx: 1, time: '07:00', arr: '09:30', price: 12 },
      { busNum: 'NE-7451', routeIdx: 1, time: '15:30', arr: '18:00', price: 14 },
      { busNum: 'NF-4582', routeIdx: 2, time: '08:00', arr: '11:30', price: 18 },
      { busNum: 'NJ-2349', routeIdx: 2, time: '14:00', arr: '17:30', price: 14 },
      { busNum: 'NE-5623', routeIdx: 3, time: '06:00', arr: '12:00', price: 22 },
      { busNum: 'NF-4582', routeIdx: 4, time: '20:30', arr: '04:30', price: 28 },
      { busNum: 'NC-4567', routeIdx: 5, time: '07:30', arr: '12:00', price: 18 },
      { busNum: 'NC-9856', routeIdx: 5, time: '11:00', arr: '15:30', price: 12 },
      { busNum: 'NJ-2349', routeIdx: 6, time: '09:00', arr: '11:30', price: 10 },
      { busNum: 'NE-7451', routeIdx: 7, time: '08:30', arr: '11:00', price: 14 },
      { busNum: 'NC-9856', routeIdx: 8, time: '07:15', arr: '09:15', price: 6 },
      { busNum: 'NB-8902', routeIdx: 9, time: '08:00', arr: '09:15', price: 5 }
    ];

    for (let sc of scheduleConfigs) {
      const bus = createdBuses[sc.busNum];
      const route = createdRoutes[sc.routeIdx];
      if (bus && route) {
        await db.create('Schedule', {
          bus: bus._id,
          route: route._id,
          departureDate: today,
          departureTime: sc.time,
          arrivalTime: sc.arr,
          ticketPrice: sc.price,
          availableSeats: bus.seatCapacity,
          frequency: 'Everyday',
          selectedDays: [],
          status: 'Active'
        });
      }
    }

    console.log(`✅ Seeded ${scheduleConfigs.length} Trip Schedules`);

    // 5. Seed Offers (Promo Codes)
    await db.create('Offer', {
      code: 'YATHRA10',
      discountType: 'Percentage',
      value: 10,
      minBookingValue: 10,
      expiryDate: '2026-12-31',
      status: 'Active'
    });

    await db.create('Offer', {
      code: 'TRIPZO10',
      discountType: 'Percentage',
      value: 10,
      minBookingValue: 10,
      expiryDate: '2026-12-31',
      status: 'Active'
    });

    await db.create('Offer', {
      code: 'WELCOME50',
      discountType: 'Fixed',
      value: 5,
      minBookingValue: 20,
      expiryDate: '2026-12-31',
      status: 'Active'
    });

    console.log('✅ Seeded Offers');

    // 6. Seed reviews
    await db.create('Review', {
      customer: customer._id,
      bus: bus1._id,
      rating: 5,
      comment: 'Excellent journey, extremely comfortable luxury seats and fast Highway route.'
    });

    await db.create('Review', {
      customer: customer._id,
      bus: bus2._id,
      rating: 4,
      comment: 'Decent, charging port was working well. Highly recommended.'
    });

    console.log('✅ Seeded Reviews');
    console.log('🌱 Yathra Database Seeding complete! 🎉');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

// Mount API routes
app.use('/api', apiRouter);

// Base route for connectivity checks
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Yathra Bus Booking System REST API online!',
    mode: db.isLocal() ? 'Local File Fallback Database' : 'MongoDB Production Database'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start Server
const start = async () => {
  await connectDB();
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Yathra REST API Server running on port ${PORT}`);
  });
};

start();
