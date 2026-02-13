import React, { useState, useEffect } from 'react';

const FocusRuler = ({ isActive }) => {
    const [mouseY, setMouseY] = useState(0);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMouseY(e.clientY);
        };

        if (isActive) {
            window.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isActive]);

    if (!isActive) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {/* top dimmer  */}
            <div
                className="absolute top-0 left-0 w-full bg-black/10 transition-all duration-75 ease-out"
                style={{ height: `${Math.max(0, mouseY - 50 - 64)}px` }} // corrected for navbar (64px)
            />

            {/* reading window (clear)  */}
            <div
                className="absolute left-0 w-full h-24 border-y-4 border-[#C8A146]/50 transition-all duration-75 ease-out"
                style={{ top: `${Math.max(0, mouseY - 50 - 64)}px` }} // corrected for navbar
            />

            {/* bottom dimmer  */}
            <div
                className="absolute left-0 w-full bottom-0 bg-black/10 transition-all duration-75 ease-out"
                style={{ top: `${mouseY + 50 - 64}px` }} // corrected for navbar
            />
        </div>
    );
};

export default FocusRuler;
