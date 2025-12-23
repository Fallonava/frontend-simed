import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, TrendingDown, DollarSign, Activity, Users,
    Clock, Calendar, PieChart as PieChartIcon, BarChart as BarChartIcon,
    ArrowUpRight, ArrowDownRight, Target, Brain, Zap, Layers,
    Filter, Download, Share2, Briefcase, HeartPulse, Stethoscope
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
    LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    ComposedChart, Scatter
} from 'recharts';

// --- Constants & Mock Data ---
const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

const TABS = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'clinical', label: 'Clinical', icon: HeartPulse },
    { id: 'operational', label: 'Operational', icon: Briefcase },
    { id: 'ai', label: 'AI Insights', icon: Brain },
];

const BusinessIntelligence = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [timeRange, setTimeRange] = useState('month');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    // --- Mock Data Generators (Simulating complex backend) ---
    const revenueData = useMemo(() => [
        { name: 'Week 1', revenue: 120, cost: 80, profit: 40, predicted: 115 },
        { name: 'Week 2', revenue: 145, cost: 90, profit: 55, predicted: 140 },
        { name: 'Week 3', revenue: 135, cost: 85, profit: 50, predicted: 138 },
        { name: 'Week 4', revenue: 160, cost: 95, profit: 65, predicted: 155 },
    ], []);

    const demographicsData = [
        { name: '0-18', value: 15 }, { name: '19-35', value: 30 },
        { name: '36-50', value: 25 }, { name: '50+', value: 30 },
    ];

    const radarData = [
        { subject: 'Efficiency', A: 120, B: 110, fullMark: 150 },
        { subject: 'Satisfaction', A: 98, B: 130, fullMark: 150 },
        { subject: 'Speed', A: 86, B: 130, fullMark: 150 },
        { subject: 'Quality', A: 99, B: 100, fullMark: 150 },
        { subject: 'Cost', A: 85, B: 90, fullMark: 150 },
        { subject: 'Volume', A: 65, B: 85, fullMark: 150 },
    ];

    const aiPredictions = [
        { date: 'Mon', actual: 45, predicted: 48, confidence: 95 },
        { date: 'Tue', actual: 52, predicted: 50, confidence: 92 },
        { date: 'Wed', actual: 49, predicted: 55, confidence: 88 },
        { date: 'Thu', actual: 60, predicted: 62, confidence: 90 },
        { date: 'Fri', actual: 58, predicted: 58, confidence: 96 },
        { date: 'Sat', actual: 35, predicted: 40, confidence: 85 },
        { date: 'Sun', actual: 30, predicted: 32, confidence: 89 },
    ];

    useEffect(() => {
        // Simulate loading
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 800);
    }, [activeTab, timeRange, departmentFilter]);

    // --- Components ---

    const KPICard = ({ title, value, trend, icon: Icon, color, subValue }) => (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass-panel p-6 rounded-[24px] border border-white/20 relative overflow-hidden group"
        >
            <div className={`absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-all duration-500 scale-150 text-${color}-500`}>
                <Icon size={120} />
            </div>
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-500`}>
                        <Icon size={24} />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 text-sm font-bold ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
                <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</h4>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{value}</h3>
                    {subValue && <p className="text-xs text-gray-500 font-medium">{subValue}</p>}
                </div>
            </div>
        </motion.div>
    );

    const ChartCard = ({ title, children, height = "h-[400px]", fullWidth = false }) => (
        <div className={`glass-panel p-6 rounded-[32px] border border-white/20 flex flex-col ${height} ${fullWidth ? 'col-span-full' : ''}`}>
            <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
                    {title}
                </h4>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-purple-600">
                    <Download size={18} />
                </button>
            </div>
            <div className="flex-1 w-full min-h-0 relative">
                {children}
            </div>
        </div>
    );

    // --- Tab Content ---

    const OverviewTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Total Revenue" value="Rp 5.2B" trend={12.5} icon={DollarSign} color="emerald" subValue="Op. Income: Rp 1.8B" />
                <KPICard title="Patient Visits" value="12,450" trend={5.2} icon={Users} color="blue" subValue="Avg. Daily: 415" />
                <KPICard title="Bed Occupancy" value="82%" trend={-1.5} icon={Activity} color="amber" subValue="Available: 45 Beds" />
                <KPICard title="Satisfaction" value="4.8/5.0" trend={0.8} icon={HeartPulse} color="purple" subValue="NPS Score: 78" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ChartCard title="Revenue & Traffic Trends">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} tick={{ fill: '#9CA3AF' }} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Area yAxisId="left" type="monotone" dataKey="revenue" fill="url(#colorRev)" stroke="#8B5CF6" strokeWidth={3} name="Revenue (M)" />
                                <Line yAxisId="right" type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} name="Profit (M)" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
                <div>
                    <ChartCard title="Patient Demographics">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={demographicsData}
                                    cx="50%" cy="50%"
                                    innerRadius={80} outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {demographicsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                            <div className="text-center">
                                <span className="block text-3xl font-black text-gray-800 dark:text-white">12k</span>
                                <span className="text-xs text-gray-400 font-bold uppercase">Total</span>
                            </div>
                        </div>
                    </ChartCard>
                </div>
            </div>
        </div>
    );

    const FinancialTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title="Net Profit Margin" value="35%" trend={2.4} icon={Target} color="emerald" />
                <KPICard title="Op. Expenses" value="Rp 3.1B" trend={-0.5} icon={TrendingDown} color="red" />
                <KPICard title="Rev. Per Patient" value="Rp 425k" trend={5.1} icon={Users} color="blue" />
            </div>
            <ChartCard title="Revenue vs Cost Analysis" fullWidth height="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData} barSize={40}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} tick={{ fill: '#9CA3AF' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                        <Legend />
                        <Bar dataKey="revenue" name="Total Revenue" stackId="a" fill="#8B5CF6" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="cost" name="Operational Cost" stackId="a" fill="#F59E0B" radius={[10, 10, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
        </div>
    );

    const AiTab = () => (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-lg shadow-indigo-900/20">
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
                        <Brain className="animate-pulse" />
                        AI Predictive Insights
                    </h3>
                    <p className="text-white/80 max-w-2xl">
                        Based on historical data and seasonal trends, our models predict a <strong>15% surge</strong> in patient volume next week.
                        Staffing augmentation is recommended for the Emergency Department.
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Patient Surge Prediction (7 Days)">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={aiPredictions}>
                            <defs>
                                <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                            <Area type="monotone" dataKey="predicted" stroke="#6366F1" strokeWidth={3} strokeDasharray="5 5" fill="none" name="Predicted" />
                            <Area type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={3} fill="url(#colorPred)" name="Historical Trend" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                <div className="glass-panel p-6 rounded-[32px] border border-white/20">
                    <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Zap className="text-amber-500" />
                        Actionable Recommendations
                    </h4>
                    <div className="space-y-4">
                        {[
                            { title: 'Increase Nurse Staffing (IGD)', w: 'High', desc: 'Predicted influx of 20+ patients on Friday evening.' },
                            { title: 'Inventory Alert: Antibiotics', w: 'Medium', desc: 'Stock levels projected to dip below safety threshold in 3 days.' },
                            { title: 'Optimize OT Schedule', w: 'Low', desc: 'Monday morning slots have 40% higher cancellation probability.' },
                        ].map((item, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-gray-100 dark:border-white/5 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-bold text-gray-800 dark:text-white group-hover:text-purple-500 transition-colors">{item.title}</h5>
                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${item.w === 'High' ? 'bg-red-100 text-red-600' :
                                            item.w === 'Medium' ? 'bg-amber-100 text-amber-600' :
                                                'bg-blue-100 text-blue-600'
                                        }`}>{item.w} Priority</span>
                                </div>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // --- Main Render ---

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Header Controls */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300
                                ${activeTab === tab.id
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/5'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-white/10 p-1">
                        {['week', 'month', 'quarter', 'year'].map((r) => (
                            <button
                                key={r}
                                onClick={() => setTimeRange(r)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${timeRange === r ? 'bg-gray-100 dark:bg-white/10 text-purple-600' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >{r}</button>
                        ))}
                    </div>
                    <button className="p-2.5 bg-white dark:bg-gray-800 text-gray-500 hover:text-purple-600 rounded-xl border border-gray-200 dark:border-white/10 transition-all">
                        <Filter size={20} />
                    </button>
                    <button className="p-2.5 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-500/30 hover:bg-purple-700 transition-all">
                        <Share2 size={20} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="min-h-[500px]"
                >
                    {isLoading ? (
                        <div className="h-[400px] flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                                <p className="text-gray-400 font-medium animate-pulse">Computing Analytics...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'overview' && <OverviewTab />}
                            {activeTab === 'financial' && <FinancialTab />}
                            {activeTab === 'clinical' && <OverviewTab />} {/* Reusing for demo, ideally has unique content */}
                            {activeTab === 'operational' && <OverviewTab />} {/* Reusing for demo, ideally has unique content */}
                            {activeTab === 'ai' && <AiTab />}
                        </>
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};

export default BusinessIntelligence;
