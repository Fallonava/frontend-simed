import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutGrid, Users, Stethoscope, Pill,
    Banknote, Settings, Activity, ClipboardPlus
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const FloatingDock = ({ items, activeId, onSelect }) => {
    const mouseX = useMotionValue(Infinity);
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();

    // If custom items are provided, use them. Otherwise default to Global Navigation.
    const hasCustomItems = items && items.length > 0;

    // Default Global Navigation Items
    const defaultItems = [
        { id: 'menu', icon: LayoutGrid, label: 'Main Menu', path: '/menu', roles: ['ADMIN', 'STAFF'] },
        { id: 'admission', icon: ClipboardPlus, label: 'Admission', path: '/registration', roles: ['ADMIN', 'STAFF'] },
        { id: 'patients', icon: Users, label: 'Patients', path: '/admin/patients', roles: ['ADMIN', 'STAFF'] },
        { id: 'clinical', icon: Stethoscope, label: 'Clinical', path: '/nurse/station', roles: ['ADMIN', 'STAFF'] },
        { id: 'pharmacy', icon: Pill, label: 'Pharmacy', path: '/pharmacy', roles: ['ADMIN', 'STAFF'] },
        { id: 'finance', icon: Banknote, label: 'Finance', path: '/finance', roles: ['ADMIN'] },
        { id: 'master', icon: Settings, label: 'Master Data', path: '/admin/master-data', roles: ['ADMIN'] },
    ];

    const finalItems = hasCustomItems
        ? items
        : defaultItems.filter(item => item.roles.includes(user?.role || 'STAFF'));

    const handleItemClick = (item) => {
        if (onSelect) {
            onSelect(item.id);
        } else if (item.path) {
            navigate(item.path);
        }
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] hidden lg:flex items-end gap-4 pb-3 px-4 h-20 bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/10"
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
        >
            {finalItems.map((item) => (
                <DockIcon
                    key={item.id}
                    mouseX={mouseX}
                    item={item}
                    isActive={activeId ? activeId === item.id : (location.pathname.startsWith(item.path) && item.path !== '/menu' || location.pathname === item.path)}
                    onClick={() => handleItemClick(item)}
                />
            ))}
        </div>
    );
};

const DockIcon = ({ mouseX, item, isActive, onClick }) => {
    const ref = useRef(null);

    const distance = useTransform(mouseX, (val) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthSync = useTransform(distance, [-150, 0, 150], [45, 90, 45]);
    const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

    return (
        <motion.div
            ref={ref}
            style={{ width }}
            onClick={onClick}
            className={`aspect-square rounded-2xl flex items-center justify-center cursor-pointer relative group transition-colors duration-300
                ${isActive
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-white/40 dark:border-white/5'
                }`}
        >
            <motion.div className="relative z-10">
                <item.icon size={26} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>

            {/* Tooltip */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900/80 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-sm pointer-events-none">
                {item.label}
            </div>

            {/* Active Dot */}
            {isActive && (
                <div className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-indigo-500/80" />
            )}
        </motion.div>
    );
};

export default FloatingDock;
