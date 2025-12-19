import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Filter } from 'lucide-react';
import api from '../services/api';

const RevenueAnalytics = () => {
    const [stats, setStats] = useState({
        revenue: 0,
        cogs: 0,
        grossProfit: 0,
        margin: 0
    });
    const [topProducts, setTopProducts] = useState([]);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        // In a real app, we would fetch this from backend: api.get('/finance/analytics?type=revenue')
        // For now, we mock it based on our seeded data + logic
        mockData();
    }, []);

    const mockData = () => {
        setStats({
            revenue: 250000000,
            cogs: 180000000,
            grossProfit: 70000000,
            margin: 28 // 28%
        });

        setChartData([
            { name: 'Mon', Revenue: 4000000, Cost: 2800000 },
            { name: 'Tue', Revenue: 3000000, Cost: 2100000 },
            { name: 'Wed', Revenue: 2000000, Cost: 1500000 },
            { name: 'Thu', Revenue: 2780000, Cost: 1900000 },
            { name: 'Fri', Revenue: 1890000, Cost: 1200000 },
            { name: 'Sat', Revenue: 2390000, Cost: 1400000 },
            { name: 'Sun', Revenue: 3490000, Cost: 2100000 },
        ]);

        setTopProducts([
            { name: 'Paracetamol 500mg', revenue: 15000000, profit: 8000000, margin: 53 },
            { name: 'Amoxicillin 500mg', revenue: 12000000, profit: 4000000, margin: 33 },
            { name: 'Vitamin C', revenue: 5000000, profit: 2000000, margin: 40 },
            { name: 'Saline Infusion', revenue: 8000000, profit: 2400000, margin: 30 },
            { name: 'Masker Medis', revenue: 3000000, profit: -500000, margin: -16 }, // Loss Leader
        ]);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-emerald-600" />
                        Revenue Analytics (COGS)
                    </h1>
                    <p className="text-gray-500 mt-1">Real-time Profit Margin Analysis based on FIFO Inventory Cost</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
                        <Calendar size={18} className="text-gray-400" />
                        <span className="text-sm font-medium">Last 7 Days</span>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard title="Total Revenue" value={`Rp ${stats.revenue.toLocaleString()}`} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-900/30" />
                <KPICard title="Cost of Goods (COGS)" value={`Rp ${stats.cogs.toLocaleString()}`} icon={TrendingDown} color="text-red-600" bg="bg-red-50 dark:bg-red-900/30" />
                <KPICard title="Gross Profit" value={`Rp ${stats.grossProfit.toLocaleString()}`} icon={DollarSign} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-900/30" />
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-500 font-medium">Gross Margin</p>
                    <h3 className={`text-2xl font-bold mt-1 ${stats.margin >= 20 ? 'text-emerald-600' : 'text-amber-500'}`}>
                        {stats.margin}%
                    </h3>
                </div>
            </div>

            {/* Main Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-6">Revenue vs Cost Trend</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="Cost" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Products Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white">Product Profitability</h3>
                    <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
                        <Filter size={16} /> Filter
                    </button>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 font-medium text-sm">
                        <tr>
                            <th className="p-4">Product Name</th>
                            <th className="p-4">Revenue</th>
                            <th className="p-4">Profit (Net)</th>
                            <th className="p-4">Margin %</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {topProducts.map((product, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{product.name}</td>
                                <td className="p-4 text-gray-600 dark:text-gray-300">Rp {product.revenue.toLocaleString()}</td>
                                <td className={`p-4 font-bold ${product.profit > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    Rp {product.profit.toLocaleString()}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${product.margin > 20 ? 'bg-emerald-100 text-emerald-700' :
                                            product.margin > 0 ? 'bg-amber-100 text-amber-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        {product.margin}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

const KPICard = ({ title, value, icon: Icon, color, bg }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</h3>
        </div>
        <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={24} />
        </div>
    </div>
);

export default RevenueAnalytics;
