import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Thermometer, Heart, Wind, Scale, AlertTriangle, CheckCircle, Clock, Stethoscope, User } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ModernHeader from '../components/ModernHeader';
import api from '../services/api';
import PageWrapper from '../components/PageWrapper';
import useThemeStore from '../store/useThemeStore';

const NurseDashboard = () => {
    const { mode } = useThemeStore();
    const navigate = useNavigate();
    const [queue, setQueue] = useState([]);
    const [filteredQueue, setFilteredQueue] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [loading, setLoading] = useState(false);
    const [unitFilter, setUnitFilter] = useState('ALL'); // 'ALL', 'IGD', 'POLI'

    // Form State
    const [vitals, setVitals] = useState({
        systolic: '',
        diastolic: '',
        heart_rate: '',
        temperature: '',
        weight: '',
        height: '',
        respiratory_rate: '' // Note: Add to DB if missing, or use notes
    });
    const [allergies, setAllergies] = useState('');
    const [triageLevel, setTriageLevel] = useState(3); // Default Level 3 (Urgent/Standard)
    const [complaint, setComplaint] = useState('');

    // BMI Calculation Watcher
    useEffect(() => {
        if (vitals.weight && vitals.height) {
            // Check if height is cm or m (usually cm input 170)
            // Convention: Input is CM.
            const h = parseFloat(vitals.height) / 100;
            const w = parseFloat(vitals.weight);
            if (h > 0 && w > 0) {
                // BMI logic handled visually or kept for display
                // console.log("BMI:", w / (h*h));
            }
        }
    }, [vitals.weight, vitals.height]);

    const fetchQueue = async () => {
        try {
            // Fetch records where triage_status = PENDING and queue status != COMPLETED
            const res = await api.get('/triage/queue');
            setQueue(res.data);
            filterQueueByUnit(res.data, unitFilter);
        } catch (error) {
            console.error(error);
        }
    };

    const filterQueueByUnit = (queueData, filter) => {
        if (filter === 'ALL') {
            setFilteredQueue(queueData);
        } else if (filter === 'IGD') {
            setFilteredQueue(queueData.filter(item =>
                item.poliklinik?.name?.toLowerCase().includes('igd') ||
                item.poliklinik?.name?.toLowerCase().includes('emergency') ||
                item.doctor?.name?.toLowerCase().includes('igd')
            ));
        } else if (filter === 'POLI') {
            setFilteredQueue(queueData.filter(item =>
                !item.poliklinik?.name?.toLowerCase().includes('igd') &&
                !item.poliklinik?.name?.toLowerCase().includes('emergency') &&
                !item.doctor?.name?.toLowerCase().includes('igd')
            ));
        }
    };

    useEffect(() => {
        filterQueueByUnit(queue, unitFilter);
    }, [unitFilter, queue]);

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleSelect = (item) => {
        setSelectedPatient(item);
        setAllergies(item.patient?.allergies || '');
        setVitals({
            systolic: item.systolic || '',
            diastolic: item.diastolic || '',
            heart_rate: item.heart_rate || '',
            temperature: item.temperature || '',
            weight: item.weight || '',
            height: item.height || '',
            respiratory_rate: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPatient) return;
        setLoading(true);
        try {
            await api.post(`/triage/${selectedPatient.id}/submit`, {
                vitals: {
                    ...vitals,
                    systolic: parseInt(vitals.systolic),
                    diastolic: parseInt(vitals.diastolic),
                    heart_rate: parseInt(vitals.heart_rate),
                    temperature: parseFloat(vitals.temperature),
                    weight: parseFloat(vitals.weight),
                    height: parseFloat(vitals.height),
                },
                allergies: allergies,
                triage_level: triageLevel,
                chief_complaint: complaint
            });
            toast.success('Triage Completed. Patient sent to Doctor.');
            setSelectedPatient(null);
            fetchQueue();
        } catch (error) {
            toast.error('Failed to submit triage');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper title="Nurse Station (Triage)">
            <Toaster position="top-right" />

            <ModernHeader
                title="Nurse Station"
                subtitle="Triage & Vital Signs Monitoring"
                onBack={() => navigate('/menu')}
                className="mb-8"
            />

            <div className="relative min-h-screen flex flex-col md:flex-row gap-6 max-w-[1920px] mx-auto z-10 pb-20">

                {/* LEFT: Queue List */}
                <div className="w-full md:w-1/3 space-y-4">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-[28px] shadow-lg border border-white/20 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-800 dark:text-white">
                                    <Clock className="text-blue-500" size={24} />
                                    Waiting List
                                </h2>
                                <p className="text-gray-500 text-sm mt-1 ml-9">Patients waiting for triage assessment</p>
                            </div>
                        </div>

                        {/* Modern Unit Filter Toggle */}
                        <div className="bg-gray-100 dark:bg-gray-900/50 p-1.5 rounded-[18px] flex items-center gap-1 mt-4">
                            {[
                                { id: 'ALL', label: 'All Units', icon: <Activity size={14} /> },
                                { id: 'IGD', label: 'Emergency', icon: <AlertTriangle size={14} /> },
                                { id: 'POLI', label: 'Polyclinic', icon: <Stethoscope size={14} /> }
                            ].map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => setUnitFilter(filter.id)}
                                    className={`flex-1 px-4 py-2.5 rounded-[14px] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300
                                        ${unitFilter === filter.id
                                            ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-md scale-100'
                                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                >
                                    {filter.icon} {filter.label}
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-400">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            {filteredQueue.length} patients in queue
                        </div>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] pr-2 custom-scrollbar">
                        {filteredQueue.length === 0 && (
                            <div className="text-center py-20 px-6 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[32px]">
                                <User size={48} className="mx-auto mb-3 text-gray-200" />
                                <p className="text-gray-400 font-bold">No patients in {unitFilter === 'ALL' ? 'queue' : unitFilter}</p>
                            </div>
                        )}
                        {filteredQueue.map(item => {
                            const isIGD = item.poliklinik?.name?.toLowerCase().includes('igd') ||
                                item.poliklinik?.name?.toLowerCase().includes('emergency') ||
                                item.doctor?.name?.toLowerCase().includes('igd');

                            return (
                                <motion.div
                                    key={item.id}
                                    layoutId={item.id}
                                    onClick={() => handleSelect(item)}
                                    className={`p-5 rounded-[24px] cursor-pointer border-2 transition-all duration-300 group relative overflow-hidden
                                        ${selectedPatient?.id === item.id
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-500/30 scale-[1.02]'
                                            : 'bg-white dark:bg-gray-800 border-transparent hover:border-blue-100 dark:hover:border-gray-700 hover:shadow-xl'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h3 className={`font-black text-base mb-1 ${selectedPatient?.id === item.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                                {item.patient?.name}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider
                                                    ${isIGD
                                                        ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                                                        : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'}`}>
                                                    {isIGD ? '🚨 Emergency' : '🏥 Clinic'}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl
                                            ${selectedPatient?.id === item.id ? 'bg-white/20 text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                            {item.queue?.queue_code || 'N/A'}
                                        </span>
                                    </div>
                                    <div className={`p-3 rounded-xl flex items-center gap-2 text-xs
                                        ${selectedPatient?.id === item.id ? 'bg-white/10 text-blue-100' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-500'}`}>
                                        <Stethoscope size={12} />
                                        <span className="font-bold">{item.doctor?.name}</span>
                                        <span className="mx-1">•</span>
                                        <span className="text-[10px] uppercase tracking-wider">{item.poliklinik?.name || 'Clinic'}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT: Triage Form */}
                <div className="flex-1">
                    <AnimatePresence mode="wait">
                        {selectedPatient ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[32px] p-8 shadow-xl border border-white/20 dark:border-gray-700 h-fit"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold">{selectedPatient.patient?.name}</h2>
                                        <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                            <span>RM: {selectedPatient.patient?.no_rm}</span>
                                            <span>•</span>
                                            <span>{new Date().toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-bold">
                                        Triage Assessment
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">

                                    {/* 1. Triage Assessment Level (ATS Scale) */}
                                    <section>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                                <AlertTriangle size={16} /> Triage Level (ATS)
                                            </h3>
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${triageLevel === 1 ? 'bg-red-100 text-red-600' :
                                                triageLevel === 2 ? 'bg-orange-100 text-orange-600' :
                                                    triageLevel === 3 ? 'bg-yellow-100 text-yellow-700' :
                                                        triageLevel === 4 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                Level {triageLevel} Selected
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-5 gap-3">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <button
                                                    key={level}
                                                    type="button"
                                                    onClick={() => setTriageLevel(level)}
                                                    className={`py-3 px-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 group
                                                    ${triageLevel === level
                                                            ? level === 1 ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-500/30' :
                                                                level === 2 ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30' :
                                                                    level === 3 ? 'bg-yellow-400 border-yellow-400 text-black shadow-lg shadow-yellow-500/30' :
                                                                        level === 4 ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30' :
                                                                            'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                                                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <span className="text-lg font-black">{level}</span>
                                                    <span className="text-[9px] uppercase font-bold tracking-tighter opacity-80">
                                                        {level === 1 ? 'Resus' : level === 2 ? 'Emergency' : level === 3 ? 'Urgent' : level === 4 ? 'Less Urgent' : 'Non Urgent'}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Chief Complaint */}
                                        <div className="mt-4">
                                            <label className="text-xs font-semibold text-gray-500 mb-2 block">Chief Complaint / Keluhan Utama</label>
                                            <textarea
                                                value={complaint}
                                                onChange={(e) => setComplaint(e.target.value)}
                                                required
                                                className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 font-medium"
                                                placeholder="Describe patient's main complaint..."
                                                rows={2}
                                            />
                                        </div>
                                    </section>

                                    {/* Vital Signs Section */}
                                    <section>
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                                            <Activity size={16} /> Vital Signs
                                        </h3>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-500">Blood Pressure</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number" placeholder="Sys"
                                                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-mono font-bold text-center"
                                                        value={vitals.systolic} onChange={e => setVitals({ ...vitals, systolic: e.target.value })}
                                                        required
                                                    />
                                                    <span className="text-gray-300">/</span>
                                                    <input
                                                        type="number" placeholder="Dia"
                                                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-mono font-bold text-center"
                                                        value={vitals.diastolic} onChange={e => setVitals({ ...vitals, diastolic: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-500">Heart Rate (bpm)</label>
                                                <div className="relative">
                                                    <Heart className="absolute left-3 top-3.5 text-red-400" size={16} />
                                                    <input
                                                        type="number"
                                                        className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-mono font-bold"
                                                        value={vitals.heart_rate} onChange={e => setVitals({ ...vitals, heart_rate: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-500">Temperature (°C)</label>
                                                <div className="relative">
                                                    <Thermometer className="absolute left-3 top-3.5 text-orange-400" size={16} />
                                                    <input
                                                        type="number" step="0.1"
                                                        className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-mono font-bold"
                                                        value={vitals.temperature} onChange={e => setVitals({ ...vitals, temperature: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-500">Weight (kg)</label>
                                                <div className="relative">
                                                    <Scale className="absolute left-3 top-3.5 text-blue-400" size={16} />
                                                    <input
                                                        type="number" step="0.1"
                                                        className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-mono font-bold"
                                                        value={vitals.weight} onChange={e => setVitals({ ...vitals, weight: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Allergies Section - Critical Safety */}
                                    <section className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-red-500 mb-4 flex items-center gap-2">
                                            <AlertTriangle size={16} /> Allergies & Alerts
                                        </h3>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 mb-2 block">Patient Allergies (Comma separated)</label>
                                            <textarea
                                                className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800/50 focus:ring-2 focus:ring-red-500 outline-none transition-all placeholder-red-200"
                                                placeholder="e.g. Penicillin, Seafood, Peanuts (Leave empty if none)"
                                                rows={3}
                                                value={allergies}
                                                onChange={(e) => setAllergies(e.target.value)}
                                            />
                                            <p className="text-xs text-red-400 mt-2 font-medium">* This information will trigger alerts on the Doctor's Dashboard.</p>
                                        </div>
                                    </section>

                                    <div className="pt-4 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedPatient(null)}
                                            className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                                        >
                                            {loading ? 'Submitting...' : <><CheckCircle size={20} /> Complete Triage</>}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[32px]">
                                <Activity size={64} className="mb-4 opacity-50" />
                                <h3 className="text-xl font-bold text-gray-400">Nurse Station</h3>
                                <p>Select a patient from the queue to start triage.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </PageWrapper>
    );
};

export default NurseDashboard;
