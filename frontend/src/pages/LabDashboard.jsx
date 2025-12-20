import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Microscope, CheckCircle, Clock, TestTube, FileText, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../utils/axiosConfig';

import PageWrapper from '../components/PageWrapper';
import ModernHeader from '../components/ModernHeader';
import { useNavigate } from 'react-router-dom';

const LabDashboard = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            console.log("Fetching Lab orders...");
            const res = await api.get(`/service-orders?type=LAB`);
            console.log("Fetched Lab Orders:", res.data);

            if (Array.isArray(res.data)) {
                setOrders(res.data);
            } else {
                console.error("Invalid data format received:", res.data);
                toast.error("Received invalid data format from server");
                setOrders([]);
            }
        } catch (error) {
            console.error("Error fetching lab orders:", error);
            console.error("Error details:", error.response);
            toast.error("Failed to load lab orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 15000);
        return () => clearInterval(interval);
    }, []);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [results, setResults] = useState({ hb: '', leukocytes: '', platelets: '', notes: '' });

    const openModal = (order) => {
        setSelectedOrder(order);
        setResults({ hb: '', leukocytes: '', platelets: '', notes: '' });
    };

    const handleSubmit = async () => {
        try {
            await api.put(`/results/${selectedOrder.id}/submit`, {
                result_data: results,
                notes: results.notes,
                technician_name: 'Lab Staff'
            });
            toast.success('Lab Result Submitted');
            setSelectedOrder(null);
            fetchOrders();
        } catch (error) {
            toast.error('Failed to submit result');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1 }
    };

    const [activeTab, setActiveTab] = useState('PENDING');
    const [searchTerm, setSearchTerm] = useState('');

    // Derived State: Stats
    const stats = {
        pending: orders.filter(o => o.status === 'PENDING').length,
        completedToday: orders.filter(o => o.status === 'COMPLETED' && new Date(o.updated_at).getDate() === new Date().getDate()).length,
        total: orders.length
    };

    // Derived State: Filtering
    const filteredOrders = orders.filter(o => {
        const matchesTab = (activeTab === 'PENDING') ? o.status === 'PENDING' : o.status === 'COMPLETED';
        const matchesSearch = o.medical_record.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.medical_record.patient.no_rm.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.medical_record.doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <PageWrapper title="Laboratory Unit">
            <Toaster position="top-center" toastOptions={{
                style: {
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    color: '#333',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }
            }} />

            {/* Premium Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[120px] mix-blend-multiply" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[100px] mix-blend-multiply" />
            </div>

            <div className="relative min-h-screen p-8 max-w-[1600px] mx-auto z-10 font-sans">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
                    <ModernHeader
                        title="Laboratorium"
                        subtitle="Laboratory Management System"
                        onBack={() => navigate('/menu')}
                        className="mb-0"
                    />

                    {/* Stats Cards */}
                    <div className="flex gap-4">
                        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/40 dark:border-gray-700 shadow-sm flex items-center gap-4">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Pending</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.pending}</p>
                            </div>
                        </div>
                        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/40 dark:border-gray-700 shadow-sm flex items-center gap-4">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
                                <CheckCircle size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Completed Today</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.completedToday}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl p-2 rounded-[24px] border border-white/20 dark:border-gray-700 flex flex-col md:flex-row gap-4 mb-4 shadow-sm">
                    {/* Tabs */}
                    <div className="flex p-1 bg-gray-100/50 dark:bg-gray-700/50 rounded-2xl">
                        {['PENDING', 'COMPLETED'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab
                                    ? 'bg-white dark:bg-gray-800 text-purple-600 shadow-sm scale-100'
                                    : 'text-gray-500 hover:text-purple-600 hover:bg-white/50'
                                    }`}
                            >
                                {tab === 'PENDING' ? 'Queue' : 'History'}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors">
                            <Microscope size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Patient Name, MR Number, or Doctor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm pl-12 pr-4 rounded-xl border-2 border-transparent focus:border-purple-500/50 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none font-medium placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Table View */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-3xl rounded-[32px] border border-white/40 dark:border-gray-700 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-gray-200/50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <div className="col-span-1 text-center">No</div>
                        <div className="col-span-3">Patient Info</div>
                        <div className="col-span-4">Request Detail</div>
                        <div className="col-span-2">Doctor & Time</div>
                        <div className="col-span-2 text-center">Status / Action</div>
                    </div>

                    {/* Table Body */}
                    <div className="flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {filteredOrders.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="h-full flex flex-col items-center justify-center p-12 opacity-50 space-y-4"
                                >
                                    <div className="p-6 bg-gray-100/50 rounded-full">
                                        <Microscope size={48} className="text-gray-400" />
                                    </div>
                                    <p className="text-lg font-medium text-gray-500">No matching orders found.</p>
                                </motion.div>
                            ) : (
                                filteredOrders.map((order, index) => (
                                    <motion.div
                                        key={order.id}
                                        layoutId={order.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.2 }}
                                        className="grid grid-cols-12 gap-4 px-8 py-5 items-center border-b border-gray-100 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors group cursor-default"
                                    >
                                        <div className="col-span-1 text-center font-bold text-gray-300 group-hover:text-purple-500 transition-colors">
                                            #{index + 1}
                                        </div>

                                        <div className="col-span-3">
                                            <p className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1">{order.medical_record.patient.name}</p>
                                            <div className="flex gap-2">
                                                <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200/50 text-gray-600 rounded text-[10px] tracking-wide">{order.medical_record.patient.no_rm}</span>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${order.medical_record.patient.gender === 'L' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                                                    {order.medical_record.patient.gender === 'L' ? 'M' : 'F'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="col-span-4">
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
                                                {order.notes}
                                            </p>
                                            {order.status === 'COMPLETED' && order.result && (
                                                <p className="text-xs text-green-600 mt-1 font-mono flex items-center gap-1">
                                                    <CheckCircle size={10} /> Result Available
                                                </p>
                                            )}
                                        </div>

                                        <div className="col-span-2">
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Dr. {order.medical_record.doctor.name}</p>
                                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                                <Clock size={10} /> {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>

                                        <div className="col-span-2 flex justify-center">
                                            {order.status === 'PENDING' ? (
                                                <button
                                                    onClick={() => openModal(order)}
                                                    className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 py-2.5 px-6 rounded-xl font-bold text-white shadow-lg shadow-purple-500/20 active:scale-95 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-sm"
                                                >
                                                    Process <TestTube size={16} />
                                                </button>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="h-8 w-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600">
                                                        <CheckCircle size={16} />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-green-600 uppercase">Completed</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Modern Modal */}
                <AnimatePresence>
                    {selectedOrder && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedOrder(null)}
                                className="absolute inset-0 bg-black/40 backdrop-blur-md"
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700"
                            >
                                {/* Modal Header */}
                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Lab Results</h2>
                                        <p className="text-gray-500 mt-1 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            {selectedOrder.medical_record.patient.name} ({selectedOrder.medical_record.patient.no_rm})
                                        </p>
                                    </div>
                                    <button onClick={() => setSelectedOrder(null)} className="p-2 h-10 w-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 hover:bg-gray-100 transition-colors">
                                        <X size={20} className="text-gray-500" />
                                    </button>
                                </div>

                                <div className="p-8 space-y-8">
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Hemoglobin</label>
                                            <div className="relative">
                                                <input type="number" step="0.1" value={results.hb} onChange={e => setResults({ ...results, hb: e.target.value })}
                                                    className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl font-bold text-xl border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all outline-none text-center" />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">g/dL</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Leukocytes</label>
                                            <div className="relative">
                                                <input type="number" value={results.leukocytes} onChange={e => setResults({ ...results, leukocytes: e.target.value })}
                                                    className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl font-bold text-xl border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all outline-none text-center" />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">/uL</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Platelets</label>
                                            <div className="relative">
                                                <input type="number" value={results.platelets} onChange={e => setResults({ ...results, platelets: e.target.value })}
                                                    className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl font-bold text-xl border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all outline-none text-center" />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">/uL</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Notes / Conclusion</label>
                                        <textarea value={results.notes} onChange={e => setResults({ ...results, notes: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 p-5 rounded-3xl mt-1 text-sm h-32 border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all outline-none resize-none font-medium leading-relaxed shadow-inner"
                                            placeholder="Enter clinical findings here..." />
                                    </div>
                                </div>

                                <div className="p-8 pt-0 flex gap-4">
                                    <button onClick={() => setSelectedOrder(null)} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-colors">Cancel</button>
                                    <button onClick={handleSubmit} className="flex-[2] py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black shadow-xl shadow-purple-500/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                        <CheckCircle size={20} /> Finalize Results
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </PageWrapper>
    );
};

export default LabDashboard;
