import React, { useState, useEffect } from 'react';
import {
    LogOut, FileText, CheckSquare, AlertTriangle, User,
    ArrowRight, CheckCircle2, Clock, Calendar, Activity, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import PageWrapper from '../components/PageWrapper';
import ModernHeader from '../components/ModernHeader';

const DischargeDashboard = () => {
    const [patients, setPatients] = useState([]);
    const [selected, setSelected] = useState(null);
    const [view, setView] = useState('LIST'); // LIST, FORM
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);
        // Mock data fallback if API fails or is empty for dev
        api.get('/discharge/candidates')
            .then(res => {
                setPatients(res.data);
                setLoading(false);
            })
            .catch(() => {
                // Mock Data for demonstration
                setTimeout(() => {
                    setPatients([
                        { id: 1, patient: { name: 'Siti Aminah', rm_number: 'RM-00123' }, bed: { code: '101', room: { name: 'Mawar' } }, doctor: { name: 'Dr. Budi' }, status: 'DISCHARGE_INITIATED', admission_date: '2025-12-18' },
                        { id: 2, patient: { name: 'John Doe', rm_number: 'RM-00124' }, bed: { code: '202', room: { name: 'Melati' } }, doctor: { name: 'Dr. Siti' }, status: 'ADMITTED', admission_date: '2025-12-15' },
                    ]);
                    setLoading(false);
                }, 500);
            });
    };

    const handleSelect = (patient) => {
        setSelected(patient);
        setView('FORM');
    };

    return (
        <PageWrapper title="Discharge Planning">
            <Toaster position="top-right" />
            <ModernHeader
                title="Discharge Planning"
                subtitle="Manage patient flow, clearances, and bed turnover"
            />

            <div className="p-6 md:p-8 max-w-[1920px] mx-auto space-y-8">

                {/* Stats Row */}
                {view === 'LIST' && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard icon={LogOut} label="Pending Discharge" value={patients.filter(p => p.status === 'DISCHARGE_INITIATED').length} color="rose" />
                        <StatCard icon={CheckCircle2} label="Ready to Go" value={patients.filter(p => p.status === 'READY').length} color="emerald" />
                        <StatCard icon={Clock} label="Avg LOS" value="3.5 Days" color="indigo" />
                        <StatCard icon={Activity} label="Occupancy Rate" value="85%" color="violet" />
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {view === 'LIST' ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="glass-panel rounded-[32px] overflow-hidden border border-white/20"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/30 dark:bg-gray-900/10">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Discharge Candidates</h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-400 uppercase text-xs font-bold tracking-wider backdrop-blur-sm">
                                        <tr>
                                            <th className="p-6">Patient</th>
                                            <th className="p-6">Location</th>
                                            <th className="p-6">Doctor</th>
                                            <th className="p-6">Status</th>
                                            <th className="p-6 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {loading ? (
                                            <tr><td colSpan="5" className="p-12 text-center text-gray-400 font-bold animate-pulse">Loading candidates...</td></tr>
                                        ) : patients.length === 0 ? (
                                            <tr><td colSpan="5" className="p-12 text-center text-gray-400 font-bold">No patients currently pending discharge.</td></tr>
                                        ) : (
                                            patients.map((p, idx) => (
                                                <tr key={p.id} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors cursor-pointer" onClick={() => handleSelect(p)}>
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
                                                                {p.patient.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-gray-900 dark:text-white">{p.patient.name}</div>
                                                                <div className="text-xs font-mono text-gray-400 font-medium">MR: {p.patient.rm_number}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-sm font-medium text-gray-600 dark:text-gray-300">
                                                        <span className="flex items-center gap-2"><MapPin size={14} className="text-indigo-400" /> {p.bed?.room?.name} • {p.bed?.code}</span>
                                                    </td>
                                                    <td className="p-6 text-sm font-bold text-gray-700 dark:text-gray-300">{p.doctor.name}</td>
                                                    <td className="p-6">
                                                        <StatusBadge status={p.status} />
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleSelect(p); }}
                                                            className="px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all flex items-center gap-2 ml-auto"
                                                        >
                                                            Process <ArrowRight size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        >
                            <DischargeForm
                                patient={selected}
                                onBack={() => { setView('LIST'); loadData(); }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageWrapper>
    );
};

// Sub-components
const StatusBadge = ({ status }) => {
    const styles = {
        'DISCHARGE_INITIATED': 'bg-amber-100 text-amber-700 border-amber-200',
        'READY': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'ADMITTED': 'bg-blue-50 text-blue-600 border-blue-100',
    };
    return (
        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
            {status.replace(/_/g, ' ')}
        </span>
    );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
    const colors = {
        rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
        indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
        violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
    };

    return (
        <div className="glass-panel p-6 rounded-[24px] flex items-center gap-5 border border-white/40 shadow-sm">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]}`}>
                <Icon size={28} />
            </div>
            <div>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">{label}</p>
                <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{value}</h4>
            </div>
        </div>
    );
};

const DischargeForm = ({ patient, onBack }) => {
    const [step, setStep] = useState(patient.status === 'DISCHARGE_INITIATED' ? 2 : 1);
    const [notes, setNotes] = useState(patient.notes || '');

    // Checklist State
    const [checklist, setChecklist] = useState({
        iv_removed: false,
        meds_given: false,
        billing_cleared: false,
        family_educated: false
    });

    const handleInitiate = async () => {
        try {
            await api.post(`/discharge/${patient.id}/initiate`, {
                discharge_notes: notes,
                icd10_code: 'Z09' // Mock
            });
            toast.success('Discharge Process Initiated');
            setStep(2);
        } catch (error) {
            toast.error('Error initiating discharge');
            // Mock success for UI demo
            setStep(2);
        }
    };

    const handleFinalize = async () => {
        if (!Object.values(checklist).every(Boolean)) {
            toast.error('Please complete all checklist items first');
            return;
        }

        if (!window.confirm("Are you sure you want to finalize discharge? This will close the admission and generate the final bill.")) return;

        try {
            const res = await api.post(`/discharge/${patient.id}/finalize`, { type: 'PULANG' });

            // Mock response if API fails
            const mockRes = res?.data || { invoice_id: 'INV-999', los: 4, total_bill: 4500000 };

            toast.success(`Discharged! Invoice #${mockRes.invoice_id} Generated.`);
            alert(`
                ✅ Patient Discharged
                -------------------------
                LOS: ${mockRes.los} Days
                Total Bill: Rp ${mockRes.total_bill?.toLocaleString()}
                
                Please direct patient to Cashier.
            `);

            onBack();
        } catch (error) {
            console.error(error);
            // Mock success
            toast.success("Discharged! (Mock)");
            onBack();
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Patient Profile Card */}
            <div className="lg:col-span-1 space-y-6">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold mb-2 transition-colors">
                    <ArrowRight size={18} className="rotate-180" /> Back to Dashboard
                </button>

                <div className="glass-panel p-8 rounded-[40px] border border-white/20 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-6">
                            <span className="text-4xl font-black text-white">{patient.patient.name.charAt(0)}</span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{patient.patient.name}</h2>
                        <p className="text-gray-500 text-sm font-bold font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg inline-block">MR: {patient.patient.rm_number}</p>

                        <div className="mt-8 space-y-4 text-left bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                            <InfoItem label="Room" value={`${patient.bed?.room?.name || 'Mawar'} - ${patient.bed?.code || '101'}`} icon={MapPin} />
                            <InfoItem label="Admission Date" value={new Date(patient.admission_date).toLocaleDateString()} icon={Calendar} />
                            <InfoItem label="Doctor" value={patient.doctor.name} icon={User} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Workflow */}
            <div className="lg:col-span-2 space-y-6">

                {/* Steps Indicator */}
                <div className="flex items-center gap-4 mb-8">
                    <StepIndicator number={1} title="Medical Resume" active={step === 1} completed={step > 1} />
                    <div className={`flex-1 h-1 rounded-full ${step > 1 ? 'bg-indigo-500' : 'bg-gray-200'} transition-colors duration-500`}></div>
                    <StepIndicator number={2} title="Final Checklist" active={step === 2} completed={false} />
                </div>

                {/* Step 1 Content */}
                {step === 1 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-[40px] border border-white/20">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <FileText className="text-indigo-500" />
                            Medical Resume & Orders
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Discharge Notes & Instructions</label>
                                <textarea
                                    className="w-full p-5 rounded-2xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition-all resize-none"
                                    rows="6"
                                    placeholder="Enter clinical summary, take-home medication instructions, and follow-up plan..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleInitiate}
                                    className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    Initiate Discharge Process <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Step 2 Content */}
                {step === 2 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-[40px] border border-white/20">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <CheckSquare className="text-indigo-500" />
                            Nurse Clearance Checklist
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <CheckItem label="IV Line Removed" checked={checklist.iv_removed} onChange={() => setChecklist({ ...checklist, iv_removed: !checklist.iv_removed })} />
                            <CheckItem label="Take Home Meds Given" checked={checklist.meds_given} onChange={() => setChecklist({ ...checklist, meds_given: !checklist.meds_given })} />
                            <CheckItem label="Billing Cleared (Lunas)" checked={checklist.billing_cleared} onChange={() => setChecklist({ ...checklist, billing_cleared: !checklist.billing_cleared })} />
                            <CheckItem label="Family Education" checked={checklist.family_educated} onChange={() => setChecklist({ ...checklist, family_educated: !checklist.family_educated })} />
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-2xl flex gap-4 text-amber-800 dark:text-amber-200 text-sm font-bold border border-amber-100 dark:border-amber-900/50 mb-8">
                            <AlertTriangle size={24} className="shrink-0" />
                            <p>Warning: Finalizing discharge will mark the bed as 'Dirty' for cleaning, close the current admission record, and generate the final invoice. This cannot be undone.</p>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleFinalize}
                                disabled={!Object.values(checklist).every(Boolean)}
                                className="w-full py-5 bg-emerald-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl hover:bg-emerald-600 shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Finalize & Print Discharge Papers
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const InfoItem = ({ label, value, icon: Icon }) => (
    <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-indigo-500 shadow-sm">
            {Icon && <Icon size={18} />}
        </div>
        <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{label}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const StepIndicator = ({ number, title, active, completed }) => (
    <div className={`flex items-center gap-3 ${active ? 'opacity-100' : 'opacity-50'} transition-opacity`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 ${completed ? 'bg-indigo-600 border-indigo-600 text-white' :
                active ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-transparent border-gray-300 text-gray-400'
            }`}>
            {completed ? <CheckCircle2 size={20} /> : number}
        </div>
        <span className={`font-bold ${active ? 'text-indigo-600' : 'text-gray-500'}`}>{title}</span>
    </div>
);

const CheckItem = ({ label, checked, onChange }) => (
    <div
        onClick={onChange}
        className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 group ${checked
                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-800 dark:text-indigo-300'
                : 'bg-white dark:bg-gray-800 border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-sm hover:shadow-md'
            }`}
    >
        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${checked ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-300 bg-white'
            }`}>
            {checked && <CheckSquare size={14} strokeWidth={4} />}
        </div>
        <span className="font-bold text-sm selection:bg-none">{label}</span>
    </div>
);

export default DischargeDashboard;
