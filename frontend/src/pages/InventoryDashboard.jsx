import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, TrendingUp, AlertTriangle, ArrowRightLeft, Plus, Search, Filter, ShoppingCart, Archive, FileText, CheckCircle, Clock, Truck, ChevronRight } from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import PageLoader from '../components/PageLoader';
import ModernHeader from '../components/ModernHeader';
import PageWrapper from '../components/PageWrapper';

const InventoryDashboard = () => {
    const [activeTab, setActiveTab] = useState('stocks'); // stocks, po, transfers
    const [stocks, setStocks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({ totalValue: 0, lowStock: 0, activePOs: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        // Mock stats for demo
        setStats({ totalValue: 154200000, lowStock: 3, activePOs: 2 });
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/inventory/stocks');
            setStocks(res.data);
        } catch (error) {
            console.error('Failed to fetch stocks', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStocks = stocks.filter(s =>
        s.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.batch_no?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const tabs = [
        { id: 'stocks', label: 'Stock Overview', icon: Archive },
        { id: 'po', label: 'Purchase Orders', icon: ShoppingCart, badge: stats.activePOs },
        { id: 'transfers', label: 'Transfers', icon: ArrowRightLeft },
    ];

    if (loading && stocks.length === 0) return <PageLoader />;

    return (
        <PageWrapper title="Logistics & Inventory">
            <Toaster position="top-right" />

            <ModernHeader
                title="Logistics & Inventory"
                subtitle="Warehouse, Purchasing & Distribution"
            >
                <div className="flex bg-gray-200/50 dark:bg-gray-800/50 backdrop-blur-md p-1 rounded-xl border border-gray-200 dark:border-white/10">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-300 z-10
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
                {/* Global Stats (Always Visible) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass-panel p-6 rounded-[24px] border border-white/20 flex items-center justify-between relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-teal-500/20"></div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Total Value</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1 font-mono tracking-tight">
                                Rp {stats.totalValue.toLocaleString()}
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/40 rounded-2xl flex items-center justify-center text-teal-600 dark:text-teal-400">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div className="glass-panel p-6 rounded-[24px] border border-white/20 flex items-center justify-between relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-red-500/20"></div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Low Stock</p>
                            <h3 className="text-2xl font-black text-red-600 dark:text-red-400 mt-1 font-mono tracking-tight">
                                {stats.lowStock} Items
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 animate-pulse">
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                    <div className="glass-panel p-6 rounded-[24px] border border-white/20 flex items-center justify-between relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-500/20"></div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Pending POs</p>
                            <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 font-mono tracking-tight">
                                {stats.activePOs} Orders
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <ShoppingCart size={24} />
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'stocks' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="glass-panel p-8 rounded-[32px] border border-white/20 shadow-sm"
                        >
                            <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
                                <div className="relative w-full md:w-96">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search SKU, Name, or Batch..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button className="flex items-center gap-2 px-5 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 font-bold text-sm transition-colors">
                                        <Filter size={18} /> Filters
                                    </button>
                                    <button className="flex items-center gap-2 px-5 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-500/30 font-bold text-sm transition-all active:scale-95">
                                        <Plus size={18} /> Add Item
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-wider border-b dark:border-white/10">
                                        <tr>
                                            <th className="p-4 pl-0">Item Details</th>
                                            <th className="p-4">SKU / Batch</th>
                                            <th className="p-4">Location</th>
                                            <th className="p-4">Expiry</th>
                                            <th className="p-4 text-center">Stock</th>
                                            <th className="p-4 pr-0 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y dark:divide-white/5">
                                        {filteredStocks.length === 0 ? (
                                            <tr><td colSpan="6" className="p-12 text-center text-gray-400">No items found matching your search.</td></tr>
                                        ) : (
                                            filteredStocks.map((stock) => (
                                                <tr key={stock.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                                    <td className="p-4 pl-0">
                                                        <div className="font-bold text-gray-900 dark:text-white text-base">{stock.item_name}</div>
                                                        <div className="text-xs text-gray-500">Medical Supplies</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-mono font-medium text-gray-700 dark:text-gray-300">{stock.batch_no}</div>
                                                        <div className="text-xs text-gray-400">{stock.sku || 'NO SKU'}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-lg text-xs font-bold border border-gray-200 dark:border-white/10">
                                                            {stock.location?.name || 'Main Warehouse'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={14} className="text-gray-400" />
                                                            <span className="font-mono">{new Date(stock.expiry_date).toLocaleDateString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`text-lg font-bold font-mono ${stock.quantity < 10 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                                                            {stock.quantity}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 pr-0 text-right">
                                                        {stock.quantity < 10 ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-xs font-bold border border-red-100 dark:border-red-900/50">
                                                                <AlertTriangle size={12} /> Low Stock
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-900/50">
                                                                <CheckCircle size={12} /> In Stock
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'po' && <POView />}
                    {activeTab === 'transfers' && <TransferView />}
                </AnimatePresence>
            </div>
        </PageWrapper>
    );
};

// --- Sub Components ---
const POView = () => {
    const [pos, setPos] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [suppliers, setSuppliers] = useState([]);

    useEffect(() => {
        api.get('/inventory/po/pending').then(res => setPos(res.data)).catch(() => { });
        api.get('/inventory/suppliers').then(res => setSuppliers(res.data)).catch(() => { });
    }, []);

    const handleReceive = async (poId) => {
        if (!window.confirm("Confirm receipt of goods? This will update stock levels.")) return;
        try {
            await api.post('/inventory/receive', { po_id: poId, location_id: 1 });
            toast.success("Goods Received Successfully");
            api.get('/inventory/po/pending').then(res => setPos(res.data)); // Refresh
        } catch (error) {
            toast.error("Failed to receive goods");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel p-8 rounded-[32px]"
        >
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="text-teal-500" /> Pending Purchase Orders</h3>
                    <p className="text-gray-500 text-sm">Manage orders to suppliers</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-teal-500/30 transition-all active:scale-95 flex items-center gap-2"
                >
                    <Plus size={18} /> New Order
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {pos.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl">
                        No pending purchase orders.
                    </div>
                ) : (
                    pos.map(po => (
                        <div key={po.id} className="p-6 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 hover:border-teal-300 dark:hover:border-teal-700 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center font-bold text-teal-600 shadow-sm">
                                        PO
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{po.po_number}</h4>
                                        <div className="text-xs text-gray-500">{new Date(po.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${po.status === 'RECEIVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {po.status}
                                </span>
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-sm text-gray-500">Supplier</div>
                                    <div className="font-bold">{po.supplier?.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black font-mono">Rp {po.total_cost?.toLocaleString()}</div>
                                    {po.status !== 'RECEIVED' && (
                                        <button
                                            onClick={() => handleReceive(po.id)}
                                            className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 justify-end hover:underline"
                                        >
                                            <CheckCircle size={14} /> Mark Received
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {showCreateModal && (
                <CreatePOModal
                    suppliers={suppliers}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => { setShowCreateModal(false); api.get('/inventory/po/pending').then(res => setPos(res.data)); }}
                />
            )}
        </motion.div>
    );
};

const CreatePOModal = ({ suppliers, onClose, onSuccess }) => {
    const [supplierId, setSupplierId] = useState('');
    const [items, setItems] = useState([{ name: '', qty: 1, cost: 0 }]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/inventory/po', { supplier_id: supplierId, items });
            toast.success("PO Created!");
            onSuccess();
        } catch (error) {
            toast.error("Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <h2 className="text-xl font-bold">New Purchase Order</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Supplier</label>
                        <select
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value)}
                            className="w-full p-3 border rounded-xl dark:bg-gray-700 font-bold"
                            required
                        >
                            <option value="">Select Supplier...</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    {/* Simplified items input for brevity in this refactor */}
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl text-center text-sm text-gray-500 italic">
                        Item selection simplified for UI demo.
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all">
                        {loading ? 'Processing...' : 'Create Order'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const TransferView = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-20 bg-white/50 dark:bg-white/5 rounded-[32px] border border-dashed border-gray-300 dark:border-gray-600"
        >
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                <Truck size={40} />
            </div>
            <h3 className="text-xl font-bold">Stock Transfer</h3>
            <p className="text-gray-500 max-w-md mx-auto mt-2 mb-8">Move inventory between Main Warehouse and satellite units (Pharmacy, ER, etc.)</p>
            <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-transform active:scale-95">
                Initiate Transfer
            </button>
        </motion.div>
    );
};

export default InventoryDashboard;
