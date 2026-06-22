const crypto = require('crypto');
const db = require('../db/index');
const razorpay = require('../services/razorpayService');
const bookingsRepo = require('./bookings');
const splitsRepo = require('./splits');
const config = require('../lib/config');

const isPg = db.driver === 'postgres';

function now() {
  return isPg ? new Date() : Date.now();
}

function parsePayload(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function getOrderById(orderId) {
  return db.getOne(
    isPg ? 'SELECT * FROM payment_orders WHERE id = $1' : 'SELECT * FROM payment_orders WHERE id = ?',
    [orderId]
  );
}

async function createOrder({ userId, purpose, amountPaise, payload = {} }) {
  const orderId = crypto.randomUUID();
  const ts = now();
  const receipt = `tm_${purpose.toLowerCase()}_${Date.now()}`;

  const rzOrder = await razorpay.createRazorpayOrder({
    amountPaise,
    receipt,
    notes: { purpose, userId },
  });

  const payloadJson = isPg ? payload : JSON.stringify(payload);
  await db.run(
    isPg
      ? `INSERT INTO payment_orders
          (id, razorpay_order_id, user_id, purpose, amount_paise, currency, status, payload, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,'INR','CREATED',$6::jsonb,$7,$7)`
      : `INSERT INTO payment_orders
          (id, razorpay_order_id, user_id, purpose, amount_paise, currency, status, payload, created_at, updated_at)
         VALUES (?,?,?,?,?,'INR','CREATED',?,?,?)`,
    isPg
      ? [orderId, rzOrder.id, userId, purpose, amountPaise, payloadJson, ts]
      : [orderId, rzOrder.id, userId, purpose, amountPaise, payloadJson, Date.now(), Date.now()]
  );

  return {
    orderId,
    razorpayOrderId: rzOrder.id,
    amountPaise,
    currency: 'INR',
    demo: rzOrder.demo || config.demoMode,
    keyId: razorpay.isLive() ? config.razorpayKeyId : '',
  };
}

async function fulfillOrder(order, userId) {
  const payload = parsePayload(order.payload);
  let result;

  if (order.purpose === 'BOOKING_PRIVATE') {
    result = await bookingsRepo.checkoutPrivate({
      turfLegacyId: payload.turfId,
      slotId: payload.slotId,
      dateLabel: payload.date || 'Today',
      slotTime: payload.slotTime,
      userId,
      amount: Number(payload.amount),
    });
  } else if (order.purpose === 'SPLIT_HOST') {
    result = await splitsRepo.initiateSplit({
      turfLegacyId: payload.turfId,
      slotId: payload.slotId,
      dateLabel: payload.date || 'Today',
      slotTime: payload.slotTime,
      userId,
      totalAmount: Number(payload.totalAmount),
      hostAdvance: Number(payload.hostAdvance),
      playersNeeded: Number(payload.playersNeeded),
      isPublic: payload.isPublic !== false,
      sport: payload.sport,
    });
  } else if (order.purpose === 'SPLIT_JOIN') {
    result = await splitsRepo.joinSplit({
      bookingId: payload.bookingId,
      userId,
      amount: Number(payload.amount),
    });
  } else {
    throw Object.assign(new Error('Unknown payment purpose'), { status: 400 });
  }

  const bookingId = result.bookingId || result.booking?.id || payload.bookingId;
  const ts = now();
  await db.run(
    isPg
      ? `UPDATE payment_orders SET status = 'PAID', booking_id = $1, updated_at = $2 WHERE id = $3`
      : `UPDATE payment_orders SET status = 'PAID', booking_id = ?, updated_at = ? WHERE id = ?`,
    isPg ? [bookingId, ts, order.id] : [bookingId, Date.now(), order.id]
  );

  return { ...result, bookingId, orderId: order.id };
}

async function verifyAndFulfill({
  orderId,
  userId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  demo = false,
}) {
  const order = await getOrderById(orderId);
  if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });
  if (order.user_id !== userId) throw Object.assign(new Error('Forbidden'), { status: 403 });
  if (order.status === 'PAID') {
    return { alreadyPaid: true, bookingId: order.booking_id, orderId: order.id };
  }

  const rzOrderId = razorpayOrderId || order.razorpay_order_id;
  const isDemoPayment = demo || rzOrderId.startsWith('demo_order_') || (!razorpay.isLive() && config.demoMode);

  if (!isDemoPayment) {
    if (!razorpayPaymentId || !razorpaySignature) {
      throw Object.assign(new Error('Payment verification fields required'), { status: 400 });
    }
    const valid = razorpay.verifyPaymentSignature({
      razorpayOrderId: rzOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });
    if (!valid) throw Object.assign(new Error('Invalid payment signature'), { status: 400 });

    const ts = now();
    await db.run(
      isPg
        ? `UPDATE payment_orders SET razorpay_payment_id = $1, updated_at = $2 WHERE id = $3`
        : `UPDATE payment_orders SET razorpay_payment_id = ?, updated_at = ? WHERE id = ?`,
      isPg ? [razorpayPaymentId, ts, order.id] : [razorpayPaymentId, Date.now(), order.id]
    );
  }

  return fulfillOrder(order, userId);
}

async function handleWebhookEvent(event) {
  const entity = event?.payload?.payment?.entity;
  if (!entity?.order_id) return { handled: false };

  const order = await db.getOne(
    isPg
      ? 'SELECT * FROM payment_orders WHERE razorpay_order_id = $1'
      : 'SELECT * FROM payment_orders WHERE razorpay_order_id = ?',
    [entity.order_id]
  );
  if (!order || order.status === 'PAID') return { handled: true, duplicate: true };

  if (event.event === 'payment.captured' && entity.status === 'captured') {
    const ts = now();
    await db.run(
      isPg
        ? `UPDATE payment_orders SET razorpay_payment_id = $1, updated_at = $2 WHERE id = $3`
        : `UPDATE payment_orders SET razorpay_payment_id = ?, updated_at = ? WHERE id = ?`,
      isPg ? [entity.id, ts, order.id] : [entity.id, Date.now(), order.id]
    );
    const result = await fulfillOrder(order, order.user_id);
    return { handled: true, result };
  }

  if (event.event === 'payment.failed') {
    await db.run(
      isPg
        ? `UPDATE payment_orders SET status = 'FAILED', updated_at = $1 WHERE id = $2`
        : `UPDATE payment_orders SET status = 'FAILED', updated_at = ? WHERE id = ?`,
      isPg ? [now(), order.id] : [Date.now(), order.id]
    );
    return { handled: true, failed: true };
  }

  return { handled: false };
}

module.exports = {
  createOrder,
  verifyAndFulfill,
  handleWebhookEvent,
  getOrderById,
};
