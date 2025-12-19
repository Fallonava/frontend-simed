import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Calendar, Clock, Edit2, Save, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import PageLoader from '../components/PageLoader';

const HRDashboard = () => {
    const [activeTab, setActiveTab] = useState('directory'); // directory, roster
    const [employees, setEmployees] = useState([]);
    const [roster, setRoster] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [weekStart, setWeekStart] = useState(new Date());

    // Directory State
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const [payroll, setPayroll] = useState([]);

    useEffect(() => {
        fetchData();
    }, [activeTab, weekStart]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'directory') {
                const res = await api.get('/hr/employees');
                if (res.data.success) setEmployees(res.data.data);
            } else if (activeTab === 'roster') {
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
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

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
        const confirm = window.confirm("Auto-generate random schedule for next 7 days? This adds to existing roster.");
        if (!confirm) return;

        try {
            const res = await api.post('/hr/auto-roster');
            toast.success(`Generated ${res.data.count} shifts!`);
            fetchData();
        } catch (error) {
            toast.error('Auto-Roster Failed');
        }
    };

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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 pb-32 font-sans text-gray-900 dark:text-white">
            <Toaster position="top-right" />

            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <Users className="text-purple-600" size={32} />
                        Human Capital
                    </h1>
                    <p className="text-gray-500">Employee & Roster Management</p>
                </div>

                <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('directory')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'directory' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Directory
                    </button>
                    <button
                        onClick={() => setActiveTab('roster')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'roster' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Roster
                    </button>
                    <button
                        onClick={() => setActiveTab('payroll')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'payroll' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Payroll
                    </button>
                </div>
            </header>

            {activeTab === 'directory' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {employees.map(emp => (
                        <div key={emp.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 group hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold text-lg">
                                        {emp.full_name?.charAt(0)}
                                    </div>
                                    <div>
                                        {editingId === emp.id ? (
                                            <input className="font-bold border rounded px-2 py-1 w-full" value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} />
                                        ) : (
                                            <h3 className="font-bold text-lg">{emp.full_name}</h3>
                                        )}
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{emp.role}</div>
                                    </div>
                                </div>
                                <button onClick={() => editingId === emp.id ? handleSave() : handleEdit(emp)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-purple-100 hover:text-purple-600 transition-colors">
                                    {editingId === emp.id ? <Save size={16} /> : <Edit2 size={16} />}
                                </button>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex justify-between">
                                    <span>NIP</span>
                                    {editingId === emp.id ? <input className="border rounded px-2 w-32 text-right" value={editForm.nip} onChange={e => setEditForm({ ...editForm, nip: e.target.value })} /> : <span className="font-mono">{emp.nip}</span>}
                                </div>
                                <div className="flex justify-between">
                                    <span>STR/SIP</span>
                                    {editingId === emp.id ? <input className="border rounded px-2 w-32 text-right" value={editForm.sip_str} onChange={e => setEditForm({ ...editForm, sip_str: e.target.value })} /> : <span className="font-mono">{emp.sip_str || '-'}</span>}
                                </div>
                                <div className="flex justify-between">
                                    <span>Since</span>
                                    <span className="font-mono">{new Date(emp.join_date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'roster' && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                        <div className="flex items-center gap-4">
                            <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-white rounded-full"><ChevronLeft size={20} /></button>
                            <h2 className="font-bold text-lg flex items-center gap-2">
                                <Calendar size={20} className="text-purple-500" />
                                {activeTab === 'roster' && getWeekDays()[0].toLocaleDateString()} - {activeTab === 'roster' && getWeekDays()[6].toLocaleDateString()}
                            </h2>
                            <button onClick={() => changeWeek(1)} className="p-2 hover:bg-white rounded-full"><ChevronRight size={20} /></button>
                        </div>
                        <button
                            onClick={handleAutoRoster}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-500/30"
                        >
                            <Briefcase size={16} /> Auto Schedule (AI)
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-4 border-b dark:border-gray-700 w-48 bg-gray-50 dark:bg-gray-800 sticky left-0 z-10">Employee</th>
                                    {getWeekDays().map(day => (
                                        <th key={day} className="p-4 border-b dark:border-gray-700 min-w-[140px] text-center">
                                            <div className="font-bold">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                            <div className="text-xs text-gray-400 font-mono">{day.getDate()}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map(emp => (
                                    <tr key={emp.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="p-4 font-medium sticky left-0 bg-white dark:bg-gray-800 z-10 shadow-sm">
                                            <div className="font-bold">{emp.full_name}</div>
                                            <div className="text-xs text-gray-500">{emp.role}</div>
                                        </td>
                                        {getWeekDays().map(day => {
                                            const schedule = roster.find(r => r.employee_id === emp.id && new Date(r.date).toDateString() === day.toDateString());
                                            return (
                                                <td key={day} className="p-2 text-center border-l dark:border-gray-700">
                                                    {schedule ? (
                                                        <div className={`p-2 rounded-lg text-xs font-bold uppercase tracking-wider relative group cursor-pointer
                                                            ${schedule.shift.name === 'Pagi' ? 'bg-green-100 text-green-700' :
                                                                schedule.shift.name === 'Siang' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {schedule.shift.name}
                                                            <div className="text-[10px] opacity-70">{schedule.shift.start_time}-{schedule.shift.end_time}</div>
                                                        </div>
                                                    ) : (
                                                        <div className="group relative h-10 flex items-center justify-center">
                                                            <span className="text-gray-300">-</span>
                                                            <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg gap-1">
                                                                {shifts.map(s => (
                                                                    <button
                                                                        key={s.id}
                                                                        onClick={() => handleAssignShift(emp.id, s.id, day)}
                                                                        className={`w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-bold text-white
                                                                            ${s.name === 'Pagi' ? 'bg-green-500' : s.name === 'Siang' ? 'bg-yellow-500' : 'bg-blue-500'}`}
                                                                    >
                                                                        {s.name.charAt(0)}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'payroll' && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Briefcase className="text-green-500" /> Payroll Estimator (Based on Shifts)
                    </h2>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b dark:border-gray-700 text-gray-500 text-sm uppercase">
                                <th className="pb-4">Employee</th>
                                <th className="pb-4 text-center">Total Shifts</th>
                                <th className="pb-4 text-right">Est. Salary (IDR)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {payroll.map(p => (
                                <tr key={p.id}>
                                    <td className="py-4 font-bold">
                                        {p.name}
                                        <div className="text-xs text-gray-400 font-normal">{p.role}</div>
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg font-bold">{p.shift_count}</span>
                                    </td>
                                    <td className="py-4 text-right font-mono font-bold text-green-600">
                                        Rp {p.total_salary.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default HRDashboard;
