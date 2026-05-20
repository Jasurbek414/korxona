import { useState, useEffect, useCallback, useRef } from 'react';
import { auditLogService } from '../../services/dataService';
import toast from 'react-hot-toast';
import { 
  HiOutlineClipboardDocumentList, HiOutlinePlus, HiOutlinePencilSquare, 
  HiOutlineTrash, HiOutlineKey, HiOutlineArrowRightOnRectangle,
  HiOutlineArrowPath, HiOutlineCheckCircle, HiOutlineFunnel,
  HiOutlineChevronLeft, HiOutlineChevronRight
} from 'react-icons/hi2';

const ACTION_STYLES = {
  CREATE: { bg: '#ecfdf5', color: '#059669', icon: HiOutlinePlus },
  UPDATE: { bg: '#eff6ff', color: '#2563eb', icon: HiOutlinePencilSquare },
  DELETE: { bg: '#fef2f2', color: '#dc2626', icon: HiOutlineTrash },
  LOGIN: { bg: '#f5f3ff', color: '#7c3aed', icon: HiOutlineKey },
  LOGOUT: { bg: '#f1f5f9', color: '#475569', icon: HiOutlineArrowRightOnRectangle },
  STATUS_CHANGE: { bg: '#fffbeb', color: '#d97706', icon: HiOutlineArrowPath },
  APPROVE: { bg: '#ecfdf5', color: '#059669', icon: HiOutlineCheckCircle },
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
    <div ref={containerRef} style={{ position: 'relative', minWidth: '240px' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '100%', padding: '12px 16px', borderRadius: '12px', 
          border: isOpen ? '1px solid #6366f1' : '1px solid #cbd5e1', 
          background: '#fff', fontSize: '14px', 
          color: value ? '#0f172a' : '#64748b', 
          outline: 'none', cursor: 'pointer', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          boxShadow: isOpen ? '0 0 0 4px rgba(99,102,241,0.1)' : 'none', 
          transition: 'all 0.2s',
          fontWeight: 600,
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
                color: value === '' ? '#6366f1' : '#475569', 
                background: value === '' ? '#eef2ff' : 'transparent', 
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
                color: value == opt.value ? '#6366f1' : '#475569', 
                background: value == opt.value ? '#eef2ff' : 'transparent', 
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

  const getStyle = (action) => ACTION_STYLES[action] || { bg: '#f1f5f9', color: '#475569', icon: HiOutlineClipboardDocumentList };

  const inputStyle = { padding: '12px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#334155', outline: 'none', transition: 'all 0.3s', boxSizing: 'border-box' };
  const thStyle = { padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' };
  const tdStyle = { padding: '16px 24px', fontSize: '14px', color: '#334155', borderBottom: '1px solid #f1f5f9', fontWeight: 500 };

  const actionOptions = [
    { value: 'CREATE', label: 'Yaratish' },
    { value: 'UPDATE', label: "O'zgartirish" },
    { value: 'DELETE', label: "O'chirish" },
    { value: 'LOGIN', label: 'Tizimga kirish' },
    { value: 'STATUS_CHANGE', label: 'Status o\'zgarishi' }
  ];

  return (
    <div style={{ padding: '32px', width: '100%', maxWidth: '1600px', margin: '0 auto', boxSizing: 'border-box' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(99,102,241,0.3)' }}>
          <HiOutlineClipboardDocumentList style={{ color: '#fff', fontSize: '28px' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0', tracking: 'tight' }}>Audit jurnali</h1>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Tizim amallarining to'liq tarixi
          </p>
        </div>
      </div>

      {/* Filtrlar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', background: '#fff', borderRadius: '20px', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)', marginBottom: '32px', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 800, color: '#475569' }}>
          <HiOutlineFunnel style={{ fontSize: '20px' }} /> Filtr:
        </span>
        <CustomSelect 
          value={filterAction} onChange={v => { setFilterAction(v); setPage(0); }}
          options={actionOptions} defaultLabel="Barcha amallar"
        />
        <input type="text" value={filterUser} onChange={e => setFilterUser(e.target.value)}
          style={{ ...inputStyle, width: '280px' }} placeholder="Foydalanuvchi nomi..." />
      </div>

      {/* Jadval */}
      <div style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', margin: '0 auto 16px' }} />
            <span style={{ color: '#94a3b8', fontSize: '15px', fontWeight: 600 }}>Yuklanmoqda...</span>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center' }}>
            <HiOutlineClipboardDocumentList style={{ fontSize: '64px', color: '#cbd5e1', margin: '0 auto 16px', display: 'block' }} />
            <p style={{ color: '#94a3b8', fontSize: '16px', fontWeight: 600, margin: 0 }}>Loglar topilmadi</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Sana/Vaqt</th>
                    <th style={thStyle}>Foydalanuvchi</th>
                    <th style={thStyle}>Amal</th>
                    <th style={thStyle}>Jadval</th>
                    <th style={thStyle}>Tafsilot</th>
                    <th style={thStyle}>IP manzil</th>
                  </tr>
                </thead>
                <tbody>
                  {logs
                    .filter(l => !filterUser || (l.username || '').toLowerCase().includes(filterUser.toLowerCase()))
                    .map((log, i) => {
                    const style = getStyle(log.action);
                    const Icon = style.icon;
                    return (
                      <tr key={log.id || i} className="animate-fade-in hover:bg-slate-50" style={{ animationDelay: `${i * 10}ms`, transition: 'background 0.2s' }}>
                        <td style={{ ...tdStyle, color: '#64748b', fontSize: '13px', whiteSpace: 'nowrap' }}>
                          {log.createdAt?.slice(0, 16).replace('T', ' ')}
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 800, flexShrink: 0, boxShadow: '0 4px 6px -1px rgba(99,102,241,0.3)' }}>
                              {log.username?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{log.username}</span>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, background: style.bg, color: style.color }}>
                            <Icon style={{ fontSize: '14px' }} /> {log.action}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: '#64748b', fontSize: '13px', fontWeight: 600 }}>{log.tableName || '—'}</td>
                        <td style={{ ...tdStyle, color: '#475569', fontSize: '13px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.details}>
                          {log.details || '—'}
                        </td>
                        <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#94a3b8', fontSize: '12px', fontWeight: 700 }}>{log.ipAddress || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginatsiya */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderTop: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0 }}>Sahifa {page + 1} / {totalPages}</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '12px', background: '#fff', border: '1px solid #cbd5e1', color: '#475569', fontSize: '14px', fontWeight: 700, cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.5 : 1, transition: 'all 0.2s' }}
                    className={page === 0 ? "" : "hover:bg-slate-50 hover:border-slate-400"}>
                    <HiOutlineChevronLeft style={{ fontSize: '16px' }} /> Oldingi
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '12px', background: '#fff', border: '1px solid #cbd5e1', color: '#475569', fontSize: '14px', fontWeight: 700, cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page >= totalPages - 1 ? 0.5 : 1, transition: 'all 0.2s' }}
                    className={page >= totalPages - 1 ? "" : "hover:bg-slate-50 hover:border-slate-400"}>
                    Keyingi <HiOutlineChevronRight style={{ fontSize: '16px' }} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
