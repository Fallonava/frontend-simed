import React, { useEffect, useState } from 'react';
import useQueueStore from '../store/useQueueStore';
import TicketModal from '../components/TicketModal';
import {
    Clock, ChevronRight, Activity, Calendar, Stethoscope,
    User, AlertCircle, RefreshCw, QrCode, ArrowLeft,
    CheckCircle2, Sparkles, Fingerprint, ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// --- ANIMATED BACKGROUND ---
const FloatingBackground = () => (
    <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none bg-[#F2F2F7] dark:bg-black transition-colors duration-700">
        <motion.div
            animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                rotate: [0, 360]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full"
        />
        <motion.div
            animate={{
                x: [0, -100, 0],
                y: [0, 50, 0],
                rotate: [360, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 blur-[140px] rounded-full"
        />
        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[2px]" />
    </div>
);

// --- SUB-COMPONENTS ---

const KioskCard = ({ onClick, icon: Icon, title, subtitle, variant = "glass", delay = 0 }) => {
    const isPrimary = variant === "primary";

    return (
        <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: "spring", stiffness: 100 }}
            onClick={onClick}
            className={`
                group relative flex flex-col items-center justify-center p-10 rounded-[60px] border-2 transition-all duration-700 active:scale-95
                ${isPrimary
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-700 border-white/20 shadow-[0_25px_50px_-15px_rgba(37,99,235,0.4)]'
                    : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border-white dark:border-slate-800 shadow-xl hover:bg-white dark:hover:bg-slate-800'}
            `}
        >
            <div className={`
                w-28 h-28 rounded-[36px] flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6
                ${isPrimary ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-500/10 text-blue-600'}
            `}>
                <Icon size={56} strokeWidth={1.5} />
            </div>
            <div className="text-center">
                <h2 className={`text-3xl lg:text-4xl font-black tracking-tighter mb-2 ${isPrimary ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {title}
                </h2>
                <p className={`text-sm font-black uppercase tracking-[0.2em] opacity-50 ${isPrimary ? 'text-blue-100' : 'text-slate-500'}`}>
                    {subtitle}
                </p>
            </div>

            <div className={`
                absolute top-8 right-8 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
                ${isPrimary ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100'}
            `}>
                <ChevronRight size={28} />
            </div>
        </motion.button>
    );
};

const LandingView = ({ setView }) => (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col items-center justify-center p-8 lg:p-12">
        <div className="text-center mb-16 max-w-5xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-black uppercase tracking-widest mb-6"
            >
                <Sparkles size={14} /> Welcome to the future of healthcare
            </motion.div>
            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-4">
                SIMIMED <span className="text-blue-600">SMART KIOSK</span>
            </h1>
            <p className="text-xl lg:text-2xl text-slate-500 font-bold uppercase tracking-widest opacity-60">Sistem Layanan Mandiri Terpadu</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-7xl">
            <KioskCard
                onClick={() => setView('CHECKIN')}
                icon={QrCode}
                title="Check-in Online"
                subtitle="Mobile JKN & Booking Code"
                delay={0.1}
            />
            <KioskCard
                onClick={() => setView('DOCTOR_LIST')}
                icon={Stethoscope}
                title="Ambil Antrean"
                subtitle="Daftar Langsung di Loket"
                variant="primary"
                delay={0.2}
            />
        </div>

        <div className="mt-20 flex flex-col items-center gap-4">
            <div className="flex gap-4 text-slate-400 font-black uppercase tracking-widest text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    Secure & Encrypted
                </div>
                <div className="w-px h-3 bg-slate-300 dark:bg-slate-800 self-center" />
                <div>ID: KSK-001A</div>
                <div className="w-px h-3 bg-slate-300 dark:bg-slate-800 self-center" />
                <div className="flex items-center gap-1.5 focus:text-blue-500 transition-colors cursor-pointer">
                    <Fingerprint size={14} /> Biometric Ready
                </div>
            </div>
        </div>
    </div>
);

const CheckinView = ({ setView, checkIn }) => {
    const [code, setCode] = useState('');
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState('');

    const handleCheckin = async () => {
        if (!code) return;
        setChecking(true);
        setError('');
        try {
            await checkIn(code);
            setView('SUCCESS_CHECKIN');
        } catch (e) {
            setError(e.response?.data?.metadata?.message || 'Kode Booking tidak ditemukan. Pastikan data sudah benar.');
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-10">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl p-12 rounded-[60px] border border-white dark:border-slate-800 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] flex flex-col items-center gap-10"
            >
                <div className="w-20 h-20 bg-blue-600 text-white rounded-[28px] flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <QrCode size={40} />
                </div>
                <div className="text-center">
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Konfirmasi Kedatangan</h2>
                    <p className="text-lg text-slate-500 font-bold">Gunakan Kode Booking atau NIK untuk Check-in</p>
                </div>

                <div className="w-full space-y-6">
                    <div className="relative group">
                        <input
                            type="text"
                            autoFocus
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="MJKN-ABC123"
                            className="w-full text-center text-3xl font-black tracking-[0.2em] py-8 px-6 rounded-[32px] bg-slate-50 dark:bg-slate-800/50 border-4 border-transparent focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none shadow-inner"
                        />
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 p-6 rounded-3xl flex items-center gap-4 border border-rose-200 dark:border-rose-500/20 text-lg font-black"
                            >
                                <AlertCircle size={24} /> {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="grid grid-cols-2 gap-6 w-full pt-4">
                    <button
                        onClick={() => setView('LANDING')}
                        className="py-6 rounded-[30px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black text-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <ArrowLeft size={20} /> Kembali
                    </button>
                    <button
                        onClick={handleCheckin}
                        disabled={checking || !code}
                        className={`py-6 rounded-[30px] font-black text-xl text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-4
                            ${checking || !code ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'}`}
                    >
                        {checking ? <RefreshCw className="animate-spin" size={20} /> : <ShieldCheck size={24} />}
                        {checking ? 'Memverifikasi...' : 'Konfirmasi'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const DoctorListView = ({ filteredDoctors, handleTakeTicket, loadingId, setView }) => (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-8 lg:p-12">
        <div className="max-w-[1700px] mx-auto min-h-full">
            <div className="mb-10 flex items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">Pilih Dokter Spesialis</h2>
                    <p className="text-lg text-slate-500 font-bold opacity-60">Pendaftaran Layanan Poliklinik Berjalan</p>
                </div>
                <button
                    onClick={() => setView('LANDING')}
                    className="p-5 bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-xl hover:scale-105 active:scale-95 transition-all text-slate-500"
                >
                    <ArrowLeft size={32} />
                </button>
            </div>

            {filteredDoctors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 text-slate-400 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[70px] border-2 border-dashed border-slate-200 dark:border-slate-800 mx-auto max-w-3xl">
                    <Calendar size={80} className="opacity-10 mb-8" />
                    <h3 className="text-4xl font-black text-slate-300">Belum Ada Jadwal</h3>
                    <p className="text-xl font-bold mt-4">Maaf, saat ini tidak ada dokter yang membuka praktik.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 pb-32">
                    {filteredDoctors.map((doctor, idx) => {
                        const today = new Date().getDay();
                        const targetDays = today === 0 ? [0, 7] : [today];
                        const todaySchedule = doctor.schedules?.find(s => targetDays.includes(s.day));
                        const isAvailable = doctor.quota?.status === 'OPEN' && (doctor.quota?.current_count || 0) < (doctor.quota?.max_quota || 0);

                        return (
                            <motion.button
                                key={doctor.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => handleTakeTicket(doctor)}
                                disabled={!isAvailable || loadingId === doctor.id}
                                className={`
                                    group relative flex flex-col text-left p-10 rounded-[55px] border-2 transition-all duration-500 h-full
                                    ${isAvailable
                                        ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border-white dark:border-slate-800 shadow-xl hover:shadow-indigo-500/10 hover:border-blue-400 dark:hover:border-blue-500 hover:-translate-y-2'
                                        : 'opacity-50 grayscale bg-slate-100 dark:bg-slate-950 border-transparent'}
                                `}
                            >
                                {/* Photo Container */}
                                <div className={`w-20 h-20 rounded-[28px] mb-6 flex items-center justify-center text-3xl font-black shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3
                                    ${isAvailable ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}
                                `}>
                                    {doctor.name.charAt(0)}
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-3 tracking-tighter">{doctor.name}</h3>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                        {doctor.specialist}
                                    </div>

                                    <div className="mt-10 space-y-5">
                                        <div className="flex items-center gap-4 text-slate-400 font-black">
                                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl"><Clock size={20} /></div>
                                            <span className="text-sm uppercase tracking-widest">{todaySchedule ? todaySchedule.time : '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-400 font-black">
                                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl"><Activity size={20} /></div>
                                            <span className="text-sm uppercase tracking-widest">Sisa: {Math.max(0, (doctor.quota?.max_quota || 0) - (doctor.quota?.current_count || 0))}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <div>
                                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Update Antrean</div>
                                        <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                            {doctor.quota?.current_count || 0}
                                            <span className="text-base text-slate-300 dark:text-slate-700 ml-1">/{doctor.quota?.max_quota || 50}</span>
                                        </div>
                                    </div>
                                    <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110
                                        ${isAvailable ? 'bg-blue-600 text-white shadow-blue-500/20 group-hover:bg-blue-700' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                                        <ChevronRight size={24} />
                                    </div>
                                </div>

                                {loadingId === doctor.id && (
                                    <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[55px] flex items-center justify-center z-20">
                                        <RefreshCw className="animate-spin text-blue-600" size={64} />
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
);

const SuccessCheckinView = ({ setView }) => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
        <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 10 }}
            className="w-32 h-32 bg-emerald-500 text-white rounded-[40px] flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)]"
        >
            <CheckCircle2 size={64} strokeWidth={2.5} />
        </motion.div>
        <div className="text-center space-y-4 max-w-2xl">
            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Check-in Berhasil!</h1>
            <p className="text-xl text-slate-500 font-bold leading-relaxed">Data pendaftaran telah divalidasi. Silakan duduk di ruang tunggu untuk pemanggilan petugas.</p>
        </div>
        <button
            onClick={() => setView('LANDING')}
            className="px-20 py-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[40px] font-black text-3xl shadow-2xl active:scale-95 transition-all flex items-center gap-4"
        >
            Kembali ke Beranda <ArrowLeft size={32} />
        </button>
    </div>
);

// --- MAIN KIOSK COMPONENT ---

const Kiosk = () => {
    const { doctors, initialize, takeTicket, checkIn } = useQueueStore();
    const [view, setView] = useState('LANDING'); // LANDING, CHECKIN, DOCTOR_LIST, SUCCESS_CHECKIN
    const [ticket, setTicket] = useState(null);
    const [loadingId, setLoadingId] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        initialize();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [initialize]);

    const handleTakeTicket = async (doctor) => {
        if (doctor.quota?.status !== 'OPEN' || doctor.quota?.current_count >= doctor.quota?.max_quota) return;

        setLoadingId(doctor.id);
        try {
            const result = await takeTicket(doctor.id);
            if (result && result.ticket) {
                setTicket({
                    ...result.ticket,
                    doctor_name: doctor.name,
                    poli_name: doctor.poli_name || doctor.poliklinik?.name || doctor.Poli?.name || 'Poliklinik Umum'
                });
            } else {
                toast.error('Gagal mengambil tiket. Silakan coba lagi.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Terjadi kesalahan sistem.');
        } finally {
            setLoadingId(null);
        }
    };

    const filteredDoctors = doctors.filter((doctor) => {
        const today = new Date().getDay();
        const targetDays = today === 0 ? [0, 7] : [today];
        return doctor.schedules?.some(s => targetDays.includes(s.day));
    });

    return (
        <div className="h-screen flex flex-col overflow-hidden relative selection:bg-blue-200">
            <FloatingBackground />

            {/* KIosk Nav Header */}
            <div className="px-10 py-8 flex items-center justify-between relative z-50">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-[25px] border border-white dark:border-slate-800 shadow-xl">
                        <Activity className="text-blue-600" size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-widest uppercase">SIMIMED</h1>
                        <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase">SMART HEALTH KIOSK</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* SYSTEM ALERT / NOTIFICATION AREA */}
                    <div className="hidden lg:flex items-center gap-3 px-6 py-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white dark:border-slate-800 text-xs font-black text-slate-500">
                        <ShieldCheck size={16} className="text-emerald-500" /> KIOSK SECURE MODE
                    </div>

                    {/* Time Widget */}
                    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl px-6 py-3 rounded-[24px] border border-white dark:border-slate-800 shadow-xl flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-1">
                                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                            </div>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                        <Clock className="text-slate-300 dark:text-slate-600" size={24} />
                    </div>
                </div>
            </div>

            <main className="flex-1 min-h-0 flex flex-col relative z-40">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="flex-1 min-h-0 flex flex-col"
                    >
                        {view === 'LANDING' && <LandingView setView={setView} />}
                        {view === 'DOCTOR_LIST' && (
                            <DoctorListView
                                filteredDoctors={filteredDoctors}
                                handleTakeTicket={handleTakeTicket}
                                loadingId={loadingId}
                                setView={setView}
                            />
                        )}
                        {view === 'CHECKIN' && <CheckinView setView={setView} checkIn={checkIn} />}
                        {view === 'SUCCESS_CHECKIN' && <SuccessCheckinView setView={setView} />}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer Status */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <div className="flex items-center gap-6 px-8 py-3 bg-black/5 dark:bg-white/5 backdrop-blur-md rounded-full border border-black/5 dark:border-white/5 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">
                    <span>Power by Fallonava AI</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    <span>v2.0 Enterprise</span>
                </div>
            </div>

            {/* Ticket Management */}
            <AnimatePresence>
                {ticket && (
                    <TicketModal
                        ticket={ticket}
                        onClose={() => { setTicket(null); setView('LANDING'); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Kiosk;
