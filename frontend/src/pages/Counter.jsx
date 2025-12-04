import React, { useEffect } from 'react';
import useQueueStore from '../store/useQueueStore';
import { Monitor, Activity } from 'lucide-react';

const Counter = () => {
    const { doctors, initialize } = useQueueStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <div className="min-h-screen bg-[#1D1D1F] text-white p-8 flex flex-col">
            <header className="flex items-center justify-between mb-12 px-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                        <Monitor className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Queue Display</h1>
                        <p className="text-white/50 font-medium">Live Updates</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-white/80">System Active</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1800px] mx-auto w-full flex-1 content-start">
                {doctors.map((doctor) => (
                    <div key={doctor.id} className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 relative overflow-hidden group">
                        {/* Status Glow */}
                        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] -mr-32 -mt-32 transition-colors duration-700 opacity-20
                ${doctor.quota?.status === 'OPEN' ? 'bg-green-500' : 'bg-red-500'}
            `}></div>

                        <div className="relative z-10 text-center">
                            <h2 className="text-3xl font-bold mb-2 tracking-tight">{doctor.poli_name}</h2>
                            <p className="text-white/60 text-lg font-medium mb-10">{doctor.name}</p>

                            <div className="bg-black/40 rounded-3xl p-8 mb-8 border border-white/5 shadow-inner">
                                <p className="text-sm text-white/40 uppercase tracking-[0.2em] font-bold mb-4">Current Number</p>
                                <div className="text-7xl font-black text-white tracking-tighter font-mono">
                                    {doctor.quota?.current_count > 0
                                        ? `${doctor.poli_name.substring(0, 3).toUpperCase()}-${String(doctor.quota?.current_count).padStart(3, '0')}`
                                        : '---'
                                    }
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <div className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider border transition-colors duration-300
                        ${doctor.quota?.status === 'OPEN'
                                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                        : 'bg-red-500/20 text-red-400 border-red-500/30'}
                     `}>
                                    {doctor.quota?.status || 'CLOSED'}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Counter;
