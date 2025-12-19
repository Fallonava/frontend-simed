import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Box, Wrench, ShieldCheck, Search, Filter,
    Calendar, Tag, Monitor, Armchair, Printer, ArrowRight
} from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import ModernHeader from '../components/ModernHeader';
import { useNavigate } from 'react-router-dom';

const GeneralAssets = () => {
    const navigate = useNavigate();
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalAssets: 0,
        maintenance: 0,
        depreciated: 0
    });

    useEffect(() => {
        // Mock data fetch
        const loadData = async () => {
            setLoading(true);
            setTimeout(() => {
                setAssets([
                    { id: 1, name: 'MRI Scanner GE-3000', tag: 'AST-RAD-001', location: 'Radiology 1', type: 'Medical Device', status: 'Active', condition: 'Good' },
                    { id: 2, name: 'Herman Miller Chair', tag: 'AST-OFF-045', location: 'Director Office', type: 'Furniture', status: 'Active', condition: 'Good' },
                    { id: 3, name: 'Dell Precision Workstation', tag: 'AST-IT-102', location: 'Nurse Station 1', type: 'Electronics', status: 'Maintenance', condition: 'Fair' },
                    { id: 4, name: 'Patient Bed Electric', tag: 'AST-BED-012', location: 'Room 303', type: 'Medical Device', status: 'Broken', condition: 'Poor' },
                ]);
                setStats({ totalAssets: 1450, maintenance: 8, depreciated: 45 });
                setLoading(false);
            }, 800);
        };
        loadData();
    }, []);

    const getConditionColor = (condition) => {
        switch (condition) {
            case 'Good': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'Fair': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'Poor': return 'text-red-600 bg-red-50 border-red-100';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Medical Device': return <ShieldCheck size={18} />;
            case 'Electronics': return <Monitor size={18} />;
            case 'Furniture': return <Armchair size={18} />;
            default: return <Box size={18} />;
        }
    };

    return (
        <PageWrapper title="General Assets Inventory">
            <ModernHeader
                title="Aset & Umum"
                subtitle="General Asset Inventory & Maintenance"
                onBack={() => navigate('/menu')}
                actions={
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                        <Tag size={16} /> Register New Asset
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
                            <Box size={120} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-500 font-medium mb-1">Total Assets Registered</p>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stats.totalAssets.toLocaleString()}</h3>
                            <div className="flex items-center gap-2 mt-4 text-blue-600 font-bold text-sm bg-blue-50 w-fit px-3 py-1 rounded-full">
                                Across 12 Locations
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
                            <Wrench size={120} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-500 font-medium mb-1">Under Maintenance</p>
                            <h3 className="text-3xl font-black text-amber-500">{stats.maintenance} Items</h3>
                            <div className="flex items-center gap-2 mt-4 text-amber-600 font-bold text-sm bg-amber-50 w-fit px-3 py-1 rounded-full cursor-pointer hover:bg-amber-100 transition-colors">
                                View Service Schedule <ArrowRight size={14} />
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
                            <Printer size={120} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-500 font-medium mb-1">Depreciated / Broken</p>
                            <h3 className="text-3xl font-black text-gray-400">{stats.depreciated} Items</h3>
                            <div className="flex items-center gap-2 mt-4 text-gray-500 font-bold text-sm bg-gray-100 w-fit px-3 py-1 rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
                                Review Disposal <ArrowRight size={14} />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ASSET TABLE */}
                <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search Tag, Name, or Location..."
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 font-medium"
                                />
                            </div>
                            <button className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl hover:bg-gray-100 transition-colors text-gray-600">
                                <Filter size={18} />
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-6 py-2.5 rounded-full font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                                Print Labels
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 dark:bg-gray-700/20">
                                <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="px-8 py-4">Asset Name</th>
                                    <th className="px-6 py-4">Asset Tag</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4 text-center">Condition</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {assets.map((asset) => (
                                    <tr key={asset.id} className="group hover:bg-blue-50/10 transition-colors">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                                    {getTypeIcon(asset.type)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white">{asset.name}</div>
                                                    <div className="text-xs text-gray-400 font-mono">ID: {asset.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-xs bg-gray-100 dark:bg-gray-700 w-fit px-2 py-1 rounded text-gray-600 dark:text-gray-300 font-bold border border-gray-200 dark:border-gray-600">
                                                {asset.tag}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                {asset.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                                {asset.location}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border ${getConditionColor(asset.condition)}`}>
                                                {asset.condition}
                                            </span>
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

export default GeneralAssets;
