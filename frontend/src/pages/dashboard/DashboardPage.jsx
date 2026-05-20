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
      label: 'Jami uskunalar', value: kpi?.totalEquipment, sub: "Barcha ro'yxatdagi uskunalar",
      icon: HiOutlineComputerDesktop,
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      bgDecor: 'bg-blue-500',
    },
    {
      label: 'PPR bajarilish', value: kpi ? `${kpi.pprCompletionRate}%` : '—',
      sub: kpi ? `${kpi.pprCompletedTasks} / ${kpi.pprTotalTasks} vazifa` : '',
      icon: HiOutlineArrowTrendingUp,
      gradient: 'from-emerald-500 via-emerald-600 to-teal-600',
      bgDecor: 'bg-emerald-500',
    },
    {
      label: "Muddati o'tgan", value: kpi?.overdueTasks,
      sub: 'Kechikkan vazifalar soni',
      icon: HiOutlineExclamationTriangle,
      gradient: kpi?.overdueTasks > 0 ? 'from-red-500 via-rose-500 to-pink-600' : 'from-slate-400 to-slate-500',
      bgDecor: kpi?.overdueTasks > 0 ? 'bg-red-500' : 'bg-slate-400',
      alert: kpi?.overdueTasks > 0,
    },
    {
      label: 'Kritik qoldiq', value: kpi?.lowStockAlerts,
      sub: 'Minimal chegaradan past',
      icon: HiOutlineCube,
      gradient: kpi?.lowStockAlerts > 0 ? 'from-orange-500 via-amber-500 to-yellow-500' : 'from-slate-400 to-slate-500',
      bgDecor: kpi?.lowStockAlerts > 0 ? 'bg-orange-500' : 'bg-slate-400',
      alert: kpi?.lowStockAlerts > 0,
    },
    {
      label: 'Bugungi vazifalar', value: kpi?.todayTasks,
      sub: 'Bugun bajarilishi kerak',
      icon: HiOutlineCalendarDays,
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-600',
      bgDecor: 'bg-violet-500',
    },
  ];

  const quickActions = [
    { href: '/equipment', icon: HiOutlineComputerDesktop, label: "Uskunalar ro'yxati", desc: "Barcha uskunalarni ko'rish", colors: 'bg-blue-50 hover:bg-blue-100 border-blue-100', text: 'text-blue-700', iconColor: 'text-blue-600' },
    { href: '/ppr', icon: HiOutlineWrenchScrewdriver, label: 'PPR vazifalari', desc: 'Rejali ishlar jadvali', colors: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100', text: 'text-emerald-700', iconColor: 'text-emerald-600' },
    { href: '/warehouse', icon: HiOutlineCube, label: 'Ombor hisobi', desc: 'Ehtiyot qismlar ombori', colors: 'bg-amber-50 hover:bg-amber-100 border-amber-100', text: 'text-amber-700', iconColor: 'text-amber-600' },
    { href: '/references', icon: HiOutlineCalendarDays, label: "Ma'lumotnomalar", desc: 'Toifa, status, joylashuv', colors: 'bg-violet-50 hover:bg-violet-100 border-violet-100', text: 'text-violet-700', iconColor: 'text-violet-600' },
  ];

  // PPR doiraviy progress
  const pprPercent = kpi?.pprCompletionRate || 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDash = (pprPercent / 100) * circumference;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1.5">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Xush kelibsiz, <span className="gradient-text">{user?.fullName || 'Foydalanuvchi'}</span> 👋
          </h1>
        </div>
        <p className="text-slate-500 font-medium">Boshqaruv paneli — tizimning umumiy holati</p>
      </div>

      {/* 5 KPI kartalari (TZ 5.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        {kpiCards.map((card, i) => (
          <div key={i} className="stat-card group animate-fade-in" style={{ animationDelay: `${i * 70}ms` }}>
            <div className={`stat-card::before ${card.bgDecor}`} />
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className="text-white text-xl" />
              </div>
              {card.alert && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {loading ? <span className="skeleton inline-block w-16 h-8" /> : card.value}
            </p>
            <p className="text-sm font-bold text-slate-700 mt-1">{card.label}</p>
            <p className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wide">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* PPR doiraviy grafik (TZ 5.2 — Grafik 2) */}
        <div className="bg-white rounded-3xl p-7 border border-[#f1f5f9] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-lg">
          <h3 className="text-[15px] font-bold text-slate-800 mb-6 uppercase tracking-wider">PPR bajarilishi</h3>
          <div className="flex items-center justify-center mb-2">
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors duration-500" />
              <svg width="140" height="140" className="transform -rotate-90 relative z-10">
                <circle cx="70" cy="70" r="50" fill="none" stroke="#f8fafc" strokeWidth="12" />
                <circle cx="70" cy="70" r="50" fill="none"
                  stroke="url(#pprGrad)" strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={2 * Math.PI * 50 - ((pprPercent / 100) * 2 * Math.PI * 50)}
                  style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                <defs>
                  <linearGradient id="pprGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{pprPercent}%</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">bajarildi</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-6 pt-5 border-t border-slate-100 text-sm">
            <div className="flex flex-col items-center flex-1 border-r border-slate-100">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Jami vazifa</span>
              <span className="text-lg font-bold text-slate-700">{kpi?.pprTotalTasks || 0}</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500/70 mb-1">Bajarilgan</span>
              <span className="text-lg font-bold text-emerald-600">{kpi?.pprCompletedTasks || 0}</span>
            </div>
          </div>
        </div>

        {/* Tezkor amallar */}
        <div className="bg-white rounded-3xl p-7 border border-[#f1f5f9] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] lg:col-span-2 transition-all duration-300 hover:shadow-lg">
          <h3 className="text-[15px] font-bold text-slate-800 mb-6 uppercase tracking-wider">Tezkor amallar</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, i) => (
              <a key={i} href={action.href}
                className={`flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 group ${action.colors} hover:shadow-md hover:-translate-y-1`}>
                <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center ${action.iconColor} bg-white shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                  <action.icon className="text-xl" />
                </div>
                <div className="flex-1">
                  <p className={`text-[15px] font-bold tracking-wide ${action.text}`}>{action.label}</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5 tracking-wide">{action.desc}</p>
                </div>
                <HiOutlineChevronRight className={`text-lg ${action.iconColor} opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300`} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Ogohlantirish banner */}
      {kpi?.overdueTasks > 0 && (
        <div className="card p-5 border-red-200 bg-gradient-to-r from-red-50 to-rose-50 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20 animate-float">
              <HiOutlineExclamationTriangle className="text-white text-xl" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-800">
                ⚠️ {kpi.overdueTasks} ta muddati o'tgan vazifa mavjud!
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                PPR vazifalari bo'limiga o'tib, kechikkan ishlarni ko'rib chiqing.
              </p>
            </div>
            <a href="/ppr" className="btn btn-danger btn-sm whitespace-nowrap">
              Ko'rish →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
