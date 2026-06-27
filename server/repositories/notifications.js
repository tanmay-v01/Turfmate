const crypto = require('crypto');
const db = require('../db/index');
const pushService = require('../services/pushService');
const socialRepo = require('./social');

const isPg = db.driver === 'postgres';

function now() {
  return isPg ? new Date() : Date.now();
}

function toMs(val) {
  if (val == null) return Date.now();
  return isPg ? new Date(val).getTime() : val;
}

function parseData(val) {
  if (!val) return {};
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return {}; }
}

function formatTimeAgo(ts) {
  const ms = Date.now() - toMs(ts);
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function mapNotification(row) {
  const data = parseData(row.data);
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    text: row.body || row.title,
    data,
    read: Boolean(row.read),
    time: formatTimeAgo(row.created_at),
    createdAt: toMs(row.created_at),
  };
}

async function registerToken(userId, token, platform = 'web') {
  if (!token?.trim()) throw Object.assign(new Error('token is required'), { status: 400 });
  const ts = now();
  await db.run(
    isPg
      ? `INSERT INTO push_tokens (id, user_id, token, platform, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $5)
         ON CONFLICT (user_id, token) DO UPDATE SET platform = EXCLUDED.platform, updated_at = EXCLUDED.updated_at`
      : `INSERT INTO push_tokens (id, user_id, token, platform, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id, token) DO UPDATE SET platform = excluded.platform, updated_at = excluded.updated_at`,
    isPg
      ? [crypto.randomUUID(), userId, token.trim(), platform, ts]
      : [crypto.randomUUID(), userId, token.trim(), platform, Date.now(), Date.now()]
  );
  return { ok: true };
}

async function getTokensForUser(userId) {
  const rows = await db.getAll(
    isPg ? 'SELECT token FROM push_tokens WHERE user_id = $1' : 'SELECT token FROM push_tokens WHERE user_id = ?',
    [userId]
  );
  return rows.map((r) => r.token);
}

async function createNotification({ userId, type, title, body, data = {}, push = true }) {
  const id = crypto.randomUUID();
  const ts = now();
  const dataJson = isPg ? data : JSON.stringify(data);

  await db.run(
    isPg
      ? `INSERT INTO user_notifications (id, user_id, type, title, body, data, read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, FALSE, $7)`
      : `INSERT INTO user_notifications (id, user_id, type, title, body, data, read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
    isPg
      ? [id, userId, type, title, body, dataJson, ts]
      : [id, userId, type, title, body, dataJson, Date.now()]
  );

  let pushResult = null;
  let emailResult = null;
  if (push) {
    const tokens = await getTokensForUser(userId);
    pushResult = await pushService.sendPush({ tokens, title, body, data });

    // Send email notification if user has an email identifier
    const user = await db.getOne(isPg ? 'SELECT phone FROM users WHERE id = $1' : 'SELECT phone FROM users WHERE id = ?', [userId]);
    if (user && user.phone && user.phone.includes('@')) {
      const emailService = require('../services/emailService');
      emailResult = await emailService.sendEmail({
        to: user.phone,
        subject: title,
        text: body,
        html: `<p><strong>${title}</strong></p><p>${body}</p>`
      });
    }
  }

  const row = await db.getOne(
    isPg ? 'SELECT * FROM user_notifications WHERE id = $1' : 'SELECT * FROM user_notifications WHERE id = ?',
    [id]
  );
  return { notification: mapNotification(row), push: pushResult };
}

async function listNotifications(userId, limit = 50) {
  const rows = await db.getAll(
    isPg
      ? `SELECT * FROM user_notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`
      : `SELECT * FROM user_notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
    [userId, limit]
  );
  return rows.map(mapNotification);
}

async function markRead(userId, notificationId) {
  await db.run(
    isPg
      ? 'UPDATE user_notifications SET read = TRUE WHERE id = $1 AND user_id = $2'
      : 'UPDATE user_notifications SET read = 1 WHERE id = ? AND user_id = ?',
    [notificationId, userId]
  );
  return { ok: true };
}

async function markAllRead(userId) {
  await db.run(
    isPg
      ? 'UPDATE user_notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE'
      : 'UPDATE user_notifications SET read = 1 WHERE user_id = ? AND read = 0',
    [userId]
  );
  return { ok: true };
}

async function sendSplitSquadInvites({
  hostUserId,
  bookingId,
  annId,
  squadId,
  turfName,
  costPerHead,
  inviteLink,
}) {
  const memberIds = await socialRepo.getSquadMemberUserIds(squadId, hostUserId);
  if (!memberIds.length) {
    return { sent: 0, message: 'No squad members with accounts to notify' };
  }

  const host = await socialRepo.getUserBrief(hostUserId);
  const hostName = host?.name || 'A player';
  const title = 'Split invite';
  const body = `${hostName} invited your squad to split @ ${turfName}. Pay ₹${costPerHead}: ${inviteLink}`;
  const data = { type: 'SPLIT_INVITE', bookingId, annId, inviteLink };

  const results = [];
  for (const userId of memberIds) {
    if (userId === hostUserId) continue;
    results.push(await createNotification({
      userId,
      type: 'SPLIT_INVITE',
      title,
      body,
      data,
    }));
  }

  return { sent: results.length, notifications: results.map((r) => r.notification) };
}

module.exports = {
  registerToken,
  createNotification,
  listNotifications,
  markRead,
  markAllRead,
  sendSplitSquadInvites,
};
