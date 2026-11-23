import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useLaunchSettings } from './context/LaunchSettingsContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import PublicBookingNoticeModal from './components/PublicBookingNoticeModal';
import LaunchAnnouncementBanner from './components/LaunchAnnouncementBanner';

// Pages
import Home from './pages/Home';
import BusList from './pages/BusList';
import Details from './pages/Details';
import Payment from './pages/Payment';
import Ticket from './pages/Ticket';
import Bookings from './pages/Bookings';
import { Login, Register } from './pages/Auth';
import { AboutUs, ContactUs } from './pages/AboutContact';
import SliitTransitHub from './pages/SliitTransitHub';

// Admin Pages
import AdminDashboard from './admin/AdminDashboard';
import ManageSliitTransit from './admin/ManageSliitTransit';
import { 
  ManageUsers, ManageBuses, ManageRoutes, ManageSchedules, 
  ManageBookings, ManagePayments, ManageOffers, ManageReviews 
} from './admin/AdminCrud';

// Auth Route Guards
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  const isAdminOrOperator = user && (user.role === 'Admin' || user.role === 'Operator');
  return isAdminOrOperator ? children : <Navigate to="/" />;
}

// Guard for Public Booking Routes: allows Admins, blocks normal users when in Maintenance/Early Access
function PublicBookingRouteGuard({ children }) {
  const { isBookingAllowed, openNoticeModal } = useLaunchSettings();

  useEffect(() => {
    if (!isBookingAllowed) {
      openNoticeModal();
    }
  }, [isBookingAllowed, openNoticeModal]);

  if (!isBookingAllowed) {
    return <Navigate to="/schedules" replace />;
  }
  return children;
}

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors flex flex-col font-sans">
      {/* Auto-scroll to top on route and search query changes */}
      <ScrollToTop />

      {/* Global Navigation header */}
      <Navbar className="no-print" />

      {/* Early Access Announcement Banner */}
      {!isAdmin && <LaunchAnnouncementBanner />}

      {/* Main Page Content Body */}
      <main className={`flex-grow ${isAdmin ? 'h-[calc(100vh-4rem)] overflow-hidden' : ''}`}>
        <ErrorBoundary>
          <Routes>
            {/* Public customer routes */}
            <Route path="/" element={<Home />} />
            <Route path="/schedules" element={<BusList />} />
            <Route path="/sliit-transit" element={<SliitTransitHub />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Auth-protected customer routes */}
            <Route path="/schedules/:id" element={
              <PrivateRoute>
                <PublicBookingRouteGuard>
                  <Details />
                </PublicBookingRouteGuard>
              </PrivateRoute>
            } />
            <Route path="/payment/:bookingId" element={
              <PrivateRoute>
                <PublicBookingRouteGuard>
                  <Payment />
                </PublicBookingRouteGuard>
              </PrivateRoute>
            } />
            <Route path="/ticket/:bookingId" element={
              <PrivateRoute>
                <Ticket />
              </PrivateRoute>
            } />
            <Route path="/bookings" element={
              <PrivateRoute>
                <Bookings />
              </PrivateRoute>
            } />

            {/* Admin console portal (Dashboard, CRM and Reporting) */}
            <Route path="/admin/*" element={
              <AdminRoute>
                <div className="flex h-full overflow-hidden">
                  {/* Admin Sidebar - Always Fixed / Docked on Left */}
                  <Sidebar className="no-print" />
                  
                  {/* Nested Admin views wrapper - Independent scrollable viewport with modern scrollbar */}
                  <div className="flex-1 h-full overflow-y-auto flex flex-col justify-between bg-slate-50 dark:bg-slate-950/40">
                    <div className="p-6 sm:p-8 flex-1">
                      <Routes>
                        <Route index element={<AdminDashboard />} />
                        <Route path="users" element={<ManageUsers />} />
                        <Route path="buses" element={<ManageBuses />} />
                        <Route path="routes" element={<ManageRoutes />} />
                        <Route path="schedules" element={<ManageSchedules />} />
                        <Route path="bookings" element={<ManageBookings />} />
                        <Route path="payments" element={<ManagePayments />} />
                        <Route path="offers" element={<ManageOffers />} />
                        <Route path="reviews" element={<ManageReviews />} />
                        <Route path="sliit-transit" element={<ManageSliitTransit />} />
                      </Routes>
                    </div>

                    {/* Admin Inner Footer */}
                    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800/80 py-4 text-center text-xs font-semibold text-slate-400 no-print shrink-0">
                      &copy; {new Date().getFullYear()} Yathra (යාත්‍රා) Mobility. Made in Sri Lanka. All Rights Reserved.
                    </footer>
                  </div>
                </div>
              </AdminRoute>
            } />

            {/* Fallback wildcard */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ErrorBoundary>
      </main>

      {/* Global Interactive Launch Staging Modal */}
      <PublicBookingNoticeModal />

      {/* Customer Footer banner (Only shown when not on Admin console) */}
      {!isAdmin && <Footer />}
    </div>
  );
}
