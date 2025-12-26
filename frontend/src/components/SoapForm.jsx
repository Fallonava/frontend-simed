import React, { useState, useEffect, useImperativeHandle, forwardRef, memo } from 'react';
import { Mic, MicOff, Search, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const SoapForm = forwardRef(({ initialData, onSubmit, children, dispositionSlot }, ref) => {
    const [formData, setFormData] = useState({
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
        systolic: '',
        diastolic: '',
        heart_rate: '',
        temperature: '',
        weight: '',
        height: ''
    });

    const [isListening, setIsListening] = useState(null);

    // Sync with parent data changes (e.g. changing patient)
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData
            }));
        }
    }, [initialData]);

    // Expose data to parent via Ref
    useImperativeHandle(ref, () => ({
        getData: () => formData,
        reset: () => setFormData({
            subjective: '',
            objective: '',
            assessment: '',
            plan: '',
            systolic: '',
            diastolic: '',
            heart_rate: '',
            temperature: '',
            weight: '',
            height: ''
        })
    }));

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const startListening = (field) => {
        if (!('webkitSpeechRecognition' in window)) {
            toast.error("Browser does not support Voice Recognition.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = 'id-ID'; // Indonesian Support
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(field);
            toast.loading("Listening... (Speak now)", { id: 'voice-toast' });
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setFormData(prev => ({
                ...prev,
                [field]: prev[field] ? `${prev[field]} ${transcript}` : transcript
            }));
            toast.dismiss('voice-toast');
            toast.success("Transcribed!");
        };

        recognition.onerror = (event) => {
            console.error(event.error);
            setIsListening(null);
            toast.dismiss('voice-toast');
        };

        recognition.onend = () => {
            setIsListening(null);
        };

        recognition.start();
    };

    return (
        <div className="space-y-8">
            {/* VITALS (Tanda Vital) */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-400 uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                    <Activity size={16} /> Vital Signs (Tanda Vital)
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Systolic</label>
                        <input type="number" placeholder="120" className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold text-center"
                            value={formData.systolic || ''} onChange={e => updateField('systolic', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Diastolic</label>
                        <input type="number" placeholder="80" className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold text-center"
                            value={formData.diastolic || ''} onChange={e => updateField('diastolic', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">HR (bpm)</label>
                        <input type="number" placeholder="80" className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold text-center"
                            value={formData.heart_rate || ''} onChange={e => updateField('heart_rate', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Temp (°C)</label>
                        <input type="number" step="0.1" placeholder="36.5" className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold text-center"
                            value={formData.temperature || ''} onChange={e => updateField('temperature', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Weight (kg)</label>
                        <input type="number" step="0.1" placeholder="60" className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold text-center"
                            value={formData.weight || ''} onChange={e => updateField('weight', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Height (cm)</label>
                        <input type="number" placeholder="170" className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold text-center"
                            value={formData.height || ''} onChange={e => updateField('height', e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT COLUMN: SOAP */}
                <div className="space-y-6">
                    {/* Subjective */}
                    <div className="space-y-3 relative">
                        <div className="flex justify-between items-center">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">S</span>
                                Subjective (Keluhan)
                            </label>
                            <button
                                type="button"
                                onClick={() => startListening('subjective')}
                                className={`p-2 rounded-full transition-colors ${isListening === 'subjective' ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-blue-500'}`}
                            >
                                {isListening === 'subjective' ? <MicOff size={16} /> : <div className="flex items-center gap-1 text-xs font-bold"><Mic size={14} /> Dictate</div>}
                            </button>
                        </div>
                        <textarea
                            className="w-full h-32 p-5 rounded-[24px] bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 transition-all text-lg resize-none shadow-inner"
                            placeholder="Keluhan utama pasien..."
                            value={formData.subjective}
                            onChange={e => updateField('subjective', e.target.value)}
                            required
                        />
                    </div>

                    {/* Objective */}
                    <div className="space-y-3 relative">
                        <div className="flex justify-between items-center">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs">O</span>
                                Objective (Pemeriksaan)
                            </label>
                            <button
                                type="button"
                                onClick={() => startListening('objective')}
                                className={`p-2 rounded-full transition-colors ${isListening === 'objective' ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-red-500'}`}
                            >
                                {isListening === 'objective' ? <MicOff size={16} /> : <div className="flex items-center gap-1 text-xs font-bold"><Mic size={14} /> Dictate</div>}
                            </button>
                        </div>
                        <textarea
                            className="w-full h-32 p-5 rounded-[24px] bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-red-500 transition-all text-lg resize-none shadow-inner"
                            placeholder="Hasil pemeriksaan fisik..."
                            value={formData.objective}
                            onChange={e => updateField('objective', e.target.value)}
                            required
                        />
                    </div>

                    {/* Assessment */}
                    <div className="space-y-3 relative">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                            <span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-xs">A</span>
                            Assessment (Diagnosa ICD-10)
                        </label>
                        <div className="relative">
                            {/* <Search className="absolute left-4 top-4 text-gray-400" size={20} /> */}
                            <textarea
                                placeholder="Diagnosa kerja / masalah..."
                                className="w-full h-24 p-5 rounded-[24px] bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-yellow-500 text-lg shadow-inner resize-none"
                                value={formData.assessment}
                                onChange={(e) => updateField('assessment', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Plan */}
                    <div className="space-y-3 relative">
                        <div className="flex justify-between items-center">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                                <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">P</span>
                                Plan (Terapi & Tindakan)
                            </label>
                            <button
                                type="button"
                                onClick={() => startListening('plan')}
                                className={`p-2 rounded-full transition-colors ${isListening === 'plan' ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-green-500'}`}
                            >
                                {isListening === 'plan' ? <MicOff size={16} /> : <div className="flex items-center gap-1 text-xs font-bold"><Mic size={14} /> Dictate</div>}
                            </button>
                        </div>
                        <textarea
                            className="w-full h-32 p-5 rounded-[24px] bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-green-500 transition-all text-lg resize-none shadow-inner"
                            placeholder="Rencana terapi..."
                            value={formData.plan}
                            onChange={e => updateField('plan', e.target.value)}
                            required
                        />
                    </div>

                    {/* Disposition Slot */}
                    {dispositionSlot}
                </div>

                {/* RIGHT COLUMN */}
                {children}
            </div>
        </div>
    );
});

export default memo(SoapForm);
