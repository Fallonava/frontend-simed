import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Activity, CheckCircle, Clock, Search, Plus, Trash2, Edit2, Package, RefreshCw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import io from 'socket.io-client';
import api from '../utils/axiosConfig';
import PageWrapper from '../components/PageWrapper';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

const PharmacyDashboard = () => {
    const [activeTab, setActiveTab] = useState('queue'); // 'queue' or 'inventory'
    const [prescriptions, setPrescriptions] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Socket
    useEffect(() => {
        const socket = io(SOCKET_URL);
        socket.on('new_prescription', (data) => {
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <Pill className="h-10 w-10 text-blue-500" />
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">New Prescription!</p>
                                <p className="mt-1 text-sm text-gray-500">From Dr. {data.doctor_id}</p>
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
    const [newMed, setNewMed] = useState({ name: '', code: '', stock: 0, price: 0, unit: 'strips', category: 'Drug' });

    const handleAddMedicine = async (e) => {
        e.preventDefault();
        try {
            await api.post('/medicines', newMed);
            toast.success('Medicine Added');
            setShowMedModal(false);
            fetchMedicines();
            setNewMed({ name: '', code: '', stock: 0, price: 0, unit: 'strips', category: 'Drug' });
        } catch (error) {
            toast.error('Failed to add medicine');
        }
    };

    return (
        <PageWrapper title="Pharmacy Management">
            <Toaster position="top-right" />
            <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-6 max-w-7xl mx-auto space-y-6">

                {/* Tabs */}
                <div className="flex gap-4 p-1 bg-white dark:bg-gray-800 rounded-2xl w-fit shadow-sm border border-gray-100 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('queue')}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'queue' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        <Clock size={18} /> Queue Monitor
                    </button>
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'inventory' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        <Package size={18} /> Inventory
                    </button>
                </div>

                {/* Content */}
                <div className="grid gap-6">
                    {activeTab === 'queue' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {prescriptions.length === 0 ? (
                                <div className="col-span-full text-center py-20 text-gray-400">
                                    <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
                                    <h3 className="text-xl font-bold">All caught up!</h3>
                                    <p>No pending prescriptions.</p>
                                </div>
                            ) : (
                                prescriptions.map((p) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white dark:bg-gray-800 p-6 rounded-[24px] shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-full"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{p.patient?.name}</h3>
                                                    <div className="text-sm text-gray-500">RM: {p.patient?.no_rm}</div>
                                                </div>
                                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">PENDING</span>
                                            </div>

                                            <div className="space-y-3 mb-6">
                                                {p.items?.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                        <div className="font-medium text-gray-700 dark:text-gray-200">{item.medicine?.name}</div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-500">{item.dosage}</span>
                                                            <span className="font-bold bg-white dark:bg-gray-600 px-2 py-0.5 rounded shadow-sm">x{item.quantity}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleProcess(p.id)}
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                                        >
                                            Process & Finish
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Medicine Stock</h2>
                                <button onClick={() => setShowMedModal(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                                    <Plus size={18} /> Add Medicine
                                </button>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase text-xs font-bold">
                                        <tr>
                                            <th className="p-4">Name</th>
                                            <th className="p-4">Code</th>
                                            <th className="p-4">Category</th>
                                            <th className="p-4 text-center">Stock</th>
                                            <th className="p-4 text-right">Price</th>
                                            <th className="p-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {medicines.map((m) => (
                                            <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="p-4 font-bold text-gray-900 dark:text-white">{m.name}</td>
                                                <td className="p-4 text-gray-500 font-mono text-sm">{m.code}</td>
                                                <td className="p-4 text-gray-500">{m.category}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${m.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                        {m.stock} {m.unit}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right font-mono">Rp {m.price.toLocaleString()}</td>
                                                <td className="p-4 text-right">
                                                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-blue-500"><Edit2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Add Medicine Modal */}
                <AnimatePresence>
                    {showMedModal && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white dark:bg-gray-800 rounded-[24px] p-8 w-full max-w-lg shadow-2xl"
                            >
                                <h2 className="text-2xl font-bold mb-6 dark:text-white">Add New Medicine</h2>
                                <form onSubmit={handleAddMedicine} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                                            <input required className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold" value={newMed.name} onChange={e => setNewMed({ ...newMed, name: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Code</label>
                                            <input required className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold" value={newMed.code} onChange={e => setNewMed({ ...newMed, code: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Stock</label>
                                            <input type="number" required className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold" value={newMed.stock} onChange={e => setNewMed({ ...newMed, stock: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Unit</label>
                                            <select className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold" value={newMed.unit} onChange={e => setNewMed({ ...newMed, unit: e.target.value })}>
                                                <option value="strips">Strips</option>
                                                <option value="bottle">Bottle</option>
                                                <option value="pcs">Pcs</option>
                                                <option value="box">Box</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Price</label>
                                            <input type="number" required className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold" value={newMed.price} onChange={e => setNewMed({ ...newMed, price: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                                            <input className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold" value={newMed.category} onChange={e => setNewMed({ ...newMed, category: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4">
                                        <button type="button" onClick={() => setShowMedModal(false)} className="px-5 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
                                        <button type="submit" className="px-5 py-2 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20">Save Medicine</button>
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

export default PharmacyDashboard;
