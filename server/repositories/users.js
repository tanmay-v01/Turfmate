const crypto = require('crypto');
const db = require('../db/index');
const config = require('../lib/config');

const isPg = db.driver === 'postgres';

function now() {
  return isPg ? new Date() : Date.now();
}

function newId() {
  return isPg ? undefined : crypto.randomUUID();
}

async function findByPhone(phone) {
  return db.getOne('SELECT * FROM users WHERE phone = $1', [phone]);
}

async function findById(id) {
  return db.getOne('SELECT * FROM users WHERE id = $1', [id]);
}

async function createUser({ phone, role = 'PLAYER', onboardingComplete = false }) {
  const ts = now();
  if (isPg) {
    return db.getOne(
      `INSERT INTO users (phone, role, onboarding_complete, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $4)
       RETURNING *`,
      [phone, role, onboardingComplete, ts]
    );
  }
  const id = crypto.randomUUID();
  await db.run(
    `INSERT INTO users (id, phone, role, status, onboarding_complete, created_at, updated_at)
     VALUES (?, ?, ?, 'ACTIVE', ?, ?, ?)`,
    [id, phone, role, onboardingComplete ? 1 : 0, ts, ts]
  );
  return findById(id);
}

async function upsertDemoUser(phone, role, profileData) {
  let user = await findByPhone(phone);
  if (!user) {
    user = await createUser({ phone, role, onboardingComplete: true });
  } else if (user.role !== role) {
    await db.run(
      isPg
        ? 'UPDATE users SET role = $1, onboarding_complete = TRUE, updated_at = $2 WHERE id = $3'
        : 'UPDATE users SET role = ?, onboarding_complete = 1, updated_at = ? WHERE id = ?',
      isPg ? [role, now(), user.id] : [role, now(), user.id]
    );
    user = await findById(user.id);
  }

  if (role === 'PLAYER' && profileData) {
    await upsertPlayerProfile(user.id, profileData);
  }
  if (role === 'OWNER' && profileData) {
    await upsertOwnerProfile(user.id, profileData);
  }
  return user;
}

