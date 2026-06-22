const crypto = require('crypto');
const db = require('../db/index');
const bookingsRepo = require('./bookings');
const ledgerRepo = require('./ledger');

const isPg = db.driver === 'postgres';
const SPLIT_FUNDING_MS = 4 * 60 * 60 * 1000;

function now() {
  return isPg ? new Date() : Date.now();
}

function toMs(val) {
  if (val == null) return null;
  return isPg ? new Date(val).getTime() : val;
}

async function getUserDisplay(userId) {
  const owner = await db.getOne(
    isPg ? 'SELECT owner_name, business_name FROM turf_owners WHERE user_id = $1' : 'SELECT owner_name, business_name FROM turf_owners WHERE user_id = ?',
    [userId]
  );
  if (owner?.owner_name || owner?.business_name) {
    return {
      name: owner.owner_name || owner.business_name,
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${userId}`,
      skillLevel: 'Intermediate',
    };
  }
  const profile = await db.getOne(
    isPg
      ? `SELECT pp.full_name, pp.avatar_url, pp.sports_dna, u.phone
         FROM users u LEFT JOIN player_profiles pp ON pp.user_id = u.id WHERE u.id = $1`
      : `SELECT pp.full_name, pp.avatar_url, pp.sports_dna, u.phone
         FROM users u LEFT JOIN player_profiles pp ON pp.user_id = u.id WHERE u.id = ?`,
    [userId]
  );
  if (!profile) return { name: 'Player', avatar: '', skillLevel: 'Intermediate' };
  let sportsDna = profile.sports_dna;
  if (typeof sportsDna === 'string') {
    try { sportsDna = JSON.parse(sportsDna); } catch { sportsDna = []; }
  }
  const firstSport = Array.isArray(sportsDna) ? sportsDna[0] : null;
  return {
    name: profile.full_name || profile.phone || 'Player',
    avatar: profile.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}`,
    skillLevel: firstSport?.skill_level || firstSport?.skillLevel || 'Intermediate',
  };
}

async function getRosterNames(bookingId) {
  const rows = await db.getAll(
    isPg
      ? `SELECT br.user_id, pp.full_name, u.phone FROM booking_roster br
         JOIN users u ON u.id = br.user_id
         LEFT JOIN player_profiles pp ON pp.user_id = br.user_id
         WHERE br.booking_id = $1 ORDER BY br.joined_at ASC`
      : `SELECT br.user_id, pp.full_name, u.phone FROM booking_roster br
         JOIN users u ON u.id = br.user_id
         LEFT JOIN player_profiles pp ON pp.user_id = br.user_id
         WHERE br.booking_id = ? ORDER BY br.joined_at ASC`,
    [bookingId]
  );
  return rows.map((r) => r.full_name || r.phone || 'Player');
}

async function splitToAnnouncement(row, escrow, turf, hostDisplay, roster) {
  const playersNeeded = Math.max(0, Number(escrow.players_needed) - Math.max(0, roster.length - 1));
  const totalSpots = Number(escrow.players_needed) + 1;
  let status = 'open';
  if (row.status === 'CONFIRMED') status = 'filled';
  else if (row.status === 'CANCELLED_BY_HOST') status = 'canceled';
  else if (row.status === 'CANCELLED_BY_SYSTEM') status = 'failed';

  const meta = typeof turf.meta === 'string' ? JSON.parse(turf.meta || '{}') : (turf.meta || {});
  const sports = typeof turf.sports === 'string' ? JSON.parse(turf.sports || '[]') : (turf.sports || []);
  const slotParts = (row.slot_key || '').split(':');
  const slotId = slotParts[1] || '';
  const dateLabel = slotParts[2] || 'Today';

  return {
    id: `ann-${row.id}`,
    bookingId: row.id,
    hostId: row.host_id,
    hostName: hostDisplay.name,
    hostAvatar: hostDisplay.avatar,
    hostLevel: hostDisplay.skillLevel,
    sport: sports[0] || 'football',
    sportIcon: '⚽',
    sportLabel: `${totalSpots} Players Squad`,
    turfId: turf.legacy_id || turf.id,
    turfName: turf.name,
    time: `${row.date_label || dateLabel}, ${row.slot_time || 'TBD'}`,
    distance: '',
    costPerHead: Number(escrow.cost_per_head),
    playersNeeded,
    totalSpots,
    roster,
    status,
    slotId,
    fundingExpiresAt: toMs(escrow.expires_at),
    isPublic: Boolean(escrow.is_public),
    turfImage: meta.image || (typeof turf.images === 'string' ? JSON.parse(turf.images || '[]')[0] : turf.images?.[0]),
  };
}

async function getSplitBooking(bookingId) {
  return db.getOne(
    isPg
      ? `SELECT b.*, e.players_needed, e.cost_per_head, e.amount_collected, e.is_public, e.expires_at,
                e.slot_time, e.date_label, e.sport,
                t.legacy_id, t.name, t.sports, t.meta, t.images, t.location_lat, t.location_lng
         FROM bookings b
         JOIN split_escrow_details e ON e.booking_id = b.id
         JOIN turfs t ON t.id = b.turf_id
         WHERE b.id = $1 AND b.booking_type = 'SPLIT_PAY'`
      : `SELECT b.*, e.players_needed, e.cost_per_head, e.amount_collected, e.is_public, e.expires_at,
                e.slot_time, e.date_label, e.sport,
                t.legacy_id, t.name, t.sports, t.meta, t.images, t.location_lat, t.location_lng
         FROM bookings b
         JOIN split_escrow_details e ON e.booking_id = b.id
         JOIN turfs t ON t.id = b.turf_id
         WHERE b.id = ? AND b.booking_type = 'SPLIT_PAY'`,
    [bookingId]
  );
}

async function assertSlotAvailable(key) {
  const confirmed = await db.getOne(
    isPg
      ? `SELECT id FROM bookings WHERE slot_key = $1 AND status IN ('CONFIRMED', 'PENDING_FUNDING') LIMIT 1`
      : `SELECT id FROM bookings WHERE slot_key = ? AND status IN ('CONFIRMED', 'PENDING_FUNDING') LIMIT 1`,
    [key]
  );
  if (confirmed) {
    throw Object.assign(new Error('Slot already reserved'), { status: 409 });
  }
}

async function initiateSplit({
  turfLegacyId,
  slotId,
  dateLabel,
  slotTime,
  userId,
  totalAmount,
  hostAdvance,
  playersNeeded,
  isPublic = true,
  sport,
}) {
  const turf = await bookingsRepo.resolveTurf(turfLegacyId);
  if (!turf) throw Object.assign(new Error('Turf not found'), { status: 404 });

  const key = bookingsRepo.slotKey(turf.legacyId || turfLegacyId, slotId, dateLabel);
  await assertSlotAvailable(key);

  const lock = await db.getOne(
    isPg ? 'SELECT locked_by, expires_at FROM slot_locks WHERE slot_key = $1' : 'SELECT locked_by, expires_at FROM slot_locks WHERE slot_key = ?',
    [key]
  );
  if (lock) {
    const lockExpiryMs = toMs(lock.expires_at);
    if (lockExpiryMs <= Date.now()) {
      throw Object.assign(new Error('Slot lock expired — open checkout again'), { status: 409 });
    }
    if (lock.locked_by !== userId) {
      throw Object.assign(new Error('You do not hold the lock for this slot'), { status: 403 });
    }
  }

  const bookingId = crypto.randomUUID();
  const rosterId = crypto.randomUUID();
  const platformFee = Math.floor(Number(totalAmount) * 0.1);
  const expiresTs = Date.now() + SPLIT_FUNDING_MS;
  const expires = isPg ? new Date(expiresTs) : expiresTs;
  const ts = now();

  await db.run(
    isPg
      ? `INSERT INTO bookings (id, turf_id, host_id, booking_type, status, slot_key, total_cost, platform_fee, created_at)
         VALUES ($1, $2, $3, 'SPLIT_PAY', 'PENDING_FUNDING', $4, $5, $6, $7)`
      : `INSERT INTO bookings (id, turf_id, host_id, booking_type, status, slot_key, total_cost, platform_fee, created_at)
         VALUES (?, ?, ?, 'SPLIT_PAY', 'PENDING_FUNDING', ?, ?, ?, ?)`,
    isPg
      ? [bookingId, turf.id, userId, key, totalAmount, platformFee, ts]
      : [bookingId, turf.id, userId, key, totalAmount, platformFee, Date.now()]
  );

  await db.run(
    isPg
      ? `INSERT INTO split_escrow_details (booking_id, players_needed, cost_per_head, amount_collected, is_public, expires_at, slot_time, date_label, sport)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
      : `INSERT INTO split_escrow_details (booking_id, players_needed, cost_per_head, amount_collected, is_public, expires_at, slot_time, date_label, sport)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    isPg
      ? [bookingId, playersNeeded, hostAdvance, hostAdvance, isPublic, expires, slotTime || '', dateLabel, sport || '']
      : [bookingId, playersNeeded, hostAdvance, hostAdvance, isPublic ? 1 : 0, expiresTs, slotTime || '', dateLabel, sport || '']
  );

  await db.run(
    isPg
      ? `INSERT INTO booking_roster (id, booking_id, user_id, amount_paid, payment_status, is_host, joined_at)
         VALUES ($1, $2, $3, $4, 'HELD_IN_ESCROW', TRUE, $5)`
      : `INSERT INTO booking_roster (id, booking_id, user_id, amount_paid, payment_status, is_host, joined_at)
         VALUES (?, ?, ?, ?, 'HELD_IN_ESCROW', 1, ?)`,
    isPg
      ? [rosterId, bookingId, userId, hostAdvance, ts]
      : [rosterId, bookingId, userId, hostAdvance, Date.now()]
  );

  await db.run(
    isPg ? 'DELETE FROM slot_locks WHERE slot_key = $1' : 'DELETE FROM slot_locks WHERE slot_key = ?',
    [key]
  );

  const row = await getSplitBooking(bookingId);
  const hostDisplay = await getUserDisplay(userId);
  const roster = await getRosterNames(bookingId);
  const split = await splitToAnnouncement(row, row, row, hostDisplay, roster);

  return { bookingId, message: 'Split initialized', split };
}

async function joinSplit({ bookingId, userId, amount }) {
  const row = await getSplitBooking(bookingId);
  if (!row) throw Object.assign(new Error('Split not found'), { status: 404 });
  if (row.status !== 'PENDING_FUNDING') {
    throw Object.assign(new Error('Split is no longer active'), { status: 400 });
  }
  if (toMs(row.expires_at) <= Date.now()) {
    throw Object.assign(new Error('Split funding window expired'), { status: 400 });
  }

  const existing = await db.getOne(
    isPg ? 'SELECT id FROM booking_roster WHERE booking_id = $1 AND user_id = $2' : 'SELECT id FROM booking_roster WHERE booking_id = ? AND user_id = ?',
    [bookingId, userId]
  );
  if (existing) throw Object.assign(new Error('You already joined this split'), { status: 409 });

  const roster = await getRosterNames(bookingId);
  const spotsLeft = Math.max(0, Number(row.players_needed) - Math.max(0, roster.length - 1));
  if (spotsLeft <= 0) {
    throw Object.assign(new Error('Sorry, this game just filled up!'), { status: 409 });
  }

  const payAmount = amount != null ? Number(amount) : Number(row.cost_per_head);
  const newCollected = Number(row.amount_collected || 0) + payAmount;
  if (newCollected > Number(row.total_cost) + 1) {
    throw Object.assign(new Error('Payment exceeds split total'), { status: 409 });
  }

  const rosterId = crypto.randomUUID();
  const ts = now();
  const newRosterCount = roster.length + 1;
  const filled = newRosterCount >= Number(row.players_needed) + 1;
  const newStatus = filled ? 'CONFIRMED' : 'PENDING_FUNDING';
  const paymentStatus = filled ? 'SETTLED' : 'HELD_IN_ESCROW';

  await db.run(
    isPg
      ? `INSERT INTO booking_roster (id, booking_id, user_id, amount_paid, payment_status, is_host, joined_at)
         VALUES ($1, $2, $3, $4, $5, FALSE, $6)`
      : `INSERT INTO booking_roster (id, booking_id, user_id, amount_paid, payment_status, is_host, joined_at)
         VALUES (?, ?, ?, ?, ?, 0, ?)`,
    isPg
      ? [rosterId, bookingId, userId, payAmount, paymentStatus, ts]
      : [rosterId, bookingId, userId, payAmount, paymentStatus, Date.now()]
  );

  await db.run(
    isPg
      ? `UPDATE split_escrow_details SET amount_collected = $1 WHERE booking_id = $2`
      : `UPDATE split_escrow_details SET amount_collected = ? WHERE booking_id = ?`,
    [newCollected, bookingId]
  );

  await db.run(
    isPg ? 'UPDATE bookings SET status = $1 WHERE id = $2' : 'UPDATE bookings SET status = ? WHERE id = ?',
    [newStatus, bookingId]
  );

  if (filled) {
    await db.run(
      isPg
        ? `UPDATE booking_roster SET payment_status = 'SETTLED' WHERE booking_id = $1`
        : `UPDATE booking_roster SET payment_status = 'SETTLED' WHERE booking_id = ?`,
      [bookingId]
    );
    await ledgerRepo.recordSettlement(bookingId);
  }

  const updated = await getSplitBooking(bookingId);
  const hostDisplay = await getUserDisplay(updated.host_id);
  const newRoster = await getRosterNames(bookingId);
  const split = await splitToAnnouncement(updated, updated, updated, hostDisplay, newRoster);

  return {
    message: 'Successfully joined split',
    status: newStatus,
    filled,
    split,
  };
}

async function cancelSplit({ bookingId, userId }) {
  const paymentsRepo = require('./payments');
  const row = await getSplitBooking(bookingId);
  if (!row) throw Object.assign(new Error('Split not found'), { status: 404 });
  if (row.host_id !== userId) {
    throw Object.assign(new Error('Only the host can cancel this split'), { status: 403 });
  }
  if (!['PENDING_FUNDING', 'CONFIRMED'].includes(row.status)) {
    throw Object.assign(new Error('Split cannot be canceled'), { status: 400 });
  }

  await db.run(
    isPg ? `UPDATE bookings SET status = 'CANCELLED_BY_HOST' WHERE id = $1` : `UPDATE bookings SET status = 'CANCELLED_BY_HOST' WHERE id = ?`,
    [bookingId]
  );
  await db.run(
    isPg
      ? `UPDATE booking_roster SET payment_status = 'REFUNDED' WHERE booking_id = $1`
      : `UPDATE booking_roster SET payment_status = 'REFUNDED' WHERE booking_id = ?`,
    [bookingId]
  );

  const refundResult = await paymentsRepo.refundBookingPayments(bookingId);

  const hostDisplay = await getUserDisplay(row.host_id);
  const roster = await getRosterNames(bookingId);
  const split = await splitToAnnouncement(
    { ...row, status: 'CANCELLED_BY_HOST' },
    row,
    row,
    hostDisplay,
    roster
  );

  return { message: 'Split canceled — refunds issued', split, refunds: refundResult };
}

async function listOpenSplits() {
  const rows = await db.getAll(
    isPg
      ? `SELECT b.*, e.players_needed, e.cost_per_head, e.amount_collected, e.is_public, e.expires_at,
                e.slot_time, e.date_label, e.sport,
                t.legacy_id, t.name, t.sports, t.meta, t.images
         FROM bookings b
         JOIN split_escrow_details e ON e.booking_id = b.id
         JOIN turfs t ON t.id = b.turf_id
         WHERE b.booking_type = 'SPLIT_PAY' AND b.status = 'PENDING_FUNDING' AND e.expires_at > $1
         ORDER BY e.expires_at ASC`
      : `SELECT b.*, e.players_needed, e.cost_per_head, e.amount_collected, e.is_public, e.expires_at,
                e.slot_time, e.date_label, e.sport,
                t.legacy_id, t.name, t.sports, t.meta, t.images
         FROM bookings b
         JOIN split_escrow_details e ON e.booking_id = b.id
         JOIN turfs t ON t.id = b.turf_id
         WHERE b.booking_type = 'SPLIT_PAY' AND b.status = 'PENDING_FUNDING' AND e.expires_at > ?
         ORDER BY e.expires_at ASC`,
    [now()]
  );

  const splits = [];
  for (const row of rows) {
    const hostDisplay = await getUserDisplay(row.host_id);
    const roster = await getRosterNames(row.id);
    splits.push(await splitToAnnouncement(row, row, row, hostDisplay, roster));
  }
  return splits;
}

async function cleanupExpiredSplits() {
  const paymentsRepo = require('./payments');
  const expired = await db.getAll(
    isPg
      ? `SELECT b.id FROM bookings b
         JOIN split_escrow_details e ON e.booking_id = b.id
         WHERE b.status = 'PENDING_FUNDING' AND e.expires_at < $1`
      : `SELECT b.id FROM bookings b
         JOIN split_escrow_details e ON e.booking_id = b.id
         WHERE b.status = 'PENDING_FUNDING' AND e.expires_at < ?`,
    [now()]
  );

  for (const { id } of expired) {
    await db.run(
      isPg ? `UPDATE bookings SET status = 'CANCELLED_BY_SYSTEM' WHERE id = $1` : `UPDATE bookings SET status = 'CANCELLED_BY_SYSTEM' WHERE id = ?`,
      [id]
    );
    await db.run(
      isPg
        ? `UPDATE booking_roster SET payment_status = 'REFUNDED' WHERE booking_id = $1`
        : `UPDATE booking_roster SET payment_status = 'REFUNDED' WHERE booking_id = ?`,
      [id]
    );
    await paymentsRepo.refundBookingPayments(id);
  }
  return expired.length;
}

module.exports = {
  initiateSplit,
  joinSplit,
  cancelSplit,
  listOpenSplits,
  getSplitBooking,
  cleanupExpiredSplits,
  splitToAnnouncement,
};
