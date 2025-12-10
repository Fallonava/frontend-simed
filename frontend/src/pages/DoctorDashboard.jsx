import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, CheckCircle, Activity, FileText, Save, History, Search, ChevronRight, User } from 'lucide-react';
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
        plan: ''
    });

    const [patientHistory, setPatientHistory] = useState([]);
    const [viewMode, setViewMode] = useState('record'); // 'record' or 'history'

    // Fetch Doctors for the "View As" selector (Temporary until User-Doctor mapping exists)
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
        fetchDoctors();
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
            // Reset SOAP
            setSoap({ subjective: '', objective: '', assessment: '', plan: '' });
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
            await api.post('/medical-records', {
                patient_id: selectedQueue.patient_id,
                doctor_id: selectedDoctor.id,
                queue_id: selectedQueue.id,
                ...soap
            });

            toast.success("Medical Record Saved!");

            // Optimistically update queue (remove served patient)
            setQueues(prev => prev.filter(q => q.id !== selectedQueue.id));
            setSelectedQueue(null);

        } catch (error) {
            toast.error("Failed to save record");
            console.error(error);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Loading Dashboard...</div>;

    return (
        <PageWrapper title="Doctor Dashboard">
            <Toaster position="top-center" toastOptions={{ className: 'backdrop-blur-md bg-white/80 dark:bg-gray-800/80' }} />

            <div className="flex h-[calc(100vh-100px)] gap-6 p-6 max-w-[1600px] mx-auto">

                {/* LEFT PANEL: QUEUE LIST */}
                <div className="w-[30%] flex flex-col gap-6">
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
                <div className="flex-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white/20 dark:border-gray-700 overflow-hidden flex flex-col relative">
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

                                            {/* Assessment */}
                                            <div className="space-y-3">
                                                <label className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                                                    <span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-xs">A</span>
                                                    Assessment (Diagnosa)
                                                </label>
                                                <textarea
                                                    className="w-full h-32 p-5 rounded-[24px] bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-yellow-500 transition-all text-lg resize-none shadow-inner"
                                                    placeholder="Diagnosa kerja..."
                                                    value={soap.assessment}
                                                    onChange={e => setSoap({ ...soap, assessment: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            {/* Plan */}
                                            <div className="space-y-3">
                                                <label className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                                                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">P</span>
                                                    Plan (Terapi/Tindakan)
                                                </label>
                                                <textarea
                                                    className="w-full h-32 p-5 rounded-[24px] bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-green-500 transition-all text-lg resize-none shadow-inner"
                                                    placeholder="Resep obat dan tindakan..."
                                                    value={soap.plan}
                                                    onChange={e => setSoap({ ...soap, plan: e.target.value })}
                                                    required
                                                />
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
