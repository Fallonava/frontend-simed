import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Activity, Monitor, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import useThemeStore from '../store/useThemeStore';

const Welcome = () => {
    const navigate = useNavigate();
    const { mode } = useThemeStore();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 10 }
        }
    };

    return (
        <div className="min-h-screen bg-theme-bg text-theme-text relative overflow-hidden font-sans selection:bg-salm-pink selection:text-white transition-colors duration-300 bg-noise">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Ambient Background - Improved with nicer blurring */}
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full blur-[120px] ${mode === 'dark' ? 'bg-salm-blue/30' : 'bg-salm-blue/10'}`}
            />
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className={`absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[120px] ${mode === 'dark' ? 'bg-salm-purple/20' : 'bg-salm-purple/10'}`}
            />

            {/* Navbar */}
            <nav className="relative z-10 w-full max-w-[1200px] mx-auto p-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-salm-pink to-salm-purple rounded-full flex items-center justify-center shadow-lg shadow-salm-pink/20">
                        <Activity className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-semibold tracking-tight text-theme-text">Fallonava.</span>
                </div>
                <button
                    onClick={() => navigate('/login')}
                    className="px-5 py-2 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/20 transition-all text-sm font-medium text-gray-800 dark:text-white shadow-sm"
                >
                    Login
                </button>
            </nav>

            {/* Hero Section */}
            <motion.main
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center px-4"
            >
                <motion.div variants={itemVariants}>
                    <span className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-gradient-to-r from-salm-blue/10 to-salm-purple/10 border border-salm-blue/20 text-salm-blue text-xs font-medium tracking-wide mb-6 backdrop-blur-md dark:from-salm-blue/20 dark:to-salm-purple/20 dark:border-white/10 shadow-sm">
                        <Zap size={12} className="text-yellow-500 fill-yellow-500" />
                        HOSPITAL MANAGEMENT SYSTEM v2.0
                    </span>
                </motion.div>

                <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tighter mb-6 leading-normal py-4 drop-shadow-sm">
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-500 dark:from-white dark:to-white/50">Healthcare</span>
                    <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-salm-blue via-salm-purple to-salm-pink animate-gradient-x background-animate">Reimagined.</span>
                </motion.h1>

                <motion.p variants={itemVariants} className="max-w-xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed font-medium">
                    Experience the future of medical administration. Seamlessly manage patients, doctors, and schedules with an interface designed for humans.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="group relative px-8 py-4 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black font-semibold hover:scale-105 transition-all shadow-xl shadow-gray-900/10 dark:shadow-white/10 flex items-center gap-2 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-[-20deg]"></div>
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
                </motion.div>

                {/* Floating Cards (Decorative) */}
                <motion.div
                    initial={{ opacity: 0, x: -50, rotate: -6 }}
                    animate={{ opacity: 1, x: 0, y: [0, -20, 0], rotate: -6 }}
                    transition={{
                        opacity: { delay: 0.5, duration: 0.8 },
                        x: { delay: 0.5, duration: 0.8, type: "spring" },
                        y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="absolute top-[20%] left-[5%] lg:left-[10%] p-4 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl hidden lg:block"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-green-500 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">System Status</p>
                            <p className="text-sm font-bold text-green-600 dark:text-green-400">Online</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 50, rotate: 6 }}
                    animate={{ opacity: 1, x: 0, y: [0, -20, 0], rotate: 6 }}
                    transition={{
                        opacity: { delay: 0.7, duration: 0.8 },
                        x: { delay: 0.7, duration: 0.8, type: "spring" },
                        y: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="absolute bottom-[20%] right-[5%] lg:right-[10%] p-4 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl hidden lg:block"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Security</p>
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Protected</p>
                        </div>
                    </div>
                </motion.div>
            </motion.main>

            {/* Footer */}
            <footer className="relative z-10 w-full text-center py-8 text-xs text-gray-500 dark:text-gray-600">
                <p>&copy; 2024 Fallonava. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Welcome;
