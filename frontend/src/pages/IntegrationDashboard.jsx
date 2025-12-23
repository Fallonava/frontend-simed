import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, CheckCircle, XCircle, Clock, RefreshCw,
    Download, Send, Shield, Database, FileText
} from 'lucide-react';
import api from '../utils/axiosConfig';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ModernHeader from '../components/ModernHeader';

const IntegrationDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('health');
    const [loading, setLoading] = useState(false);
    const [health, setHealth] = useState({});
    const [logs, setLogs] = useState([]);
    const [mappings, setMappings] = useState([]);

    useEffect(() => {
        fetchHealth();
        fetchLogs();
    }, []);

    const fetchHealth = async () => {
        try {
            const res = await api.get('/integration/health');
            setHealth(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await api.get('/integration/logs?limit=50');
            setLogs(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleManualSync = async (resourceType, resourceId) => {
        setLoading(true);
        try {
            await api.post('/integration/satusehat/sync', { resourceType, resourceId });
            toast.success('Sync job queued successfully');
            setTimeout(fetchLogs, 2000);
        } catch (error) {
            toast.error('Failed to queue sync job');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateRL = async (reportType) => {
        setLoading(true);
        try {
            const now = new Date();
            await api.post('/integration/sirs/generate-rl', {
                reportType,
                month: now.getMonth() + 1,
                year: now.getFullYear()
            });
            toast.success(`${reportType} report generation queued`);
        } catch (error) {
            toast.error('Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'SUCCESS': return <CheckCircle className="text-green-500" size={20} />;
            case 'FAILED': return <XCircle className="text-red-500" size={20} />;
            default: return <Clock className="text-yellow-500" size={20} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 lg:p-12">
            <ModernHeader
                title="National Integration"
                subtitle="SATUSEHAT, SIRS, SISRUTE & Government Systems"
                onBack={() => navigate('/menu')}
            />

            {/* Tabs */}
            <div className="flex bg-white dark:bg-slate-900 p-2 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 mb-8 max-w-2xl">
                {[
                    { id: 'health', label: 'Health Status', icon: Activity },
                    { id: 'logs', label: 'Activity Logs', icon: FileText },
                    { id: 'manual', label: 'Manual Sync', icon: Send }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all flex-1
                            ${activeTab === tab.id
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                                : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'health' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(health.stats || {}).map(([system, stats]) => (
                        <motion.div
                            key={system}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-black">{system}</h3>
                                <Shield className="text-emerald-500" size={32} />
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Success</span>
                                    <span className="text-xl font-black text-green-600">{stats.SUCCESS || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Failed</span>
                                    <span className="text-xl font-black text-red-600">{stats.FAILED || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending</span>
                                    <span className="text-xl font-black text-yellow-600">{stats.PENDING || 0}</span>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Last 24h • {health.timestamp ? new Date(health.timestamp).toLocaleString() : 'N/A'}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="text-xl font-black">Recent Activity</h3>
                        <button
                            onClick={fetchLogs}
                            className="px-4 py-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-xl font-black text-sm hover:bg-emerald-200 transition flex items-center gap-2"
                        >
                            <RefreshCw size={16} /> Refresh
                        </button>
                    </div>
                    <div className="max-h-[600px] overflow-y-auto">
                        {logs.map((log, idx) => (
                            <div
                                key={idx}
                                className="p-6 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-4 flex-1">
                                        {getStatusIcon(log.status)}
                                        <div className="flex-1">
                                            <div className="font-black text-sm mb-1">{log.system} • {log.resource_type}</div>
                                            <div className="text-xs text-slate-500 font-mono">ID: {log.resource_id}</div>
                                            {log.error_message && (
                                                <div className="text-xs text-red-600 mt-2 font-medium">{log.error_message}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-400 font-mono">
                                        {new Date(log.created_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'manual' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800">
                        <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                            <Database className="text-emerald-600" /> SATUSEHAT Sync
                        </h3>
                        <p className="text-slate-500 mb-8 font-medium italic">Manually trigger FHIR resource synchronization to SATUSEHAT platform.</p>
                        <div className="space-y-4">
                            <button
                                onClick={() => handleManualSync('Patient', 1)}
                                disabled={loading}
                                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:scale-105 transition disabled:opacity-50"
                            >
                                Sync Test Patient (ID:1)
                            </button>
                            <button
                                onClick={() => handleManualSync('Encounter', 1)}
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:scale-105 transition disabled:opacity-50"
                            >
                                Sync Test Encounter (ID:1)
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800">
                        <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                            <Download className="text-purple-600" /> SIRS Reports
                        </h3>
                        <p className="text-slate-500 mb-8 font-medium italic">Generate monthly statistical reports for Ministry of Health.</p>
                        <div className="space-y-4">
                            {['RL1', 'RL2', 'RL3', 'RL4', 'RL5'].map(rl => (
                                <button
                                    key={rl}
                                    onClick={() => handleGenerateRL(rl)}
                                    disabled={loading}
                                    className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black shadow-xl shadow-purple-500/20 hover:scale-105 transition disabled:opacity-50 flex items-center justify-between px-6"
                                >
                                    <span>Generate {rl} Report</span>
                                    <Download size={20} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntegrationDashboard;
