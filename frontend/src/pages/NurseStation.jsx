import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Activity, Clipboard, Clock, Heart, Plus, Search, User,
    Thermometer, Droplet, Wind, FileText, ChevronRight,
    AlertCircle, CheckCircle, Stethoscope, Pill, ShieldAlert,
    Timer, MapPin, Gauge, LayoutDashboard, Calendar, Filter,
    RefreshCw, Siren, Bed, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import PageWrapper from '../components/PageWrapper';
import ModernHeader from '../components/ModernHeader';
import { useNavigate } from 'react-router-dom';
import useQueueStore from '../store/useQueueStore';
import SmoothScrollArea from '../components/SmoothScrollArea';

// Unit Selector Configuration
const UNITS = [
    { id: 'IGD', label: 'Emergency', icon: Siren, color: 'text-red-500' },
    { id: 'POLI', label: 'Outpatient', icon: Stethoscope, color: 'text-blue-500' },
    { id: 'WARD', label: 'Inpatient', icon: Bed, color: 'text-orange-500' },
    { id: 'ICU', label: 'ICU', icon: Activity, color: 'text-purple-500' }
];

const NurseStation = () => {
    const navigate = useNavigate();
    const { socket } = useQueueStore();

    // Shared State
    const [allPatients, setAllPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [clinicalData, setClinicalData] = useState(null);
    const [activeAction, setActiveAction] = useState('cppt');
    const [viewUnit, setViewUnit] = useState('POLI'); // Default to Outpatient
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Count helpers
    const getCount = (unitId) => {
        if (!allPatients) return 0;
        if (unitId === 'IGD') {
            return allPatients.filter(p => p._isQueue && (p.poliklinik?.name?.toLowerCase().includes('igd') || p.poliklinik?.name?.toLowerCase().includes('emergency') || p.poliklinik?.name?.toLowerCase().includes('gawat'))).length;
        }
        if (unitId === 'POLI') {
            return allPatients.filter(p => p._isQueue && !(p.poliklinik?.name?.toLowerCase().includes('igd') || p.poliklinik?.name?.toLowerCase().includes('emergency') || p.poliklinik?.name?.toLowerCase().includes('gawat'))).length;
        }
        if (unitId === 'ICU') {
            return allPatients.filter(p => p._isAdmitted && (p.bed?.room?.name?.toLowerCase().includes('icu') || p.bed?.room?.type === 'ICU')).length;
        }
        // WARD
        return allPatients.filter(p => p._isAdmitted && !p.bed?.room?.name?.toLowerCase().includes('igd') && !p.bed?.room?.name?.toLowerCase().includes('icu')).length;
    };

    // --- Data Sync Logic ---
    const fetchData = useCallback(async () => {
        setIsLoading(prev => prev && allPatients.length === 0); // Only show spinner on first load
        try {
            const [queueRes, admissionRes] = await Promise.all([
                api.get('/triage/queue'),
                api.get('/nurse/active-inpatients')
            ]);

            const queueItems = queueRes.data.map(q => ({ ...q, _isQueue: true }));
            const admittedItems = admissionRes.data.map(a => ({ ...a, _isAdmitted: true }));

            setAllPatients([...queueItems, ...admittedItems]);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Sync failed', error);
        } finally {
            setIsLoading(false);
        }
    }, [allPatients.length]);

    useEffect(() => {
        fetchData();

        // Safety Strategy: Socket + Polling Backup
        const interval = setInterval(fetchData, 60000); // 60s backup poll

        if (socket) {
            socket.on('queue_update', fetchData);
            socket.on('admission_update', fetchData);
            socket.on('triage_new', () => { toast('New Patient in Triage', { icon: '🚨' }); fetchData(); });
        }

        return () => {
            clearInterval(interval);
            if (socket) {
                socket.off('queue_update', fetchData);
                socket.off('admission_update', fetchData);
                socket.off('triage_new');
            }
        };
    }, [socket, fetchData]);

    // --- Filtering Logic ---
    useEffect(() => {
        let filtered = allPatients;

        // Unit Filter
        if (viewUnit === 'IGD') {
            filtered = filtered.filter(p => {
                if (p._isQueue) return p.poliklinik?.name?.toLowerCase().includes('igd') || p.poliklinik?.name?.toLowerCase().includes('emergency') || p.poliklinik?.name?.toLowerCase().includes('gawat');
                return p.bed?.room?.name?.toLowerCase().includes('igd') || p.bed?.room?.type === 'IGD' || p.bed?.room?.name?.toLowerCase().includes('gawat');
            });
        } else if (viewUnit === 'POLI') {
            filtered = filtered.filter(p => p._isQueue && !p.poliklinik?.name?.toLowerCase().includes('igd') && !p.poliklinik?.name?.toLowerCase().includes('emergency') && !p.poliklinik?.name?.toLowerCase().includes('gawat'));
        } else if (viewUnit === 'ICU') {
            filtered = filtered.filter(p => p._isAdmitted && (p.bed?.room?.name?.toLowerCase().includes('icu') || p.bed?.room?.type === 'ICU'));
        } else {
            // WARD
            filtered = filtered.filter(p => p._isAdmitted && !p.bed?.room?.name?.toLowerCase().includes('igd') && !p.bed?.room?.name?.toLowerCase().includes('icu'));
        }

        // Search
        if (searchTerm) {
            const low = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.patient?.name?.toLowerCase().includes(low) ||
                p.patient?.no_rm?.toLowerCase().includes(low)
            );
        }

        setFilteredPatients(filtered);
    }, [allPatients, viewUnit, searchTerm]);

    // --- Selection Logic ---
    const handleSelectPatient = async (p) => {
        setSelectedPatient(p);
        if (p._isAdmitted) {
            setActiveAction('cppt');
            try {
                const res = await api.get(`/inpatient/${p.id}/clinical`);
                setClinicalData(res.data);
            } catch (error) {
                toast.error('Failed to load clinical workspace');
            }
        } else {
            setActiveAction('triage');
            setClinicalData(null);
        }
    };

    return (
        <PageWrapper title="Nurse Clinical Hub">
            <Toaster position="top-right" toastOptions={{
                style: { background: '#333', color: '#fff', borderRadius: '12px' }
            }} />

            <div className="flex flex-col h-[calc(100vh-80px)] max-w-[1920px] mx-auto p-4 md:p-6 gap-6 overflow-hidden">

                {/* Header & Controls */}
                <ModernHeader
                    title="Nurse Station"
                    subtitle="Real-time Patient Monitoring & Care"
                    onBack={() => navigate('/menu')}
                >
                    <div className="flex bg-black/5 dark:bg-white/10 backdrop-blur-md p-1 rounded-xl border border-black/5 dark:border-white/10 overflow-x-auto">
                        {UNITS.map(unit => (
                            <button
                                key={unit.id}
                                onClick={() => { setViewUnit(unit.id); setSelectedPatient(null); }}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 font-bold text-xs whitespace-nowrap
                                    ${viewUnit === unit.id
                                        ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                            >
                                <unit.icon size={14} className={viewUnit === unit.id ? 'text-current' : unit.color} />
                                <span>{unit.label}</span>
                                {getCount(unit.id) > 0 && (
                                    <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${viewUnit === unit.id ? 'bg-black/10 dark:bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                        {getCount(unit.id)}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </ModernHeader>

                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 px-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Sync Active • Last updated: {lastUpdated.toLocaleTimeString()}
                </div>

                {/* Main Workspace */}
                <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">

                    {/* LEFT PANEL: Patient List */}
                    <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col gap-4 shrink-0">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search Name or RM..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-[24px] bg-white dark:bg-gray-800 border border-transparent focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm transition-all font-medium text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* List */}
                        <SmoothScrollArea className="flex-1 pb-20" contentClassName="pr-2 space-y-3">
                            <AnimatePresence mode="popLayout">
                                {isLoading && allPatients.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 opacity-50 space-y-4">
                                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        <p className="font-bold text-sm">Syncing Data...</p>
                                    </div>
                                ) : filteredPatients.length === 0 ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 px-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[32px]">
                                        <User size={40} className="mx-auto mb-3 text-gray-300" />
                                        <p className="text-gray-400 font-bold">No patients found in {viewUnit}</p>
                                    </motion.div>
                                ) : (
                                    filteredPatients.map(p => (
                                        <PatientCard
                                            key={p.id}
                                            patient={p}
                                            isSelected={selectedPatient?.id === p.id}
                                            onClick={() => handleSelectPatient(p)}
                                        />
                                    ))
                                )}
                            </AnimatePresence>
                        </SmoothScrollArea>
                    </div>

                    {/* RIGHT PANEL: Workspace */}
                    <div className="flex-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-3xl rounded-[40px] border border-white/40 dark:border-gray-700/50 shadow-2xl relative overflow-hidden flex flex-col">
                        <AnimatePresence mode="wait">
                            {selectedPatient ? (
                                <motion.div
                                    key={selectedPatient.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex flex-col h-full"
                                >
                                    <WorkspaceHeader
                                        patient={selectedPatient}
                                        activeAction={activeAction}
                                        setActiveAction={setActiveAction}
                                    />

                                    <SmoothScrollArea className="flex-1" contentClassName="p-8">
                                        {selectedPatient._isQueue ? (
                                            <TriageAssessmentForm
                                                patientRecord={selectedPatient}
                                                onSuccess={() => { setSelectedPatient(null); fetchData(); }}
                                            />
                                        ) : (
                                            activeAction === 'cppt' ? (
                                                <CPPTView
                                                    admissionId={selectedPatient.id}
                                                    observations={clinicalData?.admission?.observations || []}
                                                    refresh={() => handleSelectPatient(selectedPatient)}
                                                />
                                            ) : (
                                                <MARView
                                                    admissionId={selectedPatient.id}
                                                    logs={clinicalData?.admission?.medication_logs || []}
                                                    prescriptions={clinicalData?.prescriptions || []}
                                                    refresh={() => handleSelectPatient(selectedPatient)}
                                                />
                                            )
                                        )}
                                    </SmoothScrollArea>
                                </motion.div>
                            ) : (
                                <EmptyStatePlaceholder />
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </PageWrapper>
    );
};

// --- Sub Components ---

const PatientCard = ({ patient, isSelected, onClick }) => (
    <motion.div
        layoutId={`card-${patient.id}`}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`p-5 rounded-[24px] cursor-pointer border-2 transition-all duration-300 relative overflow-hidden group
            ${isSelected
                ? 'bg-gradient-to-br from-gray-900 to-gray-800 dark:from-blue-600 dark:to-blue-800 border-transparent text-white shadow-xl'
                : 'bg-white dark:bg-gray-800 border-transparent hover:border-blue-200 dark:hover:border-gray-700 shadow-sm hover:shadow-lg'
            }`}
    >
        <div className="flex justify-between items-start mb-3 relative z-10">
            <div>
                <h4 className={`font-black text-base leading-tight ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {patient.patient?.name}
                </h4>
                <div className={`flex items-center gap-2 text-[10px] font-bold mt-1 uppercase tracking-widest ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>
                    <span>RM: {patient.patient?.no_rm}</span>
                </div>
            </div>
            <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider
                ${patient._isQueue
                    ? (patient.triage_status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600')
                    : 'bg-emerald-100 text-emerald-600'}`}>
                {patient._isQueue ? (patient.triage_status === 'COMPLETED' ? 'DONE' : 'TRIAGE') : 'ADMIT'}
            </div>
        </div>

        <div className={`flex items-center gap-3 p-2.5 rounded-xl ${isSelected ? 'bg-white/10' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
            <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-white dark:bg-gray-600 shadow-sm'}`}>
                {patient._isQueue ? <Timer size={14} /> : <MapPin size={14} />}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-bold truncate ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>
                    {patient._isQueue ? (patient.poliklinik?.name || 'Emergency') : `${patient.bed?.room?.name || 'Room'} • ${patient.bed?.code || 'Bed'}`}
                </p>
            </div>
        </div>
    </motion.div>
);

const WorkspaceHeader = ({ patient, activeAction, setActiveAction }) => (
    <div className="p-8 border-b border-gray-100 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
            <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg
                    ${patient._isQueue ? 'bg-gradient-to-br from-orange-400 to-red-500' : 'bg-gradient-to-br from-blue-400 to-indigo-600'}`}>
                    <User size={32} strokeWidth={2.5} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-2">{patient.patient?.name}</h2>
                    <div className="flex gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <span>{new Date().getFullYear() - new Date(patient.patient?.birth_date).getFullYear()} Y.O</span>
                        <span>{patient.patient?.gender === 'L' ? 'Male' : 'Female'}</span>
                        {patient.patient?.allergies && <span className="text-red-500 flex items-center gap-1"><ShieldAlert size={12} /> {patient.patient.allergies}</span>}
                    </div>
                </div>
            </div>

            {!patient._isQueue && (
                <div className="flex p-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
                    {[
                        { id: 'cppt', label: 'Clinical Notes', icon: Activity },
                        { id: 'mar', label: 'Medications', icon: Pill }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveAction(tab.id)}
                            className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all
                                ${activeAction === tab.id
                                    ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <tab.icon size={14} /> {tab.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    </div>
);

const EmptyStatePlaceholder = () => (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-60">
        <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <LayoutDashboard size={48} className="text-gray-300 dark:text-gray-500" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 dark:text-white">Clinical Workspace</h3>
        <p className="text-gray-400 dark:text-gray-500 max-w-sm mt-2 font-medium">Select a patient to view real-time vitals, triage forms, and medication logs.</p>
    </div>
);

// --- Triage Form ---
const TriageAssessmentForm = ({ patientRecord, onSuccess }) => {
    // Detect context: Is this IGD/Emergency or Poliklinik?
    const isEmergency = patientRecord.poliklinik?.name?.toLowerCase().includes('igd') ||
        patientRecord.poliklinik?.name?.toLowerCase().includes('emergency') ||
        patientRecord.poliklinik?.name?.toLowerCase().includes('gawat');

    // Pre-fill if data exists
    const existing = patientRecord.vitals || {};

    const [triageLevel, setTriageLevel] = useState(existing.triage_level || (isEmergency ? 3 : 5)); // Default ATS 3 for IGD, 5 for Poli
    const [form, setForm] = useState({
        systolic: existing.systolic || '',
        diastolic: existing.diastolic || '',
        hr: existing.heart_rate || '',
        temp: existing.temperature || '',
        weight: existing.weight || '',
        height: existing.height || '',
        complaint: existing.chief_complaint || '',
        allergies: existing.allergies || patientRecord.patient?.allergies || ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/triage/${patientRecord.id}/submit`, {
                vitals: {
                    systolic: parseInt(form.systolic),
                    diastolic: parseInt(form.diastolic),
                    heart_rate: parseInt(form.hr),
                    temperature: parseFloat(form.temp),
                    weight: parseFloat(form.weight),
                    height: parseFloat(form.height),
                },
                allergies: form.allergies,
                triage_level: triageLevel,
                chief_complaint: form.complaint
            });
            toast.success(isEmergency ? 'Triage Saved' : 'Vitals Recorded');
            onSuccess();
        } catch (e) { toast.error('Submit Failed'); }
        finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10 max-w-5xl mx-auto">
            {/* Context Banner */}
            {patientRecord.triage_status === 'COMPLETED' && (
                <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl flex items-center gap-2 font-bold mb-4">
                    <CheckCircle size={20} />
                    {isEmergency ? 'Triage Completed' : 'Vitals Recorded'} - You can update the values below
                </div>
            )}

            {/* Only show ATS Selection for Emergency Context */}
            {isEmergency && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5].map(level => (
                        <button
                            key={level} type="button" onClick={() => setTriageLevel(level)}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1
                                ${triageLevel === level
                                    ? 'border-current bg-gray-50 dark:bg-white/5 scale-105 shadow-lg'
                                    : 'border-transparent bg-gray-50 dark:bg-gray-800 text-gray-400 opacity-60 hover:opacity-100'
                                }
                                ${level === 1 ? 'text-red-600' : level === 2 ? 'text-orange-500' : level === 3 ? 'text-yellow-500' : level === 4 ? 'text-green-500' : 'text-blue-500'}
                            `}
                        >
                            <span className="text-2xl font-black">ATS {level}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">{level === 1 ? 'Resuscitation' : level === 2 ? 'Emergency' : level === 3 ? 'Urgent' : level === 4 ? 'Less Urgent' : 'Non Urgent'}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel p-6 rounded-[32px] border border-gray-100 dark:border-gray-700/50">
                    <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                        <Activity size={14} /> {isEmergency ? 'Triage Vitals' : 'Initial Assessment'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputBox label="Systolic" value={form.systolic} onChange={v => setForm({ ...form, systolic: v })} />
                        <InputBox label="Diastolic" value={form.diastolic} onChange={v => setForm({ ...form, diastolic: v })} />
                        <InputBox label="HR (bpm)" value={form.hr} onChange={v => setForm({ ...form, hr: v })} />
                        <InputBox label="Temp (°C)" value={form.temp} onChange={v => setForm({ ...form, temp: v })} />
                        <InputBox label="Weight (kg)" value={form.weight} onChange={v => setForm({ ...form, weight: v })} />
                        <InputBox label="Height (cm)" value={form.height} onChange={v => setForm({ ...form, height: v })} />
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-[32px] border border-gray-100 dark:border-gray-700/50">
                    <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-6 flex items-center gap-2"><FileText size={14} /> Clinical Findings</h3>
                    <textarea
                        className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 mb-4 font-medium"
                        placeholder="Chief Complaint..."
                        value={form.complaint} onChange={e => setForm({ ...form, complaint: e.target.value })}
                    />
                    <textarea
                        className="w-full h-24 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-2xl border-none focus:ring-2 focus:ring-red-500 font-medium placeholder-red-300"
                        placeholder="Allergies..."
                        value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })}
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <button disabled={loading} className="px-10 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                    {loading ? 'Saving...' : <><CheckCircle size={20} /> {patientRecord.triage_status === 'COMPLETED' ? 'Update & Save' : (isEmergency ? 'Complete Triage' : 'Save Vitals')}</>}
                </button>
            </div>
        </form>
    );
}

const InputBox = ({ label, value, onChange }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">{label}</label>
        <input type="number" className="w-full p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={value} onChange={e => onChange(e.target.value)} />
    </div>
);

// --- CPPT View ---
const CPPTView = ({ admissionId, observations, refresh }) => {
    const [note, setNote] = useState('');
    const [vitals, setVitals] = useState({ sys: '', dia: '', hr: '', temp: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/inpatient/${admissionId}/observation`, {
                nurse_name: 'Nurse On Duty',
                vitals: { systolic: parseInt(vitals.sys), diastolic: parseInt(vitals.dia), temperature: parseFloat(vitals.temp), heart_rate: parseInt(vitals.hr) },
                notes: note
            });
            toast.success('Saved'); refresh(); setNote(''); setVitals({ sys: '', dia: '', hr: '', temp: '' });
        } catch (e) { toast.error('Error'); }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/3 space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-[32px] border border-blue-100 dark:border-blue-800">
                    <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2"><Plus size={18} /> New Entry</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <input placeholder="Sys" required type="number" className="p-3 rounded-xl border-none font-bold" value={vitals.sys} onChange={e => setVitals({ ...vitals, sys: e.target.value })} />
                            <input placeholder="Dia" required type="number" className="p-3 rounded-xl border-none font-bold" value={vitals.dia} onChange={e => setVitals({ ...vitals, dia: e.target.value })} />
                            <input placeholder="Temp" required type="number" step="0.1" className="p-3 rounded-xl border-none font-bold" value={vitals.temp} onChange={e => setVitals({ ...vitals, temp: e.target.value })} />
                            <input placeholder="bpm" required type="number" className="p-3 rounded-xl border-none font-bold" value={vitals.hr} onChange={e => setVitals({ ...vitals, hr: e.target.value })} />
                        </div>
                        <textarea required placeholder="Progress Note..." className="w-full p-3 rounded-xl border-none font-medium h-32" value={note} onChange={e => setNote(e.target.value)} />
                        <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">Record</button>
                    </form>
                </div>
            </div>
            <div className="flex-1 space-y-4">
                <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest px-2">History</h3>
                {observations.length === 0 ? <p className="text-gray-400 px-2 italic">No observations recorded.</p> : observations.map((obs, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 flex gap-4">
                        <div className="text-xs font-bold text-gray-400 w-16 pt-1">{new Date(obs.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="flex-1">
                            <div className="flex gap-2 mb-2">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">{obs.systolic}/{obs.diastolic}</span>
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-bold">{obs.temperature}°C</span>
                            </div>
                            <p className="text-gray-800 dark:text-gray-200 text-sm">{obs.notes}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MAR View ---
const MARView = ({ admissionId, logs, prescriptions, refresh }) => {
    const handleGive = async (id, name) => {
        try {
            await api.post(`/inpatient/${admissionId}/mar`, {
                prescription_item_id: id, medicine_name: name, status: 'GIVEN', nurse_name: 'Nurse On Duty', notes: 'Routine'
            });
            toast.success('Administered'); refresh();
        } catch (e) { toast.error('Error'); }
    };

    const medicines = prescriptions?.flatMap(p => p.items.map(i => ({ ...i, doctor: p.doctor }))) || [];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {medicines.map((m, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">{m.medicine.name}</h4>
                            <p className="text-xs text-gray-500">{m.dosage} • {m.frequency}</p>
                        </div>
                        <button onClick={() => handleGive(m.id, m.medicine.name)} className="px-4 py-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-lg text-xs font-black uppercase hover:bg-emerald-200 transition">
                            Administer
                        </button>
                    </div>
                ))}
            </div>
            <div>
                <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-4">Administration Log</h3>
                <div className="space-y-2">
                    {logs.map((log, i) => (
                        <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                <span className="font-bold text-sm dark:text-white">{log.medicine_name}</span>
                            </div>
                            <span className="text-xs text-gray-400">{new Date(log.given_at).toLocaleTimeString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NurseStation;
