import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';

const TicketModal = ({ ticket, onClose }) => {
    if (!ticket) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 relative">

                {/* Decorative header */}
                <div className="bg-[#0071E3] h-32 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
                    <div className="w-64 h-64 bg-white/10 rounded-full absolute -top-32 -right-16 blur-2xl"></div>
                    <div className="w-64 h-64 bg-white/10 rounded-full absolute -bottom-32 -left-16 blur-2xl"></div>

                    <div className="text-center text-white relative z-10">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold">Ticket Confirmed</h2>
                    </div>

                    <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-black/10 hover:bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-8 text-center -mt-6 relative z-20">
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
                        <div className="mb-2 text-gray-400 text-xs font-bold uppercase tracking-widest">Queue Number</div>
                        <div className="text-6xl font-black text-[#1D1D1F] tracking-tighter mb-2">
                            {ticket.queue_code}
                        </div>
                        <div className="text-gray-400 text-sm font-medium">
                            {new Date(ticket.created_at).toLocaleDateString()} • {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>

                    <div className="space-y-4 text-left">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase">Doctor</p>
                                <p className="font-bold text-[#1D1D1F]">{ticket.doctor_name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 font-semibold uppercase">Poli</p>
                                <p className="font-bold text-[#1D1D1F]">{ticket.poli_name}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-2xl text-center">
                            <p className="text-blue-600 text-sm font-medium">Please wait in the waiting area until your number is called.</p>
                        </div>
                    </div>

                    <button
                        onClick={() => window.print()}
                        className="mt-8 w-full bg-[#1D1D1F] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-gray-200"
                    >
                        <Printer className="w-5 h-5" />
                        <span>Print Ticket</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketModal;
