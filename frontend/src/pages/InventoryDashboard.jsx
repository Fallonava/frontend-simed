import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, TrendingUp, AlertTriangle, ArrowRightLeft, Plus, Search, Filter, ShoppingCart, Archive, CheckCircle, Clock, Truck, Box, Wrench, Printer, Armchair, ShieldCheck, Monitor } from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import PageLoader from '../components/PageLoader';
import ModernHeader from '../components/ModernHeader';
import PageWrapper from '../components/PageWrapper';

import { useNavigate } from 'react-router-dom';

const InventoryDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('stocks'); // stocks, assets, po, transfers
    const [stocks, setStocks] = useState([]);
    const [assets, setAssets] = useState([]); // New Asset State
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({ totalValue: 0, lowStock: 0, activePOs: 0, maintenance: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Parallel fetch for potential future real endpoints
            const stocksRes = await api.get('/inventory/stocks');
            setStocks(stocksRes.data);

            // Mock Assets Data (Simulating migration from GeneralAssets.jsx)
            setAssets([
                { id: 1, name: 'MRI Scanner GE-3000', tag: 'AST-RAD-001', location: 'Radiology 1', type: 'Medical Device', status: 'Active', condition: 'Good' },
                { id: 2, name: 'Herman Miller Chair', tag: 'AST-OFF-045', location: 'Director Office', type: 'Furniture', status: 'Active', condition: 'Good' },
                { id: 3, name: 'Dell Precision Workstation', tag: 'AST-IT-102', location: 'Nurse Station 1', type: 'Electronics', status: 'Maintenance', condition: 'Fair' },
                { id: 4, name: 'Patient Bed Electric', tag: 'AST-BED-012', location: 'Room 303', type: 'Medical Device', status: 'Broken', condition: 'Poor' },
            ]);

            setStats({
                totalValue: 154200000,
                lowStock: 3,
                activePOs: 2,
                maintenance: 8
            });

        } catch (error) {
            console.error('Failed to fetch inventory data', error);
            // Fallback empty if API fails
        } finally {
            setLoading(false);
        }
    };

    const filteredStocks = stocks.filter(s =>
        s?.item_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s?.batch_no?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredAssets = assets.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tag.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const tabs = [
        { id: 'stocks', label: 'Pharmacy & Supplies', icon: Archive },
        { id: 'assets', label: 'General Assets', icon: Box }, // Consolidated Assets
        { id: 'po', label: 'Purchase Orders', icon: ShoppingCart, badge: stats.activePOs },
        { id: 'transfers', label: 'Transfers', icon: ArrowRightLeft },
    ];

    if (loading && stocks.length === 0) return <PageLoader />;

    return (
        <PageWrapper title="Logistics Command Center">
            <Toaster position="top-right" />

            <ModernHeader
                title="Logistics & Inventory"
                subtitle="Unified Supply Chain Management"
                onBack={() => navigate('/menu')}
            >
                <div className="flex bg-black/5 dark:bg-white/10 backdrop-blur-md p-1 rounded-xl border border-black/5 dark:border-white/10 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-300 whitespace-nowrap
                                ${activeTab === tab.id
                                    ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-300 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            {tab.badge > 0 && (
                                <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{tab.badge}</span>
                            )}
                        </button>
                    ))}
                </div>
            </ModernHeader>

            <div className="p-6 max-w-[1920px] mx-auto min-h-[calc(100vh-140px)]">
                {/* Global Stats - Context Aware */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Total Valuation" value={`Rp ${stats.totalValue.toLocaleString()}`} icon={TrendingUp} color="teal" />
                    <StatCard title="Low Stock Items" value={stats.lowStock} icon={AlertTriangle} color="red" />
                    <StatCard title="Active POs" value={stats.activePOs} icon={ShoppingCart} color="blue" />
                    <StatCard title="Asset Maintenance" value={stats.maintenance} icon={Wrench} color="amber" />
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'stocks' && (
                        <StocksView stocks={filteredStocks} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                    )}
                    {activeTab === 'assets' && (
                        <AssetsView assets={filteredAssets} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                    )}
                    {activeTab === 'po' && <POView />}
                    {activeTab === 'transfers' && <TransferView />}
                </AnimatePresence>
            </div>
        </PageWrapper>
    );
};

// --- Sub Components ---

const StatCard = ({ title, value, icon: Icon, color }) => {
    const colorMap = {
        teal: 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400',
        red: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
        blue: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
        amber: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
    };

    return (
        <div className="glass-panel p-6 rounded-[24px] border border-white/20 flex items-center justify-between relative overflow-hidden group">
            <div className={`absolute right-0 top-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 transition-all opacity-10 ${colorMap[color].split(' ')[0].replace('100', '500')}`}></div>
            <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1 font-mono tracking-tight">{value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[color]}`}>
                <Icon size={24} />
            </div>
        </div>
    );
}

