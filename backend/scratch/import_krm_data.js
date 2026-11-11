const fs = require('fs');
const path = require('path');
const { connectDB, db, models } = require('../src/config/db');

const JSON_DB_DIR = path.join(__dirname, '..', 'data');

const busesData = [
  {
    busNumber: 'NE-2004',
    name: 'KRM Blue King',
    type: 'Luxury',
    seatCapacity: 49,
    facilities: ['Wi-Fi', 'Charging', 'AC', 'TV'],
    image: '/hero_bus.jpg',
    status: 'Available'
  },
  {
    busNumber: 'NF-4582',
    name: 'KRM Royal Express',
    type: 'Super Luxury',
    seatCapacity: 45,
    facilities: ['Wi-Fi', 'Charging', 'AC', 'TV'],
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600',
    status: 'Available'
  },
  {
    busNumber: 'NJ-6721',
    name: 'KRM Highway Star',
    type: 'Semi Luxury',
    seatCapacity: 54,
    facilities: ['Charging', 'AC'],
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=600',
    status: 'Available'
  },
  {
    busNumber: 'NC-9856',
    name: 'KRM Silver Line',
    type: 'Normal',
    seatCapacity: 54,
    facilities: ['Charging'],
    image: 'https://images.unsplash.com/photo-1562620644-65ab47390225?auto=format&fit=crop&q=80&w=600',
    status: 'Available'
  },
  {
    busNumber: 'NB-3478',
    name: 'KRM Night Rider',
    type: 'Luxury',
    seatCapacity: 49,
    facilities: ['Wi-Fi', 'Charging', 'AC', 'TV'],
    image: '/hero_bus.jpg',
    status: 'On Trip'
  },
  {
    busNumber: 'NE-5623',
    name: 'KRM Blue Diamond',
    type: 'Super Luxury',
    seatCapacity: 45,
    facilities: ['Wi-Fi', 'Charging', 'AC', 'TV'],
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600',
    status: 'Available'
  },
  {
    busNumber: 'NF-7814',
    name: 'KRM Viking Express',
    type: 'Normal',
    seatCapacity: 54,
    facilities: ['Charging'],
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=600',
    status: 'Maintenance'
  },
  {
    busNumber: 'NJ-2349',
    name: 'KRM City Rider',
    type: 'Semi Luxury',
    seatCapacity: 54,
    facilities: ['Charging', 'AC'],
    image: 'https://images.unsplash.com/photo-1562620644-65ab47390225?auto=format&fit=crop&q=80&w=600',
    status: 'Available'
  },
  {
    busNumber: 'NC-4567',
    name: 'KRM Golden Eagle',
    type: 'Luxury',
    seatCapacity: 49,
    facilities: ['Wi-Fi', 'Charging', 'AC', 'TV'],
    image: '/hero_bus.jpg',
    status: 'Available'
  },
  {
    busNumber: 'NB-8902',
    name: 'KRM Road Master',
    type: 'Normal',
    seatCapacity: 54,
    facilities: ['Charging'],
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=600',
    status: 'Available'
  },
  {
    busNumber: 'NE-7451',
    name: 'KRM Royal Blue',
    type: 'Luxury',
    seatCapacity: 49,
    facilities: ['Wi-Fi', 'Charging', 'AC', 'TV'],
    image: '/hero_bus.jpg',
    status: 'Available'
  },
  {
    busNumber: 'NF-3208',
    name: 'KRM Express Star',
    type: 'Semi Luxury',
    seatCapacity: 54,
    facilities: ['Charging', 'AC'],
    image: 'https://images.unsplash.com/photo-1562620644-65ab47390225?auto=format&fit=crop&q=80&w=600',
    status: 'On Trip'
  }
];

