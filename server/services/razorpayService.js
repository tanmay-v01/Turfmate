const crypto = require('crypto');
const config = require('../lib/config');

function isLive() {
  return Boolean(config.razorpayKeyId && config.razorpayKeySecret);
}

async function createRazorpayOrder({ amountPaise, receipt, notes = {} }) {
  if (!isLive()) {
    return {
      id: `demo_order_${Date.now()}`,
      amount: amountPaise,
      currency: 'INR',
      demo: true,
    };
  }

  const auth = Buffer.from(`${config.razorpayKeyId}:${config.razorpayKeySecret}`).toString('base64');
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      notes,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(data.error?.description || 'Razorpay order failed'), { status: 502 });
  }
  return { ...data, demo: false };
}

function verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  if (!isLive()) return true;
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto
    .createHmac('sha256', config.razorpayKeySecret)
    .update(body)
    .digest('hex');
  return expected === razorpaySignature;
}

function verifyWebhookSignature(rawBody, signature) {
  if (!config.razorpayWebhookSecret) return false;
  const expected = crypto
    .createHmac('sha256', config.razorpayWebhookSecret)
    .update(rawBody)
    .digest('hex');
  return expected === signature;
}

async function createRefund(paymentId, amountPaise) {
  if (!isLive()) {
    return { id: `demo_refund_${Date.now()}`, payment_id: paymentId, demo: true };
  }

  const auth = Buffer.from(`${config.razorpayKeyId}:${config.razorpayKeySecret}`).toString('base64');
  const body = amountPaise ? { amount: amountPaise } : {};
  const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(data.error?.description || 'Razorpay refund failed'), { status: 502 });
  }
  return data;
}

module.exports = {
  isLive,
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  createRefund,
};
