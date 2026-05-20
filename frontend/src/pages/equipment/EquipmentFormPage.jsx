import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { equipmentService, referenceService } from '../../services/dataService';
import { useAuth } from '../../hooks/useAuthContext';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineCheck } from 'react-icons/hi2';

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
    // Majburiy maydonlar (TZ 2.9)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl animate-fade-in">
      {/* Sarlavha */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/equipment')}
          className="p-2 rounded-xl hover:bg-[var(--bg-main)] text-[var(--text-secondary)] transition-colors">
          <HiOutlineArrowLeft className="text-xl" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {isEdit ? 'Uskuna tahrirlash' : 'Yangi uskuna'}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            <span className="text-red-500">*</span> — majburiy maydonlar
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Asosiy ma'lumotlar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Field label="Inventar raqami" required>
            <input type="text" value={form.inventoryNumber} onChange={e => set('inventoryNumber', e.target.value)}
              className="input-field" placeholder="INV-001" />
          </Field>
          <Field label="Uskuna nomi" required>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
              className="input-field" placeholder="Kompyuter HP ProDesk" />
          </Field>
          <Field label="Toifasi" required>
            <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)} className="input-field">
              <option value="">Tanlang...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nameUz}</option>)}
            </select>
          </Field>
          <Field label="Status" required>
            <select value={form.statusId} onChange={e => set('statusId', e.target.value)} className="input-field">
              <option value="">Tanlang...</option>
              {statuses.map(s => <option key={s.id} value={s.id}>{s.nameUz}</option>)}
            </select>
          </Field>
          <Field label="Joylashuv" required>
            <select value={form.locationId} onChange={e => set('locationId', e.target.value)} className="input-field">
              <option value="">Tanlang...</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </Field>
          <Field label="Mas'ul shaxs" required>
            <select value={form.responsiblePersonId} onChange={e => set('responsiblePersonId', e.target.value)} className="input-field">
              <option value="">Tanlang...</option>
              {persons.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
            </select>
          </Field>
        </div>

        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Texnik ma'lumotlar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Field label="Ishlab chiqaruvchi">
            <select value={form.manufacturerId} onChange={e => set('manufacturerId', e.target.value)} className="input-field">
              <option value="">Tanlanmagan</option>
              {manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>
          <Field label="Model">
            <select value={form.modelId} onChange={e => set('modelId', e.target.value)} className="input-field">
              <option value="">Tanlanmagan</option>
              {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>
          <Field label="Seriya raqami">
            <input type="text" value={form.serialNumber} onChange={e => set('serialNumber', e.target.value)}
              className="input-field" placeholder="SN-12345" />
          </Field>
          <Field label="Sotib olingan narxi (so'm)">
            <input type="number" value={form.purchasePrice} onChange={e => set('purchasePrice', e.target.value)}
              className="input-field" placeholder="0" min="0" />
          </Field>
          <Field label="Foydalanishga topshirilgan sana">
            <input type="date" value={form.commissionedDate} onChange={e => set('commissionedDate', e.target.value)} className="input-field" />
          </Field>
          <Field label="Kafolat muddati">
            <input type="date" value={form.warrantyDate} onChange={e => set('warrantyDate', e.target.value)} className="input-field" />
          </Field>
        </div>

        {/* Izoh */}
        <Field label="Izoh" className="mb-6">
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
            className="input-field resize-none h-24" placeholder="Qo'shimcha ma'lumotlar..." maxLength={2000} />
          <p className="text-xs text-[var(--text-muted)] mt-1">{form.notes.length}/2000</p>
        </Field>

        {/* Tugmalar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
          <button type="button" onClick={() => navigate('/equipment')}
            className="px-5 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-main)] rounded-xl transition-colors">
            Bekor qilish
          </button>
          <button type="submit" disabled={saving}
            className="btn btn-primary disabled:opacity-50">
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <HiOutlineCheck className="text-lg" />
            )}
            {isEdit ? 'Saqlash' : 'Yaratish'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Umumiy maydon komponenti
function Field({ label, required, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
