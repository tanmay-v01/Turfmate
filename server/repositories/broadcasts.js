const crypto = require('crypto');
const db = require('../db/index');

const isPg = db.driver === 'postgres';

function now() {
  return isPg ? new Date() : Date.now();
}

function toMs(val) {
  if (val == null) return null;
  return isPg ? new Date(val).getTime() : val;
}

function parseMeta(val) {
  if (!val) return {};
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return {}; }
}

function hoursUntilExpiry(expiresAt) {
  const ms = Math.max(0, toMs(expiresAt) - Date.now());
  const hrs = Math.ceil(ms / (60 * 60 * 1000));
  return hrs <= 1 ? '1 hr' : `${hrs} hrs`;
}

function broadcastToAnnouncement(row, turf) {
  const meta = turf ? parseMeta(turf.meta) : {};
  const images = typeof turf?.images === 'string' ? JSON.parse(turf.images || '[]') : (turf?.images || []);
  const category = row.category || 'PROMO';
  const sportIcons = { football: '⚽', cricket: '🏏', badminton: '🏸', pickleball: '🏓' };

  return {
    id: `broadcast-${row.id}`,
    broadcastId: row.id,
    hostId: row.owner_user_id,
    hostName: turf?.name || 'Verified Venue',
    hostAvatar: meta.image || images[0] || '',
    hostLevel: 'Official Partner',
    sport: row.sport || 'football',
    sportIcon: sportIcons[row.sport] || '🏆',
    sportLabel: category === 'PROMO' ? 'Discount Offer' : category === 'EVENT' ? 'Tournament' : 'Announcement',
    turfId: row.turf_legacy_id || turf?.legacy_id,
    turfName: turf?.name || 'Venue',
    time: `Expires in ${hoursUntilExpiry(row.expires_at)}`,
    distance: '0.8 km',
    costPerHead: 0,
    playersNeeded: 0,
    totalSpots: 0,
    roster: [],
    status: 'open',
    isAdminAnnouncement: true,
    contentType: category,
    isPromo: category === 'PROMO',
    category,
    headline: row.headline,
    text: `${row.headline} — ${row.body_text}${row.promo_code ? `\nCode: ${row.promo_code}` : ''}`,
    promoCode: row.promo_code,
    ctaText: row.cta_text || 'Book Now',
    expiresAt: toMs(row.expires_at),
    turfImage: meta.image || images[0],
    source: 'broadcast',
  };
}

async function resolveTurf(turfLegacyId, ownerUserId) {
  const row = await db.getOne(
    isPg
      ? `SELECT * FROM turfs WHERE (legacy_id = $1 OR id::text = $1) AND owner_user_id = $2 LIMIT 1`
      : `SELECT * FROM turfs WHERE (legacy_id = ? OR id = ?) AND owner_user_id = ? LIMIT 1`,
    isPg ? [turfLegacyId, ownerUserId] : [turfLegacyId, turfLegacyId, ownerUserId]
  );
  return row;
}

async function assertOwnerTurf(ownerUserId, turfLegacyId) {
  const turf = await resolveTurf(turfLegacyId, ownerUserId);
  if (!turf) {
    throw Object.assign(new Error('Turf not found or not owned by you'), { status: 403 });
  }
  return turf;
}

async function createBroadcast({
  ownerUserId,
  turfLegacyId,
  category,
  headline,
  bodyText,
  promoCode,
  ctaText,
  sport,
  expirationHours,
}) {
  const turf = await assertOwnerTurf(ownerUserId, turfLegacyId);
  const hours = Math.min(168, Math.max(1, Number(expirationHours) || 6));
  const expiresTs = Date.now() + hours * 60 * 60 * 1000;
  const expires = isPg ? new Date(expiresTs) : expiresTs;
  const id = crypto.randomUUID();
  const ts = now();

  await db.run(
    isPg
      ? `INSERT INTO owner_broadcasts
          (id, owner_user_id, turf_id, turf_legacy_id, category, headline, body_text, promo_code, cta_text, sport, expires_at, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'ACTIVE', $12)`
      : `INSERT INTO owner_broadcasts
          (id, owner_user_id, turf_id, turf_legacy_id, category, headline, body_text, promo_code, cta_text, sport, expires_at, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)`,
    isPg
      ? [id, ownerUserId, turf.id, turf.legacy_id || turfLegacyId, category, headline, bodyText, promoCode || null, ctaText || 'Book Now', sport || 'football', expires, ts]
      : [id, ownerUserId, turf.id, turf.legacy_id || turfLegacyId, category, headline, bodyText, promoCode || null, ctaText || 'Book Now', sport || 'football', expiresTs, Date.now()]
  );

  const row = await db.getOne(
    isPg ? 'SELECT * FROM owner_broadcasts WHERE id = $1' : 'SELECT * FROM owner_broadcasts WHERE id = ?',
    [id]
  );
  return broadcastToAnnouncement(row, turf);
}

