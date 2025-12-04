import React, { useState } from 'react';
import { User, Users, MoreHorizontal, Edit2, Check, X } from 'lucide-react';
import useQueueStore from '../store/useQueueStore';

const DoctorCard = ({ doctor }) => {
    const { toggleStatus } = useQueueStore();
    const [isEditing, setIsEditing] = useState(false);
    const [newQuota, setNewQuota] = useState(doctor.quota?.max_quota || 30);

    const statusConfig = {
        OPEN: { color: 'bg-green-500', label: 'Active', bg: 'bg-green-50' },
        CLOSED: { color: 'bg-red-500', label: 'Closed', bg: 'bg-red-50' },
        FULL: { color: 'bg-orange-500', label: 'Full', bg: 'bg-orange-50' },
        BREAK: { color: 'bg-yellow-500', label: 'Break', bg: 'bg-yellow-50' },
    };

    const currentStatus = statusConfig[doctor.quota?.status] || statusConfig.CLOSED;

    const handleStatusChange = (newStatus) => {
        toggleStatus(doctor.id, newStatus, doctor.quota?.max_quota);
    };

    const handleQuotaUpdate = () => {
        toggleStatus(doctor.id, doctor.quota?.status, newQuota);
        setIsEditing(false);
    };

    return (
        <div className="glass-card rounded-3xl p-6 flex flex-col h-full relative overflow-hidden group">
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${currentStatus.bg} rounded-full blur-3xl -mr-16 -mt-16 transition-colors duration-500 opacity-50`}></div>

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                            {doctor.photo_url ? (
                                <img src={doctor.photo_url} alt={doctor.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-6 h-6 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-[#1D1D1F] leading-tight">{doctor.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{doctor.specialist}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase ${currentStatus.bg} ${currentStatus.color.replace('bg-', 'text-')}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.color}`}></span>
                            {currentStatus.label}
                        </span>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Counter */}
                    <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Patients</span>
                            <Users className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-[#1D1D1F]">{doctor.quota?.current_count || 0}</span>
                            <span className="text-sm text-gray-400 font-medium">/ {doctor.quota?.max_quota || 0}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-gray-200 rounded-full mt-3 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${currentStatus.color}`}
                                style={{ width: `${Math.min(((doctor.quota?.current_count || 0) / (doctor.quota?.max_quota || 1)) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2 bg-gray-100/80 p-1 rounded-xl">
                            {['OPEN', 'BREAK', 'CLOSED'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    className={`
                            py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                            ${doctor.quota?.status === status
                                            ? 'bg-white text-black shadow-sm scale-[1.02]'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
                        `}
                                >
                                    {status === 'OPEN' ? 'Open' : status === 'BREAK' ? 'Break' : 'Close'}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            {isEditing ? (
                                <div className="flex items-center gap-2 w-full animate-in fade-in slide-in-from-left-2 duration-200">
                                    <input
                                        type="number"
                                        value={newQuota}
                                        onChange={(e) => setNewQuota(e.target.value)}
                                        className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3]"
                                        autoFocus
                                    />
                                    <button onClick={handleQuotaUpdate} className="p-1.5 bg-[#0071E3] text-white rounded-lg hover:bg-[#0077ED]">
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-[#0071E3] transition-colors group/edit"
                                >
                                    <Edit2 className="w-3 h-3" />
                                    <span>Edit Max Quota</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorCard;
