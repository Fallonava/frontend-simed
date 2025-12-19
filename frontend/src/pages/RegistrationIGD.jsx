import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Calendar, Clock, MapPin, ChevronRight, Stethoscope, User, Fingerprint, Printer, CheckCircle, X, CreditCard, Activity, Umbrella, Phone, FileText, ArrowRight, RefreshCcw, Mic, Bell, Users, LogOut, Volume2, ChevronUp, ChevronDown, Settings, Siren } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { io } from 'socket.io-client';
import api from '../utils/axiosConfig';
import PageWrapper from '../components/PageWrapper';
import defaultAvatar from '../assets/doctor_avatar.png';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
const CHIME_URL = '/airport-chime.mp3';

const RegistrationIGD = () => {
    const mode = 'IGD';
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [patientFound, setPatientFound] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [clinics, setClinics] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [showNewPatientModal, setShowNewPatientModal] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false); // New State

    // Ticket Data
    const [ticketData, setTicketData] = useState(null);

    // New Patient Form State
    const [newPatient, setNewPatient] = useState({
        name: '',
        nik: '',
        gender: 'L',
        birth_date: '',
        address: '',
        phone: '',
        // BPJS
        bpjs_card_no: '',
        is_bpjs: false
    });

    // BPJS Simulation State
    const [bpjsChecking, setBpjsChecking] = useState(false);
    const [bpjsStatus, setBpjsStatus] = useState(null);
    const [paymentType, setPaymentType] = useState('UMUM'); // 'UMUM' | 'BPJS'
    const [showSEPModal, setShowSEPModal] = useState(false);
    const [sepData, setSepData] = useState(null);
    const [sepInput, setSepInput] = useState({ rujukan: '', diagnosa: '' });
    const [sepLoading, setSepLoading] = useState(false);

    // Recent Patients State
    const [recentPatients, setRecentPatients] = useState([]);
    const [recentFilter, setRecentFilter] = useState('all'); // 'all' | 'today'

    // Fetch Recent Patients
    const fetchRecentPatients = async () => {
        try {
            const res = await api.get('/patients?limit=5&sort=updatedAt:desc'); // Assuming API supports this, or just default get
            // If API doesn't support sort/limit params as generic, we might just get the default list.
            // Based on PatientList.jsx: api.get(`/patients?page=${page}&q=${searchTerm}`)
            // We'll just fetch page 1 and slice it client side if needed.
            if (res.data && res.data.data) {
                setRecentPatients(res.data.data.slice(0, 5));
            }
        } catch (error) {
            console.error("Failed to fetch recent patients", error);
        }
    };

    useEffect(() => {
        fetchRecentPatients();
    }, []);

    // --- COUNTER LOGIC STATE ---
    const [isCounterOpen, setIsCounterOpen] = useState(false); // UI State for Sheet
    const [isCounterInitialized, setIsCounterInitialized] = useState(false);
    const [counterConfig, setCounterConfig] = useState({
        counterName: '',
        poliId: 'all',
        voiceName: ''
    });

    // Counter Data
    const [availableVoices, setAvailableVoices] = useState([]);
    const [counters, setCounters] = useState([]);
    const [waitingList, setWaitingList] = useState([]);
    const [skippedList, setSkippedList] = useState([]);
    const [currentTicket, setCurrentTicket] = useState(null);
    const [counterLoading, setCounterLoading] = useState(false);
    const [showSkippedModal, setShowSkippedModal] = useState(false);

    const chimeRef = useRef(new Audio(CHIME_URL));
    const socketRef = useRef(null);

    // --- COUNTER HELPER FUNCTIONS ---
    const fetchCounters = async () => { try { const res = await api.get('/counters'); setCounters(res.data); } catch (error) { } };

    const fetchWaitingList = React.useCallback(async () => {
        if (!counterConfig.poliId) return;
        try {
            const res = await api.get('/queues/waiting', { params: { poli_id: counterConfig.poliId } });
            setWaitingList(res.data);
        } catch (error) { }
    }, [counterConfig.poliId]);

    const fetchSkippedList = React.useCallback(async () => {
        if (!counterConfig.poliId) return;
        try {
            const res = await api.get('/queues/skipped', { params: { poli_id: counterConfig.poliId } });
            setSkippedList(res.data);
        } catch (error) { }
    }, [counterConfig.poliId]);

    const formatQueueForSpeech = (code) => {
        if (!code) return '';
        const cleanCode = code.replace(/-/g, '');
        const match = cleanCode.match(/([a-zA-Z]+)(\d+)/);
        if (match) {
            const letters = match[1].split('').join('. ');
            const number = parseInt(match[2], 10);
            return `${letters}. ${number}`;
        }
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
        const selectedVoice = voices.find(v => v.name === counterConfig.voiceName);
        if (selectedVoice) utterance.voice = selectedVoice;

        utterance.lang = 'id-ID';
        utterance.rate = 0.85;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
    };

    // --- BPJS HELPER ---
    const handleCheckBPJS = async (nikOverride) => {
        const nikToCheck = nikOverride || newPatient.nik;
        if (!nikToCheck) {
            toast.error('NIK tidak boleh kosong');
            return;
        }

        setBpjsChecking(true);
        try {
            const res = await api.post('/bpjs/check-participant', { nik: nikToCheck });
            const { status, data, message } = res.data;

            if (status === 'OK') {
                setBpjsStatus(data.statusPeserta);
                toast.success(`BPJS: ${data.nama} (Status: ${data.statusPeserta.keterangan})`);

                // Auto-fill form
                setNewPatient(prev => ({
                    ...prev,
                    name: data.nama,
                    bpjs_card_no: data.noKartu,
                    is_bpjs: data.statusPeserta.keterangan === 'AKTIF',
                    gender: data.sex,
                    birth_date: data.tglLahir
                }));
            } else {
                setBpjsStatus({ keterangan: 'TIDAK DITEMUKAN / NON-AKTIF' });
                toast.error(message || 'Peserta tidak ditemukan');
            }
        } catch (error) {
            toast.error('Gagal cek BPJS (Mock Error)');
            console.error(error);
        } finally {
            setBpjsChecking(false);
        }
    };

    // --- COUNTER ACTIONS ---
    const handleInitCounter = (e) => {
        e.preventDefault();
        localStorage.setItem('staffCounterConfig', JSON.stringify(counterConfig));
        setIsCounterInitialized(true);
        toast.success(`Counter initialized: ${counterConfig.counterName}`);

        // Socket Join
        if (socketRef.current) {
            socketRef.current.emit('join_counter', {
                counterName: counterConfig.counterName,
                poliId: counterConfig.poliId
            });
        }
        fetchWaitingList();
        fetchSkippedList();
    };

    const handleCallNext = async () => {
        setCounterLoading(true);
        try {
            const res = await api.post('/queues/call', {
                counter_name: counterConfig.counterName,
                poli_id: counterConfig.poliId
            });
            const ticket = res.data.ticket;
            const poliName = res.data.poliklinik.name;
            setCurrentTicket({ ...ticket, poli_name: poliName });

            const speechCode = formatQueueForSpeech(ticket.queue_code);
            const counterSpeech = counterConfig.counterName.match(/^loket/i) ? counterConfig.counterName : `Loket ${counterConfig.counterName}`;
            const announcement = `Nomor Antrian, ${speechCode}. Silakan menuju, ${counterSpeech}.`;

            speak(announcement);
            toast.success(`Calling ${ticket.queue_code}`);
        } catch (error) {
            if (error.response?.status === 404) toast('Antrian habis', { icon: 'ℹ️' });
            else toast.error('Gagal memanggil');
        } finally {
            setCounterLoading(false);
        }
    };

    const handleRecall = () => {
        if (!currentTicket) return;
        const speechCode = formatQueueForSpeech(currentTicket.queue_code);
        const counterSpeech = counterConfig.counterName.match(/^loket/i) ? counterConfig.counterName : `Loket ${counterConfig.counterName}`;
        const announcement = `Panggilan Ulang. Nomor Antrian, ${speechCode}. Silakan menuju, ${counterSpeech}.`;
        speak(announcement);
        toast.success(`Recalling ${currentTicket.queue_code}`);
    };

    const handleFinishTicket = async () => {
        if (!currentTicket) return;
        try {
            await api.post('/queues/complete', { ticket_id: currentTicket.id });
            setCurrentTicket(null);
            toast.success('Selesai');
            fetchWaitingList();
        } catch (error) { toast.error('Error'); }
    };

    const handleSkipTicket = async () => {
        if (!currentTicket) return;
        try {
            await api.post('/queues/skip', { ticket_id: currentTicket.id });
            setCurrentTicket(null);
            toast.success('Dilewati');
            fetchWaitingList(); fetchSkippedList();
        } catch (error) { toast.error('Error'); }
    };

    const handleRecallSkipped = async (ticket) => {
        if (currentTicket) { toast.error('Selesaikan pasien saat ini dulu'); return; }
        try {
            const res = await api.post('/queues/recall-skipped', {
                ticket_id: ticket.id, counter_name: counterConfig.counterName
            });
            const updatedTicket = res.data;
            const poliName = ticket.daily_quota.doctor.poliklinik.name;
            setCurrentTicket({ ...updatedTicket, poli_name: poliName });
            setShowSkippedModal(false);

            // Auto expand the counter if hidden
            if (!isCounterOpen) setIsCounterOpen(true);

            const speechCode = formatQueueForSpeech(updatedTicket.queue_code);
            const counterSpeech = counterConfig.counterName.match(/^loket/i) ? counterConfig.counterName : `Loket ${counterConfig.counterName}`;
            const announcement = `Panggilan Ulang. Nomor Antrian, ${speechCode}. Silakan menuju, ${counterSpeech}.`;
            speak(announcement);
        } catch (error) { toast.error('Gagal recall'); }
    };

    const handleLogoutCounter = () => {
        localStorage.removeItem('staffCounterConfig');
        setIsCounterInitialized(false);
        setCurrentTicket(null);
        setCounterConfig(prev => ({ ...prev, counterName: '', poliId: 'all' }));
        window.speechSynthesis.cancel();
    };

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [poliRes, docRes] = await Promise.all([
                    api.get('/polies'),
                    api.get('/doctors-master')
                ]);
                setClinics(poliRes.data);
                setDoctors(docRes.data);

                // Auto Select IGD if mode is IGD
                if (mode === 'IGD') {
                    const igdClinic = poliRes.data.find(c => c.name.toLowerCase().includes('igd') || c.name.toLowerCase().includes('gawat'));
                    if (igdClinic) {
                        setSelectedClinic(igdClinic.id);
                        toast.success('Mode IGD: Unit Emergency Selected');
                    }
                }
            } catch (error) {
                console.error("Failed to load master data", error);
                toast.error("Failed to load clinic/doctor data");
            }
        };
        fetchMasterData();

        // --- COUNTER INITIALIZATION ---
        fetchCounters();

        socketRef.current = io(SOCKET_URL);

        // Load Voices
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                setAvailableVoices(voices);
                if (!counterConfig.voiceName) {
                    const recommended = voices.find(v =>
                        (v.name.includes('Gadis') || v.name.includes('Google Bahasa Indonesia'))
                        && v.lang.includes('id')
                    );
                    if (recommended) setCounterConfig(prev => ({ ...prev, voiceName: recommended.name }));
                }
            }
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        // Load Config
        const savedConfig = localStorage.getItem('staffCounterConfig');
        if (savedConfig) {
            const parsed = JSON.parse(savedConfig);
            setCounterConfig(parsed);
            setIsCounterInitialized(true);
        }

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            window.speechSynthesis.cancel();
        };
    }, []);

    // --- COUNTER EFFECTS ---
    useEffect(() => {
        if (isCounterInitialized && socketRef.current) {
            socketRef.current.emit('join_counter', {
                counterName: counterConfig.counterName,
                poliId: counterConfig.poliId
            });
            fetchWaitingList();
            fetchSkippedList();
        }
    }, [isCounterInitialized, counterConfig.poliId, fetchWaitingList, fetchSkippedList]);

    useEffect(() => {
        if (!socketRef.current) return;
        const handleUpdate = () => { fetchWaitingList(); fetchSkippedList(); };
        socketRef.current.on('queue_update', handleUpdate);
        return () => { socketRef.current.off('queue_update', handleUpdate); };
    }, [fetchWaitingList, fetchSkippedList]);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchTerm) return;
        setIsSearching(true);
        try {
            const res = await api.get(`/patients/search?q=${searchTerm}`);
            if (res.data.length > 0) {
                setSearchResults(res.data);
                setPatientFound(null); // Clear selection on new search
                toast.success(`${res.data.length} Patients Found`);
                // setSearchTerm(''); // Optional: Keep search term or clear? Usually keep matching term.
            } else {
                toast.error('Patient not found');
                setSearchResults([]);
                setPatientFound(null);
            }
        } catch (error) {
            toast.error('Search failed');
        } finally {
            setIsSearching(false);
        }
    };

    const handleCreatePatient = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/patients', newPatient);
            setPatientFound(res.data);
            toast.success('Patient Registered Successfully');
            setShowNewPatientModal(false);
            setNewPatient({ name: '', nik: '', gender: 'L', birth_date: '', address: '', phone: '' });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Registration Failed');
        }
    };

    const handleReset = () => {
        setSearchTerm('');
        setPatientFound(null);
        setSelectedClinic(null);
        setSelectedDoctor(null);
        setPaymentMethod(null);
        setTicketData(null);
        setIsSearching(false);
        toast('Form Reset', { icon: '🔄' });
    };

    const handleRegister = async () => {
        if (!patientFound || !selectedDoctor || !selectedClinic || !paymentMethod) {
            toast.error("Please complete all steps");
            return;
        }

        const toastId = toast.loading('Creating Ticket...');

        try {
            const res = await api.post('/queue/ticket', {
                doctor_id: selectedDoctor,
                patient_id: patientFound.id
            });

            // Prepare Ticket Data
            const clinicName = clinics.find(c => c.id === selectedClinic)?.name;
            const doctorName = doctors.find(d => d.id === selectedDoctor)?.name;
            const doc = doctors.find(d => d.id === selectedDoctor); // Get full doctor object

            setTicketData({
                ...res.data.ticket,
                patient: patientFound,
                clinicName,
                doctorName,
                doctor: doc
            });

            toast.success('Ticket Created!', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Registration Failed', { id: toastId });
        }
    };

    // Print Functions
    const handlePrintTicket = () => {
        // Trigger browser print, CSS will hide everything except .print-ticket
        window.print();
    };

    // Card printing logic is also handled by standard window.print() and CSS media queries
    // We would need a way to distinguish, typically by showing a modal that is the only printable thing
    // or routing to a print page. For simplicity here, we assume the user views the card modal then prints.

    const filteredDoctors = selectedClinic
        ? doctors.filter(d => d.poliklinik_id === selectedClinic)
        : [];

    return (
        <PageWrapper title="Registration">
            <Toaster position="top-center" toastOptions={{ className: 'backdrop-blur-md bg-white/80 dark:bg-gray-800/80' }} />

            <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-100px)] gap-6 p-6 max-w-[1920px] mx-auto print:hidden">

                {/* LEFT PANEL: PATIENT IDENTIFICATION */}
                <div className="w-full lg:w-[22%] flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Check-In</h1>
                            <p className="text-xs text-gray-500 font-medium">Identify patient to start</p>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => navigate('/menu')} className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all rounded-xl px-4 py-2.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 flex items-center justify-center gap-2 group">
                                <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Menu
                            </button>
                            <button
                                onClick={() => setIsCounterOpen(!isCounterOpen)}
                                className={`flex-1 transition-all rounded-xl px-4 py-2.5 text-[11px] font-bold border border-transparent flex items-center justify-center gap-2 group ${isCounterOpen ? 'bg-salm-blue text-white shadow-lg shadow-salm-blue/30' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'}`}
                            >
                                {isCounterOpen ? 'Close Counter' : 'Open Counter'} <div className={`w-2 h-2 rounded-full ${isCounterInitialized ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`}></div>
                            </button>
                        </div>

                        <button onClick={handleReset} className="w-full bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 hover:shadow-sm border border-gray-200 dark:border-gray-700 transition-all rounded-xl px-4 py-2 text-[11px] font-bold text-gray-400 flex items-center justify-center gap-2">
                            <RefreshCcw size={12} /> Reset Form
                        </button>
                    </div>

                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-4 rounded-[24px] shadow-lg border border-white/20 relative group transition-all focus-within:ring-4 focus-within:ring-blue-500/20">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search Name / NIK / RM..."
                            className="w-full pl-10 pr-3 py-3 bg-transparent border-none focus:ring-0 text-gray-800 dark:text-white font-bold text-lg placeholder-gray-400/70"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button onClick={handleSearch} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black dark:bg-white text-white dark:text-black p-2 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md">
                            <ChevronRight size={16} strokeWidth={3} />
                        </button>
                    </div>

                    <button onClick={() => setShowNewPatientModal(true)} className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold text-sm shadow-lg shadow-gray-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                        <Plus size={18} /> Register New Patient
                    </button>

                    <div className="flex-1 overflow-y-auto space-y-4">
                        {searchResults.length > 0 ? (
                            <div className="space-y-3 p-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center px-1">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{searchResults.length} Patients Found</p>
                                    <button onClick={() => { setSearchResults([]); setPatientFound(null); }} className="text-[10px] text-red-500 font-bold hover:underline">Clear Search</button>
                                </div>
                                {searchResults.map((patient) => {
                                    const isExpanded = patientFound?.id === patient.id;
                                    return (
                                        <motion.div
                                            layout
                                            key={patient.id}
                                            onClick={() => !isExpanded && setPatientFound(patient)}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ layout: { duration: 0.3, type: 'spring', stiffness: 300, damping: 30 } }}
                                            className={`rounded-[24px] overflow-hidden cursor-pointer relative transition-all duration-300
                                                ${isExpanded
                                                    ? 'bg-white dark:bg-gray-800 ring-2 ring-inset ring-blue-500 shadow-2xl shadow-blue-500/20 z-10 scale-[1.01]'
                                                    : 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/20 shadow-sm hover:bg-white/80 dark:hover:bg-gray-700/80 hover:shadow-lg hover:scale-[1.005]'
                                                }
                                            `}
                                        >
                                            <div className="p-5 flex items-center justify-between">
                                                <div className="flex items-center gap-5">
                                                    <motion.div
                                                        layout="position"
                                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm transition-colors ${isExpanded ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}
                                                    >
                                                        {patient.name.charAt(0)}
                                                    </motion.div>
                                                    <div className="flex flex-col">
                                                        <motion.h3 layout="position" className={`font-bold text-base leading-tight transition-colors ${isExpanded ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}>
                                                            {patient.name}
                                                        </motion.h3>
                                                        <motion.div layout="position" className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                                                                RM: {patient.no_rm}
                                                            </span>
                                                        </motion.div>
                                                    </div>
                                                </div>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-blue-50 text-blue-500 rotate-90' : 'text-gray-300'}`}>
                                                    <ChevronRight size={18} />
                                                </div>
                                            </div>

                                            {/* Expanded Content - iOS Style Reveal */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3, ease: 'easeOut' }}
                                                    >
                                                        <div className="px-5 pb-5 pt-0">
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: 0.1 }}
                                                                className="p-4 bg-gray-50/80 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700/50 space-y-3"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-600 flex items-center justify-center shadow-sm">
                                                                        <CreditCard size={14} className="text-gray-400" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">NIK Identity</p>
                                                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{patient.nik}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="w-full h-px bg-gray-100 dark:bg-gray-600/50"></div>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-600 flex items-center justify-center shadow-sm">
                                                                        <MapPin size={14} className="text-gray-400" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Resident Address</p>
                                                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-tight">{patient.address || '-'}</p>
                                                                    </div>
                                                                </div>
                                                            </motion.div>

                                                            <div className="grid grid-cols-2 gap-3 mt-4">
                                                                <motion.button
                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    transition={{ delay: 0.2 }}
                                                                    onClick={(e) => { e.stopPropagation(); setPatientFound(null); }}
                                                                    className="py-3.5 rounded-2xl text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                                                                >
                                                                    Cancel Selection
                                                                </motion.button>
                                                                <motion.button
                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    transition={{ delay: 0.3 }}
                                                                    onClick={(e) => { e.stopPropagation(); setShowCardModal(true); }}
                                                                    className="py-3.5 rounded-2xl text-xs font-bold text-white bg-black dark:bg-white dark:text-black shadow-lg shadow-gray-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                                                                >
                                                                    <CreditCard size={16} /> Print ID Card
                                                                </motion.button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            searchTerm ? (
                                <div className="bg-white/40 dark:bg-gray-800/40 border-2 border-dashed border-gray-300/50 dark:border-gray-700/50 rounded-[24px] p-6 text-center flex flex-col items-center justify-center gap-4 min-h-[300px] hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors group">
                                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform duration-300">
                                        <User size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300">Patient Not Found</h3>
                                        <p className="text-xs text-gray-400 mt-1 max-w-[150px] mx-auto">"{searchTerm}" did not match any records.</p>
                                    </div>
                                    <button onClick={() => setShowNewPatientModal(true)} className="mt-2 bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-gray-900/10 hover:scale-105 active:scale-95 transition-all">
                                        + New Patient
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    {/* Header & Filter */}
                                    <div className="flex justify-between items-center px-1">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <Activity size={14} className="text-blue-500" /> Recent Patients
                                        </h3>
                                        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
                                            {['all', 'today'].map(filter => (
                                                <button
                                                    key={filter}
                                                    onClick={() => setRecentFilter(filter)}
                                                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${recentFilter === filter ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    {filter}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* List */}
                                    <div className="space-y-3">
                                        {recentPatients.length === 0 ? (
                                            <div className="text-center py-10 text-gray-400 text-xs italic border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                                                No recently viewed patients
                                            </div>
                                        ) : (
                                            recentPatients
                                                .filter(p => recentFilter === 'today' ? new Date(p.updatedAt).toDateString() === new Date().toDateString() : true)
                                                .slice(0, 5)
                                                .map(patient => (
                                                    <div
                                                        key={patient.id}
                                                        onClick={() => { setPatientFound(patient); setSearchResults([patient]); }}
                                                        className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-4 rounded-[20px] border border-white/20 shadow-sm hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all duration-300 flex items-center gap-4"
                                                    >
                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-110 transition-transform">
                                                            {patient.name.charAt(0)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{patient.name}</h4>
                                                            <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                                                                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">RM: {patient.no_rm}</span>
                                                                <span className="truncate max-w-[120px]">{patient.address}</span>
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                                                    </div>
                                                ))
                                        )}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL: SERVICES */}
                <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-8 flex flex-col overflow-y-auto rounded-[32px] min-h-[500px] lg:min-h-0 pb-40">
                    <div className="max-w-6xl mx-auto w-full space-y-8">

                        {/* Header */}
                        <div className="flex justify-between items-end pb-6 border-b border-gray-200 dark:border-gray-800">
                            <div>
                                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Service Selection</h2>
                                <p className="text-gray-500 font-medium mt-1">Choose clinic and doctor</p>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <div className="text-4xl font-light text-gray-900 dark:text-white tracking-tight">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                <div className="text-gray-400 font-medium text-sm mt-1 mb-4">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>

                                {paymentType === 'BPJS' && (
                                    <div className="bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full border border-green-200 dark:border-green-800">
                                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wide flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                            BPJS Active
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Step 1: Emergency Unit - Auto Selected */}
                        <section className="relative">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-red-500 mb-6 pl-1 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px]">1</span>
                                Emergency Unit (IGD)
                            </h3>
                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 flex items-center gap-4">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shadow-inner">
                                    <Siren size={32} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-red-700 dark:text-red-400">Instalasi Gawat Darurat</h4>
                                    <p className="text-sm text-red-500 font-medium">Auto-selected for emergency cases</p>
                                </div>
                            </div>
                        </section>

                        <div className="h-6"></div>

                        {/* Step 2: Doctor - Minimalist List/Grid */}
                        <section className="relative">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-6 pl-1">
                                2. Select Doctor
                            </h3>
                            {selectedClinic ? (

                                <motion.div
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                    layout
                                >
                                    <AnimatePresence mode="popLayout">
                                        {filteredDoctors.map((doc, index) => (
                                            <motion.button
                                                key={doc.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                                transition={{
                                                    delay: index * 0.05,
                                                    type: 'spring',
                                                    stiffness: 350,
                                                    damping: 25
                                                }}
                                                whileHover={{ scale: 1.03, zIndex: 10 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => setSelectedDoctor(doc.id)}
                                                className={`group relative p-4 rounded-2xl text-left border transition-all duration-300 flex items-center gap-4 overflow-hidden
                                                    ${selectedDoctor === doc.id
                                                        ? 'bg-white dark:bg-gray-800 border-blue-500 ring-4 ring-blue-500/10 shadow-2xl z-10'
                                                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/20'
                                                    }`}
                                            >
                                                {/* Selection Highlight */}
                                                {selectedDoctor === doc.id && (
                                                    <motion.div
                                                        layoutId="docActiveBorder"
                                                        className="absolute inset-0 border-2 border-blue-500 rounded-2xl"
                                                        initial={false}
                                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                    />
                                                )}

                                                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 shrink-0 border-2 border-white dark:border-gray-700 shadow-md group-hover:scale-110 transition-transform duration-300">
                                                    <img src={doc.photo_url || defaultAvatar} alt={doc.name} className="w-full h-full object-cover" />
                                                </div>

                                                <div className="flex-1 min-w-0 relative z-10">
                                                    <div className={`font-bold text-sm truncate transition-colors ${selectedDoctor === doc.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                                                        {doc.name}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500 font-medium truncate mb-2">{doc.specialist}</div>

                                                    {/* Minimalist Quota Pill with Animated Bar */}
                                                    {doc.quota && (
                                                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(doc.quota.current_count / doc.quota.max_quota) * 100}%` }}
                                                                transition={{ duration: 1, ease: "easeOut" }}
                                                                className={`h-full rounded-full ${doc.quota.current_count >= doc.quota.max_quota ? 'bg-red-500' : 'bg-green-500'}`}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Apple-style Animated Checkmark */}
                                                <div className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${selectedDoctor === doc.id ? 'bg-blue-500 scale-100 shadow-lg shadow-blue-500/40' : 'bg-transparent scale-0 opacity-0'}`}>
                                                    <CheckCircle size={14} className="text-white" strokeWidth={3} />
                                                </div>
                                            </motion.button>
                                        ))}
                                    </AnimatePresence>
                                    {filteredDoctors.length === 0 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-16 text-gray-400 text-sm bg-gray-50/50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200">No doctors scheduled.</motion.div>}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="h-48 flex flex-col items-center justify-center text-center text-gray-400 border border-dashed border-gray-200 rounded-[32px] bg-gray-50/30"
                                >
                                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                        <Stethoscope size={28} className="text-gray-300" />
                                    </div>
                                    <span className="text-xs font-medium uppercase tracking-wider opacity-70">Please Select a Poliklinik</span>
                                </motion.div>
                            )}
                        </section>




                        {/* Step 3: Payment / Guarantee */}
                        <section className="relative">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-6 pl-1 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px]">3</span>
                                Payment / Penjamin
                            </h3>
                            <div className="flex gap-4">
                                {[
                                    { id: 'UMUM', label: 'UMUM / PRIBADI', icon: <CreditCard size={20} />, color: 'blue' },
                                    { id: 'BPJS', label: 'BPJS KESEHATAN', icon: <Activity size={20} />, color: 'green' },
                                    { id: 'ASURANSI', label: 'ASURANSI LAIN', icon: <Umbrella size={20} />, color: 'purple' }
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setPaymentType(type.id)}
                                        className={`relative flex-1 py-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-3 group overflow-hidden
                                            ${paymentType === type.id
                                                ? `bg-white dark:bg-gray-800 border-${type.color}-500 shadow-xl shadow-${type.color}-500/20 scale-105 z-10`
                                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 text-gray-400 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-full transition-colors duration-300 ${paymentType === type.id ? `bg-${type.color}-500 text-white` : 'bg-gray-100 dark:bg-gray-700'}`}>
                                            {type.icon}
                                        </div>
                                        <span className={`font-bold text-xs tracking-wider ${paymentType === type.id ? `text-${type.color}-600 dark:text-${type.color}-400` : ''}`}>
                                            {type.label}
                                        </span>

                                        {/* Status Badge for BPJS */}
                                        {type.id === 'BPJS' && (
                                            <div className="absolute top-3 right-3">
                                                <span className="flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* BPJS Info Card (Visible only when BPJS is selected) */}
                            <AnimatePresence>
                                {paymentType === 'BPJS' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 rounded-2xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg text-green-600 dark:text-green-300">
                                                    <Activity size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-green-800 dark:text-green-300">BPJS Kesehatan Intergration</h4>
                                                    <p className="text-xs text-green-600 dark:text-green-400">SEP akan diterbitkan otomatis saat registrasi.</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-bold text-gray-400 uppercase">Status Peserta</div>
                                                <div className="font-bold text-green-600">AKTIF</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </section>

                        <div className="h-32"></div> {/* Spacer */}
                    </div>
                </div>
            </div>

            {/* FLOATING ACTION BAR - Glassmorphic Premium */}
            <div className="fixed bottom-6 left-4 right-4 lg:left-[calc(22%+2rem)] lg:right-6 z-[100]">
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-[32px] border border-white/40 dark:border-gray-700/40 p-3 pl-8 flex justify-between items-center shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)] transition-shadow duration-500 print:hidden">

                    <div className="flex items-center gap-10 text-sm font-medium">
                        <div className={`flex items-center gap-3 transition-all duration-300 ${patientFound ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-600'}`}>
                            <div className={`w-3 h-3 rounded-full transition-all duration-500 ring-4 ${patientFound ? 'bg-green-500 ring-green-500/20 scale-110' : 'bg-gray-200 dark:bg-gray-700 ring-transparent'}`}></div>
                            <span className="tracking-tight font-bold">Identity</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-200 dark:text-gray-700" />
                        <div className={`flex items-center gap-3 transition-all duration-300 ${selectedClinic ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-600'}`}>
                            <div className={`w-3 h-3 rounded-full transition-all duration-500 ring-4 ${selectedClinic ? 'bg-green-500 ring-green-500/20 scale-110' : 'bg-gray-200 dark:bg-gray-700 ring-transparent'}`}></div>
                            <span className="tracking-tight font-bold">Clinic</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-200 dark:text-gray-700" />
                        <div className={`flex items-center gap-3 transition-all duration-300 ${selectedDoctor ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-600'}`}>
                            <div className={`w-3 h-3 rounded-full transition-all duration-500 ring-4 ${selectedDoctor ? 'bg-green-500 ring-green-500/20 scale-110' : 'bg-gray-200 dark:bg-gray-700 ring-transparent'}`}></div>
                            <span className="tracking-tight font-bold">Doctor</span>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (paymentType === 'BPJS' && !sepData) {
                                setShowSEPModal(true);
                            } else {
                                handleCreateTicket();
                            }
                        }}
                        disabled={!patientFound || !selectedDoctor}
                        className="relative overflow-hidden bg-black dark:bg-white text-white dark:text-black px-10 py-5 rounded-[24px] font-bold text-base shadow-2xl shadow-blue-500/20 dark:shadow-none hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3 disabled:hover:scale-100 disabled:shadow-none group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:hidden"></div>
                        <Printer size={20} strokeWidth={2.5} className="relative z-10 group-hover:animate-pulse" />
                        <span className="relative z-10 tracking-tight">Register & Print</span>
                    </button>
                </div>
            </div>

            {/* NEW PATIENT MODAL */}
            <AnimatePresence>
                {showNewPatientModal && (
                    <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 z-50 flex items-center justify-center backdrop-blur-md p-4 print:hidden">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/20"
                        >
                            <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/30">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Registration Form</h2>
                                    <p className="text-gray-500 text-sm mt-1">Please fill in correct patient details</p>
                                </div>
                                <button onClick={() => setShowNewPatientModal(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><X size={20} className="text-gray-500 dark:text-gray-400" /></button>
                            </div>
                            <form onSubmit={handleCreatePatient} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                                        <input required className="w-full p-4 rounded-xl border-0 bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 transition-all font-medium" value={newPatient.name} onChange={e => setNewPatient({ ...newPatient, name: e.target.value })} placeholder="e.g. John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">NIK (ID Number)</label>
                                        <div className="flex gap-2">
                                            <input required maxLength={16} className="flex-1 p-3 rounded-xl border-0 bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 transition-all font-medium" value={newPatient.nik} onChange={e => setNewPatient({ ...newPatient, nik: e.target.value })} placeholder="16 Digits" />
                                            <button
                                                type="button"
                                                onClick={() => handleCheckBPJS()}
                                                disabled={bpjsChecking}
                                                className="px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-green-600/20"
                                            >
                                                {bpjsChecking ? '...' : 'Cek BPJS'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* BPJS FIELD AUTO-FILLED */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 flex justify-between">
                                            <span>No. Kartu BPJS</span>
                                            {bpjsStatus && <span className={bpjsStatus.keterangan === 'AKTIF' ? 'text-green-500' : 'text-red-500'}>{bpjsStatus.keterangan}</span>}
                                        </label>
                                        <input
                                            className={`w-full p-4 rounded-xl border-0 bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 transition-all font-medium ${newPatient.is_bpjs ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
                                            value={newPatient.bpjs_card_no}
                                            onChange={e => setNewPatient({ ...newPatient, bpjs_card_no: e.target.value })}
                                            placeholder="Auto-filled"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Date of Birth</label>
                                        <input required type="date" className="w-full p-4 rounded-xl border-0 bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 transition-all font-medium" value={newPatient.birth_date} onChange={e => setNewPatient({ ...newPatient, birth_date: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone</label>
                                        <input className="w-full p-4 rounded-xl border-0 bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 transition-all font-medium" value={newPatient.phone} onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })} placeholder="08..." />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Address</label>
                                        <textarea required className="w-full p-4 rounded-xl border-0 bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 transition-all font-medium resize-none h-24" value={newPatient.address} onChange={e => setNewPatient({ ...newPatient, address: e.target.value })} placeholder="Complete address..." />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowNewPatientModal(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                                    <button type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95">Register Patient</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MEMBER CARD MODAL */}
            <AnimatePresence>
                {showCardModal && patientFound && (
                    <div className="fixed inset-0 bg-gray-900/80 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static print:flex print:items-start print:justify-start">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl shadow-2xl mx-auto max-w-md w-full overflow-hidden print:shadow-none print:w-[8.5cm] print:h-[5.4cm] print:rounded-none"
                        >
                            {/* Card Content - ID Card Size */}
                            <div className="relative w-[350px] h-[220px] mx-auto m-8 rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-blue-600 to-indigo-800 text-white print:m-0 print:w-full print:h-full print:shadow-none print:rounded-none">
                                {/* Background Patterns */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8 blur-xl"></div>

                                <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                                    {/* Header */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-700 font-bold">H</div>
                                            <div className="leading-none">
                                                <h1 className="text-xs font-bold opacity-90 tracking-widest">HOSPITAL</h1>
                                                <h2 className="text-[8px] opacity-70">MEMBER CARD</h2>
                                            </div>
                                        </div>
                                        <div className="text-[10px] bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">
                                            PASIEN UMUM
                                        </div>
                                    </div>

                                    {/* Main Info */}
                                    <div className="flex gap-4 items-center">
                                        <div className="w-16 h-16 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30 flex items-center justify-center">
                                            <User size={32} className="opacity-80" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold leading-tight">{patientFound.name}</h3>
                                            <p className="text-[10px] opacity-80 mt-1">{patientFound.gender === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'}</p>
                                            <p className="text-[10px] opacity-80">Lahir: {new Date(patientFound.birth_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {/* Footer / RM */}
                                    <div className="bg-white text-black p-2 rounded-lg flex justify-between items-center">
                                        <div className="text-left">
                                            <p className="text-[8px] text-gray-500 font-bold uppercase">No. Rekam Medis</p>
                                            <p className="text-lg font-black tracking-widest font-mono">{patientFound.no_rm}</p>
                                        </div>
                                        <div className="bg-white p-1">
                                            <QRCodeCanvas value={patientFound.no_rm} size={40} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between print:hidden">
                                <button onClick={() => setShowCardModal(false)} className="text-sm font-bold text-gray-500 hover:text-gray-700">Close</button>
                                <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                                    <Printer size={16} /> Print Card
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* TICKET RECEIPT MODAL */}
            <AnimatePresence>
                {ticketData && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static print:block">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl print:shadow-none print:w-full print:max-w-none print:rounded-none"
                        >
                            <div className="p-8 text-center print:text-left print:p-0">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 print:hidden">
                                    <CheckCircle size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-1 print:hidden">Registration Success!</h2>

                                {/* TICKET VISUAL */}
                                <div className="mt-6 bg-gray-50 border-2 border-dashed border-gray-200 p-6 rounded-2xl relative print:border-none print:p-0 print:bg-transparent">
                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-r-2 border-dashed border-gray-200 print:hidden"></div>
                                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l-2 border-dashed border-gray-200 print:hidden"></div>

                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">NOMOR ANTRIAN</div>
                                    <div className="text-5xl font-black text-gray-900 mb-4 tracking-tighter">{ticketData.queue_code}</div>

                                    <div className="space-y-2 border-t border-gray-100 pt-4 print:border-black">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Poli</span>
                                            <span className="font-bold text-gray-900">{ticketData.clinicName}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Dokter</span>
                                            <span className="font-bold text-gray-900">{ticketData.doctorName}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Pasien</span>
                                            <span className="font-bold text-gray-900">{ticketData.patient.name}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-[10px] text-gray-400">
                                        {new Date().toLocaleString()}
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-3 print:hidden">
                                    <button onClick={() => setTicketData(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200">Close</button>
                                    <button onClick={handlePrintTicket} className="flex-1 py-3 bg-blue-600 rounded-xl font-bold text-white hover:bg-blue-700 flex items-center justify-center gap-2">
                                        <Printer size={18} /> Print
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { margin: 0; }
                    body * { visibility: hidden; }
                    /* Only show the ticket or card when printing */
                    ${ticketData ? '.fixed, .fixed * { visibility: visible; } .print\\:hidden { display: none !important; }' : ''}
                    ${showCardModal ? '.fixed, .fixed * { visibility: visible; } .print\\:hidden { display: none !important; }' : ''}
                }
            `}</style>
            {/* COUNTER PANEL DRAWER */}
            <AnimatePresence>
                {isCounterOpen && (
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed bottom-0 right-0 md:right-6 md:bottom-24 w-full md:w-[420px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-3xl md:rounded-[32px] shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden z-[90] flex flex-col max-h-[80vh] ring-1 ring-black/5 dark:ring-white/10"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/80 dark:bg-black/40 cursor-pointer select-none" onClick={() => setIsCounterOpen(false)}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-salm-blue to-salm-light-blue flex items-center justify-center text-white shadow-lg shadow-salm-blue/30 ring-2 ring-white dark:ring-gray-700">
                                    <Bell size={20} className={counterLoading ? 'animate-bounce' : ''} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white leading-tight">Staff Counter</h3>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
                                        {isCounterInitialized ? (
                                            <>
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                {counterConfig.counterName}
                                            </>
                                        ) : 'Setup Required'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setIsCounterOpen(false); }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-full transition-colors text-gray-400">
                                <ChevronDown size={20} />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-0 relative custom-scrollbar">
                            {!isCounterInitialized ? (
                                // SETUP FORM
                                <div className="p-6 space-y-6">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3 text-salm-blue">
                                            <Settings size={32} />
                                        </div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">Configure Counter</h4>
                                        <p className="text-xs text-gray-500 mt-1">Select your booth and voice settings</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">Voice Assistant</label>
                                            <div className="flex gap-2">
                                                <select
                                                    className="flex-1 bg-gray-50 dark:bg-gray-800 border-0 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-salm-blue/50"
                                                    value={counterConfig.voiceName}
                                                    onChange={(e) => {
                                                        setCounterConfig({ ...counterConfig, voiceName: e.target.value });
                                                        // Auto-test on change
                                                        const utt = new SpeechSynthesisUtterance("Tes suara antrian.");
                                                        const v = availableVoices.find(val => val.name === e.target.value);
                                                        if (v) utt.voice = v;
                                                        utt.lang = 'id-ID'; utt.pitch = 1.1;
                                                        window.speechSynthesis.cancel();
                                                        window.speechSynthesis.speak(utt);
                                                    }}
                                                >
                                                    <option value="">-- Auto Select (Indonesian) --</option>
                                                    {availableVoices.filter(v => v.lang.includes('id')).map(v => (
                                                        <option key={v.name} value={v.name}>
                                                            {v.name.includes('Google') ? '🌟 ' : ''}🇮🇩 {v.name}
                                                        </option>
                                                    ))}
                                                    <optgroup label="Other Voices">
                                                        {availableVoices.filter(v => !v.lang.includes('id')).map(v => (
                                                            <option key={v.name} value={v.name}>{v.name}</option>
                                                        ))}
                                                    </optgroup>
                                                </select>
                                                <button
                                                    onClick={() => {
                                                        const text = "Nomor antrian, A 1. Silakan menuju loket 1.";
                                                        speak(text);
                                                    }}
                                                    className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-3 rounded-xl hover:bg-blue-200 transition-colors"
                                                    title="Test Voice"
                                                >
                                                    <Volume2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">Counter Number</label>
                                            <select
                                                className="w-full bg-gray-50 dark:bg-gray-800 border-0 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-salm-blue/50"
                                                value={counterConfig.counterName}
                                                onChange={(e) => setCounterConfig({ ...counterConfig, counterName: e.target.value })}
                                            >
                                                <option value="">-- Select Counter --</option>
                                                {counters.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">Filter Specialty</label>
                                            <select
                                                className="w-full bg-gray-50 dark:bg-gray-800 border-0 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-salm-blue/50"
                                                value={counterConfig.poliId}
                                                onChange={(e) => setCounterConfig({ ...counterConfig, poliId: e.target.value })}
                                            >
                                                <option value="all">All Specialties</option>
                                                {clinics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleInitCounter}
                                        disabled={!counterConfig.counterName}
                                        className="w-full bg-salm-blue hover:bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Initialize Counter
                                    </button>
                                </div>
                            ) : (
                                // ACTIVE COUNTER UI
                                <div className="flex flex-col h-full">
                                    {/* Status Bar */}
                                    <div className="px-6 py-3 bg-blue-50/50 dark:bg-blue-900/10 flex justify-between items-center border-b border-gray-100 dark:border-gray-800/50">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300">
                                            <Users size={14} className="text-salm-blue" />
                                            Waiting: <span className="text-gray-900 dark:text-white">{waitingList.length}</span>
                                        </div>
                                        <button onClick={() => setShowSkippedModal(true)} className="flex items-center gap-2 text-xs font-bold text-orange-500 hover:text-orange-600 px-2 py-1 hover:bg-orange-50 rounded-lg transition-colors">
                                            <LogOut size={14} /> Skipped: {skippedList.length}
                                        </button>
                                    </div>

                                    {/* WAITING LIST & CURRENT TICKET */}
                                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                                        {/* Current Ticket Area (Compact) */}
                                        <div className="p-6 text-center space-y-2 relative overflow-hidden shrink-0">
                                            {/* Decorative BG */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl -z-10"></div>

                                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Current Ticket</p>
                                            {currentTicket ? (
                                                <motion.div
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    key={currentTicket.queue_code}
                                                    className="relative z-10"
                                                >
                                                    <div className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter mb-2 font-mono">
                                                        {currentTicket.queue_code}
                                                    </div>
                                                    <div className="inline-block px-4 py-1.5 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300">
                                                        {currentTicket.poli_name}
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <div className="text-gray-300 dark:text-gray-600 py-4">
                                                    <Bell size={48} className="mx-auto mb-2 opacity-50" />
                                                    <span className="text-sm font-bold">Ready to Call</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Waiting List Section */}
                                        <div className="px-6 pb-6 flex-1">
                                            <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-10 py-2 border-b border-gray-100 dark:border-gray-800 mb-2">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <span>Queue List</span>
                                                    <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
                                                </div>
                                            </div>

                                            <div className="space-y-2 pb-4">
                                                {waitingList.length === 0 ? (
                                                    <div className="text-center py-8 text-gray-400 text-xs italic bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                                        No patient in queue
                                                    </div>
                                                ) : (
                                                    waitingList.map((queue, idx) => (
                                                        <div key={queue.id} className="flex justify-between items-center p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${idx === 0 ? 'bg-green-100 text-green-600 ring-2 ring-green-500/20' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                                                    {idx + 1}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-sm text-gray-800 dark:text-white leading-none mb-1">{queue.queue_code}</div>
                                                                    <div className="text-[10px] text-gray-500 leading-none">{queue.daily_quota.doctor.poliklinik.name}</div>
                                                                </div>
                                                            </div>
                                                            {idx === 0 && (
                                                                <span className="text-[9px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Next</span>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Controls */}
                                    <div className="p-6 bg-gray-50/80 dark:bg-black/20 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 space-y-3 shrink-0">

                                        {/* Call Next (Primary) */}
                                        <button
                                            onClick={handleCallNext}
                                            disabled={counterLoading || currentTicket}
                                            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-lg shadow-xl shadow-gray-900/10 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                        >
                                            {counterLoading ? <Activity className="animate-spin" /> : <Bell size={24} />}
                                            {counterLoading ? 'Calling...' : 'Call Next Patient'}
                                        </button>

                                        {/* Secondary Actions */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <button
                                                onClick={handleRecall}
                                                disabled={!currentTicket}
                                                className="py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50 flex flex-col items-center justify-center gap-1"
                                            >
                                                <Mic size={16} /> Recall
                                            </button>
                                            <button
                                                onClick={handleSkipTicket}
                                                disabled={!currentTicket}
                                                className="py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50 flex flex-col items-center justify-center gap-1"
                                            >
                                                <LogOut size={16} /> Skip
                                            </button>
                                            <button
                                                onClick={handleFinishTicket}
                                                disabled={!currentTicket}
                                                className="py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition disabled:opacity-50 flex flex-col items-center justify-center gap-1"
                                            >
                                                <CheckCircle size={16} /> Finish
                                            </button>
                                        </div>

                                        <div className="pt-2 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                            <span className="flex items-center gap-1"><Volume2 size={10} /> {counterConfig.voiceName.slice(0, 12)}...</span>
                                            <button
                                                onClick={handleLogoutCounter}
                                                className="group relative pl-3 pr-4 py-1.5 rounded-full bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-all duration-300 shadow-sm hover:shadow-red-500/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center gap-2 overflow-hidden"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 group-hover:bg-white transition-colors animate-pulse"></div>
                                                <span className="relative z-10">Disconnect</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SKIPPED LIST MODAL (REUSED FOR REGISTRATION CONTEXT) */}
            <AnimatePresence>
                {showSkippedModal && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-white/20"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white">Skipped Patients</h3>
                                <button onClick={() => setShowSkippedModal(false)} className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-gray-500"><X size={18} /></button>
                            </div>
                            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
                                {skippedList.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 text-sm">No skipped patients</div>
                                ) : (
                                    skippedList.map((queue) => (
                                        <div key={queue.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600">
                                            <div>
                                                <div className="font-black text-lg text-gray-800 dark:text-white">{queue.queue_code}</div>
                                                <div className="text-xs text-gray-500">{queue.daily_quota.doctor.poliklinik.name}</div>
                                            </div>
                                            <button onClick={() => handleRecallSkipped(queue)} className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-xl font-bold text-xs hover:bg-blue-200 transition">
                                                Recall
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* SEP MODAL */}
            <AnimatePresence>
                {showSEPModal && patientFound && (
                    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl border border-white/20"
                        >
                            <div className="bg-green-600 p-6 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-xl">Penerbitan SEP (Simulasi)</h3>
                                    <p className="text-green-100 text-sm">Surat Eligibilitas Peserta - BPJS Kesehatan</p>
                                </div>
                                <div className="bg-white/20 px-3 py-1 rounded-lg text-xs font-mono">
                                    V-CLAIM BRIDGING
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                {/* Header Info */}
                                <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-800/20">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-lg">
                                        {patientFound.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{patientFound.name}</h4>
                                        <p className="text-xs text-gray-500">NO. KARTU: <span className="font-mono font-bold text-gray-700">{patientFound.bpjs_card_no || '-'}</span></p>
                                        <p className="text-xs text-gray-500">NIK: <span className="font-mono">{patientFound.nik}</span></p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">No. Rujukan (Faskes 1)</label>
                                        <input
                                            value={sepInput.rujukan}
                                            onChange={e => setSepInput({ ...sepInput, rujukan: e.target.value })}
                                            className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-mono focus:ring-2 focus:ring-green-500 outline-none transition"
                                            placeholder="1234567..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Diagnosa Awal (ICD-10)</label>
                                        <input
                                            value={sepInput.diagnosa}
                                            onChange={e => setSepInput({ ...sepInput, diagnosa: e.target.value })}
                                            className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none transition"
                                            placeholder="Contoh: DEMAM (R50.9)"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setShowSEPModal(false)}
                                        className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            setSepLoading(true);
                                            try {
                                                const res = await api.post('/bpjs/sep/insert', {
                                                    noKartu: patientFound.bpjs_card_no || '000000',
                                                    poli: selectedClinic, // ID Poli
                                                    rujukan: sepInput.rujukan,
                                                    diagnosa: sepInput.diagnosa
                                                });
                                                if (res.data.status === 'OK') {
                                                    setSepData(res.data.data);
                                                    toast.success('SEP Berhasil Terbit!');
                                                    setShowSEPModal(false);
                                                    // Continue to Create Ticket
                                                    handleCreateTicket();
                                                }
                                            } catch (e) {
                                                toast.error('Gagal terbit SEP');
                                            } finally {
                                                setSepLoading(false);
                                            }
                                        }}
                                        disabled={sepLoading}
                                        className="flex-[2] py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-xl shadow-green-600/20 transition flex items-center justify-center gap-2"
                                    >
                                        {sepLoading ? <Activity className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                        {sepLoading ? 'Processing...' : 'Terbitkan SEP & Booking'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </PageWrapper>
    );
};

export default RegistrationIGD;
