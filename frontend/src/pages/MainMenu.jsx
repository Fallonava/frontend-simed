import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { LayoutDashboard, Users, Database, LogOut, Monitor } from 'lucide-react';

const MainMenu = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        {
            title: 'Dashboard Admin',
            description: 'View analytics and statistics',
            icon: <LayoutDashboard size={40} />,
            path: '/admin/dashboard',
            roles: ['ADMIN'],
            color: 'bg-blue-600'
        },
        {
            title: 'Counter Staff',
            description: 'Manage patient queue calls',
            icon: <Users size={40} />,
            path: '/admin/counter',
            roles: ['ADMIN', 'STAFF'],
            color: 'bg-green-600'
        },
        {
            title: 'Master Data',
            description: 'Manage doctors and poliklinik',
            icon: <Database size={40} />,
            path: '/admin/master-data',
            roles: ['ADMIN'],
            color: 'bg-purple-600'
        },
        {
            title: 'Public Display',
            description: 'Open TV Display view',
            icon: <Monitor size={40} />,
            path: '/counter',
            roles: ['ADMIN', 'STAFF'],
            color: 'bg-orange-600',
            external: true // Opens in new tab usually, but here just navigate
        },
        {
            title: 'Kiosk Antrian',
            description: 'Ambil Nomor Antrian',
            icon: <Monitor size={40} />,
            path: '/kiosk',
            roles: ['ADMIN', 'STAFF'],
            color: 'bg-indigo-600'
        }
    ];

    const allowedItems = menuItems.filter(item => item.roles.includes(user?.role));

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Main Menu</h1>
                        <p className="text-gray-500">Welcome back, <span className="font-semibold text-blue-600">{user?.username}</span></p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {allowedItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => navigate(item.path)}
                            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-left group border border-gray-100"
                        >
                            <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                {item.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{item.title}</h3>
                            <p className="text-gray-500">{item.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MainMenu;
