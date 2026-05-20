import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuthContext';
import ProtectedRoute from './components/ui/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import EquipmentListPage from './pages/equipment/EquipmentListPage';
import ReferencesPage from './pages/references/ReferencesPage';

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
            <Route path="/equipment" element={<EquipmentListPage />} />
            <Route path="/references" element={<ReferencesPage />} />
            <Route path="/users" element={<div className="text-lg text-slate-500">Foydalanuvchilar sahifasi — keyingi bosqichda</div>} />
            <Route path="/audit-log" element={<div className="text-lg text-slate-500">Audit jurnali — keyingi bosqichda</div>} />
            <Route path="/settings" element={<div className="text-lg text-slate-500">Sozlamalar — keyingi bosqichda</div>} />
          </Route>

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
