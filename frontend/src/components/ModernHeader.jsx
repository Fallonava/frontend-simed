import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const ModernHeader = ({
    title,
    subtitle,
    onBack,
    actions,
    className = ""
}) => {
    console.log('ModernHeader Props:', { title, subtitle, className, actionsType: typeof actions });
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

                    {/* Branding Logo - Always Visible or Conditional? 
                        User asked to "masukan logo" (insert logo) and "pertahankan tetap ux" (maintain UX).
                        Typically showing the logo NEXT to the back button is the best way to do both.
                        Or if the design doesn't fit, we replace it. 
                        Given the "Flex gap-3" structure, placing them side-by-side works well.
                    */}
                    <div className="flex items-center gap-3">
                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 rounded-xl shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform duration-300 drop-shadow-2xl overflow-visible">
                            <defs>
                                <linearGradient id="logo-gradient-_r_f7_" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#6366f1"></stop>
                                    <stop offset="50%" stopColor="#a855f7"></stop>
                                    <stop offset="100%" stopColor="#ec4899"></stop>
                                </linearGradient>
                                <linearGradient id="sheen-gradient-_r_f7_" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="white" stopOpacity="0.3"></stop>
                                    <stop offset="100%" stopColor="white" stopOpacity="0"></stop>
                                </linearGradient>
                                <filter id="glow-_r_f7_" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="5" result="blur"></feGaussianBlur>
                                    <feComposite in="SourceGraphic" in2="blur" operator="over"></feComposite>
                                </filter>
                            </defs>
                            <rect x="5" y="5" width="90" height="90" rx="24" fill="url(#logo-gradient-_r_f7_)" className="shadow-lg"></rect>
                            <rect x="5" y="5" width="90" height="90" rx="24" fill="url(#sheen-gradient-_r_f7_)" className="pointer-events-none"></rect>
                            <path d="M35 30 H65 A5 5 0 0 1 70 35 V45 A5 5 0 0 1 65 50 H50 V65 A5 5 0 0 1 45 70 H35 A5 5 0 0 1 30 65 V35 A5 5 0 0 1 35 30 Z" fill="white" fillOpacity="0.95"></path>
                            <path d="M55 30 V20 A5 5 0 0 1 60 15 H75 A5 5 0 0 1 80 20 V30 Z" fill="white" fillOpacity="0.85"></path>
                            <circle cx="70" cy="70" r="8" fill="white" fillOpacity="0.85"></circle>
                        </svg>

                        <div>
                            <h1 className="text-lg font-bold tracking-tight leading-none text-gray-900 dark:text-white">
                                {title || 'Sistem Antrian RS'}
                            </h1>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">
                                {subtitle || 'Pelayanan Prima'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mobile Only: User/Logout Trigger */}
                <div className="md:hidden flex items-center gap-2">
                    <button
                        onClick={handleLogout}
                        className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
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

        </header>
    );
};

export default ModernHeader;
