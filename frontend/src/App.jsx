import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute';
import ThemeToggle from './components/ThemeToggle';
import CommandPalette from './components/CommandPalette';
import PageWrapper from './components/PageWrapper';
import PageLoader from './components/PageLoader';

// Lazy Load Pages
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const Kiosk = React.lazy(() => import('./pages/Kiosk'));
const Counter = React.lazy(() => import('./pages/Counter'));
const MasterData = React.lazy(() => import('./pages/MasterData'));
const Login = React.lazy(() => import('./pages/Login'));
const MainMenu = React.lazy(() => import('./pages/MainMenu'));
const DoctorLeaveCalendar = React.lazy(() => import('./components/DoctorLeaveCalendar')); // Accessed via route
const Welcome = React.lazy(() => import('./pages/Welcome'));
const QueueStatus = React.lazy(() => import('./pages/QueueStatus'));
const Registration = React.lazy(() => import('./pages/Registration'));
const DoctorDashboard = React.lazy(() => import('./pages/DoctorDashboard'));
const PatientList = React.lazy(() => import('./pages/PatientList'));
const PatientDetail = React.lazy(() => import('./pages/PatientDetail'));
const PharmacyDashboard = React.lazy(() => import('./pages/PharmacyDashboard'));
const CashierDashboard = React.lazy(() => import('./pages/CashierDashboard'));
const PublicSchedule = React.lazy(() => import('./pages/PublicSchedule'));

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />

          {/* Public Routes */}
          <Route path="/" element={<PageWrapper><Welcome /></PageWrapper>} />
          <Route path="/kiosk" element={<PageWrapper><Kiosk /></PageWrapper>} />
          <Route path="/counter" element={<PageWrapper><Counter /></PageWrapper>} />
          <Route path="/queue-status/:ticketId" element={<PageWrapper><QueueStatus /></PageWrapper>} />
          <Route path="/public/schedule" element={<PageWrapper><PublicSchedule /></PageWrapper>} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STAFF']} />}>
            <Route path="/menu" element={<PageWrapper><MainMenu /></PageWrapper>} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
            <Route path="/admin/master-data" element={<PageWrapper><MasterData /></PageWrapper>} />
            <Route path="/admin/leave-calendar" element={<PageWrapper><DoctorLeaveCalendar /></PageWrapper>} />
          </Route>

          {/* Staff Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']} />}>
            <Route path="/admin/counter" element={<PageWrapper><Registration /></PageWrapper>} /> {/* Redirecting old route to Registration just in case, or we can just remove it. Let's redirect for safety or just use Registration */}
            <Route path="/registration" element={<PageWrapper><Registration /></PageWrapper>} />
            <Route path="/doctor/dashboard" element={<PageWrapper><DoctorDashboard /></PageWrapper>} />


            {/* Patient Hub */}
            <Route path="/admin/patients" element={<PageWrapper><PatientList /></PageWrapper>} />
            <Route path="/admin/patients/:id" element={<PageWrapper><PatientDetail /></PageWrapper>} />

            {/* Pharmacy Module */}
            <Route path="/pharmacy" element={<PageWrapper><PharmacyDashboard /></PageWrapper>} />

            {/* Cashier Module */}
            <Route path="/cashier" element={<PageWrapper><CashierDashboard /></PageWrapper>} />
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeToggle />
      <CommandPalette />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
