import React, { useState } from 'react';
import Button from '../Button';
import Input from '../Input';
import { IconAlertCircle, IconArrowRight, IconLock, IconMail, IconEye, IconEyeOff, IconHelpCircle } from '@tabler/icons-react';

const LoginForm = ({ email, setEmail, password, setPassword, loading, error, onSubmit }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="w-full max-w-[440px] flex flex-col items-center">
            <div className="w-full bg-white p-10 rounded-[24px] shadow-xl border border-slate-100/60 relative">
                <div className="mb-8">
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Welcome Back! 👋</h3>
                    <p className="text-slate-500 text-[15px] font-medium leading-relaxed">
                        Sign in to access your CA Admin dashboard
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 text-[13px] font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                        <IconAlertCircle size={16} stroke={2.5} />
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-6">
                    <Input
                        label="Email Address"
                        placeholder="name@company.com"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12"
                        leftSection={<IconMail size={18} className="text-slate-400" />}
                    />

                    <Input
                        label="Password"
                        placeholder="••••••••"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        leftSection={<IconLock size={18} className="text-slate-400" />}
                        rightSection={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                            >
                                {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                            </button>
                        }
                        className="h-12"
                    />

                    <Button
                        fullWidth
                        type="submit"
                        className="h-12 text-[15px] font-bold bg-[#1D82F5] hover:bg-blue-600 transition-colors shadow-blue-500/10 shadow-lg"
                        loading={loading}
                        rightSection={!loading && <IconArrowRight size={18} stroke={2.5} />}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>

                    <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                        <button type="button" className="text-[13px] font-bold text-blue-600 hover:text-blue-700">
                            Forgot Password?
                        </button>
                        <button type="button" className="flex items-center gap-1.5 text-[13px] font-bold text-slate-400 hover:text-slate-600">
                            <IconHelpCircle size={16} stroke={2.5} />
                            Contact Support
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;
