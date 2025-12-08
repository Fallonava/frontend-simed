import React, { useState } from 'react';
import { Users, MoreHorizontal, Edit2, Check, X } from 'lucide-react';
import useQueueStore from '../store/useQueueStore';

const DoctorCard = ({ doctor, onLeave = false, leaveReason = '' }) => {
    const { toggleStatus, callNext } = useQueueStore();
    const [isEditing, setIsEditing] = useState(false);
    const [newQuota, setNewQuota] = useState(doctor.quota?.max_quota || 30);

    const statusConfig = {
        OPEN: { color: 'bg-modern-green', label: 'Active', bg: 'bg-modern-green/10' },
        CLOSED: { color: 'bg-red-500', label: 'Closed', bg: 'bg-red-500/10' },
        FULL: { color: 'bg-orange-500', label: 'Full', bg: 'bg-orange-500/10' },
        BREAK: { color: 'bg-yellow-500', label: 'Break', bg: 'bg-yellow-500/10' },
        LEAVE: { color: 'bg-indigo-500', label: 'Cuti / Libur', bg: 'bg-indigo-500/10' },
    };

    const currentStatus = onLeave ? statusConfig.LEAVE : (statusConfig[doctor.quota?.status] || statusConfig.CLOSED);

    const handleStatusChange = (newStatus) => {
        if (onLeave) return;
        toggleStatus(doctor.id, newStatus, doctor.quota?.max_quota || 30);
    };

    const handleQuotaUpdate = () => {
        toggleStatus(doctor.id, doctor.quota?.status, newQuota);
        setIsEditing(false);
    };

    return (
        <div className={`glass-card rounded-[2rem] p-6 flex flex-col h-full relative overflow-hidden group shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] backdrop-blur-xl border border-white/20 transition-all duration-500 ${onLeave ? 'opacity-80 grayscale-[0.5]' : ''}`}>
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${currentStatus.bg} rounded-full blur-3xl -mr-16 -mt-16 transition-colors duration-500 opacity-50`}></div>

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-modern-bg flex items-center justify-center overflow-hidden shadow-inner shrink-0 border border-white/5">
                            {doctor.photo_url && !doctor.photo_url.includes('via.placeholder') ? (
                                <img src={doctor.photo_url} alt={doctor.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-3xl text-modern-text-secondary">
                                    account_circle
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-modern-text leading-tight">{doctor.name}</h3>
                            <p className="text-sm text-modern-text-secondary mt-1">{doctor.specialist}</p>
                            {onLeave && <p className="text-xs text-indigo-400 font-bold mt-1 line-clamp-1">{leaveReason}</p>}
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
                    <div className="bg-modern-bg/50 rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-modern-text-secondary uppercase tracking-wider">Patients</span>
                            <Users className="w-4 h-4 text-modern-text-secondary" />
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-modern-text">{doctor.quota?.current_count || 0}</span>
                            <span className="text-sm text-modern-text-secondary font-medium">/ {doctor.quota?.max_quota || 0}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${currentStatus.color}`}
                                style={{ width: `${Math.min(((doctor.quota?.current_count || 0) / (doctor.quota?.max_quota || 1)) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2 bg-modern-bg/80 p-1 rounded-xl border border-white/5">
                            {['OPEN', 'BREAK', 'CLOSED'].map((status) => {
                                const isActive = !onLeave && doctor.quota?.status === status; // Force inactive if onLeave
                                let activeClass = '';
                                if (isActive) {
                                    if (status === 'OPEN') activeClass = 'bg-modern-green text-white shadow-lg shadow-modern-green/25';
                                    else if (status === 'BREAK') activeClass = 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/25';
                                    else activeClass = 'bg-red-500 text-white shadow-lg shadow-red-500/25';
                                }

                                return (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusChange(status)}
                                        disabled={onLeave}
                                        className={`
                                            py-1.5 rounded-lg text-xs font-bold transition-all duration-200
                                            ${isActive
                                                ? `${activeClass} scale-[1.02]`
                                                : onLeave ? 'text-gray-400 cursor-not-allowed opacity-50'
                                                    : 'text-modern-text-secondary hover:text-modern-text hover:bg-white/5'}
                                        `}
                                    >
                                        {status === 'OPEN' ? 'Open' : status === 'BREAK' ? 'Break' : 'Close'}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => callNext(doctor.id)}
                            disabled={onLeave}
                            className={`w-full py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg
                                ${onLeave
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
                                    : 'bg-modern-text text-modern-bg hover:bg-white active:scale-[0.98] shadow-modern-blue/10'}
                             `}
                        >
                            {!onLeave && <span className="w-2 h-2 bg-modern-green rounded-full animate-pulse shadow-[0_0_5px_rgba(0,230,118,0.8)]"></span>}
                            Call Next Patient
                        </button>

                        <div className="flex items-center justify-between pt-2">
                            {isEditing ? (
                                <div className="flex items-center gap-2 w-full animate-in fade-in slide-in-from-left-2 duration-200">
                                    <input
                                        type="number"
                                        value={newQuota}
                                        onChange={(e) => setNewQuota(e.target.value)}
                                        className="w-full px-3 py-1.5 text-sm bg-modern-bg border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-modern-blue/50 focus:border-modern-blue text-modern-text"
                                        autoFocus
                                    />
                                    <button onClick={handleQuotaUpdate} className="p-1.5 bg-modern-blue text-white rounded-lg hover:bg-modern-blue/80">
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="p-1.5 bg-white/10 text-modern-text-secondary rounded-lg hover:bg-white/20">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 text-xs font-medium text-modern-text-secondary hover:text-modern-blue transition-colors group/edit"
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
