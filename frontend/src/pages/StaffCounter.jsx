import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Toaster, toast } from 'react-hot-toast';
import { Mic, Bell, CheckCircle, Users, Settings, LogOut } from 'lucide-react';

const API_URL = 'http://localhost:3000/api';
const SOCKET_URL = 'http://localhost:3000';

const StaffCounter = () => {
    // Initialization State
    const [isInitialized, setIsInitialized] = useState(false);
    const [config, setConfig] = useState({ counterName: '', poliId: 'all' });

    // Data State
    const [polies, setPolies] = useState([]);
    const [counters, setCounters] = useState([]);
    const [waitingList, setWaitingList] = useState([]);
    const [skippedList, setSkippedList] = useState([]);
    const [currentTicket, setCurrentTicket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSkippedModal, setShowSkippedModal] = useState(false);

    // Socket
    const socketRef = useRef(null);

    useEffect(() => {
        // Load config from localStorage
        const savedConfig = localStorage.getItem('staffCounterConfig');
        if (savedConfig) {
            setConfig(JSON.parse(savedConfig));
            setIsInitialized(true);
        }

        fetchPolies();
        fetchCounters();

        // Setup Socket
        socketRef.current = io(SOCKET_URL);
        socketRef.current.on('queue_update', () => {
            fetchWaitingList();
            fetchSkippedList();
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    useEffect(() => {
        if (isInitialized) {
            fetchWaitingList();
            fetchSkippedList();

            // Emit join event to server
            if (socketRef.current) {
                socketRef.current.emit('join_counter', {
                    counterName: config.counterName,
                    poliId: config.poliId
                });
            }
        }
    }, [isInitialized, config.poliId]);

    const fetchPolies = async () => {
        try {
            const res = await axios.get(`${API_URL}/polies`);
            setPolies(res.data);
        } catch (error) {
            console.error('Failed to fetch polies', error);
        }
    };

    const fetchCounters = async () => {
        try {
            const res = await axios.get(`${API_URL}/counters`);
            setCounters(res.data);
        } catch (error) {
            console.error('Failed to fetch counters', error);
        }
    };

    const fetchWaitingList = async () => {
        if (!config.poliId) return;
        try {
            const res = await axios.get(`${API_URL}/queues/waiting`, {
                params: { poli_id: config.poliId }
            });
            setWaitingList(res.data);
        } catch (error) {
            console.error('Failed to fetch waiting list', error);
        }
    };

    const fetchSkippedList = async () => {
        if (!config.poliId) return;
        try {
            const res = await axios.get(`${API_URL}/queues/skipped`, {
                params: { poli_id: config.poliId }
            });
            setSkippedList(res.data);
        } catch (error) {
            console.error('Failed to fetch skipped list', error);
        }
    };

    const handleInitSubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('staffCounterConfig', JSON.stringify(config));
        setIsInitialized(true);
        toast.success(`Counter initialized: ${config.counterName}`);
    };

    const handleResetConfig = () => {
        localStorage.removeItem('staffCounterConfig');
        setIsInitialized(false);
        setCurrentTicket(null);
        setConfig({ counterName: '', poliId: 'all' });
    };

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'id-ID'; // Indonesian
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        } else {
            toast.error('Browser does not support Text-to-Speech');
        }
    };

    const handleCallNext = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/queues/call`, {
                counter_name: config.counterName,
                poli_id: config.poliId
            });

            const ticket = res.data.ticket;
            const poliName = res.data.poliklinik.name;

            setCurrentTicket({ ...ticket, poli_name: poliName });

            // Announce
            const announcement = `Nomor Antrian, ${ticket.queue_code}, Silakan ke ${config.counterName}`;
            speak(announcement);

            toast.success(`Calling ${ticket.queue_code}`);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                toast('No more patients in queue', { icon: 'ℹ️' });
            } else {
                toast.error('Failed to call next patient');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRecall = () => {
        if (!currentTicket) return;
        const announcement = `Panggilan Ulang. Nomor Antrian, ${currentTicket.queue_code}, Silakan ke ${config.counterName}`;
        speak(announcement);
        toast.success(`Recalling ${currentTicket.queue_code}`);
    };

    const handleFinish = async () => {
        if (!currentTicket) return;
        try {
            await axios.post(`${API_URL}/queues/complete`, {
                ticket_id: currentTicket.id
            });
            setCurrentTicket(null);
            toast.success('Ticket completed');
            fetchWaitingList(); // Refresh list just in case
        } catch (error) {
            toast.error('Failed to complete ticket');
        }
    };

    const handleSkip = async () => {
        if (!currentTicket) return;
        try {
            await axios.post(`${API_URL}/queues/skip`, {
                ticket_id: currentTicket.id
            });
            setCurrentTicket(null);
            toast.success('Ticket skipped');
            fetchWaitingList();
            fetchSkippedList();
        } catch (error) {
            toast.error('Failed to skip ticket');
        }
    };

    const handleRecallSkipped = async (ticket) => {
        if (currentTicket) {
            toast.error('Please finish or skip current ticket first');
            return;
        }
        try {
            const res = await axios.post(`${API_URL}/queues/recall-skipped`, {
                ticket_id: ticket.id,
                counter_name: config.counterName
            });

            const updatedTicket = res.data;
            const poliName = ticket.daily_quota.doctor.poliklinik.name;
            setCurrentTicket({ ...updatedTicket, poli_name: poliName });
            setShowSkippedModal(false);

            const announcement = `Panggilan Ulang. Nomor Antrian, ${updatedTicket.queue_code}, Silakan ke ${config.counterName}`;
            speak(announcement);
            toast.success(`Recalling Skipped ${updatedTicket.queue_code}`);
        } catch (error) {
            toast.error('Failed to recall skipped ticket');
        }
    };

    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-modern-bg flex items-center justify-center p-4">
                <div className="bg-modern-card rounded-2xl shadow-xl p-8 w-full max-w-md border border-white/10">
                    <h1 className="text-2xl font-bold text-modern-text mb-6 text-center">Setup Counter</h1>
                    <form onSubmit={handleInitSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-modern-text-secondary mb-2">Nama Loket</label>
                            <select
                                required
                                className="w-full bg-modern-bg border border-white/10 text-modern-text rounded-lg px-4 py-3 focus:ring-2 focus:ring-modern-blue outline-none"
                                value={config.counterName}
                                onChange={(e) => setConfig({ ...config, counterName: e.target.value })}
                            >
                                <option value="">Pilih Loket</option>
                                {counters.map((c) => (
                                    <option key={c.id} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-modern-text-secondary mb-2">Filter Antrian</label>
                            <select
                                className="w-full bg-modern-bg border border-white/10 text-modern-text rounded-lg px-4 py-3 focus:ring-2 focus:ring-modern-blue outline-none"
                                value={config.poliId}
                                onChange={(e) => setConfig({ ...config, poliId: e.target.value })}
                            >
                                <option value="all">Semua Poli</option>
                                {polies.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-modern-blue to-modern-purple text-white py-3 rounded-xl font-bold hover:opacity-90 transition shadow-lg shadow-modern-blue/20"
                        >
                            Mulai Bertugas
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-modern-bg flex flex-col md:flex-row">
            <Toaster position="top-right" />

            {/* Sidebar - Waiting List */}
            <div className="w-full md:w-80 bg-modern-card border-r border-white/5 flex flex-col h-screen">
                <div className="p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-modern-text flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-modern-blue" />
                        Waiting List
                    </h2>

                    {/* Filter Dropdown */}
                    <div className="mb-2">
                        <select
                            className="w-full text-sm border border-white/10 rounded-lg px-3 py-2 focus:ring-2 focus:ring-modern-blue outline-none bg-modern-bg text-modern-text"
                            value={config.poliId}
                            onChange={(e) => {
                                const newConfig = { ...config, poliId: e.target.value };
                                setConfig(newConfig);
                                localStorage.setItem('staffCounterConfig', JSON.stringify(newConfig));
                            }}
                        >
                            <option value="all">Semua Poli</option>
                            {polies.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <p className="text-xs text-modern-text-secondary">
                        {waitingList.length} patients waiting
                    </p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {waitingList.length === 0 ? (
                        <div className="text-center py-10 text-modern-text-secondary">
                            <p>No patients waiting</p>
                        </div>
                    ) : (
                        waitingList.map((queue) => (
                            <div key={queue.id} className="bg-modern-bg/50 p-4 rounded-xl border border-white/5 hover:border-modern-blue/30 transition-colors group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-2xl font-bold text-modern-text block group-hover:text-modern-blue transition-colors">{queue.queue_code}</span>
                                        <span className="text-sm text-modern-text-secondary font-medium">
                                            {queue.daily_quota.doctor.poliklinik.name}
                                        </span>
                                    </div>
                                    <span className="text-xs text-modern-text-secondary bg-white/5 px-2 py-1 rounded-full border border-white/5">
                                        #{queue.queue_number}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-4 border-t border-white/5 bg-modern-card">
                    <button
                        onClick={() => setShowSkippedModal(true)}
                        className="w-full mb-3 bg-yellow-500/10 text-yellow-500 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-500/20 transition border border-yellow-500/20"
                    >
                        View Skipped ({skippedList.length})
                    </button>
                    <div className="flex items-center justify-between text-sm text-modern-text-secondary">
                        <span>{config.counterName}</span>
                        <button
                            onClick={handleResetConfig}
                            className="text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                            <LogOut size={14} /> Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Panel - Active Call */}
            <div className="flex-1 p-8 flex flex-col">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-modern-text">Counter Dashboard</h1>
                        <p className="text-modern-text-secondary">Serving: {config.poliId === 'all' ? 'All Poliklinik' : polies.find(p => p.id == config.poliId)?.name || 'Selected Poli'}</p>
                    </div>
                    <div className="bg-modern-card px-4 py-2 rounded-full shadow-sm border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 bg-modern-green rounded-full animate-pulse shadow-[0_0_10px_rgba(0,230,118,0.5)]"></div>
                        <span className="text-sm font-medium text-modern-text-secondary">System Online</span>
                    </div>
                </header>

                <div className="flex-1 flex flex-col items-center justify-center">
                    {currentTicket ? (
                        <div className="bg-modern-card rounded-[3rem] shadow-2xl p-12 w-full max-w-2xl text-center border border-white/5 animate-in zoom-in duration-300 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-modern-blue via-modern-purple to-modern-teal"></div>
                            <p className="text-modern-text-secondary font-medium uppercase tracking-widest mb-4">Current Ticket</p>
                            <div className="text-9xl font-black text-modern-blue tracking-tighter mb-6 font-mono drop-shadow-[0_0_15px_rgba(41,121,255,0.3)]">
                                {currentTicket.queue_code}
                            </div>
                            <div className="inline-block bg-modern-blue/10 text-modern-blue px-6 py-2 rounded-full text-lg font-bold mb-12 border border-modern-blue/20">
                                {currentTicket.poli_name}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    onClick={handleRecall}
                                    className="flex items-center justify-center gap-2 bg-yellow-500/10 text-yellow-500 py-4 rounded-2xl font-bold text-lg hover:bg-yellow-500/20 transition-colors border border-yellow-500/20"
                                >
                                    <Mic className="w-5 h-5" />
                                    Recall
                                </button>
                                <button
                                    onClick={handleSkip}
                                    className="flex items-center justify-center gap-2 bg-red-500/10 text-red-500 py-4 rounded-2xl font-bold text-lg hover:bg-red-500/20 transition-colors border border-red-500/20"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Skip
                                </button>
                                <button
                                    onClick={handleFinish}
                                    className="flex items-center justify-center gap-2 bg-modern-green/10 text-modern-green py-4 rounded-2xl font-bold text-lg hover:bg-modern-green/20 transition-colors border border-modern-green/20"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Finish
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-modern-text-secondary">
                            <div className="w-32 h-32 bg-modern-card rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-lg shadow-modern-blue/5">
                                <Bell className="w-12 h-12 text-modern-text-secondary" />
                            </div>
                            <h2 className="text-2xl font-bold text-modern-text mb-2">Ready to Serve</h2>
                            <p>Click "Call Next" to start serving patients</p>
                        </div>
                    )}
                </div>

                <div className="mt-10 flex justify-center">
                    <button
                        onClick={handleCallNext}
                        disabled={loading || currentTicket}
                        className={`
              flex items-center gap-4 px-12 py-6 rounded-3xl font-bold text-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95
              ${loading || currentTicket
                                ? 'bg-modern-card text-modern-text-secondary cursor-not-allowed border border-white/5'
                                : 'bg-gradient-to-r from-modern-blue to-modern-purple text-white hover:shadow-modern-blue/40 shadow-modern-blue/20'}
            `}
                    >
                        <Bell className="w-8 h-8" />
                        {loading ? 'Calling...' : 'Call Next Patient'}
                    </button>
                </div>
            </div>

            {/* Skipped Modal */}
            {showSkippedModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-modern-card rounded-2xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col border border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-modern-text">Skipped Patients</h2>
                            <button onClick={() => setShowSkippedModal(false)} className="text-modern-text-secondary hover:text-white">
                                <LogOut size={20} className="rotate-45" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3">
                            {skippedList.length === 0 ? (
                                <p className="text-center text-modern-text-secondary py-8">No skipped patients</p>
                            ) : (
                                skippedList.map((queue) => (
                                    <div key={queue.id} className="bg-modern-bg p-4 rounded-xl border border-white/5 flex justify-between items-center">
                                        <div>
                                            <span className="text-xl font-bold text-modern-text block">{queue.queue_code}</span>
                                            <span className="text-sm text-modern-text-secondary">{queue.daily_quota.doctor.poliklinik.name}</span>
                                        </div>
                                        <button
                                            onClick={() => handleRecallSkipped(queue)}
                                            className="bg-modern-blue/10 text-modern-blue px-4 py-2 rounded-lg font-semibold hover:bg-modern-blue/20 transition border border-modern-blue/20"
                                        >
                                            Recall
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffCounter;
