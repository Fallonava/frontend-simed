import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Stethoscope, MapPin, Activity, Grid, List } from 'lucide-react';
import axios from 'axios';
import FallonavaLogo from '../components/FallonavaLogo';
import { motion, AnimatePresence } from 'framer-motion';

const PublicSchedule = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [view, setView] = useState('daily'); // 'daily' | 'roster'
    const [doctors, setDoctors] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showQrOverlay, setShowQrOverlay] = useState(true);

    const publicUrl = window.location.href;

    // Auto-close QR overlay after 10 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowQrOverlay(false);
        }, 10000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [docsRes, leavesRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/doctors-master`),
                    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/doctor-leaves`)
                ]);
                setDoctors(docsRes.data);
                setLeaves(leavesRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to load data", error);
                setLoading(false);
            }
        };
        fetchData();

        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const isSameDay = (d1, d2) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    // --- Data Processing for Daily View ---
    const dailySchedule = useMemo(() => {
        if (!doctors.length) return [];
        const dayOfWeek = selectedDate.getDay();
        const dbDay = dayOfWeek === 0 ? 7 : dayOfWeek;

        return doctors.filter(doc => {
            const hasSchedule = doc.schedules?.some(s => s.day === dbDay);
            if (!hasSchedule) return false;
            const onLeave = leaves.some(l => l.doctor_id === doc.id && isSameDay(new Date(l.date), selectedDate));
            if (onLeave) return false;
            return true;
        }).map(doc => {
            const schedule = doc.schedules.find(s => s.day === dbDay);
            return { ...doc, time: schedule?.time || 'On Call' };
        });
    }, [doctors, leaves, selectedDate]);

    // --- Data Processing for Roster View ---
    // Returns list of doctors with their full weekly schedule
    const rosterData = useMemo(() => {
        return doctors.map(doc => {
            const weeklySchedule = {};
            // 1=Mon ... 7=Sun
            for (let i = 1; i <= 7; i++) {
                const daySch = doc.schedules?.find(s => s.day === i);
                weeklySchedule[i] = daySch ? daySch.time : null;
            }
            return { ...doc, weekly: weeklySchedule };
        }).filter(doc => Object.values(doc.weekly).some(t => t !== null)); // Only show doctors with schedules
    }, [doctors]);

    const getDoctorCountForDay = (date) => {
        const dayOfWeek = date.getDay();
        const dbDay = dayOfWeek === 0 ? 7 : dayOfWeek;
        return doctors.filter(doc => {
            const hasSchedule = doc.schedules?.some(s => s.day === dbDay);
            if (!hasSchedule) return false;
            const onLeave = leaves.some(l => l.doctor_id === doc.id && isSameDay(new Date(l.date), date));
            return !onLeave;
        }).length;
    };

    // --- Renderers ---

    const renderCalendarGrid = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Fixed 6 rows logic (42 cells max) to ensure consistent height
        const totalSlots = 42;

        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="w-full h-full"></div>);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            const doctorCount = getDoctorCountForDay(date);

            days.push(
                <motion.div
                    key={day}
                    layoutId={`day-${day}`}
                    onClick={() => setSelectedDate(date)}
                    className={`
                        w-full aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer relative transition-all duration-200 border
                        ${isSelected
                            ? 'bg-salm-blue text-white shadow-md shadow-salm-blue/30 border-blue-500 z-10 scale-105'
                            : isToday
                                ? 'bg-salm-blue/5 text-salm-blue border-salm-blue/30 font-bold'
                                : 'bg-transparent hover:bg-white/50 border-transparent text-gray-700 dark:text-gray-300'}
                    `}
                >
                    <span className="text-sm lg:text-base">{day}</span>
                    <div className="flex gap-0.5 mt-1 h-1">
                        {[...Array(Math.min(3, Math.ceil(doctorCount / 3)))].map((_, i) => (
                            <div key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : 'bg-salm-purple/50'}`}></div>
                        ))}
                    </div>
                </motion.div>
            );
        }

        // Fill remaining to maintain consistent grid
        const filledSlots = firstDay + daysInMonth;
        for (let i = filledSlots; i < totalSlots; i++) {
            days.push(<div key={`empty-end-${i}`} className="w-full h-full opacity-0"></div>);
        }

        return days;
    };

    const renderRosterView = () => (
        <div className="w-full h-full flex flex-col bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/50 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Toolbar / header */}
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 bg-white/40 dark:bg-black/20 shrink-0 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Grid className="w-6 h-6 text-salm-blue" />
                        Weekly Master Roster
                    </h2>
                    <p className="text-gray-500 font-medium">Complete schedule for all specialists</p>
                </div>
                {/* Legend */}
                <div className="flex gap-6 text-xs font-semibold uppercase tracking-wide text-gray-500 bg-white/50 dark:bg-black/20 px-4 py-2 rounded-full border border-white/20">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-200"></div> Practice</div>
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-600"></div> Off Duty</div>
                </div>
            </div>

            {/* Grid Container */}
            <div className="flex-1 overflow-auto custom-scrollbar relative bg-white/30 dark:bg-black/10">
                <table className="w-full border-separate border-spacing-0">
                    <thead className="sticky top-0 z-30">
                        <tr>
                            <th className="sticky left-0 z-40 top-0 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-r border-gray-200/50 dark:border-gray-700/50 p-4 min-w-[240px] text-left shadow-sm">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Specialist</span>
                            </th>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                <th key={day} className="bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 p-4 text-center min-w-[140px] shadow-sm">
                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">{day}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rosterData.map((doc, idx) => (
                            <tr key={doc.id} className="group transition-colors hover:bg-salm-blue/5">
                                {/* Sticky Name Column */}
                                <td className="sticky left-0 z-20 bg-white/90 dark:bg-gray-900/90 group-hover:bg-gray-50/95 dark:group-hover:bg-gray-800/95 backdrop-blur-sm border-r border-b border-gray-100 dark:border-gray-700/50 p-4 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
                                            {doc.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{doc.name}</div>
                                            <div className="text-[11px] text-salm-purple font-bold uppercase tracking-wide mt-0.5">{doc.specialization || 'General'}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* Schedule Cells */}
                                {[1, 2, 3, 4, 5, 6, 7].map(dayNum => (
                                    <td key={dayNum} className="border-b border-gray-100 dark:border-gray-700/50 p-3 text-center transition-colors group-hover:bg-white/40 dark:group-hover:bg-white/5 relative">
                                        {doc.weekly[dayNum] ? (
                                            <div className="inline-flex flex-col items-center justify-center w-full h-full py-2 bg-green-50/50 dark:bg-green-900/10 rounded-xl border border-green-100/50 dark:border-green-800/20 group-hover:border-green-200 transition-colors">
                                                <span className="text-xs font-bold text-green-700 dark:text-green-400">{doc.weekly[dayNum]}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center opacity-20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="h-screen bg-theme-bg text-theme-text font-sans selection:bg-salm-pink selection:text-white overflow-hidden flex flex-col">

            {/* --- Header --- */}
            <header className="h-20 shrink-0 px-8 flex items-center justify-between bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-50">
                <div className="flex items-center gap-4">
                    <FallonavaLogo className="w-10 h-10 rounded-xl shadow-lg shadow-salm-purple/20" />
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Fallonava Medical Center</h1>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Doctor Schedule Overview</p>
                    </div>
                </div>

                {/* View Switcher */}
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setView('daily')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${view === 'daily' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Calendar className="w-4 h-4" /> Daily
                    </button>
                    <button
                        onClick={() => setView('roster')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${view === 'roster' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <List className="w-4 h-4" /> Full Roster
                    </button>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
            </header>

            {/* --- Main Content --- */}
            <main className="flex-1 p-6 lg:p-8 overflow-hidden relative">

                {/* Daily View Layout */}
                {view === 'daily' && (
                    <div className="h-full flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
                        {/* Left: Calendar Navigation */}
                        <div className="w-full lg:w-[420px] shrink-0 flex flex-col gap-6 h-full">
                            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-[32px] p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700 flex flex-col h-full max-h-[600px]">

                                {/* Month Selector */}
                                <div className="flex items-center justify-between mb-6 shrink-0">
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </h2>
                                    <div className="flex gap-2">
                                        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                                        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><ChevronRight className="w-5 h-5" /></button>
                                    </div>
                                </div>

                                {/* Weekday Header */}
                                <div className="grid grid-cols-7 mb-2 text-center shrink-0">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                        <div key={d} className="text-xs font-bold text-gray-400 uppercase tracking-wider">{d}</div>
                                    ))}
                                </div>

                                {/* Calendar Grid - FORCE CONSISTENT RATIO */}
                                <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
                                    {renderCalendarGrid()}
                                </div>
                            </div>
                        </div>

                        {/* Right: Schedule List */}
                        <div className="flex-1 flex flex-col min-h-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-[32px] shadow-xl border border-white/50 dark:border-gray-700 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-salm-purple/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                            <div className="p-8 border-b border-gray-100 dark:border-gray-700 shrink-0 flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                                        {selectedDate.toLocaleDateString('default', { weekday: 'long' })}
                                    </h2>
                                    <p className="text-gray-500 mt-1 font-medium text-lg">{selectedDate.toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-salm-purple">{dailySchedule.length}</div>
                                    <div className="text-sm font-bold text-gray-400 uppercase tracking-wide">Doctors</div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                {dailySchedule.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                                        <Stethoscope className="w-20 h-20 mb-6 stroke-[1.5]" />
                                        <p className="text-2xl font-bold">No schedules found</p>
                                        <p className="text-base mt-2">Try selecting another date</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                        <AnimatePresence mode='popLayout'>
                                            {dailySchedule.map((doctor, idx) => (
                                                <motion.div
                                                    key={`${doctor.id}-${idx}`}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                                    className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-6 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-salm-blue/5 to-salm-purple/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>

                                                    <div className="flex items-start justify-between mb-5 relative z-10">
                                                        <div className="w-14 h-14 rounded-2xl bg-salm-light-blue/10 text-salm-blue flex items-center justify-center font-bold text-xl shadow-sm group-hover:bg-salm-blue group-hover:text-white transition-colors">
                                                            {doctor.name.charAt(0)}
                                                        </div>
                                                        <div className="px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold border border-green-200 dark:border-green-800 shadow-sm">
                                                            Available
                                                        </div>
                                                    </div>

                                                    <div className="relative z-10">
                                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate mb-1">{doctor.name}</h3>
                                                        <p className="text-salm-purple text-sm font-bold mb-5 tracking-tight">{doctor.specialization || 'General Practitioner'}</p>

                                                        <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                                                            <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                                                                <Clock className="w-4 h-4 text-salm-blue" />
                                                                <span>{doctor.time}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                                                                <MapPin className="w-4 h-4 text-salm-pink" />
                                                                <span>{doctor.poli_name || 'Main Clinic'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Roster View Layout */}
                {view === 'roster' && renderRosterView()}

                {/* QR Code Overlay - Always visible in bottom left */}
                {/* QR Code Overlay - Auto-hide after 10s */}
                <AnimatePresence>
                    {showQrOverlay ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className="absolute bottom-8 left-8 hidden lg:flex items-center gap-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700 z-50 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-colors"
                            onClick={() => setShowQrOverlay(false)}
                        >
                            <div className="bg-white p-2 rounded-xl shrink-0">
                                <QRCodeCanvas value={publicUrl} size={64} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm leading-tight text-gray-900 dark:text-white">Scan for<br />Mobile Access</h3>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Tap to dismiss</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.button
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowQrOverlay(true)}
                            className="absolute bottom-8 left-8 hidden lg:flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 z-40 text-gray-900 dark:text-white"
                        >
                            <div className="w-6 h-6"><Grid className="w-full h-full" /></div>
                        </motion.button>
                    )}
                </AnimatePresence>

            </main>
        </div>
    );
};

export default PublicSchedule;
