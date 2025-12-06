import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Plus, MoreHorizontal, Clock, Calendar as CalendarIcon, X, Check, Trash2, User, Briefcase, Coffee } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const DoctorLeaveCalendar = () => {
    // --- State ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('month'); // 'month', 'week', 'day'
    const [searchQuery, setSearchQuery] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [leaves, setLeaves] = useState([]);

    // Derived state for filtered doctors
    const filteredDoctors = React.useMemo(() => {
        let result = doctors;

        // Filter by Search
        if (searchQuery) {
            result = result.filter(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        // Filter by Day Schedule (only in Day View)
        if (view === 'day') {
            const dayOfWeek = currentDate.getDay(); // 0 = Sun, 1 = Mon...
            const dbDay = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert to database format (1-7, Sun=7)
            result = result.filter(doc => doc.schedules?.some(s => s.day === dbDay));
        }
        return result;
    }, [doctors, view, currentDate, searchQuery]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ date: null, existingLeave: null, reason: '' });

    // --- Effects ---
    useEffect(() => {
        fetchDoctors();
    }, []);

    // Auto-select first doctor from filtered list if current selection is invalid
    useEffect(() => {
        if (filteredDoctors.length > 0) {
            // If no doctor selected or selected doctor is not in current list
            if (!selectedDoctor || !filteredDoctors.find(d => d.id === selectedDoctor.id)) {
                setSelectedDoctor(filteredDoctors[0]);
            }
        } else {
            setSelectedDoctor(null);
        }
    }, [filteredDoctors, selectedDoctor]);

    useEffect(() => {
        if (selectedDoctor) {
            fetchLeaves(selectedDoctor.id);
        } else {
            setLeaves([]); // Clear leaves if no doctor selected
        }
    }, [selectedDoctor]);

    // --- API Calls ---
    const fetchDoctors = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/doctors-master');
            setDoctors(res.data);
            // Initial selection handled by effect
            // if (res.data.length > 0) {
            //     setSelectedDoctor(res.data[0]);
            // }
        } catch (error) {
            console.error('Failed to fetch doctors', error);
            toast.error('Gagal memuat data dokter');
        }
    };

    const fetchLeaves = async (doctorId) => {
        try {
            const res = await axios.get(`http://localhost:3000/api/doctor-leaves?doctor_id=${doctorId}`);
            setLeaves(res.data);
        } catch (error) {
            console.error('Failed to fetch leaves', error);
            toast.error('Gagal memuat data cuti');
        }
    };

    const handleSaveLeave = async () => {
        if (!selectedDoctor || !modalData.date) return;

        try {
            if (modalData.existingLeave) {
                // Update logic if needed, currently API only supports Add/Delete.
                // For now, we'll treat "Save" on existing as "Do nothing" or implement update if API supports.
                // Assuming we just want to add notes? 
                // Let's implement Delete here if it exists.
                toast('Use the delete button to remove leave.');
            } else {
                // Create
                await axios.post('http://localhost:3000/api/doctor-leaves', {
                    doctor_id: selectedDoctor.id,
                    date: modalData.date,
                    reason: modalData.reason || 'Manual Leave'
                });
                toast.success('Cuti berhasil ditambahkan');
                fetchLeaves(selectedDoctor.id);
            }
            setIsModalOpen(false);
        } catch (error) {
            toast.error('Gagal menyimpan data');
        }
    };

    const handleDeleteLeave = async () => {
        if (!modalData.existingLeave) return;

        if (!window.confirm('Are you sure you want to delete this leave?')) return;

        try {
            await axios.delete(`http://localhost:3000/api/doctor-leaves/${modalData.existingLeave.id}`);
            toast.success('Cuti dihapus');
            fetchLeaves(selectedDoctor.id);
            setIsModalOpen(false);
        } catch (error) {
            toast.error('Gagal menghapus data');
        }
    };

    // --- Helpers ---
    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay(); // 0=Sun

    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday start
        return new Date(d.setDate(diff));
    };

    const navigateDate = (direction) => {
        const newDate = new Date(currentDate);
        if (view === 'month') {
            newDate.setMonth(newDate.getMonth() + direction);
        } else if (view === 'week') {
            newDate.setDate(newDate.getDate() + (direction * 7));
        } else if (view === 'day') {
            newDate.setDate(newDate.getDate() + direction);
        }
        setCurrentDate(newDate);
    };

    const changeMiniCalendarMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const isSameDay = (d1, d2) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const handleDateClick = (day) => {
        if (!selectedDoctor) {
            toast.error('Pilih dokter terlebih dahulu');
            return;
        }

        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const existing = leaves.find(l => isSameDay(new Date(l.date), clickedDate));

        setModalData({
            date: clickedDate,
            existingLeave: existing || null,
            reason: existing ? existing.reason : ''
        });
        setIsModalOpen(true);
    };

    // --- Renderers ---
    const renderMonthView = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="bg-gray-50/30 border border-gray-100 min-h-[120px]"></div>);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isToday = isSameDay(new Date(), currentDayDate);

            const dayLeaves = leaves.filter(l => isSameDay(new Date(l.date), currentDayDate));

            days.push(
                <div
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`
                        min-h-[120px] p-3 border relative group transition-all hover:bg-gray-50 cursor-pointer
                        ${isToday
                            ? 'bg-white ring-2 ring-salm-blue ring-offset-2 border-transparent z-10 shadow-lg shadow-salm-blue/10 rounded-2xl'
                            : 'bg-white border-gray-100'}
                    `}
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm font-semibold transition-all ${isToday
                            ? 'bg-salm-blue text-white w-8 h-8 flex items-center justify-center rounded-full shadow-lg shadow-salm-blue/30 scale-110'
                            : 'text-gray-700'
                            }`}>
                            {day}
                        </span>
                    </div>

                    {/* Leave Blocks */}
                    <div className="space-y-1">
                        {dayLeaves.map((leave, idx) => (
                            <div key={idx} className="bg-salm-light-pink/30 border border-salm-light-pink p-2 rounded-lg shadow-sm">
                                <div className="text-xs font-bold text-salm-pink truncate">Leave</div>
                                <div className="text-[10px] text-salm-pink truncate">{leave.reason || 'No specific reason'}</div>
                            </div>
                        ))}
                    </div>

                    {/* Hover Add Indicator */}
                    {dayLeaves.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                            <Plus className="w-6 h-6 text-gray-300" />
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

        // Helper to get schedule for a specific day using DB convention (1-7, Sun=7)
        const getScheduleForDay = (date) => {
            if (!selectedDoctor?.schedules) return null;
            const dayIndex = date.getDay(); // 0-6
            const dbDay = dayIndex === 0 ? 7 : dayIndex;
            return selectedDoctor.schedules.find(s => s.day === dbDay);
        };

        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + i);
            const isToday = isSameDay(new Date(), dayDate);
            const dayLeaves = leaves.filter(l => isSameDay(new Date(l.date), dayDate));
            const schedule = getScheduleForDay(dayDate);
            const isWorkingDay = !!schedule;

            days.push(
                <div
                    key={i}
                    onClick={() => handleDateClick(dayDate.getDate())}
                    className={`
                        min-h-[240px] border-r border-gray-100 p-4 relative group transition-all duration-300 flex flex-col
                        hover:bg-gray-50/80 cursor-pointer
                        ${isToday ? 'bg-salm-light-blue/5' : ''}
                    `}
                >
                    {/* Date Header */}
                    <div className="text-center mb-6 z-10">
                        <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${isToday ? 'text-salm-blue' : 'text-gray-400'}`}>
                            {dayDate.toLocaleString('default', { weekday: 'short' })}
                        </div>
                        <div className={`
                            w-10 h-10 mx-auto flex items-center justify-center rounded-full text-lg font-bold transition-all
                            ${isToday
                                ? 'bg-salm-blue text-white shadow-lg shadow-salm-blue/30 scale-110'
                                : 'text-gray-700 group-hover:bg-white group-hover:shadow-md'}
                        `}>
                            {dayDate.getDate()}
                        </div>
                    </div>

                    {/* Content Container */}
                    <div className="flex-1 flex flex-col gap-3 relative">

                        {/* 1. Schedule Card (Base Layer) */}
                        <div className={`
                            p-3 rounded-xl border flex flex-col gap-1 transition-all
                            ${isWorkingDay
                                ? 'bg-white border-gray-100 shadow-sm opacity-100'
                                : 'bg-gray-50 border-transparent opacity-60'}
                        `}>
                            <div className="flex items-center gap-1.5 min-w-0">
                                {isWorkingDay ? (
                                    <>
                                        <Briefcase className="w-3 h-3 text-salm-purple shrink-0" />
                                        <span className="text-[10px] font-bold text-salm-purple uppercase tracking-tight">Praktek</span>
                                    </>
                                ) : (
                                    <>
                                        <Coffee className="w-3 h-3 text-gray-400 shrink-0" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Libur</span>
                                    </>
                                )}
                            </div>
                            <div className={`text-xs font-semibold truncate ${isWorkingDay ? 'text-gray-700' : 'text-gray-400'}`}>
                                {isWorkingDay ? schedule.time : 'Tidak ada jadwal'}
                            </div>
                        </div>

                        {/* 2. Leave Overlay (Top Layer) */}
                        {dayLeaves.map((leave, idx) => (
                            <div
                                key={idx}
                                className="
                                    absolute inset-x-0 -top-1 -bottom-1 z-20 
                                    bg-salm-light-pink/90 backdrop-blur-sm border border-salm-light-pink 
                                    p-3 rounded-xl shadow-md flex flex-col justify-center gap-1
                                    animate-in fade-in slide-in-from-bottom-2 duration-300
                                "
                            >
                                <div className="flex items-center gap-1.5 text-salm-pink font-bold">
                                    <div className="w-1.5 h-1.5 rounded-full bg-salm-pink animate-pulse" />
                                    <span className="text-[10px] uppercase tracking-wider">Sedang Cuti</span>
                                </div>
                                <div className="text-xs font-medium text-salm-pink/90 line-clamp-2 leading-relaxed">
                                    "{leave.reason || 'Izin Cuti'}"
                                </div>
                            </div>
                        ))}

                        {/* Hover Add Button (Only if no leave) */}
                        {dayLeaves.length === 0 && (
                            <div className="absolute inset-x-0 bottom-0 top-auto flex justify-center py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="bg-salm-gradient text-white p-1.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <Plus className="w-4 h-4" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )
        }
        return (
            <div className="h-full flex flex-col">
                <div className="grid grid-cols-7 border-b border-gray-100 flex-1">{days}</div>
            </div>
        );
    };


    const renderDayView = () => {
        const isToday = isSameDay(new Date(), currentDate);
        const dayLeaves = leaves.filter(l => isSameDay(new Date(l.date), currentDate));

        return (
            <div className="h-full p-6">
                <div className={`p-6 border border-gray-100 rounded-2xl h-full flex flex-col ${isToday ? 'bg-salm-light-blue/10' : 'bg-white'}`}>
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`text-4xl font-bold ${isToday ? 'text-salm-blue' : 'text-gray-900'}`}>{currentDate.getDate()}</div>
                        <div>
                            <div className="text-lg font-bold text-gray-700">{currentDate.toLocaleString('default', { weekday: 'long' })}</div>
                            <div className="text-sm text-gray-500">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-3">
                        {dayLeaves.length > 0 ? dayLeaves.map((leave, idx) => (
                            <div key={idx} className="bg-salm-light-pink/30 border border-salm-light-pink p-4 rounded-2xl shadow-sm flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-salm-pink/20 flex items-center justify-center shrink-0">
                                    <CalendarIcon className="w-6 h-6 text-salm-pink" />
                                </div>
                                <div>
                                    <div className="font-bold text-salm-pink text-lg">On Leave</div>
                                    <div className="text-salm-pink/80">{leave.reason || 'No specific reason'}</div>
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
                                <p>No leaves scheduled for this day</p>
                                <button onClick={() => setModalData({ date: currentDate, existingLeave: null, reason: '' }) || setIsModalOpen(true)} className="mt-4 text-salm-blue font-semibold hover:underline">Add Schedule</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderMiniCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-mini-${i}`} className="w-full aspect-square"></div>);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isSelected = isSameDay(currentDate, dayDate);
            const isToday = isSameDay(new Date(), dayDate);

            days.push(
                <div
                    key={`mini-${day}`}
                    onClick={() => setCurrentDate(dayDate)}
                    className={`
                        w-full aspect-square flex items-center justify-center rounded-full cursor-pointer text-xs font-medium transition-all
                        ${isSelected
                            ? 'bg-salm-gradient text-white shadow-md shadow-salm-purple/30'
                            : isToday
                                ? 'bg-salm-light-blue/20 text-salm-blue font-bold'
                                : 'text-gray-600 hover:bg-gray-100'
                        }
                    `}
                >
                    {day}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="w-full h-full flex flex-col lg:flex-row gap-8 relative z-10 pb-6 text-gray-800 font-sans">

            {/* --- Left Sidebar --- */}
            <div className="w-full lg:w-[320px] flex flex-col gap-6 shrink-0">

                {/* Search / Filter Header */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Filter"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-salm-purple transition-colors"
                        />
                    </div>
                </div>

                {/* Mini Calendar Widget */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                        <div className="flex gap-1">
                            <button onClick={() => changeMiniCalendarMonth(-1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
                            <button onClick={() => changeMiniCalendarMonth(1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 text-center text-xs gap-y-3">
                        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => <span key={d} className="text-gray-400 font-medium">{d}</span>)}
                        {renderMiniCalendar()}
                    </div>
                </div>

                {/* Doctor List */}
                <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800">Doctor List</h3>
                        <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        {filteredDoctors.length === 0 ? (
                            <div className="text-center text-gray-400 py-8 text-sm">
                                No doctors scheduled for this day
                            </div>
                        ) : filteredDoctors.map(doc => (
                            <div
                                key={doc.id}
                                onClick={() => setSelectedDoctor(doc)}
                                className={`
                                    flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border
                                    ${selectedDoctor?.id === doc.id
                                        ? 'bg-salm-light-blue/20 border-salm-light-blue shadow-sm'
                                        : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'}
                                `}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${selectedDoctor?.id === doc.id ? 'bg-salm-light-blue/30 text-salm-blue' : 'bg-gray-100 text-gray-500'}`}>
                                    {doc.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-bold truncate ${selectedDoctor?.id === doc.id ? 'text-salm-purple' : 'text-gray-800'}`}>{doc.name}</h4>
                                    <p className="text-xs text-gray-500 truncate">{doc.specialization || 'Specialist'}</p>
                                </div>
                                {selectedDoctor?.id === doc.id && <div className="w-2 h-2 rounded-full bg-salm-blue"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- Main Content (Right) --- */}
            <div className="flex-1 bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between mb-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-bold text-gray-900">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1 pl-4">
                            <span className="text-xs font-semibold text-gray-500">
                                {view === 'day' ? 'Today' : view === 'week' ? 'This Week' : 'This Month'}
                            </span>
                            <div className="flex">
                                <button onClick={() => navigateDate(-1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:scale-105 transition-transform"><ChevronLeft className="w-4 h-4" /></button>
                                <button onClick={() => navigateDate(1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm ml-1 hover:scale-105 transition-transform"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => setView('month')} className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${view === 'month' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>Month</button>
                        <button onClick={() => setView('week')} className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${view === 'week' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>Week</button>
                        <button onClick={() => setView('day')} className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${view === 'day' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>Day</button>
                        <button className="bg-salm-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-salm-purple/30 hover:opacity-90 transition-colors flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Schedule
                        </button>
                    </div>
                </div>

                {/* Weekday Header - Only show for Month View */}
                {view === 'month' && (
                    <div className="grid grid-cols-7 border-b border-gray-100 pb-4 mb-4 shrink-0">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="px-3">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{day}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Calendar Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {view === 'month' && (
                        <div className="grid grid-cols-7 auto-rows-fr">
                            {renderMonthView()}
                        </div>
                    )}
                    {view === 'week' && renderWeekView()}
                    {view === 'day' && renderDayView()}
                </div>
            </div>

            {/* --- Modal / Popover --- */}
            {isModalOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 rounded-[32px]">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-gray-100 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {modalData.existingLeave ? 'Edit Schedule' : 'New Schedule'}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {modalData.date?.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Doctor Info */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-10 h-10 bg-salm-light-blue/30 rounded-full flex items-center justify-center text-salm-blue font-bold">
                                    {selectedDoctor?.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{selectedDoctor?.name}</p>
                                    <p className="text-xs text-gray-500">{selectedDoctor?.specialization || 'Specialist'}</p>
                                </div>
                            </div>

                            {/* Time / Type */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Leave Type</label>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-2 rounded-lg bg-salm-gradient text-white text-sm font-medium shadow-md shadow-salm-purple/30">Full Day</button>
                                    <button className="flex-1 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">Half Day</button>
                                </div>
                            </div>

                            {/* Reason Input */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Description</label>
                                <textarea
                                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-salm-purple min-h-[80px]"
                                    placeholder="Add description..."
                                    value={modalData.reason}
                                    onChange={(e) => setModalData({ ...modalData, reason: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-8">
                            {modalData.existingLeave && (
                                <button
                                    onClick={handleDeleteLeave}
                                    className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            )}
                            <div className="flex-1"></div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveLeave}
                                className="px-6 py-2.5 rounded-xl bg-salm-gradient text-white hover:opacity-90 text-sm font-semibold shadow-lg shadow-salm-purple/30 transition-colors flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" /> Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default DoctorLeaveCalendar;
