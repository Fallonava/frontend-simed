import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Microscope, CheckCircle, Clock } from 'lucide-react';
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
            const res = await api.get(`/service-orders?type=LAB`);
            console.log("Fetched Lab Orders:", res.data);
            setOrders(res.data);
        } catch (error) {
            console.error(error);
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
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <PageWrapper title="Laboratory Unit">
            <Toaster position="top-right" />

            {/* Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden text-left">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-400/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative min-h-screen p-6 max-w-7xl mx-auto z-10">

                {/* Header Section */}
                {/* Header Section */}
                <ModernHeader
                    title="Laboratorium"
                    subtitle="Laboratory Unit / Test Verification"
                    onBack={() => navigate('/menu')}
                    className="mb-8"
                />

                {/* Orders Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {orders.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="col-span-full py-32 flex flex-col items-center justify-center text-center"
                            >
                                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle size={48} className="text-gray-300" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-400">All caught up!</h3>
                                <p className="text-gray-400 mt-2">No pending Lab orders.</p>
                            </motion.div>
                        ) : (
                            orders.map((order) => (
                                <motion.div
                                    key={order.id}
                                    variants={itemVariants}
                                    layoutId={order.id}
                                    className="group relative bg-white/70 dark:bg-gray-800/60 backdrop-blur-md p-6 rounded-[32px] border border-white/50 dark:border-gray-700 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1"
                                >
                                    {/* Status Indicator */}
                                    <div className="absolute top-6 right-6">
                                        <span className="flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                                        </span>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                            {order.medical_record.patient.name}
                                        </h3>
                                        <p className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                                            <Clock size={14} /> {new Date(order.created_at).toLocaleTimeString()}
                                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                            <span>Dr. {order.medical_record.doctor.name}</span>
                                        </p>

                                        <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700/50">
                                            <div className="flex items-start gap-3">
                                                <Microscope className="text-purple-500 mt-1" size={18} />
                                                <div>
                                                    <span className="block text-xs font-bold text-purple-500 uppercase tracking-wider mb-1">TEST REQUEST</span>
                                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                                        {order.notes}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => openModal(order)}
                                        className="w-full py-4 rounded-2xl font-bold text-white shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                                    >
                                        <CheckCircle size={20} /> Enter Results
                                    </button>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Result Entry Modal */}
                <AnimatePresence>
                    {selectedOrder && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 border border-gray-100 dark:border-gray-700"
                            >
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enter Lab Results</h3>
                                <p className="text-gray-500 text-sm mb-6">Patient: {selectedOrder.medical_record.patient.name}</p>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">Hemoglobin</label>
                                            <input type="number" step="0.1" value={results.hb} onChange={e => setResults({ ...results, hb: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded-xl mt-1 font-bold" placeholder="g/dL" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">Leukocytes</label>
                                            <input type="number" value={results.leukocytes} onChange={e => setResults({ ...results, leukocytes: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded-xl mt-1 font-bold" placeholder="/uL" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">Platelets</label>
                                            <input type="number" value={results.platelets} onChange={e => setResults({ ...results, platelets: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded-xl mt-1 font-bold" placeholder="/uL" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Notes / Conclusion</label>
                                        <textarea value={results.notes} onChange={e => setResults({ ...results, notes: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-700 p-3 rounded-xl mt-1 text-sm h-24" placeholder="Normal findings..."></textarea>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button onClick={() => setSelectedOrder(null)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl">Cancel</button>
                                    <button onClick={handleSubmit} className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200">Submit Results</button>
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
