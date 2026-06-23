import { apiFetch } from './apiClient';

export const leaderboardApi = {
  getEntries: ({ scope = 'squad', lat, lng, radiusKm } = {}) => {
    const params = new URLSearchParams({ scope });
    if (lat != null) params.set('lat', String(lat));
    if (lng != null) params.set('lng', String(lng));
    if (radiusKm != null) params.set('radius_km', String(radiusKm));
    return apiFetch(`/leaderboard?${params}`);
  },

  getMatches: () => apiFetch('/leaderboard/matches'),

  recordMatch: ({ sport, summary, delta }) =>
    apiFetch('/leaderboard/matches', {
      method: 'POST',
      body: JSON.stringify({ sport, summary, delta }),
    }),
};

export default leaderboardApi;
