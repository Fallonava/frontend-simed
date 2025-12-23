import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Save, CheckCircle } from 'lucide-react';

const AssessmentForms = ({ studentId, medicalRecordId, type = 'MINI_CEX', onSubmit }) => {
    const [scores, setScores] = useState({
        anamnesis: 0,
        physical_exam: 0,
        clinical_reasoning: 0,
        professionalism: 0,
        counseling: 0
    });
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleScoreChange = (key, val) => {
        setScores(prev => ({ ...prev, [key]: val }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            onSubmit({ type, scores, feedback });
            setIsSubmitting(false);
        }, 1000);
    };

    const criteria = [
        { key: 'anamnesis', label: 'Anamnesis' },
        { key: 'physical_exam', label: 'Pemeriksaan Fisik' },
        { key: 'clinical_reasoning', label: 'Clinical Reasoning' },
        { key: 'professionalism', label: 'Professionalism' },
        { key: 'counseling', label: 'Edukasi & Konseling' }
    ];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 lg:p-12 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-600 shadow-inner">
                    <Star size={32} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-2">Clinical Assessment</h2>
                    <p className="text-slate-500 font-medium">Evaluation Method: {type}</p>
                </div>
            </div>

            <div className="space-y-8">
                {criteria.map((item) => (
                    <div key={item.key} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <span className="font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                <button
                                    key={n}
                                    onClick={() => handleScoreChange(item.key, n)}
                                    className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${scores[item.key] === n
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200'
                                        }`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-xs font-black uppercase text-slate-400 mb-3 block flex items-center gap-2">
                        <MessageSquare size={14} /> Clinical Feedback & Instructions
                    </label>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Berikan masukan konstruktif untuk mahasiswa..."
                        className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all font-medium min-h-[150px]"
                    />
                </div>

                <div className="flex justify-end gap-4 mt-10">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-3"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <CheckCircle size={20} />
                        )}
                        Finalize Assessment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssessmentForms;
