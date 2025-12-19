import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Package, AlertTriangle, TrendingUp, Search, Filter,
    Calendar, Truck, Pill, RefreshCcw, CheckCircle, ArrowRight
} from 'lucide-react';
import api from '../services/api'; // Ensure this path is correct based on your project structure
import PageWrapper from '../components/PageWrapper';
import ModernHeader from '../components/ModernHeader';
import { useNavigate } from 'react-router-dom';

const CentralPharmacy = () => {
    const navigate = useNavigate();
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalValue: 0,
        expiringSoon: 0,
        stockout: 0
    });

    useEffect(() => {
        // Mock data fetch - replace with actual API
        const loadData = async () => {
            setLoading(true);
            try {
                // Simulating API call
                setTimeout(() => {
                    setStocks([
                        { id: 1, name: 'Paracetamol 500mg', batch: 'BATCH-001', expiry: '2025-12-01', stock: 5000, unit: 'Tabs', category: 'Analgesic', status: 'Optimal' },
                        { id: 2, name: 'Amoxicillin 500mg', batch: 'BATCH-002', expiry: '2024-06-15', stock: 120, unit: 'Caps', category: 'Antibiotic', status: 'Low' },
                        { id: 3, name: 'Vitamin C 1000mg', batch: 'BATCH-003', expiry: '2024-02-28', stock: 50, unit: 'Vials', category: 'Supplement', status: 'Critical' },
                    ]);
                    setStats({ totalValue: 450000000, expiringSoon: 12, stockout: 3 });
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error("Failed to load pharmacy data");
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Optimal': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Low': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <PageWrapper title="Central Pharmacy Warehouse">
            <ModernHeader
                title="Gudang Farmasi"
                subtitle="Central Pharmacy Warehouse Management"
                onBack={() => navigate('/menu')}
                actions={
                    <button className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-5 py-2 rounded-full font-bold text-sm shadow-lg shadow-teal-500/20 transition-all active:scale-95">
                        <Truck size={16} /> Incoming Shipment
                    </button>
                }
            />

            <div className="p-6 max-w-[1920px] mx-auto space-y-8 pb-24">

                {/* HERO STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                            <Package size={120} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-500 font-medium mb-1">Total Valuation</p>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white">Rp {stats.totalValue.toLocaleString()}</h3>
                            <div className="flex items-center gap-2 mt-4 text-emerald-600 font-bold text-sm bg-emerald-50 w-fit px-3 py-1 rounded-full">
                                <TrendingUp size={14} /> +12% vs Last Month
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                            <AlertTriangle size={120} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-500 font-medium mb-1">Expiring Soon (30 Days)</p>
                            <h3 className="text-3xl font-black text-amber-500">{stats.expiringSoon} Batches</h3>
                            <div className="flex items-center gap-2 mt-4 text-amber-600 font-bold text-sm bg-amber-50 w-fit px-3 py-1 rounded-full cursor-pointer hover:bg-amber-100 transition-colors">
                                View Details <ArrowRight size={14} />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                            <Pill size={120} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-500 font-medium mb-1">Stockout Alerts</p>
                            <h3 className="text-3xl font-black text-red-500">{stats.stockout} Items</h3>
                            <div className="flex items-center gap-2 mt-4 text-red-600 font-bold text-sm bg-red-50 w-fit px-3 py-1 rounded-full cursor-pointer hover:bg-red-100 transition-colors">
                                Restock Now <RefreshCcw size={14} />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* MAIN INVENTORY TABLE */}
                <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search Medicine, SKU, or Batch..."
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 font-medium"
                                />
                            </div>
                            <button className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl hover:bg-gray-100 transition-colors text-gray-600">
                                <Filter size={18} />
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-6 py-2.5 rounded-full font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                                Export .CSV
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 dark:bg-gray-700/20">
                                <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="px-8 py-4">Medicine Name</th>
                                    <th className="px-6 py-4">Batch Info</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4 text-center">Expiry Date</th>
                                    <th className="px-6 py-4 text-center">Stock Level</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {stocks.map((stock) => (
                                    <tr key={stock.id} className="group hover:bg-teal-50/10 transition-colors">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-lg">
                                                    {stock.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white">{stock.name}</div>
                                                    <div className="text-xs text-gray-400 font-mono">ID: {stock.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-sm text-gray-600 dark:text-gray-300 font-bold">{stock.batch}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                                {stock.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                <Calendar size={14} className="text-gray-400" />
                                                {stock.expiry}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-lg font-black text-gray-900 dark:text-white">{stock.stock.toLocaleString()}</span>
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getStatusColor(stock.status)}`}>
                                                    {stock.unit} • {stock.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                                <ArrowRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </PageWrapper>
    );
};

export default CentralPharmacy;
