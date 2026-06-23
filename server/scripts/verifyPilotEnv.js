/**
 * Phase 4b — Verify pilot/staging environment before deploy.
 * Usage: npm run verify:pilot --prefix server
 *        API_URL=https://... npm run verify:pilot --prefix server
 */
require('dotenv').config();
const config = require('../lib/config');

const API_BASE = (process.env.API_URL || `http://localhost:${config.port}`).replace(/\/$/, '');

const SERVER_REQUIRED = ['JWT_SECRET'];
const SERVER_PILOT = ['MSG91_AUTH_KEY', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'APP_URL'];

function check(name, ok, detail = '') {
  const mark = ok ? '✓' : '✗';
  console.log(`  ${mark} ${name}${detail ? ` — ${detail}` : ''}`);
  return ok;
}

async function main() {
  console.log('\n[pilot] TurfMate staging environment check\n');
  console.log(`API: ${API_BASE}`);

  let pass = true;

  console.log('\nServer config:');
  for (const key of SERVER_REQUIRED) {
    const val = process.env[key];
    pass = check(key, Boolean(val && val.length >= 16), val ? 'set' : 'missing or too short') && pass;
  }

  const pilotMode = process.env.DEMO_MODE === 'false';
  console.log(`\nPilot mode (DEMO_MODE=false): ${pilotMode ? 'yes' : 'no (demo still on)'}`);

  if (pilotMode) {
    console.log('\nPilot integrations (required for live OTP + payments):');
    for (const key of SERVER_PILOT) {
      pass = check(key, Boolean(process.env[key]), process.env[key] ? 'set' : 'missing') && pass;
    }
  }

  console.log('\nAPI health:');
  try {
    const res = await fetch(`${API_BASE}/health`);
    const body = await res.json().catch(() => ({}));
    pass = check('GET /health', res.ok && body.ok, `${res.status} db=${body.db?.driver}`) && pass;
    if (body.db) {
      check('DB ping', body.db.ok, `${body.db.latencyMs}ms`);
    }
  } catch (err) {
    pass = check('GET /health', false, err.message) && false;
  }

  try {
    const res = await fetch(`${API_BASE}/api/health?detailed=1`);
    const body = await res.json().catch(() => ({}));
    pass = check('GET /api/health', res.ok && body.ok, res.status) && pass;
  } catch (err) {
    pass = check('GET /api/health', false, err.message) && false;
  }

  console.log('\nPublic API smoke:');
  try {
    const res = await fetch(`${API_BASE}/api/turfs?lat=19.456&lng=72.812&radius_km=20`);
    const body = await res.json().catch(() => ({}));
    const count = body.turfs?.length ?? 0;
    pass = check('GET /api/turfs', res.ok, `${count} turfs`) && pass;
    if (pilotMode && count < 2) {
      console.log('  ⚠ Run npm run seed:pilot on Railway or set SEED_PILOT_ON_START=true once');
    }
  } catch (err) {
    pass = check('GET /api/turfs', false, err.message) && false;
  }

  console.log(`\n${pass ? 'PASS' : 'FAIL'} — fix items above before pilot launch.\n`);
  process.exit(pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
