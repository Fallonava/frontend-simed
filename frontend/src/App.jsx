import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './store/useAuthStore';
import ThemeToggle from './components/ThemeToggle';
import CommandPalette from './components/CommandPalette';
import PageWrapper from './components/PageWrapper';
import PageLoader from './components/PageLoader';
import SmoothScroll from './components/SmoothScroll';
import { io } from 'socket.io-client';
import { NotificationContainer } from './components/NotificationToast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// Lazy Load Pages
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));

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
// const NurseDashboard = React.lazy(() => import('./pages/NurseDashboard')); // Removed/Unified
// const CentralPharmacy = React.lazy(() => import('./pages/CentralPharmacy')); // Merged into InventoryDashboard
// const GeneralAssets = React.lazy(() => import('./pages/GeneralAssets')); // Merged into InventoryDashboard
const QueueDisplay = React.lazy(() => import('./pages/QueueDisplay')); // Phase 2: TV Display // New
const LabDashboard = React.lazy(() => import('./pages/LabDashboard'));
const RadiologyDashboard = React.lazy(() => import('./pages/RadiologyDashboard')); // New
// const Triage = React.lazy(() => import('./pages/Triage')); // Removed
const AdmissionDashboard = React.lazy(() => import('./pages/AdmissionDashboard')); // Inpatient Module
const BedHeadUnit = React.lazy(() => import('./pages/BedHeadUnit')); // Tablet Mode
const InpatientNurseDashboard = React.lazy(() => import('./pages/InpatientNurseDashboard'));
const NutritionKitchen = React.lazy(() => import('./pages/NutritionKitchen')); // Phase 6
const NutritionOrder = React.lazy(() => import('./pages/NutritionOrder')); // Phase 6 (Nurse View)
const Kiosk = React.lazy(() => import('./pages/Kiosk')); // On-Site Kiosk
const OnlineBooking = React.lazy(() => import('./pages/OnlineBooking')); // Web Booking / MJKN
const NurseStation = React.lazy(() => import('./pages/NurseStation')); // Phase 2b: CPPT
const DischargeDashboard = React.lazy(() => import('./pages/DischargeDashboard')); // Phase 2b: Discharge
const MedicalRecords = React.lazy(() => import('./pages/MedicalRecords')); // Phase 1: Archive
const DocumentCenter = React.lazy(() => import('./pages/DocumentCenter')); // Phase 2: Smart Docs
const HRDashboard = React.lazy(() => import('./pages/HRDashboard')); // Phase 8
const FinanceDashboard = React.lazy(() => import('./pages/FinanceDashboard')); // Phase 9
const InventoryDashboard = React.lazy(() => import('./pages/InventoryDashboard')); // Phase 2: Logistics
const CasemixDashboard = React.lazy(() => import('./pages/CasemixDashboard')); // Phase 2b: Claims
const BackOfficeDashboard = React.lazy(() => import('./pages/BackOfficeDashboard'));
const IntegrationDashboard = React.lazy(() => import('./pages/IntegrationDashboard'));
const MedicalSupport = React.lazy(() => import('./pages/MedicalSupport'));

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

          {/* Public Queue Display (TV Mode) */}
          <Route path="/queue-display" element={<QueueDisplay />} />


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
            {/* Triage Redirect or Removed - Unified in Nurse Station */}
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
            <Route path="/nurse/inpatient" element={<PageWrapper><InpatientNurseDashboard /></PageWrapper>} />
            {/* <Route path="/nurse/inpatient" element={<PageWrapper><div className="p-10 font-bold text-red-500">DEBUGGING DASHBOARD</div></PageWrapper>} /> */}

            {/* Lab & Radiology (Separated) */}
            <Route path="/lab" element={<PageWrapper><LabDashboard /></PageWrapper>} />
            <Route path="/radiology" element={<PageWrapper><RadiologyDashboard /></PageWrapper>} />

            {/* Inpatient / Admission */}
            <Route path="/admission" element={<PageWrapper><AdmissionDashboard /></PageWrapper>} />

            {/* Phase 6: Nurse Monitoring */}
            <Route path="/back-office" element={<PageWrapper><BackOfficeDashboard /></PageWrapper>} />
            <Route path="/integration" element={<PageWrapper><IntegrationDashboard /></PageWrapper>} />
            <Route path="/medical-support" element={<PageWrapper><MedicalSupport /></PageWrapper>} />
            {/* <Route path="/inpatient/beds" element={<PageWrapper><BedManagement /></PageWrapper>} /> Consolidated into Admission */}
            <Route path="/nurse/station" element={<PageWrapper><NurseStation /></PageWrapper>} />
            <Route path="/nurse/discharge" element={<PageWrapper><DischargeDashboard /></PageWrapper>} />
            <Route path="/nutrition" element={<PageWrapper><NutritionKitchen /></PageWrapper>} />
            <Route path="/nurse/diet" element={<PageWrapper><NutritionOrder /></PageWrapper>} />

            {/* Kiosk / Anjungan Mandiri (On-Site) */}
            <Route path="/kiosk" element={<PageWrapper><Kiosk /></PageWrapper>} />

            {/* Online Booking (Web / Mobile JKN) */}
            <Route path="/booking" element={<PageWrapper><OnlineBooking /></PageWrapper>} />
            <Route path="/hr" element={<PageWrapper><HRDashboard /></PageWrapper>} />
            <Route path="/finance" element={<PageWrapper><FinanceDashboard /></PageWrapper>} />
            <Route path="/casemix" element={<PageWrapper><CasemixDashboard /></PageWrapper>} />
            <Route path="/medical-records" element={<PageWrapper><MedicalRecords /></PageWrapper>} />
            <Route path="/documents/center" element={<PageWrapper><DocumentCenter /></PageWrapper>} />

            {/* Logistics & Inventory - Unified */}
            <Route path="/inventory/pharmacy" element={<PageWrapper><InventoryDashboard /></PageWrapper>} />
            <Route path="/inventory/general" element={<PageWrapper><InventoryDashboard /></PageWrapper>} />
            <Route path="/pharmacy/inventory" element={<PageWrapper><InventoryDashboard /></PageWrapper>} />
            {/* Redirects for legacy routes if needed, otherwise handled by MainMenu */}
            <Route path="/logistics/pharmacy" element={<Navigate to="/inventory/general" replace />} />
            <Route path="/logistics/assets" element={<Navigate to="/inventory/general" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence >
  );
}

function App() {
  const [notifications, setNotifications] = React.useState([]);
  const { user } = useAuthStore();

  React.useEffect(() => {
    if (!user) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true
    });

    socket.on('PATIENT_CHECKIN', (data) => {
      console.log('REAL-TIME: Patient Arrived', data);

      // Play subtle notification sound (Premium feel)
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.4;
        audio.play();
      } catch (e) { console.warn("Audio play failed", e); }

      setNotifications(prev => [...prev, { ...data, id: Date.now() }]);
    });

    // Also listen for general admissions if needed
    socket.on('admission_update', (data) => {
      console.log('Admission update:', data);
    });

    return () => socket.disconnect();
  }, [user]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <BrowserRouter>
      <ThemeToggle />
      <CommandPalette />
      <AnimatedRoutes />
      <NotificationContainer
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </BrowserRouter>
  );
}

export default App;
