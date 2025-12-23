import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Microscope,
    Droplet,
    Box,
    Camera,
    CheckCircle,
    AlertCircle,
    Search,
    ArrowRight,
    QrCode,
    History,
    RefreshCcw,
    Activity
} from 'lucide-react';
import api from '../utils/axiosConfig';
import { toast } from 'react-hot-toast';

const MedicalSupport = () => {
    const [activeTab, setActiveTab] = useState('pathology');
    const [loading, setLoading] = useState(false);

    // Pathology States
    const [samples, setSamples] = useState([]);

    // Blood Bank States
    const [bloodStock, setBloodStock] = useState([]);

    // CSSD States
    const [scanValue, setScanValue] = useState('');
    const [lastScan, setLastScan] = useState(null);

    const tabs = [
        { id: 'pathology', label: 'Patologi Anatomi', icon: <Microscope size={20} /> },
        { id: 'bloodbank', label: 'Bank Darah', icon: <Droplet size={20} /> },
        { id: 'cssd', label: 'CSSD / Sterilisasi', icon: <Box size={20} /> },
        { id: 'rispacs', label: 'Radiologi & PACS', icon: <Camera size={20} /> }
    ];

    const fetchBloodStock = async () => {
        try {
            const res = await api.get('/medical-support/blood/inventory');
            setBloodStock(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (activeTab === 'bloodbank') fetchBloodStock();
    }, [activeTab]);

    const handleCSSDScan = async (e) => {
        if (e.key === 'Enter') {
            try {
                const res = await api.post('/medical-support/cssd/track', {
                    qr_code: scanValue,
                    activity: 'STERILE',
                    machine_id: 'AUTOCLAVE-01'
                });
                setLastScan(res.data);
                toast.success(`Set ${res.data.name} marked as READY`);
                setScanValue('');
            } catch (error) {
                toast.error("Invalid QR or Set not found");
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 lg:p-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">
                        Medical <span className="text-blue-600">Support</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Penunjang Medis Tipe A Core</p>
                </div>

                <div className="flex bg-white dark:bg-slate-900 p-2 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all
                                ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 active:scale-95'
                                    : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'pathology' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* PA Dashboard */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800">
                                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                                    <Activity className="text-blue-600" /> Workflow Tracking (Chain of Custody)
                                </h2>
                                <div className="space-y-4">
                                    {/* Mock Sample List */}
                                    {["PA-2023-001", "PA-2023-002"].map(id => (
                                        <div key={id} className="flex justify-between items-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                                            <div>
                                                <div className="font-black text-lg">{id}</div>
                                                <div className="text-xs text-slate-500">Biopsy - Breast Tissue</div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="flex gap-2">
                                                    {['REC', 'GROSS', 'PROC', 'SLIDE', 'READ'].map((step, i) => (
                                                        <div key={step} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${i < 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                            {step}
                                                        </div>
                                                    ))}
                                                </div>
                                                <button className="p-3 bg-white dark:bg-slate-700 rounded-xl shadow-sm hover:shadow-md transition">
                                                    <ArrowRight size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[40px] text-white shadow-2xl shadow-blue-500/20">
                                <h3 className="text-xl font-black mb-4">Synoptic Template</h3>
                                <p className="text-sm text-white/70 mb-8 font-medium">Standardized CAP Protocol reporting for National Cancer Registry.</p>
                                <button className="w-full py-4 bg-white/20 backdrop-blur-md rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/30 transition">
                                    Config Templates
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'bloodbank' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-4 gap-8"
                    >
                        {/* Blood Stats */}
                        {['A+', 'B+', 'O+', 'AB+'].map(group => (
                            <div key={group} className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-xl border border-slate-100 dark:border-slate-800 text-center group">
                                <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-3xl flex items-center justify-center text-red-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <Droplet size={32} />
                                </div>
                                <h4 className="text-4xl font-black mb-2">{group}</h4>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">12 Bags Available</p>
                            </div>
                        ))}

                        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-black">Stock Inventory (FIFO)</h3>
                                <div className="flex gap-3">
                                    <span className="flex items-center gap-2 text-xs font-black text-red-600 bg-red-50 px-4 py-2 rounded-full">
                                        <AlertCircle size={14} /> 3 Near Expired
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bloodStock.map(bag => (
                                    <div key={bag.id} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                        <div>
                                            <div className="text-2xl font-black text-red-600">{bag.blood_type}{bag.rhesus}</div>
                                            <div className="text-xs font-bold text-slate-500 uppercase">{bag.component_type} | #{bag.bag_number}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Expiry</div>
                                            <div className="text-xs font-black text-slate-900 dark:text-white">
                                                {new Date(bag.expiry_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'cssd' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto space-y-12 text-center"
                    >
                        <div className="space-y-6">
                            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-500/10 rounded-[35%] flex items-center justify-center text-blue-600 mx-auto">
                                <QrCode size={48} />
                            </div>
                            <h2 className="text-4xl font-black">Sterile Set Tracking</h2>
                            <p className="text-slate-500 font-medium max-w-md mx-auto italic">Scan QR pada set alat bedah untuk memperbarui siklus sterilisasi.</p>
                        </div>

                        <div className="relative max-w-lg mx-auto">
                            <input
                                type="text"
                                value={scanValue}
                                onChange={(e) => setScanValue(e.target.value)}
                                onKeyDown={handleCSSDScan}
                                placeholder="Scan Set QR Code..."
                                className="w-full p-8 rounded-full bg-white dark:bg-slate-900 shadow-2xl border-none text-2xl font-black text-center focus:ring-4 ring-blue-500/20 transition-all"
                                autoFocus
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">
                                <Search size={32} />
                            </div>
                        </div>

                        {lastScan && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-2xl border-4 border-emerald-500/20 inline-block text-left"
                            >
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                                        <CheckCircle size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black">{lastScan.name}</h4>
                                        <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Status: READY TO USE</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Sterilized At</div>
                                        <div className="font-bold text-sm">{new Date(lastScan.last_sterile_at).toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Expiry Date</div>
                                        <div className="font-bold text-sm text-red-500">{new Date(lastScan.expiry_date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'rispacs' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="bg-slate-900 text-white p-12 rounded-[50px] shadow-2xl relative overflow-hidden group">
                            <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] group-hover:bg-blue-500/30 transition-all duration-700" />

                            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
                                <div className="max-w-2xl">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-widest mb-6">
                                        <Activity size={14} /> HL7/DICOM Integration Active
                                    </div>
                                    <h2 className="text-5xl font-black mb-6 leading-tight">PACS Cloud <br /><span className="text-blue-500">DICOM Viewer</span></h2>
                                    <p className="text-slate-400 text-lg font-medium mb-10">Integrasi citra medis resolusi tinggi (MRI, CT, PET-Scan) langsung ke rekam medis pasien dengan standarisasi DICOM.</p>
                                    <button className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                                        Launch DICOM Console <ArrowRight size={20} />
                                    </button>
                                </div>

                                <div className="w-80 h-80 bg-slate-800 rounded-[60px] border border-slate-700 p-4 relative shadow-2xl group flex items-center justify-center">
                                    <Camera size={80} className="text-slate-600 opacity-20" />
                                    <div className="absolute inset-4 rounded-[45px] border-2 border-dashed border-blue-500/30 flex items-center justify-center">
                                        <span className="text-[10px] font-black text-blue-400/50 uppercase tracking-widest">DICOM Viewport</span>
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

export default MedicalSupport;
