import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bed, User, AlertCircle, Sparkles, CheckCircle,
    ClipboardList, MoveRight, LogOut, Info, ShieldCheck
} from 'lucide-react';

// Status Configuration - Premium Apple Palette
const STATUS_CONFIG = {
    AVAILABLE: {
        color: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/20',
        border: 'border-emerald-200 dark:border-emerald-800/50',
        text: 'text-emerald-700 dark:text-emerald-400',
        glow: 'shadow-emerald-500/10',
        label: 'Tersedia',
        icon: <Bed size={22} />
    },
    OCCUPIED: {
        color: 'from-rose-50 to-rose-100/50 dark:from-rose-950/20 dark:to-rose-900/20',
        border: 'border-rose-200 dark:border-rose-800/50',
        text: 'text-rose-700 dark:text-rose-400',
        glow: 'shadow-rose-500/10',
        label: 'Terisi',
        icon: <User size={22} />
    },
    CLEANING: {
        color: 'from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/20',
        border: 'border-amber-200 dark:border-amber-800/50',
        text: 'text-amber-700 dark:text-amber-400',
        glow: 'shadow-amber-500/10',
        label: 'Pembersihan',
        icon: <Sparkles size={22} />
    },
    MAINTENANCE: {
        color: 'from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800',
        border: 'border-slate-200 dark:border-slate-700',
        text: 'text-slate-500 dark:text-slate-400',
        glow: 'shadow-slate-500/5',
        label: 'Perbaikan',
        icon: <AlertCircle size={22} />
    }
};

const BedCard = ({ bed, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const config = STATUS_CONFIG[bed.status] || STATUS_CONFIG.MAINTENANCE;

    return (
        <motion.div
            layout
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={() => onClick(bed)}
            className={`
                group relative p-5 rounded-[32px] border transition-all duration-500 cursor-pointer
                bg-gradient-to-br ${config.color} ${config.border} ${config.glow}
                hover:shadow-2xl hover:-translate-y-2 hover:border-blue-400/50 dark:hover:border-blue-500/50
            `}
        >
            {/* Header: Code & Icon */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                    <span className="text-2xl font-black tracking-tighter text-slate-800 dark:text-white">
                        {bed.code || bed.number}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${config.text}`}>
                        {config.label}
                    </span>
                </div>
                <div className={`p-3 rounded-2xl bg-white/60 dark:bg-black/20 backdrop-blur-md shadow-sm transition-transform group-hover:scale-110 ${config.text}`}>
                    {config.icon}
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[60px] flex flex-col justify-end">
                <AnimatePresence mode="wait">
                    {bed.status === 'OCCUPIED' && bed.current_patient ? (
                        <motion.div
                            key="patient-info"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-1"
                        >
                            <div className="text-sm font-black text-slate-700 dark:text-slate-200 truncate">
                                {bed.current_patient.name}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                <ShieldCheck size={10} className="text-emerald-500" />
                                MR: {bed.current_patient.id}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="status-note"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs font-bold text-slate-400 italic"
                        >
                            {bed.status === 'AVAILABLE' ? 'Siap digunakan' : 'Sedang diproses'}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Quick Actions Overlay */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        className="absolute inset-0 rounded-[32px] bg-white/40 dark:bg-slate-900/60 flex items-center justify-center gap-3 z-20"
                    >
                        {bed.status === 'OCCUPIED' ? (
                            <>
                                <button className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:scale-110 transition active:scale-95" title="Buka Chart">
                                    <ClipboardList size={20} />
                                </button>
                                <button className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-110 transition active:scale-95" title="Transfer">
                                    <MoveRight size={20} />
                                </button>
                                <button className="p-3 bg-rose-600 text-white rounded-2xl shadow-lg hover:scale-110 transition active:scale-95" title="Discharge">
                                    <LogOut size={20} />
                                </button>
                            </>
                        ) : (
                            <div className="text-sm font-black text-slate-800 dark:text-white flex flex-col items-center gap-2">
                                <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg mb-1">
                                    <Info size={20} />
                                </div>
                                Klik untuk Detail
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Class Badge */}
            <div className="absolute -top-3 left-6 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full text-[10px] font-black text-slate-500 shadow-xl tracking-tight uppercase">
                {bed.room?.type || 'Standard'}
            </div>
        </motion.div>
    );
};

const BedCanvas = ({ rooms, onBedClick }) => {
    return (
        <div className="space-y-12">
            {rooms.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-32 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl rounded-[48px] border-2 border-dashed border-slate-200 dark:border-slate-800"
                >
                    <Bed size={64} className="mx-auto mb-6 text-slate-300 dark:text-slate-700" />
                    <h3 className="text-2xl font-black text-slate-400">Tidak ada ruangan ditemukan</h3>
                    <p className="text-slate-500 font-medium">Pastikan data Master Ruangan sudah terisi dengan benar.</p>
                </motion.div>
            )}

            {rooms.map((room, idx) => (
                <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative"
                >
                    {/* Visual Depth Stack Effect */}
                    <div className="absolute inset-0 translate-y-3 translate-x-3 bg-slate-200/50 dark:bg-slate-800/30 rounded-[48px] -z-10" />

                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-[48px] p-10 border border-white dark:border-slate-800 shadow-2xl overflow-hidden relative">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-[32px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-3xl shadow-2xl shadow-blue-500/30">
                                    {room.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">
                                        {room.name}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                            {room.type}
                                        </span>
                                        <span className="text-sm font-bold text-slate-400">
                                            {room.gender || 'CAMPUR'} • {room.beds.length} Bed
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                                    <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Available</div>
                                    <div className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                                        {room.beds.filter(b => b.status === 'AVAILABLE').length}
                                    </div>
                                </div>
                                <div className="px-4 py-2 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800/50">
                                    <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Occupied</div>
                                    <div className="text-xl font-black text-rose-700 dark:text-rose-400">
                                        {room.beds.filter(b => b.status === 'OCCUPIED').length}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 relative z-10">
                            <AnimatePresence>
                                {room.beds.map((bed) => (
                                    <BedCard key={bed.id} bed={bed} onClick={onBedClick} />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default BedCanvas;
