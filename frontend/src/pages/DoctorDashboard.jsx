import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Clock, CheckCircle, Activity, FileText, Save, History, Search, ChevronRight, User, Home, ArrowLeft, Trash2, Plus, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../utils/axiosConfig';
import PageWrapper from '../components/PageWrapper';

const DoctorDashboard = () => {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [queues, setQueues] = useState([]);
    const [selectedQueue, setSelectedQueue] = useState(null);
    const [loading, setLoading] = useState(true);

    // SOAP Form State
    const [soap, setSoap] = useState({
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
        systolic: '', diastolic: '', heart_rate: '', temperature: '', weight: '', height: ''
    });

    // Prescription State
    const [medicines, setMedicines] = useState([]);
    const [prescriptionItems, setPrescriptionItems] = useState([]); // { medicine_id, name, quantity, dosage, notes }
    const [showMedSelector, setShowMedSelector] = useState(false);

    // Filter Service Order State
    const [showOrderModal, setShowOrderModal] = useState(null); // 'LAB', 'RAD', or null
    const [serviceOrders, setServiceOrders] = useState([]); // Array of { type: 'LAB'|'RAD', notes: '' }

    const [patientHistory, setPatientHistory] = useState([]);
    const [viewMode, setViewMode] = useState('record'); // 'record' or 'history'

    // List State
    const [icd10List, setIcd10List] = useState([]);

    // Fetch Doctors for the "View As" selector
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await api.get('/doctors');
                setDoctors(res.data);
                if (res.data.length > 0) setSelectedDoctor(res.data[0]);
            } catch (error) {
                console.error("Failed to load doctors", error);
                toast.error("Failed to load doctors");
            } finally {
                setLoading(false);
            }
        };
        const fetchMedicines = async () => {
            try {
                const res = await api.get('/medicines');
                setMedicines(res.data);
            } catch (error) {
                console.error("Failed to load medicines", error);
            }
        };
        const fetchICD10 = async () => {
            // In real app, fetch only on search or huge list. Simple for now: fetch small seed.
            // Or better: Implement search API. For now assuming /api/icd10 is available or we stub it.
            // Wait, I haven't made specific ICD-10 endpoint (except seed). 
            // Let's assume we can GET /api/icd10 later. For now, empty or mock.
            // EDIT: better to use simple search input that queries API.
            // Let's skip fetchAll and do onInput search.
        };
        fetchDoctors();
        fetchMedicines();
    }, []);

    // Fetch Queue when Doctor changes
    useEffect(() => {
        if (!selectedDoctor) return;

        const fetchQueue = async () => {
            try {
                const res = await api.get(`/queues/waiting?poli_id=${selectedDoctor.poliklinik_id}`);
                // Filter for this specific doctor if needed, but endpoint might return all for poli
                // Client side filter:
                const myQueue = res.data.filter(q => q.daily_quota.doctor_id === selectedDoctor.id);
                setQueues(myQueue);
            } catch (error) {
                console.error("Failed to load queue", error);
            }
        };

        fetchQueue();
        // Poll every 10 seconds
        const interval = setInterval(fetchQueue, 10000);
        return () => clearInterval(interval);
    }, [selectedDoctor]);

    // Fetch History when Queue Selected
    useEffect(() => {
        if (selectedQueue?.patient_id) {
            fetchHistory(selectedQueue.patient_id);

            // Check if MedicalRecord exists (from Triage)
            // queue.medical_records is array (included in triage queue logic, but here fetching /queue/waiting might not include it deep enough)
            // Ideally fetch latest MR for this queue
            const fetchMR = async () => {
                try {
                    // We need endpoint to get MR by queue_id or similar.
                    // Or just use what we have if backend provides it in queue list.
                    // The backend /queues/waiting usually returns [Queue]. 
                    // Let's modify fetchQueue to include medical_records. 
                    // Assuming it does:
                    console.log("Selected Q:", selectedQueue);
                } catch (e) { }
            }

            // Reset SOAP & Vitals (or fill from Triage)
            // If Triage data exists in current Queue object (needs backend support), use it.
            // Let's assume queue.medical_records[0] has it.
            const existingMR = selectedQueue.medical_records?.[0];

            setSoap({
                subjective: existingMR?.subjective || '',
                objective: existingMR?.objective || '',
                assessment: existingMR?.assessment || '',
                plan: existingMR?.plan || '',
                // VITALS from Triage
                systolic: existingMR?.systolic || '',
                diastolic: existingMR?.diastolic || '',
                heart_rate: existingMR?.heart_rate || '',
                temperature: existingMR?.temperature || '',
                weight: existingMR?.weight || '',
                height: existingMR?.height || ''
            });
            // NEW: Set ICD-10 if exists
            // setIcd10Selection(existingMR?.icd10_code ...)
        }
    }, [selectedQueue]);

    const fetchHistory = async (patientId) => {
        try {
            const res = await api.get(`/medical-records/patient/${patientId}`);
            setPatientHistory(res.data);
        } catch (error) {
            console.error("Briefly failed to load history", error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selectedQueue) return;

        try {
            // 1. Create Medical Record
            const recordRes = await api.post('/medical-records', {
                patient_id: selectedQueue.patient_id,
                doctor_id: selectedDoctor.id,
                queue_id: selectedQueue.id,
                ...soap
            });

            await api.post('/prescriptions', {
                medical_record_id: recordRes.data.id,
                doctor_id: selectedDoctor.id,
                patient_id: selectedQueue.patient_id,
                items: prescriptionItems
            });
            toast.success("Prescription Sent to Pharmacy");
        }

            // 3. Create Service Orders (Lab/Rad)
            if (serviceOrders.length > 0) {
            // We need an endpoint for batch creation or loop
            // Let's loop for now or assume /service-orders endpoint
            // Plan: Create endpoint POST /api/service-orders
            await Promise.all(serviceOrders.map(order =>
                api.post('/service-orders', {
                    medical_record_id: recordRes.data.id,
                    type: order.type,
                    notes: order.notes
                })
            ));
            toast.success("Orders Sent to Lab/Radiology");
        }

        toast.success("Medical Record Saved!");

        // Optimistically update queue (remove served patient)
        setQueues(prev => prev.filter(q => q.id !== selectedQueue.id));
        setSelectedQueue(null);

    } catch (error) {
        toast.error("Failed to save record");
        console.error(error);
    }
};

