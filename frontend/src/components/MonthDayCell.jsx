import React, { memo } from 'react';
import { Plus } from 'lucide-react';

const MonthDayCell = memo(({ day, currentDate, isToday, dayLeaves, onClick }) => {
    return (
        <div
            onClick={() => onClick(day)}
            className={`
                min-h-[120px] p-3 border relative group transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer
                ${isToday
                    ? 'bg-white dark:bg-gray-800 ring-2 ring-salm-blue ring-offset-2 dark:ring-offset-gray-900 border-transparent z-10 shadow-lg shadow-salm-blue/10 rounded-2xl'
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}
            `}
        >
            <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-semibold transition-all ${isToday
                    ? 'bg-salm-blue text-white w-8 h-8 flex items-center justify-center rounded-full shadow-lg shadow-salm-blue/30 scale-110'
                    : 'text-gray-700 dark:text-gray-300'
                    }`}>
                    {day}
                </span>
            </div>

            {/* Leave Blocks */}
            <div className="space-y-1">
                {dayLeaves.map((leave, idx) => (
                    <div key={idx} className="bg-salm-light-pink/30 border border-salm-light-pink p-2 rounded-lg shadow-sm">
                        <div className="text-xs font-bold text-salm-pink truncate">Leave</div>
                        <div className="text-[10px] text-salm-pink truncate">{leave.reason || 'No specific reason'}</div>
                    </div>
                ))}
            </div>

            {/* Hover Add Indicator */}
            {dayLeaves.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                    <Plus className="w-6 h-6 text-gray-300" />
                </div>
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function for performance
    return (
        prevProps.day === nextProps.day &&
        prevProps.isToday === nextProps.isToday &&
        prevProps.currentDate.getTime() === nextProps.currentDate.getTime() &&
        // Shallow compare dayLeaves array (it should be stable if memoized in parent, but length check is fast)
        prevProps.dayLeaves === nextProps.dayLeaves
    );
});

export default MonthDayCell;
