const crypto = require('crypto');
const db = require('../db/index');

const isPg = db.driver === 'postgres';

function bookingRoomId(bookingId) {
  return `chat-booking-${bookingId}`;
}

function now() {
  return isPg ? new Date() : Date.now();
}

function parseMeta(val) {
  if (!val) return {};
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return {}; }
}

function formatTime(ts) {
  const ms = isPg ? new Date(ts).getTime() : ts;
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function rowToMessage(row) {
  return {
    id: row.id,
    sender: row.sender_name,
    senderId: row.sender_id,
    text: row.content,
    type: row.content_type,
    time: formatTime(row.created_at),
    dateLabel: 'Today',
  };
}

async function isMember(roomId, userId) {
  const row = await db.getOne(
    isPg
      ? 'SELECT 1 FROM chat_members WHERE room_id = $1 AND user_id = $2'
      : 'SELECT 1 AS ok FROM chat_members WHERE room_id = ? AND user_id = ?',
    [roomId, userId]
  );
  if (row) return true;

  if (roomId.startsWith('chat-dm-') || roomId.startsWith('chat-friend-') || roomId.startsWith('chat-fallback-')) {
    const ts = now();
    await db.run(
      isPg
        ? `INSERT INTO chat_rooms (id, room_type, name, status, created_at) VALUES ($1, 'dm', 'Mock Room', 'ACTIVE', $2) ON CONFLICT (id) DO NOTHING`
        : `INSERT OR IGNORE INTO chat_rooms (id, room_type, name, status, created_at) VALUES (?, 'dm', 'Mock Room', 'ACTIVE', ?)`,
      isPg ? [roomId, ts] : [roomId, Date.now()]
    );
    await addMember(roomId, userId);
    return true;
  }
  return false;
}

async function addMember(roomId, userId) {
  const ts = now();
  await db.run(
    isPg
      ? `INSERT INTO chat_members (room_id, user_id, joined_at)
         VALUES ($1, $2, $3) ON CONFLICT (room_id, user_id) DO NOTHING`
      : `INSERT OR IGNORE INTO chat_members (room_id, user_id, joined_at) VALUES (?, ?, ?)`,
    [roomId, userId, ts]
  );
}

async function insertMessage({ roomId, senderId, senderName, contentType = 'TEXT', content }) {
  const id = crypto.randomUUID();
  const ts = now();
  await db.run(
    isPg
      ? `INSERT INTO chat_messages (id, room_id, sender_id, sender_name, content_type, content, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`
      : `INSERT INTO chat_messages (id, room_id, sender_id, sender_name, content_type, content, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
    isPg
      ? [id, roomId, senderId || null, senderName, contentType, content, ts]
      : [id, roomId, senderId || null, senderName, contentType, content, Date.now()]
  );
  return {
    id,
    roomId,
    sender: senderName,
    senderId,
    text: content,
    type: contentType,
    time: formatTime(ts),
  };
}

async function ensureBookingRoom({
  bookingId,
  hostUserId,
  name,
  meta = {},
  systemText,
  extraMemberIds = [],
}) {
  const roomId = bookingRoomId(bookingId);
  const existing = await db.getOne(
    isPg ? 'SELECT id FROM chat_rooms WHERE id = $1' : 'SELECT id FROM chat_rooms WHERE id = ?',
    [roomId]
  );

  const metaJson = isPg ? JSON.stringify(meta) : JSON.stringify(meta);
  const ts = now();

  if (!existing) {
    await db.run(
      isPg
        ? `INSERT INTO chat_rooms (id, room_type, booking_id, name, status, meta, created_at)
           VALUES ($1, 'game', $2, $3, 'ACTIVE', $4::jsonb, $5)`
        : `INSERT INTO chat_rooms (id, room_type, booking_id, name, status, meta, created_at)
           VALUES (?, 'game', ?, ?, 'ACTIVE', ?, ?)`,
      isPg
        ? [roomId, bookingId, name, metaJson, ts]
        : [roomId, bookingId, name, metaJson, Date.now()]
    );
    if (systemText) {
      await insertMessage({
        roomId,
        senderId: null,
        senderName: 'System',
        contentType: 'SYSTEM_ALERT',
        content: systemText,
      });
    }
  }

  await addMember(roomId, hostUserId);
  for (const uid of extraMemberIds) {
    if (uid && uid !== hostUserId) await addMember(roomId, uid);
  }

  return { roomId, created: !existing };
}

async function addBookingRoomMember(bookingId, userId) {
  const roomId = bookingRoomId(bookingId);
  const room = await db.getOne(
    isPg ? 'SELECT id FROM chat_rooms WHERE id = $1' : 'SELECT id FROM chat_rooms WHERE id = ?',
    [roomId]
  );
  if (!room) return null;
  await addMember(roomId, userId);
  return roomId;
}

async function getRoomMessages(roomId, { limit = 50, beforeId } = {}) {
  let query = '';
  let params = [];

  if (beforeId) {
    // Need to find the created_at of the beforeId message to paginate
    const beforeMsg = await db.getOne(
      isPg ? 'SELECT created_at FROM chat_messages WHERE id = $1' : 'SELECT created_at FROM chat_messages WHERE id = ?',
      [beforeId]
    );
    if (!beforeMsg) return []; // Invalid cursor
    
    query = isPg
      ? `SELECT * FROM chat_messages WHERE room_id = $1 AND created_at < $2 ORDER BY created_at DESC LIMIT $3`
      : `SELECT * FROM chat_messages WHERE room_id = ? AND created_at < ? ORDER BY created_at DESC LIMIT ?`;
    params = isPg ? [roomId, beforeMsg.created_at, limit] : [roomId, beforeMsg.created_at, limit];
  } else {
    query = isPg
      ? `SELECT * FROM chat_messages WHERE room_id = $1 ORDER BY created_at DESC LIMIT $2`
      : `SELECT * FROM chat_messages WHERE room_id = ? ORDER BY created_at DESC LIMIT ?`;
    params = [roomId, limit];
  }

  const rows = await db.getAll(query, params);
  return rows.reverse().map(rowToMessage);
}

async function countUnread(roomId, userId) {
  const member = await db.getOne(
    isPg
      ? 'SELECT last_read_at FROM chat_members WHERE room_id = $1 AND user_id = $2'
      : 'SELECT last_read_at FROM chat_members WHERE room_id = ? AND user_id = ?',
    [roomId, userId]
  );
  const lastRead = member?.last_read_at
    ? (isPg ? new Date(member.last_read_at).getTime() : member.last_read_at)
    : 0;
  const row = await db.getOne(
    isPg
      ? `SELECT COUNT(*)::int AS count FROM chat_messages
         WHERE room_id = $1 AND created_at > $2 AND sender_id IS DISTINCT FROM $3`
      : `SELECT COUNT(*) AS count FROM chat_messages
         WHERE room_id = ? AND created_at > ? AND (sender_id IS NULL OR sender_id != ?)`,
    isPg ? [roomId, lastRead ? new Date(lastRead) : new Date(0), userId] : [roomId, lastRead || 0, userId]
  );
  return Number(row?.count || 0);
}

async function markRoomRead(roomId, userId) {
  const ts = now();
  await db.run(
    isPg
      ? 'UPDATE chat_members SET last_read_at = $1 WHERE room_id = $2 AND user_id = $3'
      : 'UPDATE chat_members SET last_read_at = ? WHERE room_id = ? AND user_id = ?',
    [ts, roomId, userId]
  );
}

async function listUserRooms(userId) {
  const rooms = await db.getAll(
    isPg
      ? `SELECT r.* FROM chat_rooms r
         JOIN chat_members m ON m.room_id = r.id
         WHERE m.user_id = $1 AND r.status = 'ACTIVE'
         ORDER BY r.created_at DESC`
      : `SELECT r.* FROM chat_rooms r
         JOIN chat_members m ON m.room_id = r.id
         WHERE m.user_id = ? AND r.status = 'ACTIVE'
         ORDER BY r.created_at DESC`,
    [userId]
  );

  const result = [];
  for (const room of rooms) {
    const messages = await getRoomMessages(room.id, { limit: 40 });
    const unread = await countUnread(room.id, userId);
    result.push({
      id: room.id,
      name: room.name,
      type: room.room_type || 'game',
      bookingId: room.booking_id,
      meta: parseMeta(room.meta),
      unread,
      messages,
      isActive: room.status === 'ACTIVE',
    });
  }
  return result;
}

async function saveUserMessage({ roomId, userId, userName, text, type = 'TEXT' }) {
  if (!(await isMember(roomId, userId))) {
    throw Object.assign(new Error('Not a member of this chat'), { status: 403 });
  }
  if (type === 'IMAGE') {
    const since = Date.now() - 60000;
    const row = await db.getOne(
      isPg
        ? `SELECT COUNT(*)::int AS count FROM chat_messages
           WHERE room_id = $1 AND sender_id = $2 AND content_type = 'IMAGE' AND created_at > $3`
        : `SELECT COUNT(*) AS count FROM chat_messages
           WHERE room_id = ? AND sender_id = ? AND content_type = 'IMAGE' AND created_at > ?`,
      isPg ? [roomId, userId, new Date(since)] : [roomId, userId, since]
    );
    if (Number(row?.count || 0) >= 3) {
      throw Object.assign(new Error('Rate limit: Max 3 images per minute'), { status: 429 });
    }
  }
  return insertMessage({
    roomId,
    senderId: userId,
    senderName: userName,
    contentType: type,
    content: text,
  });
}

async function saveRoomKeys(roomId, keysObj) {
  // keysObj is { userId: encryptedKey, ... }
  for (const [userId, encryptedKey] of Object.entries(keysObj)) {
    if (isPg) {
      await db.run(
        `INSERT INTO chat_room_keys (room_id, user_id, encrypted_key) 
         VALUES ($1, $2, $3)
         ON CONFLICT (room_id, user_id) DO UPDATE SET encrypted_key = EXCLUDED.encrypted_key`,
        [roomId, userId, encryptedKey]
      );
    } else {
      await db.run(
        `INSERT INTO chat_room_keys (room_id, user_id, encrypted_key)
         VALUES (?, ?, ?)
         ON CONFLICT(room_id, user_id) DO UPDATE SET encrypted_key = excluded.encrypted_key`,
        [roomId, userId, encryptedKey]
      );
    }
  }
}

async function getRoomKeyAndMembers(roomId, userId) {
  const memberKeyRow = await db.getOne(
    isPg ? 'SELECT encrypted_key FROM chat_room_keys WHERE room_id = $1 AND user_id = $2'
         : 'SELECT encrypted_key FROM chat_room_keys WHERE room_id = ? AND user_id = ?',
    [roomId, userId]
  );
  
  const members = await db.getAll(
    isPg ? `SELECT m.user_id, u.public_key FROM chat_members m
            JOIN users u ON u.id = m.user_id
            WHERE m.room_id = $1`
         : `SELECT m.user_id, u.public_key FROM chat_members m
            JOIN users u ON u.id = m.user_id
            WHERE m.room_id = ?`,
    [roomId]
  );
  
  return {
    encryptedKey: memberKeyRow?.encrypted_key || null,
    members: members.map(m => ({ userId: m.user_id, publicKey: m.public_key }))
  };
}

module.exports = {
  bookingRoomId,
  ensureBookingRoom,
  addBookingRoomMember,
  listUserRooms,
  getRoomMessages,
  saveUserMessage,
  markRoomRead,
  isMember,
  insertMessage,
  saveRoomKeys,
  getRoomKeyAndMembers,
};
