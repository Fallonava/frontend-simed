import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { User, Plus, Edit2, Trash2, X, Save, Lock, Shield, Search } from 'lucide-react';

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
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-[1600px] mx-auto pb-10">
            <div className="flex items-center justify-end mb-6">
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-salm-gradient text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-salm-purple/30 hover:shadow-2xl hover:shadow-salm-purple/40 transition-all flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add New User
                </button>
            </div>

            {/* Content Card */}
            <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Search Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center backdrop-blur-sm">
                    <div className="relative w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border-none bg-white dark:bg-gray-700 shadow-sm focus:ring-2 focus:ring-salm-purple/50 transition-all"
                        />
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                        Showing {filteredUsers.length} users
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/80 dark:bg-gray-700/50">
                                <th className="text-left py-6 px-8 text-sm font-bold text-theme-gray dark:text-gray-400 uppercase tracking-wider">User Profile</th>
                                <th className="text-left py-6 px-8 text-sm font-bold text-theme-gray dark:text-gray-400 uppercase tracking-wider">Role & Permissions</th>
                                <th className="text-right py-6 px-8 text-sm font-bold text-theme-gray dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {filteredUsers.map((user, index) => (
                                <tr
                                    key={user.id}
                                    className="group hover:bg-salm-light-blue/5 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <td className="py-5 px-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-theme-bg to-gray-50 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-theme-gray dark:text-gray-300 font-bold text-lg shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <span className="font-bold text-theme-text dark:text-gray-200 text-lg block mb-0.5">{user.username}</span>
                                                <span className="text-xs text-gray-400 font-medium">ID: #{String(user.id).substring(0, 8)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-8">
                                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${user.role === 'ADMIN'
                                            ? 'bg-purple-100 text-purple-600 border border-purple-200'
                                            : 'bg-blue-100 text-blue-600 border border-blue-200'
                                            }`}>
                                            <Shield className="w-3 h-3 mr-1.5" />
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-5 px-8 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                onClick={() => handleOpenModal(user)}
                                                className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 hover:bg-salm-blue hover:text-white border border-gray-100 dark:border-gray-600 shadow-sm flex items-center justify-center transition-all group-hover:translate-x-0 translate-x-4"
                                                title="Edit User"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 hover:bg-red-500 hover:text-white border border-gray-100 dark:border-gray-600 shadow-sm flex items-center justify-center transition-all group-hover:translate-x-0 translate-x-8"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="3" className="py-20 text-center text-theme-gray">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <User className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="font-semibold text-lg">No users found</p>
                                            <p className="text-sm text-gray-500">Add a new user to get started</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-[32px] w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/80">
                            <div>
                                <h3 className="text-2xl font-bold text-theme-text dark:text-white">
                                    {editingUser ? 'Edit User' : 'Add New User'}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">Enter user details below</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center transition-colors shadow-sm"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl flex items-center gap-2 border border-red-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-theme-gray dark:text-gray-400 mb-2 ml-1">Username</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        disabled={!!editingUser}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-salm-purple focus:ring-2 focus:ring-salm-purple/20 disabled:opacity-60 transition-all font-medium"
                                        placeholder="Enter username"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-theme-gray dark:text-gray-400 mb-2 ml-1">Role Permission</label>
                                <div className="relative">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-salm-purple focus:ring-2 focus:ring-salm-purple/20 transition-all appearance-none font-medium cursor-pointer"
                                    >
                                        <option value="STAFF">Staff Access</option>
                                        <option value="ADMIN">Administrator</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-theme-gray dark:text-gray-400 mb-2 ml-1">
                                    {editingUser ? 'New Password (Optional)' : 'Password'}
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-salm-purple focus:ring-2 focus:ring-salm-purple/20 transition-all font-medium"
                                        placeholder={editingUser ? "••••••••" : "Create password"}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3.5 rounded-2xl text-theme-gray dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-salm-gradient text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-salm-purple/20 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    <Save className="w-5 h-5" />
                                    Save Changes
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
