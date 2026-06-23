import { apiFetch } from './apiClient';

export const chatApi = {
  getInbox: () => apiFetch('/chat/rooms'),

  getRoomHistory: (roomId) => apiFetch(`/chat/rooms/${encodeURIComponent(roomId)}/messages`),

  markRead: (roomId) =>
    apiFetch(`/chat/rooms/${encodeURIComponent(roomId)}/read`, { method: 'POST', body: '{}' }),

  sendMessage: (roomId, text, type = 'TEXT') =>
    apiFetch(`/chat/rooms/${encodeURIComponent(roomId)}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text, type }),
    }),
};

export default chatApi;
