import React, { useEffect, useState, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useQueueStore from '../store/useQueueStore';
import DoctorCard from '../components/DoctorCard';
import ScheduleCalendar from '../components/ScheduleCalendar';
import DoctorLeaveCalendar from '../components/DoctorLeaveCalendar';
import ThemeToggle from '../components/ThemeToggle';
import UserManagement from '../components/UserManagement';
import { LayoutGrid, RefreshCw, Activity, Database, Monitor, Download, Calendar as ScheduleCalendarIcon, Search, Bell, User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import FallonavaLogo from '../components/FallonavaLogo';
import PageLoader from '../components/PageLoader';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// --- Sub Components for Performance ---
const LiveStatusSection = memo(({ doctors, leaves, isConnected }) => {
    // Helper
    const isSameDay = (d1, d2) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    // Filter doctors for today
    const availableDoctors = useMemo(() => {
        const today = new Date().getDay();
        const dbDay = today === 0 ? 7 : today;
        return doctors.filter(doctor => doctor.schedules?.some(s => s.day === dbDay));
    }, [doctors]);

    return (
        <div className="max-w-[1600px] mx-auto pb-10 fade-in animate-in duration-300">
            <div>
                <div className="flex items-center justify-end mb-6">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors border ${isConnected ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800'}`}>
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        {isConnected ? 'System Online' : 'System Offline'}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {availableDoctors.map((doctor) => {
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

                {availableDoctors.length === 0 && (
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
    );
});

const AdminDashboard = () => {
    const { doctors, initialize, generateQuota, isConnected } = useQueueStore();
    const [analytics, setAnalytics] = useState({ totalPatients: 0, pieChartData: [], barChartData: [], queueStatusData: [] });
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [leaves, setLeaves] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        initialize();
        fetchAnalytics();
        fetchLeaves();
    }, [initialize, selectedDate]); // Re-fetch when date changes

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
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/analytics/daily?date=${selectedDate}`);
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

    return (
        <div className="min-h-screen bg-theme-bg flex font-sans text-theme-text relative">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 z-30 flex items-center px-4 justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <FallonavaLogo className="w-8 h-8 rounded-lg shadow-lg shadow-salm-purple/20" />
                    <span className="text-lg font-bold text-theme-text">Fallonava.</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-theme-text hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
            </div>

            {/* Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 
                h-screen fixed lg:sticky top-0 left-0 
                flex flex-col p-6 
                z-40 transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex items-center gap-3 mb-12 px-2">
                    <FallonavaLogo className="w-10 h-10 rounded-xl shadow-lg shadow-salm-purple/20" />
                    <span className="text-xl font-bold text-theme-text tracking-tight">Fallonava.</span>
                </div>

                <nav className="space-y-2 flex-1">
                    <button
                        onClick={() => scrollToSection('dashboard')}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left font-medium group relative overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.95] ${activeTab === 'dashboard' ? 'bg-salm-gradient text-white shadow-xl shadow-salm-purple/30 ring-1 ring-white/20' : 'text-theme-gray dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700/50 hover:shadow-lg hover:shadow-purple-500/5'}`}
                    >
                        <LayoutGrid className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${activeTab === 'dashboard' ? 'text-white' : 'text-gray-400 group-hover:text-salm-purple'}`} />
                        <span className="relative z-10">Dashboard</span>
                    </button>
                    <button
                        onClick={() => scrollToSection('schedule')}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left font-medium group relative overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.95] ${activeTab === 'schedule' ? 'bg-salm-gradient text-white shadow-xl shadow-salm-purple/30 ring-1 ring-white/20' : 'text-theme-gray dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700/50 hover:shadow-lg hover:shadow-purple-500/5'}`}
                    >
                        <ScheduleCalendarIcon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${activeTab === 'schedule' ? 'text-white' : 'text-gray-400 group-hover:text-salm-purple'}`} />
                        <span className="relative z-10">Schedule</span>
                    </button>
                    <button
                        onClick={() => scrollToSection('live-status')}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left font-medium group relative overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.95] ${activeTab === 'live-status' ? 'bg-salm-gradient text-white shadow-xl shadow-salm-purple/30 ring-1 ring-white/20' : 'text-theme-gray dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700/50 hover:shadow-lg hover:shadow-purple-500/5'}`}
                    >
                        <Activity className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${activeTab === 'live-status' ? 'text-white' : 'text-gray-400 group-hover:text-salm-purple'}`} />
                        <span className="relative z-10">Live Status</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('leave-calendar')}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left font-medium group relative overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.95] ${activeTab === 'leave-calendar' ? 'bg-salm-gradient text-white shadow-xl shadow-salm-purple/30 ring-1 ring-white/20' : 'text-theme-gray dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700/50 hover:shadow-lg hover:shadow-purple-500/5'}`}
                    >
                        <ScheduleCalendarIcon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${activeTab === 'leave-calendar' ? 'text-white' : 'text-gray-400 group-hover:text-salm-purple'}`} />
                        <span className="relative z-10">Calendar</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left font-medium group relative overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.95] ${activeTab === 'users' ? 'bg-salm-gradient text-white shadow-xl shadow-salm-purple/30 ring-1 ring-white/20' : 'text-theme-gray dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700/50 hover:shadow-lg hover:shadow-purple-500/5'}`}
                    >
                        <User className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${activeTab === 'users' ? 'text-white' : 'text-gray-400 group-hover:text-salm-purple'}`} />
                        <span className="relative z-10">User Management</span>
                    </button>
                    <button
                        onClick={() => window.open('/public/schedule', '_blank')}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left font-medium group relative overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.95] text-theme-gray dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700/50 hover:shadow-lg hover:shadow-purple-500/5`}
                    >
                        <Monitor className="w-5 h-5 text-gray-400 group-hover:text-salm-purple transition-colors" />
                        <span className="relative z-10">Public Display</span>
                    </button>
                </nav>

                <div className="mt-auto pt-6 border-t border-gray-50 dark:border-gray-700 space-y-2">
                    <Link to="/admin/master-data" className="flex items-center gap-4 px-4 py-3 rounded-2xl text-theme-gray dark:text-gray-400 group relative overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.95] hover:bg-white dark:hover:bg-gray-700/50 hover:shadow-lg hover:shadow-purple-500/5">
                        <Database className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 text-gray-400 group-hover:text-salm-purple" />
                        <span className="relative z-10 font-medium">Master Data</span>
                    </Link>

                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 lg:p-10 h-screen overflow-hidden flex flex-col mt-16 lg:mt-0">
                <div className="max-w-[1600px] mx-auto w-full flex-shrink-0 mb-6">
                    {/* Header */}
                    <header className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-theme-text">
                                {activeTab === 'schedule' ? 'Jadwal' : activeTab === 'leave-calendar' ? 'Doctor Leaves' : activeTab === 'live-status' ? 'Live Doctor Status' : activeTab === 'users' ? 'User Management' : 'Dashboard'}
                            </h1>
                            <p className="text-sm text-theme-gray mt-1">
                                {activeTab === 'schedule' ? 'Dokter & Spesialis' : activeTab === 'live-status' ? 'Real-time monitoring' : activeTab === 'users' ? 'Manage system access privileges and user roles' : 'Welcome back, Admin!'}
                            </p>
                        </div>

                        <div className="flex items-center gap-6">
                            {/* Search Bar & Date Filter - Only on Dashboard */}
                            {activeTab === 'dashboard' && (
                                <>
                                    <div className="hidden md:flex items-center bg-white dark:bg-gray-800 px-4 py-2.5 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm w-80">
                                        <Search className="w-5 h-5 text-gray-400 mr-3" />
                                        <input type="text" placeholder="Search here..." className="bg-transparent border-none outline-none text-sm w-full text-theme-text placeholder-gray-400" />
                                    </div>

                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-theme-text rounded-full px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-salm-pink/50 transition-all font-medium text-sm"
                                    />
                                </>
                            )}

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
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 mb-10">
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

                                    {/* Charts Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 xl:col-span-2">
                                        {/* Poliklinik Distribution */}
                                        <div className="card-soft p-6 flex flex-col">
                                            <h3 className="text-lg font-bold text-theme-text mb-4">Patients by Poliklinik</h3>
                                            <div className="w-full h-[300px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={analytics.pieChartData}
                                                            cx="50%"
                                                            cy="50%"
                                                            outerRadius={65}
                                                            fill="#8884d8"
                                                            dataKey="value"
                                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                        >
                                                            {analytics.pieChartData?.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip contentStyle={{ backgroundColor: 'var(--theme-card)', borderRadius: '12px', border: 'none', color: 'var(--theme-text)' }} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Queue Status */}
                                        <div className="card-soft p-6 flex flex-col">
                                            <h3 className="text-lg font-bold text-theme-text mb-4">Queue Status Overview</h3>
                                            <div className="w-full h-[300px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={analytics.queueStatusData || []}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={45}
                                                            outerRadius={65}
                                                            fill="#82ca9d"
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                            label={({ name, value }) => `${name}: ${value}`}
                                                        >
                                                            {analytics.queueStatusData?.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip contentStyle={{ backgroundColor: 'var(--theme-card)', borderRadius: '12px', border: 'none', color: 'var(--theme-text)' }} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bar Chart Section */}
                                    <div className="card-soft p-8 lg:col-span-2 flex flex-col">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-bold text-theme-text">Hourly Traffic</h3>
                                            <div className="flex gap-2">
                                                <span className="flex items-center gap-1 text-xs text-theme-gray"><span className="w-2 h-2 rounded-full bg-theme-purple"></span> Patients</span>
                                            </div>
                                        </div>
                                        <div className="w-full h-[300px]">
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
                        <div className="max-w-[1600px] mx-auto h-full fade-in animate-in duration-300 pb-6">
                            <ScheduleCalendar />
                        </div>
                    )}

                    {activeTab === 'live-status' && (
                        <LiveStatusSection
                            doctors={doctors}
                            leaves={leaves}
                            isConnected={isConnected}
                        />
                    )}

                    {activeTab === 'users' && <UserManagement />}
                </div>
            </main>
            <ThemeToggle />
        </div>
    );
};

export default AdminDashboard;
