import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { warehouseService } from '../../services/dataService';
import { useAuthContext } from '../../hooks/useAuthContext';
import toast from 'react-hot-toast';

const WAREHOUSES = [
  { id: 1, name: 'Asosiy ombor' },
  { id: 2, name: 'Texnik ombor' },
  { id: 3, name: 'Zaxira ombor' },
];
const OP_TYPES = {
  INCOMING: { label: 'Kirim', icon: '📥', color: 'text-green-600' },
  OUTGOING: { label: 'Chiqim', icon: '📤', color: 'text-red-600' },
  TRANSFER: { label: 'Harakat', icon: '🔄', color: 'text-blue-600' },
  WRITE_OFF: { label: 'Hisobdan chiqarish', icon: '🗑️', color: 'text-orange-600' },
};

export default function WarehousePage() {
  const { user } = useAuthContext();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'OPERATOR';

  const [activeTab, setActiveTab] = useState('stocks');
  const [selectedWarehouse, setSelectedWarehouse] = useState(1);
  const [stocks, setStocks] = useState([]);
  const [operations, setOperations] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Operatsiya modal
  const [showModal, setShowModal] = useState(false);
  const [opType, setOpType] = useState('INCOMING');
  const [opForm, setOpForm] = useState({ sparePartId: '', quantity: '', warehouseId: '1', toWarehouseId: '2', supplier: '', documentNumber: '', reason: '', notes: '' });

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await warehouseService.getStockByWarehouse(selectedWarehouse);
      setStocks(res.data);
    } catch { toast.error("Qoldiqlarni yuklashda xato"); }
    setLoading(false);
  }, [selectedWarehouse]);

  const fetchOperations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await warehouseService.getOperations({ warehouseId: selectedWarehouse, page: 0, size: 50 });
      setOperations(res.data.content || []);
    } catch { toast.error("Operatsiyalarni yuklashda xato"); }
    setLoading(false);
  }, [selectedWarehouse]);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await warehouseService.getLowStockAlerts();
      setLowStockAlerts(res.data);
    } catch {}
  }, []);

  useEffect(() => {
    if (activeTab === 'stocks') fetchStocks();
    else if (activeTab === 'operations') fetchOperations();
    fetchAlerts();
  }, [activeTab, fetchStocks, fetchOperations, fetchAlerts]);

  const handleOperation = async (e) => {
    e.preventDefault();
    try {
      if (opType === 'INCOMING') {
        await warehouseService.incoming({ warehouseId: Number(opForm.warehouseId), sparePartId: Number(opForm.sparePartId), quantity: Number(opForm.quantity), supplier: opForm.supplier, documentNumber: opForm.documentNumber, notes: opForm.notes });
      } else if (opType === 'OUTGOING') {
        await warehouseService.outgoing({ warehouseId: Number(opForm.warehouseId), sparePartId: Number(opForm.sparePartId), quantity: Number(opForm.quantity), reason: opForm.reason, notes: opForm.notes });
      } else if (opType === 'TRANSFER') {
        await warehouseService.transfer({ fromWarehouseId: Number(opForm.warehouseId), toWarehouseId: Number(opForm.toWarehouseId), sparePartId: Number(opForm.sparePartId), quantity: Number(opForm.quantity), notes: opForm.notes });
      } else {
        await warehouseService.writeOff({ warehouseId: Number(opForm.warehouseId), sparePartId: Number(opForm.sparePartId), quantity: Number(opForm.quantity), reason: opForm.reason, notes: opForm.notes });
      }
      toast.success('Operatsiya muvaffaqiyatli!');
      setShowModal(false);
      fetchStocks();
      fetchOperations();
      fetchAlerts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xato');
    }
  };

  const tabs = [
    { key: 'stocks', label: '📦 Qoldiqlar' },
    { key: 'operations', label: '📋 Operatsiyalar' },
    { key: 'alerts', label: `⚠️ Ogohlantirishlar (${lowStockAlerts.length})` },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ombor hisobi</h1>
          <p className="text-sm text-slate-500 mt-1">Ehtiyot qismlar va materiallar boshqaruvi</p>
        </div>
        {canEdit && (
          <button onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
            + Yangi operatsiya
          </button>
        )}
      </div>

      {/* Tablar */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${activeTab === t.key ? 'bg-blue-600 text-white shadow' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Ombor tanlash */}
      {activeTab !== 'alerts' && (
        <div className="flex gap-2 mb-4">
          {WAREHOUSES.map(w => (
            <button key={w.id} onClick={() => setSelectedWarehouse(w.id)}
              className={`px-4 py-2 rounded-xl text-sm transition ${selectedWarehouse === w.id ? 'bg-slate-800 text-white' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}>
              {w.name}
            </button>
          ))}
        </div>
      )}

      {/* Qoldiqlar jadvali */}
      {activeTab === 'stocks' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Yuklanmoqda...</div>
          ) : stocks.length === 0 ? (
            <div className="p-12 text-center text-slate-400">Qoldiqlar topilmadi</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Ehtiyot qism</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Kod</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Birlik</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Qoldiq</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Min. qoldiq</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stocks.map(s => (
                  <tr key={s.id} className={`hover:bg-slate-50 transition ${s.isLowStock ? 'bg-red-50/50' : ''}`}>
                    <td className="px-4 py-3 font-medium text-slate-800">{s.sparePartName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.sparePartCode}</td>
                    <td className="px-4 py-3 text-slate-500">{s.unitName || '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-700">{s.quantity}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{s.minStock}</td>
                    <td className="px-4 py-3 text-center">
                      {s.isLowStock ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">⚠️ Kam</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">✓ Yetarli</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Operatsiyalar */}
      {activeTab === 'operations' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Yuklanmoqda...</div>
          ) : operations.length === 0 ? (
            <div className="p-12 text-center text-slate-400">Operatsiyalar topilmadi</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Turi</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Ehtiyot qism</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Miqdor</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Tafsilot</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Bajaruvchi</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {operations.map(op => {
                  const t = OP_TYPES[op.operationType] || {};
                  return (
                    <tr key={op.id} className="hover:bg-slate-50 transition">
                      <td className={`px-4 py-3 font-medium ${t.color}`}>{t.icon} {t.label}</td>
                      <td className="px-4 py-3 text-slate-700">{op.sparePartName}</td>
                      <td className="px-4 py-3 text-right font-semibold">{op.quantity}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{op.supplier || op.receiver || op.reason || op.targetWarehouseName || '—'}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{op.performedByName || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{op.createdAt?.slice(0, 16).replace('T', ' ')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Ogohlantirishlar (TZ 4.5) */}
      {activeTab === 'alerts' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {lowStockAlerts.length === 0 ? (
            <div className="p-12 text-center text-green-500 text-lg font-medium">✅ Barcha qoldiqlar me'yorda</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-red-50 border-b border-red-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-red-700">Ehtiyot qism</th>
                  <th className="px-4 py-3 text-left font-semibold text-red-700">Ombor</th>
                  <th className="px-4 py-3 text-right font-semibold text-red-700">Joriy</th>
                  <th className="px-4 py-3 text-right font-semibold text-red-700">Minimal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-50">
                {lowStockAlerts.map(a => (
                  <tr key={a.id} className="bg-red-50/30 hover:bg-red-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-800">{a.sparePartName} ({a.sparePartCode})</td>
                    <td className="px-4 py-3 text-slate-600">{a.warehouseName}</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">{a.quantity}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{a.minStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Operatsiya modali */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Ombor operatsiyasi</h2>
            <div className="flex gap-2 mb-4">
              {Object.entries(OP_TYPES).map(([key, val]) => (
                <button key={key} onClick={() => setOpType(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${opType === key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {val.icon} {val.label}
                </button>
              ))}
            </div>
            <form onSubmit={handleOperation} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Ehtiyot qism ID *</label>
                  <input type="number" required value={opForm.sparePartId}
                    onChange={e => setOpForm({...opForm, sparePartId: e.target.value})}
                    className="input-field" placeholder="ID" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Miqdor *</label>
                  <input type="number" required min="1" value={opForm.quantity}
                    onChange={e => setOpForm({...opForm, quantity: e.target.value})}
                    className="input-field" placeholder="Miqdor" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Ombor *</label>
                <select value={opForm.warehouseId}
                  onChange={e => setOpForm({...opForm, warehouseId: e.target.value})} className="input-field">
                  {WAREHOUSES.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              {opType === 'TRANSFER' && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Qabul qiluvchi ombor *</label>
                  <select value={opForm.toWarehouseId}
                    onChange={e => setOpForm({...opForm, toWarehouseId: e.target.value})} className="input-field">
                    {WAREHOUSES.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              )}
              {opType === 'INCOMING' && (
                <div className="grid grid-cols-2 gap-3">
                  <input value={opForm.supplier} onChange={e => setOpForm({...opForm, supplier: e.target.value})}
                    className="input-field" placeholder="Yetkazib beruvchi" />
                  <input value={opForm.documentNumber} onChange={e => setOpForm({...opForm, documentNumber: e.target.value})}
                    className="input-field" placeholder="Hujjat raqami" />
                </div>
              )}
              {(opType === 'OUTGOING' || opType === 'WRITE_OFF') && (
                <input value={opForm.reason} onChange={e => setOpForm({...opForm, reason: e.target.value})}
                  className="input-field" placeholder="Sabab" />
              )}
              <textarea value={opForm.notes} rows={2} onChange={e => setOpForm({...opForm, notes: e.target.value})}
                className="input-field" placeholder="Izoh..." />
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                  Bajarish
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition">Bekor</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
