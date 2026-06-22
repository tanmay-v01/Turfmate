import { apiFetch } from './apiClient';

export const paymentsApi = {
  createOrder: (payload) =>
    apiFetch('/payments/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  verify: (payload) =>
    apiFetch('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export default paymentsApi;
