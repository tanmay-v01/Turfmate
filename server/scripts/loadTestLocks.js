/**
 * Phase 5d — concurrent slot lock + checkout load test.
 *
 * Usage:
 *   npm run load-test:locks
 *   API_URL=http://localhost:3001 LOAD_TEST_CONCURRENCY=100 npm run load-test:locks
 *
 * Requires API running. Provisions test users via DB (avoids OTP rate limits).
 */
require('dotenv').config();

const crypto = require('crypto');
const db = require('../db/index');
const jwtService = require('../services/jwtService');

const API_BASE = (process.env.API_URL || 'http://localhost:3001').replace(/\/$/, '');
const CONCURRENCY = Number(process.env.LOAD_TEST_CONCURRENCY || 100);
const TURF_ID = process.env.LOAD_TEST_TURF || 'turf-1';
const SLOT_ID = process.env.LOAD_TEST_SLOT || `loadtest-${Date.now()}`;
const DATE_LABEL = process.env.LOAD_TEST_DATE || 'LoadTest';
const isPg = db.driver === 'postgres';

function slotKey(turfLegacyId, slotId, dateLabel) {
  return `${turfLegacyId}:${slotId}:${dateLabel}`;
}

async function request(method, path, body, token) {
  try {
    const res = await fetch(`${API_BASE}/api${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body != null ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  } catch (err) {
    return { status: 0, data: { error: err.message } };
  }
}

async function provisionUsers(count) {
  const ts = isPg ? new Date() : Date.now();
  const users = [];
  for (let i = 0; i < count; i++) {
    const phone = `92${String(10000000 + i).slice(-8)}`;
    let user = await db.getOne('SELECT * FROM users WHERE phone = $1', [phone]);
    if (!user) {
      const id = crypto.randomUUID();
      await db.run(
        isPg
          ? `INSERT INTO users (id, phone, role, status, onboarding_complete, created_at, updated_at)
             VALUES ($1, $2, 'PLAYER', 'ACTIVE', TRUE, $3, $3)`
          : `INSERT INTO users (id, phone, role, status, onboarding_complete, created_at, updated_at)
             VALUES (?, ?, 'PLAYER', 'ACTIVE', 1, ?, ?)`,
        isPg ? [id, phone, ts] : [id, phone, Date.now(), Date.now()]
      );
      user = await db.getOne('SELECT * FROM users WHERE phone = $1', [phone]);
    }
    users.push({ user, token: jwtService.sign(user) });
  }
  return users;
}

async function countLocks(key) {
  const row = await db.getOne(
    isPg
      ? 'SELECT COUNT(*)::int AS c FROM slot_locks WHERE slot_key = $1'
      : 'SELECT COUNT(*) AS c FROM slot_locks WHERE slot_key = ?',
    [key]
  );
  return Number(row?.c || 0);
}

async function countBookings(key) {
  const row = await db.getOne(
    isPg
      ? `SELECT COUNT(*)::int AS c FROM bookings
         WHERE slot_key = $1 AND status IN ('CONFIRMED', 'PENDING_FUNDING')`
      : `SELECT COUNT(*) AS c FROM bookings
         WHERE slot_key = ? AND status IN ('CONFIRMED', 'PENDING_FUNDING')`,
    [key]
  );
  return Number(row?.c || 0);
}

async function cleanup(key) {
  await db.run(
    isPg ? 'DELETE FROM slot_locks WHERE slot_key = $1' : 'DELETE FROM slot_locks WHERE slot_key = ?',
    [key]
  );
  const bookings = await db.getAll(
    isPg
      ? `SELECT id FROM bookings WHERE slot_key = $1`
      : `SELECT id FROM bookings WHERE slot_key = ?`,
    [key]
  );
  for (const b of bookings) {
    await db.run(
      isPg ? 'DELETE FROM booking_roster WHERE booking_id = $1' : 'DELETE FROM booking_roster WHERE booking_id = ?',
      [b.id]
    );
    await db.run(
      isPg ? 'DELETE FROM bookings WHERE id = $1' : 'DELETE FROM bookings WHERE id = ?',
      [b.id]
    );
  }
}

function tally(results) {
  const counts = {};
  for (const r of results) {
    counts[r.status] = (counts[r.status] || 0) + 1;
  }
  return counts;
}

async function main() {
  console.log(`\n[load-test] ${CONCURRENCY} concurrent locks → ${API_BASE}`);
  console.log(`  turf=${TURF_ID} slot=${SLOT_ID} date=${DATE_LABEL}\n`);

  const health = await fetch(`${API_BASE}/health`);
  if (!health.ok) {
    throw new Error(`API not reachable at ${API_BASE}/health`);
  }

  await db.migrate();
  const key = slotKey(TURF_ID, SLOT_ID, DATE_LABEL);
  await cleanup(key);

  const clients = await provisionUsers(CONCURRENCY);
  const body = { turfId: TURF_ID, slotId: SLOT_ID, date: DATE_LABEL };

  const lockResults = await Promise.all(
    clients.map(({ token }) => request('POST', '/bookings/lock', body, token))
  );
  const lockTally = tally(lockResults);
  const lockRows = await countLocks(key);
  const winners = lockResults.filter((r) => r.status === 200);

  console.log('Lock phase:', lockTally);
  console.log(`  DB lock rows: ${lockRows}`);
  console.log(`  HTTP 200 winners: ${winners.length}`);

  const lockOk = lockRows === 1 && winners.length >= 1;
  const networkErrors = lockResults.filter((r) => r.status === 0).length;
  if (networkErrors > 0) {
    console.warn(`  network errors: ${networkErrors}`);
  }
  if (!lockOk) {
    console.error('\nFAIL — expected exactly 1 lock row and at least 1 successful lock\n');
    process.exit(1);
  }

  const winnerIdx = lockResults.findIndex((r) => r.status === 200);

  const checkoutResults = await Promise.all(
    clients.map(({ token }) =>
      request(
        'POST',
        '/bookings/checkout',
        { ...body, slotTime: '18:00', amount: 1200 },
        token
      )
    )
  );
  const checkoutTally = tally(checkoutResults);
  const bookingRows = await countBookings(key);
  const checkoutWins = checkoutResults.filter((r) => r.status === 200);

  console.log('\nCheckout phase:', checkoutTally);
  console.log(`  DB confirmed bookings: ${bookingRows}`);
  console.log(`  HTTP 200 checkouts: ${checkoutWins.length}`);

  await cleanup(key);

  const checkoutOk = bookingRows === 1 && checkoutWins.length <= 1;
  if (!checkoutOk) {
    console.error('\nFAIL — expected exactly 1 booking (0 double-books)\n');
    process.exit(1);
  }

  if (checkoutWins.length === 0) {
    console.warn('  (note: booking created but HTTP response was not 200 — check ledger/chat post-hooks)');
  }

  console.log('\nPASS — 0 double-books under concurrent load\n');
}

main().catch((err) => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
