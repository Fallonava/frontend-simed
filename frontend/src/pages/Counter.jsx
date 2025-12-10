import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Monitor, Volume2, Clock, History, Tv, Minimize } from 'lucide-react';
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
    const [runningText, setRunningText] = useState('Budayakan antri untuk kenyamanan bersama. Terima kasih telah menunggu.');

    // Layout State
    const [showVideo, setShowVideo] = useState(true);

    const socketRef = useRef(null);
    const audioRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        // Fetch initial state & playlist
        const fetchInitialData = async () => {
            try {
                const [countersRes, playlistRes, settingsRes] = await Promise.all([
                    axios.get(`${API_URL}/counters`),
                    axios.get(`${API_URL}/playlist`),
                    axios.get(`${API_URL}/settings`)
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

                // Process Settings
                if (settingsRes.data && settingsRes.data.running_text) {
                    setRunningText(settingsRes.data.running_text);
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

        socketRef.current.on('setting_update', (data) => {
            if (data.key === 'running_text') {
                setRunningText(data.value);
            }
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
        if (playlist.length > 0 && showVideo) {
            const currentItem = playlist[currentMediaIndex];
            if (currentItem.type === 'IMAGE') {
                const duration = (currentItem.duration || 10) * 1000;
                const timer = setTimeout(handleMediaEnded, duration);
                return () => clearTimeout(timer);
            }
        }
    }, [currentMediaIndex, playlist, showVideo]);


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
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 transition-all duration-500 ease-in-out">

                {/* LEFT: Multimedia Player (30%) */}
                {showVideo && (
                    <div className="lg:col-span-4 bg-black relative flex items-center justify-center overflow-hidden border-r border-white/10 animate-in slide-in-from-left duration-500">
                        {playlist.length > 0 && currentMedia ? (
                            currentMedia.type === 'VIDEO' ? (
                                <div className="w-full h-full pointer-events-none">
                                    <ReactPlayer
                                        ref={playerRef}
                                        url={currentMedia.url.startsWith('http') || currentMedia.url.startsWith('/uploads')
                                            ? currentMedia.url
                                            : `https://www.youtube.com/watch?v=${currentMedia.url}`}
                                        playing={isPlaying && showVideo}
                                        volume={volume}
                                        muted={false} /* Try unmuted, but browsers might block autoplay */
                                        width="100%"
                                        height="100%"
                                        onEnded={handleMediaEnded}
                                        onError={(e) => console.error("ReactPlayer Error:", e)}
                                        config={{
                                            youtube: {
                                                playerVars: { showinfo: 0, controls: 0, modestbranding: 1, autoplay: 1 }
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
                                <Monitor size={48} className="mb-2" />
                                <p className="text-sm">No Content</p>
                            </div>
                        )}

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
                    </div>
                )}

                {/* RIGHT: Queue Info (70% or 100%) */}
                <div className={`${showVideo ? 'lg:col-span-8' : 'lg:col-span-12'} bg-modern-bg flex flex-col p-6 relative transition-all duration-500`}>
                    {/* Header */}
                    <header className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-modern-text">Antrian RS</h1>
                                <p className="text-xs text-modern-text-secondary">Sehat Sejahtera</p>
                            </div>

                            {/* Toggle Video Button */}
                            <button
                                onClick={() => setShowVideo(!showVideo)}
                                className="p-2 bg-modern-card rounded-full hover:bg-white/10 transition-colors text-modern-text-secondary hover:text-white"
                                title={showVideo ? "Hide Video" : "Show Video"}
                            >
                                {showVideo ? <Minimize size={18} /> : <Tv size={18} />}
                            </button>
                        </div>

                        <div className="text-right">
                            <div className="text-2xl font-bold text-modern-text flex items-center gap-2 justify-end">
                                <Clock className="w-6 h-6 text-modern-blue" />
                                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </header>

                    {/* MAIN BIG NUMBER */}
                    <div className="flex-1 flex flex-col mb-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={mainCounter.name + mainCounter.ticket.queue_code}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="flex-1 bg-modern-card rounded-[2rem] shadow-2xl border border-white/10 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-modern-blue to-modern-purple"></div>

                                <span className="text-modern-text-secondary uppercase tracking-[0.3em] text-sm font-bold mb-4">Sedang Dipanggil</span>
                                <div className="text-[10rem] leading-none font-black text-modern-text mb-6 tracking-tighter">
                                    {mainCounter.ticket.queue_code}
                                </div>
                                <div className="bg-modern-blue/10 text-modern-blue px-8 py-3 rounded-full font-bold text-3xl mb-3">
                                    {mainCounter.poli_name}
                                </div>
                                <div className="bg-modern-blue/20 text-modern-blue border border-modern-blue/30 px-8 py-3 rounded-2xl text-4xl font-black tracking-widest uppercase shadow-lg mt-4 transform scale-100 hover:scale-105 transition-transform duration-300">
                                    {String(mainCounter.name).toUpperCase().includes('LOKET') ? mainCounter.name : `LOKET ${mainCounter.name}`}
                                </div>

                                {mainCounter.status === 'BUSY' && (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="mt-8 flex items-center gap-3 text-red-500 font-bold bg-red-500/10 px-6 py-3 rounded-full animate-pulse text-lg"
                                    >
                                        <Volume2 size={24} /> Memanggil...
                                    </motion.div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* SIDE LIST */}
                    <div className="h-48 flex flex-col overflow-hidden">
                        <div className="flex items-center gap-2 text-modern-text-secondary mb-3 px-2">
                            <History size={16} />
                            <span className="text-sm font-bold uppercase tracking-wider">Antrian Berikutnya</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar">
                            {sideCounters.slice(0, 4).map((counter) => (
                                <div key={counter.name} className="group relative overflow-hidden bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 flex items-center justify-between hover:bg-white/10 transition-all duration-300 shadow-xl">
                                    {/* Decorative Gradient */}
                                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-modern-blue/20 to-modern-purple/20 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500"></div>

                                    <div className="flex flex-col z-10 gap-2">
                                        <div className="bg-modern-blue/20 text-modern-blue border border-modern-blue/30 px-4 py-2 rounded-xl text-sm font-black tracking-widest uppercase shadow-md w-fit">
                                            {String(counter.name).toUpperCase().includes('LOKET') ? counter.name : `LOKET ${counter.name}`}
                                        </div>
                                        <div className="text-xs font-medium text-modern-text-secondary line-clamp-1 max-w-[120px]">
                                            {counter.poli_name}
                                        </div>
                                    </div>

                                    <div className="text-5xl font-black text-modern-text tracking-tighter z-10 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                                        {counter.ticket.queue_code}
                                    </div>
                                </div>
                            ))}
                            {sideCounters.length === 0 && (
                                <div className="col-span-2 text-center text-modern-text-secondary text-base italic py-8 border border-dashed border-white/10 rounded-2xl bg-white/5">
                                    Belum ada antrian lain
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer / Running Text */}
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="whitespace-nowrap overflow-hidden text-modern-text-secondary text-sm font-medium">
                            <div className="animate-marquee inline-block">
                                {runningText}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .animate-marquee {
                    animation: marquee 30s linear infinite;
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
