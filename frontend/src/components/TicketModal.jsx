import React from 'react';
import { X, Printer, CheckCircle2, QrCode } from 'lucide-react';

const TicketModal = ({ ticket, onClose }) => {
    if (!ticket) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
            <div className="bg-[#F5F5F7] rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 relative flex flex-col">

                {/* Header */}
                <div className="bg-white p-6 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-gray-900">Berhasil Terdaftar</span>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                        <X className="w-4 h-4 text-gray-600" />
                    </button>
                </div>

                {/* Ticket Body */}
                <div className="p-8 flex-1 flex flex-col items-center">
                    <div className="bg-white w-full rounded-3xl shadow-sm border border-gray-200 overflow-hidden relative">
                        {/* Cutout effect */}
                        <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#F5F5F7] rounded-full"></div>
                        <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#F5F5F7] rounded-full"></div>
                        <div className="absolute top-1/2 left-4 right-4 border-t-2 border-dashed border-gray-100"></div>

                        {/* Top Section */}
                        <div className="p-8 text-center bg-gradient-to-b from-white to-gray-50/50">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">NOMOR ANTRIAN</p>
                            <h1 className="text-7xl font-black text-[#1D1D1F] tracking-tighter mb-1">{ticket.queue_code}</h1>
                            <p className="text-sm font-medium text-gray-500">
                                {new Date(ticket.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                {' • '}
                                {new Date(ticket.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>

                        {/* Bottom Section */}
                        <div className="p-8 bg-white">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 font-medium">Dokter</span>
                                    <span className="text-sm font-bold text-gray-900">{ticket.doctor_name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 font-medium">Poli</span>
                                    <span className="text-sm font-bold text-gray-900">{ticket.poli_name}</span>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-center">
                                <div className="bg-gray-900 p-2 rounded-xl">
                                    <QrCode className="w-16 h-16 text-white opacity-90" />
                                </div>
                            </div>
                            <p className="text-center text-[10px] text-gray-400 mt-2">Scan untuk cek status antrian</p>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 bg-white border-t border-gray-200">
                    <button
                        onClick={() => window.print()}
                        className="w-full bg-[#0071E3] hover:bg-[#0077ED] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <Printer className="w-5 h-5" />
                        Cetak Tiket
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketModal;
