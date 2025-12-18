import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Microscope, Activity, CheckCircle, Clock, FileText } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../utils/axiosConfig';
import PageWrapper from '../components/PageWrapper';

const LabRadiologyDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('LAB'); // LAB or RAD

    const fetchOrders = async () => {
        try {
            const res = await api.get(`/service-orders?type=${activeTab}`);
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
    }, [activeTab]);

    const handleComplete = async (id) => {
        try {
            await api.put(`/service-orders/${id}/status`, {
                status: 'COMPLETED',
                result: 'Result uploaded/verified' // Placeholder
            });
            toast.success('Order completed');
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    return (
        <PageWrapper title="Lab & Radiology">
            <Toaster position="top-center" />
            <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-6 max-w-7xl mx-auto">
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('LAB')}
                        className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all ${activeTab === 'LAB' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100'}`}
                    >
                        <Microscope size={24} /> Laboratorium
                    </button>
                    <button
                        onClick={() => setActiveTab('RAD')}
                        className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all ${activeTab === 'RAD' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100'}`}
                    >
                        <Activity size={24} /> Radiologi
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-400">
                            <Clock size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No pending orders for {activeTab === 'LAB' ? 'Laboratory' : 'Radiology'}</p>
                        </div>
                    )}

                    {orders.map((order, idx) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white dark:bg-gray-800 p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-full"
                        >
                            <div className="mb-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-lg text-gray-900 dark:text-white">
                                        {order.medical_record.patient.name}
                                    </div>
                                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500">
                                        {new Date(order.created_at).toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500 mb-4">
                                    <span className="font-bold">Dr. {order.medical_record.doctor.name}</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-gray-700 dark:text-gray-300 font-medium">
                                    <FileText size={16} className="inline mr-2 opacity-50" />
                                    {order.notes}
                                </div>
                            </div>

                            <button
                                onClick={() => handleComplete(order.id)}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                                <CheckCircle size={20} /> Mark as Complete
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </PageWrapper>
    );
};

export default LabRadiologyDashboard;
