import { apiFetch } from './apiClient';

export const lockerApi = {
  getFeed: () => apiFetch('/locker/feed'),

  createPost: ({ contentType, contentText, extra, lat, lng }) =>
    apiFetch('/locker/posts', {
      method: 'POST',
      body: JSON.stringify({ contentType, contentText, extra, lat, lng }),
    }),
};

export default lockerApi;
