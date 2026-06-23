import { apiFetch } from './apiClient';

export const socialApi = {
  listFriendRequests: () => apiFetch('/social/friend-requests'),

  sendFriendRequest: ({ toUserId, toUsername, message }) =>
    apiFetch('/social/friend-requests', {
      method: 'POST',
      body: JSON.stringify({ toUserId, toUsername, message }),
    }),

  acceptFriendRequest: (id) =>
    apiFetch(`/social/friend-requests/${encodeURIComponent(id)}/accept`, {
      method: 'POST',
      body: '{}',
    }),

  declineFriendRequest: (id) =>
    apiFetch(`/social/friend-requests/${encodeURIComponent(id)}/decline`, {
      method: 'POST',
      body: '{}',
    }),

  listSquads: () => apiFetch('/social/squads'),

  createSquad: ({ name, members }) =>
    apiFetch('/social/squads', {
      method: 'POST',
      body: JSON.stringify({ name, members }),
    }),
};

export default socialApi;
