import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { Lock, User } from 'lucide-react';
import appIcon from '../assets/app_icon.png';

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

    return (
        <div className="min-h-screen bg-theme-bg flex items-center justify-center p-4 font-sans text-theme-text transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-100 dark:border-gray-700 backdrop-blur-xl">
                <div className="text-center mb-8">
                    <img src={appIcon} alt="SiMed Logo" className="w-20 h-20 rounded-2xl mx-auto mb-4 shadow-xl shadow-salm-purple/20 hover:scale-105 transition-transform duration-300" />
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome Back</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Sign in to access the queue system</p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 border border-red-100 dark:border-red-900/30 animate-pulse">
                        <span className="font-bold">Error:</span> {typeof error === 'string' ? error : (error?.message || JSON.stringify(error))}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Username</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-salm-purple transition-colors" />
                            <input
                                type="text"
                                required
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-salm-purple/20 focus:border-salm-purple outline-none transition-all font-medium text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-salm-purple transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-12 pr-12 py-3.5 focus:ring-2 focus:ring-salm-purple/20 focus:border-salm-purple outline-none transition-all font-medium text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors"
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
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-salm-gradient text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-salm-purple/20 transition-all active:scale-[0.98]
                            ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-95 hover:shadow-xl hover:-translate-y-0.5'}
                        `}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Logging in...
                            </div>
                        ) : 'Sign In'}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/kiosk')}
                        className="p-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-colors text-sm font-medium flex flex-col items-center gap-1 group"
                    >
                        <span className="text-2xl group-hover:scale-110 transition-transform">🖥️</span>
                        Kiosk Mode
                    </button>
                    <button
                        onClick={() => navigate('/counter')}
                        className="p-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-colors text-sm font-medium flex flex-col items-center gap-1 group"
                    >
                        <span className="text-2xl group-hover:scale-110 transition-transform">📺</span>
                        TV Display
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
