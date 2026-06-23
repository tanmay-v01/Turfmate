import { apiFetch } from './apiClient';

export const notificationsApi = {
  registerToken: (token, platform = 'web') =>
    apiFetch('/notifications/token', {
      method: 'POST',
      body: JSON.stringify({ token, platform }),
    }),

  list: () => apiFetch('/notifications'),

  markRead: (id) =>
    apiFetch(`/notifications/${encodeURIComponent(id)}/read`, {
      method: 'POST',
      body: '{}',
    }),

  markAllRead: () =>
    apiFetch('/notifications/read-all', {
      method: 'POST',
      body: '{}',
    }),
};

export default notificationsApi;
