import React, { useEffect, useState } from 'react';
import useQueueStore from '../store/useQueueStore';
import TicketModal from '../components/TicketModal';
import { UserPlus, Clock, ChevronRight } from 'lucide-react';

const Kiosk = () => {
    const { doctors, initialize, takeTicket } = useQueueStore();
    const [ticket, setTicket] = useState(null);
    const [loadingId, setLoadingId] = useState(null);

    useEffect(() => {
        initialize();
    }, [initialize]);

    const handleTakeTicket = async (doctor) => {
        if (doctor.quota?.status !== 'OPEN' || doctor.quota?.current_count >= doctor.quota?.max_quota) return;

        setLoadingId(doctor.id);
        try {
            const result = await takeTicket(doctor.id);
            setTicket({
                ...result.ticket,
                doctor_name: doctor.name,
                poli_name: doctor.poli_name
            });
        } catch (error) {
            alert('Failed to take ticket. Please try again.');
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F2F7] flex flex-col font-sans selection:bg-blue-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1D1D1F] tracking-tight">Registration Kiosk</h1>
                        <p className="text-gray-500 text-lg">Tap a doctor to get your queue number</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-semibold text-[#1D1D1F]">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-gray-500 font-medium">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.map((doctor) => {
                        const isAvailable = doctor.quota?.status === 'OPEN' && doctor.quota?.current_count < doctor.quota?.max_quota;
                        const isFull = doctor.quota?.current_count >= doctor.quota?.max_quota;

                        return (
                            <button
                                key={doctor.id}
                                onClick={() => handleTakeTicket(doctor)}
                                disabled={!isAvailable || loadingId === doctor.id}
                                className={`
                  relative overflow-hidden rounded-[2rem] p-8 text-left transition-all duration-500 group
                  ${isAvailable
                                        ? 'bg-white shadow-sm hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98]'
                                        : 'bg-[#E5E5EA] opacity-60 cursor-not-allowed grayscale'}
                `}
                            >
                                {/* Status Indicator */}
                                <div className="absolute top-6 right-6">
                                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm
                        ${isAvailable ? 'bg-[#E8F8F0] text-[#00875A]' : 'bg-gray-200 text-gray-500'}
                    `}>
                                        {isFull ? 'FULL' : doctor.quota?.status || 'CLOSED'}
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <div className="w-20 h-20 rounded-2xl bg-gray-100 mb-6 overflow-hidden shadow-inner">
                                        {/* Placeholder for image */}
                                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-200">
                                            <span className="text-2xl font-bold">{doctor.name.charAt(0)}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#1D1D1F] mb-2 leading-tight">{doctor.name}</h3>
                                    <p className="text-[#0071E3] font-semibold text-lg">{doctor.specialist}</p>
                                </div>

                                <div className="flex items-end justify-between pt-6 border-t border-gray-100">
                                    <div className="text-gray-500">
                                        <p className="font-medium text-[#1D1D1F]">{doctor.poli_name}</p>
                                        <div className="flex items-center gap-1.5 mt-1 text-sm">
                                            <Clock className="w-4 h-4" />
                                            <span>08:00 - 16:00</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Current Queue</p>
                                        <p className="text-4xl font-bold text-[#1D1D1F] tracking-tight">
                                            {doctor.quota?.current_count || 0}
                                        </p>
                                    </div>
                                </div>

                                {/* Hover Action */}
                                {isAvailable && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-[#0071E3] p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2 text-white font-semibold">
                                        <span>Get Ticket</span>
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </main>

            {ticket && <TicketModal ticket={ticket} onClose={() => setTicket(null)} />}
        </div>
    );
};

export default Kiosk;
