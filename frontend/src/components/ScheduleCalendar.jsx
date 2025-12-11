import React, { useState } from 'react';
import { Calendar, Clock, Search, ChevronRight, Stethoscope } from 'lucide-react';
import useQueueStore from '../store/useQueueStore';

const ScheduleCalendar = () => {
    const { doctors } = useQueueStore();
    const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 1 : new Date().getDay());
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
        const grouped = {};
        doctors.forEach(doc => {
            const daySchedule = doc.schedules?.find(s => s.day === dayId);
            if (daySchedule) {
                const poliName = doc.poliklinik?.name || 'Unassigned';
                if (!grouped[poliName]) grouped[poliName] = [];
                grouped[poliName].push({
                    name: doc.name,
                    role: doc.specialist,
                    todayTime: daySchedule.time,
                    id: doc.id
                });
            }
        });
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
        <div className="bg-white dark:bg-gray-800 rounded-[32px] flex flex-col h-full overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700 font-sans">
            {/* Header */}
            <div className="pt-6 pb-6 px-6 bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-700 z-10">

                {/* Search Bar */}
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari dokter..."
                        className="w-full bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-white rounded-2xl py-3 pl-10 pr-4 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-salm-purple/50 focus:bg-white dark:focus:bg-gray-700 transition-all shadow-inner"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Modern Segmented Control */}
                <div className="bg-gray-100 dark:bg-gray-700/50 p-1.5 rounded-2xl flex relative">
                    {days.map((day) => (
                        <button
                            key={day.id}
                            onClick={() => setSelectedDay(day.id)}
                            className={`
                                flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-300 relative z-10
                                ${selectedDay === day.id
                                    ? 'bg-white dark:bg-gray-600 text-salm-purple shadow-md scale-[1.02]'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}
                            `}
                        >
                            <span className="hidden md:inline">{day.name}</span>
                            <span className="md:hidden">{day.short}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50/50 dark:bg-gray-900/10">
                {filteredSchedule.length > 0 ? (
                    <div className="space-y-8 pb-10">
                        {filteredSchedule.map((category, idx) => (
                            <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                <h3 className="text-salm-purple text-xs font-bold uppercase tracking-widest ml-4 mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-salm-purple"></span>
                                    {category.category}
                                </h3>
                                <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700/50">
                                    {category.doctors.map((doc, docIdx) => (
                                        <div
                                            key={docIdx}
                                            className={`
                                                flex items-center p-4 md:p-5 md:pl-6 active:bg-gray-50 dark:active:bg-gray-700/50 transition-colors cursor-pointer group
                                                ${docIdx !== category.doctors.length - 1 ? 'border-b border-gray-100 dark:border-gray-700/50' : ''}
                                            `}
                                        >
                                            <div className="relative mr-3 md:mr-5">
                                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-600 text-gray-400 dark:text-gray-300 flex items-center justify-center font-bold text-lg md:text-xl shadow-sm border border-gray-100 dark:border-gray-600">
                                                    {doc.name.charAt(0)}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm">
                                                    <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${parseInt(doc.todayTime.split(':')[0]) < 12 ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0 mr-2 md:mr-4">
                                                <h4 className="text-base md:text-lg font-bold text-theme-text dark:text-white leading-tight mb-0.5 md:mb-1 group-hover:text-salm-purple transition-colors truncate">
                                                    {doc.name}
                                                </h4>
                                                <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium">
                                                    <Stethoscope className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1 md:mr-1.5 text-salm-pink flex-shrink-0" />
                                                    <span className="truncate">{doc.role}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                                                <div className="text-right">
                                                    <div className="inline-flex items-center gap-1 md:gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 md:px-3 md:py-1 rounded-lg border border-gray-100 dark:border-gray-600">
                                                        <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-400" />
                                                        <span className="text-xs md:text-sm font-bold text-gray-600 dark:text-gray-300">{doc.todayTime}</span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-300 dark:text-gray-600 group-hover:text-salm-purple group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="w-10 h-10 opacity-30 text-salm-purple" />
                        </div>
                        <p className="text-lg font-medium text-gray-500">Tidak ada jadwal</p>
                        <p className="text-sm">Silakan pilih hari lain</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScheduleCalendar;
