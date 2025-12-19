import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import {
    LayoutDashboard, Users, Database, Calendar, Activity, FileText, Pill,
    Receipt, Monitor, ClipboardPlus, Microscope, Sparkles, LogOut, Bed,
    Bell, Utensils, Briefcase, CalendarOff, Siren
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const MainMenu = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Organized by Categories
    const menuGroups = [
        {
            category: "Front Office & Registration",
            items: [
                {
                    title: 'Pendaftaran Rawat Jalan',
                    description: 'Outpatient Registration',
                    icon: <ClipboardPlus size={32} />, // Changed icon key import might be needed if not present
                    path: '/registration',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-blue-500'
                },
                {
                    title: 'Pendaftaran IGD',
                    description: 'Emergency Unit',
                    icon: <Siren size={32} />,
                    path: '/registration/igd',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-red-500'
                },
                {
                    title: 'Pendaftaran Rawat Inap',
                    description: 'Inpatient Admission',
                    icon: <Bed size={32} />,
                    path: '/registration/ranap',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-orange-500'
                },
                {
                    title: 'Kiosk Antrian',
                    description: 'Self Service Ticket',
                    icon: <Monitor size={32} />,
                    path: '/kiosk',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-cyan-500'
                },
                {
                    title: 'Public Display',
                    description: 'TV Queue Monitor',
                    icon: <Monitor size={32} />,
                    path: '/counter',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-indigo-500',
                    external: true
                }
            ]
        },
        {
            category: "Clinical Care (Medis)",
            items: [
                {
                    title: 'Nurse Station',
                    description: 'Triage & Vitals',
                    icon: <ClipboardPlus size={32} />,
                    path: '/nurse',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-pink-500'
                },
                {
                    title: 'Doctor Desk',
                    description: 'Medical Records',
                    icon: <Activity size={32} />,
                    path: '/doctor/dashboard',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-emerald-600'
                },
                {
                    title: 'Rawat Inap',
                    description: 'Admission & Bed Mgmt',
                    icon: <Bed size={32} />,
                    path: '/admission',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-orange-500'
                },
                {
                    title: 'Nurse Monitor',
                    description: 'Inpatient Alerts',
                    icon: <Bell size={32} />,
                    path: '/nurse/inpatient',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-red-600'
                }
            ]
        },
        {
            category: "Ancillary Services (Penunjang)",
            items: [
                {
                    title: 'Apotek',
                    description: 'Pharmacy & Drug Dispense',
                    icon: <Pill size={32} />,
                    path: '/pharmacy',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-teal-500'
                },
                {
                    title: 'Laboratorium',
                    description: 'Lab Orders & Results',
                    icon: <Microscope size={32} />,
                    path: '/lab',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-purple-600'
                },
                {
                    title: 'Radiologi',
                    description: 'Imaging & X-Ray',
                    icon: <Activity size={32} />, // Using Activity as placeholder for Rad
                    path: '/radiology',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-indigo-600'
                },
                {
                    title: 'Instalasi Gizi',
                    description: 'Kitchen & Diet Order',
                    icon: <Utensils size={32} />,
                    path: '/nutrition',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-amber-500'
                }
            ]
        },
        {
            category: "Back Office & Management",
            items: [
                {
                    title: 'Dashboard Admin',
                    description: 'Analytics & Stats',
                    icon: <LayoutDashboard size={32} />,
                    path: '/admin/dashboard',
                    roles: ['ADMIN'],
                    color: 'bg-gray-700'
                },
                {
                    title: 'Master Data',
                    description: 'Doctors & Polyclinics',
                    icon: <Database size={32} />,
                    path: '/admin/master-data',
                    roles: ['ADMIN'],
                    color: 'bg-gray-600'
                },
                {
                    title: 'Data Pasien',
                    description: 'Patient Center',
                    icon: <FileText size={32} />,
                    path: '/admin/patients',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-blue-600'
                },
                {
                    title: 'Human Capital',
                    description: 'HR & Roster',
                    icon: <Briefcase size={32} />,
                    path: '/hr',
                    roles: ['ADMIN'],
                    color: 'bg-purple-700'
                },
                {
                    title: 'Finance & Billing',
                    description: 'Cashier & Invoicing',
                    icon: <Receipt size={32} />,
                    path: '/finance',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-pink-600'
                },
                {
                    title: 'Cuti Dokter',
                    description: 'Leave Calendar',
                    icon: <CalendarOff size={32} />,
                    path: '/admin/leave-calendar',
                    roles: ['ADMIN'],
                    color: 'bg-red-500'
                }
            ]
        },
        {
            category: "Intelligence & AI",
            items: [
                {
                    title: 'AI Chronology',
                    description: 'Auto Report Generator',
                    icon: <Sparkles size={32} />,
                    path: '/chronology',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-violet-600'
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-300 relative font-sans">
            <ThemeToggle />

            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Fallonava</span> Hospital
                        </h1>
                        <p className="text-gray-500 mt-1">Integrated Hospital Management System</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                            <div className="font-bold text-gray-900 dark:text-gray-100">{user?.username}</div>
                            <div className="text-xs text-gray-400 uppercase tracking-wider">{user?.role}</div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-bold px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/30 transition-all"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </header>

                <div className="space-y-12">
                    {menuGroups.map((group, groupIdx) => {
                        const visibleItems = group.items.filter(item => item.roles.includes(user?.role));
                        if (visibleItems.length === 0) return null;

                        return (
                            <div key={groupIdx} className="animate-fade-in-up" style={{ animationDelay: `${groupIdx * 100}ms` }}>
                                <h2 className="text-xl font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-4">
                                    <span className="w-8 h-[2px] bg-gray-300 dark:bg-gray-700"></span>
                                    {group.category}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {visibleItems.map((item, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => navigate(item.path)}
                                            className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group border border-gray-100 dark:border-gray-700 relative overflow-hidden text-left"
                                        >
                                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color.replace('bg-', 'from-')} to-transparent opacity-10 rounded-bl-[100px] transition-all group-hover:scale-150 group-hover:opacity-20`}></div>

                                            <div className={`${item.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                {item.icon}
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1 leading-tight">{item.title}</h3>
                                            <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">{item.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <footer className="mt-20 text-center text-gray-400 text-sm py-8 border-t border-gray-200 dark:border-gray-700">
                    <p>&copy; {new Date().getFullYear()} Fallonava Health System. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default MainMenu;
