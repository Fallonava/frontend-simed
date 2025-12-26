import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const GreetingHeader = ({ userName }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        const updateGreeting = () => {
            const hour = new Date().getHours();
            if (hour < 12) setGreeting('Good Morning');
            else if (hour < 18) setGreeting('Good Afternoon');
            else setGreeting('Good Evening');
        };

        updateGreeting();
        const greetingTimer = setInterval(updateGreeting, 60000); // Check greeting every minute

        return () => {
            clearInterval(timer);
            clearInterval(greetingTimer);
        };
    }, []);

    const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = currentTime.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
        >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-2 tracking-tight">
                {greeting}, {userName || 'Doctor'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg flex items-center gap-2">
                <Clock size={18} />
                {formattedDate} • {formattedTime}
            </p>
        </motion.div>
    );
};

export default memo(GreetingHeader);
