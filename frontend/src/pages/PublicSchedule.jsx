import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Stethoscope, MapPin, Activity, Grid, List, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import FallonavaLogo from '../components/FallonavaLogo';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarWidget = ({ currentDate, selectedDate, setSelectedDate, changeMonth, renderCalendarGrid }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [interactionTimer, setInteractionTimer] = useState(null);

    const resetTimer = () => {
        if (interactionTimer) clearTimeout(interactionTimer);
        // Only auto-collapse if currently expanded
        const timer = setTimeout(() => {
            setIsExpanded(false);
        }, 5000);
        setInteractionTimer(timer);
    };

    const handleInteraction = () => {
        // If collapsed, expand it. If expanded, just reset timer.
        if (!isExpanded) setIsExpanded(true);
        resetTimer();
    };

    // Initial timer on mount
    useEffect(() => {
        resetTimer();
        return () => {
            if (interactionTimer) clearTimeout(interactionTimer);
        };
    }, []);
    // Note: We don't add isExpanded to dependency to avoid loop, 
    // but the timer closure captures the state at creation time which might be stale in a purely functional way?
    // Actually, setting state inside timeout is fine.
    // Better approach: Use a ref for the timer to avoid re-renders on timer ID change, 
    // and rely on `useEffect` with `isExpanded` dependency if we want to START timer only when expanded.

    useEffect(() => {
        if (isExpanded) {
            const timer = setTimeout(() => {
                setIsExpanded(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isExpanded, currentDate, selectedDate]); // Reset on state changes too as they count as 'updates'

    return (
        <div
            className="w-full lg:w-[360px] shrink-0 flex flex-col gap-4 lg:gap-6 h-auto transition-all duration-500 will-change-[width,height]"
            onMouseEnter={() => setIsExpanded(true)} // Keep open while hovering
            onClick={() => setIsExpanded(true)} // Open on click
        >
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-[24px] md:rounded-[32px] p-3 md:p-5 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700 flex flex-col overflow-hidden transition-all duration-500">

                {/* Header / Toggle */}
                <div
                    className="flex items-center justify-between cursor-pointer group"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                >
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-salm-blue" />
                        <h2 className="text-base md:text-xl font-bold text-gray-800 dark:text-white">
                            Calendar
                        </h2>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 flex items-center justify-center text-gray-500 ml-auto group-hover:bg-salm-blue group-hover:text-white transition-all">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>

                {/* Collapsible Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }} // Smooth Apple-like spring/ease
                            className="overflow-hidden"
                        >
                            <div className="pt-4 md:pt-6">
                                {/* Month Selector */}
                                <div className="flex items-center justify-between mb-3 md:mb-5 shrink-0">
                                    <h2 className="text-sm md:text-lg font-bold text-gray-700 dark:text-gray-300">
                                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </h2>
                                    <div className="flex gap-1 md:gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); changeMonth(-1); }}
                                            className="p-1 md:p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); changeMonth(1); }}
                                            className="p-1 md:p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Weekday Header */}
                                <div className="grid grid-cols-7 mb-1 text-center shrink-0">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                        <div key={d} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{d}</div>
                                    ))}
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-1 flex-1">
                                    {renderCalendarGrid()}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Collapsed State Summary */}
                {!isExpanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="pt-2 flex items-center justify-between text-xs text-gray-500 font-medium"
                    >
                        <span>Selected: <span className="text-salm-blue font-bold">{selectedDate.toLocaleDateString()}</span></span>
                    </motion.div>
                )}
            </div>
        </div>
    );
};


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
            // Include doctors if they have a schedule for this day
            const hasSchedule = doc.schedules?.some(s => s.day === dbDay);
            return hasSchedule;
        }).map(doc => {
            const schedule = doc.schedules.find(s => s.day === dbDay);
            // Check if on leave
            const onLeave = leaves.some(l => l.doctor_id === doc.id && isSameDay(new Date(l.date), selectedDate));
            return { ...doc, time: schedule?.time || 'On Call', onLeave };
        });
    }, [doctors, leaves, selectedDate]);

    // --- Data Processing for Roster View ---
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
        const totalSlots = 42;

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="w-full h-full"></div>);
        }

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
                        w-full aspect-square rounded-lg md:rounded-xl flex flex-col items-center justify-center cursor-pointer relative transition-all duration-300 border
                        ${isSelected
                            ? 'bg-salm-blue text-white shadow-md shadow-salm-blue/30 border-blue-500 z-10 scale-105'
                            : isToday
                                ? 'bg-salm-blue/5 text-salm-blue border-salm-blue/30 font-bold'
                                : 'bg-transparent hover:bg-white/50 border-transparent text-gray-700 dark:text-gray-300'}
                    `}
                >
                    <span className="text-xs md:text-sm">{day}</span>
                    <div className="flex gap-0.5 mt-0.5 md:mt-1 h-1">
                        {[...Array(Math.min(3, Math.ceil(doctorCount / 3)))].map((_, i) => (
                            <div key={i} className={`w-0.5 h-0.5 md:w-1 md:h-1 rounded-full ${isSelected ? 'bg-white/70' : 'bg-salm-purple/50'}`}></div>
                        ))}
                    </div>
                </motion.div>
            );
        }

        const filledSlots = firstDay + daysInMonth;
        for (let i = filledSlots; i < totalSlots; i++) {
            days.push(<div key={`empty-end-${i}`} className="w-full h-full opacity-0"></div>);
        }

        return days;
    };

    const renderRosterView = () => (
        <div className="w-full h-full flex flex-col bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/50 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Toolbar - Responsive */}
            <div className="px-4 py-4 lg:px-8 lg:py-6 border-b border-gray-100 dark:border-gray-700 bg-white/40 dark:bg-black/20 shrink-0 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                    <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                        <Grid className="w-5 h-5 md:w-6 md:h-6 text-salm-blue" />
                        Weekly Master Roster
                    </h2>
                    <p className="text-xs md:text-sm text-gray-500 font-medium hidden md:block">Complete schedule for all specialists</p>
                </div>
                {/* Legend */}
                <div className="flex gap-3 text-[10px] md:text-xs font-semibold uppercase tracking-wide text-gray-500 bg-white/50 dark:bg-black/20 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/20">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-200"></div> Practice</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-gray-200 dark:bg-gray-600"></div> Off Duty</div>
                </div>
            </div>

            {/* Grid Container with Smooth Scroll */}
            <div className="flex-1 overflow-auto custom-scrollbar relative bg-white/30 dark:bg-black/10 scroll-smooth">
                <table className="w-full border-separate border-spacing-0">
                    <thead className="sticky top-0 z-30">
                        <tr>
                            <th className="sticky left-0 z-40 top-0 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-r border-gray-200/50 dark:border-gray-700/50 p-3 md:p-4 min-w-[180px] md:min-w-[240px] text-left shadow-sm">
                                <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Specialist</span>
                            </th>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                <th key={day} className="bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 p-3 md:p-4 text-center min-w-[100px] md:min-w-[140px] shadow-sm">
                                    <span className="text-[10px] md:text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">{day}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rosterData.map((doc, idx) => (
                            <tr key={doc.id} className="group transition-colors hover:bg-salm-blue/5 duration-200">
                                {/* Sticky Name Column */}
                                <td className="sticky left-0 z-20 bg-white/90 dark:bg-gray-900/90 group-hover:bg-gray-50/95 dark:group-hover:bg-gray-800/95 backdrop-blur-sm border-r border-b border-gray-100 dark:border-gray-700/50 p-3 md:p-4 transition-colors duration-200">
                                    <div className="flex items-center gap-2 md:gap-4">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-xs md:text-sm shrink-0 shadow-inner">
                                            {doc.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white text-xs md:text-sm leading-tight max-w-[120px] md:max-w-none truncate">{doc.name}</div>
                                            <div className="text-[9px] md:text-[11px] text-salm-purple font-bold uppercase tracking-wide mt-0.5 max-w-[120px] md:max-w-none truncate">{doc.specialization || 'General'}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* Schedule Cells */}
                                {[1, 2, 3, 4, 5, 6, 7].map(dayNum => (
                                    <td key={dayNum} className="border-b border-gray-100 dark:border-gray-700/50 p-2 md:p-3 text-center transition-colors group-hover:bg-white/40 dark:group-hover:bg-white/5 relative duration-200">
                                        {doc.weekly[dayNum] ? (
                                            <div className="inline-flex flex-col items-center justify-center w-full h-full py-1.5 md:py-2 bg-green-50/50 dark:bg-green-900/10 rounded-xl border border-green-100/50 dark:border-green-800/20 group-hover:scale-95 group-hover:border-green-300 transition-all duration-300 ease-out">
                                                <span className="text-[10px] md:text-xs font-bold text-green-700 dark:text-green-400 whitespace-nowrap px-2">{doc.weekly[dayNum]}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center opacity-10 group-hover:opacity-30 transition-opacity duration-300">
                                                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-gray-400"></div>
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
            <header className="h-auto py-3 lg:h-20 lg:py-0 shrink-0 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-50 gap-3 md:gap-0">
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                    <div className="flex items-center gap-3">
                        <FallonavaLogo className="w-8 h-8 md:w-10 md:h-10 rounded-xl shadow-lg shadow-salm-purple/20" />
                        <div>
                            <h1 className="text-base md:text-xl font-bold tracking-tight">Fallonava Project</h1>
                            <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wider hidden sm:block">Doctor Schedule Overview</p>
                        </div>
                    </div>
                </div>

                {/* View Switcher */}
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full border border-gray-200 dark:border-gray-700 w-full md:w-auto justify-center">
                    <button
                        onClick={() => setView('daily')}
                        className={`flex items-center justify-center gap-2 px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all w-1/2 md:w-auto ${view === 'daily' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" /> Daily
                    </button>
                    <button
                        onClick={() => setView('roster')}
                        className={`flex items-center justify-center gap-2 px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all w-1/2 md:w-auto ${view === 'roster' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <List className="w-3.5 h-3.5 md:w-4 md:h-4" /> Full Roster
                    </button>
                </div>

                <div className="hidden md:flex items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
            </header>

            {/* --- Main Content --- */}
            <main className="flex-1 p-3 md:p-6 lg:p-8 overflow-hidden relative">

                {/* Daily View Layout */}
                {view === 'daily' && (
                    <div className="h-full flex flex-col lg:flex-row gap-4 lg:gap-6 animate-in fade-in duration-500 overflow-y-auto lg:overflow-hidden">

                        {/* Left: Calendar Navigation - Stack on mobile, fixed width on desktop */}
                        <CalendarWidget
                            currentDate={currentDate}
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                            changeMonth={changeMonth}
                            renderCalendarGrid={renderCalendarGrid}
                            getDoctorCountForDay={getDoctorCountForDay}
                        />

                        {/* Right: Schedule List */}
                        <div className="flex-1 flex flex-col min-h-[400px] lg:min-h-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-[24px] md:rounded-[32px] shadow-xl border border-white/50 dark:border-gray-700 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-salm-purple/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                            <div className="p-4 md:p-8 border-b border-gray-100 dark:border-gray-700 shrink-0 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl md:text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                                        {selectedDate.toLocaleDateString('default', { weekday: 'long' })}
                                    </h2>
                                    <p className="text-gray-500 mt-1 font-medium text-sm md:text-lg">{selectedDate.toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl md:text-4xl font-bold text-salm-purple">{dailySchedule.length}</div>
                                    <div className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-wide">Doctors</div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                                {dailySchedule.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60 min-h-[200px]">
                                        <Stethoscope className="w-16 h-16 md:w-20 md:h-20 mb-4 md:mb-6 stroke-[1.5]" />
                                        <p className="text-xl md:text-2xl font-bold">No schedules found</p>
                                        <p className="text-sm md:text-base mt-2">Try selecting another date</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5 pb-20 lg:pb-0">
                                        <AnimatePresence mode='popLayout'>
                                            {dailySchedule.map((doctor, idx) => (
                                                <motion.div
                                                    key={`${doctor.id}-${idx}`}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                                    className={`
                                                        border p-4 md:p-6 rounded-2xl md:rounded-3xl transition-all group relative overflow-hidden
                                                        ${doctor.onLeave
                                                            ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
                                                            : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1'
                                                        }
                                                    `}
                                                >
                                                    {!doctor.onLeave && (
                                                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-salm-blue/5 to-salm-purple/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                                                    )}

                                                    <div className="flex items-start justify-between mb-4 md:mb-5 relative z-10">
                                                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-bold text-lg md:text-xl shadow-sm transition-colors ${doctor.onLeave ? 'bg-red-100 text-red-500 dark:bg-red-900/20 dark:text-red-400' : 'bg-salm-light-blue/10 text-salm-blue group-hover:bg-salm-blue group-hover:text-white'}`}>
                                                            {doctor.name.charAt(0)}
                                                        </div>
                                                        {doctor.onLeave ? (
                                                            <div className="px-2 py-1 md:px-3 md:py-1.5 rounded-full bg-red-100/50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] md:text-xs font-bold border border-red-200 dark:border-red-800 shadow-sm flex items-center gap-1">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> On Leave
                                                            </div>
                                                        ) : (
                                                            <div className="px-2 py-1 md:px-3 md:py-1.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] md:text-xs font-bold border border-green-200 dark:border-green-800 shadow-sm">
                                                                Available
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="relative z-10">
                                                        <h3 className={`font-bold text-base md:text-lg truncate mb-1 ${doctor.onLeave ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>{doctor.name}</h3>
                                                        <p className="text-salm-purple text-xs md:text-sm font-bold mb-4 md:mb-5 tracking-tight">{doctor.specialization || 'General Practitioner'}</p>

                                                        <div className={`space-y-2 md:space-y-3 p-3 rounded-xl ${doctor.onLeave ? 'bg-red-50 dark:bg-red-900/10 opacity-75' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                                                            <div className={`flex items-center gap-3 text-xs md:text-sm font-medium ${doctor.onLeave ? 'text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                                                <Clock className={`w-3.5 h-3.5 md:w-4 md:h-4 ${doctor.onLeave ? 'text-red-300' : 'text-salm-blue'}`} />
                                                                <span className={doctor.onLeave ? 'line-through' : ''}>{doctor.time}</span>
                                                            </div>
                                                            <div className={`flex items-center gap-3 text-xs md:text-sm font-medium ${doctor.onLeave ? 'text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                                                <MapPin className={`w-3.5 h-3.5 md:w-4 md:h-4 ${doctor.onLeave ? 'text-red-300' : 'text-salm-pink'}`} />
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
