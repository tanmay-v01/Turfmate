const crypto = require('crypto');
const db = require('../db/index');

const isPg = db.driver === 'postgres';
const POST_TTL_MS = 48 * 60 * 60 * 1000;
const RATE_LIMIT_MS = 24 * 60 * 60 * 1000;
const MAX_POSTS_PER_DAY = 5;

function now() {
  return isPg ? new Date() : Date.now();
}

function parseExtra(val) {
  if (!val) return {};
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return {}; }
}

async function getAuthorDisplay(userId) {
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

function rowToPost(row, author) {
  const extra = parseExtra(row.extra_json);
  return {
    id: `post-${row.id}`,
    postId: row.id,
    authorId: row.author_id,
    hostId: row.author_id,
    hostName: author.name,
    hostAvatar: author.avatar,
    hostLevel: author.skillLevel,
    contentType: row.content_type,
    contentText: row.content_text,
    extra,
    locationLat: row.location_lat,
    locationLng: row.location_lng,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

async function listFeed({ sinceMs = Date.now() - POST_TTL_MS } = {}) {
  const since = isPg ? new Date(sinceMs) : sinceMs;
  const rows = await db.getAll(
    isPg
      ? `SELECT * FROM locker_posts WHERE created_at > $1 ORDER BY created_at DESC LIMIT 100`
      : `SELECT * FROM locker_posts WHERE created_at > ? ORDER BY created_at DESC LIMIT 100`,
    [since]
  );

  const posts = [];
  for (const row of rows) {
    const author = await getAuthorDisplay(row.author_id);
    posts.push(rowToPost(row, author));
  }
  return posts;
}

async function createPost({ userId, contentType, contentText, extra = {}, lat, lng }) {
  const since = Date.now() - RATE_LIMIT_MS;
  const countRow = await db.getOne(
    isPg
      ? `SELECT COUNT(*)::int AS count FROM locker_posts WHERE author_id = $1 AND created_at > $2`
      : `SELECT COUNT(*) AS count FROM locker_posts WHERE author_id = ? AND created_at > ?`,
    isPg ? [userId, new Date(since)] : [userId, since]
  );
  const count = Number(countRow?.count || 0);
  if (count >= MAX_POSTS_PER_DAY) {
    throw Object.assign(new Error('Rate limit: max 5 posts per 24 hours'), { status: 429 });
  }

  const id = crypto.randomUUID();
  const ts = now();
  const expires = isPg ? new Date(Date.now() + POST_TTL_MS) : Date.now() + POST_TTL_MS;
  const extraJson = isPg ? JSON.stringify(extra) : JSON.stringify(extra);

  await db.run(
    isPg
      ? `INSERT INTO locker_posts (id, author_id, content_type, content_text, extra_json, location_lat, location_lng, expires_at, created_at)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9)`
      : `INSERT INTO locker_posts (id, author_id, content_type, content_text, extra_json, location_lat, location_lng, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    isPg
      ? [id, userId, contentType, contentText, extraJson, lat ?? null, lng ?? null, expires, ts]
      : [id, userId, contentType, contentText, extraJson, lat ?? null, lng ?? null, expires, Date.now() + POST_TTL_MS, Date.now()]
  );

  const row = await db.getOne(
    isPg ? 'SELECT * FROM locker_posts WHERE id = $1' : 'SELECT * FROM locker_posts WHERE id = ?',
    [id]
  );
  const author = await getAuthorDisplay(userId);
  return rowToPost(row, author);
}

module.exports = {
  listFeed,
  createPost,
};
