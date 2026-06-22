const crypto = require('crypto');
const db = require('../db/index');
const usersRepo = require('./users');

const isPg = db.driver === 'postgres';

function now() {
  return isPg ? new Date() : Date.now();
}

function mapOwnerRow(row, turfLegacyIds = []) {
  if (!row) return null;
  const kycStatus = row.kyc_status || 'PENDING';
  return {
    id: row.user_id,
    userId: row.user_id,
    name: row.owner_name || row.business_name,
    businessName: row.business_name,
    phone: row.phone,
    email: row.business_email,
    avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${row.user_id}`,
    turfIds: turfLegacyIds,
    approvalStatus: kycStatus === 'APPROVED' ? 'Approved' : kycStatus === 'REJECTED' ? 'Rejected' : 'Pending_Approval',
    kycStatus,
    bankAccount: row.bank_account_no,
    ifsc: row.ifsc_code,
    pan: row.pan_number,
    gstin: row.gstin,
    accountHolder: row.account_holder,
    location: row.location_label,
    lat: row.location_lat != null ? Number(row.location_lat) : null,
    lng: row.location_lng != null ? Number(row.location_lng) : null,
    kycDoc: row.kyc_doc_name,
    turfName: row.turf_name,
    rejectNote: row.reject_note,
    joinedAt: row.applied_at ? new Date(isPg ? row.applied_at : row.applied_at).toISOString().slice(0, 10) : '',
  };
}

async function getOwnerTurfs(userId) {
  const rows = await db.getAll(
    isPg
      ? `SELECT legacy_id FROM turfs WHERE owner_user_id = $1 ORDER BY legacy_id ASC`
      : `SELECT legacy_id FROM turfs WHERE owner_user_id = ? ORDER BY legacy_id ASC`,
    [userId]
  );
  return rows.map((r) => r.legacy_id).filter(Boolean);
}

async function getOwnerByUserId(userId) {
  const row = await db.getOne(
    isPg
      ? `SELECT o.*, u.phone FROM turf_owners o JOIN users u ON u.id = o.user_id WHERE o.user_id = $1`
      : `SELECT o.*, u.phone FROM turf_owners o JOIN users u ON u.id = o.user_id WHERE o.user_id = ?`,
    [userId]
  );
  if (!row) return null;
  const turfIds = await getOwnerTurfs(userId);
  return mapOwnerRow(row, turfIds);
}

async function submitApplication(userId, data) {
  const ts = now();
  const turfLegacyId = `turf-${Date.now()}`;
  const turfUuid = crypto.randomUUID();

  await db.run(
    isPg
      ? `UPDATE users SET role = 'OWNER', updated_at = $1 WHERE id = $2`
      : `UPDATE users SET role = 'OWNER', updated_at = ? WHERE id = ?`,
    isPg ? [ts, userId] : [Date.now(), userId]
  );

  const existing = await db.getOne(
    isPg ? 'SELECT user_id FROM turf_owners WHERE user_id = $1' : 'SELECT user_id FROM turf_owners WHERE user_id = ?',
    [userId]
  );

  const ownerFields = {
    businessName: data.businessName,
    ownerName: data.ownerName,
    businessEmail: data.businessEmail,
    kycStatus: 'PENDING',
    pan: data.pan,
    gstin: data.gstin || '',
    bankAccount: data.bankAccount,
    ifsc: data.ifsc,
    accountHolder: data.accountHolder,
    locationLabel: data.location || data.pinnedLocation?.address || '',
    locationLat: data.pinnedLocation?.lat ?? data.lat,
    locationLng: data.pinnedLocation?.lng ?? data.lng,
    kycDocName: data.kycDoc || '',
    turfName: data.businessName || data.turfName || 'New Partner Turf',
  };

  if (existing) {
    await db.run(
      isPg
        ? `UPDATE turf_owners SET business_name = $1, owner_name = $2, business_email = $3, kyc_status = 'PENDING',
            pan_number = $4, gstin = $5, bank_account_no = $6, ifsc_code = $7, account_holder = $8,
            location_label = $9, location_lat = $10, location_lng = $11, kyc_doc_name = $12, turf_name = $13,
            reject_note = NULL, updated_at = $14
           WHERE user_id = $15`
        : `UPDATE turf_owners SET business_name = ?, owner_name = ?, business_email = ?, kyc_status = 'PENDING',
            pan_number = ?, gstin = ?, bank_account_no = ?, ifsc_code = ?, account_holder = ?,
            location_label = ?, location_lat = ?, location_lng = ?, kyc_doc_name = ?, turf_name = ?,
            reject_note = NULL, updated_at = ?
           WHERE user_id = ?`,
      isPg
        ? [
            ownerFields.businessName, ownerFields.ownerName, ownerFields.businessEmail,
            ownerFields.pan, ownerFields.gstin, ownerFields.bankAccount, ownerFields.ifsc,
            ownerFields.accountHolder, ownerFields.locationLabel, ownerFields.locationLat,
            ownerFields.locationLng, ownerFields.kycDocName, ownerFields.turfName, ts, userId,
          ]
        : [
            ownerFields.businessName, ownerFields.ownerName, ownerFields.businessEmail,
            ownerFields.pan, ownerFields.gstin, ownerFields.bankAccount, ownerFields.ifsc,
            ownerFields.accountHolder, ownerFields.locationLabel, ownerFields.locationLat,
            ownerFields.locationLng, ownerFields.kycDocName, ownerFields.turfName, Date.now(), userId,
          ]
    );
  } else {
    await db.run(
      isPg
        ? `INSERT INTO turf_owners
            (user_id, business_name, owner_name, business_email, kyc_status, pan_number, gstin,
             bank_account_no, ifsc_code, account_holder, location_label, location_lat, location_lng,
             kyc_doc_name, turf_name, applied_at, created_at, updated_at)
           VALUES ($1,$2,$3,$4,'PENDING',$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$15,$15)`
        : `INSERT INTO turf_owners
            (user_id, business_name, owner_name, business_email, kyc_status, pan_number, gstin,
             bank_account_no, ifsc_code, account_holder, location_label, location_lat, location_lng,
             kyc_doc_name, turf_name, applied_at, created_at, updated_at)
           VALUES (?,?,?,?,'PENDING',?,?,?,?,?,?,?,?,?,?,?,?)`,
      isPg
        ? [
            userId, ownerFields.businessName, ownerFields.ownerName, ownerFields.businessEmail,
            ownerFields.pan, ownerFields.gstin, ownerFields.bankAccount, ownerFields.ifsc,
            ownerFields.accountHolder, ownerFields.locationLabel, ownerFields.locationLat,
            ownerFields.locationLng, ownerFields.kycDocName, ownerFields.turfName, ts,
          ]
        : [
            userId, ownerFields.businessName, ownerFields.ownerName, ownerFields.businessEmail,
            ownerFields.pan, ownerFields.gstin, ownerFields.bankAccount, ownerFields.ifsc,
            ownerFields.accountHolder, ownerFields.locationLabel, ownerFields.locationLat,
            ownerFields.locationLng, ownerFields.kycDocName, ownerFields.turfName,
            Date.now(), Date.now(), Date.now(),
          ]
    );
  }

  const existingTurf = await db.getOne(
    isPg
      ? `SELECT id, legacy_id FROM turfs WHERE owner_user_id = $1 AND status = 'INACTIVE' LIMIT 1`
      : `SELECT id, legacy_id FROM turfs WHERE owner_user_id = ? AND status = 'INACTIVE' LIMIT 1`,
    [userId]
  );

  let turfLegacy = turfLegacyId;
  if (existingTurf) {
    turfLegacy = existingTurf.legacy_id;
    await db.run(
      isPg
        ? `UPDATE turfs SET name = $1, city = $2, location_lat = $3, location_lng = $4, status = 'INACTIVE' WHERE id = $5`
        : `UPDATE turfs SET name = ?, city = ?, location_lat = ?, location_lng = ?, status = 'INACTIVE' WHERE id = ?`,
      isPg
        ? [ownerFields.turfName, 'Virar', ownerFields.locationLat, ownerFields.locationLng, existingTurf.id]
        : [ownerFields.turfName, 'Virar', ownerFields.locationLat, ownerFields.locationLng, existingTurf.id]
    );
  } else {
    const imagesJson = JSON.stringify([]);
    const sportsJson = JSON.stringify(['football']);
    const amenitiesJson = JSON.stringify(['Parking', 'Floodlights']);
    const metaJson = JSON.stringify({ pendingReview: true, image: '' });
    await db.run(
      isPg
        ? `INSERT INTO turfs (id, owner_user_id, legacy_id, name, city, location_lat, location_lng, rating, amenities, images, sports, meta, status)
           VALUES ($1,$2,$3,$4,'Virar',$5,$6,0,$7::jsonb,$8::jsonb,$9::jsonb,$10::jsonb,'INACTIVE')`
        : `INSERT INTO turfs (id, owner_user_id, legacy_id, name, city, location_lat, location_lng, rating, amenities, images, sports, meta, status)
           VALUES (?,?,?,?,'Virar',?,?,0,?,?,?,?,'INACTIVE')`,
      isPg
        ? [turfUuid, userId, turfLegacyId, ownerFields.turfName, ownerFields.locationLat, ownerFields.locationLng, amenitiesJson, imagesJson, sportsJson, metaJson]
        : [turfUuid, userId, turfLegacyId, ownerFields.turfName, ownerFields.locationLat, ownerFields.locationLng, amenitiesJson, imagesJson, sportsJson, metaJson]
    );
  }

  const owner = await getOwnerByUserId(userId);
  const user = await usersRepo.findById(userId);
  const playerProfile = await usersRepo.getPlayerProfile(userId);
  const ownerProfile = await usersRepo.getOwnerProfile(userId);
  const { toClientProfile } = require('../utils/profileMapper');

  return {
    owner,
    turf: {
      id: turfLegacy,
      ownerId: userId,
      name: ownerFields.turfName,
      status: 'pending_review',
      lat: ownerFields.locationLat,
      lng: ownerFields.locationLng,
      city: 'Virar',
    },
    profile: toClientProfile(user, playerProfile, ownerProfile),
  };
}

async function listPendingApplications() {
  const rows = await db.getAll(
    isPg
      ? `SELECT o.*, u.phone FROM turf_owners o JOIN users u ON u.id = o.user_id
         WHERE o.kyc_status = 'PENDING' ORDER BY o.applied_at ASC NULLS LAST, o.created_at ASC`
      : `SELECT o.*, u.phone FROM turf_owners o JOIN users u ON u.id = o.user_id
         WHERE o.kyc_status = 'PENDING' ORDER BY o.applied_at ASC, o.created_at ASC`
  );
  const result = [];
  for (const row of rows) {
    const turfIds = await getOwnerTurfs(row.user_id);
    result.push(mapOwnerRow(row, turfIds));
  }
  return result;
}

async function approveApplication(userId) {
  const ts = now();
  await db.run(
    isPg
      ? `UPDATE turf_owners SET kyc_status = 'APPROVED', reject_note = NULL, updated_at = $1 WHERE user_id = $2`
      : `UPDATE turf_owners SET kyc_status = 'APPROVED', reject_note = NULL, updated_at = ? WHERE user_id = ?`,
    isPg ? [ts, userId] : [Date.now(), userId]
  );
  await db.run(
    isPg
      ? `UPDATE turfs SET status = 'ACTIVE' WHERE owner_user_id = $1`
      : `UPDATE turfs SET status = 'ACTIVE' WHERE owner_user_id = ?`,
    [userId]
  );
  return getOwnerByUserId(userId);
}

async function rejectApplication(userId, note = '') {
  const ts = now();
  await db.run(
    isPg
      ? `UPDATE turf_owners SET kyc_status = 'REJECTED', reject_note = $1, updated_at = $2 WHERE user_id = $3`
      : `UPDATE turf_owners SET kyc_status = 'REJECTED', reject_note = ?, updated_at = ? WHERE user_id = ?`,
    isPg ? [note, ts, userId] : [note, Date.now(), userId]
  );
  return getOwnerByUserId(userId);
}

async function getPlatformStats() {
  const pending = await listPendingApplications();
  const activeTurfs = await db.getOne(
    isPg ? `SELECT COUNT(*) AS count FROM turfs WHERE status = 'ACTIVE'` : `SELECT COUNT(*) AS count FROM turfs WHERE status = 'ACTIVE'`
  );
  return {
    pendingKyc: pending.length,
    activeTurfs: Number(activeTurfs?.count || 0),
  };
}

async function getOwnerMetaForProfile(userId) {
  const turfIds = await getOwnerTurfs(userId);
  return { ownerId: userId, turfIds };
}

module.exports = {
  submitApplication,
  getOwnerByUserId,
  getOwnerTurfs,
  getOwnerMetaForProfile,
  listPendingApplications,
  approveApplication,
  rejectApplication,
  getPlatformStats,
};
