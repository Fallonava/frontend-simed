import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ChevronRight, User, RefreshCcw, Activity, CheckCircle, CreditCard, MapPin } from 'lucide-react';

const PatientSearchSidebar = ({
    mode = 'RJ', // 'RJ' | 'IGD' | 'RANAP'
    searchTerm,
    onSearchChange,
    onSearchSubmit,
    searchResults = [],
    patientFound,
    onSelectPatient,
    onClearPatient,
    // Recent / Online Lists
    recentPatients = [],
    onlineBookings = [],
    onCheckInOnline,
    // Actions
    onReset,
    onNewPatientClick,
    onPrintCardClick
}) => {
    const [filter, setFilter] = useState(mode === 'RJ' ? 'online' : 'all');

    return (
        <div className="w-full lg:w-[22%] flex flex-col gap-6 h-full">
            {/* Actions Header */}
            <div className="flex flex-col gap-4">
                <button
                    onClick={onReset}
                    className="w-full bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 hover:shadow-sm border border-gray-200 dark:border-gray-700 transition-all rounded-xl px-4 py-3 text-xs font-bold text-gray-400 flex items-center justify-center gap-2"
                >
                    <RefreshCcw size={14} /> Reset Form
                </button>
            </div>

            {/* Search Input */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-4 rounded-[24px] shadow-lg border border-white/20 relative group transition-all focus-within:ring-4 focus-within:ring-blue-500/20">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Search Name / NIK / RM..."
                    className="w-full pl-10 pr-3 py-3 bg-transparent border-none focus:ring-0 text-gray-800 dark:text-white font-bold text-lg placeholder-gray-400/70"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
                />
                <button
                    onClick={onSearchSubmit}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black dark:bg-white text-white dark:text-black p-2 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md"
                >
                    <ChevronRight size={16} strokeWidth={3} />
                </button>
            </div>

            {/* New Patient Button */}
            <button
                onClick={onNewPatientClick}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold text-sm shadow-lg shadow-gray-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                <Plus size={18} /> Register New Patient
            </button>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                {patientFound ? (
                    <div className="p-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center px-1 mb-3">
                            <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle size={14} /> Selected Patient
                            </p>
                            <button onClick={onClearPatient} className="text-[10px] text-red-500 font-bold hover:underline">Clear Selection</button>
                        </div>
                        <PatientCard
                            patient={patientFound}
                            isExpanded={true}
                            onClick={() => { }} // Already selected/expanded
                            onCancel={onClearPatient}
                            onPrint={(e) => { e.stopPropagation(); onPrintCardClick && onPrintCardClick(patientFound); }}
                        />
                    </div>
                ) : searchResults.length > 0 ? (
                    <div className="space-y-3 p-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center px-1">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{searchResults.length} Patients Found</p>
                            <button onClick={() => { onSearchChange(''); onClearPatient(); }} className="text-[10px] text-red-500 font-bold hover:underline">Clear Search</button>
                        </div>
                        {searchResults.map((patient) => {
                            const isExpanded = patientFound?.id === patient.id;
                            return (
                                <PatientCard
                                    key={patient.id}
                                    patient={patient}
                                    isExpanded={isExpanded}
                                    onClick={() => !isExpanded && onSelectPatient(patient)}
                                    onCancel={(e) => { e.stopPropagation(); onClearPatient(); }}
                                    onPrint={(e) => { e.stopPropagation(); onPrintCardClick && onPrintCardClick(patient); }}
                                />
                            );
                        })}
                    </div>
                ) : (
                    searchTerm ? (
                        <div className="bg-white/40 dark:bg-gray-800/40 border-2 border-dashed border-gray-300/50 dark:border-gray-700/50 rounded-[24px] p-6 text-center flex flex-col items-center justify-center gap-4 min-h-[300px] hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors group">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform duration-300">
                                <User size={28} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300">Patient Not Found</h3>
                                <p className="text-xs text-gray-400 mt-1 max-w-[150px] mx-auto">"{searchTerm}" did not match any records.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            {/* Filter Tabs */}
                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Activity size={14} className="text-blue-500" />
                                    {mode === 'RJ' && filter === 'online' ? 'Online Queue' : 'Recent Patients'}
                                </h3>
                                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
                                    {(mode === 'RJ' ? ['online', 'recent'] : ['all', 'today']).map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Lists */}
                            <div className="space-y-3">
                                {filter === 'online' && mode === 'RJ' ? (
                                    <OnlineBookingList bookings={onlineBookings} onCheckIn={onCheckInOnline} />
                                ) : (
                                    <RecentPatientList
                                        patients={recentPatients}
                                        filter={filter}
                                        onSelect={onSelectPatient}
                                    />
                                )}
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

// Sub-components for better performance organization

const PatientCard = memo(({ patient, isExpanded, onClick, onCancel, onPrint }) => (
    <motion.div
        layout
        onClick={onClick}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ layout: { duration: 0.3, type: 'spring', stiffness: 300, damping: 30 } }}
        className={`rounded-[24px] overflow-hidden cursor-pointer relative transition-all duration-300
            ${isExpanded
                ? 'bg-white dark:bg-gray-800 ring-2 ring-inset ring-blue-500 shadow-2xl shadow-blue-500/20 z-10 scale-[1.01]'
                : 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/20 shadow-sm hover:bg-white/80 dark:hover:bg-gray-700/80 hover:shadow-lg hover:scale-[1.005]'
            }
        `}
    >
        <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-5">
                <motion.div
                    layout="position"
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm transition-colors ${isExpanded ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}
                >
                    {patient.name?.charAt(0)}
                </motion.div>
                <div className="flex flex-col">
                    <motion.h3 layout="position" className="font-bold text-base leading-tight text-gray-900 dark:text-white">
                        {patient.name}
                    </motion.h3>
                    <motion.div layout="position" className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                            RM: {patient.no_rm}
                        </span>
                    </motion.div>
                </div>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-blue-50 text-blue-500 rotate-90' : 'text-gray-300'}`}>
                <ChevronRight size={18} />
            </div>
        </div>

        <AnimatePresence>
            {isExpanded && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                    <div className="px-5 pb-5 pt-0">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-4 bg-gray-50/80 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700/50 space-y-3"
                        >
                            <InfoRow icon={<CreditCard size={14} />} label="NIK Identity" value={patient.nik} />
                            <div className="w-full h-px bg-gray-100 dark:bg-gray-600/50"></div>
                            <InfoRow icon={<MapPin size={14} />} label="Resident Address" value={patient.address || '-'} />
                        </motion.div>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                onClick={onCancel}
                                className="py-3.5 rounded-2xl text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel Selection
                            </motion.button>
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                onClick={onPrint}
                                className="py-3.5 rounded-2xl text-xs font-bold text-white bg-black dark:bg-white dark:text-black shadow-lg shadow-gray-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <CreditCard size={16} /> Print ID Card
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
));

const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-600 flex items-center justify-center shadow-sm text-gray-400">
            {icon}
        </div>
        <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-tight">{value}</p>
        </div>
    </div>
);

const OnlineBookingList = ({ bookings, onCheckIn }) => (
    bookings.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-xs italic border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
            No online bookings waiting
        </div>
    ) : (
        bookings.map(booking => (
            <div
                key={booking.id}
                className="group bg-blue-50/50 dark:bg-blue-900/10 backdrop-blur-md p-4 rounded-[20px] border border-blue-100 dark:border-blue-800 shadow-sm hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-2">
                    <div className="text-[10px] font-bold text-blue-500 bg-white dark:bg-gray-700 px-2 py-1 rounded-full shadow-sm">
                        {booking.queue_code}
                    </div>
                </div>
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-blue-500/30">
                        {booking.patient?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{booking.patient?.name || 'Pasien Tanpa Nama'}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                            <span className="font-mono bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-600">{booking.booking_code}</span>
                            <span className="truncate">{booking.daily_quota?.doctor?.poliklinik?.name || 'Poli?'}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onCheckIn(booking); }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                    <CheckCircle size={14} /> Confirm Arrival (Check-in)
                </button>
            </div>
        ))
    )
);

const RecentPatientList = ({ patients, filter, onSelect }) => (
    patients.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-xs italic border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
            No recently viewed patients
        </div>
    ) : (
        patients
            .filter(p => filter === 'today' ? new Date(p.updatedAt).toDateString() === new Date().toDateString() : true)
            .slice(0, 5)
            .map(patient => (
                <div
                    key={patient.id}
                    onClick={() => onSelect(patient)}
                    className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-4 rounded-[20px] border border-white/20 shadow-sm hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all duration-300 flex items-center gap-4"
                >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        {patient.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{patient.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                            <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">RM: {patient.no_rm}</span>
                            <span className="truncate max-w-[120px]">{patient.address}</span>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
            ))
    )
);

export default memo(PatientSearchSidebar);
