import { apiFetch } from './apiClient';

export const turfsApi = {
  list: ({ lat, lng, radius_km = 20, sport = 'all' } = {}) => {
    const params = new URLSearchParams();
    if (lat != null) params.set('lat', String(lat));
    if (lng != null) params.set('lng', String(lng));
    if (radius_km != null) params.set('radius_km', String(radius_km));
    if (sport) params.set('sport', sport);
    const qs = params.toString();
    return apiFetch(`/turfs${qs ? `?${qs}` : ''}`);
  },

  getById: (id, { lat, lng } = {}) => {
    const params = new URLSearchParams();
    if (lat != null) params.set('lat', String(lat));
    if (lng != null) params.set('lng', String(lng));
    const qs = params.toString();
    return apiFetch(`/turfs/${encodeURIComponent(id)}${qs ? `?${qs}` : ''}`);
  },
};

export default turfsApi;
