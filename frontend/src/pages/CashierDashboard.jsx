import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, CreditCard, Printer, Search, CheckCircle, Clock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../utils/axiosConfig';
import PageWrapper from '../components/PageWrapper';

const CashierDashboard = () => {
    const [activeTab, setActiveTab] = useState('unpaid'); // 'unpaid' or 'history'
    const [unbilled, setUnbilled] = useState([]);
    const [transactions, setTransactions] = useState([]); // Pending Payments
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'unpaid') {
                // Fetch Unbilled Records (Need Invoice Generation)
                const resUnbilled = await api.get('/transactions/unbilled');
                setUnbilled(resUnbilled.data);

                // Fetch Existing Unpaid Invoices
                const resPending = await api.get('/transactions?status=UNPAID');
                // Currently API returns all transactions, lets filter client side or update API
                // Assuming API /transactions returns filtering logic or we adjust 
                // Let's use getPending from controller which returns transactions
                setTransactions(resPending.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateInvoice = async (recordId) => {
        try {
            const res = await api.post('/transactions/invoice', { medical_record_id: recordId });
            toast.success("Invoice Generated");
            fetchData();
            setSelectedTransaction(res.data);
        } catch (error) {
            toast.error("Failed to generate invoice");
        }
    };

    const handlePay = async (id, method) => {
        try {
            await api.put(`/transactions/${id}/pay`, { payment_method: method });
            toast.success(`Payment Successful via ${method}`);
            setSelectedTransaction(null);
            fetchData();
        } catch (error) {
            toast.error("Payment Failed");
        }
    };

    return (
        <PageWrapper title="Cashier & Billing">
            <Toaster position="top-right" />
            <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Queue / List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
                            <Clock className="text-blue-500" /> Pending Bills
                        </h2>

                        {/* Unbilled List */}
                        <div className="space-y-4">
                            {unbilled.length === 0 && transactions.length === 0 && (
                                <div className="text-center py-10 text-gray-400">No pending payments</div>
                            )}

                            {/* Section: Ready to Bill (Unbilled) */}
                            {unbilled.map(r => (
                                <div key={r.id} className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{r.patient?.name}</h3>
                                        <p className="text-sm text-gray-500">Dr. {r.doctor?.name} • Needs Invoice</p>
                                    </div>
                                    <button
                                        onClick={() => handleGenerateInvoice(r.id)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700"
                                    >
                                        Create Bill
                                    </button>
                                </div>
                            ))}

                            {/* Section: Unpaid Invoices */}
                            {transactions.map(t => (
                                <div
                                    key={t.id}
                                    onClick={() => setSelectedTransaction(t)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedTransaction?.id === t.id ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50'}`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-mono text-xs text-gray-400">{t.invoice_no}</span>
                                        <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold">{t.status}</span>
                                    </div>
                                    <h3 className="font-bold text-lg dark:text-white">{t.patient?.name}</h3>
                                    <p className="text-emerald-600 font-bold">Rp {t.total_amount.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Payment Detail */}
                <div className="lg:col-span-1">
                    <AnimatePresence mode="wait">
                        {selectedTransaction ? (
                            <motion.div
                                key={selectedTransaction.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white dark:bg-gray-800 rounded-[24px] shadow-xl border border-gray-100 dark:border-gray-700 p-6 sticky top-6"
                            >
                                <div className="text-center mb-6 pb-6 border-b border-dashed border-gray-200 dark:border-gray-700">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Receipt size={32} />
                                    </div>
                                    <h2 className="text-2xl font-bold dark:text-white">{selectedTransaction.patient?.name}</h2>
                                    <p className="text-gray-400 font-mono text-sm">{selectedTransaction.invoice_no}</p>
                                </div>

                                <div className="space-y-3 mb-8">
                                    {selectedTransaction.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-300">
                                                {item.description} <span className="text-gray-400 lowercase">x{item.quantity}</span>
                                            </span>
                                            <span className="font-bold dark:text-white">Rp {(item.amount * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-lg font-bold">
                                        <span className="dark:text-white">Total</span>
                                        <span className="text-emerald-600">Rp {selectedTransaction.total_amount.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <button onClick={() => handlePay(selectedTransaction.id, 'CASH')} className="py-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 font-bold text-gray-700 dark:text-white transition w-full">
                                        💵 CASH
                                    </button>
                                    <button onClick={() => handlePay(selectedTransaction.id, 'QRIS')} className="py-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 font-bold text-blue-600 transition w-full">
                                        📱 QRIS
                                    </button>
                                </div>
                                <button className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 font-bold hover:border-gray-400 hover:text-gray-500 flex items-center justify-center gap-2">
                                    <Printer size={18} /> Print Invoice
                                </button>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                                <Receipt size={48} className="mb-4 opacity-50" />
                                <p className="font-bold">Select a bill to process</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </PageWrapper>
    );
};

export default CashierDashboard;
