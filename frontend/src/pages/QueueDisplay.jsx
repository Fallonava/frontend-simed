import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2, Clock, MapPin, User, Activity } from 'lucide-react';
import ModernHeader from '../components/ModernHeader'; // We might hide this for TV mode, but keeping imports standard
import PageWrapper from '../components/PageWrapper';

const QueueDisplay = () => {
    const [currentCall, setCurrentCall] = useState(null);
    const [queueList, setQueueList] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Mock Data & Simulation
    useEffect(() => {
        // Clock
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        // Initial Data
        setQueueList([
            { id: 1, no: 'A-002', poli: 'Poli Umum', doctor: 'Dr. Sarah Johnson', status: 'WAITING' },
            { id: 2, no: 'B-005', poli: 'Poli Gigi', doctor: 'Dr. Budi Santoso', status: 'WAITING' },
            { id: 3, no: 'A-003', poli: 'Poli Umum', doctor: 'Dr. Sarah Johnson', status: 'WAITING' },
            { id: 4, no: 'C-001', poli: 'Poli Anak', doctor: 'Dr. Emily Chen', status: 'WAITING' },
        ]);

        setCurrentCall({ no: 'A-001', poli: 'Poli Umum', doctor: 'Dr. Sarah Johnson', room: 'Ruang 1' });

        return () => clearInterval(timer);
    }, []);

    // Speech Synthesis
    useEffect(() => {
        if (currentCall) {
            const text = `Nomor Antrean, ${currentCall.no}, Silakan menuju ${currentCall.poli}, ${currentCall.room}`;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'id-ID';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    }, [currentCall]);

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden font-sans selection:bg-teal-500 selection:text-white">
            {/* Top Bar */}
            <header className="fixed top-0 w-full h-24 bg-gray-900/50 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-8 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                        <Activity className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">FALLONAVA <span className="text-teal-400">HOSPITAL</span></h1>
                        <p className="text-gray-400 text-sm font-medium tracking-widest uppercase">Queuing System v2.0</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-black font-mono tracking-wider">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-gray-400 text-sm font-medium uppercase tracking-widest">
                        {currentTime.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </div>
            </header>

            {/* Main Content Grid */}
            <main className="pt-24 h-screen grid grid-cols-12 gap-8 p-8">

                {/* Left: Active Call (Big) */}
                <div className="col-span-7 flex flex-col gap-6">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={currentCall?.no} // Re-animate on change
                        className="flex-1 bg-gradient-to-br from-blue-900/40 to-black rounded-[3rem] border border-blue-500/30 relative overflow-hidden flex flex-col items-center justify-center text-center p-12 shadow-2xl shadow-blue-900/20"
                    >
                        {/* Background Glows */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-500/10 blur-[100px] rounded-full"></div>

                        <div className="relative z-10">
                            <span className="inline-block px-6 py-2 rounded-full bg-blue-500/20 text-blue-300 font-bold tracking-widest uppercase mb-8 border border-blue-500/20 animate-pulse">
                                Currently Calling
                            </span>

                            <h2 className="text-[12rem] leading-none font-black text-white drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                                {currentCall?.no}
                            </h2>

                            <div className="mt-12 space-y-4">
                                <h3 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-blue-200">
                                    {currentCall?.poli}
                                </h3>
                                <div className="flex items-center justify-center gap-4 text-2xl text-gray-300">
                                    <span className="flex items-center gap-2"><User size={24} className="text-teal-400" /> {currentCall?.doctor}</span>
                                    <span className="w-2 h-2 rounded-full bg-gray-600"></span>
                                    <span className="flex items-center gap-2"><MapPin size={24} className="text-teal-400" /> {currentCall?.room}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Video / Media Placeholder */}
                    <div className="h-48 bg-gray-900/50 rounded-[2rem] border border-white/5 flex items-center justify-center relative overflow-hidden group">
                        <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070" className="absolute inset-0 w-full h-full object-cover opacity-30" alt="Hospital Ambience" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                        <div className="relative z-10 flex items-center gap-4">
                            <button className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110">
                                <Play size={32} className="ml-1 text-white" />
                            </button>
                            <div>
                                <h4 className="font-bold text-lg">Hospital Safety Protocols</h4>
                                <p className="text-gray-400 text-sm">Now Playing • 02:35 Remaining</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Queue List */}
                <div className="col-span-5 bg-gray-900/30 backdrop-blur-sm rounded-[3rem] border border-white/10 p-8 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-3">
                        <Clock size={24} /> Up Next
                    </h3>

                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence>
                            {queueList.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="text-4xl font-black text-gray-200 font-mono">
                                            {item.no}
                                        </div>
                                        <div>
                                            <div className="font-bold text-xl text-teal-400">{item.poli}</div>
                                            <div className="text-gray-400 text-sm">{item.doctor}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-gray-300">
                                            WAITING
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default QueueDisplay;
