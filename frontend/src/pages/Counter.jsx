import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Monitor, Volume2, Clock, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

const Counter = () => {
    const [counters, setCounters] = useState({});
    const [activeCaller, setActiveCaller] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Playlist State
    const [playlist, setPlaylist] = useState([]);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [volume, setVolume] = useState(0.8);

    const socketRef = useRef(null);
    const audioRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        // Fetch initial state & playlist
        const fetchInitialData = async () => {
            try {
                const [countersRes, playlistRes] = await Promise.all([
                    axios.get(`${API_URL}/counters`),
                    axios.get(`${API_URL}/playlist`)
                ]);

                // Process Counters
                const initialData = {};
                countersRes.data.forEach(c => {
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

                // Process Playlist
                if (playlistRes.data.length > 0) {
                    setPlaylist(playlistRes.data);
                }
            } catch (error) {
                console.error('Failed to fetch initial data', error);
            }
        };
        fetchInitialData();

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

            // Ducking Logic
            setVolume(0.1); // Lower volume when calling
            setTimeout(() => setVolume(0.8), 5000); // Restore after 5s
        });

        socketRef.current.on('active_counters_update', (activeList) => {
            setCounters(prev => {
                const newCounters = { ...prev };
                activeList.forEach(c => {
                    if (!newCounters[c.name]) {
                        newCounters[c.name] = {
                            ticket: { queue_code: '-' },
                            poli_name: 'Menunggu...',
                            timestamp: new Date(0),
                            status: 'ONLINE'
                        };
                    }
                });
                return newCounters;
            });
        });

        socketRef.current.on('playlist_update', async () => {
            try {
                const res = await axios.get(`${API_URL}/playlist`);
                setPlaylist(res.data);
                setCurrentMediaIndex(0);
            } catch (e) { console.error(e); }
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

    // Playlist Logic
    const handleMediaEnded = () => {
        if (playlist.length > 0) {
            setCurrentMediaIndex((prev) => (prev + 1) % playlist.length);
        }
    };

    // Check if current media is image to simulate duration
    useEffect(() => {
        if (playlist.length > 0) {
            const currentItem = playlist[currentMediaIndex];
            if (currentItem.type === 'IMAGE') {
                const duration = (currentItem.duration || 10) * 1000;
                const timer = setTimeout(handleMediaEnded, duration);
                return () => clearTimeout(timer);
            }
        }
    }, [currentMediaIndex, playlist]);


    // Determine Main and Side counters
    const counterList = Object.entries(counters).map(([name, data]) => ({ name, ...data }));
    counterList.sort((a, b) => b.timestamp - a.timestamp);

    let mainCounter = null;
    let sideCounters = [];

    if (activeCaller && counters[activeCaller]) {
        mainCounter = { name: activeCaller, ...counters[activeCaller] };
        sideCounters = counterList.filter(c => c.name !== activeCaller);
    } else if (counterList.length > 0) {
        mainCounter = counterList[0];
        sideCounters = counterList.slice(1);
    } else {
        mainCounter = {
            name: 'Menunggu...',
            ticket: { queue_code: '-' },
            poli_name: 'Silakan Tunggu',
            status: 'IDLE'
        };
    }

    const currentMedia = playlist[currentMediaIndex];

    return (
        <div className="min-h-screen bg-modern-bg text-modern-text flex flex-col font-sans overflow-hidden relative">
            <audio ref={audioRef} src="/notification.mp3" />

            {/* Layout Grid */}
            <div className="flex-1 grid grid-cols-12 gap-0">

                {/* LEFT: Multimedia Player (Cols 8) */}
                <div className="col-span-8 bg-black relative flex items-center justify-center overflow-hidden">
                    {playlist.length > 0 && currentMedia ? (
                        currentMedia.type === 'VIDEO' ? (
                            <div className="w-full h-full pointer-events-none">
                                <ReactPlayer
                                    ref={playerRef}
                                    url={`https://www.youtube.com/watch?v=${currentMedia.url}`}
                                    playing={isPlaying}
                                    volume={volume}
                                    muted={volume === 0}
                                    width="100%"
                                    height="100%"
                                    onEnded={handleMediaEnded}
                                    config={{
                                        youtube: {
                                            playerVars: { showinfo: 0, controls: 0, modestbranding: 1 }
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <motion.img
                                key={currentMedia.url}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                src={currentMedia.url}
                                alt="Slide"
                                className="w-full h-full object-cover"
                            />
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center text-white/20">
                            <Monitor size={64} className="mb-4" />
                            <p className="text-xl">Waiting for content...</p>
                        </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-modern-bg/90 pointer-events-none"></div>
                </div>

                {/* RIGHT: Queue Info (Cols 4) */}
                <div className="col-span-4 bg-modern-bg flex flex-col p-6 border-l border-white/5 relative">
                    {/* Header */}
                    <header className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-modern-text">Antrian RS</h1>
                            <p className="text-sm text-modern-text-secondary">Sehat Sejahtera</p>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold text-modern-text flex items-center gap-2 justify-end">
                                <Clock className="w-5 h-5 text-modern-blue" />
                                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </header>

                    {/* MAIN BIG NUMBER */}
                    <div className="flex-1 flex flex-col mb-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={mainCounter.name + mainCounter.ticket.queue_code}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="flex-1 bg-modern-card rounded-[2.5rem] shadow-2xl border border-white/10 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-modern-blue to-modern-purple"></div>

                                <span className="text-modern-text-secondary uppercase tracking-[0.2em] text-sm font-bold mb-2">Sedang Dipanggil</span>
                                <div className="text-8xl font-black text-modern-text mb-4 tracking-tighter">
                                    {mainCounter.ticket.queue_code}
                                </div>
                                <div className="bg-modern-blue/10 text-modern-blue px-6 py-2 rounded-full font-bold text-xl mb-2">
                                    {mainCounter.poli_name}
                                </div>
                                <div className="text-modern-text-secondary font-medium text-lg">
                                    {mainCounter.name}
                                </div>

                                {mainCounter.status === 'BUSY' && (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="mt-6 flex items-center gap-2 text-red-500 font-bold bg-red-500/10 px-4 py-2 rounded-full animate-pulse"
                                    >
                                        <Volume2 size={20} /> Memanggil...
                                    </motion.div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* SIDE LIST */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex items-center gap-2 text-modern-text-secondary mb-4 px-2">
                            <History size={16} />
                            <span className="text-sm font-bold uppercase tracking-wider">Antrian Berikutnya</span>
                        </div>

                        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                            {sideCounters.slice(0, 3).map((counter) => (
                                <div key={counter.name} className="bg-modern-card/50 p-4 rounded-2xl flex justify-between items-center border border-white/5">
                                    <div>
                                        <div className="text-xs text-modern-text-secondary font-medium mb-1">{counter.poli_name}</div>
                                        <div className="text-sm font-bold text-modern-text">{counter.name}</div>
                                    </div>
                                    <div className="text-3xl font-black text-modern-text-secondary">{counter.ticket.queue_code}</div>
                                </div>
                            ))}
                            {sideCounters.length === 0 && (
                                <div className="text-center text-modern-text-secondary text-sm italic py-4">Belum ada antrian lain</div>
                            )}
                        </div>
                    </div>

                    {/* Footer / Running Text */}
                    <div className="mt-6 pt-4 border-t border-white/5">
                        <div className="whitespace-nowrap overflow-hidden text-modern-text-secondary text-sm">
                            <div className="animate-marquee inline-block">
                                Budayakan antri untuk kenyamanan bersama. Terima kasih telah menunggu. • Jagalah kebersihan area rumah sakit.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                }
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
};

export default Counter;
