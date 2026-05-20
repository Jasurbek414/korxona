import { useState, useEffect } from 'react';
import { userService } from '../../services/dataService';
import toast from 'react-hot-toast';
import {
  HiOutlineUsers, HiOutlinePlusCircle, HiOutlinePencilSquare,
  HiOutlineTrash, HiOutlineLockClosed, HiOutlineLockOpen,
  HiOutlineXMark, HiOutlineCheck, HiOutlineKey,
} from 'react-icons/hi2';

const roles = [
  { value: 'ADMIN', label: 'Administrator', color: '#ef4444' },
  { value: 'OPERATOR', label: 'Operator', color: '#f59e0b' },
  { value: 'VIEWER', label: 'Ko\'ruvchi', color: '#06b6d4' },
];

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

  const handleSave = async () => {
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

  const handleResetPassword = async () => {
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <HiOutlineUsers className="text-2xl text-[var(--color-primary)]" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Foydalanuvchilar</h1>
        </div>
        <button onClick={() => openForm()}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-600/20 transition-all">
          <HiOutlinePlusCircle className="text-lg" /> Yangi foydalanuvchi
        </button>
      </div>

      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--bg-main)] border-b border-[var(--border-color)]">
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-secondary)]">#</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-secondary)]">F.I.O.</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-secondary)]">Username</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-secondary)]">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-secondary)]">Rol</th>
                <th className="px-4 py-3 text-center font-semibold text-[var(--text-secondary)]">Holat</th>
                <th className="px-4 py-3 text-center font-semibold text-[var(--text-secondary)]">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center"><div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-[var(--text-muted)]">Foydalanuvchilar topilmadi</td></tr>
              ) : users.map((u, i) => {
                const role = roles.find(r => r.value === u.role);
                return (
                  <tr key={u.id} className="border-b border-[var(--border-color)] hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3 text-[var(--text-muted)]">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{u.fullName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)]">{u.username}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{u.email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${role?.color}15`, color: role?.color }}>
                        {role?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                        {u.isActive ? 'Aktiv' : 'Bloklangan'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openForm(u)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all" title="Tahrirlash">
                          <HiOutlinePencilSquare className="text-base" />
                        </button>
                        <button onClick={() => handleToggleActive(u)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title={u.isActive ? 'Bloklash' : 'Aktivlashtirish'}>
                          {u.isActive ? <HiOutlineLockClosed className="text-base" /> : <HiOutlineLockOpen className="text-base" />}
                        </button>
                        <button onClick={() => { setShowResetModal(u); setNewPassword(''); }} className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all" title="Parol tiklash">
                          <HiOutlineKey className="text-base" />
                        </button>
                        <button onClick={() => handleDelete(u)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="O'chirish">
                          <HiOutlineTrash className="text-base" />
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
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
              <h3 className="font-semibold text-lg">{editUser ? 'Tahrirlash' : 'Yangi foydalanuvchi'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-slate-100"><HiOutlineXMark className="text-xl" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Username <span className="text-red-500">*</span></label>
                <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)]" disabled={!!editUser} />
              </div>
              {!editUser && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Parol <span className="text-red-500">*</span></label>
                  <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)]" placeholder="Kamida 8 belgi" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">F.I.O. <span className="text-red-500">*</span></label>
                <input type="text" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
                  <input type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Telefon</label>
                  <input type="tel" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Rol <span className="text-red-500">*</span></label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)]">
                  {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-[var(--border-color)]">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-slate-100 rounded-xl">Bekor</button>
              <button onClick={handleSave} className="flex items-center gap-1.5 px-5 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-xl hover:bg-[var(--color-primary-dark)]">
                <HiOutlineCheck /> Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Parol tiklash modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowResetModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[var(--border-color)]">
              <h3 className="font-semibold">Parol tiklash</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">{showResetModal.fullName}</p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Yangi parol</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)]" placeholder="Kamida 8 belgi" />
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-[var(--border-color)]">
              <button onClick={() => setShowResetModal(null)} className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-slate-100 rounded-xl">Bekor</button>
              <button onClick={handleResetPassword} className="px-5 py-2 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-500">Tiklash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
