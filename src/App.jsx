import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import CAHome from './pages/CAHome';
import ClientList from './pages/ClientList';
import ClientDetails from './pages/ClientDetails';
import BannerManagement from './pages/BannerManagement';
import RecycleBin from './pages/RecycleBin';
import ActivityLog from './pages/ActivityLog';
import UserProfile from './pages/UserProfile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Notifications from './pages/Notifications';
import ToastProvider from './components/ui/Toast';

import { useEffect } from 'react';
import { oneSignalService } from './services/oneSignal';

function App() {
  useEffect(() => {
    oneSignalService.init();
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard/home" replace />} />
          <Route path="home" element={<CAHome />} />
          <Route path="clients" element={<ClientList />} />
          <Route path="clients/:id" element={<ClientDetails />} />
          <Route path="banners" element={<BannerManagement />} />
          <Route path="activity" element={<ActivityLog />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="bin" element={<RecycleBin />} />
          <Route path="settings" element={<UserProfile />} />
        </Route>

        {/* Redirect root to login or dashboard */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
