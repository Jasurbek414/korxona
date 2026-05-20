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

  const linkStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '10px 16px',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.25s ease',
    position: 'relative',
    overflow: 'hidden',
    textDecoration: 'none',
    cursor: 'pointer',
    color: isActive ? '#ffffff' : '#94a3b8',
    background: isActive ? 'rgba(37,99,235,0.08)' : 'transparent',
  });

  const indicatorStyle = {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '3px',
    height: '28px',
    borderRadius: '0 6px 6px 0',
    background: '#3b82f6',
    boxShadow: '0 0 12px rgba(59,130,246,0.6)',
  };

  const iconStyle = (isActive) => ({
    fontSize: '20px',
    transition: 'all 0.25s ease',
    color: isActive ? '#3b82f6' : '#64748b',
    filter: isActive ? 'drop-shadow(0 0 6px rgba(59,130,246,0.5))' : 'none',
    flexShrink: 0,
  });

  const renderLink = (item) => (
    <NavLink key={item.path} to={item.path} style={({ isActive }) => linkStyle(isActive)}>
      {({ isActive }) => (
        <>
          {isActive && <div style={indicatorStyle} />}
          <item.icon style={iconStyle(isActive)} />
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, height: '100vh', width: '256px',
      background: '#0B1120',
      borderRight: '1px solid rgba(255,255,255,0.04)',
      display: 'flex', flexDirection: 'column', zIndex: 40,
      boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
    }}>
      {/* Logo + Language */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
          <div style={{
            width: '36px', height: '36px', flexShrink: 0, borderRadius: '12px',
            background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(37,99,235,0.4)',
          }}>
            <HiOutlineComputerDesktop style={{ color: '#fff', fontSize: '18px' }} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h2 style={{
              color: '#fff', fontWeight: 900, fontSize: '13px', letterSpacing: '0.2em',
              lineHeight: 1, margin: '0 0 4px 0',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>BOSHLIQ</h2>
            <p style={{
              color: '#64748b', fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', margin: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{t('auth.loginSubtitle')}</p>
          </div>
        </div>
        <button
          onClick={() => changeLanguage(i18n.language === 'uz' ? 'ru' : 'uz')}
          style={{
            width: '32px', height: '32px', flexShrink: 0, borderRadius: '8px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            color: '#cbd5e1', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s',
          }}
          title={i18n.language === 'uz' ? "Русский" : "O'zbekcha"}
        >
          {i18n.language === 'uz' ? 'UZ' : 'RU'}
        </button>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1, padding: '20px 16px', overflowY: 'auto',
        msOverflowStyle: 'none', scrollbarWidth: 'none',
      }}>
        <p style={{
          padding: '8px 16px', fontSize: '10px', fontWeight: 700,
          color: 'rgba(100,116,139,0.6)', textTransform: 'uppercase',
          letterSpacing: '0.15em', marginBottom: '8px',
        }}>{t('sidebar.main')}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map(renderLink)}
        </div>

        {isAdmin && (
          <div style={{ paddingTop: '20px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <p style={{
              padding: '8px 16px', fontSize: '10px', fontWeight: 700,
              color: 'rgba(100,116,139,0.6)', textTransform: 'uppercase',
              letterSpacing: '0.15em', marginBottom: '8px',
            }}>Administrator</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {adminItems.map(renderLink)}
            </div>
          </div>
        )}
      </nav>

      {/* Profile */}
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px', borderRadius: '16px',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)',
        }}>
          <div style={{
            width: '40px', height: '40px', flexShrink: 0, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '14px',
            boxShadow: '0 0 15px rgba(99,102,241,0.3)',
          }}>
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              color: '#e2e8f0', fontSize: '13px', fontWeight: 700, margin: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3,
            }}>{user?.fullName}</p>
            <p style={{ color: '#64748b', fontSize: '11px', fontWeight: 500, margin: '2px 0 0 0' }}>
              {user?.role === 'ADMIN' ? 'Administrator' : user?.role}
            </p>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLogout(); }}
            style={{
              width: '32px', height: '32px', flexShrink: 0, borderRadius: '10px',
              background: 'transparent', border: 'none', color: '#64748b',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
            }}
            title="Chiqish"
          >
            <HiOutlineArrowRightOnRectangle style={{ fontSize: '18px' }} />
          </button>
        </div>
      </div>
    </aside>
  );
}
