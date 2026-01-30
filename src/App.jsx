import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import CAHome from './pages/CAHome';
import ClientList from './pages/ClientList';
import ClientDetails from './pages/ClientDetails';
import BannerManagement from './pages/BannerManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard/home" replace />} />
          <Route path="home" element={<CAHome />} />
          <Route path="clients" element={<ClientList />} />
          <Route path="clients/:id" element={<ClientDetails />} />
          <Route path="banners" element={<BannerManagement />} />
        </Route>

        {/* Redirect root to login or dashboard */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
