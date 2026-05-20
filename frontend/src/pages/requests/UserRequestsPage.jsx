import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { userRequestService } from '../../services/dataService';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  NEW: { badge: 'badge-blue', icon: '🆕', label: 'Yangi' },
  IN_REVIEW: { badge: 'badge-yellow', icon: '🔍', label: "Ko'rib chiqilmoqda" },
  APPROVED: { badge: 'badge-green', icon: '✅', label: 'Tasdiqlangan' },
  REJECTED: { badge: 'badge-red', icon: '❌', label: 'Rad etilgan' },
  COMPLETED: { badge: 'badge-emerald', icon: '🏁', label: 'Bajarildi' },
};

const REQUEST_TYPES = [
  { value: 'REPAIR', label: "Ta'mirlash so'rovi" },
  { value: 'SPARE_PART', label: "Ehtiyot qism so'rovi" },
  { value: 'TRANSFER', label: "Uskuna ko'chirish" },
  { value: 'OTHER', label: 'Boshqa' },
];

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
      setRequests(res.data || []);
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

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📝 Arizalar</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin ? 'Barcha foydalanuvchilar arizalari' : 'Sizning arizalaringiz'}
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Yangi ariza</button>
      </div>

      {/* Status filtrlari */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {Object.entries({ ALL: 'Barchasi', NEW: '🆕 Yangi', IN_REVIEW: '🔍 Ko\'rib chiqilmoqda', APPROVED: '✅ Tasdiqlangan', REJECTED: '❌ Rad etilgan' }).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === key
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}>
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === key ? 'bg-white/20' : 'bg-slate-100'}`}>
              {statusCounts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Arizalar ro'yxati */}
      <div className="space-y-3">
        {loading ? (
          <div className="card p-16 text-center">
            <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Yuklanmoqda...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center text-slate-400">
            <p className="text-4xl mb-2">📝</p>
            <p>Arizalar topilmadi</p>
          </div>
        ) : (
          filtered.map((req, i) => {
            const st = STATUS_MAP[req.status] || STATUS_MAP.NEW;
            return (
              <div key={req.id} className="card p-5 hover:shadow-md transition-shadow animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="flex items-start gap-4">
                  {/* Chap — status icon */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                    req.status === 'APPROVED' ? 'bg-emerald-100' :
                    req.status === 'REJECTED' ? 'bg-red-100' :
                    req.status === 'IN_REVIEW' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    {st.icon}
                  </div>

                  {/* O'rta — tafsilot */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-slate-800 truncate">{req.subject}</h3>
                      <span className={`badge ${st.badge} text-xs`}>{st.label}</span>
                      <span className={`badge text-xs ${req.priority === 'HIGH' ? 'badge-red' : req.priority === 'LOW' ? 'badge-slate' : 'badge-blue'}`}>
                        {req.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{req.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>📋 {REQUEST_TYPES.find(t => t.value === req.type)?.label || req.type}</span>
                      <span>👤 {req.createdByName || 'Noma\'lum'}</span>
                      <span>📅 {req.createdAt?.slice(0, 10)}</span>
                    </div>
                    {req.adminComment && (
                      <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600">
                        💬 Admin izohi: {req.adminComment}
                      </div>
                    )}
                  </div>

                  {/* O'ng — admin amallar */}
                  {isAdmin && req.status === 'NEW' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleStatusChange(req.id, 'IN_REVIEW', '')}
                        className="btn btn-outline btn-sm">🔍 Ko'rish</button>
                    </div>
                  )}
                  {isAdmin && req.status === 'IN_REVIEW' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleStatusChange(req.id, 'APPROVED', 'Tasdiqlandi')}
                        className="btn btn-success btn-sm">✅</button>
                      <button onClick={() => {
                        const reason = prompt("Rad etish sababi:");
                        if (reason) handleStatusChange(req.id, 'REJECTED', reason);
                      }}
                        className="btn btn-danger btn-sm">❌</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Yangi ariza modali */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg mx-4 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-5">📝 Yangi ariza yuborish</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Ariza turi</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input-field">
                    {REQUEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Ustuvorlik</label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="input-field">
                    <option value="LOW">Past</option>
                    <option value="NORMAL">O'rta</option>
                    <option value="HIGH">Yuqori</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Mavzu *</label>
                <input required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                  className="input-field" placeholder="Ariza mavzusi" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tavsif *</label>
                <textarea required rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="input-field" placeholder="Batafsil tushuntiring..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn btn-primary flex-1">📤 Yuborish</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline px-6">Bekor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
