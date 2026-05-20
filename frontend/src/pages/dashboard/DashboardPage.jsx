import { useState, useEffect } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { reportService } from '../../services/dataService';
import {
  HiOutlineComputerDesktop, HiOutlineWrenchScrewdriver,
  HiOutlineExclamationTriangle, HiOutlineCube,
  HiOutlineCalendarDays, HiOutlineArrowTrendingUp,
  HiOutlineChevronRight, HiOutlineSparkles
} from 'react-icons/hi2';

export default function DashboardPage() {
  const { user } = useAuthContext();
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getDashboardKpi()
      .then(res => setKpi(res.data))
      .catch(() => setKpi({
        totalEquipment: 0, pprCompletionRate: 0, pprTotalTasks: 0,
        pprCompletedTasks: 0, overdueTasks: 0, lowStockAlerts: 0, todayTasks: 0
      }))
      .finally(() => setLoading(false));
  }, []);

  const kpiCards = [
    {
      label: 'Jami uskunalar', value: kpi?.totalEquipment, sub: "Barcha uskunalar",
      icon: HiOutlineComputerDesktop,
      bgLight: '#eff6ff', iconColor: '#2563eb', ringColor: 'rgba(59,130,246,0.2)'
    },
    {
      label: 'PPR Rejasi', value: kpi ? `${kpi.pprCompletionRate}%` : '—',
      sub: kpi ? `${kpi.pprCompletedTasks} ta bajarildi` : '',
      icon: HiOutlineArrowTrendingUp,
      bgLight: '#ecfdf5', iconColor: '#059669', ringColor: 'rgba(16,185,129,0.2)'
    },
    {
      label: "Muddati o'tgan", value: kpi?.overdueTasks,
      sub: 'Kechikkan vazifalar',
      icon: HiOutlineExclamationTriangle,
      bgLight: kpi?.overdueTasks > 0 ? '#fff1f2' : '#f8fafc', 
      iconColor: kpi?.overdueTasks > 0 ? '#e11d48' : '#64748b',
      ringColor: kpi?.overdueTasks > 0 ? 'rgba(225,29,72,0.3)' : 'rgba(100,116,139,0.1)',
      alert: kpi?.overdueTasks > 0,
    },
    {
      label: 'Kam qoldiq', value: kpi?.lowStockAlerts,
      sub: 'Tugayotgan qismlar',
      icon: HiOutlineCube,
      bgLight: kpi?.lowStockAlerts > 0 ? '#fffbeb' : '#f8fafc', 
      iconColor: kpi?.lowStockAlerts > 0 ? '#d97706' : '#64748b',
      ringColor: kpi?.lowStockAlerts > 0 ? 'rgba(217,119,6,0.3)' : 'rgba(100,116,139,0.1)',
      alert: kpi?.lowStockAlerts > 0,
    },
    {
      label: 'Bugungi ishlar', value: kpi?.todayTasks,
      sub: 'Bajarilishi shart',
      icon: HiOutlineCalendarDays,
      bgLight: '#f5f3ff', iconColor: '#7c3aed', ringColor: 'rgba(124,58,237,0.2)'
    },
  ];

  const quickActions = [
    { href: '/equipment', icon: HiOutlineComputerDesktop, label: "Uskunalar", desc: "Barcha ro'yxatni ko'rish", bg: '#eff6ff', border: '#bfdbfe', text: '#1e3a8a', iconColor: '#1d4ed8' },
    { href: '/ppr', icon: HiOutlineWrenchScrewdriver, label: 'PPR Vazifalar', desc: 'Rejali ishlar jadvali', bg: '#ecfdf5', border: '#a7f3d0', text: '#064e3b', iconColor: '#047857' },
    { href: '/warehouse', icon: HiOutlineCube, label: 'Omborxona', desc: 'Ehtiyot qismlar hisobi', bg: '#fffbeb', border: '#fde68a', text: '#78350f', iconColor: '#b45309' },
    { href: '/references', icon: HiOutlineCalendarDays, label: "Ma'lumotnomalar", desc: 'Toifa va statuslar', bg: '#f5f3ff', border: '#ddd6fe', text: '#4c1d95', iconColor: '#6d28d9' },
  ];

  const pprPercent = kpi?.pprCompletionRate || 0;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (pprPercent / 100) * circumference;

  return (
    <div style={{ padding: '24px', paddingBottom: '48px', width: '100%', maxWidth: '1600px', margin: '0 auto', boxSizing: 'border-box' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          Xush kelibsiz, 
          <span className="relative inline-block">
            <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">{user?.fullName || 'Admin'}</span>
          </span>
          <HiOutlineSparkles style={{ color: '#fbbf24', fontSize: '32px' }} className="animate-pulse" />
        </h1>
        <p style={{ color: '#64748b', fontSize: '15px', fontWeight: 500, margin: 0 }}>Boshqaruv paneli — tizimning umumiy holati va muhim ko'rsatkichlari</p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '40px' }}>
        {kpiCards.map((card, i) => (
          <div key={i} style={{ flex: '1 1 240px', minWidth: '240px', background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ position: 'absolute', right: '-32px', top: '-32px', width: '128px', height: '128px', borderRadius: '50%', background: card.bgLight, opacity: 0.5, pointerEvents: 'none' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', position: 'relative', zIndex: 10 }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: card.bgLight, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${card.ringColor}` }}>
                <card.icon style={{ fontSize: '26px', color: card.iconColor }} />
              </div>
              {card.alert && (
                <span style={{ display: 'flex', height: '14px', width: '14px', position: 'relative', marginTop: '6px', marginRight: '6px' }}>
                  <span className="animate-ping" style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: '#fb7185', opacity: 0.75 }}></span>
                  <span style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '50%', background: '#f43f5e', border: '2px solid #fff' }}></span>
                </span>
              )}
            </div>
            
            <div style={{ position: 'relative', zIndex: 10, marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ fontSize: '36px', fontWeight: 900, color: '#1e293b', margin: 0, lineHeight: 1 }}>
                {loading ? <span className="skeleton inline-block w-20 h-10 rounded-lg" /> : card.value}
              </p>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#334155', margin: 0, lineHeight: 1.2 }}>{card.label}</p>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8', margin: 0 }}>{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
        {/* PPR Progress Chart */}
        <div style={{ flex: '1 1 400px', minWidth: '320px', background: '#fff', borderRadius: '32px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HiOutlineArrowTrendingUp style={{ color: '#10b981', fontSize: '22px' }} />
            PPR Bajarilishi
          </h3>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
              <svg width="180" height="180" style={{ transform: 'rotate(-90deg)', position: 'relative', zIndex: 10 }}>
                <circle cx="90" cy="90" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="14" />
                <circle cx="90" cy="90" r={radius} fill="none"
                  stroke="url(#pprGrad)" strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - strokeDash}
                  style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                <defs>
                  <linearGradient id="pprGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
                <span style={{ fontSize: '40px', fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>{pprPercent}%</span>
                <span style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em', color: '#059669', marginTop: '4px' }}>Bajarildi</span>
              </div>
            </div>

            <div style={{ width: '100%', display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, textAlign: 'center', padding: '20px', borderRadius: '24px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em', color: '#64748b', margin: '0 0 8px 0' }}>Jami vazifa</p>
                <p style={{ fontSize: '24px', fontWeight: 900, color: '#1e293b', margin: 0 }}>{kpi?.pprTotalTasks || 0}</p>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '20px', borderRadius: '24px', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                <p style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em', color: '#059669', margin: '0 0 8px 0' }}>Bajarilgan</p>
                <p style={{ fontSize: '24px', fontWeight: 900, color: '#047857', margin: 0 }}>{kpi?.pprCompletedTasks || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ flex: '2 1 600px', minWidth: '320px', background: '#fff', borderRadius: '32px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HiOutlineSparkles style={{ color: '#3b82f6', fontSize: '22px' }} />
            Tezkor amallar
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', width: '100%' }}>
            {quickActions.map((action, i) => (
              <a key={i} href={action.href} style={{ flex: '1 1 280px', minWidth: '250px', display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', borderRadius: '24px', background: action.bg, border: `1px solid ${action.border}`, textDecoration: 'none', transition: 'all 0.3s' }}
                className="hover:-translate-y-1 hover:shadow-md group">
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <action.icon style={{ fontSize: '28px', color: action.iconColor }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '17px', fontWeight: 700, color: action.text, margin: '0 0 6px 0', lineHeight: 1.2 }}>{action.label}</p>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: action.text, opacity: 0.8, margin: 0, lineHeight: 1.4 }}>{action.desc}</p>
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <HiOutlineChevronRight style={{ fontSize: '18px', color: action.iconColor }} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Overdue Warning Banner */}
      {kpi?.overdueTasks > 0 && (
        <div style={{ marginTop: '32px', background: 'linear-gradient(90deg, #fff1f2, #fef2f2)', borderRadius: '32px', padding: '32px', border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #f43f5e, #e11d48)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 10px 15px -3px rgba(225,29,72,0.3)' }}>
            <HiOutlineExclamationTriangle style={{ color: '#fff', fontSize: '28px' }} />
          </div>
          <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
            <h4 style={{ fontSize: '20px', fontWeight: 900, color: '#9f1239', margin: '0 0 8px 0' }}>
              Diqqat! {kpi.overdueTasks} ta vazifa muddati o'tgan
            </h4>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#be123c', margin: 0 }}>
              Uskunalar xavfsizligi va ishlash davomiyligini ta'minlash uchun kechikkan PPR vazifalarini zudlik bilan ko'rib chiqing. Bu juda muhim!
            </p>
          </div>
          <a href="/ppr" style={{ padding: '16px 32px', background: 'linear-gradient(90deg, #e11d48, #be123c)', color: '#fff', fontSize: '16px', fontWeight: 700, borderRadius: '16px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(225,29,72,0.2)' }}>
            Vazifalarga o'tish
            <HiOutlineChevronRight style={{ fontSize: '18px' }} />
          </a>
        </div>
      )}
    </div>
  );
}
