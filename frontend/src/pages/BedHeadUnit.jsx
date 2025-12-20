import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User, Clock, Calendar, CheckCircle, Activity, Info, LogIn } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import PageLoader from '../components/PageLoader';

const BedHeadUnit = () => {
    const { bedId } = useParams(); // URL: /bed-panel/1
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [callingNurse, setCallingNurse] = useState(false);
    const [requestingCleaning, setRequestingCleaning] = useState(false);

    // Simulate real-time clock
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        fetchData();
        // Poll for updates (e.g. nurse response)
        const poll = setInterval(fetchData, 5000);
        return () => clearInterval(poll);
    }, [bedId]);

    const fetchData = async () => {
        try {
            // In real app, might likely use a specific kiosk token
            // For demo, we assume public access or pre-authed session
            const res = await api.get(`/bed-panel/${bedId || 1}`);
            if (res.data.status === 'success') {
                setData(res.data.data);
                if (res.data.data.service_request === 'NURSE') {
                    setCallingNurse(true);
                    setRequestingCleaning(false);
                } else if (res.data.data.service_request === 'CLEANING') {
                    setRequestingCleaning(true);
                    setCallingNurse(false);
                } else {
                    setCallingNurse(false);
                    setRequestingCleaning(false);
                }
            }
        } catch (error) {
            console.error('Failed to load Bed Data');
        } finally {
            setLoading(false);
        }
    };

    const toggleNurseCall = async () => {
        const newStatus = callingNurse ? null : 'NURSE';
        setCallingNurse(!callingNurse); // Optimistic update
        if (newStatus) setRequestingCleaning(false);
        try {
            await api.post('/bed-panel/request', {
                bedId: bedId || 1, // Default to 1 if testing without params
                service: newStatus
            });
            if (newStatus) toast.success('Memanggil Perawat...');
            else toast.success('Panggilan Dibatalkan');
            fetchData();
        } catch (e) {
            toast.error('Gagal memproses panggilan');
            setCallingNurse(!newStatus); // Revert
        }
    };

    const toggleCleaning = async () => {
        const newStatus = requestingCleaning ? null : 'CLEANING';
        setRequestingCleaning(!requestingCleaning); // Optimistic
        if (newStatus) setCallingNurse(false);
        try {
            await api.post('/bed-panel/request', {
                bedId: bedId || 1,
                service: newStatus
            });
            if (newStatus) toast.success('Meminta Layanan Kebersihan...');
            else toast.success('Permintaan Dibatalkan');
            fetchData();
        } catch (e) {
            toast.error('Gagal memproses');
            setRequestingCleaning(!newStatus);
        }
    };

    if (loading) return <PageLoader />;

    if (!data || !data.current_patient) return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <BedIcon size={40} className="text-gray-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{data?.room?.name} - {data?.code}</h1>
            <p className="text-xl text-gray-400">Bed Available / Kosong</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-950 text-white font-sans overflow-hidden relative">
            {/* AMBIENT BACKGROUND */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 pointer-events-none" />

            {/* HEADER */}
            <header className="relative z-10 flex justify-between items-center p-8 border-b border-white/10 bg-white/5 backdrop-blur-lg">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <User size={40} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm uppercase tracking-widest text-blue-400 font-bold mb-1">Pasien</h2>
                        <h1 className="text-4xl font-bold tracking-tight">{data.current_patient.name}</h1>
                        <p className="text-lg text-gray-400 mt-1">{data.current_patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • {data.current_patient.no_rm}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-6xl font-thin tracking-tighter">
                        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xl text-gray-400 font-medium">
                        {time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="relative z-10 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-160px)]">
                {/* LEFT COL: INFO CARDS */}
                <div className="space-y-6 lg:col-span-1">
                    {/* ROOM CARD */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400"><LogIn size={24} /></div>
                            <div>
                                <div className="text-xs text-gray-400 uppercase font-bold">Kamar / Kelas</div>
                                <div className="text-xl font-bold">{data.room.name}</div>
                                <div className="text-sm text-indigo-300">{data.room.type}</div>
                            </div>
                        </div>
                    </div>

                    {/* DOCTOR CARD */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-green-500/20 rounded-xl text-green-400"><Activity size={24} /></div>
                            <div>
                                <div className="text-xs text-gray-400 uppercase font-bold">Dokter Penanggung Jawab</div>
                                <div className="text-xl font-bold">{data.doctor.name}</div>
                                <div className="text-sm text-green-300">Visite: {data.doctor.visit_time}</div>
                            </div>
                        </div>
                    </div>

                    {/* DIET CARD */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-400"><Info size={24} /></div>
                            <div>
                                <div className="text-xs text-gray-400 uppercase font-bold">Diet / Nutrisi</div>
                                <div className="text-xl font-bold">{data.diet}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: BIG ACTIONS */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-6 items-stretch">
                    {/* CALL NURSE BUTTON */}
                    <motion.button
                        onClick={toggleNurseCall}
                        whileTap={{ scale: 0.95 }}
                        animate={callingNurse ? {
                            boxShadow: ["0 0 0px rgba(239, 68, 68, 0)", "0 0 50px rgba(239, 68, 68, 0.5)", "0 0 0px rgba(239, 68, 68, 0)"],
                            backgroundColor: ["#7f1d1d", "#991b1b", "#7f1d1d"]
                        } : {}}
                        transition={callingNurse ? { repeat: Infinity, duration: 2 } : {}}
                        className={`col-span-1 rounded-[40px] flex flex-col items-center justify-center gap-6 transition-all duration-300 border-4
                            ${callingNurse
                                ? 'bg-red-900 border-red-500 text-white'
                                : 'bg-gradient-to-br from-red-500 to-pink-600 border-transparent shadow-2xl shadow-red-900/50 hover:scale-[1.02]'
                            }`}
                    >
                        <div className={`p-6 rounded-full ${callingNurse ? 'bg-white/10' : 'bg-white/20'}`}>
                            <Bell size={60} className={callingNurse ? 'animate-bounce' : ''} fill={callingNurse ? "currentColor" : "none"} />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold uppercase tracking-widest">{callingNurse ? 'MEMANGGIL...' : 'PERAWAT'}</h2>
                            <p className="text-white/70 mt-1 text-sm">{callingNurse ? 'Mohon Tunggu' : 'Bantuan Medis'}</p>
                        </div>
                    </motion.button>

                    {/* CALL CLEANING BUTTON */}
                    <motion.button
                        onClick={toggleCleaning}
                        whileTap={{ scale: 0.95 }}
                        animate={requestingCleaning ? {
                            boxShadow: ["0 0 0px rgba(234, 179, 8, 0)", "0 0 50px rgba(234, 179, 8, 0.5)", "0 0 0px rgba(234, 179, 8, 0)"],
                            backgroundColor: ["#713f12", "#854d0e", "#713f12"]
                        } : {}}
                        transition={requestingCleaning ? { repeat: Infinity, duration: 2 } : {}}
                        className={`col-span-1 rounded-[40px] flex flex-col items-center justify-center gap-6 transition-all duration-300 border-4
                            ${requestingCleaning
                                ? 'bg-yellow-900 border-yellow-500 text-white'
                                : 'bg-gradient-to-br from-yellow-500 to-orange-600 border-transparent shadow-2xl shadow-yellow-900/50 hover:scale-[1.02]'
                            }`}
                    >
                        <div className={`p-6 rounded-full ${requestingCleaning ? 'bg-white/10' : 'bg-white/20'}`}>
                            <Activity size={60} className={requestingCleaning ? 'animate-spin' : ''} />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold uppercase tracking-widest">{requestingCleaning ? 'DIPROSES...' : 'BERSIHKAN'}</h2>
                            <p className="text-white/70 mt-1 text-sm">{requestingCleaning ? 'Housekeeping OTW' : 'Layanan Kamar'}</p>
                        </div>
                    </motion.button>


                    {/* SCHEDULE & BILLING */}
                    <button className="bg-gray-800/50 hover:bg-gray-800 border border-white/10 rounded-[32px] p-8 flex flex-col items-center justify-center text-center gap-4 backdrop-blur-md group transition-all">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                            <Calendar size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-blue-100">Jadwal Pengobatan</h3>
                            <p className="text-gray-400">Lihat jadwal obat & tindakan</p>
                        </div>
                    </button>

                    <button className="bg-gray-800/50 hover:bg-gray-800 border border-white/10 rounded-[32px] p-8 flex flex-col items-center justify-center text-center gap-4 backdrop-blur-md group transition-all">
                        <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                            <CheckCircle size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-green-100">Estimasi Biaya</h3>
                            <p className="text-gray-400">Rp {data.billing_estimate?.toLocaleString()}</p>
                        </div>
                    </button>
                </div>
            </main>
        </div>
    );
};

// Simple Icon placeholder if needed, though we imported lucide icons
const BedIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" /></svg>
);

export default BedHeadUnit;
