import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Activity, User, Bed, Filter, Clock, AlertCircle } from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ModernHeader from '../components/ModernHeader';
import PageLoader from '../components/PageLoader';
import useAuthStore from '../store/useAuthStore';

const InpatientNurseDashboard = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterAlerts, setFilterAlerts] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [patientModal, setPatientModal] = useState({ open: false, admissionId: null });

    // Polling System
    useEffect(() => {
        fetchRooms();
        const interval = setInterval(fetchRooms, 3000); // 3s polling for responsiveness
        return () => clearInterval(interval);
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await api.get('/admission/rooms');
            if (res.data.status === 'success') {
                setRooms(res.data.data);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('Fetch error', error);
        } finally {
            setLoading(false);
        }
    };

    // Derived State
    const safeRooms = Array.isArray(rooms) ? rooms : [];
    const allBeds = safeRooms.flatMap(r => Array.isArray(r.beds) ? r.beds : []);
    const activeCalls = allBeds.filter(b => b.service_request === 'NURSE');
    const occupiedBeds = allBeds.filter(b => b.status === 'OCCUPIED');

    const handleClearRequest = async (bedId) => {
        try {
            await api.post('/bed-panel/request', {
                bedId,
                service: null // Clear request
            });
            toast.success('Panggilan diselesaikan');
            fetchRooms();
        } catch (error) {
            toast.error('Gagal update status');
        }
    };

    if (loading) return <PageLoader />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 font-sans text-gray-900 dark:text-white pb-32">
            <Toaster position="top-right" />

            {/* Header Stats */}
            <ModernHeader
                title="Nurse Station Monitor"
                subtitle="Real-time Inpatient Monitoring & Response"
                onBack={() => navigate('/menu')}
                className="mb-8"
                actions={
                    <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl px-6 py-2 rounded-full border border-white/20 shadow-sm transition-all hover:bg-white/80">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <div className="flex flex-col text-right">
                            <span className="text-[10px] font-black text-gray-800 dark:text-gray-200 tracking-widest uppercase">Live Monitoring</span>
                            <span className="text-[9px] text-gray-500 font-mono">Real-time Sync</span>
                        </div>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Active Calls Card - High Alert */}
                <div className={`p-6 rounded-3xl border-2 transition-all ${activeCalls.length > 0 ? 'bg-red-500 text-white border-red-400 shadow-2xl shadow-red-500/30' : 'bg-white dark:bg-gray-800 border-transparent'}`}>
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className={`text-sm font-bold uppercase tracking-wider ${activeCalls.length > 0 ? 'text-red-100' : 'text-gray-500'}`}>Active Calls</h3>
                            <div className="text-4xl font-extrabold mt-2">{activeCalls.length}</div>
                        </div>
                        <div className={`p-4 rounded-2xl ${activeCalls.length > 0 ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                            <Bell size={32} className={activeCalls.length > 0 ? 'animate-bounce' : 'text-gray-400'} fill={activeCalls.length > 0 ? "currentColor" : "none"} />
                        </div>
                    </div>
                </div>

                {/* Occupancy */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Occupied Beds</h3>
                            <div className="text-4xl font-extrabold mt-2 text-blue-600 dark:text-blue-400">{occupiedBeds.length} <span className="text-lg text-gray-400 font-medium">/ {allBeds.length}</span></div>
                        </div>
                        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                            <Bed size={32} />
                        </div>
                    </div>
                </div>

                {/* Filter Toggle */}
                <button
                    onClick={() => setFilterAlerts(!filterAlerts)}
                    className={`p-6 rounded-3xl border transition-all text-left flex flex-col justify-between group
                            ${filterAlerts
                            ? 'bg-indigo-600 text-white border-indigo-500 ring-4 ring-indigo-500/20'
                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-indigo-500'}`}
                >
                    <div className="flex justify-between w-full">
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${filterAlerts ? 'text-indigo-200' : 'text-gray-500'}`}>Filter Mode</h3>
                        <Filter size={24} className={filterAlerts ? 'text-white' : 'text-gray-400'} />
                    </div>
                    <div className="font-bold text-lg mt-2">
                        {filterAlerts ? 'Showing Alerts Only' : 'Showing All Beds'}
                    </div>
                </button>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                    {safeRooms.flatMap(room =>
                        (Array.isArray(room.beds) ? room.beds : [])
                            .filter(bed => !filterAlerts || (filterAlerts && bed.service_request === 'NURSE'))
                            .map(bed => {
                                const isAlerting = bed.service_request === 'NURSE';
                                return (
                                    <motion.div
                                        key={bed.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className={`relative overflow-hidden rounded-[32px] p-6 border transition-all duration-500
                                            ${isAlerting
                                                ? 'bg-red-900/10 border-red-500 ring-4 ring-red-500/30'
                                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                                            }`}
                                    >
                                        {/* Status Strip & Pulse */}
                                        {isAlerting && (
                                            <motion.div
                                                className="absolute inset-0 bg-red-500/10 z-0"
                                                animate={{ opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                            />
                                        )}

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">{room.name}</div>
                                                    <div className="text-2xl font-bold flex items-center gap-2">
                                                        {bed.code}
                                                        {isAlerting && <Bell size={20} className="fill-red-500 text-red-500 animate-bounce" />}
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                                                    ${bed.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                                                        bed.status === 'OCCUPIED' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-600'}`}>
                                                    {bed.status}
                                                </div>
                                            </div>

                                            {/* Patient Info -- CLICKABLE */}
                                            {bed.current_patient ? (
                                                <div
                                                    className="mb-6 space-y-1 cursor-pointer hover:bg-white/50 dark:hover:bg-white/10 p-2 -mx-2 rounded-xl transition-colors group"
                                                    onClick={() => {
                                                        const activeAdmission = bed.admissions?.[0]; // Assuming getRooms includes this
                                                        if (activeAdmission) {
                                                            setPatientModal({ open: true, admissionId: activeAdmission.id });
                                                        } else {
                                                            toast.error('No active admission found data');
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-lg group-hover:text-blue-600 transition-colors">
                                                        <User size={18} className="text-blue-500" />
                                                        {bed.current_patient.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 pl-6">
                                                        RM: {bed.current_patient.no_rm} • {bed.current_patient.gender}
                                                        <div className="text-[10px] text-blue-400 font-bold mt-1 uppercase tracking-wider">Click for Clinical Chart</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mb-6 h-14 flex items-center text-gray-400 text-sm italic">
                                                    Empty Bed
                                                </div>
                                            )}

                                            {/* Action Button */}
                                            {isAlerting ? (
                                                <button
                                                    onClick={() => handleClearRequest(bed.id)}
                                                    className="w-full py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/40 flex items-center justify-center gap-2 transition-all active:scale-95"
                                                >
                                                    <CheckCircle size={20} />
                                                    SELESAI / DONE
                                                </button>
                                            ) : (
                                                <div className="h-14 flex items-center justify-center text-xs text-gray-400 font-medium bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                                    No Active Request
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })
                    )}
                </AnimatePresence>

                {activeCalls.length === 0 && occupiedBeds.length === 0 && (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center text-gray-400">
                        <CheckCircle size={48} className="mb-4 text-green-500 opacity-50" />
                        <p>No active alerts.</p>
                    </div>
                )}
            </div>

            {/* PATIENT CARE MODAL */}
            <AnimatePresence>
                {patientModal.open && patientModal.admissionId && (
                    <PatientCareModal admissionId={patientModal.admissionId} onClose={() => setPatientModal({ open: false, admissionId: null })} />
                )}
            </AnimatePresence>
        </div>
    );
};

const PatientCareModal = ({ admissionId, onClose }) => {
    const [activeTab, setActiveTab] = useState('observation'); // observation, mar
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Forms
    const [vitals, setVitals] = useState({ temperature: '', systolic: '', diastolic: '', heart_rate: '', resp_rate: '', sats: '' });
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchClinical();
    }, [admissionId]);

    const fetchClinical = async () => {
        try {
            const res = await api.get(`/inpatient/${admissionId}/clinical`);
            setData(res.data);
        } catch (error) {
            toast.error('Failed to load chart');
        } finally {
            setLoading(false);
        }
    };

    const handleAddObservation = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/inpatient/${admissionId}/observation`, {
                vitals: {
                    ...vitals,
                    systolic: vitals.systolic ? parseInt(vitals.systolic) : null,
                    diastolic: vitals.diastolic ? parseInt(vitals.diastolic) : null,
                    heart_rate: vitals.heart_rate ? parseInt(vitals.heart_rate) : null,
                    temperature: vitals.temperature ? parseFloat(vitals.temperature) : null,
                    resp_rate: vitals.resp_rate ? parseInt(vitals.resp_rate) : null,
                    sats: vitals.sats ? parseInt(vitals.sats) : null,
                },
                notes,
                nurse_name: 'Nurse' // Placeholder
            });
            toast.success('Observation Added');
            setVitals({ temperature: '', systolic: '', diastolic: '', heart_rate: '', resp_rate: '', sats: '' });
            setNotes('');
            fetchClinical();
        } catch (error) {
            toast.error('Failed to save');
        }
    };

    const handleGiveMed = async (item) => {
        try {
            await api.post(`/inpatient/${admissionId}/mar`, {
                prescription_item_id: item.id,
                medicine_name: item.medicine.name,
                status: 'GIVEN',
                nurse_name: 'Nurse'
            });
            toast.success('Medication Logged');
            fetchClinical();
        } catch (error) {
            toast.error('Failed to log');
        }
    };

    if (loading) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold">{data?.admission?.patient?.name}</h2>
                        <div className="text-blue-100 flex gap-4 text-sm mt-1">
                            <span>RM: {data?.admission?.patient?.no_rm}</span>
                            <span>Admitted: {new Date(data?.admission?.check_in_time).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30"><AlertCircle className="rotate-45" /></button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button onClick={() => setActiveTab('observation')} className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider ${activeTab === 'observation' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-400'}`}>Observation (CPPT)</button>
                    <button onClick={() => setActiveTab('mar')} className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider ${activeTab === 'mar' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-400'}`}>Medication (e-MAR)</button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {activeTab === 'observation' ? (
                        <div className="space-y-8">
                            {/* Input Form */}
                            <form onSubmit={handleAddObservation} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><Activity size={18} /> New Observation</h3>
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                                    <input placeholder="Sys" className="p-2 rounded-lg text-center font-mono font-bold" value={vitals.systolic} onChange={e => setVitals({ ...vitals, systolic: e.target.value })} />
                                    <input placeholder="Dia" className="p-2 rounded-lg text-center font-mono font-bold" value={vitals.diastolic} onChange={e => setVitals({ ...vitals, diastolic: e.target.value })} />
                                    <input placeholder="HR" className="p-2 rounded-lg text-center font-mono font-bold" value={vitals.heart_rate} onChange={e => setVitals({ ...vitals, heart_rate: e.target.value })} />
                                    <input placeholder="Temp" className="p-2 rounded-lg text-center font-mono font-bold" value={vitals.temperature} onChange={e => setVitals({ ...vitals, temperature: e.target.value })} />
                                    <input placeholder="RR" className="p-2 rounded-lg text-center font-mono font-bold" value={vitals.resp_rate} onChange={e => setVitals({ ...vitals, resp_rate: e.target.value })} />
                                    <input placeholder="Sats%" className="p-2 rounded-lg text-center font-mono font-bold" value={vitals.sats} onChange={e => setVitals({ ...vitals, sats: e.target.value })} />
                                </div>
                                <textarea placeholder="Clinical Notes (S/O)..." className="w-full p-3 rounded-lg mb-4 h-20 bg-white" value={notes} onChange={e => setNotes(e.target.value)} />
                                <button type="submit" className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl">Save Observation</button>
                            </form>

                            {/* History List */}
                            <div className="space-y-4">
                                {data?.admission?.observations?.map(obs => (
                                    <div key={obs.id} className="flex gap-4 p-4 border-b border-gray-100 dark:border-gray-800">
                                        <div className="font-mono text-xs text-gray-400 w-24 pt-1">
                                            {new Date(obs.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            <div className="text-[10px]">{new Date(obs.timestamp).toLocaleDateString()}</div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex gap-4 font-mono font-bold text-sm mb-1 text-blue-600">
                                                {obs.systolic && <span>BP: {obs.systolic}/{obs.diastolic}</span>}
                                                {obs.heart_rate && <span>HR: {obs.heart_rate}</span>}
                                                {obs.temperature && <span>T: {obs.temperature}°C</span>}
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm">{obs.notes}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><CheckCircle size={18} /> Scheduled Medications</h3>
                            {data?.prescriptions?.flatMap(p => p.items).map(item => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
                                    <div>
                                        <div className="font-bold text-lg">{item.medicine.name}</div>
                                        <div className="text-sm text-gray-500 font-mono">{item.dosage} • {item.quantity} pcs</div>
                                        {item.notes && <div className="text-xs text-orange-500 mt-1">Note: {item.notes}</div>}
                                    </div>
                                    <button
                                        onClick={() => handleGiveMed(item)}
                                        className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 flex items-center gap-2"
                                    >
                                        Give Now
                                    </button>
                                </div>
                            ))}

                            <h3 className="font-bold text-gray-700 dark:text-gray-300 mt-8 mb-4 border-t pt-8">Administration Log</h3>
                            <div className="space-y-2">
                                {data?.admission?.medication_logs?.map(log => (
                                    <div key={log.id} className="text-sm flex gap-3 text-gray-500">
                                        <span className="font-mono text-gray-400">{new Date(log.given_at).toLocaleTimeString()}</span>
                                        <span className="font-bold text-gray-800 dark:text-gray-200">{log.medicine_name}</span>
                                        <span className="text-green-600 font-bold text-xs uppercase px-2 bg-green-50 rounded-full">{log.status}</span>
                                        <span className="text-xs">by {log.given_by}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default InpatientNurseDashboard;
