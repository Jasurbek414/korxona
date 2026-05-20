import { useState, useEffect } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { reportService } from '../../services/dataService';
import { HiOutlineComputerDesktop, HiOutlineWrenchScrewdriver, HiOutlineExclamationTriangle, HiOutlineCube, HiOutlineCalendarDays } from 'react-icons/hi2';

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

  const cards = [
    {
      label: 'Jami uskunalar', value: kpi?.totalEquipment,
      icon: HiOutlineComputerDesktop,
      color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20',
      sub: 'Toifalar bo\'yicha taqsimlangan',
    },
    {
      label: 'PPR bajarilish', value: kpi ? `${kpi.pprCompletionRate}%` : '—',
      icon: HiOutlineWrenchScrewdriver,
      color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20',
      sub: kpi ? `${kpi.pprCompletedTasks}/${kpi.pprTotalTasks} vazifa` : '',
    },
    {
      label: 'Muddati o\'tgan', value: kpi?.overdueTasks,
      icon: HiOutlineExclamationTriangle,
      color: kpi?.overdueTasks > 0 ? 'from-red-500 to-rose-600' : 'from-slate-400 to-slate-500',
      shadow: kpi?.overdueTasks > 0 ? 'shadow-red-500/20' : 'shadow-slate-400/20',
      sub: 'Kechikkan vazifalar',
    },
    {
      label: 'Kritik qoldiq', value: kpi?.lowStockAlerts,
      icon: HiOutlineCube,
      color: kpi?.lowStockAlerts > 0 ? 'from-orange-500 to-amber-600' : 'from-slate-400 to-slate-500',
      shadow: kpi?.lowStockAlerts > 0 ? 'shadow-orange-500/20' : 'shadow-slate-400/20',
      sub: 'Minimal chegaradan past',
    },
    {
      label: 'Bugungi vazifalar', value: kpi?.todayTasks,
      icon: HiOutlineCalendarDays,
      color: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/20',
      sub: 'Bugun bajarilishi kerak',
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Sarlavha */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Xush kelibsiz, {user?.fullName || 'Foydalanuvchi'} 👋
        </h1>
        <p className="text-slate-500 mt-1">Tizimning umumiy holati — Boshqaruv paneli</p>
      </div>

      {/* 5 ta KPI (TZ 5.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card, i) => (
          <div key={i}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group animate-fade-in"
            style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} ${card.shadow} shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className="text-white text-xl" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800">{loading ? '—' : card.value}</p>
            <p className="text-sm text-slate-600 mt-1 font-medium">{card.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Tezkor amallar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Tezkor amallar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <a href="/equipment" className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group">
            <HiOutlineComputerDesktop className="text-blue-600 text-xl group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-blue-700">Uskunalar ro'yxati</span>
          </a>
          <a href="/ppr" className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors group">
            <HiOutlineWrenchScrewdriver className="text-emerald-600 text-xl group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-emerald-700">PPR vazifalari</span>
          </a>
          <a href="/warehouse" className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors group">
            <HiOutlineCube className="text-amber-600 text-xl group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-amber-700">Ombor hisobi</span>
          </a>
          <a href="/references" className="flex items-center gap-3 p-4 rounded-xl bg-violet-50 hover:bg-violet-100 transition-colors group">
            <HiOutlineCalendarDays className="text-violet-600 text-xl group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-violet-700">Ma'lumotnomalar</span>
          </a>
        </div>
      </div>

      {/* Muddati o'tganlar alert */}
      {kpi?.overdueTasks > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <HiOutlineExclamationTriangle className="text-red-600 text-xl" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-800">
                {kpi.overdueTasks} ta muddati o'tgan vazifa mavjud!
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                PPR vazifalari bo'limiga o'ting va ularni ko'rib chiqing.
              </p>
            </div>
            <a href="/ppr" className="ml-auto px-4 py-2 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700 transition">
              Ko'rish →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
