import React from 'react';
import { X, Printer, CheckCircle2, QrCode } from 'lucide-react';

const TicketModal = ({ ticket, onClose }) => {
    if (!ticket) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
            <div className="bg-modern-bg rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 relative flex flex-col border border-white/10">

                {/* Header */}
                <div className="bg-modern-card p-6 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-modern-green rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,230,118,0.5)]">
                            <CheckCircle2 className="w-5 h-5 text-modern-bg" />
                        </div>
                        <span className="font-bold text-modern-text">Berhasil Terdaftar</span>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors">
                        <X className="w-4 h-4 text-modern-text-secondary" />
                    </button>
                </div>

                {/* Ticket Body */}
                <div className="p-8 flex-1 flex flex-col items-center">
                    <div className="bg-white w-full rounded-3xl shadow-lg overflow-hidden relative">
                        {/* Cutout effect */}
                        <div className="absolute top-1/2 -left-3 w-6 h-6 bg-modern-bg rounded-full"></div>
                        <div className="absolute top-1/2 -right-3 w-6 h-6 bg-modern-bg rounded-full"></div>
                        <div className="absolute top-1/2 left-4 right-4 border-t-2 border-dashed border-gray-300"></div>

                        {/* Top Section */}
                        <div className="p-8 text-center bg-gradient-to-b from-white to-gray-50">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">NOMOR ANTRIAN</p>
                            <h1 className="text-7xl font-black text-modern-bg tracking-tighter mb-1">{ticket.queue_code}</h1>
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
                                <div className="bg-modern-bg p-2 rounded-xl">
                                    <QrCode className="w-16 h-16 text-white opacity-90" />
                                </div>
                            </div>
                            <p className="text-center text-[10px] text-gray-400 mt-2">Scan untuk cek status antrian</p>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 bg-modern-card border-t border-white/5">
                    <button
                        onClick={() => window.print()}
                        className="w-full bg-modern-text text-modern-bg hover:bg-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-modern-blue/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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
