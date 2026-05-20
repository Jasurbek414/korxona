import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuthContext';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n';
import {
  HiOutlineSquares2X2, HiOutlineComputerDesktop, HiOutlineRectangleStack,
  HiOutlineUsers, HiOutlineClipboardDocumentList, HiOutlineArrowRightOnRectangle,
  HiOutlineCog6Tooth, HiOutlineWrenchScrewdriver, HiOutlineCube,
  HiOutlineChartBarSquare, HiOutlineArchiveBox, HiOutlineDocumentArrowUp,
  HiOutlinePencilSquare, HiOutlineSparkles
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

  const renderLink = (item) => (
    <NavLink 
      key={item.path} 
      to={item.path} 
      className={({ isActive }) => 
        `group relative flex items-center gap-4 px-4 py-3 rounded-xl text-[14.5px] font-semibold transition-all duration-300 overflow-hidden outline-none ${
          isActive 
            ? 'text-white shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
            : 'text-slate-400 hover:text-white hover:bg-white/[0.03] hover:translate-x-1'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Active Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-600/5 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
          
          {/* Active Indicator Line */}
          <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[24px] bg-blue-500 rounded-r-full shadow-[0_0_12px_rgba(59,130,246,0.8)] transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'}`} />
          
          <item.icon className={`text-[22px] relative z-10 transition-all duration-300 flex-shrink-0 ${isActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] scale-110' : 'text-slate-500 group-hover:text-slate-300'}`} />
          
          <span className="relative z-10 tracking-wide">{item.label}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, height: '100vh', width: '280px',
      background: 'linear-gradient(180deg, #020617 0%, #0f172a 100%)',
      borderRight: '1px solid rgba(255,255,255,0.03)',
      display: 'flex', flexDirection: 'column', zIndex: 40,
      boxShadow: '4px 0 30px rgba(0,0,0,0.4)',
    }}>
      {/* Logo + Language */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: '12px',
        background: 'rgba(2,6,23,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500 rounded-[14px] blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
            <div style={{
              width: '42px', height: '42px', flexShrink: 0, borderRadius: '14px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', zIndex: 10,
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2)'
            }}>
              <HiOutlineSparkles style={{ color: '#fff', fontSize: '22px' }} />
            </div>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h2 style={{
              color: '#fff', fontWeight: 900, fontSize: '16px', letterSpacing: '0.15em',
              lineHeight: 1.1, margin: '0 0 4px 0',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              textShadow: '0 2px 10px rgba(255,255,255,0.1)'
            }}>BOSHLIQ</h2>
            <p style={{
              color: '#94a3b8', fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em',
              textTransform: 'uppercase', margin: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{t('auth.loginSubtitle')}</p>
          </div>
        </div>
        <button
          onClick={() => changeLanguage(i18n.language === 'uz' ? 'ru' : 'uz')}
          className="hover:bg-white/10 hover:text-white"
          style={{
            width: '36px', height: '36px', flexShrink: 0, borderRadius: '10px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            color: '#cbd5e1', fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          title={i18n.language === 'uz' ? "Русский" : "O'zbekcha"}
        >
          {i18n.language === 'uz' ? 'UZ' : 'RU'}
        </button>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1, padding: '24px 20px', overflowY: 'auto',
        msOverflowStyle: 'none', scrollbarWidth: 'none',
      }}>
        <p style={{
          padding: '0 16px', fontSize: '11px', fontWeight: 800,
          color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase',
          letterSpacing: '0.2em', marginBottom: '12px',
        }}>{t('sidebar.main')}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {menuItems.map(renderLink)}
        </div>

        {isAdmin && (
          <div style={{ paddingTop: '24px', marginTop: '24px', borderTop: '1px dashed rgba(255,255,255,0.05)' }}>
            <p style={{
              padding: '0 16px', fontSize: '11px', fontWeight: 800,
              color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase',
              letterSpacing: '0.2em', marginBottom: '12px',
            }}>Administrator</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {adminItems.map(renderLink)}
            </div>
          </div>
        )}
      </nav>

      {/* Profile */}
      <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(2,6,23,0.3)' }}>
        <div className="group" style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '14px', borderRadius: '20px',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
          transition: 'all 0.3s', cursor: 'pointer'
        }}>
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
            <div style={{
              width: '44px', height: '44px', flexShrink: 0, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: '16px', position: 'relative', zIndex: 10,
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2)'
            }}>
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#0B1120] rounded-full z-20" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              color: '#f8fafc', fontSize: '14px', fontWeight: 700, margin: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2,
            }}>{user?.fullName}</p>
            <p style={{ color: '#94a3b8', fontSize: '11.5px', fontWeight: 500, margin: '3px 0 0 0', letterSpacing: '0.02em' }}>
              {user?.role === 'ADMIN' ? 'Administrator' : user?.role}
            </p>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLogout(); }}
            className="hover:bg-rose-500/10 hover:text-rose-400 text-slate-400"
            style={{
              width: '36px', height: '36px', flexShrink: 0, borderRadius: '12px',
              background: 'transparent', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
            }}
            title="Chiqish"
          >
            <HiOutlineArrowRightOnRectangle style={{ fontSize: '20px' }} />
          </button>
        </div>
      </div>
    </aside>
  );
}
