import env from '../config/env';

const API_URL = env.apiUrl;

export const bookingApi = {
  lockSlot: async (turfId, slotId, userId) => {
    const res = await fetch(`${API_URL}/bookings/lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ turfId, slotId, userId })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
  
  checkout: async (turfId, slotId, userId, amount) => {
    const res = await fetch(`${API_URL}/bookings/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ turfId, slotId, userId, amount })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  initiateSplit: async (turfId, slotId, hostId, totalAmount, hostAdvance, playersNeeded, isPublic) => {
    const res = await fetch(`${API_URL}/splits/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ turfId, slotId, hostId, totalAmount, hostAdvance, playersNeeded, isPublic })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  joinSplit: async (bookingId, userId, amount) => {
    const res = await fetch(`${API_URL}/splits/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, userId, amount })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  }
};

export const socialApi = {
  getFeed: async (lat, lng, radius_km) => {
    const res = await fetch(`${API_URL}/feed?lat=${lat}&lng=${lng}&radius_km=${radius_km}`);
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
  
  createPost: async (authorId, contentType, contentText, lat, lng) => {
    const res = await fetch(`${API_URL}/feed/post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorId, contentType, contentText, lat, lng })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  searchRadar: async (sport, skill, position) => {
    const res = await fetch(`${API_URL}/radar/search?sport=${sport || ''}&skill=${skill || ''}&position=${position || ''}`);
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  createSquad: async (ownerId, squadName, members) => {
    const res = await fetch(`${API_URL}/squads/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerId, squadName, members })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  }
};

export const chatApi = {
  getInbox: async (userId) => {
    // For now we'll mock this on the frontend using local state, 
    // but in a real app this would call `/api/chat/inbox?userId=${userId}`
    return [];
  },
  getRoomHistory: async (roomId) => {
    // Mocking for now, but would be `/api/chat/room/${roomId}`
    return [];
  }
};
