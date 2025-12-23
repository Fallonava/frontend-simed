import React from 'react';
import FloatingDock from './FloatingDock';
import GlassSidebar from './GlassSidebar';

const ResponsiveNav = (props) => {
    return (
        <>
            {/* Desktop Dock - Hidden on Mobile */}
            <FloatingDock {...props} />

            {/* Mobile Sidebar - Hidden on Desktop */}
            <GlassSidebar {...props} />
        </>
    );
};

export default ResponsiveNav;
