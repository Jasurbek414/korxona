import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { equipmentService, fileService } from '../../services/dataService';
import { useAuth } from '../../hooks/useAuthContext';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft, HiOutlinePencilSquare, HiOutlineQrCode,
  HiOutlineDocumentText, HiOutlinePhoto, HiOutlineClock,
  HiOutlineTrash, HiOutlinePlusCircle, HiOutlineArrowDownTray,
} from 'react-icons/hi2';

const TABS = [
  { key: 'info', label: "Ma'lumotlar", icon: '📋' },
  { key: 'docs', label: 'Hujjatlar', icon: '📄' },
  { key: 'photos', label: 'Fotosuratlar', icon: '📸' },
  { key: 'history', label: 'Status tarixchasi', icon: '🕐' },
];

export default function EquipmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isOperator } = useAuth();

  const [eq, setEq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  // Qo'shimcha ma'lumotlar
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
    if (!confirm("Hujjatni o'chirmoqchimisiz?")) return;
    try { await fileService.deleteDocument(id, docId); toast.success("O'chirildi"); loadDocuments(); }
    catch { toast.error("Xato"); }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!confirm("Rasmni o'chirmoqchimisiz?")) return;
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
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!eq) return null;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <button onClick={() => navigate('/equipment')}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 transition-all mt-1">
            <HiOutlineArrowLeft className="text-lg" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-800">{eq.name}</h1>
              <span className="badge badge-blue font-mono text-xs">{eq.inventoryNumber}</span>
            </div>
            <p className="text-sm text-slate-500">{eq.categoryName} • {eq.locationName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleGenerateQr} className="btn btn-outline btn-sm">
            <HiOutlineQrCode /> QR yaratish
          </button>
          <button onClick={handleDownloadQr} className="btn btn-outline btn-sm">
            <HiOutlineArrowDownTray /> QR yuklab olish
          </button>
          {isOperator && (
            <button onClick={() => navigate(`/equipment/${id}/edit`)} className="btn btn-primary btn-sm">
              <HiOutlinePencilSquare /> Tahrirlash
            </button>
          )}
        </div>
      </div>

      {/* Status badge */}
      <div className="card p-4 mb-6 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: eq.statusColor || '#94a3b8' }} />
          <span className="text-sm font-semibold" style={{ color: eq.statusColor || '#64748b' }}>{eq.statusName}</span>
        </div>
        <div className="h-6 w-px bg-slate-200" />
        <div className="text-sm text-slate-500">
          <span className="font-medium text-slate-700">Mas'ul:</span> {eq.responsiblePersonName || '—'}
        </div>
        {eq.manufacturerName && (
          <>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-sm text-slate-500">
              <span className="font-medium text-slate-700">Ishlab chiqaruvchi:</span> {eq.manufacturerName}
              {eq.modelName && ` — ${eq.modelName}`}
            </div>
          </>
        )}
        {eq.serialNumber && (
          <>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-sm text-slate-500">
              <span className="font-medium text-slate-700">S/N:</span>{' '}
              <span className="font-mono text-xs">{eq.serialNumber}</span>
            </div>
          </>
        )}
      </div>

      {/* Tablar */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === t.key
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Tab kontenti */}
      <div className="card overflow-hidden">
        {/* Ma'lumotlar */}
        {activeTab === 'info' && (
          <div className="p-6 animate-fade-in">
            <h3 className="text-base font-bold text-slate-800 mb-4">📋 To'liq ma'lumotlar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
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
                <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500 w-44 flex-shrink-0">{label}</span>
                  <span className="text-sm font-medium text-slate-800">{value}</span>
                </div>
              ))}
            </div>
            {eq.notes && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-slate-600 mb-2">Izoh</h4>
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl whitespace-pre-wrap">{eq.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Hujjatlar (TZ 2.5) */}
        {activeTab === 'docs' && (
          <div className="p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">📄 Hujjatlar ({documents.length})</h3>
              {isOperator && (
                <label className="btn btn-primary btn-sm cursor-pointer">
                  <HiOutlinePlusCircle /> Yuklash
                  <input type="file" className="hidden" onChange={handleUploadDoc}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png" />
                </label>
              )}
            </div>
            {uploading && (
              <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-blue-50 text-blue-600 text-sm">
                <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                Yuklanmoqda...
              </div>
            )}
            {documents.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <HiOutlineDocumentText className="text-4xl mx-auto mb-2 opacity-40" />
                <p>Hujjatlar topilmadi</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc, i) => (
                  <div key={doc.id || i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition animate-fade-in"
                    style={{ animationDelay: `${i * 40}ms` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                        <HiOutlineDocumentText className="text-lg" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{doc.fileName || doc.originalName}</p>
                        <p className="text-xs text-slate-400">{doc.documentTypeName || ''} • {doc.createdAt?.slice(0, 10)}</p>
                      </div>
                    </div>
                    {isOperator && (
                      <button onClick={() => handleDeleteDoc(doc.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
                        <HiOutlineTrash />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Fotosuratlar (TZ 2.6) */}
        {activeTab === 'photos' && (
          <div className="p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">📸 Fotosuratlar ({photos.length})</h3>
              {isOperator && (
                <label className="btn btn-primary btn-sm cursor-pointer">
                  <HiOutlinePlusCircle /> Rasm yuklash
                  <input type="file" className="hidden" onChange={handleUploadPhoto} accept="image/*" />
                </label>
              )}
            </div>
            {photos.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <HiOutlinePhoto className="text-4xl mx-auto mb-2 opacity-40" />
                <p>Rasmlar topilmadi</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photos.map((photo, i) => (
                  <div key={photo.id || i} className="group relative rounded-2xl overflow-hidden bg-slate-100 aspect-square animate-fade-in"
                    style={{ animationDelay: `${i * 60}ms` }}>
                    <img src={photo.url || `/api/v1/equipment/${id}/photos/${photo.id}/file`}
                      alt={photo.fileName} className="w-full h-full object-cover" loading="lazy" />
                    {isOperator && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => handleDeletePhoto(photo.id)}
                          className="p-2 rounded-xl bg-white/90 text-red-600 hover:bg-white transition">
                          <HiOutlineTrash className="text-lg" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Status tarixchasi (TZ 2.12) */}
        {activeTab === 'history' && (
          <div className="p-6 animate-fade-in">
            <h3 className="text-base font-bold text-slate-800 mb-4">🕐 Status tarixchasi</h3>
            {statusHistory.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <HiOutlineClock className="text-4xl mx-auto mb-2 opacity-40" />
                <p>Tarix topilmadi</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline chiziq */}
                <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-slate-200" />

                <div className="space-y-4">
                  {statusHistory.map((entry, i) => (
                    <div key={i} className="flex items-start gap-4 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: entry.statusColor ? `${entry.statusColor}15` : '#f1f5f9' }}>
                        <div className="w-3 h-3 rounded-full" style={{ background: entry.statusColor || '#94a3b8' }} />
                      </div>
                      <div className="flex-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-800">{entry.statusName || entry.newStatus}</span>
                          <span className="text-xs text-slate-400">{entry.changedAt?.slice(0, 16)?.replace('T', ' ')}</span>
                        </div>
                        {entry.changedBy && (
                          <p className="text-xs text-slate-500 mt-1">👤 {entry.changedBy}</p>
                        )}
                        {entry.notes && (
                          <p className="text-xs text-slate-600 mt-1.5 bg-white p-2 rounded-lg">{entry.notes}</p>
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
