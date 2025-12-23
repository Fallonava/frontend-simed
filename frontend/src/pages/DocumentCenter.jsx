import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Printer, Search, User, Calendar, Activity, CheckCircle, FilePlus } from 'lucide-react';
import api from '../utils/axiosConfig';
import PageWrapper from '../components/PageWrapper';
import toast, { Toaster } from 'react-hot-toast';
import ModernHeader from '../components/ModernHeader';
import { useNavigate } from 'react-router-dom';

const DocumentCenter = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [docType, setDocType] = useState(null); // 'SICK_LEAVE', 'HEALTH_CERT', 'REFERRAL'
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    // Mock Search (In real app, use debounce + API)
    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Reusing patient search API
            const res = await api.get(`/patients?search=${searchTerm}`);
            setPatients(res.data.data || []);
        } catch (error) {
            toast.error("Search failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedPatient || !docType) return;
        const toastId = toast.loading('Generating Document...');

        try {
            // Call backend to generate PDF
            const response = await api.post('/documents/generate', {
                type: docType,
                patient_id: selectedPatient.id,
                data: formData
            }, { responseType: 'blob' });

            // Trigger Download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${docType}_${selectedPatient.no_rm}.pdf`);
            document.body.appendChild(link);
            link.click();

            toast.success('Document Generated!', { id: toastId });
            setDocType(null);
            setFormData({});
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate document', { id: toastId });
        }
    };

    return (
        <PageWrapper title="Sentra Dokumen Medis">
            <Toaster position="top-center" />

            <ModernHeader
                title="Sentra Dokumen Medis"
                subtitle="Document Center / Legal & Medical Certificates"
                onBack={() => navigate('/menu')}
                className="mb-8"
            />

            <div className="max-w-6xl mx-auto p-6 flex flex-col gap-8">

                {/* 1. SEARCH PATIENT */}
                {!selectedPatient && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 p-8 rounded-[32px] shadow-xl border border-gray-100 dark:border-gray-700 text-center"
                    >
                        <div className="w-20 h-20 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AuthorIcon size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Who is this document for?</h2>
                        <p className="text-gray-500 mb-8">Search for a patient to start generating medical documents.</p>

                        <form onSubmit={handleSearch} className="max-w-xl mx-auto relative mb-8">
                            <Search className="absolute left-6 top-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Name, NIK, or MR Number..."
                                className="w-full pl-16 pr-6 py-5 rounded-[24px] bg-gray-50 dark:bg-gray-700 border-none focus:ring-4 focus:ring-cyan-500/20 text-lg font-bold shadow-inner"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </form>

                        {/* Results */}
                        {patients.length > 0 && (
                            <div className="max-w-xl mx-auto text-left space-y-2">
                                {patients.map(p => (
                                    <div
                                        key={p.id}
                                        onClick={() => setSelectedPatient(p)}
                                        className="p-4 rounded-2xl bg-white dark:bg-gray-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 border border-gray-200 dark:border-gray-600 cursor-pointer flex justify-between items-center transition-all hover:scale-[1.02]"
                                    >
                                        <div>
                                            <div className="font-bold text-gray-800 dark:text-white">{p.name}</div>
                                            <div className="text-xs text-gray-500">RM: {p.no_rm} | DOB: {new Date(p.birth_date).toLocaleDateString()}</div>
                                        </div>
                                        <ChevronRight className="text-gray-300" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* 2. DOCUMENT WORKSPACE */}
                {selectedPatient && (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar: Patient Info */}
                        <div className="w-full lg:w-1/3 space-y-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-[32px] shadow-lg border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xl font-bold">
                                        {selectedPatient.name.charAt(0)}
                                    </div>
                                    <button
                                        onClick={() => { setSelectedPatient(null); setDocType(null); }}
                                        className="text-xs font-bold text-gray-400 hover:text-red-500"
                                    >
                                        Change
                                    </button>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedPatient.name}</h3>
                                <p className="text-sm text-gray-500 mb-4">{selectedPatient.gender === 'L' ? 'Male' : 'Female'} | {selectedPatient.no_rm}</p>

                                <div className="space-y-3">
                                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-sm">
                                        <span className="block text-xs font-bold text-gray-400 uppercase">NIK</span>
                                        {selectedPatient.nik || '-'}
                                    </div>
                                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-sm">
                                        <span className="block text-xs font-bold text-gray-400 uppercase">Address</span>
                                        {selectedPatient.address || '-'}
                                    </div>
                                </div>
                            </div>

                            {/* Menu */}
                            <div className="space-y-2">
                                {[
                                    { id: 'SICK_LEAVE', label: 'Surat Keterangan Sakit', icon: <Activity /> },
                                    { id: 'HEALTH_CERT', label: 'Surat Keterangan Sehat', icon: <CheckCircle /> },
                                    { id: 'REFERRAL', label: 'Surat Rujukan RS', icon: <FilePlus /> },
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setDocType(item.id)}
                                        className={`w-full p-4 rounded-2xl flex items-center gap-4 font-bold transition-all ${docType === item.id ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50'}`}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Main Form */}
                        <div className="flex-1 bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-xl border border-gray-100 dark:border-gray-700">
                            {!docType ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                                    <Printer size={64} className="mb-4" />
                                    <p className="font-bold">Select a document type to begin</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-cyan-700 dark:text-cyan-400 border-b border-gray-100 pb-4 mb-6">
                                        {docType === 'SICK_LEAVE' && 'Surat Keterangan Sakit'}
                                        {docType === 'HEALTH_CERT' && 'Surat Keterangan Sehat'}
                                        {docType === 'REFERRAL' && 'Surat Rujukan'}
                                    </h2>

                                    {/* DYNAMIC FORMS */}
                                    {docType === 'SICK_LEAVE' && (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Rest Duration (Days)</label>
                                                    <input type="number" className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold mt-1"
                                                        onChange={e => setFormData({ ...formData, days: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Start Date</label>
                                                    <input type="date" className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold mt-1"
                                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase">Diagnosis / Reason</label>
                                                <textarea className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold mt-1 h-32"
                                                    onChange={e => setFormData({ ...formData, diagnosis: e.target.value })} />
                                            </div>
                                        </>
                                    )}

                                    {docType === 'HEALTH_CERT' && (
                                        <>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Height (cm)</label>
                                                    <input type="number" className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold mt-1"
                                                        onChange={e => setFormData({ ...formData, height: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Weight (kg)</label>
                                                    <input type="number" className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold mt-1"
                                                        onChange={e => setFormData({ ...formData, weight: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Blood Type</label>
                                                    <select className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold mt-1"
                                                        onChange={e => setFormData({ ...formData, bloodType: e.target.value })}>
                                                        <option value="">-</option>
                                                        <option value="A">A</option>
                                                        <option value="B">B</option>
                                                        <option value="AB">AB</option>
                                                        <option value="O">O</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Color Blindness</label>
                                                    <select className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold mt-1"
                                                        onChange={e => setFormData({ ...formData, colorBlind: e.target.value })}>
                                                        <option value="false">Normal</option>
                                                        <option value="true">Buta Warna</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Purpose</label>
                                                    <input type="text" placeholder="e.g. Melamar Pekerjaan" className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold mt-1"
                                                        onChange={e => setFormData({ ...formData, purpose: e.target.value })} />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {docType === 'REFERRAL' && (
                                        <>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase">Target Hospital</label>
                                                <input type="text" placeholder="RSUD..." className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold mt-1"
                                                    onChange={e => setFormData({ ...formData, targetHospital: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase">Target Poli / Specialist</label>
                                                <input type="text" placeholder="Poli Penyakit Dalam" className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold mt-1"
                                                    onChange={e => setFormData({ ...formData, targetPoli: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase">Reason for Referral</label>
                                                <textarea className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold mt-1 h-32"
                                                    onChange={e => setFormData({ ...formData, reason: e.target.value })} />
                                            </div>
                                        </>
                                    )}

                                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                                        <button onClick={() => setDocType(null)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
                                        <button
                                            onClick={handleGenerate}
                                            className="px-8 py-3 rounded-xl font-bold bg-cyan-600 text-white shadow-lg shadow-cyan-500/30 hover:bg-cyan-700 transition-all active:scale-95 flex items-center gap-2"
                                        >
                                            <Printer size={20} /> Generate & Print
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </PageWrapper>
    );
};
// Fix Icon name
const AuthorIcon = User;

export default DocumentCenter;
