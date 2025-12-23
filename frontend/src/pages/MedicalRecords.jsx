import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, Calendar, User, Stethoscope, Printer, Eye, ChevronRight, Activity, Filter, ClipboardPlus } from 'lucide-react';
import api from '../utils/axiosConfig';
import PageWrapper from '../components/PageWrapper';
import toast, { Toaster } from 'react-hot-toast';
import ModernHeader from '../components/ModernHeader';
import { useNavigate, useSearchParams } from 'react-router-dom';

const MedicalRecords = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [selectedRecord, setSelectedRecord] = useState(null);

    const fetchRecords = async (search = '') => {
        setLoading(true);
        try {
            const res = await api.get(`/medical-records/all${search ? `?search=${search}` : ''}`);
            setRecords(res.data);
        } catch (error) {
            toast.error('Failed to load medical records');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const query = searchParams.get('search');
        if (query) {
            fetchRecords(query);
        } else {
            fetchRecords();
        }
    }, [searchParams]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchRecords(searchTerm);
    };

    // Print Handler (Mock)
    const handlePrint = (record) => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1500)),
            {
                loading: 'Generating PDF...',
                success: 'Document sent to printer!',
                error: 'Print failed'
            }
        );
    };

    return (
        <PageWrapper title="Medical Records Management">
            <Toaster position="top-right" />

            <ModernHeader
                title="Rekam Medis"
                subtitle="Medical Records / EMR Management"
                onBack={() => navigate('/menu')}
                className="mb-6"
            />

            <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-[1920px] mx-auto h-[calc(100vh-140px)]">

                {/* LIST & FILTER SIDEBAR */}
                <div className="w-full lg:w-[400px] flex flex-col gap-6">
                    {/* Search Box */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Filter Archieve</h2>
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-4 top-4 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search Name / RM..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 border-none transition-all"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </form>
                    </div>

                    {/* Records List */}
                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-emerald-600 font-bold">
                                <FileText size={20} />
                                <span>Recent Visits</span>
                            </div>
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">{records.length} Records</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {loading ? (
                                <div className="text-center py-10 text-gray-400 animate-pulse">Loading Archive...</div>
                            ) : records.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">No records found.</div>
                            ) : (
                                records.map((rec) => (
                                    <motion.div
                                        key={rec.id}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => setSelectedRecord(rec)}
                                        className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedRecord?.id === rec.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 border-transparent' : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-white border-transparent hover:border-emerald-200'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="font-bold text-sm truncate w-40">{rec.patient?.name}</div>
                                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${selectedRecord?.id === rec.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                                {new Date(rec.visit_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className={`text-xs flex items-center gap-1 ${selectedRecord?.id === rec.id ? 'text-emerald-100' : 'text-gray-500'}`}>
                                            <Stethoscope size={12} />
                                            Dr. {rec.doctor?.name}
                                        </div>
                                        <div className={`mt-2 text-xs font-medium px-2 py-1 rounded bg-white/10 ${selectedRecord?.id === rec.id ? 'text-white' : 'text-gray-400'}`}>
                                            DX: {rec.assessment || 'No Diagnosis'}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* DETAIL VIEW */}
                <div className="flex-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/20 overflow-hidden flex flex-col relative">
                    {!selectedRecord ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                                <FileText size={48} className="opacity-50" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-300">Select a Record</h2>
                            <p className="opacity-50">View details, medical resume, and print options</p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-900 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider">Medical Resume</span>
                                        <span className="text-gray-500 text-sm font-bold">RM: {selectedRecord.patient?.no_rm}</span>
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{selectedRecord.patient?.name}</h1>
                                    <p className="text-gray-500 flex items-center gap-2">
                                        <Calendar size={14} /> Visit Date: {new Date(selectedRecord.visit_date).toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handlePrint(selectedRecord)}
                                    className="px-6 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 text-gray-700 dark:text-white rounded-xl font-bold shadow-sm border border-gray-200 dark:border-gray-600 flex items-center gap-2 transition-all active:scale-95"
                                >
                                    <Printer size={18} /> Print Resume
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                                <div className="max-w-4xl mx-auto space-y-8">

                                    {/* SOAP Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-800/30">
                                            <h3 className="text-blue-600 font-bold mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Subjective</h3>
                                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedRecord.subjective || '-'}</p>
                                        </div>
                                        <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl border border-red-100 dark:border-red-800/30">
                                            <h3 className="text-red-600 font-bold mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Objective</h3>
                                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedRecord.objective || '-'}</p>
                                        </div>
                                    </div>

                                    {/* Assessment & Plan - Full Width */}
                                    <div className="bg-yellow-50 dark:bg-yellow-900/10 p-8 rounded-3xl border border-yellow-100 dark:border-yellow-800/30">
                                        <h3 className="text-yellow-700 dark:text-yellow-500 font-bold mb-4 text-lg flex items-center gap-2"><Activity size={20} /> Assessment (Diagnosis)</h3>
                                        <div className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{selectedRecord.assessment || 'No Diagnosis Recorded'}</div>
                                    </div>

                                    <div className="bg-green-50 dark:bg-green-900/10 p-8 rounded-3xl border border-green-100 dark:border-green-800/30">
                                        <h3 className="text-green-700 dark:text-green-500 font-bold mb-4 text-lg flex items-center gap-2"><ClipboardPlus size={20} /> Plan & Therapy</h3>
                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-lg leading-relaxed">{selectedRecord.plan || '-'}</p>
                                    </div>

                                    {/* Clinical Orders Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Prescriptions */}
                                        <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-3xl border border-purple-100 dark:border-purple-800/30">
                                            <h3 className="text-purple-700 dark:text-purple-400 font-bold mb-4 flex items-center gap-2">
                                                <div className="p-1.5 bg-purple-100 rounded-lg"><ClipboardPlus size={16} /></div>
                                                Prescriptions
                                            </h3>
                                            {selectedRecord.prescriptions?.length > 0 ? (
                                                selectedRecord.prescriptions.map(p => (
                                                    <div key={p.id} className="space-y-2">
                                                        {p.items?.map((item, idx) => (
                                                            <div key={idx} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-purple-100 dark:border-gray-700 text-sm">
                                                                <div className="font-bold text-gray-800 dark:text-white">{item.medicine?.name || 'Unknown Drug'}</div>
                                                                <div className="text-gray-500">{item.quantity} {item.medicine?.unit} • {item.dosage}</div>
                                                                {item.notes && <div className="text-xs text-orange-500 mt-1">Note: {item.notes}</div>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-gray-400 text-sm italic">No prescriptions.</div>
                                            )}
                                        </div>

                                        {/* Labs / Radiology */}
                                        <div className="bg-cyan-50 dark:bg-cyan-900/10 p-6 rounded-3xl border border-cyan-100 dark:border-cyan-800/30">
                                            <h3 className="text-cyan-700 dark:text-cyan-400 font-bold mb-4 flex items-center gap-2">
                                                <div className="p-1.5 bg-cyan-100 rounded-lg"><Activity size={16} /></div>
                                                Labs & Radiology
                                            </h3>
                                            {selectedRecord.service_orders?.length > 0 ? (
                                                <div className="space-y-2">
                                                    {selectedRecord.service_orders.map(order => (
                                                        <div key={order.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-cyan-100 dark:border-gray-700 flex justify-between items-center">
                                                            <div>
                                                                <div className="font-bold text-gray-800 dark:text-white">{order.type} Order</div>
                                                                <div className="text-xs text-gray-500 mt-0.5 whitespace-pre-line">{order.notes || 'No notes'}</div>
                                                            </div>
                                                            <div className={`text-[10px] font-bold px-2 py-1 rounded ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                {order.status}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-gray-400 text-sm italic">No service orders.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Vitals Summary */}
                                    <div className="flex gap-4 overflow-x-auto py-4">
                                        {[
                                            { label: 'BP', value: `${selectedRecord.systolic}/${selectedRecord.diastolic}`, unit: 'mmHg' },
                                            { label: 'HR', value: selectedRecord.heart_rate, unit: 'bpm' },
                                            { label: 'Temp', value: selectedRecord.temperature, unit: '°C' },
                                            { label: 'Weight', value: selectedRecord.weight, unit: 'kg' },
                                        ].map((vital, i) => (
                                            <div key={i} className="flex-none w-32 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
                                                <div className="text-xs text-gray-400 uppercase font-bold mb-1">{vital.label}</div>
                                                <div className="text-xl font-bold text-gray-800 dark:text-white">{vital.value || '-'}</div>
                                                <div className="text-[10px] text-gray-400">{vital.unit}</div>
                                            </div>
                                        ))}
                                    </div>

                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
};

export default MedicalRecords;
