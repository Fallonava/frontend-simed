import React, { useRef } from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { QRCodeSVG } from 'qrcode.react';

const TicketModal = ({ ticket, onClose }) => {
    const componentRef = useRef();

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Ticket-${ticket.queue_code}`,
        onAfterPrint: () => onClose(),
    });

    React.useEffect(() => {
        if (ticket) {
            // Optional: Auto-print after small delay
            // const timer = setTimeout(() => {
            //     handlePrint();
            // }, 500);
            // return () => clearTimeout(timer);
        }
    }, [ticket]);

    if (!ticket) return null;

    const statusUrl = `${window.location.origin}/queue-status/${ticket.id}`;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-6 bg-black/50 backdrop-blur-sm">
            {/* Print Styles for Thermal Printer (58mm/80mm) */}
            <style>
                {`
                @media print {
                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }
                    body {
                        margin: 0.5cm;
                    }
                }
                `}
            </style>

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

                {/* Ticket Body (Visible & Printable) */}
                <div className="p-8 flex-1 flex flex-col items-center bg-gray-50">
                    <div ref={componentRef} className="bg-white w-full rounded-2xl shadow-sm overflow-hidden relative print:shadow-none print:w-full print:rounded-none">

                        {/* Thermal Print Header */}
                        <div className="text-center p-6 pb-4 border-b-2 border-dashed border-gray-100 print:p-2 print:pb-2 print:border-black">
                            <div className="hidden print:block mb-2 text-center">
                                <h2 className="text-xl font-bold uppercase leading-none">RS Fallonava</h2>
                                <p className="text-[10px] mt-1">Sistem Antrian Terpadu</p>
                            </div>

                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 print:text-black">NOMOR ANTRIAN</p>
                            <h1 className="text-6xl font-black text-black tracking-tighter mb-2 print:text-5xl">{ticket.queue_code}</h1>
                            <p className="text-xs font-medium text-gray-500 print:text-black">
                                {new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                <span className="mx-1">•</span>
                                {new Date(ticket.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>

                        {/* Details */}
                        <div className="p-6 pt-4 space-y-3 print:p-2 print:space-y-2">
                            <div className="flex justify-between items-center border-b border-gray-50 pb-2 print:border-none print:pb-0">
                                <span className="text-xs text-gray-500 font-medium uppercase print:text-black">Dokter</span>
                                <span className="text-sm font-bold text-gray-900 print:text-black text-right max-w-[150px] leading-tight">{ticket.doctor_name || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-2 print:border-none print:pb-0">
                                <span className="text-xs text-gray-500 font-medium uppercase print:text-black">Poli</span>
                                <span className="text-sm font-bold text-gray-900 print:text-black">{ticket.poli_name || '-'}</span>
                            </div>

                            {/* QR Code Section */}
                            <div className="mt-6 flex flex-col items-center gap-2 print:mt-4">
                                <div className="bg-white p-2 rounded-lg border border-gray-100 print:border-none">
                                    <QRCodeSVG value={statusUrl} size={100} level="M" />
                                </div>
                                <p className="text-[10px] text-gray-400 text-center max-w-[200px] leading-tight print:text-black">
                                    Scan untuk memantau antrian<br />secara Realtime via HP
                                </p>
                            </div>
                        </div>

                        {/* Thermal Print Footer */}
                        <div className="hidden print:block text-center mt-4 pt-2 border-t border-black text-[10px]">
                            <p>Terima Kasih</p>
                            <p>Mohon menunggu panggilan</p>
                            <p className="mt-2 text-[8px]">{ticket.id}</p>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 bg-modern-card border-t border-white/5">
                    <button
                        onClick={handlePrint}
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
