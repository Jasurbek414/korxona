import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { pprService, referenceService } from '../../services/dataService';
import { useAuthContext } from '../../hooks/useAuthContext';
import toast from 'react-hot-toast';
import { HiOutlineWrenchScrewdriver, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';

const PRIORITIES = [
  { value: 'LOW', label: 'Past', color: '#64748b', bg: '#f1f5f9' },
  { value: 'MEDIUM', label: "O'rta", color: '#0284c7', bg: '#e0f2fe' },
  { value: 'HIGH', label: 'Yuqori', color: '#ea580c', bg: '#ffedd5' },
  { value: 'CRITICAL', label: 'Kritik', color: '#e11d48', bg: '#ffe4e6' },
];
const STATUSES = [
  { value: 'SCHEDULED', label: 'Rejalashtirilgan', color: '#0284c7', bg: '#e0f2fe', icon: '🔵' },
  { value: 'IN_PROGRESS', label: 'Jarayonda', color: '#ca8a04', bg: '#fef9c3', icon: '🟡' },
  { value: 'COMPLETED', label: 'Bajarilgan', color: '#16a34a', bg: '#dcfce3', icon: '🟢' },
  { value: 'APPROVED', label: 'Tasdiqlangan', color: '#059669', bg: '#d1fae5', icon: '✅' },
];

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
// --- END CUSTOM SELECT COMPONENT ---

export default function PprTaskListPage() {
  const { user } = useAuthContext();
  const isAdmin = user?.role === 'ADMIN';

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filtrlar
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // PPR turlari va mas'ul shaxslar
  const [pprTypes, setPprTypes] = useState([]);
  const [persons, setPersons] = useState([]);

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ equipmentId: '', pprTypeId: '', assignedToId: '', scheduledDate: '', priority: 'MEDIUM', description: '' });

  useEffect(() => {
    Promise.all([
      pprService.getTypes(),
      referenceService.responsiblePersons.getAll()
    ]).then(([typesRes, personsRes]) => {
      setPprTypes(typesRes.data);
      setPersons(personsRes.data);
    }).catch(() => {});
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 20 };
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const res = await pprService.getTasks(params);
      setTasks(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch { toast.error("Vazifalarni yuklashda xato"); }
    setLoading(false);
  }, [page, filterStatus, filterPriority, dateFrom, dateTo]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await pprService.changeStatus(id, newStatus, null);
      toast.success('Status yangilandi');
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xato');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await pprService.createTask(form);
      toast.success('Vazifa yaratildi');
      setShowCreateModal(false);
      setForm({ equipmentId: '', pprTypeId: '', assignedToId: '', scheduledDate: '', priority: 'MEDIUM', description: '' });
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Yaratishda xato');
    }
  };

  const getPriority = (val) => PRIORITIES.find(p => p.value === val) || PRIORITIES[1];
  const getStatus = (val) => STATUSES.find(s => s.value === val) || STATUSES[0];

  const inputStyle = { width: '100%', padding: '14px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '15px', fontWeight: 500, color: '#334155', outline: 'none', transition: 'all 0.3s', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '32px', width: '100%', maxWidth: '1600px', margin: '0 auto', boxSizing: 'border-box' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(16,185,129,0.3)' }}>
            <HiOutlineWrenchScrewdriver style={{ color: '#fff', fontSize: '28px' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0', tracking: 'tight' }}>PPR Vazifalari</h1>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Jami vazifalar: <span style={{ color: '#10b981', fontWeight: 800 }}>{totalElements} ta</span>
            </p>
          </div>
        </div>
        {(isAdmin || user?.role === 'OPERATOR') && (
          <button onClick={() => setShowCreateModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)', transition: 'all 0.3s' }}
            className="hover:-translate-y-1 hover:shadow-lg"
          >
            + Yangi vazifa
          </button>
        )}
      </div>

      {/* Filtrlar */}
      <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', marginBottom: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <CustomSelect 
              value={filterStatus} onChange={val => { setFilterStatus(val); setPage(0); }}
              options={STATUSES.map(s => ({ value: s.value, label: `${s.icon} ${s.label}` }))} defaultLabel="Barcha statuslar"
            />
          </div>
          <div>
            <CustomSelect 
              value={filterPriority} onChange={val => { setFilterPriority(val); setPage(0); }}
              options={PRIORITIES.map(p => ({ value: p.value, label: p.label }))} defaultLabel="Barcha ustuvorliklar"
            />
          </div>
          <div>
            <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0); }}
              style={inputStyle} 
              onFocus={e => { e.target.style.borderColor='#3b82f6'; }} 
              onBlur={e => { e.target.style.borderColor='#cbd5e1'; }} />
          </div>
          <div>
            <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0); }}
              style={inputStyle} 
              onFocus={e => { e.target.style.borderColor='#3b82f6'; }} 
              onBlur={e => { e.target.style.borderColor='#cbd5e1'; }} />
          </div>
        </div>
      </div>

      {/* Jadval */}
      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Raqam</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Uskuna</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Turi</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sana</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ustuvorlik</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mas'ul</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '64px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%' }} />
                      <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>Vazifalar yuklanmoqda...</span>
                    </div>
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '64px', textAlign: 'center' }}>
                    <p style={{ color: '#94a3b8', fontSize: '15px', fontWeight: 500 }}>Vazifalar topilmadi</p>
                  </td>
                </tr>
              ) : (
                tasks.map(task => {
                  const priority = getPriority(task.priority);
                  const status = getStatus(task.status);
                  return (
                    <tr key={task.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: task.isOverdue ? '#fff1f2' : 'transparent' }}>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700, color: '#2563eb', fontFamily: 'monospace' }}>{task.taskNumber}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{task.equipmentName}</div>
                        <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>{task.equipmentInventoryNumber}</div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>{task.pprTypeName}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: task.isOverdue ? '#e11d48' : '#334155' }}>
                          {task.scheduledDate}
                        </div>
                        {task.isOverdue && (
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444', marginTop: '2px' }}>{task.overdueDays} kun kechikkan</div>
                        )}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ padding: '6px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, backgroundColor: priority.bg, color: priority.color }}>
                          {priority.label}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ padding: '6px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, backgroundColor: status.bg, color: status.color, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {status.icon} {status.label}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 500, color: '#64748b' }}>{task.assignedToName || '—'}</td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          {task.status === 'SCHEDULED' && (
                            <button onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                              style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#fef9c3', color: '#a16207', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-yellow-200">
                              ▶ Boshlash
                            </button>
                          )}
                          {task.status === 'IN_PROGRESS' && (
                            <button onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                              style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#dcfce3', color: '#15803d', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-green-200">
                              ✓ Yakunlash
                            </button>
                          )}
                          {task.status === 'COMPLETED' && isAdmin && (
                            <button onClick={() => handleStatusChange(task.id, 'APPROVED')}
                              style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#d1fae5', color: '#047857', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-emerald-200">
                              ✅ Tasdiqlash
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginatsiya */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', margin: 0 }}>
              Ko'rsatilmoqda: {page * 20 + 1}–{Math.min((page + 1) * 20, totalElements)} / {totalElements} ta
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                style={{ padding: '8px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.5 : 1 }}
              >
                <HiOutlineChevronLeft style={{ fontSize: '18px' }} />
              </button>
              <span style={{ padding: '0 12px', fontSize: '14px', fontWeight: 700, color: '#334155' }}>
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                style={{ padding: '8px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page >= totalPages - 1 ? 0.5 : 1 }}
              >
                <HiOutlineChevronRight style={{ fontSize: '18px' }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Yangi vazifa modali */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="animate-fade-in" style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', margin: '16px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Yangi PPR vazifasi</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Uskuna ID *</label>
                  <input type="number" required value={form.equipmentId}
                    onChange={e => setForm({...form, equipmentId: e.target.value})}
                    style={inputStyle} placeholder="ID raqami" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>PPR turi *</label>
                  <CustomSelect 
                    value={form.pprTypeId} onChange={val => setForm({...form, pprTypeId: val})}
                    options={pprTypes.map(t => ({ value: t.id, label: t.nameUz }))} defaultLabel="Tanlang"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Sana *</label>
                  <input type="date" required value={form.scheduledDate}
                    onChange={e => setForm({...form, scheduledDate: e.target.value})}
                    style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Ustuvorlik</label>
                  <CustomSelect 
                    value={form.priority} onChange={val => setForm({...form, priority: val})}
                    options={PRIORITIES.map(p => ({ value: p.value, label: p.label }))} defaultLabel="Tanlang"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Mas'ul shaxs</label>
                <CustomSelect 
                  value={form.assignedToId} onChange={val => setForm({...form, assignedToId: val})}
                  options={persons.map(p => ({ value: p.id, label: p.fullName }))} defaultLabel="Tanlanmagan"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Tavsif</label>
                <textarea value={form.description} rows={3}
                  onChange={e => setForm({...form, description: e.target.value})}
                  style={{ ...inputStyle, resize: 'none', height: '80px' }} placeholder="Qo'shimcha ma'lumot..." />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit"
                  style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
                  className="hover:-translate-y-1 transition-all hover:shadow-lg">
                  Yaratish
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)}
                  style={{ padding: '14px 24px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
                  className="hover:bg-slate-100 transition-colors">
                  Bekor qilish
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
