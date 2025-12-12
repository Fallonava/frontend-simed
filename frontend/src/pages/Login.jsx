import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { Lock, User, ArrowRight } from 'lucide-react';
import FallonavaLogo from '../components/FallonavaLogo';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(username, password);
        if (success) {
            navigate('/menu');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20
            }
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 font-sans overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
            {/* Animated Background Mesh */}
            <div className="absolute inset-0 overflow-hidden z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/2 -left-1/2 w-[100vw] h-[100vw] bg-purple-200/30 dark:bg-purple-900/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        x: [0, 100, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-pink-200/30 dark:bg-pink-900/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        y: [0, -50, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-1/2 left-1/4 w-[90vw] h-[90vw] bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen"
                />
            </div>

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] p-8 border border-white/50 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5">

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="text-center mb-8"
                    >
                        <motion.div variants={itemVariants} className="inline-block relative">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <FallonavaLogo className="w-28 h-28 mx-auto mb-6 drop-shadow-2xl" />
                            </motion.div>
                            <div className="absolute inset-0 bg-salm-purple/20 blur-2xl -z-10 rounded-full scale-150 opacity-50" />
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white mb-2 tracking-tight">
                            Fallonava
                        </motion.h1>
                        <motion.p variants={itemVariants} className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide uppercase opacity-80">
                            Orchestrating Healthcare Excellence
                        </motion.p>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -20 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -20 }}
                                className="bg-red-50/50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-6 text-sm flex items-center gap-3 border border-red-100 dark:border-red-900/20 backdrop-blur-sm"
                            >
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span>{typeof error === 'string' ? error : (error?.message || JSON.stringify(error))}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.form
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        <motion.div variants={itemVariants}>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1 uppercase tracking-wider">Username</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-salm-purple transition-colors duration-300" />
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:ring-[3px] focus:ring-salm-purple/10 focus:border-salm-purple focus:bg-white dark:focus:bg-black/20 outline-none transition-all duration-300 font-medium text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-inner"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1 uppercase tracking-wider">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-salm-purple transition-colors duration-300" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-12 py-4 focus:ring-[3px] focus:ring-salm-purple/10 focus:border-salm-purple focus:bg-white dark:focus:bg-black/20 outline-none transition-all duration-300 font-medium text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-inner"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors p-1"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </motion.div>

                        <motion.button
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, translateY: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className={`w-full relative overflow-hidden bg-gradient-to-r from-salm-purple to-salm-pink text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-salm-purple/30 transition-all
                                ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-2xl hover:shadow-salm-purple/40'}
                            `}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Please wait...</span>
                                    </>
                                ) : (
                                    <>
                                        Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                            {/* Button Shine Effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
                        </motion.button>
                    </motion.form>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 grid grid-cols-2 gap-4"
                    >
                        <motion.button
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(0,0,0,0.02)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/kiosk')}
                            className="p-4 rounded-2xl border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-salm-purple/30 hover:text-salm-purple transition-all text-sm font-medium flex flex-col items-center gap-2 group"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform duration-300 grayscale group-hover:grayscale-0">🖥️</span>
                            <span className="group-hover:font-semibold">Kiosk Mode</span>
                        </motion.button>
                        <motion.button
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(0,0,0,0.02)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/counter')}
                            className="p-4 rounded-2xl border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-salm-purple/30 hover:text-salm-purple transition-all text-sm font-medium flex flex-col items-center gap-2 group"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform duration-300 grayscale group-hover:grayscale-0">📺</span>
                            <span className="group-hover:font-semibold">TV Display</span>
                        </motion.button>
                    </motion.div>
                </div>
            </motion.div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1 }}
                className="absolute bottom-6 text-center w-full text-xs text-gray-400 dark:text-gray-600"
            >
                &copy; {new Date().getFullYear()} Fallonava System. All rights reserved.
            </motion.div>
        </div>
    );
};

export default Login;
