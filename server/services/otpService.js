const crypto = require('crypto');
const config = require('../lib/config');
const emailService = require('./emailService');

/** In-memory OTP store (Phase 1). Production: Redis optional. */
const otpStore = new Map();

function isMsg91Live() {
  return Boolean(config.msg91AuthKey && config.msg91TemplateId);
}

function generateOtp(phone) {
  const { DEMO_PHONES } = require('../utils/phone');
  if (!isMsg91Live() && !phone.includes('@')) {
    return config.demoOtp;
  }
  if (config.demoMode && !isMsg91Live() && DEMO_PHONES.has(phone)) {
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

function verifyLocalOtp(phone, otp) {
  const entry = otpStore.get(phone);
  if (!entry) {
    const { DEMO_PHONES } = require('../utils/phone');
    if (config.demoMode && DEMO_PHONES.has(phone) && otp === config.demoOtp) return true;
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

async function verifyMsg91Otp(phone, otp) {
  if (phone.includes('@') || !isMsg91Live()) return null;

  const mobile = `91${phone}`;
  const params = new URLSearchParams({ otp, mobile });
  const res = await fetch(`https://control.msg91.com/api/v5/otp/verify?${params}`, {
    method: 'GET',
    headers: { authkey: config.msg91AuthKey },
  });
  const data = await res.json().catch(() => ({}));
  if (data.type === 'success' || data.message === 'OTP verified success') {
    otpStore.delete(phone);
    return true;
  }
  return false;
}

function verifyOtp(phone, otp) {
  if (verifyLocalOtp(phone, otp)) return true;
  return false;
}

async function verifyOtpAsync(phone, otp) {
  if (verifyLocalOtp(phone, otp)) return true;
  const msg91Ok = await verifyMsg91Otp(phone, otp);
  return msg91Ok === true;
}

async function sendOtp(phone, otp) {
  if (phone.includes('@')) {
    const sent = await emailService.sendOtpEmail(phone, otp);
    if (sent) {
      return { channel: 'email' };
    } else {
      console.error(`[OTP] Email failed for ${phone}`);
      return { channel: 'demo-fallback', devHint: otp };
    }
  }

  if (isMsg91Live()) {
    const mobile = `91${phone}`;
    const res = await fetch('https://control.msg91.com/api/v5/otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authkey: config.msg91AuthKey,
      },
      body: JSON.stringify({
        template_id: config.msg91TemplateId,
        mobile,
        otp,
        otp_length: 4,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok && data.type !== 'success') {
      console.error('[OTP] MSG91 error:', data.message || res.statusText);
      console.log(`[OTP] Demo fallback for +91${phone}: ${otp}`);
      return { channel: 'demo-fallback', devHint: otp };
    }
    console.log(`[OTP] MSG91 sent to +91${phone}`);
    return { channel: 'sms' };
  }

  console.log(`[OTP] Demo OTP for ${phone.includes('@') ? '' : '+91'}${phone}: ${otp}`);
  return { channel: 'demo', devHint: otp };
}

async function createAndSendOtp(phone) {
  const otp = generateOtp(phone);
  storeOtp(phone, otp);
  const sendResult = await sendOtp(phone, otp);
  return sendResult;
}

module.exports = {
  createAndSendOtp,
  verifyOtp,
  verifyOtpAsync,
  isMsg91Live,
};
