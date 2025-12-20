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

// === Sub-components for Inventory ===

const POView = () => {
    const [pos, setPos] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [suppliers, setSuppliers] = useState([]);

    useEffect(() => {
        fetchPOs();
        fetchSuppliers();
    }, []);

    const fetchPOs = () => api.get('/inventory/po/pending').then(res => setPos(res.data));
    const fetchSuppliers = () => api.get('/inventory/suppliers').then(res => setSuppliers(res.data));

    const handleReceive = async (poId) => {
        if (!window.confirm("Confirm receipt of goods? This will update stock levels.")) return;
        try {
            await api.post('/inventory/receive', { po_id: poId, location_id: 1 }); // Default loc 1
            toast.success("Goods Received Successfully");
            fetchPOs(); // Refresh
        } catch (error) {
            toast.error("Failed to receive goods");
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between mb-6">
                <h3 className="font-bold text-gray-700">Pending Purchase Orders</h3>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700"
                >
                    + Create Manual PO
                </button>
            </div>

            <div className="space-y-4">
                {pos.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-300">
                        <ShoppingCart className="mx-auto text-gray-400 mb-2" size={32} />
                        <p className="text-gray-500">No active purchase orders.</p>
                    </div>
                ) : (
                    pos.map(po => (
                        <div key={po.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-700/30">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h4 className="font-bold text-gray-900 dark:text-white">{po.po_number}</h4>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${po.status === 'RECEIVED' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                                        }`}>
                                        {po.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    Supplier: {po.supplier?.name || 'Unknown'} • Items: {po.items?.length} • {new Date(po.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="text-right flex items-center gap-4">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">Rp {po.total_cost?.toLocaleString() || 0}</p>
                                    <p className="text-xs text-gray-500">Total Cost</p>
                                </div>
                                {po.status !== 'RECEIVED' && (
                                    <button
                                        onClick={() => handleReceive(po.id)}
                                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"
                                    >
                                        Receive Goods
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showCreateModal && (
                <CreatePOModal
                    suppliers={suppliers}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => { setShowCreateModal(false); fetchPOs(); }}
                />
            )}
        </div>
    );
};

const CreatePOModal = ({ suppliers, onClose, onSuccess }) => {
    const [supplierId, setSupplierId] = useState('');
    const [items, setItems] = useState([{ name: '', qty: 1, cost: 0 }]);
    const [loading, setLoading] = useState(false);

    const addItem = () => setItems([...items, { name: '', qty: 1, cost: 0 }]);
    const updateItem = (idx, field, val) => {
        const newItems = [...items];
        newItems[idx][field] = val;
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!supplierId) return toast.error("Select a supplier");

        setLoading(true);
        try {
            await api.post('/inventory/po', { supplier_id: supplierId, items });
            toast.success("PO Created!");
            onSuccess();
        } catch (error) {
            toast.error("Failed to create PO");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">New Purchase Order</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Supplier</label>
                        <select
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value)}
                            className="w-full p-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
                            required
                        >
                            <option value="">Select Supplier...</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium">Items</label>
                            <button type="button" onClick={addItem} className="text-sm text-teal-600 font-bold">+ Add Item</button>
                        </div>
                        {items.map((item, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    placeholder="Item Name"
                                    value={item.name}
                                    onChange={e => updateItem(idx, 'name', e.target.value)}
                                    className="flex-[2] p-2 border rounded-lg dark:bg-gray-700"
                                    required
                                />
                                <input
                                    type="number" placeholder="Qty"
                                    value={item.qty}
                                    onChange={e => updateItem(idx, 'qty', e.target.value)}
                                    className="flex-1 p-2 border rounded-lg dark:bg-gray-700"
                                    required
                                />
                                <input
                                    type="number" placeholder="Cost"
                                    value={item.cost}
                                    onChange={e => updateItem(idx, 'cost', e.target.value)}
                                    className="flex-1 p-2 border rounded-lg dark:bg-gray-700"
                                    required
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 font-bold">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700">
                            {loading ? 'Creating...' : 'Create Purchase Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TransferView = () => {
    const [showModal, setShowModal] = useState(false);
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        api.get('/inventory/locations').then(res => setLocations(res.data));
    }, []);

    return (
        <div className="p-6">
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-300">
                <ArrowRightLeft size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">Stock Transfers</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">Move stock items between Main Warehouse and Satellite Depots (Pharmacy, ER, Polyclinics).</p>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-transform active:scale-95"
                >
                    + New Stock Transfer
                </button>
            </div>

            {showModal && (
                <TransferModal
                    locations={locations}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

const TransferModal = ({ locations, onClose }) => {
    const [form, setForm] = useState({
        from_loc_id: '',
        to_loc_id: '',
        item_name: '',
        quantity: 1
    });
    const [items, setItems] = useState([]); // Available items in source
    const [loading, setLoading] = useState(false);

    // Fetch items when Source Location changes
    useEffect(() => {
        if (form.from_loc_id) {
            api.get(`/inventory/stocks?location_id=${form.from_loc_id}`)
                .then(res => setItems(res.data))
                .catch(console.error);
        }
    }, [form.from_loc_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/inventory/transfer', form);
            toast.success("Stock Transfer Successful");
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.error || "Transfer Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Transfer Stock</h2>
                    <button onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">From</label>
                            <select
                                className="w-full p-2 border rounded-xl dark:bg-gray-700"
                                onChange={e => setForm({ ...form, from_loc_id: e.target.value })}
                                required
                            >
                                <option value="">Select Source</option>
                                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">To</label>
                            <select
                                className="w-full p-2 border rounded-xl dark:bg-gray-700"
                                onChange={e => setForm({ ...form, to_loc_id: e.target.value })}
                                required
                            >
                                <option value="">Select Dest</option>
                                {locations.filter(l => l.id != form.from_loc_id).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Item to Transfer</label>
                        <select
                            className="w-full p-2 border rounded-xl dark:bg-gray-700"
                            onChange={e => setForm({ ...form, item_name: e.target.value })}
                            required
                            disabled={!form.from_loc_id}
                        >
                            <option value="">Select Item ({items.length} available)</option>
                            {items.map(i => <option key={i.id} value={i.item_name}>{i.item_name} (Qty: {i.quantity})</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Quantity</label>
                        <input
                            type="number"
                            className="w-full p-2 border rounded-xl dark:bg-gray-700"
                            min="1"
                            value={form.quantity}
                            onChange={e => setForm({ ...form, quantity: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 mt-4">
                        {loading ? 'Transferring...' : 'Confirm Transfer'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default InventoryDashboard;
