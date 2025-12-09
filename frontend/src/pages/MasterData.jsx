import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import {
    Trash2, Edit, Plus, X,
    LayoutGrid, Stethoscope, Store,
    Search,
    CalendarOff
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const MasterData = () => {
    const [activeTab, setActiveTab] = useState('poliklinik');
    const [polies, setPolies] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [counters, setCounters] = useState([]);
    const [leaves, setLeaves] = useState([]);

    // Modal States
    const [isPoliModalOpen, setIsPoliModalOpen] = useState(false);
    const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
    const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form States
    const [poliForm, setPoliForm] = useState({ name: '', queue_code: '' });
    const [doctorForm, setDoctorForm] = useState({ name: '', specialist: '', poliklinik_id: '', photo_url: '', schedules: [] });
    const [counterForm, setCounterForm] = useState({ name: '' });
    const [leaveForm, setLeaveForm] = useState({ doctor_id: '', date: '', reason: '' });

    useEffect(() => {
        fetchPolies();
        fetchDoctors();
        fetchCounters();
        fetchLeaves();
    }, []);

    const fetchPolies = async () => {
        try { const res = await axios.get(`${API_URL}/polies`); setPolies(res.data); }
        catch (error) { console.error('Failed to fetch polies', error); }
    };

    const fetchDoctors = async () => {
        try { const res = await axios.get(`${API_URL}/doctors-master`); setDoctors(res.data); }
        catch (error) { console.error('Failed to fetch doctors', error); }
    };

    const fetchCounters = async () => {
        try { const res = await axios.get(`${API_URL}/counters`); setCounters(res.data); }
        catch (error) { console.error('Failed to fetch counters', error); }
    };

    const fetchLeaves = async () => {
        try { const res = await axios.get(`${API_URL}/doctor-leaves`); setLeaves(res.data); }
        catch (error) { console.error('Failed to fetch leaves', error); }
    };

    // --- Poliklinik Handlers ---
    const handlePoliSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await axios.put(`${API_URL}/polies/${editingItem.id}`, poliForm);
                toast.success('Poliklinik updated');
            } else {
                await axios.post(`${API_URL}/polies`, poliForm);
                toast.success('Poliklinik created');
            }
            fetchPolies();
            setIsPoliModalOpen(false);
            setEditingItem(null);
            setPoliForm({ name: '', queue_code: '' });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Operation failed');
        }
    };

    const handleDeletePoli = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await axios.delete(`${API_URL}/polies/${id}`);
            toast.success('Poliklinik deleted');
            fetchPolies();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete');
        }
    };

    const openPoliModal = (poli = null) => {
        if (poli) {
            setEditingItem(poli);
            setPoliForm({ name: poli.name, queue_code: poli.queue_code });
        } else {
            setEditingItem(null);
            setPoliForm({ name: '', queue_code: '' });
        }
        setIsPoliModalOpen(true);
    };

    // --- Doctor Handlers ---
    const handleDoctorSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...doctorForm, poliklinik_id: parseInt(doctorForm.poliklinik_id) };
            if (editingItem) {
                await axios.put(`${API_URL}/doctors/${editingItem.id}`, payload);
                toast.success('Doctor updated');
            } else {
                await axios.post(`${API_URL}/doctors`, payload);
                toast.success('Doctor created');
            }
            fetchDoctors();
            setIsDoctorModalOpen(false);
            setEditingItem(null);
            setDoctorForm({ name: '', specialist: '', poliklinik_id: '', photo_url: '', schedules: [] });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Operation failed');
        }
    };

    const handleDeleteDoctor = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await axios.delete(`${API_URL}/doctors/${id}`);
            toast.success('Doctor deleted');
            fetchDoctors();
        } catch (error) {
            toast.error('Failed to delete doctor');
        }
    };

    const openDoctorModal = (doctor = null) => {
        if (doctor) {
            setEditingItem(doctor);
            setDoctorForm({
                name: doctor.name,
                specialist: doctor.specialist,
                poliklinik_id: doctor.poliklinik_id,
                photo_url: doctor.photo_url || '',
                schedules: doctor.schedules || []
            });
        } else {
            setEditingItem(null);
            setDoctorForm({ name: '', specialist: '', poliklinik_id: '', photo_url: '', schedules: [] });
        }
        setIsDoctorModalOpen(true);
    };

    // --- Counter Handlers ---
    const handleCounterSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await axios.put(`${API_URL}/counters/${editingItem.id}`, counterForm);
                toast.success('Counter updated');
            } else {
                await axios.post(`${API_URL}/counters`, counterForm);
                toast.success('Counter created');
            }
            fetchCounters();
            setIsCounterModalOpen(false);
            setEditingItem(null);
            setCounterForm({ name: '' });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Operation failed');
        }
    };

    const handleDeleteCounter = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await axios.delete(`${API_URL}/counters/${id}`);
            toast.success('Counter deleted');
            fetchCounters();
        } catch (error) {
            toast.error('Failed to delete counter');
        }
    };

    const openCounterModal = (counter = null) => {
        if (counter) {
            setEditingItem(counter);
            setCounterForm({ name: counter.name });
        } else {
            setEditingItem(null);
            setCounterForm({ name: '' });
        }
        setIsCounterModalOpen(true);
    };

    // --- Leave Handlers ---
    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!leaveForm.doctor_id || !leaveForm.date) {
                toast.error('Doctor and Date are required');
                return;
            }

            if (editingItem) {
                toast.error("Edit feature not fully supported, please delete and re-add.");
            } else {
                await axios.post(`${API_URL}/doctor-leaves`, {
                    ...leaveForm,
                    doctor_id: parseInt(leaveForm.doctor_id)
                });
                toast.success('Leave added');
            }
            fetchLeaves();
            setIsLeaveModalOpen(false);
            setEditingItem(null);
            setLeaveForm({ doctor_id: '', date: '', reason: '' });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Operation failed');
        }
    };

    const handleDeleteLeave = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await axios.delete(`${API_URL}/doctor-leaves/${id}`);
            toast.success('Leave deleted');
            fetchLeaves();
        } catch (error) {
            toast.error('Failed to delete leave');
        }
    };

    const openLeaveModal = () => {
        setEditingItem(null);
        setLeaveForm({ doctor_id: '', date: '', reason: '' });
        setIsLeaveModalOpen(true);
    };

    // Render Helpers
    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`
                flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300
                ${activeTab === id
                    ? 'bg-salm-gradient text-white shadow-lg shadow-salm-purple/30 scale-105'
                    : 'bg-modern-card/50 text-modern-text-secondary hover:bg-modern-card hover:text-white border border-white/5'}
            `}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    const ActionButton = ({ onClick, icon: Icon, colorClass }) => (
        <button
            onClick={onClick}
            className={`p-2 rounded-xl transition-colors ${colorClass}`}
        >
            <Icon size={18} />
        </button>
    );

    return (
        <div className="min-h-screen bg-theme-bg p-8 font-sans relative overflow-hidden transition-colors duration-300">
            {/* Background Mesh Gradient */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-modern-blue/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-modern-purple/10 rounded-full blur-[100px]"></div>
            </div>

            <Toaster position="top-center" />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-modern-text tracking-tight mb-2">Master Data</h1>
                        <p className="text-modern-text-secondary text-lg">Manage your hospital resources</p>
                    </div>

                    {/* Segmented Control */}
                    <div className="flex p-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-full border border-gray-200 dark:border-white/5">
                        <TabButton id="poliklinik" label="Poliklinik" icon={LayoutGrid} />
                        <TabButton id="doctors" label="Dokter" icon={Stethoscope} />
                        <TabButton id="counters" label="Loket" icon={Store} />
                        <TabButton id="leave" label="Cuti Dokter" icon={CalendarOff} />
                    </div>
                </header>

                {/* Main Content Card */}
                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden min-h-[600px] flex flex-col">
                    {/* Toolbar */}
                    <div className="p-8 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-modern-text-secondary w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/5 rounded-2xl w-64 focus:ring-2 focus:ring-modern-blue/50 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            />
                        </div>
                        <button
                            onClick={() => {
                                if (activeTab === 'poliklinik') openPoliModal();
                                if (activeTab === 'doctors') openDoctorModal();
                                if (activeTab === 'counters') openCounterModal();
                                if (activeTab === 'leave') openLeaveModal();
                            }}
                            className="bg-modern-text text-modern-bg px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:bg-white hover:text-modern-text transition-all shadow-lg hover:shadow-xl active:scale-95"
                        >
                            <Plus size={20} />
                            Add New
                        </button>
                    </div>

                    {/* Table Content */}
                    <div className="flex-1 overflow-auto p-2">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-10">
                                <tr>
                                    {activeTab === 'poliklinik' && (
                                        <>
                                            <th className="p-6 text-xs font-bold text-modern-text-secondary uppercase tracking-wider">ID</th>
                                            <th className="p-6 text-xs font-bold text-modern-text-secondary uppercase tracking-wider">Nama Poli</th>
                                            <th className="p-6 text-xs font-bold text-modern-text-secondary uppercase tracking-wider">Kode</th>
                                        </>
                                    )}
                                    {activeTab === 'doctors' && (
                                        <>
                                            <th className="p-6 text-xs font-bold text-modern-text-secondary uppercase tracking-wider">Doctor</th>
                                            <th className="p-6 text-xs font-bold text-modern-text-secondary uppercase tracking-wider">Spesialis</th>
                                            <th className="p-6 text-xs font-bold text-modern-text-secondary uppercase tracking-wider">Poli</th>
                                        </>
                                    )}
                                    {activeTab === 'counters' && (
                                        <>
                                            <th className="p-6 text-xs font-bold text-modern-text-secondary uppercase tracking-wider">ID</th>
                                            <th className="p-6 text-xs font-bold text-modern-text-secondary uppercase tracking-wider">Nama Loket</th>
                                            <th className="p-6 text-xs font-bold text-modern-text-secondary uppercase tracking-wider">Status</th>
                                        </>
                                    )}
                                    {activeTab === 'leave' && (
                                        <>
                                            <th className="p-6 text-xs font-bold text-modern-text-secondary uppercase tracking-wider">Doctor</th>
                                            <th className="p-6 text-xs font-bold text-modern-text-secondary uppercase tracking-wider">Tanggal</th>
                                            <th className="p-6 text-xs font-bold text-modern-text-secondary uppercase tracking-wider">Keterangan</th>
                                        </>
                                    )}
                                    <th className="p-6 text-xs font-bold text-modern-text-secondary uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {activeTab === 'poliklinik' && polies.map((poli) => (
                                    <tr key={poli.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="p-6 text-modern-text-secondary font-mono text-sm">#{poli.id}</td>
                                        <td className="p-6 font-semibold text-modern-text">{poli.name}</td>
                                        <td className="p-6">
                                            <span className="bg-modern-blue/10 text-modern-blue px-3 py-1 rounded-lg text-xs font-bold tracking-wide border border-modern-blue/20">
                                                {poli.queue_code}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <ActionButton onClick={() => openPoliModal(poli)} icon={Edit} colorClass="text-modern-blue hover:bg-modern-blue/10" />
                                                <ActionButton onClick={() => handleDeletePoli(poli.id)} icon={Trash2} colorClass="text-red-500 hover:bg-red-500/10" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === 'doctors' && doctors.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <img src={doc.photo_url || 'https://via.placeholder.com/40'} alt={doc.name} className="w-12 h-12 rounded-2xl object-cover shadow-sm bg-modern-bg" />
                                                <span className="font-bold text-modern-text">{doc.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-modern-text-secondary">{doc.specialist}</td>
                                        <td className="p-6">
                                            <span className="bg-modern-purple/10 text-modern-purple px-3 py-1 rounded-lg text-xs font-bold tracking-wide border border-modern-purple/20">
                                                {doc.poliklinik ? doc.poliklinik.name : '-'}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <ActionButton onClick={() => openDoctorModal(doc)} icon={Edit} colorClass="text-modern-blue hover:bg-modern-blue/10" />
                                                <ActionButton onClick={() => handleDeleteDoctor(doc.id)} icon={Trash2} colorClass="text-red-500 hover:bg-red-500/10" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === 'counters' && counters.map((counter) => (
                                    <tr key={counter.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="p-6 text-modern-text-secondary font-mono text-sm">#{counter.id}</td>
                                        <td className="p-6 font-semibold text-modern-text">{counter.name}</td>
                                        <td className="p-6">
                                            <span className={`
                                                px-3 py-1 rounded-lg text-xs font-bold tracking-wide border
                                                ${counter.status === 'OPEN' ? 'bg-modern-green/10 text-modern-green border-modern-green/20' :
                                                    counter.status === 'BUSY' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                        'bg-red-500/10 text-red-500 border-red-500/20'}
                                            `}>
                                                {counter.status || 'CLOSED'}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <ActionButton onClick={() => openCounterModal(counter)} icon={Edit} colorClass="text-modern-blue hover:bg-modern-blue/10" />
                                                <ActionButton onClick={() => handleDeleteCounter(counter.id)} icon={Trash2} colorClass="text-red-500 hover:bg-red-500/10" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === 'leave' && leaves.map((leave) => (
                                    <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="p-6">
                                            <div className="font-bold text-modern-text">{leave.doctor?.name || `Doctor #${leave.doctor_id}`}</div>
                                        </td>
                                        <td className="p-6 text-modern-text-secondary">
                                            {new Date(leave.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                        </td>
                                        <td className="p-6 text-modern-text-secondary">{leave.reason}</td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <ActionButton onClick={() => handleDeleteLeave(leave.id)} icon={Trash2} colorClass="text-red-500 hover:bg-red-500/10" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Empty States */}
                        {activeTab === 'poliklinik' && polies.length === 0 && <EmptyState />}
                        {activeTab === 'doctors' && doctors.length === 0 && <EmptyState />}
                        {activeTab === 'counters' && counters.length === 0 && <EmptyState />}
                        {activeTab === 'leave' && leaves.length === 0 && <EmptyState />}
                    </div>
                </div>
            </div>

            {/* Modals - Reusing similar structure for all */}
            <Modal isOpen={isPoliModalOpen} onClose={() => setIsPoliModalOpen(false)} title={editingItem ? 'Edit Poliklinik' : 'New Poliklinik'}>
                <form onSubmit={handlePoliSubmit} className="space-y-6">
                    <Input label="Nama Poli" value={poliForm.name} onChange={e => setPoliForm({ ...poliForm, name: e.target.value })} />
                    <Input label="Kode Antrian (Max 3)" value={poliForm.queue_code} onChange={e => setPoliForm({ ...poliForm, queue_code: e.target.value.toUpperCase() })} maxLength={3} />
                    <SubmitButton />
                </form>
            </Modal>

            <Modal isOpen={isDoctorModalOpen} onClose={() => setIsDoctorModalOpen(false)} title={editingItem ? 'Edit Dokter' : 'New Dokter'}>
                <form onSubmit={handleDoctorSubmit} className="space-y-6">
                    <Input label="Nama Dokter" value={doctorForm.name} onChange={e => setDoctorForm({ ...doctorForm, name: e.target.value })} />
                    <Input label="Spesialis" value={doctorForm.specialist} onChange={e => setDoctorForm({ ...doctorForm, specialist: e.target.value })} />
                    <div>
                        <label className="block text-sm font-medium text-modern-text-secondary mb-2">Poliklinik</label>
                        <select
                            required
                            className="w-full bg-modern-bg border border-white/10 text-modern-text rounded-xl px-4 py-3 focus:ring-2 focus:ring-modern-blue outline-none transition-all"
                            value={doctorForm.poliklinik_id}
                            onChange={e => setDoctorForm({ ...doctorForm, poliklinik_id: e.target.value })}
                        >
                            <option value="">Pilih Poliklinik</option>
                            {polies.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <Input label="Photo URL" value={doctorForm.photo_url} onChange={e => setDoctorForm({ ...doctorForm, photo_url: e.target.value })} required={false} />

                    {/* Schedule Inputs */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-modern-text-secondary ml-1">Jadwal Praktik</label>
                            <button
                                type="button"
                                onClick={() => setDoctorForm({
                                    ...doctorForm,
                                    schedules: [...(doctorForm.schedules || []), { day: 1, time: '' }]
                                })}
                                className="text-xs bg-modern-blue/10 text-modern-blue px-2 py-1 rounded-lg hover:bg-modern-blue/20 transition-colors"
                            >
                                + Add Day
                            </button>
                        </div>
                        <div className="space-y-2">
                            {(doctorForm.schedules || []).map((schedule, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <select
                                        className="bg-modern-bg border border-white/10 text-modern-text rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-modern-blue outline-none w-1/3"
                                        value={schedule.day}
                                        onChange={(e) => {
                                            const newSchedules = [...doctorForm.schedules];
                                            newSchedules[idx].day = parseInt(e.target.value);
                                            setDoctorForm({ ...doctorForm, schedules: newSchedules });
                                        }}
                                    >
                                        <option value={1}>Senin</option>
                                        <option value={2}>Selasa</option>
                                        <option value={3}>Rabu</option>
                                        <option value={4}>Kamis</option>
                                        <option value={5}>Jumat</option>
                                        <option value={6}>Sabtu</option>
                                        <option value={0}>Minggu</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="e.g. 08.00 - 12.00"
                                        className="bg-modern-bg border border-white/10 text-modern-text rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-modern-blue outline-none flex-1"
                                        value={schedule.time}
                                        onChange={(e) => {
                                            const newSchedules = [...doctorForm.schedules];
                                            newSchedules[idx].time = e.target.value;
                                            setDoctorForm({ ...doctorForm, schedules: newSchedules });
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newSchedules = doctorForm.schedules.filter((_, i) => i !== idx);
                                            setDoctorForm({ ...doctorForm, schedules: newSchedules });
                                        }}
                                        className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <SubmitButton />
                </form>
            </Modal>

            <Modal isOpen={isCounterModalOpen} onClose={() => setIsCounterModalOpen(false)} title={editingItem ? 'Edit Loket' : 'New Loket'}>
                <form onSubmit={handleCounterSubmit} className="space-y-6">
                    <Input label="Nama Loket" value={counterForm.name} onChange={e => setCounterForm({ ...counterForm, name: e.target.value })} placeholder="e.g. Loket 1" />
                    <SubmitButton />
                </form>
            </Modal>

            {/* Leave Modal */}
            <Modal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} title="Add Cuti Dokter">
                <form onSubmit={handleLeaveSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-modern-text-secondary mb-2">Pilih Dokter</label>
                        <select
                            required
                            className="w-full bg-modern-bg border border-white/10 text-modern-text rounded-xl px-4 py-3 focus:ring-2 focus:ring-modern-blue outline-none transition-all"
                            value={leaveForm.doctor_id}
                            onChange={e => setLeaveForm({ ...leaveForm, doctor_id: e.target.value })}
                        >
                            <option value="">-- Pilih Dokter --</option>
                            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-modern-text-secondary mb-2">Tanggal Cuti</label>
                        <input
                            type="date"
                            required
                            className="w-full bg-modern-bg border border-white/10 text-modern-text rounded-xl px-4 py-3 focus:ring-2 focus:ring-modern-blue outline-none transition-all"
                            value={leaveForm.date ? new Date(leaveForm.date).toISOString().split('T')[0] : ''}
                            onChange={e => setLeaveForm({ ...leaveForm, date: e.target.value })}
                        />
                    </div>
                    <Input label="Keterangan / Alasan" value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })} placeholder="Cuti tahunan, sakit, dll..." />
                    <SubmitButton />
                </form>
            </Modal>
        </div>
    );
};

// UI Components
const EmptyState = () => (
    <div className="p-12 text-center text-modern-text-secondary flex flex-col items-center">
        <div className="w-16 h-16 bg-modern-bg rounded-full flex items-center justify-center mb-4 border border-white/5">
            <Search size={24} className="opacity-50" />
        </div>
        <p>No data found</p>
    </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-white/10">
                <button onClick={onClose} className="absolute top-6 right-6 text-modern-text-secondary hover:text-white transition-colors">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold text-modern-text mb-6">{title}</h2>
                {children}
            </div>
        </div>
    );
};

const Input = ({ label, value, onChange, type = "text", required = true, maxLength, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-modern-text-secondary mb-2 ml-1">{label}</label>
        <input
            type={type}
            required={required}
            maxLength={maxLength}
            placeholder={placeholder}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-modern-blue outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
            value={value}
            onChange={onChange}
        />
    </div>
);

const SubmitButton = () => (
    <button type="submit" className="w-full bg-modern-text text-modern-bg py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-modern-text transition-all shadow-lg hover:shadow-xl active:scale-95">
        Save Changes
    </button>
);

export default MasterData;
