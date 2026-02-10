// src/pages/Login.jsx
import { useState } from 'react';
import { authService } from '../services/authService';
import { oneSignalService } from '../services/oneSignal';
import { useNavigate } from 'react-router-dom';
import BrandingPanel from '../components/auth/BrandingPanel';
import LoginForm from '../components/auth/LoginForm';

import { IconShieldCheck } from '@tabler/icons-react';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await authService.caLogin(email, password, 'CAADMIN');
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));

            // Set OneSignal External User ID
            if (data.user?._id) {
                await oneSignalService.setExternalUserId(data.user._id);
            } else if (data._id) {
                await oneSignalService.setExternalUserId(data._id);
            }

            if (data.role === 'CAADMIN') {
                navigate('/dashboard/home');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#f8f9fb] overflow-hidden">
            {/* Left Side: Branding */}
            <BrandingPanel />

            {/* Right Side: Login Form */}
            <div className="flex-[1.2] flex flex-col items-center justify-center p-8 relative">
                <LoginForm
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    loading={loading}
                    error={error}
                    onSubmit={handleLogin}
                />
            </div>
        </div>
    );
}

