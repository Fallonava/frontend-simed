import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Search, Plus, MoreHorizontal, Calendar as CalendarIcon, X, Check, Trash2, Briefcase, Coffee, ChevronDown, User } from 'lucide-react';
import api from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import ModernHeader from './ModernHeader';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorLeaveCalendar = () => {
    const navigate = useNavigate();
    // --- State ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('month'); // 'month', 'week', 'day'
    const [searchQuery, setSearchQuery] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [allLeaves, setAllLeaves] = useState([]);
    const [filterByDate, setFilterByDate] = useState(true);

    // Mini Calendar Toggle
    const [isMiniCalendarOpen, setIsMiniCalendarOpen] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ date: null, existingLeave: null, reason: '' });

    // Helper for date comparison
    const isSameDay = useCallback((d1, d2) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    }, []);

    const getDateKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    // Derived state
    const filteredDoctors = useMemo(() => {
        let result = doctors;
        if (searchQuery) {
            result = result.filter(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        if (filterByDate && allLeaves.length > 0) {
            result = result.filter(doc => {
                const onLeave = allLeaves.some(l => l.doctor_id === doc.id && isSameDay(new Date(l.date), currentDate));
                return onLeave;
            });
        }
        return result;
    }, [doctors, view, currentDate, searchQuery, allLeaves, filterByDate, isSameDay]);

    // --- Effects ---
    useEffect(() => {
        fetchDoctors();
        fetchAllLeaves();
    }, []);

    // Auto-select first doctor logic
    useEffect(() => {
        if (filteredDoctors.length > 0) {
            if (!selectedDoctor || !filteredDoctors.find(d => d.id === selectedDoctor.id)) {
                setSelectedDoctor(filteredDoctors[0]);
            }
        } else {
            setSelectedDoctor(null);
        }
    }, [filteredDoctors, selectedDoctor]);

    const leaves = useMemo(() => {
        if (!selectedDoctor) return [];
        return allLeaves.filter(l => l.doctor_id === selectedDoctor.id);
    }, [selectedDoctor, allLeaves]);

    const leavesMap = useMemo(() => {
        const map = new Map();
        leaves.forEach(leave => {
            const date = new Date(leave.date);
            const key = getDateKey(date);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(leave);
        });
        return map;
    }, [leaves]);

    // --- API Calls ---
    const fetchDoctors = async () => {
        try {
            const res = await api.get('/doctors-master');
            setDoctors(res.data);
        } catch (error) {
            toast.error('Gagal memuat data dokter');
        }
    };

    const fetchAllLeaves = async () => {
        try {
            const res = await api.get('/doctor-leaves');
            setAllLeaves(res.data);
        } catch (error) {
            toast.error('Gagal memuat data cuti');
        }
    };

    const handleSaveLeave = async () => {
        if (!selectedDoctor || !modalData.date) return;
        try {
            if (modalData.existingLeave) {
                toast('Please delete and recreate to modify.');
            } else {
                await api.post('/doctor-leaves', {
                    doctor_id: selectedDoctor.id,
                    date: modalData.date,
                    reason: modalData.reason || 'Manual Leave'
                });
                toast.success('Leave Added');
                fetchAllLeaves();
            }
            setIsModalOpen(false);
        } catch (error) {
            toast.error('Failed to save');
        }
    };

    const handleDeleteLeave = async () => {
        if (!modalData.existingLeave) return;
        if (!window.confirm('Delete this leave?')) return;
        try {
            await api.delete(`/doctor-leaves/${modalData.existingLeave.id}`);
            toast.success('Leave deleted');
            fetchAllLeaves();
            setIsModalOpen(false);
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    // --- Helpers ---
    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay(); // 0=Sun

    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    const navigateDate = (direction) => {
        const newDate = new Date(currentDate);
        if (view === 'month') newDate.setMonth(newDate.getMonth() + direction);
        else if (view === 'week') newDate.setDate(newDate.getDate() + (direction * 7));
        else if (view === 'day') newDate.setDate(newDate.getDate() + direction);
        setCurrentDate(newDate);
    };

    const handleDateClick = useCallback((day) => {
        if (!selectedDoctor) {
            toast.error('Select a doctor first');
            return;
        }
        let clickedDate = typeof day === 'number' ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : new Date(day);
        const existing = leaves.find(l => isSameDay(new Date(l.date), clickedDate));
        setModalData({ date: clickedDate, existingLeave: existing || null, reason: existing?.reason || '' });
        setIsModalOpen(true);
    }, [currentDate, selectedDoctor, leaves, isSameDay]);

    // --- Renderers ---
    const renderMonthView = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        for (let i = 0; i < firstDay; i++) days.push(<div key={`e-${i}`} className="bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/50 min-h-[100px]"></div>);

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isToday = isSameDay(new Date(), currentDayDate);
            const dayLeaves = leavesMap.get(getDateKey(currentDayDate)) || [];

            days.push(
                <div
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`min-h-[100px] border border-gray-100 dark:border-gray-700/50 p-3 relative group transition-colors cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 ${isToday ? 'bg-indigo-50/30 dark:bg-indigo-900/20' : 'bg-white/40 dark:bg-gray-800/40'}`}
                >
                    <div className={`text-sm font-bold mb-2 ${isToday ? 'text-indigo-600' : 'text-gray-700 dark:text-gray-300'}`}>
                        {day}
                    </div>
                    {dayLeaves.map((l, idx) => (
                        <div key={idx} className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-[10px] font-bold px-2 py-1 rounded-lg truncate mb-1 border border-rose-200 dark:border-rose-800">
                            {l.reason || 'Leave'}
                        </div>
                    ))}
                    {dayLeaves.length === 0 && (
                        <div className="absolute inset-x-0 bottom-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                                <Plus size={14} />
                            </div>
                        </div>
                    )}
                </div>
            );
        }
        return days;
    };

    const renderWeekView = () => {
        const startOfWeek = getStartOfWeek(currentDate);
        const days = [];
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + i);
            const isToday = isSameDay(new Date(), dayDate);
            const dayLeaves = leavesMap.get(getDateKey(dayDate)) || [];
            const schedule = selectedDoctor?.schedules?.find(s => s.day === (dayDate.getDay() === 0 ? 7 : dayDate.getDay()));

            days.push(
                <div key={i} onClick={() => handleDateClick(dayDate)} className={`flex-1 border-r border-gray-100 dark:border-gray-700 p-4 relative cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${isToday ? 'bg-indigo-50/30' : ''}`}>
                    <div className="text-center mb-6">
                        <div className="text-xs font-bold uppercase text-gray-400 mb-1">{dayDate.toLocaleString('default', { weekday: 'short' })}</div>
                        <div className={`w-10 h-10 mx-auto flex items-center justify-center rounded-2xl text-lg font-bold ${isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-700 dark:text-gray-200'}`}>
                            {dayDate.getDate()}
                        </div>
                    </div>
                    <div className="space-y-2">
                        {schedule ? (
                            <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    <Briefcase size={12} className="text-indigo-500" />
                                    <span className="text-[10px] font-bold text-indigo-500 uppercase">Shift</span>
                                </div>
                                <div className="text-xs font-bold text-gray-700 dark:text-gray-300">{schedule.time}</div>
                            </div>
                        ) : (
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-transparent">
                                <div className="flex items-center gap-2 mb-1">
                                    <Coffee size={12} className="text-gray-400" />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Off</span>
                                </div>
                            </div>
                        )}
                        {dayLeaves.map((l, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-rose-500 uppercase">Leave</span>
                                </div>
                                <div className="text-xs font-medium text-rose-700 dark:text-rose-300 line-clamp-2">{l.reason}</div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return <div className="flex h-full divide-x divide-gray-100 dark:divide-gray-700">{days}</div>;
    };

    const renderDayView = () => {
        const isToday = isSameDay(new Date(), currentDate);
        const dayLeaves = leavesMap.get(getDateKey(currentDate)) || [];
        return (
            <div className={`h-full p-8 rounded-3xl border border-gray-100 dark:border-gray-700 ${isToday ? 'bg-indigo-50/10' : 'bg-white dark:bg-gray-800'}`}>
                <div className="flex items-center gap-6 mb-8">
                    <div className={`text-6xl font-black ${isToday ? 'text-indigo-600' : 'text-gray-900 dark:text-white'}`}>{currentDate.getDate()}</div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{currentDate.toLocaleString('default', { weekday: 'long' })}</div>
                        <div className="text-gray-500 font-medium">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                    </div>
                </div>
                <div className="space-y-4">
                    {dayLeaves.length > 0 ? dayLeaves.map((leave, idx) => (
                        <div key={idx} className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 p-6 rounded-2xl flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 shrink-0">
                                <Briefcase size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-rose-700 dark:text-rose-300">Scheduled Leave</h4>
                                <p className="text-rose-600 dark:text-rose-400 font-medium">{leave.reason}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12 text-gray-400">
                            <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="font-bold">No leaves scheduled</p>
                            <button onClick={() => setModalData({ date: currentDate, existingLeave: null, reason: '' }) || setIsModalOpen(true)} className="mt-4 text-indigo-600 font-bold hover:underline">Add Leave</button>
                        </div>
                    )}
                </div>
            </div>
        );
    };


    return (
        <div className="flex flex-col h-full bg-gray-50/50 dark:bg-gray-900/50">
            <ModernHeader
                title="Leave Calendar"
                subtitle="Manage doctor schedules and time off"
                onBack={() => navigate('/admin/dashboard')}
            />

            <div className="flex flex-col lg:flex-row gap-6 p-6 h-[calc(100vh-80px)] overflow-hidden">
                {/* SIDEBAR */}
                <div className="w-full lg:w-[320px] flex flex-col gap-6 shrink-0 h-full overflow-hidden">
                    {/* Search */}
                    <div className="glass-panel p-2 rounded-2xl flex items-center gap-2 shadow-sm">
                        <Search className="w-5 h-5 text-gray-400 ml-2" />
                        <input
                            placeholder="Search doctor..."
                            className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 w-full"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Mini Calendar */}
                    <div className="glass-panel p-6 rounded-3xl border border-white/40 shadow-sm bg-white/60 dark:bg-gray-800/60 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setIsMiniCalendarOpen(!isMiniCalendarOpen)}>
                            <span className="font-bold text-gray-900 dark:text-white">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                            <ChevronDown size={20} className={`text-gray-400 transition-transform ${isMiniCalendarOpen ? 'rotate-180' : ''}`} />
                        </div>
                        <AnimatePresence>
                            {isMiniCalendarOpen && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-400 mb-2">
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d}>{d}</span>)}
                                    </div>
                                    <div className="grid grid-cols-7 gap-y-2 text-center">
                                        {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, i) => <div key={`e-${i}`} />)}
                                        {Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => {
                                            const d = i + 1;
                                            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
                                            const isSelected = isSameDay(date, currentDate);
                                            return (
                                                <div
                                                    key={d}
                                                    onClick={() => setCurrentDate(date)}
                                                    className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold cursor-pointer mx-auto transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-600 hover:bg-gray-100'}`}
                                                >
                                                    {d}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Doctor List */}
                    <div className="flex-1 glass-panel rounded-3xl overflow-hidden flex flex-col border border-white/40 shadow-sm bg-white/60 dark:bg-gray-800/60">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center">
                            <span className="text-xs font-bold uppercase text-gray-400">Doctors List</span>
                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-lg">{filteredDoctors.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {filteredDoctors.map(doc => (
                                <div
                                    key={doc.id}
                                    onClick={() => setSelectedDoctor(doc)}
                                    className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${selectedDoctor?.id === doc.id ? 'bg-indigo-50 dark:bg-indigo-900/20 shadow-sm border border-indigo-100 dark:border-indigo-800' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30 border border-transparent'}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${selectedDoctor?.id === doc.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {doc.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-sm font-bold truncate ${selectedDoctor?.id === doc.id ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>{doc.name}</p>
                                        <p className="text-[10px] text-gray-400 truncate">{doc.specialist || 'Specialist'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="flex-1 glass-panel rounded-[32px] border border-white/40 shadow-md bg-white/80 dark:bg-gray-800/80 flex flex-col overflow-hidden relative">
                    {/* Toolbar */}
                    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-4">
                            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl">
                                <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg shadow-sm transition-all"><ChevronLeft size={18} className="text-gray-600" /></button>
                                <button onClick={() => navigateDate(1)} className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg shadow-sm transition-all"><ChevronRight size={18} className="text-gray-600" /></button>
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {['month', 'week', 'day'].map(v => (
                                <button
                                    key={v}
                                    onClick={() => setView(v)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all capitalize ${view === v ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    {v}
                                </button>
                            ))}
                            <button onClick={() => { setModalData({ date: new Date(), existingLeave: null, reason: '' }); setIsModalOpen(true); }} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 flex items-center gap-2">
                                <Plus size={16} /> Add
                            </button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {view === 'month' && (
                            <>
                                <div className="grid grid-cols-7 mb-2 px-2">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">{d}</div>)}
                                </div>
                                <div className="grid grid-cols-7 auto-rows-fr gap-2">
                                    {renderMonthView()}
                                </div>
                            </>
                        )}
                        {view === 'week' && <div className="h-full bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">{renderWeekView()}</div>}
                        {view === 'day' && renderDayView()}
                    </div>
                </div>
            </div>

            {/* MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white dark:bg-gray-800 rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">{modalData.existingLeave ? 'Edit Leave' : 'Add Leave'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">{selectedDoctor?.name.charAt(0)}</div>
                                    <div>
                                        <p className="font-bold text-indigo-900 dark:text-indigo-100">{selectedDoctor?.name}</p>
                                        <p className="text-xs text-indigo-500">{modalData.date?.toDateString()}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">Reason</label>
                                    <textarea
                                        className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-indigo-500 font-medium resize-none h-32"
                                        placeholder="Enter reason for leave..."
                                        value={modalData.reason}
                                        onChange={e => setModalData({ ...modalData, reason: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    {modalData.existingLeave && (
                                        <button onClick={handleDeleteLeave} className="flex-1 py-4 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 flex items-center justify-center gap-2">
                                            <Trash2 size={18} /> Delete
                                        </button>
                                    )}
                                    <button onClick={handleSaveLeave} className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 flex items-center justify-center gap-2">
                                        <Check size={18} /> Save Schedule
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DoctorLeaveCalendar;
