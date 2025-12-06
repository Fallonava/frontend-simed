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
                poli_name: doctor.poli_name || doctor.poliklinik?.name || doctor.Poli?.name || 'Poliklinik Umum'
            });
        } catch (error) {
            alert('Gagal mengambil antrian. Silakan coba lagi.');
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="h-screen bg-[#F2F2F7] font-sans text-[#1D1D1F] selection:bg-blue-500/20 flex flex-col overflow-hidden">
            {/* Top Status Bar */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-black/5 shrink-0 z-50">
                <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-salm-gradient rounded-lg flex items-center justify-center shadow-lg shadow-salm-purple/20">
                            <Activity className="text-white w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight leading-none">Sistem Antrian RS</h1>
                            <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">Pelayanan Prima</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-gray-100/50 px-3 py-1.5 rounded-full border border-black/5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs font-semibold text-gray-600">
                                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold tabular-nums tracking-tight leading-none">
                                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-[1920px] w-full mx-auto p-6 flex flex-col min-h-0">
                <div className="mb-4 shrink-0">
                    <h2 className="text-2xl font-bold tracking-tight mb-1">Pilih Dokter Spesialis</h2>
                    <p className="text-sm text-gray-500">Silakan pilih dokter yang tersedia untuk mengambil nomor antrian.</p>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 pb-20">
                        {doctors.filter((doctor) => {
                            const today = new Date().getDay();
                            const dbDay = today === 0 ? 7 : today;
                            return doctor.schedules?.some(s => s.day === dbDay);
                        }).map((doctor) => {
                            const today = new Date().getDay();
                            const dbDay = today === 0 ? 7 : today;
                            const todaySchedule = doctor.schedules?.find(s => s.day === dbDay);

                            const isAvailable = doctor.quota?.status === 'OPEN' && doctor.quota?.current_count < doctor.quota?.max_quota;
                            const isFull = doctor.quota?.current_count >= doctor.quota?.max_quota;
                            const status = doctor.quota?.status || 'CLOSED';

                            return (
                                <button
                                    key={doctor.id}
                                    onClick={() => handleTakeTicket(doctor)}
                                    disabled={!isAvailable || loadingId === doctor.id}
                                    className={`
                                        group relative flex flex-col rounded-[1.5rem] p-4 text-left transition-all duration-300
                                        ${isAvailable
                                            ? 'bg-white shadow-sm hover:shadow-xl hover:scale-[1.02] ring-1 ring-black/5'
                                            : 'bg-[#E5E5EA]/50 cursor-not-allowed grayscale-[0.8] opacity-80'}
                                    `}
                                >
                                    {/* Status Badge */}
                                    <div className="absolute top-3 right-3 z-10 text-[10px]">
                                        <div className={`
                                            px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm backdrop-blur-md border
                                            ${status === 'OPEN' ? 'bg-green-100/80 text-green-700 border-green-200' :
                                                status === 'FULL' ? 'bg-orange-100/80 text-orange-700 border-orange-200' :
                                                    'bg-red-100/80 text-red-700 border-red-200'}
                                        `}>
                                            {status === 'OPEN' ? 'TERSEDIA' : status === 'FULL' ? 'PENUH' : 'TUTUP'}
                                        </div>
                                    </div>

                                    {/* Doctor Info */}
                                    <div className="flex-1 flex flex-col items-center text-center pt-4">
                                        <h3 className="text-lg font-bold text-[#1D1D1F] mb-1 leading-tight px-1 line-clamp-2 min-h-[3rem] items-center flex justify-center">{doctor.name}</h3>
                                        <p className="text-salm-blue font-semibold text-sm bg-salm-light-blue/20 px-2.5 py-0.5 rounded-full whitespace-nowrap overflow-hidden text-ellipsis max-w-full mb-1">{doctor.specialist}</p>
                                    </div>

                                    {/* Bottom Info */}
                                    <div className="mt-2 pt-2 border-t border-gray-100 w-full">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex flex-col overflow-hidden text-left">
                                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-px">Jam Praktek</span>
                                                <span className="font-bold text-base text-gray-800 truncate max-w-[100px]">
                                                    {todaySchedule ? todaySchedule.time.split('-')[0].trim() : '-'}
                                                </span>
                                            </div>
                                            <div className="text-right flex flex-col shrink-0">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Antrian</span>
                                                <span className="font-bold text-xl tabular-nums text-[#1D1D1F] leading-none">
                                                    {doctor.quota?.current_count || 0}
                                                    <span className="text-[10px] text-gray-400 font-medium ml-1">/{doctor.quota?.max_quota}</span>
                                                </span>
                                            </div>
                                        </div>

                                        {isAvailable ? (
                                            <div className="w-full bg-salm-gradient text-white py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 group-hover:opacity-90 transition-all shadow-lg shadow-salm-purple/30 text-xs">
                                                <span>Ambil Antrian</span>
                                                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                        ) : (
                                            <div className="w-full bg-gray-200 text-gray-400 py-2 rounded-xl font-semibold flex items-center justify-center cursor-not-allowed text-xs">
                                                <span>Tidak Tersedia</span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </main>

            {ticket && <TicketModal ticket={ticket} onClose={() => setTicket(null)} />}
        </div>
    );
};

export default Kiosk;
