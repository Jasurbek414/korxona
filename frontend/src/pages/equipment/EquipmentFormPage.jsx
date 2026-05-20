import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { equipmentService, referenceService } from '../../services/dataService';
import { useAuth } from '../../hooks/useAuthContext';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineCheck } from 'react-icons/hi2';

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
          background: '#f8fafc', fontSize: '15px', 
          color: value ? '#0f172a' : '#64748b', 
          outline: 'none', cursor: 'pointer', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          boxShadow: isOpen ? '0 0 0 4px rgba(59,130,246,0.1)' : 'none', 
          transition: 'all 0.2s',
          fontWeight: 500,
          boxSizing: 'border-box'
        }}
        onMouseEnter={(e) => { if(!isOpen) e.target.style.background = '#fff'; }}
        onMouseLeave={(e) => { if(!isOpen) e.target.style.background = '#f8fafc'; }}
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

export default function EquipmentFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { isOperator } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    inventoryNumber: '', name: '', categoryId: '', manufacturerId: '',
    modelId: '', serialNumber: '', statusId: '', locationId: '',
    responsiblePersonId: '', commissionedDate: '', warrantyDate: '',
    purchasePrice: '', notes: '',
  });

  // Ma'lumotnomalar
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [models, setModels] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [persons, setPersons] = useState([]);

  useEffect(() => {
    loadReferences();
    if (isEdit) loadEquipment();
  }, [id]);

  // Ishlab chiqaruvchi o'zgarganda modellar yangilanadi
  useEffect(() => {
    if (form.manufacturerId) {
      referenceService.models.getByManufacturer(form.manufacturerId)
        .then(res => setModels(res.data || []))
        .catch(() => setModels([]));
    } else {
      referenceService.models.getAll()
        .then(res => setModels(res.data || []))
        .catch(() => setModels([]));
    }
  }, [form.manufacturerId]);

  const loadReferences = async () => {
    try {
      const [cat, man, mod, st, loc, per] = await Promise.all([
        referenceService.categories.getAll(),
        referenceService.manufacturers.getAll(),
        referenceService.models.getAll(),
        referenceService.statuses.getAll(),
        referenceService.locations.getAll(),
        referenceService.responsiblePersons.getAll(),
      ]);
      setCategories(cat.data || []);
      setManufacturers(man.data || []);
      setModels(mod.data || []);
      setStatuses(st.data || []);
      setLocations(loc.data || []);
      setPersons(per.data || []);
    } catch { /* davom */ }
  };

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const res = await equipmentService.getById(id);
      const eq = res.data;
      setForm({
        inventoryNumber: eq.inventoryNumber || '',
        name: eq.name || '',
        categoryId: eq.categoryId || '',
        manufacturerId: eq.manufacturerId || '',
        modelId: eq.modelId || '',
        serialNumber: eq.serialNumber || '',
        statusId: eq.statusId || '',
        locationId: eq.locationId || '',
        responsiblePersonId: eq.responsiblePersonId || '',
        commissionedDate: eq.commissionedDate || '',
        warrantyDate: eq.warrantyDate || '',
        purchasePrice: eq.purchasePrice || '',
        notes: eq.notes || '',
      });
    } catch {
      toast.error("Uskuna ma'lumotlarini yuklashda xato");
      navigate('/equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.inventoryNumber || !form.name || !form.categoryId || !form.statusId || !form.locationId || !form.responsiblePersonId) {
      toast.error("Barcha majburiy maydonlarni to'ldiring");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        categoryId: Number(form.categoryId),
        statusId: Number(form.statusId),
        locationId: Number(form.locationId),
        responsiblePersonId: Number(form.responsiblePersonId),
        manufacturerId: form.manufacturerId ? Number(form.manufacturerId) : null,
        modelId: form.modelId ? Number(form.modelId) : null,
        purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : null,
        commissionedDate: form.commissionedDate || null,
        warrantyDate: form.warrantyDate || null,
      };
      if (isEdit) {
        await equipmentService.update(id, payload);
        toast.success("Uskuna yangilandi");
      } else {
        await equipmentService.create(payload);
        toast.success("Yangi uskuna yaratildi");
      }
      navigate('/equipment');
    } catch (err) {
      toast.error(err.response?.data?.message || "Saqlashda xato");
    } finally {
      setSaving(false);
    }
  };

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const inputStyle = { width: '100%', padding: '14px 16px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '15px', fontWeight: 500, color: '#334155', outline: 'none', transition: 'all 0.3s', boxSizing: 'border-box' };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '128px' }}>
        <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', width: '100%', maxWidth: '1000px', margin: '0 auto', boxSizing: 'border-box' }} className="animate-fade-in">
      {/* Sarlavha */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button onClick={() => navigate('/equipment')}
          style={{ padding: '12px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
          className="hover:bg-slate-50 hover:text-slate-800">
          <HiOutlineArrowLeft style={{ fontSize: '20px' }} />
        </button>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0', tracking: 'tight' }}>
            {isEdit ? 'Uskuna tahrirlash' : 'Yangi uskuna'}
          </h1>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0 }}>
            <span style={{ color: '#ef4444' }}>*</span> — majburiy maydonlar
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)' }}>
        
        <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>Asosiy ma'lumotlar</h2>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '32px' }}>
          <Field label="Inventar raqami" required>
            <input type="text" value={form.inventoryNumber} onChange={e => set('inventoryNumber', e.target.value)}
              style={inputStyle} placeholder="INV-001" 
              onFocus={e => { e.target.style.borderColor='#3b82f6'; e.target.style.background='#fff'; }} 
              onBlur={e => { e.target.style.borderColor='#cbd5e1'; e.target.style.background='#f8fafc'; }} />
          </Field>
          <Field label="Uskuna nomi" required>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
              style={inputStyle} placeholder="Masalan: Kompyuter HP ProDesk"
              onFocus={e => { e.target.style.borderColor='#3b82f6'; e.target.style.background='#fff'; }} 
              onBlur={e => { e.target.style.borderColor='#cbd5e1'; e.target.style.background='#f8fafc'; }} />
          </Field>
          <Field label="Toifasi" required>
            <CustomSelect 
              value={form.categoryId} onChange={val => set('categoryId', val)}
              options={categories.map(c => ({ value: c.id, label: c.nameUz }))} defaultLabel="Tanlang..."
            />
          </Field>
          <Field label="Status" required>
            <CustomSelect 
              value={form.statusId} onChange={val => set('statusId', val)}
              options={statuses.map(s => ({ value: s.id, label: s.nameUz }))} defaultLabel="Tanlang..."
            />
          </Field>
          <Field label="Joylashuv" required>
            <CustomSelect 
              value={form.locationId} onChange={val => set('locationId', val)}
              options={locations.map(l => ({ value: l.id, label: l.name }))} defaultLabel="Tanlang..."
            />
          </Field>
          <Field label="Mas'ul shaxs" required>
            <CustomSelect 
              value={form.responsiblePersonId} onChange={val => set('responsiblePersonId', val)}
              options={persons.map(p => ({ value: p.id, label: p.fullName }))} defaultLabel="Tanlang..."
            />
          </Field>
        </div>

        <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>Texnik ma'lumotlar</h2>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '32px' }}>
          <Field label="Ishlab chiqaruvchi">
            <CustomSelect 
              value={form.manufacturerId} onChange={val => set('manufacturerId', val)}
              options={manufacturers.map(m => ({ value: m.id, label: m.name }))} defaultLabel="Tanlanmagan"
            />
          </Field>
          <Field label="Model">
            <CustomSelect 
              value={form.modelId} onChange={val => set('modelId', val)}
              options={models.map(m => ({ value: m.id, label: m.name }))} defaultLabel="Tanlanmagan"
            />
          </Field>
          <Field label="Seriya raqami">
            <input type="text" value={form.serialNumber} onChange={e => set('serialNumber', e.target.value)}
              style={inputStyle} placeholder="SN-12345"
              onFocus={e => { e.target.style.borderColor='#3b82f6'; e.target.style.background='#fff'; }} 
              onBlur={e => { e.target.style.borderColor='#cbd5e1'; e.target.style.background='#f8fafc'; }} />
          </Field>
          <Field label="Sotib olingan narxi (so'm)">
            <input type="number" value={form.purchasePrice} onChange={e => set('purchasePrice', e.target.value)}
              style={inputStyle} placeholder="0" min="0"
              onFocus={e => { e.target.style.borderColor='#3b82f6'; e.target.style.background='#fff'; }} 
              onBlur={e => { e.target.style.borderColor='#cbd5e1'; e.target.style.background='#f8fafc'; }} />
          </Field>
          <Field label="Foydalanishga topshirilgan sana">
            <input type="date" value={form.commissionedDate} onChange={e => set('commissionedDate', e.target.value)} 
              style={{ ...inputStyle, cursor: 'text' }}
              onFocus={e => { e.target.style.borderColor='#3b82f6'; e.target.style.background='#fff'; }} 
              onBlur={e => { e.target.style.borderColor='#cbd5e1'; e.target.style.background='#f8fafc'; }} />
          </Field>
          <Field label="Kafolat muddati">
            <input type="date" value={form.warrantyDate} onChange={e => set('warrantyDate', e.target.value)} 
              style={{ ...inputStyle, cursor: 'text' }}
              onFocus={e => { e.target.style.borderColor='#3b82f6'; e.target.style.background='#fff'; }} 
              onBlur={e => { e.target.style.borderColor='#cbd5e1'; e.target.style.background='#f8fafc'; }} />
          </Field>
        </div>

        {/* Izoh */}
        <div style={{ marginBottom: '32px', flex: '1 1 100%' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
            Izoh
          </label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
            style={{ ...inputStyle, resize: 'none', height: '120px' }} placeholder="Qo'shimcha ma'lumotlar..." maxLength={2000}
            onFocus={e => { e.target.style.borderColor='#3b82f6'; e.target.style.background='#fff'; }} 
            onBlur={e => { e.target.style.borderColor='#cbd5e1'; e.target.style.background='#f8fafc'; }} />
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px', textAlign: 'right' }}>{form.notes.length}/2000</p>
        </div>

        {/* Tugmalar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
          <button type="button" onClick={() => navigate('/equipment')}
            style={{ padding: '12px 24px', fontSize: '15px', fontWeight: 600, color: '#64748b', background: 'transparent', border: 'none', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
            className="hover:bg-slate-100">
            Bekor qilish
          </button>
          <button type="submit" disabled={saving}
            style={{ padding: '12px 32px', fontSize: '15px', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', border: 'none', borderRadius: '14px', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37,99,235,0.3)', transition: 'all 0.3s', opacity: saving ? 0.7 : 1 }}
            className="hover:-translate-y-1 hover:shadow-lg">
            {saving ? (
              <div className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
            ) : (
              <HiOutlineCheck style={{ fontSize: '20px' }} />
            )}
            {isEdit ? 'Saqlash' : 'Yaratish'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Umumiy maydon komponenti
function Field({ label, required, children }) {
  return (
    <div style={{ flex: '1 1 calc(50% - 12px)', minWidth: '300px' }}>
      <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
    </div>
  );
}
