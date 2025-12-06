import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Toaster, toast } from 'react-hot-toast';
import { Mic, Bell, CheckCircle, Users, LogOut, Volume2 } from 'lucide-react';

const API_URL = 'http://localhost:3000/api';
const SOCKET_URL = 'http://localhost:3000';
const CHIME_URL = '/airport-chime.mp3';

const StaffCounter = () => {
    // Initialization State
    const [isInitialized, setIsInitialized] = useState(false);
    const [config, setConfig] = useState({
        counterName: '',
        poliId: 'all',
        voiceName: ''
    });

    const [availableVoices, setAvailableVoices] = useState([]);
    const [polies, setPolies] = useState([]);
    const [counters, setCounters] = useState([]);
    const [waitingList, setWaitingList] = useState([]);
    const [skippedList, setSkippedList] = useState([]);
    const [currentTicket, setCurrentTicket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSkippedModal, setShowSkippedModal] = useState(false);

    const chimeRef = useRef(new Audio(CHIME_URL));
    const socketRef = useRef(null);

    // --- LOAD VOICES & DATA ---
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                setAvailableVoices(voices);
                if (!config.voiceName) {
                    const recommended = voices.find(v =>
                        (v.name.includes('Gadis') || v.name.includes('Google Bahasa Indonesia'))
                        && v.lang.includes('id')
                    );
                    if (recommended) {
                        setConfig(prev => ({ ...prev, voiceName: recommended.name }));
                    }
                }
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        fetchPolies();
        fetchCounters();

        socketRef.current = io(SOCKET_URL);
        socketRef.current.on('queue_update', () => {
            fetchWaitingList();
            fetchSkippedList();
        });

        const savedConfig = localStorage.getItem('staffCounterConfig');
        if (savedConfig) {
            const parsed = JSON.parse(savedConfig);
            setConfig(parsed);
            setIsInitialized(true);
        }

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            window.speechSynthesis.cancel();
        };
    }, []);

    useEffect(() => {
        if (isInitialized) {
            fetchWaitingList();
            fetchSkippedList();
            if (socketRef.current) {
                socketRef.current.emit('join_counter', {
                    counterName: config.counterName,
                    poliId: config.poliId
                });
            }
        }
    }, [isInitialized, config.poliId]);

    const fetchPolies = async () => { try { const res = await axios.get(`${API_URL}/polies`); setPolies(res.data); } catch (error) { } };
    const fetchCounters = async () => { try { const res = await axios.get(`${API_URL}/counters`); setCounters(res.data); } catch (error) { } };
    const fetchWaitingList = async () => { if (!config.poliId) return; try { const res = await axios.get(`${API_URL}/queues/waiting`, { params: { poli_id: config.poliId } }); setWaitingList(res.data); } catch (error) { } };
    const fetchSkippedList = async () => { if (!config.poliId) return; try { const res = await axios.get(`${API_URL}/queues/skipped`, { params: { poli_id: config.poliId } }); setSkippedList(res.data); } catch (error) { } };

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
        setConfig(prev => ({ ...prev, counterName: '', poliId: 'all' }));
        window.speechSynthesis.cancel();
    };

    // --- LOGIKA TEXT TO SPEECH (DIPERBARUI) ---

    const formatQueueForSpeech = (code) => {
        if (!code) return '';

        // 1. Hapus tanda "-" (hyphen)
        // Contoh: "A-001" menjadi "A001"
        const cleanCode = code.replace(/-/g, '');

        // 2. Pisahkan Huruf dan Angka menggunakan Regex
        // Match[1] = Huruf (A), Match[2] = Angka (001)
        const match = cleanCode.match(/([a-zA-Z]+)(\d+)/);

        if (match) {
            const letters = match[1].split('').join('. '); // "A" -> "A." (Jeda setelah huruf)
            const number = parseInt(match[2], 10); // "001" -> 1 (Integer menghilangkan nol di depan)

            // Return format: "A... Satu"
            return `${letters}. ${number}`;
        }

        // Fallback jika format tidak sesuai (misal cuma angka atau cuma huruf)
        return code;
    };

    const playChime = () => {
        return new Promise((resolve) => {
            chimeRef.current.currentTime = 0;
            chimeRef.current.play()
                .then(() => setTimeout(resolve, 1500))
                .catch(() => resolve());
        });
    };

    const speak = async (text) => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();

        if (text.length > 20) await playChime();

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find(v => v.name === config.voiceName);

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.lang = 'id-ID';
        utterance.rate = 0.85;
        utterance.pitch = 1.1;

        window.speechSynthesis.speak(utterance);
    };

    // --- HANDLERS ---
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

            // Gunakan format baru
            const speechCode = formatQueueForSpeech(ticket.queue_code);

            // Kalimat: "Nomor Antrian A Satu. Silakan ke Loket 1"
            const counterSpeech = config.counterName.match(/^loket/i) ? config.counterName : `Loket ${config.counterName}`;
            const announcement = `Nomor Antrian, ${speechCode}. Silakan menuju, ${counterSpeech}.`;

            speak(announcement);
            toast.success(`Calling ${ticket.queue_code}`);
        } catch (error) {
            if (error.response?.status === 404) toast('Antrian habis', { icon: 'ℹ️' });
            else toast.error('Gagal memanggil');
        } finally {
            setLoading(false);
        }
    };

    const handleRecall = () => {
        if (!currentTicket) return;
        const speechCode = formatQueueForSpeech(currentTicket.queue_code);
        const counterSpeech = config.counterName.match(/^loket/i) ? config.counterName : `Loket ${config.counterName}`;
        const announcement = `Panggilan Ulang. Nomor Antrian, ${speechCode}. Silakan menuju, ${counterSpeech}.`;
        speak(announcement);
        toast.success(`Recalling ${currentTicket.queue_code}`);
    };

    const handleFinish = async () => {
        if (!currentTicket) return;
        try {
            await axios.post(`${API_URL}/queues/complete`, { ticket_id: currentTicket.id });
            setCurrentTicket(null);
            toast.success('Selesai');
            fetchWaitingList();
        } catch (error) { toast.error('Error'); }
    };

    const handleSkip = async () => {
        if (!currentTicket) return;
        try {
            await axios.post(`${API_URL}/queues/skip`, { ticket_id: currentTicket.id });
            setCurrentTicket(null);
            toast.success('Dilewati');
            fetchWaitingList(); fetchSkippedList();
        } catch (error) { toast.error('Error'); }
    };

    const handleRecallSkipped = async (ticket) => {
        if (currentTicket) { toast.error('Selesaikan pasien saat ini dulu'); return; }
        try {
            const res = await axios.post(`${API_URL}/queues/recall-skipped`, {
                ticket_id: ticket.id, counter_name: config.counterName
            });
            const updatedTicket = res.data;
            const poliName = ticket.daily_quota.doctor.poliklinik.name;
            setCurrentTicket({ ...updatedTicket, poli_name: poliName });
            setShowSkippedModal(false);

            const speechCode = formatQueueForSpeech(updatedTicket.queue_code);
            const counterSpeech = config.counterName.match(/^loket/i) ? config.counterName : `Loket ${config.counterName}`;
            const announcement = `Panggilan Ulang. Nomor Antrian, ${speechCode}. Silakan menuju, ${counterSpeech}.`;
            speak(announcement);
        } catch (error) { toast.error('Gagal recall'); }
    };

    // --- SETUP VIEW (LIGHT MODE) ---
    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-modern-bg flex items-center justify-center p-4 font-sans text-modern-text">
                <div className="bg-modern-card rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/50 backdrop-blur-xl">
                    <h1 className="text-3xl font-extrabold bg-salm-gradient bg-clip-text text-transparent mb-8 text-center tracking-tight">Setup Counter</h1>
                    <form onSubmit={handleInitSubmit} className="space-y-6">

                        <div className="bg-salm-light-blue/20 p-5 rounded-2xl border border-salm-light-blue/30 mx-auto">
                            <label className="block text-sm font-bold text-salm-blue mb-3 flex items-center gap-2">
                                <Volume2 size={16} className="text-salm-blue" /> Pilih Suara
                            </label>
                            <select
                                required
                                className="w-full bg-white/80 border border-salm-light-blue/50 text-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-salm-blue/30 outline-none backdrop-blur-sm transition-all hover:bg-white"
                                value={config.voiceName}
                                onChange={(e) => {
                                    setConfig({ ...config, voiceName: e.target.value });
                                    const utt = new SpeechSynthesisUtterance("Tes suara.");
                                    const v = availableVoices.find(val => val.name === e.target.value);
                                    if (v) utt.voice = v;
                                    utt.lang = 'id-ID'; utt.pitch = 1.1;
                                    window.speechSynthesis.cancel();
                                    window.speechSynthesis.speak(utt);
                                }}
                            >
                                <option value="">-- Pilih Suara --</option>
                                {availableVoices.filter(v => v.lang.includes('id')).map(v => (
                                    <option key={v.name} value={v.name}>🇮🇩 {v.name}</option>
                                ))}
                                <option disabled>--- Lainnya ---</option>
                                {availableVoices.filter(v => !v.lang.includes('id')).map(v => (
                                    <option key={v.name} value={v.name}>{v.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">Nama Loket</label>
                            <select required className="w-full bg-theme-bg border border-theme-border text-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-salm-blue/30 outline-none" value={config.counterName} onChange={(e) => setConfig({ ...config, counterName: e.target.value })}>
                                <option value="">Pilih Loket</option>
                                {counters.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">Filter Antrian</label>
                            <select className="w-full bg-theme-bg border border-theme-border text-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-salm-blue/30 outline-none" value={config.poliId} onChange={(e) => setConfig({ ...config, poliId: e.target.value })}>
                                <option value="all">Semua Poli</option>
                                {polies.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-salm-gradient text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-salm-blue/20 transition-all active:scale-[0.98]">Mulai Bertugas</button>
                    </form>
                </div>
            </div>
        );
    }

    // --- MAIN DASHBOARD (LIGHT MODE) ---
    return (
        <div className="min-h-screen bg-theme-bg flex flex-col md:flex-row text-theme-text font-sans">
            <Toaster position="top-right" />

            {/* Sidebar */}
            <div className="w-full md:w-80 bg-modern-card border-r border-gray-100 flex flex-col h-screen shadow-sm z-10 glass">
                <div className="p-6 border-b border-gray-100/50">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-salm-blue">
                        <Users className="w-6 h-6 text-salm-purple" /> Waiting List
                    </h2>
                    <select className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-salm-blue/20 outline-none bg-gray-50/50 text-gray-700 mb-3" value={config.poliId} onChange={(e) => { const newConfig = { ...config, poliId: e.target.value }; setConfig(newConfig); localStorage.setItem('staffCounterConfig', JSON.stringify(newConfig)); }}>
                        <option value="all">Semua Poli</option>
                        {polies.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{waitingList.length} patients waiting</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {waitingList.map((queue) => (
                        <div key={queue.id} className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-salm-light-blue shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-salm-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex justify-between items-start pl-2">
                                <div>
                                    <span className="text-2xl font-bold block text-gray-800 group-hover:text-salm-blue transition-colors tracking-tight">{queue.queue_code}</span>
                                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{queue.daily_quota.doctor.poliklinik.name}</span>
                                </div>
                                <span className="text-xs font-bold text-salm-purple bg-salm-light-pink/30 px-2.5 py-1 rounded-full border border-salm-light-pink/50">#{queue.queue_number}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
                    <button onClick={() => setShowSkippedModal(true)} className="w-full mb-3 bg-theme-orange/10 text-theme-orange py-2.5 rounded-xl text-sm font-bold hover:bg-theme-orange/20 transition border border-theme-orange/20">View Skipped ({skippedList.length})</button>
                    <div className="flex items-center justify-between text-xs font-medium text-gray-400">
                        <span className="flex items-center gap-1.5"><Volume2 size={12} className="text-salm-blue" /> {config.voiceName.slice(0, 15)}...</span>
                        <button onClick={handleResetConfig} className="text-red-400 hover:text-red-500 flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"><LogOut size={12} /> Logout</button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 flex flex-col bg-theme-bg relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-salm-light-blue/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-salm-light-pink/20 rounded-full blur-[100px] pointer-events-none" />

                <header className="flex justify-between items-center mb-10 relative z-10">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Counter Dashboard</h1>
                        <p className="text-gray-500 font-medium mt-1">Serving: <span className="text-salm-blue font-bold">{config.poliId === 'all' ? 'All Poliklinik' : polies.find(p => p.id == config.poliId)?.name}</span></p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm border border-white/50 flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-modern-green rounded-full animate-pulse shadow-[0_0_10px_#40d4a8]"></div>
                        <span className="text-sm font-bold text-gray-600">System Online</span>
                    </div>
                </header>
                <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                    {currentTicket ? (
                        <div className="bg-white rounded-[3rem] shadow-2xl p-12 w-full max-w-2xl text-center border border-white/60 animate-in zoom-in duration-300 relative overflow-hidden backdrop-blur-xl">
                            <div className="absolute top-0 left-0 w-full h-2 bg-salm-gradient"></div>
                            <p className="text-gray-400 font-bold uppercase tracking-[0.2em] mb-4 text-xs">Current Ticket</p>

                            {/* Tampilan Nomor Besar */}
                            <div className="text-[10rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-700 tracking-tighter mb-8 font-mono filter drop-shadow-sm">
                                {currentTicket.queue_code}
                            </div>

                            <div className="inline-block bg-salm-light-blue/30 text-salm-blue px-8 py-3 rounded-full text-xl font-bold mb-12 border border-salm-light-blue/50">
                                {currentTicket.poli_name}
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <button onClick={handleRecall} className="flex items-center justify-center gap-2 bg-theme-orange/10 text-theme-orange py-5 rounded-2xl font-bold text-lg hover:bg-theme-orange/20 transition-all border border-theme-orange/20 shadow-sm active:scale-95"><Mic className="w-6 h-6" /> Recall</button>
                                <button onClick={handleSkip} className="flex items-center justify-center gap-2 bg-red-50 text-red-500 py-5 rounded-2xl font-bold text-lg hover:bg-red-100 transition-all border border-red-200 shadow-sm active:scale-95"><LogOut className="w-6 h-6" /> Skip</button>
                                <button onClick={handleFinish} className="flex items-center justify-center gap-2 bg-modern-green/10 text-modern-green py-5 rounded-2xl font-bold text-lg hover:bg-modern-green/20 transition-all border border-modern-green/20 shadow-sm active:scale-95"><CheckCircle className="w-6 h-6" /> Finish</button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400">
                            <div className="w-40 h-40 bg-white/80 rounded-full flex items-center justify-center mx-auto mb-8 border border-white shadow-xl shadow-salm-purple/5 backdrop-blur-sm">
                                <Bell className="w-16 h-16 text-gray-300" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-700 mb-2">Ready to Serve</h2>
                            <p className="text-gray-500">Click "Call Next" to start serving</p>
                        </div>
                    )}
                </div>
                <div className="mt-10 flex justify-center relative z-10">
                    <button onClick={handleCallNext} disabled={loading || currentTicket} className={`flex items-center gap-4 px-16 py-7 rounded-[2rem] font-bold text-2xl shadow-2xl shadow-salm-purple/30 transition-all transform hover:scale-105 active:scale-95 ${loading || currentTicket ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-salm-gradient text-white ring-4 ring-white/30'}`}>
                        <Bell className="w-8 h-8" /> {loading ? 'Calling...' : 'Call Next Patient'}
                    </button>
                </div>
            </div>

            {/* Modal Light Mode */}
            {showSkippedModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl border border-white/20">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-800">Skipped Patients</h2>
                            <button onClick={() => setShowSkippedModal(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                                <LogOut size={20} className="rotate-45" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                            {skippedList.map((queue) => (
                                <div key={queue.id} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
                                    <div>
                                        <span className="text-2xl font-bold text-gray-800 block group-hover:text-salm-blue transition-colors">{queue.queue_code}</span>
                                        <span className="text-sm text-gray-500 font-medium">{queue.daily_quota.doctor.poliklinik.name}</span>
                                    </div>
                                    <button onClick={() => handleRecallSkipped(queue)} className="bg-salm-light-blue/20 text-salm-blue px-6 py-2.5 rounded-xl font-bold hover:bg-salm-light-blue/40 transition border border-salm-light-blue/30">Recall</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffCounter;