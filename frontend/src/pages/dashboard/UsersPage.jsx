import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { userService } from '../../services/dataService';
import toast from 'react-hot-toast';
import {
  HiOutlineUsers, HiOutlinePlus, HiOutlinePencilSquare,
  HiOutlineTrash, HiOutlineLockClosed, HiOutlineLockOpen,
  HiOutlineXMark, HiOutlineCheck, HiOutlineKey, HiOutlineUserGroup
} from 'react-icons/hi2';

const roles = [
  { value: 'ADMIN', label: 'Administrator', color: '#ef4444', bg: '#fef2f2' },
  { value: 'OPERATOR', label: 'Operator', color: '#f59e0b', bg: '#fffbeb' },
  { value: 'VIEWER', label: 'Ko\'ruvchi', color: '#0ea5e9', bg: '#f0f9ff' },
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
          border: isOpen ? '1px solid #4f46e5' : '1px solid #cbd5e1', 
          background: '#fff', fontSize: '15px', 
          color: value ? '#0f172a' : '#64748b', 
          outline: 'none', cursor: 'pointer', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          boxShadow: isOpen ? '0 0 0 4px rgba(79,70,229,0.1)' : 'none', 
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
                color: value === '' ? '#4f46e5' : '#475569', 
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
                color: value == opt.value ? '#4f46e5' : '#475569', 
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

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showResetModal, setShowResetModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [form, setForm] = useState({
    username: '', password: '', fullName: '', email: '', phone: '', role: 'OPERATOR', language: 'UZ',
  });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAll();
      setUsers(res.data || []);
    } catch { toast.error("Foydalanuvchilarni yuklashda xato"); }
    finally { setLoading(false); }
  };

  const openForm = (user = null) => {
    if (user) {
      setEditUser(user);
      setForm({ ...user, password: '' });
    } else {
      setEditUser(null);
      setForm({ username: '', password: '', fullName: '', email: '', phone: '', role: 'OPERATOR', language: 'UZ' });
    }
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.username || !form.fullName || !form.role) {
      toast.error("Majburiy maydonlarni to'ldiring");
      return;
    }
    if (!editUser && (!form.password || form.password.length < 8)) {
      toast.error("Parol kamida 8 belgidan iborat bo'lishi kerak");
      return;
    }
    try {
      if (editUser) {
        await userService.update(editUser.id, form);
        toast.success("Foydalanuvchi yangilandi");
      } else {
        await userService.create(form);
        toast.success("Foydalanuvchi yaratildi");
      }
      setShowForm(false);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xato yuz berdi");
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await userService.toggleActive(user.id);
      toast.success(user.isActive ? "Bloklandi" : "Aktivlashtirildi");
      loadUsers();
    } catch { toast.error("Xato"); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error("Parol kamida 8 belgi");
      return;
    }
    try {
      await userService.resetPassword(showResetModal.id, newPassword);
      toast.success("Parol tiklandi");
      setShowResetModal(null);
      setNewPassword('');
    } catch { toast.error("Xato"); }
  };

  const handleDelete = async (user) => {
    if (!confirm(`"${user.fullName}" ni o'chirmoqchimisiz?`)) return;
    try {
      await userService.delete(user.id);
      toast.success("Foydalanuvchi o'chirildi");
      loadUsers();
    } catch { toast.error("Xato"); }
  };

  const inputStyle = { width: '100%', padding: '14px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '15px', fontWeight: 500, color: '#334155', outline: 'none', transition: 'all 0.3s', boxSizing: 'border-box' };
  const disabledInputStyle = { ...inputStyle, background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' };
  const thStyle = { padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' };
  const tdStyle = { padding: '16px 24px', fontSize: '14px', color: '#334155', borderBottom: '1px solid #f1f5f9', fontWeight: 500 };

  return (
    <div style={{ padding: '32px', width: '100%', maxWidth: '1600px', margin: '0 auto', boxSizing: 'border-box' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #4f46e5, #4338ca)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(79,70,229,0.3)' }}>
            <HiOutlineUserGroup style={{ color: '#fff', fontSize: '28px' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0', tracking: 'tight' }}>Foydalanuvchilar</h1>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Jami: {users.length} ta xodim
            </p>
          </div>
        </div>
        <button onClick={() => openForm()}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #4f46e5, #4338ca)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(79,70,229,0.3)', transition: 'all 0.3s' }}
          className="hover:-translate-y-1 hover:shadow-lg"
        >
          <HiOutlinePlus style={{ fontSize: '20px' }} /> Yangi foydalanuvchi
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: '60px' }}>#</th>
                <th style={thStyle}>F.I.O.</th>
                <th style={thStyle}>Username</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Rol</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Holat</th>
                <th style={{ ...thStyle, textAlign: 'center', width: '180px' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: '64px', textAlign: 'center' }}><div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', margin: '0 auto' }} /></td></tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '64px', textAlign: 'center' }}>
                    <HiOutlineUsers style={{ fontSize: '64px', color: '#cbd5e1', margin: '0 auto 16px', display: 'block' }} />
                    <p style={{ color: '#94a3b8', fontSize: '16px', fontWeight: 600, margin: 0 }}>Foydalanuvchilar topilmadi</p>
                  </td>
                </tr>
              ) : users.map((u, i) => {
                const role = roles.find(r => r.value === u.role);
                return (
                  <tr key={u.id} style={{ transition: 'background 0.2s' }} className="hover:bg-slate-50">
                    <td style={{ ...tdStyle, color: '#94a3b8', fontWeight: 700 }}>{i + 1}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#0f172a' }}>{u.fullName}</td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 700, color: '#6366f1' }}>{u.username}</td>
                    <td style={{ ...tdStyle, color: '#64748b' }}>{u.email || '—'}</td>
                    <td style={tdStyle}>
                      <span style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, background: role?.bg, color: role?.color }}>
                        {role?.label}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 800, background: u.isActive ? '#d1fae5' : '#fecaca', color: u.isActive ? '#065f46' : '#991b1b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.isActive ? '#10b981' : '#ef4444' }} />
                        {u.isActive ? 'Aktiv' : 'Bloklangan'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <button onClick={() => openForm(u)} title="Tahrirlash"
                          style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-indigo-50">
                          <HiOutlinePencilSquare style={{ fontSize: '18px' }} />
                        </button>
                        <button onClick={() => handleToggleActive(u)} title={u.isActive ? 'Bloklash' : 'Aktivlashtirish'}
                          style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: u.isActive ? '#f59e0b' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} className={u.isActive ? "hover:bg-amber-50" : "hover:bg-emerald-50"}>
                          {u.isActive ? <HiOutlineLockClosed style={{ fontSize: '18px' }} /> : <HiOutlineLockOpen style={{ fontSize: '18px' }} />}
                        </button>
                        <button onClick={() => { setShowResetModal(u); setNewPassword(''); }} title="Parol tiklash"
                          style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-violet-50">
                          <HiOutlineKey style={{ fontSize: '18px' }} />
                        </button>
                        <button onClick={() => handleDelete(u)} title="O'chirish"
                          style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #fecaca', background: '#fff', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-red-50">
                          <HiOutlineTrash style={{ fontSize: '18px' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yaratish/Tahrirlash modal */}
      {showForm && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="animate-fade-in" style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '600px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', margin: '16px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {editUser ? <HiOutlinePencilSquare style={{ color: '#4f46e5', fontSize: '20px' }} /> : <HiOutlinePlus style={{ color: '#4f46e5', fontSize: '20px' }} />}
                </div>
                {editUser ? 'Tahrirlash' : 'Yangi foydalanuvchi'}
              </h2>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} className="hover:text-slate-700">
                <HiOutlineXMark style={{ fontSize: '24px' }} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Username <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})}
                  style={editUser ? disabledInputStyle : inputStyle} disabled={!!editUser} placeholder="M-uchun: admin" />
              </div>
              {!editUser && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Parol <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                    style={inputStyle} placeholder="Kamida 8 belgi" />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>F.I.O. <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})}
                  style={inputStyle} placeholder="To'liq ism-sharif" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Email</label>
                  <input type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})}
                    style={inputStyle} placeholder="example@mail.com" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Telefon</label>
                  <input type="tel" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})}
                    style={inputStyle} placeholder="+998 90 123 45 67" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Rol <span style={{ color: '#ef4444' }}>*</span></label>
                <CustomSelect 
                  value={form.role} onChange={val => setForm({...form, role: val})}
                  options={roles} defaultLabel="Rolni tanlang"
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #4f46e5, #4338ca)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }} className="hover:-translate-y-1 transition-all hover:shadow-lg">
                  {editUser ? 'Saqlash' : "Qo'shish"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '14px 24px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }} className="hover:bg-slate-100 transition-colors">
                  Bekor
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Parol tiklash modal */}
      {showResetModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="animate-fade-in" style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '400px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', margin: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HiOutlineKey style={{ color: '#8b5cf6', fontSize: '20px' }} />
                </div>
                Parol tiklash
              </h2>
              <button type="button" onClick={() => setShowResetModal(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} className="hover:text-slate-700">
                <HiOutlineXMark style={{ fontSize: '24px' }} />
              </button>
            </div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: '0 0 24px 0' }}>{showResetModal.fullName}</p>
            
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Yangi parol</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  style={{...inputStyle, border: '1px solid #8b5cf6'}} placeholder="Kamida 8 belgi" />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }} className="hover:-translate-y-1 transition-all hover:shadow-lg">
                  Tiklash
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
