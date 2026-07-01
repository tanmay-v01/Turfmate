const crypto = require('crypto');
const db = require('../db/index');
const { distanceKm, formatDistance } = require('../utils/geo');

const isPg = db.driver === 'postgres';

function parseJson(val, fallback = {}) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

function rowToClient(row, userLat, userLng) {
  const meta = parseJson(row.meta, {});
  const images = parseJson(row.images, []);
  const sports = parseJson(row.sports, []);
  const amenities = parseJson(row.amenities, []);
  const lat = Number(row.location_lat);
  const lng = Number(row.location_lng);
  const distKm = userLat != null && userLng != null ? distanceKm(userLat, userLng, lat, lng) : null;

  return {
    id: row.legacy_id || row.id,
    dbId: row.id,
    ownerId: meta.ownerId || row.owner_user_id,
    name: row.name,
    image: meta.image || images[0] || '',
    gallery: meta.gallery?.length ? meta.gallery : images,
    lat,
    lng,
    city: row.city,
    rating: Number(row.rating) || 0,
    reviews: meta.reviews || 0,
    pricePerHour: meta.pricePerHour || 0,
    minSplitAdvance: meta.minSplitAdvance || 0,
    amenities,
    sports,
    rules: meta.rules || [],
    slots: meta.slots || [],
    status: (row.status || 'ACTIVE').toLowerCase(),
    distance: distKm != null ? formatDistance(distKm) : meta.distance || '',
    distanceKm: distKm,
  };
}

async function listTurfs({ lat, lng, radiusKm = 20, sport } = {}) {
  const rows = await db.getAll(
    isPg
      ? `SELECT * FROM turfs WHERE status = 'ACTIVE' ORDER BY rating DESC`
      : `SELECT * FROM turfs WHERE status = 'ACTIVE' ORDER BY rating DESC`
  );

  let turfs = rows.map((row) => rowToClient(row, lat, lng));

  if (sport && sport !== 'all') {
    turfs = turfs.filter((t) => t.sports.includes(sport));
  }

  if (lat != null && lng != null && radiusKm) {
    turfs = turfs.filter((t) => t.distanceKm == null || t.distanceKm <= Number(radiusKm));
    turfs.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
  }

  return turfs;
}

async function getTurfByLegacyId(legacyId, userLat, userLng) {
  const row = await db.getOne(
    isPg
      ? `SELECT * FROM turfs WHERE legacy_id = $1 OR id::text = $1 LIMIT 1`
      : `SELECT * FROM turfs WHERE legacy_id = ? OR id = ? LIMIT 1`,
    [legacyId, legacyId]
  );
  return row ? rowToClient(row, userLat, userLng) : null;
}

async function upsertTurf(demo, ownerUserId = null) {
  const meta = {
    ownerId: demo.ownerId || ownerUserId,
    image: demo.image,
    gallery: demo.gallery,
    reviews: demo.reviews,
    pricePerHour: demo.pricePerHour,
    minSplitAdvance: demo.minSplitAdvance,
    rules: demo.rules,
    slots: demo.slots,
  };
  const imagesJson = isPg ? JSON.stringify(demo.gallery) : JSON.stringify(demo.gallery);
  const sportsJson = JSON.stringify(demo.sports);
  const amenitiesJson = JSON.stringify(demo.amenities);
  const metaJson = JSON.stringify(meta);

  const existing = await db.getOne(
    isPg ? 'SELECT id FROM turfs WHERE legacy_id = $1' : 'SELECT id FROM turfs WHERE legacy_id = ?',
    [demo.id]
  );

  if (existing) {
    await db.run(
      isPg
        ? `UPDATE turfs SET name = $1, city = $2, location_lat = $3, location_lng = $4,
            rating = $5, amenities = $6::jsonb, images = $7::jsonb, sports = $8::jsonb, meta = $9::jsonb,
            status = 'ACTIVE', owner_user_id = COALESCE($10, owner_user_id)
           WHERE legacy_id = $11`
        : `UPDATE turfs SET name = ?, city = ?, location_lat = ?, location_lng = ?,
            rating = ?, amenities = ?, images = ?, sports = ?, meta = ?,
            status = 'ACTIVE', owner_user_id = COALESCE(?, owner_user_id)
           WHERE legacy_id = ?`,
      isPg
        ? [demo.name, demo.city, demo.lat, demo.lng, demo.rating, amenitiesJson, imagesJson, sportsJson, metaJson, ownerUserId, demo.id]
        : [demo.name, demo.city, demo.lat, demo.lng, demo.rating, amenitiesJson, imagesJson, sportsJson, metaJson, ownerUserId, demo.id]
    );
    return existing.id;
  }

  const id = crypto.randomUUID();
  await db.run(
    isPg
      ? `INSERT INTO turfs (id, owner_user_id, legacy_id, name, city, location_lat, location_lng, rating, amenities, images, sports, meta, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10::jsonb,$11::jsonb,'ACTIVE')`
      : `INSERT INTO turfs (id, owner_user_id, legacy_id, name, city, location_lat, location_lng, rating, amenities, images, sports, meta, status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'ACTIVE')`,
    isPg
      ? [id, ownerUserId, demo.id, demo.name, demo.city, demo.lat, demo.lng, demo.rating, amenitiesJson, imagesJson, sportsJson, metaJson]
      : [id, ownerUserId, demo.id, demo.name, demo.city, demo.lat, demo.lng, demo.rating, amenitiesJson, imagesJson, sportsJson, metaJson]
  );
  return id;
}

