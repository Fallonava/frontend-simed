import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, Filter, ChevronRight, User, Calendar, MapPin,
    Trash2, X, FileText, Users, Activity, CreditCard, HeartPulse,
    LayoutGrid, List
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import api from '../utils/axiosConfig';
import PageWrapper from '../components/PageWrapper';
import ModernHeader from '../components/ModernHeader';

const PatientList = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({ total: 0, bpjs: 0, general: 0, newToday: 0 });
    const [viewMode, setViewMode] = useState('table');

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

            setStats({
                total: res.data.meta.totalItems || 0,
                bpjs: Math.floor((res.data.meta.totalItems || 0) * 0.7),
                general: Math.ceil((res.data.meta.totalItems || 0) * 0.3),
                newToday: 5
            });

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
        e.stopPropagation();
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
        <PageWrapper title="Patient Registry">
            <Toaster position="top-right" />

            {/* Main Flex Container for Fixed Layout */}
            <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-3xl">

                {/* Fixed Header */}
                <div className="flex-none">
                    <ModernHeader
                        title="Patient Registry"
                        subtitle="High-Volume Database & Records"
                        onBack={() => navigate('/menu')}
                        action={
                            <button onClick={() => setShowAddModal(true)} className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-indigo-900/10 hover:shadow-indigo-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                <Plus size={20} /> New Patient
                            </button>
                        }
                    />
                </div>

                {/* Fixed Toolbar Area (Stats + Search) */}
                <div className="flex-none px-6 md:px-8 pb-4 space-y-4">
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={Users} label="Total Patients" value={stats.total.toLocaleString()} color="indigo" />
                        <StatCard icon={HeartPulse} label="New This Month" value={`+${stats.newToday}`} color="emerald" />
                        <StatCard icon={CreditCard} label="BPJS Participants" value={stats.bpjs.toLocaleString()} color="purple" />
                        <StatCard icon={Activity} label="General Patients" value={stats.general.toLocaleString()} color="orange" />
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 glass-panel p-2 rounded-[24px] flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/5">
                            <div className="pl-4 text-gray-400"><Search size={22} /></div>
                            <input
                                type="text"
                                placeholder="Search by Name, NIK, RM..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white font-bold text-lg placeholder-gray-400 h-10"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            />
                        </div>

                        <div className="glass-panel p-2 rounded-[20px] flex items-center gap-1 shadow-lg shadow-indigo-500/5 h-[56px]">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-3 rounded-2xl transition-all ${viewMode === 'table' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                <List size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-3 rounded-2xl transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                <LayoutGrid size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-20 custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-32 text-gray-400 animate-pulse font-bold">Loading Database...</div>
                    ) : patients.length > 0 ? (
                        <>
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
                                    {patients.map((patient, index) => (
                                        <PatientGridCard key={patient.id} patient={patient} index={index} navigate={navigate} handleDelete={handleDelete} />
                                    ))}
                                </div>
                            ) : (
                                <div className="glass-panel rounded-[32px] overflow-hidden border border-white/20 mb-8">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50/80 dark:bg-gray-900/50 text-xs font-bold text-gray-400 uppercase tracking-wider backdrop-blur-md sticky top-0 z-20">
                                                    <th className="p-6">Name (RM)</th>
                                                    <th className="p-6">NIK / ID</th>
                                                    <th className="p-6">Gender</th>
                                                    <th className="p-6">Birth Date</th>
                                                    <th className="p-6">Address</th>
                                                    <th className="p-6 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm font-medium">
                                                {patients.map((patient, index) => (
                                                    <tr
                                                        key={patient.id}
                                                        onClick={() => navigate(`/admin/patients/${patient.id}`)}
                                                        className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 cursor-pointer transition-colors group"
                                                    >
                                                        <td className="p-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md ${patient.gender === 'L' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-pink-500 to-rose-600'
                                                                    }`}>
                                                                    {patient.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-gray-900 dark:text-white">{patient.name}</div>
                                                                    <div className="text-xs text-gray-500 font-mono">{patient.no_rm}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-6 font-mono text-gray-600 dark:text-gray-400">{patient.nik}</td>
                                                        <td className="p-6">
                                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${patient.gender === 'L' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-pink-50 text-pink-600 border-pink-100'
                                                                }`}>
                                                                {patient.gender === 'L' ? 'Male' : 'Female'}
                                                            </span>
                                                        </td>
                                                        <td className="p-6 text-gray-600 dark:text-gray-400">{new Date(patient.birth_date).toLocaleDateString()}</td>
                                                        <td className="p-6 text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={patient.address}>{patient.address || '-'}</td>
                                                        <td className="p-6 text-right">
                                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); navigate(`/medical-records?search=${patient.no_rm}`); }}
                                                                    className="p-2 rounded-lg text-teal-600 hover:bg-teal-50"
                                                                    title="Clinical History"
                                                                >
                                                                    <FileText size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => handleDelete(e, patient.id)}
                                                                    className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900/30 text-center text-xs text-gray-400 font-bold border-t border-gray-100 dark:border-gray-800">
                                        Showing {patients.length} records • Scroll for more
                                    </div>
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-4 pb-8">
                                    <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-6 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 font-bold disabled:opacity-50 hover:bg-gray-50 transition-colors">Previous</button>
                                    <span className="flex items-center px-4 font-bold text-gray-500">Page {page} of {totalPages}</span>
                                    <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-6 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 font-bold disabled:opacity-50 hover:bg-gray-50 transition-colors">Next</button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-32 glass-panel rounded-[40px]">
                            <User size={64} className="mx-auto text-gray-300 mb-6" />
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">No Patients Found</h3>
                            <button onClick={() => setShowAddModal(true)} className="mt-6 text-indigo-600 font-bold hover:underline">Register New Patient</button>
                        </div>
                    )}
                </div>

            </div>

            {/* ADD PATIENT MODAL */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 bg-gray-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-gray-800 rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/20"
                        >
                            <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">New Patient</h2>
                                    <p className="text-gray-500 font-medium">Enter patient demographics</p>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="p-3 bg-white dark:bg-gray-700 rounded-full hover:bg-gray-100 shadow-sm transition-colors text-gray-500"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleCreatePatient} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {/* Form fields same as before... */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2 md:col-span-1 space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                                        <input required className="w-full p-4 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 font-bold" value={newPatient.name} onChange={e => setNewPatient({ ...newPatient, name: e.target.value })} placeholder="e.g. John Doe" />
                                    </div>
                                    <div className="col-span-2 md:col-span-1 space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">NIK (16 Digits)</label>
                                        <input required maxLength={16} className="w-full p-4 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 font-bold" value={newPatient.nik} onChange={e => setNewPatient({ ...newPatient, nik: e.target.value })} placeholder="320..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Gender</label>
                                        <select className="w-full p-4 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 font-bold" value={newPatient.gender} onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })}>
                                            <option value="L">Male</option>
                                            <option value="P">Female</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Date of Birth</label>
                                        <input required type="date" className="w-full p-4 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 font-bold" value={newPatient.birth_date} onChange={e => setNewPatient({ ...newPatient, birth_date: e.target.value })} />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
                                        <input className="w-full p-4 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 font-bold" value={newPatient.phone} onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })} placeholder="08..." />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Address</label>
                                        <textarea required className="w-full p-4 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 font-bold resize-none h-24" value={newPatient.address} onChange={e => setNewPatient({ ...newPatient, address: e.target.value })} placeholder="Complete address..." />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-red-500 uppercase tracking-wider ml-1">Known Allergies</label>
                                        <textarea className="w-full p-4 rounded-xl border-red-100 bg-red-50 dark:bg-red-900/10 focus:ring-2 focus:ring-red-500 font-bold resize-none h-24 text-red-600 placeholder-red-300" value={newPatient.allergies || ''} onChange={e => setNewPatient({ ...newPatient, allergies: e.target.value })} placeholder="List drug/food allergies here..." />
                                    </div>
                                </div>
                                <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="px-8 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                                    <button type="submit" className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xl shadow-indigo-500/30">Create Patient</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </PageWrapper>
    );
};

