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
    `flex items-center gap-3.5 px-4 py-3 rounded-[14px] text-[14px] font-medium transition-all duration-300 group relative overflow-hidden ${
      isActive
        ? 'text-white bg-blue-600/10'
        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
    }`;

  const iconClass = (isActive) => 
    `text-[20px] transition-all duration-300 ${
      isActive 
        ? 'text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' 
        : 'text-slate-500 group-hover:text-slate-300'
    }`;

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-[#0B1120] border-r border-white/[0.04] flex flex-col z-40 shadow-2xl">
      {/* Logo Area */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-white/[0.04] gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 shrink-0 bg-gradient-to-b from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <HiOutlineComputerDesktop className="text-white text-[18px]" />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="text-white font-black text-[13px] tracking-[0.2em] leading-none mb-1 truncate">BOSHLIQ</h2>
            <p className="text-slate-500 text-[9px] font-semibold tracking-wider uppercase truncate">{t('auth.loginSubtitle')}</p>
          </div>
        </div>
        {/* Language Switcher */}
        <button 
          onClick={() => changeLanguage(i18n.language === 'uz' ? 'ru' : 'uz')}
          className="flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] text-[10px] font-bold tracking-widest text-slate-300 hover:text-white transition-all duration-300"
          title={i18n.language === 'uz' ? "Русский" : "O'zbekcha"}
        >
          {i18n.language === 'uz' ? 'UZ' : 'RU'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-hide">
        <p className="px-4 py-2 text-[10px] font-bold text-slate-500/70 uppercase tracking-[0.15em] mb-2">{t('sidebar.main')}</p>
        {menuItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClass}>
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.6)]" />}
                <item.icon className={iconClass(isActive)} />
                <span className="pt-[2px]">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {isAdmin && (
          <div className="pt-6 mt-6 border-t border-white/[0.04]">
            <p className="px-4 py-2 text-[10px] font-bold text-slate-500/70 uppercase tracking-[0.15em] mb-2">
              Administrator
            </p>
            <div className="space-y-1.5">
              {adminItems.map((item) => (
                <NavLink key={item.path} to={item.path} className={linkClass}>
                  {({ isActive }) => (
                    <>
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.6)]" />}
                      <item.icon className={iconClass(isActive)} />
                      <span className="pt-[2px]">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-white/[0.04] bg-[#0B1120]">
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300">
          <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-slate-200 text-[13px] font-bold truncate leading-tight">{user?.fullName}</p>
            <p className="text-slate-500 text-[11px] font-medium mt-0.5">{user?.role === 'ADMIN' ? 'Administrator' : user?.role}</p>
          </div>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLogout(); }}
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300"
            title="Chiqish"
          >
            <HiOutlineArrowRightOnRectangle className="text-[18px]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
