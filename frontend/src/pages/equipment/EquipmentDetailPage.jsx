import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { equipmentService, fileService } from '../../services/dataService';
import { useAuthContext } from '../../hooks/useAuthContext';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft, HiOutlinePencilSquare, HiOutlineQrCode,
  HiOutlineDocumentText, HiOutlinePhoto, HiOutlineClock,
  HiOutlineTrash, HiOutlinePlusCircle, HiOutlineArrowDownTray,
  HiOutlineComputerDesktop, HiOutlineInformationCircle
} from 'react-icons/hi2';

const TABS = [
  { key: 'info', label: "Ma'lumotlar", icon: <HiOutlineInformationCircle style={{ fontSize: '18px' }} /> },
  { key: 'docs', label: 'Hujjatlar', icon: <HiOutlineDocumentText style={{ fontSize: '18px' }} /> },
  { key: 'photos', label: 'Fotosuratlar', icon: <HiOutlinePhoto style={{ fontSize: '18px' }} /> },
  { key: 'history', label: 'Status tarixchasi', icon: <HiOutlineClock style={{ fontSize: '18px' }} /> },
];

export default function EquipmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const isOperator = user?.role === 'ADMIN' || user?.role === 'OPERATOR';

  const [eq, setEq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  const [documents, setDocuments] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [uploading, setUploading] = useState(false);

  const loadEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const res = await equipmentService.getById(id);
      setEq(res.data);
    } catch {
      toast.error("Uskuna topilmadi");
      navigate('/equipment');
    }
    setLoading(false);
  }, [id, navigate]);

  useEffect(() => { loadEquipment(); }, [loadEquipment]);

  useEffect(() => {
    if (activeTab === 'docs') loadDocuments();
    if (activeTab === 'photos') loadPhotos();
    if (activeTab === 'history') loadHistory();
  }, [activeTab, id]);

  const loadDocuments = async () => {
    try { const r = await fileService.getDocuments(id); setDocuments(r.data || []); } catch { /* */ }
  };
  const loadPhotos = async () => {
    try { const r = await fileService.getPhotos(id); setPhotos(r.data || []); } catch { /* */ }
  };
  const loadHistory = async () => {
    try { const r = await equipmentService.getStatusHistory(id); setStatusHistory(r.data || []); } catch { /* */ }
  };

  const handleUploadDoc = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await fileService.uploadDocument(id, fd);
      toast.success("Hujjat yuklandi");
      loadDocuments();
    } catch { toast.error("Yuklashda xato"); }
    setUploading(false);
    e.target.value = '';
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error("Faqat rasm fayllari"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await fileService.uploadPhoto(id, fd);
      toast.success("Rasm yuklandi");
      loadPhotos();
    } catch { toast.error("Yuklashda xato"); }
    setUploading(false);
    e.target.value = '';
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm("Hujjatni o'chirmoqchimisiz?")) return;
    try { await fileService.deleteDocument(id, docId); toast.success("O'chirildi"); loadDocuments(); }
    catch { toast.error("Xato"); }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm("Rasmni o'chirmoqchimisiz?")) return;
    try { await fileService.deletePhoto(id, photoId); toast.success("O'chirildi"); loadPhotos(); }
    catch { toast.error("Xato"); }
  };

  const handleGenerateQr = async () => {
    try { await equipmentService.generateQrCode(id); toast.success("QR-kod yaratildi"); }
    catch { toast.error("Xato"); }
  };

  const handleDownloadQr = async () => {
    try {
      const res = await equipmentService.downloadQrCode(id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `qr_${eq?.inventoryNumber || id}.png`;
      a.click(); URL.revokeObjectURL(url);
    } catch { toast.error("QR-kod yuklab olishda xato"); }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', margin: '0 auto 16px' }} />
        <span style={{ color: '#94a3b8', fontSize: '15px', fontWeight: 600 }}>Yuklanmoqda...</span>
      </div>
    );
  }

  if (!eq) return null;

  return (
    <div style={{ padding: '32px', width: '100%', maxWidth: '1400px', margin: '0 auto', boxSizing: 'border-box' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
          <button onClick={() => navigate('/equipment')}
            style={{ padding: '12px', borderRadius: '16px', background: '#fff', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            className="hover:-translate-y-1 hover:shadow-md hover:bg-slate-50">
            <HiOutlineArrowLeft style={{ fontSize: '20px' }} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0, tracking: 'tight' }}>{eq.name}</h1>
              <span style={{ display: 'inline-flex', padding: '4px 10px', background: '#eff6ff', color: '#2563eb', borderRadius: '8px', fontSize: '13px', fontWeight: 800, fontFamily: 'monospace' }}>
                {eq.inventoryNumber}
              </span>
            </div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0 }}>
              {eq.categoryName} • {eq.locationName}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={handleGenerateQr} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#fff', border: '1px solid #e2e8f0', color: '#475569', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} className="hover:-translate-y-0.5 hover:shadow-sm hover:bg-slate-50">
            <HiOutlineQrCode style={{ fontSize: '18px' }} /> QR yaratish
          </button>
          <button onClick={handleDownloadQr} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#fff', border: '1px solid #e2e8f0', color: '#475569', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} className="hover:-translate-y-0.5 hover:shadow-sm hover:bg-slate-50">
            <HiOutlineArrowDownTray style={{ fontSize: '18px' }} /> QR yuklash
          </button>
          {isOperator && (
            <button onClick={() => navigate(`/equipment/${id}/edit`)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.3)', transition: 'all 0.2s' }} className="hover:-translate-y-1 hover:shadow-lg">
              <HiOutlinePencilSquare style={{ fontSize: '18px' }} /> Tahrirlash
            </button>
          )}
        </div>
      </div>

      {/* Status Info Card */}
      <div style={{ background: '#fff', borderRadius: '20px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: eq.statusColor || '#94a3b8' }} />
          <span style={{ fontSize: '15px', fontWeight: 800, color: eq.statusColor || '#64748b' }}>{eq.statusName}</span>
        </div>
        <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />
        <div style={{ fontSize: '14px', color: '#64748b' }}>
          <span style={{ fontWeight: 700, color: '#334155', marginRight: '6px' }}>Mas'ul:</span> 
          {eq.responsiblePersonName || '—'}
        </div>
        {eq.manufacturerName && (
          <>
            <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              <span style={{ fontWeight: 700, color: '#334155', marginRight: '6px' }}>Ishlab chiqaruvchi:</span> 
              {eq.manufacturerName} {eq.modelName && `— ${eq.modelName}`}
            </div>
          </>
        )}
        {eq.serialNumber && (
          <>
            <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              <span style={{ fontWeight: 700, color: '#334155', marginRight: '6px' }}>S/N:</span> 
              <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0f172a' }}>{eq.serialNumber}</span>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '14px',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', border: 'none', whiteSpace: 'nowrap',
              background: activeTab === t.key ? '#3b82f6' : '#fff',
              color: activeTab === t.key ? '#fff' : '#475569',
              boxShadow: activeTab === t.key ? '0 10px 15px -3px rgba(59,130,246,0.3)' : '0 4px 6px -1px rgba(0,0,0,0.05)',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        
        {/* Info Tab */}
        {activeTab === 'info' && (
          <div style={{ padding: '32px' }} className="animate-fade-in">
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HiOutlineInformationCircle style={{ color: '#3b82f6', fontSize: '24px' }} /> To'liq ma'lumotlar
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {[
                ['Inventar raqami', eq.inventoryNumber],
                ['Nomi', eq.name],
                ['Toifasi', eq.categoryName],
                ['Status', eq.statusName],
                ['Joylashuv', eq.locationName],
                ["Mas'ul shaxs", eq.responsiblePersonName],
                ['Ishlab chiqaruvchi', eq.manufacturerName || '—'],
                ['Model', eq.modelName || '—'],
                ['Seriya raqami', eq.serialNumber || '—'],
                ['Foydalanishga topshirilgan', eq.commissionedDate || '—'],
                ['Kafolat muddati', eq.warrantyDate || '—'],
                ['Sotib olingan narxi', eq.purchasePrice ? `${Number(eq.purchasePrice).toLocaleString()} so'm` : '—'],
              ].map(([label, value], i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>{label}</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{value}</span>
                </div>
              ))}
            </div>

            {eq.notes && (
              <div style={{ marginTop: '32px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#475569', marginBottom: '12px' }}>Izoh</h4>
                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', fontSize: '14px', color: '#334155', lineHeight: 1.6, border: '1px solid #e2e8f0' }}>
                  {eq.notes}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Docs Tab */}
        {activeTab === 'docs' && (
          <div style={{ padding: '32px' }} className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiOutlineDocumentText style={{ color: '#3b82f6', fontSize: '24px' }} /> Hujjatlar ({documents.length})
              </h3>
              {isOperator && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#eff6ff', color: '#2563eb', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-blue-100">
                  <HiOutlinePlusCircle style={{ fontSize: '18px' }} /> Yuklash
                  <input type="file" style={{ display: 'none' }} onChange={handleUploadDoc} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png" />
                </label>
              )}
            </div>

            {uploading && (
              <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '12px', color: '#2563eb', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid rgba(37,99,235,0.2)', borderTopColor: '#2563eb', borderRadius: '50%' }} />
                Yuklanmoqda...
              </div>
            )}

            {documents.length === 0 ? (
              <div style={{ padding: '64px', textAlign: 'center' }}>
                <HiOutlineDocumentText style={{ fontSize: '64px', color: '#cbd5e1', margin: '0 auto 16px', display: 'block' }} />
                <p style={{ color: '#94a3b8', fontSize: '16px', fontWeight: 600, margin: 0 }}>Hujjatlar topilmadi</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {documents.map((doc, i) => (
                  <div key={doc.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', transition: 'all 0.2s' }} className="hover:shadow-md hover:-translate-y-0.5">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                        <HiOutlineDocumentText style={{ fontSize: '24px' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>{doc.fileName || doc.originalName}</p>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', margin: 0 }}>{doc.documentTypeName || ''} • {doc.createdAt?.slice(0, 10)}</p>
                      </div>
                    </div>
                    {isOperator && (
                      <button onClick={() => handleDeleteDoc(doc.id)} style={{ padding: '8px', borderRadius: '10px', background: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} className="hover:bg-red-200">
                        <HiOutlineTrash style={{ fontSize: '18px' }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div style={{ padding: '32px' }} className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiOutlinePhoto style={{ color: '#3b82f6', fontSize: '24px' }} /> Fotosuratlar ({photos.length})
              </h3>
              {isOperator && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#eff6ff', color: '#2563eb', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-blue-100">
                  <HiOutlinePlusCircle style={{ fontSize: '18px' }} /> Rasm yuklash
                  <input type="file" style={{ display: 'none' }} onChange={handleUploadPhoto} accept="image/*" />
                </label>
              )}
            </div>

            {uploading && (
              <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '12px', color: '#2563eb', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid rgba(37,99,235,0.2)', borderTopColor: '#2563eb', borderRadius: '50%' }} />
                Rasm yuklanmoqda...
              </div>
            )}

            {photos.length === 0 ? (
              <div style={{ padding: '64px', textAlign: 'center' }}>
                <HiOutlinePhoto style={{ fontSize: '64px', color: '#cbd5e1', margin: '0 auto 16px', display: 'block' }} />
                <p style={{ color: '#94a3b8', fontSize: '16px', fontWeight: 600, margin: 0 }}>Rasmlar topilmadi</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {photos.map((photo, i) => (
                  <div key={photo.id || i} style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', aspectRatio: '1/1', background: '#f1f5f9' }} className="group">
                    <img src={photo.url || `/api/v1/equipment/${id}/photos/${photo.id}/file`} alt={photo.fileName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    {isOperator && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="group-hover:opacity-100">
                        <button onClick={() => handleDeletePhoto(photo.id)} style={{ padding: '10px', borderRadius: '12px', background: '#fff', color: '#ef4444', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:scale-110">
                          <HiOutlineTrash style={{ fontSize: '20px' }} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div style={{ padding: '32px' }} className="animate-fade-in">
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HiOutlineClock style={{ color: '#3b82f6', fontSize: '24px' }} /> Status tarixchasi
            </h3>

            {statusHistory.length === 0 ? (
              <div style={{ padding: '64px', textAlign: 'center' }}>
                <HiOutlineClock style={{ fontSize: '64px', color: '#cbd5e1', margin: '0 auto 16px', display: 'block' }} />
                <p style={{ color: '#94a3b8', fontSize: '16px', fontWeight: 600, margin: 0 }}>Tarix topilmadi</p>
              </div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: '24px' }}>
                <div style={{ position: 'absolute', left: '23px', top: '24px', bottom: '24px', width: '2px', background: '#e2e8f0' }} />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {statusHistory.map((entry, i) => (
                    <div key={i} style={{ display: 'flex', gap: '24px', position: 'relative' }}>
                      <div style={{ zIndex: 10, width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '-24px', background: entry.statusColor ? `${entry.statusColor}15` : '#f8fafc', border: `2px solid ${entry.statusColor || '#cbd5e1'}` }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: entry.statusColor || '#94a3b8' }} />
                      </div>
                      <div style={{ flex: 1, padding: '20px', borderRadius: '20px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
                          <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{entry.statusName || entry.newStatus}</span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>{entry.changedAt?.slice(0, 16)?.replace('T', ' ')}</span>
                        </div>
                        {entry.changedBy && (
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: entry.notes ? '12px' : 0 }}>
                            Mas'ul: <span style={{ color: '#0f172a' }}>{entry.changedBy}</span>
                          </div>
                        )}
                        {entry.notes && (
                          <div style={{ fontSize: '14px', color: '#334155', background: '#fff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                            {entry.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
