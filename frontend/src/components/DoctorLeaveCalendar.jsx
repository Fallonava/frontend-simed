import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Plus, MoreHorizontal, Clock, Calendar as CalendarIcon, X, Check, Trash2, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const DoctorLeaveCalendar = () => {
    // --- State ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [leaves, setLeaves] = useState([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ date: null, existingLeave: null, reason: '' });

    // --- Effects ---
    useEffect(() => {
        fetchDoctors();
    }, []);

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
            if (res.data.length > 0) {
                setSelectedDoctor(res.data[0]);
            }
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

    const changeMonth = (offset) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
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
    const renderCalendarGrid = () => {
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
                        min-h-[120px] p-3 border border-gray-100 relative group transition-all hover:bg-gray-50 cursor-pointer
                        ${isToday ? 'bg-salm-light-blue/20' : 'bg-white'}
                    `}
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm font-semibold ${isToday ? 'text-salm-blue w-7 h-7 flex items-center justify-center bg-salm-light-blue/30 rounded-full' : 'text-gray-700'}`}>
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

    return (
        <div className="w-full h-full flex flex-col lg:flex-row gap-8 relative z-10 pb-6 text-gray-800 font-sans">

            {/* --- Left Sidebar --- */}
            <div className="w-full lg:w-[320px] flex flex-col gap-6 shrink-0">

                {/* Search / Filter Header (Mockup) */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Filter"
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-salm-purple transition-colors"
                        />
                    </div>
                </div>

                {/* Mini Calendar Widget */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                        <div className="flex gap-1">
                            <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
                            <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
                        </div>
                    </div>
                    {/* Simplified Mini Grid just for visualization */}
                    <div className="grid grid-cols-7 text-center text-xs gap-y-3">
                        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => <span key={d} className="text-gray-400 font-medium">{d}</span>)}
                        {Array.from({ length: 35 }).map((_, i) => (
                            <div key={i} className={`w-full aspect-square flex items-center justify-center rounded-full hover:bg-salm-light-blue/20 cursor-pointer ${i === 12 ? 'bg-salm-gradient text-white shadow-md shadow-salm-purple/30' : 'text-gray-600'}`}>
                                {(i % 30) + 1}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Doctor List */}
                <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800">Doctor List</h3>
                        <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        {doctors.map(doc => (
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
                            <span className="text-xs font-semibold text-gray-500">Today</span>
                            <div className="flex">
                                <button onClick={() => changeMonth(-1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:scale-105 transition-transform"><ChevronLeft className="w-4 h-4" /></button>
                                <button onClick={() => changeMonth(1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm ml-1 hover:scale-105 transition-transform"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50">Month</button>
                        <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50">Week</button>
                        <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50">Day</button>
                        <button className="bg-salm-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-salm-purple/30 hover:opacity-90 transition-colors flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Schedule
                        </button>
                    </div>
                </div>

                {/* Weekday Header */}
                <div className="grid grid-cols-7 border-b border-gray-100 pb-4 mb-4 shrink-0">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="px-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{day}</span>
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-7 auto-rows-fr">
                        {renderCalendarGrid()}
                    </div>
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
