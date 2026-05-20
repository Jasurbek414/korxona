import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { warehouseService } from '../../services/dataService';
import { useAuthContext } from '../../hooks/useAuthContext';
import toast from 'react-hot-toast';
import { 
  HiOutlineCube, 
  HiOutlinePlus, 
  HiOutlineClipboardDocumentList, 
  HiOutlineExclamationTriangle,
  HiOutlineArrowDownTray,
  HiOutlineArrowUpTray,
  HiOutlineArrowsRightLeft,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineXCircle
} from 'react-icons/hi2';

const WAREHOUSES = [
  { id: 1, name: 'Asosiy ombor' },
  { id: 2, name: 'Texnik ombor' },
  { id: 3, name: 'Zaxira ombor' },
];

const OP_TYPES = {
  INCOMING: { label: 'Kirim', icon: <HiOutlineArrowDownTray style={{ fontSize: '18px' }} />, color: '#10b981', bg: '#ecfdf5' },
  OUTGOING: { label: 'Chiqim', icon: <HiOutlineArrowUpTray style={{ fontSize: '18px' }} />, color: '#ef4444', bg: '#fef2f2' },
  TRANSFER: { label: 'Harakat', icon: <HiOutlineArrowsRightLeft style={{ fontSize: '18px' }} />, color: '#3b82f6', bg: '#eff6ff' },
  WRITE_OFF: { label: 'Hisobdan chiqarish', icon: <HiOutlineTrash style={{ fontSize: '18px' }} />, color: '#f97316', bg: '#fff7ed' },
};

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
      setOperations(res.data?.content || []);
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
    { key: 'stocks', icon: <HiOutlineCube style={{ fontSize: '18px' }} />, label: 'Qoldiqlar' },
    { key: 'operations', icon: <HiOutlineClipboardDocumentList style={{ fontSize: '18px' }} />, label: 'Operatsiyalar' },
    { key: 'alerts', icon: <HiOutlineExclamationTriangle style={{ fontSize: '18px' }} />, label: `Ogohlantirishlar (${lowStockAlerts.length})` },
  ];

  const inputStyle = { width: '100%', padding: '14px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '15px', fontWeight: 500, color: '#334155', outline: 'none', transition: 'all 0.3s', boxSizing: 'border-box' };
  const thStyle = { padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' };
  const tdStyle = { padding: '16px 24px', fontSize: '14px', color: '#334155', borderBottom: '1px solid #f1f5f9', fontWeight: 500 };

  return (
    <div style={{ padding: '32px', width: '100%', maxWidth: '1600px', margin: '0 auto', boxSizing: 'border-box' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981, #047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(16,185,129,0.3)' }}>
            <HiOutlineCube style={{ color: '#fff', fontSize: '28px' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0', tracking: 'tight' }}>Ombor hisobi</h1>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Ehtiyot qismlar va materiallar boshqaruvi
            </p>
          </div>
        </div>
        {canEdit && (
          <button onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)', transition: 'all 0.3s' }}
            className="hover:-translate-y-1 hover:shadow-lg"
          >
            <HiOutlinePlus style={{ fontSize: '20px' }} /> Yangi operatsiya
          </button>
        )}
      </div>

      {/* Tablar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '16px',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', border: 'none', whiteSpace: 'nowrap',
              background: activeTab === t.key ? '#10b981' : '#fff',
              color: activeTab === t.key ? '#fff' : '#475569',
              boxShadow: activeTab === t.key ? '0 10px 15px -3px rgba(16,185,129,0.3)' : '0 4px 6px -1px rgba(0,0,0,0.05)',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Ombor tanlash */}
      {activeTab !== 'alerts' && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {WAREHOUSES.map(w => (
            <button key={w.id} onClick={() => setSelectedWarehouse(w.id)}
              style={{
                padding: '10px 20px', borderRadius: '12px',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                border: selectedWarehouse === w.id ? '2px solid #0f172a' : '1px solid #cbd5e1',
                background: selectedWarehouse === w.id ? '#0f172a' : '#fff',
                color: selectedWarehouse === w.id ? '#fff' : '#475569',
              }}>
              {w.name}
            </button>
          ))}
        </div>
      )}

      {/* Qoldiqlar jadvali */}
      {activeTab === 'stocks' && (
        <div style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', margin: '0 auto 16px' }} />
              <span style={{ color: '#94a3b8', fontSize: '15px', fontWeight: 600 }}>Yuklanmoqda...</span>
            </div>
          ) : stocks.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <HiOutlineCube style={{ fontSize: '64px', color: '#cbd5e1', margin: '0 auto 16px', display: 'block' }} />
              <p style={{ color: '#94a3b8', fontSize: '16px', fontWeight: 600, margin: 0 }}>Ushbu omborda qoldiqlar topilmadi</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ wwidth: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Ehtiyot qism</th>
                    <th style={thStyle}>Kod</th>
                    <th style={thStyle}>Birlik</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Qoldiq</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Min. qoldiq</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Holat</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map(s => (
                    <tr key={s.id} style={{ background: s.isLowStock ? '#fef2f2' : 'transparent', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#0f172a' }}>{s.sparePartName}</td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#64748b' }}>{s.sparePartCode}</td>
                      <td style={{ ...tdStyle, color: '#64748b' }}>{s.unitName || '—'}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 800, color: s.isLowStock ? '#ef4444' : '#0f172a' }}>{s.quantity}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', color: '#64748b' }}>{s.minStock}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        {s.isLowStock ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 800, background: '#fecaca', color: '#991b1b' }}>
                            <HiOutlineExclamationTriangle style={{ fontSize: '16px' }} /> Kam
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 800, background: '#d1fae5', color: '#065f46' }}>
                            <HiOutlineCheckCircle style={{ fontSize: '16px' }} /> Yetarli
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Operatsiyalar */}
      {activeTab === 'operations' && (
        <div style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', margin: '0 auto 16px' }} />
              <span style={{ color: '#94a3b8', fontSize: '15px', fontWeight: 600 }}>Yuklanmoqda...</span>
            </div>
          ) : operations.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <HiOutlineClipboardDocumentList style={{ fontSize: '64px', color: '#cbd5e1', margin: '0 auto 16px', display: 'block' }} />
              <p style={{ color: '#94a3b8', fontSize: '16px', fontWeight: 600, margin: 0 }}>Operatsiyalar topilmadi</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Turi</th>
                    <th style={thStyle}>Ehtiyot qism</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Miqdor</th>
                    <th style={thStyle}>Tafsilot</th>
                    <th style={thStyle}>Bajaruvchi</th>
                    <th style={thStyle}>Sana</th>
                  </tr>
                </thead>
                <tbody>
                  {operations.map(op => {
                    const t = OP_TYPES[op.operationType] || {};
                    return (
                      <tr key={op.id} style={{ transition: 'background 0.2s' }} className="hover:bg-slate-50">
                        <td style={{ ...tdStyle }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: 800, background: t.bg, color: t.color }}>
                            {t.icon} {t.label}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: '#0f172a' }}>{op.sparePartName}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>{op.quantity}</td>
                        <td style={{ ...tdStyle, fontSize: '13px', color: '#64748b' }}>{op.supplier || op.receiver || op.reason || op.targetWarehouseName || '—'}</td>
                        <td style={{ ...tdStyle, fontSize: '13px', color: '#475569', fontWeight: 600 }}>{op.performedByName || '—'}</td>
                        <td style={{ ...tdStyle, fontSize: '13px', color: '#64748b' }}>{op.createdAt?.slice(0, 16).replace('T', ' ')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Ogohlantirishlar (TZ 4.5) */}
      {activeTab === 'alerts' && (
        <div style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          {lowStockAlerts.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#d1fae5', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HiOutlineCheckCircle style={{ fontSize: '40px', color: '#059669' }} />
              </div>
              <p style={{ color: '#059669', fontSize: '20px', fontWeight: 800, margin: 0 }}>Barcha qoldiqlar me'yorda</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, background: '#fef2f2', color: '#b91c1c', borderBottom: '2px solid #fecaca' }}>Ehtiyot qism</th>
                    <th style={{ ...thStyle, background: '#fef2f2', color: '#b91c1c', borderBottom: '2px solid #fecaca' }}>Ombor</th>
                    <th style={{ ...thStyle, background: '#fef2f2', color: '#b91c1c', borderBottom: '2px solid #fecaca', textAlign: 'right' }}>Joriy</th>
                    <th style={{ ...thStyle, background: '#fef2f2', color: '#b91c1c', borderBottom: '2px solid #fecaca', textAlign: 'right' }}>Minimal</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockAlerts.map(a => (
                    <tr key={a.id} style={{ background: '#fef2f2', transition: 'background 0.2s' }} className="hover:bg-red-50">
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #fee2e2' }}>{a.sparePartName} <span style={{ fontFamily: 'monospace', color: '#ef4444', marginLeft: '8px', fontSize: '12px', padding: '2px 6px', background: '#fecaca', borderRadius: '4px' }}>{a.sparePartCode}</span></td>
                      <td style={{ ...tdStyle, color: '#475569', fontWeight: 600, borderBottom: '1px solid #fee2e2' }}>{a.warehouseName}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 900, color: '#dc2626', borderBottom: '1px solid #fee2e2' }}>{a.quantity}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', color: '#991b1b', borderBottom: '1px solid #fee2e2' }}>{a.minStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Operatsiya modali */}
      {showModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="animate-fade-in" style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '600px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', margin: '16px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HiOutlineClipboardDocumentList style={{ color: '#10b981', fontSize: '24px' }} />
              </div>
              Ombor operatsiyasi
            </h2>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {Object.entries(OP_TYPES).map(([key, val]) => (
                <button key={key} onClick={() => setOpType(key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '12px',
                    fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                    background: opType === key ? val.color : '#f1f5f9',
                    color: opType === key ? '#fff' : '#64748b',
                    boxShadow: opType === key ? `0 4px 12px ${val.color}40` : 'none',
                  }}>
                  {val.icon} {val.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleOperation} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Ehtiyot qism ID *</label>
                  <input type="number" required value={opForm.sparePartId}
                    onChange={e => setOpForm({...opForm, sparePartId: e.target.value})}
                    style={inputStyle} placeholder="ID" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Miqdor *</label>
                  <input type="number" required min="1" value={opForm.quantity}
                    onChange={e => setOpForm({...opForm, quantity: e.target.value})}
                    style={inputStyle} placeholder="Miqdor" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Ombor *</label>
                <CustomSelect 
                  value={opForm.warehouseId} onChange={val => setOpForm({...opForm, warehouseId: val})}
                  options={WAREHOUSES.map(w => ({ value: w.id, label: w.name }))} defaultLabel="Omborni tanlang"
                />
              </div>
              {opType === 'TRANSFER' && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Qabul qiluvchi ombor *</label>
                  <CustomSelect 
                    value={opForm.toWarehouseId} onChange={val => setOpForm({...opForm, toWarehouseId: val})}
                    options={WAREHOUSES.map(w => ({ value: w.id, label: w.name }))} defaultLabel="Qabul qiluvchi omborni tanlang"
                  />
                </div>
              )}
              {opType === 'INCOMING' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Yetkazib beruvchi</label>
                    <input value={opForm.supplier} onChange={e => setOpForm({...opForm, supplier: e.target.value})}
                      style={inputStyle} placeholder="Nomi" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Hujjat raqami</label>
                    <input value={opForm.documentNumber} onChange={e => setOpForm({...opForm, documentNumber: e.target.value})}
                      style={inputStyle} placeholder="№" />
                  </div>
                </div>
              )}
              {(opType === 'OUTGOING' || opType === 'WRITE_OFF') && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Sabab</label>
                  <input value={opForm.reason} onChange={e => setOpForm({...opForm, reason: e.target.value})}
                    style={inputStyle} placeholder="Asosiy sabab" />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Izoh</label>
                <textarea value={opForm.notes} rows={2} onChange={e => setOpForm({...opForm, notes: e.target.value})}
                  style={{ ...inputStyle, resize: 'none', height: '80px' }} placeholder="Qo'shimcha izoh..." />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }} className="hover:-translate-y-1 transition-all hover:shadow-lg">
                  Bajarish
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
