import { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  HiOutlineBell, HiOutlineShieldCheck, HiOutlineServerStack, HiOutlineGlobeAlt,
  HiOutlineCpuChip, HiOutlineCog8Tooth, HiOutlineCheckCircle
} from 'react-icons/hi2';

const SECTIONS = [
  { key: 'notifications', label: 'Xabarnomalar', icon: HiOutlineBell, color: '#3b82f6' },
  { key: 'security', label: 'Xavfsizlik', icon: HiOutlineShieldCheck, color: '#10b981' },
  { key: 'backup', label: 'Zaxira nusxa', icon: HiOutlineServerStack, color: '#8b5cf6' },
  { key: 'system', label: 'Tizim', icon: HiOutlineGlobeAlt, color: '#f59e0b' },
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

  const inputStyle = { width: '100%', padding: '12px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#334155', outline: 'none', transition: 'all 0.3s', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '32px', width: '100%', maxWidth: '1600px', margin: '0 auto', boxSizing: 'border-box' }} className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #64748b, #475569)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(100,116,139,0.3)' }}>
          <HiOutlineCog8Tooth style={{ color: '#fff', fontSize: '28px' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0', tracking: 'tight' }}>Sozlamalar</h1>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Tizim konfiguratsiyasi
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '32px', alignItems: 'start' }}>
        {/* Chapki panel */}
        <div style={{ background: '#fff', borderRadius: '24px', padding: '16px', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {SECTIONS.map(s => {
            const isActive = activeSection === s.key;
            const Icon = s.icon;
            return (
              <button key={s.key} onClick={() => setActiveSection(s.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderRadius: '16px',
                  background: isActive ? `${s.color}15` : 'transparent',
                  color: isActive ? s.color : '#64748b',
                  fontSize: '15px', fontWeight: 700, border: 'none', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s', boxShadow: isActive ? `inset 4px 0 0 ${s.color}` : 'none'
                }} className="hover:bg-slate-50">
                <Icon style={{ fontSize: '20px', color: isActive ? s.color : '#94a3b8' }} />
                {s.label}
              </button>
            )
          })}
        </div>

        {/* Kontent */}
        <div style={{ background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)' }}>
          {/* Xabarnomalar */}
          {activeSection === 'notifications' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HiOutlineBell style={{ color: '#fff', fontSize: '24px' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Xabarnomalar sozlamalari</h3>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', margin: 0 }}>Telegram va email xabarnomalar</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <ToggleField label="Muddati o'tgan vazifalari haqida xabar berish" checked={notifSettings.overdueEnabled}
                  onChange={v => setNotifSettings({...notifSettings, overdueEnabled: v})} />
                <ToggleField label="Kam qoldiq ogohlantirish" checked={notifSettings.lowStockEnabled}
                  onChange={v => setNotifSettings({...notifSettings, lowStockEnabled: v})} />
                
                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Muddat ogohlantirish (kun oldin)</label>
                  <input type="number" value={notifSettings.daysBeforeDue}
                    onChange={e => setNotifSettings({...notifSettings, daysBeforeDue: Number(e.target.value)})}
                    style={{ ...inputStyle, maxWidth: '200px' }} />
                </div>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '24px', borderTop: '1px dashed #cbd5e1' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 800, color: '#334155', marginBottom: '16px' }}>
                  <HiOutlineCpuChip style={{ fontSize: '20px', color: '#3b82f6' }} /> Telegram sozlamalari
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Bot Token</label>
                    <input type="password" value={notifSettings.telegramBotToken}
                      onChange={e => setNotifSettings({...notifSettings, telegramBotToken: e.target.value})}
                      style={{ ...inputStyle, fontFamily: 'monospace' }} placeholder="123456:ABCdef..." />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Chat ID</label>
                    <input type="text" value={notifSettings.telegramChatId}
                      onChange={e => setNotifSettings({...notifSettings, telegramChatId: e.target.value})}
                      style={{ ...inputStyle, fontFamily: 'monospace' }} placeholder="-100123456789" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Xavfsizlik */}
          {activeSection === 'security' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HiOutlineShieldCheck style={{ color: '#fff', fontSize: '24px' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Xavfsizlik sozlamalari</h3>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', margin: 0 }}>2FA, sessiya, IP cheklovlar</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Sessiya vaqti (daqiqa)</label>
                  <input type="number" value={securitySettings.sessionTimeout}
                    onChange={e => setSecuritySettings({...securitySettings, sessionTimeout: Number(e.target.value)})}
                    style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Maksimal login urinish</label>
                  <input type="number" value={securitySettings.maxLoginAttempts}
                    onChange={e => setSecuritySettings({...securitySettings, maxLoginAttempts: Number(e.target.value)})}
                    style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px', paddingTop: '24px', borderTop: '1px dashed #cbd5e1' }}>
                <ToggleField label="Ikki bosqichli autentifikatsiya (2FA)" checked={securitySettings.twoFactorEnabled}
                  onChange={v => setSecuritySettings({...securitySettings, twoFactorEnabled: v})} />
                <ToggleField label="IP manzil cheklovi" checked={securitySettings.ipWhitelistEnabled}
                  onChange={v => setSecuritySettings({...securitySettings, ipWhitelistEnabled: v})} />

                {securitySettings.ipWhitelistEnabled && (
                  <div className="animate-fade-in" style={{ marginTop: '8px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Ruxsat berilgan IP manzillar</label>
                    <textarea value={securitySettings.ipWhitelist}
                      onChange={e => setSecuritySettings({...securitySettings, ipWhitelist: e.target.value})}
                      style={{ ...inputStyle, fontFamily: 'monospace', height: '120px', resize: 'none' }}
                      placeholder="192.168.1.0/24&#10;10.0.0.1&#10;..." />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Zaxira */}
          {activeSection === 'backup' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HiOutlineServerStack style={{ color: '#fff', fontSize: '24px' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Zaxira nusxa sozlamalari</h3>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', margin: 0 }}>Ma'lumotlar bazasi zaxira nusxasi</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <ToggleField label="Avtomatik zaxira nusxa" checked={backupSettings.autoBackupEnabled}
                  onChange={v => setBackupSettings({...backupSettings, autoBackupEnabled: v})} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Interval</label>
                    <select value={backupSettings.backupInterval}
                      onChange={e => setBackupSettings({...backupSettings, backupInterval: e.target.value})}
                      style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                      <option value="hourly">Har soatda</option>
                      <option value="daily">Har kuni</option>
                      <option value="weekly">Har hafta</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Saqlash muddati (kun)</label>
                    <input type="number" value={backupSettings.retentionDays}
                      onChange={e => setBackupSettings({...backupSettings, retentionDays: Number(e.target.value)})}
                      style={inputStyle} />
                  </div>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <button onClick={() => toast.success("Zaxira nusxa yaratildi")}
                    style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)', transition: 'all 0.3s' }}
                    className="hover:-translate-y-1 hover:shadow-lg">
                    <HiOutlineServerStack style={{ fontSize: '20px' }} /> Hozir zaxira yaratish
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tizim */}
          {activeSection === 'system' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HiOutlineGlobeAlt style={{ color: '#fff', fontSize: '24px' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Tizim ma'lumotlari</h3>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', margin: 0 }}>Versiya va muhit</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {[
                  { label: 'Tizim versiyasi', value: 'v1.0.0' },
                  { label: 'Backend', value: 'Spring Boot 3.4.5' },
                  { label: 'Frontend', value: 'React 19 + Vite' },
                  { label: 'Ma\'lumotlar bazasi', value: 'PostgreSQL 16' },
                  { label: 'Java', value: 'OpenJDK 17' },
                  { label: 'Server vaqti', value: new Date().toLocaleString('uz-UZ') },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '24px', borderRadius: '20px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                    <p style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saqlash tugmasi */}
          <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleSave}
              style={{ padding: '16px 32px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(37,99,235,0.4)', transition: 'all 0.3s' }}
              className="hover:-translate-y-1 hover:shadow-lg">
              <HiOutlineCheckCircle style={{ fontSize: '22px' }} /> Sozlamalarni saqlash
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
    <div 
      onClick={() => onChange(!checked)}
      style={{ 
        display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between', 
        padding: '16px 20px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #f1f5f9', 
        cursor: 'pointer', transition: 'all 0.2s' 
      }} 
      className="hover:bg-slate-50 hover:border-slate-200">
      <span style={{ fontSize: '15px', fontWeight: 700, color: '#334155' }}>{label}</span>
      <div style={{ 
        position: 'relative', width: '52px', height: '30px', borderRadius: '999px', 
        background: checked ? '#3b82f6' : '#cbd5e1', transition: 'background 0.3s' 
      }}>
        <div style={{ 
          position: 'absolute', top: '3px', left: '3px', width: '24px', height: '24px', 
          background: '#fff', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
          transform: checked ? 'translateX(22px)' : 'translateX(0)' 
        }} />
      </div>
    </div>
  );
}
