import React, { useState, useEffect } from 'react';
import {
    FileText, CheckCircle, AlertCircle, Search, Activity, DollarSign,
    Layers, BookOpen, User, Calendar, Save, Download, FileCheck
} from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import PageWrapper from '../components/PageWrapper';
import ModernHeader from '../components/ModernHeader';
import { motion, AnimatePresence } from 'framer-motion';

const CasemixDashboard = () => {
    const [activeTab, setActiveTab] = useState('coding'); // coding, grouping, claims
    const [queues, setQueues] = useState({ coding_queue: [], grouped_queue: [], claimed_history: [] });
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(true);

    // Coding Form
    const [formData, setFormData] = useState({
        primary_icd10: '',
        secondary_icd10s: '',
        procedures: ''
    });

    useEffect(() => {
        fetchQueues();
    }, []);

    const fetchQueues = async () => {
        setLoading(true);
        try {
            const res = await api.get('/casemix/pending');
            setQueues(res.data);
        } catch (error) {
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectForCoding = (record) => {
        setSelectedItem(record);
        // Pre-fill if available
        setFormData({
            primary_icd10: record.icd10?.code || record.icd10_code || '',
            secondary_icd10s: '',
            procedures: ''
        });
    };

    const runGrouper = async () => {
        if (!selectedItem) return;
        toast.promise(
            api.post('/casemix/save', {
                medical_record_id: selectedItem.id,
                ...formData,
                user_name: 'Coder Admin'
            }).then(() => {
                fetchQueues();
                setSelectedItem(null);
                setActiveTab('grouping');
            }),
            {
                loading: 'Running Grouper Engine...',
                success: 'Grouping Complete!',
                error: 'Grouping Failed'
            }
        );
    };

    const finalizeClaim = async (casemixId) => {
        toast.promise(
            api.post('/casemix/claim', { id: casemixId }).then(res => {
                // Mock Download
                const blob = new Blob([res.data.file_content], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = res.data.filename;
                a.click();
                fetchQueues();
            }),
            {
                loading: 'Generating Claim File...',
                success: 'Claim Finalized & Downloaded',
                error: 'Failed'
            }
        );
    };

    const tabs = [
        { id: 'coding', label: 'Coding Queue', icon: BookOpen, count: queues.coding_queue.length },
        { id: 'grouping', label: 'Grouping Results', icon: Layers, count: queues.grouped_queue.length },
        { id: 'claims', label: 'Claims History', icon: FileCheck, count: queues.claimed_history.length },
    ];

    return (
        <PageWrapper title="Casemix Center">
            <Toaster position="top-right" />
            <ModernHeader
                title="Casemix Integration"
                subtitle="INA-CBG Coding & Claim Management"
            />

            <div className="p-6 max-w-[1920px] mx-auto min-h-[calc(100vh-140px)] flex flex-col gap-6">

                {/* Tab Navigation */}
                <div className="flex bg-white/50 dark:bg-gray-800/50 backdrop-blur p-1.5 rounded-2xl w-fit border border-white/20 shadow-sm">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setSelectedItem(null); }}
                            className={`px-6 py-3 rounded-xl flex items-center gap-3 transition-all text-sm font-bold ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                            {tab.count > 0 && <span className="bg-white/20 px-2 py-0.5 rounded textxs">{tab.count}</span>}
                        </button>
                    ))}
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 grid grid-cols-12 gap-8">

                    {/* LEFT LIST (Shared for Coding & Grouping Selection) */}
                    {activeTab === 'coding' && (
                        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
                            <div className="glass-panel p-4 rounded-[24px]">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="text" placeholder="Search Patient..." className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                {queues.coding_queue.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleSelectForCoding(item)}
                                        className={`p-5 rounded-[24px] cursor-pointer border transition-all ${selectedItem?.id === item.id
                                                ? 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-500/30'
                                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-indigo-300'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-lg">{item.patient.name}</h4>
                                            <span className="text-xs opacity-70 font-mono">{new Date(item.visit_date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm opacity-80 mb-3">
                                            <User size={14} /> RM: {item.patient.no_rm}
                                        </div>
                                        <div className={`text-xs font-bold px-3 py-1.5 rounded-lg w-fit ${selectedItem?.id === item.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                            DX: {item.assessment || 'No Diagnosis'}
                                        </div>
                                    </div>
                                ))}
                                {queues.coding_queue.length === 0 && <EmptyState msg="No pending records" />}
                            </div>
                        </div>
                    )}

                    {/* DETAIL / WORKSPACE AREA */}
                    {activeTab === 'coding' && (
                        <div className="col-span-12 lg:col-span-8">
                            <AnimatePresence mode="wait">
                                {selectedItem ? (
                                    <motion.div
                                        key="workspace"
                                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                        className="h-full flex flex-col gap-6"
                                    >
                                        {/* Clinical Summary */}
                                        <div className="glass-panel p-8 rounded-[32px] border border-indigo-100 dark:border-indigo-900/30">
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                                                <Activity className="text-indigo-500" /> Clinical Context
                                            </h3>
                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-400 uppercase">Assessment</label>
                                                    <p className="font-medium text-lg text-gray-900 dark:text-gray-100">{selectedItem.assessment}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-400 uppercase">Doctor</label>
                                                    <p className="font-medium text-lg text-gray-900 dark:text-gray-100">{selectedItem.doctor.name}</p>
                                                </div>
                                                <div className="col-span-2 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-800/30">
                                                    <label className="text-xs font-bold text-yellow-600 uppercase">Doctor's ICD-10 Suggestion</label>
                                                    <p className="font-bold text-yellow-800 dark:text-yellow-400 mt-1">
                                                        {selectedItem.icd10 ? `${selectedItem.icd10.code} - ${selectedItem.icd10.description}` : 'Not Specified'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Coder Input */}
                                        <div className="glass-panel p-8 rounded-[32px] flex-1 border border-white/20">
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                                                <BookOpen className="text-teal-500" /> Coding Input
                                            </h3>
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-500 mb-2">Primary ICD-10</label>
                                                    <input
                                                        value={formData.primary_icd10}
                                                        onChange={e => setFormData({ ...formData, primary_icd10: e.target.value })}
                                                        className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                                                        placeholder="e.g. A01.0"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-500 mb-2">Secondary ICD-10s</label>
                                                        <input
                                                            value={formData.secondary_icd10s}
                                                            onChange={e => setFormData({ ...formData, secondary_icd10s: e.target.value })}
                                                            className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                                                            placeholder="Comma separated..."
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-500 mb-2">Procedures (ICD-9)</label>
                                                        <input
                                                            value={formData.procedures}
                                                            onChange={e => setFormData({ ...formData, procedures: e.target.value })}
                                                            className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                                                            placeholder="e.g. 89.03"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-6 flex justify-end">
                                                    <button
                                                        onClick={runGrouper}
                                                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/30 flex items-center gap-3 transition-transform active:scale-95"
                                                    >
                                                        <Layers size={24} /> Run Grouper Engine
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 glass-panel rounded-[32px]">
                                        <img src="https://cdn-icons-png.flaticon.com/512/2764/2764494.png" className="w-24 opacity-20 mb-4 invert dark:invert-0" alt="Select" />
                                        <h3 className="text-xl font-bold">Ready to Code</h3>
                                        <p>Select a patient from the left queue to begin.</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* GROUPED RESULTS LIST */}
                    {activeTab === 'grouping' && (
                        <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {queues.grouped_queue.map(item => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    key={item.id}
                                    className="glass-panel p-6 rounded-[32px] border border-white/20 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold border border-green-200">{item.ina_cbg_code}</span>
                                            <span className="text-gray-400 text-xs font-mono">{new Date(item.coded_at).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{item.medical_record.patient.name}</h3>
                                        <p className="text-sm text-gray-500 font-bold mb-4">{item.ina_cbg_desc}</p>

                                        <div className="space-y-2 bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl mb-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">ICD-10</span>
                                                <span className="font-bold">{item.primary_icd10}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Coders</span>
                                                <span className="font-bold">{item.coder_name}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex justify-between items-end mb-4">
                                            <span className="text-gray-500 text-sm font-medium">Approved Tariff</span>
                                            <span className="text-2xl font-black text-indigo-600">Rp {item.tariff.toLocaleString()}</span>
                                        </div>
                                        <button
                                            onClick={() => finalizeClaim(item.id)}
                                            className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                        >
                                            <Download size={18} /> Finalize Claim
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                            {queues.grouped_queue.length === 0 && <div className="col-span-full self-center"><EmptyState msg="No grouped results waiting for claims" /></div>}
                        </div>
                    )}

                    {/* CLAIMS HISTORY */}
                    {activeTab === 'claims' && (
                        <div className="col-span-12">
                            <div className="glass-panel p-6 rounded-[32px] overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="text-xs uppercase text-gray-500 font-bold bg-gray-50 dark:bg-gray-900/30">
                                        <tr>
                                            <th className="p-4 rounded-l-xl">Patient</th>
                                            <th className="p-4">CBG Code</th>
                                            <th className="p-4">Tariff</th>
                                            <th className="p-4">Date</th>
                                            <th className="p-4 text-center rounded-r-xl">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {queues.claimed_history.map(item => (
                                            <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                                <td className="p-4 font-bold text-gray-900 dark:text-white">{item.medical_record.patient.name}</td>
                                                <td className="p-4 font-mono text-gray-600">{item.ina_cbg_code}</td>
                                                <td className="p-4 font-bold text-green-600">Rp {item.tariff.toLocaleString()}</td>
                                                <td className="p-4 text-sm text-gray-500">{new Date(item.updated_at).toLocaleDateString()}</td>
                                                <td className="p-4 text-center">
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1 justify-center w-fit mx-auto">
                                                        <CheckCircle size={12} /> CLAIMED
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {queues.claimed_history.length === 0 && <EmptyState msg="No claims history found" />}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </PageWrapper>
    );
};

const EmptyState = ({ msg }) => (
    <div className="flex flex-col items-center justify-center p-12 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[32px] w-full h-full min-h-[300px]">
        <Layers size={48} className="mb-4 opacity-20" />
        <p className="font-bold">{msg}</p>
    </div>
);

export default CasemixDashboard;
