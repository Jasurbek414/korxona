import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { equipmentService, referenceService } from '../../services/dataService';
import { useAuth } from '../../hooks/useAuthContext';
import toast from 'react-hot-toast';
import {
  HiOutlineMagnifyingGlass,
  HiOutlinePlusCircle,
  HiOutlineFunnel,
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineQrCode,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineXMark,
} from 'react-icons/hi2';

export default function EquipmentListPage() {
  const { isOperator } = useAuth();
  const navigate = useNavigate();

  // Ma'lumotlar
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0, page: 0 });
  const [loading, setLoading] = useState(true);

  // Qidiruv va filtrlar
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    categoryId: '', statusId: '', locationId: '', responsiblePersonId: '', manufacturerId: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('desc');

  // Ma'lumotnomalar (filtr uchun)
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [persons, setPersons] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);

  useEffect(() => {
    loadReferences();
  }, []);

  useEffect(() => {
    loadEquipment();
  }, [page, sortBy, sortDir, filters]);

  // TZ: debounce 300ms qidiruv
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      loadEquipment();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadReferences = async () => {
    try {
      const [cat, st, loc, per, man] = await Promise.all([
        referenceService.categories.getAll(),
        referenceService.statuses.getAll(),
        referenceService.locations.getAll(),
        referenceService.responsiblePersons.getAll(),
        referenceService.manufacturers.getAll(),
      ]);
      setCategories(cat.data || []);
      setStatuses(st.data || []);
      setLocations(loc.data || []);
      setPersons(per.data || []);
      setManufacturers(man.data || []);
    } catch { /* Filtrlar yuklanmasa — davom */ }
  };

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const params = { page, size: 20, sortBy, sortDir };
      if (search.trim()) params.search = search.trim();
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params[key] = val;
      });
      const res = await equipmentService.getAll(params);
      setData(res.data);
    } catch (err) {
      toast.error('Uskunalarni yuklashda xato');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" uskunasini o'chirmoqchimisiz?`)) return;
    try {
      await equipmentService.delete(id);
      toast.success("Uskuna o'chirildi");
      loadEquipment();
    } catch {
      toast.error("O'chirishda xato");
    }
  };

  const handleGenerateQr = async (id) => {
    try {
      await equipmentService.generateQrCode(id);
      toast.success('QR-kod yaratildi');
    } catch {
      toast.error('QR-kod yaratishda xato');
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const clearFilters = () => {
    setFilters({ categoryId: '', statusId: '', locationId: '', responsiblePersonId: '', manufacturerId: '' });
    setSearch('');
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🖥️ Uskunalar</h1>
          <p className="text-sm text-slate-500 mt-0.5">Jami: {data.totalElements} ta</p>
        </div>
        {isOperator && (
          <button
            onClick={() => navigate('/equipment/new')}
            className="btn btn-primary"
          >
            <HiOutlinePlusCircle className="text-lg" />
            Yangi uskuna
          </button>
        )}
      </div>

      {/* Qidiruv va filtr paneli */}
      <div className="card p-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidiruv: inventar raqami, nom, seriya..."
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all ${
              activeFilterCount > 0
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            <HiOutlineFunnel className="text-base" />
            Filtr {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>

        {/* Kengaytirilgan filtrlar */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-[var(--border-color)] grid grid-cols-2 md:grid-cols-5 gap-3 animate-fade-in">
            <select value={filters.categoryId} onChange={(e) => setFilters({...filters, categoryId: e.target.value})}
              className="px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]">
              <option value="">Barcha toifalar</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nameUz}</option>)}
            </select>
            <select value={filters.statusId} onChange={(e) => setFilters({...filters, statusId: e.target.value})}
              className="px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]">
              <option value="">Barcha statuslar</option>
              {statuses.map(s => <option key={s.id} value={s.id}>{s.nameUz}</option>)}
            </select>
            <select value={filters.locationId} onChange={(e) => setFilters({...filters, locationId: e.target.value})}
              className="px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]">
              <option value="">Barcha joylashuvlar</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <select value={filters.responsiblePersonId} onChange={(e) => setFilters({...filters, responsiblePersonId: e.target.value})}
              className="px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]">
              <option value="">Barcha mas'ullar</option>
              {persons.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
            </select>
            <select value={filters.manufacturerId} onChange={(e) => setFilters({...filters, manufacturerId: e.target.value})}
              className="px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]">
              <option value="">Barcha ishlab chiqaruvchilar</option>
              {manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="col-span-2 md:col-span-5 flex items-center justify-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors">
                <HiOutlineXMark /> Filtrlarni tozalash
              </button>
            )}
          </div>
        )}
      </div>

      {/* Jadval */}
      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--bg-main)] border-b border-[var(--border-color)]">
                <th onClick={() => handleSort('inventoryNumber')} className="px-4 py-3 text-left font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--color-primary)] select-none">Inventar №</th>
                <th onClick={() => handleSort('name')} className="px-4 py-3 text-left font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--color-primary)] select-none">Nomi</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-secondary)]">Toifasi</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-secondary)]">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-secondary)]">Joylashuv</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-secondary)]">Mas'ul</th>
                <th className="px-4 py-3 text-center font-semibold text-[var(--text-secondary)]">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[var(--text-muted)] text-sm">Yuklanmoqda...</span>
                    </div>
                  </td>
                </tr>
              ) : data.content.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <p className="text-[var(--text-muted)]">Uskunalar topilmadi</p>
                  </td>
                </tr>
              ) : (
                data.content.map((eq, i) => (
                  <tr
                    key={eq.id}
                    className="border-b border-[var(--border-color)] hover:bg-blue-50/50 transition-colors cursor-pointer"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-medium text-[var(--color-primary)]">{eq.inventoryNumber}</td>
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{eq.name}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{eq.categoryName}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: eq.statusColor ? `${eq.statusColor}15` : '#f1f5f9',
                          color: eq.statusColor || '#64748b',
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: eq.statusColor || '#94a3b8' }} />
                        {eq.statusName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{eq.locationName}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{eq.responsiblePersonName}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => navigate(`/equipment/${eq.id}`)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Ko'rish">
                          <HiOutlineEye className="text-base" />
                        </button>
                        {isOperator && (
                          <button onClick={() => navigate(`/equipment/${eq.id}/edit`)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all" title="Tahrirlash">
                            <HiOutlinePencilSquare className="text-base" />
                          </button>
                        )}
                        <button onClick={() => handleGenerateQr(eq.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all" title="QR-kod">
                          <HiOutlineQrCode className="text-base" />
                        </button>
                        {isOperator && (
                          <button onClick={() => handleDelete(eq.id, eq.name)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="O'chirish">
                            <HiOutlineTrash className="text-base" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginatsiya */}
        {data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-color)]">
            <p className="text-xs text-[var(--text-muted)]">
              {page * 20 + 1}–{Math.min((page + 1) * 20, data.totalElements)} / {data.totalElements}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-main)] disabled:opacity-30 transition-all"
              >
                <HiOutlineChevronLeft className="text-sm" />
              </button>
              <span className="px-3 py-1 text-sm font-medium text-[var(--text-primary)]">
                {page + 1} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(data.totalPages - 1, page + 1))}
                disabled={page >= data.totalPages - 1}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-main)] disabled:opacity-30 transition-all"
              >
                <HiOutlineChevronRight className="text-sm" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
