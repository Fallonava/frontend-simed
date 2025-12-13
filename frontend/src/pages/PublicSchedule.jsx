import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Stethoscope, MapPin, Activity, Grid, List, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import FallonavaLogo from '../components/FallonavaLogo';
import { motion, AnimatePresence } from 'framer-motion';

// --- Helpers ---
const isSameDay = (d1, d2) => {
    return d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();
};

const getDateKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

// --- Memoized Sub-Components ---

const CalendarWidget = memo(({ currentDate, selectedDate, setSelectedDate, changeMonth, doctorCounts }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    // Use a ref to track interaction to avoid re-rendering effectively
    const interactionTimeoutRef = React.useRef(null);

    const resetTimer = useCallback(() => {
        if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
        if (isExpanded) {
            interactionTimeoutRef.current = setTimeout(() => {
                setIsExpanded(false);
            }, 10000); // 10s auto collapse
        }
    }, [isExpanded]);

    useEffect(() => {
        resetTimer();
        return () => {
            if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
        };
    }, [resetTimer]);

    const handleExpandData = () => {
        setIsExpanded(true);
        resetTimer();
    };

    const renderCalendarGrid = useMemo(() => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];
        const totalSlots = 42; // Fixed grid size for consistency

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="w-full h-full"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());

            // O(1) Lookup
            const dateKey = getDateKey(date);
            const count = doctorCounts.get(dateKey) || 0;

            days.push(
                <motion.div
                    key={day}
                    layoutId={`day-${day}`} // Careful with layoutId on many elements
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(date);
                        resetTimer();
                    }}
                    className={`
                        w-full aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer relative transition-all duration-300 border
                        ${isSelected
                            ? 'bg-salm-blue text-white shadow-xl shadow-salm-blue/30 border-blue-500 z-10 scale-105 ring-2 ring-white dark:ring-gray-800'
                            : isToday
                                ? 'bg-salm-blue/10 text-salm-blue border-salm-blue/30 font-bold'
                                : 'bg-transparent hover:bg-gray-100 dark:hover:bg-white/10 border-transparent text-gray-700 dark:text-gray-300'}
                    `}
                >
                    <span className="text-[11px] md:text-sm font-medium">{day}</span>
                    <div className="flex gap-0.5 mt-0.5 h-1">
                        {/* Dot indicators for doctor density */}
                        {[...Array(Math.min(3, Math.ceil(count / 3)))].map((_, i) => (
                            <div key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/80' : 'bg-salm-purple/50'}`}></div>
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
    }, [currentDate, selectedDate, doctorCounts, setSelectedDate, resetTimer]);

    return (
        <div
            className="w-full lg:w-[365px] shrink-0 flex flex-col gap-4 h-auto transition-all duration-500 will-change-transform"
            onMouseEnter={handleExpandData}
            onClick={handleExpandData}
        >
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] p-4 md:p-6 shadow-2xl shadow-gray-200/50 dark:shadow-black/20 border border-white/60 dark:border-gray-700 flex flex-col overflow-hidden transition-all duration-500">

                {/* Header / Toggle */}
                <div
                    className="flex items-center justify-between cursor-pointer group select-none"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-salm-blue/10 flex items-center justify-center text-salm-blue">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white tracking-tight">
                            Calendar
                        </h2>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 flex items-center justify-center text-gray-500 ml-auto group-hover:scale-110 group-active:scale-95 transition-all duration-300">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>

                {/* Collapsible Content */}
                <AnimatePresence initial={false}>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
                            className="overflow-hidden"
                        >
                            <div>
                                {/* Month Selector */}
                                <div className="flex items-center justify-between mb-4 md:mb-5 shrink-0">
                                    <h2 className="text-base md:text-lg font-bold text-gray-700 dark:text-gray-300 ml-1">
                                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </h2>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); changeMonth(-1); }}
                                            className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 rounded-full transition-all shadow-sm active:scale-90"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); changeMonth(1); }}
                                            className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 rounded-full transition-all shadow-sm active:scale-90"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Weekday Header */}
                                <div className="grid grid-cols-7 mb-2 text-center shrink-0">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                        <div key={d} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{d}</div>
                                    ))}
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-1.5 flex-1">
                                    {renderCalendarGrid}
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
});


