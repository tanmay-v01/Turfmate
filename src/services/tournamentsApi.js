import { env } from '../config/env';

export const tournamentsApi = {
  list: async () => {
    const res = await fetch(`${env.apiUrl}/api/tournaments`);
    if (!res.ok) throw new Error('Failed to fetch tournaments');
    return res.json();
  },
  
  create: async (data, token) => {
    const res = await fetch(`${env.apiUrl}/api/tournaments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create tournament');
    return res.json();
  }
};
