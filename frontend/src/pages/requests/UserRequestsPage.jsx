import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuthContext } from '../../hooks/useAuthContext';
import { userRequestService } from '../../services/dataService';
import toast from 'react-hot-toast';
import { 
  HiOutlinePencilSquare, 
  HiOutlinePlus,
  HiOutlineSparkles,
  HiOutlineMagnifyingGlass,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineFlag,
  HiOutlineClipboardDocumentList,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineWrenchScrewdriver,
  HiOutlineChatBubbleLeftEllipsis
} from 'react-icons/hi2';

const STATUS_MAP = {
  NEW: { badge: '#3b82f6', bg: '#eff6ff', icon: <HiOutlineSparkles />, label: 'Yangi' },
  IN_REVIEW: { badge: '#eab308', bg: '#fef9c3', icon: <HiOutlineMagnifyingGlass />, label: "Ko'rib chiqilmoqda" },
  APPROVED: { badge: '#10b981', bg: '#ecfdf5', icon: <HiOutlineCheckCircle />, label: 'Tasdiqlangan' },
  REJECTED: { badge: '#ef4444', bg: '#fef2f2', icon: <HiOutlineXCircle />, label: 'Rad etilgan' },
  COMPLETED: { badge: '#059669', bg: '#d1fae5', icon: <HiOutlineFlag />, label: 'Bajarildi' },
};

