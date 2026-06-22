import { apiFetch } from './apiClient';

export const adminApi = {
  listPendingKyc: () => apiFetch('/admin/kyc/pending'),

  approveKyc: (userId) =>
    apiFetch(`/admin/kyc/${userId}/approve`, { method: 'POST' }),

  rejectKyc: (userId, note = '') =>
    apiFetch(`/admin/kyc/${userId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    }),

  getStats: () => apiFetch('/admin/stats'),
};

export default adminApi;
