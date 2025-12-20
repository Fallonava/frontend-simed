import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Receipt, DollarSign, CreditCard, Printer, Search, TrendingUp, TrendingDown,
    Filter, BarChart2, PieChart, FileText, AlertCircle, Calendar, Plus,
    ArrowUpRight, ArrowDownRight, Briefcase
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import PageLoader from '../components/PageLoader';
import ModernHeader from '../components/ModernHeader';
import PageWrapper from '../components/PageWrapper';

const FinanceDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);

    // Analytics & Report Data
    const [stats, setStats] = useState({ revenue: 0, cogs: 0, grossProfit: 0, margin: 0 });
    const [chartData, setChartData] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [expensesList, setExpensesList] = useState([]);

    // Expense Modal State
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', category: 'OPERATIONAL', date: '' });


    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const res = await api.get('/finance/reports'); // New endpoint
            if (res.data) {
                setReportData(res.data);
                setStats(res.data.summary);
                setExpensesList(res.data.details.expenses || []);
                // Transform for Chart if needed, or use mock if chart data missing
                // For now, let's keep mock chart or try to map if provided
                if (res.data.chartData) setChartData(res.data.chartData);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load financial data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExpense = async (e) => {
        e.preventDefault();
        try {
            await api.post('/finance/expenses', expenseForm);
            toast.success("Expense Recorded!");
            setIsExpenseModalOpen(false);
            setExpenseForm({ description: '', amount: '', category: 'OPERATIONAL', date: '' });
            fetchAnalytics(); // Refresh data
        } catch (error) {
            toast.error("Failed to save expense");
        }
    };

    // Tab Headers
    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart2 },
        { id: 'ap', label: 'Expenditure', icon: ArrowUpRight }, // Expenses
        { id: 'reports', label: 'Financial Reports', icon: FileText },
    ];

    return (
        <PageWrapper title="Hospital Finance Console">
            <Toaster position="top-right" />

            {/* Expense Modal */}
            {isExpenseModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">Record Expense</h3>
                        <form onSubmit={handleCreateExpense} className="space-y-4">
                            <div>
                                <label className="label">Description</label>
                                <input
                                    type="text" required
                                    className="input-field"
                                    placeholder="e.g. Electricity Bill"
                                    value={expenseForm.description}
                                    onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="label">Amount (Rp)</label>
                                <input
                                    type="number" required
                                    className="input-field"
                                    placeholder="0"
                                    value={expenseForm.amount}
                                    onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="label">Category</label>
                                <select
                                    className="input-field"
                                    value={expenseForm.category}
                                    onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                                >
                                    <option value="OPERATIONAL">Operational</option>
                                    <option value="SALARY">Salary & Wages</option>
                                    <option value="PURCHASE">Purchase / Procurement</option>
                                    <option value="MAINTENANCE">Maintenance</option>
                                    <option value="MARKETING">Marketing</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Date</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={expenseForm.date}
                                    onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-xl">Cancel</button>
                                <button type="submit" className="btn-primary bg-indigo-600 text-white px-6 py-2 rounded-xl">Save Expense</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            <ModernHeader
                title="Hospital Finance Console"
                subtitle="Financial Planning & Analysis (FP&A)"
                gradient="from-indigo-600 to-blue-600"
            >
                <div className="flex bg-gray-200/50 dark:bg-gray-800/50 backdrop-blur-md p-1 rounded-xl border border-gray-200 dark:border-white/10">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-300 z-10
                                ${activeTab === tab.id
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                        >
                            <tab.icon size={16} className={activeTab === tab.id ? 'text-indigo-500' : ''} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </ModernHeader>

            <div className="p-6 max-w-[1920px] mx-auto min-h-[calc(100vh-140px)]">
                <AnimatePresence mode="wait">

                    {/* --- OVERVIEW TAB --- */}
                    {activeTab === 'overview' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <KPICard title="Revenue (MTD)" value={`Rp ${stats.revenue.toLocaleString()}`} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-900/20" change="Realtime" />
                                <KPICard title="COGS" value={`Rp ${stats.cogs.toLocaleString()}`} icon={TrendingDown} color="text-rose-600" bg="bg-rose-50 dark:bg-rose-900/20" />
                                <KPICard title="Operational Exp" value={`Rp ${stats.expenses?.toLocaleString() || 0}`} icon={Briefcase} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-900/20" />
                                <div className="glass-panel p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 flex flex-col justify-center items-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 z-0" />
                                    <div className="relative z-10 text-center">
                                        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-1">Net Profit Margin</p>
                                        <h3 className={`text-4xl font-black ${stats.margin >= 20 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {stats.margin}%
                                        </h3>
                                        <p className={`text-sm font-bold ${stats.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            Rp {stats.netProfit?.toLocaleString() || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 glass-panel p-6 rounded-3xl shadow-sm">
                                    <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                                        <BarChart2 size={20} className="text-indigo-500" /> Revenue vs Cost Trend
                                    </h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData}>
                                                <defs>
                                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} vertical={false} />
                                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                                <Legend />
                                                <Area type="monotone" dataKey="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                                                <Area type="monotone" dataKey="Cost" stroke="#f43f5e" fillOpacity={1} fill="url(#colorCost)" strokeWidth={3} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="glass-panel p-6 rounded-3xl shadow-sm">
                                    <h3 className="font-bold text-gray-800 dark:text-white mb-6">Top Revenue Sources</h3>
                                    {/* Placeholder or real data if available in summary */}
                                    <div className="space-y-4">
                                        {[
                                            { name: 'Pharmacy Sales', value: 45, color: 'bg-emerald-500' },
                                            { name: 'Inpatient Services', value: 30, color: 'bg-blue-500' },
                                            { name: 'Services', value: 25, color: 'bg-indigo-500' },
                                        ].map((item, idx) => (
                                            <div key={idx}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-600 dark:text-gray-300">{item.name}</span>
                                                    <span className="font-bold">{item.value}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* --- EXPENDITURE (AP) --- */}
                    {activeTab === 'ap' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <ArrowUpRight className="text-rose-500" /> Operational Expenses
                                </h3>
                                <button
                                    onClick={() => setIsExpenseModalOpen(true)}
                                    className="btn-primary flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl shadow-lg shadow-rose-500/20"
                                >
                                    <Plus size={18} /> Record Expense
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Expense List */}
                                <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
                                    <h4 className="font-bold text-gray-600 mb-4">Expense History (This Month)</h4>
                                    <div className="space-y-3">
                                        {expensesList.length === 0 ? (
                                            <p className="text-center text-gray-400 py-8">No expenses recorded yet.</p>
                                        ) : (
                                            expensesList.map((exp) => (
                                                <div key={exp.id} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all">
                                                    <div>
                                                        <div className="font-bold text-gray-800 dark:text-gray-200">{exp.description}</div>
                                                        <div className="text-xs text-gray-500">{new Date(exp.date).toLocaleDateString()} • <span className="font-semibold text-rose-500">{exp.category}</span></div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-mono font-bold text-rose-600">- Rp {exp.amount.toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Summary Box */}
                                <div className="glass-panel p-6 rounded-3xl">
                                    <h4 className="font-bold text-gray-600 mb-4">Breakdown by Category</h4>
                                    <div className="space-y-4">
                                        {reportData && reportData.expenseBreakdown && Object.entries(reportData.expenseBreakdown).map(([cat, amount]) => (
                                            <div key={cat} className="flex justify-between items-center border-b border-dashed border-gray-200 pb-2">
                                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 capitalize">{cat.toLowerCase()}</span>
                                                <span className="font-mono font-bold text-gray-800 dark:text-white">Rp {amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <div className="pt-4 flex justify-between items-center">
                                            <span className="font-bold text-lg">Total</span>
                                            <span className="font-bold text-xl text-rose-600">Rp {stats.expenses?.toLocaleString() || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* --- REPORTS --- */}
                    {activeTab === 'reports' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="text-center mb-8">
                                    <FileText size={48} className="mx-auto text-indigo-500 mb-4" />
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Hospital Profit & Loss</h2>
                                    <p className="text-gray-500">Statement of Financial Performance (Period: Current Month)</p>
                                </div>

                                <div className="max-w-3xl mx-auto space-y-2 font-mono text-sm md:text-base border p-8 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                                    {/* Revenue */}
                                    <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-700">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">Total Revenue</span>
                                        <span className="font-bold text-emerald-600">Rp {stats.revenue.toLocaleString()}</span>
                                    </div>

                                    {/* COGS */}
                                    <div className="flex justify-between items-center py-2 text-gray-600 dark:text-gray-400">
                                        <span className="pl-4">Cost of Goods Sold (Medicine)</span>
                                        <span>(Rp {stats.cogs.toLocaleString()})</span>
                                    </div>

                                    {/* Gross Profit */}
                                    <div className="flex justify-between items-center py-4 border-b-2 border-gray-300 dark:border-gray-700">
                                        <span className="font-bold text-lg">Gross Profit</span>
                                        <span className="font-bold text-lg text-blue-600">Rp {stats.grossProfit.toLocaleString()}</span>
                                    </div>

                                    {/* Expenses Section */}
                                    <div className="py-2">
                                        <div className="font-bold text-gray-700 dark:text-gray-300 mb-2">Operational Expenses:</div>
                                        {reportData && reportData.expenseBreakdown && Object.entries(reportData.expenseBreakdown).map(([cat, amount]) => (
                                            <div key={cat} className="flex justify-between items-center py-1 text-gray-500 pl-4">
                                                <span className="capitalize">{cat.toLowerCase()}</span>
                                                <span>(Rp {amount.toLocaleString()})</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total Expenses */}
                                    <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-700">
                                        <span className="font-bold text-gray-700 dark:text-gray-300 pl-4">Total Expenses</span>
                                        <span className="font-bold text-rose-600">(Rp {stats.expenses?.toLocaleString() || 0})</span>
                                    </div>

                                    {/* Net Profit */}
                                    <div className="flex justify-between items-center py-6 mt-4 bg-emerald-50 dark:bg-emerald-900/10 -mx-4 px-4 rounded-xl">
                                        <span className="font-black text-xl text-emerald-900 dark:text-emerald-100">NET PROFIT / (LOSS)</span>
                                        <span className={`font-black text-2xl ${stats.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            Rp {stats.netProfit?.toLocaleString() || 0}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-center mt-6">
                                    <button className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 mx-auto">
                                        <Printer size={18} /> Print Statement
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </PageWrapper>
    );
};


// Sub-components
const KPICard = ({ title, value, icon: Icon, color, bg, change }) => (
    <div className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5 hover:shadow-lg transition-all group">
        <div className="flex justify-between items-start mb-2">
            <div className={`p-3 rounded-2xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            {change && (
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${change.includes('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {change}
                </span>
            )}
        </div>
        <div className="mt-4">
            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white font-mono tracking-tight">{value}</h3>
        </div>
    </div>
);

const ClaimsCard = ({ title, count, amount, color, bg, border }) => (
    <div className={`p-6 rounded-3xl bg-white dark:bg-gray-800 border ${border} shadow-sm relative overflow-hidden`}>
        <div className={`absolute top-0 right-0 w-24 h-24 ${bg} rounded-bl-full opacity-50 -mr-4 -mt-4`} />
        <h3 className="text-gray-500 font-bold text-sm uppercase mb-1 relative z-10">{title}</h3>
        <div className={`text-3xl font-black ${color} font-mono mb-2 relative z-10`}>{count} <span className="text-sm text-gray-400 font-sans">claims</span></div>
        <div className="text-gray-900 dark:text-white font-bold relative z-10">Rp {amount.toLocaleString()}</div>
    </div>
);

export default FinanceDashboard;
