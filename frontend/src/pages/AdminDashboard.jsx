import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useQueueStore from '../store/useQueueStore';
import DoctorCard from '../components/DoctorCard';
import ScheduleCalendar from '../components/ScheduleCalendar';
import DoctorLeaveCalendar from '../components/DoctorLeaveCalendar';
import ThemeToggle from '../components/ThemeToggle';
import UserManagement from '../components/UserManagement';
import { LayoutGrid, RefreshCw, Activity, Database, Monitor, Download, Calendar as ScheduleCalendarIcon, Search, Bell, User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const { doctors, initialize, generateQuota, isConnected } = useQueueStore();
    const [analytics, setAnalytics] = useState({ totalPatients: 0, pieChartData: [], barChartData: [] });
    const [activeTab, setActiveTab] = useState('dashboard');
    const [leaves, setLeaves] = useState([]);

    useEffect(() => {
        initialize();
        fetchAnalytics();
        fetchLeaves();
    }, [initialize]);

    const fetchLeaves = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/doctor-leaves`);
            setLeaves(res.data);
        } catch (error) {
            console.error('Failed to fetch leaves', error);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/analytics/daily`);
            setAnalytics(res.data);
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        }
    };

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Hour,Patients\n"
            + analytics.barChartData.map(e => `${e.hour},${e.patients}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "daily_report.csv");
        document.body.appendChild(link);
        link.click();
    };

    const scrollToSection = (id) => {
        setActiveTab(id);
    };

    const isSameDay = (d1, d2) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    return (
        <div className="min-h-screen bg-theme-bg flex font-sans text-theme-text">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 h-screen sticky top-0 flex flex-col p-6 hidden lg:flex z-20 shadow-sm">
                <div className="flex items-center gap-3 mb-12 px-2">
                    <div className="w-10 h-10 bg-salm-gradient rounded-full flex items-center justify-center shadow-lg shadow-salm-purple/30">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <span className="text-xl font-bold text-theme-text tracking-tight">SiMed.</span>
                </div>

                <nav className="space-y-2 flex-1">
                    <button
                        onClick={() => scrollToSection('dashboard')}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-left font-medium ${activeTab === 'dashboard' ? 'bg-salm-gradient text-white shadow-lg shadow-salm-purple/30' : 'text-theme-gray dark:text-gray-400 hover:bg-salm-light-pink/20 dark:hover:bg-salm-light-pink/10 hover:text-salm-pink'}`}
                    >
                        <LayoutGrid className="w-5 h-5" />
                        Dashboard
                    </button>
                    <button
                        onClick={() => scrollToSection('schedule')}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-left font-medium ${activeTab === 'schedule' ? 'bg-salm-gradient text-white shadow-lg shadow-salm-purple/30' : 'text-theme-gray dark:text-gray-400 hover:bg-salm-light-pink/20 dark:hover:bg-salm-light-pink/10 hover:text-salm-pink'}`}
                    >
                        <ScheduleCalendarIcon className="w-5 h-5" />
                        Schedule
                    </button>
                    <button
                        onClick={() => scrollToSection('live-status')}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-left font-medium ${activeTab === 'live-status' ? 'bg-salm-gradient text-white shadow-lg shadow-salm-purple/30' : 'text-theme-gray dark:text-gray-400 hover:bg-salm-light-pink/20 dark:hover:bg-salm-light-pink/10 hover:text-salm-pink'}`}
                    >
                        <Activity className="w-5 h-5" />
                        Live Status
                    </button>
                    <button
                        onClick={() => setActiveTab('leave-calendar')}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-left font-medium ${activeTab === 'leave-calendar' ? 'bg-salm-gradient text-white shadow-lg shadow-salm-purple/30' : 'text-theme-gray dark:text-gray-400 hover:bg-salm-light-pink/20 dark:hover:bg-salm-light-pink/10 hover:text-salm-pink'}`}
                    >
                        <ScheduleCalendarIcon className="w-5 h-5" />
                        Calendar
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-left font-medium ${activeTab === 'users' ? 'bg-salm-gradient text-white shadow-lg shadow-salm-purple/30' : 'text-theme-gray dark:text-gray-400 hover:bg-salm-light-pink/20 dark:hover:bg-salm-light-pink/10 hover:text-salm-pink'}`}
                    >
                        <User className="w-5 h-5" />
                        User Management
                    </button>
                </nav>

                <div className="mt-auto pt-6 border-t border-gray-50 dark:border-gray-700 space-y-2">
                    <Link to="/admin/master-data" className="flex items-center gap-4 px-4 py-3 rounded-2xl text-theme-gray hover:bg-salm-light-pink/20 hover:text-salm-pink transition-all">
                        <Database className="w-5 h-5" />
                        Master Data
                    </Link>
                    <Link to="/admin/counter" className="flex items-center gap-4 px-4 py-3 rounded-2xl text-theme-gray dark:text-gray-400 hover:bg-salm-light-pink/20 dark:hover:bg-salm-light-pink/10 hover:text-salm-pink transition-all">
                        <Monitor className="w-5 h-5" />
                        Counter Staff
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 lg:p-10 h-screen overflow-hidden flex flex-col">
                <div className="max-w-[1600px] mx-auto w-full flex-shrink-0 mb-6">
                    {/* Header */}
                    <header className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-theme-text">
                                {activeTab === 'leave-calendar' ? 'Doctor Leaves' : 'Dashboard'}
                            </h1>
                            <p className="text-sm text-theme-gray mt-1">Welcome back, Admin!</p>
                        </div>

                        <div className="flex items-center gap-6">
                            {/* Search Bar */}
                            <div className="hidden md:flex items-center bg-white dark:bg-gray-800 px-4 py-2.5 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm w-80">
                                <Search className="w-5 h-5 text-gray-400 mr-3" />
                                <input type="text" placeholder="Search here..." className="bg-transparent border-none outline-none text-sm w-full text-theme-text placeholder-gray-400" />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4">
                                <button className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all relative">
                                    <Bell className="w-5 h-5 text-theme-text" />
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                                </button>
                                <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                                    <div className="w-10 h-10 rounded-full bg-salm-light-blue/20 flex items-center justify-center">
                                        <User className="w-5 h-5 text-salm-blue" />
                                    </div>
                                    <div className="hidden md:block">
                                        <p className="text-sm font-bold text-theme-text">Admin User</p>
                                        <p className="text-xs text-theme-gray dark:text-gray-400">Hospital Staff</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                </div>

                {/* Content Area */}
                <div className="flex-1 w-full overflow-y-auto scroll-smooth custom-scrollbar">
                    {activeTab === 'leave-calendar' && (
                        <div className="max-w-[1600px] mx-auto h-full flex flex-col min-h-[600px] bg-gray-50 dark:bg-gray-900 rounded-2xl">
                            <DoctorLeaveCalendar />
                        </div>
                    )}

                    {activeTab === 'dashboard' && (
                        <div className="max-w-[1600px] mx-auto pb-10 fade-in animate-in duration-300">
                            <div id="dashboard">
                                {/* Banner */}
                                <div className="w-full bg-salm-gradient rounded-[30px] p-8 mb-10 relative overflow-hidden shadow-xl shadow-salm-purple/20 flex items-center justify-between">
                                    <div className="relative z-10 text-white max-w-lg">
                                        <h2 className="text-3xl font-bold mb-2">Hospital Queue System</h2>
                                        <p className="text-white/80 mb-6">Manage patient flows and doctor schedules efficiently.</p>
                                        <button
                                            onClick={() => generateQuota()}
                                            className="bg-white text-salm-purple px-6 py-3 rounded-xl font-bold hover:bg-salm-light-pink/20 transition-all shadow-lg flex items-center gap-2"
                                        >
                                            <RefreshCw className="w-5 h-5" />
                                            Generate Quota
                                        </button>
                                    </div>
                                    {/* Decorative Circles */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                                    <div className="absolute bottom-0 right-20 w-32 h-32 bg-white/10 rounded-full mb-10"></div>
                                </div>

                                {/* Analytics Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                                    {/* Stats Cards */}
                                    <div className="space-y-6">
                                        <div className="card-soft p-6 flex items-center justify-between group hover:border-theme-purple/30">
                                            <div>
                                                <div className="w-12 h-12 bg-theme-orange/10 rounded-full flex items-center justify-center text-theme-orange mb-4 group-hover:scale-110 transition-transform">
                                                    <Activity className="w-6 h-6" />
                                                </div>
                                                <p className="text-3xl font-bold text-theme-text mb-1">
                                                    {analytics.totalPatients}
                                                </p>
                                                <p className="text-sm text-theme-gray font-medium">Total Patients Today</p>
                                            </div>
                                            <div className="h-16 w-16 rounded-full border-4 border-theme-orange/20 border-t-theme-orange flex items-center justify-center text-xs font-bold text-theme-orange">
                                                75%
                                            </div>
                                        </div>

                                        <div className="card-soft p-6 flex items-center justify-between group hover:border-theme-purple/30">
                                            <div>
                                                <div className="w-12 h-12 bg-theme-purple/10 rounded-full flex items-center justify-center text-theme-purple mb-4 group-hover:scale-110 transition-transform">
                                                    <LayoutGrid className="w-6 h-6" />
                                                </div>
                                                <p className="text-3xl font-bold text-theme-text mb-1">
                                                    {doctors.filter(d => d.quota?.status === 'OPEN').length}
                                                </p>
                                                <p className="text-sm text-theme-gray font-medium">Active Doctors</p>
                                            </div>
                                            <div className="h-16 w-16 rounded-full border-4 border-theme-purple/20 border-t-theme-purple flex items-center justify-center text-xs font-bold text-theme-purple">
                                                {doctors.length > 0 ? Math.round((doctors.filter(d => d.quota?.status === 'OPEN').length / doctors.length) * 100) : 0}%
                                            </div>
                                        </div>
                                    </div>

                                    {/* Charts */}
                                    <div className="card-soft p-8 lg:col-span-2 flex flex-col">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-bold text-theme-text">Patient Arrival Statistics</h3>
                                            <div className="flex gap-2">
                                                <span className="flex items-center gap-1 text-xs text-theme-gray"><span className="w-2 h-2 rounded-full bg-theme-purple"></span> Patients</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-h-[250px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={analytics.barChartData} barSize={40}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--theme-border)" />
                                                    <XAxis dataKey="hour" stroke="#A0A0A0" axisLine={false} tickLine={false} dy={10} />
                                                    <YAxis stroke="#A0A0A0" axisLine={false} tickLine={false} dx={-10} />
                                                    <Tooltip
                                                        cursor={{ fill: 'var(--theme-bg)' }}
                                                        contentStyle={{ backgroundColor: 'var(--theme-card)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', color: 'var(--theme-text)' }}
                                                    />
                                                    <Bar dataKey="patients" fill="#7B61FF" radius={[10, 10, 10, 10]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="max-w-[1600px] mx-auto pb-10 fade-in animate-in duration-300">
                            <div className="mb-10">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-theme-text">Weekly Schedule</h2>
                                </div>
                                <div className="card-soft p-8">
                                    <ScheduleCalendar />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'live-status' && (
                        <div className="max-w-[1600px] mx-auto pb-10 fade-in animate-in duration-300">
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-theme-text">Live Doctor Status</h2>
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors border ${isConnected ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800'}`}>
                                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                        {isConnected ? 'System Online' : 'System Offline'}
                                    </div>
                                </div>

                                {/* Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                                    {doctors.filter(doctor => {
                                        // Get current day (1=Senin ... 6=Sabtu, 0=Minggu -> 7)
                                        const today = new Date().getDay();
                                        const dbDay = today === 0 ? 7 : today;

                                        // Check if doctor has schedule for today
                                        return doctor.schedules?.some(s => s.day === dbDay);
                                    }).map((doctor) => {
                                        // Check if On Leave
                                        const todayLeave = leaves.find(l => l.doctor_id === doctor.id && isSameDay(new Date(l.date), new Date()));

                                        return (
                                            <DoctorCard
                                                key={doctor.id}
                                                doctor={doctor}
                                                onLeave={!!todayLeave}
                                                leaveReason={todayLeave?.reason || 'Cuti'}
                                            />
                                        );
                                    })}
                                </div>

                                {doctors.filter(d => {
                                    const today = new Date().getDay();
                                    const dbDay = today === 0 ? 7 : today;
                                    return d.schedules?.some(s => s.day === dbDay);
                                }).length === 0 && (
                                        <div className="text-center py-32 card-soft">
                                            <div className="w-24 h-24 bg-theme-bg rounded-full flex items-center justify-center mx-auto mb-6">
                                                <LayoutGrid className="w-10 h-10 text-theme-gray" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-theme-text">No Doctors Available Today</h3>
                                            <p className="text-theme-gray mt-2">There are no doctors scheduled for today.</p>
                                        </div>
                                    )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && <UserManagement />}
                </div>
            </main>
            <ThemeToggle />
        </div>
    );
};

export default AdminDashboard;
