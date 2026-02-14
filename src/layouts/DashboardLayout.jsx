// src/layouts/DashboardLayout.jsx
import React, { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { oneSignalService } from '../services/oneSignal';
import {
    IconUsers,
    IconUser,
    IconLayoutGrid,
    IconFileText,
    IconFolder,
    IconChartBar,
    IconSettings,
    IconBell,
    IconBellRinging,
    IconChevronRight,
    IconLogout,
    IconBuildingBank,
    IconLayoutSidebarLeftCollapse,
    IconLayoutSidebarLeftExpand,
    IconShieldCheck,
    IconTrash,
    IconHistory
} from '@tabler/icons-react';
import Button from '../components/Button';
import NotificationCenter from '../components/notifications/NotificationCenter';

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = async () => {
        await oneSignalService.removeExternalUserId();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navLinks = [
        { label: 'Dashboard', icon: IconLayoutGrid, path: '/dashboard/home' },
        { label: 'Clients', icon: IconUsers, path: '/dashboard/clients' },
        { label: 'Banners', icon: IconBell, path: '/dashboard/banners' },
        { label: 'Notifications', icon: IconBellRinging, path: '/dashboard/notifications' },
        { label: 'Activity Log', icon: IconHistory, path: '/dashboard/activity' },
        { label: 'Recycle Bin', icon: IconTrash, path: '/dashboard/bin' },
        // { label: 'Documents', icon: IconFolder, path: '/dashboard/documents' },
        // { label: 'Tax Returns', icon: IconFileText, path: '/dashboard/tax-returns' },
        // { label: 'Reports', icon: IconChartBar, path: '/dashboard/reports' },
    ];

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/10">
            {/* Sidebar */}
            <aside className={`
                fixed lg:relative inset-y-0 left-0 z-50 w-72 bg-surface border-r border-border transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:-ml-72'}
                flex flex-col shadow-2xl shadow-slate-900/5 lg:shadow-none
            `}>
                {/* Brand Section */}
                <div className="px-7 py-9 flex items-center gap-3.5">
                    <div className="bg-primary/10 p-2.5 rounded-2xl text-primary shadow-sm border border-primary/5">
                        <IconBuildingBank size={28} stroke={2.5} />
                    </div>
                    <div>
                        <h1 className="font-black text-[20px] tracking-tighter text-text-primary leading-tight">My CA Files</h1>
                        <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-extrabold -mt-0.5 opacity-70">Admin Panel</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {navLinks.map((link) => {
                        const isActive = location.pathname.startsWith(link.path);
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`
                                    flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                                    ${isActive
                                        ? 'bg-slate-50 text-primary shadow-sm shadow-primary/5'
                                        : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary'}
                                `}
                            >
                                <Icon
                                    size={22}
                                    stroke={isActive ? 3 : 2.5}
                                    className={`transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-text-primary'}`}
                                />
                                <span className={`text-[15px] ${isActive ? 'font-black' : 'font-bold'}`}>
                                    {link.label}
                                </span>
                                {isActive && (
                                    <div className="ml-auto size-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(19,127,236,0.6)]"></div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-border mt-auto space-y-4">
                    <Link
                        to="/dashboard/settings"
                        className={`
                            flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group
                            ${location.pathname === '/dashboard/settings'
                                ? 'bg-slate-50 text-primary'
                                : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary'}
                        `}
                    >
                        <IconUser size={22} stroke={2.5} className="text-slate-400 group-hover:text-text-primary" />
                        <span className="text-[15px] font-bold">My Profile</span>
                    </Link>

                    {/* Profile Card */}
                    <div className="p-3 bg-slate-50 rounded-[28px] border border-slate-100 flex items-center gap-3 relative group">
                        <div className="relative group">
                            <img
                                src={`https://ui-avatars.com/api/?name=${user.name || 'Amit+Verma'}&background=137fec&color=fff&bold=true`}
                                className="size-11 rounded-[18px] object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform"
                                alt="Profile"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 size-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="text-[14px] font-black text-text-primary truncate tabular-nums leading-tight">
                                {user.name || 'Amit Verma'}
                            </p>
                            <p className="text-[11px] font-bold text-text-secondary truncate mt-0.5">
                                {user.email || 'amit.ca@mrd.com'}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            title="Sign Out"
                        >
                            <IconLogout size={18} stroke={3} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
                {/* Top Header */}
                <header className="h-20 flex items-center justify-between px-10 bg-white border-b border-slate-100 shrink-0 z-40 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 transition-all active:scale-95 border border-slate-200"
                        >
                            {isSidebarOpen ? (
                                <IconLayoutSidebarLeftCollapse size={22} stroke={2.5} />
                            ) : (
                                <IconLayoutSidebarLeftExpand size={22} stroke={2.5} />
                            )}
                        </button>

                        <nav className="hidden sm:flex items-center gap-2 text-sm text-text-secondary font-medium overflow-hidden">
                            <span className="hover:text-primary cursor-pointer transition-colors">Portal</span>
                            <IconChevronRight size={14} stroke={3} className="text-slate-300" />
                            <span className="text-text-primary font-bold truncate">
                                {location.pathname.split('/').slice(-1)[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100/50 rounded-full text-[10px] font-black text-emerald-600 tabular-nums shadow-sm">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            SYSTEM SECURE
                        </div>
                        <NotificationCenter />
                    </div>
                </header>

                {/* Viewport Scrollable Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <div className="max-w-[1440px] mx-auto pb-10">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}