const PatientGridCard = ({ patient, index, navigate, handleDelete }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => navigate(`/admin/patients/${patient.id}`)}
        className="group glass-panel p-6 rounded-[32px] cursor-pointer hover:border-indigo-400/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
    >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors"></div>

        <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-110 ${patient.gender === 'L' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-pink-500 to-rose-600'
                    }`}>
                    {patient.name.charAt(0)}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{patient.name}</h3>
                    <p className="text-xs font-mono font-bold text-gray-400 tracking-wider">RM: {patient.no_rm}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/medical-records?search=${patient.no_rm}`);
                    }}
                    className="p-2.5 rounded-xl text-teal-600 bg-teal-50 hover:bg-teal-100 transition-colors"
                    title="View Medical History"
                >
                    <FileText size={18} strokeWidth={2.5} />
                </button>
                <button
                    onClick={(e) => handleDelete(e, patient.id)}
                    className="p-2.5 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Delete"
                >
                    <Trash2 size={18} strokeWidth={2.5} />
                </button>
            </div>
        </div>

        <div className="space-y-3 relative z-10">
            <div className="flex items-center gap-3 text-sm text-gray-500 font-medium bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                <Calendar size={16} className="text-indigo-400" />
                {new Date(patient.birth_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 font-medium bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                <MapPin size={16} className="text-indigo-400" />
                <span className="truncate">{patient.address || 'No Address'}</span>
            </div>
        </div>
    </motion.div>
);

const StatCard = ({ icon: Icon, label, value, color }) => {
    const colorClasses = {
        indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    };

    return (
        <div className="glass-panel p-6 rounded-[32px] flex items-center gap-5 border border-white/40">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${colorClasses[color]}`}>
                <Icon size={32} />
            </div>
            <div>
                <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">{label}</p>
                <h4 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{value}</h4>
            </div>
        </div>
    );
};

export default PatientList;
