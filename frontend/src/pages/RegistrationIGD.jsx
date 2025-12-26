import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, CheckCircle, Printer, X, Activity, RefreshCcw, Siren } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import PageWrapper from '../components/PageWrapper';
import ModernHeader from '../components/ModernHeader';
import PatientSearchSidebar from '../components/registration/PatientSearchSidebar';
import ServiceSelection from '../components/registration/ServiceSelection';
import { useRegistrationLogic } from '../hooks/useRegistrationLogic';
import api from '../utils/axiosConfig';

const RegistrationIGD = () => {
    // Shared Logic
    const {
        clinics, doctors,
        searchTerm, setSearchTerm, isSearching, searchResults,
        patientFound, recentPatients,
        selectedClinic, setSelectedClinic,
        selectedDoctor, setSelectedDoctor,
        paymentType, setPaymentType,
        ticketData, setTicketData,
        showNewPatientModal, setShowNewPatientModal,
        showSEPModal, setShowSEPModal, sepData, setSepData,
        handleSearch, handleSelectPatient, handleClearPatient, handleReset,
        handleRegister, handlePrintTicket
    } = useRegistrationLogic('IGD');

    // Auto-Select IGD Clinic
    useEffect(() => {
        if (clinics.length > 0) {
            const igdClinic = clinics.find(c => c.name.toLowerCase().includes('gawat') || c.name.toLowerCase().includes('igd'));
            if (igdClinic) {
                setSelectedClinic(igdClinic.id);
            }
        }
    }, [clinics, setSelectedClinic]);

    // Local State
    const [newPatientForm, setNewPatientForm] = useState({
        name: '', nik: '', phone: '', address: '', birth_date: '', gender: 'L', bpjs_card_no: ''
    });

    const handleCreatePatientSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/patients/create', newPatientForm);
            if (res.data.status === 'success') {
                toast.success('Patient Created!');
                setShowNewPatientModal(false);
                handleSelectPatient(res.data.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create patient');
        }
    };

    // SEP Generation
    const [sepInput, setSepInput] = useState({ rujukan: '', diagnosa: '' });
    const [isGeneratingSEP, setIsGeneratingSEP] = useState(false);

    const handleGenerateSEP = async () => {
        setIsGeneratingSEP(true);
        try {
            setTimeout(() => {
                const mockSEP = {
                    noSep: `SEP-IGD-${Date.now()}`,
                    tglSep: new Date().toISOString().split('T')[0],
                    peserta: patientFound.name,
                    poli: 'IGD',
                    diagnosa: sepInput.diagnosa
                };
                setSepData(mockSEP);
                toast.success('SEP Generated Successfully');
                setShowSEPModal(false);
            }, 1000);
        } catch (e) {
            toast.error('Failed to generate SEP');
        } finally {
            setIsGeneratingSEP(false);
        }
    };

    return (
        <PageWrapper title="IGD Registration">
            <Toaster position="top-center" />
            <ModernHeader
                title="IGD Registration"
                subtitle="Emergency Unit Patient Admission"
            />

            <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-theme(spacing.48))] min-h-[600px] pb-6">

                {/* LEFT: Search & Lists */}
                <PatientSearchSidebar
                    mode="IGD"
                    searchTerm={searchTerm}
                    onSearchChange={(val) => { setSearchTerm(val); handleSearch(val); }}
                    onSearchSubmit={() => handleSearch(searchTerm)}
                    searchResults={searchResults}
                    patientFound={patientFound}
                    onSelectPatient={handleSelectPatient}
                    onClearPatient={handleClearPatient}
                    recentPatients={recentPatients}
                    onReset={handleReset}
                    onNewPatientClick={() => setShowNewPatientModal(true)}
                />

                {/* RIGHT: Service Selection */}
                <ServiceSelection
                    mode="IGD"
                    clinics={clinics}
                    doctors={doctors}
                    selectedClinic={selectedClinic}
                    selectedDoctor={selectedDoctor}
                    paymentType={paymentType}
                    setPaymentType={setPaymentType}
                    sepData={sepData}
                    onSelectClinic={setSelectedClinic}
                    onSelectDoctor={setSelectedDoctor}
                    onRegister={handleRegister}
                    patientFound={patientFound}
                    autoSelectIGD={true}
                />
            </div>

            {/* MODALS - Reused Structure */}

            {/* NEW PATIENT MODAL */}
            <AnimatePresence>
                {showNewPatientModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-red-500/20">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-red-50 dark:bg-red-900/20">
                                <h3 className="text-xl font-bold text-red-700 dark:text-red-400 flex items-center gap-2"><Siren size={20} /> New Patient (Emergency)</h3>
                                <button onClick={() => setShowNewPatientModal(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
                            </div>
                            <form onSubmit={handleCreatePatientSubmit} className="p-8 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                                        <input required className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-700 font-bold border-2 border-red-100 dark:border-red-900/30" value={newPatientForm.name} onChange={e => setNewPatientForm({ ...newPatientForm, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">NIK / ID</label>
                                        <input required maxLength={16} className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-700 font-mono font-bold" value={newPatientForm.nik} onChange={e => setNewPatientForm({ ...newPatientForm, nik: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                                        <input className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-700 font-bold" value={newPatientForm.phone} onChange={e => setNewPatientForm({ ...newPatientForm, phone: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Birth Date</label>
                                        <input type="date" required className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-700 font-bold" value={newPatientForm.birth_date} onChange={e => setNewPatientForm({ ...newPatientForm, birth_date: e.target.value })} />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Address</label>
                                        <textarea required className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-700 font-bold h-24 resize-none" value={newPatientForm.address} onChange={e => setNewPatientForm({ ...newPatientForm, address: e.target.value })} />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowNewPatientModal(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
                                    <button type="submit" className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-500/30">Create Patient</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* SEP MODAL */}
            <AnimatePresence>
                {showSEPModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-white/20">
                            <div className="bg-green-600 p-6 flex justify-between items-center text-white">
                                <h3 className="font-bold text-lg">Generate SEP (IGD)</h3>
                                <button onClick={() => setShowSEPModal(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/30"><X size={18} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm mb-4">
                                    <strong>Note:</strong> Pastikan pasien dalam kondisi gawat darurat sesuai kriteria BPJS.
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Diagnosa Masuk</label>
                                    <input className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-700 font-bold" value={sepInput.diagnosa} onChange={e => setSepInput({ ...sepInput, diagnosa: e.target.value })} placeholder="Input Diagnosis Code" />
                                </div>
                                <button
                                    onClick={handleGenerateSEP}
                                    disabled={isGeneratingSEP}
                                    className="w-full py-4 mt-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
                                >
                                    {isGeneratingSEP ? <Activity className="animate-spin" /> : <CheckCircle />}
                                    Generate Emergency SEP
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* TICKET / SUCCESS MODAL */}
            <AnimatePresence>
                {ticketData && (
                    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-8 text-center border-t-4 border-red-500">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                                <Siren size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check-in Success!</h2>
                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 my-6 relative">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">QUEUE NUMBER</div>
                                <div className="text-6xl font-black text-red-600 tracking-tighter">{ticketData.queue_code}</div>
                                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">Unit</span><span className="font-bold text-gray-900">IGD</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Doctor</span><span className="font-bold text-gray-900">{ticketData.doctorName}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Patient</span><span className="font-bold text-gray-900">{ticketData.patient?.name}</span></div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setTicketData(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200">Close</button>
                                <button onClick={handlePrintTicket} className="flex-1 py-3 bg-red-600 rounded-xl font-bold text-white hover:bg-red-700 flex items-center justify-center gap-2">
                                    <Printer size={18} /> Print Wristband
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </PageWrapper>
    );
};

export default RegistrationIGD;
