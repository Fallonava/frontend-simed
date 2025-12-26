import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Trash2, Key, Shield, User, Search, Save, X, CheckCircle } from 'lucide-react';
import api from '../utils/axiosConfig';
import PageWrapper from '../components/PageWrapper';
import ModernHeader from '../components/ModernHeader';
import toast, { Toaster } from 'react-hot-toast';

const SuperAdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '', role: 'ADMIN', fullName: '', nip: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            toast.success('User deleted');
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', formData);
            toast.success('User created successfully');
            setShowModal(false);
            setFormData({ username: '', password: '', role: 'ADMIN', fullName: '', nip: '' });
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create user');
        }
    };

    return (
        <PageWrapper title="Super Admin">
            <Toaster position="top-center" />
            <ModernHeader title="Super Admin Console" subtitle="System & User Management" onBack={() => window.history.back()} />

            <div className="max-w-7xl mx-auto p-6">

                {/* Stats / Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass-panel p-6 rounded-3xl flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 font-medium text-sm uppercase">Total Users</p>
                            <h3 className="text-3xl font-bold mt-1 text-gray-800 dark:text-white">{users.length}</h3>
                        </div>
                        <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
                            <Users size={28} />
                        </div>
                    </div>
                </div>

                {/* User Table Card */}
                <div className="glass-panel rounded-3xl overflow-hidden p-6 relative min-h-[500px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
                            <Shield size={20} className="text-purple-500" />
                            System Users
                        </h3>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                        >
                            <Plus size={18} /> New User
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700 text-left text-sm text-gray-400 uppercase tracking-wider">
                                    <th className="pb-4 pl-4">User</th>
                                    <th className="pb-4">Role</th>
                                    <th className="pb-4">Employee Link</th>
                                    <th className="pb-4 text-right pr-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {users.map((u) => (
                                    <tr key={u.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="py-4 pl-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 font-bold">
                                                    {u.username.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800 dark:text-gray-200">{u.username}</div>
                                                    <div className="text-xs text-gray-400">ID: {u.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold 
                                                ${u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-600' :
                                                    u.role === 'ADMIN' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="py-4 text-sm text-gray-500">
                                            {u.employee ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">{u.employee.full_name}</span>
                                                    <span className="text-xs">{u.employee.nip}</span>
                                                </div>
                                            ) : (
                                                <span className="opacity-50 italic">No link</span>
                                            )}
                                        </td>
                                        <td className="py-4 text-right pr-4">
                                            <button
                                                onClick={() => handleDelete(u.id)}
                                                className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg text-gray-400 transition-colors"
                                                disabled={u.role === 'SUPER_ADMIN'}
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
            </div>

            {/* Create User Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-white dark:bg-[#1c1c1e] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <h3 className="text-xl font-bold">Create New User</h3>
                                <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Username</label>
                                    <div className="relative mt-1">
                                        <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="text" required
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="johndoe"
                                            value={formData.username}
                                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                                    <div className="relative mt-1">
                                        <Key className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="password" required
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Role</label>
                                        <select
                                            className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="ADMIN">ADMIN</option>
                                            <option value="SUPER_ADMIN">SUPER ADMIN</option>
                                            <option value="DOCTOR">DOCTOR</option>
                                            <option value="REGISTRATION">REGISTRATION (Front Office)</option>
                                            <option value="NURSE">NURSE (Rawat Inap)</option>
                                            <option value="PHARMACIST">PHARMACIST (Farmasi)</option>
                                            <option value="LABORATORY">LABORATORY (Lab)</option>
                                            <option value="RADIOLOGY">RADIOLOGY (Radiologi)</option>
                                            <option value="KITCHEN">KITCHEN (Gizi)</option>
                                            <option value="CASHIER">CASHIER (Kasir)</option>
                                            <option value="LOGISTICS">LOGISTICS (Inventory)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">NIP (Employee ID)</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Optional"
                                            value={formData.nip}
                                            onChange={e => setFormData({ ...formData, nip: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Dr. John Doe (Optional)"
                                        value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                                >
                                    Create Account
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </PageWrapper>
    );
};

export default SuperAdminDashboard;
