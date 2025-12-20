import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Calendar, Clock, MapPin, ChevronRight, Search, Filter,
    Activity, CreditCard, CheckCircle, Bed, AlertCircle, RefreshCcw,
    FileText, Printer, ArrowRight
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import PageWrapper from '../components/PageWrapper';
import ModernHeader from '../components/ModernHeader';

const RegistrationRanap = () => {
    const navigate = useNavigate();
    const [pendingList, setPendingList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Process Admission State
    const [showProcessModal, setShowProcessModal] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [selectedBed, setSelectedBed] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('UMUM'); // UMUM | BPJS

    // BPJS SEP State
    const [sepData, setSepData] = useState(null);
    const [isGeneratingSEP, setIsGeneratingSEP] = useState(false);
    const [sepInput, setSepInput] = useState({ rujukan: '', diagnosa: '' });

    useEffect(() => {
        fetchPendingAdmissions();
        fetchRooms();
    }, []);

    const fetchPendingAdmissions = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admission/pending');
            if (res.data.status === 'success') {
                setPendingList(res.data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Gagal memuat daftar pasien');
        } finally {
            setLoading(false);
        }
    };

    const fetchRooms = async () => {
        try {
            const res = await api.get('/admission/rooms');
            if (res.data.status === 'success') {
                setRooms(res.data.data);
            }
        } catch (error) {
            console.error("Failed fetching rooms");
        }
    };

    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        setShowProcessModal(true);
        // Pre-fill SEP Diagnosa from Medical Record Assessment if available
        if (patient.assessment) {
            setSepInput(prev => ({ ...prev, diagnosa: patient.assessment }));
        }
    };

    const handleGenerateSEP = async () => {
        setIsGeneratingSEP(true);
        // Simulate API Call
        setTimeout(() => {
            const mockSEP = {
                noSep: `SEP-${new Date().getTime()}`,
                tglSep: new Date().toISOString().split('T')[0],
                peserta: selectedPatient.patient.name,
                poli: 'RAWAT INAP',
                diagnosa: sepInput.diagnosa
            };
            setSepData(mockSEP);
            setIsGeneratingSEP(false);
            toast.success('SEP Berhasil Diterbitkan');
        }, 1500);
    };

    const handleFinalizeAdmission = async () => {
        if (!selectedBed) {
            toast.error('Pilih Bed terlebih dahulu');
            return;
        }
        if (paymentMethod === 'BPJS' && !sepData) {
            toast.error('Terbitkan SEP terlebih dahulu untuk pasien BPJS');
            return;
        }

        const toastId = toast.loading('Memproses Admisi...');
        try {
            await api.post('/admission/checkin', {
                patientId: selectedPatient.patient.id,
                bedId: selectedBed.id,
                diagnosa: selectedPatient.assessment || 'Admission via Registration',
                paymentMethod,
                sepNumber: sepData?.noSep || null
            });

            toast.success('Pasien Berhasil Masuk Rawat Inap!', { id: toastId });
            setShowProcessModal(false);
            setSelectedPatient(null);
            setSelectedBed(null);
            setSepData(null);
            fetchPendingAdmissions(); // Refresh List
            // Optional: Navigate to Admission Dashboard to see result
            // navigate('/admission-dashboard');
        } catch (error) {
            console.error(error);
            toast.error('Gagal Memproses Admisi', { id: toastId });
        }
    };

    // Filter available beds (flattening room structure)
    const availableBeds = rooms.flatMap(room =>
        room.beds.filter(bed => bed.status === 'AVAILABLE').map(bed => ({ ...bed, roomName: room.name, roomClass: room.class }))
    );

    return (
        <PageWrapper title="Inpatient Registration">
            <Toaster position="top-center" />
            <ModernHeader
                title="Inpatient Admission Worklist"
                subtitle="Manage Pending Admissions & Bed Allocation"
            />

            <div className="p-6 max-w-[1600px] mx-auto">
                {/* STATUS BAR */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-4">
                        <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User size={20} /></div>
                            <div>
                                <div className="text-xs text-gray-500 font-bold uppercase">Pending Patients</div>
                                <div className="text-2xl font-black">{pendingList.length}</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Bed size={20} /></div>
                            <div>
                                <div className="text-xs text-gray-500 font-bold uppercase">Available Beds</div>
                                <div className="text-2xl font-black">{availableBeds.length}</div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={fetchPendingAdmissions}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl font-bold text-sm text-gray-600 shadow-sm border border-gray-100 hover:bg-gray-50 transition"
                    >
                        <RefreshCcw size={16} /> Refresh List
                    </button>
                </div>

                {/* WORKLIST GRID */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Activity className="animate-spin text-blue-500" size={32} />
                    </div>
                ) : pendingList.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200">
                        <CheckCircle size={48} className="mx-auto text-green-200 mb-4" />
                        <h3 className="text-xl font-bold text-gray-400">All caught up!</h3>
                        <p className="text-gray-400">No pending admissions found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingList.map(item => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={item.id}
                                className="bg-white dark:bg-gray-800 p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                            {item.patient.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{item.patient.name}</h4>
                                            <p className="text-xs text-gray-500 font-mono">{item.patient.no_rm}</p>
                                        </div>
                                    </div>
                                    <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                        Urgent
                                    </span>
                                </div>

                                <div className="space-y-3 mb-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl">
                                    <div className="flex items-start gap-3">
                                        <Activity size={16} className="text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold uppercase">Diagnosis</p>
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.assessment}</p>
                                        </div>
                                    </div>
                                    <div className="w-full h-px bg-gray-200 dark:bg-gray-700" />
                                    <div className="flex items-center gap-3">
                                        <User size={16} className="text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold uppercase">Referring Doctor</p>
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Dr. {item.doctor?.name}</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleSelectPatient(item)}
                                    className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-lg group-hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    Process Admission <ArrowRight size={18} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* PROCESS MODAL */}
            <AnimatePresence>
                {showProcessModal && selectedPatient && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl flex flex-col md:flex-row overflow-hidden"
                        >
                            {/* LEFT: PATIENT INFO */}
                            <div className="md:w-1/3 bg-gray-50 dark:bg-gray-900 p-8 border-r border-gray-100 dark:border-gray-800 flex flex-col">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Patient Summary</h3>
                                <div className="text-center mb-8">
                                    <div className="w-24 h-24 mx-auto bg-white rounded-full shadow-lg p-1 mb-4">
                                        <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-600">
                                            {selectedPatient.patient.name.charAt(0)}
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-1">{selectedPatient.patient.name}</h2>
                                    <div className="inline-block bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-mono font-bold text-gray-600 dark:text-gray-300">
                                        {selectedPatient.patient.no_rm}
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Referral Diagnosis</p>
                                        <p className="font-medium text-sm">{selectedPatient.assessment}</p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Gender / DOB</p>
                                        <p className="font-medium text-sm">
                                            {selectedPatient.patient.gender === 'L' ? 'Male' : 'Female'} • {new Date(selectedPatient.patient.birth_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: ACTION FORM */}
                            <div className="flex-1 p-8 flex flex-col relative">
                                <button onClick={() => setShowProcessModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100"><ArrowRight size={20} className="rotate-180" /></button>

                                <h2 className="text-2xl font-bold mb-6">Complete Admission</h2>

                                {/* STEP 1: BED SELECTION */}
                                <section className="mb-8">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs">1</div> Select Room & Bed</h3>

                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {availableBeds.map(bed => (
                                            <div
                                                key={bed.id}
                                                onClick={() => setSelectedBed(bed)}
                                                className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-left
                                                    ${selectedBed?.id === bed.id
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/20'
                                                        : 'border-gray-100 hover:border-blue-300 bg-white dark:bg-gray-700'
                                                    }`}
                                            >
                                                <div className="font-bold text-sm">{bed.code}</div>
                                                <div className="text-xs text-gray-500">{bed.roomName} ({bed.roomClass})</div>
                                            </div>
                                        ))}
                                    </div>
                                    {selectedBed && (
                                        <div className="mt-2 text-xs text-green-600 font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                            <CheckCircle size={14} /> Selected: {selectedBed.roomName} - Bed {selectedBed.code}
                                        </div>
                                    )}
                                </section>

                                {/* STEP 2: PAYMENT & SEP */}
                                <section className="mb-8 flex-1">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs">2</div> Payment / Insurance</h3>

                                    <div className="flex gap-4 mb-4">
                                        {['UMUM', 'BPJS'].map(method => (
                                            <button
                                                key={method}
                                                onClick={() => setPaymentMethod(method)}
                                                className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all
                                                    ${paymentMethod === method
                                                        ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                                                        : 'border-gray-200 text-gray-400 hover:border-gray-400'
                                                    }`}
                                            >
                                                {method}
                                            </button>
                                        ))}
                                    </div>

                                    <AnimatePresence>
                                        {paymentMethod === 'BPJS' && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                className="bg-green-50 dark:bg-green-900/20 border border-green-100 p-4 rounded-xl overflow-hidden"
                                            >
                                                {!sepData ? (
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="font-bold text-green-800 dark:text-green-400 text-sm">Generate SEP Rawat Inap</h4>
                                                            <span className="text-[10px] bg-white/50 px-2 py-1 rounded">V-CLAIM</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <input
                                                                placeholder="No. Rujukan"
                                                                className="p-2.5 text-sm rounded-lg border-none focus:ring-1 focus:ring-green-500"
                                                                value={sepInput.rujukan}
                                                                onChange={e => setSepInput({ ...sepInput, rujukan: e.target.value })}
                                                            />
                                                            <input
                                                                placeholder="Diagnosa ICD-10"
                                                                className="p-2.5 text-sm rounded-lg border-none focus:ring-1 focus:ring-green-500"
                                                                value={sepInput.diagnosa}
                                                                onChange={e => setSepInput({ ...sepInput, diagnosa: e.target.value })}
                                                            />
                                                        </div>
                                                        <button
                                                            disabled={isGeneratingSEP}
                                                            onClick={handleGenerateSEP}
                                                            className="w-full py-2.5 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition"
                                                        >
                                                            {isGeneratingSEP ? 'Generating...' : 'Create SEP'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <div className="text-[10px] font-bold text-green-600 uppercase">SEP Number</div>
                                                            <div className="text-xl font-mono font-bold text-green-800">{sepData.noSep}</div>
                                                        </div>
                                                        <div className="bg-white p-2 rounded-full text-green-600"><CheckCircle size={24} /></div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </section>

                                {/* FOOTER ACTION */}
                                <button
                                    onClick={handleFinalizeAdmission}
                                    disabled={!selectedBed || (paymentMethod === 'BPJS' && !sepData)}
                                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    Finalize Admission <Printer size={20} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </PageWrapper>
    );
};

export default RegistrationRanap;
