import { useState, useEffect } from 'react';
import { reportService } from '../../services/dataService';
import toast from 'react-hot-toast';
import {
  HiOutlineComputerDesktop, 
  HiOutlineWrenchScrewdriver,
  HiOutlineExclamationTriangle, 
  HiOutlineCube, 
  HiOutlineDocumentArrowDown,
  HiOutlineChartBar,
  HiOutlineArrowDownTray,
  HiOutlineCheckCircle,
  HiOutlineCalendar
} from 'react-icons/hi2';

const TABS = [
  { key: 'equipment', label: 'Uskunalar holati', icon: HiOutlineComputerDesktop, bg: '#2563eb' },
  { key: 'ppr', label: 'PPR bajarilishi', icon: HiOutlineWrenchScrewdriver, bg: '#059669' },
  { key: 'overdue', label: "Muddati o'tgan", icon: HiOutlineExclamationTriangle, bg: '#dc2626' },
  { key: 'spare', label: 'Ehtiyot qismlar sarfi', icon: HiOutlineCube, bg: '#d97706' },
  { key: 'stock', label: 'Ombor qoldiqlari', icon: HiOutlineDocumentArrowDown, bg: '#7c3aed' },
];

const EXPORTABLE = ['equipment', 'ppr', 'overdue', 'stock'];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('equipment');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [exporting, setExporting] = useState(false);

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(monthStart);
  const [dateTo, setDateTo] = useState(today.toISOString().slice(0, 10));

  useEffect(() => { loadReport(); }, [activeTab, dateFrom, dateTo]);

  const loadReport = async () => {
    setLoading(true);
    setData(null);
    try {
      let res;
      switch (activeTab) {
        case 'equipment': res = await reportService.getEquipmentStatus(); break;
        case 'ppr': res = await reportService.getPprPerformance(dateFrom, dateTo); break;
        case 'overdue': res = await reportService.getOverdueTasks(); break;
        case 'spare': res = await reportService.getSparePartUsage(dateFrom, dateTo); break;
        case 'stock': res = await reportService.getWarehouseStock(); break;
      }
      setData(res.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      let res;
      let filename;
      switch (activeTab) {
        case 'equipment': res = await reportService.exportEquipmentStatus(); filename = 'uskunalar_holati.xlsx'; break;
        case 'ppr': res = await reportService.exportPprPerformance(dateFrom, dateTo); filename = 'ppr_bajarilishi.xlsx'; break;
        case 'overdue': res = await reportService.exportOverdueTasks(); filename = 'muddati_otgan.xlsx'; break;
        case 'stock': res = await reportService.exportWarehouseStock(); filename = 'ombor_qoldiqlari.xlsx'; break;
      }
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Hisobot yuklab olindi");
    } catch {
      toast.error("Eksport qilishda xato");
    }
    setExporting(false);
  };

  const needsDateFilter = ['ppr', 'spare'].includes(activeTab);
  const canExport = EXPORTABLE.includes(activeTab);

  const inputStyle = { padding: '10px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#334155', outline: 'none', transition: 'all 0.3s' };

  return (
    <div style={{ padding: '32px', width: '100%', maxWidth: '1600px', margin: '0 auto', boxSizing: 'border-box' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(59,130,246,0.3)' }}>
            <HiOutlineChartBar style={{ color: '#fff', fontSize: '28px' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0', tracking: 'tight' }}>Hisobotlar</h1>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tizimning analitik ko'rsatkichlari
            </p>
          </div>
        </div>
        {canExport && data && (
          <button onClick={handleExport} disabled={exporting}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: exporting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)', transition: 'all 0.3s', opacity: exporting ? 0.7 : 1 }}
            className="hover:-translate-y-1 hover:shadow-lg"
          >
            {exporting ? (
              <><div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> Yuklanmoqda...</>
            ) : (
              <><HiOutlineArrowDownTray style={{ fontSize: '20px' }} /> Excel yuklab olish</>
            )}
          </button>
        )}
      </div>

      {/* Tablar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '16px',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', border: 'none', whiteSpace: 'nowrap',
                background: isActive ? t.bg : '#fff',
                color: isActive ? '#fff' : '#475569',
                boxShadow: isActive ? `0 10px 15px -3px ${t.bg}40` : '0 4px 6px -1px rgba(0,0,0,0.05)',
                border: isActive ? 'none' : '1px solid #cbd5e1'
              }}>
              <Icon style={{ fontSize: '18px' }} /> {t.label}
            </button>
          )
        })}
      </div>

      {/* Davr filtri */}
      {needsDateFilter && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', background: '#fff', borderRadius: '20px', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)', marginBottom: '32px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 700, color: '#475569' }}>
            <HiOutlineCalendar style={{ fontSize: '18px' }} /> Davr:
          </span>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
          <span style={{ color: '#94a3b8', fontWeight: 800 }}>—</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
        </div>
      )}

      {/* Kontent */}
      <div style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', margin: '0 auto 16px' }} />
            <span style={{ color: '#94a3b8', fontSize: '15px', fontWeight: 600 }}>Hisobot yuklanmoqda...</span>
          </div>
        ) : !data ? (
          <div style={{ padding: '80px', textAlign: 'center' }}>
            <HiOutlineChartBar style={{ fontSize: '64px', color: '#cbd5e1', margin: '0 auto 16px', display: 'block' }} />
            <p style={{ color: '#94a3b8', fontSize: '16px', fontWeight: 600, margin: 0 }}>Ma'lumot topilmadi</p>
          </div>
        ) : (
          <>
            {activeTab === 'equipment' && <EquipmentStatusView data={data} />}
            {activeTab === 'ppr' && <PprPerformanceView data={data} />}
            {activeTab === 'overdue' && <OverdueView data={data} />}
            {activeTab === 'spare' && <SpareUsageView data={data} />}
            {activeTab === 'stock' && <StockView data={data} />}
          </>
        )}
      </div>
    </div>
  );
}

