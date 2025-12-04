import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { Trash2, Edit, Plus, X } from 'lucide-react';

const API_URL = 'http://localhost:3000/api';

const MasterData = () => {
    const [activeTab, setActiveTab] = useState('poliklinik');
    const [polies, setPolies] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal States
    const [isPoliModalOpen, setIsPoliModalOpen] = useState(false);
    const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form States
    const [poliForm, setPoliForm] = useState({ name: '', queue_code: '' });
    const [doctorForm, setDoctorForm] = useState({ name: '', specialist: '', poliklinik_id: '', photo_url: '' });

    const [counters, setCounters] = useState([]);
    const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
    const [counterForm, setCounterForm] = useState({ name: '' });

    useEffect(() => {
        fetchPolies();
        fetchDoctors();
        fetchCounters();
    }, []);

    const fetchCounters = async () => {
        try {
            const res = await axios.get(`${API_URL}/counters`);
            setCounters(res.data);
        } catch (error) {
            console.error('Failed to fetch counters', error);
        }
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
            toast.error('Operation failed');
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

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Toaster />
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Master Data Management</h1>

                {/* Tabs */}
                <div className="flex space-x-4 mb-6 border-b border-gray-200">
                    <button
                        className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'poliklinik'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('poliklinik')}
                    >
                        Kelola Poliklinik
                    </button>
                    <button
                        className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'doctors'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('doctors')}
                    >
                        Kelola Dokter
                    </button>
                    <button
                        className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'counters'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('counters')}
                    >
                        Kelola Loket
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'poliklinik' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => openPoliModal()}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                            >
                                <Plus size={20} /> Tambah Poli
                            </button>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="p-4 font-semibold text-gray-600">ID</th>
                                        <th className="p-4 font-semibold text-gray-600">Nama Poli</th>
                                        <th className="p-4 font-semibold text-gray-600">Kode Antrian</th>
                                        <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {polies.map((poli) => (
                                        <tr key={poli.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 text-gray-600">#{poli.id}</td>
                                            <td className="p-4 font-medium text-gray-800">{poli.name}</td>
                                            <td className="p-4 text-gray-600">
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-bold">
                                                    {poli.queue_code}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                <button
                                                    onClick={() => openPoliModal(poli)}
                                                    className="text-gray-400 hover:text-blue-600 transition"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePoli(poli.id)}
                                                    className="text-gray-400 hover:text-red-600 transition"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'doctors' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => openDoctorModal()}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                            >
                                <Plus size={20} /> Tambah Dokter
                            </button>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="p-4 font-semibold text-gray-600">Doctor</th>
                                        <th className="p-4 font-semibold text-gray-600">Spesialis</th>
                                        <th className="p-4 font-semibold text-gray-600">Poliklinik</th>
                                        <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {doctors.map((doc) => (
                                        <tr key={doc.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={doc.photo_url || 'https://via.placeholder.com/40'}
                                                        alt={doc.name}
                                                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                    />
                                                    <span className="font-medium text-gray-800">{doc.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-600">{doc.specialist}</td>
                                            <td className="p-4 text-gray-600">
                                                {doc.poliklinik ? doc.poliklinik.name : '-'}
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                <button
                                                    onClick={() => openDoctorModal(doc)}
                                                    className="text-gray-400 hover:text-blue-600 transition"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDoctor(doc.id)}
                                                    className="text-gray-400 hover:text-red-600 transition"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'counters' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => openCounterModal()}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                            >
                                <Plus size={20} /> Tambah Loket
                            </button>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="p-4 font-semibold text-gray-600">ID</th>
                                        <th className="p-4 font-semibold text-gray-600">Nama Loket</th>
                                        <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {counters.map((counter) => (
                                        <tr key={counter.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 text-gray-600">#{counter.id}</td>
                                            <td className="p-4 font-medium text-gray-800">{counter.name}</td>
                                            <td className="p-4 text-right space-x-2">
                                                <button
                                                    onClick={() => openCounterModal(counter)}
                                                    className="text-gray-400 hover:text-blue-600 transition"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCounter(counter.id)}
                                                    className="text-gray-400 hover:text-red-600 transition"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Poliklinik Modal */}
                {isPoliModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                            <button
                                onClick={() => setIsPoliModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                            <h2 className="text-xl font-bold mb-4">
                                {editingItem ? 'Edit Poliklinik' : 'Tambah Poliklinik'}
                            </h2>
                            <form onSubmit={handlePoliSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Poli</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={poliForm.name}
                                        onChange={(e) => setPoliForm({ ...poliForm, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kode Antrian (Max 3 chars)
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={3}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                                        value={poliForm.queue_code}
                                        onChange={(e) =>
                                            setPoliForm({ ...poliForm, queue_code: e.target.value.toUpperCase() })
                                        }
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                                >
                                    Simpan
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Doctor Modal */}
                {isDoctorModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                            <button
                                onClick={() => setIsDoctorModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                            <h2 className="text-xl font-bold mb-4">
                                {editingItem ? 'Edit Dokter' : 'Tambah Dokter'}
                            </h2>
                            <form onSubmit={handleDoctorSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Dokter</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={doctorForm.name}
                                        onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Spesialis</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={doctorForm.specialist}
                                        onChange={(e) => setDoctorForm({ ...doctorForm, specialist: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Poliklinik</label>
                                    <select
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={doctorForm.poliklinik_id}
                                        onChange={(e) => setDoctorForm({ ...doctorForm, poliklinik_id: e.target.value })}
                                    >
                                        <option value="">Pilih Poliklinik</option>
                                        {polies.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={doctorForm.photo_url}
                                        onChange={(e) => setDoctorForm({ ...doctorForm, photo_url: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                                >
                                    Simpan
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Counter Modal */}
                {isCounterModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                            <button
                                onClick={() => setIsCounterModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                            <h2 className="text-xl font-bold mb-4">
                                {editingItem ? 'Edit Loket' : 'Tambah Loket'}
                            </h2>
                            <form onSubmit={handleCounterSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Loket</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: Loket 1"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={counterForm.name}
                                        onChange={(e) => setCounterForm({ ...counterForm, name: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                                >
                                    Simpan
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MasterData;
