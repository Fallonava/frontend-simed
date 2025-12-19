import React from 'react';
import ModernHeader from '../components/ModernHeader';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import {
    LayoutDashboard, Users, Database, Calendar, Activity, FileText, Pill,
    Receipt, Monitor, ClipboardPlus, Microscope, Sparkles, LogOut, Bed,
    Bell, Utensils, Briefcase, CalendarOff, Siren, Archive, Package, Printer, Box
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const MainMenu = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    // Organized by Categories
    const menuGroups = [
        {
            category: "Front Office & Admission",
            items: [
                {
                    title: 'Admisi Rawat Jalan',
                    description: 'Outpatient Admission',
                    icon: <ClipboardPlus size={32} />,
                    path: '/registration',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-blue-600'
                },
                {
                    title: 'Instalasi Gawat Darurat',
                    description: 'Emergency Department',
                    icon: <Siren size={32} />,
                    path: '/registration/igd',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-red-600'
                },
                {
                    title: 'Admisi Rawat Inap',
                    description: 'Inpatient Admission',
                    icon: <Bed size={32} />,
                    path: '/registration/ranap',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-orange-600'
                },
                {
                    title: 'Anjungan Mandiri',
                    description: 'Kiosk System',
                    icon: <Monitor size={32} />,
                    path: '/kiosk',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-cyan-600'
                },
                {
                    title: 'Display Antrian',
                    description: 'Public Queue Display',
                    icon: <Monitor size={32} />,
                    path: '/counter',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-indigo-600',
                    external: true
                },
                {
                    title: 'Info Jadwal Dokter',
                    description: 'Physician Schedule',
                    icon: <Calendar size={32} />,
                    path: '/public/schedule',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-purple-600',
                    external: true
                }
            ]
        },
        {
            category: "Medical Records (Rekam Medis)",
            items: [
                {
                    title: 'Manajemen Rekam Medis',
                    description: 'Coding & Archiving',
                    icon: <Archive size={32} />,
                    path: '/medical-records',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-emerald-700'
                },
                {
                    title: 'Sentra Dokumen',
                    description: 'Medical Documents Center',
                    icon: <Printer size={32} />,
                    path: '/documents/center',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-cyan-700'
                }
            ]
        },
        {
            category: "Clinical Care Services",
            items: [
                {
                    title: 'Nurse Station',
                    description: 'Triage & Vital Signs',
                    icon: <ClipboardPlus size={32} />,
                    path: '/nurse',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-pink-600'
                },
                {
                    title: 'Doctor Workstation',
                    description: 'EMR & CPOE',
                    icon: <Activity size={32} />,
                    path: '/doctor/dashboard',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-emerald-600'
                },
                {
                    title: 'Bangsal Rawat Inap',
                    description: 'Ward Management',
                    icon: <Bed size={32} />,
                    path: '/admission',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-orange-600'
                },
                {
                    title: 'Patient Monitoring',
                    description: 'Inpatient Clinical Alerts',
                    icon: <Bell size={32} />,
                    path: '/nurse/inpatient',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-red-700'
                }
            ]
        },
        {
            category: "Logistics & Supply Chain",
            items: [

                {
                    title: 'Gudang Farmasi',
                    description: 'Central Pharmacy Warehouse',
                    icon: <Package size={32} />,
                    path: '/logistics/pharmacy',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-teal-600'
                },
                {
                    title: 'Aset & Umum',
                    description: 'General Assets Inventory',
                    icon: <Box size={32} />,
                    path: '/logistics/assets',
                    roles: ['ADMIN'],
                    color: 'bg-blue-600'
                }
            ]
        },
        {
            category: "Ancillary Units (Penunjang)",
            items: [
                {
                    title: 'Apotek Rawat Jalan',
                    description: 'Outpatient Pharmacy (Depo)',
                    icon: <Pill size={32} />,
                    path: '/pharmacy',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-teal-600'
                },
                {
                    title: 'Instalasi Laboratorium',
                    description: 'Laboratory Information',
                    icon: <Microscope size={32} />,
                    path: '/lab',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-purple-700'
                },
                {
                    title: 'Instalasi Radiologi',
                    description: 'Radiology Information',
                    icon: <Activity size={32} />,
                    path: '/radiology',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-indigo-700'
                },
                {
                    title: 'Gizi & Dietetik',
                    description: 'Nutrition & Kitchen',
                    icon: <Utensils size={32} />,
                    path: '/nutrition',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-amber-600'
                }
            ]
        },
        {
            category: "Executive & Back Office",
            items: [
                {
                    title: 'Executive Dashboard',
                    description: 'Business Intelligence',
                    icon: <LayoutDashboard size={32} />,
                    path: '/admin/dashboard',
                    roles: ['ADMIN'],
                    color: 'bg-gray-800'
                },
                {
                    title: 'Data Induk (Master)',
                    description: 'Hospital Master Data',
                    icon: <Database size={32} />,
                    path: '/admin/master-data',
                    roles: ['ADMIN'],
                    color: 'bg-gray-700'
                },
                {
                    title: 'Konfigurasi Sistem',
                    description: 'App Settings',
                    icon: <Database size={32} />,
                    path: '/admin/settings',
                    roles: ['ADMIN'],
                    color: 'bg-slate-800'
                },
                {
                    title: 'Database Pasien',
                    description: 'Patient Registry',
                    icon: <FileText size={32} />,
                    path: '/admin/patients',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-blue-700'
                },
                {
                    title: 'SDM & Kepegawaian',
                    description: 'Human Capital Mgmt',
                    icon: <Briefcase size={32} />,
                    path: '/hr',
                    roles: ['ADMIN'],
                    color: 'bg-purple-800'
                },
                {
                    title: 'Keuangan & Kasir',
                    description: 'Billing & Revenue',
                    icon: <Receipt size={32} />,
                    path: '/finance',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-pink-700'
                },
                {
                    title: 'Manajemen Cuti',
                    description: 'Leave Management',
                    icon: <CalendarOff size={32} />,
                    path: '/admin/leave-calendar',
                    roles: ['ADMIN'],
                    color: 'bg-red-600'
                }
            ]
        },
        {
            category: "Intelligence & AI",
            items: [
                {
                    title: 'AI Medical Chronology',
                    description: 'Automated Clinical Report',
                    icon: <Sparkles size={32} />,
                    path: '/chronology',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'bg-violet-700'
                }
            ]
        }
    ];



    // Explicit Tailwind safelist for dynamic gradients
    const gradientMap = {
        'bg-blue-600': 'from-blue-600',
        'bg-red-600': 'from-red-600',
        'bg-orange-600': 'from-orange-600',
        'bg-cyan-600': 'from-cyan-600',
        'bg-indigo-600': 'from-indigo-600',
        'bg-purple-600': 'from-purple-600',
        'bg-emerald-700': 'from-emerald-700',
        'bg-cyan-700': 'from-cyan-700',
        'bg-pink-600': 'from-pink-600',
        'bg-emerald-600': 'from-emerald-600',
        'bg-red-700': 'from-red-700',
        'bg-teal-700': 'from-teal-700',
        'bg-slate-600': 'from-slate-600',
        'bg-teal-600': 'from-teal-600',
        'bg-purple-700': 'from-purple-700',
        'bg-indigo-700': 'from-indigo-700',
        'bg-amber-600': 'from-amber-600',
        'bg-gray-800': 'from-gray-800',
        'bg-gray-700': 'from-gray-700',
        'bg-slate-800': 'from-slate-800',
        'bg-blue-700': 'from-blue-700',
        'bg-purple-800': 'from-purple-800',
        'bg-pink-700': 'from-pink-700',
        'bg-violet-700': 'from-violet-700',
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 relative font-sans">

            <ThemeToggle />

            <ModernHeader
                title="Fallonava Hospital"
                subtitle="Integrated Dashboard"
                onBack={null} // No back button on main menu
            />

            <div className="max-w-[1920px] mx-auto p-8 pt-10">

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
                                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradientMap[item.color] || 'from-blue-500'} to-transparent opacity-10 rounded-bl-[100px] transition-all duration-500 ease-out group-hover:scale-150 group-hover:opacity-30`}></div>

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
