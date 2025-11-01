import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import PoliklinikPage from '../pages/PoliklinikPage';
import DoctorsPage from '../pages/DoctorsPage';
import AppointmentPage from '../pages/AppointmentPage';
import EmergencyPage from '../pages/EmergencyPage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import AdminDashboard from '../pages/admin/AdminDashboard';

const AppRoutes = ({ showNotification }) => {
  return (
    <Routes>
      <Route path="/" element={<HomePage showNotification={showNotification} />} />
      <Route path="/poliklinik" element={<PoliklinikPage />} />
      <Route path="/dokter" element={<DoctorsPage />} />
      <Route path="/appointment" element={<AppointmentPage showNotification={showNotification} />} />
      <Route path="/emergency" element={<EmergencyPage />} />
      <Route path="/tentang" element={<AboutPage />} />
      <Route path="/kontak" element={<ContactPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
};

export default AppRoutes;