import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuthContext';
import {
  HiOutlineSquares2X2,
  HiOutlineComputerDesktop,
  HiOutlineRectangleStack,
  HiOutlineBuildingOffice2,
  HiOutlineUsers,
  HiOutlineClipboardDocumentList,
  HiOutlineArrowRightOnRectangle,
  HiOutlineCog6Tooth,
  HiOutlineWrenchScrewdriver,
  HiOutlineCube,
} from 'react-icons/hi2';

const menuItems = [
  { path: '/dashboard', icon: HiOutlineSquares2X2, label: 'Boshqaruv paneli' },
  { path: '/equipment', icon: HiOutlineComputerDesktop, label: 'Uskunalar' },
  { path: '/ppr', icon: HiOutlineWrenchScrewdriver, label: 'PPR vazifalari' },
  { path: '/warehouse', icon: HiOutlineCube, label: 'Ombor hisobi' },
  { path: '/references', icon: HiOutlineRectangleStack, label: "Ma'lumotnomalar" },
];

const adminItems = [
  { path: '/users', icon: HiOutlineUsers, label: 'Foydalanuvchilar' },
  { path: '/audit-log', icon: HiOutlineClipboardDocumentList, label: 'Audit jurnali' },
  { path: '/settings', icon: HiOutlineCog6Tooth, label: 'Sozlamalar' },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-blue-600/20 text-blue-400'
        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
    }`;

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-[var(--bg-sidebar)] border-r border-white/5 flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
          <HiOutlineComputerDesktop className="text-white text-lg" />
        </div>
        <div>
          <h2 className="text-white font-bold text-sm">Boshliq</h2>
          <p className="text-slate-500 text-xs">Uskunalar tizimi</p>
        </div>
      </div>

      {/* Navigatsiya */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-4 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">Asosiy</p>
        {menuItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClass}>
            <item.icon className="text-lg" />
            {item.label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <p className="px-4 py-2 mt-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Administrator
            </p>
            {adminItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={linkClass}>
                <item.icon className="text-lg" />
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Profil */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-slate-500 text-xs">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors p-1" title="Chiqish">
            <HiOutlineArrowRightOnRectangle className="text-lg" />
          </button>
        </div>
      </div>
    </aside>
  );
}