async function upsertPlayerProfile(userId, data) {
  const ts = now();
  const sportsDna = JSON.stringify(data.sportsDna || []);
  const existing = await db.getOne(
    isPg ? 'SELECT user_id FROM player_profiles WHERE user_id = $1' : 'SELECT user_id FROM player_profiles WHERE user_id = ?',
    [userId]
  );
  if (existing) {
    await db.run(
      isPg
        ? `UPDATE player_profiles SET
            full_name = $1, username = $2, avatar_url = $3, location_label = $4,
            location_lat = $5, location_lng = $6, filter_radius_km = $7, sports_dna = $8::jsonb, updated_at = $9
           WHERE user_id = $10`
        : `UPDATE player_profiles SET
            full_name = ?, username = ?, avatar_url = ?, location_label = ?,
            location_lat = ?, location_lng = ?, filter_radius_km = ?, sports_dna = ?, updated_at = ?
           WHERE user_id = ?`,
      isPg
        ? [
            data.fullName, data.username, data.avatarUrl, data.locationLabel,
            data.locationLat, data.locationLng, data.filterRadiusKm || 10, sportsDna, ts, userId,
          ]
        : [
            data.fullName, data.username, data.avatarUrl, data.locationLabel,
            data.locationLat, data.locationLng, data.filterRadiusKm || 10, sportsDna, ts, userId,
          ]
    );
    return;
  }
  await db.run(
    isPg
      ? `INSERT INTO player_profiles
          (user_id, full_name, username, avatar_url, location_label, location_lat, location_lng,
           filter_radius_km, sports_dna, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$10)`
      : `INSERT INTO player_profiles
          (user_id, full_name, username, avatar_url, location_label, location_lat, location_lng,
           filter_radius_km, sports_dna, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    isPg
      ? [
          userId, data.fullName, data.username, data.avatarUrl, data.locationLabel,
          data.locationLat, data.locationLng, data.filterRadiusKm || 10, sportsDna, ts,
        ]
      : [
          userId, data.fullName, data.username, data.avatarUrl, data.locationLabel,
          data.locationLat, data.locationLng, data.filterRadiusKm || 10, sportsDna, ts, ts,
        ]
  );
}

async function upsertOwnerProfile(userId, data) {
  const ts = now();
  const existing = await db.getOne(
    isPg ? 'SELECT user_id FROM turf_owners WHERE user_id = $1' : 'SELECT user_id FROM turf_owners WHERE user_id = ?',
    [userId]
  );
  if (existing) {
    await db.run(
      isPg
        ? `UPDATE turf_owners SET business_name = $1, owner_name = $2, kyc_status = $3, updated_at = $4 WHERE user_id = $5`
        : `UPDATE turf_owners SET business_name = ?, owner_name = ?, kyc_status = ?, updated_at = ? WHERE user_id = ?`,
      isPg
        ? [data.businessName, data.ownerName, data.kycStatus || 'APPROVED', ts, userId]
        : [data.businessName, data.ownerName, data.kycStatus || 'APPROVED', ts, userId]
    );
    return;
  }
  await db.run(
    isPg
      ? `INSERT INTO turf_owners (user_id, business_name, owner_name, kyc_status, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$5)`
      : `INSERT INTO turf_owners (user_id, business_name, owner_name, kyc_status, created_at, updated_at)
         VALUES (?,?,?,?,?,?)`,
    isPg
      ? [userId, data.businessName, data.ownerName, data.kycStatus || 'APPROVED', ts]
      : [userId, data.businessName, data.ownerName, data.kycStatus || 'APPROVED', ts, ts]
  );
}

async function updatePublicKey(id, publicKey) {
  if (isPg) {
    return db.run(`UPDATE users SET public_key = $1, updated_at = $2 WHERE id = $3`, [publicKey, now(), id]);
  }
  return db.run(`UPDATE users SET public_key = ?, updated_at = ? WHERE id = ?`, [publicKey, now(), id]);
}

async function getPlayerProfile(userId) {
  return db.getOne(
    isPg ? 'SELECT * FROM player_profiles WHERE user_id = $1' : 'SELECT * FROM player_profiles WHERE user_id = ?',
    [userId]
  );
}

async function getOwnerProfile(userId) {
  return db.getOne(
    isPg ? 'SELECT * FROM turf_owners WHERE user_id = $1' : 'SELECT * FROM turf_owners WHERE user_id = ?',
    [userId]
  );
}

async function markOnboardingComplete(userId) {
  await db.run(
    isPg
      ? 'UPDATE users SET onboarding_complete = TRUE, updated_at = $1 WHERE id = $2'
      : 'UPDATE users SET onboarding_complete = 1, updated_at = ? WHERE id = ?',
    isPg ? [now(), userId] : [now(), userId]
  );
}

async function updatePlayerProfile(userId, patch) {
  const current = await getPlayerProfile(userId);
  if (!current) {
    await upsertPlayerProfile(userId, patch);
    return getPlayerProfile(userId);
  }
  await upsertPlayerProfile(userId, {
    fullName: patch.fullName ?? current.full_name,
    username: patch.username ?? current.username,
    avatarUrl: patch.avatarUrl ?? current.avatar_url,
    locationLabel: patch.locationLabel ?? current.location_label,
    locationLat: patch.locationLat ?? current.location_lat,
    locationLng: patch.locationLng ?? current.location_lng,
    filterRadiusKm: patch.filterRadiusKm ?? current.filter_radius_km,
    sportsDna: patch.sportsDna ?? (typeof current.sports_dna === 'string' ? JSON.parse(current.sports_dna) : current.sports_dna),
  });
  return getPlayerProfile(userId);
}

async function deleteAccount(userId) {
  const user = await findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }
  if (user.status === 'DELETED') {
    throw Object.assign(new Error('Account already deleted'), { status: 400 });
  }
  if (user.role === 'SUPER_ADMIN') {
    throw Object.assign(new Error('Super admin accounts cannot be self-deleted'), { status: 403 });
  }
  if (user.role === 'OWNER') {
    throw Object.assign(new Error('Contact support to close an owner account'), { status: 403 });
  }

  const ts = now();
  const anonPhone = `9${String(userId).replace(/-/g, '').slice(0, 9)}`;

  await db.run(
    isPg
      ? `UPDATE users SET status = 'DELETED', phone = $1, deleted_at = $2, updated_at = $2 WHERE id = $3`
      : `UPDATE users SET status = 'DELETED', phone = ?, deleted_at = ?, updated_at = ? WHERE id = ?`,
    isPg ? [anonPhone, ts, userId] : [anonPhone, Date.now(), Date.now(), userId]
  );

  await db.run(
    isPg
      ? `UPDATE player_profiles SET
          full_name = 'Deleted User', username = NULL, avatar_url = NULL,
          location_label = NULL, location_lat = NULL, location_lng = NULL,
          sports_dna = '[]'::jsonb, updated_at = $1
         WHERE user_id = $2`
      : `UPDATE player_profiles SET
          full_name = 'Deleted User', username = NULL, avatar_url = NULL,
          location_label = NULL, location_lat = NULL, location_lng = NULL,
          sports_dna = '[]', updated_at = ?
         WHERE user_id = ?`,
    isPg ? [ts, userId] : [Date.now(), userId]
  );

  await db.run(
    isPg ? 'DELETE FROM push_tokens WHERE user_id = $1' : 'DELETE FROM push_tokens WHERE user_id = ?',
    [userId]
  );
  await db.run(
    isPg ? 'DELETE FROM user_notifications WHERE user_id = $1' : 'DELETE FROM user_notifications WHERE user_id = ?',
    [userId]
  );

  return { ok: true, deletedAt: isPg ? ts : Date.now() };
}

module.exports = {
  findByPhone,
  findById,
  createUser,
  upsertDemoUser,
  upsertPlayerProfile,
  upsertOwnerProfile,
  getPlayerProfile,
  getOwnerProfile,
  markOnboardingComplete,
  updatePlayerProfile,
  deleteAccount,
  updatePublicKey,
};
