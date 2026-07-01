/** Central env config — Vite exposes only VITE_* vars to the client */

const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const apiBase = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:3001/api' : '/api');
const socketBase = import.meta.env.VITE_SOCKET_URL || (isLocal ? 'http://localhost:3001' : '/');

export const env = {
  apiUrl: apiBase.replace(/\/$/, ''),
  socketUrl: socketBase.replace(/\/$/, ''),
  demoMode: import.meta.env.VITE_DEMO_MODE === 'true',
  appUrl: import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
  razorpayKey: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
  supportWhatsApp: import.meta.env.VITE_SUPPORT_WHATSAPP || '',
};

export default env;
