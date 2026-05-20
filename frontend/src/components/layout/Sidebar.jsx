import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuthContext';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n';
import {
  HiOutlineSquares2X2, HiOutlineComputerDesktop, HiOutlineRectangleStack,
  HiOutlineUsers, HiOutlineClipboardDocumentList, HiOutlineArrowRightOnRectangle,
  HiOutlineCog6Tooth, HiOutlineWrenchScrewdriver, HiOutlineCube,
  HiOutlineChartBarSquare, HiOutlineArchiveBox, HiOutlineDocumentArrowUp,
  HiOutlinePencilSquare,
} from 'react-icons/hi2';

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const menuItems = [
    { path: '/dashboard', icon: HiOutlineSquares2X2, label: t('sidebar.dashboard') },
    { path: '/equipment', icon: HiOutlineComputerDesktop, label: t('sidebar.equipment') },
    { path: '/ppr', icon: HiOutlineWrenchScrewdriver, label: t('sidebar.ppr') },
    { path: '/requests', icon: HiOutlinePencilSquare, label: t('sidebar.requests') },
    { path: '/warehouse', icon: HiOutlineCube, label: t('sidebar.warehouse') },
    { path: '/spare-parts', icon: HiOutlineArchiveBox, label: t('sidebar.spareParts') },
    { path: '/reports', icon: HiOutlineChartBarSquare, label: t('sidebar.reports') },
    { path: '/references', icon: HiOutlineRectangleStack, label: t('sidebar.references') },
  ];

  const adminItems = [
    { path: '/users', icon: HiOutlineUsers, label: t('sidebar.users') },
    { path: '/excel-import', icon: HiOutlineDocumentArrowUp, label: t('sidebar.excelImport') },
    { path: '/audit-log', icon: HiOutlineClipboardDocumentList, label: t('sidebar.auditLog') },
    { path: '/settings', icon: HiOutlineCog6Tooth, label: t('sidebar.settings') },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-400 shadow-sm shadow-blue-500/10'
        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
    }`;

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-[#0f172a] to-[#1e293b] border-r border-white/5 flex flex-col z-40">
      {/* Logo + til */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <HiOutlineComputerDesktop className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm tracking-wide">BOSHLIQ</h2>
            <p className="text-slate-500 text-xs">{t('auth.loginSubtitle')}</p>
          </div>
        </div>
        {/* Til almashtirgich */}
        <div className="flex rounded-lg bg-white/5 p-0.5">
          {['uz', 'ru'].map(lang => (
            <button key={lang} onClick={() => changeLanguage(lang)}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                i18n.language === lang
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}>
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Navigatsiya */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">{t('sidebar.main')}</p>
        {menuItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClass}>
            <item.icon className="text-lg flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="divider !my-4 !bg-white/5" />
            <p className="px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Administrator
            </p>
            {adminItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={linkClass}>
                <item.icon className="text-lg flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Profil */}
      <div className="p-3 border-t border-white/5">
        <NavLink to="/profile" className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition no-underline">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.fullName}</p>
            <p className="text-slate-500 text-xs">{user?.role === 'ADMIN' ? '👑 Administrator' : user?.role}</p>
          </div>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLogout(); }}
            className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/5"
            title="Chiqish">
            <HiOutlineArrowRightOnRectangle className="text-lg" />
          </button>
        </NavLink>
      </div>
    </aside>
  );
}
