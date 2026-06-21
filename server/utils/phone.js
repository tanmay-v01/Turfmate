/** Normalize Indian mobile to 10-digit string */

function normalizePhone(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits.slice(-10);
}

function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(phone);
}

module.exports = { normalizePhone, isValidPhone };