// =============== 1. USKUNALAR HOLATI ===============
function EquipmentStatusView({ data }) {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const total = data.totalEquipment || 1;

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #3b82f6, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HiOutlineComputerDesktop style={{ color: '#fff', fontSize: '24px' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Uskunalar holati</h3>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', margin: 0 }}>Jami: {data.totalEquipment} ta uskuna</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' }}>
        {/* Doiraviy grafik */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative' }}>
            <svg width="240" height="240" viewBox="0 0 200 200">
              {(data.byStatus || []).reduce((acc, item, i) => {
                const pct = (item.count / total) * 100;
                const circ = 2 * Math.PI * 70;
                const dash = (pct / 100) * circ;
                const offset = acc.offset;
                acc.offset += dash;
                acc.elements.push(
                  <circle key={i} cx="100" cy="100" r="70" fill="none"
                    stroke={colors[i % colors.length]} strokeWidth="20"
                    strokeDasharray={`${dash} ${circ - dash}`}
                    strokeDashoffset={-offset}
                    transform="rotate(-90 100 100)"
                    style={{ transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                );
                return acc;
              }, { elements: [], offset: 0 }).elements}
              <text x="100" y="105" textAnchor="middle" style={{ fontSize: '40px', fontWeight: 900, fill: '#0f172a' }}>{data.totalEquipment}</text>
              <text x="100" y="130" textAnchor="middle" style={{ fontSize: '14px', fontWeight: 600, fill: '#64748b' }}>uskuna</text>
            </svg>
          </div>
        </div>

        {/* Legenda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(data.byStatus || []).map((item, i) => {
            const pct = Math.round((item.count / total) * 100);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: colors[i % colors.length], flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#334155' }}>{item.statusName}</span>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{item.count} <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>({pct}%)</span></span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: colors[i % colors.length], borderRadius: '999px', width: `${pct}%`, transition: 'width 1s ease' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toifa bo'yicha */}
      {data.byCategory?.length > 0 && (
        <div style={{ marginTop: '48px', borderTop: '1px solid #f1f5f9', paddingTop: '32px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#475569', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Toifalar bo'yicha</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {data.byCategory.map((c, i) => (
              <div key={i} style={{ padding: '24px 16px', borderRadius: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center', transition: 'all 0.2s' }} className="hover:-translate-y-1 hover:shadow-md">
                <p style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0' }}>{c.count}</p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', margin: 0, lineHeight: 1.4 }}>{c.categoryName}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =============== 2. PPR BAJARILISHI ===============
function PprPerformanceView({ data }) {
  const circumference = 2 * Math.PI * 70;
  const strokeDash = (data.completionRate / 100) * circumference;
  const rateColor = data.completionRate >= 80 ? '#10b981' : data.completionRate >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HiOutlineWrenchScrewdriver style={{ color: '#fff', fontSize: '24px' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>PPR bajarilishi</h3>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', margin: 0 }}>{data.dateFrom} — {data.dateTo}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' }}>
        {/* Doiraviy progress */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="200" height="200" style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
              <circle cx="100" cy="100" r="70" fill="none" stroke="#f1f5f9" strokeWidth="20" />
              <circle cx="100" cy="100" r="70" fill="none"
                stroke={rateColor} strokeWidth="20" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - strokeDash}
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
            </svg>
            <div style={{ textAlign: 'center', zIndex: 1, marginTop: '8px' }}>
              <span style={{ fontSize: '42px', fontWeight: 900, color: rateColor, lineHeight: 1, display: 'block' }}>{data.completionRate}%</span>
              <p style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', margin: '6px 0 0 0', textTransform: 'uppercase' }}>bajarilish</p>
            </div>
          </div>
        </div>

        {/* KPI kartalar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { label: 'Jami vazifalar', value: data.totalTasks, bg: '#eff6ff', color: '#1d4ed8' },
            { label: 'Bajarilgan', value: data.completedTasks, bg: '#ecfdf5', color: '#047857' },
            { label: 'Jarayonda', value: data.inProgressTasks, bg: '#fef3c7', color: '#b45309' },
            { label: 'Rejalashtirilgan', value: data.scheduledTasks, bg: '#f8fafc', color: '#334155' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '24px', borderRadius: '24px', background: item.bg, color: item.color }} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms`, padding: '24px', borderRadius: '24px', background: item.bg, color: item.color }}>
              <p style={{ fontSize: '36px', fontWeight: 900, margin: '0 0 8px 0' }}>{item.value}</p>
              <p style={{ fontSize: '14px', fontWeight: 700, opacity: 0.8, margin: 0 }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============== 3. MUDDATI O'TGAN ===============
function OverdueView({ data }) {
  const tasks = Array.isArray(data) ? data : [];
  
  const thStyle = { padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' };
  const tdStyle = { padding: '16px 24px', fontSize: '14px', color: '#334155', borderBottom: '1px solid #f1f5f9', fontWeight: 500 };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #ef4444, #e11d48)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HiOutlineExclamationTriangle style={{ color: '#fff', fontSize: '24px' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Muddati o'tgan vazifalar</h3>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', margin: 0 }}>Jami: {tasks.length} ta kechikkan</p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#d1fae5', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiOutlineCheckCircle style={{ fontSize: '40px', color: '#059669' }} />
          </div>
          <p style={{ color: '#059669', fontSize: '20px', fontWeight: 800, margin: 0 }}>Barcha vazifalar muddatida!</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
          <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Raqam</th>
                <th style={thStyle}>Uskuna</th>
                <th style={thStyle}>Sana</th>
                <th style={thStyle}>Kechikish</th>
                <th style={thStyle}>Mas'ul</th>
                <th style={thStyle}>Ustuvorlik</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t, i) => (
                <tr key={i} className="hover:bg-slate-50" style={{ transition: 'background 0.2s' }}>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>{t.taskNumber}</td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: '#0f172a' }}>{t.equipmentName}</td>
                  <td style={{ ...tdStyle, color: '#dc2626', fontWeight: 700 }}>{t.scheduledDate}</td>
                  <td style={tdStyle}>
                    <span style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 800, background: t.overdueDays > 7 ? '#fecaca' : '#ffedd5', color: t.overdueDays > 7 ? '#991b1b' : '#9a3412' }}>
                      {t.overdueDays} kun
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: '#64748b' }}>{t.assignedTo || '—'}</td>
                  <td style={tdStyle}>
                    <span style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 800, background: t.priority === 'CRITICAL' ? '#fecaca' : t.priority === 'HIGH' ? '#ffedd5' : '#dbeafe', color: t.priority === 'CRITICAL' ? '#991b1b' : t.priority === 'HIGH' ? '#9a3412' : '#1e40af' }}>
                      {t.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// =============== 4. EHTIYOT QISMLAR SARFI ===============
function SpareUsageView({ data }) {
  const maxQty = Math.max(...Object.values(data.byPart || { x: 1 }));

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #f59e0b, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HiOutlineCube style={{ color: '#fff', fontSize: '24px' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Ehtiyot qismlar sarfi</h3>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', margin: 0 }}>{data.dateFrom} — {data.dateTo}</p>
        </div>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '24px', borderRadius: '24px', background: '#fffbeb', color: '#b45309' }}>
          <p style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 8px 0' }}>{data.totalOperations}</p>
          <p style={{ fontSize: '14px', fontWeight: 700, margin: 0, opacity: 0.9 }}>Operatsiyalar</p>
        </div>
        <div style={{ padding: '24px', borderRadius: '24px', background: '#eff6ff', color: '#1d4ed8' }}>
          <p style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 8px 0' }}>{data.totalQuantity}</p>
          <p style={{ fontSize: '14px', fontWeight: 700, margin: 0, opacity: 0.9 }}>Jami miqdor</p>
        </div>
        <div style={{ padding: '24px', borderRadius: '24px', background: '#ecfdf5', color: '#047857' }}>
          <p style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 8px 0' }}>{Number(data.totalSum || 0).toLocaleString()}</p>
          <p style={{ fontSize: '14px', fontWeight: 700, margin: 0, opacity: 0.9 }}>Jami summa (so'm)</p>
        </div>
      </div>

      {/* Ustunli grafik */}
      {data.byPart && Object.keys(data.byPart).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>Ehtiyot qism bo'yicha sarfi</h4>
          {Object.entries(data.byPart).map(([name, qty], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms`, display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '180px', fontSize: '14px', color: '#334155', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0 }}>{name}</div>
              <div style={{ flex: 1, height: '32px', background: '#f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, #fbbf24, #f97316)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '12px', width: `${Math.max(10, (qty / maxQty) * 100)}%`, transition: 'width 1s ease' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{qty}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============== 5. OMBOR QOLDIQLARI ===============
function StockView({ data }) {
  const thStyle = { padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' };
  const tdStyle = { padding: '16px 24px', fontSize: '14px', color: '#334155', borderBottom: '1px solid #f1f5f9', fontWeight: 500 };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HiOutlineDocumentArrowDown style={{ color: '#fff', fontSize: '24px' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Ombor qoldiqlari</h3>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', margin: 0 }}>Jami: {data.totalItems} ta pozitsiya</p>
        </div>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '24px', borderRadius: '24px', background: '#f5f3ff', color: '#6d28d9' }}>
          <p style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 8px 0' }}>{data.totalItems}</p>
          <p style={{ fontSize: '14px', fontWeight: 700, margin: 0, opacity: 0.9 }}>Jami pozitsiya</p>
        </div>
        <div style={{ padding: '24px', borderRadius: '24px', background: data.lowStockCount > 0 ? '#fef2f2' : '#ecfdf5', color: data.lowStockCount > 0 ? '#b91c1c' : '#047857' }}>
          <p style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 8px 0' }}>{data.lowStockCount}</p>
          <p style={{ fontSize: '14px', fontWeight: 700, margin: 0, opacity: 0.9 }}>Kam qoldiq ogohlantirish</p>
        </div>
      </div>

      {/* Kam qoldiqlar jadvali */}
      {data.lowStockItems?.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 800, color: '#dc2626', marginBottom: '16px' }}>
            <HiOutlineExclamationTriangle style={{ fontSize: '20px' }} /> Kritik qoldiqlar
          </h4>
          <div style={{ overflowX: 'auto', border: '1px solid #fecaca', borderRadius: '16px' }}>
            <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, background: '#fef2f2', color: '#b91c1c', borderBottom: '2px solid #fecaca' }}>Ehtiyot qism</th>
                  <th style={{ ...thStyle, background: '#fef2f2', color: '#b91c1c', borderBottom: '2px solid #fecaca' }}>Kod</th>
                  <th style={{ ...thStyle, background: '#fef2f2', color: '#b91c1c', borderBottom: '2px solid #fecaca' }}>Ombor</th>
                  <th style={{ ...thStyle, background: '#fef2f2', color: '#b91c1c', borderBottom: '2px solid #fecaca', textAlign: 'right' }}>Joriy</th>
                  <th style={{ ...thStyle, background: '#fef2f2', color: '#b91c1c', borderBottom: '2px solid #fecaca', textAlign: 'right' }}>Minimal</th>
                </tr>
              </thead>
              <tbody>
                {data.lowStockItems.map((item, i) => (
                  <tr key={i} style={{ background: '#fef2f2', transition: 'background 0.2s' }} className="hover:bg-red-50">
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #fee2e2' }}>{item.sparePartName}</td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#ef4444', borderBottom: '1px solid #fee2e2' }}>{item.sparePartCode}</td>
                    <td style={{ ...tdStyle, color: '#475569', fontWeight: 600, borderBottom: '1px solid #fee2e2' }}>{item.warehouseName}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 900, color: '#dc2626', borderBottom: '1px solid #fee2e2' }}>{item.quantity}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: '#991b1b', borderBottom: '1px solid #fee2e2' }}>{item.minStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.lowStockCount === 0 && (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#d1fae5', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiOutlineCheckCircle style={{ fontSize: '32px', color: '#059669' }} />
          </div>
          <p style={{ color: '#059669', fontSize: '18px', fontWeight: 800, margin: 0 }}>Barcha qoldiqlar me'yorda</p>
        </div>
      )}
    </div>
  );
}
