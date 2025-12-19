import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, DollarSign, CreditCard, QrCode, Printer, CheckCircle, Search, TrendingUp } from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import PageLoader from '../components/PageLoader';

const FinanceDashboard = () => {
    const [activeTab, setActiveTab] = useState('cashier'); // cashier, report
    const [unpaid, setUnpaid] = useState([]);
    const [analytics, setAnalytics] = useState([]);
    const [report, setReport] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000); // Polling for new invoices
        return () => clearInterval(interval);
    }, [activeTab]);

    const fetchData = async () => {
        try {
            if (activeTab === 'cashier') {
                const res = await api.get('/finance/unpaid');
                if (res.data.success) setUnpaid(res.data.data);
            } else if (activeTab === 'report') {
                const res = await api.get('/finance/report');
                if (res.data.success) setReport(res.data);
            } else if (activeTab === 'analytics') {
                const res = await api.get('/finance/analytics');
                if (res.data.success) setAnalytics(res.data.chart_data);
            }
        } catch (error) {
            console.error('Fetch error', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async (method) => {
        if (!selectedInvoice) return;
        setProcessing(true);
        try {
            await api.post(`/finance/pay/${selectedInvoice.id}`, { method });
            toast.success(`Payment Successful (${method})`);
            setSelectedInvoice(null);
            fetchData();
        } catch (error) {
            toast.error('Payment Failed');
        } finally {
            setProcessing(false);
        }
    };

    const handleWhatsApp = (txn) => {
        // Mock Phone Number if missing
        const phone = txn.patient.phone || '6281234567890';
        const message = `Halo ${txn.patient.name}, Terima kasih telah berobat di RS SIMED. Total pembayaran Anda: Rp ${txn.total_amount.toLocaleString()}. Simpan struk ini sebagai bukti pembayaran yang sah.`;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    if (loading) return <PageLoader />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 pb-32 font-sans text-gray-900 dark:text-white">
            <Toaster position="top-right" />

            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <Receipt className="text-pink-500" size={32} />
                        Finance & Billing
                    </h1>
                    <p className="text-gray-500">Cashier Station & Daily Closing</p>
                </div>

                <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('cashier')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'cashier' ? 'bg-pink-100 text-pink-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Cashier
                    </button>
                    <button
                        onClick={() => setActiveTab('report')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'report' ? 'bg-pink-100 text-pink-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Daily Report
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'analytics' ? 'bg-pink-100 text-pink-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Analytics
                    </button>
                </div>
            </header>

            {activeTab === 'cashier' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Invoice List */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Search size={18} /> Pending Invoices ({unpaid.length})
                        </h2>
                        {unpaid.length === 0 ? (
                            <div className="text-center py-20 text-gray-400 bg-white dark:bg-gray-800 rounded-3xl border border-dashed">
                                No pending invoices found.
                            </div>
                        ) : (
                            unpaid.map(inv => (
                                <motion.div
                                    layoutId={inv.id}
                                    key={inv.id}
                                    onClick={() => setSelectedInvoice(inv)}
                                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg
                                        ${selectedInvoice?.id === inv.id ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{inv.patient.name}</div>
                                            <div className="text-sm font-mono text-gray-500 mt-1">
                                                RM: {inv.patient.no_rm} • {new Date(inv.created_at).toLocaleString()}
                                            </div>
                                            {inv.admission && (
                                                <div className="mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded w-fit font-bold uppercase tracking-wider">
                                                    Inpatient • Room {inv.admission.bed.room.name}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-pink-600 font-mono">
                                                Rp {inv.total_amount.toLocaleString()}
                                            </div>
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Total Amount</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Payment Panel */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl h-fit sticky top-6">
                        <h2 className="font-bold text-lg mb-6 border-b pb-4">Payment Terminal</h2>

                        {selectedInvoice ? (
                            <div className="space-y-6">
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Customer</div>
                                    <div className="font-bold text-xl">{selectedInvoice.patient.name}</div>
                                </div>

                                <div className="space-y-2 max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 rounded-xl text-sm">
                                    {selectedInvoice.items.map(item => (
                                        <div key={item.id} className="flex justify-between">
                                            <span>{item.description} (x{item.quantity})</span>
                                            <span className="font-mono font-bold">Rp {(item.amount * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-dashed">
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span>Total to Pay</span>
                                        <span className="text-pink-600 text-2xl font-mono">Rp {selectedInvoice.total_amount.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-4">
                                    <button onClick={() => handlePay('CASH')} disabled={processing} className="p-4 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl font-bold flex flex-col items-center gap-2 transition-all">
                                        <DollarSign /> Cash
                                    </button>
                                    <button onClick={() => handlePay('QRIS')} disabled={processing} className="p-4 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-bold flex flex-col items-center gap-2 transition-all">
                                        <QrCode /> QRIS
                                    </button>
                                    <button onClick={() => handlePay('CARD')} disabled={processing} className="p-4 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl font-bold flex flex-col items-center gap-2 transition-all col-span-2">
                                        <CreditCard /> Debit / Credit Card
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-400 italic">
                                Select an invoice to proceed with payment
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'report' && (
                <div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-3xl border border-green-100 dark:border-green-800">
                            <div className="text-green-600 dark:text-green-400 mb-2 font-bold uppercase text-xs tracking-wider">Total Income (Today)</div>
                            <div className="text-4xl font-mono font-bold text-green-700 dark:text-green-300">
                                Rp {report?.totalIncome?.toLocaleString() || 0}
                            </div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800">
                            <div className="text-blue-600 dark:text-blue-400 mb-2 font-bold uppercase text-xs tracking-wider">Transactions</div>
                            <div className="text-4xl font-mono font-bold text-blue-700 dark:text-blue-300">
                                {report?.transactionCount || 0}
                            </div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-3xl border border-purple-100 dark:border-purple-800">
                            <div className="text-purple-600 dark:text-purple-400 mb-2 font-bold uppercase text-xs tracking-wider">Top Method</div>
                            <div className="text-4xl font-mono font-bold text-purple-700 dark:text-purple-300">
                                QRIS {/* Placeholder */}
                            </div>
                        </div>
                    </div>

                    <h3 className="font-bold text-xl mb-6 flex items-center gap-2"><TrendingUp className="text-pink-500" /> Transaction History</h3>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs text-gray-500 uppercase tracking-wider border-b">
                                <th className="pb-4">Time</th>
                                <th className="pb-4">Patient</th>
                                <th className="pb-4">Method</th>
                                <th className="pb-4 text-right">Amount</th>
                                <th className="pb-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {report?.transactions?.map(txn => (
                                <tr key={txn.id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="py-4 font-mono">{new Date(txn.updated_at).toLocaleTimeString()}</td>
                                    <td className="py-4 font-bold">{txn.patient.name}</td>
                                    <td className="py-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold">{txn.payment_method}</span></td>
                                    <td className="py-4 text-right font-mono font-bold">Rp {txn.total_amount.toLocaleString()}</td>
                                    <td className="py-4 text-right flex gap-2 justify-end">
                                        <button className="text-blue-600 hover:text-blue-800 font-bold text-xs flex items-center gap-1">
                                            <Printer size={14} /> Receipt
                                        </button>
                                        <button onClick={() => handleWhatsApp(txn)} className="text-green-600 hover:text-green-800 font-bold text-xs flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                                            @ Send WA
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'analytics' && (
                <div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 shadow-sm">
                    <h3 className="font-bold text-xl mb-6 flex items-center gap-2"><TrendingUp className="text-pink-500" /> 7-Day Revenue Trend</h3>

                    <div className="h-64 flex items-end gap-4 p-4 border border-dashed rounded-3xl bg-gray-50 dark:bg-gray-900/50">
                        {analytics.map((data, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                <div
                                    className="w-full bg-pink-500 rounded-t-xl transition-all duration-500 group-hover:bg-pink-400 relative"
                                    style={{ height: `${(data.revenue / 5000000) * 100}%`, minHeight: '10px' }} // Scale assuming 5jt max for demo
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        Rp {data.revenue.toLocaleString()}
                                    </div>
                                </div>
                                <div className="text-xs font-bold text-gray-500">{new Date(data.date).toLocaleDateString(undefined, { weekday: 'short' })}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceDashboard;
