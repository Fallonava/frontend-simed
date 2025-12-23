import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconBell, IconX, IconCheck, IconUser } from '@tabler/icons-react';

const NotificationToast = ({ notification, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="w-full max-w-sm pointer-events-auto"
        >
            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/60 p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
                {/* Glow Effect */}
                <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl" />

                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                        <IconUser size={22} stroke={2} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">
                            Pasien Baru Tiba
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            <span className="font-bold text-blue-600 dark:text-blue-400">{notification.patient_name}</span> has checked in for booking <span className="font-mono">{notification.booking_code}</span>.
                        </p>
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={() => window.location.href = '/registration-rj'}
                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 transition-colors"
                            >
                                Proses Admisi
                            </button>
                            <button
                                onClick={onClose}
                                className="rounded-lg border border-slate-200 bg-white/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-white transition-colors dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                            >
                                Nanti Saja
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5 dark:hover:text-white transition-colors"
                    >
                        <IconX size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export const NotificationContainer = ({ notifications, removeNotification }) => {
    return (
        <div
            aria-live="assertive"
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[9999] flex flex-col items-center gap-3 p-6 sm:items-end"
        >
            <AnimatePresence>
                {notifications.map((notif) => (
                    <NotificationToast
                        key={notif.id}
                        notification={notif}
                        onClose={() => removeNotification(notif.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default NotificationToast;