async function addReview({ turfId, userId, rating, comment }) {
  const id = crypto.randomUUID();
  const now = Date.now();
  await db.run(
    isPg
      ? `INSERT INTO turf_reviews (id, turf_id, user_id, rating, comment, created_at) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (turf_id, user_id) DO UPDATE SET rating=$4, comment=$5, created_at=$6`
      : `INSERT INTO turf_reviews (id, turf_id, user_id, rating, comment, created_at) VALUES (?,?,?,?,?,?) ON CONFLICT (turf_id, user_id) DO UPDATE SET rating=?, comment=?, created_at=?`,
    isPg
      ? [id, turfId, userId, rating, comment, now]
      : [id, turfId, userId, rating, comment, now, rating, comment, now]
  );
  
  // Recalculate average rating
  const stats = await db.getOne(
    isPg ? `SELECT AVG(rating) as avg, COUNT(*) as cnt FROM turf_reviews WHERE turf_id = $1` : `SELECT AVG(rating) as avg, COUNT(*) as cnt FROM turf_reviews WHERE turf_id = ?`,
    [turfId]
  );
  
  const avg = stats.avg ? Number(stats.avg).toFixed(1) : 0;
  
  // Update turf rating
  await db.run(
    isPg ? `UPDATE turfs SET rating = $1 WHERE id = $2` : `UPDATE turfs SET rating = ? WHERE id = ?`,
    [avg, turfId]
  );
  
  // Also update meta.reviews (using a simple select then update since sqlite json update is tricky across both DBs)
  const turf = await db.getOne(isPg ? `SELECT meta FROM turfs WHERE id = $1` : `SELECT meta FROM turfs WHERE id = ?`, [turfId]);
  if (turf) {
    const meta = parseJson(turf.meta, {});
    meta.reviews = stats.cnt;
    await db.run(
      isPg ? `UPDATE turfs SET meta = $1::jsonb WHERE id = $2` : `UPDATE turfs SET meta = ? WHERE id = ?`,
      [JSON.stringify(meta), turfId]
    );
  }
  
  return { id, turfId, userId, rating, comment, avg };
}

async function getReviews(turfId) {
  const rows = await db.getAll(
    isPg
      ? `SELECT r.*, p.full_name as user_name, p.avatar_url FROM turf_reviews r LEFT JOIN player_profiles p ON r.user_id = p.user_id WHERE r.turf_id = $1 ORDER BY r.created_at DESC`
      : `SELECT r.*, p.full_name as user_name, p.avatar_url FROM turf_reviews r LEFT JOIN player_profiles p ON r.user_id = p.user_id WHERE r.turf_id = ? ORDER BY r.created_at DESC`,
    [turfId]
  );
  return rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    userName: r.user_name || 'Anonymous',
    userAvatar: r.avatar_url,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at
  }));
}

module.exports = { listTurfs, getTurfByLegacyId, upsertTurf, rowToClient, addReview, getReviews };
