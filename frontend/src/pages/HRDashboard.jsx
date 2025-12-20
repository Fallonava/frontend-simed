import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Calendar, Clock, Edit2, Save, ChevronLeft, ChevronRight,
    Briefcase, TrendingUp, PieChart, Activity, Award, FileText,
    Search, Filter, Plus, UserPlus, CheckCircle, XCircle
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    Legend, ResponsiveContainer, AreaChart, Area, PieChart as RePie, Pie, Cell
} from 'recharts';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import PageLoader from '../components/PageLoader';
import ModernHeader from '../components/ModernHeader';
import PageWrapper from '../components/PageWrapper';

// --- DUMMY DATA FOR NEW FEATURES ---
const LEAVE_REQUESTS = [
    { id: 1, employee: "Dr. Sarah Johnson", type: "Annual Leave", dates: "Dec 24 - Dec 30", status: "Pending", days: 5 },
    { id: 2, employee: "Ns. Ratna Sari", type: "Sick Leave", dates: "Dec 20", status: "Approved", days: 1 },
    { id: 3, employee: "Budi Santoso", type: "Unpaid Leave", dates: "Jan 2 - Jan 5", status: "Rejected", days: 3 },
];

const PERFORMANCE_REVIEWS = [
    { id: 1, employee: "Dr. Sarah Johnson", rating: 4.8, date: "Nov 2024", reviewer: "Medical Director" },
    { id: 2, employee: "Ns. Ratna Sari", rating: 4.5, date: "Oct 2024", reviewer: "Head Nurse" },
    { id: 3, employee: "Ahmad Teknik", rating: 3.9, date: "Sep 2024", reviewer: "HR Manager" },
];

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981'];

const HRDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview'); // overview, directory, roster, leaves, performance
    const [employees, setEmployees] = useState([]);
    const [roster, setRoster] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [weekStart, setWeekStart] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');

    // Directory Edit State
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    // Payroll Data
    const [payroll, setPayroll] = useState([]);

    useEffect(() => {
        fetchData();
    }, [activeTab, weekStart]);

    const fetchData = async () => {
        // Only show loader on initial load
        if (employees.length === 0) setLoading(true);

        try {
            // Always fetch employees for directory/overview
            const empRes = await api.get('/hr/employees');
            if (empRes.data.success) setEmployees(empRes.data.data);

            if (activeTab === 'roster') {
                const start = new Date(weekStart);
                start.setDate(start.getDate() - start.getDay() + 1); // Monday
                const end = new Date(start);
                end.setDate(end.getDate() + 6); // Sunday

                const res = await api.get(`/hr/roster?start=${start.toISOString()}&end=${end.toISOString()}`);
                if (res.data.success) {
                    setRoster(res.data.schedules);
                    setShifts(res.data.shifts);
                }
            } else if (activeTab === 'payroll') {
                const res = await api.get('/hr/payroll');
                if (res.data.success) setPayroll(res.data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Syncing data...');
        } finally {
            setLoading(false);
        }
    };

    // --- ACTIONS ---
    const handleEdit = (emp) => {
        setEditingId(emp.id);
        setEditForm({ ...emp });
    };

    const handleSave = async () => {
        try {
            await api.put(`/hr/employee/${editingId}`, editForm);
            toast.success('Employee Updated');
            setEditingId(null);
            fetchData();
        } catch (error) {
            toast.error('Update Failed');
        }
    };

    const handleAssignShift = async (employeeId, shiftId, date) => {
        try {
            await api.post('/hr/schedule', { employeeId, shiftId, date });
            toast.success('Shift Assigned');
            fetchData();
        } catch (error) {
            toast.error('Failed to assign');
        }
    };

    const handleAutoRoster = async () => {
        if (!window.confirm("Auto-generate random schedule for next 7 days?")) return;
        try {
            const res = await api.post('/hr/auto-roster');
            toast.success(`Generated ${res.data.count} shifts!`);
            fetchData();
        } catch (error) {
            toast.error('Auto-Roster Failed');
        }
    };

    // --- HELPERS ---
    const getWeekDays = () => {
        const days = [];
        const start = new Date(weekStart);
        start.setDate(start.getDate() - start.getDay() + 1);
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const changeWeek = (offset) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + (offset * 7));
        setWeekStart(d);
    };

    const filteredEmployees = employees.filter(e =>
        e.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- STATS ---
    const stats = {
        totalEmployees: employees.length,
        doctors: employees.filter(e => e.role.toLowerCase().includes('dokter') || e.role.toLowerCase().includes('dr')).length,
        nurses: employees.filter(e => e.role.toLowerCase().includes('perawat') || e.role.toLowerCase().includes('nurse')).length,
        staff: employees.filter(e => !e.role.toLowerCase().includes('dokter') && !e.role.toLowerCase().includes('dr') && !e.role.toLowerCase().includes('perawat')).length,
    };

    const genderData = [
        { name: 'Male', value: employees.filter(e => e.gender === 'L').length },
        { name: 'Female', value: employees.filter(e => e.gender === 'P').length },
    ];

    if (loading) return <PageLoader />;

    return (
        <PageWrapper title="Human Capital">
            <Toaster position="top-right" />

            <div className="flex flex-col h-full">
                {/* Header Section */}
                <div className="px-8 pt-6 pb-2">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-1 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                Human Capital
                            </h1>
                            <p className="text-slate-500 font-medium">Manage your organization's most valuable asset.</p>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
                            {[
                                { id: 'overview', label: 'Overview', icon: PieChart },
                                { id: 'directory', label: 'Directory', icon: Users },
                                { id: 'roster', label: 'Roster', icon: Calendar },
                                { id: 'leaves', label: 'Leaves', icon: Clock },
                                { id: 'performance', label: 'Performance', icon: Award },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300
                                        ${activeTab === tab.id
                                            ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 px-8 pb-8 overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">

                        {/* --- OVERVIEW TAB --- */}
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* Stat Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Total Headcount', value: stats.totalEmployees, icon: Users, color: 'bg-blue-500' },
                                        { label: 'Medical Doctors', value: stats.doctors, icon: Activity, color: 'bg-emerald-500' },
                                        { label: 'Nursing Staff', value: stats.nurses, icon: FileText, color: 'bg-rose-500' },
                                        { label: 'Support Staff', value: stats.staff, icon: Briefcase, color: 'bg-amber-500' },
                                    ].map((stat, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-lg transition-all">
                                            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color} text-white rounded-bl-3xl`}>
                                                <stat.icon size={64} />
                                            </div>
                                            <div className="relative z-10">
                                                <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/20`}>
                                                    <stat.icon size={24} />
                                                </div>
                                                <h3 className="text-4xl font-black text-slate-800 mb-1">{stat.value}</h3>
                                                <p className="text-slate-500 font-bold text-sm uppercase tracking-wide">{stat.label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Charts */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                            <TrendingUp size={20} className="text-purple-500" />
                                            Attendance Trends (Weekly)
                                        </h3>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={[
                                                    { name: 'Mon', present: 40, absent: 2 },
                                                    { name: 'Tue', present: 38, absent: 4 },
                                                    { name: 'Wed', present: 42, absent: 0 },
                                                    { name: 'Thu', present: 41, absent: 1 },
                                                    { name: 'Fri', present: 39, absent: 3 },
                                                    { name: 'Sat', present: 20, absent: 2 },
                                                    { name: 'Sun', present: 18, absent: 1 },
                                                ]}>
                                                    <defs>
                                                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                    <Area type="monotone" dataKey="present" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPresent)" strokeWidth={3} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                            <Users size={20} className="text-pink-500" />
                                            Gender Distribution
                                        </h3>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RePie>
                                                    <Pie
                                                        data={genderData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {genderData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip />
                                                    <Legend />
                                                </RePie>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* --- DIRECTORY TAB --- */}
                        {activeTab === 'directory' && (
                            <motion.div
                                key="directory"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                {/* Search Bar */}
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                                    <Search className="text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search employees by name or role..."
                                        className="flex-1 outline-none text-slate-700 font-medium placeholder:text-slate-400"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <button className="bg-slate-100 p-2 rounded-xl text-slate-500 hover:bg-slate-200">
                                        <Filter size={20} />
                                    </button>
                                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-purple-500/20">
                                        <Plus size={18} /> Add Employee
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredEmployees.map(emp => (
                                        <motion.div
                                            key={emp.id}
                                            layout
                                            className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/5 transition-all group relative cursor-pointer"
                                        >
                                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-t-3xl -z-0" />

                                            <div className="relative z-10 flex justify-between items-start mb-4">
                                                <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center text-3xl font-black text-purple-600 border-4 border-white mt-2">
                                                    {emp.full_name?.charAt(0)}
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${emp.status === 'resigned' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                                    }`}>
                                                    {emp.status || 'Active'}
                                                </div>
                                            </div>

                                            <div className="relative z-10 mb-6">
                                                {editingId === emp.id ? (
                                                    <input className="font-bold border rounded-lg px-2 py-1.5 w-full text-lg mb-1" value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} />
                                                ) : (
                                                    <h3 className="font-bold text-xl text-slate-800 leading-tight mb-1 group-hover:text-purple-600 transition-colors">{emp.full_name}</h3>
                                                )}
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                    <Briefcase size={12} /> {emp.role}
                                                </div>
                                            </div>

                                            <div className="relative z-10 space-y-3 text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-slate-400">NIP</span>
                                                    <span className="font-mono font-semibold text-slate-600">{emp.nip}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-slate-400">SIP/STR</span>
                                                    <span className="font-mono font-semibold text-slate-600">{emp.sip_str || '-'}</span>
                                                </div>
                                                <div className="pt-2 border-t border-slate-200 mt-2 flex justify-between items-center">
                                                    <button onClick={() => editingId === emp.id ? handleSave() : handleEdit(emp)} className="text-xs font-bold text-purple-600 hover:underline">
                                                        {editingId === emp.id ? 'Save Changes' : 'Edit Profile'}
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* --- ROSTER TAB --- */}
                        {activeTab === 'roster' && (
                            <motion.div
                                key="roster"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            >
                                <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-1.5 border border-slate-200">
                                            <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all"><ChevronLeft size={20} /></button>
                                            <h2 className="font-bold text-sm md:text-base flex items-center gap-2 px-4 min-w-[200px] justify-center text-slate-700">
                                                <Calendar size={18} className="text-purple-500" />
                                                {getWeekDays()[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {getWeekDays()[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </h2>
                                            <button onClick={() => changeWeek(1)} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all"><ChevronRight size={20} /></button>
                                        </div>
                                        <button onClick={handleAutoRoster} className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-900 transition-colors shadow-lg shadow-slate-500/30">
                                            <Activity size={18} /> AI Auto-Schedule
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto custom-scrollbar">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr>
                                                    <th className="p-6 w-64 bg-slate-50/80 backdrop-blur border-b border-slate-200 sticky left-0 z-20 text-slate-500 text-xs font-black uppercase tracking-widest text-left">Employee</th>
                                                    {getWeekDays().map(day => (
                                                        <th key={day} className="p-4 border-b border-slate-200 min-w-[140px] text-center bg-white">
                                                            <div className={`font-black text-sm ${day.toDateString() === new Date().toDateString() ? 'text-purple-600' : 'text-slate-700'}`}>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                                            <div className={`text-xs font-mono font-bold mt-1 ${day.toDateString() === new Date().toDateString() ? 'bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full inline-block' : 'text-slate-400'}`}>{day.getDate()}</div>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {employees.map(emp => (
                                                    <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                        <td className="p-4 sticky left-0 z-10 bg-white border-r border-slate-100">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shadow-inner">
                                                                    {emp.full_name?.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-sm text-slate-800">{emp.full_name}</div>
                                                                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{emp.role}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        {getWeekDays().map(day => {
                                                            const schedule = roster.find(r => r.employee_id === emp.id && new Date(r.date).toDateString() === day.toDateString());
                                                            return (
                                                                <td key={day} className="p-2 text-center border-l border-slate-50">
                                                                    {schedule ? (
                                                                        <div className={`
                                                                            mx-auto w-full max-w-[120px] p-3 rounded-xl text-xs font-bold relative group cursor-pointer border shadow-sm transition-transform hover:scale-105 active:scale-95
                                                                            ${schedule.shift.name === 'Pagi' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                                                                schedule.shift.name === 'Siang' ? 'bg-orange-50 border-orange-100 text-orange-700' :
                                                                                    'bg-blue-50 border-blue-100 text-blue-700'}
                                                                        `}>
                                                                            <div className="mb-0.5 uppercase tracking-wide">{schedule.shift.name}</div>
                                                                            <div className="text-[9px] opacity-70 font-mono">{schedule.shift.start_time}-{schedule.shift.end_time}</div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="group relative h-12 flex items-center justify-center">
                                                                            <div className="w-1.5 h-1.5 bg-slate-100 rounded-full group-hover:scale-0 transition-transform"></div>
                                                                            <div className="absolute inset-0 hidden group-hover:flex items-center justify-center gap-1 z-30">
                                                                                {shifts.map(s => (
                                                                                    <button
                                                                                        key={s.id}
                                                                                        onClick={() => handleAssignShift(emp.id, s.id, day)}
                                                                                        className={`w-8 h-8 rounded-xl shadow-lg flex items-center justify-center font-bold text-white text-[10px] hover:scale-110 transition-transform ${s.name === 'Pagi' ? 'bg-emerald-500' : s.name === 'Siang' ? 'bg-orange-500' : 'bg-blue-500'
                                                                                            }`}
                                                                                    >
                                                                                        {s.name.charAt(0)}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            )
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* --- LEAVES TAB (NEW) --- */}
                        {activeTab === 'leaves' && (
                            <motion.div
                                key="leaves"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                {/* Leave Balances */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { label: 'Annual Leave', used: 8, total: 12, color: 'text-purple-600', bg: 'bg-purple-500' },
                                        { label: 'Sick Leave', used: 2, total: 10, color: 'text-emerald-600', bg: 'bg-emerald-500' },
                                        { label: 'Unpaid Leave', used: 0, total: 5, color: 'text-orange-600', bg: 'bg-orange-500' },
                                    ].map((leave, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                                            <div className={`absolute top-0 right-0 w-32 h-32 ${leave.bg} opacity-10 rounded-full blur-3xl -mr-10 -mt-10`}></div>
                                            <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wide mb-4">{leave.label}</h3>
                                            <div className="flex items-end gap-2 mb-2">
                                                <span className={`text-4xl font-black ${leave.color}`}>{leave.total - leave.used}</span>
                                                <span className="text-slate-400 font-bold mb-1">/ {leave.total} Days Left</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${leave.bg}`}
                                                    style={{ width: `${(leave.used / leave.total) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Request List */}
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-slate-800">Leave Requests</h3>
                                        <button className="text-purple-600 font-bold text-sm hover:underline">View History</button>
                                    </div>
                                    <div className="space-y-4">
                                        {LEAVE_REQUESTS.map(req => (
                                            <div key={req.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-slate-600">
                                                        {req.employee.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800">{req.employee}</h4>
                                                        <p className="text-sm text-slate-500">{req.type} • {req.dates} ({req.days} days)</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider
                                                        ${req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                            req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {req.status}
                                                    </span>
                                                    {req.status === 'Pending' && (
                                                        <div className="flex gap-2">
                                                            <button className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"><CheckCircle size={16} /></button>
                                                            <button className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><XCircle size={16} /></button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* --- PERFORMANCE TAB (NEW) --- */}
                        {activeTab === 'performance' && (
                            <motion.div
                                key="performance"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {PERFORMANCE_REVIEWS.map(review => (
                                        <div key={review.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-lg shadow-slate-200/50 hover:scale-[1.02] transition-transform">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/30">
                                                    {review.rating}
                                                </div>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{review.date}</span>
                                            </div>

                                            <h3 className="text-2xl font-bold text-slate-800 mb-1">{review.employee}</h3>
                                            <p className="text-slate-500 text-sm font-medium mb-6">Reviewed by {review.reviewer}</p>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                                                    <span>Goals Met</span>
                                                    <span>92%</span>
                                                </div>
                                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500 w-[92%]"></div>
                                                </div>
                                            </div>

                                            <button className="w-full mt-6 py-3 rounded-xl border-2 border-slate-100 font-bold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors">
                                                View Full Report
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </PageWrapper>
    );
};

export default HRDashboard;
