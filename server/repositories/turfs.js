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

async function upsertTurf(demo) {
  const meta = {
    ownerId: demo.ownerId,
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
            rating = $5, amenities = $6::jsonb, images = $7::jsonb, sports = $8::jsonb, meta = $9::jsonb
           WHERE legacy_id = $10`
        : `UPDATE turfs SET name = ?, city = ?, location_lat = ?, location_lng = ?,
            rating = ?, amenities = ?, images = ?, sports = ?, meta = ?
           WHERE legacy_id = ?`,
      isPg
        ? [demo.name, demo.city, demo.lat, demo.lng, demo.rating, amenitiesJson, imagesJson, sportsJson, metaJson, demo.id]
        : [demo.name, demo.city, demo.lat, demo.lng, demo.rating, amenitiesJson, imagesJson, sportsJson, metaJson, demo.id]
    );
    return existing.id;
  }

  const id = crypto.randomUUID();
  await db.run(
    isPg
      ? `INSERT INTO turfs (id, legacy_id, name, city, location_lat, location_lng, rating, amenities, images, sports, meta, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10::jsonb,$11::jsonb,'ACTIVE')`
      : `INSERT INTO turfs (id, legacy_id, name, city, location_lat, location_lng, rating, amenities, images, sports, meta, status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,'ACTIVE')`,
    isPg
      ? [id, demo.id, demo.name, demo.city, demo.lat, demo.lng, demo.rating, amenitiesJson, imagesJson, sportsJson, metaJson]
      : [id, demo.id, demo.name, demo.city, demo.lat, demo.lng, demo.rating, amenitiesJson, imagesJson, sportsJson, metaJson]
  );
  return id;
}

module.exports = { listTurfs, getTurfByLegacyId, upsertTurf, rowToClient };
