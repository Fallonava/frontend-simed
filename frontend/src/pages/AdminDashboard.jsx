import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useQueueStore from '../store/useQueueStore';
import DoctorCard from '../components/DoctorCard';
import { LayoutGrid, RefreshCw, Activity, Database, Monitor, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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

    return (
        <div className="min-h-screen bg-[#F5F5F7] p-6 lg:p-10">
            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-[#1D1D1F] tracking-tight flex items-center gap-3">
                            Dashboard
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg font-medium">Overview of hospital queues today</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-sm">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${isConnected ? 'bg-green-100/50 text-green-700' : 'bg-red-100/50 text-red-700'}`}>
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                            {isConnected ? 'System Online' : 'Offline'}
                        </div>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <Link
                            to="/admin/master-data"
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                            <Database className="w-4 h-4" />
                            Master Data
                        </Link>
                        <Link
                            to="/admin/counter"
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                            <Monitor className="w-4 h-4" />
                            Counter Staff
                        </Link>
                        <button
                            onClick={() => generateQuota()}
                            className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Generate Quota
                        </button>
                    </div>
                </header>

                {/* Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    {/* Stats Cards */}
                    <div className="space-y-6">
                        <div className="glass p-6 rounded-3xl flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium mb-1">Total Patients Today</p>
                                <p className="text-3xl font-bold text-[#1D1D1F]">
                                    {analytics.totalPatients}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                                <Activity className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="glass p-6 rounded-3xl flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium mb-1">Active Doctors</p>
                                <p className="text-3xl font-bold text-[#1D1D1F]">
                                    {doctors.filter(d => d.quota?.status === 'OPEN').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                                <LayoutGrid className="w-6 h-6" />
                            </div>
                        </div>
                        <button
                            onClick={handleExport}
                            className="w-full bg-white border border-gray-200 p-4 rounded-2xl flex items-center justify-center gap-2 text-gray-700 font-semibold hover:bg-gray-50 transition"
                        >
                            <Download size={20} />
                            Export Daily Report
                        </button>
                    </div>

                    {/* Charts */}
                    <div className="glass p-6 rounded-3xl lg:col-span-2 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Patient Arrival (Hourly)</h3>
                        <div className="flex-1 min-h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.barChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="hour" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="patients" fill="#0071E3" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-6">Live Status</h2>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {doctors.map((doctor) => (
                        <DoctorCard key={doctor.id} doctor={doctor} />
                    ))}
                </div>

                {doctors.length === 0 && (
                    <div className="text-center py-32">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <LayoutGrid className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">No Data Available</h3>
                        <p className="text-gray-500 mt-2">Generate daily quotas to start managing queues.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
