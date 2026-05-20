import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

export default function MainLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Toaster position="top-right" toastOptions={{
        duration: 3000,
        style: { borderRadius: '16px', background: '#1e293b', color: '#fff', fontSize: '14px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)' },
      }} />
      <Sidebar />
      <main style={{ 
        marginLeft: '280px', 
        flex: 1, 
        minHeight: '100vh', 
        padding: '32px 40px', 
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
