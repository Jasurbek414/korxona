import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuthContext';
import ProtectedRoute from './components/ui/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Ochiq sahifalar */}
          <Route path="/login" element={<LoginPage />} />

          {/* Himoyalangan sahifalar */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/equipment" element={<div className="text-lg text-slate-500">Uskunalar sahifasi — tayyor bo'ladi</div>} />
            <Route path="/references" element={<div className="text-lg text-slate-500">Ma'lumotnomalar sahifasi — tayyor bo'ladi</div>} />
            <Route path="/users" element={<div className="text-lg text-slate-500">Foydalanuvchilar sahifasi — tayyor bo'ladi</div>} />
            <Route path="/audit-log" element={<div className="text-lg text-slate-500">Audit jurnali — tayyor bo'ladi</div>} />
            <Route path="/settings" element={<div className="text-lg text-slate-500">Sozlamalar — tayyor bo'ladi</div>} />
          </Route>

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
