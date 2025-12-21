import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import FallonavaLogo from './FallonavaLogo';

const ModernHeader = ({
    title,
    subtitle,
    onBack,
    actions,
    children, // Add children prop
    className = ""
}) => {
    // console.log('ModernHeader Props:', { title, subtitle, className, actionsType: typeof actions });
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [time, setTime] = useState(new Date());

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Format time as 10:00 PM
    const formattedTime = time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    return (
        <header className={`sticky top-0 h-auto py-3 lg:h-20 lg:py-0 shrink-0 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-50 gap-3 md:gap-0 transition-all duration-300 ${className}`}>

            {/* LEFT: Logo & Title (inc. Back Button) */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                <div className="flex items-center gap-3">
                    {/* Back Button Override */}
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-white"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}

                    {/* Integrated Logo */}
                    <div className="mr-2">
                        <FallonavaLogo className="w-10 h-10 drop-shadow-md" />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">{title}</h1>
                        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{subtitle}</p>}
                    </div>
                </div>
            </div>

            {/* MIDDLE: Custom Children (Tabs etc.) */}
            {children && (
                <div className="flex-1 flex justify-center w-full md:w-auto overflow-x-auto">
                    {children}
                </div>
            )}

            {/* RIGHT: Time & User Profile */}



            {/* Mobile Only: User/Logout Trigger */}
            <div className="md:hidden flex items-center gap-2">
                <button
                    onClick={handleLogout}
                    className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300"
                >
                    <LogOut size={18} />
                </button>
            </div>




            {/* CENTER: Actions (if any) */}
            {
                actions && (
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full border border-gray-200 dark:border-gray-700 w-full md:w-auto justify-center">
                        {actions}
                    </div>
                )
            }

            {/* RIGHT: Clock & User */}
            <div className="hidden md:flex items-center gap-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{formattedTime}</span>
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 rounded-full bg-salm-light-blue/20 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-5 h-5 text-salm-blue" aria-hidden="true">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-bold text-theme-text">{String(user?.username || 'Guest')}</p>
                        <p className="text-xs text-theme-gray dark:text-gray-400">{String(user?.role || 'Visitor')}</p>
                    </div>

                    {/* Logout Trigger (Optional integration) */}
                    <button
                        onClick={handleLogout}
                        className="ml-2 p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>

        </header >
    );
};

export default ModernHeader;
