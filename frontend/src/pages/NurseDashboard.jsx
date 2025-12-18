import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Thermometer, Heart, Wind, Scale, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../utils/axiosConfig';
import PageWrapper from '../components/PageWrapper';
import useThemeStore from '../store/useThemeStore';

const NurseDashboard = () => {
    const { mode } = useThemeStore();
    const [queue, setQueue] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [loading, setLoading] = useState(false);

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

    const fetchQueue = async () => {
        try {
            // Fetch records where triage_status = PENDING and queue status != COMPLETED
            const res = await api.get('/triage/queue');
            setQueue(res.data);
        } catch (error) {
            console.error(error);
        }
    };

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
                allergies: allergies
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
            <Toaster position="top-center" />
            <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-6 flex flex-col md:flex-row gap-6">

                {/* LEFT: Queue List */}
                <div className="w-full md:w-1/3 space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Clock className="text-blue-500" />
                            Waiting for Triage
                        </h2>
                        <p className="text-gray-500 text-sm">Patients checked-in but not yet seen by doctor</p>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
                        {queue.length === 0 && (
                            <div className="text-center py-10 text-gray-400">No patients waiting</div>
                        )}
                        {queue.map(item => (
                            <motion.div
                                key={item.id}
                                layoutId={item.id}
                                onClick={() => handleSelect(item)}
                                className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedPatient?.id === item.id
                                        ? 'bg-blue-50 border-blue-200 shadow-md ring-1 ring-blue-300'
                                        : 'bg-white dark:bg-gray-800 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-900 dark:text-white">{item.patient?.name}</h3>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-mono">
                                        {item.queue?.queue_code || 'N/A'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">To: {item.doctor?.name}</p>
                            </motion.div>
                        ))}
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
                                className="bg-white dark:bg-gray-800 rounded-[32px] p-8 shadow-xl border border-gray-100 dark:border-gray-700"
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
