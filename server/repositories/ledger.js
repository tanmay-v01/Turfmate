const crypto = require('crypto');
const db = require('../db/index');
const { calcCommission } = require('../utils/commission');

const isPg = db.driver === 'postgres';

function now() {
  return isPg ? new Date() : Date.now();
}

async function getBookingWithTurf(bookingId) {
  return db.getOne(
    isPg
      ? `SELECT b.*, t.owner_user_id, t.legacy_id AS turf_legacy_id, t.name AS turf_name
         FROM bookings b JOIN turfs t ON t.id = b.turf_id WHERE b.id = $1`
      : `SELECT b.*, t.owner_user_id, t.legacy_id AS turf_legacy_id, t.name AS turf_name
         FROM bookings b JOIN turfs t ON t.id = b.turf_id WHERE b.id = ?`,
    [bookingId]
  );
}

async function sumCollected(bookingId) {
  const row = await db.getOne(
    isPg
      ? `SELECT COALESCE(SUM(amount_paid), 0) AS total FROM booking_roster
         WHERE booking_id = $1 AND payment_status IN ('SETTLED', 'HELD_IN_ESCROW')`
      : `SELECT COALESCE(SUM(amount_paid), 0) AS total FROM booking_roster
         WHERE booking_id = ? AND payment_status IN ('SETTLED', 'HELD_IN_ESCROW')`,
    [bookingId]
  );
  return Number(row?.total || 0);
}

async function recordSettlement(bookingId) {
  const existing = await db.getOne(
    isPg
      ? `SELECT id FROM payout_ledger WHERE booking_id = $1 AND entry_type = 'BOOKING_SETTLED' AND status != 'REVERSED'`
      : `SELECT id FROM payout_ledger WHERE booking_id = ? AND entry_type = 'BOOKING_SETTLED' AND status != 'REVERSED'`,
    [bookingId]
  );
  if (existing) return existing;

  const booking = await getBookingWithTurf(bookingId);
  if (!booking?.owner_user_id) return null;

  const gross = booking.platform_fee != null && booking.booking_type === 'PRIVATE_FULL'
    ? Number(booking.total_cost)
    : await sumCollected(bookingId);

  if (gross <= 0) return null;

  const commission = booking.platform_fee != null && Number(booking.platform_fee) > 0
    ? Number(booking.platform_fee)
    : calcCommission(gross);
  const net = gross - commission;
  const id = crypto.randomUUID();
  const ts = now();

  await db.run(
    isPg
      ? `INSERT INTO payout_ledger
          (id, booking_id, turf_id, owner_user_id, entry_type, gross_inr, commission_inr, net_inr, status, created_at, updated_at)
         VALUES ($1,$2,$3,$4,'BOOKING_SETTLED',$5,$6,$7,'PENDING_SETTLEMENT',$8,$8)`
      : `INSERT INTO payout_ledger
          (id, booking_id, turf_id, owner_user_id, entry_type, gross_inr, commission_inr, net_inr, status, created_at, updated_at)
         VALUES (?,?,?,?,'BOOKING_SETTLED',?,?,?,'PENDING_SETTLEMENT',?,?)`,
    isPg
      ? [id, bookingId, booking.turf_id, booking.owner_user_id, gross, commission, net, ts]
      : [id, bookingId, booking.turf_id, booking.owner_user_id, gross, commission, net, Date.now(), Date.now()]
  );

  return { id, gross, commission, net };
}

async function reverseSettlement(bookingId) {
  const ts = now();
  await db.run(
    isPg
      ? `UPDATE payout_ledger SET status = 'REVERSED', updated_at = $1
         WHERE booking_id = $2 AND entry_type = 'BOOKING_SETTLED' AND status != 'REVERSED'`
      : `UPDATE payout_ledger SET status = 'REVERSED', updated_at = ?
         WHERE booking_id = ? AND entry_type = 'BOOKING_SETTLED' AND status != 'REVERSED'`,
    isPg ? [ts, bookingId] : [Date.now(), bookingId]
  );
}

