import React, { useEffect } from 'react';
import useQueueStore from '../store/useQueueStore';
import { Monitor, Volume2 } from 'lucide-react';

const Counter = () => {
    const { doctors, initialize, currentCalling } = useQueueStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    // Play sound when currentCalling changes
    useEffect(() => {
        if (currentCalling) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Simple bell sound
            audio.play().catch(e => console.log('Audio play failed', e));
        }
    }, [currentCalling]);

    return (
        <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] p-8 flex flex-col font-sans">
            <header className="flex items-center justify-between mb-12 px-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-200">
                        <Monitor className="w-6 h-6 text-[#0071E3]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Antrian Poliklinik</h1>
                        <p className="text-gray-500 font-medium">Live Display</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-600">System Active</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1800px] mx-auto w-full flex-1 content-start">
                {doctors.map((doctor) => {
                    const isCalling = currentCalling?.doctor.id === doctor.id;

                    return (
                        <div
                            key={doctor.id}
                            className={`
                    relative overflow-hidden rounded-[2.5rem] p-8 transition-all duration-500
                    ${isCalling
                                    ? 'bg-[#0071E3] text-white shadow-2xl shadow-blue-500/30 scale-105 ring-4 ring-blue-200 z-10'
                                    : 'bg-white text-[#1D1D1F] border border-gray-200 shadow-sm'}
                `}
                        >
                            {isCalling && (
                                <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                                    <Volume2 className="w-4 h-4 text-white animate-pulse" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-white">Memanggil</span>
                                </div>
                            )}

                            <div className="text-center relative z-10">
                                <h2 className={`text-3xl font-bold mb-2 tracking-tight ${isCalling ? 'text-white' : 'text-[#1D1D1F]'}`}>
                                    {doctor.poli_name}
                                </h2>
                                <p className={`text-lg font-medium mb-10 ${isCalling ? 'text-white/80' : 'text-gray-500'}`}>
                                    {doctor.name}
                                </p>

                                <div className={`
                        rounded-3xl p-8 mb-8 border shadow-inner transition-colors
                        ${isCalling
                                        ? 'bg-white/10 border-white/20'
                                        : 'bg-gray-50 border-gray-100'}
                    `}>
                                    <p className={`text-sm uppercase tracking-[0.2em] font-bold mb-4 ${isCalling ? 'text-white/60' : 'text-gray-400'}`}>
                                        Nomor Antrian
                                    </p>
                                    <div className={`text-7xl font-black tracking-tighter font-mono ${isCalling ? 'text-white' : 'text-[#1D1D1F]'}`}>
                                        {isCalling
                                            ? currentCalling.ticket.queue_code
                                            : (doctor.quota?.current_count > 0
                                                ? `${doctor.poli_name.substring(0, 3).toUpperCase()}-${String(doctor.quota?.current_count).padStart(3, '0')}` // Fallback to last issued if not calling
                                                : '---')
                                        }
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <div className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider border transition-colors duration-300
                            ${doctor.quota?.status === 'OPEN'
                                            ? (isCalling ? 'bg-white/20 text-white border-white/30' : 'bg-green-100 text-green-700 border-green-200')
                                            : 'bg-red-100 text-red-700 border-red-200'}
                         `}>
                                        {doctor.quota?.status || 'CLOSED'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Counter;
