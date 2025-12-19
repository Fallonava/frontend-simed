import React, { useState, useEffect } from 'react';
import {
    LayoutGrid, User, Activity, Clock, PaintBucket, AlertCircle
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const BedManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [stats, setStats] = useState({});
    const [filter, setFilter] = useState('ALL'); // ALL, VIP, KELAS_1, etc.

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchData = () => {
        api.get('/beds').then(res => setRooms(res.data));
        api.get('/beds/stats').then(res => setStats(res.data));
    };

    const handleStatusChange = async (bedId, newStatus) => {
        try {
            await api.put(`/beds/${bedId}/status`, { status: newStatus });
            toast.success('Bed status updated');
            fetchData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    // Responsive Filter Tabs (Scrollable on mobile)
    const FilterTab = ({ label, code }) => (
        <button
            onClick={() => setFilter(code)}
            className={`whitespace-nowrap px-4 py-3 rounded-xl font-bold transition-all ${filter === code
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none'
                    : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in pb-24">
            {/* Header with Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Beds" value={stats.total} icon={LayoutGrid} color="text-gray-600" />
                <StatCard label="Occupied" value={stats.occupied} icon={User} color="text-red-500" />
                <StatCard label="Available" value={stats.available} icon={CheckIcon} color="text-emerald-500" />
                <StatCard label="Cleaning" value={stats.cleaning} icon={PaintBucket} color="text-amber-500" />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <FilterTab label="All Wards" code="ALL" />
                <FilterTab label="VIP" code="VIP" />
                <FilterTab label="Kelas 1" code="KELAS_1" />
                <FilterTab label="Kelas 2" code="KELAS_2" />
                <FilterTab label="Kelas 3" code="KELAS_3" />
                <FilterTab label="ICU" code="ICU" />
            </div>

            {/* Bed Grid */}
            <div className="space-y-8">
                {rooms
                    .filter(room => filter === 'ALL' || room.type === filter)
                    .map(room => (
                        <div key={room.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    {room.name}
                                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 font-medium">
                                        {room.type.replace('_', ' ')}
                                    </span>
                                </h3>
                                <button className="text-sm font-bold text-gray-400 hover:text-blue-600">
                                    View Details
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {room.beds.map(bed => (
                                    <BedCard
                                        key={bed.id}
                                        bed={bed}
                                        onStatusChange={handleStatusChange}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

const BedCard = ({ bed, onStatusChange }) => {
    const isOccupied = bed.status === 'OCCUPIED';
    const isCleaning = bed.status === 'CLEANING';
    const isMtc = bed.status === 'MTC';

    // Status Logic
    const config = {
        AVAILABLE: { color: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: CheckIcon, label: 'Available' },
        OCCUPIED: { color: 'bg-red-50 border-red-200', text: 'text-red-700', icon: User, label: 'Occupied' },
        CLEANING: { color: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: PaintBucket, label: 'Cleaning' },
        MTC: { color: 'bg-gray-100 border-gray-200', text: 'text-gray-500', icon: AlertCircle, label: 'Maintenance' },
    }[bed.status] || { color: 'bg-gray-50', text: 'text-gray-500' };

    return (
        <div className={`relative p-5 rounded-2xl border-2 transition-all hover:shadow-md ${config.color} flex flex-col justify-between min-h-[160px]`}>
            <div>
                <div className="flex justify-between items-start">
                    <span className={`text-2xl font-black ${config.text}`}>{bed.code}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/50 backdrop-blur ${config.text}`}>
                        {config.label}
                    </span>
                </div>

                {isOccupied && bed.current_patient && (
                    <div className="mt-4">
                        <p className="text-sm font-bold text-gray-900 truncate">
                            {bed.current_patient.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            MR: {bed.current_patient.rm_number}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                            <Clock size={12} />
                            <span>Admitted: today</span> {/* Placeholder */}
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions (Touch Friendly) */}
            <div className="mt-4 pt-3 border-t border-black/5 flex gap-2">
                {isOccupied ? (
                    <button className="flex-1 py-2 text-xs font-bold bg-white text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm border border-gray-100">
                        Discharge
                    </button>
                ) : isCleaning ? (
                    <button
                        onClick={() => onStatusChange(bed.id, 'AVAILABLE')}
                        className="flex-1 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm"
                    >
                        Mark Ready
                    </button>
                ) : (
                    <button className="flex-1 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm">
                        Admit Patient
                    </button>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div>
            <p className="text-xs text-gray-400 font-bold uppercase">{label}</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{value || 0}</p>
        </div>
        <div className={`p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 ${color}`}>
            <Icon size={20} />
        </div>
    </div>
);

// Fallback Icon
const CheckIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

export default BedManagement;
