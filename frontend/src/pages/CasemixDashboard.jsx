import React, { useState, useEffect } from 'react';
import {
    FileText, CheckCircle, AlertCircle, Search, ExternalLink, Activity, DollarSign
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CasemixDashboard = () => {
    const [activeTab, setActiveTab] = useState('coding');
    const [pending, setPending] = useState([]);
    const [processing, setProcessing] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Form State
    const [icd10, setIcd10] = useState('');
    const [procedures, setProcedures] = useState('');

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = () => {
        api.get('/casemix/pending')
            .then(res => {
                setPending(res.data.new);
                setProcessing(res.data.processing);
            })
            .catch(err => toast.error('Failed to load tasks'));
    };

    const handleSelect = (record) => {
        setSelectedPatient(record);
        setIcd10(
            record.icd10?.code
                ? `${record.icd10.code} - ${record.icd10.description}`
                : record.icd10_code || ''
        );
        setProcedures('');
    };

    const handleCodingSubmit = async () => {
        if (!selectedPatient) return;

        try {
            await api.post('/casemix/save', {
                medical_record_id: selectedPatient.id || selectedPatient.medical_record_id,
                primary_icd10: icd10, // In real app, parse code only
                secondary_icd10s: '',
                procedures: procedures,
                user_name: 'Admin Coder'
            });
            toast.success('Coding Saved & Grouped!');
            setSelectedPatient(null);
            fetchPending();
            setActiveTab('grouping'); // Switch to view result
        } catch (error) {
            toast.error('Grouping Failed');
        }
    };

    const handleGenerateClaim = async (id) => {
        try {
            const res = await api.post('/casemix/claim', { id });
            toast.success(`File Generated: ${res.data.url}`);
            fetchPending();
        } catch (error) {
            toast.error('Claim Generation Failed');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Activity className="w-8 h-8 text-indigo-600" />
                        Casemix Integration (INA-CBG)
                    </h1>
                    <p className="text-gray-500 mt-1">Medical Coding, Grouping, and BPJS Claim Management</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('coding')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'coding' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600'}`}
                    >
                        Pending Coding ({pending.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('grouping')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'grouping' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600'}`}
                    >
                        Grouped & Claims ({processing.length})
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Patient List */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-[600px] flex flex-col">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search RM / Name..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {activeTab === 'coding' ? (
                            pending.map(p => (
                                <PatientCard key={p.id} patient={p.patient} record={p} onClick={() => handleSelect(p)} active={selectedPatient?.id === p.id} />
                            ))
                        ) : (
                            processing.map(p => (
                                <PatientCard key={p.id} patient={p.medical_record.patient} record={p} status={p.status} onClick={() => { }} />
                            ))
                        )}
                        {pending.length === 0 && activeTab === 'coding' && (
                            <div className="text-center py-10 text-gray-400 text-sm">No pending discharges to code.</div>
                        )}
                    </div>
                </div>

                {/* Right: Coding / Grouping Area */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 h-[600px] overflow-y-auto">
                    {activeTab === 'coding' && selectedPatient ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedPatient.patient.name}</h2>
                                    <p className="text-sm text-gray-500">RM: {selectedPatient.patient.rm_number} • Visit: {new Date(selectedPatient.visit_date).toLocaleDateString()}</p>
                                </div>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">READY TO CODE</span>
                            </div>

                            {/* Clinical Context (Read Only) */}
                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Doctor's Assessment</label>
                                    <p className="text-gray-800 dark:text-gray-200 text-sm mt-1">{selectedPatient.assessment || '-'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase">Input Diagnosis (ICD-10)</label>
                                        <div className="text-indigo-600 font-medium text-sm mt-1">
                                            {selectedPatient.icd10 ? `${selectedPatient.icd10.code} - ${selectedPatient.icd10.description}` : 'Not Specified'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase">Doctor</label>
                                        <p className="text-sm mt-1">{selectedPatient.doctor.name}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Coder Input */}
                            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <h3 className="font-bold text-gray-700 dark:text-gray-300">Coder Validation</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Diagnosis (ICD-10)</label>
                                    <input
                                        type="text"
                                        value={icd10}
                                        onChange={(e) => setIcd10(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Procedures (ICD-9 CM)</label>
                                    <input
                                        type="text"
                                        value={procedures}
                                        onChange={(e) => setProcedures(e.target.value)}
                                        placeholder="e.g. 89.03 (Consultation)"
                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end gap-3">
                                <button className="px-6 py-2 rounded-xl text-gray-600 font-medium hover:bg-gray-100">Cancel</button>
                                <button
                                    onClick={handleCodingSubmit}
                                    className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2"
                                >
                                    <CheckCircle size={18} />
                                    Verify & Group
                                </button>
                            </div>
                        </div>
                    ) : activeTab === 'grouping' ? (
                        <div>
                            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-6">Grouped Claims (Ready for Upload)</h3>

                            <div className="space-y-4">
                                {processing.map(item => (
                                    <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex justify-between items-center hover:shadow-md transition-shadow">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-bold text-gray-900 dark:text-white">{item.medical_record.patient.name}</h4>
                                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                                    {item.ina_cbg_code}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {item.ina_cbg_desc}
                                            </p>
                                            <div className="text-xs text-gray-400 mt-2 flex gap-3">
                                                <span>ICD-10: {item.primary_icd10}</span>
                                                <span>•</span>
                                                <span>Coder: {item.coder_name}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Tariff INA-CBG</p>
                                            <p className="text-xl font-bold text-indigo-600">Rp {item.tariff?.toLocaleString()}</p>

                                            {item.status !== 'CLAIMED' ? (
                                                <button
                                                    onClick={() => handleGenerateClaim(item.id)}
                                                    className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-end gap-1"
                                                >
                                                    <FileText size={14} /> Generate Claim File
                                                </button>
                                            ) : (
                                                <span className="mt-2 text-xs font-bold text-gray-400 flex items-center justify-end gap-1">
                                                    <CheckCircle size={14} /> Claim Generated
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Activity size={48} className="mb-4 opacity-20" />
                            <p>Select a patient to begin coding.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const PatientCard = ({ patient, record, status, onClick, active }) => (
    <div
        onClick={onClick}
        className={`p-4 rounded-xl border cursor-pointer transition-all ${active
                ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-700'
                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-indigo-200'
            }`}
    >
        <div className="flex justify-between items-start">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{patient.name}</h4>
            {status && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${status === 'CLAIMED' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                    {status}
                </span>
            )}
        </div>
        <p className="text-xs text-gray-500 mt-1">RM: {patient.rm_number}</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
            <CheckCircle size={12} className={record.assessment ? "text-emerald-500" : "text-gray-300"} />
            <span>Diagnosis</span>
            <CheckCircle size={12} className={record.icd10 || record.primary_icd10 ? "text-emerald-500" : "text-gray-300"} />
            <span>ICD-10</span>
        </div>
    </div>
);

export default CasemixDashboard;
