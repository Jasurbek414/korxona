import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuthContext } from '../../hooks/useAuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { 
  HiOutlineCube, 
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineTag,
  HiOutlineArchiveBox
} from 'react-icons/hi2';

// --- CUSTOM SELECT COMPONENT ---
const CustomSelect = ({ value, onChange, options, defaultLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedOption = options.find(o => o.value == value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '100%', padding: '14px 16px', borderRadius: '12px', 
          border: isOpen ? '1px solid #3b82f6' : '1px solid #cbd5e1', 
          background: '#fff', fontSize: '15px', 
          color: value ? '#0f172a' : '#64748b', 
          outline: 'none', cursor: 'pointer', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          boxShadow: isOpen ? '0 0 0 4px rgba(59,130,246,0.1)' : 'none', 
          transition: 'all 0.2s',
          fontWeight: 500,
          boxSizing: 'border-box'
        }}
      >
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selectedOption ? selectedOption.label : defaultLabel}
        </span>
        <svg style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0, marginLeft: '8px' }} width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
      
      {isOpen && (
        <div style={{ 
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', 
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', 
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', 
          zIndex: 50, maxHeight: '280px', overflowY: 'auto', padding: '8px' 
        }}>
          {defaultLabel && (
            <div 
              onClick={() => { onChange(''); setIsOpen(false); }}
              style={{ 
                padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', 
                color: value === '' ? '#2563eb' : '#475569', 
                background: value === '' ? '#eff6ff' : 'transparent', 
                fontWeight: value === '' ? 700 : 500,
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => { if(value !== '') e.target.style.background = '#f8fafc' }}
              onMouseLeave={(e) => { if(value !== '') e.target.style.background = 'transparent' }}
            >
              {defaultLabel}
            </div>
          )}
          {options.map((opt) => (
            <div 
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              style={{ 
                padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', 
                color: value == opt.value ? '#2563eb' : '#475569', 
                background: value == opt.value ? '#eff6ff' : 'transparent', 
                fontWeight: value == opt.value ? 700 : 500, marginTop: '4px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => { if(value != opt.value) e.target.style.background = '#f8fafc' }}
              onMouseLeave={(e) => { if(value != opt.value) e.target.style.background = 'transparent' }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
// --- END CUSTOM SELECT COMPONENT ---

export default function SparePartsPage() {
  const { user } = useAuthContext();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'OPERATOR';

  const [parts, setParts] = useState([]);
  const [units, setUnits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', categoryId: '', unitId: '', price: '', minStock: '', barcode: '', description: '' });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [partsRes, unitsRes, catsRes] = await Promise.all([
        api.get('/spare-parts'),
        api.get('/spare-parts/units'),
        api.get('/spare-parts/categories'),
      ]);
      setParts(partsRes.data);
      setUnits(unitsRes.data);
      setCategories(catsRes.data);
    } catch { toast.error("Ma'lumotlarni yuklashda xato"); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = parts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditId(null);
    setForm({ name: '', code: '', categoryId: '', unitId: '', price: '', minStock: '', barcode: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditId(p.id);
    setForm({
      name: p.name, code: p.code, categoryId: p.categoryId || '',
      unitId: p.unitId || '', price: p.price || '', minStock: p.minStock || '',
      barcode: p.barcode || '', description: p.description || ''
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: form.price ? Number(form.price) : 0, minStock: form.minStock ? Number(form.minStock) : 0 };
      if (editId) {
        await api.put(`/spare-parts/${editId}`, payload);
        toast.success("O'zgarishlar saqlandi");
      } else {
        await api.post('/spare-parts', payload);
        toast.success('Ehtiyot qism qo\'shildi');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xato');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await api.delete(`/spare-parts/${id}`);
      toast.success("O'chirildi");
      fetchAll();
    } catch { toast.error("O'chirishda xato"); }
  };

  const inputStyle = { width: '100%', padding: '14px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '15px', fontWeight: 500, color: '#334155', outline: 'none', transition: 'all 0.3s', boxSizing: 'border-box' };
  const thStyle = { padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' };
  const tdStyle = { padding: '16px 24px', fontSize: '14px', color: '#334155', borderBottom: '1px solid #f1f5f9', fontWeight: 500 };

  return (
    <div style={{ padding: '32px', width: '100%', maxWidth: '1600px', margin: '0 auto', boxSizing: 'border-box' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(245,158,11,0.3)' }}>
            <HiOutlineCube style={{ color: '#fff', fontSize: '28px' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0', tracking: 'tight' }}>Ehtiyot qismlar katalogi</h1>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Jami: {parts.length} ta ehtiyot qism
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              style={{ padding: '12px 16px 12px 44px', width: '280px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', transition: 'all 0.3s' }}
              placeholder="Qidirish (nomi yoki kod)..." 
              className="focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <HiOutlineMagnifyingGlass style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '20px' }} />
          </div>
          {canEdit && (
            <button onClick={openCreate}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)', transition: 'all 0.3s' }}
              className="hover:-translate-y-1 hover:shadow-lg"
            >
              <HiOutlinePlus style={{ fontSize: '20px' }} /> Yangi qism
            </button>
          )}
        </div>
      </div>

      {/* Jadval */}
      <div style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '64px', textAlign: 'center' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', margin: '0 auto 16px' }} />
            <span style={{ color: '#94a3b8', fontSize: '15px', fontWeight: 600 }}>Yuklanmoqda...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center' }}>
            <HiOutlineArchiveBox style={{ fontSize: '64px', color: '#cbd5e1', margin: '0 auto 16px', display: 'block' }} />
            <p style={{ color: '#94a3b8', fontSize: '16px', fontWeight: 600, margin: 0 }}>Ehtiyot qismlar topilmadi</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Nomi</th>
                  <th style={thStyle}>Kod</th>
                  <th style={thStyle}>Toifasi</th>
                  <th style={thStyle}>Birlik</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Narxi</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Min. qoldiq</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Umumiy qoldiq</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Holat</th>
                  {canEdit && <th style={{ ...thStyle, textAlign: 'center' }}>Amallar</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} className="animate-fade-in hover:bg-slate-50" style={{ animationDelay: `${i * 30}ms`, transition: 'background 0.2s' }}>
                    <td style={{ ...tdStyle, color: '#0f172a', fontWeight: 700 }}>
                      <span style={{ display: 'block' }}>{p.name}</span>
                      {p.barcode && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace', marginTop: '4px' }}>
                          <HiOutlineTag /> {p.barcode}
                        </span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>{p.code}</td>
                    <td style={{ ...tdStyle, color: '#64748b', fontSize: '13px' }}>{p.categoryName || '—'}</td>
                    <td style={{ ...tdStyle }}>
                      <span style={{ padding: '6px 12px', borderRadius: '8px', background: '#f1f5f9', color: '#475569', fontSize: '12px', fontWeight: 700 }}>
                        {p.unitName || '—'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700 }}>{Number(p.price || 0).toLocaleString()}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: '#64748b' }}>{p.minStock}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>{p.totalStock}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {p.lowStock ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 800, background: '#fecaca', color: '#991b1b' }}>
                          <HiOutlineExclamationTriangle style={{ fontSize: '14px' }} /> Kam
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 800, background: '#d1fae5', color: '#065f46' }}>
                          <HiOutlineCheckCircle style={{ fontSize: '14px' }} /> Yetarli
                        </span>
                      )}
                    </td>
                    {canEdit && (
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <button onClick={() => openEdit(p)} title="Tahrirlash"
                            style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-blue-50">
                            <HiOutlinePencilSquare style={{ fontSize: '18px' }} />
                          </button>
                          {user?.role === 'ADMIN' && (
                            <button onClick={() => handleDelete(p.id)} title="O'chirish"
                              style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #fecaca', background: '#fff', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-red-50">
                              <HiOutlineTrash style={{ fontSize: '18px' }} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="animate-fade-in" style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '600px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', margin: '16px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {editId ? <HiOutlinePencilSquare style={{ color: '#3b82f6', fontSize: '24px' }} /> : <HiOutlineCube style={{ color: '#3b82f6', fontSize: '24px' }} />}
              </div>
              {editId ? "Ehtiyot qismni tahrirlash" : "Yangi ehtiyot qism"}
            </h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Nomi *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    style={inputStyle} placeholder="Ehtiyot qism nomi" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Kod *</label>
                  <input required value={form.code} onChange={e => setForm({...form, code: e.target.value})}
                    style={{ ...inputStyle, fontFamily: 'monospace' }} placeholder="EQ-001" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Toifa</label>
                  <CustomSelect 
                    value={form.categoryId} onChange={val => setForm({...form, categoryId: val})}
                    options={categories.map(c => ({ value: c.id, label: c.nameUz }))} defaultLabel="Tanlanmagan"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>O'lchov birligi</label>
                  <CustomSelect 
                    value={form.unitId} onChange={val => setForm({...form, unitId: val})}
                    options={units.map(u => ({ value: u.id, label: `${u.nameUz} (${u.shortName})` }))} defaultLabel="Tanlanmagan"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Narxi (so'm)</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                    style={inputStyle} placeholder="0" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Minimal qoldiq</label>
                  <input type="number" value={form.minStock} onChange={e => setForm({...form, minStock: e.target.value})}
                    style={inputStyle} placeholder="0" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Shtrix-kod</label>
                <input value={form.barcode} onChange={e => setForm({...form, barcode: e.target.value})}
                  style={{ ...inputStyle, fontFamily: 'monospace' }} placeholder="1234567890" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Tavsif</label>
                <textarea value={form.description} rows={2} onChange={e => setForm({...form, description: e.target.value})}
                  style={{ ...inputStyle, resize: 'none', height: '80px' }} placeholder="Qo'shimcha ma'lumot..." />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }} className="hover:-translate-y-1 transition-all hover:shadow-lg">
                  {editId ? "Saqlash" : "Qo'shish"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '14px 24px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }} className="hover:bg-slate-100 transition-colors">
                  Bekor
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
