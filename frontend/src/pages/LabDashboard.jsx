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
                <ModernHeader
                    title="Laboratorium"
                    subtitle="Laboratory Unit & Diagnostics"
                    onBack={() => navigate('/menu')}
                    className="mb-12"
                />

                {/* Orders Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {orders.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="col-span-full py-40 flex flex-col items-center justify-center text-center"
                            >
                                <div className="w-32 h-32 bg-white/40 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/10 border border-white/50">
                                    <CheckCircle size={64} className="text-purple-400 opacity-80" />
                                </div>
                                <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 tracking-tight">All Clear</h3>
                                <p className="text-gray-500 text-lg">No pending lab orders at the moment.</p>
                            </motion.div>
                        ) : (
                            orders.map((order) => (
                                <motion.div
                                    key={order.id}
                                    variants={itemVariants}
                                    layoutId={order.id}
                                    className="group relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl p-6 rounded-[32px] border border-white/40 dark:border-gray-700 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:-translate-y-2 cursor-default overflow-hidden"
                                >
                                    {/* Glass Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                    {/* Patient Info */}
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-1 tracking-tight">
                                                    {order.medical_record.patient.name}
                                                </h3>
                                                <p className="text-xs font-bold text-purple-600 uppercase tracking-widest bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-lg inline-block mt-1">
                                                    {order.medical_record.patient.gender === 'L' ? 'Male' : 'Female'}
                                                </p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-gray-700 flex items-center justify-center text-purple-600 font-bold border border-purple-100 shadow-inner">
                                                {order.medical_record.patient.name.charAt(0)}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 text-sm text-gray-500 font-medium mb-6">
                                            <span className="flex items-center gap-1.5 bg-gray-100/80 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                <Clock size={14} className="text-gray-400" />
                                                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="truncate max-w-[120px]">Dr. {order.medical_record.doctor.name}</span>
                                        </div>

                                        <div className="bg-gradient-to-br from-white/80 to-purple-50/50 dark:from-gray-900/50 dark:to-gray-800 p-5 rounded-3xl border border-white/60 dark:border-gray-600/50 shadow-sm relative overflow-hidden">
                                            <div className="flex items-start gap-4 relaitve z-10">
                                                <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-purple-500">
                                                    <Microscope size={20} />
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">REQUEST</span>
                                                    <p className="text-gray-800 dark:text-gray-200 font-semibold leading-relaxed text-sm">
                                                        {order.notes}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => openModal(order)}
                                            className="mt-6 w-full py-4 rounded-2xl font-bold text-white shadow-xl shadow-purple-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 group-hover:shadow-2xl group-hover:shadow-purple-500/40 relative overflow-hidden"
                                        >
                                            <span className="relative z-10 flex items-center gap-2">Process Sample <TestTube size={18} /></span>
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </motion.div>

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
