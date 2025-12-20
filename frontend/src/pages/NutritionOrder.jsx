import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Search, ChefHat, PlusCircle, CheckCircle, Soup, Coffee, Heart } from 'lucide-react';
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

    const [activeCategory, setActiveCategory] = useState('ALL');

    if (loading) return <PageLoader />;


    const getMenuIcon = (type) => {
        switch (type) {
            case 'SOFT': return <Soup size={32} />;
            case 'LIQUID': return <Coffee size={32} />;
            case 'DIET': return <Heart size={32} />;
            default: return <Utensils size={32} />;
        }
    };

    const getMenuColor = (type) => {
        switch (type) {
            case 'SOFT': return 'bg-orange-100 text-orange-600';
            case 'LIQUID': return 'bg-blue-100 text-blue-600';
            case 'DIET': return 'bg-purple-100 text-purple-600';
            default: return 'bg-emerald-100 text-emerald-600';
        }
    };

    return (
        <PageWrapper title="Diet Order">
            <Toaster position="top-center" toastOptions={{
                style: {
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }
            }} />

            {/* Background Blob */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-[100px] mix-blend-multiply" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-orange-400/10 rounded-full blur-[100px] mix-blend-multiply" />
            </div>

            <div className="relative z-10 p-6 h-[calc(100vh-20px)] flex flex-col">
                <ModernHeader
                    title="Pemesanan Gizi"
                    subtitle="Patient Meal & Diet Ordering"
                    onBack={() => navigate('/nurse')}
                />

                <div className="flex flex-col lg:flex-row gap-8 h-full overflow-hidden mt-6">

                    {/* LEFT: Patient Selection */}
                    <div className="w-full lg:w-[350px] flex flex-col gap-4 h-full">
                        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-4 rounded-3xl border border-white/40 dark:border-gray-700 shadow-sm relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search Patient..."
                                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-900/50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-20">
                            {filteredPatients.map(adm => (
                                <motion.div
                                    key={adm.id}
                                    layoutId={adm.id}
                                    onClick={() => setSelectedPatient(adm)}
                                    className={`p-5 rounded-[24px] cursor-pointer border-2 transition-all relative overflow-hidden group
                                        ${selectedPatient?.id === adm.id
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-500/30'
                                            : 'bg-white/70 dark:bg-gray-800/70 border-white/50 dark:border-gray-700 hover:border-emerald-300 hover:bg-white'}`}
                                >
                                    <div className="relative z-10 flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight">{adm.patient.name}</h3>
                                            <p className={`text-xs mt-1 font-medium ${selectedPatient?.id === adm.id ? 'text-emerald-100' : 'text-gray-500'}`}>
                                                {adm.bed?.room?.name} • Bed {adm.bed?.code}
                                            </p>
                                        </div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                                            ${selectedPatient?.id === adm.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            {adm.patient.gender}
                                        </div>
                                    </div>

                                    {/* Diagnosis Tag */}
                                    <div className={`mt-3 inline-block px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide
                                        ${selectedPatient?.id === adm.id ? 'bg-black/20 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                                        {adm.diagnosa_masuk || 'Rawat Inap'}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Order Area */}
                    <div className="flex-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl rounded-[40px] border border-white/40 dark:border-gray-700 shadow-xl overflow-hidden relative flex flex-col">

                        {!selectedPatient ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-60">
                                <div className="w-40 h-40 bg-gray-100/50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <ChefHat size={80} className="text-gray-300" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Ready to Order?</h2>
                                <p className="text-gray-500 mt-2 max-w-md">Select a patient from the sidebar to view their dietary requirements and place a meal order.</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col h-full overflow-hidden">
                                {/* Header Info */}
                                <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-900/20 backdrop-blur-md">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Ordering For</p>
                                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedPatient.patient.name}</h1>
                                            <p className="text-emerald-600 font-medium">Dietary Restriction: {selectedPatient.notes || 'None'}</p>
                                        </div>

                                        {/* Meal Time Selector */}
                                        <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
                                            {['BREAKFAST', 'LUNCH', 'DINNER'].map(time => (
                                                <button
                                                    key={time}
                                                    onClick={() => setMealTime(time)}
                                                    className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${mealTime === time
                                                        ? 'bg-white shadow-sm text-emerald-600 scale-100'
                                                        : 'text-gray-500 hover:text-emerald-600'}`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Category Filter */}
                                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
                                    {['ALL', 'REGULAR', 'SOFT', 'DIET', 'LIQUID'].map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap
                                                    ${activeCategory === cat
                                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md transform scale-105'
                                                    : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-100 dark:border-gray-700'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                {/* Menu Grid */}
                                <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Select Menu</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {menus
                                            .filter(m => activeCategory === 'ALL' || m.type === activeCategory)
                                            .map(menu => (
                                                <motion.div
                                                    key={menu.id}
                                                    whileHover={{ y: -4 }}
                                                    onClick={() => setSelectedMenu(menu)}
                                                    className={`p-6 rounded-[24px] border-2 cursor-pointer transition-all relative overflow-hidden group
                                                    ${selectedMenu?.id === menu.id
                                                            ? 'bg-emerald-50 border-emerald-500 shadow-xl shadow-emerald-500/10'
                                                            : 'bg-white dark:bg-gray-800 border-transparent hover:border-emerald-200 hover:bg-white'}`}
                                                >
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className={`p-3 rounded-2xl ${getMenuColor(menu.type)}`}>
                                                            {getMenuIcon(menu.type)}
                                                        </div>
                                                        {selectedMenu?.id === menu.id && <CheckCircle className="text-emerald-500" />}
                                                    </div>
                                                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{menu.name}</h4>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                        <span>{menu.type}</span>
                                                        <span>•</span>
                                                        <span>{menu.calories} kcal</span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                    </div>

                                    {/* Extras Input */}
                                    <div className="mt-8">
                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Special Requests & Allergies</h3>
                                        <div className="bg-white/50 dark:bg-gray-900/50 p-1 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all">
                                            <textarea
                                                value={extras}
                                                onChange={e => setExtras(e.target.value)}
                                                placeholder="Example: No seafood, allergic to peanuts, extra spicy..."
                                                className="w-full bg-transparent p-4 outline-none min-h-[100px] resize-none font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!selectedPatient || !selectedMenu || !mealTime}
                                        className="w-full py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                    >
                                        <ChefHat size={24} />
                                        Send Order to Kitchen
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageWrapper>
    );

};

export default NutritionOrder;
