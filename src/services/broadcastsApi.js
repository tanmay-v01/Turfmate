import { apiFetch } from './apiClient';

export const broadcastsApi = {
  listActive: () => apiFetch('/broadcasts/active'),

  listMine: () => apiFetch('/broadcasts/me'),

  create: (payload) =>
    apiFetch('/broadcasts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deactivate: (id) =>
    apiFetch(`/broadcasts/${encodeURIComponent(id)}/deactivate`, {
      method: 'POST',
      body: '{}',
    }),
};

export default broadcastsApi;
