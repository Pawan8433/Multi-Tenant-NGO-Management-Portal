import { api } from './client.js';

// Generic REST client for a resource base path (e.g. '/members').
export function createResourceApi(base) {
  return {
    list: (params) => api.get(base, { params }).then((r) => r.data),
    get: (id) => api.get(`${base}/${id}`).then((r) => r.data.data),
    create: (payload) => api.post(base, payload).then((r) => r.data.data),
    update: (id, payload) => api.put(`${base}/${id}`, payload).then((r) => r.data.data),
    remove: (id) => api.delete(`${base}/${id}`).then((r) => r.data.data),
  };
}

export const membersApi = createResourceApi('/members');
export const contactsApi = createResourceApi('/contacts');
export const volunteersApi = createResourceApi('/volunteers');
export const eventsApi = createResourceApi('/events');
export const donationsApi = createResourceApi('/donations');
export const receiptsApi = createResourceApi('/receipts');
export const campaignsApi = createResourceApi('/campaigns');
export const adminsApi = createResourceApi('/admins');

export const dashboardApi = { get: () => api.get('/dashboard').then((r) => r.data) };
export const donationStatsApi = { get: () => api.get('/donations/stats').then((r) => r.data) };
export const reportsApi = {
  donations: () => api.get('/reports/donations').then((r) => r.data),
  members: () => api.get('/reports/members').then((r) => r.data),
  volunteers: () => api.get('/reports/volunteers').then((r) => r.data),
  events: () => api.get('/reports/events').then((r) => r.data),
  financial: () => api.get('/reports/financial').then((r) => r.data),
};
export const settingsApi = {
  organization: () => api.get('/settings/organization').then((r) => r.data.data),
  updateOrganization: (p) => api.put('/settings/organization', p).then((r) => r.data.data),
  billing: () => api.get('/settings/billing').then((r) => r.data.data),
  onboarding: () => api.get('/settings/onboarding').then((r) => r.data.data),
  updateOnboarding: (p) => api.put('/settings/onboarding', p).then((r) => r.data.data),
};
export const notificationsApi = {
  list: () => api.get('/notifications').then((r) => r.data),
  readAll: () => api.post('/notifications/read-all').then((r) => r.data),
};
export const auditApi = { list: () => api.get('/audit-logs').then((r) => r.data) };
export const generateReceipt = (donationId) =>
  api.post(`/receipts/generate/${donationId}`).then((r) => r.data.data);
