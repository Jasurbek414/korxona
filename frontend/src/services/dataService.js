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
