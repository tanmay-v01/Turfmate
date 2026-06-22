import { apiFetch } from './apiClient';

export const ownersApi = {
  getMe: () => apiFetch('/owners/me'),

  getRevenue: () => apiFetch('/owners/me/revenue'),

  submitApplication: (payload) =>
    apiFetch('/owners/apply', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export default ownersApi;
