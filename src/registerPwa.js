import { canRegisterServiceWorker } from './utils/pwa';

/** Register the app shell service worker (production builds). */
export function registerPwa() {
  if (!canRegisterServiceWorker()) return;

  const enableInDev = import.meta.env.VITE_ENABLE_SW === 'true';
  if (import.meta.env.DEV && !enableInDev) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* non-fatal — app works without SW */
    });
  });
}
