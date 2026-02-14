import { useState } from 'react';
import { authService } from '../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import BrandingPanel from '../components/auth/BrandingPanel';
import Button from '../components/Button';
import Input from '../components/Input';
import { IconAlertCircle, IconArrowRight, IconMail, IconCheck } from '@tabler/icons-react';
import { toast } from 'react-hot-toast';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await authService.forgotPassword(email);
            setSuccess(true);
            toast.success('Reset link sent to your email!');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Something went wrong');
            toast.error(err.response?.data?.message || 'Failed to send reset link');
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
                            <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Forgot Password? 🔑</h3>
                            <p className="text-slate-500 text-[15px] font-medium leading-relaxed">
                                Enter your email address and we'll send you a link to reset your password.
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
                                    <h4 className="text-xl font-bold text-slate-900">Email Sent!</h4>
                                    <p className="text-slate-500 text-sm">
                                        Check your inbox at <span className="font-bold text-slate-700">{email}</span> for instructions to reset your password.
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
                                    label="Email Address"
                                    placeholder="name@company.com"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12"
                                    leftSection={<IconMail size={18} className="text-slate-400" />}
                                />

                                <Button
                                    fullWidth
                                    type="submit"
                                    className="h-12 text-[15px] font-bold bg-[#1D82F5] hover:bg-blue-600 transition-colors shadow-blue-500/10 shadow-lg"
                                    loading={loading}
                                    rightSection={!loading && <IconArrowRight size={18} stroke={2.5} />}
                                >
                                    {loading ? 'Sending Link...' : 'Send Reset Link'}
                                </Button>

                                <div className="pt-2 text-center border-t border-slate-100">
                                    <Link to="/login" className="text-[13px] font-bold text-blue-600 hover:text-blue-700">
                                        Return to Sign In
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
