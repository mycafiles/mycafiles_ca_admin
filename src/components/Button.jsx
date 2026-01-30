import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    className = '',
    leftSection,
    rightSection,
    fullWidth = false,
    loading,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all focus:outline-none focus:ring-4 focus:ring-offset-0 rounded-xl py-2.5 px-6 text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 focus:ring-primary/10',
        secondary: 'bg-white border border-border text-text-primary hover:bg-slate-50 shadow-sm focus:ring-slate-100',
        danger: 'bg-danger text-white hover:bg-red-600 shadow-lg shadow-danger/20 focus:ring-danger/10',
        ghost: 'bg-transparent text-text-secondary hover:bg-slate-50 hover:text-text-primary',
        filter: 'bg-slate-50 text-text-secondary hover:bg-slate-100 hover:text-text-primary font-bold border-none px-4',
        link: 'text-primary hover:text-primary-hover hover:underline p-0 min-h-0 shadow-none',
        sidebar: 'w-full justify-start gap-4 px-4 py-3 rounded-xl text-text-secondary hover:bg-slate-50 font-medium transition-colors',
        'sidebar-active': 'w-full justify-start gap-4 px-4 py-3 rounded-xl bg-slate-100 text-primary font-bold shadow-sm shadow-primary/5',
        'sidebar-inactive': 'w-full justify-start gap-4 px-4 py-3 rounded-xl text-text-secondary hover:bg-slate-50 font-medium transition-colors',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`${baseStyles} ${variants[variant] || variants.primary} ${widthClass} ${className}`}
            {...props}
        >
            {leftSection && <span className="mr-2 flex items-center">{leftSection}</span>}
            {children}
            {rightSection && <span className="ml-2 flex items-center">{rightSection}</span>}
        </button>
    );
};

export default Button;

