import { useState } from 'react';
import { useAuth } from '../../hooks/useAuthContext';
import { authService } from '../../services/dataService';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineEnvelope, HiOutlinePhone, HiOutlineLockClosed, HiOutlineCheck } from 'react-icons/hi2';

const ROLE_LABELS = { ADMIN: 'Administrator', OPERATOR: 'Operator', VIEWER: "Ko'ruvchi" };
const ROLE_COLORS = { ADMIN: 'badge-red', OPERATOR: 'badge-yellow', VIEWER: 'badge-blue' };

export default function ProfilePage() {
  const { user, loadProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('info');

  // Profil tahrirlash
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);

  // Parol o'zgartirish
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPw, setChangingPw] = useState(false);

  const handleSaveProfile = async () => {
    if (!profileForm.fullName.trim()) { toast.error("F.I.O. majburiy"); return; }
    setSaving(true);
    try {
      await authService.updateProfile(profileForm);
      toast.success("Profil yangilandi");
      loadProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xato");
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) { toast.error("Barcha maydonlarni to'ldiring"); return; }
    if (pwForm.newPassword.length < 8) { toast.error("Yangi parol kamida 8 belgi"); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error("Parollar mos emas"); return; }
    setChangingPw(true);
    try {
      await authService.changePassword(pwForm);
      toast.success("Parol o'zgartirildi");
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || "Xato");
    }
    setChangingPw(false);
  };

  if (!user) return null;

  const initials = user.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="animate-fade-in max-w-3xl">
      {/* Header card */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/25">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{user.fullName}</h1>
            <p className="text-sm text-slate-500 mt-0.5">@{user.username}</p>
            <span className={`badge ${ROLE_COLORS[user.role] || 'badge-slate'} mt-2`}>
              {ROLE_LABELS[user.role] || user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Tablar */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'info', label: '📋 Shaxsiy ma\'lumotlar' },
          { key: 'password', label: '🔒 Parol o\'zgartirish' },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveSection(t.key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeSection === t.key
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Shaxsiy ma'lumotlar */}
      {activeSection === 'info' && (
        <div className="card p-6 animate-fade-in">
          <h3 className="text-base font-bold text-slate-800 mb-5">Shaxsiy ma'lumotlarni tahrirlash</h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1.5">
                <HiOutlineUser className="text-base" /> F.I.O. <span className="text-red-500">*</span>
              </label>
              <input value={profileForm.fullName} onChange={e => setProfileForm({...profileForm, fullName: e.target.value})}
                className="input-field" placeholder="To'liq ism" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1.5">
                <HiOutlineEnvelope className="text-base" /> Email
              </label>
              <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                className="input-field" placeholder="email@example.com" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1.5">
                <HiOutlinePhone className="text-base" /> Telefon
              </label>
              <input value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                className="input-field" placeholder="+998 90 123 45 67" />
            </div>
            <div className="divider" />
            <div className="flex justify-end">
              <button onClick={handleSaveProfile} disabled={saving} className="btn btn-primary">
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <HiOutlineCheck />
                )}
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Parol o'zgartirish */}
      {activeSection === 'password' && (
        <div className="card p-6 animate-fade-in">
          <h3 className="text-base font-bold text-slate-800 mb-5">Parolni o'zgartirish</h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1.5">
                <HiOutlineLockClosed className="text-base" /> Joriy parol <span className="text-red-500">*</span>
              </label>
              <input type="password" value={pwForm.currentPassword}
                onChange={e => setPwForm({...pwForm, currentPassword: e.target.value})}
                className="input-field" placeholder="••••••••" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1.5">
                <HiOutlineLockClosed className="text-base" /> Yangi parol <span className="text-red-500">*</span>
              </label>
              <input type="password" value={pwForm.newPassword}
                onChange={e => setPwForm({...pwForm, newPassword: e.target.value})}
                className="input-field" placeholder="Kamida 8 belgi" />
              {pwForm.newPassword && pwForm.newPassword.length < 8 && (
                <p className="text-xs text-red-500 mt-1">Kamida 8 belgi kerak</p>
              )}
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1.5">
                <HiOutlineLockClosed className="text-base" /> Parolni tasdiqlang <span className="text-red-500">*</span>
              </label>
              <input type="password" value={pwForm.confirmPassword}
                onChange={e => setPwForm({...pwForm, confirmPassword: e.target.value})}
                className="input-field" placeholder="Qayta kiriting" />
              {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Parollar mos emas</p>
              )}
            </div>
            <div className="divider" />
            <div className="flex justify-end">
              <button onClick={handleChangePassword} disabled={changingPw} className="btn btn-primary">
                {changingPw ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <HiOutlineLockClosed />
                )}
                Parolni o'zgartirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
