import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Printer, CheckCircle, Clock, ChefHat } from 'lucide-react';
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

    // Calculate duration for "Timer" effect
    const getTimeElapsed = (dateStr) => {
        const diff = new Date() - new Date(dateStr);
        const mins = Math.floor(diff / 60000);
        return `${mins}m`;
    };

    return (
        <PageWrapper title="Kitchen Display System">
            <Toaster position="top-right" toastOptions={{
                style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' }
            }} />

            {/* Deep Dark Background */}
            <div className="fixed inset-0 bg-slate-950 -z-10" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 -z-10" />

            {/* KDS Header */}
            <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 p-4 mx-4 mt-2 rounded-2xl shadow-2xl flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="bg-orange-500/20 p-3 rounded-xl">
                        <ChefHat size={32} className="text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">KDS PRO V2</h1>
                        <p className="text-slate-400 text-xs font-mono font-bold uppercase tracking-widest">Connected • Live Stream</p>
                    </div>
                </div>

                {/* Production Stats */}
                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex gap-2">
                        {['ORDERED', 'PREPARED', 'DELIVERED'].map(status => {
                            const count = orders.filter(o => o.status === status).length;
                            const color = status === 'ORDERED' ? 'text-blue-400' : status === 'PREPARED' ? 'text-yellow-400' : 'text-green-400';
                            return (
                                <div key={status} className="flex flex-col items-center px-4 border-r border-white/5 last:border-0">
                                    <span className={`text-2xl font-black ${color}`}>{count}</span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">{status}</span>
                                </div>
                            )
                        })}
                    </div>

                    <div className="text-right">
                        <p className="text-4xl font-black text-white font-mono leading-none">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest text-right mt-1">
                            {new Date().toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="p-6 grid grid-cols-12 gap-8 h-[calc(100vh-120px)] overflow-hidden">

                {/* LEFT: Summary Panel */}
                <div className="col-span-12 lg:col-span-3 h-full overflow-y-auto custom-scrollbar pr-2">
                    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 mb-6">
                        <h2 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Utensils size={14} /> Production Queue
                        </h2>
                        <div className="space-y-3">
                            {Object.entries(summary).map(([menu, count]) => (
                                <div key={menu} className="flex justify-between items-center p-4 bg-slate-800 rounded-2xl border border-transparent hover:border-orange-500/30 hover:bg-slate-800/80 transition-all cursor-default group">
                                    <span className="font-bold text-slate-200 text-lg group-hover:text-white transition-colors">{menu}</span>
                                    <span className="bg-orange-500 text-white font-black px-3 py-1 rounded-lg text-lg shadow-[0_0_15px_rgba(249,115,22,0.4)]">{count}</span>
                                </div>
                            ))}
                            {Object.keys(summary).length === 0 && (
                                <p className="text-slate-600 text-center py-4 italic">No active production items</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Ticket Grid */}
                <div className="col-span-12 lg:col-span-9 h-full overflow-y-auto custom-scrollbar pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {orders.length === 0 ? (
                                <div className="col-span-full flex flex-col items-center justify-center text-slate-600 opacity-50 py-20">
                                    <CheckCircle size={80} className="mb-6 opacity-20" />
                                    <h2 className="text-3xl font-black">ALL CLEAR</h2>
                                    <p className="font-mono text-sm mt-2">NO ACTIVE ORDERS IN PIPELINE</p>
                                </div>
                            ) : (
                                orders.map((order, index) => {
                                    const isNew = order.status === 'ORDERED';
                                    const isCooking = order.status === 'PREPARED';
                                    const borderColor = isNew ? 'border-blue-500' : isCooking ? 'border-yellow-500' : 'border-slate-700';
                                    const glowColor = isNew ? 'shadow-blue-500/20' : isCooking ? 'shadow-yellow-500/20' : 'shadow-none';
                                    const accentColor = isNew ? 'text-blue-400' : isCooking ? 'text-yellow-400' : 'text-slate-500';

                                    return (
                                        <motion.div
                                            key={order.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                            className={`bg-slate-900 rounded-[28px] border-t-8 ${borderColor} shadow-2xl ${glowColor} overflow-hidden flex flex-col relative group`}
                                        >
                                            {/* Timer Badge */}
                                            <div className="absolute top-4 right-4 bg-slate-950/50 backdrop-blur px-3 py-1 rounded-full border border-white/10 text-xs font-mono font-bold text-slate-300">
                                                {getTimeElapsed(order.created_at)}
                                            </div>

                                            <div className="p-6 pb-4">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">#{order.id}</span>
                                                    <span className={`text-xs font-black uppercase tracking-widest ${accentColor}`}>{order.status}</span>
                                                </div>

                                                <h3 className="text-3xl font-black text-white leading-tight mb-1">{order.diet_menu.name}</h3>
                                                <p className="text-slate-400 font-bold text-sm uppercase tracking-wide mb-4">{order.diet_menu.type} DIET</p>

                                                {order.extras && (
                                                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl animate-pulse">
                                                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">ALLERGY ALERT</p>
                                                        <p className="text-red-200 font-bold text-sm leading-snug">{order.extras}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-auto bg-slate-950/50 p-4 border-t border-white/5">
                                                <div className="flex items-center gap-3 mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                                        {order.admission?.patient?.name.charAt(0)}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-slate-300 font-bold text-sm truncate">{order.admission?.patient?.name}</p>
                                                        <p className="text-slate-500 text-xs font-mono truncate">RM {order.admission?.bed?.room?.name}</p>
                                                    </div>
                                                </div>

                                                {/* Action Button */}
                                                {isNew && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, 'PREPARED')}
                                                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] rounded-xl font-black text-white shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                                                    >
                                                        <Printer size={18} /> Cook <span className="opacity-50">|</span> Print
                                                    </button>
                                                )}
                                                {isCooking && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                                                        className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 hover:scale-[1.02] active:scale-[0.98] rounded-xl font-black text-slate-900 shadow-lg shadow-yellow-500/30 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                                                    >
                                                        <CheckCircle size={18} /> Complete Order
                                                    </button>
                                                )}
                                                {!isNew && !isCooking && (
                                                    <div className="w-full py-3 bg-slate-800 rounded-xl font-bold text-slate-500 text-center text-xs uppercase tracking-widest">
                                                        Archived
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </PageWrapper>
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
