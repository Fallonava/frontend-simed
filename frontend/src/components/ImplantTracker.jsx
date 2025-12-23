import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Scan, CreditCard, User, History, Trash2, Plus, Search, CheckCircle } from 'lucide-react';

const ImplantTracker = ({ patientId, medicalRecordId, admissionId }) => {
    const [implants, setImplants] = useState([]); // { name, serial, batch, price }
    const [newItem, setNewItem] = useState({ name: '', serial: '', batch: '', price: '' });
    const [isScanning, setIsScanning] = useState(false);

    const handleAdd = () => {
        if (!newItem.name || !newItem.serial) return;
        setImplants([...implants, { ...newItem, id: Date.now(), is_billed: false }]);
        setNewItem({ name: '', serial: '', batch: '', price: '' });
    };

    const removeImplant = (id) => {
        setImplants(implants.filter(i => i.id !== id));
    };

    const runSimulatedScan = () => {
        setIsScanning(true);
        setTimeout(() => {
            const mockImplants = [
                { name: 'Coronary Stent - Xience Skypoint', serial: 'SN-77281-XC', batch: 'B-2024-05', price: 12500000 },
                { name: 'Orthopedic Screw - 3.5mm Titanium', serial: 'SN-OR-9912', batch: 'B-2023-11', price: 850000 },
                { name: 'Artificial Valve - SAPIEN 3', serial: 'SN-VV-1102', batch: 'B-2024-01', price: 45000000 }
            ];
            const random = mockImplants[Math.floor(Math.random() * mockImplants.length)];
            setNewItem(random);
            setIsScanning(false);
        }, 1500);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 lg:p-12 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-600 shadow-inner">
                    <Box size={32} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-2">Implant Tracker</h2>
                    <p className="text-slate-500 font-medium">Surgical Asset & Implant Recording (IBS)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
                {/* Form Part */}
                <div className="space-y-6">
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 relative overflow-hidden">
                        <AnimatePresence>
                            {isScanning && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-blue-600/10 backdrop-blur-sm z-10 flex flex-col items-center justify-center"
                                >
                                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                                    <span className="font-black text-blue-600 uppercase tracking-widest text-xs">Scanning Barcode...</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex justify-between items-center mb-6">
                            <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Entry Data</span>
                            <button
                                onClick={runSimulatedScan}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition"
                            >
                                <Scan size={14} /> Scan Barcode
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Item Name / Model</label>
                                <input
                                    type="text"
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    placeholder="Select or enter implant name..."
                                    className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 font-bold border-none outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all shadow-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Serial Number (SN)</label>
                                    <input
                                        type="text"
                                        value={newItem.serial}
                                        onChange={e => setNewItem({ ...newItem, serial: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 font-bold border-none outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Batch No</label>
                                    <input
                                        type="text"
                                        value={newItem.batch}
                                        onChange={e => setNewItem({ ...newItem, batch: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 font-bold border-none outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Price Estimate (IDR)</label>
                                <input
                                    type="number"
                                    value={newItem.price}
                                    onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                    className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 font-bold border-none outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all shadow-sm"
                                />
                            </div>
                            <button
                                onClick={handleAdd}
                                className="w-full p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <Plus size={20} /> Record Usage
                            </button>
                        </div>
                    </div>
                </div>

                {/* List Part */}
                <div className="space-y-4">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <History size={20} className="text-blue-500" />
                        Usage History
                    </h3>

                    {implants.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                            <Box size={48} className="opacity-20 mb-4" />
                            <p className="font-bold">No implants recorded yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {implants.map((item) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={item.id}
                                    className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex justify-between items-center group"
                                >
                                    <div>
                                        <div className="font-black text-slate-900 dark:text-white mb-1">{item.name}</div>
                                        <div className="flex gap-4">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded">SN: {item.serial}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded">Lot: {item.batch}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="text-sm font-black text-blue-600">Rp {Number(item.price).toLocaleString()}</div>
                                            <div className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1 justify-end">
                                                <CheckCircle size={10} /> Pending Bill
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeImplant(item.id)}
                                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <div className="text-slate-400 text-sm font-bold uppercase tracking-widest">Total Asset Value</div>
                        <div className="text-2xl font-black text-blue-600">
                            Rp {implants.reduce((sum, i) => sum + Number(i.price), 0).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImplantTracker;
