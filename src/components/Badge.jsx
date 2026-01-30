import React from 'react';

const Badge = ({ children, variant = 'individual' }) => {
    const variants = {
        individual: 'bg-emerald-50 text-emerald-700 border-emerald-100/80',
        business: 'bg-indigo-50 text-indigo-700 border-indigo-100/80',
        active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        pending: 'bg-amber-50 text-amber-600 border-amber-100',
        inactive: 'bg-rose-50 text-rose-600 border-rose-100',
        danger: 'bg-danger-bg text-danger border-danger/10',
    };

    const showDot = ['active', 'pending', 'inactive'].includes(variant);
    const dotColors = {
        active: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
        pending: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]',
        inactive: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
    };

    return (
        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 w-fit uppercase tracking-tight ${variants[variant] || variants.individual}`}>
            {showDot && <span className={`size-1.5 rounded-full ${dotColors[variant]}`}></span>}
            {children}
        </span>
    );
};

export default Badge;

