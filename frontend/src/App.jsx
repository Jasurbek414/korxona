import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuthContext';
import ProtectedRoute from './components/ui/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import EquipmentListPage from './pages/equipment/EquipmentListPage';
import EquipmentFormPage from './pages/equipment/EquipmentFormPage';
import EquipmentDetailPage from './pages/equipment/EquipmentDetailPage';
import ReferencesPage from './pages/references/ReferencesPage';
import UsersPage from './pages/dashboard/UsersPage';
import PprTaskListPage from './pages/ppr/PprTaskListPage';
import WarehousePage from './pages/warehouse/WarehousePage';
import SparePartsPage from './pages/warehouse/SparePartsPage';
import ReportsPage from './pages/reports/ReportsPage';
import AuditLogPage from './pages/admin/AuditLogPage';
import ExcelImportPage from './pages/admin/ExcelImportPage';
import SettingsPage from './pages/admin/SettingsPage';
import UserRequestsPage from './pages/requests/UserRequestsPage';
import ProfilePage from './pages/profile/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            {/* Boshqaruv (TZ 5.2) */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Uskunalar (TZ 2.1-2.13) */}
            <Route path="/equipment" element={<EquipmentListPage />} />
            <Route path="/equipment/new" element={<EquipmentFormPage />} />
            <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
            <Route path="/equipment/:id/edit" element={<EquipmentFormPage />} />

            {/* PPR (TZ 3.1-3.12) */}
            <Route path="/ppr" element={<PprTaskListPage />} />

            {/* Arizalar (TZ 3.8) */}
            <Route path="/requests" element={<UserRequestsPage />} />

            {/* Ombor (TZ 4.1-4.5) */}
            <Route path="/warehouse" element={<WarehousePage />} />
            <Route path="/spare-parts" element={<SparePartsPage />} />

            {/* Hisobotlar (TZ 5.1) */}
            <Route path="/reports" element={<ReportsPage />} />

            {/* Ma'lumotnomalar */}
            <Route path="/references" element={<ReferencesPage />} />

            {/* Profil */}
            <Route path="/profile" element={<ProfilePage />} />

            {/* Admin sahifalari */}
            <Route path="/users" element={<ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>} />
            <Route path="/audit-log" element={<ProtectedRoute adminOnly><AuditLogPage /></ProtectedRoute>} />
            <Route path="/excel-import" element={<ProtectedRoute adminOnly><ExcelImportPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute adminOnly><SettingsPage /></ProtectedRoute>} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
