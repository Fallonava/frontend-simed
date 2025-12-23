import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Maximize2, Minimize2, Sun, Contrast,
    Move, ZoomIn, Scissors, Layers,
    ChevronLeft, ChevronRight, X, Grid,
    Activity, Shield, Download, Share2
} from 'lucide-react';

const PACSViewer = ({ studyId, patientName, onClose }) => {
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [currentSlice, setCurrentSlice] = useState(12);
    const [totalSlices, setTotalSlices] = useState(24);
    const [activeTool, setActiveTool] = useState('WINDOW'); // WINDOW, ZOOM, PAN, MEASURE
    const [isFullScreen, setIsFullScreen] = useState(false);

    // MOCK DICOM Slices (Using generated medical imagery patterns)
    const slices = Array.from({ length: totalSlices }, (_, i) => ({
        id: i,
        url: `https://api.placeholder.com/600/600?text=DICOM+Slice+${i + 1}`
    }));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`
                fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden
                ${isFullScreen ? '' : 'm-4 lg:m-10 rounded-[40px] border border-white/10 shadow-2xl'}
            `}
        >
            {/* TOOLBAR HEADER */}
            <div className="px-6 py-4 bg-slate-900 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-sm tracking-tight">PACS INTEGRATED VIEWER</h2>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                            Study: {studyId || 'STUDY-XR-092'} • {patientName || 'PATIENT NAME'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                    {[
                        { id: 'WINDOW', icon: Sun, label: 'W/L' },
                        { id: 'ZOOM', icon: ZoomIn, label: 'Zoom' },
                        { id: 'PAN', icon: Move, label: 'Pan' },
                        { id: 'MEASURE', icon: Scissors, label: 'Measure' },
                        { id: 'LAYERS', icon: Layers, label: 'Stack' },
                    ].map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all
                                ${activeTool === tool.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'}
                            `}
                        >
                            <tool.icon size={16} />
                            <span className="hidden lg:inline">{tool.label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold tracking-widest uppercase border border-emerald-500/20">
                        <Shield size={12} /> Encrypted Stream
                    </div>
                    <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-2 text-slate-400 hover:text-white transitio">
                        {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                    <button onClick={onClose} className="p-2 bg-white/5 hover:bg-rose-500 text-white rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* SIDEBAR - SERIES NAVIGATION */}
                <div className="w-64 bg-slate-900/50 border-r border-white/5 p-4 flex flex-col gap-4 overflow-y-auto">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-2">Series Explorer</h3>
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`p-3 rounded-2xl border ${i === 1 ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 hover:bg-white/5'} cursor-pointer group`}>
                            <div className="aspect-square bg-black rounded-lg mb-2 overflow-hidden">
                                <img
                                    src={`https://api.placeholder.com/200/200?text=Series+${i}`}
                                    className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                                    alt="thumb"
                                />
                            </div>
                            <div className="text-[10px] font-bold text-white uppercase tracking-tight">T2-Axial {i === 1 && '(Active)'}</div>
                            <div className="text-[9px] text-slate-500">24 Slices • 512x512</div>
                        </div>
                    ))}
                </div>

                {/* MAIN VIEWPORT */}
                <div className="flex-1 relative bg-black flex items-center justify-center p-8 overflow-hidden">
                    <motion.div
                        key={currentSlice}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative max-w-full max-h-full aspect-square bg-slate-800 shadow-2xl overflow-hidden cursor-crosshair"
                        style={{
                            filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                        }}
                    >
                        {/* THE IMAGE (Simulated) */}
                        <div className="w-[800px] h-[800px] flex items-center justify-center text-slate-600 bg-slate-950">
                            <div className="absolute inset-0 border border-white/5 pointer-events-none" />
                            {/* Visual Grid Overlay */}
                            <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-10 pointer-events-none">
                                {Array.from({ length: 64 }).map((_, i) => (
                                    <div key={i} className="border border-white/20" />
                                ))}
                            </div>

                            {/* Anatomical Labels */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-slate-500 text-xs font-bold uppercase">S</div>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-slate-500 text-xs font-bold uppercase">I</div>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold uppercase">R</div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold uppercase">L</div>

                            {/* Slice Indicator */}
                            <div className="absolute bottom-6 right-6 text-blue-500 font-mono text-sm bg-black/50 px-3 py-1 rounded-lg backdrop-blur-md">
                                SLICE: {currentSlice} / {totalSlices}
                            </div>

                            {/* Patient Info Overlay */}
                            <div className="absolute top-6 left-6 text-left pointer-events-none">
                                <p className="text-white text-xs font-bold uppercase tracking-widest">{patientName || 'PATIENT NAME'}</p>
                                <p className="text-slate-500 text-[9px] font-bold">MRN: 092831 • AGE: 42Y • SEX: M</p>
                                <p className="text-slate-500 text-[9px] font-bold mt-2">TR: 2500ms • TE: 80ms • FOV: 240mm</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* HUD CONTROLS */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-white/10 flex items-center gap-10">
                        <div className="flex items-center gap-4">
                            <Contrast size={16} className="text-slate-500" />
                            <input
                                type="range"
                                min="50" max="200"
                                value={contrast}
                                onChange={(e) => setContrast(e.target.value)}
                                className="w-32 accent-blue-600"
                            />
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Navigation</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCurrentSlice(Math.max(1, currentSlice - 1))} className="p-2 hover:bg-white/5 rounded-lg text-white">
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="text-white font-mono text-sm px-4">
                                    {String(currentSlice).padStart(2, '0')}
                                </div>
                                <button onClick={() => setCurrentSlice(Math.min(totalSlices, currentSlice + 1))} className="p-2 hover:bg-white/5 rounded-lg text-white">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* INFO PANEL */}
                <div className="w-80 bg-slate-900/50 border-l border-white/5 p-6 flex flex-col gap-8">
                    <div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Study Info</h3>
                        <div className="space-y-4">
                            {[
                                { l: 'Modality', v: 'MRI (1.5 Tesla)' },
                                { l: 'Body Part', v: 'LUMBAR SPINE' },
                                { l: 'Acquisition', v: '2025-12-23 14:20' },
                                { l: 'Referring', v: 'Dr. John Doe, Sp.OT' },
                            ].map(item => (
                                <div key={item.l} className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">{item.l}</span>
                                    <span className="text-[10px] text-white font-bold">{item.v}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl hover:bg-blue-600 transition-all gap-2 text-white">
                                <Download size={20} />
                                <span className="text-[10px] font-bold">Export DICOM</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl hover:bg-blue-600 transition-all gap-2 text-white">
                                <Share2 size={20} />
                                <span className="text-[10px] font-bold">Share Study</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-auto p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
                        <p className="text-[10px] text-blue-400 font-bold leading-relaxed italic">
                            "Finding: There is evidence of L4-L5 disc herniation with nerve root encroachment."
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PACSViewer;
