import React, { useState, useMemo } from 'react';
import SmoothScrollArea from '../components/SmoothScrollArea';
import ModernHeader from '../components/ModernHeader';
import GreetingHeader from '../components/GreetingHeader';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import {
    LayoutDashboard, Users, Database, Calendar, Activity, FileText, Pill,
    Receipt, Monitor, ClipboardPlus, Microscope, Sparkles, LogOut, Bed,
    Bell, Utensils, Briefcase, CalendarOff, Siren, Archive, Package, Printer, Box,
    Stethoscope, DollarSign, PieChart as PieChartIcon, Search, Clock, Camera, Calculator, Shield
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const MainMenu = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');

    // Organized by Categories
    const menuGroups = useMemo(() => [
        {
            category: "Front Office & Admission",
            items: [
                {
                    title: 'Instalasi Gawat Darurat',
                    description: 'Emergency Department',
                    icon: <Siren size={28} />,
                    path: '/registration/igd',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-red-500 to-red-600',
                    shadow: 'shadow-red-500/20'
                },
                {
                    title: 'Admisi Rawat Jalan',
                    description: 'Outpatient Admission',
                    icon: <ClipboardPlus size={28} />,
                    path: '/registration',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-blue-500 to-blue-600',
                    shadow: 'shadow-blue-500/20'
                },
                {
                    title: 'Admisi Rawat Inap',
                    description: 'Inpatient Admission',
                    icon: <Bed size={28} />,
                    path: '/registration/ranap',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-orange-500 to-orange-600',
                    shadow: 'shadow-orange-500/20'
                },
                {
                    title: 'Anjungan Mandiri',
                    description: 'Kiosk System',
                    icon: <Monitor size={28} />,
                    path: '/kiosk',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-cyan-500 to-cyan-600',
                    shadow: 'shadow-cyan-500/20'
                },
                {
                    title: 'Booking Online',
                    description: 'Web / JKN Booking',
                    icon: <Monitor size={28} />,
                    path: '/booking',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-sky-500 to-sky-600',
                    shadow: 'shadow-sky-500/20'
                },
                {
                    title: 'Display Antrian',
                    description: 'Public Queue Display',
                    icon: <Monitor size={28} />,
                    path: '/counter',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-indigo-500 to-indigo-600',
                    shadow: 'shadow-indigo-500/20',
                    external: true
                },
                {
                    title: 'Info Jadwal Dokter',
                    description: 'Physician Schedule',
                    icon: <Calendar size={28} />,
                    path: '/public/schedule',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-purple-500 to-purple-600',
                    shadow: 'shadow-purple-500/20',
                    external: true
                }
            ]
        },
        {
            category: "Clinical Care Services",
            items: [
                {
                    title: 'Nurse Station (Hub)',
                    description: 'Unified Clinical Dashboard',
                    icon: <LayoutDashboard size={28} />,
                    path: '/nurse/station',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-pink-500 to-pink-600',
                    shadow: 'shadow-pink-500/20'
                },
                {
                    title: 'Doctor Workstation',
                    description: 'EMR & CPOE',
                    icon: <Activity size={28} />,
                    path: '/doctor/dashboard',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-emerald-500 to-emerald-600',
                    shadow: 'shadow-emerald-500/20'
                },
                {
                    title: 'Bangsal Rawat Inap',
                    description: 'Ward Management',
                    icon: <Bed size={28} />,
                    path: '/admission',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-orange-600 to-orange-700',
                    shadow: 'shadow-orange-600/20'
                },
                {
                    title: 'Patient Monitoring',
                    description: 'Inpatient Clinical Alerts',
                    icon: <Bell size={28} />,
                    path: '/nurse/inpatient',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-red-600 to-red-700',
                    shadow: 'shadow-red-600/20'
                },
                {
                    title: 'Discharge Planning',
                    description: 'Patient Discharge',
                    icon: <LogOut size={28} />,
                    path: '/nurse/discharge',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-slate-500 to-slate-600',
                    shadow: 'shadow-slate-500/20'
                },
                {
                    title: 'Med-Support',
                    description: 'Medical Support',
                    icon: <Camera size={28} />,
                    path: '/medical-support',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-blue-600 to-indigo-700',
                    shadow: 'shadow-blue-600/20'
                },
                {
                    title: 'ERP Back Office',
                    description: 'Remunerasi, Aset & Finance',
                    icon: <Calculator size={28} />,
                    path: '/back-office',
                    roles: ['ADMIN'],
                    color: 'from-indigo-700 to-violet-900',
                    shadow: 'shadow-indigo-700/20'
                },
                {
                    title: 'National Integration',
                    description: 'SATUSEHAT, SIRS & SISRUTE',
                    icon: <Shield size={28} />,
                    path: '/integration',
                    roles: ['ADMIN'],
                    color: 'from-emerald-600 to-teal-700',
                    shadow: 'shadow-emerald-600/20'
                }
            ]
        },
        {
            category: "Medical Records (Rekam Medis)",
            items: [
                {
                    title: 'Manajemen Rekam Medis',
                    description: 'Coding & Archiving',
                    icon: <Archive size={28} />,
                    path: '/medical-records',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-emerald-600 to-emerald-700',
                    shadow: 'shadow-emerald-600/20'
                },
                {
                    title: 'Sentra Dokumen',
                    description: 'Medical Documents Center',
                    icon: <Printer size={28} />,
                    path: '/documents/center',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-cyan-600 to-cyan-700',
                    shadow: 'shadow-cyan-600/20'
                }
            ]
        },
        {
            category: "Ancillary Units (Penunjang)",
            items: [
                {
                    title: 'Apotek Rawat Jalan',
                    description: 'Outpatient Pharmacy',
                    icon: <Pill size={28} />,
                    path: '/pharmacy',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-teal-500 to-teal-600',
                    shadow: 'shadow-teal-500/20'
                },
                {
                    title: 'Instalasi Laboratorium',
                    description: 'Laboratory Information',
                    icon: <Microscope size={28} />,
                    path: '/lab',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-purple-600 to-purple-700',
                    shadow: 'shadow-purple-600/20'
                },
                {
                    title: 'Instalasi Radiologi',
                    description: 'Radiology Information',
                    icon: <Activity size={28} />,
                    path: '/radiology',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-indigo-600 to-indigo-700',
                    shadow: 'shadow-indigo-600/20'
                },
                {
                    title: 'Gizi & Dietetik',
                    description: 'Nutrition & Kitchen',
                    icon: <Utensils size={28} />,
                    path: '/nutrition',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-amber-500 to-amber-600',
                    shadow: 'shadow-amber-500/20'
                },
                {
                    title: 'Pemesanan Gizi',
                    description: 'Dietary Orders (Nurse)',
                    icon: <Utensils size={28} />,
                    path: '/nurse/diet',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-orange-400 to-orange-500',
                    shadow: 'shadow-orange-400/20'
                }
            ]
        },
        {
            category: "Logistics & Supply Chain",
            items: [
                {
                    title: 'Logistics Command Center',
                    description: 'Inventory, Assets & Pharmacy',
                    icon: <Package size={28} />,
                    path: '/inventory/general', // This route maps to InventoryDashboard
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-teal-600 to-teal-700',
                    shadow: 'shadow-teal-600/20'
                }
            ]
        },
        {
            category: "Finance & Back Office",
            items: [
                {
                    title: 'Executive Dashboard',
                    description: 'Business Intelligence',
                    icon: <LayoutDashboard size={28} />,
                    path: '/admin/dashboard',
                    roles: ['ADMIN'],
                    color: 'from-gray-700 to-gray-800',
                    shadow: 'shadow-gray-700/20'
                },
                {
                    title: 'Kasir & Billing',
                    description: 'Cashier Dashboard',
                    icon: <Receipt size={28} />,
                    path: '/cashier',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-teal-400 to-teal-500',
                    shadow: 'shadow-teal-400/20'
                },
                {
                    title: 'Keuangan & Revenue',
                    description: 'Financial Overview',
                    icon: <DollarSign size={28} />,
                    path: '/finance',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-pink-600 to-pink-700',
                    shadow: 'shadow-pink-600/20'
                },
                {
                    title: 'Casemix (BPJS)',
                    description: 'Claims & Grouper',
                    icon: <FileText size={28} />,
                    path: '/casemix',
                    roles: ['ADMIN'],
                    color: 'from-green-500 to-green-600',
                    shadow: 'shadow-green-500/20'
                },
                {
                    title: 'SDM & Kepegawaian',
                    description: 'Human Capital Mgmt',
                    icon: <Briefcase size={28} />,
                    path: '/hr',
                    roles: ['ADMIN'],
                    color: 'from-purple-700 to-purple-800',
                    shadow: 'shadow-purple-700/20'
                },
                {
                    title: 'Data Induk (Master)',
                    description: 'Hospital Master Data',
                    icon: <Database size={28} />,
                    path: '/admin/master-data',
                    roles: ['ADMIN'],
                    color: 'from-gray-600 to-gray-700',
                    shadow: 'shadow-gray-600/20'
                },
                {
                    title: 'Database Pasien',
                    description: 'Patient Registry',
                    icon: <FileText size={28} />,
                    path: '/admin/patients',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-blue-600 to-blue-700',
                    shadow: 'shadow-blue-600/20'
                },
                {
                    title: 'Manajemen Cuti',
                    description: 'Leave Management',
                    icon: <CalendarOff size={28} />,
                    path: '/admin/leave-calendar',
                    roles: ['ADMIN'],
                    color: 'from-red-500 to-red-600',
                    shadow: 'shadow-red-500/20'
                }
            ]
        },
        {
            category: "Intelligence & AI",
            items: [
                {
                    title: 'AI Medical Chronology',
                    description: 'Automated Clinical Report',
                    icon: <Sparkles size={28} />,
                    path: '/chronology',
                    roles: ['ADMIN', 'STAFF'],
                    color: 'from-violet-600 to-violet-700',
                    shadow: 'shadow-violet-600/20'
                }
            ]
        }
    ], []);

    // Filter Items
    const filteredGroups = useMemo(() => menuGroups.map(group => ({
        ...group,
        items: group.items.filter(item => {
            const matchesRole = item.roles.includes(user?.role);
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesRole && matchesSearch;
        })
    })).filter(group => group.items.length > 0), [menuGroups, user, searchTerm]);

    return (
        <div className="h-screen bg-[#F5F5F7] dark:bg-[#0D1117] transition-colors duration-500 relative font-sans flex flex-col overflow-hidden">
            <ThemeToggle />

            <ModernHeader
                title="Fallonava Hospital"
                subtitle="Integrated Dashboard"
                onBack={null}
            />

            <SmoothScrollArea className="flex-1" contentClassName="pb-24">
                <div className="max-w-[1920px] mx-auto p-4 md:p-8 pt-6">

                    {/* Hero Section */}
                    <div className="mb-12 relative z-10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                            <GreetingHeader userName={user?.name?.split(' ')[0]} />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="relative w-full md:w-96 group"
                            >
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <Search size={20} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search modules (e.g., 'Apotek', 'Kasir')..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 focus:outline-none transition-all duration-300 text-gray-800 dark:text-gray-100 placeholder-gray-400"
                                />
                            </motion.div>
                        </div>
                    </div>

                    {/* Menu Grid */}
                    <div className="space-y-12 px-2">
                        <AnimatePresence>
                            {filteredGroups.map((group, groupIdx) => (
                                <motion.div
                                    key={group.category}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.5, delay: groupIdx * 0.1 }}
                                >
                                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-4 ml-2">
                                        <span className="w-8 h-[2px] bg-gray-300 dark:bg-gray-700 rounded-full"></span>
                                        {group.category}
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                        {group.items.map((item, idx) => (
                                            <motion.button
                                                key={idx}
                                                whileHover={{ y: -8, scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => navigate(item.path)}
                                                className="relative group flex flex-col items-start p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl rounded-[32px] border border-white/40 dark:border-gray-700/50 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden text-left h-full"
                                            >
                                                {/* Gradient Background Decoration */}
                                                <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${item.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-500`}></div>

                                                {/* Icon Container */}
                                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-5 shadow-lg ${item.shadow} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 relative z-10`}>
                                                    {item.icon}
                                                </div>

                                                {/* Text Content */}
                                                <div className="relative z-10">
                                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium line-clamp-2">
                                                        {item.description}
                                                    </p>
                                                </div>

                                                {/* External Link Indicator */}
                                                {item.external && (
                                                    <div className="absolute top-4 right-4 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                            <path d="M7 17L17 7M17 7H7M17 7V17" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredGroups.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20"
                            >
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 text-gray-400">
                                    <Search size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-600 dark:text-gray-300">No modules found</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">Try searching for something else like "Rekam Medis"</p>
                            </motion.div>
                        )}
                    </div>

                    <footer className="mt-24 text-center text-gray-400 text-sm py-8 border-t border-gray-200/50 dark:border-gray-800/50 relative z-10">
                        <p>&copy; {new Date().getFullYear()} Fallonava Health System. Engineered for Excellence.</p>
                    </footer>
                </div>
            </SmoothScrollArea>
        </div>
    );
};

export default MainMenu;
