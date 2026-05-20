import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { pprService, referenceService } from '../../services/dataService';
import { useAuthContext } from '../../hooks/useAuthContext';
import toast from 'react-hot-toast';

const PRIORITIES = [
  { value: 'LOW', label: 'Past', color: 'bg-slate-100 text-slate-700' },
  { value: 'MEDIUM', label: "O'rta", color: 'bg-blue-100 text-blue-700' },
  { value: 'HIGH', label: 'Yuqori', color: 'bg-orange-100 text-orange-700' },
  { value: 'CRITICAL', label: 'Kritik', color: 'bg-red-100 text-red-700' },
];
const STATUSES = [
  { value: 'SCHEDULED', label: 'Rejalashtirilgan', color: 'bg-blue-100 text-blue-700', icon: '🔵' },
  { value: 'IN_PROGRESS', label: 'Jarayonda', color: 'bg-yellow-100 text-yellow-700', icon: '🟡' },
  { value: 'COMPLETED', label: 'Bajarilgan', color: 'bg-green-100 text-green-700', icon: '🟢' },
  { value: 'APPROVED', label: 'Tasdiqlangan', color: 'bg-emerald-100 text-emerald-800', icon: '✅' },
];

export default function PprTaskListPage() {
  const { user } = useAuthContext();
  const isAdmin = user?.role === 'ADMIN';

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filtrlar
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // PPR turlari va mas'ul shaxslar
  const [pprTypes, setPprTypes] = useState([]);
  const [persons, setPersons] = useState([]);

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ equipmentId: '', pprTypeId: '', assignedToId: '', scheduledDate: '', priority: 'MEDIUM', description: '' });

  useEffect(() => {
    Promise.all([
      pprService.getTypes(),
      referenceService.responsiblePersons.getAll()
    ]).then(([typesRes, personsRes]) => {
      setPprTypes(typesRes.data);
      setPersons(personsRes.data);
    }).catch(() => {});
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 20 };
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const res = await pprService.getTasks(params);
      setTasks(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch { toast.error("Vazifalarni yuklashda xato"); }
    setLoading(false);
  }, [page, filterStatus, filterPriority, dateFrom, dateTo]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await pprService.changeStatus(id, newStatus, null);
      toast.success('Status yangilandi');
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xato');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await pprService.createTask(form);
      toast.success('Vazifa yaratildi');
      setShowCreateModal(false);
      setForm({ equipmentId: '', pprTypeId: '', assignedToId: '', scheduledDate: '', priority: 'MEDIUM', description: '' });
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Yaratishda xato');
    }
  };

  const getPriority = (val) => PRIORITIES.find(p => p.value === val) || PRIORITIES[1];
  const getStatus = (val) => STATUSES.find(s => s.value === val) || STATUSES[0];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">PPR Vazifalari</h1>
          <p className="text-sm text-slate-500 mt-1">Jami: {totalElements} ta vazifa</p>
        </div>
        {(isAdmin || user?.role === 'OPERATOR') && (
          <button onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
            + Yangi vazifa
          </button>
        )}
      </div>

      {/* Filtrlar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(0); }}
            className="input-field">
            <option value="">Barcha statuslar</option>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
          </select>
          <select value={filterPriority} onChange={e => { setFilterPriority(e.target.value); setPage(0); }}
            className="input-field">
            <option value="">Barcha ustuvorliklar</option>
            {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0); }}
            className="input-field" placeholder="Boshlanish" />
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0); }}
            className="input-field" placeholder="Tugash" />
        </div>
      </div>

      {/* Jadval */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Yuklanmoqda...</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Vazifalar topilmadi</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Raqam</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Uskuna</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Turi</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Sana</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Ustuvorlik</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Mas'ul</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map(task => {
                  const priority = getPriority(task.priority);
                  const status = getStatus(task.status);
                  return (
                    <tr key={task.id} className={`hover:bg-slate-50 transition ${task.isOverdue ? 'bg-red-50/50' : ''}`}>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600">{task.taskNumber}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{task.equipmentName}</div>
                        <div className="text-xs text-slate-400">{task.equipmentInventoryNumber}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{task.pprTypeName}</td>
                      <td className="px-4 py-3">
                        <span className={task.isOverdue ? 'text-red-600 font-semibold' : 'text-slate-700'}>
                          {task.scheduledDate}
                        </span>
                        {task.isOverdue && (
                          <div className="text-xs text-red-500 font-medium">{task.overdueDays} kun kechikkan</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priority.color}`}>{priority.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.icon} {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{task.assignedToName || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {task.status === 'SCHEDULED' && (
                            <button onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                              className="px-2 py-1 text-xs bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition" title="Boshlash">
                              ▶ Boshlash
                            </button>
                          )}
                          {task.status === 'IN_PROGRESS' && (
                            <button onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                              className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition" title="Yakunlash">
                              ✓ Yakunlash
                            </button>
                          )}
                          {task.status === 'COMPLETED' && isAdmin && (
                            <button onClick={() => handleStatusChange(task.id, 'APPROVED')}
                              className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition" title="Tasdiqlash">
                              ✅ Tasdiqlash
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginatsiya */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">{page + 1} / {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-slate-50 transition">← Oldingi</button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-slate-50 transition">Keyingi →</button>
            </div>
          </div>
        )}
      </div>

      {/* Yangi vazifa modali */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Yangi PPR vazifasi</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Uskuna ID *</label>
                  <input type="number" required value={form.equipmentId}
                    onChange={e => setForm({...form, equipmentId: e.target.value})}
                    className="input-field" placeholder="Uskuna ID" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">PPR turi *</label>
                  <select required value={form.pprTypeId}
                    onChange={e => setForm({...form, pprTypeId: e.target.value})}
                    className="input-field">
                    <option value="">Tanlang</option>
                    {pprTypes.map(t => <option key={t.id} value={t.id}>{t.nameUz}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Sana *</label>
                  <input type="date" required value={form.scheduledDate}
                    onChange={e => setForm({...form, scheduledDate: e.target.value})}
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Ustuvorlik</label>
                  <select value={form.priority}
                    onChange={e => setForm({...form, priority: e.target.value})}
                    className="input-field">
                    {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Mas'ul shaxs</label>
                <select value={form.assignedToId}
                  onChange={e => setForm({...form, assignedToId: e.target.value})}
                  className="input-field">
                  <option value="">Tanlanmagan</option>
                  {persons.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Tavsif</label>
                <textarea value={form.description} rows={3}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="input-field" placeholder="Qo'shimcha ma'lumot..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                  Yaratish
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition">
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
