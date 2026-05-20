import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuthContext';
import { equipmentService, referenceService } from '../../services/dataService';
import { HiOutlineComputerDesktop, HiOutlineCheckCircle, HiOutlineWrenchScrewdriver, HiOutlineExclamationTriangle } from 'react-icons/hi2';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, categories: 0, locations: 0, persons: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [eqRes, catRes, locRes, perRes] = await Promise.all([
        equipmentService.getAll({ page: 0, size: 1 }),
        referenceService.categories.getAll(),
        referenceService.locations.getAll(),
        referenceService.responsiblePersons.getAll(),
      ]);
      setStats({
        total: eqRes.data.totalElements || 0,
        categories: catRes.data?.length || 0,
        locations: locRes.data?.length || 0,
        persons: perRes.data?.length || 0,
      });
    } catch {
      // Statistika yuklanmasa default
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { label: 'Jami uskunalar', value: stats.total, icon: HiOutlineComputerDesktop, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
    { label: 'Toifalar', value: stats.categories, icon: HiOutlineCheckCircle, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
    { label: 'Joylashuvlar', value: stats.locations, icon: HiOutlineWrenchScrewdriver, color: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/20' },
    { label: "Mas'ul shaxslar", value: stats.persons, icon: HiOutlineExclamationTriangle, color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/20' },
  ];

  return (
    <div>
      {/* Sarlavha */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Xush kelibsiz, {user?.fullName || 'Foydalanuvchi'} 👋
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">Tizimning umumiy holati</p>
      </div>

      {/* Statistika kartochkalari */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-color)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-300 group"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} ${card.shadow} shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className="text-white text-xl" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">
              {loading ? '—' : card.value}
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Tezkor havolalar */}
      <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-color)] shadow-[var(--shadow-sm)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Tezkor amallar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a href="/equipment" className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group">
            <HiOutlineComputerDesktop className="text-blue-600 text-xl group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-blue-700">Uskunalar ro'yxati</span>
          </a>
          <a href="/references" className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors group">
            <HiOutlineCheckCircle className="text-emerald-600 text-xl group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-emerald-700">Ma'lumotnomalar</span>
          </a>
          <a href="/users" className="flex items-center gap-3 p-4 rounded-xl bg-violet-50 hover:bg-violet-100 transition-colors group">
            <HiOutlineWrenchScrewdriver className="text-violet-600 text-xl group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-violet-700">Foydalanuvchilar</span>
          </a>
        </div>
      </div>
    </div>
  );
}
