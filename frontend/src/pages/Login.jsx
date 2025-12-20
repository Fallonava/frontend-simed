import React, { useRef, useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import FallonavaLogo from '../components/FallonavaLogo';
import { motion, AnimatePresence } from 'framer-motion';

// Separate Background Component to prevent Re-renders
const AnimatedBackground = memo(() => (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-[100vw] h-[100vw] bg-purple-200/30 dark:bg-purple-900/10 rounded-full blur-3xl animate-blob-spin opacity-40 ml-10 mt-10" />
        <div className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-pink-200/30 dark:bg-pink-900/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob-bounce opacity-40" />
        <div className="absolute -bottom-1/2 left-1/4 w-[90vw] h-[90vw] bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob-bounce opacity-40 delay-1000" />
    </div>
));

const Login = () => {
    // Uncontrolled Inputs for maximum performance
    const usernameRef = useRef('');
    const passwordRef = useRef('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(usernameRef.current.value, passwordRef.current.value);
        if (success) {
            navigate('/menu');
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 font-sans overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
            <AnimatedBackground />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="glass-panel rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] p-8 md:p-10">

                    <div className="text-center mb-10">
                        <div className="inline-block relative mb-6">
                            <FallonavaLogo className="w-24 h-24 mx-auto drop-shadow-2xl" />
                        </div>

                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white mb-2 tracking-tight">
                            Fallonava
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide uppercase opacity-80">
                            Orchestrating Healthcare Excellence
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-50/80 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-6 text-sm flex items-center gap-3 border border-red-100 dark:border-red-900/30 backdrop-blur-md"
                            >
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                                <span>{typeof error === 'string' ? error : (error?.message || JSON.stringify(error))}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1 uppercase tracking-wider">Username</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors duration-300">
                                    <User size={20} />
                                </span>
                                <input
                                    ref={usernameRef} // Uncontrolled Input
                                    type="text"
                                    required
                                    className="w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all duration-300 font-medium text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1 uppercase tracking-wider">Password</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors duration-300">
                                    <Lock size={20} />
                                </span>
                                <input
                                    ref={passwordRef} // Uncontrolled Input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-12 py-4 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all duration-300 font-medium text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-purple-500/20 active:scale-[0.98] transition-all transform group
                                ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-2xl hover:shadow-purple-500/30'}
                            `}
                        >
                            <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full duration-1000 ease-in-out -skew-x-12 -translate-x-full transition-transform" />
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isLoading ? 'Authenticating...' : (
                                    <>Sign In <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </span>
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 grid grid-cols-2 gap-4">
                        <button onClick={() => navigate('/kiosk')} className="p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition flex flex-col items-center gap-2 group">
                            <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">🖥️</span>
                            <span className="text-xs font-bold text-gray-500 group-hover:text-purple-500">Kiosk Mode</span>
                        </button>
                        <button onClick={() => navigate('/counter')} className="p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition flex flex-col items-center gap-2 group">
                            <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">📺</span>
                            <span className="text-xs font-bold text-gray-500 group-hover:text-purple-500">TV Display</span>
                        </button>
                    </div>
                </div>
            </motion.div>

            <div className="absolute bottom-6 text-center w-full text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                &copy; {new Date().getFullYear()} Fallonava System
            </div>
        </div>
    );
};

export default Login;
