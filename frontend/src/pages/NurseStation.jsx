import React, { useState, useEffect } from 'react';
import {
    Activity, Clipboard, Clock, Heart, Plus, Search, User,
    Thermometer, Droplet, Wind, FileText, ChevronRight,
    AlertCircle, CheckCircle, Stethoscope, Pill, ShieldAlert,
    Timer, MapPin, Gauge, LayoutDashboard, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import PageWrapper from '../components/PageWrapper';
import ModernHeader from '../components/ModernHeader';

const NurseStation = () => {
    // Shared State
    const [allPatients, setAllPatients] = useState([]); // Combined Queue + Admissions
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [clinicalData, setClinicalData] = useState(null);
    const [activeAction, setActiveAction] = useState('cppt'); // cppt, mar, triage
    const [viewUnit, setViewUnit] = useState('IGD'); // 'IGD', 'POLI', 'WARD', 'ICU'
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // 30s refresh
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        filterAndCategorize();
    }, [allPatients, viewUnit, searchTerm]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [queueRes, admissionRes] = await Promise.all([
                api.get('/triage/queue'),
                api.get('/nurse/active-inpatients')
            ]);

            // tag data sources
            const queueItems = queueRes.data.map(q => ({ ...q, _isQueue: true }));
            const admittedItems = admissionRes.data.map(a => ({ ...a, _isAdmitted: true }));

            setAllPatients([...queueItems, ...admittedItems]);
        } catch (error) {
            toast.error('Failed to sync clinical data');
        } finally {
            setIsLoading(false);
        }
    };

    const filterAndCategorize = () => {
        let filtered = allPatients;

        // 1. UNIT LOGIC
        if (viewUnit === 'IGD') {
            // IGD: Show queue (where doctor/poli is IGD) AND admitted patients in IGD rooms
            filtered = filtered.filter(p => {
                if (p._isQueue) {
                    return p.poliklinik?.name?.toLowerCase().includes('igd') ||
                        p.poliklinik?.name?.toLowerCase().includes('emergency') ||
                        p.doctor?.specialist?.toLowerCase().includes('igd');
                }
                return p.bed?.room?.name?.toLowerCase().includes('igd') ||
                    p.bed?.room?.name?.toLowerCase().includes('emergency') ||
                    p.bed?.room?.type === 'IGD';
            });
        } else if (viewUnit === 'POLI') {
            // POLI: Only show queue for non-IGD clinics
            filtered = filtered.filter(p =>
                p._isQueue &&
                !p.poliklinik?.name?.toLowerCase().includes('igd') &&
                !p.poliklinik?.name?.toLowerCase().includes('emergency')
            );
        } else if (viewUnit === 'ICU') {
            filtered = filtered.filter(p =>
                p._isAdmitted && (
                    p.bed?.room?.name?.toLowerCase().includes('icu') ||
                    p.bed?.room?.type === 'ICU'
                )
            );
        } else {
            // WARD (General Ranap)
            filtered = filtered.filter(p =>
                p._isAdmitted &&
                !p.bed?.room?.name?.toLowerCase().includes('igd') &&
                !p.bed?.room?.name?.toLowerCase().includes('emergency') &&
                !p.bed?.room?.name?.toLowerCase().includes('icu')
            );
        }

        // 2. SEARCH
        if (searchTerm) {
            const low = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.patient?.name?.toLowerCase().includes(low) ||
                p.patient?.no_rm?.toLowerCase().includes(low)
            );
        }

        setFilteredPatients(filtered);
    };

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
            setClinicalData(null); // Triage form handles its own logic
        }
    };

    return (
        <PageWrapper title="Nurse Clinical Hub">
            <Toaster position="top-right" />

            <div className="flex flex-col h-[calc(100vh-80px)] max-w-[1920px] mx-auto p-6 gap-6 overflow-hidden">

                {/* HEADER AREA */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 shrink-0">
                    <ModernHeader
                        title="Clinical Hub"
                        subtitle={`Managing active arrivals and inpatient care for ${viewUnit}`}
                        className="mb-0"
                    />

                    {/* APPLE STYLE UNIT SELECTOR */}
                    <div className="bg-gray-100 dark:bg-black/20 backdrop-blur-md p-1.5 rounded-[22px] flex items-center border border-white/10 shadow-sm">
                        {[
                            { id: 'IGD', label: 'Emergency', icon: <Timer size={16} /> },
                            { id: 'POLI', label: 'Polyclinic', icon: <Stethoscope size={16} /> },
                            { id: 'WARD', label: 'Wards', icon: <User size={16} /> },
                            { id: 'ICU', label: 'ICU', icon: <Activity size={16} /> }
                        ].map(unit => (
                            <button
                                key={unit.id}
                                onClick={() => { setViewUnit(unit.id); setSelectedPatient(null); }}
                                className={`px-6 py-3 rounded-2xl flex items-center gap-2 transition-all duration-500 font-bold text-sm
                                    ${viewUnit === unit.id
                                        ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-[0_8px_20px_-5px_rgba(0,0,0,0.1)] scale-100'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                            >
                                {unit.icon} {unit.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 flex-1 min-h-0">

                    {/* LEFT: PATIENT DIRECTORY */}
                    <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col gap-5 shrink-0">
                        {/* Search & Filter Bar */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-12 pr-4 py-4 border-none rounded-[24px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] transition-all"
                                placeholder="Patient Name or RM#"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Combined List Panel */}
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 pb-10">
                            {isLoading && allPatients.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="font-bold">Syncing Hub...</p>
                                </div>
                            ) : filteredPatients.length === 0 ? (
                                <div className="text-center py-24 px-10 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[40px]">
                                    <User size={48} className="mx-auto mb-4 text-gray-200" />
                                    <p className="text-gray-400 font-bold leading-tight">No active patients in {viewUnit}</p>
                                </div>
                            ) : (
                                filteredPatients.map(p => (
                                    <motion.div
                                        layoutId={`pat-${p.id}-${p._isQueue ? 'q' : 'a'}`}
                                        key={`${p.id}-${p._isQueue ? 'q' : 'a'}`}
                                        onClick={() => handleSelectPatient(p)}
                                        className={`p-5 rounded-[28px] cursor-pointer border-2 transition-all duration-500 group relative overflow-hidden
                                            ${selectedPatient?.id === p.id && selectedPatient?._isQueue === p._isQueue
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-500/40 scale-[1.02] z-10'
                                                : 'bg-white dark:bg-gray-800 border-transparent hover:border-blue-100 dark:hover:border-gray-700 hover:shadow-xl'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-3 relative z-10">
                                            <div className="flex-1">
                                                <h4 className={`font-black text-lg leading-tight tracking-tight ${selectedPatient?.id === p.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                                    {p.patient?.name}
                                                </h4>
                                                <div className={`flex items-center gap-2 text-[10px] font-bold mt-1 uppercase tracking-widest ${selectedPatient?.id === p.id ? 'text-blue-200' : 'text-gray-400'}`}>
                                                    <span>RM: {p.patient?.no_rm}</span>
                                                    <span>•</span>
                                                    <span>{p.patient?.gender === 'L' ? 'Male' : 'Female'}</span>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider
                                                ${p._isQueue
                                                    ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
                                                    : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                                                {p._isQueue ? 'Arrival' : 'Admitted'}
                                            </div>
                                        </div>

                                        <div className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300
                                            ${selectedPatient?.id === p.id ? 'bg-white/10' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                                            <div className={`p-2 rounded-xl ${selectedPatient?.id === p.id ? 'bg-white/20' : 'bg-white dark:bg-gray-600 shadow-sm'}`}>
                                                {p._isQueue ? <Timer size={14} /> : <MapPin size={14} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedPatient?.id === p.id ? 'text-blue-100' : 'text-gray-400 underline decoration-dotted'}`}>
                                                    {p._isQueue ? 'Requested Clinic' : 'Room & Bed'}
                                                </p>
                                                <p className={`text-xs font-bold truncate ${selectedPatient?.id === p.id ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>
                                                    {p._isQueue ? (p.poliklinik?.name || 'Emergency') : `${p.bed?.room?.name} • ${p.bed?.code}`}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT: DYNAMIC CLINICAL WORKSPACE */}
                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-[44px] shadow-2xl shadow-black/5 border border-white/40 dark:border-gray-700 overflow-hidden flex flex-col relative transition-all duration-700">
                        <AnimatePresence mode="wait">
                            {selectedPatient ? (
                                <motion.div
                                    key={selectedPatient.id + (selectedPatient._isQueue ? 'q' : 'a')}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex flex-col h-full overflow-hidden"
                                >
                                    {/* Workspace Navigation Header */}
                                    <div className="p-10 pb-6 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-3xl sticky top-0 z-20">
                                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="relative">
                                                    <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-3xl flex items-center justify-center text-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform">
                                                        <User size={36} strokeWidth={2.5} />
                                                    </div>
                                                    <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-900
                                                    ${selectedPatient._isQueue ? 'bg-orange-500' : 'bg-emerald-500'}`}>
                                                        {selectedPatient._isQueue ? <Timer size={14} className="text-white" /> : <CheckCircle size={14} className="text-white" />}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{selectedPatient.patient?.name}</h1>
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-400 tracking-widest uppercase">
                                                        <span className="flex items-center gap-2"><MapPin size={12} className="text-blue-500" /> {selectedPatient._isQueue ? 'Reception' : selectedPatient.bed?.room?.name}</span>
                                                        <span className="flex items-center gap-2"><Calendar size={12} className="text-indigo-500" /> {new Date(selectedPatient.patient?.birth_date).toLocaleDateString()}</span>
                                                        <span className="flex items-center gap-2"><FileText size={12} className="text-gray-400" /> {selectedPatient.patient?.no_rm}</span>
                                                        {selectedPatient.patient?.allergies && <span className="flex items-center gap-2 text-red-500"><ShieldAlert size={12} /> {selectedPatient.patient.allergies}</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contextual Action Toggles */}
                                            <div className="bg-gray-100 dark:bg-gray-700/50 p-1.5 rounded-[22px] flex items-center gap-1">
                                                {selectedPatient._isQueue ? (
                                                    <div className="px-6 py-2.5 rounded-2xl bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm font-black text-sm flex items-center gap-2">
                                                        <Gauge size={16} /> Triage Assessment
                                                    </div>
                                                ) : (
                                                    <>
                                                        {[
                                                            { id: 'cppt', label: 'CPPT / Vitals', icon: <Activity size={16} /> },
                                                            { id: 'mar', label: 'e-MAR / Meds', icon: <Pill size={16} /> }
                                                        ].map(tab => (
                                                            <button
                                                                key={tab.id}
                                                                onClick={() => setActiveAction(tab.id)}
                                                                className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all duration-300
                                                                ${activeAction === tab.id
                                                                        ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm scale-100'
                                                                        : 'text-gray-400 hover:text-gray-600'}`}
                                                            >
                                                                {tab.icon} {tab.label}
                                                            </button>
                                                        ))}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Main Clinical Console */}
                                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-gray-50/20 dark:bg-black/5">
                                        <div className="max-w-6xl mx-auto">
                                            <AnimatePresence mode="wait">
                                                {selectedPatient._isQueue ? (
                                                    <TriageAssessmentForm
                                                        patientRecord={selectedPatient}
                                                        onSuccess={() => { setSelectedPatient(null); fetchData(); }}
                                                    />
                                                ) : (
                                                    <motion.div
                                                        key={activeAction}
                                                        initial={{ opacity: 0, y: 15 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -15 }}
                                                        transition={{ duration: 0.4 }}
                                                    >
                                                        {clinicalData ? (
                                                            activeAction === 'cppt' ? (
                                                                <CPPTView admissionId={selectedPatient.id} observations={clinicalData.admission.observations} refresh={() => handleSelectPatient(selectedPatient)} />
                                                            ) : (
                                                                <MARView admissionId={selectedPatient.id} logs={clinicalData.admission.medication_logs} prescriptions={clinicalData.prescriptions} refresh={() => handleSelectPatient(selectedPatient)} />
                                                            )
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center py-40 opacity-20">
                                                                <LoaderCircle className="animate-spin mb-4" />
                                                                <p className="font-bold">Accessing Patient Chart...</p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-20 bg-white/50 dark:bg-gray-900/50">
                                    <motion.div
                                        animate={{
                                            y: [0, -10, 0],
                                            rotate: [0, -2, 2, 0]
                                        }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="w-40 h-40 bg-gray-50 dark:bg-gray-800 rounded-[50px] shadow-2xl flex items-center justify-center mb-10 relative"
                                    >
                                        <div className="absolute inset-0 bg-blue-500/5 blur-[50px] rounded-full animate-pulse" />
                                        <LayoutDashboard size={80} className="text-blue-100 dark:text-gray-700" />
                                    </motion.div>
                                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">Patient Control Centre</h1>
                                    <p className="text-gray-400 max-w-sm font-medium leading-relaxed">
                                        Select a patient from the {viewUnit} directory to access their real-time clinical workspace, triage status, and ongoing care plan.
                                    </p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

// --- SUBSYSTEM: TRIAGE ASSESSMENT (FORM) ---
const TriageAssessmentForm = ({ patientRecord, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [triageLevel, setTriageLevel] = useState(3);
    const [form, setForm] = useState({
        systolic: '', diastolic: '', hr: '', temp: '', weight: '', height: '', complaint: '', allergies: patientRecord.patient?.allergies || ''
    });

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
            toast.success('Patient advanced to Doctor Queue');
            onSuccess();
        } catch (error) {
            toast.error('Submission failed');
        } finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10 animate-fade-in">
            {/* ATS Triage Scale Selector */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {[
                    { l: 1, c: 'bg-red-600', t: 'Resuscitation', d: 'Immediate life saving' },
                    { l: 2, c: 'bg-orange-500', t: 'Emergency', d: 'Assessment within 10m' },
                    { l: 3, c: 'bg-yellow-400 text-black', t: 'Urgent', d: 'Assessment within 30m' },
                    { l: 4, c: 'bg-green-500', t: 'Less Urgent', d: 'Assessment within 60m' },
                    { l: 5, c: 'bg-blue-500', t: 'Non Urgent', d: 'Assessment within 120m' }
                ].map(item => (
                    <button
                        key={item.l} type="button" onClick={() => setTriageLevel(item.l)}
                        className={`p-5 rounded-[28px] text-left transition-all duration-500 border-4 flex flex-col gap-2
                            ${triageLevel === item.l
                                ? `${item.c} border-${item.c.split('-')[1]}-200 text-white shadow-2xl shadow-black/20 scale-[1.05]`
                                : 'bg-white dark:bg-gray-800 border-transparent hover:border-gray-100 text-gray-400 opacity-60'}`}
                    >
                        <span className="text-3xl font-black">ATS {item.l}</span>
                        <div className="mt-auto">
                            <p className="font-black text-[10px] uppercase tracking-widest leading-none mb-1">{item.t}</p>
                            <p className="text-[9px] font-bold opacity-70 leading-tight">{item.d}</p>
                        </div>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Physical Assessment */}
                <div className="space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-3">
                        <Activity size={14} /> Physical Assessment
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Systolic (mmHg)" value={form.systolic} onChange={v => setForm({ ...form, systolic: v })} />
                        <InputGroup label="Diastolic (mmHg)" value={form.diastolic} onChange={v => setForm({ ...form, diastolic: v })} />
                        <InputGroup label="Heart Rate (bpm)" value={form.hr} onChange={v => setForm({ ...form, hr: v })} />
                        <InputGroup label="Temp (°C)" value={form.temp} onChange={v => setForm({ ...form, temp: v })} />
                        <InputGroup label="Weight (kg)" value={form.weight} onChange={v => setForm({ ...form, weight: v })} />
                        <InputGroup label="Height (cm)" value={form.height} onChange={v => setForm({ ...form, height: v })} />
                    </div>
                </div>

                {/* Clinical Notes */}
                <div className="space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 flex items-center gap-3">
                        <FileText size={14} /> Clinical Findings
                    </h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Chief Complaint</label>
                            <textarea
                                required className="w-full p-6 bg-white dark:bg-gray-800 rounded-[32px] border-none focus:ring-4 focus:ring-blue-500/10 shadow-sm min-h-[140px] font-medium"
                                placeholder="Patient's primary reason for visit..."
                                value={form.complaint} onChange={e => setForm({ ...form, complaint: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-red-500 ml-2">Allergies & Alerts</label>
                            <textarea
                                className="w-full p-6 bg-red-50/50 dark:bg-red-500/5 rounded-[32px] border-none focus:ring-4 focus:ring-red-500/10 shadow-sm min-h-[100px] font-bold text-red-600 placeholder-red-200"
                                placeholder="Known allergies..."
                                value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-10 border-t border-gray-100 dark:border-gray-800">
                <button
                    type="submit" disabled={loading}
                    className="px-14 py-6 bg-black dark:bg-white text-white dark:text-black rounded-[28px] font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                    {loading ? 'Processing...' : <><CheckCircle size={22} strokeWidth={3} /> Complete Triage</>}
                </button>
            </div>
        </form>
    );
};

const InputGroup = ({ label, value, onChange, placeholder = "0" }) => (
    <div className="space-y-2 group">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 group-focus-within:text-blue-500 transition-colors">{label}</label>
        <input
            required type="number" step="any" placeholder={placeholder}
            className="w-full p-5 bg-white dark:bg-gray-800 rounded-[22px] border-none font-black text-xl shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all text-center lg:text-left"
            value={value} onChange={e => onChange(e.target.value)}
        />
    </div>
);

// --- SUBSYSTEM: CPPT (INPATIENT OBSERVATION) ---
const CPPTView = ({ admissionId, observations, refresh }) => {
    const [form, setForm] = useState({ systolic: '', diastolic: '', temperature: '', heart_rate: '', notes: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/inpatient/${admissionId}/observation`, {
                nurse_name: 'Nurse Joyce',
                vitals: {
                    systolic: parseInt(form.systolic),
                    diastolic: parseInt(form.diastolic),
                    temperature: parseFloat(form.temperature),
                    heart_rate: parseInt(form.heart_rate)
                },
                notes: form.notes
            });
            toast.success('Vitals recorded successfully');
            setForm({ systolic: '', diastolic: '', temperature: '', heart_rate: '', notes: '' });
            refresh();
        } catch (error) { toast.error('Failed to save'); }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Input Form */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-white/40 dark:border-gray-700 h-fit space-y-8">
                <h3 className="font-black text-xl tracking-tight flex items-center gap-3">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><Plus size={24} /></div>
                    Daily Vitals
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <input required type="number" placeholder="Sys" className="p-4 bg-gray-50 border-none rounded-2xl font-bold" value={form.systolic} onChange={e => setForm({ ...form, systolic: e.target.value })} />
                        <input required type="number" placeholder="Dia" className="p-4 bg-gray-50 border-none rounded-2xl font-bold" value={form.diastolic} onChange={e => setForm({ ...form, diastolic: e.target.value })} />
                        <input required type="number" step="0.1" placeholder="Temp" className="p-4 bg-gray-50 border-none rounded-2xl font-bold text-orange-600" value={form.temperature} onChange={e => setForm({ ...form, temperature: e.target.value })} />
                        <input required type="number" placeholder="HR" className="p-4 bg-gray-50 border-none rounded-2xl font-bold text-red-600" value={form.heart_rate} onChange={e => setForm({ ...form, heart_rate: e.target.value })} />
                    </div>
                    <textarea className="w-full p-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 min-h-[140px] font-medium" placeholder="Clinical Progress Note..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                    <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        Record Progress
                    </button>
                </form>
            </div>

            {/* Timeline */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center px-4 mb-4">
                    <h3 className="text-sm font-black uppercase tracking-[0.25em] text-gray-400">Clinical Timeline</h3>
                </div>
                {observations.length === 0 ? (
                    <div className="bg-white/40 dark:bg-gray-800/40 p-10 rounded-[40px] text-center border-2 border-dashed border-gray-100 dark:border-gray-800 font-bold text-gray-300">
                        No history available for this admission cycle.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {observations.map((obs, idx) => (
                            <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 flex gap-6 hover:shadow-xl transition-all group overflow-hidden">
                                <div className="flex flex-col items-center">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">{new Date(obs.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    <div className="h-full w-0.5 bg-gray-100 dark:bg-gray-700 my-2 rounded-full group-hover:bg-blue-300 transition-colors" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <MiniBadge icon={<Gauge size={12} />} label={`${obs.systolic}/${obs.diastolic}`} color="blue" />
                                        <MiniBadge icon={<Thermometer size={12} />} label={`${obs.temperature}°C`} color="orange" />
                                        <MiniBadge icon={<Heart size={12} />} label={`${obs.heart_rate}`} color="red" />
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 font-bold text-base leading-relaxed">{obs.notes}</p>
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">J</div>
                                            {obs.nurse_name} • {new Date(obs.timestamp).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- SUBSYSTEM: E-MAR (MEDICATION LOG) ---
const MARView = ({ admissionId, logs, prescriptions, refresh }) => {
    const medicines = prescriptions?.flatMap(p => p.items.map(i => ({ ...i, rx_id: p.id, doctor: p.doctor }))) || [];

    const handleGive = async (med) => {
        try {
            await api.post(`/inpatient/${admissionId}/mar`, {
                prescription_item_id: med.id,
                medicine_name: med.medicine.name,
                status: 'GIVEN',
                nurse_name: 'Nurse Joyce',
                notes: 'Standard administration'
            });
            toast.success(`${med.medicine.name} Administered`);
            refresh();
        } catch (error) { toast.error('Failed to log administration'); }
    };

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {medicines.map((med, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col hover:shadow-2xl transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full" />
                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <div className="p-4 bg-emerald-100 text-emerald-600 rounded-[20px] shadow-inner shadow-emerald-500/10"><Pill size={28} /></div>
                            <span className="text-xs font-black bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-xl text-gray-500 tracking-tight">{med.dosage}</span>
                        </div>
                        <h4 className="font-black text-xl text-gray-900 dark:text-white leading-tight mb-2 relative z-10">{med.medicine.name}</h4>
                        <p className="text-sm font-bold text-gray-400 mb-8 flex-1">Order by Dr. {med.doctor.name}</p>

                        <button onClick={() => handleGive(med)} className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3">
                            <CheckCircle size={20} strokeWidth={3} /> Record Dose
                        </button>
                    </div>
                ))}
            </div>

            <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-[0.25em] text-gray-400 px-4">Administration Log</h3>
                <div className="bg-white dark:bg-gray-800 rounded-[44px] border border-gray-100 dark:border-gray-700 overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)]">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-black/20 text-[10px] uppercase text-gray-400 font-black tracking-widest">
                            <tr>
                                <th className="p-8">Timestamp</th>
                                <th className="p-8">Medication</th>
                                <th className="p-8">Assigned Nurse</th>
                                <th className="p-8 text-right">Confirmation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-blue-50/30 dark:hover:bg-gray-700/30 transition-all group">
                                    <td className="p-8">
                                        <div className="text-sm font-black text-gray-900 dark:text-white">{new Date(log.given_at).toLocaleTimeString()}</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(log.given_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-8 bg-emerald-500 rounded-full scale-y-50 group-hover:scale-y-100 transition-transform" />
                                            <span className="font-black text-lg tracking-tight text-gray-900 dark:text-white">{log.medicine_name}</span>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{log.given_by}</span>
                                    </td>
                                    <td className="p-8 text-right">
                                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                                            <CheckCircle size={10} strokeWidth={3} /> Administered
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const MiniBadge = ({ icon, label, color }) => {
    const s = {
        blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
        orange: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
        red: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${s[color]}`}>
            {icon} {label}
        </span>
    );
};

const LoaderCircle = ({ className }) => <div className={`w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full ${className}`} />;

export default NurseStation;
