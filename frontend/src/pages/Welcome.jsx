import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Activity, Monitor, Shield } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import useThemeStore from '../store/useThemeStore';

const Welcome = () => {
    const navigate = useNavigate();
    const { mode } = useThemeStore();

    return (
        <div className="min-h-screen bg-theme-bg text-theme-text relative overflow-hidden font-sans selection:bg-salm-pink selection:text-white transition-colors duration-300">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Ambient Background - Adjusted for Light/Dark */}
            <div className={`absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full blur-[120px] animate-pulse-slow ${mode === 'dark' ? 'bg-salm-blue/30' : 'bg-salm-blue/10'} transition-all`}></div>
            <div className={`absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[120px] animate-pulse-slow delay-1000 ${mode === 'dark' ? 'bg-salm-purple/20' : 'bg-salm-purple/10'} transition-all`}></div>

            {/* Navbar */}
            <nav className="relative z-10 w-full max-w-[1200px] mx-auto p-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-salm-pink to-salm-purple rounded-full flex items-center justify-center shadow-lg shadow-salm-pink/20">
                        <Activity className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-semibold tracking-tight text-theme-text">SiMed.</span>
                </div>
                <button
                    onClick={() => navigate('/login')}
                    className="px-5 py-2 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/20 transition-all text-sm font-medium text-gray-800 dark:text-white shadow-sm"
                >
                    Login
                </button>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <span className="inline-block py-1 px-3 rounded-full bg-gradient-to-r from-salm-blue/10 to-salm-purple/10 border border-salm-blue/20 text-salm-blue text-xs font-medium tracking-wide mb-6 backdrop-blur-md dark:from-salm-blue/20 dark:to-salm-purple/20 dark:border-white/10">
                        HOSPITAL MANAGEMENT SYSTEM v2.0
                    </span>
                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-500 dark:from-white dark:to-white/50 leading-tight drop-shadow-sm">
                        Healthcare <br /> Reimagined.
                    </h1>
                    <p className="max-w-xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed font-medium">
                        Experience the future of medical administration. Seamlessly manage patients, doctors, and schedules with an interface designed for humans.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="group relative px-8 py-4 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black font-semibold hover:scale-105 transition-all shadow-xl shadow-gray-900/10 dark:shadow-white/10 flex items-center gap-2"
                        >
                            Get Started
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => navigate('/kiosk')}
                            className="px-8 py-4 rounded-full bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all font-medium flex items-center gap-2 text-gray-800 dark:text-gray-300 shadow-sm"
                        >
                            <Monitor className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            Kiosk Mode
                        </button>
                    </div>
                </div>

                {/* Floating Cards (Decorative) */}
                <div className="absolute top-[20%] left-[10%] p-4 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl animate-float hidden lg:block rotate-[-6deg]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-green-500 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">System Status</p>
                            <p className="text-sm font-bold text-green-600 dark:text-green-400">Online</p>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-[20%] right-[10%] p-4 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl animate-float-delayed hidden lg:block rotate-[6deg]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Security</p>
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Protected</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 w-full text-center py-8 text-xs text-gray-500 dark:text-gray-600">
                <p>&copy; 2024 Fallonava. All rights reserved.</p>
            </footer>

            {/* Global Styles for Animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(-6deg); }
                    50% { transform: translateY(-20px) rotate(-6deg); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0) rotate(6deg); }
                    50% { transform: translateY(-20px) rotate(6deg); }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
                .animate-pulse-slow { animation: pulse 10s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            `}</style>
        </div>
    );
};

export default Welcome;
