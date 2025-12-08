import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import {
    Trash2, Edit, Plus, X,
    LayoutGrid, Stethoscope, Store,
    CalendarOff
} from 'lucide-react';


        <div className="w-16 h-16 bg-modern-bg rounded-full flex items-center justify-center mb-4 border border-white/5">
            <Search size={24} className="opacity-50" />
        </div>
        <p>No data found</p>
    </div >
);

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-modern-card rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200 border border-white/10">
                <button onClick={onClose} className="absolute top-6 right-6 text-modern-text-secondary hover:text-white transition-colors">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold text-modern-text mb-6">{title}</h2>
                {children}
            </div>
        </div>
    );
};

const Input = ({ label, value, onChange, type = "text", required = true, maxLength, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-modern-text-secondary mb-2 ml-1">{label}</label>
        <input
            type={type}
            required={required}
            maxLength={maxLength}
            placeholder={placeholder}
            className="w-full bg-modern-bg border border-white/10 text-modern-text rounded-xl px-4 py-3 focus:ring-2 focus:ring-modern-blue outline-none transition-all focus:bg-modern-bg/80 placeholder-modern-text-secondary/50"
            value={value}
            onChange={onChange}
        />
    </div>
);

const SubmitButton = () => (
    <button type="submit" className="w-full bg-modern-text text-modern-bg py-4 rounded-xl font-bold text-lg hover:bg-white transition-all shadow-lg hover:shadow-xl active:scale-95">
        Save Changes
    </button>
);

export default MasterData;
