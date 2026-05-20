import { useState, useEffect } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { reportService } from '../../services/dataService';
import {
  HiOutlineComputerDesktop, HiOutlineWrenchScrewdriver,
  HiOutlineExclamationTriangle, HiOutlineCube,
  HiOutlineCalendarDays, HiOutlineArrowTrendingUp,
  HiOutlineChevronRight
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
      gradient: 'from-blue-500 to-indigo-600',
      iconColor: 'text-blue-500',
      bgLight: 'bg-blue-50',
    },
    {
      label: 'PPR Rejasi', value: kpi ? `${kpi.pprCompletionRate}%` : '—',
      sub: kpi ? `${kpi.pprCompletedTasks} ta bajarildi` : '',
      icon: HiOutlineArrowTrendingUp,
      gradient: 'from-emerald-400 to-teal-500',
      iconColor: 'text-emerald-500',
      bgLight: 'bg-emerald-50',
    },
    {
      label: "Muddati o'tgan", value: kpi?.overdueTasks,
      sub: 'Kechikkan vazifalar',
      icon: HiOutlineExclamationTriangle,
      gradient: kpi?.overdueTasks > 0 ? 'from-rose-500 to-red-600' : 'from-slate-400 to-slate-500',
      iconColor: kpi?.overdueTasks > 0 ? 'text-red-500' : 'text-slate-500',
      bgLight: kpi?.overdueTasks > 0 ? 'bg-red-50' : 'bg-slate-50',
      alert: kpi?.overdueTasks > 0,
    },
    {
      label: 'Kam qoldiq', value: kpi?.lowStockAlerts,
      sub: 'Tugayotgan qismlar',
      icon: HiOutlineCube,
      gradient: kpi?.lowStockAlerts > 0 ? 'from-amber-400 to-orange-500' : 'from-slate-400 to-slate-500',
      iconColor: kpi?.lowStockAlerts > 0 ? 'text-orange-500' : 'text-slate-500',
      bgLight: kpi?.lowStockAlerts > 0 ? 'bg-orange-50' : 'bg-slate-50',
      alert: kpi?.lowStockAlerts > 0,
    },
    {
      label: 'Bugungi ishlar', value: kpi?.todayTasks,
      sub: 'Bajarilishi shart',
      icon: HiOutlineCalendarDays,
      gradient: 'from-violet-500 to-purple-600',
      iconColor: 'text-violet-500',
      bgLight: 'bg-violet-50',
    },
  ];

  const quickActions = [
    { href: '/equipment', icon: HiOutlineComputerDesktop, label: "Uskunalar", desc: "Barcha ro'yxatni ko'rish", colors: 'bg-blue-50/50 hover:bg-blue-50 border-blue-100', text: 'text-blue-700', iconColor: 'text-blue-600' },
    { href: '/ppr', icon: HiOutlineWrenchScrewdriver, label: 'PPR Vazifalar', desc: 'Rejali ishlar jadvali', colors: 'bg-emerald-50/50 hover:bg-emerald-50 border-emerald-100', text: 'text-emerald-700', iconColor: 'text-emerald-600' },
    { href: '/warehouse', icon: HiOutlineCube, label: 'Omborxona', desc: 'Ehtiyot qismlar hisobi', colors: 'bg-amber-50/50 hover:bg-amber-50 border-amber-100', text: 'text-amber-700', iconColor: 'text-amber-600' },
    { href: '/references', icon: HiOutlineCalendarDays, label: "Ma'lumotnomalar", desc: 'Toifa va statuslar', colors: 'bg-violet-50/50 hover:bg-violet-50 border-violet-100', text: 'text-violet-700', iconColor: 'text-violet-600' },
  ];

  // PPR doiraviy progress
  const pprPercent = kpi?.pprCompletionRate || 0;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (pprPercent / 100) * circumference;

  return (
    <div className="animate-fade-in pb-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight mb-1">
          Xush kelibsiz, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">{user?.fullName || 'Admin'}</span> 👋
        </h1>
        <p className="text-slate-500 text-[14px] font-medium">Boshqaruv paneli — tizimning umumiy holati va tezkor ko'rsatkichlari</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
        {kpiCards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${card.bgLight} opacity-50 group-hover:scale-150 transition-transform duration-700 ease-out`} />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`w-12 h-12 rounded-2xl ${card.bgLight} flex items-center justify-center`}>
                <card.icon className={`text-[22px] ${card.iconColor}`} />
              </div>
              {card.alert && (
                <span className="flex h-3 w-3 relative mt-1 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </div>
            
            <div className="relative z-10">
              <p className="text-[32px] font-black text-slate-800 tracking-tight leading-none mb-2">
                {loading ? <span className="skeleton inline-block w-16 h-8" /> : card.value}
              </p>
              <p className="text-[14px] font-bold text-slate-700 leading-tight">{card.label}</p>
              <p className="text-[12px] font-medium text-slate-400 mt-1">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PPR Progress Chart */}
        <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col h-full">
          <h3 className="text-[16px] font-extrabold text-slate-800 mb-6">PPR Bajarilishi</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative group flex items-center justify-center mb-6">
              <svg width="160" height="160" className="transform -rotate-90">
                <circle cx="80" cy="80" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="12" />
                <circle cx="80" cy="80" r={radius} fill="none"
                  stroke="url(#pprGrad)" strokeWidth="12" strokeLinecap="round"
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
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[36px] font-black text-slate-800 tracking-tighter leading-none">{pprPercent}%</span>
                <span className="text-[11px] uppercase font-bold tracking-widest text-slate-400 mt-1">Bajarildi</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
              <div className="text-center p-3 rounded-2xl bg-slate-50">
                <p className="text-[11px] uppercase font-bold tracking-widest text-slate-400 mb-1">Jami vazifa</p>
                <p className="text-[20px] font-black text-slate-700">{kpi?.pprTotalTasks || 0}</p>
              </div>
              <div className="text-center p-3 rounded-2xl bg-emerald-50">
                <p className="text-[11px] uppercase font-bold tracking-widest text-emerald-600 mb-1">Bajarilgan</p>
                <p className="text-[20px] font-black text-emerald-600">{kpi?.pprCompletedTasks || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] lg:col-span-2 h-full flex flex-col">
          <h3 className="text-[16px] font-extrabold text-slate-800 mb-6">Tezkor amallar</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {quickActions.map((action, i) => (
              <a key={i} href={action.href}
                className={`flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 group ${action.colors} hover:shadow-md hover:-translate-y-1`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${action.iconColor} bg-white shadow-sm group-hover:scale-110 transition-transform duration-500 shrink-0`}>
                  <action.icon className="text-[24px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[16px] font-bold tracking-tight truncate ${action.text}`}>{action.label}</p>
                  <p className="text-[13px] font-medium text-slate-500 mt-0.5 truncate">{action.desc}</p>
                </div>
                <HiOutlineChevronRight className={`text-[20px] ${action.iconColor} opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 shrink-0`} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Overdue Warning Banner */}
      {kpi?.overdueTasks > 0 && (
        <div className="mt-6 bg-red-50 rounded-3xl p-6 border border-red-100 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.1)] flex flex-col sm:flex-row items-center gap-5 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30 shrink-0 animate-float">
            <HiOutlineExclamationTriangle className="text-white text-[24px]" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h4 className="text-[16px] font-extrabold text-red-700 mb-1">
              Diqqat! {kpi.overdueTasks} ta vazifa muddati o'tgan
            </h4>
            <p className="text-[14px] font-medium text-red-600/80">
              Uskunalar xavfsizligi va ishlash davomiyligini ta'minlash uchun kechikkan PPR vazifalarini zudlik bilan ko'rib chiqing.
            </p>
          </div>
          <a href="/ppr" className="w-full sm:w-auto text-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-600/20 transition-all duration-300 hover:-translate-y-0.5">
            Vazifalarga o'tish
          </a>
        </div>
      )}
    </div>
  );
}
