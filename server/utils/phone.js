/** Normalize Indian mobile to 10-digit string */

function normalizePhone(raw) {
  if (!raw) return '';
  const str = String(raw).trim();
  if (str.includes('@')) {
    return str.toLowerCase();
  }
  const digits = str.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits.slice(-10);
}

const DEMO_PHONES = new Set(['9876543210', '1111111111', '9999999999', 'demo@turfmate.com', 'owner@turfmate.com', 'admin@turfmate.com']);

function isValidPhone(phone) {
  if (DEMO_PHONES.has(phone)) return true;
  if (phone.includes('@')) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(phone);
  }
  return /^[6-9]\d{9}$/.test(phone);
}

module.exports = { normalizePhone, isValidPhone, DEMO_PHONES };
