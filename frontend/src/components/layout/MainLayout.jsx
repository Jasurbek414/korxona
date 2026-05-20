import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
export default function MainLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: '256px', flex: 1, minHeight: '100vh', padding: '24px 28px', background: '#f1f5f9' }}>
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
