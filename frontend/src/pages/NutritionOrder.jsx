import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Search, ChefHat, PlusCircle, CheckCircle } from 'lucide-react';
import api from '../utils/axiosConfig';
import toast, { Toaster } from 'react-hot-toast';
import PageLoader from '../components/PageLoader';
import PageWrapper from '../components/PageWrapper';
import ModernHeader from '../components/ModernHeader';
import { useNavigate } from 'react-router-dom';

const NutritionOrder = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Order Form
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [mealTime, setMealTime] = useState(''); // BREAKFAST, LUNCH, DINNER
    const [extras, setExtras] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [patRes, menuRes] = await Promise.all([
                api.get('/nurse/active-inpatients'),
                api.get('/nutrition/menus')
            ]);
            setPatients(patRes.data);
            setMenus(menuRes.data.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedPatient || !selectedMenu || !mealTime) {
            toast.error('Please complete all fields');
            return;
        }

        try {
            await api.post('/nutrition/order', {
                admissionId: selectedPatient.id,
                dietMenuId: selectedMenu.id,
                mealTime,
                extras
            });
            toast.success('Order Placed Successfully!');
            setSelectedPatient(null);
            setSelectedMenu(null);
            setExtras('');
            setMealTime('');
        } catch (error) {
            toast.error('Order Failed');
        }
    };

    // Filter patients
    const filteredPatients = patients.filter(p =>
        p.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.bed?.room?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <PageLoader />;

    return (
        <PageWrapper title="Diet Order">
            <Toaster position="top-right" />
            <ModernHeader
                title="Diet & Nutrition Order"
                subtitle="Nurse Station - Patient Meal Request"
                onBack={() => navigate('/nurse')}
            />

            <div className="flex flex-col lg:flex-row gap-6 p-6 h-[calc(100vh-140px)]">

                {/* LEFT: Patient Selection */}
                <div className="w-full lg:w-1/3 flex flex-col gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search Patient / Room..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {filteredPatients.map(adm => (
                            <motion.div
                                key={adm.id}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setSelectedPatient(adm)}
                                className={`p-4 rounded-xl cursor-pointer border transition-all
                                    ${selectedPatient?.id === adm.id
                                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30'
                                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-emerald-300'}`}
                            >
                                <div className="font-bold">{adm.patient.name}</div>
                                <div className={`text-xs mt-1 ${selectedPatient?.id === adm.id ? 'text-emerald-100' : 'text-gray-500'}`}>
                                    RM: {adm.patient.no_rm} • Room: {adm.bed?.room?.name || '?'} ({adm.bed?.code})
                                </div>
                                <div className={`mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                    ${selectedPatient?.id === adm.id ? 'bg-white/20' : 'bg-blue-100 text-blue-700'}`}>
                                    {adm.diagnosa_masuk || 'No Diagnosis'}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Order Form */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center relative overflow-hidden">
                    {!selectedPatient ? (
                        <div className="text-center text-gray-400">
                            <Utensils size={64} className="mx-auto mb-4 opacity-20" />
                            <h2 className="text-xl font-bold">Select a Patient to Order</h2>
                            <p>Choose from the list on the left to start</p>
                        </div>
                    ) : (
                        <div className="max-w-2xl mx-auto w-full space-y-8 relative z-10">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">New Meal Order</h2>
                                <p className="text-gray-500">For <span className="font-bold text-emerald-600">{selectedPatient.patient.name}</span> (Room {selectedPatient.bed?.room?.name})</p>
                            </div>

                            {/* Meal Time Selection */}
                            <div className="grid grid-cols-3 gap-4">
                                {['BREAKFAST', 'LUNCH', 'DINNER'].map(time => (
                                    <button
                                        key={time}
                                        onClick={() => setMealTime(time)}
                                        className={`p-4 rounded-xl border-2 font-bold transition-all
                                            ${mealTime === time
                                                ? 'border-orange-500 bg-orange-50 text-orange-600'
                                                : 'border-gray-100 dark:border-gray-700 hover:border-orange-200'}`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>

                            {/* Menu Selection */}
                            <div className="space-y-3">
                                <label className="font-bold text-gray-700 dark:text-gray-300">Diet Type / Menu</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {menus.map(menu => (
                                        <div
                                            key={menu.id}
                                            onClick={() => setSelectedMenu(menu)}
                                            className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center transition-all
                                                ${selectedMenu?.id === menu.id
                                                    ? 'bg-emerald-50 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                                                    : 'bg-gray-50 dark:bg-gray-700 border-transparent hover:bg-white hover:border-emerald-200'}`}
                                        >
                                            <span className="font-bold">{menu.name}</span>
                                            {menu.type && <span className="text-xs bg-gray-200 px-2 py-1 rounded">{menu.type}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Extras */}
                            <div>
                                <label className="font-bold text-gray-700 dark:text-gray-300">Special Notes / Allergies</label>
                                <textarea
                                    className="w-full mt-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                                    rows="3"
                                    placeholder="e.g. No Seafood, Extra Soft, Low Sugar..."
                                    value={extras}
                                    onChange={e => setExtras(e.target.value)}
                                />
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={!selectedMenu || !mealTime}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 text-lg transition-all active:scale-95"
                            >
                                <ChefHat size={24} />
                                Send Order to Kitchen
                            </button>

                        </div>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
};

export default NutritionOrder;
