import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineBell, HiOutlineShieldCheck, HiOutlineServerStack, HiOutlineGlobeAlt } from 'react-icons/hi2';

const SECTIONS = [
  { key: 'notifications', label: 'Xabarnomalar', icon: HiOutlineBell },
  { key: 'security', label: 'Xavfsizlik', icon: HiOutlineShieldCheck },
  { key: 'backup', label: 'Zaxira nusxa', icon: HiOutlineServerStack },
  { key: 'system', label: 'Tizim', icon: HiOutlineGlobeAlt },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('notifications');

  // Sozlamalar holatlari
  const [notifSettings, setNotifSettings] = useState({
    overdueEnabled: true, lowStockEnabled: true, daysBeforeDue: 3,
    telegramBotToken: '', telegramChatId: '', emailEnabled: false,
  });
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 30, maxLoginAttempts: 5, twoFactorEnabled: false,
    ipWhitelistEnabled: false, ipWhitelist: '',
  });
  const [backupSettings, setBackupSettings] = useState({
    autoBackupEnabled: true, backupInterval: 'daily', retentionDays: 30,
  });

  const handleSave = () => {
    toast.success("Sozlamalar saqlandi");
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">⚙️ Sozlamalar</h1>
        <p className="text-sm text-slate-500 mt-1">Tizim konfiguratsiyasi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chapki panel */}
        <div className="card p-4 lg:col-span-1 h-fit">
          <div className="space-y-1">
            {SECTIONS.map(s => (
              <button key={s.key} onClick={() => setActiveSection(s.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeSection === s.key
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}>
                <s.icon className="text-lg" />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Kontent */}
        <div className="card p-6 lg:col-span-3">
          {/* Xabarnomalar (TZ 5.3) */}
          {activeSection === 'notifications' && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <HiOutlineBell className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Xabarnomalar sozlamalari</h3>
                  <p className="text-xs text-slate-500">Telegram va email xabarnomalar</p>
                </div>
              </div>

              <div className="divider" />

              <div className="space-y-4">
                <ToggleField label="Muddati o'tgan vazifalari haqida xabar berish" checked={notifSettings.overdueEnabled}
                  onChange={v => setNotifSettings({...notifSettings, overdueEnabled: v})} />
                <ToggleField label="Kam qoldiq ogohlantirish" checked={notifSettings.lowStockEnabled}
                  onChange={v => setNotifSettings({...notifSettings, lowStockEnabled: v})} />
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Muddat ogohlantirish (kun oldin)</label>
                  <input type="number" value={notifSettings.daysBeforeDue}
                    onChange={e => setNotifSettings({...notifSettings, daysBeforeDue: Number(e.target.value)})}
                    className="input-field" style={{ width: '120px' }} />
                </div>

                <div className="divider" />
                <h4 className="text-sm font-semibold text-slate-700">🤖 Telegram sozlamalari</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Bot Token</label>
                    <input type="password" value={notifSettings.telegramBotToken}
                      onChange={e => setNotifSettings({...notifSettings, telegramBotToken: e.target.value})}
                      className="input-field font-mono text-xs" placeholder="123456:ABCdef..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Chat ID</label>
                    <input value={notifSettings.telegramChatId}
                      onChange={e => setNotifSettings({...notifSettings, telegramChatId: e.target.value})}
                      className="input-field font-mono text-xs" placeholder="-100123456789" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Xavfsizlik (TZ 5.6-5.7) */}
          {activeSection === 'security' && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <HiOutlineShieldCheck className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Xavfsizlik sozlamalari</h3>
                  <p className="text-xs text-slate-500">2FA, sessiya, IP cheklovlar</p>
                </div>
              </div>

              <div className="divider" />

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Sessiya vaqti (daqiqa)</label>
                    <input type="number" value={securitySettings.sessionTimeout}
                      onChange={e => setSecuritySettings({...securitySettings, sessionTimeout: Number(e.target.value)})}
                      className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Maksimal login urinish</label>
                    <input type="number" value={securitySettings.maxLoginAttempts}
                      onChange={e => setSecuritySettings({...securitySettings, maxLoginAttempts: Number(e.target.value)})}
                      className="input-field" />
                  </div>
                </div>

                <div className="divider" />
                <ToggleField label="Ikki bosqichli autentifikatsiya (2FA)" checked={securitySettings.twoFactorEnabled}
                  onChange={v => setSecuritySettings({...securitySettings, twoFactorEnabled: v})} />
                <ToggleField label="IP manzil cheklovi" checked={securitySettings.ipWhitelistEnabled}
                  onChange={v => setSecuritySettings({...securitySettings, ipWhitelistEnabled: v})} />

                {securitySettings.ipWhitelistEnabled && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Ruxsat berilgan IP manzillar</label>
                    <textarea value={securitySettings.ipWhitelist}
                      onChange={e => setSecuritySettings({...securitySettings, ipWhitelist: e.target.value})}
                      className="input-field font-mono text-xs" rows={4}
                      placeholder="192.168.1.0/24&#10;10.0.0.1&#10;..." />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Zaxira (TZ 5.5) */}
          {activeSection === 'backup' && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <HiOutlineServerStack className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Zaxira nusxa sozlamalari</h3>
                  <p className="text-xs text-slate-500">Ma'lumotlar bazasi zaxira nusxasi</p>
                </div>
              </div>

              <div className="divider" />

              <div className="space-y-4">
                <ToggleField label="Avtomatik zaxira nusxa" checked={backupSettings.autoBackupEnabled}
                  onChange={v => setBackupSettings({...backupSettings, autoBackupEnabled: v})} />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Interval</label>
                    <select value={backupSettings.backupInterval}
                      onChange={e => setBackupSettings({...backupSettings, backupInterval: e.target.value})}
                      className="input-field">
                      <option value="hourly">Har soatda</option>
                      <option value="daily">Har kuni</option>
                      <option value="weekly">Har hafta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Saqlash muddati (kun)</label>
                    <input type="number" value={backupSettings.retentionDays}
                      onChange={e => setBackupSettings({...backupSettings, retentionDays: Number(e.target.value)})}
                      className="input-field" />
                  </div>
                </div>

                <button className="btn btn-success" onClick={() => toast.success("Zaxira nusxa yaratildi")}>
                  💾 Hozir zaxira yaratish
                </button>
              </div>
            </div>
          )}

          {/* Tizim */}
          {activeSection === 'system' && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <HiOutlineGlobeAlt className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Tizim ma'lumotlari</h3>
                  <p className="text-xs text-slate-500">Versiya va muhit</p>
                </div>
              </div>

              <div className="divider" />

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Tizim versiyasi', value: 'v1.0.0' },
                  { label: 'Backend', value: 'Spring Boot 3.4.5' },
                  { label: 'Frontend', value: 'React 19 + Vite' },
                  { label: 'Ma\'lumotlar bazasi', value: 'PostgreSQL 16' },
                  { label: 'Java', value: 'OpenJDK 17' },
                  { label: 'Server vaqti', value: new Date().toLocaleString('uz-UZ') },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saqlash tugmasi */}
          <div className="divider !mt-8" />
          <div className="flex justify-end">
            <button onClick={handleSave} className="btn btn-primary">
              💾 Sozlamalarni saqlash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toggle komponent
function ToggleField({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button type="button" onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </label>
  );
}
