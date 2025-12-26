import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Activity, User, Siren, ArrowRight, Printer, CreditCard, Umbrella, Stethoscope, ChevronRight } from 'lucide-react';
import SmoothScrollArea from '../SmoothScrollArea';
import defaultAvatar from '../../assets/doctor_avatar.png';

const ServiceSelection = ({
    mode = 'RJ', // 'RJ' | 'IGD'
    // Data
    clinics = [],
    doctors = [],
    // Selection State
    selectedClinic,
    selectedDoctor,
    // Payment State
    paymentType,
    setPaymentType,
    sepData,
    // Actions
    onSelectClinic,
    onSelectDoctor,
    onRegister,
    // Config/Status
    patientFound,
    autoSelectIGD = false
}) => {
    // Filter doctors based on selected clinic
    const filteredDoctors = selectedClinic
        ? doctors.filter(d => (mode === 'IGD' ? d.poliklinik_id == selectedClinic : d.poliklinik_id === selectedClinic))
        : [];

    return (
        <React.Fragment>
            <SmoothScrollArea className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-[32px] min-h-[500px] lg:min-h-0 pb-40" contentClassName="p-8 flex flex-col">
                <div className="max-w-6xl mx-auto w-full space-y-8">

                    {/* Step 1: Clinic Selection */}
                    <section className="relative">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-lg shadow-sm">1</div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                                {mode === 'IGD' ? 'Emergency Unit' : 'Select Clinic'}
                            </h3>
                        </div>

                        {mode === 'IGD' ? (
                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-3xl p-8 flex items-center gap-6 animate-in fade-in slide-in-from-bottom-2">
                                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
                                    <Siren size={36} strokeWidth={2} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white">Instalasi Gawat Darurat</h4>
                                    <p className="text-gray-500 mt-1">Emergency Service • 24 Hours</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {clinics.map((clinic, index) => (
                                    <motion.button
                                        key={clinic.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.03 }}
                                        onClick={() => onSelectClinic(clinic.id)}
                                        className={`group relative p-5 rounded-3xl text-left transition-all duration-300 overflow-hidden
                                            ${selectedClinic === clinic.id
                                                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/30 scale-[1.02] ring-0'
                                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors
                                                ${selectedClinic === clinic.id ? 'bg-white/20 text-white' : 'bg-blue-50/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                                                <Stethoscope size={20} />
                                            </div>
                                            {selectedClinic === clinic.id && (
                                                <motion.div layoutId="checkIcon" className="bg-white text-blue-600 rounded-full p-1 shadow-sm">
                                                    <CheckCircle size={14} strokeWidth={3} />
                                                </motion.div>
                                            )}
                                        </div>
                                        <div className="relative z-10">
                                            <div className={`font-bold text-base leading-tight ${selectedClinic === clinic.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                                {clinic.name}
                                            </div>
                                            <div className={`text-xs mt-1 font-medium ${selectedClinic === clinic.id ? 'text-blue-100' : 'text-gray-400'}`}>
                                                {clinic.queue_code ? `Code: ${clinic.queue_code}` : 'Outpatient'}
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </section>

                    <div className="h-6"></div>

                    {/* Step 2: Doctor Selection */}
                    <section className="relative min-h-[200px]">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-lg shadow-sm">2</div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Select Doctor</h3>
                        </div>

                        {!selectedClinic ? (
                            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl bg-gray-50/50 dark:bg-gray-800/50 text-center">
                                <div className="p-4 bg-white dark:bg-gray-700 rounded-full shadow-sm mb-4">
                                    <Activity className="text-gray-300" size={32} />
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-1">No Clinic Selected</h4>
                                <p className="text-sm text-gray-400 font-medium">Please select a clinic/unit in Step 1</p>
                            </div>
                        ) : (
                            <motion.div
                                layout
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                            >
                                <AnimatePresence mode="popLayout">
                                    {filteredDoctors.map((doc, index) => (
                                        <motion.button
                                            key={doc.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => onSelectDoctor(doc.id)}
                                            className={`group relative p-4 rounded-3xl text-left transition-all duration-300 flex items-center gap-5 overflow-hidden
                                                ${selectedDoctor === doc.id
                                                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/30 scale-[1.02]'
                                                    : 'bg-white dark:bg-gray-800 border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-lg hover:bg-gray-50/50 dark:hover:bg-gray-700/50'
                                                }`}
                                        >
                                            <div className={`w-16 h-16 rounded-2xl overflow-hidden shrink-0 transition-transform duration-300 group-hover:scale-105
                                                ${selectedDoctor === doc.id ? 'ring-2 ring-white/30' : 'bg-gray-100'}`}>
                                                <img
                                                    src={doc.photo_url || defaultAvatar}
                                                    alt={doc.name}
                                                    onError={(e) => { e.target.src = defaultAvatar; }}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0 relative z-10">
                                                <div className={`font-bold text-base leading-snug truncate mb-1 ${selectedDoctor === doc.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                                    {doc.name}
                                                </div>
                                                <div className={`text-xs font-medium truncate ${selectedDoctor === doc.id ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'}`}>
                                                    {doc.specialist}
                                                </div>
                                            </div>

                                            {selectedDoctor === doc.id && (
                                                <motion.div
                                                    layoutId="docCheck"
                                                    className="absolute top-4 right-4 bg-white text-blue-600 rounded-full p-1 shadow-sm"
                                                >
                                                    <CheckCircle size={16} strokeWidth={3} />
                                                </motion.div>
                                            )}
                                        </motion.button>
                                    ))}
                                </AnimatePresence>
                                {filteredDoctors.length === 0 && (
                                    <div className="col-span-full text-center py-12 text-gray-400 italic text-sm bg-gray-50/50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200">
                                        No doctors active for this unit today.
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </section>

                    <div className="h-4"></div>

                    {/* Step 3: Payment / Guarantee */}
                    <section className="relative">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-lg shadow-sm">3</div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Payment Method</h3>
                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    id: 'UMUM',
                                    label: 'UMUM / PRIBADI',
                                    icon: <CreditCard size={28} />,
                                    activeClass: 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-500/30',
                                    inactiveClass: 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-blue-50/50',
                                    iconBgActive: 'bg-white/20 text-white',
                                    iconBgInactive: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                },
                                {
                                    id: 'BPJS',
                                    label: 'BPJS KESEHATAN',
                                    icon: <Activity size={28} />,
                                    activeClass: 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-green-500/30',
                                    inactiveClass: 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-green-50/50',
                                    iconBgActive: 'bg-white/20 text-white',
                                    iconBgInactive: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                },
                                {
                                    id: 'ASURANSI',
                                    label: 'ASURANSI LAIN',
                                    icon: <Umbrella size={28} />,
                                    activeClass: 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-purple-500/30',
                                    inactiveClass: 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-purple-50/50',
                                    iconBgActive: 'bg-white/20 text-white',
                                    iconBgInactive: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                                }
                            ].map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setPaymentType(type.id)}
                                    className={`relative p-8 rounded-[2rem] border-0 transition-all duration-300 flex flex-col items-center justify-center gap-4 group overflow-hidden
                                        ${paymentType === type.id
                                            ? `${type.activeClass} shadow-2xl scale-[1.03] z-10`
                                            : `${type.inactiveClass} shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-lg scale-100`
                                        }`}
                                >
                                    <div className={`p-4 rounded-2xl transition-all duration-300 
                                        ${paymentType === type.id ? type.iconBgActive : type.iconBgInactive}`}>
                                        {type.icon}
                                    </div>
                                    <span className={`text-sm font-black tracking-wider transition-colors
                                        ${paymentType === type.id ? 'text-white' : 'text-gray-400'}`}>
                                        {type.label}
                                    </span>

                                    {/* Status Badge for BPJS */}
                                    {type.id === 'BPJS' && (
                                        <div className="absolute top-4 right-4">
                                            <span className="flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-gray-800"></span>
                                            </span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* BPJS Info Card (Visible only when BPJS is selected) */}
                        <AnimatePresence>
                            {paymentType === 'BPJS' && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, y: -20 }}
                                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                                    exit={{ height: 0, opacity: 0, y: -20 }}
                                    className="overflow-hidden mt-6"
                                >
                                    <div className="p-6 bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl shadow-xl shadow-green-500/20 text-white flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                                <Activity size={24} className="text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg">BPJS Kesehatan Integration</h4>
                                                <p className="text-green-50 text-sm font-medium">SEP will be generated automatically upon registration.</p>
                                            </div>
                                        </div>
                                        <div className="text-right px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                            <div className="text-[10px] font-bold uppercase opacity-80 mb-1">Status Peserta</div>
                                            <div className="font-black text-xl tracking-tight">AKTIF</div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>
                </div>
            </SmoothScrollArea>

            {/* FLOATING ACTION BAR */}
            <div className="fixed bottom-6 scale-90 sm:scale-100 sm:bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4">
                <div className="bg-black/75 dark:bg-white/90 backdrop-blur-3xl rounded-[2.5rem] p-2 pl-8 flex justify-between items-center shadow-2xl shadow-black/20 dark:shadow-white/10 ring-1 ring-white/10">

                    <div className="flex items-center gap-6 md:gap-8 overflow-x-auto no-scrollbar scroll-smooth pr-4 mask-fade-r">
                        {[
                            { step: 1, label: 'Identity', active: !!patientFound },
                            { step: 2, label: 'Clinic', active: !!selectedClinic },
                            { step: 3, label: 'Doctor', active: !!selectedDoctor }
                        ].map((s, i) => (
                            <div key={i} className="flex items-center gap-3 shrink-0">
                                <div className={`w-3 h-3 rounded-full transition-all duration-300 
                                    ${s.active
                                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 scale-125 shadow-[0_0_12px_rgba(52,211,153,0.6)]'
                                        : 'bg-gray-600 dark:bg-gray-300'}`} />
                                <span className={`text-sm font-bold tracking-tight transition-colors duration-300
                                    ${s.active ? 'text-white dark:text-black' : 'text-gray-500'}`}>
                                    {s.label}
                                </span>
                                {i < 2 && <ChevronRight size={14} className="text-gray-500 dark:text-gray-400 opacity-40" />}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={onRegister}
                        disabled={!patientFound || !selectedDoctor}
                        className="relative overflow-hidden bg-white dark:bg-black text-black dark:text-white px-8 md:px-10 py-4 md:py-5 rounded-[2rem] font-bold text-base shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3 shrink-0"
                    >
                        <Printer size={20} strokeWidth={2.5} />
                        <span className="md:inline hidden">Process</span>
                        <span className="md:hidden inline">Go</span>
                    </button>
                </div>
            </div>
        </React.Fragment>
    );
};

export default memo(ServiceSelection);
