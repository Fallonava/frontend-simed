import React, { useEffect, useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LayoutGrid, RefreshCw, Activity, Database, Monitor, Download, Calendar as ScheduleCalendarIcon, Search, Bell, User, ExternalLink, LogOut, Shield, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import useQueueStore from '../store/useQueueStore';
import axios from 'axios';
import DoctorCard from '../components/DoctorCard';
import ScheduleCalendar from '../components/ScheduleCalendar';
import DoctorLeaveCalendar from '../components/DoctorLeaveCalendar';
import ThemeToggle from '../components/ThemeToggle';
import BusinessIntelligence from '../components/BusinessIntelligence';
import UserManagement from '../components/UserManagement';
import ModernHeader from '../components/ModernHeader';
import PageWrapper from '../components/PageWrapper';
import PageLoader from '../components/PageLoader';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// --- Sub Components ---
const LiveStatusSection = memo(({ doctors, leaves, isConnected }) => {
    const isSameDay = (d1, d2) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
    const availableDoctors = useMemo(() => {
        const today = new Date().getDay();
        const dbDay = today === 0 ? 7 : today;
        return doctors.filter(doctor => doctor.schedules?.some(s => s.day === dbDay));
    }, [doctors]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
            <div className="flex items-center justify-end mb-6">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors border ${isConnected ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800'}`}>
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    {isConnected ? 'System Online' : 'System Offline'}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {availableDoctors.map((doctor) => {
                    const todayLeave = leaves.find(l => l.doctor_id === doctor.id && isSameDay(new Date(l.date), new Date()));
                    return <DoctorCard key={doctor.id} doctor={doctor} onLeave={!!todayLeave} leaveReason={todayLeave?.reason || 'Cuti'} />;
                })}
            </div>
            {availableDoctors.length === 0 && (
                <div className="text-center py-32 rounded-[32px] bg-white dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 font-bold">No Doctors Scheduled Today</p>
                </div>
            )}
        </motion.div>
    );
});

const AdminDashboard = () => {
    const { doctors, initialize, generateQuota, isConnected } = useQueueStore();
    const [analytics, setAnalytics] = useState({ totalPatients: 0, pieChartData: [], barChartData: [], queueStatusData: [] });
    const [activeTab, setActiveTab] = useState('bi');
    const [leaves, setLeaves] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            await initialize();
            await fetchLeaves();
            await fetchAnalytics();
            setLoading(false);
        };
        init();
    }, [initialize, selectedDate]);

    const fetchLeaves = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/doctor-leaves`);
            setLeaves(res.data);
        } catch (error) { console.error(error); }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/analytics/daily?date=${selectedDate}`);
            setAnalytics(res.data);
        } catch (error) { console.error(error); }
    };

    const tabs = [
        { id: 'dashboard', label: 'Overview', icon: LayoutGrid },
        { id: 'bi', label: 'Business Intelligence', icon: PieChartIcon },
        { id: 'live-status', label: 'Live Status', icon: Activity },
        { id: 'schedule', label: 'Schedules', icon: ScheduleCalendarIcon },
        { id: 'leave-calendar', label: 'Doctor Leaves', icon: ScheduleCalendarIcon },
        { id: 'users', label: 'User Mgmt', icon: User },
    ];

    if (loading) return <PageLoader />;

    return (
        <PageWrapper title="Executive Dashboard">
            <ModernHeader
                title="Executive Dashboard"
                subtitle="Hospital Operations Command Center"
            >
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-200/50 dark:bg-gray-800/50 backdrop-blur-md p-1 rounded-xl border border-gray-200 dark:border-white/10">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-300 z-10
                                    ${activeTab === tab.id
                                        ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-300 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                            >
                                <tab.icon size={16} />
                                <span className="hidden md:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                    <Link to="/admin/master-data" className="p-2.5 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-xl border border-gray-200 dark:border-white/10 hover:shadow-lg transition-all" title="Master Data">
                        <Database size={20} />
                    </Link>
                </div>
            </ModernHeader>

            <div className="p-6 max-w-[1920px] mx-auto min-h-[calc(100vh-140px)]">
                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                        >
                            {/* Banner */}
                            <div className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[32px] p-8 mb-10 relative overflow-hidden shadow-xl shadow-purple-900/20 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="relative z-10 text-white max-w-lg">
                                    <h2 className="text-3xl font-bold mb-2">Hospital Operations</h2>
                                    <p className="text-white/80 mb-6 font-medium">Monitoring patient flow and resource allocation.</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => generateQuota()}
                                            className="bg-white/20 backdrop-blur border border-white/30 text-white px-6 py-3 rounded-xl font-bold hover:bg-white hover:text-purple-600 transition-all shadow-lg flex items-center gap-2"
                                        >
                                            <RefreshCw className="w-5 h-5" /> Refresh Quotas
                                        </button>
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="bg-white/20 backdrop-blur border border-white/30 text-white px-4 py-3 rounded-xl font-bold outline-none focus:ring-2 focus:ring-white/50"
                                        />
                                    </div>
                                </div>
                                {/* Decorative */}
                                <div className="hidden md:block">
                                    <div className="w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="glass-panel p-6 rounded-[24px] border border-white/20 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Patients Today</p>
                                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{analytics.totalPatients}</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600">
                                        <Activity size={24} />
                                    </div>
                                </div>
                                <div className="glass-panel p-6 rounded-[24px] border border-white/20 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Doctors</p>
                                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{doctors.filter(d => d.quota?.status === 'OPEN').length}</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
                                        <User size={24} />
                                    </div>
                                </div>
                                <div className="glass-panel p-6 rounded-[24px] border border-white/20 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">System Status</p>
                                        <h3 className="text-xl font-black text-green-600 mt-1">Operational</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600">
                                        <Shield size={24} />
                                    </div>
                                </div>
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="glass-panel p-6 rounded-[32px] border border-white/20 h-[400px]">
                                    <h3 className="text-lg font-bold mb-6">Patient Distribution by Clinic</h3>
                                    <ResponsiveContainer width="100%" height="80%">
                                        <PieChart>
                                            <Pie
                                                data={analytics.pieChartData}
                                                cx="50%" cy="50%"
                                                innerRadius={60} outerRadius={80}
                                                fill="#8884d8" paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {analytics.pieChartData?.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="glass-panel p-6 rounded-[32px] border border-white/20 h-[400px]">
                                    <h3 className="text-lg font-bold mb-6">Hourly Traffic</h3>
                                    <ResponsiveContainer width="100%" height="80%">
                                        <BarChart data={analytics.barChartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                            <XAxis dataKey="hour" axisLine={false} tickLine={false} dy={10} stroke="#888" />
                                            <YAxis axisLine={false} tickLine={false} dx={-10} stroke="#888" />
                                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                            <Bar dataKey="patients" fill="#8884d8" radius={[10, 10, 10, 10]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'live-status' && (
                        <LiveStatusSection doctors={doctors} leaves={leaves} isConnected={isConnected} />
                    )}

                    {activeTab === 'schedule' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[800px] glass-panel rounded-[32px] p-6">
                            <ScheduleCalendar />
                        </motion.div>
                    )}

                    {activeTab === 'leave-calendar' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[800px] glass-panel rounded-[32px] p-6">
                            <DoctorLeaveCalendar />
                        </motion.div>
                    )}

                    {activeTab === 'bi' && <BusinessIntelligence />}
                    {activeTab === 'users' && <UserManagement />}
                </AnimatePresence>
            </div>

            {/* Quick Link to Master Data kept as a FAB or small link in header? 
                ModernHeader has children, maybe add a link there?
                I'll rely on Sidebar in PageWrapper or Main Menu for navigation. 
            */}
        </PageWrapper>
    );
};

export default AdminDashboard;
