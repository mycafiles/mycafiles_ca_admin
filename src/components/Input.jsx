import React from 'react';

const Input = ({
    label,
    error,
    leftSection,
    rightSection,
    className = '',
    wrapperClassName = '',
    ...props
}) => {
    return (
        <div className={`w-full ${wrapperClassName} space-y-2`}>
            {label && (
                <label className="block text-sm font-bold text-text-secondary ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {leftSection && (
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-primary transition-colors">
                        {leftSection}
                    </div>
                )}
                <input
                    className={`
            block w-full rounded-xl border border-border bg-white py-3 px-4 text-text-primary
            placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary
            transition-all duration-200 text-sm font-medium
            ${leftSection ? 'pl-11' : ''}
            ${rightSection ? 'pr-11' : ''}
            ${error ? 'border-danger focus:ring-danger/10 focus:border-danger' : ''}
            ${className}
          `}
                    {...props}
                />
                {rightSection && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-300">
                        {rightSection}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1 text-[11px] text-danger font-bold uppercase tracking-tight ml-1 animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;

