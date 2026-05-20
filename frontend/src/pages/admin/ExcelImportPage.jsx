import { useState, useRef } from 'react';
import { importService } from '../../services/dataService';
import toast from 'react-hot-toast';
import { 
  HiOutlineDocumentArrowUp, HiOutlineDocumentArrowDown, 
  HiOutlineCheck, HiOutlineXMark, HiOutlineComputerDesktop,
  HiOutlineCube, HiOutlineDocumentText, HiOutlineChartBar, HiOutlineSparkles
} from 'react-icons/hi2';

const IMPORT_TYPES = [
  {
    key: 'equipment', label: 'Uskunalar',
    desc: "Inventar raqami, nomi, toifasi, seriya raqami, joylashuv",
    icon: HiOutlineComputerDesktop,
    colors: ['#3b82f6', '#4f46e5'], // blue to indigo
    handler: (formData) => importService.importEquipment(formData),
  },
  {
    key: 'spare-parts', label: 'Ehtiyot qismlar',
    desc: "Nomi, kodi, o'lchov birligi, narxi, minimal qoldiq",
    icon: HiOutlineCube,
    colors: ['#10b981', '#059669'], // emerald to teal
    handler: (formData) => importService.importSpareParts(formData),
  },
];

export default function ExcelImportPage() {
  const [selectedType, setSelectedType] = useState('equipment');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  const activeType = IMPORT_TYPES.find(t => t.key === selectedType);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      if (!f.name.endsWith('.xlsx') && !f.name.endsWith('.xls')) {
        toast.error("Faqat Excel fayllari (.xlsx, .xls) qabul qilinadi");
        return;
      }
      setFile(f);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) { toast.error("Fayl tanlang"); return; }
    setUploading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await activeType.handler(formData);
      setResult(res.data);
      if (res.data.success > 0) toast.success(`${res.data.success} ta muvaffaqiyatli import qilindi`);
      if (res.data.errors?.length > 0) toast.error(`${res.data.errors.length} ta xato topildi`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Import xatosi");
    }
    setUploading(false);
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await importService.downloadTemplate(selectedType);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedType}_shablon.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Shablon yuklab olindi");
    } catch {
      toast.error("Shablonni yuklashda xato");
    }
  };

  return (
    <div style={{ padding: '32px', width: '100%', maxWidth: '1600px', margin: '0 auto', boxSizing: 'border-box' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(16,185,129,0.3)' }}>
          <HiOutlineDocumentArrowDown style={{ color: '#fff', fontSize: '28px' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0', tracking: 'tight' }}>Excel Import</h1>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Ma'lumotlarni Excel fayldan ommaviy yuklash
          </p>
        </div>
      </div>

      {/* Import turi tanlash */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {IMPORT_TYPES.map(type => {
          const isSelected = selectedType === type.key;
          const Icon = type.icon;
          return (
            <button key={type.key} onClick={() => { setSelectedType(type.key); setFile(null); setResult(null); }}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '24px', textAlign: 'left',
                background: isSelected ? '#f8fafc' : '#fff',
                border: isSelected ? `2px solid ${type.colors[0]}` : '1px solid #e2e8f0',
                borderRadius: '24px', cursor: 'pointer', transition: 'all 0.3s',
                boxShadow: isSelected ? `0 10px 25px -5px ${type.colors[0]}40` : '0 4px 6px -1px rgba(0,0,0,0.05)'
              }} className="hover:-translate-y-1 hover:shadow-lg">
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px', flexShrink: 0,
                background: `linear-gradient(135deg, ${type.colors[0]}, ${type.colors[1]})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 10px 15px -3px ${type.colors[0]}50`
              }}>
                <Icon style={{ color: '#fff', fontSize: '28px' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>{type.label}</h3>
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#64748b', margin: 0, lineHeight: 1.5 }}>{type.desc}</p>
              </div>
            </button>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
        {/* Yuklash paneli */}
        <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>
            Faylni yuklash — <span style={{ color: activeType.colors[0] }}>{activeType?.label}</span>
          </h3>

          {/* Shablon yuklab olish */}
          <button onClick={handleDownloadTemplate}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', marginBottom: '24px',
              background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
            }} className="hover:bg-slate-100 hover:border-slate-400 group">
            <HiOutlineDocumentText className="group-hover:text-blue-500" style={{ fontSize: '32px', color: '#94a3b8', transition: 'color 0.2s' }} />
            <div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#334155', margin: '0 0 4px 0' }}>Shablonni yuklab oling</p>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', margin: 0 }}>To'ldiring va qayta yuklang</p>
            </div>
          </button>

          {/* Fayl tanlash */}
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '48px 32px', borderRadius: '24px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
              background: file ? '#ecfdf5' : '#f8fafc',
              border: file ? '2px dashed #34d399' : '2px dashed #cbd5e1'
            }} className="hover:bg-slate-50 hover:border-slate-400">
            <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} style={{ display: 'none' }} />

            {file ? (
              <>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <HiOutlineCheck style={{ color: '#059669', fontSize: '32px' }} />
                </div>
                <p style={{ fontSize: '16px', fontWeight: 800, color: '#065f46', margin: '0 0 4px 0' }}>{file.name}</p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#10b981', margin: 0 }}>{(file.size / 1024).toFixed(1)} KB</p>
              </>
            ) : (
              <>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <HiOutlineDocumentArrowUp style={{ color: '#64748b', fontSize: '32px' }} />
                </div>
                <p style={{ fontSize: '16px', fontWeight: 800, color: '#334155', margin: '0 0 4px 0' }}>Faylni bu yerga tashlang</p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', margin: 0 }}>yoki bosing tanlash uchun (.xlsx)</p>
              </>
            )}
          </div>

          {/* Yuklash tugmasi */}
          <button onClick={handleUpload} disabled={!file || uploading}
            style={{
              width: '100%', marginTop: '24px', padding: '16px', borderRadius: '16px', border: 'none',
              background: `linear-gradient(135deg, ${activeType.colors[0]}, ${activeType.colors[1]})`,
              color: '#fff', fontSize: '16px', fontWeight: 800, cursor: (!file || uploading) ? 'not-allowed' : 'pointer',
              opacity: (!file || uploading) ? 0.6 : 1, transition: 'all 0.3s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              boxShadow: (!file || uploading) ? 'none' : `0 10px 20px -5px ${activeType.colors[0]}60`
            }} className={(!file || uploading) ? "" : "hover:-translate-y-1"}>
            {uploading ? (
              <><div className="animate-spin" style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> Import qilinmoqda...</>
            ) : (
              <><HiOutlineDocumentArrowUp style={{ fontSize: '24px' }} /> Import qilish</>
            )}
          </button>
        </div>

        {/* Natijalar */}
        <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Natijalar</h3>

          {!result ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', color: '#94a3b8' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <HiOutlineChartBar style={{ fontSize: '40px', color: '#cbd5e1' }} />
              </div>
              <p style={{ fontSize: '15px', fontWeight: 600 }}>Import natijasi bu yerda ko'rinadi</p>
            </div>
          ) : (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Umumiy statistika */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ padding: '20px', borderRadius: '20px', background: '#f8fafc', textAlign: 'center' }}>
                  <p style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0' }}>{result.total}</p>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', margin: 0 }}>Jami qator</p>
                </div>
                <div style={{ padding: '20px', borderRadius: '20px', background: '#ecfdf5', textAlign: 'center' }}>
                  <p style={{ fontSize: '32px', fontWeight: 900, color: '#047857', margin: '0 0 4px 0' }}>{result.success}</p>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#059669', margin: 0 }}>Muvaffaqiyatli</p>
                </div>
                <div style={{ padding: '20px', borderRadius: '20px', background: result.errors?.length > 0 ? '#fef2f2' : '#f8fafc', textAlign: 'center' }}>
                  <p style={{ fontSize: '32px', fontWeight: 900, color: result.errors?.length > 0 ? '#b91c1c' : '#94a3b8', margin: '0 0 4px 0' }}>
                    {result.errors?.length || 0}
                  </p>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', margin: 0 }}>Xatolar</p>
                </div>
              </div>

              {/* Progress bar */}
              {result.total > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
                    <span>Muvaffaqiyat</span>
                    <span style={{ color: '#059669' }}>{Math.round((result.success / result.total) * 100)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '12px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'linear-gradient(90deg, #34d399, #059669)', borderRadius: '999px', transition: 'width 1s ease', width: `${(result.success / result.total) * 100}%` }} />
                  </div>
                </div>
              )}

              {/* Xatolar ro'yxati */}
              {result.errors?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#dc2626', marginBottom: '12px' }}>Xatolar</h4>
                  <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                    {result.errors.map((err, i) => (
                      <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms`, display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 16px', borderRadius: '16px', background: '#fef2f2', border: '1px solid #fee2e2' }}>
                        <HiOutlineXMark style={{ color: '#ef4444', fontSize: '20px', flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: '#991b1b' }}>Qator {err.row}: </span>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#b91c1c' }}>{err.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.success > 0 && result.errors?.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#d1fae5', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HiOutlineSparkles style={{ fontSize: '40px', color: '#059669' }} />
                  </div>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: '#065f46', margin: 0 }}>Barcha ma'lumotlar muvaffaqiyatli import qilindi!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
