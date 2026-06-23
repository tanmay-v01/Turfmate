import env from '../config/env';

/** Open WhatsApp chat with support (pilot). Number: country code + number, no + */
export function openSupportWhatsApp(message = 'Hi TurfMate, I need help with...') {
  const phone = env.supportWhatsApp?.replace(/\D/g, '');
  if (!phone) return false;
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
