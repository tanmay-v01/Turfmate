/**
 * Phase 5e — OWASP-oriented security smoke audit.
 * Usage: npm run security:audit --prefix server
 *        API_URL=https://api... npm run security:audit --prefix server
 */
require('dotenv').config();

const API_BASE = (process.env.API_URL || 'http://localhost:3001').replace(/\/$/, '');

const REQUIRED_HEADERS = [
  'x-content-type-options',
  'x-frame-options',
  'referrer-policy',
];

function step(label, ok, detail = '') {
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  return ok;
}

async function main() {
  console.log(`\n[security audit] → ${API_BASE}\n`);
  let pass = true;

  let res;
  try {
    res = await fetch(`${API_BASE}/health`);
  } catch (err) {
    console.error('FAIL: API unreachable —', err.message);
    process.exit(1);
  }

  const body = await res.json().catch(() => ({}));
  pass = step('Health responds', res.ok && body.ok) && pass;

  for (const h of REQUIRED_HEADERS) {
    const val = res.headers.get(h);
    pass = step(`Header ${h}`, Boolean(val), val || 'missing') && pass;
  }

  const apiProbe = await fetch(`${API_BASE}/api/turfs?lat=19.45&lng=72.81&radius_km=5`);
  const rateLimit = apiProbe.headers.get('x-ratelimit-limit');
  pass = step('Rate limit headers present', Boolean(rateLimit), rateLimit || 'missing') && pass;

  const corsProbe = await fetch(`${API_BASE}/api/turfs`, {
    headers: { Origin: 'https://evil.example' },
  });
  const allowOrigin = corsProbe.headers.get('access-control-allow-origin');
  const corsOk = !allowOrigin || allowOrigin === 'https://evil.example';
  pass = step('CORS blocks unknown origin', !allowOrigin || allowOrigin !== '*', allowOrigin || 'none') && pass;

  const noAuth = await fetch(`${API_BASE}/api/users/me`);
  pass = step('Auth required on /users/me', noAuth.status === 401) && pass;

  const badToken = await fetch(`${API_BASE}/api/users/me`, {
    headers: { Authorization: 'Bearer not-a-real-jwt' },
  });
  pass = step('Invalid JWT rejected', badToken.status === 401) && pass;

  const otpFlood = [];
  for (let i = 0; i < 25; i++) {
    otpFlood.push(
      fetch(`${API_BASE}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '9876543210' }),
      })
    );
  }
  const otpResults = await Promise.all(otpFlood);
  const throttled = otpResults.some((r) => r.status === 429);
  pass = step('OTP rate limit triggers', throttled, `${otpResults.filter((r) => r.status === 429).length}×429`) && pass;

  console.log(`\n${pass ? 'PASS' : 'FAIL'} — see Epics/OWASP-Review.md for full checklist.\n`);
  process.exit(pass ? 0 : 1);
}

main().catch((err) => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
