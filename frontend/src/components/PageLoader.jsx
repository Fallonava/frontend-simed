import React from 'react';
import { Loader2 } from 'lucide-react';

const PageLoader = () => {
    return (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-salm-blue animate-spin mb-4" />
            <p className="text-gray-500 font-medium animate-pulse">Loading...</p>
        </div>
    );
};

export default PageLoader;
