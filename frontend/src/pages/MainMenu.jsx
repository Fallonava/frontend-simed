import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { LayoutDashboard, Users, Database, Calendar, Activity, FileText, Pill, Receipt, Monitor, ClipboardPlus, Microscope, Sparkles, LogOut, Bed } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const MainMenu = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        {
            title: 'Dashboard Admin',
            description: 'View analytics and statistics',
            icon: <LayoutDashboard size={40} />,
            path: '/admin/dashboard',
            roles: ['ADMIN'],
            color: 'bg-salm-blue'
        },

        {
            title: 'Master Data',
            description: 'Manage doctors and poliklinik',
            icon: <Database size={40} />,
            path: '/admin/master-data',
            roles: ['ADMIN'],
            color: 'bg-salm-purple'
        },
        {
            title: 'Pendaftaran',
            description: 'Patient Registration & Ticketing',
            icon: <Calendar size={40} />,
            path: '/registration',
            roles: ['ADMIN', 'STAFF'],
            color: 'bg-gradient-to-br from-green-400 to-emerald-600'
        },
        {
            title: 'Doctor Desk',
            description: 'Rekam Medis & Antrian',
            icon: <Activity size={40} />,
            path: '/doctor/dashboard',
            roles: ['ADMIN', 'STAFF'],
            color: 'bg-gradient-to-br from-emerald-500 to-teal-600'
        },
        {
            title: 'Data Pasien',
            description: 'Patient Center & History',
            icon: <FileText size={40} />,
            path: '/admin/patients',
            roles: ['ADMIN', 'STAFF'],
            color: 'bg-gradient-to-br from-blue-500 to-indigo-600'
        },
        {
            title: 'Apotek & Farmasi',
            description: 'Pharmacy & Drug Queue',
            icon: <Pill size={40} />,
            path: '/pharmacy',
            roles: ['ADMIN', 'STAFF'], // In a real app, maybe 'PHARMACIST'
            color: 'bg-gradient-to-br from-emerald-400 to-teal-500'
        },
        {
            title: 'Kasir & Billing',
            description: 'Payment & Invoicing',
            icon: <Receipt size={40} />,
            path: '/cashier',
            roles: ['ADMIN', 'STAFF'], // e.g. 'CASHIER'
            color: 'bg-gradient-to-br from-purple-500 to-pink-500'
        },
        {
            title: 'Public Display',
            description: 'Open TV Display view',
            icon: <Monitor size={40} />,
            path: '/counter',
            roles: ['ADMIN', 'STAFF'],
            color: 'bg-salm-pink',
            external: true
        },
        {
            title: 'Nurse Station',
            description: 'Triage & Vital Signs',
            icon: <ClipboardPlus size={40} />,
            path: '/nurse',
            roles: ['ADMIN', 'STAFF'], // e.g., 'NURSE'
            color: 'bg-gradient-to-br from-red-400 to-pink-500'
        },
        {
            title: 'Laboratorium',
            description: 'Lab Orders',
            icon: <Microscope size={40} />,
            path: '/lab',
            roles: ['ADMIN', 'STAFF'],
            color: 'bg-gradient-to-br from-purple-500 to-pink-600'
        },
        {
            title: 'Radiologi',
            description: 'X-Ray & Imaging',
            icon: <Activity size={40} />,
            path: '/radiology',
            roles: ['ADMIN', 'STAFF'],
            color: 'bg-gradient-to-br from-indigo-500 to-cyan-600'
        },
        {
            title: 'Rawat Inap',
            description: 'Hospitality & Admission',
            icon: <Bed size={40} />,
            path: '/admission',
            roles: ['ADMIN', 'STAFF'],
            color: 'bg-gradient-to-br from-orange-400 to-pink-500' // Distinct Hospitality Color
        },
        {
            title: 'Kiosk Antrian',
            description: 'Ambil Nomor Antrian',
            icon: <Monitor size={40} />,
            path: '/kiosk',
            roles: ['ADMIN', 'STAFF'],
            color: 'bg-salm-gradient'
        },
        {
            title: 'AI Chronology',
            description: 'Generate reports with AI',
            icon: <Sparkles size={40} />,
            path: '/chronology',
            roles: ['ADMIN', 'STAFF'],
            color: 'bg-gradient-to-br from-indigo-500 to-purple-600'
        }
    ];

    const allowedItems = menuItems.filter(item => item.roles.includes(user?.role));

    return (
        <div className="min-h-screen bg-theme-bg p-8 transition-colors duration-300 relative">
            <ThemeToggle />

            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-theme-text">Main Menu</h1>
                        <p className="text-theme-text-secondary">Welcome back, <span className="font-semibold text-salm-purple">{user?.username}</span></p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {allowedItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => navigate(item.path)}
                            className="bg-theme-card dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-left group border border-theme-border dark:border-gray-700"
                        >
                            <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                                {item.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-theme-text mb-2">{item.title}</h3>
                            <p className="text-theme-text-secondary">{item.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MainMenu;
