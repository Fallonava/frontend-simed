import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Monitor, Volume2, Clock, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:3000/api';
const SOCKET_URL = 'http://localhost:3000';

const Counter = () => {
    const [counters, setCounters] = useState({});
    const [activeCaller, setActiveCaller] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    const socketRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        // Fetch initial state
        const fetchInitialCounters = async () => {
            try {
                const res = await axios.get(`${API_URL}/counters`);
                const initialData = {};
                res.data.forEach(c => {
                    if (c.status === 'OPEN' || c.status === 'BUSY') {
                        initialData[c.name] = {
                            ticket: { queue_code: '-' },
                            poli_name: 'Menunggu...',
                            timestamp: new Date(0),
                            status: c.status
                        };
                    }
                });
                setCounters(prev => ({ ...initialData, ...prev }));
            } catch (error) {
                console.error('Failed to fetch counters', error);
            }
        };
        fetchInitialCounters();

        socketRef.current = io(SOCKET_URL);

        socketRef.current.on('connect', () => {
            setIsConnected(true);
        });

        socketRef.current.on('disconnect', () => {
            setIsConnected(false);
        });

        socketRef.current.on('call_patient', (data) => {
            const { ticket, counter_name, poli_name } = data;
            setCounters(prev => ({
                ...prev,
                [counter_name]: { ticket, poli_name, timestamp: new Date(), status: 'BUSY' }
            }));
            setActiveCaller(counter_name);
            playNotificationSound();
        });

        socketRef.current.on('active_counters_update', (activeList) => {
            setCounters(prev => {
                const newCounters = { ...prev };

                // Add new active counters if not exist
                activeList.forEach(c => {
                    if (!newCounters[c.name]) {
                        newCounters[c.name] = {
                            ticket: { queue_code: '-' },
                            poli_name: 'Menunggu...',
                            timestamp: new Date(0), // Old timestamp so it goes to bottom
                            status: 'ONLINE'
                        };
                    }
                });

                return newCounters;
            });
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            clearInterval(timer);
        };
    }, []);

    const playNotificationSound = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log("Audio play failed", e));
        }
    };

    // Determine Main and Side counters
    const counterList = Object.entries(counters).map(([name, data]) => ({ name, ...data }));
    // Sort by timestamp desc
    counterList.sort((a, b) => b.timestamp - a.timestamp);

    let mainCounter = null;
    let sideCounters = [];

    // Prioritize activeCaller if valid data exists
    if (activeCaller && counters[activeCaller]) {
        mainCounter = { name: activeCaller, ...counters[activeCaller] };
        sideCounters = counterList.filter(c => c.name !== activeCaller);
    } else if (counterList.length > 0) {
        // Fallback to most recent
        mainCounter = counterList[0];
        sideCounters = counterList.slice(1);
    } else {
        // Default placeholder
        mainCounter = {
            name: 'Menunggu...',
            ticket: { queue_code: '-' },
            poli_name: 'Silakan Tunggu',
            status: 'IDLE'
        };
    }

    // Ensure we fill sidebar with something if empty (optional, or just leave empty)
    // Let's limit sidebar to 3 items
    const displaySideCounters = sideCounters.slice(0, 3);

    return (
        <div className="min-h-screen bg-modern-bg text-modern-text p-6 flex flex-col font-sans overflow-hidden relative">
            {/* Background Mesh Gradient - Animated */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-modern-blue/20 rounded-full blur-[120px]"
                ></motion.div>
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -90, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
                    className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-modern-purple/20 rounded-full blur-[120px]"
                ></motion.div>
            </div>

            <audio ref={audioRef} src="/notification.mp3" />

            {/* Header */}
            <header className="flex justify-between items-center mb-6 bg-modern-card/60 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/10 h-24 z-10">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-modern-blue to-modern-purple rounded-2xl flex items-center justify-center shadow-lg shadow-modern-blue/20">
                        <Monitor className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-modern-text">Antrian Poliklinik</h1>
                        <p className="text-base text-modern-text-secondary font-medium">Rumah Sakit Sehat Sejahtera</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-bold text-modern-text flex items-center gap-4 justify-end tracking-tight">
                        <Clock className="w-8 h-8 text-modern-blue" />
                        {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </header>

            {/* Main Layout: Split 2/3 and 1/3 */}
            <div className="flex-1 grid grid-cols-12 gap-8 h-[calc(100vh-140px)] z-10">

                {/* Main Active Container (Cols 8) */}
                <div className="col-span-8 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mainCounter.name + mainCounter.ticket.queue_code}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={`
                                h-full rounded-[3rem] p-12 flex flex-col justify-between overflow-hidden relative
                                bg-modern-card/80 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(41,121,255,0.2)] border-2 border-modern-blue/30
                            `}
                        >
                            {/* Status Badge */}
                            <div className="flex justify-between items-start">
                                <div className="bg-modern-blue/10 text-modern-blue px-8 py-3 rounded-full text-2xl font-bold tracking-wide border border-modern-blue/20">
                                    {mainCounter.name}
                                </div>
                                {mainCounter.status === 'BUSY' && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="flex items-center gap-3 bg-red-500 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg shadow-red-500/30"
                                    >
                                        <Volume2 className="w-6 h-6 animate-pulse" />
                                        MEMANGGIL
                                    </motion.div>
                                )}
                            </div>

                            {/* Huge Ticket Number */}
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="text-3xl font-medium text-modern-blue mb-4 uppercase tracking-widest">Nomor Antrian</div>
                                <motion.div
                                    key={mainCounter.ticket.queue_code}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1.1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="text-[14rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-modern-blue to-modern-purple drop-shadow-2xl"
                                >
                                    {mainCounter.ticket.queue_code}
                                </motion.div>
                            </div>

                            {/* Poli Name */}
                            <div className="text-center bg-modern-blue/10 backdrop-blur-sm py-8 rounded-3xl border border-modern-blue/20">
                                <h2 className="text-5xl font-bold text-modern-blue">{mainCounter.poli_name}</h2>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div >

                {/* Sidebar (Cols 4) */}
                < div className="col-span-4 flex flex-col gap-6" >
                    <div className="flex items-center gap-3 text-modern-text-secondary font-medium px-2">
                        <History className="w-5 h-5" />
                        <span>Antrian Sebelumnya</span>
                    </div>

                    <div className="flex-1 flex flex-col gap-6">
                        <AnimatePresence>
                            {displaySideCounters.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex-1 flex items-center justify-center text-modern-text-secondary italic bg-modern-card/30 rounded-3xl border border-white/5"
                                >
                                    Belum ada antrian lain
                                </motion.div>
                            ) : (
                                displaySideCounters.map((counter) => (
                                    <motion.div
                                        layout
                                        key={counter.name}
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        className="flex-1 bg-modern-card/50 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-lg flex flex-col justify-center relative overflow-hidden group"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-modern-text-secondary group-hover:bg-modern-blue transition-colors"></div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-lg font-bold text-modern-text-secondary">{counter.name}</span>
                                            <span className="text-sm text-modern-text-secondary/70">{counter.poli_name}</span>
                                        </div>
                                        <div className="text-6xl font-black text-modern-text tracking-tighter">
                                            {counter.ticket.queue_code}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Running Text in Sidebar Bottom */}
                    <div className="mt-auto bg-modern-card/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 overflow-hidden shadow-sm">
                        <div className="animate-marquee whitespace-nowrap text-modern-text-secondary text-lg font-medium">
                            Budayakan antri untuk kenyamanan bersama. Terima kasih.
                        </div>
                    </div>
                </div >
            </div >

            <style>{`
                .animate-marquee {
                    display: inline-block;
                    animation: marquee 15s linear infinite;
                }
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
            `}</style>
        </div >
    );
};

export default Counter;
