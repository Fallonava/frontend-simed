import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard, Calendar, User, CheckCircle, ArrowRight, ArrowLeft,
    Clock, MapPin, Activity, Stethoscope, Ticket, Heart, Loader2
} from 'lucide-react';
import axios from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import ModernHeader from '../components/ModernHeader';
import SmoothScrollArea from '../components/SmoothScrollArea';

// --- COMPONENTS ---

// Step 1: Patient Identification
const StepIdentity = ({ onNext, loading }) => {
    const [idType, setIdType] = useState('NIK'); // NIK or BPJS
    const [idNumber, setIdNumber] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (idNumber.length < 5) return toast.error('Nomor identitas tidak valid');
        onNext({ idType, idNumber });
    };

    return (
        <div className="w-full max-w-lg mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 text-center">Selamat Datang</h2>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-8">Silakan masukkan identitas Anda untuk memulai</p>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-3xl border border-white/40 dark:border-gray-700 rounded-3xl p-8 shadow-xl">
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setIdType('NIK')}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${idType === 'NIK'
                            ? 'bg-emerald-500 text-white shadow-lg scale-105'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}
                    >
                        NIK (KTP)
                    </button>
                    <button
                        onClick={() => setIdType('BPJS')}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${idType === 'BPJS'
                            ? 'bg-blue-500 text-white shadow-lg scale-105'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}
                    >
                        Kartu BPJS
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nomor {idType}
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <CreditCard className="text-gray-400" size={20} />
                            </div>
                            <input
                                type="text"
                                value={idNumber}
                                onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))} // Numbers only
                                className="w-full pl-11 pr-4 py-4 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-xl tracking-wider font-mono transition-all"
                                placeholder={`Masukkan 16 digit ${idType}`}
                                autoFocus
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <>
                                Lanjut
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Step 2: Poli Selection
const StepPoli = ({ onBack, onSelect, loading }) => {
    const [poliklinikList, setPoliklinikList] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(true);

    useEffect(() => {
        const fetchPolies = async () => {
            try {
                const res = await axios.get('/polies');
                // Map API data to UI structure if needed, or just use directly
                // Check if icon is available or map it
                const mapped = res.data.map(p => ({
                    id: p.id,
                    name: p.name,
                    icon: <Stethoscope />, // Dynamic mapping could be added here
                    color: 'bg-blue-500' // Dynamic color or hash based
                }));
                setPoliklinikList(mapped);
            } catch (err) {
                toast.error('Gagal memuat data poliklinik');
            } finally {
                setFetchLoading(false);
            }
        };
        fetchPolies();
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="p-3 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Pilih Layanan</h2>
                <div className="w-12"></div> {/* Spacer */}
            </div>

            {fetchLoading ? (
                <div className="flex h-40 items-center justify-center">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {poliklinikList.map((poli) => (
                        <button
                            key={poli.id}
                            onClick={() => onSelect(poli)}
                            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/40 dark:border-gray-700 p-6 rounded-[24px] shadow-lg hover:shadow-2xl hover:-translate-y-1 hover:border-blue-500/30 transition-all group text-left flex items-center gap-4"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600`}>
                                {poli.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-1">{poli.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Klik untuk pilih</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Step 3: Success Ticket
const StepSuccess = ({ ticket, onReset }) => {
    return (
        <div className="w-full max-w-md mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                {/* Decorative Top */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                <div className="mb-6">
                    <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Booking Berhasil!</h2>
                    <p className="text-gray-500">Silakan simpan tiket antrean Anda</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 mb-8 relative">
                    <div className="absolute -left-3 top-1/2 w-6 h-6 bg-white dark:bg-gray-800 rounded-full"></div>
                    <div className="absolute -right-3 top-1/2 w-6 h-6 bg-white dark:bg-gray-800 rounded-full"></div>

                    <div className="text-sm text-gray-400 uppercase tracking-widest mb-1">Nomor Antrean</div>
                    <div className="text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
                        {ticket.nomorantrean}
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600 dark:text-gray-300">
                            <span>Poli:</span>
                            <span className="font-bold">{ticket.namapoli}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-300">
                            <span>Dokter:</span>
                            <span className="font-bold">{ticket.namadokter}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-300">
                            <span>Estimasi:</span>
                            <span className="font-bold text-blue-500">
                                {new Date(ticket.estimasidilayani).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onReset}
                    className="w-full py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-opacity"
                >
                    Selesai
                </button>
            </div>
        </div>
    );
};


const OnlineBooking = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [ticket, setTicket] = useState(null);

    const handleIdentitySubmit = async (data) => {
        setLoading(true);
        // Simulate Check Patient API
        setTimeout(() => {
            setFormData({ ...formData, ...data });
            setLoading(false);
            setStep(2);
        }, 1000); // Fake delay
    };

    const handlePoliSelect = async (poli) => {
        setLoading(true);
        try {
            // Call API
            const payload = {
                nomorkartu: formData.idNumber, // In real app, derived from IdType
                nik: formData.idNumber,
                kodepoli: poli.id,
                tanggalperiksa: new Date().toISOString().split('T')[0],
                keluhan: 'Checkup Via Kiosk'
            };

            const response = await axios.post('/antrean/ambil', payload);

            if (response.data.metadata.code === 200) {
                setTicket(response.data.response);
                setStep(3);
                toast.success('Antrean berhasil dibuat!');
            } else {
                toast.error(response.data.metadata.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Gagal mengambil antrean');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col font-sans">
            <ModernHeader
                title="Anjungan Mandiri"
                subtitle="Fallonava Hospital System"
                onBack={step === 1 ? null : () => setStep(step - 1)}
            />

            <SmoothScrollArea className="flex-1">
                <div className="max-w-[1920px] mx-auto p-4 md:p-12 flex items-center justify-center min-h-[80vh]">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full"
                            >
                                <StepIdentity onNext={handleIdentitySubmit} loading={loading} />
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full"
                            >
                                <StepPoli
                                    onBack={() => setStep(1)}
                                    onSelect={handlePoliSelect}
                                    loading={loading}
                                />
                            </motion.div>
                        )}

                        {step === 3 && ticket && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full"
                            >
                                <StepSuccess ticket={ticket} onReset={() => { setStep(1); setTicket(null); setFormData({}); }} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </SmoothScrollArea>
        </div>
    );
};

export default OnlineBooking;
