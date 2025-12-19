import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Printer, CheckCircle, Clock } from 'lucide-react';
import api from '../utils/axiosConfig';
import toast, { Toaster } from 'react-hot-toast';
import PageLoader from '../components/PageLoader';
import PageWrapper from '../components/PageWrapper';
import ModernHeader from '../components/ModernHeader';
import { useNavigate } from 'react-router-dom';

const NutritionKitchen = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/nutrition/kitchen');
            if (res.data.success) {
                setOrders(res.data.orders);
                setSummary(res.data.summary);
            }
        } catch (error) {
            console.error('Fetch error', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/nutrition/order/${id}/status`, { status });
            toast.success(`Status updated to ${status}`);
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    if (loading) return <PageLoader />;

    return (
        <PageWrapper title="Nutrition Unit">
            <Toaster position="top-right" />

            <ModernHeader
                title="Gizi & Dietetik"
                subtitle="Kitchen Display System / Tray Line"
                onBack={() => navigate('/menu')}
                actions={
                    <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 shadow-sm">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                        </span>
                        <div className="flex flex-col text-right">
                            <span className="text-[10px] font-black text-gray-800 dark:text-gray-200 tracking-widest uppercase">Kitchen Live</span>
                            <span className="text-[9px] text-gray-500 font-mono font-bold uppercase">{orders.length} Orders Queued</span>
                        </div>
                    </div>
                }
            />

            <div className="p-6 max-w-[1920px] mx-auto pb-32">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* PRODUCTION SUMMARY (Left Sidebar) */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm h-fit">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b pb-4">
                            <Clock size={20} className="text-blue-500" />
                            Production List
                        </h2>
                        <div className="space-y-4">
                            {Object.entries(summary).map(([menu, count]) => (
                                <div key={menu} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                                    <span className="font-medium text-lg">{menu}</span>
                                    <span className="bg-orange-100 text-orange-600 font-bold px-4 py-2 rounded-xl text-xl">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* TRAY LINE (Main Content) */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Printer size={20} className="text-green-500" />
                            Tray Line (Plating)
                        </h2>

                        <AnimatePresence>
                            {orders.map(order => (
                                <motion.div
                                    key={order.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className={`p-6 rounded-3xl border-2 transition-all flex justify-between items-start
                                    ${order.status === 'ORDERED' ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700' :
                                            order.status === 'PREPARED' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'opacity-50'}`}
                                >
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                            ${order.status === 'ORDERED' ? 'bg-blue-100 text-blue-700' :
                                                    order.status === 'PREPARED' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                                {order.status}
                                            </span>
                                            <span className="text-sm font-mono text-gray-400">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{order.diet_menu.name}</h3>
                                        {order.extras && <p className="text-red-500 font-bold mt-1">⚠️ {order.extras}</p>}

                                        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1 font-bold"><UserIcon name={order.admission?.patient?.name || 'Unknown'} /></span>
                                            <span>•</span>
                                            <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Room {order.admission?.bed?.room?.name || '?'} - {order.admission?.bed?.code || '?'}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        {order.status === 'ORDERED' && (
                                            <button
                                                onClick={() => handleUpdateStatus(order.id, 'PREPARED')}
                                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2"
                                            >
                                                <Printer size={18} /> Print & Cook
                                            </button>
                                        )}
                                        {order.status === 'PREPARED' && (
                                            <button
                                                onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                                                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 flex items-center gap-2"
                                            >
                                                <CheckCircle size={18} /> Deliver
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </PageWrapper >
    );
};

const UserIcon = ({ name }) => (
    <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
            {name.charAt(0)}
        </div>
        {name}
    </div>
);

export default NutritionKitchen;
