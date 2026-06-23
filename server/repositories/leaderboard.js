const crypto = require('crypto');
const db = require('../db/index');

const isPg = db.driver === 'postgres';

const SPORT_KEYS = ['football', 'cricket', 'basketball', 'badminton', 'pickleball'];

const EMPTY_BY_SPORT = {
  football: { goals: 0, assists: 0, matches: 0, cleanSheets: 0 },
  cricket: { runs: 0, wickets: 0, sixes: 0, fours: 0, matches: 0, catches: 0 },
  basketball: { points: 0, assists: 0, matches: 0 },
  badminton: { wins: 0, matches: 0 },
  pickleball: { wins: 0, matches: 0 },
};

function now() {
  return isPg ? new Date() : Date.now();
}

function parseJson(val, fallback = {}) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

function applyDeltaToStats(stats, delta) {
  const sport = delta.sport;
  const next = { ...stats };
  if (!next[sport]) next[sport] = { ...EMPTY_BY_SPORT[sport] };
  Object.entries(delta).forEach(([key, val]) => {
    if (key === 'sport' || typeof val !== 'number') return;
    next[sport][key] = (next[sport][key] || 0) + val;
  });
  return next;
}

async function getUserBrief(userId) {
  const row = await db.getOne(
    isPg
      ? `SELECT u.id, pp.full_name, pp.username, pp.avatar_url, pp.location_lat, pp.location_lng
         FROM users u LEFT JOIN player_profiles pp ON pp.user_id = u.id WHERE u.id = $1`
      : `SELECT u.id, pp.full_name, pp.username, pp.avatar_url, pp.location_lat, pp.location_lng
         FROM users u LEFT JOIN player_profiles pp ON pp.user_id = u.id WHERE u.id = ?`,
    [userId]
  );
  if (!row) return null;
  return {
    id: row.id,
    name: row.full_name || row.username || 'Player',
    avatar: row.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}`,
    lat: row.location_lat,
    lng: row.location_lng,
  };
}

async function getFriendUserIds(userId) {
  const rows = await db.getAll(
    isPg
      ? `SELECT from_user_id, to_user_id FROM friend_requests
         WHERE status = 'ACCEPTED' AND (from_user_id = $1 OR to_user_id = $1)`
      : `SELECT from_user_id, to_user_id FROM friend_requests
         WHERE status = 'ACCEPTED' AND (from_user_id = ? OR to_user_id = ?)`,
    isPg ? [userId] : [userId, userId]
  );
  const ids = new Set([userId]);
  rows.forEach((r) => {
    if (r.from_user_id === userId && r.to_user_id) ids.add(r.to_user_id);
    else if (r.to_user_id === userId && r.from_user_id) ids.add(r.from_user_id);
  });
  return [...ids];
}

async function loadStatsMap(userIds) {
  if (!userIds.length) return {};
  const placeholders = isPg
    ? userIds.map((_, i) => `$${i + 1}`).join(',')
    : userIds.map(() => '?').join(',');
  const rows = await db.getAll(
    isPg
      ? `SELECT user_id, sport, stats FROM player_sport_stats WHERE user_id IN (${placeholders})`
      : `SELECT user_id, sport, stats FROM player_sport_stats WHERE user_id IN (${placeholders})`,
    userIds
  );
  const map = {};
  userIds.forEach((id) => {
    map[id] = SPORT_KEYS.reduce((acc, s) => ({ ...acc, [s]: { ...EMPTY_BY_SPORT[s] } }), {});
  });
  rows.forEach((row) => {
    if (!map[row.user_id]) map[row.user_id] = {};
    map[row.user_id][row.sport] = { ...EMPTY_BY_SPORT[row.sport], ...parseJson(row.stats) };
  });
  return map;
}

async function recordMatch({ userId, sport, summary, delta }) {
  const id = crypto.randomUUID();
  const ts = now();
  const deltaJson = isPg ? JSON.stringify(delta) : JSON.stringify(delta);

  await db.run(
    isPg
      ? `INSERT INTO match_results (id, user_id, sport, summary, delta, created_at) VALUES ($1, $2, $3, $4, $5::jsonb, $6)`
      : `INSERT INTO match_results (id, user_id, sport, summary, delta, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    isPg
      ? [id, userId, sport, summary || '', deltaJson, ts]
      : [id, userId, sport, summary || '', deltaJson, Date.now()]
  );

  const existing = await db.getOne(
    isPg
      ? 'SELECT stats FROM player_sport_stats WHERE user_id = $1 AND sport = $2'
      : 'SELECT stats FROM player_sport_stats WHERE user_id = ? AND sport = ?',
    [userId, sport]
  );

  const currentAll = await loadStatsMap([userId]);
  const merged = applyDeltaToStats(currentAll[userId] || {}, delta);
  const sportStats = merged[sport] || EMPTY_BY_SPORT[sport];
  const statsJson = isPg ? JSON.stringify(sportStats) : JSON.stringify(sportStats);

  if (existing) {
    await db.run(
      isPg
        ? `UPDATE player_sport_stats SET stats = $1::jsonb, updated_at = $2 WHERE user_id = $3 AND sport = $4`
        : `UPDATE player_sport_stats SET stats = ?, updated_at = ? WHERE user_id = ? AND sport = ?`,
      isPg ? [statsJson, ts, userId, sport] : [statsJson, Date.now(), userId, sport]
    );
  } else {
    await db.run(
      isPg
        ? `INSERT INTO player_sport_stats (user_id, sport, stats, updated_at) VALUES ($1, $2, $3::jsonb, $4)`
        : `INSERT INTO player_sport_stats (user_id, sport, stats, updated_at) VALUES (?, ?, ?, ?)`,
      isPg ? [userId, sport, statsJson, ts] : [userId, sport, statsJson, Date.now()]
    );
  }

  return { matchId: id, stats: merged };
}