const PublicSchedule = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [view, setView] = useState('daily'); // 'daily' | 'roster'
    const [doctors, setDoctors] = useState([]);
    const [leaves, setLeaves] = useState([]);
    // const [loading, setLoading] = useState(true); // Unused for now
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
                // setLoading(false);
            } catch (error) {
                console.error("Failed to load data", error);
                // setLoading(false);
            }
        };
        fetchData();

        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);


    // --- Optimized Data Computations ---

    // 1. Create O(1) Leaves Map
    const leavesMap = useMemo(() => {
        const map = new Map();
        leaves.forEach(leave => {
            const d = new Date(leave.date);
            const key = `${leave.doctor_id}-${getDateKey(d)}`; // Key by DoctorID + Date
            map.set(key, true);
        });
        return map;
    }, [leaves]);

    // 2. Pre-calculate Doctor Counts for the visible month (or simple range)
    // Actually, since doctors schedules are weekly repeating, we can compute for any day efficienty.
    // For the calendar grid dots, we need count per day.
    const doctorCounts = useMemo(() => {
        const map = new Map();
        // We only care about the currently displayed month to be super efficient, 
        // but since we navigate months, maybe just computing for the visible month is best.

        const daysInMonth = getDaysInMonth(currentDate);

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dateKey = getDateKey(date);

            // Logic to count doctors working this day
            const dayOfWeek = date.getDay();
            const dbDay = dayOfWeek === 0 ? 7 : dayOfWeek;

            let count = 0;
            doctors.forEach(doc => {
                const hasSchedule = doc.schedules?.some(s => s.day === dbDay);
                if (hasSchedule) {
                    // Check leave using Map
                    const leaveKey = `${doc.id}-${dateKey}`;
                    if (!leavesMap.has(leaveKey)) {
                        count++;
                    }
                }
            });
            map.set(dateKey, count);
        }
        return map;
    }, [doctors, leavesMap, currentDate]);


    const changeMonth = useCallback((offset) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    }, []);

    // --- Data Processing for Daily View ---
    const dailySchedule = useMemo(() => {
        if (!doctors.length) return [];
        const dayOfWeek = selectedDate.getDay();
        const dbDay = dayOfWeek === 0 ? 7 : dayOfWeek;
        const selectedDateKey = getDateKey(selectedDate);

        return doctors.filter(doc => {
            // Include doctors if they have a schedule for this day
            const hasSchedule = doc.schedules?.some(s => s.day === dbDay);
            return hasSchedule;
        }).map(doc => {
            const schedule = doc.schedules.find(s => s.day === dbDay);
            // Check if on leave using Map
            const leaveKey = `${doc.id}-${selectedDateKey}`;
            const onLeave = leavesMap.has(leaveKey);
            return { ...doc, time: schedule?.time || 'On Call', onLeave };
        });
    }, [doctors, leavesMap, selectedDate]);

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
        }).filter(doc => Object.values(doc.weekly).some(t => t !== null));
    }, [doctors]);


    // --- Renderers ---
    const renderRosterView = () => (
        <div className="w-full h-full flex flex-col bg-white/60 dark:bg-gray-900/60 backdrop-blur-3xl rounded-[24px] md:rounded-[40px] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] border border-white/50 dark:border-gray-700/50 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700 ring-1 ring-white/20">
            {/* Toolbar */}
            <div className="px-4 py-3 md:px-8 md:py-6 border-b border-gray-200/30 dark:border-white/5 bg-white/40 dark:bg-black/20 shrink-0 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 z-20 relative backdrop-blur-md">
                <div className="text-center md:text-left w-full md:w-auto flex flex-row items-center justify-between md:block">
                    <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 md:gap-4 tracking-tight">
                        <div className="p-2 md:p-2.5 bg-gradient-to-tr from-salm-blue to-salm-light-blue rounded-xl md:rounded-2xl text-white shadow-lg shadow-salm-blue/30 ring-1 ring-white/20">
                            <Grid className="w-4 h-4 md:w-6 md:h-6" />
                        </div>
                        <span className="truncate">Weekly Roster</span>
                    </h2>
                    {/* Mobile Only Legend Compact */}
                    <div className="md:hidden flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold uppercase text-gray-500">Practice</span>
                    </div>

                    <p className="hidden md:block text-xs md:text-sm text-gray-500 font-medium mt-1.5 ml-1.5 tracking-wide uppercase opacity-70">Complete schedule for all specialists</p>
                </div>

                {/* Desktop Legend */}
                <div className="hidden md:flex gap-1.5 p-1.5 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full border border-white/40 shadow-inner">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-700 shadow-sm border border-gray-200/50 dark:border-gray-600">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">Practice</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/40 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Off Duty</span>
                    </div>
                </div>
            </div>

            {/* Grid Container */}
            <div className="flex-1 overflow-auto custom-scrollbar relative bg-white/20 dark:bg-black/10 scroll-smooth">
                <table className="w-full border-separate border-spacing-0">
                    <thead className="sticky top-0 z-40">
                        <tr>
                            <th className="sticky left-0 z-50 top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-3 md:p-4 min-w-[120px] md:min-w-[280px] text-left shadow-[4px_0_24px_rgba(0,0,0,0.03)]">
                                <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1 md:ml-2">Specialist</span>
                            </th>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                                <th key={day} className={`
                                    bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-2 md:p-4 text-center min-w-[80px] md:min-w-[160px]
                                    ${i === 6 ? '' : 'border-r border-dashed border-gray-200/30'}
                                `}>
                                    <span className="text-[10px] md:text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-[0.2em]">{day}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rosterData.map((doc, idx) => (
                            <tr key={doc.id} className="group/row hover:bg-white/40 dark:hover:bg-white/5 transition-colors duration-200">
                                {/* Sticky Name Column */}
                                <td className="sticky left-0 z-30 bg-white/90 dark:bg-gray-900/90 group-hover/row:bg-white/95 dark:group-hover/row:bg-gray-800/95 backdrop-blur-xl border-b border-gray-100/50 dark:border-gray-700/30 p-2 md:p-5 transition-colors duration-300 shadow-[4px_0_20px_-4px_rgba(0,0,0,0.02)]">
                                    <div className="flex items-center gap-2 md:gap-5 ml-1">
                                        <div className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 rounded-[18px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 text-gray-500 dark:text-gray-400 items-center justify-center font-bold text-sm md:text-base shrink-0 shadow-[inset_0_1px_4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700 group-hover/row:scale-105 group-hover/row:text-salm-blue group-hover/row:border-salm-blue/20 transition-all duration-300">
                                            {doc.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-gray-900 dark:text-white text-[10px] md:text-sm leading-tight truncate uppercase tracking-widest mb-0.5 md:mb-1">{(doc.poliklinik?.name || doc.specialist || 'General Practice').replace(/^(?:Poli|POLI)\s+/i, '')}</div>
                                            <div className="text-[10px] md:text-sm text-gray-500 font-medium truncate tracking-tight group-hover/row:text-salm-blue transition-colors line-clamp-1">{doc.name}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* Schedule Cells */}
                                {[1, 2, 3, 4, 5, 6, 7].map(dayNum => (
                                    <td key={dayNum} className="border-b border-r border-gray-50/50 dark:border-gray-800/20 p-1 md:p-3 text-center relative group/cell transition-colors duration-300">
                                        {doc.weekly[dayNum] ? (
                                            <motion.div
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                className="inline-flex flex-col items-center justify-center w-full py-2 md:py-3.5 px-1 md:px-2 bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none ring-1 ring-black/5 dark:ring-white/10 group-hover/cell:ring-salm-blue/30 group-hover/cell:shadow-[0_8px_16px_rgba(59,130,246,0.1)] transition-all duration-300 cursor-default"
                                            >
                                                <span className="text-[9px] md:text-xs font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap tracking-tight">{doc.weekly[dayNum]}</span>
                                                <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 opacity-0 group-hover/cell:opacity-100 transition-opacity duration-300 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                            </motion.div>
                                        ) : (
                                            <div className="flex items-center justify-center">
                                                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 group-hover/row:bg-gray-200 dark:group-hover/row:bg-gray-700 transition-colors duration-300"></div>
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
                            doctorCounts={doctorCounts}
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
                                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 30, delay: idx * 0.05 }}
                                                    className={`
                                                        p-5 md:p-6 rounded-[28px] md:rounded-[32px] transition-all group relative overflow-hidden
                                                        ${doctor.onLeave
                                                            ? 'bg-red-50/60 dark:bg-red-900/10 border border-red-100/50 dark:border-red-900/30'
                                                            : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] ring-1 ring-black/5 border border-white/60 dark:border-gray-700/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]'
                                                        }
                                                    `}
                                                >
                                                    {!doctor.onLeave && (
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700 ease-out"></div>
                                                    )}

                                                    <div className="flex items-start justify-between mb-4 md:mb-5 relative z-10">
                                                        <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[20px] flex items-center justify-center font-bold text-xl md:text-2xl shadow-sm transition-transform group-hover:scale-105 duration-300 ${doctor.onLeave ? 'bg-red-100/50 text-red-500' : 'bg-gradient-to-br from-blue-50 to-indigo-50 text-salm-blue shadow-[inset_0_2px_4px_rgba(255,255,255,1)]'}`}>
                                                            {doctor.name.charAt(0)}
                                                        </div>
                                                        {doctor.onLeave ? (
                                                            <div className="px-3 py-1.5 rounded-full bg-red-100/80 text-red-600 text-[10px] md:text-xs font-bold shadow-sm backdrop-blur-sm border border-red-200">
                                                                On Leave
                                                            </div>
                                                        ) : (
                                                            <div className="px-3 py-1.5 rounded-full bg-green-100/80 text-green-700 text-[10px] md:text-xs font-bold shadow-sm backdrop-blur-sm border border-green-200/50 flex items-center gap-1.5">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
                                                                Available
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="relative z-10">
                                                        <div className="mb-1">
                                                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.15em] text-salm-purple/80 mb-1">{(doctor.poliklinik?.name || doctor.specialist || 'General Practice').replace(/^(?:Poli|POLI)\s+/i, '')}</p>
                                                            <h3 className={`font-bold text-lg md:text-xl tracking-tight leading-tight ${doctor.onLeave ? 'text-gray-500' : 'text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400'}`}>
                                                                {doctor.name}
                                                            </h3>
                                                        </div>

                                                        <div className={`space-y-2 mt-4 p-3.5 rounded-2xl ${doctor.onLeave ? 'bg-red-50/50' : 'bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100/50 dark:border-gray-700'}`}>
                                                            <div className={`flex items-center gap-3 text-sm font-medium ${doctor.onLeave ? 'text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                                                <Clock className={`w-4 h-4 ${doctor.onLeave ? 'text-red-300' : 'text-blue-500/80'}`} />
                                                                <span className={`tracking-tight ${doctor.onLeave ? 'line-through decoration-red-300' : ''}`}>{doctor.time}</span>
                                                            </div>
                                                            <div className={`flex items-center gap-3 text-sm font-medium ${doctor.onLeave ? 'text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                                                <MapPin className={`w-4 h-4 ${doctor.onLeave ? 'text-red-300' : 'text-pink-500/80'}`} />
                                                                <span className="tracking-tight">{doctor.poliklinik?.name || 'Main Clinic'}</span>
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
