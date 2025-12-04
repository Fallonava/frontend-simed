import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Monitor, Volume2, Clock, History } from 'lucide-react';

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
                [counter_name]: { ticket, poli_name, timestamp: new Date() }
            }));
            setActiveCaller(counter_name);
            playNotificationSound();
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
    // If activeCaller is set, that's the main one.
    // If not, use the most recently updated one.
    // If no data, show placeholder.

    const counterList = Object.entries(counters).map(([name, data]) => ({ name, ...data }));
    // Sort by timestamp desc
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
        mainCounter = { name: 'Menunggu...', ticket: { queue_code: '-' }, poli_name: 'Silakan Tunggu' };
    }

    // Ensure we fill sidebar with something if empty (optional, or just leave empty)
    // Let's limit sidebar to 3 items
    const displaySideCounters = sideCounters.slice(0, 3);

    return (
        <div className="min-h-screen bg-[#F5F5F7] text-gray-900 p-6 flex flex-col font-sans overflow-hidden relative">
            {/* Background Mesh Gradient */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-200/40 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <audio ref={audioRef} src="/notification.mp3" />

            {/* Header */}
            <header className="flex justify-between items-center mb-6 bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/50 h-24">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Monitor className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-800">Antrian Poliklinik</h1>
                        <p className="text-base text-gray-500 font-medium">Rumah Sakit Sehat Sejahtera</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-bold text-gray-800 flex items-center gap-4 justify-end tracking-tight">
                        <Clock className="w-8 h-8 text-blue-500" />
                        {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </header>

            {/* Main Layout: Split 2/3 and 1/3 */}
            <div className="flex-1 grid grid-cols-12 gap-8 h-[calc(100vh-140px)]">

                {/* Main Active Container (Cols 8) */}
                <div className="col-span-8 relative">
                    <div className={`
                        h-full rounded-[3rem] p-12 flex flex-col justify-between overflow-hidden transition-all duration-700 ease-out relative
                        bg-white/80 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(59,130,246,0.3)] border-2 border-blue-200/50
                    `}>
                        {/* Status Badge */}
                        <div className="flex justify-between items-start">
                            <div className="bg-blue-50 text-blue-600 px-8 py-3 rounded-full text-2xl font-bold tracking-wide">
                                {mainCounter.name}
                            </div>
                            <div className="flex items-center gap-3 bg-red-500 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg shadow-red-500/30 animate-pulse">
                                <Volume2 className="w-6 h-6" />
                                MEMANGGIL
                            </div>
                        </div>

                        {/* Huge Ticket Number */}
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="text-3xl font-medium text-blue-500 mb-4 uppercase tracking-widest">Nomor Antrian</div>
                            <div className="text-[14rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-700 drop-shadow-sm scale-110">
                                {mainCounter.ticket.queue_code}
                            </div>
                        </div>

                        {/* Poli Name */}
                        <div className="text-center bg-blue-50/80 backdrop-blur-sm py-8 rounded-3xl">
                            <h2 className="text-5xl font-bold text-blue-800">{mainCounter.poli_name}</h2>
                        </div>
                    </div>
                </div>

                {/* Sidebar (Cols 4) */}
                <div className="col-span-4 flex flex-col gap-6">
                    <div className="flex items-center gap-3 text-gray-500 font-medium px-2">
                        <History className="w-5 h-5" />
                        <span>Antrian Sebelumnya</span>
                    </div>

                    {displaySideCounters.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400 italic bg-white/30 rounded-3xl border border-white/40">
                            Belum ada antrian lain
                        </div>
                    ) : (
                        displaySideCounters.map((counter, idx) => (
                            <div key={idx} className="flex-1 bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-sm flex flex-col justify-center relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gray-200 group-hover:bg-blue-400 transition-colors"></div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-lg font-bold text-gray-500">{counter.name}</span>
                                    <span className="text-sm text-gray-400">{counter.poli_name}</span>
                                </div>
                                <div className="text-6xl font-black text-gray-700 tracking-tighter">
                                    {counter.ticket.queue_code}
                                </div>
                            </div>
                        ))
                    )}

                    {/* Running Text in Sidebar Bottom */}
                    <div className="mt-auto bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-4 overflow-hidden shadow-sm">
                        <div className="animate-marquee whitespace-nowrap text-gray-600 text-lg font-medium">
                            Budayakan antri untuk kenyamanan bersama. Terima kasih.
                        </div>
                    </div>
                </div>
            </div>

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
        </div>
    );
};

export default Counter;
