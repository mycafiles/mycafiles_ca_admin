import React from 'react';
import { IconX } from '@tabler/icons-react';

const Modal = ({ opened, onClose, title, children }) => {
    if (!opened) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-lg w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-border p-4">
                <div className="flex items-center justify-between ">
                    <h3 className="text-[16px] font-bold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-border text-gray-400 hover:bg-gray-50 transition-colors"
                    >
                        <IconX size={18} />
                    </button>
                </div>
                <div className="mt-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
