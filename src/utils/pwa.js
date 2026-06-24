/** PWA platform helpers */

export function isIos() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
  );
}

export function canRegisterServiceWorker() {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}
