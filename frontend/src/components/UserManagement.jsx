import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { User, Plus, Edit2, Trash2, X, Save, Lock, Shield } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'STAFF'
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/users');
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch users', err);
            setLoading(false);
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({ username: user.username, password: '', role: user.role });
        } else {
            setEditingUser(null);
            setFormData({ username: '', password: '', role: 'STAFF' });
        }
        setError('');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (editingUser) {
                // Update
                const data = { role: formData.role };
                if (formData.password) data.password = formData.password;

                await axios.put(`/users/${editingUser.id}`, data);
            } else {
                // Create
                if (!formData.password) {
                    setError('Password is required for new users');
                    return;
                }
                await axios.post('/users', formData);
            }
            fetchUsers();
            setShowModal(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`/users/${id}`);
                fetchUsers();
            } catch (err) {
                alert('Failed to delete user');
            }
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto pb-10 fade-in animate-in duration-300">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-theme-text flex items-center gap-2">
                        <User className="w-6 h-6 text-salm-purple" />
                        User Management
                    </h2>
                    <p className="text-theme-gray mt-1">Manage system access and roles</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-salm-gradient text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-salm-purple/20 hover:opacity-90 transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left py-5 px-8 text-sm font-semibold text-theme-gray">Username</th>
                                <th className="text-left py-5 px-8 text-sm font-semibold text-theme-gray">Role</th>
                                <th className="text-right py-5 px-8 text-sm font-semibold text-theme-gray">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-5 px-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-theme-bg flex items-center justify-center text-theme-gray font-bold">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-theme-text">{user.username}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-8">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-600'
                                                : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-5 px-8 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(user)}
                                                className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-salm-light-blue/20 hover:text-salm-blue flex items-center justify-center transition-all"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="3" className="py-12 text-center text-theme-gray">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-theme-text">
                                {editingUser ? 'Edit User' : 'Add New User'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-theme-text">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-theme-gray mb-2">Username</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        disabled={!!editingUser}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-salm-purple focus:ring-1 focus:ring-salm-purple disabled:bg-gray-50 transition-all"
                                        placeholder="Enter username"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-theme-gray mb-2">Role</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-salm-purple focus:ring-1 focus:ring-salm-purple transition-all bg-white appearance-none"
                                    >
                                        <option value="STAFF">STAFF</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-theme-gray mb-2">
                                    {editingUser ? 'New Password (leave blank to keep)' : 'Password'}
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-salm-purple focus:ring-1 focus:ring-salm-purple transition-all"
                                        placeholder={editingUser ? "••••••••" : "Enter password"}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-theme-gray hover:bg-gray-50 font-medium transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="bg-salm-gradient text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-salm-purple/20 hover:opacity-90 transition-all flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    Save User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
