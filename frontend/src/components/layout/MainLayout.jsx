import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <Toaster position="top-right" toastOptions={{
        duration: 3000,
        style: { borderRadius: '12px', background: '#1e293b', color: '#fff', fontSize: '14px' },
      }} />
      <Sidebar />
      <main style={{ marginLeft: '16rem' }} className="p-6 min-h-screen">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
