import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import useQueueStore from '../store/useQueueStore';

const ScheduleCalendar = () => {
    const { doctors } = useQueueStore();
    const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 1 : new Date().getDay()); // Default to today (or Monday if Sunday)
    const [searchTerm, setSearchTerm] = useState('');

    const days = [
        { id: 1, name: 'Senin', short: 'Sen' },
        { id: 2, name: 'Selasa', short: 'Sel' },
        { id: 3, name: 'Rabu', short: 'Rab' },
        { id: 4, name: 'Kamis', short: 'Kam' },
        { id: 5, name: 'Jumat', short: 'Jum' },
        { id: 6, name: 'Sabtu', short: 'Sab' },
    ];

    const getDoctorsForDay = (dayId) => {
        // Group doctors by Poliklinik
        const grouped = {};

        doctors.forEach(doc => {
            // Check if doctor has schedule for this day
            const daySchedule = doc.schedules?.find(s => s.day === dayId);

            if (daySchedule) {
                const poliName = doc.poliklinik?.name || 'Unassigned';
                if (!grouped[poliName]) {
                    grouped[poliName] = [];
                }
                grouped[poliName].push({
                    name: doc.name,
                    role: doc.specialist,
                    todayTime: daySchedule.time
                });
            }
        });

        // Convert to array format
        return Object.keys(grouped).map(category => ({
            category,
            doctors: grouped[category]
        }));
    };

    const filteredSchedule = getDoctorsForDay(selectedDay).map(cat => ({
        ...cat,
        doctors: cat.doctors.filter(d =>
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.role.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(cat => cat.doctors.length > 0);

    return (
        <div className="glass-card rounded-3xl p-6 border border-white/5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-modern-purple/10 flex items-center justify-center text-modern-purple border border-modern-purple/20">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-modern-text">Jadwal Dokter</h2>
                        <p className="text-sm text-modern-text-secondary">Update September 2025</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative hidden md:block">
                    <input
                        type="text"
                        placeholder="Cari dokter atau poli..."
                        className="bg-modern-bg border border-white/10 rounded-xl px-4 py-2 text-sm text-modern-text focus:outline-none focus:ring-2 focus:ring-modern-purple/50 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Day Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {days.map((day) => (
                    <button
                        key={day.id}
                        onClick={() => setSelectedDay(day.id)}
                        className={`
                            px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap
                            ${selectedDay === day.id
                                ? 'bg-salm-gradient text-white shadow-lg shadow-salm-purple/25'
                                : 'bg-modern-bg text-modern-text-secondary hover:bg-white/5 hover:text-modern-text'}
                        `}
                    >
                        <span className="hidden md:inline">{day.name}</span>
                        <span className="md:hidden">{day.short}</span>
                    </button>
                ))}
            </div>

            {/* Schedule List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar max-h-[600px]">
                {filteredSchedule.length > 0 ? (
                    filteredSchedule.map((category, idx) => (
                        <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                            <h3 className="text-sm font-bold text-salm-purple mb-3 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-salm-purple"></span>
                                {category.category}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {category.doctors.map((doc, docIdx) => (
                                    <div key={docIdx} className="bg-modern-bg/50 p-4 rounded-xl border border-white/5 hover:border-salm-purple/30 transition-colors group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-modern-text group-hover:text-salm-purple transition-colors">{doc.name}</h4>
                                                <p className="text-xs text-modern-text-secondary mt-1">{doc.role}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-salm-purple/10 px-2.5 py-1 rounded-lg border border-salm-purple/10">
                                                <Clock className="w-3.5 h-3.5 text-salm-purple" />
                                                <span className="text-xs font-medium text-salm-purple">{doc.todayTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-modern-text-secondary">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Tidak ada jadwal dokter untuk hari ini</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScheduleCalendar;
