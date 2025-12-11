import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import {
    Trash2, Edit, Plus, X,
    LayoutGrid, Stethoscope, Store,
    Search,
    CalendarOff,
    Play
} from 'lucide-react';
import defaultAvatar from '../assets/doctor_avatar.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const MasterData = () => {
    const [activeTab, setActiveTab] = useState('poliklinik');
    const [polies, setPolies] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [counters, setCounters] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [playlist, setPlaylist] = useState([]);

    // Modal States
    const [isPoliModalOpen, setIsPoliModalOpen] = useState(false);
    const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
    const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form States
    const [poliForm, setPoliForm] = useState({ name: '', queue_code: '' });
    const [doctorForm, setDoctorForm] = useState({ name: '', specialist: '', poliklinik_id: '', photo_url: '', schedules: [] });
    const [counterForm, setCounterForm] = useState({ name: '' });
    const [leaveForm, setLeaveForm] = useState({ doctor_id: '', date: '', reason: '' });
    const [playlistForm, setPlaylistForm] = useState({ type: 'VIDEO', url: '', duration: 10, order: 0 });
    const [settings, setSettings] = useState({ running_text: '' });

    useEffect(() => {
        fetchPolies();
        fetchDoctors();
        fetchCounters();
        fetchLeaves();
        fetchPlaylist();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try { const res = await axios.get(`${API_URL}/settings`); if (res.data) setSettings(res.data); }
        catch (error) { console.error('Failed to fetch settings', error); }
    };

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

    const fetchPlaylist = async () => {
        try { const res = await axios.get(`${API_URL}/playlist`); setPlaylist(res.data); }
        catch (error) { console.error('Failed to fetch playlist', error); }
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

    const handlePlaylistSubmit = async (e) => {
        e.preventDefault();
        try {
            let finalUrl = playlistForm.url;

            // Handle File Upload
            if (playlistForm.type === 'LOCAL_VIDEO' && playlistForm.file) {
                const formData = new FormData();
                formData.append('file', playlistForm.file);

                const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                finalUrl = uploadRes.data.url;
            } else if (playlistForm.type === 'LOCAL_VIDEO' && !finalUrl) {
                toast.error('Please select a video file');
                return;
            }

            const payload = {
                type: playlistForm.type === 'LOCAL_VIDEO' ? 'VIDEO' : playlistForm.type, // Store as VIDEO in DB, url differentiates
                url: finalUrl,
                duration: parseInt(playlistForm.duration),
                order: parseInt(playlistForm.order),
                isActive: true
            };

            if (editingItem) { // Changed from selectedItem to editingItem to match existing code
                await axios.put(`${API_URL}/playlist/${editingItem.id}`, payload);
                toast.success('Display item updated');
            } else {
                await axios.post(`${API_URL}/playlist`, payload);
                toast.success('Display item created');
            }
            fetchPlaylist();
            setIsPlaylistModalOpen(false);
            setEditingItem(null); // Added this line to clear editingItem
            setPlaylistForm({ type: 'VIDEO', url: '', duration: 10, order: 0, file: null }); // Added file: null
        } catch (error) {
            toast.error('Operation failed');
            console.error(error);
        }
    };

    const handleDeletePlaylist = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await axios.delete(`${API_URL}/playlist/${id}`);
            toast.success('Item deleted');
            fetchPlaylist();
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    const openPlaylistModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setPlaylistForm({
                type: item.type,
                url: item.url,
                duration: item.duration,
                order: item.order
            });
        } else {
            setEditingItem(null);
            setPlaylistForm({ type: 'VIDEO', url: '', duration: 10, order: 0 });
        }
        setIsPlaylistModalOpen(true);
    };

    const handleSettingSubmit = async (e) => {
        if (e) e.preventDefault();
        try {
            await axios.put(`${API_URL}/settings`, {
                running_text: settings?.running_text || ''
            });
            toast.success('Settings saved successfully');
            fetchSettings();
        } catch (error) {
            console.error('Save settings failed', error);
            toast.error('Failed to save settings');
        }
    };




    // Render Helpers
    const TabButton = ({ id, label, icon: Icon }) => (
        <motion.button
            type="button"
            onClick={() => setActiveTab(id)}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.5)" }}
            whileTap={{ scale: 0.98 }}
            className={`
                flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors duration-200 shrink-0 whitespace-nowrap relative z-10 select-none touch-manipulation cursor-pointer
                ${activeTab === id
                    ? 'bg-salm-gradient text-white shadow-md shadow-salm-purple/20'
                    : 'bg-white/30 dark:bg-gray-800/30 text-gray-600 dark:text-gray-300 hover:text-gray-900 border border-transparent'}
            `}
        >
            <Icon size={18} />
            {label}
        </motion.button>
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
        <div className="h-screen bg-theme-bg overflow-hidden flex flex-col font-sans relative transition-colors duration-300 text-gray-800 dark:text-white selection:bg-salm-purple/30">
            {/* Background Mesh Gradient */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-modern-blue/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-modern-purple/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
                <div className="absolute top-[20%] left-[30%] w-[30%] h-[30%] bg-salm-pink/10 rounded-full blur-[100px] animate-float"></div>
            </div>

            <Toaster position="top-center"
                toastOptions={{
                    style: {
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    }
                }}
            />

            {/* --- Fixed Header Area --- */}
            <header className="shrink-0 pt-6 px-4 lg:px-8 pb-4 z-20 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-modern-text to-modern-text-secondary dark:from-white dark:to-gray-400">
                        Master Data
                    </h1>
                    <p className="text-modern-text-secondary dark:text-gray-400 text-sm lg:text-base font-medium mt-1">
                        Manage systems & resources
                    </p>
                </motion.div>

                {/* Navigation Tabs */}
                <motion.div
                    className="flex bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-full border border-white/20 dark:border-white/10 shadow-lg shadow-black/5 overflow-x-auto no-scrollbar p-1.5 gap-2 max-w-full"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <TabButton id="poliklinik" label="Poliklinik" icon={LayoutGrid} />
                    <TabButton id="doctors" label="Dokter" icon={Stethoscope} />
                    <TabButton id="counters" label="Loket" icon={Store} />
                    <TabButton id="leave" label="Cuti" icon={CalendarOff} />
                    <TabButton id="playlist" label="TV Display" icon={Play} />
                    <TabButton id="settings" label="Settings" icon={Search} />
                </motion.div>
            </header>

            {/* --- Scrollable Content Area --- */}
            <main className="flex-1 px-4 lg:px-8 pb-4 lg:pb-8 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 bg-white/60 dark:bg-gray-900/60 backdrop-blur-3xl rounded-[32px] shadow-2xl border border-white/40 dark:border-white/10 flex flex-col overflow-hidden relative group">

                    {/* Glass Shine Effect on Card */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none opacity-50 rounded-[32px] border border-white/50"></div>

                    {/* Toolbar */}
                    <div className="relative shrink-0 p-5 lg:p-6 border-b border-gray-100/50 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 z-10">
                        <div className="relative w-full md:w-auto group/search">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-salm-blue transition-colors w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search data..."
                                className="pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-white/10 rounded-2xl w-full md:w-72 focus:ring-4 focus:ring-salm-blue/10 focus:border-salm-blue/30 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm font-medium backdrop-blur-sm"
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                if (activeTab === 'poliklinik') openPoliModal();
                                if (activeTab === 'doctors') openDoctorModal();
                                if (activeTab === 'counters') openCounterModal();
                                if (activeTab === 'leave') openLeaveModal();
                                if (activeTab === 'playlist') openPlaylistModal();
                            }}
                            className="w-full md:w-auto bg-salm-gradient text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-salm-purple/20 hover:shadow-salm-purple/40 transition-all duration-300"
                        >
                            <Plus size={20} strokeWidth={2.5} />
                            <span className="tracking-wide">Add New</span>
                        </motion.button>
                    </div>

                    {/* Table Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                        {activeTab === 'settings' ? (
                            <div className="flex items-center justify-center h-full p-8">
                                <div className="w-full max-w-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-8 lg:p-10">
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Display Settings</h2>
                                    <p className="text-gray-500 mb-8">Configure global running text for Kiosk and TV displays.</p>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 ml-1">Running Text Content</label>
                                            <textarea
                                                className="w-full h-40 p-5 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 text-gray-800 dark:text-gray-100 text-base shadow-inner focus:ring-4 focus:ring-salm-blue/20 focus:border-salm-blue/50 outline-none transition-all resize-none"
                                                value={settings?.running_text || ''}
                                                onChange={e => setSettings(prev => ({ ...(prev || {}), running_text: e.target.value }))}
                                                placeholder="Enter the announcement text here..."
                                            />
                                        </div>

                                        <div className="flex items-center justify-between pt-4">
                                            <span className="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                                                {settings?.updatedAt ? `Last Saved: ${new Date(settings.updatedAt).toLocaleTimeString()}` : 'Not saved yet'}
                                            </span>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleSettingSubmit}
                                                className="bg-salm-blue text-white px-8 py-3.5 rounded-2xl hover:bg-salm-blue/90 font-bold transition-all shadow-lg shadow-salm-blue/30"
                                            >
                                                Save Changes
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-md z-20 shadow-sm">
                                        <tr>
                                            {activeTab === 'poliklinik' && (
                                                <>
                                                    <th className="p-5 pl-8 text-xs font-bold text-gray-400 uppercase tracking-widest">ID</th>
                                                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Nama Poli</th>
                                                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Kode</th>
                                                </>
                                            )}
                                            {activeTab === 'doctors' && (
                                                <>
                                                    <th className="p-5 pl-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Doctor Profile</th>
                                                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Specialist</th>
                                                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Assignment</th>
                                                </>
                                            )}
                                            {activeTab === 'counters' && (
                                                <>
                                                    <th className="p-5 pl-8 text-xs font-bold text-gray-400 uppercase tracking-widest">ID</th>
                                                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Counter Name</th>
                                                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Current Status</th>
                                                </>
                                            )}
                                            {activeTab === 'leave' && (
                                                <>
                                                    <th className="p-5 pl-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Doctor</th>
                                                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Reason</th>
                                                </>
                                            )}
                                            {activeTab === 'playlist' && (
                                                <>
                                                    <th className="p-5 pl-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Seq</th>
                                                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Format</th>
                                                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Source</th>
                                                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Duration</th>
                                                </>
                                            )}
                                            <th className="p-5 pr-8 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {activeTab === 'poliklinik' && polies.map((poli) => (
                                            <tr key={poli.id} className="hover:bg-blue-50/50 dark:hover:bg-white/5 transition-colors group">
                                                <td className="p-5 pl-8 text-gray-500 font-mono text-sm group-hover:text-salm-blue transition-colors">#{poli.id}</td>
                                                <td className="p-5 font-bold text-gray-800 dark:text-gray-100 text-lg">{poli.name}</td>
                                                <td className="p-5">
                                                    <span className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide border border-blue-200 shadow-sm">
                                                        {poli.queue_code}
                                                    </span>
                                                </td>
                                                <td className="p-5 pr-8 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ActionButton onClick={() => openPoliModal(poli)} icon={Edit} colorClass="text-blue-500 hover:bg-blue-100" />
                                                        <ActionButton onClick={() => handleDeletePoli(poli.id)} icon={Trash2} colorClass="text-red-500 hover:bg-red-100" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                        {activeTab === 'doctors' && doctors.map((doc) => (
                                            <tr key={doc.id} className="hover:bg-purple-50/50 dark:hover:bg-white/5 transition-colors group">
                                                <td className="p-5 pl-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <img src={doc.photo_url || defaultAvatar} alt={doc.name} className="w-12 h-12 rounded-2xl object-cover shadow-md ring-2 ring-white dark:ring-gray-700" />
                                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                                                        </div>
                                                        <div>
                                                            <span className="block font-bold text-gray-900 dark:text-white text-base">{doc.name}</span>
                                                            <span className="text-xs text-gray-400 font-medium">ID: {doc.id}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-salm-purple"></span>
                                                        <span className="text-gray-600 dark:text-gray-300 font-medium">{doc.specialist}</span>
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <span className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide border border-purple-100 dark:border-purple-800">
                                                        {doc.poliklinik ? doc.poliklinik.name : '-'}
                                                    </span>
                                                </td>
                                                <td className="p-5 pr-8 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ActionButton onClick={() => openDoctorModal(doc)} icon={Edit} colorClass="text-blue-500 hover:bg-blue-100" />
                                                        <ActionButton onClick={() => handleDeleteDoctor(doc.id)} icon={Trash2} colorClass="text-red-500 hover:bg-red-100" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                        {activeTab === 'counters' && counters.map((counter) => (
                                            <tr key={counter.id} className="hover:bg-green-50/50 dark:hover:bg-white/5 transition-colors group">
                                                <td className="p-5 pl-8 text-gray-500 font-mono text-sm">#{counter.id}</td>
                                                <td className="p-5 font-bold text-gray-800 dark:text-gray-100">{counter.name}</td>
                                                <td className="p-5">
                                                    <span className={`
                                            px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border flex items-center gap-1.5 w-fit
                                            ${counter.status === 'OPEN' ? 'bg-green-100 text-green-700 border-green-200' :
                                                            counter.status === 'BUSY' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                                'bg-red-100 text-red-700 border-red-200'}
                                        `}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${counter.status === 'OPEN' ? 'bg-green-600' : counter.status === 'BUSY' ? 'bg-yellow-600' : 'bg-red-600'}`}></span>
                                                        {counter.status || 'CLOSED'}
                                                    </span>
                                                </td>
                                                <td className="p-5 pr-8 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ActionButton onClick={() => openCounterModal(counter)} icon={Edit} colorClass="text-blue-500 hover:bg-blue-100" />
                                                        <ActionButton onClick={() => handleDeleteCounter(counter.id)} icon={Trash2} colorClass="text-red-500 hover:bg-red-100" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                        {activeTab === 'leave' && leaves.map((leave) => (
                                            <tr key={leave.id} className="hover:bg-red-50/50 dark:hover:bg-white/5 transition-colors group">
                                                <td className="p-5 pl-8">
                                                    <div className="font-bold text-gray-800 dark:text-gray-200">{leave.doctor?.name || `Doctor #${leave.doctor_id}`}</div>
                                                </td>
                                                <td className="p-5 text-gray-600 dark:text-gray-400 font-medium">
                                                    {new Date(leave.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="p-5">
                                                    <span className="text-gray-600 italic">"{leave.reason}"</span>
                                                </td>
                                                <td className="p-5 pr-8 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ActionButton onClick={() => handleDeleteLeave(leave.id)} icon={Trash2} colorClass="text-red-500 hover:bg-red-100" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                        {activeTab === 'playlist' && playlist.map((item) => (
                                            <tr key={item.id} className="hover:bg-indigo-50/50 dark:hover:bg-white/5 transition-colors group">
                                                <td className="p-5 pl-8 text-gray-500 font-mono font-bold">{item.order}</td>
                                                <td className="p-5">
                                                    <span className={`
                                            px-3 py-1 rounded-lg text-xs font-bold tracking-wide border
                                            ${item.type === 'VIDEO' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-blue-100 text-blue-600 border-blue-200'}
                                        `}>
                                                        {item.type}
                                                    </span>
                                                </td>
                                                <td className="p-5 font-mono text-xs text-gray-600 max-w-[200px] truncate bg-gray-50 dark:bg-gray-800 rounded px-2 py-1 border border-gray-100 dark:border-gray-700">{item.url}</td>
                                                <td className="p-5 text-gray-600 font-medium">{item.duration}s</td>
                                                <td className="p-5 pr-8 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ActionButton onClick={() => openPlaylistModal(item)} icon={Edit} colorClass="text-blue-500 hover:bg-blue-100" />
                                                        <ActionButton onClick={() => handleDeletePlaylist(item.id)} icon={Trash2} colorClass="text-red-500 hover:bg-red-100" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Empty States */}
                        {activeTab === 'poliklinik' && polies.length === 0 && <EmptyState />}
                        {activeTab === 'doctors' && doctors.length === 0 && <EmptyState />}
                        {activeTab === 'counters' && counters.length === 0 && <EmptyState />}
                        {activeTab === 'leave' && leaves.length === 0 && <EmptyState />}
                        {activeTab === 'playlist' && playlist.length === 0 && <EmptyState />}
                    </div>
                </div>
            </main>

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

            {/* Playlist Modal */}
            <Modal isOpen={isPlaylistModalOpen} onClose={() => setIsPlaylistModalOpen(false)} title="Manage Display Item">
                <form onSubmit={handlePlaylistSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-modern-text-secondary mb-2">Item Type</label>
                        <select
                            className="w-full bg-modern-bg border border-white/10 text-modern-text rounded-xl px-4 py-3 focus:ring-2 focus:ring-modern-blue outline-none transition-all"
                            value={playlistForm.type}
                            onChange={e => setPlaylistForm({ ...playlistForm, type: e.target.value, url: '' })}
                        >
                            <option value="VIDEO">YouTube Video</option>
                            <option value="LOCAL_VIDEO">Upload Video</option>
                            <option value="IMAGE">Image</option>
                        </select>
                    </div>

                    {playlistForm.type === 'LOCAL_VIDEO' ? (
                        <div>
                            <label className="block text-sm font-medium text-modern-text-secondary mb-2">Select Video File</label>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={e => setPlaylistForm({ ...playlistForm, file: e.target.files[0] })}
                                className="w-full bg-modern-bg border border-white/10 text-modern-text rounded-xl px-4 py-3"
                            />
                            {playlistForm.url && <p className="text-xs text-green-500 mt-1">Current file: {playlistForm.url.split('/').pop()}</p>}
                        </div>
                    ) : (
                        <Input
                            label={playlistForm.type === 'VIDEO' ? "YouTube Video ID (e.g. dQw4w9WgXcQ)" : "Image URL"}
                            value={playlistForm.url}
                            onChange={e => setPlaylistForm({ ...playlistForm, url: e.target.value })}
                            placeholder={playlistForm.type === 'VIDEO' ? "dQw4w9WgXcQ" : "https://example.com/image.jpg"}
                        />
                    )}

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                label="Duration (Seconds)"
                                type="number"
                                value={playlistForm.duration}
                                onChange={e => setPlaylistForm({ ...playlistForm, duration: e.target.value })}
                                placeholder="10"
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                label="Order Sequence"
                                type="number"
                                value={playlistForm.order}
                                onChange={e => setPlaylistForm({ ...playlistForm, order: e.target.value })}
                                placeholder="0"
                            />
                        </div>
                    </div>

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
