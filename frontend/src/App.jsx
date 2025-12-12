import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AdminDashboard from './pages/AdminDashboard';
import Kiosk from './pages/Kiosk';
import Counter from './pages/Counter';
import MasterData from './pages/MasterData';
import Login from './pages/Login';
import StaffCounter from './pages/StaffCounter';
import MainMenu from './pages/MainMenu';
import ProtectedRoute from './components/ProtectedRoute';
import ThemeToggle from './components/ThemeToggle';
import DoctorLeaveCalendar from './components/DoctorLeaveCalendar';
import Welcome from './pages/Welcome';
import QueueStatus from './pages/QueueStatus';
import CommandPalette from './components/CommandPalette';
import PageWrapper from './components/PageWrapper';
import Registration from './pages/Registration';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientList from './pages/PatientList'; // New
import PatientDetail from './pages/PatientDetail'; // New
import PharmacyDashboard from './pages/PharmacyDashboard'; // New
import CashierDashboard from './pages/CashierDashboard'; // New

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />

        {/* Public Routes */}
        <Route path="/" element={<PageWrapper><Welcome /></PageWrapper>} />
        <Route path="/kiosk" element={<PageWrapper><Kiosk /></PageWrapper>} />
        <Route path="/counter" element={<PageWrapper><Counter /></PageWrapper>} />
        <Route path="/queue-status/:ticketId" element={<PageWrapper><QueueStatus /></PageWrapper>} />

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
          <Route path="/admin/counter" element={<PageWrapper><StaffCounter /></PageWrapper>} />
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
