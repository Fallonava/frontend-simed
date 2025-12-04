import React, { useEffect } from 'react';
import useQueueStore from '../store/useQueueStore';
import DoctorCard from '../components/DoctorCard';
import { LayoutGrid, RefreshCw, Activity } from 'lucide-react';

const AdminDashboard = () => {
    const { doctors, initialize, generateQuota, isConnected } = useQueueStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

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
                        <button
                            onClick={() => generateQuota()}
                            className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Generate Quota
                        </button>
                    </div>
                </header>

                {/* Stats Overview (Optional Placeholder) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="glass p-6 rounded-3xl flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">Total Patients</p>
                            <p className="text-3xl font-bold text-[#1D1D1F]">
                                {doctors.reduce((acc, doc) => acc + (doc.quota?.current_count || 0), 0)}
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
                    <div className="glass p-6 rounded-3xl flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">Total Capacity</p>
                            <p className="text-3xl font-bold text-[#1D1D1F]">
                                {doctors.reduce((acc, doc) => acc + (doc.quota?.max_quota || 0), 0)}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-500">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                </div>

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

// Helper component for stats
const Users = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

export default AdminDashboard;
