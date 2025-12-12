import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User, Calendar, MapPin, Phone, CreditCard,
    ArrowLeft, Printer, Edit, History, FileText,
    Stethoscope, Activity, CheckCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/axiosConfig';
import PageWrapper from '../components/PageWrapper';
import toast from 'react-hot-toast';

const PatientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Edit Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({});

    const fetchPatient = async () => {
        try {
            const res = await api.get(`/patients/${id}`);
            setPatient(res.data);
            setEditForm(res.data); // Pre-fill edit form
        } catch (error) {
            toast.error("Failed to load patient data");
            navigate('/admin/patients');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatient();
    }, [id, navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/patients/${id}`, editForm);
            toast.success("Patient updated successfully");
            setShowEditModal(false);
            fetchPatient(); // Refresh data
        } catch (error) {
            toast.error("Failed to update patient");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 font-bold">Loading Profile...</div>;
    if (!patient) return null;

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300
                ${activeTab === id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
        >
            <Icon size={16} strokeWidth={2.5} />
            {label}
        </button>
    );

    return (
        <PageWrapper title={`Patient: ${patient.name}`}>
            <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-6 md:p-8 font-sans">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => navigate('/admin/patients')} className="p-3 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 transition-colors border border-gray-100 dark:border-gray-700">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                                {patient.name}
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-lg">Active</span>
                            </h1>
                            <p className="text-gray-500 font-mono text-xs mt-1 font-bold">RM: {patient.no_rm} • NIK: {patient.nik}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* LEFT: Profile Card */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                                {/* Decor */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                                <div className="flex flex-col items-center text-center mb-6 relative z-10">
                                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-blue-500/30 mb-4">
                                        {patient.name.charAt(0)}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{patient.name}</h2>
                                    <p className="text-sm text-gray-500 font-bold mt-1">{patient.gender === 'L' ? 'Male' : 'Female'} • {new Date().getFullYear() - new Date(patient.birth_date).getFullYear()} Years Old</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                            <Phone size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400">Phone</p>
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{patient.phone || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400">Address</p>
                                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-2">{patient.address || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                            <CreditCard size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400">BPJS</p>
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{patient.bpjs_no || '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-6">
                                    <button className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gray-900/10 flex items-center justify-center gap-2">
                                        <Printer size={16} /> Print Card
                                    </button>
                                    <button onClick={() => setShowEditModal(true)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                                        <Edit size={16} /> Edit
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Tabs & Content */}
                        <div className="lg:col-span-2">
                            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                                <TabButton id="overview" label="Overview" icon={Activity} />
                                <TabButton id="history" label="Medical History" icon={FileText} />
                                <TabButton id="visits" label="Visit Log" icon={History} />
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 lg:p-8 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-700 min-h-[500px]">

                                {activeTab === 'overview' && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 text-center">
                                                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{patient.queues?.length || 0}</div>
                                                <div className="text-xs font-bold text-blue-400 dark:text-blue-500 uppercase tracking-wider">Total Visits</div>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 text-center">
                                                <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{patient.medical_records?.length || 0}</div>
                                                <div className="text-xs font-bold text-purple-400 dark:text-purple-500 uppercase tracking-wider">Records</div>
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Last Visit</h3>
                                        {patient.queues && patient.queues.length > 0 ? (
                                            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">
                                                    {new Date(patient.queues[0].created_at).getDate()}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white">Visited Poliklinik</h4>
                                                    <p className="text-sm text-gray-500">{new Date(patient.queues[0].created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long' })}</p>
                                                    <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">
                                                        {patient.queues[0].status}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-gray-400 italic text-sm">No visits recorded yet.</div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'history' && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative pl-4 space-y-8">
                                        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                                        {patient.medical_records && patient.medical_records.length > 0 ? patient.medical_records.map((record, idx) => (
                                            <div key={record.id} className="relative z-10 flex gap-6">
                                                <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 border-4 border-blue-50 dark:border-gray-700 shadow-sm flex items-center justify-center shrink-0">
                                                    <Stethoscope size={20} className="text-blue-500" />
                                                </div>
                                                <div className="flex-1 bg-gray-50 dark:bg-gray-700/20 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/50">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                                {record.doctor?.name || 'Unknown Doctor'}
                                                                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2 py-0.5 rounded-md font-normal">{record.doctor?.specialist}</span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 font-medium">{new Date(record.created_at).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 mt-4">
                                                        <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                                            <span className="font-bold text-gray-400 uppercase text-[10px] tracking-wider pt-1">Subjective</span>
                                                            <p className="text-gray-700 dark:text-gray-300">{record.subjective}</p>
                                                        </div>
                                                        <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                                            <span className="font-bold text-gray-400 uppercase text-[10px] tracking-wider pt-1">Diagnosis</span>
                                                            <p className="font-bold text-gray-900 dark:text-white bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-md inline-block w-fit">{record.assessment}</p>
                                                        </div>
                                                        <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                                            <span className="font-bold text-gray-400 uppercase text-[10px] tracking-wider pt-1">Prescription</span>
                                                            <p className="text-gray-700 dark:text-gray-300">{record.plan}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-gray-400 text-center py-10">No Medical Records Found</div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'visits' && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase font-bold text-xs top-0">
                                                    <tr>
                                                        <th className="p-4">Date</th>
                                                        <th className="p-4">Queue Code</th>
                                                        <th className="p-4">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                    {patient.queues && patient.queues.length > 0 ? patient.queues.map(q => (
                                                        <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                            <td className="p-4 font-medium">{new Date(q.created_at).toLocaleString()}</td>
                                                            <td className="p-4 font-mono font-bold text-blue-600">{q.queue_code}</td>
                                                            <td className="p-4">
                                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                                                    ${q.status === 'SERVED' ? 'bg-green-100 text-green-700' :
                                                                        q.status === 'WAITING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                    {q.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr><td colSpan="3" className="p-8 text-center text-gray-400">No visits found</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </motion.div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>

                {/* EDIT MODAL */}
                <AnimatePresence>
                    {showEditModal && (
                        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-gray-800 rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl"
                            >
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Patient</h2>
                                    <button onClick={() => setShowEditModal(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200"><X size={20} /></button>
                                </div>
                                <form onSubmit={handleUpdate} className="p-8 space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                                            <input required className="w-full p-4 rounded-xl border-0 bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 font-bold" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">NIK</label>
                                            <input required maxLength={16} className="w-full p-4 rounded-xl border-0 bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 font-bold" value={editForm.nik} onChange={e => setEditForm({ ...editForm, nik: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Gender</label>
                                            <select className="w-full p-4 rounded-xl border-0 bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 font-bold" value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value })}>
                                                <option value="L">Male</option>
                                                <option value="P">Female</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Date of Birth</label>
                                            <input required type="date" className="w-full p-4 rounded-xl border-0 bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 font-bold" value={editForm.birth_date ? new Date(editForm.birth_date).toISOString().split('T')[0] : ''} onChange={e => setEditForm({ ...editForm, birth_date: e.target.value })} />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone</label>
                                            <input className="w-full p-4 rounded-xl border-0 bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 font-bold" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Address</label>
                                            <textarea required className="w-full p-4 rounded-xl border-0 bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 font-bold resize-none h-24" value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="pt-4 flex justify-end gap-3">
                                        <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
                                        <button type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all">Save Changes</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </PageWrapper>
    );
};

export default PatientDetail;
