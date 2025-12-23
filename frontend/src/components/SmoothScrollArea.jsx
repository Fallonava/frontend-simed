import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';

const SmoothScrollArea = ({ children, className = '', contentClassName = '' }) => {
    const wrapperRef = useRef(null);
    const contentRef = useRef(null);
    const lenisRef = useRef(null);

    useEffect(() => {
        if (!wrapperRef.current || !contentRef.current) return;

        // Instantiate scoped Lenis
        const lenis = new Lenis({
            wrapper: wrapperRef.current,
            content: contentRef.current,
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Same exponential easing as global
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        lenisRef.current = lenis;

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        const rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    return (
        <div
            ref={wrapperRef}
            className={`overflow-y-auto ${className}`}
            data-lenis-prevent // Prevent parent/global Lenis from hijacking this area
        >
            <div ref={contentRef} className={contentClassName}>
                {children}
            </div>
        </div>
    );
};

export default SmoothScrollArea;
