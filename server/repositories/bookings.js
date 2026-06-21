const crypto = require('crypto');
const db = require('../db/index');
const config = require('../lib/config');

const isPg = db.driver === 'postgres';
const LOCK_TTL_MS = 5 * 60 * 1000;

function slotKey(turfLegacyId, slotId, dateLabel = 'Today') {
  return `${turfLegacyId}:${slotId}:${dateLabel}`;
}

function now() {
  return isPg ? new Date() : Date.now();
}

function expiresAtFromNow() {
  const ts = Date.now() + LOCK_TTL_MS;
  return isPg ? new Date(ts) : ts;
}

async function resolveTurf(legacyOrUuid) {
  const row = await db.getOne(
    isPg
      ? `SELECT id, legacy_id FROM turfs WHERE legacy_id = $1 OR id::text = $1 LIMIT 1`
      : `SELECT id, legacy_id FROM turfs WHERE legacy_id = ? OR id = ? LIMIT 1`,
    [legacyOrUuid, legacyOrUuid]
  );
  if (!row) return null;
  return { id: row.id, legacyId: row.legacy_id || legacyOrUuid };
}

async function cleanupExpiredLocks() {
  const ts = now();
  await db.run(
    isPg ? 'DELETE FROM slot_locks WHERE expires_at < $1' : 'DELETE FROM slot_locks WHERE expires_at < ?',
    [ts]
  );
}

async function getConfirmedBooking(key) {
  return db.getOne(
    isPg
      ? `SELECT id FROM bookings WHERE slot_key = $1 AND status = 'CONFIRMED' LIMIT 1`
      : `SELECT id FROM bookings WHERE slot_key = ? AND status = 'CONFIRMED' LIMIT 1`,
    [key]
  );
}

