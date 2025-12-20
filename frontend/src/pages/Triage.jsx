import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Activity, Clock, Heart, Thermometer, User, CheckCircle, AlertCircle, RefreshCw, Zap, Shield, FileText } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../utils/axiosConfig';
import PageWrapper from '../components/PageWrapper';
import ModernHeader from '../components/ModernHeader';

const Triage = () => {
    const navigate = useNavigate();
    const [queue, setQueue] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form State
    const [vitals, setVitals] = useState({
        systolic: '', diastolic: '', heart_rate: '', temperature: '', respiratory_rate: '', oxygen_saturation: ''
    });
    const [chiefComplaint, setChiefComplaint] = useState('');
    const [allergies, setAllergies] = useState('');
    const [atsLevel, setAtsLevel] = useState(null); // 1-5

    const fetchQueue = async () => {
        try {
            const res = await api.get('/triage/queue');
            setQueue(res.data);
        } catch (error) {
            console.error("Failed to fetch triage queue", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPatient || !atsLevel) {
            toast.error("Please select a patient and ATS Level");
            return;
        }

        const toastId = toast.loading('Submitting Triage...');
        try {
            await api.post(`/triage/${selectedPatient.queue.id}/submit`, {
                vitals,
                chief_complaint: chiefComplaint,
                allergies: allergies,
                triage_level: atsLevel
            });

            toast.success('Triage Completed', { id: toastId });
            setSelectedPatient(null);
            setVitals({ systolic: '', diastolic: '', heart_rate: '', temperature: '', respiratory_rate: '', oxygen_saturation: '' });
            setChiefComplaint('');
            setAllergies('');
            setAtsLevel(null);
            fetchQueue();
        } catch (error) {
            toast.error('Submission Failed', { id: toastId });
        }
    };

    const atsLevels = [
        { level: 1, label: 'Resusitasi', color: 'bg-red-600', text: 'white', desc: 'Immediate life-saving intervention required' },
        { level: 2, label: 'Emergency', color: 'bg-orange-500', text: 'white', desc: 'High risk, severe pain, or confusion' },
        { level: 3, label: 'Urgent', color: 'bg-yellow-400', text: 'black', desc: 'Stable but requires multiple resources' },
        { level: 4, label: 'Less Urgent', color: 'bg-green-500', text: 'white', desc: 'Stable, requires one resource' },
        { level: 5, label: 'Non Urgent', color: 'bg-blue-500', text: 'white', desc: 'Stable, no resources needed' }
    ];

    return (
        <PageWrapper title="Triage Station">
            <Toaster position="top-center" toastOptions={{ className: 'backdrop-blur-md bg-white/80 dark:bg-gray-800/80' }} />

            <ModernHeader
                title="IGD Triage Station"
                subtitle="Patient Assessment & ATS Classification"
                onBack={() => navigate('/menu')}
            />

            <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-140px)] gap-6 p-6 max-w-[1920px] mx-auto">

                {/* LEFT PANEL: QUEUE */}
                <div className="w-full lg:w-[30%] flex flex-col gap-6">
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-4 rounded-[24px] shadow-lg border border-white/20 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg dark:text-white">Waiting List</h3>
                            <p className="text-xs text-gray-500">{queue.length} Patients</p>
                        </div>
                        <button onClick={fetchQueue} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                            <RefreshCw size={18} className="text-gray-400" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        <AnimatePresence>
                            {queue.length === 0 ? (
                                <div className="text-center py-20 text-gray-400">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle size={32} />
                                    </div>
                                    <p>No patients waiting for triage.</p>
                                </div>
                            ) : (
                                queue.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        onClick={() => setSelectedPatient(item)}
                                        className={`p-4 rounded-[20px] cursor-pointer transition-all border ${selectedPatient?.id === item.id
                                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 border-transparent'
                                            : 'bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-gray-700 border-transparent hover:border-red-200'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className={`font-bold text-lg ${selectedPatient?.id === item.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                                    {item.patient?.name}
                                                </div>
                                                <div className={`text-sm ${selectedPatient?.id === item.id ? 'text-red-100' : 'text-gray-500'}`}>
                                                    RM: {item.patient?.no_rm}
                                                </div>
                                                <div className="mt-2 text-xs font-mono opacity-80 flex items-center gap-1">
                                                    <Clock size={12} /> {new Date(item.queue.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <div className={`px-2 py-1 rounded-full text-xs font-bold ${selectedPatient?.id === item.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                                {item.queue.queue_code}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* RIGHT PANEL: ASSESSMENT FORM */}
                <div className="flex-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white/20 dark:border-gray-700 overflow-hidden flex flex-col relative">
                    {!selectedPatient ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <div className="w-24 h-24 bg-red-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-inner text-red-200">
                                <Activity size={48} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-300 dark:text-gray-600">Select Patient</h2>
                            <p className="opacity-60">Choose a patient from the queue to verify details</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            {/* Patient Header */}
                            <div className="bg-gradient-to-r from-red-50 to-white dark:from-red-900/20 dark:to-gray-900 p-8 border-b border-red-100 dark:border-red-900/30 flex justify-between items-center">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-red-500/30">
                                        {selectedPatient.patient?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{selectedPatient.patient?.name}</h1>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                                            <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-lg shadow-sm">RM: {selectedPatient.patient?.no_rm}</span>
                                            <span>{selectedPatient.patient?.gender === 'L' ? 'Male' : 'Female'}</span>
                                            <span>{selectedPatient.patient?.birth_date ? new Date(selectedPatient.patient.birth_date).toLocaleDateString() : '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Content */}
                            <div className="flex-1 overflow-y-auto p-10">
                                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">

                                    {/* 1. Vital Signs */}
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-400 uppercase tracking-wider text-xs flex items-center gap-2">
                                            <Activity size={16} className="text-red-500" /> Vital Signs
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                            {[
                                                { label: 'Systolic', key: 'systolic', unit: 'mmHg', icon: Heart },
                                                { label: 'Diastolic', key: 'diastolic', unit: 'mmHg', icon: Heart },
                                                { label: 'HR', key: 'heart_rate', unit: 'bpm', icon: Activity },
                                                { label: 'Temp', key: 'temperature', unit: '°C', icon: Thermometer },
                                                { label: 'RR', key: 'respiratory_rate', unit: 'x/m', icon: Zap }, // Respiratory Rate
                                                { label: 'SpO2', key: 'oxygen_saturation', unit: '%', icon: Zap }
                                            ].map((field) => (
                                                <div key={field.key} className="space-y-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase">{field.label}</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            step={field.key === 'temperature' ? '0.1' : '1'}
                                                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-bold text-center border-none focus:ring-2 focus:ring-red-500"
                                                            value={vitals[field.key]}
                                                            onChange={e => setVitals({ ...vitals, [field.key]: e.target.value })}
                                                            placeholder="-"
                                                        />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">{field.unit}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2. Chief Complaint & Allergies */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-gray-400 uppercase tracking-wider text-xs flex items-center gap-2">
                                                <FileText size={16} /> Chief Complaint
                                            </h3>
                                            <textarea
                                                className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-red-500 resize-none"
                                                placeholder="Keluhan utama pasien..."
                                                value={chiefComplaint}
                                                onChange={e => setChiefComplaint(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-gray-400 uppercase tracking-wider text-xs flex items-center gap-2">
                                                <Shield size={16} className="text-orange-500" /> Allergies
                                            </h3>
                                            <textarea
                                                className="w-full h-32 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border-none focus:ring-2 focus:ring-red-500 resize-none text-red-700 dark:text-red-300 placeholder-red-300"
                                                placeholder="Riwayat alergi obat/makanan..."
                                                value={allergies}
                                                onChange={e => setAllergies(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* 3. ATS Level Selector */}
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-400 uppercase tracking-wider text-xs flex items-center gap-2">
                                            <AlertCircle size={16} className="text-red-600" /> Australian Triage Scale (ATS)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                            {atsLevels.map((level) => (
                                                <div
                                                    key={level.level}
                                                    onClick={() => setAtsLevel(level.level)}
                                                    className={`cursor-pointer rounded-xl p-4 transition-all duration-300 border-2 relative overflow-hidden group
                                                        ${atsLevel === level.level
                                                            ? `border-${level.desc === 'Non Urgent' ? 'blue' : level.desc === 'Less Urgent' ? 'green' : level.desc === 'Urgent' ? 'yellow' : level.desc === 'Emergency' ? 'orange' : 'red'}-500 shadow-xl scale-[1.02]`
                                                            : 'border-transparent bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    <div className={`absolute top-0 left-0 w-full h-1.5 ${level.color}`}></div>
                                                    <div className="flex flex-col h-full justify-between">
                                                        <div>
                                                            <div className="text-2xl font-black opacity-20 absolute right-2 top-2">{level.level}</div>
                                                            <h4 className={`font-bold text-sm ${atsLevel === level.level ? '' : 'text-gray-900 dark:text-white'}`}>{level.label}</h4>
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 leading-tight mt-2">{level.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="h-4"></div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        className="w-full py-5 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-lg shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
                                    >
                                        <CheckCircle size={24} /> Submit Triage Assessment
                                    </button>

                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
};

export default Triage;
