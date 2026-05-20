import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';

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

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📦 Ehtiyot qismlar katalogi</h1>
          <p className="text-sm text-slate-500 mt-1">Jami: {parts.length} ta ehtiyot qism</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              className="input-field pl-9" placeholder="Qidirish..." style={{ width: '220px' }} />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {canEdit && (
            <button onClick={openCreate} className="btn btn-primary">+ Yangi qism</button>
          )}
        </div>
      </div>

      {/* Jadval */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Yuklanmoqda...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <p className="text-4xl mb-2">📦</p>
            <p>Ehtiyot qismlar topilmadi</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nomi</th>
                  <th>Kod</th>
                  <th>Toifasi</th>
                  <th>Birlik</th>
                  <th className="text-right">Narxi</th>
                  <th className="text-right">Min. qoldiq</th>
                  <th className="text-right">Umumiy qoldiq</th>
                  <th>Holat</th>
                  {canEdit && <th className="text-center">Amallar</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <td>
                      <span className="font-medium text-slate-800">{p.name}</span>
                      {p.barcode && <span className="block text-[10px] text-slate-400 font-mono mt-0.5">🔖 {p.barcode}</span>}
                    </td>
                    <td className="font-mono text-xs font-semibold text-blue-600">{p.code}</td>
                    <td className="text-slate-600 text-xs">{p.categoryName || '—'}</td>
                    <td><span className="badge badge-slate">{p.unitName || '—'}</span></td>
                    <td className="text-right font-medium text-slate-700">{Number(p.price || 0).toLocaleString()}</td>
                    <td className="text-right text-slate-500">{p.minStock}</td>
                    <td className="text-right font-bold text-slate-800">{p.totalStock}</td>
                    <td>
                      {p.lowStock ? (
                        <span className="badge badge-red">⚠️ Kam</span>
                      ) : (
                        <span className="badge badge-green">✓ Yetarli</span>
                      )}
                    </td>
                    {canEdit && (
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEdit(p)} className="btn btn-ghost btn-sm" title="Tahrirlash">✏️</button>
                          {user?.role === 'ADMIN' && (
                            <button onClick={() => handleDelete(p.id)} className="btn btn-ghost btn-sm text-red-500" title="O'chirish">🗑️</button>
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
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg mx-4 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-5">
              {editId ? "✏️ Ehtiyot qismni tahrirlash" : "📦 Yangi ehtiyot qism"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Nomi *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="input-field" placeholder="Ehtiyot qism nomi" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Kod *</label>
                  <input required value={form.code} onChange={e => setForm({...form, code: e.target.value})}
                    className="input-field font-mono" placeholder="EQ-001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Toifa</label>
                  <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} className="input-field">
                    <option value="">Tanlanmagan</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.nameUz}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">O'lchov birligi</label>
                  <select value={form.unitId} onChange={e => setForm({...form, unitId: e.target.value})} className="input-field">
                    <option value="">Tanlanmagan</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.nameUz} ({u.shortName})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Narxi (so'm)</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                    className="input-field" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Minimal qoldiq</label>
                  <input type="number" value={form.minStock} onChange={e => setForm({...form, minStock: e.target.value})}
                    className="input-field" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Shtrix-kod</label>
                <input value={form.barcode} onChange={e => setForm({...form, barcode: e.target.value})}
                  className="input-field font-mono" placeholder="1234567890" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tavsif</label>
                <textarea value={form.description} rows={2} onChange={e => setForm({...form, description: e.target.value})}
                  className="input-field" placeholder="Qo'shimcha ma'lumot..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn btn-primary flex-1">
                  {editId ? "💾 Saqlash" : "➕ Qo'shish"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline px-6">Bekor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
