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
      bgLight: 'bg-blue-50', iconColor: 'text-blue-600', ringColor: 'ring-blue-500/20'
    },
    {
      label: 'PPR Rejasi', value: kpi ? `${kpi.pprCompletionRate}%` : '—',
      sub: kpi ? `${kpi.pprCompletedTasks} ta bajarildi` : '',
      icon: HiOutlineArrowTrendingUp,
      bgLight: 'bg-emerald-50', iconColor: 'text-emerald-600', ringColor: 'ring-emerald-500/20'
    },
    {
      label: "Muddati o'tgan", value: kpi?.overdueTasks,
      sub: 'Kechikkan vazifalar',
      icon: HiOutlineExclamationTriangle,
      bgLight: kpi?.overdueTasks > 0 ? 'bg-rose-50' : 'bg-slate-50', 
      iconColor: kpi?.overdueTasks > 0 ? 'text-rose-600' : 'text-slate-500',
      ringColor: kpi?.overdueTasks > 0 ? 'ring-rose-500/30' : 'ring-slate-500/10',
      alert: kpi?.overdueTasks > 0,
    },
    {
      label: 'Kam qoldiq', value: kpi?.lowStockAlerts,
      sub: 'Tugayotgan qismlar',
      icon: HiOutlineCube,
      bgLight: kpi?.lowStockAlerts > 0 ? 'bg-amber-50' : 'bg-slate-50', 
      iconColor: kpi?.lowStockAlerts > 0 ? 'text-amber-600' : 'text-slate-500',
      ringColor: kpi?.lowStockAlerts > 0 ? 'ring-amber-500/30' : 'ring-slate-500/10',
      alert: kpi?.lowStockAlerts > 0,
    },
    {
      label: 'Bugungi ishlar', value: kpi?.todayTasks,
      sub: 'Bajarilishi shart',
      icon: HiOutlineCalendarDays,
      bgLight: 'bg-violet-50', iconColor: 'text-violet-600', ringColor: 'ring-violet-500/20'
    },
  ];

  const quickActions = [
    { href: '/equipment', icon: HiOutlineComputerDesktop, label: "Uskunalar", desc: "Barcha ro'yxatni ko'rish", colors: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900', iconColor: 'text-blue-700' },
    { href: '/ppr', icon: HiOutlineWrenchScrewdriver, label: 'PPR Vazifalar', desc: 'Rejali ishlar jadvali', colors: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900', iconColor: 'text-emerald-700' },
    { href: '/warehouse', icon: HiOutlineCube, label: 'Omborxona', desc: 'Ehtiyot qismlar hisobi', colors: 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900', iconColor: 'text-amber-700' },
    { href: '/references', icon: HiOutlineCalendarDays, label: "Ma'lumotnomalar", desc: 'Toifa va statuslar', colors: 'bg-violet-50 hover:bg-violet-100 border-violet-200 text-violet-900', iconColor: 'text-violet-700' },
  ];

  const pprPercent = kpi?.pprCompletionRate || 0;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (pprPercent / 100) * circumference;

  return (
    <div style={{ paddingBottom: '48px', width: '100%', maxWidth: '1600px', margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 className="text-[32px] md:text-[36px] font-black text-slate-900 tracking-tight leading-tight mb-2 flex items-center gap-3">
          Xush kelibsiz, 
          <span className="relative inline-block">
            <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">{user?.fullName || 'Admin'}</span>
          </span>
          <HiOutlineSparkles className="text-amber-400 text-3xl animate-pulse" />
        </h1>
        <p className="text-slate-500 text-[15px] font-medium tracking-wide">Boshqaruv paneli — tizimning umumiy holati va muhim ko'rsatkichlari</p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '40px' }}>
        {kpiCards.map((card, i) => (
          <div key={i} style={{ flex: '1 1 240px', minWidth: '240px' }} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group flex flex-col">
            <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full ${card.bgLight} opacity-50 group-hover:scale-125 transition-transform duration-700 pointer-events-none`} />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`w-14 h-14 rounded-2xl ${card.bgLight} flex items-center justify-center ring-1 ${card.ringColor} shadow-sm`}>
                <card.icon className={`text-[26px] ${card.iconColor}`} />
              </div>
              {card.alert && (
                <span className="flex h-3.5 w-3.5 relative mt-1.5 mr-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-white"></span>
                </span>
              )}
            </div>
            
            <div className="relative z-10 mt-auto flex flex-col gap-1.5">
              <p className="text-[36px] font-black text-slate-800 tracking-tighter leading-none mb-1">
                {loading ? <span className="skeleton inline-block w-20 h-10 rounded-lg" /> : card.value}
              </p>
              <p className="text-[16px] font-bold text-slate-700 leading-tight">{card.label}</p>
              <p className="text-[13px] font-medium text-slate-400">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
        {/* PPR Progress Chart */}
        <div style={{ flex: '1 1 400px', minWidth: '320px' }} className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-[18px] font-extrabold text-slate-800 mb-8 flex items-center gap-2">
            <HiOutlineArrowTrendingUp className="text-emerald-500 text-xl" />
            PPR Bajarilishi
          </h3>
          <div className="flex flex-col items-center justify-center w-full">
            <div className="relative group flex items-center justify-center mb-8">
              <svg width="180" height="180" className="transform -rotate-90 relative z-10">
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
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <span className="text-[40px] font-black text-slate-800 tracking-tighter leading-none">{pprPercent}%</span>
                <span className="text-[12px] uppercase font-bold tracking-widest text-emerald-600 mt-2">Bajarildi</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-4">
              <div className="text-center p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[12px] uppercase font-bold tracking-widest text-slate-500 mb-2">Jami vazifa</p>
                <p className="text-[24px] font-black text-slate-800">{kpi?.pprTotalTasks || 0}</p>
              </div>
              <div className="text-center p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <p className="text-[12px] uppercase font-bold tracking-widest text-emerald-600 mb-2">Bajarilgan</p>
                <p className="text-[24px] font-black text-emerald-700">{kpi?.pprCompletedTasks || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ flex: '2 1 600px', minWidth: '320px' }} className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-[18px] font-extrabold text-slate-800 mb-8 flex items-center gap-2">
            <HiOutlineSparkles className="text-blue-500 text-xl" />
            Tezkor amallar
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', width: '100%' }}>
            {quickActions.map((action, i) => (
              <a key={i} href={action.href} style={{ flex: '1 1 280px', minWidth: '250px' }}
                className={`flex items-start sm:items-center gap-5 p-6 rounded-[24px] border transition-all duration-300 group ${action.colors} hover:-translate-y-1 hover:shadow-md`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-white shadow-sm ring-1 ring-black/5 shrink-0`}>
                  <action.icon className={`text-[28px] ${action.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-[18px] font-bold tracking-tight leading-tight mb-1.5">{action.label}</p>
                  <p className="text-[14px] font-medium opacity-80 leading-snug">{action.desc}</p>
                </div>
                <div className="hidden sm:flex w-8 h-8 rounded-full bg-white/60 items-center justify-center shrink-0">
                  <HiOutlineChevronRight className={`text-[18px] ${action.iconColor}`} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Overdue Warning Banner */}
      {kpi?.overdueTasks > 0 && (
        <div style={{ marginTop: '32px' }} className="bg-gradient-to-r from-rose-50 to-red-50 rounded-[32px] p-8 border border-red-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 shrink-0">
            <HiOutlineExclamationTriangle className="text-white text-[28px]" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-[20px] font-black text-rose-800 mb-2 tracking-tight">
              Diqqat! {kpi.overdueTasks} ta vazifa muddati o'tgan
            </h4>
            <p className="text-[15px] font-medium text-rose-700/90 max-w-3xl">
              Uskunalar xavfsizligi va ishlash davomiyligini ta'minlash uchun kechikkan PPR vazifalarini zudlik bilan ko'rib chiqing. Bu juda muhim!
            </p>
          </div>
          <a href="/ppr" className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-[16px] font-bold rounded-2xl shadow-md shadow-red-600/20 transition-all duration-300 flex items-center justify-center gap-2">
            Vazifalarga o'tish
            <HiOutlineChevronRight className="text-[18px]" />
          </a>
        </div>
      )}
    </div>
  );
}
