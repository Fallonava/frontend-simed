import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useQueueStore from '../store/useQueueStore';
import DoctorCard from '../components/DoctorCard';
import ScheduleCalendar from '../components/ScheduleCalendar';
import { LayoutGrid, RefreshCw, Activity, Database, Monitor, Download, Calendar as ScheduleCalendarIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2979FF', '#00E676', '#FFD600', '#FF3D00', '#D500F9'];

const AdminDashboard = () => {
    const { doctors, initialize, generateQuota, isConnected } = useQueueStore();
    const [analytics, setAnalytics] = useState({ totalPatients: 0, pieChartData: [], barChartData: [] });

    useEffect(() => {
        initialize();
        fetchAnalytics();
    }, [initialize]);

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/analytics/daily');
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
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-modern-bg flex relative overflow-hidden">
            {/* Background Mesh Gradient */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-modern-blue/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-modern-purple/10 rounded-full blur-[100px]"></div>
            </div>

            {/* Sidebar */}
            <aside className="w-64 bg-modern-card/30 backdrop-blur-xl border-r border-white/5 h-screen sticky top-0 flex flex-col p-6 hidden lg:flex z-20">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-modern-blue to-modern-purple rounded-xl flex items-center justify-center shadow-lg shadow-modern-blue/20">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-modern-text tracking-tight">SiMed</span>
                </div>

                <nav className="space-y-2 flex-1">
                    <button onClick={() => scrollToSection('dashboard')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-modern-text hover:bg-white/5 transition-all text-left font-medium group">
                        <LayoutGrid className="w-5 h-5 text-modern-text-secondary group-hover:text-modern-blue transition-colors" />
                        Dashboard
                    </button>
                    <button onClick={() => scrollToSection('schedule')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-modern-text hover:bg-white/5 transition-all text-left font-medium group">
                        <ScheduleCalendarIcon className="w-5 h-5 text-modern-text-secondary group-hover:text-modern-purple transition-colors" />
                        Jadwal Dokter
                    </button>
                    <button onClick={() => scrollToSection('live-status')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-modern-text hover:bg-white/5 transition-all text-left font-medium group">
                        <Activity className="w-5 h-5 text-modern-text-secondary group-hover:text-modern-green transition-colors" />
                        Live Status
                    </button>
                </nav>

                <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
                    <Link to="/admin/master-data" className="flex items-center gap-3 px-4 py-3 rounded-xl text-modern-text-secondary hover:text-modern-text hover:bg-white/5 transition-all">
                        <Database className="w-5 h-5" />
                        Master Data
                    </Link>
                    <Link to="/admin/counter" className="flex items-center gap-3 px-4 py-3 rounded-xl text-modern-text-secondary hover:text-modern-text hover:bg-white/5 transition-all">
                        <Monitor className="w-5 h-5" />
                        Counter Staff
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto h-screen scroll-smooth">
                <div className="max-w-[1600px] mx-auto" id="dashboard">
                    {/* Header */}
                    {/* Floating Glass Navbar */}
                    <header className="sticky top-0 z-30 mb-8 -mx-6 px-6 py-4 bg-modern-bg/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between transition-all duration-300">
                        <div>
                            <h1 className="text-2xl font-bold text-modern-text tracking-tight">Dashboard</h1>
                            <p className="text-sm text-modern-text-secondary">Overview of hospital queues today</p>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* System Status Pill */}
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${isConnected ? 'bg-modern-green/10 text-modern-green border-modern-green/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-modern-green animate-pulse shadow-[0_0_8px_rgba(0,230,118,0.5)]' : 'bg-red-500'}`}></div>
                                {isConnected ? 'Online' : 'Offline'}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 bg-modern-card/50 p-1 rounded-full border border-white/10 shadow-sm">
                                <button
                                    onClick={() => generateQuota()}
                                    className="px-4 py-2 rounded-full text-sm font-semibold bg-modern-text text-modern-bg hover:bg-white transition-all shadow-lg shadow-white/5 flex items-center gap-2"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    <span>Generate Quota</span>
                                </button>
                            </div>

                            {/* User Profile (Placeholder) */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-modern-blue to-modern-purple p-[2px] shadow-lg shadow-modern-blue/20 cursor-pointer hover:scale-105 transition-transform">
                                <div className="w-full h-full rounded-full bg-modern-card flex items-center justify-center overflow-hidden">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Analytics Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                        {/* Stats Cards */}
                        <div className="space-y-6">
                            <div className="glass-card p-6 rounded-3xl flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-modern-text-secondary font-medium mb-1">Total Patients Today</p>
                                    <p className="text-3xl font-bold text-modern-text">
                                        {analytics.totalPatients}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-modern-blue/10 rounded-full flex items-center justify-center text-modern-blue border border-modern-blue/20">
                                    <Activity className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="glass-card p-6 rounded-3xl flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-modern-text-secondary font-medium mb-1">Active Doctors</p>
                                    <p className="text-3xl font-bold text-modern-text">
                                        {doctors.filter(d => d.quota?.status === 'OPEN').length}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-modern-green/10 rounded-full flex items-center justify-center text-modern-green border border-modern-green/20">
                                    <LayoutGrid className="w-6 h-6" />
                                </div>
                            </div>
                            <button
                                onClick={handleExport}
                                className="w-full bg-modern-card border border-white/10 p-4 rounded-2xl flex items-center justify-center gap-2 text-modern-text font-semibold hover:bg-white/5 transition"
                            >
                                <Download size={20} />
                                Export Daily Report
                            </button>
                        </div>

                        {/* Charts */}
                        <div className="glass-card p-6 rounded-3xl lg:col-span-2 flex flex-col">
                            <h3 className="text-lg font-bold text-modern-text mb-4">Patient Arrival (Hourly)</h3>
                            <div className="flex-1 min-h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.barChartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="hour" stroke="#A0A0B0" />
                                        <YAxis stroke="#A0A0B0" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#25253A', borderColor: 'rgba(255,255,255,0.1)', color: '#FFF' }}
                                            itemStyle={{ color: '#FFF' }}
                                        />
                                        <Bar dataKey="patients" fill="#2979FF" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Doctor Schedule Section */}
                    <div className="mb-10" id="schedule">
                        <h2 className="text-2xl font-bold text-modern-text mb-6">Jadwal Dokter</h2>
                        <ScheduleCalendar />
                    </div>

                    <div id="live-status">
                        <h2 className="text-2xl font-bold text-modern-text mb-6">Live Status</h2>

                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {doctors.map((doctor) => (
                                <DoctorCard key={doctor.id} doctor={doctor} />
                            ))}
                        </div>

                        {doctors.length === 0 && (
                            <div className="text-center py-32">
                                <div className="w-24 h-24 bg-modern-card rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                                    <LayoutGrid className="w-10 h-10 text-modern-text-secondary" />
                                </div>
                                <h3 className="text-xl font-semibold text-modern-text">No Data Available</h3>
                                <p className="text-modern-text-secondary mt-2">Generate daily quotas to start managing queues.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
