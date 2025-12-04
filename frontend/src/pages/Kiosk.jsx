import React, { useEffect, useState } from 'react';
import useQueueStore from '../store/useQueueStore';
import TicketModal from '../components/TicketModal';
import { Clock, ChevronRight, Activity, Calendar, Stethoscope } from 'lucide-react';

const Kiosk = () => {
    const { doctors, initialize, takeTicket } = useQueueStore();
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
            setTicket({
                ...result.ticket,
                doctor_name: doctor.name,
                poli_name: doctor.poli_name
            });
        } catch (error) {
            alert('Gagal mengambil antrian. Silakan coba lagi.');
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F2F7] font-sans text-[#1D1D1F] selection:bg-blue-500/20">
            {/* Top Status Bar */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-black/5 sticky top-0 z-50">
                <div className="max-w-[1920px] mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Activity className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Sistem Antrian RS</h1>
                            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Pelayanan Prima</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3 bg-gray-100/50 px-4 py-2 rounded-full border border-black/5">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-semibold text-gray-600">
                                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold tabular-nums tracking-tight leading-none">
                                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-[1920px] mx-auto p-8 lg:p-12">
                <div className="mb-10">
                    <h2 className="text-4xl font-bold tracking-tight mb-2">Pilih Dokter Spesialis</h2>
                    <p className="text-xl text-gray-500">Silakan pilih dokter yang tersedia untuk mengambil nomor antrian.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {doctors.map((doctor) => {
                        const isAvailable = doctor.quota?.status === 'OPEN' && doctor.quota?.current_count < doctor.quota?.max_quota;
                        const isFull = doctor.quota?.current_count >= doctor.quota?.max_quota;
                        const status = doctor.quota?.status || 'CLOSED';

                        return (
                            <button
                                key={doctor.id}
                                onClick={() => handleTakeTicket(doctor)}
                                disabled={!isAvailable || loadingId === doctor.id}
                                className={`
                  group relative flex flex-col h-[400px] rounded-[2.5rem] p-8 text-left transition-all duration-500
                  ${isAvailable
                                        ? 'bg-white shadow-sm hover:shadow-2xl hover:scale-[1.02] ring-1 ring-black/5'
                                        : 'bg-[#E5E5EA]/50 cursor-not-allowed grayscale-[0.8] opacity-80'}
                `}
                            >
                                {/* Status Badge */}
                                <div className="absolute top-8 right-8 z-10">
                                    <div className={`
                        px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md border
                        ${status === 'OPEN' ? 'bg-green-100/80 text-green-700 border-green-200' :
                                            status === 'FULL' ? 'bg-orange-100/80 text-orange-700 border-orange-200' :
                                                'bg-red-100/80 text-red-700 border-red-200'}
                    `}>
                                        {status === 'OPEN' ? 'TERSEDIA' : status === 'FULL' ? 'PENUH' : 'TUTUP'}
                                    </div>
                                </div>

                                {/* Doctor Image & Info */}
                                <div className="flex-1 flex flex-col items-center text-center pt-4">
                                    <div className="relative mb-6">
                                        <div className="w-32 h-32 rounded-full bg-gray-100 p-1 shadow-inner shrink-0">
                                            {doctor.photo_url ? (
                                                <img src={doctor.photo_url} alt={doctor.name} className="w-full h-full rounded-full object-cover aspect-square" />
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center aspect-square">
                                                    <Stethoscope className="w-12 h-12 text-blue-300" />
                                                </div>
                                            )}
                                        </div>
                                        {isAvailable && (
                                            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                                        )}
                                    </div>

                                    <h3 className="text-2xl font-bold text-[#1D1D1F] mb-2 leading-tight px-4">{doctor.name}</h3>
                                    <p className="text-blue-600 font-semibold text-lg bg-blue-50 px-4 py-1 rounded-full">{doctor.specialist}</p>
                                </div>

                                {/* Bottom Info */}
                                <div className="mt-auto pt-6 border-t border-gray-100 w-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Poli</span>
                                            <span className="font-semibold text-gray-700">{doctor.poli_name}</span>
                                        </div>
                                        <div className="text-right flex flex-col">
                                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Antrian</span>
                                            <span className="font-bold text-2xl tabular-nums text-[#1D1D1F]">
                                                {doctor.quota?.current_count || 0}
                                                <span className="text-sm text-gray-400 font-medium">/{doctor.quota?.max_quota}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {isAvailable ? (
                                        <div className="w-full bg-[#0071E3] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 group-hover:bg-[#0077ED] transition-colors shadow-lg shadow-blue-500/30">
                                            <span>Ambil Antrian</span>
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    ) : (
                                        <div className="w-full bg-gray-200 text-gray-400 py-4 rounded-2xl font-semibold flex items-center justify-center cursor-not-allowed">
                                            <span>Tidak Tersedia</span>
                                        </div>
                                    )}
                                </div>
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