function haversineKm(lat1, lng1, lat2, lng2) {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return 999;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2
    + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function listLeaderboard({ userId, scope = 'squad', lat, lng, radiusKm = 10 }) {
  let userIds;
  if (scope === 'area') {
    const rows = await db.getAll(
      isPg
        ? `SELECT DISTINCT u.id FROM users u
           JOIN player_profiles pp ON pp.user_id = u.id
           WHERE u.role = 'PLAYER' AND pp.location_lat IS NOT NULL`
        : `SELECT DISTINCT u.id FROM users u
           JOIN player_profiles pp ON pp.user_id = u.id
           WHERE u.role = 'PLAYER' AND pp.location_lat IS NOT NULL`
    );
    userIds = rows.map((r) => r.id);
    if (lat != null && lng != null) {
      const filtered = [];
      for (const id of userIds) {
        const brief = await getUserBrief(id);
        if (brief && haversineKm(lat, lng, brief.lat, brief.lng) <= radiusKm) {
          filtered.push(id);
        }
      }
      userIds = filtered.length ? filtered : userIds.slice(0, 20);
    }
  } else {
    userIds = await getFriendUserIds(userId);
  }

  const statsMap = await loadStatsMap(userIds);
  const entries = [];
  for (const id of userIds) {
    const brief = await getUserBrief(id);
    if (!brief) continue;
    entries.push({
      id: id === userId ? 'me' : id,
      userId: id,
      name: brief.name,
      avatar: brief.avatar,
      isMe: id === userId,
      stats: statsMap[id] || SPORT_KEYS.reduce((acc, s) => ({ ...acc, [s]: { ...EMPTY_BY_SPORT[s] } }), {}),
    });
  }
  return entries;
}

async function listRecentMatches(userId, limit = 20) {
  const rows = await db.getAll(
    isPg
      ? `SELECT * FROM match_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`
      : `SELECT * FROM match_results WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
    [userId, limit]
  );
  return rows.map((r) => ({
    id: r.id,
    sport: r.sport,
    summary: r.summary,
    delta: parseJson(r.delta),
    finishedAt: r.created_at,
  }));
}

module.exports = {
  recordMatch,
  listLeaderboard,
  listRecentMatches,
  applyDeltaToStats,
  EMPTY_BY_SPORT,
};
