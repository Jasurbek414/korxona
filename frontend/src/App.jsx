import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuthContext';
import ProtectedRoute from './components/ui/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import EquipmentListPage from './pages/equipment/EquipmentListPage';
import EquipmentFormPage from './pages/equipment/EquipmentFormPage';
import ReferencesPage from './pages/references/ReferencesPage';
import UsersPage from './pages/dashboard/UsersPage';

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

            {/* Uskunalar */}
            <Route path="/equipment" element={<EquipmentListPage />} />
            <Route path="/equipment/new" element={<EquipmentFormPage />} />
            <Route path="/equipment/:id/edit" element={<EquipmentFormPage />} />

            {/* Ma'lumotnomalar */}
            <Route path="/references" element={<ReferencesPage />} />

            {/* Admin sahifalari */}
            <Route path="/users" element={
              <ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>
            } />
            <Route path="/audit-log" element={
              <ProtectedRoute adminOnly>
                <div className="text-lg text-slate-500">Audit jurnali — keyingi bosqichda</div>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <div className="text-lg text-slate-500">Sozlamalar — keyingi bosqichda</div>
            } />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
