import React, { useState, useEffect } from 'react';
import {
    LogOut, FileText, CheckSquare, AlertTriangle, User
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const DischargeDashboard = () => {
    const [patients, setPatients] = useState([]);
    const [selected, setSelected] = useState(null);
    const [view, setView] = useState('LIST'); // LIST, FORM

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        api.get('/discharge/candidates').then(res => setPatients(res.data));
    };

    const handleSelect = (patient) => {
        setSelected(patient);
        setView('FORM');
    };

    return (
        <div className="p-8 max-w-7xl mx-auto animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <LogOut className="w-8 h-8 text-rose-600" />
                        Discharge Planning
                    </h1>
                    <p className="text-gray-500 mt-1">Manage patient discharge, medical resume, and billing checks.</p>
                </div>
            </div>

            {view === 'LIST' ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-4">Patient</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Doctor</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {patients.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 dark:text-white">{p.patient.name}</div>
                                        <div className="text-xs text-gray-400">MR: {p.patient.rm_number}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {p.bed?.room?.name} - {p.bed?.code}
                                    </td>
                                    <td className="px-6 py-4 text-sm">{p.doctor.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'DISCHARGE_INITIATED'
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-green-100 text-green-700'
                                            }`}>
                                            {p.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleSelect(p)}
                                            className="px-4 py-2 bg-rose-600 text-white text-sm font-bold rounded-lg hover:bg-rose-700 shadow-sm"
                                        >
                                            Process
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <DischargeForm
                    patient={selected}
                    onBack={() => { setView('LIST'); loadData(); }}
                />
            )}
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
            toast.success('Discharge Initiated');
            setStep(2);
        } catch (error) {
            toast.error('Error initiating discharge');
        }
    };

    const handleFinalize = async () => {
        if (!Object.values(checklist).every(Boolean)) {
            toast.error('Please complete all checklist items');
            return;
        }
        try {
            await api.post(`/discharge/${patient.id}/finalize`, { type: 'PULANG' });
            toast.success('Patient Discharged!');
            onBack();
        } catch (error) {
            toast.error('Failed to finalize');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Patient Info */}
            <div className="lg:col-span-1 space-y-6">
                <button onClick={onBack} className="text-gray-500 hover:text-gray-900 font-bold mb-4">← Back to List</button>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                            <User size={40} className="text-gray-400" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white">{patient.patient.name}</h2>
                    <p className="text-center text-gray-500 text-sm mb-6">MR: {patient.patient.rm_number}</p>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Room</span>
                            <span className="font-bold">{patient.bed?.room?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Admission Date</span>
                            <span className="font-bold">{new Date(patient.admission_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Doctor</span>
                            <span className="font-bold">{patient.doctor.name}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Workflow */}
            <div className="lg:col-span-2 space-y-6">
                {/* Step 1: Doctor's Order */}
                <div className={`p-6 rounded-2xl border transition-all ${step === 1 ? 'bg-white border-rose-200 shadow-lg' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 1 ? 'bg-rose-100 text-rose-600' : 'bg-gray-200 text-gray-500'}`}>1</div>
                        <h3 className="font-bold text-lg">Medical Resume & Order</h3>
                    </div>
                    {step === 1 && (
                        <div className="space-y-4 ml-11">
                            <textarea
                                className="w-full p-3 border rounded-xl"
                                rows="4"
                                placeholder="Discharge Notes / Medical Resume / Take Home Meds Instructions..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            ></textarea>
                            <button
                                onClick={handleInitiate}
                                className="px-6 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700"
                            >
                                Initiate Discharge
                            </button>
                        </div>
                    )}
                </div>

                {/* Step 2: Nurse & Admin Checks */}
                <div className={`p-6 rounded-2xl border transition-all ${step === 2 ? 'bg-white border-rose-200 shadow-lg' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 2 ? 'bg-rose-100 text-rose-600' : 'bg-gray-200 text-gray-500'}`}>2</div>
                        <h3 className="font-bold text-lg">Clearance Checklist</h3>
                    </div>
                    {step === 2 && (
                        <div className="space-y-4 ml-11">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <CheckItem label="IV Line Removed" checked={checklist.iv_removed} onChange={() => setChecklist({ ...checklist, iv_removed: !checklist.iv_removed })} />
                                <CheckItem label="Take Home Meds Given" checked={checklist.meds_given} onChange={() => setChecklist({ ...checklist, meds_given: !checklist.meds_given })} />
                                <CheckItem label="Billing Cleared (Lunas)" checked={checklist.billing_cleared} onChange={() => setChecklist({ ...checklist, billing_cleared: !checklist.billing_cleared })} />
                                <CheckItem label="Family Education" checked={checklist.family_educated} onChange={() => setChecklist({ ...checklist, family_educated: !checklist.family_educated })} />
                            </div>

                            <div className="bg-amber-50 p-4 rounded-xl flex gap-3 text-amber-800 text-sm mt-4">
                                <AlertTriangle size={20} className="shrink-0" />
                                <p>Ensure all items are checked before finalizing. This action will mark the bed as empty (Dirty) and close the admission.</p>
                            </div>

                            <button
                                onClick={handleFinalize}
                                disabled={!Object.values(checklist).every(Boolean)}
                                className="w-full py-3 bg-green-600 disabled:bg-gray-300 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
                            >
                                Finalize & Print Surat Pulang
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CheckItem = ({ label, checked, onChange }) => (
    <div
        onClick={onChange}
        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${checked ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
    >
        <div className={`w-5 h-5 rounded border flex items-center justify-center ${checked ? 'bg-rose-600 border-rose-600 text-white' : 'border-gray-300'}`}>
            {checked && <CheckSquare size={14} />}
        </div>
        <span className="font-bold text-sm">{label}</span>
    </div>
);

export default DischargeDashboard;
