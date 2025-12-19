import React from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

const PageWrapper = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Hide home button on login, menu, and public pages
    const hideHomeButton = ['/login', '/menu', '/', '/kiosk', '/counter'].includes(location.pathname);

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full h-full relative"
        >
            {children}

            {!hideHomeButton && ReactDOM.createPortal(
                <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/menu')}
                    className="fixed bottom-6 right-6 z-[9999] p-4 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 rounded-full shadow-xl shadow-purple-900/20 border border-purple-100 dark:border-purple-900/30 flex items-center justify-center group"
                    title="Back to Main Menu"
                >
                    <Home size={24} className="group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors" />
                </motion.button>,
                document.body
            )}
        </motion.div>
    );
};

export default PageWrapper;
