const crypto = require('crypto');
const config = require('../lib/config');

/** In-memory OTP store (Phase 1). Phase 1b: Redis. */
const otpStore = new Map();

function generateOtp() {
  if (config.demoMode || !config.msg91AuthKey) {
    return config.demoOtp;
  }
  return String(crypto.randomInt(1000, 9999));
}

function storeOtp(phone, otp) {
  otpStore.set(phone, {
    otp,
    expiresAt: Date.now() + config.otpTtlMs,
  });
}

function verifyOtp(phone, otp) {
  const entry = otpStore.get(phone);
  if (!entry) {
    if (config.demoMode && otp === config.demoOtp) return true;
    return false;
  }
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    return false;
  }
  const ok = entry.otp === otp;
  if (ok) otpStore.delete(phone);
  return ok;
}

async function sendOtp(phone, otp) {
  if (config.msg91AuthKey && config.msg91TemplateId) {
    // MSG91 integration placeholder — wire in Phase 1b with DLT template
    console.log(`[OTP] MSG91 would send ${otp} to +91${phone}`);
    return { channel: 'sms' };
  }
  console.log(`[OTP] Demo OTP for +91${phone}: ${otp}`);
  return { channel: 'demo', devHint: config.demoMode ? config.demoOtp : undefined };
}

function createAndSendOtp(phone) {
  const otp = generateOtp();
  storeOtp(phone, otp);
  return sendOtp(phone, otp);
}

module.exports = {
  createAndSendOtp,
  verifyOtp,
};
