import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pprService } from '../../services/dataService';
import { useAuth } from '../../hooks/useAuthContext';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft, HiOutlinePencilSquare, HiOutlineClock,
  HiOutlineChatBubbleLeftRight, HiOutlineListBullet, HiOutlineCamera,
  HiOutlineCheck, HiOutlinePlusCircle, HiOutlineXMark,
} from 'react-icons/hi2';

const STATUS_STYLE = {
  SCHEDULED: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Rejalashtirilgan' },
  IN_PROGRESS: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Jarayonda' },
  COMPLETED: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Bajarilgan' },
  APPROVED: { bg: 'bg-green-50', text: 'text-green-700', label: 'Tasdiqlangan' },
  CANCELLED: { bg: 'bg-slate-50', text: 'text-slate-500', label: 'Bekor qilingan' },
};

const PRIORITY_STYLE = {
  LOW: 'badge-slate', NORMAL: 'badge-blue', HIGH: 'badge-orange', CRITICAL: 'badge-red',
};

const TABS = [
  { key: 'info', label: "Ma'lumot", icon: HiOutlineListBullet },
  { key: 'checklist', label: 'Chek-list', icon: HiOutlineCheck },
  { key: 'comments', label: 'Izohlar', icon: HiOutlineChatBubbleLeftRight },
  { key: 'time', label: 'Vaqt', icon: HiOutlineClock },
  { key: 'photos', label: 'Foto', icon: HiOutlineCamera },
];

