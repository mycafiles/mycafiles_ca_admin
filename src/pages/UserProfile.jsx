import React, { useState } from 'react';
import {
    IconUser,
    IconMail,
    IconLock,
    IconPhone,
    IconBuildingBank,
    IconShieldCheck,
    IconDeviceFloppy
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import { IconBellRinging } from '@tabler/icons-react';

export default function UserProfile() {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
    const [isLoading, setIsLoading] = useState(false);
    const [isTesting, setIsTesting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: user.name || '',
        phone: user.phone || '', // Check if user object has phone, else empty
        FRNno: user.FRNno || '',
    });

    const [passwordData, setPasswordData] = useState({
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const updatedUser = await authService.updateProfile(formData);
            setUser(updatedUser);
            // Storage update handled in service, but good to have local state sync
            notifications.show({
                title: 'Success',
                message: 'Profile updated successfully',
                color: 'green'
            });
        } catch (error) {
            console.error(error);
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to update profile',
                color: 'red'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (passwordData.password !== passwordData.confirmPassword) {
            notifications.show({
                title: 'Error',
                message: 'Passwords do not match',
                color: 'red'
            });
            return;
        }

        if (passwordData.password.length < 6) {
            notifications.show({
                title: 'Error',
                message: 'Password must be at least 6 characters',
                color: 'red'
            });
            return;
        }

        try {
            await authService.updateProfile({ password: passwordData.password });
            notifications.show({
                title: 'Success',
                message: 'Password updated successfully',
                color: 'green'
            });
            setPasswordData({ password: '', confirmPassword: '' });
        } catch (error) {
            console.error(error);
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to update password',
                color: 'red'
            });
        }
    };

    const handleSendTestNotification = async () => {
        setIsTesting(true);
        try {
            await notificationService.sendTestNotification();
            notifications.show({
                title: 'Success',
                message: 'Test notification sent! Check your notification bar.',
                color: 'blue'
            });
        } catch (error) {
            console.error(error);
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to send test notification',
                color: 'red'
            });
        } finally {
            setIsTesting(false);
        }
    };


    return (
        <div className="max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Profile</h1>
                <p className="text-slate-500 font-medium mt-1">Manage your account settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: ID Card / Overview */}
                <div className="space-y-6">
                    {/* Profile Card */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                        <div className="relative flex flex-col items-center mt-8">
                            <div className="relative">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user.name || 'Admin'}&background=137fec&color=fff&bold=true&size=128`}
                                    alt="Profile"
                                    className="size-28 rounded-3xl border-4 border-white shadow-lg object-cover"
                                />
                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-xl border-4 border-white shadow-sm" title="Verified">
                                    <IconShieldCheck size={18} stroke={3} />
                                </div>
                            </div>

                            <h2 className="mt-4 text-xl font-bold text-slate-800">{user.name || 'Amit Verma'}</h2>
                            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{user.role || 'Super Admin'}</span>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                    <IconMail size={20} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Email Address</p>
                                    <p className="text-sm font-bold text-slate-700 truncate">{user.email || 'amit.ca@mrd.com'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <IconBuildingBank size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">FRN Number</p>
                                    <p className="text-sm font-bold text-slate-700">{user.FRNno || 'Not Set'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Test Notification Section */}
                    {/* <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <IconBellRinging size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Notifications</h3>
                        </div>
                        <p className="text-sm text-slate-500 mb-6">
                            Test if your browser and system notifications are working properly.
                        </p>
                        <button
                            onClick={handleSendTestNotification}
                            disabled={isTesting}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-2xl font-bold transition-all disabled:opacity-50"
                        >
                            {isTesting ? 'Sending...' : 'Send Test Notification'}
                        </button>
                    </div> */}
                </div>

                {/* Right Column: Edit Forms */}
                <div className="lg:col-span-2 space-y-6">

                    {/* General Information */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                                <IconUser size={24} stroke={2.5} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors font-semibold text-slate-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Phone Number</label>
                                <div className="relative">
                                    <IconPhone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+91 98765 43210"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors font-semibold text-slate-700"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">FRN Number</label>
                                <input
                                    type="text"
                                    name="FRNno"
                                    value={formData.FRNno}
                                    onChange={handleChange}
                                    placeholder="Enter Firm Registration Number"
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors font-semibold text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>Saving...</>
                                ) : (
                                    <>
                                        <IconDeviceFloppy size={20} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                                <IconLock size={24} stroke={2.5} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Security & Password</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">New Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={passwordData.password}
                                    onChange={handlePasswordChange}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-rose-500 focus:outline-none transition-colors font-semibold text-slate-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-rose-500 focus:outline-none transition-colors font-semibold text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handlePasswordUpdate}
                                className="px-5 py-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl font-bold transition-colors"
                            >
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
