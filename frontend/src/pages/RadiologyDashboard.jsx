import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, CheckCircle, Clock, UploadCloud, X, Scan, Zap } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../utils/axiosConfig';

import PageWrapper from '../components/PageWrapper';
import ModernHeader from '../components/ModernHeader';
import { useNavigate } from 'react-router-dom';

const RadiologyDashboard = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            console.log("Fetching Radiology orders...");
            const res = await api.get(`/service-orders?type=RAD`);
            console.log("Fetched Radiology Orders:", res.data);

            if (Array.isArray(res.data)) {
                setOrders(res.data);
            } else {
                console.error("Invalid data format received:", res.data);
                toast.error("Received invalid data format from server");
                setOrders([]);
            }
        } catch (error) {
            console.error("Error fetching radiology orders:", error);
            console.error("Error details:", error.response);
            toast.error("Failed to load radiology orders");
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
    const [resultData, setResultData] = useState({ imageUrl: '', report: '' });

    const openModal = (order) => {
        setSelectedOrder(order);
        setResultData({ imageUrl: 'https://via.placeholder.com/600x400?text=X-RAY+SCAN', report: '' });
    };

    const handleSubmit = async () => {
        try {
            await api.put(`/results/${selectedOrder.id}/submit`, {
                result_data: resultData.imageUrl, // For now just URL string
                notes: resultData.report,
                technician_name: 'Rad Tech'
            });
            toast.success('Radiology Result Submitted');
            setSelectedOrder(null);
            fetchOrders();
        } catch (error) {
            toast.error('Failed to submit result');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1 }
    };

    return (
        <PageWrapper title="Radiology Unit">
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
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-multiply" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-multiply" />
            </div>

            <div className="relative min-h-screen p-8 max-w-[1600px] mx-auto z-10 font-sans">

                {/* Header Section */}
                <ModernHeader
                    title="Radiologi"
                    subtitle="Radiology Imaging & Diagnostics"
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
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="col-span-full py-40 flex flex-col items-center justify-center text-center"
                            >
                                <div className="w-32 h-32 bg-white/40 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/10 border border-white/50">
                                    <Scan size={64} className="text-indigo-400 opacity-80" />
                                </div>
                                <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 tracking-tight">System Ready</h3>
                                <p className="text-gray-500 text-lg">Waiting for new imaging requests.</p>
                            </motion.div>
                        ) : (
                            orders.map((order) => (
                                <motion.div
                                    key={order.id}
                                    variants={itemVariants}
                                    layoutId={order.id}
                                    className="group relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl p-6 rounded-[32px] border border-white/40 dark:border-gray-700 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 hover:-translate-y-2 cursor-default overflow-hidden"
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
                                                <div className="flex gap-2 mt-2">
                                                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded-lg">
                                                        {order.medical_record.patient.gender === 'L' ? 'Male' : 'Female'}
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                                                        {new Date(order.medical_record.patient.birth_date).getFullYear()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-gray-700 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 shadow-inner">
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

                                        <div className="bg-gradient-to-br from-white/80 to-indigo-50/50 dark:from-gray-900/50 dark:to-gray-800 p-5 rounded-3xl border border-white/60 dark:border-gray-600/50 shadow-sm relative overflow-hidden">
                                            <div className="flex items-start gap-4 relaitve z-10">
                                                <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-indigo-500">
                                                    <Activity size={20} />
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">SCAN TYPE</span>
                                                    <p className="text-gray-800 dark:text-gray-200 font-semibold leading-relaxed text-sm">
                                                        {order.notes}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => openModal(order)}
                                            className="mt-6 w-full py-4 rounded-2xl font-bold text-white shadow-xl shadow-indigo-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 group-hover:shadow-2xl group-hover:shadow-indigo-500/40 relative overflow-hidden"
                                        >
                                            <span className="relative z-10 flex items-center gap-2">Initiate Scan <Zap size={18} fill="currentColor" /></span>
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
                                <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-gray-800 dark:to-gray-800 p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Scan Results</h2>
                                        <p className="text-gray-500 mt-1 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                            {selectedOrder.medical_record.patient.name} ({selectedOrder.medical_record.patient.no_rm})
                                        </p>
                                    </div>
                                    <button onClick={() => setSelectedOrder(null)} className="p-2 h-10 w-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 hover:bg-gray-100 transition-colors">
                                        <X size={20} className="text-gray-500" />
                                    </button>
                                </div>

                                <div className="p-8 space-y-8">
                                    <div className="border-3 border-dashed border-gray-200 dark:border-gray-600 rounded-[32px] p-12 flex flex-col items-center justify-center text-center hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-all cursor-pointer group">
                                        <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-100">
                                            <UploadCloud size={32} />
                                        </div>
                                        <p className="font-bold text-xl text-gray-700 dark:text-gray-300">Upload DICOM / Image</p>
                                        <p className="text-sm text-gray-400 mt-2">Drag & Drop or Click to Browse</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Radiologist Report</label>
                                        <textarea value={resultData.report} onChange={e => setResultData({ ...resultData, report: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 p-5 rounded-3xl mt-1 text-sm h-32 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none resize-none font-medium leading-relaxed shadow-inner"
                                            placeholder="Enter radiological findings and conclusion..." />
                                    </div>
                                </div>

                                <div className="p-8 pt-0 flex gap-4">
                                    <button onClick={() => setSelectedOrder(null)} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-colors">Cancel</button>
                                    <button onClick={handleSubmit} className="flex-[2] py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black shadow-xl shadow-indigo-500/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                        <CheckCircle size={20} /> Finalize Report
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

export default RadiologyDashboard;
