import { useState, useEffect } from 'react';
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
  HiOutlineComputerDesktop,
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
    if (!window.confirm(`"${name}" uskunasini o'chirmoqchimisiz?`)) return;
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
    <div style={{ padding: '32px', width: '100%', maxWidth: '1600px', margin: '0 auto', boxSizing: 'border-box' }} className="animate-fade-in">
      {/* Premium Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #2563eb, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(37,99,235,0.3)' }}>
            <HiOutlineComputerDesktop style={{ color: '#fff', fontSize: '28px' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0', tracking: 'tight' }}>Uskunalar ro'yxati</h1>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Jami tizimda: <span style={{ color: '#2563eb', fontWeight: 800 }}>{data.totalElements} ta</span>
            </p>
          </div>
        </div>
        {isOperator && (
          <button
            onClick={() => navigate('/equipment/new')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)', transition: 'all 0.3s' }}
            className="hover:-translate-y-1 hover:shadow-lg"
          >
            <HiOutlinePlusCircle style={{ fontSize: '22px' }} />
            Yangi uskuna qo'shish
          </button>
        )}
      </div>

      {/* Qidiruv va filtr paneli */}
      <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', marginBottom: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <HiOutlineMagnifyingGlass style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '20px' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidiruv: inventar raqami, nom, seriya..."
              style={{ width: '100%', padding: '16px 16px 16px 48px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '16px', fontSize: '15px', fontWeight: 500, color: '#334155', outline: 'none', transition: 'all 0.3s', boxSizing: 'border-box' }}
              onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '0 24px', borderRadius: '16px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s',
              border: activeFilterCount > 0 ? '1px solid #3b82f6' : '1px solid #cbd5e1',
              background: activeFilterCount > 0 ? '#eff6ff' : '#fff',
              color: activeFilterCount > 0 ? '#2563eb' : '#64748b'
            }}
            className="hover:bg-slate-50"
          >
            <HiOutlineFunnel style={{ fontSize: '20px' }} />
            Filtr {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>

        {/* Kengaytirilgan filtrlar */}
        {showFilters && (
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: '16px' }} className="animate-fade-in">
            <select value={filters.categoryId} onChange={(e) => setFilters({...filters, categoryId: e.target.value})}
              style={{ flex: '1 1 200px', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '14px', color: '#334155', outline: 'none', cursor: 'pointer' }}>
              <option value="">Barcha toifalar</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nameUz}</option>)}
            </select>
            <select value={filters.statusId} onChange={(e) => setFilters({...filters, statusId: e.target.value})}
              style={{ flex: '1 1 200px', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '14px', color: '#334155', outline: 'none', cursor: 'pointer' }}>
              <option value="">Barcha statuslar</option>
              {statuses.map(s => <option key={s.id} value={s.id}>{s.nameUz}</option>)}
            </select>
            <select value={filters.locationId} onChange={(e) => setFilters({...filters, locationId: e.target.value})}
              style={{ flex: '1 1 200px', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '14px', color: '#334155', outline: 'none', cursor: 'pointer' }}>
              <option value="">Barcha joylashuvlar</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <select value={filters.responsiblePersonId} onChange={(e) => setFilters({...filters, responsiblePersonId: e.target.value})}
              style={{ flex: '1 1 200px', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '14px', color: '#334155', outline: 'none', cursor: 'pointer' }}>
              <option value="">Barcha mas'ullar</option>
              {persons.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
            </select>
            <select value={filters.manufacturerId} onChange={(e) => setFilters({...filters, manufacturerId: e.target.value})}
              style={{ flex: '1 1 200px', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '14px', color: '#334155', outline: 'none', cursor: 'pointer' }}>
              <option value="">Barcha ishlab chiqaruvchilar</option>
              {manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} style={{ flex: '1 1 100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#fef2f2', border: '1px dashed #fecdd3', color: '#e11d48', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                <HiOutlineXMark style={{ fontSize: '18px' }} /> Filtrlarni tozalash
              </button>
            )}
          </div>
        )}
      </div>

      {/* Jadval */}
      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th onClick={() => handleSort('inventoryNumber')} style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }}>Inventar №</th>
                <th onClick={() => handleSort('name')} style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }}>Nomi</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Toifasi</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joylashuv</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mas'ul</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '64px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%' }} />
                      <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>Ma'lumotlar yuklanmoqda...</span>
                    </div>
                  </td>
                </tr>
              ) : data.content.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '64px', textAlign: 'center' }}>
                    <p style={{ color: '#94a3b8', fontSize: '15px', fontWeight: 500 }}>Uskunalar topilmadi</p>
                  </td>
                </tr>
              ) : (
                data.content.map((eq, i) => (
                  <tr
                    key={eq.id}
                    className="hover:bg-blue-50/30 transition-colors"
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                  >
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700, color: '#2563eb' }}>{eq.inventoryNumber}</td>
                    <td style={{ padding: '16px 24px', fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{eq.name}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 500, color: '#64748b' }}>{eq.categoryName}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: 700,
                        backgroundColor: eq.statusColor ? `${eq.statusColor}15` : '#f1f5f9',
                        color: eq.statusColor || '#64748b',
                      }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: eq.statusColor || '#94a3b8' }} />
                        {eq.statusName}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 500, color: '#64748b' }}>{eq.locationName}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 500, color: '#64748b' }}>{eq.responsiblePersonName}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <button onClick={() => navigate(`/equipment/${eq.id}`)} style={{ padding: '8px', borderRadius: '12px', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-blue-50 hover:text-blue-600" title="Ko'rish">
                          <HiOutlineEye style={{ fontSize: '20px' }} />
                        </button>
                        {isOperator && (
                          <button onClick={() => navigate(`/equipment/${eq.id}/edit`)} style={{ padding: '8px', borderRadius: '12px', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-amber-50 hover:text-amber-600" title="Tahrirlash">
                            <HiOutlinePencilSquare style={{ fontSize: '20px' }} />
                          </button>
                        )}
                        <button onClick={() => handleGenerateQr(eq.id)} style={{ padding: '8px', borderRadius: '12px', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-violet-50 hover:text-violet-600" title="QR-kod">
                          <HiOutlineQrCode style={{ fontSize: '20px' }} />
                        </button>
                        {isOperator && (
                          <button onClick={() => handleDelete(eq.id, eq.name)} style={{ padding: '8px', borderRadius: '12px', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-red-50 hover:text-red-600" title="O'chirish">
                            <HiOutlineTrash style={{ fontSize: '20px' }} />
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', margin: 0 }}>
              Ko'rsatilmoqda: {page * 20 + 1}–{Math.min((page + 1) * 20, data.totalElements)} / {data.totalElements} ta
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                style={{ padding: '8px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.5 : 1 }}
              >
                <HiOutlineChevronLeft style={{ fontSize: '18px' }} />
              </button>
              <span style={{ padding: '0 12px', fontSize: '14px', fontWeight: 700, color: '#334155' }}>
                {page + 1} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(data.totalPages - 1, page + 1))}
                disabled={page >= data.totalPages - 1}
                style={{ padding: '8px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', cursor: page >= data.totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page >= data.totalPages - 1 ? 0.5 : 1 }}
              >
                <HiOutlineChevronRight style={{ fontSize: '18px' }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
