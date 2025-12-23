import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, AlertCircle } from 'lucide-react';

const DynamicForm = ({ template, onSubmit, initialData = {}, isSubmitting = false }) => {
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState({});

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic Validation
        const newErrors = {};
        const fields = template.schema.fields || template.schema.sections?.flatMap(s => s.fields) || [];

        fields.forEach(field => {
            if (field.required && !formData[field.name]) {
                newErrors[field.name] = `${field.label} wajib diisi`;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit(formData);
    };

    const renderField = (field) => {
        const value = formData[field.name] || '';
        const hasError = !!errors[field.name];

        const baseClass = `w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 transition-all outline-none text-lg font-bold
            ${hasError ? 'border-red-500 focus:ring-red-500' : 'border-transparent focus:border-blue-500'}`;

        return (
            <div key={field.name} className={`flex flex-col gap-2 ${field.width === 'full' ? 'col-span-full' :
                field.width === '1/2' ? 'col-span-1 md:col-span-2' : 'col-span-1'}`}>
                <label className="text-sm font-black uppercase text-slate-400 tracking-widest ml-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>

                {field.type === 'textarea' ? (
                    <textarea
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={`${baseClass} min-h-[120px] resize-none`}
                        placeholder={`Input ${field.label}...`}
                    />
                ) : field.type === 'select' ? (
                    <select
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={baseClass}
                    >
                        <option value="">Pilih...</option>
                        {field.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                ) : field.type === 'checkbox' ? (
                    <div
                        onClick={() => handleChange(field.name, !formData[field.name])}
                        className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all
                            ${formData[field.name] ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400'}`}
                    >
                        <span className="font-bold text-lg">{field.label}</span>
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center
                            ${formData[field.name] ? 'bg-white border-white' : 'border-slate-300'}`}>
                            {formData[field.name] && <div className="w-3 h-3 bg-blue-600 rounded-sm" />}
                        </div>
                    </div>
                ) : (
                    <input
                        type={field.type || 'text'}
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={baseClass}
                        placeholder={`Input ${field.label}...`}
                    />
                )}

                {hasError && (
                    <span className="text-xs font-bold text-red-500 flex items-center gap-1 ml-1">
                        <AlertCircle size={12} /> {errors[field.name]}
                    </span>
                )}
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 lg:p-12 shadow-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-2">{template.name}</h2>
                        <p className="text-slate-500 font-medium">{template.description}</p>
                    </div>
                    <div className="px-4 py-2 bg-blue-100 dark:bg-blue-500/10 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest">
                        {template.category}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {template.schema.sections ? (
                        template.schema.sections.map((section, idx) => (
                            <div key={idx} className="col-span-full space-y-6">
                                <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 border-l-4 border-blue-600 pl-4 py-1">
                                    {section.title}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {section.fields.map(renderField)}
                                </div>
                            </div>
                        ))
                    ) : (
                        template.schema.fields.map(renderField)
                    )}
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex items-center gap-3 px-10 py-5 rounded-3xl font-black text-xl text-white shadow-2xl transition-all active:scale-95
                            ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:shadow-blue-500/30 shadow-blue-500/20'}`}
                    >
                        {isSubmitting ? (
                            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save size={24} />
                        )}
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Form'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default DynamicForm;
