import React, { useState, useEffect } from 'react';
import {
    Activity, Clipboard, Clock, Heart, Plus, Search, User
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const NurseStation = () => {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [clinicalData, setClinicalData] = useState(null);
    const [activeTab, setActiveTab] = useState('cppt'); // cppt, mar

    useEffect(() => {
        api.get('/nurse/active-inpatients').then(res => setPatients(res.data));
    }, []);

    const handleSelectPatient = async (patient) => {
        setSelectedPatient(patient);
        try {
            // patient object here is actually the Admission object from admissionController.getActive
            const res = await api.get(`/inpatient/${patient.id}/clinical`);
            setClinicalData(res.data);
        } catch (error) {
            toast.error('Failed to load clinical data');
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in h-screen flex flex-col md:flex-row gap-6">
            {/* Left: Patient List */}
            <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="font-bold text-gray-900 dark:text-white mb-2">Active Patients</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search Name / Room..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm focus:outline-none"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {patients.map(p => (
                        <div
                            key={p.id}
                            onClick={() => handleSelectPatient(p)}
                            className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedPatient?.id === p.id
                                    ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-700 ring-1 ring-indigo-500'
                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-gray-900 dark:text-white">{p.patient.name}</h4>
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                                    {p.bed?.room?.name} - {p.bed?.code}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">RM: {p.patient.rm_number}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Clinical Workspace */}
            <div className="w-full md:w-2/3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
                {selectedPatient && clinicalData ? (
                    <>
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPatient.patient.name}</h2>
                                <p className="text-sm text-gray-500 flex gap-4 mt-1">
                                    <span>DOB: {new Date(selectedPatient.patient.dob).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span className="font-bold text-indigo-600">DX: {selectedPatient.diagnosa_masuk || 'Observation'}</span>
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveTab('cppt')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'cppt' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
                                >
                                    CPPT (Vitals)
                                </button>
                                <button
                                    onClick={() => setActiveTab('mar')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'mar' ? 'bg-emerald-600 text-white' : 'hover:bg-gray-100'}`}
                                >
                                    e-MAR (Meds)
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {activeTab === 'cppt' ? (
                                <CPPTView admissionId={selectedPatient.id} observations={clinicalData.admission.observations} refresh={() => handleSelectPatient(selectedPatient)} />
                            ) : (
                                <MARView admissionId={selectedPatient.id} logs={clinicalData.admission.medication_logs} prescriptions={clinicalData.prescriptions} refresh={() => handleSelectPatient(selectedPatient)} />
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <User size={48} className="mb-4 opacity-20" />
                        <p>Select a patient to view clinical records.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Sub-component: CPPT (Vital Signs)
const CPPTView = ({ admissionId, observations, refresh }) => {
    const [form, setForm] = useState({ systolic: '', diastolic: '', temperature: '', heart_rate: '', notes: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/inpatient/${admissionId}/observation`, {
                nurse_name: 'Nurse Joyce', // Placeholder
                vitals: {
                    systolic: parseInt(form.systolic),
                    diastolic: parseInt(form.diastolic),
                    temperature: parseFloat(form.temperature),
                    heart_rate: parseInt(form.heart_rate)
                },
                notes: form.notes
            });
            toast.success('Observation Added');
            setForm({ systolic: '', diastolic: '', temperature: '', heart_rate: '', notes: '' });
            refresh();
        } catch (error) {
            toast.error('Failed to save');
        }
    };

    return (
        <div className="space-y-8">
            {/* Input Form */}
            <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl space-y-4">
                <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Activity size={18} /> New Observation
                </h3>
                <div className="grid grid-cols-4 gap-4">
                    <input type="number" placeholder="Sys" value={form.systolic} onChange={e => setForm({ ...form, systolic: e.target.value })} className="p-2 rounded-lg border text-sm" required />
                    <input type="number" placeholder="Dia" value={form.diastolic} onChange={e => setForm({ ...form, diastolic: e.target.value })} className="p-2 rounded-lg border text-sm" required />
                    <input type="number" step="0.1" placeholder="Temp (°C)" value={form.temperature} onChange={e => setForm({ ...form, temperature: e.target.value })} className="p-2 rounded-lg border text-sm" required />
                    <input type="number" placeholder="HR (bpm)" value={form.heart_rate} onChange={e => setForm({ ...form, heart_rate: e.target.value })} className="p-2 rounded-lg border text-sm" required />
                </div>
                <textarea placeholder="Progress Note (S-O-A-P)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full p-3 rounded-lg border text-sm" rows="2"></textarea>
                <div className="flex justify-end">
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">Save CPPT</button>
                </div>
            </form>

            {/* Timeline */}
            <div className="space-y-6">
                {observations.map((obs, idx) => (
                    <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-gray-300 mt-2"></div>
                            <div className="w-0.5 flex-1 bg-gray-200 my-1"></div>
                        </div>
                        <div className="pb-6">
                            <p className="text-xs font-bold text-gray-500 uppercase">
                                {new Date(obs.timestamp).toLocaleTimeString()} • {new Date(obs.timestamp).toLocaleDateString()}
                            </p>
                            <div className="mt-1 flex gap-3 text-sm font-bold text-gray-900 dark:text-white">
                                <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded">BP: {obs.systolic}/{obs.diastolic}</span>
                                <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded">T: {obs.temperature}°C</span>
                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">HR: {obs.heart_rate}</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">{obs.notes}</p>
                            <p className="text-xs text-gray-400 mt-1">Recorded by: {obs.nurse_name}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Sub-component: e-MAR (Medication Log)
const MARView = ({ admissionId, logs, prescriptions, refresh }) => {

    // Flatten prescriptions to get active medicines
    const medicines = prescriptions?.flatMap(p => p.items.map(i => ({
        ...i,
        rx_id: p.id,
        doctor: p.doctor
    }))) || [];

    const handleGive = async (med) => {
        try {
            await api.post(`/inpatient/${admissionId}/mar`, {
                prescription_item_id: med.id,
                medicine_name: med.medicine.name,
                status: 'GIVEN',
                nurse_name: 'Nurse Joyce',
                notes: 'Given on time'
            });
            toast.success(`Gave ${med.medicine.name}`);
            refresh();
        } catch (error) {
            toast.error('Failed to log');
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="font-bold text-gray-700 dark:text-gray-200">Scheduled Medications</h3>
            <div className="grid gap-4">
                {medicines.map((med, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600 flex justify-between items-center shadow-sm">
                        <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <Clipboard size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">{med.medicine.name}</h4>
                                <p className="text-sm text-gray-500">{med.dosage} • {med.quantity} qty</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleGive(med)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2"
                        >
                            <Clock size={16} /> Give Now
                        </button>
                    </div>
                ))}
            </div>

            <h3 className="font-bold text-gray-700 dark:text-gray-200 mt-8">Administration History</h3>
            <div className="space-y-4">
                {logs.map(log => (
                    <div key={log.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{log.medicine_name}</span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-500">{new Date(log.given_at).toLocaleTimeString()}</p>
                            <p className="text-[10px] text-gray-400">By: {log.given_by}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NurseStation;
