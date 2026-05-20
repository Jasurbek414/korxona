import { useState, useEffect } from 'react';
import { reportService } from '../../services/dataService';
import {
  HiOutlineComputerDesktop, HiOutlineWrenchScrewdriver,
  HiOutlineExclamationTriangle, HiOutlineCube, HiOutlineDocumentArrowDown
} from 'react-icons/hi2';

const TABS = [
  { key: 'equipment', label: 'Uskunalar holati', icon: HiOutlineComputerDesktop, color: 'blue' },
  { key: 'ppr', label: 'PPR bajarilishi', icon: HiOutlineWrenchScrewdriver, color: 'emerald' },
  { key: 'overdue', label: "Muddati o'tgan", icon: HiOutlineExclamationTriangle, color: 'red' },
  { key: 'spare', label: 'Ehtiyot qismlar sarfi', icon: HiOutlineCube, color: 'amber' },
  { key: 'stock', label: 'Ombor qoldiqlari', icon: HiOutlineDocumentArrowDown, color: 'violet' },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('equipment');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  // Davr filtri
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(monthStart);
  const [dateTo, setDateTo] = useState(today.toISOString().slice(0, 10));

  useEffect(() => {
    loadReport();
  }, [activeTab, dateFrom, dateTo]);

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

  const needsDateFilter = ['ppr', 'spare'].includes(activeTab);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📊 Hisobotlar</h1>
          <p className="text-sm text-slate-500 mt-1">Tizimning analitik ko'rsatkichlari</p>
        </div>
      </div>

      {/* Tablar */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === t.key
                ? `bg-${t.color}-600 text-white shadow-lg shadow-${t.color}-500/20`
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
            style={activeTab === t.key ? { background: `var(--tw-gradient-stops, var(--color-${t.color}-600, #2563eb))` } : {}}>
            <t.icon className="text-base" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Davr filtri */}
      {needsDateFilter && (
        <div className="card p-4 mb-6 flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-slate-600">📅 Davr:</span>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-field" style={{width:'auto'}} />
          <span className="text-slate-400">—</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-field" style={{width:'auto'}} />
        </div>
      )}

      {/* Kontent */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Hisobot yuklanmoqda...</p>
          </div>
        ) : !data ? (
          <div className="p-16 text-center text-slate-400">Ma'lumot topilmadi</div>
        ) : (
          <>
            {/* 1. Uskunalar holati */}
            {activeTab === 'equipment' && <EquipmentStatusView data={data} />}
            {/* 2. PPR bajarilishi */}
            {activeTab === 'ppr' && <PprPerformanceView data={data} />}
            {/* 3. Muddati o'tgan */}
            {activeTab === 'overdue' && <OverdueView data={data} />}
            {/* 4. Ehtiyot qismlar sarfi */}
            {activeTab === 'spare' && <SpareUsageView data={data} />}
            {/* 5. Ombor qoldiqlari */}
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
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <HiOutlineComputerDesktop className="text-white text-lg" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Uskunalar holati</h3>
          <p className="text-xs text-slate-500">Jami: {data.totalEquipment} ta uskuna</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Doiraviy grafik */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width="200" height="200" viewBox="0 0 200 200">
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
                    style={{ transition: 'all 0.8s ease' }} />
                );
                return acc;
              }, { elements: [], offset: 0 }).elements}
              <text x="100" y="95" textAnchor="middle" className="text-3xl font-bold" fill="#1e293b">{data.totalEquipment}</text>
              <text x="100" y="115" textAnchor="middle" className="text-xs" fill="#94a3b8">uskuna</text>
            </svg>
          </div>
        </div>

        {/* Legenda */}
        <div className="space-y-3">
          {(data.byStatus || []).map((item, i) => {
            const pct = Math.round((item.count / total) * 100);
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: colors[i % colors.length] }} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{item.statusName}</span>
                    <span className="text-sm font-bold text-slate-800">{item.count} <span className="text-xs text-slate-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toifa bo'yicha */}
      {data.byCategory?.length > 0 && (
        <>
          <div className="divider !my-6" />
          <h4 className="text-sm font-semibold text-slate-600 mb-3">Toifalar bo'yicha</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {data.byCategory.map((c, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-xl font-bold text-slate-800">{c.count}</p>
                <p className="text-xs text-slate-500 mt-1">{c.categoryName}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// =============== 2. PPR BAJARILISHI ===============
function PprPerformanceView({ data }) {
  const circumference = 2 * Math.PI * 55;
  const strokeDash = (data.completionRate / 100) * circumference;
  const rateColor = data.completionRate >= 80 ? '#10b981' : data.completionRate >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <HiOutlineWrenchScrewdriver className="text-white text-lg" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">PPR bajarilishi</h3>
          <p className="text-xs text-slate-500">{data.dateFrom} — {data.dateTo}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doiraviy progress */}
        <div className="flex flex-col items-center justify-center">
          <svg width="160" height="160" className="transform -rotate-90">
            <circle cx="80" cy="80" r="55" fill="none" stroke="#f1f5f9" strokeWidth="14" />
            <circle cx="80" cy="80" r="55" fill="none"
              stroke={rateColor} strokeWidth="14" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - strokeDash}
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
          </svg>
          <div className="text-center -mt-24">
            <span className="text-4xl font-extrabold" style={{ color: rateColor }}>{data.completionRate}%</span>
            <p className="text-xs text-slate-400 mt-1">bajarilish darajasi</p>
          </div>
        </div>

        {/* KPI kartalar */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {[
            { label: 'Jami vazifalar', value: data.totalTasks, color: 'bg-blue-50 text-blue-700' },
            { label: 'Bajarilgan', value: data.completedTasks, color: 'bg-emerald-50 text-emerald-700' },
            { label: 'Jarayonda', value: data.inProgressTasks, color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Rejalashtirilgan', value: data.scheduledTasks, color: 'bg-slate-50 text-slate-700' },
          ].map((item, i) => (
            <div key={i} className={`p-4 rounded-2xl ${item.color} animate-fade-in`} style={{ animationDelay: `${i * 80}ms` }}>
              <p className="text-3xl font-extrabold">{item.value}</p>
              <p className="text-sm font-medium mt-1 opacity-80">{item.label}</p>
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
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
          <HiOutlineExclamationTriangle className="text-white text-lg" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Muddati o'tgan vazifalar</h3>
          <p className="text-xs text-slate-500">Jami: {tasks.length} ta kechikkan</p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">✅</p>
          <p className="text-lg font-semibold text-emerald-600">Barcha vazifalar muddatida!</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Raqam</th>
                <th>Uskuna</th>
                <th>Sana</th>
                <th>Kechikish</th>
                <th>Mas'ul</th>
                <th>Ustuvorlik</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t, i) => (
                <tr key={i}>
                  <td className="font-mono text-xs font-semibold text-blue-600">{t.taskNumber}</td>
                  <td className="font-medium text-slate-800">{t.equipmentName}</td>
                  <td className="text-red-600 font-medium">{t.scheduledDate}</td>
                  <td>
                    <span className={`badge ${t.overdueDays > 7 ? 'badge-red' : 'badge-orange'}`}>
                      {t.overdueDays} kun
                    </span>
                  </td>
                  <td className="text-slate-600 text-xs">{t.assignedTo || '—'}</td>
                  <td>
                    <span className={`badge ${t.priority === 'CRITICAL' ? 'badge-red' : t.priority === 'HIGH' ? 'badge-orange' : 'badge-blue'}`}>
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
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <HiOutlineCube className="text-white text-lg" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Ehtiyot qismlar sarfi</h3>
          <p className="text-xs text-slate-500">{data.dateFrom} — {data.dateTo}</p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-amber-50 text-amber-700">
          <p className="text-2xl font-extrabold">{data.totalOperations}</p>
          <p className="text-xs font-medium mt-1">Operatsiyalar</p>
        </div>
        <div className="p-4 rounded-2xl bg-blue-50 text-blue-700">
          <p className="text-2xl font-extrabold">{data.totalQuantity}</p>
          <p className="text-xs font-medium mt-1">Jami miqdor</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700">
          <p className="text-2xl font-extrabold">{Number(data.totalSum || 0).toLocaleString()}</p>
          <p className="text-xs font-medium mt-1">Jami summa (so'm)</p>
        </div>
      </div>

      {/* Ustunli grafik */}
      {data.byPart && Object.keys(data.byPart).length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-600">Ehtiyot qism bo'yicha sarfi</h4>
          {Object.entries(data.byPart).map(([name, qty], i) => (
            <div key={i} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="w-36 text-sm text-slate-700 font-medium truncate flex-shrink-0">{name}</div>
              <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-end pr-2 transition-all duration-700"
                  style={{ width: `${Math.max(8, (qty / maxQty) * 100)}%` }}>
                  <span className="text-xs font-bold text-white">{qty}</span>
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
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <HiOutlineDocumentArrowDown className="text-white text-lg" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Ombor qoldiqlari</h3>
          <p className="text-xs text-slate-500">Jami: {data.totalItems} ta pozitsiya</p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-violet-50 text-violet-700">
          <p className="text-2xl font-extrabold">{data.totalItems}</p>
          <p className="text-xs font-medium mt-1">Jami pozitsiya</p>
        </div>
        <div className={`p-4 rounded-2xl ${data.lowStockCount > 0 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          <p className="text-2xl font-extrabold">{data.lowStockCount}</p>
          <p className="text-xs font-medium mt-1">Kam qoldiq ogohlantirish</p>
        </div>
      </div>

      {/* Kam qoldiqlar jadvali */}
      {data.lowStockItems?.length > 0 && (
        <>
          <h4 className="text-sm font-semibold text-red-600 mb-3">⚠️ Kritik qoldiqlar</h4>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ehtiyot qism</th>
                  <th>Kod</th>
                  <th>Ombor</th>
                  <th className="text-right">Joriy</th>
                  <th className="text-right">Minimal</th>
                </tr>
              </thead>
              <tbody>
                {data.lowStockItems.map((item, i) => (
                  <tr key={i} className="bg-red-50/30">
                    <td className="font-medium text-slate-800">{item.sparePartName}</td>
                    <td className="font-mono text-xs text-slate-500">{item.sparePartCode}</td>
                    <td className="text-slate-600">{item.warehouseName}</td>
                    <td className="text-right font-bold text-red-600">{item.quantity}</td>
                    <td className="text-right text-slate-500">{item.minStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {data.lowStockCount === 0 && (
        <div className="text-center py-8">
          <p className="text-4xl mb-2">✅</p>
          <p className="text-lg font-semibold text-emerald-600">Barcha qoldiqlar me'yorda</p>
        </div>
      )}
    </div>
  );
}