const addPrescriptionItem = (med) => {
    setPrescriptionItems([...prescriptionItems, {
        medicine_id: med.id,
        name: med.name,
        quantity: 1,
        dosage: '3x1 after meal',
        notes: ''
    }]);
    setShowMedSelector(false);
};

// Service Order Handlers
const handleAddOrder = (type, notes) => {
    setServiceOrders([...serviceOrders, { type, notes }]);
    setShowOrderModal(null);
    toast.success(`Order ${type} added`);
};

const removeOrder = (index) => {
    setServiceOrders(serviceOrders.filter((_, i) => i !== index));
};

const updateItem = (index, field, value) => {
    const newItems = [...prescriptionItems];
    newItems[index][field] = value;
    setPrescriptionItems(newItems);
};

const removeItem = (index) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
};

if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Loading Dashboard...</div>;

return (
    <PageWrapper title="Doctor Dashboard">
        <Toaster position="top-center" toastOptions={{ className: 'backdrop-blur-md bg-white/80 dark:bg-gray-800/80' }} />

        <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-100px)] gap-6 p-6 max-w-[1600px] mx-auto">

            {/* LEFT PANEL: QUEUE LIST */}
            <div className="w-full lg:w-[30%] flex flex-col gap-6">
                {/* Navigation Back */}
                <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium px-2">
                    <ArrowLeft size={20} />
                    Back to Menu
                </Link>

                {/* Doctor Selector */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-4 rounded-[24px] shadow-lg border border-white/20">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Viewing As</label>
                    <select
                        className="w-full bg-transparent font-bold text-lg focus:outline-none dark:text-white"
                        value={selectedDoctor?.id || ''}
                        onChange={(e) => {
                            const doc = doctors.find(d => d.id === parseInt(e.target.value));
                            setSelectedDoctor(doc);
                        }}
                    >
                        {doctors.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                    <div className="text-xs text-blue-500 font-medium mt-1">{selectedDoctor?.specialist}</div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-500/10 dark:bg-blue-500/20 p-4 rounded-[24px] border border-blue-500/20">
                        <div className="text-blue-600 dark:text-blue-400 font-bold text-2xl">{queues.length}</div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Waiting</div>
                    </div>
                    <div className="bg-green-500/10 dark:bg-green-500/20 p-4 rounded-[24px] border border-green-500/20">
                        <div className="text-green-600 dark:text-green-400 font-bold text-2xl">0</div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Served</div>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-[32px] shadow-xl border border-white/20 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                            <Users size={20} className="text-gray-400" /> Patient Queue
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {queues.length === 0 ? (
                            <div className="text-center py-20 text-gray-400">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={32} />
                                </div>
                                <p>No patients waiting.</p>
                            </div>
                        ) : (
                            queues.map((q, idx) => (
                                <motion.div
                                    key={q.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => setSelectedQueue(q)}
                                    className={`p-4 rounded-[20px] cursor-pointer transition-all border ${selectedQueue?.id === q.id
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 border-transparent'
                                        : 'bg-white dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 border-transparent hover:border-blue-200 dark:border-gray-600'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className={`font-bold text-lg ${selectedQueue?.id === q.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                                {q.queue_code}
                                            </div>
                                            <div className={`text-sm ${selectedQueue?.id === q.id ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {q.patient?.name || 'Unknown Patient'}
                                            </div>
                                        </div>
                                        <div className={`text-[10px] font-bold px-2 py-1 rounded-full ${selectedQueue?.id === q.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-600 text-gray-500'}`}>
                                            #{q.queue_number}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: MAIN WORKSPACE */}
            <div className="flex-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white/20 dark:border-gray-700 overflow-hidden flex flex-col relative min-h-[600px] lg:min-h-0">
                {!selectedQueue ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <Activity size={48} className="opacity-50" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-300 dark:text-gray-600">No Patient Selected</h2>
                        <p className="opacity-60">Select a patient from the queue to start examination</p>
                    </div>
                ) : (
                    <>
                        {/* Patient Header */}
                        <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/30">
                                    {selectedQueue.patient?.name?.charAt(0)}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{selectedQueue.patient?.name}</h1>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                                        <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">RM: {selectedQueue.patient?.no_rm}</span>
                                        <span>{selectedQueue.patient?.gender === 'L' ? 'Male' : 'Female'}</span>
                                        {selectedQueue.patient?.age && <span>{selectedQueue.patient.age} yo</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setViewMode('record')}
                                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${viewMode === 'record' ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' : 'bg-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    <FileText size={18} /> Examination
                                </button>
                                <button
                                    onClick={() => setViewMode('history')}
                                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${viewMode === 'history' ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' : 'bg-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    <History size={18} /> History
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-10">
                            {viewMode === 'record' ? (
                                <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-8">
                                    {/* ALLERGY ALERT */}
                                    {selectedQueue.patient?.allergies && (
                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-2xl flex items-start gap-3 animate-pulse">
                                            <div className="bg-red-100 dark:bg-red-800 p-2 rounded-lg text-red-600 dark:text-red-200">
                                                <Activity size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-red-700 dark:text-red-200">PATIENT HAS ALLERGIES</h3>
                                                <p className="text-red-600 dark:text-red-300 font-medium text-sm">{selectedQueue.patient.allergies}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* VITALS CARD (SOP) */}
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700">
                                        <h3 className="font-bold text-gray-400 uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                                            <Activity size={16} /> Vital Signs (Tanda Vital)
                                        </h3>
                                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Systolic</label>
                                                <input type="number" placeholder="120" className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold text-center" value={soap.systolic || ''} onChange={e => setSoap({ ...soap, systolic: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Diastolic</label>
                                                <input type="number" placeholder="80" className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold text-center" value={soap.diastolic || ''} onChange={e => setSoap({ ...soap, diastolic: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">HR (bpm)</label>
                                                <input type="number" placeholder="80" className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold text-center" value={soap.heart_rate || ''} onChange={e => setSoap({ ...soap, heart_rate: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Temp (°C)</label>
                                                <input type="number" step="0.1" placeholder="36.5" className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold text-center" value={soap.temperature || ''} onChange={e => setSoap({ ...soap, temperature: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Weight (kg)</label>
                                                <input type="number" step="0.1" placeholder="60" className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold text-center" value={soap.weight || ''} onChange={e => setSoap({ ...soap, weight: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Height (cm)</label>
                                                <input type="number" placeholder="170" className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold text-center" value={soap.height || ''} onChange={e => setSoap({ ...soap, height: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        {/* Subjective */}
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">S</span>
                                                Subjective (Keluhan)
                                            </label>
                                            <textarea
                                                className="w-full h-40 p-5 rounded-[24px] bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 transition-all text-lg resize-none shadow-inner"
                                                placeholder="Keluhan utama pasien..."
                                                value={soap.subjective}
                                                onChange={e => setSoap({ ...soap, subjective: e.target.value })}
                                                required
                                            />
                                        </div>

                                        {/* Objective */}
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                                                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs">O</span>
                                                Objective (Pemeriksaan)
                                            </label>
                                            <textarea
                                                className="w-full h-40 p-5 rounded-[24px] bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-red-500 transition-all text-lg resize-none shadow-inner"
                                                placeholder="Hasil pemeriksaan fisik..."
                                                value={soap.objective}
                                                onChange={e => setSoap({ ...soap, objective: e.target.value })}
                                                required
                                            />
                                        </div>

                                        {/* Assessment (ICD-10 Enhanced) */}
                                        <div className="space-y-3 relative">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                                                <span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-xs">A</span>
                                                Assessment (Diagnosa ICD-10)
                                            </label>

                                            {/* ICD-10 Search Input */}
                                            <div className="relative">
                                                <Search className="absolute left-4 top-4 text-gray-400" size={20} />
                                                <input
                                                    type="text"
                                                    placeholder="Ketik kode atau nama diagnosa (min. 2 karakter)..."
                                                    className="w-full p-4 pl-12 rounded-[24px] bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-yellow-500 font-bold text-lg"
                                                    onChange={async (e) => {
                                                        const val = e.target.value;
                                                        setSoap({ ...soap, assessment: val });

                                                        if (val.length > 1) {
                                                            try {
                                                                const res = await api.get(`/icd10?q=${val}`);
                                                                setIcd10List(res.data);
                                                            } catch (err) {
                                                                console.error("ICD10 Search Error", err);
                                                            }
                                                        } else {
                                                            setIcd10List([]);
                                                        }
                                                    }}
                                                    value={soap.assessment}
                                                />

                                                {/* Dropdown Results */}
                                                {icd10List.length > 0 && (
                                                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 max-h-60 overflow-y-auto">
                                                        {icd10List.map(item => (
                                                            <div
                                                                key={item.code}
                                                                className="p-3 hover:bg-yellow-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-50 dark:border-gray-700 last:border-none"
                                                                onClick={() => {
                                                                    setSoap({
                                                                        ...soap,
                                                                        assessment: `${item.code} - ${item.name}`
                                                                    });
                                                                    setIcd10List([]);
                                                                }}
                                                            >
                                                                <div className="font-bold text-gray-800 dark:text-white flex justify-between">
                                                                    <span>{item.name}</span>
                                                                    <span className="text-yellow-600 bg-yellow-100 px-2 rounded text-xs flex items-center">{item.code}</span>
                                                                </div>
                                                                <div className="text-xs text-gray-400">{item.description}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 pl-4">Standardized JCI Diagnosis Code</p>
                                        </div>

                                        {/* Plan */}
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                                                <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">P</span>
                                                Plan (Terapi/Tindakan) & E-Prescription
                                            </label>
                                            <textarea
                                                className="w-full h-24 p-5 rounded-[24px] bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-green-500 transition-all text-lg resize-none shadow-inner mb-4"
                                                placeholder="Resep obat dan tindakan (Teks)..."
                                                value={soap.plan}
                                                onChange={e => setSoap({ ...soap, plan: e.target.value })}
                                                required
                                            />

                                            {/* E-PRESCRIPTION UI */}
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-bold text-sm text-gray-600 dark:text-gray-300">Prescription Items</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowMedSelector(!showMedSelector)}
                                                        className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100"
                                                    >
                                                        + Add Medicine
                                                    </button>
                                                </div>

                                                {/* Medicine Selector Dropdown */}
                                                {showMedSelector && (
                                                    <div className="bg-white dark:bg-gray-700 shadow-xl rounded-xl p-2 absolute z-50 w-64 max-h-60 overflow-y-auto border border-gray-100">
                                                        {medicines.map(m => (
                                                            <div
                                                                key={m.id}
                                                                onClick={() => addPrescriptionItem(m)}
                                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer rounded-lg text-sm font-medium"
                                                            >
                                                                <div className="font-bold">{m.name}</div>
                                                                <div className="text-xs text-gray-500">Stok: {m.stock} {m.unit}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Selected Items List */}
                                                <div className="space-y-2">
                                                    {prescriptionItems.map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-xl text-sm">
                                                            <div className="font-bold flex-1">{item.name}</div>
                                                            <input
                                                                type="number"
                                                                className="w-16 p-1 rounded-lg bg-white dark:bg-gray-600 font-bold text-center"
                                                                value={item.quantity}
                                                                onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value))}
                                                            />
                                                            <input
                                                                type="text"
                                                                className="w-32 p-1 rounded-lg bg-white dark:bg-gray-600 font-medium"
                                                                value={item.dosage}
                                                                onChange={e => updateItem(idx, 'dosage', e.target.value)}
                                                                placeholder="3x1..."
                                                            />
                                                            <button type="button" onClick={() => removeItem(idx)} className="text-red-500 p-1"><Trash2 size={16} /></button>
                                                        </div>
                                                    ))}
                                                    {prescriptionItems.length === 0 && <div className="text-xs text-gray-400 italic text-center py-2">No medicines selected</div>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                                        <button
                                            type="submit"
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-[20px] font-bold text-lg shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                                        >
                                            <Save size={20} /> Save Medical Record
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-6 max-w-4xl mx-auto">
                                    {patientHistory.length === 0 ? (
                                        <div className="text-center py-20 text-gray-400">No medical history found.</div>
                                    ) : (
                                        patientHistory.map((record) => (
                                            <div key={record.id} className="bg-white dark:bg-gray-800 p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg text-xs font-bold text-gray-500">
                                                            {new Date(record.visit_date).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-sm font-bold text-gray-800 dark:text-white">
                                                            Dr. {record.doctor?.name}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div className="bg-blue-50/50 dark:bg-gray-700/30 p-4 rounded-xl">
                                                        <span className="font-bold text-blue-600 block text-xs mb-1">SUBJECTIVE</span>
                                                        {record.subjective}
                                                    </div>
                                                    <div className="bg-red-50/50 dark:bg-gray-700/30 p-4 rounded-xl">
                                                        <span className="font-bold text-red-600 block text-xs mb-1">OBJECTIVE</span>
                                                        {record.objective}
                                                    </div>
                                                    <div className="bg-yellow-50/50 dark:bg-gray-700/30 p-4 rounded-xl">
                                                        <span className="font-bold text-yellow-600 block text-xs mb-1">ASSESSMENT</span>
                                                        {record.assessment}
                                                    </div>
                                                    <div className="bg-green-50/50 dark:bg-gray-700/30 p-4 rounded-xl">
                                                        <span className="font-bold text-green-600 block text-xs mb-1">PLAN</span>
                                                        {record.plan}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    </PageWrapper>
);
};

export default DoctorDashboard;
