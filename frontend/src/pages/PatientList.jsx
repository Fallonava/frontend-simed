import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, ChevronRight, User, Calendar, MapPin, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/axiosConfig';
import PageWrapper from '../components/PageWrapper';

const PatientList = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPatient, setNewPatient] = useState({
        name: '', nik: '', gender: 'L', birth_date: '', address: '', phone: ''
    });

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/patients?page=${page}&q=${searchTerm}`);
            setPatients(res.data.data);
            setTotalPages(res.data.meta.totalPages);
        } catch (error) {
            console.error("Failed to load patients", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPatients();
        }, 300);
        return () => clearTimeout(timer);
    }, [page, searchTerm]);

    const handleCreatePatient = async (e) => {
        e.preventDefault();
        try {
            await api.post('/patients', newPatient);
            toast.success('Patient Registered Successfully');
            setShowAddModal(false);
            setNewPatient({ name: '', nik: '', gender: 'L', birth_date: '', address: '', phone: '' });
            fetchPatients();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Registration Failed');
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent navigation
        if (!window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) return;

        try {
            await api.delete(`/patients/${id}`);
            toast.success('Patient deleted');
            fetchPatients();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete patient');
        }
    };

    return (
        <PageWrapper title="Patient Database">
            <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-4 md:p-8 font-sans">
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Patient Database</h1>
                            <p className="text-gray-500 font-medium">Manage patient records and history</p>
                        </div>
                        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                            <Plus size={18} /> Add New Patient
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-700 flex items-center gap-2 sticky top-4 z-20">
                        <div className="pl-4 text-gray-400"><Search size={20} /></div>
                        <input
                            type="text"
                            placeholder="Search by Name, NIK, or Medical Record Number..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 dark:text-white font-medium text-lg placeholder-gray-400 py-3"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                    </div>

                    {/* Patient List */}
                    <div className="space-y-3">
                        {loading ? (
                            <div className="text-center py-20 text-gray-400">Loading patients...</div>
                        ) : patients.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                                {patients.map((patient, index) => (
                                    <motion.div
                                        key={patient.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => navigate(`/admin/patients/${patient.id}`)}
                                        className="group bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50 hover:border-blue-500/30 hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all duration-300 flex items-center gap-4 relative overflow-hidden"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform">
                                            {patient.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">{patient.name}</h3>
                                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 text-[10px] font-bold rounded-md tracking-wide">
                                                    {patient.gender === 'L' ? 'MALE' : 'FEMALE'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-1.5 rounded font-mono font-bold">RM: {patient.no_rm}</span>
                                                <span className="hidden sm:flex items-center gap-1"><Calendar size={12} /> {new Date(patient.birth_date).toLocaleDateString()}</span>
                                                <span className="hidden sm:flex items-center gap-1 truncate max-w-[200px]"><MapPin size={12} /> {patient.address || 'No Address'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => handleDelete(e, patient.id)}
                                                className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors z-10"
                                                title="Delete Patient"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                <User size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Patients Found</h3>
                                <button onClick={() => setShowAddModal(true)} className="mt-4 text-blue-600 font-bold hover:underline">Register New Patient</button>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 py-8">
                            <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold disabled:opacity-50">Previous</button>
                            <span className="flex items-center px-4 font-bold text-sm text-gray-500">Page {page} of {totalPages}</span>
                            <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold disabled:opacity-50">Next</button>
                        </div>
                    )}
                </div>

                {/* ADD PATIENT MODAL */}
                <AnimatePresence>
                    {showAddModal && (
                        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-gray-800 rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl"
                            >
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Patient</h2>
                                    <button onClick={() => setShowAddModal(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200"><X size={20} /></button>
                                </div>
                                <form onSubmit={handleCreatePatient} className="p-8 space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                                            <input required className="w-full p-4 rounded-xl border-0 bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 font-bold" value={newPatient.name} onChange={e => setNewPatient({ ...newPatient, name: e.target.value })} placeholder="e.g. John Doe" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">NIK</label>
                                            <input required maxLength={16} className="w-full p-4 rounded-xl border-0 bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 font-bold" value={newPatient.nik} onChange={e => setNewPatient({ ...newPatient, nik: e.target.value })} placeholder="16 Digits" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Gender</label>
                                            <select className="w-full p-4 rounded-xl border-0 bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 font-bold" value={newPatient.gender} onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })}>
                                                <option value="L">Male</option>
                                                <option value="P">Female</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Date of Birth</label>
                                            <input required type="date" className="w-full p-4 rounded-xl border-0 bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 font-bold" value={newPatient.birth_date} onChange={e => setNewPatient({ ...newPatient, birth_date: e.target.value })} />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone</label>
                                            <input className="w-full p-4 rounded-xl border-0 bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 font-bold" value={newPatient.phone} onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })} placeholder="08..." />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Address</label>
                                            <textarea required className="w-full p-4 rounded-xl border-0 bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 font-bold resize-none h-24" value={newPatient.address} onChange={e => setNewPatient({ ...newPatient, address: e.target.value })} placeholder="Complete address..." />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 text-red-500">Allergies (Critical)</label>
                                            <textarea className="w-full p-4 rounded-xl border-0 bg-red-50 dark:bg-red-900/10 focus:ring-2 focus:ring-red-500 font-bold resize-none h-24 text-red-600 placeholder-red-300" value={newPatient.allergies || ''} onChange={e => setNewPatient({ ...newPatient, allergies: e.target.value })} placeholder="List drug/food allergies here..." />
                                        </div>
                                    </div>
                                    <div className="pt-4 flex justify-end gap-3">
                                        <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
                                        <button type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all">Save Patient</button>
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

export default PatientList;
