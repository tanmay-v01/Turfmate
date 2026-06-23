const crypto = require('crypto');
const db = require('../db/index');

const isPg = db.driver === 'postgres';

function now() {
  return isPg ? new Date() : Date.now();
}

async function findUserByUsername(username) {
  const clean = (username || '').replace(/^@/, '').trim().toLowerCase();
  if (!clean) return null;
  return db.getOne(
    isPg
      ? `SELECT u.id, pp.full_name, pp.username, pp.avatar_url
         FROM users u
         JOIN player_profiles pp ON pp.user_id = u.id
         WHERE LOWER(pp.username) = $1 OR LOWER(pp.username) = $2
         LIMIT 1`
      : `SELECT u.id, pp.full_name, pp.username, pp.avatar_url
         FROM users u
         JOIN player_profiles pp ON pp.user_id = u.id
         WHERE LOWER(pp.username) = ? OR LOWER(pp.username) = ?
         LIMIT 1`,
    [`@${clean}`, clean]
  );
}

async function getUserBrief(userId) {
  const row = await db.getOne(
    isPg
      ? `SELECT u.id, pp.full_name, pp.username, pp.avatar_url
         FROM users u LEFT JOIN player_profiles pp ON pp.user_id = u.id WHERE u.id = $1`
      : `SELECT u.id, pp.full_name, pp.username, pp.avatar_url
         FROM users u LEFT JOIN player_profiles pp ON pp.user_id = u.id WHERE u.id = ?`,
    [userId]
  );
  if (!row) return null;
  return {
    id: row.id,
    name: row.full_name || row.username || 'Player',
    username: row.username,
    avatar: row.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}`,
  };
}

function mapRequest(row, fromUser) {
  return {
    id: row.id,
    fromUserId: row.from_user_id,
    name: fromUser?.name || 'Player',
    avatar: fromUser?.avatar || '',
    username: fromUser?.username,
    message: row.message || 'Wants to connect on TurfMate',
    time: 'Recently',
    mutualFriends: 0,
    sport: 'football',
    status: row.status,
  };
}

async function listIncomingRequests(userId) {
  const rows = await db.getAll(
    isPg
      ? `SELECT * FROM friend_requests
         WHERE (to_user_id = $1 OR to_user_id IS NULL) AND status = 'PENDING'
         ORDER BY created_at DESC`
      : `SELECT * FROM friend_requests
         WHERE (to_user_id = ? OR to_user_id IS NULL) AND status = 'PENDING'
         ORDER BY created_at DESC`,
    [userId]
  );

  const profile = await getUserBrief(userId);
  const myUsername = profile?.username?.toLowerCase();

  const results = [];
  for (const row of rows) {
    if (!row.to_user_id && row.to_username) {
      const target = row.to_username.replace(/^@/, '').toLowerCase();
      const mine = (myUsername || '').replace(/^@/, '').toLowerCase();
      if (target && mine && target !== mine) continue;
    }
    const fromUser = await getUserBrief(row.from_user_id);
    results.push(mapRequest(row, fromUser));
  }
  return results;
}

async function sendFriendRequest({ fromUserId, toUserId, toUsername, message }) {
  if (toUserId && toUserId === fromUserId) {
    throw Object.assign(new Error('Cannot send request to yourself'), { status: 400 });
  }

  let targetId = toUserId;
  if (!targetId && toUsername) {
    const user = await findUserByUsername(toUsername);
    if (user) targetId = user.id;
  }

  const existing = await db.getOne(
    isPg
      ? `SELECT id FROM friend_requests
         WHERE from_user_id = $1 AND status = 'PENDING'
           AND (($2::uuid IS NOT NULL AND to_user_id = $2) OR ($3::text IS NOT NULL AND to_username = $3))
         LIMIT 1`
      : `SELECT id FROM friend_requests
         WHERE from_user_id = ? AND status = 'PENDING'
           AND ((? IS NOT NULL AND to_user_id = ?) OR (? IS NOT NULL AND to_username = ?))
         LIMIT 1`,
    isPg
      ? [fromUserId, targetId || null, toUsername || null]
      : [fromUserId, targetId || null, targetId || null, toUsername || null, toUsername || null]
  );
  if (existing) {
    throw Object.assign(new Error('Request already sent'), { status: 409 });
  }

  const id = crypto.randomUUID();
  const ts = now();
  const cleanUsername = toUsername ? (toUsername.startsWith('@') ? toUsername : `@${toUsername}`) : null;

  await db.run(
    isPg
      ? `INSERT INTO friend_requests (id, from_user_id, to_user_id, to_username, message, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'PENDING', $6)`
      : `INSERT INTO friend_requests (id, from_user_id, to_user_id, to_username, message, status, created_at)
         VALUES (?, ?, ?, ?, ?, 'PENDING', ?)`,
    isPg
      ? [id, fromUserId, targetId || null, cleanUsername, message || null, ts]
      : [id, fromUserId, targetId || null, cleanUsername, message || null, Date.now()]
  );

  const fromUser = await getUserBrief(fromUserId);
  return { request: mapRequest({ id, from_user_id: fromUserId, message, status: 'PENDING' }, fromUser) };
}

async function respondToRequest(requestId, userId, status) {
  const row = await db.getOne(
    isPg ? 'SELECT * FROM friend_requests WHERE id = $1' : 'SELECT * FROM friend_requests WHERE id = ?',
    [requestId]
  );
  if (!row || row.status !== 'PENDING') {
    throw Object.assign(new Error('Request not found'), { status: 404 });
  }
  if (row.to_user_id && row.to_user_id !== userId) {
    throw Object.assign(new Error('Not authorized'), { status: 403 });
  }

  await db.run(
    isPg
      ? 'UPDATE friend_requests SET status = $1 WHERE id = $2'
      : 'UPDATE friend_requests SET status = ? WHERE id = ?',
    [status, requestId]
  );

  const fromUser = await getUserBrief(row.from_user_id);
  return {
    request: mapRequest({ ...row, status }, fromUser),
    fromUser,
  };
}

async function listSquads(ownerId) {
  const rows = await db.getAll(
    isPg
      ? 'SELECT * FROM squads WHERE owner_id = $1 ORDER BY created_at DESC'
      : 'SELECT * FROM squads WHERE owner_id = ? ORDER BY created_at DESC',
    [ownerId]
  );

  const squads = [];
  for (const row of rows) {
    const members = await db.getAll(
      isPg
        ? 'SELECT member_name FROM squad_members WHERE squad_id = $1'
        : 'SELECT member_name FROM squad_members WHERE squad_id = ?',
      [row.id]
    );
    squads.push({
      id: row.id,
      name: row.name,
      members: members.map((m) => m.member_name),
      createdAt: row.created_at,
    });
  }
  return squads;
}

async function createSquad({ ownerId, name, members = [] }) {
  const id = crypto.randomUUID();
  const ts = now();
  await db.run(
    isPg
      ? 'INSERT INTO squads (id, owner_id, name, created_at) VALUES ($1, $2, $3, $4)'
      : 'INSERT INTO squads (id, owner_id, name, created_at) VALUES (?, ?, ?, ?)',
    isPg ? [id, ownerId, name, ts] : [id, ownerId, name, Date.now()]
  );

  for (const memberName of members) {
    if (!memberName?.trim()) continue;
    const user = await findUserByUsername(memberName);
    await db.run(
      isPg
        ? `INSERT INTO squad_members (squad_id, member_name, member_user_id) VALUES ($1, $2, $3)
           ON CONFLICT (squad_id, member_name) DO NOTHING`
        : `INSERT OR IGNORE INTO squad_members (squad_id, member_name, member_user_id) VALUES (?, ?, ?)`,
      [id, memberName.trim(), user?.id || null]
    );
  }

  return { squad: { id, name, members: members.filter(Boolean), createdAt: ts } };
}

module.exports = {
  listIncomingRequests,
  sendFriendRequest,
  acceptRequest: (id, userId) => respondToRequest(id, userId, 'ACCEPTED'),
  declineRequest: (id, userId) => respondToRequest(id, userId, 'DECLINED'),
  listSquads,
  createSquad,
  getUserBrief,
};