async function lockSlot({ turfLegacyId, slotId, dateLabel, userId }) {
  await cleanupExpiredLocks();

  const turf = await resolveTurf(turfLegacyId);
  if (!turf) throw Object.assign(new Error('Turf not found'), { status: 404 });

  const key = slotKey(turf.legacyId, slotId, dateLabel);

  const booked = await getConfirmedBooking(key);
  if (booked) {
    throw Object.assign(new Error('Slot already booked'), { status: 409 });
  }

  const existingLock = await db.getOne(
    isPg
      ? `SELECT id, locked_by, expires_at FROM slot_locks WHERE slot_key = $1`
      : `SELECT id, locked_by, expires_at FROM slot_locks WHERE slot_key = ?`,
    [key]
  );

  const expiry = expiresAtFromNow();
  const expiryMs = isPg ? expiry.getTime() : expiry;

  if (existingLock) {
    const lockExpiryMs = isPg ? new Date(existingLock.expires_at).getTime() : existingLock.expires_at;
    if (lockExpiryMs > Date.now() && existingLock.locked_by !== userId) {
      throw Object.assign(new Error('Slot temporarily locked by another user'), { status: 409 });
    }
    await db.run(
      isPg
        ? `UPDATE slot_locks SET locked_by = $1, expires_at = $2, turf_id = $3 WHERE slot_key = $4`
        : `UPDATE slot_locks SET locked_by = ?, expires_at = ?, turf_id = ? WHERE slot_key = ?`,
      isPg
        ? [userId, expiry, turf.id, key]
        : [userId, expiryMs, turf.id, key]
    );
  } else {
    const lockId = crypto.randomUUID();
    await db.run(
      isPg
        ? `INSERT INTO slot_locks (id, turf_id, slot_key, locked_by, expires_at, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)`
        : `INSERT INTO slot_locks (id, turf_id, slot_key, locked_by, expires_at, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
      isPg
        ? [lockId, turf.id, key, userId, expiry, now()]
        : [lockId, turf.id, key, userId, expiryMs, Date.now()]
    );
  }

  return {
    slotKey: key,
    lockedUntil: expiryMs,
    message: 'Slot locked for 5 minutes',
  };
}

async function checkoutPrivate({
  turfLegacyId,
  slotId,
  dateLabel,
  slotTime,
  userId,
  amount,
}) {
  await cleanupExpiredLocks();

  const turf = await resolveTurf(turfLegacyId);
  if (!turf) throw Object.assign(new Error('Turf not found'), { status: 404 });

  const key = slotKey(turf.legacyId, slotId, dateLabel);

  const booked = await getConfirmedBooking(key);
  if (booked) {
    throw Object.assign(new Error('Slot already booked'), { status: 409 });
  }

  const lock = await db.getOne(
    isPg
      ? `SELECT locked_by, expires_at FROM slot_locks WHERE slot_key = $1`
      : `SELECT locked_by, expires_at FROM slot_locks WHERE slot_key = ?`,
    [key]
  );

  if (lock) {
    const lockExpiryMs = isPg ? new Date(lock.expires_at).getTime() : lock.expires_at;
    if (lockExpiryMs <= Date.now()) {
      throw Object.assign(new Error('Slot lock expired — open checkout again'), { status: 409 });
    }
    if (lock.locked_by !== userId) {
      throw Object.assign(new Error('You do not hold the lock for this slot'), { status: 403 });
    }
  }

  const bookingId = crypto.randomUUID();
  const platformFee = Math.floor(Number(amount) * 0.1);
  const ts = now();

  await db.run(
    isPg
      ? `INSERT INTO bookings
          (id, turf_id, host_id, booking_type, status, slot_key, total_cost, platform_fee, created_at)
         VALUES ($1, $2, $3, 'PRIVATE_FULL', 'CONFIRMED', $4, $5, $6, $7)`
      : `INSERT INTO bookings
          (id, turf_id, host_id, booking_type, status, slot_key, total_cost, platform_fee, created_at)
         VALUES (?, ?, ?, 'PRIVATE_FULL', 'CONFIRMED', ?, ?, ?, ?)`,
    isPg
      ? [bookingId, turf.id, userId, key, amount, platformFee, ts]
      : [bookingId, turf.id, userId, key, amount, platformFee, Date.now()]
  );

  const rosterId = crypto.randomUUID();
  await db.run(
    isPg
      ? `INSERT INTO booking_roster (id, booking_id, user_id, amount_paid, payment_status, is_host, joined_at)
         VALUES ($1, $2, $3, $4, 'SETTLED', TRUE, $5)`
      : `INSERT INTO booking_roster (id, booking_id, user_id, amount_paid, payment_status, is_host, joined_at)
         VALUES (?, ?, ?, ?, 'SETTLED', 1, ?)`,
    isPg
      ? [rosterId, bookingId, userId, amount, ts]
      : [rosterId, bookingId, userId, amount, Date.now()]
  );

  await db.run(
    isPg ? 'DELETE FROM slot_locks WHERE slot_key = $1' : 'DELETE FROM slot_locks WHERE slot_key = ?',
    [key]
  );

  return {
    bookingId,
    slotKey: key,
    slotTime,
    dateLabel,
    status: 'CONFIRMED',
    message: 'Booking confirmed',
  };
}

async function getSlotAvailability(turfLegacyId, dateLabel = 'Today') {
  await cleanupExpiredLocks();
  const turf = await resolveTurf(turfLegacyId);
  if (!turf) return { booked: [], locked: [] };

  const pattern = `${turf.legacyId}:%:${dateLabel}`;

  const booked = await db.getAll(
    isPg
      ? `SELECT slot_key FROM bookings WHERE turf_id = $1 AND status = 'CONFIRMED' AND slot_key LIKE $2`
      : `SELECT slot_key FROM bookings WHERE turf_id = ? AND status = 'CONFIRMED' AND slot_key LIKE ?`,
    [turf.id, pattern]
  );

  const locked = await db.getAll(
    isPg
      ? `SELECT slot_key, locked_by, expires_at FROM slot_locks WHERE turf_id = $1 AND slot_key LIKE $2 AND expires_at > $3`
      : `SELECT slot_key, locked_by, expires_at FROM slot_locks WHERE turf_id = ? AND slot_key LIKE ? AND expires_at > ?`,
    isPg ? [turf.id, pattern, now()] : [turf.id, pattern, Date.now()]
  );

  return {
    booked: booked.map((r) => r.slot_key),
    locked: locked.map((r) => ({
      slotKey: r.slot_key,
      lockedBy: r.locked_by,
      expiresAt: isPg ? new Date(r.expires_at).getTime() : r.expires_at,
    })),
  };
}

async function listUserBookings(userId) {
  const rows = await db.getAll(
    isPg
      ? `SELECT b.*, t.legacy_id AS turf_legacy_id, t.name AS turf_name
         FROM bookings b
         JOIN turfs t ON t.id = b.turf_id
         WHERE b.host_id = $1
         ORDER BY b.created_at DESC
         LIMIT 50`
      : `SELECT b.*, t.legacy_id AS turf_legacy_id, t.name AS turf_name
         FROM bookings b
         JOIN turfs t ON t.id = b.turf_id
         WHERE b.host_id = ?
         ORDER BY b.created_at DESC
         LIMIT 50`,
    [userId]
  );
  return rows;
}

module.exports = {
  slotKey,
  lockSlot,
  checkoutPrivate,
  getSlotAvailability,
  listUserBookings,
  cleanupExpiredLocks,
  LOCK_TTL_MS,
};
