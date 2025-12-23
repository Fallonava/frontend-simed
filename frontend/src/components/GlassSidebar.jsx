import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutGrid, Users, Stethoscope, Pill, CreditCard,
    Settings, Activity, ClipboardPlus, Menu, X, LogOut, ChartPie
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import FallonavaLogo from './FallonavaLogo';

const GlassSidebar = ({ items, activeId, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();

    const hasCustomItems = items && items.length > 0;

    // Reusing similar items but structure for mobile list
    const defaultItems = [
        { id: 'menu', icon: LayoutGrid, label: 'Main Menu', path: '/menu', roles: ['ADMIN', 'STAFF'] },
        { id: 'dashboard', icon: ChartPie, label: 'Dashboard', path: '/admin/dashboard', roles: ['ADMIN'] },
        { id: 'patients', icon: Users, label: 'Patients', path: '/admin/patients', roles: ['ADMIN', 'STAFF'] },
        { id: 'admission', icon: ClipboardPlus, label: 'Registration', path: '/registration', roles: ['ADMIN', 'STAFF'] },
        { id: 'clinical', icon: Stethoscope, label: 'Clinical Hub', path: '/nurse/station', roles: ['ADMIN', 'STAFF'] },
        { id: 'pharmacy', icon: Pill, label: 'Pharmacy', path: '/pharmacy', roles: ['ADMIN', 'STAFF'] },
        { id: 'finance', icon: CreditCard, label: 'Finance', path: '/finance', roles: ['ADMIN'] },
        { id: 'master', icon: Settings, label: 'Master Data', path: '/admin/master-data', roles: ['ADMIN'] },
    ];

    const finalItems = hasCustomItems
        ? items
        : defaultItems.filter(item => item.roles.includes(user?.role || 'STAFF'));

    const handleNavigate = (item) => {
        if (onSelect) {
            onSelect(item.id);
        } else if (item.path) {
            navigate(item.path);
        }
        setIsOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="lg:hidden">
            {/* Hamburger Trigger */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 left-6 z-[9990] p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full shadow-lg shadow-black/5 border border-white/20 dark:border-white/10 text-gray-800 dark:text-white"
            >
                <Menu size={24} />
            </button>

            {/* Backdrop & Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
                        />

                        {/* Sidebar Drawer */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-3/4 max-w-xs bg-white/90 dark:bg-gray-900/95 backdrop-blur-2xl border-r border-white/20 dark:border-white/5 z-[9999] p-6 flex flex-col shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-2">
                                    <FallonavaLogo className="w-8 h-8" />
                                    <span className="font-bold text-lg text-gray-800 dark:text-white">Fallonava</span>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2">
                                {finalItems.map(item => {
                                    const isActive = activeId ? activeId === item.id : (location.pathname.startsWith(item.path) && item.path !== '/menu' || location.pathname === item.path);
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleNavigate(item)}
                                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-medium ${isActive
                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            <item.icon size={22} />
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 font-bold transition-colors"
                                >
                                    <LogOut size={22} />
                                    Logout
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GlassSidebar;
