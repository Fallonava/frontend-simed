import React from 'react';
import { X, Printer, CheckCircle2, QrCode } from 'lucide-react';

const TicketModal = ({ ticket, onClose }) => {
    React.useEffect(() => {
        if (ticket) {
            const timer = setTimeout(() => {
                window.print();
                // Close modal after print dialog is closed (code execution resumes)
                onClose();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [ticket, onClose]);

    if (!ticket) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-6 invisible pointer-events-none">
            {/* Print Styles */}
            <style>
                {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-ticket, #printable-ticket * {
                        visibility: visible;
                    }
                    #printable-ticket {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: auto;
                        margin: 0;
                        padding: 20px;
                        background: white !important;
                        color: black !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                    }
                    /* Hide specific screen-only decorations */
                    .screen-only {
                        display: none !important;
                    }
                    /* Ensure print-only elements are shown */
                    .print-only {
                        display: block !important;
                    }
                }
                .print-only {
                    display: none;
                }
                `}
            </style>

            <div className="bg-modern-bg rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 relative flex flex-col border border-white/10">

                {/* Header */}
                <div className="bg-modern-card p-6 border-b border-white/5 flex justify-between items-center screen-only">
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
                    <div id="printable-ticket" className="bg-white w-full rounded-3xl shadow-lg overflow-hidden relative">
                        {/* Cutout effect - Screen Only */}
                        <div className="absolute top-1/2 -left-3 w-6 h-6 bg-modern-bg rounded-full screen-only"></div>
                        <div className="absolute top-1/2 -right-3 w-6 h-6 bg-modern-bg rounded-full screen-only"></div>
                        <div className="absolute top-1/2 left-4 right-4 border-t-2 border-dashed border-gray-300 screen-only"></div>

                        {/* Top Section */}
                        <div className="p-8 text-center bg-gradient-to-b from-white to-gray-50 print:bg-none print:p-0">
                            {/* Print Only Header */}
                            <div className="print-only mb-6 text-center border-b-2 border-black pb-4">
                                <h2 className="text-2xl font-black uppercase tracking-tight">RS GENERAL HOSPITAL</h2>
                                <p className="text-sm font-medium uppercase tracking-widest mt-1">Sistem Antrian Terpadu</p>
                            </div>

                            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 print:text-black">NOMOR ANTRIAN</p>
                            <h1 className="text-8xl font-black text-black tracking-tighter mb-2 print:text-9xl">{ticket.queue_code}</h1>
                            <p className="text-sm font-medium text-gray-500 print:text-black">
                                {new Date(ticket.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                <br className="print-only" />
                                <span className="screen-only"> {' • '} </span>
                                {new Date(ticket.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                            </p>
                        </div>

                        {/* Bottom Section */}
                        <div className="p-8 bg-white print:p-0 print:mt-4">
                            <div className="space-y-4 border-t-2 border-dashed border-gray-100 pt-6 print:border-black print:pt-4">
                                <div className="flex justify-between items-center print:flex-col print:items-start print:mb-4">
                                    <span className="text-sm text-gray-500 font-medium print:text-black print:text-sm print:uppercase print:font-bold print:mb-1">Dokter</span>
                                    <span className="text-lg font-bold text-gray-900 print:text-black print:text-3xl print:leading-tight">{ticket.doctor_name || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center print:flex-col print:items-start">
                                    <span className="text-sm text-gray-500 font-medium print:text-black print:text-sm print:uppercase print:font-bold print:mb-1">Poli</span>
                                    <span className="text-lg font-bold text-gray-900 print:text-black print:text-2xl">{ticket.poli_name || ticket.service_name || '-'}</span>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-center screen-only">
                                <div className="bg-modern-bg p-2 rounded-xl">
                                    <QrCode className="w-16 h-16 text-white opacity-90" />
                                </div>
                            </div>
                            <p className="text-center text-[10px] text-gray-400 mt-2 screen-only">Scan untuk cek status antrian</p>

                            {/* Print Footer */}
                            <div className="print-only mt-10 text-center border-t-2 border-black pt-4">
                                <p className="text-xs font-bold uppercase">Terima Kasih</p>
                                <p className="text-[10px] mt-1">Silakan menunggu panggilan</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 bg-modern-card border-t border-white/5 screen-only">
                    <button
                        onClick={() => window.print()}
                        className="w-full bg-modern-text text-modern-bg hover:bg-white hover:text-modern-text py-4 rounded-2xl font-bold text-lg shadow-lg shadow-modern-blue/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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
