import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { referenceService } from '../../services/dataService';
import { useAuthContext } from '../../hooks/useAuthContext';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash,
  HiOutlineXMark, HiOutlineCheck, HiOutlineRectangleStack,
  HiOutlineFolder, HiOutlineBuildingOffice2, HiOutlineDevicePhoneMobile,
  HiOutlineMapPin, HiOutlineUserGroup, HiOutlineTag, HiOutlineDocumentText,
  HiOutlineArchiveBox
} from 'react-icons/hi2';

const tabs = [
  { key: 'categories', label: 'Toifalar', icon: HiOutlineFolder, fields: ['nameUz', 'nameRu', 'description'] },
  { key: 'manufacturers', label: 'Ishlab chiqaruvchilar', icon: HiOutlineBuildingOffice2, fields: ['name', 'country'] },
  { key: 'models', label: 'Modellar', icon: HiOutlineDevicePhoneMobile, fields: ['name', 'manufacturerId'] },
  { key: 'locations', label: 'Joylashuvlar', icon: HiOutlineMapPin, fields: ['name', 'building', 'floor', 'room'] },
  { key: 'responsiblePersons', label: "Mas'ul shaxslar", icon: HiOutlineUserGroup, fields: ['fullName', 'position', 'phone', 'email'] },
  { key: 'statuses', label: 'Statuslar', icon: HiOutlineTag, fields: ['nameUz', 'nameRu', 'color', 'description'] },
  { key: 'documentTypes', label: 'Hujjat turlari', icon: HiOutlineDocumentText, fields: ['nameUz', 'nameRu'] },
];

const fieldLabels = {
  nameUz: 'Nomi (uz)', nameRu: 'Nomi (ru)', name: 'Nomi', description: 'Tavsif',
  country: 'Mamlakat', building: 'Bino', floor: 'Qavat', room: 'Xona',
  fullName: 'F.I.O.', position: 'Lavozim', phone: 'Telefon', email: 'Email',
  color: 'Rang', manufacturerId: 'Ishlab chiqaruvchi',
};

