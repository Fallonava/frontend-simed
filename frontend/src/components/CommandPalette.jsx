import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Monitor, LayoutDashboard, Calendar, Users, Moon, Sun, X, Activity, DollarSign } from 'lucide-react';
import useThemeStore from '../store/useThemeStore';

const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const { mode, toggleTheme } = useThemeStore();
    const [selectedIndex, setSelectedIndex] = useState(0);

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

    // Actions List
    const actions = [
        {
            id: 'home',
            icon: <Activity />,
            label: 'Go to Welcome Page',
            shortcut: 'Home',
            perform: () => navigate('/')
        },
        {
            id: 'dashboard',
            icon: <LayoutDashboard />,
            label: 'Go to Admin Dashboard',
            shortcut: 'G D',
            perform: () => navigate('/admin/dashboard')
        },
        {
            id: 'kiosk',
            icon: <Monitor />,
            label: 'Open Kiosk Mode',
            shortcut: 'G K',
            perform: () => navigate('/kiosk')
        },
        {
            id: 'counter',
            icon: <Users />,
            label: 'Open Counter Display',
            shortcut: 'G C',
            perform: () => navigate('/counter')
        },
        {
            id: 'theme',
            icon: mode === 'dark' ? <Sun /> : <Moon />,
            label: `Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`,
            shortcut: 'T',
            perform: () => toggleTheme()
        },
    ];

    // Filter logic
    const filteredActions = actions.filter(action =>
        action.label.toLowerCase().includes(query.toLowerCase())
    );

    // Keyboard navigation
    useEffect(() => {
        const handleNav = (e) => {
            if (!isOpen) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredActions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredActions[selectedIndex]) {
                    filteredActions[selectedIndex].perform();
                    setIsOpen(false);
                    setQuery('');
                }
            }
        };
        window.addEventListener('keydown', handleNav);
        return () => window.removeEventListener('keydown', handleNav);
    }, [isOpen, filteredActions, selectedIndex]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh] px-4">
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
                        className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
                    >
                        {/* Search Input */}
                        <div className="flex items-center px-4 py-4 border-b border-gray-100 dark:border-gray-700">
                            <Search className="w-5 h-5 text-gray-400 mr-3" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Type a command or search..."
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
                        <div className="max-h-[300px] overflow-y-auto py-2">
                            {filteredActions.length === 0 ? (
                                <div className="px-4 py-8 text-center text-gray-500">
                                    No results found.
                                </div>
                            ) : (
                                filteredActions.map((action, index) => (
                                    <div
                                        key={action.id}
                                        onClick={() => {
                                            action.perform();
                                            setIsOpen(false);
                                            setQuery('');
                                        }}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${index === selectedIndex
                                                ? 'bg-theme-purple/10 dark:bg-theme-purple/20'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${index === selectedIndex ? 'text-theme-purple' : 'text-gray-500 dark:text-gray-400'
                                                }`}>
                                                {action.icon}
                                            </div>
                                            <span className={`font-medium ${index === selectedIndex ? 'text-theme-purple dark:text-theme-purple' : 'text-gray-700 dark:text-gray-200'
                                                }`}>
                                                {action.label}
                                            </span>
                                        </div>
                                        {action.shortcut && (
                                            <span className="text-xs text-gray-400">{action.shortcut}</span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-400">
                            <div className="flex gap-4">
                                <span>Use <strong>↑↓</strong> to navigate</span>
                                <span><strong>Enter</strong> to select</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                <span>SiMed Pro</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
