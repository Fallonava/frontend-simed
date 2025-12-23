import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/PageWrapper';
import BedCanvas from '../components/BedCanvas';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bed, Activity, User, CheckCircle, Clock, Search,
    Filter, AlertCircle, LogOut, Check, MoreVertical,
    Users, LayoutGrid, ListFilter, ArrowRight, X,
    ChevronRight, Zap, Info, ShieldAlert
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ModernHeader from '../components/ModernHeader';

const AdmissionDashboard = () => {
    const navigate = useNavigate();
    const [pendingAdmissions, setPendingAdmissions] = useState([]);
    const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, VIP, ICU, KELAS_1, etc.
    const [genderFilter, setGenderFilter] = useState('ALL');

    // Admit Form State
    const [patientSearch, setPatientSearch] = useState('');
    const [foundPatient, setFoundPatient] = useState(null);
    const [diagnosa, setDiagnosa] = useState('');

    // Dashboard State
    const [rooms, setRooms] = useState([]);
    const [stats, setStats] = useState({ total: 0, available: 0, occupied: 0, cleaning: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedBed, setSelectedBed] = useState(null);
    const [showAdmitModal, setShowAdmitModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchRooms();
        fetchPending();
    }, []);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admission/rooms');
            if (res.data.status === 'success') {
                setRooms(res.data.data);
                setStats(res.data.stats);
            }
        } catch (error) {
            toast.error('Gagal memuat data ruangan');
        } finally {
            setLoading(false);
        }
    };

    const fetchPending = async () => {
        try {
            const res = await api.get('/admission/pending');
            if (res.data.status === 'success') {
                setPendingAdmissions(res.data.data);
            }
        } catch (error) {
            console.error("Gagal memuat antrean pending", error);
        }
    };

    const handleBedClick = (bed) => {
        setSelectedBed(bed);
        if (bed.status === 'AVAILABLE') {
            setShowAdmitModal(true);
            setFoundPatient(null);
            setPatientSearch('');
        } else if (bed.status === 'OCCUPIED' || bed.current_patient) {
            setShowDetailModal(true);
        } else if (bed.status === 'CLEANING') {
            handleUpdateStatus(bed.id, 'AVAILABLE');
        }
    };

    const handleAdmit = async () => {
        if (!foundPatient || !selectedBed) return;
        try {
            await api.post('/admission/checkin', {
                patientId: foundPatient.id,
                bedId: selectedBed.id,
                diagnosa
            });
            toast.success('Pasien Berhasil Rawat Inap!');
            setShowAdmitModal(false);
            setFoundPatient(null);
            fetchRooms();
            fetchPending();
        } catch (error) {
            toast.error('Admisi gagal');
        }
    };

    const handleSearchPatient = async (e) => {
        if (e) e.preventDefault();
        try {
            toast.loading('Mencari Pasien...', { id: 'search' });
            if (patientSearch.length > 0) {
                // Real API would be called here
                setFoundPatient({ id: patientSearch, name: `Pasien MR-${patientSearch}`, nik: '1234567890...' });
                toast.success('Pasien ditemukan', { id: 'search' });
            }
        } catch (e) { toast.error('Error', { id: 'search' }); }
    };

    const handleDischarge = async () => {
        try {
            await api.post('/admission/checkout', { bedId: selectedBed.id });
            toast.success('Pasien Berhasil Keluar');
            setShowDetailModal(false);
            fetchRooms();
        } catch (error) {
            toast.error('Checkout gagal');
        }
    };

    const handleUpdateStatus = async (bedId, status) => {
        try {
            await api.put('/admission/bed-status', { bedId, status });
            toast.success(`Bed ditandai sebagai ${status}`);
            fetchRooms();
        } catch (error) {
            toast.error('Gagal update status');
        }
    };

    const filteredRooms = rooms.filter(room => {
        const matchesType = activeFilter === 'ALL' || room.type === activeFilter;
        const matchesGender = genderFilter === 'ALL' || room.gender === genderFilter;
        const matchesSearch = searchQuery === '' ||
            room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.beds.some(b => b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (b.current_patient && b.current_patient.name.toLowerCase().includes(searchQuery.toLowerCase())));

        return matchesType && matchesGender && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-black p-6 lg:p-10 font-apple overflow-hidden">
            <ModernHeader
                title="Admission Console"
                subtitle="Bed Management & Unified Inpatient HUB"
                onBack={() => navigate('/menu')}
                className="mb-10"
                actions={(
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Cari Pasien, Bed, atau Ruangan..."
                                className="pl-12 pr-6 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800 rounded-2xl w-[300px] outline-none shadow-sm focus:ring-2 ring-blue-500/20 transition-all font-bold text-sm"
                            />
                        </div>
                    </div>
                )}
            />

            {/* SPLIT VIEW LAYOUT */}
            <div className="flex gap-8 h-[calc(100vh-180px)] overflow-hidden">

                {/* LEFT: BED GRID (75%) */}
                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar flex flex-col gap-8">

                    {/* STATS DOCK */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard label="Total Bed" value={stats.total} icon={<Bed size={22} />} color="blue" />
                        <StatCard label="Tersedia" value={stats.available} icon={<CheckCircle size={22} />} color="emerald" />
                        <StatCard label="Terisi" value={stats.occupied} icon={<User size={22} />} color="rose" />
                        <StatCard label="Pembersihan" value={stats.cleaning} icon={<Activity size={22} />} color="amber" />
                    </div>

                    {/* SMART FILTER DOCK */}
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white dark:border-slate-800 rounded-[32px] px-8 py-4">
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                            <LayoutGrid size={18} className="text-slate-400 mr-2" />
                            {['ALL', 'VIP', 'ICU', 'KELAS_1', 'KELAS_2', 'KELAS_3'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap
                                        ${activeFilter === f
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                            : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
                                >
                                    {f.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden lg:block" />
                        <div className="flex items-center gap-2">
                            <ListFilter size={18} className="text-slate-400 mr-2" />
                            {['ALL', 'L', 'P'].map(g => (
                                <button
                                    key={g}
                                    onClick={() => setGenderFilter(g)}
                                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all flex items-center justify-center
                                        ${genderFilter === g
                                            ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xl'
                                            : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* BED CANVAS */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4">
                            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                            <p className="font-black text-slate-400 uppercase tracking-widest text-xs animate-pulse">Memuat Bangsal...</p>
                        </div>
                    ) : (
                        <BedCanvas rooms={filteredRooms} onBedClick={handleBedClick} />
                    )}
                </div>

                {/* RIGHT: CONTROL CENTER SIDEBAR (25%) */}
                <div className="w-[380px] flex flex-col gap-6">
                    <div className="flex-1 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[40px] border border-white dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">Control Center</h3>
                                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
                                    <Zap size={18} />
                                </div>
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Antrean Admisi Ranap</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {pendingAdmissions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                                    <ShieldAlert size={48} className="text-slate-200 dark:text-slate-800 mb-4" />
                                    <p className="text-sm font-bold text-slate-400">Tidak ada antrean pending</p>
                                    <p className="text-xs text-slate-500 mt-2">Pasien dari RJ atau IGD yang membutuhkan rawat inap akan muncul di sini.</p>
                                </div>
                            ) : (
                                pendingAdmissions.map((pending, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={idx}
                                        className="group p-5 bg-white/40 dark:bg-slate-800/40 border border-white dark:border-slate-700/50 rounded-3xl hover:bg-white dark:hover:bg-slate-800 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                                        onClick={() => {
                                            setFoundPatient({ id: pending.id, name: pending.patient_name, nik: pending.nik });
                                            setDiagnosa(pending.diagnosa || '');
                                            toast.success(`Pasien terdata: ${pending.patient_name}`);
                                        }}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center font-black">
                                                {pending.patient_name.charAt(0)}
                                            </div>
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider 
                                                ${pending.origin === 'IGD' ? 'bg-red-500 text-white' : 'bg-indigo-500 text-white'}`}>
                                                {pending.origin}
                                            </span>
                                        </div>
                                        <div className="font-black text-slate-800 dark:text-white mb-1 truncate">{pending.patient_name}</div>
                                        <div className="text-[10px] font-bold text-slate-400 mb-4 italic truncate">Diag: {pending.diagnosa || 'Pemeriksaan Lanjut'}</div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700/50 transition-all">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <Clock size={12} /> {new Date(pending.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => navigate('/registration/ranap')}
                                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:scale-[1.02] transition shadow-xl"
                            >
                                <ArrowRight size={18} /> Pendaftaran Baru
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ADMIT MODAL */}
            <AnimatePresence>
                {showAdmitModal && selectedBed && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xl z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[48px] w-full max-w-xl p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white dark:border-slate-800 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 blur-[60px] rounded-full -mr-20 -mt-20" />

                            <h2 className="text-3xl font-black mb-2 tracking-tighter">Admisi Pasien</h2>
                            <p className="text-slate-500 font-bold text-sm mb-10 flex items-center gap-2">
                                Bangsal: <span className="text-blue-600 dark:text-blue-400 font-black tracking-widest uppercase">{selectedBed.code}</span>
                            </p>

                            <form onSubmit={(e) => { e.preventDefault(); handleAdmit(); }} className="space-y-8 relative z-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Nomor Rekam Medis / NIK</label>
                                    <div className="flex gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-[28px] border border-slate-100 dark:border-slate-700">
                                        <input
                                            value={patientSearch}
                                            onChange={e => setPatientSearch(e.target.value)}
                                            className="flex-1 bg-transparent px-4 py-3 outline-none font-bold placeholder:text-slate-400"
                                            placeholder="MR-000000 atau NIK"
                                        />
                                        <button type="button" onClick={handleSearchPatient} className="bg-blue-600 text-white px-6 rounded-2xl hover:scale-105 active:scale-95 transition">
                                            <Search size={20} className="stroke-[3]" />
                                        </button>
                                    </div>
                                    {foundPatient && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-sm font-black flex items-center gap-3">
                                            <CheckCircle size={20} className="stroke-[3]" /> {foundPatient.name}
                                        </motion.div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Diagnosa Awal</label>
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-[28px] border border-slate-100 dark:border-slate-700 p-2">
                                        <input
                                            value={diagnosa}
                                            onChange={e => setDiagnosa(e.target.value)}
                                            className="w-full bg-transparent px-4 py-3 outline-none font-bold"
                                            placeholder="Tulis diagnosa utama..."
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => { setShowAdmitModal(false); setFoundPatient(null); }} className="flex-1 py-5 font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[28px] transition-all">Batal</button>
                                    <button type="submit" disabled={!foundPatient} className="flex-[2] py-5 font-black bg-blue-600 text-white rounded-[28px] hover:bg-blue-700 disabled:opacity-50 transition-all shadow-2xl shadow-blue-500/30">Konfirmasi Rawat Inap</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* DETAIL MODAL */}
            <AnimatePresence>
                {showDetailModal && selectedBed && (selectedBed.current_patient || selectedBed.patient) && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xl z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[48px] w-full max-w-md p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white dark:border-slate-800 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600 to-indigo-800 opacity-10" />

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[36px] shadow-2xl flex items-center justify-center text-4xl font-black text-blue-600 mb-6 border-4 border-slate-100 dark:border-slate-800">
                                    {(selectedBed.current_patient?.name || selectedBed.patient?.name).charAt(0)}
                                </div>
                                <h2 className="text-2xl font-black tracking-tighter text-slate-800 dark:text-white mb-1">
                                    {selectedBed.current_patient?.name || selectedBed.patient?.name}
                                </h2>
                                <span className="px-4 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-400 tracking-widest uppercase mb-10">
                                    MR-{selectedBed.current_patient?.id || selectedBed.patient?.id}
                                </span>

                                <div className="w-full space-y-4 mb-10">
                                    <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[28px] border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <Bed size={20} className="text-blue-600" />
                                            <span className="text-xs font-bold text-slate-500">Nomor Bed</span>
                                        </div>
                                        <span className="text-xl font-black tracking-tighter text-slate-800 dark:text-white">
                                            {selectedBed.code || selectedBed.number}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-[28px] border border-emerald-100 dark:border-emerald-800/50">
                                        <div className="flex items-center gap-3">
                                            <Activity size={20} className="text-emerald-600" />
                                            <span className="text-xs font-bold text-emerald-600/70">Status Admisi</span>
                                        </div>
                                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">AKTIF</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 w-full">
                                    <button
                                        onClick={() => navigate('/nurse/inpatient')}
                                        className="w-full py-5 bg-blue-600 text-white rounded-[28px] font-black flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/30 hover:scale-[1.02] transition"
                                    >
                                        <LayoutGrid size={18} className="stroke-[3]" /> Clinical Record
                                    </button>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setShowDetailModal(false)}
                                            className="py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-[28px] font-black transition-all"
                                        >
                                            Tutup
                                        </button>
                                        <button
                                            onClick={handleDischarge}
                                            className="py-5 bg-rose-600 text-white rounded-[28px] font-black shadow-2xl shadow-rose-600/30 flex items-center justify-center gap-2 hover:scale-[1.02] transition"
                                        >
                                            <LogOut size={18} className="stroke-[3]" /> Discharge
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StatCard = ({ label, value, icon, color }) => {
    const variants = {
        blue: 'from-blue-600 to-indigo-700 shadow-blue-500/20 text-blue-600',
        emerald: 'from-emerald-500 to-teal-700 shadow-emerald-500/20 text-emerald-600',
        rose: 'from-rose-500 to-pink-700 shadow-rose-500/20 text-rose-600',
        amber: 'from-amber-500 to-orange-700 shadow-amber-500/20 text-amber-600'
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl p-8 rounded-[40px] border border-white dark:border-slate-800 shadow-xl flex items-center justify-between"
        >
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</span>
                <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">{value}</span>
            </div>
            <div className={`p-4 rounded-[28px] bg-slate-50 dark:bg-slate-800 ${variants[color].split(' ').pop()}`}>
                {React.cloneElement(icon, { size: 32, className: 'stroke-[2.5]' })}
            </div>
        </motion.div>
    );
};

export default AdmissionDashboard;
