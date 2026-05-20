import { useState, useRef } from 'react';
import { importService } from '../../services/dataService';
import toast from 'react-hot-toast';
import { HiOutlineDocumentArrowUp, HiOutlineDocumentArrowDown, HiOutlineCheck, HiOutlineXMark } from 'react-icons/hi2';

const IMPORT_TYPES = [
  {
    key: 'equipment', label: 'Uskunalar',
    desc: "Inventar raqami, nomi, toifasi, seriya raqami, joylashuv",
    icon: '🖥️', gradient: 'from-blue-500 to-indigo-600',
    handler: (formData) => importService.importEquipment(formData),
  },
  {
    key: 'spare-parts', label: 'Ehtiyot qismlar',
    desc: "Nomi, kodi, o'lchov birligi, narxi, minimal qoldiq",
    icon: '📦', gradient: 'from-emerald-500 to-teal-600',
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
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">📥 Excel Import</h1>
        <p className="text-sm text-slate-500 mt-1">Ma'lumotlarni Excel fayldan ommaviy yuklash</p>
      </div>

      {/* Import turi tanlash */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {IMPORT_TYPES.map(type => (
          <button key={type.key} onClick={() => { setSelectedType(type.key); setFile(null); setResult(null); }}
            className={`card p-5 text-left transition-all duration-200 group ${
              selectedType === type.key
                ? 'ring-2 ring-blue-500 border-blue-200 shadow-md'
                : 'hover:shadow-md'
            }`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                {type.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">{type.label}</h3>
                <p className="text-xs text-slate-500 mt-1">{type.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yuklash paneli */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">
            Faylni yuklash — <span className="gradient-text">{activeType?.label}</span>
          </h3>

          {/* Shablon yuklab olish */}
          <button onClick={handleDownloadTemplate}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all mb-4 group">
            <HiOutlineDocumentArrowDown className="text-2xl text-slate-400 group-hover:text-blue-500 transition" />
            <div className="text-left">
              <p className="text-sm font-medium text-slate-700">📋 Shablonni yuklab oling</p>
              <p className="text-xs text-slate-400">To'ldiring va qayta yuklang</p>
            </div>
          </button>

          {/* Fayl tanlash */}
          <div
            onClick={() => fileRef.current?.click()}
            className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
              file
                ? 'border-emerald-300 bg-emerald-50/50'
                : 'border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/30'
            }`}>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />

            {file ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-3">
                  <HiOutlineCheck className="text-emerald-600 text-2xl" />
                </div>
                <p className="text-sm font-semibold text-emerald-700">{file.name}</p>
                <p className="text-xs text-emerald-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                  <HiOutlineDocumentArrowUp className="text-slate-400 text-2xl" />
                </div>
                <p className="text-sm font-medium text-slate-600">Faylni bu yerga tashlang</p>
                <p className="text-xs text-slate-400 mt-1">yoki bosing tanlash uchun (.xlsx)</p>
              </>
            )}
          </div>

          {/* Yuklash tugmasi */}
          <button onClick={handleUpload} disabled={!file || uploading}
            className="btn btn-primary w-full mt-4 py-3 disabled:opacity-40">
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Import qilinmoqda...
              </>
            ) : (
              <>📥 Import qilish</>
            )}
          </button>
        </div>

        {/* Natijalar */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Natijalar</h3>

          {!result ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <span className="text-3xl">📊</span>
              </div>
              <p className="text-sm">Import natijasi bu yerda ko'rinadi</p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {/* Umumiy statistika */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 text-center">
                  <p className="text-2xl font-extrabold text-slate-800">{result.total}</p>
                  <p className="text-xs text-slate-500 mt-1">Jami qator</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 text-center">
                  <p className="text-2xl font-extrabold text-emerald-700">{result.success}</p>
                  <p className="text-xs text-emerald-600 mt-1">Muvaffaqiyatli</p>
                </div>
                <div className={`p-4 rounded-2xl text-center ${result.errors?.length > 0 ? 'bg-red-50' : 'bg-slate-50'}`}>
                  <p className={`text-2xl font-extrabold ${result.errors?.length > 0 ? 'text-red-700' : 'text-slate-400'}`}>
                    {result.errors?.length || 0}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Xatolar</p>
                </div>
              </div>

              {/* Progress bar */}
              {result.total > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Muvaffaqiyat</span>
                    <span>{Math.round((result.success / result.total) * 100)}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700"
                      style={{ width: `${(result.success / result.total) * 100}%` }} />
                  </div>
                </div>
              )}

              {/* Xatolar ro'yxati */}
              {result.errors?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-red-600 mb-2">Xatolar</h4>
                  <div className="max-h-60 overflow-y-auto space-y-1.5">
                    {result.errors.map((err, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50 border border-red-100 animate-fade-in"
                        style={{ animationDelay: `${i * 50}ms` }}>
                        <HiOutlineXMark className="text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-semibold text-red-700">Qator {err.row}:</span>
                          <span className="text-xs text-red-600 ml-1">{err.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.success > 0 && result.errors?.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-4xl mb-2">🎉</p>
                  <p className="text-base font-semibold text-emerald-600">Barcha ma'lumotlar muvaffaqiyatli import qilindi!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
