import React, { useEffect, useState } from 'react';
import { Moon, Sun, Palette, X, Check } from 'lucide-react';
import useThemeStore from '../store/useThemeStore';

const ThemeToggle = () => {
    const { mode, type, primaryColor, secondaryColor, setMode, setType, setPrimaryColor, setSecondaryColor, resetTheme } = useThemeStore();
    const [isOpen, setIsOpen] = useState(false);

    // Sync CSS Variables with Store
    useEffect(() => {
        const root = document.documentElement;

        // Mode (Light/Dark)
        if (mode === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Colors
        root.style.setProperty('--color-primary', primaryColor);
        root.style.setProperty('--color-secondary', secondaryColor);

        // Gradient or Solid Logic
        if (type === 'gradient') {
            root.style.setProperty('--bg-gradient-start', primaryColor);
            root.style.setProperty('--bg-gradient-end', secondaryColor);
        } else {
            // If solid, make both ends the same or handle via class
            root.style.setProperty('--bg-gradient-start', primaryColor);
            root.style.setProperty('--bg-gradient-end', primaryColor);
        }

    }, [mode, type, primaryColor, secondaryColor]);

    const presets = [
        { name: 'Salm (Default)', primary: '#738fbd', secondary: '#cc8eb1' },
        { name: 'Ocean', primary: '#2E3192', secondary: '#1BFFFF' },
        { name: 'Sunset', primary: '#FF512F', secondary: '#DD2476' },
        { name: 'Emerald', primary: '#11998e', secondary: '#38ef7d' },
        { name: 'Midnight', primary: '#232526', secondary: '#414345' },
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {/* Panel */}
            {isOpen && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-80 border border-gray-100 dark:border-gray-700 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Palette size={18} />
                            Theme Settings
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Mode Toggle */}
                    <div className="mb-6">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Appearance</p>
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            <button
                                onClick={() => setMode('light')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all text-sm font-medium ${mode === 'light' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                            >
                                <Sun size={16} /> Light
                            </button>
                            <button
                                onClick={() => setMode('dark')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all text-sm font-medium ${mode === 'dark' ? 'bg-gray-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                            >
                                <Moon size={16} /> Dark
                            </button>
                        </div>
                    </div>

                    {/* Style Type */}
                    <div className="mb-6">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Style</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setType('gradient')}
                                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${type === 'gradient' ? 'border-theme-primary bg-theme-primary/10 text-theme-primary' : 'border-gray-200 text-gray-500 dark:border-gray-600'}`}
                            >
                                Gradient
                            </button>
                            <button
                                onClick={() => setType('solid')}
                                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${type === 'solid' ? 'border-theme-primary bg-theme-primary/10 text-theme-primary' : 'border-gray-200 text-gray-500 dark:border-gray-600'}`}
                            >
                                Solid
                            </button>
                        </div>
                    </div>

                    {/* Color Pickers */}
                    <div className="mb-6 space-y-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Custom Colors</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Primary</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 font-mono">{primaryColor}</span>
                                <input
                                    type="color"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="w-8 h-8 rounded-full cursor-pointer border-0 bg-transparent p-0"
                                />
                            </div>
                        </div>
                        {type === 'gradient' && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Secondary</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 font-mono">{secondaryColor}</span>
                                    <input
                                        type="color"
                                        value={secondaryColor}
                                        onChange={(e) => setSecondaryColor(e.target.value)}
                                        className="w-8 h-8 rounded-full cursor-pointer border-0 bg-transparent p-0"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Presets */}
                    <div className="mb-6">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Presets</p>
                        <div className="flex gap-2 flex-wrap">
                            {presets.map((preset) => (
                                <button
                                    key={preset.name}
                                    onClick={() => {
                                        setPrimaryColor(preset.primary);
                                        setSecondaryColor(preset.secondary);
                                    }}
                                    className="w-8 h-8 rounded-full shadow-sm hover:scale-110 transition-transform border border-white/20 relative"
                                    style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})` }}
                                    title={preset.name}
                                >
                                    {primaryColor === preset.primary && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Check size={12} className="text-white drop-shadow-md" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={resetTheme}
                        className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Reset to Default
                    </button>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-4 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 border border-gray-100 dark:border-gray-700"
            >
                <Palette size={24} className={isOpen ? 'text-theme-primary' : ''} />
            </button>
        </div>
    );
};

export default ThemeToggle;
