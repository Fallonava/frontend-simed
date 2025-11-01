import { HARI } from './constants';

export const formatTime = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes}`;
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
};

export const isPoliklinikOpen = (poliklinik) => {
  if (!poliklinik.is_open_today) return false;
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [openHour, openMinute] = poliklinik.jam_buka.split(':').map(Number);
  const [closeHour, closeMinute] = poliklinik.jam_tutup.split(':').map(Number);
  
  const openTime = openHour * 60 + openMinute;
  const closeTime = closeHour * 60 + closeMinute;
  
  return currentTime >= openTime && currentTime <= closeTime;
};

export const getNextOpenDay = (poliklinik) => {
  const today = new Date().getDay();
  const hariBuka = poliklinik.hari_buka.toLowerCase();
  
  for (let i = 1; i <= 7; i++) {
    const nextDay = (today + i) % 7;
    const dayName = HARI[nextDay].toLowerCase();
    
    if (hariBuka.includes(dayName) || 
        (hariBuka.includes('senin-sabtu') && nextDay >= 1 && nextDay <= 6)) {
      return HARI[nextDay];
    }
  }
  
  return 'Senin';
};

export const calculateWaitTime = (antrianSekarang) => {
  const avgTimePerPatient = 15; // menit
  return antrianSekarang * avgTimePerPatient;
};

export const generateQueueNumber = (poliklinikId) => {
  const prefix = String.fromCharCode(65 + (poliklinikId % 26)); // A-Z
  const number = Math.floor(Math.random() * 100) + 1;
  return `${prefix}${number.toString().padStart(3, '0')}`;
};