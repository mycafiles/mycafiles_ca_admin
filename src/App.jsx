import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import CAHome from './pages/CAHome';
import ClientList from './pages/ClientList';
import ClientDetails from './pages/ClientDetails';
import BannerManagement from './pages/BannerManagement';
import RecycleBin from './pages/RecycleBin';
import UserProfile from './pages/UserProfile';
import ToastProvider from './components/ui/Toast';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard/home" replace />} />
          <Route path="home" element={<CAHome />} />
          <Route path="clients" element={<ClientList />} />
          <Route path="clients/:id" element={<ClientDetails />} />
          <Route path="banners" element={<BannerManagement />} />
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
