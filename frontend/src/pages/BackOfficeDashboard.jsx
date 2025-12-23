import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calculator,
    Truck,
    Book,
    Users,
    DollarSign,
    ShieldCheck,
    Wrench,
    PieChart,
    ChevronRight,
    Search,
    Lock,
    Unlock,
    Activity,
    AlertCircle
} from 'lucide-react';
import api from '../utils/axiosConfig';
import { toast } from 'react-hot-toast';

const BackOfficeDashboard = () => {
    const [activeTab, setActiveTab] = useState('remuneration');
    const [loading, setLoading] = useState(false);

    // Data States
    const [assets, setAssets] = useState([]);
    const [stats, setStats] = useState({
        totalRevenue: 1250000000,
        pendingClaims: 450000000,
        lockedStaff: 2
    });

    const tabs = [
        { id: 'remuneration', label: 'Jasa Medis', icon: <DollarSign size={20} /> },
        { id: 'assets', label: 'Fixed Assets', icon: <Wrench size={20} /> },
        { id: 'accounting', label: 'Akuntansi', icon: <Book size={20} /> },
        { id: 'hr', label: 'Compliance', icon: <ShieldCheck size={20} /> }
    ];

    const fetchAssets = async () => {
        try {
            const res = await api.get('/back-office/assets');
            setAssets(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (activeTab === 'assets') fetchAssets();
    }, [activeTab]);

    const runCredentialAudit = async () => {
        setLoading(true);
        try {
            const res = await api.post('/back-office/hr/credential-audit');
            toast.success(res.data.message);
        } catch (error) {
            toast.error("Audit failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 lg:p-12">
            {/* ERP Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">
                        Back <span className="text-indigo-600">Office</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">ERP Enterprise Simed v4.0</p>
                </div>

                <div className="flex bg-white dark:bg-slate-900 p-2 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all
                                ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'remuneration' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* Summary Cards */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800">
                                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                                    <Calculator className="text-indigo-600" /> Remuneration Calculation
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                                        <div>
                                            <div className="font-black text-lg">Billing #INV-2023-4521</div>
                                            <div className="text-xs text-slate-500">Operation Case - Dr. Zaidan</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-emerald-600">Rp 15.000.000</div>
                                            <button className="mt-2 text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Process Split</button>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 text-sm font-bold italic">
                                        Waiting for finalized patient invoices...
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[40px] text-white shadow-2xl shadow-indigo-500/20">
                                <h3 className="text-xl font-black mb-4">Sharing Split</h3>
                                <p className="text-sm text-white/70 mb-8 font-medium italic">Standard RS Tipe A: 40% Sarana | 60% Pelayanan (Tim Splitting rules active).</p>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span>Operator Utama</span>
                                        <span className="bg-white/20 px-3 py-1 rounded-lg">45%</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span>Asisten</span>
                                        <span className="bg-white/20 px-3 py-1 rounded-lg">15%</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span>RS (Sarana)</span>
                                        <span className="bg-white/20 px-3 py-1 rounded-lg">40%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'assets' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {assets.map(asset => (
                                <div key={asset.code} className="bg-white dark:bg-slate-900 p-6 rounded-[35px] shadow-xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600">
                                            <Wrench size={24} />
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${asset.status === 'OPERATIONAL' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                            {asset.status}
                                        </span>
                                    </div>
                                    <h4 className="text-xl font-black mb-1">{asset.name}</h4>
                                    <p className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">{asset.code}</p>

                                    <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500 font-bold uppercase tracking-widest">Book Value</span>
                                            <span className="font-black text-slate-900 dark:text-white">Rp {asset.book_value.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500 font-bold uppercase tracking-widest">Monthly Dep</span>
                                            <span className="font-black text-slate-500">Rp {asset.monthly_depreciation.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'hr' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="bg-white dark:bg-slate-900 p-12 rounded-[50px] shadow-2xl border border-slate-100 dark:border-slate-800 text-center space-y-12">
                            <div className="relative inline-block">
                                <div className="w-32 h-32 bg-red-100 dark:bg-red-500/10 rounded-[40%] flex items-center justify-center text-red-600 mx-auto">
                                    <ShieldCheck size={64} />
                                </div>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute -top-2 -right-2 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-black shadow-lg"
                                >
                                    !
                                </motion.div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-4xl font-black">Credentialing Audit</h2>
                                <p className="text-slate-500 font-medium max-w-md mx-auto italic">Otomatis memblokir hak praktik dokter jika STR/SIP kedaluwarsa sesuai regulasi Kemenkes.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
                                <div className="p-8 rounded-[35px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                    <div className="text-4xl font-black text-slate-900 dark:text-white mb-2">245</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Doctors</div>
                                </div>
                                <div className="p-8 rounded-[35px] bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
                                    <div className="text-4xl font-black text-red-600 mb-2">3</div>
                                    <div className="text-[10px] font-black text-red-600/70 uppercase tracking-widest">Expired License</div>
                                </div>
                            </div>

                            <button
                                onClick={runCredentialAudit}
                                disabled={loading}
                                className="px-12 py-6 bg-red-600 text-white rounded-3xl font-black text-lg shadow-2xl shadow-red-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 mx-auto"
                            >
                                {loading ? <Activity className="animate-spin" /> : <Lock size={24} />}
                                Run Security Audit & Lock
                            </button>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'accounting' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        <div className="bg-slate-900 text-white p-12 rounded-[50px] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-10">
                                <Book size={240} />
                            </div>
                            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div>
                                    <h2 className="text-5xl font-black mb-8 leading-tight">Automated <br /><span className="text-indigo-400">Journaling</span></h2>
                                    <p className="text-slate-400 text-lg font-medium mb-10 italic">Real-time posting dari pelayanan ke buku besar. Tanpa input manual, bebas human error.</p>
                                    <div className="flex gap-4">
                                        <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black shadow-xl hover:bg-slate-100 transition">View Ledger</button>
                                        <button className="px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl font-black text-white hover:bg-white/20 transition">P&L Report</button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                                        <div className="flex justify-between text-xs font-black text-white/50 uppercase tracking-widest mb-2">
                                            <span>Current Asset</span>
                                            <span>IDR Billions</span>
                                        </div>
                                        <div className="text-3xl font-black">Rp 1.458,24</div>
                                    </div>
                                    <div className="p-6 bg-emerald-500/20 rounded-3xl border border-emerald-500/30 backdrop-blur-sm">
                                        <div className="flex justify-between text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">
                                            <span>Revenue (MTD)</span>
                                            <span className="text-emerald-400">+12%</span>
                                        </div>
                                        <div className="text-3xl font-black">Rp 456,80</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BackOfficeDashboard;
