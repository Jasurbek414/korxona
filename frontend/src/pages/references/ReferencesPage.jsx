import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { referenceService } from '../../services/dataService';
import { useAuth } from '../../hooks/useAuthContext';
import toast from 'react-hot-toast';
import {
  HiOutlinePlusCircle, HiOutlinePencilSquare, HiOutlineTrash,
  HiOutlineXMark, HiOutlineCheck, HiOutlineRectangleStack,
} from 'react-icons/hi2';

const tabs = [
  { key: 'categories', label: 'Toifalar', fields: ['nameUz', 'nameRu', 'description'] },
  { key: 'manufacturers', label: 'Ishlab chiqaruvchilar', fields: ['name', 'country'] },
  { key: 'models', label: 'Modellar', fields: ['name', 'manufacturerId'] },
  { key: 'locations', label: 'Joylashuvlar', fields: ['name', 'building', 'floor', 'room'] },
  { key: 'responsiblePersons', label: "Mas'ul shaxslar", fields: ['fullName', 'position', 'phone', 'email'] },
  { key: 'statuses', label: 'Statuslar', fields: ['nameUz', 'nameRu', 'color', 'description'] },
  { key: 'documentTypes', label: 'Hujjat turlari', fields: ['nameUz', 'nameRu'] },
];

const fieldLabels = {
  nameUz: 'Nomi (uz)', nameRu: 'Nomi (ru)', name: 'Nomi', description: 'Tavsif',
  country: 'Mamlakat', building: 'Bino', floor: 'Qavat', room: 'Xona',
  fullName: 'F.I.O.', position: 'Lavozim', phone: 'Telefon', email: 'Email',
  color: 'Rang', manufacturerId: 'Ishlab chiqaruvchi',
};

export default function ReferencesPage() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('categories');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});

  const currentTab = tabs.find(t => t.key === activeTab);

  useEffect(() => { loadItems(); }, [activeTab]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await referenceService[activeTab].getAll();
      setItems(res.data || []);
    } catch { toast.error('Ma\'lumotlarni yuklashda xato'); }
    finally { setLoading(false); }
  };

  const openForm = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData({ ...item });
    } else {
      setEditItem(null);
      const empty = {};
      currentTab.fields.forEach(f => empty[f] = '');
      setFormData(empty);
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        await referenceService[activeTab].update(editItem.id, formData);
        toast.success('Tahrirlandi');
      } else {
        await referenceService[activeTab].create(formData);
        toast.success('Yaratildi');
      }
      setShowForm(false);
      loadItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xato yuz berdi');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("O'chirmoqchimisiz?")) return;
    try {
      await referenceService[activeTab].delete(id);
      toast.success("O'chirildi");
      loadItems();
    } catch { toast.error("O'chirishda xato"); }
  };

  // Jadval ustunlari (faqat displayable fields)
  const displayFields = currentTab.fields.filter(f => f !== 'manufacturerId');

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <HiOutlineRectangleStack className="text-2xl text-[var(--color-primary)]" />
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Ma'lumotnomalar</h1>
      </div>

      {/* Tablar */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setShowForm(false); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-blue-600/20'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)] border border-[var(--border-color)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Jadval */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-[var(--shadow-sm)]">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-color)]">
          <h2 className="font-semibold text-[var(--text-primary)]">{currentTab.label} ({items.length})</h2>
          {isAdmin && (
            <button onClick={() => openForm()} className="flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-xl hover:bg-[var(--color-primary-dark)] transition-all">
              <HiOutlinePlusCircle /> Qo'shish
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--bg-main)]">
                  <th className="px-4 py-3 text-left font-semibold text-[var(--text-secondary)] w-12">#</th>
                  {displayFields.map(f => (
                    <th key={f} className="px-4 py-3 text-left font-semibold text-[var(--text-secondary)]">{fieldLabels[f] || f}</th>
                  ))}
                  {isAdmin && <th className="px-4 py-3 text-center font-semibold text-[var(--text-secondary)] w-24">Amallar</th>}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={displayFields.length + 2} className="py-12 text-center text-[var(--text-muted)]">Ma'lumot topilmadi</td></tr>
                ) : items.map((item, i) => (
                  <tr key={item.id} className="border-b border-[var(--border-color)] hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3 text-[var(--text-muted)]">{i + 1}</td>
                    {displayFields.map(f => (
                      <td key={f} className="px-4 py-3 text-[var(--text-primary)]">
                        {f === 'color' ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: item[f] || '#ccc' }} />
                            {item[f]}
                          </span>
                        ) : item[f] || '—'}
                      </td>
                    ))}
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openForm(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all">
                            <HiOutlinePencilSquare className="text-base" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                            <HiOutlineTrash className="text-base" />
                          </button>
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

      {/* Modal forma */}
      {showForm && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }} onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
              <h3 className="font-semibold text-lg">{editItem ? 'Tahrirlash' : 'Yangi qo\'shish'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <HiOutlineXMark className="text-xl" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {currentTab.fields.map(f => (
                <div key={f}>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{fieldLabels[f]}</label>
                  {f === 'description' ? (
                    <textarea value={formData[f] || ''} onChange={e => setFormData({...formData, [f]: e.target.value})}
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-500/10 resize-none h-20" />
                  ) : f === 'color' ? (
                    <input type="color" value={formData[f] || '#000000'} onChange={e => setFormData({...formData, [f]: e.target.value})}
                      className="w-16 h-10 rounded-lg border border-[var(--border-color)] cursor-pointer" />
                  ) : (
                    <input type="text" value={formData[f] || ''} onChange={e => setFormData({...formData, [f]: e.target.value})}
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-500/10" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-[var(--border-color)]">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-slate-100 rounded-xl transition-colors">Bekor qilish</button>
              <button onClick={handleSave} className="flex items-center gap-1.5 px-5 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-xl hover:bg-[var(--color-primary-dark)] transition-all">
                <HiOutlineCheck /> Saqlash
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
