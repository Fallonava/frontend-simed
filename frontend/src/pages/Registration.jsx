import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, User, FileText, Printer, CheckCircle, MapPin, Phone, CreditCard, Stethoscope, Activity, ChevronRight, X, ArrowRight, RefreshCcw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../utils/axiosConfig';
import PageWrapper from '../components/PageWrapper';

const Registration = () => {
    const navigate = useNavigate(); // Added hook
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
        phone: ''
    });

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [poliRes, docRes] = await Promise.all([
                    api.get('/polies'),
                    api.get('/doctors-master')
                ]);
                setClinics(poliRes.data);
                setDoctors(docRes.data);
            } catch (error) {
                console.error("Failed to load master data", error);
                toast.error("Failed to load clinic/doctor data");
            }
        };
        fetchMasterData();
    }, []);

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
                            <button onClick={() => navigate('/admin/counter')} className="flex-1 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-md transition-all rounded-xl px-4 py-2.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 flex items-center justify-center gap-2 group">
                                Counter <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
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
                            <div className="bg-white/40 dark:bg-gray-800/40 border-2 border-dashed border-gray-300/50 dark:border-gray-700/50 rounded-[24px] p-6 text-center flex flex-col items-center justify-center gap-4 min-h-[300px] hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors group">
                                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform duration-300">
                                    <User size={28} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300">Patient Not Found</h3>
                                    <p className="text-xs text-gray-400 mt-1 max-w-[150px] mx-auto">Use the search bar or register a new patient</p>
                                </div>
                                <button onClick={() => setShowNewPatientModal(true)} className="mt-2 bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-gray-900/10 hover:scale-105 active:scale-95 transition-all">
                                    + New Patient
                                </button>
                            </div>
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
                            <div className="text-right">
                                <div className="text-4xl font-light text-gray-900 dark:text-white tracking-tight">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                <div className="text-gray-400 font-medium text-sm mt-1">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            </div>
                        </div>

                        {/* Step 1: Clinic - Vibrant Modern Elegant */}
                        <section className="relative">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-6 pl-1 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px]">1</span>
                                Select Poliklinik
                            </h3>
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {clinics.map((clinic, index) => (
                                    <motion.button
                                        key={clinic.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            delay: index * 0.05,
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 25
                                        }}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => { setSelectedClinic(clinic.id); setSelectedDoctor(null); }}
                                        className={`relative h-36 rounded-[24px] flex flex-col items-center justify-center gap-4 transition-all duration-300 group overflow-hidden border border-transparent
                                            ${selectedClinic === clinic.id
                                                ? 'shadow-2xl shadow-blue-500/30 scale-[1.02]'
                                                : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-white/80 dark:hover:bg-gray-700/80 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/50 hover:border-white/50'
                                            }`}
                                    >
                                        {/* Animated Fluid Background for Selection */}
                                        {selectedClinic === clinic.id && (
                                            <motion.div
                                                layoutId="clinicActiveBg"
                                                className="absolute inset-0 bg-gradient-to-bl from-blue-600 to-indigo-600"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}

                                        {/* Glassy Glow Effect on Hover (Unselected) */}
                                        {selectedClinic !== clinic.id && (
                                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        )}

                                        <div className={`relative z-10 p-4 rounded-full transition-all duration-300 shadow-sm
                                            ${selectedClinic === clinic.id
                                                ? 'bg-white/20 backdrop-blur-md shadow-inner text-white ring-2 ring-white/30'
                                                : 'bg-gray-50 dark:bg-gray-700/50 text-gray-300 dark:text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:scale-110'
                                            }`}>
                                            <Stethoscope size={28} strokeWidth={selectedClinic === clinic.id ? 2.5 : 2} />
                                        </div>

                                        <span className={`relative z-10 font-bold text-xs tracking-wide transition-colors px-2 truncate w-full
                                            ${selectedClinic === clinic.id ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`}>
                                            {clinic.name}
                                        </span>

                                        {/* Active State Indicator Dot */}
                                        {selectedClinic === clinic.id && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.1, type: 'spring' }}
                                                className="absolute top-3 right-3 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                                            />
                                        )}
                                    </motion.button>
                                ))}
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
                                                    <img src={`https://ui-avatars.com/api/?name=${doc.name}&background=random`} alt={doc.name} className="w-full h-full object-cover" />
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

                        <hr className="border-gray-200 dark:border-gray-800 border-dashed opacity-50" />

                        {/* Step 3: Payment */}
                        <section className="relative">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">3</span> PAYMENT</h3>
                            <div className="flex gap-5">
                                {[
                                    { id: 'TUNAI', label: 'TUNAI', icon: <CreditCard size={20} />, style: 'from-emerald-400 to-emerald-600 shadow-emerald-500/40' },
                                    { id: 'BPJS', label: 'BPJS', icon: <CheckCircle size={20} />, style: 'from-green-500 to-green-700 shadow-green-600/40' },
                                    { id: 'ASURANSI', label: 'ASURANSI', icon: <Activity size={20} />, style: 'from-blue-500 to-indigo-600 shadow-indigo-500/40' }
                                ].map((method, idx) => (
                                    <motion.button
                                        key={method.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + (idx * 0.1) }}
                                        onClick={() => setPaymentMethod(method.id)}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`relative overflow-hidden px-8 py-6 rounded-3xl font-bold text-xs transition-all duration-300 flex items-center gap-4 w-48 justify-center group
                                            ${paymentMethod === method.id
                                                ? `bg-gradient-to-br ${method.style} text-white shadow-2xl scale-105`
                                                : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm text-gray-400 dark:text-gray-500 hover:shadow-lg hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="relative z-10 flex items-center gap-3">
                                            {paymentMethod === method.id && (
                                                <motion.div
                                                    layoutId="paymentGlow"
                                                    className="absolute inset-0 bg-white/20 rounded-full blur-xl"
                                                    initial={false}
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                />
                                            )}
                                            <div className={`transition-transform duration-500 ${paymentMethod === method.id ? 'scale-125 rotate-6' : 'group-hover:scale-110'}`}>
                                                {method.icon}
                                            </div>
                                            <span className="relative z-10 text-sm tracking-wide">{method.label}</span>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
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
                        onClick={handleRegister}
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
                                        <input required maxLength={16} className="w-full p-4 rounded-xl border-0 bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 transition-all font-medium" value={newPatient.nik} onChange={e => setNewPatient({ ...newPatient, nik: e.target.value })} placeholder="16 Digits" />
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
        </PageWrapper>
    );
};

export default Registration;