async function getOwnerRevenue(ownerUserId) {
  const rows = await db.getAll(
    isPg
      ? `SELECT l.*, t.name AS turf_name, t.legacy_id AS turf_legacy_id, b.booking_type, b.status AS booking_status
         FROM payout_ledger l
         LEFT JOIN turfs t ON t.id = l.turf_id
         LEFT JOIN bookings b ON b.id = l.booking_id
         WHERE l.owner_user_id = $1
         ORDER BY l.created_at DESC`
      : `SELECT l.*, t.name AS turf_name, t.legacy_id AS turf_legacy_id, b.booking_type, b.status AS booking_status
         FROM payout_ledger l
         LEFT JOIN turfs t ON t.id = l.turf_id
         LEFT JOIN bookings b ON b.id = l.booking_id
         WHERE l.owner_user_id = ?
         ORDER BY l.created_at DESC`,
    [ownerUserId]
  );

  const active = rows.filter((r) => r.status !== 'REVERSED');
  const gross = active.reduce((s, r) => s + Number(r.gross_inr), 0);
  const commission = active.reduce((s, r) => s + Number(r.commission_inr), 0);
  const net = active.reduce((s, r) => s + Number(r.net_inr), 0);
  const pendingSettlement = active
    .filter((r) => r.status === 'PENDING_SETTLEMENT')
    .reduce((s, r) => s + Number(r.net_inr), 0);

  return {
    summary: {
      gross,
      commission,
      net,
      pendingSettlement,
      entryCount: active.length,
    },
    entries: rows.map((r) => ({
      id: r.id,
      bookingId: r.booking_id,
      turfId: r.turf_legacy_id,
      turfName: r.turf_name,
      entryType: r.entry_type,
      gross: Number(r.gross_inr),
      commission: Number(r.commission_inr),
      net: Number(r.net_inr),
      status: r.status,
      bookingType: r.booking_type,
      bookingStatus: r.booking_status,
      createdAt: r.created_at,
    })),
  };
}

async function getPlatformSummary() {
  const rows = await db.getAll(
    isPg
      ? `SELECT gross_inr, commission_inr, net_inr, status FROM payout_ledger WHERE status != 'REVERSED'`
      : `SELECT gross_inr, commission_inr, net_inr, status FROM payout_ledger WHERE status != 'REVERSED'`
  );

  const gross = rows.reduce((s, r) => s + Number(r.gross_inr), 0);
  const totalCommission = rows.reduce((s, r) => s + Number(r.commission_inr), 0);
  const ownerPayouts = rows.reduce((s, r) => s + Number(r.net_inr), 0);

  const paidOrders = await db.getOne(
    isPg
      ? `SELECT COUNT(*) AS count, COALESCE(SUM(amount_paise), 0) AS paise FROM payment_orders WHERE status = 'PAID'`
      : `SELECT COUNT(*) AS count, COALESCE(SUM(amount_paise), 0) AS paise FROM payment_orders WHERE status = 'PAID'`
  );

  const refundedOrders = await db.getOne(
    isPg
      ? `SELECT COUNT(*) AS count FROM payment_orders WHERE status = 'REFUNDED'`
      : `SELECT COUNT(*) AS count FROM payment_orders WHERE status = 'REFUNDED'`
  );

  return {
    ledgerGross: gross,
    ledgerCommission: totalCommission,
    ledgerOwnerPayouts: ownerPayouts,
    settledBookings: rows.length,
    paymentsCaptured: Number(paidOrders?.count || 0),
    paymentsVolumeInr: Math.floor(Number(paidOrders?.paise || 0) / 100),
    refundsIssued: Number(refundedOrders?.count || 0),
  };
}

module.exports = {
  recordSettlement,
  reverseSettlement,
  getOwnerRevenue,
  getPlatformSummary,
};
