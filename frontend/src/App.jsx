import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <ThemeToggle />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Public Routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/kiosk" element={<Kiosk />} />
        <Route path="/counter" element={<Counter />} />
        <Route path="/queue-status/:ticketId" element={<QueueStatus />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STAFF']} />}>
          <Route path="/menu" element={<MainMenu />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/master-data" element={<MasterData />} />
          <Route path="/admin/leave-calendar" element={<DoctorLeaveCalendar />} />
        </Route>

        {/* Staff Routes */}
        <Route element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']} />}>
          <Route path="/admin/counter" element={<StaffCounter />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
