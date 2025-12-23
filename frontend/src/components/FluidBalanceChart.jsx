import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Activity, Plus, Trash2 } from 'lucide-react';

const FluidBalanceChart = ({ admissionId, initialData = [] }) => {
    const [entries, setEntries] = useState(initialData); // { time, type: 'IN'|'OUT', item, volume }
    const [newEntry, setNewEntry] = useState({ time: '', type: 'IN', item: '', volume: '' });

    const handleAdd = () => {
        if (!newEntry.item || !newEntry.volume) return;
        setEntries([...entries, { ...newEntry, id: Date.now() }]);
        setNewEntry({ time: '', type: 'IN', item: '', volume: '' });
    };

    const removeEntry = (id) => {
        setEntries(entries.filter(e => e.id !== id));
    };

    const totalIn = entries.filter(e => e.type === 'IN').reduce((sum, e) => sum + Number(e.volume), 0);
    const totalOut = entries.filter(e => e.type === 'OUT').reduce((sum, e) => sum + Number(e.volume), 0);
    const balance = totalIn - totalOut;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 lg:p-12 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-500/10 rounded-3xl flex items-center justify-center text-cyan-600">
                    <Droplets size={32} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-2">Fluid Balance Chart</h2>
                    <p className="text-slate-500 font-medium">Monitoring Input & Output (24H)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="bg-emerald-50 dark:bg-emerald-500/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-500/20">
                    <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest block mb-1">Total Intake</span>
                    <span className="text-4xl font-black text-emerald-700 dark:text-emerald-400">{totalIn} <small className="text-sm">ml</small></span>
                </div>
                <div className="bg-rose-50 dark:bg-rose-500/10 p-6 rounded-3xl border border-rose-100 dark:border-rose-500/20">
                    <span className="text-[10px] font-black uppercase text-rose-600 tracking-widest block mb-1">Total Output</span>
                    <span className="text-4xl font-black text-rose-700 dark:text-rose-400">{totalOut} <small className="text-sm">ml</small></span>
                </div>
                <div className={`p-6 rounded-3xl border ${balance >= 0 ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-100' : 'bg-orange-50 dark:bg-orange-500/10 border-orange-100'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest block mb-1">Net Balance</span>
                    <span className={`text-4xl font-black ${balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                        {balance > 0 ? '+' : ''}{balance} <small className="text-sm">ml</small>
                    </span>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Source/Type</label>
                    <select
                        value={newEntry.type}
                        onChange={e => setNewEntry({ ...newEntry, type: e.target.value })}
                        className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border-none font-bold outline-none ring-2 ring-transparent focus:ring-blue-500"
                    >
                        <option value="IN">Intake (In)</option>
                        <option value="OUT">Output (Out)</option>
                    </select>
                </div>
                <div className="md:col-span-1">
                    <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Item/Fluid Name</label>
                    <input
                        type="text"
                        value={newEntry.item}
                        onChange={e => setNewEntry({ ...newEntry, item: e.target.value })}
                        placeholder="e.g. NaCl 0.9%"
                        className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border-none font-bold outline-none ring-2 ring-transparent focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Volume (ml)</label>
                    <input
                        type="number"
                        value={newEntry.volume}
                        onChange={e => setNewEntry({ ...newEntry, volume: e.target.value })}
                        className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border-none font-bold outline-none ring-2 ring-transparent focus:ring-blue-500"
                    />
                </div>
                <button
                    onClick={handleAdd}
                    className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2"
                >
                    <Plus size={20} /> Add Entry
                </button>
            </div>

            <div className="space-y-3">
                {entries.map((entry) => (
                    <div
                        key={entry.id}
                        className={`flex items-center justify-between p-4 rounded-2xl border-l-8 ${entry.type === 'IN' ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-500' : 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-500'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${entry.type === 'IN' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                {entry.type}
                            </div>
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white">{entry.item}</div>
                                <div className="text-xs text-slate-400">{entry.time || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className={`text-xl font-black ${entry.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {entry.type === 'IN' ? '+' : '-'}{entry.volume} ml
                            </span>
                            <button onClick={() => removeEntry(entry.id)} className="text-slate-300 hover:text-red-500 transition">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FluidBalanceChart;
