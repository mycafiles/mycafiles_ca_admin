import { useState } from 'react';
import { authService } from '../services/authService';
import { useNavigate, useParams, Link } from 'react-router-dom';
import BrandingPanel from '../components/auth/BrandingPanel';
import Button from '../components/Button';
import Input from '../components/Input';
import { IconAlertCircle, IconArrowRight, IconLock, IconEye, IconEyeOff, IconCheck } from '@tabler/icons-react';
import { toast } from 'react-hot-toast';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await authService.resetPassword(token, password);
            setSuccess(true);
            toast.success('Password reset successful!');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Something went wrong');
            toast.error(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#f8f9fb] overflow-hidden">
            <BrandingPanel />

            <div className="flex-[1.2] flex flex-col items-center justify-center p-8 relative">
                <div className="w-full max-w-[440px] flex flex-col items-center">
                    <div className="w-full bg-white p-10 rounded-[24px] shadow-xl border border-slate-100/60 relative">
                        <div className="mb-8">
                            <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">New Password 🔒</h3>
                            <p className="text-slate-500 text-[15px] font-medium leading-relaxed">
                                Please enter your new password below.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 text-[13px] font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                <IconAlertCircle size={16} stroke={2.5} />
                                {error}
                            </div>
                        )}

                        {success ? (
                            <div className="text-center space-y-6">
                                <div className="flex justify-center">
                                    <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                                        <IconCheck size={32} stroke={2.5} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-bold text-slate-900">Success!</h4>
                                    <p className="text-slate-500 text-sm">
                                        Your password has been reset successfully. Redirecting to login...
                                    </p>
                                </div>
                                <Button
                                    fullWidth
                                    onClick={() => navigate('/login')}
                                    className="h-12 text-[15px] font-bold bg-[#1D82F5] hover:bg-blue-600 transition-colors shadow-blue-500/10 shadow-lg"
                                >
                                    Back to Login
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <Input
                                    label="New Password"
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

                                <Input
                                    label="Confirm New Password"
                                    placeholder="••••••••"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    leftSection={<IconLock size={18} className="text-slate-400" />}
                                    className="h-12"
                                />

                                <Button
                                    fullWidth
                                    type="submit"
                                    className="h-12 text-[15px] font-bold bg-[#1D82F5] hover:bg-blue-600 transition-colors shadow-blue-500/10 shadow-lg"
                                    loading={loading}
                                    rightSection={!loading && <IconArrowRight size={18} stroke={2.5} />}
                                >
                                    {loading ? 'Updating...' : 'Reset Password'}
                                </Button>

                                <div className="pt-2 text-center border-t border-slate-100">
                                    <Link to="/login" className="text-[13px] font-bold text-blue-600 hover:text-blue-700">
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
