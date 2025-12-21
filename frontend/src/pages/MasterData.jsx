import React, { useState, useEffect, useMemo } from 'react';
import axios from '../utils/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
    Trash2, Edit, Plus, X,
    LayoutGrid, Stethoscope, Store,
    Search, CalendarOff, Play,
    AlertCircle, Check, Image as ImageIcon, Film, Clock,
    ChevronRight, MoreHorizontal, List, Grid,
    BedDouble, Banknote, Utensils, Settings
} from 'lucide-react';
import defaultAvatar from '../assets/doctor_avatar.png';
import ModernHeader from '../components/ModernHeader';
import PageWrapper from '../components/PageWrapper';
import FallonavaLogo from '../components/FallonavaLogo';
import ResponsiveNav from '../components/ResponsiveNav';



const MasterData = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('poliklinik');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [searchQuery, setSearchQuery] = useState('');

    // Data States
    const [polies, setPolies] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [counters, setCounters] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [playlist, setPlaylist] = useState([]);
    const [settings, setSettings] = useState({ running_text: '' });

    // Modal States
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, item: null });
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    // Form States
    const [formData, setFormData] = useState({});

    const [rooms, setRooms] = useState([]);
    const [tariffs, setTariffs] = useState([]);
    const [dietMenus, setDietMenus] = useState([]);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const results = await Promise.allSettled([
                axios.get('/polies'),
                axios.get('/doctors-master'),
                axios.get('/counters'),
                axios.get('/doctor-leaves'),
                axios.get('/playlist'),
                axios.get('/settings'),
                axios.get('/rooms'),
                axios.get('/tariffs'),
                axios.get('/nutrition/menus')
            ]);

            const [poliesRes, doctorsRes, countersRes, leavesRes, playlistRes, settingsRes, roomsRes, tariffsRes, dietRes] = results;

            if (poliesRes.status === 'fulfilled') setPolies(poliesRes.value.data);
            if (doctorsRes.status === 'fulfilled') setDoctors(doctorsRes.value.data);
            if (countersRes.status === 'fulfilled') setCounters(countersRes.value.data);
            if (leavesRes.status === 'fulfilled') setLeaves(leavesRes.value.data);
            if (playlistRes.status === 'fulfilled') setPlaylist(playlistRes.value.data);
            if (settingsRes.status === 'fulfilled' && settingsRes.value.data) setSettings(settingsRes.value.data);

            // New Data Types
            if (roomsRes.status === 'fulfilled') setRooms(roomsRes.value.data);
            if (tariffsRes.status === 'fulfilled') setTariffs(tariffsRes.value.data);
            if (dietRes.status === 'fulfilled') {
                // Handle potential different response structures
                const data = dietRes.value.data;
                setDietMenus(Array.isArray(data) ? data : data.data || []);
            }

            // Log errors if any
            results.forEach((res, index) => {
                if (res.status === 'rejected') {
                    console.error(`Fetch failed for index ${index}:`, res.reason);
                }
            });

        } catch (error) {
            console.error("Critical error fetching data:", error);
            toast.error("Terjadi kesalahan memuat data.");
        }
    };

    // --- Search Logic ---
    const filteredData = useMemo(() => {
        const lowerQuery = searchQuery.toLowerCase();
        switch (activeTab) {
            case 'poliklinik': return polies.filter(p => p.name.toLowerCase().includes(lowerQuery) || p.queue_code?.toLowerCase().includes(lowerQuery));
            case 'doctors': return doctors.filter(d => d.name.toLowerCase().includes(lowerQuery) || d.specialist.toLowerCase().includes(lowerQuery));
            case 'counters': return counters.filter(c => c.name.toLowerCase().includes(lowerQuery));
            case 'leave': return leaves.filter(l => l.doctor?.name.toLowerCase().includes(lowerQuery));
            case 'playlist': return playlist.filter(p => p.url?.toLowerCase().includes(lowerQuery) || p.type.toLowerCase().includes(lowerQuery));
            case 'rooms': return rooms.filter(r => r.name.toLowerCase().includes(lowerQuery) || r.type.toLowerCase().includes(lowerQuery));
            case 'tariffs': return tariffs.filter(t => t.name.toLowerCase().includes(lowerQuery) || t.category.toLowerCase().includes(lowerQuery));
            case 'gizi': return dietMenus.filter(m => m.name.toLowerCase().includes(lowerQuery) || m.type.toLowerCase().includes(lowerQuery));
            default: return [];
        }
    }, [searchQuery, activeTab, polies, doctors, counters, leaves, playlist, rooms, tariffs, dietMenus]);

    // --- Actions ---
    const handleOpenModal = (rawType, item = null) => {
        // Normalize type from activeTab names to singular form keys
        let type = rawType;
        if (rawType === 'rooms') type = 'room';
        if (rawType === 'tariffs') type = 'tariff';
        if (rawType === 'gizi') type = 'menu';
        if (rawType === 'doctors') type = 'doctor';
        if (rawType === 'counters') type = 'counter';
        if (rawType === 'poliklinik') type = 'poli';

        setModalConfig({ isOpen: true, type, item });
        // Initial form state population
        if (type === 'poli') setFormData(item ? { name: item.name, queue_code: item.queue_code } : { name: '', queue_code: '' });
        if (type === 'doctor') setFormData(item ? {
            name: item.name, specialist: item.specialist, poliklinik_id: item.poliklinik_id,
            photo_url: item.photo_url || '', schedules: item.schedules || []
        } : { name: '', specialist: '', poliklinik_id: '', photo_url: '', schedules: [] });
        if (type === 'counter') setFormData(item ? { name: item.name } : { name: '' });
        if (type === 'leave') setFormData({ doctor_id: '', date: '', reason: '' });
        if (type === 'playlist') setFormData(item ? {
            type: item.type, url: item.url, duration: item.duration, order: item.order
        } : { type: 'VIDEO', url: '', duration: 10, order: 0 });
        if (type === 'room') setFormData(item ? { name: item.name, type: item.type, price: item.price, gender: item.gender } : { name: '', type: 'VIP', price: 0, gender: 'CAMPUR' });
        if (type === 'tariff') setFormData(item ? { name: item.name, category: item.category, price: item.price, unit: item.unit, code: item.code } : { name: '', category: 'MEDIS', price: 0, unit: 'Tindakan', code: '' });
        if (type === 'menu') setFormData(item ? { name: item.name, code: item.code, type: item.type, calories: item.calories, description: item.description } : { name: '', code: '', type: 'REGULAR', calories: 0, description: '' });
    };

    const handleConfirmDelete = (action) => {
        setConfirmAction(() => action);
        setIsConfirmOpen(true);
    };

    const executeDelete = async () => {
        if (confirmAction) await confirmAction();
        setIsConfirmOpen(false);
    };

    // --- Submit Handlers ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { type, item } = modalConfig;
        const isEdit = !!item;

        try {
            let url = '';
            let payload = { ...formData };

            if (type === 'playlist' && payload.type === 'LOCAL_VIDEO' && payload.file) {
                const uploadData = new FormData();
                uploadData.append('file', payload.file);
                const res = await axios.post(`${API_URL}/upload`, uploadData);
                payload.url = res.data.url;
                delete payload.file;
                payload.type = 'VIDEO';
            }

            switch (type) {
                case 'poli': url = '/polies'; break;
                case 'doctor': url = '/doctors'; payload.poliklinik_id = parseInt(payload.poliklinik_id); break;
                case 'counter': url = '/counters'; break;
                case 'leave': url = '/doctor-leaves'; payload.doctor_id = parseInt(payload.doctor_id); break;
                case 'playlist': url = '/playlist'; payload.duration = parseInt(payload.duration); payload.order = parseInt(payload.order); payload.isActive = true; break;
                case 'room': url = '/rooms'; payload.price = parseFloat(payload.price); break;
                case 'tariff': url = '/tariffs'; payload.price = parseFloat(payload.price); break;
                case 'menu': url = '/nutrition/menus'; payload.calories = parseInt(payload.calories); break;
                default: return;
            }

            if (isEdit && type !== 'leave') {
                await axios.put(`${API_URL}${url}/${item.id}`, payload);
                toast.success('Data berhasil diperbarui!');
            } else {
                await axios.post(`${API_URL}${url}`, payload);
                toast.success('Data berhasil ditambahkan!');
            }

            fetchAllData();
            setModalConfig({ isOpen: false, type: null, item: null });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Terjadi kesalahan saat menyimpan.");
        }
    };

    const deleteItem = async (endpoint, id) => {
        try {
            await axios.delete(`${API_URL}/${endpoint}/${id}`);
            toast.success('Data berhasil dihapus.');
            fetchAllData();
        } catch (error) {
            toast.error("Gagal menghapus data.");
        }
    };

    const handleSettingSubmit = async () => {
        try {
            await axios.put(`${API_URL}/settings`, { running_text: settings.running_text });
            toast.success('Pengaturan disimpan!');
        } catch (error) {
            toast.error("Gagal menyimpan pengaturan.");
        }
    };


    // --- Render Components ---

    const GlassCard = ({ children, className = '' }) => (
        <div className={`relative overflow-hidden bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-xl rounded-3xl p-6 ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
            {children}
        </div>
    );

    const FloatingRow = ({ children, className = '' }) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`group relative transition-all duration-200 hover:scale-[1.01] flex items-center justify-between p-4 mb-3 bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-700/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/40 dark:border-white/5 cursor-pointer ${className}`}
        >
            {children}
        </motion.div>
    );

    const renderContent = () => {
        if (activeTab === 'settings') return (
            <div className="flex justify-center p-8 min-h-[50vh] items-center">
                <GlassCard className="w-full max-w-3xl p-10">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Pengaturan Tampilan</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">Sesuaikan pesan running text yang muncul di layar publik.</p>

                    <div className="space-y-6">
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                            <textarea
                                className="relative w-full h-40 p-6 rounded-2xl border-none bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-gray-800 dark:text-white text-lg focus:ring-0 shadow-inner resize-none"
                                value={settings.running_text || ''}
                                onChange={e => setSettings({ ...settings, running_text: e.target.value })}
                                placeholder="Ketik pengumuman di sini..."
                            />
                        </div>
                        <div className="flex justify-end">
                            <motion.button
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={handleSettingSubmit}
                                className="bg-salm-gradient text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-salm-purple/30 hover:shadow-salm-purple/50 transition-all flex items-center gap-2"
                            >
                                <Check size={18} strokeWidth={3} /> Simpan Perubahan
                            </motion.button>
                        </div>
                    </div>
                </GlassCard>
            </div>
        );

        if (filteredData.length === 0) return <EmptyState />;

        // --- DOCTORS ---
        if (activeTab === 'doctors') {
            if (viewMode === 'grid') {
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                        {filteredData.map(doc => (
                            <motion.div
                                layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                key={doc.id}
                                className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
                            >
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-indigo-400/30 to-purple-400/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="relative mb-4 group-hover:translate-y-[-5px] transition-transform duration-300">
                                        <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-white to-gray-200 dark:from-gray-700 dark:to-gray-800 shadow-xl">
                                            <img src={doc.photo_url || defaultAvatar} alt={doc.name} className="w-full h-full rounded-full object-cover" />
                                        </div>
                                        <div className={`absolute bottom-1 right-2 w-6 h-6 rounded-full border-4 border-white dark:border-gray-800 ${doc.poliklinik ? 'bg-green-500' : 'bg-gray-400'} shadow-md`}></div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-1 line-clamp-1">{doc.name}</h3>
                                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full mb-4">
                                        {doc.specialist}
                                    </p>

                                    <div className="w-full space-y-2 mb-6 text-sm">
                                        <div className="flex justify-between p-3 bg-white/50 dark:bg-gray-700/50 rounded-xl backdrop-blur-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Poli</span>
                                            <span className="font-bold text-gray-800 dark:text-gray-200">{doc.poliklinik?.name || '-'}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 w-full">
                                        <button onClick={() => handleOpenModal('doctor', doc)} className="flex-1 py-2.5 rounded-xl font-bold bg-white/60 dark:bg-gray-700/60 hover:bg-white dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm transition-all border border-white/20">Edit</button>
                                        <button onClick={() => handleConfirmDelete(() => deleteItem('doctors', doc.id))} className="p-2.5 rounded-xl bg-red-100/50 hover:bg-red-500 text-red-600 hover:text-white transition-all"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                );
            } else {
                // List View for Doctors
                return (
                    <div className="px-6 py-2">
                        {filteredData.map(doc => (
                            <FloatingRow key={doc.id}>
                                <div className="flex items-center gap-4 w-[40%]">
                                    <img src={doc.photo_url || defaultAvatar} alt={doc.name} className="w-10 h-10 rounded-full object-cover shadow-sm bg-gray-200" />
                                    <div>
                                        <div className="font-bold text-gray-800 dark:text-white text-lg">{doc.name}</div>
                                        <div className="text-xs text-gray-500">{doc.specialist}</div>
                                    </div>
                                </div>
                                <div className="w-[30%]">
                                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-sm font-medium">{doc.poliklinik?.name || '-'}</span>
                                </div>
                                <div className="w-[30%] flex justify-end gap-2">
                                    <ActionButton icon={Edit} onClick={() => handleOpenModal('doctor', doc)} colorClass="text-blue-500 bg-blue-50 hover:bg-blue-100" />
                                    <ActionButton icon={Trash2} onClick={() => handleConfirmDelete(() => deleteItem('doctors', doc.id))} colorClass="text-red-500 bg-red-50 hover:bg-red-100" />
                                </div>
                            </FloatingRow>
                        ))}
                    </div>
                );
            }
        }

        // --- PLAYLIST ---
        if (activeTab === 'playlist') {
            if (viewMode === 'grid') {
                return (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
                        {filteredData.map(item => (
                            <motion.div
                                key={item.id} layout
                                className="group relative rounded-3xl overflow-hidden aspect-video shadow-lg cursor-pointer bg-black"
                                whileHover={{ scale: 1.03 }}
                            >
                                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-all z-10" />
                                {item.type === 'VIDEO' || item.type === 'LOCAL_VIDEO' ? (
                                    <div className="w-full h-full flex items-center justify-center relative"><Film className="text-white/20 w-16 h-16 group-hover:scale-110 transition-transform" /></div>
                                ) : (
                                    <img src={item.url} alt="Display" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                )}
                                <div className="absolute top-3 right-3 z-20"><span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg border border-white/10">Seq: {item.order}</span></div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex justify-between items-end translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.type === 'IMAGE' ? 'bg-blue-500' : 'bg-red-600'} text-white shadow-lg`}>{item.type}</span>
                                        <div className="flex items-center gap-1 mt-1 text-white/80 text-xs font-mono"><Clock size={10} /> {item.duration}s</div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity delay-75">
                                        <button onClick={() => handleOpenModal('playlist', item)} className="p-2 bg-white/20 hover:bg-white text-white hover:text-black rounded-full backdrop-blur-md transition-colors"><Edit size={14} /></button>
                                        <button onClick={() => handleConfirmDelete(() => deleteItem('playlist', item.id))} className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-colors"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                );
            } else {
                return (
                    <div className="px-6 py-2">
                        {filteredData.map(item => (
                            <FloatingRow key={item.id}>
                                <div className="flex items-center gap-4 w-[40%]">
                                    <div className="w-16 h-10 rounded-lg bg-gray-200 overflow-hidden relative flex items-center justify-center">
                                        {item.type.includes('VIDEO') ? <Film size={20} className="text-gray-400" /> : <img src={item.url} className="w-full h-full object-cover" />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 dark:text-white text-sm truncate max-w-[200px]">{item.url}</div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.type === 'IMAGE' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>{item.type}</span>
                                    </div>
                                </div>
                                <div className="w-[30%] text-sm font-mono text-gray-500">
                                    Seq: <b>{item.order}</b> • {item.duration}s
                                </div>
                                <div className="w-[30%] flex justify-end gap-2">
                                    <ActionButton icon={Edit} onClick={() => handleOpenModal('playlist', item)} colorClass="text-blue-500 bg-blue-50 hover:bg-blue-100" />
                                    <ActionButton icon={Trash2} onClick={() => handleConfirmDelete(() => deleteItem('playlist', item.id))} colorClass="text-red-500 bg-red-50 hover:bg-red-100" />
                                </div>
                            </FloatingRow>
                        ))}
                    </div>
                );
            }
        }

        // --- ROOMS ---
        if (activeTab === 'rooms') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {filteredData.map(room => (
                        <GlassCard key={room.id} className="hover:scale-[1.02] transition-transform duration-300">
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center shadow-sm">
                                        <BedDouble size={28} />
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${room.gender === 'L' ? 'bg-blue-50 text-blue-600 border-blue-200' : room.gender === 'P' ? 'bg-pink-50 text-pink-600 border-pink-200' : 'bg-purple-50 text-purple-600 border-purple-200'}`}>
                                        {room.gender || 'CAMPUR'}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{room.name}</h3>
                                <div className="text-sm font-medium text-teal-600 dark:text-teal-400 mb-4">{room.type} • Rp {parseInt(room.price).toLocaleString('id-ID')}</div>

                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                                    <div className="flex-1 text-xs text-gray-500 flex items-center gap-1">
                                        <div className={`w-2 h-2 rounded-full ${room.beds?.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        {room.beds?.length || 0} Bed
                                    </div>
                                    <button onClick={() => handleOpenModal('room', room)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"><Edit size={16} /></button>
                                    <button onClick={() => handleConfirmDelete(() => deleteItem('rooms', room.id))} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            );
        }

        // --- TARIFFS ---
        if (activeTab === 'tariffs') {
            return (
                <div className="px-6 py-2">
                    {filteredData.map(t => (
                        <FloatingRow key={t.id}>
                            <div className="w-[45%] flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                    <Banknote size={18} />
                                </div>
                                <div className="font-bold text-gray-800 dark:text-white">{t.name}</div>
                            </div>
                            <div className="w-[20%] text-sm font-medium text-gray-500">{t.category}</div>
                            <div className="w-[25%] font-mono font-bold text-gray-800 dark:text-white">
                                Rp {parseInt(t.price).toLocaleString('id-ID')} <span className="text-xs font-normal text-gray-400">/ {t.unit}</span>
                            </div>
                            <div className="w-[10%] flex justify-end gap-2">
                                <ActionButton icon={Edit} onClick={() => handleOpenModal('tariff', t)} colorClass="text-blue-500 bg-blue-50 hover:bg-blue-100" />
                                <ActionButton icon={Trash2} onClick={() => handleConfirmDelete(() => deleteItem('tariffs', t.id))} colorClass="text-red-500 bg-red-50 hover:bg-red-100" />
                            </div>
                        </FloatingRow>
                    ))}
                </div>
            );
        }

        // --- GIZI / DIET ---
        if (activeTab === 'gizi') {
            return (
                <div className="px-6 py-2">
                    {filteredData.map(m => (
                        <FloatingRow key={m.id}>
                            <div className="w-[40%] flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                    <Utensils size={18} />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-800 dark:text-white">{m.name}</div>
                                    <div className="text-xs text-gray-500">{m.code}</div>
                                </div>
                            </div>
                            <div className="w-[20%] text-sm font-medium text-gray-500"><span className="bg-gray-100 px-2 py-1 rounded">{m.type}</span></div>
                            <div className="w-[30%] text-sm font-bold text-gray-700">{m.calories} kcal</div>
                            <div className="w-[10%] flex justify-end gap-2">
                                <ActionButton icon={Edit} onClick={() => handleOpenModal('menu', m)} colorClass="text-blue-500 bg-blue-50 hover:bg-blue-100" />
                                <ActionButton icon={Trash2} onClick={() => handleConfirmDelete(() => deleteItem('nutrition/menus', m.id))} colorClass="text-red-500 bg-red-50 hover:bg-red-100" />
                            </div>
                        </FloatingRow>
                    ))}
                </div>
            );
        }

        // --- POLIKLINIK / COUNTERS / LEAVE (Common List/Grid) ---
        if (viewMode === 'list') {
            return (
                <div className="px-6 py-2">
                    {filteredData.map(item => (
                        <FloatingRow key={item.id}>
                            {activeTab === 'poliklinik' && (
                                <>
                                    <div className="w-[10%] pl-4 text-gray-500 font-mono text-sm">#{item.id}</div>
                                    <div className="w-[40%] font-bold text-gray-800 dark:text-white text-lg">{item.name}</div>
                                    <div className="w-[30%]"><span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg text-sm font-bold border border-blue-200 dark:border-blue-800">{item.queue_code}</span></div>
                                    <div className="w-[20%] pr-4 flex justify-end gap-2">
                                        <ActionButton icon={Edit} onClick={() => handleOpenModal('poliklinik', item)} colorClass="text-blue-500 bg-blue-50 hover:bg-blue-100" />
                                        <ActionButton icon={Trash2} onClick={() => handleConfirmDelete(() => deleteItem('polies', item.id))} colorClass="text-red-500 bg-red-50 hover:bg-red-100" />
                                    </div>
                                </>
                            )}
                            {activeTab === 'counters' && (
                                <>
                                    <div className="w-[10%] pl-4 text-gray-500 font-mono text-sm">#{item.id}</div>
                                    <div className="w-[40%] font-bold text-gray-800 dark:text-white">{item.name}</div>
                                    <div className="w-[30%]">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 w-fit ${item.status === 'OPEN' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'OPEN' ? 'bg-green-500' : 'bg-red-500'}`}></span>{item.status || 'CLOSED'}
                                        </span>
                                    </div>
                                    <div className="w-[20%] pr-4 flex justify-end gap-2">
                                        <ActionButton icon={Edit} onClick={() => handleOpenModal('counters', item)} colorClass="text-blue-500 bg-blue-50 hover:bg-blue-100" />
                                        <ActionButton icon={Trash2} onClick={() => handleConfirmDelete(() => deleteItem('counters', item.id))} colorClass="text-red-500 bg-red-50 hover:bg-red-100" />
                                    </div>
                                </>
                            )}
                            {activeTab === 'leave' && (
                                <>
                                    <div className="w-[30%] pl-4 font-bold text-gray-800 dark:text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"><Stethoscope size={14} /></div>
                                        {item.doctor?.name}
                                    </div>
                                    <div className="w-[30%] text-gray-600 dark:text-gray-300 font-medium">{new Date(item.date).toLocaleDateString()}</div>
                                    <div className="w-[30%] text-gray-500 italic flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-gray-400" />{item.reason}</div>
                                    <div className="w-[10%] pr-4 flex justify-end gap-2">
                                        <ActionButton icon={Trash2} onClick={() => handleConfirmDelete(() => deleteItem('doctor-leaves', item.id))} colorClass="text-red-500 bg-red-50 hover:bg-red-100" />
                                    </div>
                                </>
                            )}
                        </FloatingRow>
                    ))}
                </div>
            );
        } else {
            // VIEW MODE GRID for Poliklinik, Counters, Leaves
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                    {filteredData.map(item => (
                        <GlassCard key={item.id} className="hover:scale-[1.02] transition-transform duration-300">
                            {activeTab === 'poliklinik' && (
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 shadow-sm"><LayoutGrid size={32} /></div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.name}</h3>
                                    <div className="mb-6"><span className="px-4 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100 text-sm">{item.queue_code}</span></div>
                                    <div className="flex gap-2 w-full mt-auto">
                                        <button onClick={() => handleOpenModal('poli', item)} className="flex-1 py-2 rounded-xl bg-gray-100 hover:bg-white border hover:shadow transition-all text-sm font-bold">Edit</button>
                                        <button onClick={() => handleConfirmDelete(() => deleteItem('polies', item.id))} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'counters' && (
                                <div className="flex flex-col items-center text-center">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${item.status === 'OPEN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}><Store size={32} /></div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.name}</h3>
                                    <div className="mb-6">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${item.status === 'OPEN' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{item.status || 'CLOSED'}</span>
                                    </div>
                                    <div className="flex gap-2 w-full mt-auto">
                                        <button onClick={() => handleOpenModal('counter', item)} className="flex-1 py-2 rounded-xl bg-gray-100 hover:bg-white border hover:shadow transition-all text-sm font-bold">Edit</button>
                                        <button onClick={() => handleConfirmDelete(() => deleteItem('counters', item.id))} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'leave' && (
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0"><Stethoscope size={20} /></div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white leading-tight">{item.doctor?.name}</div>
                                            <div className="text-xs text-gray-500">Cuti Dokter</div>
                                        </div>
                                    </div>
                                    <div className="bg-white/50 dark:bg-gray-700/50 rounded-xl p-3 mb-4 space-y-2">
                                        <div className="flex justify-between text-sm"><span className="text-gray-500">Tanggal</span><span className="font-bold text-gray-800">{new Date(item.date).toLocaleDateString()}</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-gray-500">Alasan</span><span className="italic text-gray-800 text-right">{item.reason}</span></div>
                                    </div>
                                    <button onClick={() => handleConfirmDelete(() => deleteItem('doctor-leaves', item.id))} className="w-full py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all font-bold text-sm">Hapus Cuti</button>
                                </div>
                            )}
                        </GlassCard>
                    ))}
                </div>
            );
        }
    };

    const navItems = [
        { id: 'poliklinik', label: 'Poliklinik', icon: LayoutGrid },
        { id: 'doctors', label: 'Dokter', icon: Stethoscope },
        { id: 'rooms', label: 'Ruangan', icon: BedDouble },
        { id: 'tariffs', label: 'Tarif', icon: Banknote },
        { id: 'counters', label: 'Loket', icon: Store },
        { id: 'gizi', label: 'Menu Gizi', icon: Utensils },
        { id: 'leave', label: 'Cuti', icon: CalendarOff },
        { id: 'playlist', label: 'Playlist', icon: Play },
        { id: 'settings', label: 'Pengaturan', icon: Settings }
    ];

    return (
        <PageWrapper title="Data Induk RS" className="bg-gray-50 dark:bg-gray-900" disableHomeFab={true}>
            <ResponsiveNav
                items={navItems}
                activeId={activeTab}
                onSelect={setActiveTab}
            />
            <ModernHeader
                title="Data Induk (Master)"
                subtitle="Manajemen Sumber Daya Rumah Sakit"
                onBack={() => navigate('/menu')}
                className="mb-8"
            >
            </ModernHeader>

            <main className="flex-1 px-4 lg:px-8 pb-4 lg:pb-8 flex flex-col min-h-0">
                {/* Main Content Floating Container */}
                <div className="flex-1 rounded-[40px] flex flex-col overflow-hidden relative">

                    {/* Toolbar */}
                    <div className="relative shrink-0 p-2 mb-4 flex flex-col md:flex-row justify-between items-center gap-4 z-10">
                        <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                            {/* Search Bar */}
                            <div className="relative group/search flex-1 max-w-xl">
                                <div className="absolute inset-0 bg-white/40 dark:bg-gray-800/40 blur-xl rounded-full"></div>
                                <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-full flex items-center px-4 py-3 shadow-sm w-full transition-all focus-within:shadow-md focus-within:scale-105">
                                    <Search className="text-gray-400 mr-3" size={20} />
                                    <input
                                        type="text"
                                        placeholder={`Cari data ${activeTab}...`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-transparent border-none outline-none w-full text-gray-800 dark:text-white placeholder-gray-400 font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {activeTab !== 'settings' && (
                            <div className="flex items-center gap-3">
                                {/* View Toggle */}
                                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-1 rounded-full border border-white/20 flex shadow-sm">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2.5 rounded-full transition-all ${viewMode === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                                        title="List View"
                                    >
                                        <List size={20} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2.5 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                                        title="Grid View"
                                    >
                                        <Grid size={20} />
                                    </button>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleOpenModal(activeTab)}
                                    className="bg-salm-gradient text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-salm-purple/30 hover:shadow-salm-purple/50 transition-all whitespace-nowrap"
                                >
                                    <Plus size={20} strokeWidth={3} />
                                    <span className="hidden sm:inline">Tambah</span>
                                </motion.button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-2">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab + viewMode}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* --- Modals with Neo-Glass Style --- */}

            <AnimatePresence>
                {/* Modern Confirmation Modal */}
                {isConfirmOpen && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-2xl rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl border border-white/20 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500" />
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <AlertCircle size={36} className="text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Hapus Data?</h3>
                            <p className="text-gray-500 mb-8 leading-relaxed">Tindakan ini permanen dan tidak dapat dibatalkan. Konfirmasi penghapusan?</p>
                            <div className="flex gap-4">
                                <button onClick={() => setIsConfirmOpen(false)} className="flex-1 py-3.5 text-gray-600 font-bold hover:bg-gray-100 rounded-2xl transition-colors">Batal</button>
                                <button onClick={executeDelete} className="flex-1 py-3.5 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-500/30 transition-colors">Ya, Hapus</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Form Modal */}
                {modalConfig.isOpen && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 50 }}
                            className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-2xl rounded-[40px] p-8 max-w-lg w-full shadow-2xl border border-white/20 max-h-[85vh] overflow-y-auto custom-scrollbar relative"
                        >
                            <button onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={24} />
                            </button>

                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                {modalConfig.item ? 'Edit Data' : 'Tambah Baru'}
                            </h3>
                            <p className="text-gray-500 mb-8 text-sm">Lengkapi form di bawah ini.</p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {modalConfig.type === 'poli' && (
                                    <>
                                        <Input label="Nama Poliklinik" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Contoh: Poli Penyakit Dalam" />
                                        <Input label="Kode Antrian" value={formData.queue_code} onChange={e => setFormData({ ...formData, queue_code: e.target.value.toUpperCase() })} maxLength={3} placeholder="A / B / C" />
                                    </>
                                )}

                                {modalConfig.type === 'counter' && (
                                    <Input label="Nama Loket" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Loket 1" />
                                )}

                                {modalConfig.type === 'doctor' && (
                                    <>
                                        <Input label="Nama Dokter" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                        <Input label="Spesialis" value={formData.specialist} onChange={e => setFormData({ ...formData, specialist: e.target.value })} placeholder="Spesialis Jantung" />
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Poliklinik</label>
                                            <div className="relative">
                                                <select className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 appearance-none" value={formData.poliklinik_id} onChange={e => setFormData({ ...formData, poliklinik_id: e.target.value })} required>
                                                    <option value="">Pilih Poliklinik...</option>
                                                    {polies.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
                                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={18} />
                                            </div>
                                        </div>
                                        <Input label="Link Foto (Opsional)" value={formData.photo_url} onChange={e => setFormData({ ...formData, photo_url: e.target.value })} required={false} placeholder="https://..." />

                                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                            <div className="flex justify-between items-center mb-3">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Jadwal Praktik</label>
                                                <button type="button" onClick={() => setFormData({ ...formData, schedules: [...(formData.schedules || []), { day: 1, time: '' }] })} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg font-bold hover:bg-indigo-200">+ Tambah</button>
                                            </div>
                                            {(formData.schedules || []).map((sch, i) => (
                                                <div key={i} className="flex gap-2 mb-2">
                                                    <select
                                                        value={sch.day}
                                                        onChange={e => {
                                                            const news = [...formData.schedules];
                                                            news[i].day = parseInt(e.target.value);
                                                            setFormData({ ...formData, schedules: news });
                                                        }}
                                                        className="w-1/3 p-2 bg-white border border-gray-200 rounded-xl text-sm"
                                                    >
                                                        {[1, 2, 3, 4, 5, 6, 0].map(d => <option key={d} value={d}>{['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][d]}</option>)}
                                                    </select>
                                                    <input
                                                        value={sch.time}
                                                        onChange={e => {
                                                            const news = [...formData.schedules];
                                                            news[i].time = e.target.value;
                                                            setFormData({ ...formData, schedules: news });
                                                        }}
                                                        placeholder="08:00 - 12:00"
                                                        className="flex-1 p-2 bg-white border border-gray-200 rounded-xl text-sm"
                                                    />
                                                    <button type="button" onClick={() => {
                                                        const news = formData.schedules.filter((_, idx) => idx !== i);
                                                        setFormData({ ...formData, schedules: news });
                                                    }} className="text-red-500 px-2 hover:bg-red-50 rounded-lg"><X size={16} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {modalConfig.type === 'leave' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Pilih Dokter</label>
                                            <div className="relative">
                                                <select className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 appearance-none" value={formData.doctor_id} onChange={e => setFormData({ ...formData, doctor_id: e.target.value })} required>
                                                    <option value="">Cari nama dokter...</option>
                                                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                </select>
                                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={18} />
                                            </div>
                                        </div>
                                        <Input type="date" label="Tanggal Cuti" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                        <Input label="Alasan" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="Sakit, Cuti Tahunan..." />
                                    </>
                                )}

                                {modalConfig.type === 'playlist' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Tipe Konten</label>
                                            <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
                                                {['VIDEO', 'LOCAL_VIDEO', 'IMAGE'].map(t => (
                                                    <button key={t} type="button" onClick={() => setFormData({ ...formData, type: t })} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === t ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}>
                                                        {t === 'VIDEO' ? 'YouTube' : t === 'LOCAL_VIDEO' ? 'Upload' : 'Image'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {formData.type === 'LOCAL_VIDEO' ? (
                                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors bg-gray-50">
                                                <input type="file" accept="video/*" onChange={e => setFormData({ ...formData, file: e.target.files[0] })} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                            </div>
                                        ) : (
                                            <Input label={formData.type === 'VIDEO' ? 'YouTube Video ID' : 'Image URL'} value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} placeholder={formData.type === 'VIDEO' ? 'Contoh: dQw4w9WgXcQ' : 'https://example.com/image.jpg'} />
                                        )}

                                        <div className="flex gap-4 mt-2">
                                            <Input label="Durasi (Detik)" type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
                                            <Input label="No. Urut" type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: e.target.value })} />
                                        </div>
                                    </>
                                )}

                                {modalConfig.type === 'room' && (
                                    <>
                                        <Input label="Nama Ruangan" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Mawar 01" />
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Kelas/Tipe</label>
                                                <select className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl outline-none" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                                    {['VIP', 'KELAS_1', 'KELAS_2', 'KELAS_3', 'ICU', 'ISOLASI'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Khusus Gender</label>
                                                <select className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl outline-none" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                                                    <option value="CAMPUR">Campur (L/P)</option>
                                                    <option value="L">Laki-laki</option>
                                                    <option value="P">Perempuan</option>
                                                </select>
                                            </div>
                                        </div>
                                        <Input label="Harga per Malam (Rp)" type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                    </>
                                )}

                                {modalConfig.type === 'tariff' && (
                                    <>
                                        <Input label="Nama Layanan / Tindakan" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Konsultasi Spesialis" />
                                        <div className="flex gap-4">
                                            <div className="w-1/2">
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Kategori</label>
                                                <select className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl outline-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                                    {['MEDIS', 'NON-MEDIS', 'ADMINISTRASI', 'PENUNJANG'].map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>
                                            <div className="w-1/2">
                                                <Input label="Satuan" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} placeholder="Kali / Hari / Jam" />
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <Input label="Harga (Rp)" type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                            <Input label="Kode (Opsional)" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} required={false} />
                                        </div>
                                    </>
                                )}

                                {modalConfig.type === 'menu' && (
                                    <>
                                        <Input label="Nama Menu" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Bubur Saring" />
                                        <div className="flex gap-4">
                                            <div className="w-1/2">
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Jenis Diet</label>
                                                <select className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl outline-none" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                                    {['REGULAR', 'SOFT', 'LIQUID', 'DIET_DM', 'DIET_RG'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                                                </select>
                                            </div>
                                            <div className="w-1/2">
                                                <Input label="Kalori (kcal)" type="number" value={formData.calories} onChange={e => setFormData({ ...formData, calories: e.target.value })} />
                                            </div>
                                        </div>
                                        <Input label="Kode Menu" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                                        <Input label="Keterangan" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required={false} placeholder="Komposisi..." />
                                    </>
                                )}

                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-salm-gradient text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-salm-purple/40 transition-all mt-6">
                                    Simpan Data
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </PageWrapper>
    );
};

// UI Helpers
const Input = ({ label, value, onChange, type = "text", required = true, maxLength, placeholder }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">{label}</label>
        <input
            type={type}
            required={required}
            maxLength={maxLength}
            placeholder={placeholder}
            className="w-full bg-gray-50 dark:bg-gray-800 border-none text-gray-900 dark:text-white rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder-gray-400 font-medium shadow-inner"
            value={value}
            onChange={onChange}
        />
    </div>
);

const ActionButton = ({ onClick, icon: Icon, colorClass }) => (
    <button onClick={onClick} className={`p-2.5 rounded-xl transition-all ${colorClass}`}>
        <Icon size={18} strokeWidth={2.5} />
    </button>
);

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-16 text-center opacity-60">
        <div className="w-24 h-24 bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-[32px] flex items-center justify-center mb-6 shadow-inner">
            <Search size={40} className="text-gray-400" />
        </div>
        <p className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-1">Data Kosong</p>
        <p className="text-sm text-gray-400">Belum ada data untuk kategori ini.</p>
    </div>
);

export default MasterData;
