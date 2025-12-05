import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'light';
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <button
            onClick={toggleTheme}
            className="fixed bottom-6 right-6 p-3 rounded-full bg-modern-card border border-modern-text-secondary/20 shadow-lg hover:shadow-xl transition-all duration-300 z-50 group"
            aria-label="Toggle Theme"
        >
            <div className="relative w-6 h-6">
                <Sun
                    className={`absolute inset-0 text-amber-500 transition-all duration-500 rotate-0 scale-100 ${theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : ''}`}
                    size={24}
                />
                <Moon
                    className={`absolute inset-0 text-modern-purple transition-all duration-500 rotate-90 scale-0 opacity-0 ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : ''}`}
                    size={24}
                />
            </div>
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-modern-card text-modern-text text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
            </span>
        </button>
    );
};

export default ThemeToggle;