export default function ReferencesPage() {
  const { user } = useAuthContext();
  const isAdmin = user?.role === 'ADMIN';

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

  const handleSave = async (e) => {
    e.preventDefault();
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

  // Jadval ustunlari
  const displayFields = currentTab.fields.filter(f => f !== 'manufacturerId');

  const inputStyle = { width: '100%', padding: '14px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '15px', fontWeight: 500, color: '#334155', outline: 'none', transition: 'all 0.3s', boxSizing: 'border-box' };
  const thStyle = { padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' };
  const tdStyle = { padding: '16px 24px', fontSize: '14px', color: '#334155', borderBottom: '1px solid #f1f5f9', fontWeight: 500 };

  return (
    <div style={{ padding: '32px', width: '100%', maxWidth: '1600px', margin: '0 auto', boxSizing: 'border-box' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(14,165,233,0.3)' }}>
            <HiOutlineRectangleStack style={{ color: '#fff', fontSize: '28px' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0', tracking: 'tight' }}>Ma'lumotnomalar</h1>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tizimdagi asosiy ro'yxatlar va kataloglar
            </p>
          </div>
        </div>
      </div>

      {/* Tablar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setShowForm(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '16px',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', border: 'none', whiteSpace: 'nowrap',
                background: isActive ? '#0ea5e9' : '#fff',
                color: isActive ? '#fff' : '#475569',
                boxShadow: isActive ? '0 10px 15px -3px rgba(14,165,233,0.3)' : '0 4px 6px -1px rgba(0,0,0,0.05)',
                border: isActive ? 'none' : '1px solid #cbd5e1'
              }}>
              <Icon style={{ fontSize: '18px' }} /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* Jadval qismi */}
      <div style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        {/* Jadval Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            <currentTab.icon style={{ color: '#0ea5e9', fontSize: '24px' }} />
            {currentTab.label} <span style={{ color: '#94a3b8', fontSize: '14px' }}>({items.length})</span>
          </h2>
          {isAdmin && (
            <button onClick={() => openForm()}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(14,165,233,0.3)', transition: 'all 0.3s' }}
              className="hover:-translate-y-1 hover:shadow-lg"
            >
              <HiOutlinePlus style={{ fontSize: '18px' }} /> Qo'shish
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '64px', textAlign: 'center' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#0ea5e9', borderRadius: '50%', margin: '0 auto 16px' }} />
            <span style={{ color: '#94a3b8', fontSize: '15px', fontWeight: 600 }}>Yuklanmoqda...</span>
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center' }}>
            <HiOutlineArchiveBox style={{ fontSize: '64px', color: '#cbd5e1', margin: '0 auto 16px', display: 'block' }} />
            <p style={{ color: '#94a3b8', fontSize: '16px', fontWeight: 600, margin: 0 }}>Ushbu bo'limda ma'lumot topilmadi</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: '60px' }}>#</th>
                  {displayFields.map(f => (
                    <th key={f} style={thStyle}>{fieldLabels[f] || f}</th>
                  ))}
                  {isAdmin && <th style={{ ...thStyle, textAlign: 'center', width: '120px' }}>Amallar</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id} style={{ transition: 'background 0.2s' }} className="hover:bg-slate-50">
                    <td style={{ ...tdStyle, color: '#94a3b8', fontWeight: 700 }}>{i + 1}</td>
                    {displayFields.map(f => (
                      <td key={f} style={tdStyle}>
                        {f === 'color' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: 700 }}>
                            <span style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: item[f] || '#ccc', border: '1px solid rgba(0,0,0,0.1)' }} />
                            {item[f]}
                          </span>
                        ) : (
                          <span style={{ color: '#0f172a', fontWeight: 600 }}>{item[f] || '—'}</span>
                        )}
                      </td>
                    ))}
                    {isAdmin && (
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <button onClick={() => openForm(item)} title="Tahrirlash"
                            style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-sky-50">
                            <HiOutlinePencilSquare style={{ fontSize: '18px' }} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} title="O'chirish"
                            style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #fecaca', background: '#fff', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-red-50">
                            <HiOutlineTrash style={{ fontSize: '18px' }} />
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="animate-fade-in" style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', margin: '16px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {editItem ? <HiOutlinePencilSquare style={{ color: '#0ea5e9', fontSize: '20px' }} /> : <HiOutlinePlus style={{ color: '#0ea5e9', fontSize: '20px' }} />}
                </div>
                {editItem ? 'Tahrirlash' : 'Yangi qo\'shish'}
              </h2>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} className="hover:text-slate-700">
                <HiOutlineXMark style={{ fontSize: '24px' }} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {currentTab.fields.map(f => (
                <div key={f}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>{fieldLabels[f]}</label>
                  {f === 'description' ? (
                    <textarea value={formData[f] || ''} onChange={e => setFormData({...formData, [f]: e.target.value})}
                      style={{ ...inputStyle, resize: 'none', height: '100px' }} placeholder="Tavsif..." />
                  ) : f === 'color' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input type="color" value={formData[f] || '#000000'} onChange={e => setFormData({...formData, [f]: e.target.value})}
                        style={{ width: '60px', height: '48px', padding: '4px', borderRadius: '12px', border: '1px solid #cbd5e1', cursor: 'pointer' }} />
                      <span style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: 700, color: '#64748b' }}>{formData[f] || '#000000'}</span>
                    </div>
                  ) : (
                    <input type="text" required value={formData[f] || ''} onChange={e => setFormData({...formData, [f]: e.target.value})}
                      style={inputStyle} placeholder={fieldLabels[f]} />
                  )}
                </div>
              ))}
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(14,165,233,0.3)' }} className="hover:-translate-y-1 transition-all hover:shadow-lg">
                  {editItem ? 'Saqlash' : "Qo'shish"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '14px 24px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }} className="hover:bg-slate-100 transition-colors">
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