export default function PprTaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isOperator, isAdmin } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  // Sub-data
  const [checklist, setChecklist] = useState([]);
  const [comments, setComments] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [totalTime, setTotalTime] = useState(0);

  // Forms
  const [newComment, setNewComment] = useState('');
  const [newCheckItem, setNewCheckItem] = useState('');
  const [newTimeEntry, setNewTimeEntry] = useState({ hours: 0, minutes: 0, description: '' });
  const [statusNote, setStatusNote] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');

  const loadTask = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pprService.getTask(id);
      setTask(res.data);
    } catch {
      toast.error("Vazifa topilmadi");
      navigate('/ppr');
    }
    setLoading(false);
  }, [id, navigate]);

  useEffect(() => { loadTask(); }, [loadTask]);

  useEffect(() => {
    if (activeTab === 'checklist') loadChecklist();
    if (activeTab === 'comments') loadComments();
    if (activeTab === 'time') loadTimeEntries();
  }, [activeTab, id]);

  const loadChecklist = async () => {
    try { const r = await pprService.getChecklist(id); setChecklist(r.data || []); } catch {}
  };
  const loadComments = async () => {
    try { const r = await pprService.getComments(id); setComments(r.data || []); } catch {}
  };
  const loadTimeEntries = async () => {
    try {
      const [r1, r2] = await Promise.all([pprService.getTimeEntries(id), pprService.getTotalTime(id)]);
      setTimeEntries(r1.data || []);
      setTotalTime(r2.data || 0);
    } catch {}
  };

  // Status o'zgartirish
  const handleChangeStatus = async () => {
    try {
      await pprService.changeStatus(id, targetStatus, statusNote);
      toast.success("Status yangilandi");
      setShowStatusModal(false);
      setStatusNote('');
      loadTask();
    } catch (err) { toast.error(err.response?.data?.message || "Xato"); }
  };

  // Chek-list
  const handleAddCheckItem = async () => {
    if (!newCheckItem.trim()) return;
    try {
      await pprService.addChecklistItem(id, { description: newCheckItem });
      setNewCheckItem('');
      loadChecklist();
    } catch { toast.error("Xato"); }
  };
  const handleToggleCheck = async (itemId) => {
    try { await pprService.toggleChecklistItem(id, itemId, ''); loadChecklist(); }
    catch { toast.error("Xato"); }
  };

  // Izoh
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await pprService.addComment(id, newComment);
      setNewComment('');
      loadComments();
    } catch { toast.error("Xato"); }
  };

  // Vaqt
  const handleAddTimeEntry = async () => {
    const totalMinutes = (newTimeEntry.hours * 60) + newTimeEntry.minutes;
    if (totalMinutes <= 0) { toast.error("Vaqtni kiriting"); return; }
    try {
      await pprService.addTimeEntry(id, { durationMinutes: totalMinutes, description: newTimeEntry.description });
      setNewTimeEntry({ hours: 0, minutes: 0, description: '' });
      loadTimeEntries();
    } catch { toast.error("Xato"); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }
  if (!task) return null;

  const st = STATUS_STYLE[task.status] || STATUS_STYLE.SCHEDULED;
  const nextStatuses = {
    SCHEDULED: ['IN_PROGRESS'],
    IN_PROGRESS: ['COMPLETED'],
    COMPLETED: isAdmin ? ['APPROVED'] : [],
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <button onClick={() => navigate('/ppr')}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 transition mt-1">
            <HiOutlineArrowLeft className="text-lg" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-800">{task.taskNumber || `PPR #${id}`}</h1>
              <span className={`badge ${st.bg} ${st.text}`}>{st.label}</span>
              <span className={`badge ${PRIORITY_STYLE[task.priority] || 'badge-blue'}`}>{task.priority}</span>
            </div>
            <p className="text-sm text-slate-500">
              {task.equipmentName} • {task.pprTypeName} • 📅 {task.scheduledDate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(nextStatuses[task.status] || []).map(s => (
            <button key={s} onClick={() => { setTargetStatus(s); setShowStatusModal(true); }}
              className={`btn btn-sm ${s === 'APPROVED' ? 'btn-success' : 'btn-primary'}`}>
              {STATUS_STYLE[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Info card */}
      <div className="card p-5 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Mas\'ul', value: task.assignedToName || '—', icon: '👤' },
            { label: 'Rejalashtirilgan', value: task.scheduledDate || '—', icon: '📅' },
            { label: 'Uskuna', value: task.equipmentName || '—', icon: '🖥️' },
            { label: 'PPR turi', value: task.pprTypeName || '—', icon: '🔧' },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs text-slate-400">{item.icon} {item.label}</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === t.key
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}>
            <t.icon className="text-base" /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card p-6">
        {/* INFO */}
        {activeTab === 'info' && (
          <div className="animate-fade-in space-y-4">
            <h3 className="text-base font-bold text-slate-800">📋 Vazifa tafsilotlari</h3>
            {[
              ['Vazifa raqami', task.taskNumber],
              ['Status', st.label],
              ['Ustuvorlik', task.priority],
              ['Uskuna', task.equipmentName],
              ['PPR turi', task.pprTypeName],
              ["Mas'ul", task.assignedToName],
              ['Sana', task.scheduledDate],
              ['Yaratilgan', task.createdAt?.slice(0, 16)?.replace('T', ' ')],
            ].map(([label, value], i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500 w-40 flex-shrink-0">{label}</span>
                <span className="text-sm font-medium text-slate-800">{value || '—'}</span>
              </div>
            ))}
            {task.completionNotes && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <p className="text-xs font-semibold text-emerald-600 mb-1">Bajarilish izohi</p>
                <p className="text-sm text-emerald-800">{task.completionNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* CHECKLIST (TZ 3.9) */}
        {activeTab === 'checklist' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">✅ Chek-list ({checklist.filter(c => c.completed).length}/{checklist.length})</h3>
            </div>
            {/* Progress */}
            {checklist.length > 0 && (
              <div className="mb-4">
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${(checklist.filter(c => c.completed).length / checklist.length) * 100}%` }} />
                </div>
              </div>
            )}
            <div className="space-y-2">
              {checklist.map((item, i) => (
                <div key={item.id || i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition animate-fade-in"
                  style={{ animationDelay: `${i * 40}ms` }}>
                  <button onClick={() => isOperator && handleToggleCheck(item.id)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      item.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-blue-400'
                    }`}>
                    {item.completed && <HiOutlineCheck className="text-sm" />}
                  </button>
                  <span className={`text-sm flex-1 ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {item.description}
                  </span>
                </div>
              ))}
            </div>
            {/* Yangi band */}
            {isOperator && (
              <div className="flex gap-2 mt-4">
                <input value={newCheckItem} onChange={e => setNewCheckItem(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCheckItem()}
                  className="input-field flex-1" placeholder="Yangi chek-list bandi..." />
                <button onClick={handleAddCheckItem} className="btn btn-primary btn-sm">
                  <HiOutlinePlusCircle /> Qo'shish
                </button>
              </div>
            )}
          </div>
        )}

        {/* COMMENTS (TZ 3.11) */}
        {activeTab === 'comments' && (
          <div className="animate-fade-in">
            <h3 className="text-base font-bold text-slate-800 mb-4">💬 Izohlar ({comments.length})</h3>
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-center py-8 text-slate-400">Izohlar yo'q</p>
              ) : comments.map((c, i) => (
                <div key={c.id || i} className="p-4 rounded-xl bg-slate-50 animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-slate-800">👤 {c.authorName || 'Foydalanuvchi'}</span>
                    <span className="text-xs text-slate-400">{c.createdAt?.slice(0, 16)?.replace('T', ' ')}</span>
                  </div>
                  <p className="text-sm text-slate-600">{c.commentText}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newComment} onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                className="input-field flex-1" placeholder="Izoh yozing..." />
              <button onClick={handleAddComment} className="btn btn-primary btn-sm">Yuborish</button>
            </div>
          </div>
        )}

        {/* TIME (TZ 3.12) */}
        {activeTab === 'time' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">⏱️ Sarflangan vaqt</h3>
              <span className="badge badge-blue text-base px-4 py-1.5">
                {Math.floor(totalTime / 60)} soat {totalTime % 60} daqiqa
              </span>
            </div>
            <div className="space-y-2 mb-4">
              {timeEntries.map((entry, i) => (
                <div key={entry.id || i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 animate-fade-in"
                  style={{ animationDelay: `${i * 40}ms` }}>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{entry.description || 'Ish vaqti'}</p>
                    <p className="text-xs text-slate-400">{entry.createdAt?.slice(0, 16)?.replace('T', ' ')}</p>
                  </div>
                  <span className="badge badge-emerald">
                    {Math.floor(entry.durationMinutes / 60)}s {entry.durationMinutes % 60}d
                  </span>
                </div>
              ))}
            </div>
            {isOperator && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600">Soat</label>
                    <input type="number" min="0" value={newTimeEntry.hours}
                      onChange={e => setNewTimeEntry({...newTimeEntry, hours: Number(e.target.value)})}
                      className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Daqiqa</label>
                    <input type="number" min="0" max="59" value={newTimeEntry.minutes}
                      onChange={e => setNewTimeEntry({...newTimeEntry, minutes: Number(e.target.value)})}
                      className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Tavsif</label>
                    <input value={newTimeEntry.description}
                      onChange={e => setNewTimeEntry({...newTimeEntry, description: e.target.value})}
                      className="input-field" placeholder="Ish tavsifi" />
                  </div>
                </div>
                <button onClick={handleAddTimeEntry} className="btn btn-primary btn-sm w-full">
                  <HiOutlinePlusCircle /> Vaqt qo'shish
                </button>
              </div>
            )}
          </div>
        )}

        {/* PHOTOS (TZ 3.10) */}
        {activeTab === 'photos' && (
          <div className="animate-fade-in">
            <h3 className="text-base font-bold text-slate-800 mb-4">📸 Oldin/keyin fotosuratlar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-600 mb-3">📷 Oldin</h4>
                <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center text-slate-400">
                  <HiOutlineCamera className="text-3xl mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Rasmlar API orqali yuklanadi</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-600 mb-3">📷 Keyin</h4>
                <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center text-slate-400">
                  <HiOutlineCamera className="text-3xl mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Rasmlar API orqali yuklanadi</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status modal */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Status o'zgartirish → {STATUS_STYLE[targetStatus]?.label}
            </h3>
            <textarea value={statusNote} onChange={e => setStatusNote(e.target.value)}
              className="input-field mb-4" rows={3} placeholder="Izoh (ixtiyoriy)..." />
            <div className="flex gap-2">
              <button onClick={handleChangeStatus} className="btn btn-primary flex-1">Tasdiqlash</button>
              <button onClick={() => setShowStatusModal(false)} className="btn btn-outline">Bekor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
