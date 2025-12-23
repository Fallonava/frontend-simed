import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Zap, AlertTriangle } from 'lucide-react';

const GCSCalculator = () => {
    const [e, setE] = useState(4);
    const [v, setV] = useState(5);
    const [m, setM] = useState(6);

    const total = e + v + m;
    const getInterpretation = () => {
        if (total >= 13) return { text: 'Mild Brain Injury', color: 'text-green-500' };
        if (total >= 9) return { text: 'Moderate Brain Injury', color: 'text-yellow-500' };
        return { text: 'Severe Brain Injury (Coma)', color: 'text-red-500' };
    };

    const interpretation = getInterpretation();

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600">
                    <Zap size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black">GCS Calculator</h3>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Glasgow Coma Scale</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Eye Opening (E)</label>
                    <select value={e} onChange={val => setE(Number(val.target.value))} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold outline-none">
                        <option value={4}>4 - Spontaneous</option>
                        <option value={3}>3 - To Sound</option>
                        <option value={2}>2 - To Pressure</option>
                        <option value={1}>1 - None</option>
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Verbal Response (V)</label>
                    <select value={v} onChange={val => setV(Number(val.target.value))} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold outline-none">
                        <option value={5}>5 - Oriented</option>
                        <option value={4}>4 - Confused</option>
                        <option value={3}>3 - Inappropriate Words</option>
                        <option value={2}>2 - Incomprehensible Sounds</option>
                        <option value={1}>1 - None</option>
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Motor Response (M)</label>
                    <select value={m} onChange={val => setM(Number(val.target.value))} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold outline-none">
                        <option value={6}>6 - Obeys Commands</option>
                        <option value={5}>5 - Localising Pain</option>
                        <option value={4}>4 - Normal Flexion (Withdrawal)</option>
                        <option value={3}>3 - Abnormal Flexion (Decorticate)</option>
                        <option value={2}>2 - Extension (Decerebrate)</option>
                        <option value={1}>1 - None</option>
                    </select>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <span className="text-4xl font-black text-slate-900 dark:text-white">{total}</span>
                        <span className="text-sm font-bold text-slate-400 ml-2">/ 15</span>
                    </div>
                    <div className={`text-right font-black ${interpretation.color}`}>
                        {interpretation.text}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ClinicalCalculators = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GCSCalculator />
            {/* Future: APACHE II, SOFA */}
            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-[40px] p-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Calculator size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-400">APACHE II</h3>
                <p className="text-xs text-slate-400 mt-2">Coming Soon</p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-[40px] p-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Calculator size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-400">SOFA Score</h3>
                <p className="text-xs text-slate-400 mt-2">Coming Soon</p>
            </div>
        </div>
    );
};

export default ClinicalCalculators;
