import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Clock, CheckCircle, Printer, User, FileText, CreditCard } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const CashierDashboard = () => {
    const [activeTab, setActiveTab] = useState('unbilled'); // 'unbilled' or 'unpaid'
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'unbilled'
                ? `${API_URL}/transactions/unbilled`
                : `${API_URL}/transactions`; // Default gets pending/unpaid

            const token = localStorage.getItem('token');
            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setItems(response.data);
            setSelectedItem(null); // Deselect on tab switch or refresh
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000); // Auto refresh
        return () => clearInterval(interval);
    }, [activeTab]);

    const handleCreateInvoice = async (medicalRecordId) => {
        setProcessing(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/transactions/invoice`,
                { medical_record_id: medicalRecordId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Switch to unpaid tab to see the new invoice
            setActiveTab('unpaid');
        } catch (error) {
            console.error("Failed to create invoice", error);
            alert("Failed to create invoice");
        } finally {
            setProcessing(false);
        }
    };

    const handlePay = async (transactionId, method) => {
        if (!window.confirm(`Process payment of via ${method}?`)) return;
        setProcessing(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/transactions/${transactionId}/pay`,
                { payment_method: method },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Payment Successful!");
            fetchData(); // Refresh list
        } catch (error) {
            console.error("Payment failed", error);
            alert("Payment failed");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="p-4 md:p-6 h-screen flex flex-col bg-slate-50 overflow-hidden">
            {/* Header */}
            <header className="mb-4 md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                        Cashier & Billing
                    </h1>
                    <p className="text-sm md:text-base text-slate-500">Manage invoices and payments</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <button
                        onClick={() => { setActiveTab('unbilled'); setSelectedItem(null); }}
                        className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === 'unbilled' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                    >
                        Unbilled (Queue)
                    </button>
                    <button
                        onClick={() => { setActiveTab('unpaid'); setSelectedItem(null); }}
                        className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === 'unpaid' ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                    >
                        Unpaid (Invoice)
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-hidden relative">

                {/* List Panel - Hidden on Mobile if Item Selected */}
                <div className={`${selectedItem ? 'hidden lg:flex' : 'flex'} w-full lg:w-1/3 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex-col overflow-hidden border border-slate-100 transition-all`}>
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 backdrop-blur-sm">
                        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                            {activeTab === 'unbilled' ? <Clock /> : <DollarSign />}
                            {activeTab === 'unbilled' ? 'Ready for Billing' : 'Pending Payment'}
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 scroller-hide">
                        {loading && <div className="text-center p-4 text-slate-400">Loading...</div>}
                        {!loading && items.length === 0 && (
                            <div className="text-center p-8 text-slate-400 flex flex-col items-center">
                                <CheckCircle className="text-4xl mb-2 opacity-50" />
                                <p>No items found</p>
                            </div>
                        )}
                        {items.map(item => {
                            const patientName = activeTab === 'unbilled' ? item.patient?.name : item.patient?.name;
                            const id = item.id;
                            const date = activeTab === 'unbilled' ? item.created_at : item.created_at;

                            return (
                                <motion.div
                                    key={id}
                                    layoutId={id}
                                    onClick={() => setSelectedItem(item)}
                                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedItem?.id === id ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-sm' : 'bg-white border-transparent hover:bg-slate-50'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-slate-800 line-clamp-1">{patientName}</h3>
                                        <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                                            {new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-500 flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {activeTab === 'unbilled' ? item.doctor?.name : item.invoice_no}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>

                {/* Detail/Action Panel - Full screen on Mobile if Selected */}
                <div className={`${!selectedItem ? 'hidden lg:flex' : 'flex'} w-full lg:flex-1 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex-col border border-slate-100 relative overflow-hidden transition-all`}>
                    {selectedItem ? (
                        <div className="flex flex-col h-full">
                            {/* Mobile Back Button */}
                            <div className="lg:hidden p-4 border-b border-slate-100">
                                <button onClick={() => setSelectedItem(null)} className="text-slate-500 font-bold flex items-center gap-2">
                                    ← Back to List
                                </button>
                            </div>

                            {/* Detail Header */}
                            <div className="p-4 md:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                                            {activeTab === 'unbilled' ? selectedItem.patient?.name : `Invoice Details`}
                                        </h2>
                                        <p className="text-slate-500 flex items-center gap-2 mt-1 text-sm md:text-base">
                                            <FileText />
                                            {activeTab === 'unbilled' ? `Visit Date: ${new Date(selectedItem.visit_date).toLocaleDateString()}` : selectedItem.invoice_no}
                                        </p>
                                    </div>
                                    {activeTab === 'unpaid' && (
                                        <div className="text-left md:text-right w-full md:w-auto bg-emerald-50 md:bg-transparent p-3 md:p-0 rounded-xl">
                                            <p className="text-sm text-slate-500">Total Amount</p>
                                            <p className="text-2xl md:text-3xl font-bold text-emerald-600">
                                                Rp {selectedItem.total_amount?.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content area */}
                            <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                                {activeTab === 'unbilled' ? (
                                    <div className="space-y-6">
                                        <div className="bg-amber-50 rounded-2xl p-4 md:p-6 border border-amber-100">
                                            <h3 className="font-bold text-amber-800 mb-2">Visit Summary</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="block text-amber-600/70">Doctor</span>
                                                    <span className="font-medium text-amber-900">{selectedItem.doctor?.name}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-amber-600/70">Specialist</span>
                                                    <span className="font-medium text-amber-900">{selectedItem.doctor?.specialist}</span>
                                                </div>
                                                <div className="col-span-1 md:col-span-2">
                                                    <span className="block text-amber-600/70">Diagnosis</span>
                                                    <span className="font-medium text-amber-900">{selectedItem.assessment || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-center mt-8 pb-8 md:pb-0">
                                            <button
                                                disabled={processing}
                                                onClick={() => handleCreateInvoice(selectedItem.id)}
                                                className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                {processing ? 'Processing...' : 'Generate Invoice'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Invoice Items */}
                                        <div className="border rounded-2xl overflow-hidden overflow-x-auto">
                                            <table className="w-full text-left text-sm min-w-[300px]">
                                                <thead className="bg-slate-50 border-b">
                                                    <tr>
                                                        <th className="p-3 md:p-4 font-semibold text-slate-600">Description</th>
                                                        <th className="p-3 md:p-4 font-semibold text-slate-600 text-right">Qty</th>
                                                        <th className="p-3 md:p-4 font-semibold text-slate-600 text-right">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {selectedItem.items?.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td className="p-3 md:p-4 text-slate-700">{item.description}</td>
                                                            <td className="p-3 md:p-4 text-slate-600 text-right">{item.quantity}</td>
                                                            <td className="p-3 md:p-4 text-slate-800 font-medium text-right">
                                                                Rp {item.amount.toLocaleString('id-ID')}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot className="bg-slate-50 font-bold">
                                                    <tr>
                                                        <td colSpan="2" className="p-3 md:p-4 text-right text-slate-600">Total</td>
                                                        <td className="p-3 md:p-4 text-right text-emerald-600 text-lg">
                                                            Rp {selectedItem.total_amount?.toLocaleString('id-ID')}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>

                                        {/* Payment Actions */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pb-8 md:pb-0">
                                            <button
                                                onClick={() => handlePay(selectedItem.id, 'CASH')}
                                                disabled={processing}
                                                className="h-16 md:h-20 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-green-200 flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="text-xl md:text-2xl" />
                                                    PAY CASH
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => handlePay(selectedItem.id, 'QRIS')}
                                                disabled={processing}
                                                className="h-16 md:h-20 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="text-xl md:text-2xl" />
                                                    PAY QRIS
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-8 text-center">
                            <FileText className="text-6xl mb-4" />
                            <p className="text-lg">Select an item to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CashierDashboard;
