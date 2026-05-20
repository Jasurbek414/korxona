import api from './api';

export const authService = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),

  refresh: (refreshToken) =>
    api.post('/auth/refresh', { refreshToken }),

  logout: () => {
    localStorage.clear();
    window.location.href = '/login';
  },

  getProfile: () => api.get('/profile'),

  updateProfile: (data) => api.put('/profile', data),

  changePassword: (data) => api.put('/profile/change-password', data),
};

export const equipmentService = {
  getAll: (params) => api.get('/equipment', { params }),
  getById: (id) => api.get(`/equipment/${id}`),
  create: (data) => api.post('/equipment', data),
  update: (id, data) => api.put(`/equipment/${id}`, data),
  delete: (id) => api.delete(`/equipment/${id}`),
  getStatusHistory: (id) => api.get(`/equipment/${id}/status-history`),
  generateQrCode: (id) => api.post(`/equipment/${id}/qr-code/generate`),
  downloadQrCode: (id) => api.get(`/equipment/${id}/qr-code`, { responseType: 'blob' }),
};

export const fileService = {
  getDocuments: (eqId) => api.get(`/equipment/${eqId}/documents`),
  uploadDocument: (eqId, formData) =>
    api.post(`/equipment/${eqId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteDocument: (eqId, docId) => api.delete(`/equipment/${eqId}/documents/${docId}`),

  getPhotos: (eqId) => api.get(`/equipment/${eqId}/photos`),
  uploadPhoto: (eqId, formData) =>
    api.post(`/equipment/${eqId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deletePhoto: (eqId, photoId) => api.delete(`/equipment/${eqId}/photos/${photoId}`),
};

export const referenceService = {
  categories: { getAll: () => api.get('/categories'), create: (d) => api.post('/categories', d), update: (id, d) => api.put(`/categories/${id}`, d), delete: (id) => api.delete(`/categories/${id}`) },
  manufacturers: { getAll: () => api.get('/manufacturers'), create: (d) => api.post('/manufacturers', d), update: (id, d) => api.put(`/manufacturers/${id}`, d), delete: (id) => api.delete(`/manufacturers/${id}`) },
  models: { getAll: () => api.get('/models'), getByManufacturer: (mId) => api.get(`/models/by-manufacturer/${mId}`), create: (d) => api.post('/models', d), update: (id, d) => api.put(`/models/${id}`, d), delete: (id) => api.delete(`/models/${id}`) },
  locations: { getAll: () => api.get('/locations'), create: (d) => api.post('/locations', d), update: (id, d) => api.put(`/locations/${id}`, d), delete: (id) => api.delete(`/locations/${id}`) },
  responsiblePersons: { getAll: () => api.get('/responsible-persons'), create: (d) => api.post('/responsible-persons', d), update: (id, d) => api.put(`/responsible-persons/${id}`, d), delete: (id) => api.delete(`/responsible-persons/${id}`) },
  statuses: { getAll: () => api.get('/statuses'), create: (d) => api.post('/statuses', d), update: (id, d) => api.put(`/statuses/${id}`, d), delete: (id) => api.delete(`/statuses/${id}`) },
  documentTypes: { getAll: () => api.get('/document-types'), create: (d) => api.post('/document-types', d), update: (id, d) => api.put(`/document-types/${id}`, d), delete: (id) => api.delete(`/document-types/${id}`) },
};

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  toggleActive: (id) => api.patch(`/users/${id}/toggle-active`),
  resetPassword: (id, newPassword) => api.patch(`/users/${id}/reset-password`, { newPassword }),
};

export const auditLogService = {
  getAll: (params) => api.get('/audit-log', { params }),
  getByUser: (userId, params) => api.get(`/audit-log/by-user/${userId}`, { params }),
  getByAction: (action, params) => api.get(`/audit-log/by-action/${action}`, { params }),
};

// ====== PPR (TZ 3.1-3.12) ======
export const pprService = {
  // Vazifalar
  getTasks: (params) => api.get('/ppr/tasks', { params }),
  getTask: (id) => api.get(`/ppr/tasks/${id}`),
  getCalendar: (from, to) => api.get('/ppr/tasks/calendar', { params: { from, to } }),
  getOverdue: () => api.get('/ppr/tasks/overdue'),
  createTask: (data) => api.post('/ppr/tasks', data),
  updateTask: (id, data) => api.put(`/ppr/tasks/${id}`, data),
  changeStatus: (id, status, completionNotes) => api.patch(`/ppr/tasks/${id}/status`, { status, completionNotes }),
  reschedule: (id, data) => api.post(`/ppr/tasks/${id}/reschedule`, data),
  getRescheduleHistory: (id) => api.get(`/ppr/tasks/${id}/reschedule-history`),
  deleteTask: (id) => api.delete(`/ppr/tasks/${id}`),

  // Chek-list
  getChecklist: (taskId) => api.get(`/ppr/tasks/${taskId}/checklist`),
  addChecklistItem: (taskId, data) => api.post(`/ppr/tasks/${taskId}/checklist`, data),
  toggleChecklistItem: (taskId, itemId, notes) => api.patch(`/ppr/tasks/${taskId}/checklist/${itemId}/toggle`, { notes }),

  // Izohlar
  getComments: (taskId) => api.get(`/ppr/tasks/${taskId}/comments`),
  addComment: (taskId, commentText) => api.post(`/ppr/tasks/${taskId}/comments`, { commentText }),

  // Vaqt hisobi
  getTimeEntries: (taskId) => api.get(`/ppr/tasks/${taskId}/time-entries`),
  addTimeEntry: (taskId, data) => api.post(`/ppr/tasks/${taskId}/time-entries`, data),
  getTotalTime: (taskId) => api.get(`/ppr/tasks/${taskId}/total-time`),

  // PPR turlari
  getTypes: () => api.get('/ppr-types'),
  createType: (data) => api.post('/ppr-types', data),
  updateType: (id, data) => api.put(`/ppr-types/${id}`, data),
  deleteType: (id) => api.delete(`/ppr-types/${id}`),

  // Intervallar
  getIntervals: () => api.get('/ppr/intervals'),
  getIntervalsByEquipment: (eqId) => api.get(`/ppr/intervals/equipment/${eqId}`),
  createInterval: (data) => api.post('/ppr/intervals', data),
  updateInterval: (id, data) => api.put(`/ppr/intervals/${id}`, data),
  deleteInterval: (id) => api.delete(`/ppr/intervals/${id}`),
  generateTasks: () => api.post('/ppr/intervals/generate'),
};

// ====== Ombor (TZ 4.1-4.5) ======
export const warehouseService = {
  getStockByWarehouse: (whId) => api.get(`/warehouse/stocks/${whId}`),
  getStockBySparePart: (spId) => api.get(`/warehouse/stocks/spare-part/${spId}`),
  getLowStockAlerts: () => api.get('/warehouse/alerts/low-stock'),
  getOperations: (params) => api.get('/warehouse/operations', { params }),
  incoming: (data) => api.post('/warehouse/incoming', data),
  outgoing: (data) => api.post('/warehouse/outgoing', data),
  transfer: (data) => api.post('/warehouse/transfer', data),
  writeOff: (data) => api.post('/warehouse/write-off', data),
};

// ====== Hisobotlar (TZ 5.1-5.2) ======
export const reportService = {
  getDashboardKpi: () => api.get('/reports/dashboard'),
  getEquipmentStatus: () => api.get('/reports/equipment-status'),
  getPprPerformance: (dateFrom, dateTo) => api.get('/reports/ppr-performance', { params: { dateFrom, dateTo } }),
  getOverdueTasks: () => api.get('/reports/overdue-tasks'),
  getSparePartUsage: (dateFrom, dateTo) => api.get('/reports/spare-part-usage', { params: { dateFrom, dateTo } }),
  getWarehouseStock: () => api.get('/reports/warehouse-stock'),
};

// ====== Arizalar (TZ 3.8) ======
export const requestService = {
  getAll: (params) => api.get('/requests', { params }),
  getMy: (params) => api.get('/requests/my', { params }),
  getById: (id) => api.get(`/requests/${id}`),
  create: (data) => api.post('/requests', data),
  changeStatus: (id, data) => api.patch(`/requests/${id}/status`, data),
  delete: (id) => api.delete(`/requests/${id}`),
};

// ====== Excel import (TZ 4.7) ======
export const importService = {
  importEquipment: (formData) => api.post('/import/equipment', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  importSpareParts: (formData) => api.post('/import/spare-parts', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  downloadTemplate: (type) => api.get(`/import/template/${type}`, { responseType: 'blob' }),
};