async function listActiveBroadcasts() {
  await cleanupExpired();
  const ts = now();
  const rows = await db.getAll(
    isPg
      ? `SELECT b.*, t.name, t.legacy_id, t.meta, t.images
         FROM owner_broadcasts b
         LEFT JOIN turfs t ON t.id = b.turf_id
         WHERE b.status = 'ACTIVE' AND b.expires_at > $1
         ORDER BY b.created_at DESC LIMIT 50`
      : `SELECT b.*, t.name, t.legacy_id, t.meta, t.images
         FROM owner_broadcasts b
         LEFT JOIN turfs t ON t.id = b.turf_id
         WHERE b.status = 'ACTIVE' AND b.expires_at > ?
         ORDER BY b.created_at DESC LIMIT 50`,
    [ts]
  );

  return rows.map((row) => broadcastToAnnouncement(row, {
    name: row.name,
    legacy_id: row.legacy_id || row.turf_legacy_id,
    meta: row.meta,
    images: row.images,
  }));
}

async function listOwnerBroadcasts(ownerUserId) {
  await cleanupExpired();
  const rows = await db.getAll(
    isPg
      ? `SELECT b.*, t.name, t.legacy_id, t.meta, t.images
         FROM owner_broadcasts b
         LEFT JOIN turfs t ON t.id = b.turf_id
         WHERE b.owner_user_id = $1
         ORDER BY b.created_at DESC LIMIT 20`
      : `SELECT b.*, t.name, t.legacy_id, t.meta, t.images
         FROM owner_broadcasts b
         LEFT JOIN turfs t ON t.id = b.turf_id
         WHERE b.owner_user_id = ?
         ORDER BY b.created_at DESC LIMIT 20`,
    [ownerUserId]
  );

  return rows.map((row) => ({
    ...broadcastToAnnouncement(row, {
      name: row.name,
      legacy_id: row.legacy_id || row.turf_legacy_id,
      meta: row.meta,
      images: row.images,
    }),
    broadcastStatus: row.status,
    isExpired: row.status !== 'ACTIVE' || toMs(row.expires_at) <= Date.now(),
  }));
}

async function deactivateBroadcast(broadcastId, ownerUserId) {
  const row = await db.getOne(
    isPg
      ? 'SELECT * FROM owner_broadcasts WHERE id = $1'
      : 'SELECT * FROM owner_broadcasts WHERE id = ?',
    [broadcastId]
  );
  if (!row) throw Object.assign(new Error('Broadcast not found'), { status: 404 });
  if (row.owner_user_id !== ownerUserId) {
    throw Object.assign(new Error('Not authorized'), { status: 403 });
  }

  await db.run(
    isPg
      ? `UPDATE owner_broadcasts SET status = 'DEACTIVATED' WHERE id = $1`
      : `UPDATE owner_broadcasts SET status = 'DEACTIVATED' WHERE id = ?`,
    [broadcastId]
  );
  return { ok: true };
}

async function cleanupExpired() {
  const ts = now();
  await db.run(
    isPg
      ? `UPDATE owner_broadcasts SET status = 'EXPIRED' WHERE status = 'ACTIVE' AND expires_at <= $1`
      : `UPDATE owner_broadcasts SET status = 'EXPIRED' WHERE status = 'ACTIVE' AND expires_at <= ?`,
    [ts]
  );
}

module.exports = {
  createBroadcast,
  listActiveBroadcasts,
  listOwnerBroadcasts,
  deactivateBroadcast,
  cleanupExpired,
  broadcastToAnnouncement,
};
