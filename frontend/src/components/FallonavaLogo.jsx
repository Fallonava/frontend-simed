import React, { useId } from 'react';

const FallonavaLogo = ({ className = "w-20 h-20" }) => {
    // Generate unique IDs for this specific instance to avoid conflicts
    const uid = useId();
    const gradientId = `logo-gradient-${uid}`;
    const sheenId = `sheen-gradient-${uid}`;
    const glowId = `glow-${uid}`;

    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${className} hover:scale-105 transition-transform duration-300 drop-shadow-2xl overflow-visible`}
        >
            <defs>
                {/* Modern Ultra-Vibrant Gradient: Electric Indigo -> Neon Purple -> Hot Pink */}
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />   {/* Indigo-500 */}
                    <stop offset="50%" stopColor="#a855f7" />  {/* Purple-500 */}
                    <stop offset="100%" stopColor="#ec4899" /> {/* Pink-500 */}
                </linearGradient>

                {/* Secondary Gradient for depth/sheen */}
                <linearGradient id={sheenId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>

                <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Background Shape - Soft Rounded Rect with Main Gradient */}
            <rect
                x="5"
                y="5"
                width="90"
                height="90"
                rx="24"
                fill={`url(#${gradientId})`}
                className="shadow-lg"
            />

            {/* Subtle Sheen Overlay */}
            <rect
                x="5"
                y="5"
                width="90"
                height="90"
                rx="24"
                fill={`url(#${sheenId})`}
                className="pointer-events-none"
            />

            {/* Abstract F / Medical Cross Hybrid Shape */}
            <path
                d="M35 30 H65 A5 5 0 0 1 70 35 V45 A5 5 0 0 1 65 50 H50 V65 A5 5 0 0 1 45 70 H35 A5 5 0 0 1 30 65 V35 A5 5 0 0 1 35 30 Z"
                fill="white"
                fillOpacity="0.95"
            />
            <path
                d="M55 30 V20 A5 5 0 0 1 60 15 H75 A5 5 0 0 1 80 20 V30 Z"
                fill="white"
                fillOpacity="0.85"
            />
            <circle cx="70" cy="70" r="8" fill="white" fillOpacity="0.85" />
        </svg>
    );
};

export default FallonavaLogo;
