import { useState, useEffect, useCallback } from 'react';
import { auditLogService } from '../../services/dataService';
import toast from 'react-hot-toast';

const ACTION_STYLES = {
  CREATE: { badge: 'badge-green', icon: '➕' },
  UPDATE: { badge: 'badge-blue', icon: '✏️' },
  DELETE: { badge: 'badge-red', icon: '🗑️' },
  LOGIN: { badge: 'badge-purple', icon: '🔑' },
  LOGOUT: { badge: 'badge-slate', icon: '🚪' },
  STATUS_CHANGE: { badge: 'badge-yellow', icon: '🔄' },
  APPROVE: { badge: 'badge-emerald', icon: '✅' },
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 25 };
      let res;
      if (filterAction) {
        res = await auditLogService.getByAction(filterAction, params);
      } else {
        res = await auditLogService.getAll(params);
      }
      setLogs(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch { toast.error("Audit logni yuklashda xato"); }
    setLoading(false);
  }, [page, filterAction]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const getStyle = (action) => ACTION_STYLES[action] || { badge: 'badge-slate', icon: '📋' };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📋 Audit jurnali</h1>
          <p className="text-sm text-slate-500 mt-1">Tizim amallarining to'liq tarixi</p>
        </div>
      </div>

      {/* Filtrlar */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-600">Filtr:</span>
          <select value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(0); }}
            className="input-field" style={{ width: 'auto' }}>
            <option value="">Barcha amallar</option>
            <option value="CREATE">Yaratish</option>
            <option value="UPDATE">O'zgartirish</option>
            <option value="DELETE">O'chirish</option>
            <option value="LOGIN">Tizimga kirish</option>
            <option value="STATUS_CHANGE">Status o'zgarishi</option>
          </select>
          <input type="text" value={filterUser} onChange={e => setFilterUser(e.target.value)}
            className="input-field" placeholder="Foydalanuvchi nomi..." style={{ width: '200px' }} />
        </div>
      </div>

      {/* Jadval */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Yuklanmoqda...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <p className="text-4xl mb-2">📋</p>
            <p>Loglar topilmadi</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Sana/Vaqt</th>
                    <th>Foydalanuvchi</th>
                    <th>Amal</th>
                    <th>Jadval</th>
                    <th>Tafsilot</th>
                    <th>IP manzil</th>
                  </tr>
                </thead>
                <tbody>
                  {logs
                    .filter(l => !filterUser || (l.username || '').toLowerCase().includes(filterUser.toLowerCase()))
                    .map((log, i) => {
                    const style = getStyle(log.action);
                    return (
                      <tr key={log.id || i} className="animate-fade-in" style={{ animationDelay: `${i * 20}ms` }}>
                        <td className="text-xs text-slate-500 whitespace-nowrap">
                          {log.createdAt?.slice(0, 16).replace('T', ' ')}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {log.username?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <span className="text-sm font-medium text-slate-700">{log.username}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${style.badge}`}>
                            {style.icon} {log.action}
                          </span>
                        </td>
                        <td className="text-xs text-slate-500">{log.tableName || '—'}</td>
                        <td className="text-xs text-slate-600 max-w-xs truncate" title={log.details}>
                          {log.details || '—'}
                        </td>
                        <td className="font-mono text-xs text-slate-400">{log.ipAddress || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginatsiya */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <p className="text-sm text-slate-500">{page + 1} / {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="btn btn-outline btn-sm disabled:opacity-40">← Oldingi</button>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                    className="btn btn-outline btn-sm disabled:opacity-40">Keyingi →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
