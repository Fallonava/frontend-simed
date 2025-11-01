import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';
import Notification from './components/common/Notification';
import { PoliklinikProvider } from './context/PoliklinikContext';
import { AppointmentProvider } from './context/AppointmentContext';
import AppRoutes from './routes/AppRoutes';
import './styles/App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => setLoading(false), 2000);
  }, []);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <PoliklinikProvider>
      <AppointmentProvider>
        <div className="App">
          <Header />
          <main className="main-content">
            <AppRoutes showNotification={showNotification} />
          </main>
          <Footer />
          {notification && (
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
            />
          )}
        </div>
      </AppointmentProvider>
    </PoliklinikProvider>
  );
}

export default App;