const StocksView = ({ stocks, searchQuery, setSearchQuery }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
        className="glass-panel p-8 rounded-[32px] border border-white/20 shadow-sm"
    >
        <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search Medicine or Batch..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium"
                />
            </div>
            <button className="flex items-center gap-2 px-5 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-500/30 font-bold text-sm transition-all active:scale-95">
                <Plus size={18} /> Add Medicine
            </button>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-wider border-b dark:border-white/10">
                    <tr>
                        <th className="p-4 pl-0">Item Name</th>
                        <th className="p-4">Batch</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Expiry</th>
                        <th className="p-4 text-center">Stock</th>
                        <th className="p-4 pr-0 text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="text-sm divide-y dark:divide-white/5">
                    {stocks.length === 0 ? (
                        <tr><td colSpan="6" className="p-12 text-center text-gray-400">No items found matching your search.</td></tr>
                    ) : (
                        stocks.map((stock) => (
                            <tr key={stock.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                <td className="p-4 pl-0 font-bold text-gray-900 dark:text-white">{stock.item_name}</td>
                                <td className="p-4 font-mono text-gray-600 dark:text-gray-300">{stock.batch_no}</td>
                                <td className="p-4"><span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">{stock.location?.name || 'Warehouse'}</span></td>
                                <td className="p-4 font-mono text-sm">{new Date(stock.expiry_date).toLocaleDateString()}</td>
                                <td className="p-4 text-center font-bold">{stock.quantity}</td>
                                <td className="p-4 pr-0 text-right">
                                    {stock.quantity < 10 ?
                                        <span className="text-red-500 font-bold text-xs flex items-center justify-end gap-1"><AlertTriangle size={12} /> Low</span> :
                                        <span className="text-emerald-500 font-bold text-xs flex items-center justify-end gap-1"><CheckCircle size={12} /> OK</span>
                                    }
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </motion.div>
);

const AssetsView = ({ assets, searchQuery, setSearchQuery }) => {
    const getTypeIcon = (type) => {
        switch (type) {
            case 'Medical Device': return <ShieldCheck size={18} />;
            case 'Electronics': return <Monitor size={18} />;
            case 'Furniture': return <Armchair size={18} />;
            default: return <Box size={18} />;
        }
    };
    const getConditionColor = (condition) => {
        switch (condition) {
            case 'Good': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'Fair': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'Poor': return 'text-red-600 bg-red-50 border-red-100';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="glass-panel p-8 rounded-[32px] border border-white/20 shadow-sm"
        >
            <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Search Asset Tag or Name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    />
                </div>
                <button className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 font-bold text-sm transition-all active:scale-95">
                    <Plus size={18} /> Register Asset
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-wider border-b dark:border-white/10">
                        <tr>
                            <th className="p-4 pl-0">Asset Name</th>
                            <th className="p-4">Tag ID</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Location</th>
                            <th className="p-4 text-center">Condition</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y dark:divide-white/5">
                        {assets.map((asset) => (
                            <tr key={asset.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                <td className="p-4 pl-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">{getTypeIcon(asset.type)}</div>
                                        <div className="font-bold text-gray-900 dark:text-white">{asset.name}</div>
                                    </div>
                                </td>
                                <td className="p-4 font-mono font-bold text-gray-600 dark:text-gray-300">{asset.tag}</td>
                                <td className="p-4">{asset.type}</td>
                                <td className="p-4 text-gray-500">{asset.location}</td>
                                <td className="p-4 text-center">
                                    <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border ${getConditionColor(asset.condition)}`}>
                                        {asset.condition}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}

const POView = () => {
    const [pos, setPos] = useState([]);
    useEffect(() => {
        api.get('/inventory/po/pending').then(res => setPos(res.data)).catch(() => { });
    }, []);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-8 rounded-[32px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Purchase Orders</h3>
                <button className="px-4 py-2 bg-teal-600 text-white rounded-lg font-bold text-sm">New Order</button>
            </div>
            {pos.length === 0 ? <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-2xl">No pending orders</div> :
                pos.map(po => <div key={po.id}>{po.po_number}</div>)
            }
        </motion.div>
    );
};

const TransferView = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white/50 dark:bg-white/5 rounded-[32px] border border-dashed border-gray-300 dark:border-gray-600">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500"><Truck size={32} /></div>
        <h3 className="font-bold text-gray-700 dark:text-gray-300">Stock Transfers</h3>
        <p className="text-sm text-gray-400 mt-2">Manage internal inventory movements here.</p>
    </motion.div>
);

export default InventoryDashboard;
