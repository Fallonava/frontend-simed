import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './store/useAuthStore';
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
const RegistrationRJ = React.lazy(() => import('./pages/RegistrationRJ'));
const RegistrationIGD = React.lazy(() => import('./pages/RegistrationIGD'));
const RegistrationRanap = React.lazy(() => import('./pages/RegistrationRanap'));
const DoctorDashboard = React.lazy(() => import('./pages/DoctorDashboard'));
const PatientList = React.lazy(() => import('./pages/PatientList'));
const PatientDetail = React.lazy(() => import('./pages/PatientDetail'));
const PharmacyDashboard = React.lazy(() => import('./pages/PharmacyDashboard'));
const CashierDashboard = React.lazy(() => import('./pages/CashierDashboard'));
const PublicSchedule = React.lazy(() => import('./pages/PublicSchedule'));
const ChronologyGenerator = React.lazy(() => import('./pages/ChronologyGenerator'));
const NurseDashboard = React.lazy(() => import('./pages/NurseDashboard')); // New
const LabDashboard = React.lazy(() => import('./pages/LabDashboard'));
const RadiologyDashboard = React.lazy(() => import('./pages/RadiologyDashboard')); // New
const AdmissionDashboard = React.lazy(() => import('./pages/AdmissionDashboard')); // Inpatient Module
const BedHeadUnit = React.lazy(() => import('./pages/BedHeadUnit')); // Tablet Mode
const InpatientNurseDashboard = React.lazy(() => import('./pages/InpatientNurseDashboard'));
const NutritionKitchen = React.lazy(() => import('./pages/NutritionKitchen')); // Phase 6
const HRDashboard = React.lazy(() => import('./pages/HRDashboard')); // Phase 8
const FinanceDashboard = React.lazy(() => import('./pages/FinanceDashboard')); // Phase 9

function AnimatedRoutes() {
  const location = useLocation();
  const { user } = useAuthStore();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />

          {/* Public Routes - Conditional Redirect */}
          <Route path="/" element={
            user ? <Navigate to="/menu" replace /> : <PageWrapper><Welcome /></PageWrapper>
          } />

          <Route path="/kiosk" element={<PageWrapper><Kiosk /></PageWrapper>} />
          <Route path="/counter" element={<PageWrapper><Counter /></PageWrapper>} />
          <Route path="/queue-status/:ticketId" element={<PageWrapper><QueueStatus /></PageWrapper>} />
          <Route path="/public/schedule" element={<PageWrapper><PublicSchedule /></PageWrapper>} />

          {/* Bed Head Unit (Tablet Mode - Standalone) */}
          <Route path="/bed-panel/:bedId" element={<BedHeadUnit />} />

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
            <Route path="/admin/counter" element={<PageWrapper><RegistrationRJ /></PageWrapper>} />
            <Route path="/registration" element={<PageWrapper><RegistrationRJ /></PageWrapper>} />
            <Route path="/registration/igd" element={<PageWrapper><RegistrationIGD /></PageWrapper>} />
            <Route path="/registration/ranap" element={<PageWrapper><RegistrationRanap /></PageWrapper>} />
            <Route path="/doctor/dashboard" element={<PageWrapper><DoctorDashboard /></PageWrapper>} />


            {/* Patient Hub */}
            <Route path="/admin/patients" element={<PageWrapper><PatientList /></PageWrapper>} />
            <Route path="/admin/patients/:id" element={<PageWrapper><PatientDetail /></PageWrapper>} />

            {/* Pharmacy Module */}
            <Route path="/pharmacy" element={<PageWrapper><PharmacyDashboard /></PageWrapper>} />

            {/* Cashier Module */}
            <Route path="/cashier" element={<PageWrapper><CashierDashboard /></PageWrapper>} />


            {/* AI Features */}
            <Route path="/chronology" element={<PageWrapper><ChronologyGenerator /></PageWrapper>} />

            {/* Nurse Module */}
            <Route path="/nurse" element={<PageWrapper><NurseDashboard /></PageWrapper>} />

            {/* Lab & Radiology (Separated) */}
            <Route path="/lab" element={<PageWrapper><LabDashboard /></PageWrapper>} />
            <Route path="/radiology" element={<PageWrapper><RadiologyDashboard /></PageWrapper>} />

            {/* Inpatient / Admission */}
            <Route path="/admission" element={<PageWrapper><AdmissionDashboard /></PageWrapper>} />

            {/* Phase 6: Nurse Monitoring */}
            <Route path="/nurse/inpatient" element={<PageWrapper><InpatientNurseDashboard /></PageWrapper>} />
            <Route path="/nutrition" element={<PageWrapper><NutritionKitchen /></PageWrapper>} />
            <Route path="/hr" element={<PageWrapper><HRDashboard /></PageWrapper>} />
            <Route path="/finance" element={<PageWrapper><FinanceDashboard /></PageWrapper>} />
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence >
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
