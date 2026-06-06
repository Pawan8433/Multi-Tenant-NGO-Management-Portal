import { api } from './client.js';

// Platform Super Admin API (cross-tenant). All under /api/admin/*.
export const adminApi = {
  dashboard: () => api.get('/admin/dashboard').then((r) => r.data),
  billing: () => api.get('/admin/billing').then((r) => r.data),
  auditLogs: () => api.get('/admin/audit-logs').then((r) => r.data),
  listNgos: (params) => api.get('/admin/ngos', { params }).then((r) => r.data),
  getNgo: (id) => api.get(`/admin/ngos/${id}`).then((r) => r.data),
  setStatus: (id, body) => api.put(`/admin/ngos/${id}/status`, body).then((r) => r.data.data),
  impersonate: (id) => api.post(`/admin/ngos/${id}/impersonate`).then((r) => r.data),
  deleteNgo: (id, permanent = false) =>
    api.delete(`/admin/ngos/${id}`, { params: permanent ? { permanent: true } : {} }).then((r) => r.data.data),
};