const REQUEST_TYPES = [
  { value: 'REPAIR', label: "Ta'mirlash so'rovi" },
  { value: 'SPARE_PART', label: "Ehtiyot qism so'rovi" },
  { value: 'TRANSFER', label: "Uskuna ko'chirish" },
  { value: 'OTHER', label: 'Boshqa' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Past', color: '#64748b', bg: '#f1f5f9' },
  { value: 'NORMAL', label: "O'rta", color: '#0284c7', bg: '#e0f2fe' },
  { value: 'HIGH', label: 'Yuqori', color: '#ea580c', bg: '#ffedd5' },
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

export default function UserRequestsPage() {
  const { user } = useAuthContext();
  const isAdmin = user?.role === 'ADMIN';

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'REPAIR', subject: '', description: '', priority: 'NORMAL', equipmentId: '' });

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = isAdmin
        ? await userRequestService.getAll()
        : await userRequestService.getMyRequests();
      setRequests(res.data?.content || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const filtered = filter === 'ALL'
    ? requests
    : requests.filter(r => r.status === filter);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await userRequestService.create(form);
      toast.success("Ariza yuborildi");
      setShowModal(false);
      setForm({ type: 'REPAIR', subject: '', description: '', priority: 'NORMAL', equipmentId: '' });
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xato");
    }
  };

  const handleStatusChange = async (id, status, comment) => {
    try {
      await userRequestService.updateStatus(id, { status, comment });
      toast.success("Status yangilandi");
      fetchRequests();
    } catch { toast.error("Xato"); }
  };

  const statusCounts = {
    ALL: requests.length,
    NEW: requests.filter(r => r.status === 'NEW').length,
    IN_REVIEW: requests.filter(r => r.status === 'IN_REVIEW').length,
    APPROVED: requests.filter(r => r.status === 'APPROVED').length,
    REJECTED: requests.filter(r => r.status === 'REJECTED').length,
  };

  const inputStyle = { width: '100%', padding: '14px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '15px', fontWeight: 500, color: '#334155', outline: 'none', transition: 'all 0.3s', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '32px', width: '100%', maxWidth: '1600px', margin: '0 auto', boxSizing: 'border-box' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #f43f5e, #be123c)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(244,63,94,0.3)' }}>
            <HiOutlinePencilSquare style={{ color: '#fff', fontSize: '28px' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0', tracking: 'tight' }}>Arizalar</h1>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isAdmin ? 'Barcha foydalanuvchilar arizalari' : 'Sizning arizalaringiz'}
            </p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)', transition: 'all 0.3s' }}
          className="hover:-translate-y-1 hover:shadow-lg"
        >
          <HiOutlinePlus style={{ fontSize: '20px' }} /> Yangi ariza
        </button>
      </div>

      {/* Status filtrlari */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
        {Object.entries({ 
          ALL: { label: 'Barchasi' }, 
          NEW: { icon: <HiOutlineSparkles style={{ fontSize: '18px' }} />, label: 'Yangi' }, 
          IN_REVIEW: { icon: <HiOutlineMagnifyingGlass style={{ fontSize: '18px' }} />, label: "Ko'rib chiqilmoqda" }, 
          APPROVED: { icon: <HiOutlineCheckCircle style={{ fontSize: '18px' }} />, label: 'Tasdiqlangan' }, 
          REJECTED: { icon: <HiOutlineXCircle style={{ fontSize: '18px' }} />, label: 'Rad etilgan' } 
        }).map(([key, { icon, label }]) => (
          <button key={key} onClick={() => setFilter(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '16px',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', border: 'none', whiteSpace: 'nowrap',
              background: filter === key ? '#3b82f6' : '#fff',
              color: filter === key ? '#fff' : '#475569',
              boxShadow: filter === key ? '0 10px 15px -3px rgba(59,130,246,0.3)' : '0 4px 6px -1px rgba(0,0,0,0.05)',
            }}>
            {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
            {label}
            <span style={{
              fontSize: '12px', padding: '2px 8px', borderRadius: '999px', fontWeight: 800,
              background: filter === key ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
              color: filter === key ? '#fff' : '#64748b'
            }}>
              {statusCounts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Arizalar ro'yxati */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ background: '#fff', padding: '64px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', margin: '0 auto 16px' }} />
            <span style={{ color: '#94a3b8', fontSize: '15px', fontWeight: 600 }}>Arizalar yuklanmoqda...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#fff', padding: '64px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)' }}>
            <HiOutlinePencilSquare style={{ fontSize: '64px', color: '#cbd5e1', margin: '0 auto 16px', display: 'block' }} />
            <p style={{ color: '#94a3b8', fontSize: '16px', fontWeight: 600, margin: 0 }}>Ushbu bo'limda arizalar topilmadi</p>
          </div>
        ) : (
          filtered.map((req, i) => {
            const st = STATUS_MAP[req.status] || STATUS_MAP.NEW;
            const priority = PRIORITIES.find(p => p.value === req.priority) || PRIORITIES[1];
            return (
              <div key={req.id} className="animate-fade-in hover:-translate-y-1 hover:shadow-xl" style={{ animationDelay: `${i * 40}ms`, background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)', transition: 'all 0.3s', display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                
                {/* Chap — status icon */}
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', backgroundColor: st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>
                  {st.icon}
                </div>

                {/* O'rta — tafsilot */}
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{req.subject}</h3>
                    <span style={{ padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 800, backgroundColor: st.bg, color: st.badge }}>
                      {st.label}
                    </span>
                    <span style={{ padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 800, backgroundColor: priority.bg, color: priority.color }}>
                      {priority.label}
                    </span>
                  </div>
                  
                  <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {req.description}
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                      <HiOutlineClipboardDocumentList style={{ fontSize: '18px' }} /> {REQUEST_TYPES.find(t => t.value === req.type)?.label || req.type}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                      <HiOutlineUser style={{ fontSize: '18px' }} /> {req.createdByName || 'Noma\'lum'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                      <HiOutlineCalendar style={{ fontSize: '18px' }} /> {req.createdAt?.slice(0, 16).replace('T', ' ')}
                    </div>
                    {req.equipmentId && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                        <HiOutlineWrenchScrewdriver style={{ fontSize: '18px' }} /> ID: {req.equipmentId}
                      </div>
                    )}
                  </div>

                  {req.adminComment && (
                    <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <HiOutlineChatBubbleLeftEllipsis style={{ fontSize: '20px', color: '#3b82f6', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <span style={{ fontWeight: 800, color: '#0f172a', marginRight: '6px' }}>Admin izohi:</span> {req.adminComment}
                      </div>
                    </div>
                  )}
                </div>

                {/* O'ng — admin amallar */}
                {isAdmin && req.status === 'NEW' && (
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button onClick={() => handleStatusChange(req.id, 'IN_REVIEW', '')}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-slate-50">
                      <HiOutlineMagnifyingGlass style={{ fontSize: '18px' }} /> Ko'rish
                    </button>
                  </div>
                )}
                {isAdmin && req.status === 'IN_REVIEW' && (
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button onClick={() => handleStatusChange(req.id, 'APPROVED', 'Tasdiqlandi')}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px', borderRadius: '12px', border: 'none', background: '#10b981', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }} className="hover:-translate-y-1">
                      <HiOutlineCheckCircle style={{ fontSize: '18px' }} /> Tasdiqlash
                    </button>
                    <button onClick={() => {
                      const reason = prompt("Rad etish sababi:");
                      if (reason) handleStatusChange(req.id, 'REJECTED', reason);
                    }}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px', borderRadius: '12px', border: 'none', background: '#ef4444', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }} className="hover:-translate-y-1">
                      <HiOutlineXCircle style={{ fontSize: '18px' }} /> Rad etish
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Yangi ariza modali */}
      {showModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="animate-fade-in" style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '600px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', margin: '16px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HiOutlinePencilSquare style={{ color: '#3b82f6', fontSize: '24px' }} />
              </div>
              Yangi ariza yuborish
            </h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Ariza turi</label>
                  <CustomSelect 
                    value={form.type} onChange={val => setForm({...form, type: val})}
                    options={REQUEST_TYPES} defaultLabel="Tanlang"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Ustuvorlik</label>
                  <CustomSelect 
                    value={form.priority} onChange={val => setForm({...form, priority: val})}
                    options={PRIORITIES.map(p => ({ value: p.value, label: p.label }))} defaultLabel="Tanlang"
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Mavzu *</label>
                  <input required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                    style={inputStyle} placeholder="Ariza mavzusi" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Uskuna ID *</label>
                  <input required type="number" value={form.equipmentId} onChange={e => setForm({...form, equipmentId: e.target.value})}
                    style={inputStyle} placeholder="Masalan: 12" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Tavsif *</label>
                <textarea required rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  style={{ ...inputStyle, resize: 'none', height: '100px' }} placeholder="Batafsil tushuntiring..." />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }} className="hover:-translate-y-1 transition-all hover:shadow-lg">
                  📤 Yuborish
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
