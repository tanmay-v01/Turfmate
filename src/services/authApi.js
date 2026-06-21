import { apiFetch, setToken } from './apiClient';

export const authApi = {
  sendOtp: (phone) =>
    apiFetch('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: async (phone, otp) => {
    const data = await apiFetch('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
    if (data.token) setToken(data.token);
    return data;
  },

  getMe: () => apiFetch('/users/me'),

  updateMe: (patch) =>
    apiFetch('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),

  logout: () => setToken(null),
};

export default authApi;