const routesData = [
  {
    startingLocation: 'Colombo',
    destination: 'Kandy',
    distance: 115,
    duration: '3h 30m',
    status: 'Active',
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
    startingLocation: 'Colombo',
    destination: 'Galle',
    distance: 120,
    duration: '2h 30m',
    status: 'Active',
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
    startingLocation: 'Colombo',
    destination: 'Matara',
    distance: 160,
    duration: '3h 30m',
    status: 'Active',
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
    startingLocation: 'Colombo',
    destination: 'Badulla',
    distance: 230,
    duration: '6h',
    status: 'Active',
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
    startingLocation: 'Colombo',
    destination: 'Jaffna',
    distance: 400,
    duration: '8h',
    status: 'Active',
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
    startingLocation: 'Colombo',
    destination: 'Anuradhapura',
    distance: 205,
    duration: '4h 30m',
    status: 'Active',
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
    startingLocation: 'Colombo',
    destination: 'Kurunegala',
    distance: 95,
    duration: '2h 30m',
    status: 'Active',
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
    startingLocation: 'Kandy',
    destination: 'Nuwara Eliya',
    distance: 80,
    duration: '2h 30m',
    status: 'Active',
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
    startingLocation: 'Panadura',
    destination: 'Malabe',
    distance: 45,
    duration: '2h',
    status: 'Active',
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
    startingLocation: 'Kaduwela',
    destination: 'Gampaha',
    distance: 35,
    duration: '1h 15m',
    status: 'Active',
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

const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

async function run() {
  console.log('🔄 Starting full KRM database migration...');
  await connectDB();

  // 1. Prepare Buses
  const busesWithIds = busesData.map(b => ({
    _id: generateId(),
    ...b,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  // 2. Prepare Routes
  const routesWithIds = routesData.map(r => ({
    _id: generateId(),
    ...r,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  // 3. Prepare Schedules connecting these buses and routes
  const today = new Date().toISOString().split('T')[0];
  const schedules = [];

  // Helper to find bus by number
  const getBus = (busNumber) => busesWithIds.find(b => b.busNumber === busNumber);

  // Route 1: Colombo - Kandy (NE-2004 Luxury, NC-4567 Luxury)
  schedules.push({
    _id: generateId(),
    bus: getBus('NE-2004')._id,
    route: routesWithIds[0]._id,
    departureDate: today,
    departureTime: '06:30',
    arrivalTime: '10:00',
    ticketPrice: 15,
    availableSeats: getBus('NE-2004').seatCapacity,
    frequency: 'Everyday',
    selectedDays: [],
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  schedules.push({
    _id: generateId(),
    bus: getBus('NC-4567')._id,
    route: routesWithIds[0]._id,
    departureDate: today,
    departureTime: '13:00',
    arrivalTime: '16:30',
    ticketPrice: 16,
    availableSeats: getBus('NC-4567').seatCapacity,
    frequency: 'Everyday',
    selectedDays: [],
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Route 2: Colombo - Galle (NJ-6721 Semi Luxury, NE-7451 Luxury)
  schedules.push({
    _id: generateId(),
    bus: getBus('NJ-6721')._id,
    route: routesWithIds[1]._id,
    departureDate: today,
    departureTime: '07:00',
    arrivalTime: '09:30',
    ticketPrice: 12,
    availableSeats: getBus('NJ-6721').seatCapacity,
    frequency: 'Everyday',
    selectedDays: [],
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  schedules.push({
    _id: generateId(),
    bus: getBus('NE-7451')._id,
    route: routesWithIds[1]._id,
    departureDate: today,
    departureTime: '15:30',
    arrivalTime: '18:00',
    ticketPrice: 14,
    availableSeats: getBus('NE-7451').seatCapacity,
    frequency: 'Everyday',
    selectedDays: [],
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Route 3: Colombo - Matara (NF-4582 Super Luxury, NJ-2349 Semi Luxury)
  schedules.push({
    _id: generateId(),
    bus: getBus('NF-4582')._id,
    route: routesWithIds[2]._id,
    departureDate: today,
    departureTime: '08:00',
    arrivalTime: '11:30',
    ticketPrice: 18,
    availableSeats: getBus('NF-4582').seatCapacity,
    frequency: 'Everyday',
    selectedDays: [],
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  schedules.push({
    _id: generateId(),
    bus: getBus('NJ-2349')._id,
    route: routesWithIds[2]._id,
    departureDate: today,
    departureTime: '14:00',
    arrivalTime: '17:30',
    ticketPrice: 14,
    availableSeats: getBus('NJ-2349').seatCapacity,
    frequency: 'Everyday',
    selectedDays: [],
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Route 4: Colombo - Badulla (NE-5623 Super Luxury)
  schedules.push({
    _id: generateId(),
    bus: getBus('NE-5623')._id,
    route: routesWithIds[3]._id,
    departureDate: today,
    departureTime: '06:00',
    arrivalTime: '12:00',
    ticketPrice: 22,
    availableSeats: getBus('NE-5623').seatCapacity,
    frequency: 'Everyday',
    selectedDays: [],
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Route 5: Colombo - Jaffna (NF-4582 Super Luxury, NE-2004 Luxury)
  schedules.push({
    _id: generateId(),
    bus: getBus('NF-4582')._id,
    route: routesWithIds[4]._id,
    departureDate: today,
    departureTime: '20:30',
    arrivalTime: '04:30',
    ticketPrice: 28,
    availableSeats: getBus('NF-4582').seatCapacity,
    frequency: 'Everyday',
    selectedDays: [],
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Route 6: Colombo - Anuradhapura (NC-4567 Luxury, NC-9856 Normal)
  schedules.push({
    _id: generateId(),
    bus: getBus('NC-4567')._id,
    route: routesWithIds[5]._id,
    departureDate: today,
    departureTime: '07:30',
    arrivalTime: '12:00',
    ticketPrice: 18,
    availableSeats: getBus('NC-4567').seatCapacity,
    frequency: 'Everyday',
    selectedDays: [],
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  schedules.push({
    _id: generateId(),
    bus: getBus('NC-9856')._id,
    route: routesWithIds[5]._id,
    departureDate: today,
    departureTime: '11:00',
    arrivalTime: '15:30',
    ticketPrice: 12,
    availableSeats: getBus('NC-9856').seatCapacity,
    frequency: 'Everyday',
    selectedDays: [],
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Route 7: Colombo - Kurunegala (NJ-2349 Semi Luxury, NB-8902 Normal)
  schedules.push({
    _id: generateId(),
    bus: getBus('NJ-2349')._id,
    route: routesWithIds[6]._id,
    departureDate: today,
    departureTime: '09:00',
    arrivalTime: '11:30',
    ticketPrice: 10,
    availableSeats: getBus('NJ-2349').seatCapacity,
    frequency: 'Everyday',
    selectedDays: [],
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Route 8: Kandy - Nuwara Eliya (NE-7451 Luxury, NJ-6721 Semi Luxury)
  schedules.push({
    _id: generateId(),
    bus: getBus('NE-7451')._id,
    route: routesWithIds[7]._id,
    departureDate: today,
    departureTime: '08:30',
    arrivalTime: '11:00',
    ticketPrice: 14,
    availableSeats: getBus('NE-7451').seatCapacity,
    frequency: 'Everyday',
    selectedDays: [],
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Route 9: Panadura - Malabe (NC-9856 Normal, NB-8902 Normal)
  schedules.push({
    _id: generateId(),
    bus: getBus('NC-9856')._id,
    route: routesWithIds[8]._id,
    departureDate: today,
    departureTime: '07:15',
    arrivalTime: '09:15',
    ticketPrice: 6,
    availableSeats: getBus('NC-9856').seatCapacity,
    frequency: 'Everyday',
    selectedDays: [],
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Route 10: Kaduwela - Gampaha (NB-8902 Normal, NJ-2349 Semi Luxury)
  schedules.push({
    _id: generateId(),
    bus: getBus('NB-8902')._id,
    route: routesWithIds[9]._id,
    departureDate: today,
    departureTime: '08:00',
    arrivalTime: '09:15',
    ticketPrice: 5,
    availableSeats: getBus('NB-8902').seatCapacity,
    frequency: 'Everyday',
    selectedDays: [],
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Write JSON files to data directory
  fs.writeFileSync(path.join(JSON_DB_DIR, 'bus.json'), JSON.stringify(busesWithIds, null, 2));
  fs.writeFileSync(path.join(JSON_DB_DIR, 'route.json'), JSON.stringify(routesWithIds, null, 2));
  fs.writeFileSync(path.join(JSON_DB_DIR, 'schedule.json'), JSON.stringify(schedules, null, 2));

  console.log(`✅ Successfully saved 12 buses to data/bus.json`);
  console.log(`✅ Successfully saved 10 routes with complete stops to data/route.json`);
  console.log(`✅ Successfully saved ${schedules.length} schedules to data/schedule.json`);

  // If MongoDB is connected and accessible, sync to MongoDB as well
  if (!db.isLocal() && models.Bus && models.Route && models.Schedule) {
    try {
      console.log('🔄 Syncing records with MongoDB...');
      await models.Bus.deleteMany({});
      await models.Route.deleteMany({});
      await models.Schedule.deleteMany({});

      const mongoBuses = await models.Bus.insertMany(busesData);
      const mongoRoutes = await models.Route.insertMany(routesData);

      const mongoSchedules = [];
      const getMongoBus = (num) => mongoBuses.find(b => b.busNumber === num);

      // Re-link with MongoDB ObjectIds
      for (let s of schedules) {
        const origBus = busesWithIds.find(b => b._id === s.bus);
        const origRouteIndex = routesWithIds.findIndex(r => r._id === s.route);
        const mBus = getMongoBus(origBus.busNumber);
        const mRoute = mongoRoutes[origRouteIndex];
        if (mBus && mRoute) {
          mongoSchedules.push({
            bus: mBus._id,
            route: mRoute._id,
            departureDate: s.departureDate,
            departureTime: s.departureTime,
            arrivalTime: s.arrivalTime,
            ticketPrice: s.ticketPrice,
            availableSeats: s.availableSeats,
            frequency: s.frequency,
            selectedDays: s.selectedDays,
            status: s.status
          });
        }
      }
      await models.Schedule.insertMany(mongoSchedules);
      console.log('✅ Synchronized with MongoDB successfully!');
    } catch (mErr) {
      console.warn('MongoDB sync notice:', mErr.message);
    }
  }

  console.log('🎉 All KRM fleet buses, routes, and schedules are now active in the system!');
  process.exit(0);
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
