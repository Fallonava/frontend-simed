import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Monitor, LayoutDashboard, Calendar, Users, Moon, Sun, X, Activity, DollarSign, User, Pill, FileText, Siren, Bed, ClipboardPlus } from 'lucide-react';
import useThemeStore from '../store/useThemeStore';
import api from '../services/api';

const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const { mode, toggleTheme } = useThemeStore();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [patientResults, setPatientResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Toggle with Cmd+K or Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Static Actions List
    const staticActions = [
        { id: 'home', icon: <Activity />, label: 'Go to Welcome Page', shortcut: 'Home', perform: () => navigate('/') },
        { id: 'dashboard', icon: <LayoutDashboard />, label: 'Go to Admin Dashboard', perform: () => navigate('/admin/dashboard') },
        { id: 'reg_rj', icon: <ClipboardPlus />, label: 'Pendaftaran Rawat Jalan', perform: () => navigate('/registration') },
        { id: 'reg_igd', icon: <Siren />, label: 'Instalasi Gawat Darurat (IGD)', perform: () => navigate('/registration/igd') },
        { id: 'reg_ranap', icon: <Bed />, label: 'Admisi Rawat Inap', perform: () => navigate('/registration/ranap') },
        { id: 'pharmacy', icon: <Pill />, label: 'Apotek (Pharmacy)', perform: () => navigate('/pharmacy') },
        { id: 'kiosk', icon: <Monitor />, label: 'Open Kiosk Mode', perform: () => navigate('/kiosk') },
        { id: 'counter', icon: <Users />, label: 'Open Counter Display', perform: () => navigate('/counter') },
        { id: 'theme', icon: mode === 'dark' ? <Sun /> : <Moon />, label: `Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`, shortcut: 'T', perform: () => toggleTheme() },
    ];

    // Dynamic Search Effect
    useEffect(() => {
        if (!isOpen || query.length < 2) {
            setPatientResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                // Assuming backend supports query param 'q' or 'search'
                const response = await api.get(`/patients?search=${query}&limit=5`);
                // Backend usually returns { response: [...] } or just [...]
                const patients = response.data.response || response.data || [];

                // Map to action format
                const mappedPatients = Array.isArray(patients) ? patients.map(p => ({
                    id: `patient_${p.id}`,
                    icon: <User className="text-blue-500" />,
                    label: `${p.name} (${p.no_rm})`,
                    subLabel: p.nik,
                    perform: () => navigate(`/admin/patients/${p.id}`), // Or open modal
                    type: 'patient'
                })) : [];

                setPatientResults(mappedPatients);
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setLoading(false);
            }
        }, 300); // Debounce 300ms

        return () => clearTimeout(timer);
    }, [query, isOpen]);

    // Combine Filters
    const filteredStatic = staticActions.filter(action =>
        action.label.toLowerCase().includes(query.toLowerCase())
    );

    const allActions = [...filteredStatic, ...patientResults];

    // Keyboard navigation
    useEffect(() => {
        const handleNav = (e) => {
            if (!isOpen) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % allActions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + allActions.length) % allActions.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (allActions[selectedIndex]) {
                    allActions[selectedIndex].perform();
                    setIsOpen(false);
                    setQuery('');
                }
            }
        };
        window.addEventListener('keydown', handleNav);
        return () => window.removeEventListener('keydown', handleNav);
    }, [isOpen, allActions, selectedIndex]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[70vh]"
                    >
                        {/* Search Input */}
                        <div className="flex items-center px-4 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
                            <Search className={`w-5 h-5 mr-3 transition-colors ${loading ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Where would you like to go? (or type patient name)..."
                                className="flex-1 bg-transparent border-none outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 text-lg"
                                value={query}
                                onChange={e => {
                                    setQuery(e.target.value);
                                    setSelectedIndex(0);
                                }}
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 font-medium">ESC</span>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="overflow-y-auto py-2 flex-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-600">
                            {allActions.length === 0 ? (
                                <div className="px-4 py-12 text-center text-gray-500">
                                    <p>No results found.</p>
                                    <p className="text-xs mt-1 text-gray-400">Try "Registration", "Apotek", or a patient name.</p>
                                </div>
                            ) : (
                                <div>
                                    {/* Optional: Headers for sections could go here if we separated them */}
                                    {allActions.map((action, index) => (
                                        <div
                                            key={action.id}
                                            onClick={() => {
                                                action.perform();
                                                setIsOpen(false);
                                                setQuery('');
                                            }}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-all ${index === selectedIndex
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 pl-[12px]' // Compensate padding
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className={`p-2 rounded-lg shrink-0 ${index === selectedIndex ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                    {action.icon}
                                                </div>
                                                <div className="flex flex-col truncate">
                                                    <span className={`font-medium truncate ${index === selectedIndex ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'
                                                        }`}>
                                                        {action.label}
                                                    </span>
                                                    {action.subLabel && (
                                                        <span className="text-xs text-gray-400 truncate">{action.subLabel}</span>
                                                    )}
                                                </div>
                                            </div>
                                            {action.shortcut && (
                                                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded hidden sm:block">{action.shortcut}</span>
                                            )}
                                            {action.type === 'patient' && (
                                                <span className="text-[10px] uppercase tracking-wider text-blue-500 font-bold bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded">PATIENT</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-400 shrink-0">
                            <div className="flex gap-4">
                                <span className="flex items-center gap-1"><kbd className="font-sans bg-white dark:bg-gray-700 px-1 rounded shadow-sm border border-gray-200 dark:border-gray-600">↑↓</kbd> navigate</span>
                                <span className="flex items-center gap-1"><kbd className="font-sans bg-white dark:bg-gray-700 px-1 rounded shadow-sm border border-gray-200 dark:border-gray-600">↵</kbd> select</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className={loading ? "opacity-100" : "opacity-0"}>Parsing...</span>
                                <Activity className="w-3 h-3 text-blue-500" />
                                <span className="font-semibold text-gray-500">Fallonava AI</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
