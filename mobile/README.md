# 🚌 Yathra Mobile App - Bus Booking Management System

A modern, responsive, cross-platform mobile application built with **React Native** and **Expo** for the **Yathra Bus Booking Management System** (Sri Lanka).

---

## 🌟 Key Features

### 👤 1. Passenger Experience
* **Search & Filter**: Search buses across Sri Lanka's cities (Colombo, Kandy, Galle, Jaffna, Ella, etc.) with filters for A/C, Highway Express, Price, and Departure timings.
* **Interactive Touch Seat Map**: 2+2 luxury coach seat selector with visual indicators for available, booked, and women-priority seats, real-time price calculator, and touch/haptic feedback.
* **Digital Boarding Pass & QR Code**: Airline-style perforated ticket card with instant QR code verification, barcode, PNR reference, and 1-tap WhatsApp sharing.
* **Live GPS Bus Tracker**: Real-time simulated telemetry showing bus speed (km/h), live moving bus position along Sri Lankan expressways (E01 / E04), upcoming stops countdown (ETA), and direct "Call Crew" action.
* **Flexible Checkout**: Multi-option payment (Credit/Debit card, FriMi, eZ Cash, Pay on Boarding) and promo coupon verification (`YATHRA10`, `EXPRESS50`).
* **My Bookings**: Filter upcoming and completed journeys with 1-tap cancellation & refund management.

### 🎫 2. Driver / Conductor Companion Mode
* **In-App QR Ticket Validator**: Scan or enter passenger ticket PNR codes at the bus boarding door with instant green validation status.
* **Live Boarding Manifest**: Real-time count of boarded passengers vs available bus capacity.

### 🌍 3. Localization & Personalization
* **3 Languages**: Sinhala (සිංහල), Tamil (தமிழ்), and English with 1-tap header toggle.
* **Dark & Light Theme**: Seamless dark/light theme switching with smooth transitions.

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** (v18+)
* **Expo Go App** (Free on iOS App Store and Google Play Store)

### 1. Start the Mobile App
Open a terminal in the `mobile` folder:
```bash
cd mobile
npm start
```

### 2. Run on Your Physical Phone (Recommended)
1. Open the **Expo Go** app on your phone.
2. Scan the QR code displayed in your terminal.
3. The app will immediately load on your phone with live reload!

### 3. Run in Web Browser
To preview the responsive mobile app directly in your desktop browser:
```bash
npm run web
```

### 4. Run on Android Emulator / iOS Simulator
```bash
npm run android   # For Android Emulator
npm run ios       # For macOS iOS Simulator
```

---

## 📂 Project Architecture

```
mobile/
├── App.js                         # Root Entry (Providers, Theme, Auth, Navigation)
├── app.json                       # Expo Application Manifest & Config
├── package.json                   # Dependencies & Scripts
└── src/
    ├── assets/                    # Brand logos and bus images
    ├── components/
    │   ├── Header.js              # Top bar with Logo, Language & Theme toggles
    │   ├── BusCard.js             # Schedule card with amenities & ratings
    │   ├── SeatMap.js             # Interactive 2+2 touch bus seat grid
    │   ├── RouteTrackerMap.js     # Live GPS route & speed simulation
    │   └── QRTicketCard.js        # Digital QR Boarding Pass
    ├── context/
    │   ├── AuthContext.js         # User session, JWT & demo accounts
    │   ├── LanguageContext.js     # English, Sinhala & Tamil i18n
    │   └── ThemeContext.js        # Light & Dark color tokens
    ├── navigation/
    │   └── AppNavigator.js        # Bottom Tabs & Stack Navigation
    ├── screens/
    │   ├── HomeScreen.js          # Search, Popular Routes & Promos
    │   ├── BusListScreen.js       # Filterable bus schedules
    │   ├── SeatSelectionScreen.js # Interactive seat selector
    │   ├── CheckoutScreen.js      # Passenger details & payment
    │   ├── TicketScreen.js        # Confirmed ticket with QR code
    │   ├── BookingsScreen.js      # Upcoming & completed bookings
    │   ├── LiveTrackerScreen.js   # Live GPS telemetry & route stops
    │   ├── ConductorScannerScreen.js # Conductor QR validator tool
    │   └── ProfileScreen.js       # User settings & preferences
    └── services/
        ├── api.js                 # Backend REST client + resilient fallback
        └── mockData.js            # Sri Lanka routes, schedules & fleets
```

---

## 🔗 Backend Integration
The mobile app connects to the existing Express backend at `http://127.0.0.1:5000/api`. If the backend is not currently running or the phone is offline, the app automatically switches to internal mock data so all features remain testable without interruption.
