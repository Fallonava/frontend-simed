import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Pill, Activity, CheckCircle, Clock, Search, Plus, Trash2, Edit2,
    Package, RefreshCw, AlertCircle, Thermometer, User, FileText, ChevronRight
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import io from 'socket.io-client';
import api from '../utils/axiosConfig';

import PageWrapper from '../components/PageWrapper';
import ModernHeader from '../components/ModernHeader';
import { useNavigate } from 'react-router-dom';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

const PharmacyDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('queue'); // 'queue' or 'inventory'
    const [prescriptions, setPrescriptions] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(false);

    // Socket
    useEffect(() => {
        const socket = io(SOCKET_URL);
        socket.on('new_prescription', (data) => {
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-white/20`}>
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <div className="bg-teal-100 text-teal-600 rounded-full p-2">
                                    <Pill className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-bold text-gray-900">New Prescription Received!</p>
                                <p className="mt-1 text-sm text-gray-500">Dr. {data.doctor_id} has sent a new order.</p>
                            </div>
                        </div>
                    </div>
                </div>
            ));
            fetchPrescriptions();
        });

        socket.on('prescription_update', fetchPrescriptions);

        return () => socket.disconnect();
    }, []);

    // Initial Fetch
    useEffect(() => {
        if (activeTab === 'queue') fetchPrescriptions();
        else fetchMedicines();
    }, [activeTab]);

    const fetchPrescriptions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/prescriptions?status=PENDING');
            setPrescriptions(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            const res = await api.get('/medicines');
            setMedicines(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleProcess = async (id) => {
        try {
            await api.put(`/prescriptions/${id}/status`, { status: 'COMPLETED' });
            toast.success('Prescription Processed & Stock Deducted');
            fetchPrescriptions();
        } catch (error) {
            toast.error('Failed to process');
        }
    };

    // Inventory Handlers
    const [showMedModal, setShowMedModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedMedId, setSelectedMedId] = useState(null);
    const [medForm, setMedForm] = useState({ name: '', code: '', stock: 0, price: 0, unit: 'strips', category: 'Drug' });

    const openAddModal = () => {
        setIsEditing(false);
        setMedForm({ name: '', code: '', stock: 0, price: 0, unit: 'strips', category: 'Drug' });
        setShowMedModal(true);
    };

    const openEditModal = (med) => {
        setIsEditing(true);
        setSelectedMedId(med.id);
        setMedForm(med); // Pre-fill
        setShowMedModal(true);
    };

    const handleSubmitMedicine = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/medicines/${selectedMedId}`, medForm);
                toast.success('Medicine Updated');
            } else {
                await api.post('/medicines', medForm);
                toast.success('Medicine Added');
            }
            setShowMedModal(false);
            fetchMedicines();
        } catch (error) {
            toast.error(isEditing ? 'Failed to update' : 'Failed to add');
        }
    };

    const handleDeleteMedicine = async (id) => {
        if (!window.confirm('Are you sure you want to delete this medicine?')) return;
        try {
            await api.delete(`/medicines/${id}`);
            toast.success('Medicine Deleted');
            fetchMedicines();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    return (
        <PageWrapper title="Pharmacy Management">
            <Toaster position="top-right" />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 max-w-[1920px] mx-auto space-y-8">

                <ModernHeader
                    title="Apotek Rawat Jalan"
                    subtitle="Outpatient Pharmacy Dispensing Unit"
                    onBack={() => navigate('/menu')}
                    actions={
                        <div className="flex bg-gray-200/50 dark:bg-gray-800/50 p-1.5 rounded-full backdrop-blur-md border border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setActiveTab('queue')}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'queue' ? 'bg-white dark:bg-gray-700 text-teal-600 shadow-lg shadow-teal-500/10 scale-105' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <Clock size={18} /> Antrean Resep
                            </button>
                            <button
                                onClick={() => setActiveTab('inventory')}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'inventory' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-lg shadow-blue-500/10 scale-105' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <Package size={18} /> Stok Obat (Depo)
                            </button>
                        </div>
                    }
                />

                {/* Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'queue' ? (
                        <motion.div
                            key="queue"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {prescriptions.length === 0 ? (
                                <div className="col-span-full flex flex-col items-center justify-center py-32 text-gray-400">
                                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle size={48} className="text-teal-500 opacity-50" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">All Clear!</h3>
                                    <p className="text-gray-500">No pending prescriptions in the queue.</p>
                                </div>
                            ) : (
                                prescriptions.map((p, idx) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl border border-white/20 dark:border-gray-700 flex flex-col justify-between h-full group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-teal-500/30">
                                                        {p.patient?.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{p.patient?.name}</h3>
                                                        <div className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded w-fit mt-1">
                                                            #{p.patient?.no_rm}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="animate-pulse">
                                                    <span className="h-3 w-3 block rounded-full bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-900/30"></span>
                                                </div>
                                            </div>

                                            {/* Clinical Tags */}
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {p.medical_record?.assessment && (
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                                                        {p.medical_record.assessment}
                                                    </span>
                                                )}
                                                {p.patient?.allergies && p.patient.allergies !== 'Tidak Ada' && (
                                                    <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 flex items-center gap-1">
                                                        <AlertCircle size={10} /> {p.patient.allergies}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Med List */}
                                            <div className="space-y-3 mb-8">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <Pill size={12} /> Prescribed Items
                                                </h4>
                                                {p.items?.map((item, i) => (
                                                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700 group-hover:bg-teal-50/50 dark:group-hover:bg-teal-900/10 transition-colors">
                                                        <div className="font-bold text-gray-700 dark:text-gray-200 text-sm">{item.medicine?.name}</div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-400">{item.dosage}</span>
                                                            <span className="font-black text-xs bg-white dark:bg-gray-600 px-2 py-1 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">x{item.quantity}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleProcess(p.id)}
                                            className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 hover:brightness-110"
                                        >
                                            Process Order <ChevronRight size={18} />
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="inventory"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Depo Inventory</h2>
                                    <p className="text-sm text-gray-500">Manage medicine stock available for outpatient dispensing</p>
                                </div>
                                <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all active:scale-95">
                                    <Plus size={20} /> Add Item
                                </button>
                            </div>

                            <div className="grid gap-3">
                                {medicines.map((m) => (
                                    <motion.div
                                        layout
                                        key={m.id}
                                        className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between group hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${m.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {m.stock < 10 ? <AlertCircle size={24} /> : <Pill size={24} />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{m.name}</h3>
                                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{m.code}</span>
                                                    <span>{m.category}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="text-center">
                                                <div className="text-xs text-gray-400 uppercase font-bold">Stock</div>
                                                <div className={`text-xl font-black ${m.stock < 10 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                                                    {m.stock.toLocaleString()} <span className="text-sm font-medium text-gray-400">{m.unit}</span>
                                                </div>
                                            </div>
                                            <div className="text-right hidden md:block w-32">
                                                <div className="text-xs text-gray-400 uppercase font-bold">Price</div>
                                                <div className="font-bold text-gray-900 dark:text-white">Rp {m.price.toLocaleString()}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => openEditModal(m)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDeleteMedicine(m.id)} className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Add/Edit Medicine Modal */}
                <AnimatePresence>
                    {showMedModal && (
                        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl border border-white/20"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-3xl font-black dark:text-white tracking-tight">{isEditing ? 'Edit Item' : 'New Medicine'}</h2>
                                    <button onClick={() => setShowMedModal(false)} className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                                        <div className="text-2xl leading-none">&times;</div>
                                    </button>
                                </div>

                                <form onSubmit={handleSubmitMedicine} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Medicine Name</label>
                                            <input required className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold text-lg focus:ring-2 focus:ring-teal-500/20 outline-none border-none transition-all" placeholder="e.g. Paracetamol" value={medForm.name} onChange={e => setMedForm({ ...medForm, name: e.target.value })} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Code / SKU</label>
                                                <input required className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl font-mono font-bold outline-none border-none" placeholder="MED-001" value={medForm.code} onChange={e => setMedForm({ ...medForm, code: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Category</label>
                                                <input className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold outline-none border-none" placeholder="Drug" value={medForm.category} onChange={e => setMedForm({ ...medForm, category: e.target.value })} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2 col-span-1">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Stock</label>
                                                <input type="number" required className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold outline-none border-none text-center" value={medForm.stock} onChange={e => setMedForm({ ...medForm, stock: e.target.value })} />
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Unit Type</label>
                                                <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-900 p-1 rounded-2xl">
                                                    {['strips', 'bottle', 'box', 'pcs'].map(u => (
                                                        <button
                                                            type="button"
                                                            key={u}
                                                            onClick={() => setMedForm({ ...medForm, unit: u })}
                                                            className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${medForm.unit === u ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'}`}
                                                        >
                                                            {u}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Price (IDR)</label>
                                            <input type="number" required className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl font-mono font-bold text-lg outline-none border-none" value={medForm.price} onChange={e => setMedForm({ ...medForm, price: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button type="submit" className="w-full py-4 bg-black dark:bg-white dark:text-black text-white rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                                            {isEditing ? 'Save Changes' : 'Add to Inventory'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </PageWrapper >
    );
};

export default PharmacyDashboard;
