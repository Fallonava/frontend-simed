import React, { useState, useEffect } from 'react';
import {
    Package, TrendingUp, AlertTriangle, ArrowRightLeft, Plus,
    Search, Filter, ShoppingCart, Archive, FileText, CheckCircle, Clock
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const InventoryDashboard = () => {
    const [activeTab, setActiveTab] = useState('stocks'); // stocks, po, transfers
    const [stocks, setStocks] = useState([]);
    const [stats, setStats] = useState({ totalValue: 0, lowStock: 0, activePOs: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        fetchStats();
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

    const fetchStats = async () => {
        // Mock stats for now or calculate from stocks
        // ideally fetch from backend analytics
        setStats({ totalValue: 150000000, lowStock: 12, activePOs: 3 });
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Package className="w-8 h-8 text-teal-600" />
                        Logistics & Inventory
                    </h1>
                    <p className="text-gray-500 mt-1">Manage Warehouse Stock, Purchasing & Distribution</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Export Report
                    </button>
                    <button className="px-4 py-2 bg-teal-600 text-white rounded-xl shadow-md font-medium hover:bg-teal-700 transition-transform active:scale-95 flex items-center gap-2">
                        <Plus size={18} /> New Request
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Inventory Value</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                            Rp {stats.totalValue.toLocaleString()}
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
                        <TrendingUp size={24} />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Low Stock Alerts</p>
                        <h3 className="text-2xl font-bold text-red-600 mt-1">
                            {stats.lowStock} Items
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-red-600">
                        <AlertTriangle size={24} />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Active POs</p>
                        <h3 className="text-2xl font-bold text-blue-600 mt-1">
                            {stats.activePOs} Pending
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600">
                        <ShoppingCart size={24} />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-1">
                {[
                    { id: 'stocks', label: 'Stock Overview', icon: Archive },
                    { id: 'po', label: 'Purchase Orders', icon: ShoppingCart },
                    { id: 'transfers', label: 'Stock Transfers', icon: ArrowRightLeft },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-medium transition-all relative ${activeTab === tab.id
                            ? 'text-teal-600 bg-white dark:bg-gray-800 border-t border-x border-gray-200 dark:border-gray-700 -mb-[1px] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-gray-800 rounded-b-2xl rounded-tr-2xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-[400px]">
                {activeTab === 'stocks' && <StockView stocks={stocks} loading={loading} />}
                {activeTab === 'po' && <POView />}
                {activeTab === 'transfers' && <TransferView />}
            </div>
        </div>
    );
};

// --- Sub Components ---

const StockView = ({ stocks, loading }) => {
    return (
        <div className="p-6">
            <div className="flex justify-between mb-6">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600" size={20} />
                    <input
                        type="text"
                        placeholder="Search SKU or Name..."
                        className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Filter size={18} /> Filters
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 font-medium text-sm">
                        <tr>
                            <th className="p-4 rounded-tl-xl">Item Name</th>
                            <th className="p-4">SKU/Batch</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Location</th>
                            <th className="p-4">Expiry</th>
                            <th className="p-4 text-center">Qty</th>
                            <th className="p-4 rounded-tr-xl">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan="7" className="p-8 text-center text-gray-400">Loading inventory...</td></tr>
                        ) : stocks.length === 0 ? (
                            <tr><td colSpan="7" className="p-8 text-center text-gray-400">No stock items found.</td></tr>
                        ) : (
                            stocks.map((stock) => (
                                <tr key={stock.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="p-4 font-medium text-gray-900 dark:text-gray-100">
                                        {stock.item_name}
                                    </td>
                                    <td className="p-4 text-sm text-gray-500 flex flex-col">
                                        <span>{stock.batch_no}</span>
                                        <span className="text-xs text-gray-400">{stock.sku || '-'}</span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">Medicine</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                            {stock.location?.name || 'Main Warehouse'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {new Date(stock.expiry_date).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-center font-bold text-gray-900 dark:text-gray-100">
                                        {stock.quantity}
                                    </td>
                                    <td className="p-4">
                                        {stock.quantity < 10 ? (
                                            <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                                                <AlertTriangle size={14} /> Low
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                                                <CheckCircle size={14} /> OK
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const POView = () => {
    const [pos, setPos] = useState([]);

    useEffect(() => {
        api.get('/inventory/po/pending').then(res => setPos(res.data));
    }, []);

    return (
        <div className="p-6">
            <div className="flex justify-between mb-6">
                <h3 className="font-bold text-gray-700">Pending Purchase Orders</h3>
                <button className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700">
                    + Create Manual PO
                </button>
            </div>

            <div className="space-y-4">
                {pos.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No pending orders.</p>
                ) : (
                    pos.map(po => (
                        <div key={po.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-700/30">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h4 className="font-bold text-gray-900 dark:text-white">{po.po_number}</h4>
                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                        {po.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    Supplier: {po.supplier?.name} • Items: {po.items?.length}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900 dark:text-white">Rp {po.total_cost?.toLocaleString() || 0}</p>
                                <button className="text-sm text-teal-600 font-medium hover:underline mt-1">
                                    Review & Approve
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const TransferView = () => (
    <div className="p-12 text-center text-gray-400">
        <ArrowRightLeft size={48} className="mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-bold text-gray-600 mb-2">Stock Transfers</h3>
        <p>Move stock between Main Warehouse and Satellites (Apotek/IGD).</p>
        <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">New Transfer</button>
    </div>
);

export default InventoryDashboard;
