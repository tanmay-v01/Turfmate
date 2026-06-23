/**
 * Phase 4d — Pilot QA smoke test (API + booking flow).
 * Usage:
 *   npm run pilot:smoke --prefix server              # local, demo OTP
 *   API_URL=https://api... PILOT_SMOKE_DEMO=true npm run pilot:smoke --prefix server
 */
require('dotenv').config();

const API_BASE = (process.env.API_URL || 'http://localhost:3001').replace(/\/$/, '');
const USE_DEMO_OTP = process.env.PILOT_SMOKE_DEMO !== 'false';

async function request(method, path, body, token) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${data.error || res.statusText}`);
  return data;
}

function step(label, ok, detail = '') {
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  return ok;
}

async function main() {
  console.log(`\n[pilot QA] Smoke test → ${API_BASE}\n`);
  let pass = true;

  try {
    const health = await fetch(`${API_BASE}/health`);
    const h = await health.json();
    pass = step('Health check', health.ok && h.ok) && pass;
  } catch (err) {
    pass = step('Health check', false, err.message) && false;
  }

  const turfsRes = await request('GET', '/turfs?lat=19.456&lng=72.812&radius_km=25');
  const turfs = turfsRes.turfs || [];
  pass = step('List turfs', turfs.length >= 2, `${turfs.length} found`) && pass;

  const splitsRes = await request('GET', '/splits/open');
  pass = step('Open splits feed', Array.isArray(splitsRes.splits), `${splitsRes.count || 0} splits`) && pass;

  const broadcastsRes = await request('GET', '/broadcasts/active');
  pass = step('Active broadcasts', Array.isArray(broadcastsRes.broadcasts)) && pass;

  if (!USE_DEMO_OTP) {
    console.log('\nSkipping auth flow (set PILOT_SMOKE_DEMO=true for automated OTP test)\n');
    process.exit(pass ? 0 : 1);
  }

  await request('POST', '/auth/send-otp', { phone: '9876543210' });
  pass = step('Send OTP', true) && pass;

  const { token, profile } = await request('POST', '/auth/verify-otp', { phone: '9876543210', otp: '1234' });
  pass = step('Verify OTP + JWT', Boolean(token), profile?.role || 'PLAYER') && pass;

  const { bookings } = await request('GET', '/bookings/me', null, token);
  pass = step('My bookings API', Array.isArray(bookings)) && pass;

  const turf = turfs.find((t) => t.id === 'turf-1') || turfs[0];
  if (turf?.slots?.length) {
    const slot = turf.slots.find((s) => s.status === 'available') || turf.slots[0];
    const lock = await request('POST', '/bookings/lock', {
      turfId: turf.id,
      slotId: slot.id,
      date: 'Today',
    }, token);
    pass = step('Slot lock', Boolean(lock.expiresAt), slot.id) && pass;
  } else {
    pass = step('Slot lock', false, 'no slots on turf') && false;
  }

  const admin = await request('POST', '/auth/verify-otp', { phone: '9999999999', otp: '1234' });
  const pending = await request('GET', '/admin/kyc/pending', null, admin.token);
  pass = step('Admin KYC queue', Array.isArray(pending.owners), `${pending.count || 0} pending`) && pass;

  console.log(`\n${pass ? 'PASS' : 'FAIL'} — see Epics/Pilot-QA-Checklist.md for full manual QA.\n`);
  process.exit(pass ? 0 : 1);
}

main().catch((err) => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
