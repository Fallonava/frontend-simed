import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Activity, Clock, User, Calendar } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const QueueStatus = () => {
    const { ticketId } = useParams();
    const [ticket, setTicket] = useState(null);
    const [aheadCount, setAheadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await axios.get(`${API_URL}/queue/ticket/${ticketId}`);
                setTicket(res.data.ticket);
                setAheadCount(res.data.aheadCount);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Ticket not found');
                setLoading(false);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [ticketId]);

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading status...</div>;
    if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">{error}</div>;

    const statusColors = {
        WAITING: 'bg-blue-50 text-blue-600 border-blue-100',
        CALLED: 'bg-green-50 text-green-600 border-green-100 animate-pulse',
        SKIPPED: 'bg-orange-50 text-orange-600 border-orange-100',
        SERVED: 'bg-gray-50 text-gray-600 border-gray-100',
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <div className="bg-white p-6 shadow-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="flex items-center gap-3 justify-center mb-2">
                    <div className="w-8 h-8 bg-salm-gradient rounded-lg flex items-center justify-center shadow-lg shadow-salm-purple/20">
                        <Activity className="text-white w-5 h-5" />
                    </div>
                    <h1 className="text-lg font-bold text-gray-800">Fallonava Queue</h1>
                </div>
                <p className="text-center text-xs text-gray-500 uppercase tracking-wider font-semibold">Realtime Status</p>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 flex flex-col items-center max-w-md mx-auto w-full">

                {/* Status Card */}
                <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center mb-6">
                    <div className="mb-2 text-sm text-gray-500 font-medium uppercase tracking-wide">Nomor Antrian Anda</div>
                    <div className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">{ticket.queue_code}</div>

                    <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold border ${statusColors[ticket.status] || 'bg-gray-100 text-gray-600'}`}>
                        {ticket.status}
                    </div>
                </div>

                {/* Info Cards */}
                <div className="w-full space-y-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <User className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className="text-xs text-gray-500 font-bold uppercase">Dokter</div>
                                <div className="font-bold text-gray-800">{ticket.daily_quota.doctor.name}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className="text-xs text-gray-500 font-bold uppercase">Poliklinik</div>
                                <div className="font-bold text-gray-800">{ticket.daily_quota.doctor.poliklinik.name}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className="text-xs text-gray-500 font-bold uppercase">Antrian di Depan</div>
                                <div className="font-bold text-gray-800">{aheadCount} Orang</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-8 text-center text-gray-400 text-xs">
                    <p>Refresh otomatis setiap 5 detik</p>
                </div>
            </div>
        </div>
    );
};

export default QueueStatus;
