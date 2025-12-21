import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User, Calendar, MapPin, Phone, CreditCard,
    ArrowLeft, Printer, Edit, History, FileText,
    Stethoscope, Activity, CheckCircle, X, Pill, AlertTriangle, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/axiosConfig';
import PageWrapper from '../components/PageWrapper';
import ModernHeader from '../components/ModernHeader';
import toast, { Toaster } from 'react-hot-toast';

const PatientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Edit Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({});

    // Discharge Modal
    const [showDischargeModal, setShowDischargeModal] = useState(false);
    const [dischargeForm, setDischargeForm] = useState({
        date: new Date().toISOString().slice(0, 16),
        type: 'Sembuh',
        final_diagnosis: '',
        resume: '',
        follow_up: '',
        control_date: ''
    });

    const fetchPatient = async () => {
        try {
            const res = await api.get(`/patients/${id}`);
            setPatient(res.data);
            setEditForm(res.data);

            // Check for Active Admission
            const activeAdmission = res.data.admissions?.[0];
            if (activeAdmission && activeAdmission.status === 'DISCHARGE_INITIATED') {
                // Pre-fill or show status
                setDischargeForm(prev => ({ ...prev, resume: activeAdmission.notes || '' }));
            }
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
            fetchPatient();
        } catch (error) {
            toast.error("Failed to update patient");
        }
    };

    const handleDischarge = async (e) => {
        e.preventDefault();

        const activeAdmission = patient.admissions?.[0];
        if (!activeAdmission) {
            toast.error("No active admission found for this patient.");
            return;
        }

        try {
            // Use proper backend initiation
            await api.post(`/discharge/${activeAdmission.id}/initiate`, {
                discharge_notes: dischargeForm.resume,
                icd10_code: dischargeForm.final_diagnosis // mapping for now
            });

            // Optimistic Update
            const updatedPatient = { ...patient };
            updatedPatient.admissions[0].status = 'DISCHARGE_INITIATED';
            setPatient(updatedPatient);

            toast.success("Discharge Initiated! Please process in Nurse Station.");
            setShowDischargeModal(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to initiate discharge");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 font-bold animate-pulse">Loading Profile...</div>;
    if (!patient) return null;

    const isDischarged = patient.status === 'Discharged' || (patient.admissions?.[0]?.status === 'DISCHARGED');
    const isInitiated = patient.admissions?.[0]?.status === 'DISCHARGE_INITIATED';

    return (
        <PageWrapper title={`Patient: ${patient.name}`}>
            <Toaster position="top-right" />
            <ModernHeader
                title={patient.name}
                subtitle={`RM: ${patient.no_rm} • NIK: ${patient.nik}`}
                action={
                    <button
                        onClick={() => navigate('/admin/patients')}
                        className="bg-white/50 backdrop-blur p-2.5 rounded-xl hover:bg-white text-gray-500 hover:text-gray-900 transition-all border border-white/20"
                    >
                        <ArrowLeft size={20} />
                    </button>
                }
            />

            <div className="p-6 md:p-8 max-w-[1920px] mx-auto min-h-screen">

                {isDischarged && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-6 rounded-3xl flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600">
                                <LogOut size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-red-700 dark:text-white">Patient Discharged</h3>
                                <p className="text-sm font-bold text-red-500 dark:text-red-400">
                                    Discharge completed. Admission closed.
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setShowDischargeModal(true)} className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50">
                            View Summary
                        </button>
                    </motion.div>
                )}

                {isInitiated && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-6 rounded-3xl flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-amber-700 dark:text-white">Discharge in Progress</h3>
                                <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                    Waiting for Nurse Station clearance (Checklist & Billing).
                                </p>
                            </div>
                        </div>
                        <span className="px-6 py-3 bg-white dark:bg-gray-800 text-amber-600 rounded-xl font-bold text-sm shadow-sm">
                            Pending Nurse Action
                        </span>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: PROFILE CARD */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="glass-panel p-6 rounded-[40px] relative overflow-hidden text-center border-t border-white/40 sticky top-24"
                        >
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 blur-3xl"></div>

                            <div className="relative z-10 flex flex-col items-center">
                                <div className={`w-32 h-32 rounded-[2rem] flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-indigo-500/30 mb-6 ${patient.gender === 'L' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-pink-500 to-rose-600'
                                    }`}>
                                    {patient.name.charAt(0)}
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{patient.name}</h2>
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${isDischarged ? 'bg-red-100 text-red-600' : isInitiated ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                    {isDischarged ? 'Discharged' : isInitiated ? 'Discharge Pending' : 'Active Patient'}
                                </span>
                            </div>

                            <div className="mt-8 space-y-4 text-left">
                                <InfoRow icon={Phone} label="Contact" value={patient.phone} />
                                <InfoRow icon={MapPin} label="Address" value={patient.address} />
                                <InfoRow icon={CreditCard} label="BPJS Number" value={patient.bpjs_no} />

                                {patient.allergies && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/50 flex gap-3 items-start">
                                        <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Allergies</p>
                                            <p className="text-sm font-bold text-red-800 dark:text-red-300 mt-1">{patient.allergies}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-8">
                                <button className="py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                                    <Printer size={18} /> Print
                                </button>
                                <button onClick={() => setShowEditModal(true)} className="py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <Edit size={18} /> Edit
                                </button>
                            </div>

                            {!isDischarged && !isInitiated && patient.admissions?.length > 0 && (
                                <button
                                    onClick={() => setShowDischargeModal(true)}
                                    className="w-full mt-3 py-4 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 rounded-2xl font-bold text-sm hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors flex items-center justify-center gap-2 border border-rose-100 dark:border-rose-900/50"
                                >
                                    <LogOut size={18} /> Order Discharge
                                </button>
                            )}
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN: CLINICAL JOURNEY */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-6">

                        {/* Tab Switcher */}
                        <div className="flex bg-white/50 dark:bg-gray-800/50 backdrop-blur p-1.5 rounded-2xl w-fit border border-white/20 shadow-sm mx-auto lg:mx-0">
                            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={Activity} label="Overview" />
                            <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={FileText} label="Clinical History" />
                            <TabButton active={activeTab === 'visits'} onClick={() => setActiveTab('visits')} icon={History} label="Visits Log" />
                        </div>

                        {/* Content Area */}
                        <div className="glass-panel p-8 rounded-[40px] min-h-[600px] border-t border-white/40">
                            <AnimatePresence mode="wait">
                                {activeTab === 'overview' && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Activity className="text-indigo-500" /> Patient Snapshot
                                        </h3>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                            <StatBox label="Total Visits" value={patient.queues?.length || 0} color="blue" />
                                            <StatBox label="Records" value={patient.medical_records?.length || 0} color="purple" />
                                            <StatBox label="Status" value={isDischarged ? 'Discharged' : 'Active'} color={isDischarged ? 'orange' : 'green'} />
                                            <StatBox label="Last BPJS" value="Active" color="green" />
                                        </div>

                                        <div className="mt-8">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                                            {patient.queues && patient.queues.length > 0 ? (
                                                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 flex items-center gap-6">
                                                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center font-black text-2xl text-gray-300">
                                                        {new Date(patient.queues[0].created_at).getDate()}
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last Visit Date</span>
                                                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                                            {new Date(patient.queues[0].created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long' })}
                                                        </h4>
                                                        <div className="mt-2 flex gap-2">
                                                            <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg text-xs font-bold border border-gray-200 dark:border-gray-700 text-gray-500">
                                                                Queue: {patient.queues[0].queue_code}
                                                            </span>
                                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">
                                                                {patient.queues[0].status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-12 text-gray-400 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">No recent activity</div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'history' && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pl-4 md:pl-8 border-l-2 border-indigo-100 dark:border-gray-700 space-y-12 py-4">
                                        {patient.medical_records && patient.medical_records.length > 0 ? patient.medical_records.map((record, idx) => (
                                            <div key={record.id} className="relative">
                                                <div className="absolute -left-[45px] top-0 w-6 h-6 rounded-full bg-indigo-500 border-4 border-white dark:border-gray-900 shadow-lg"></div>

                                                <div className="mb-4">
                                                    <span className="text-sm font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">{new Date(record.created_at).toLocaleDateString()}</span>
                                                    <span className="ml-2 text-xs text-gray-400 font-bold">{new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>

                                                <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-xl shadow-gray-100 dark:shadow-none border border-gray-100 dark:border-gray-700/50">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                                                <Stethoscope size={24} />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-lg text-gray-900 dark:text-white">{record.doctor?.name || 'Unknown Doctor'}</h4>
                                                                <p className="text-xs font-bold text-gray-400 uppercase">{record.doctor?.specialist || 'General Practitioner'}</p>
                                                            </div>
                                                        </div>
                                                        {record.assessment && <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg text-xs font-bold border border-yellow-200">{record.assessment}</span>}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-900/30 p-5 rounded-2xl">
                                                        <div className="space-y-1">
                                                            <span className="text-xs font-bold text-gray-400 uppercase">Subjective (S)</span>
                                                            <p className="text-gray-800 dark:text-gray-200 font-medium">{record.subjective}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-xs font-bold text-gray-400 uppercase">Plan / Prescription (P)</span>
                                                            <p className="text-gray-800 dark:text-gray-200 font-medium">{record.plan}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-gray-400 italic">No medical history available.</div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'visits' && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                        <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase font-bold text-gray-400">
                                                    <tr>
                                                        <th className="p-4">Date & Time</th>
                                                        <th className="p-4">Queue Ticket</th>
                                                        <th className="p-4 rounded-r-xl">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                    {patient.queues?.map(q => (
                                                        <tr key={q.id}>
                                                            <td className="p-4 font-bold text-gray-700 dark:text-gray-300">{new Date(q.created_at).toLocaleString()}</td>
                                                            <td className="p-4 font-mono font-bold text-indigo-600">{q.queue_code}</td>
                                                            <td className="p-4">
                                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                                                    ${q.status === 'SERVED' ? 'bg-green-100 text-green-700' :
                                                                        q.status === 'WAITING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                    {q.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* EDIT MODAL */}
                <AnimatePresence>
                    {showEditModal && (
                        <div className="fixed inset-0 bg-gray-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white dark:bg-gray-800 rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/20"
                            >
                                <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Edit Patient Profile</h2>
                                    <button onClick={() => setShowEditModal(false)} className="p-2 bg-white dark:bg-gray-700 rounded-full hover:bg-gray-100 shadow-sm"><X size={20} /></button>
                                </div>
                                <form onSubmit={handleUpdate} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                                            <input className="w-full p-4 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-bold" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">NIK</label>
                                            <input className="w-full p-4 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-bold" value={editForm.nik} onChange={e => setEditForm({ ...editForm, nik: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Gender</label>
                                            <select className="w-full p-4 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-bold" value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value })}>
                                                <option value="L">Male</option>
                                                <option value="P">Female</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Phone</label>
                                            <input className="w-full p-4 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-bold" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Address</label>
                                            <textarea className="w-full p-4 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-bold resize-none h-24" value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                                        <button type="button" onClick={() => setShowEditModal(false)} className="px-8 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
                                        <button type="submit" className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xl shadow-indigo-500/30">Save Changes</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* DISCHARGE PLANNING MODAL */}
                <AnimatePresence>
                    {showDischargeModal && (
                        <div className="fixed inset-0 bg-gray-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white dark:bg-gray-800 rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/20"
                            >
                                <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                            <LogOut className="text-red-500" /> Patient Discharge
                                        </h2>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
                                            Finalize visit and discharge planning
                                        </p>
                                    </div>
                                    <button onClick={() => setShowDischargeModal(false)} className="p-2 bg-white dark:bg-gray-700 rounded-full hover:bg-gray-100 shadow-sm"><X size={20} /></button>
                                </div>
                                <form onSubmit={handleDischarge} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">

                                    {isDischarged && (
                                        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200 text-sm font-bold flex items-center gap-3">
                                            <AlertTriangle size={20} />
                                            <span>This patient is already discharged. Submitting will update the record.</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Discharge Date</label>
                                            <input
                                                type="datetime-local"
                                                required
                                                className="w-full p-4 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-bold"
                                                value={dischargeForm.date}
                                                onChange={e => setDischargeForm({ ...dischargeForm, date: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Discharge Type</label>
                                            <select
                                                className="w-full p-4 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-bold"
                                                value={dischargeForm.type}
                                                onChange={e => setDischargeForm({ ...dischargeForm, type: e.target.value })}
                                            >
                                                <option value="Sembuh">Pulang Sembuh (Recovered)</option>
                                                <option value="Berobat Jalan">Berobat Jalan (Outpatient)</option>
                                                <option value="Rujuk">Rujuk (Referred)</option>
                                                <option value="APS">Pulang APS (Self-Discharge)</option>
                                                <option value="Meninggal">Meninggal (Deceased)</option>
                                            </select>
                                        </div>

                                        <div className="col-span-2 space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Final Diagnosis</label>
                                            <input
                                                className="w-full p-4 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-bold"
                                                value={dischargeForm.final_diagnosis}
                                                onChange={e => setDischargeForm({ ...dischargeForm, final_diagnosis: e.target.value })}
                                                placeholder="e.g. Acute Bronchitis - Recovered"
                                            />
                                        </div>

                                        <div className="col-span-2 space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Clinical Resume / Summary</label>
                                            <textarea
                                                className="w-full p-4 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-bold resize-none h-32"
                                                value={dischargeForm.resume}
                                                onChange={e => setDischargeForm({ ...dischargeForm, resume: e.target.value })}
                                                placeholder="Brief summary of treatment, major findings, and procedures..."
                                            />
                                        </div>

                                        <div className="col-span-2 space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Follow-up Instructions</label>
                                            <textarea
                                                className="w-full p-4 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-bold resize-none h-24"
                                                value={dischargeForm.follow_up}
                                                onChange={e => setDischargeForm({ ...dischargeForm, follow_up: e.target.value })}
                                                placeholder="Medication instructions, rest requirements..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Control Date (Optional)</label>
                                            <input
                                                type="date"
                                                className="w-full p-4 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-bold"
                                                value={dischargeForm.control_date}
                                                onChange={e => setDischargeForm({ ...dischargeForm, control_date: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                                        <button type="button" onClick={() => setShowDischargeModal(false)} className="px-8 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
                                        <button type="submit" className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-xl shadow-red-500/30 flex items-center gap-2">
                                            <LogOut size={20} />
                                            {isDischarged ? 'Update Discharge' : 'Discharge Patient'}
                                        </button>
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

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50">
        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400">
            <Icon size={18} />
        </div>
        <div>
            <p className="text-[10px] uppercase font-bold text-gray-400">{label}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{value || '-'}</p>
        </div>
    </div>
);

const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button onClick={onClick} className={`px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${active
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
        : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
        }`}>
        <Icon size={16} /> {label}
    </button>
);

const StatBox = ({ label, value, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20',
        red: 'bg-red-50 text-red-600 dark:bg-red-900/20',
    };
    return (
        <div className={`p-6 rounded-[24px] text-center ${colors[color] || colors.blue}`}>
            <h4 className="text-3xl font-black mb-1">{value}</h4>
            <span className="text-xs font-bold uppercase opacity-70 tracking-wider">{label}</span>
        </div>
    );
};

export default PatientDetail;
