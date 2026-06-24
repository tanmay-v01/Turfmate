# Phase 5 — Production hardening

**Goal:** Security, performance, PWA installability, and observability for scale.

---

## Slices

| Slice | Status | Summary |
|-------|--------|---------|
| **5a** | ✅ | PWA manifest + install prompt; API rate limits; lazy route loading |
| **5b** | ✅ | Structured JSON request logs + `/health` with DB ping |
| **5c** | ✅ | Account deletion API + data retention policy |
| **5d** | ✅ | Load test script (100 concurrent slot locks) |
| **5e** | ✅ | OWASP security headers, prod config guard, booking uniqueness |

---

## 5a — PWA + rate limits + code split

**PWA**
- `public/manifest.webmanifest` + `public/icon.svg`
- `InstallPrompt` — `beforeinstallprompt` banner on mobile
- `index.html` — manifest link, `apple-mobile-web-app-capable`

**API security**
- `server/middleware/rateLimit.js`
- Auth routes: 20 req / 15 min per IP (OTP abuse protection)
- Other `/api/*`: 180 req / min per IP

**Performance**
- `PageRouter` — `React.lazy` for non-critical screens (admin, owner, heavy user views)
- Reduces initial JS bundle on first load

---

## 5b — Observability

**Structured logging**
- `server/lib/logger.js` — JSON lines to stdout (`LOG_LEVEL=info|warn|error|debug`)
- `server/middleware/requestLog.js` — logs method, path, status, durationMs per request

**Health checks**
- `GET /health` and `GET /api/health` — DB ping, uptime, memory, driver
- `?detailed=1` — adds `activeTurfs` + `pendingKyc` counts
- Returns **503** when database is unreachable (`ok: false`)

Railway log drain example filter: `level:info msg:http_request`

---

## 5c — Account deletion

**API**
- `DELETE /api/users/me` — soft-delete (`status = DELETED`, `deleted_at` set)
- Anonymizes `phone`, clears `player_profiles` PII, removes `push_tokens` + `user_notifications`
- Blocks self-delete for `OWNER` and `SUPER_ADMIN` (403 — contact support)

**Migration**
- `013_user_deletion.sql` — `deleted_at` column + `DELETED` status in check constraint

**Frontend**
- `authApi.deleteMe()` + `deleteMyAccount` in `useAppState` (confirm → API → `resetApp`)
- Sidebar “Delete account” link for logged-in players

**Retention**
- Booking rows kept for settlement/audit; player identity unlinked via anonymized profile
- Owners/admins must contact support to close business accounts

---

## 5d — Slot lock load test

**Script**
- `scripts/load-test-locks.mjs` → `server/scripts/loadTestLocks.js`
- `npm run load-test:locks` (API must be running on `API_URL`, default `http://localhost:3001`)

**What it does**
1. Provisions `LOAD_TEST_CONCURRENCY` (default **100**) test users via DB (skips OTP rate limits)
2. Fires concurrent `POST /api/bookings/lock` on the same slot → asserts **1** lock row in DB
3. Fires concurrent `POST /api/bookings/checkout` from all users → asserts **1** confirmed booking (0 double-books)
4. Cleans up test locks/bookings

**Env overrides**
- `LOAD_TEST_CONCURRENCY`, `LOAD_TEST_TURF`, `LOAD_TEST_SLOT`, `LOAD_TEST_DATE`, `API_URL`

---

## 5e — OWASP security pass

**API hardening**
- `server/middleware/securityHeaders.js` — `nosniff`, `DENY` framing, `Referrer-Policy`, HSTS in production
- `server/lib/validateProduction.js` — fails boot when `NODE_ENV=production` with weak JWT, demo mode, or wildcard CORS
- Migration `014_booking_slot_unique.sql` — partial unique index on active `bookings.slot_key`
- Race-safe lock/checkout — unique violations return **409**; post-checkout ledger/chat failures logged, not 500

**Audit**
- `npm run security:audit` — checks headers, auth, CORS, OTP rate limit
- `Epics/OWASP-Review.md` — Top 10 checklist with status

---

## Exit criteria (Phase 5)

- [x] Load test: 100 concurrent checkout attempts, 0 double-books (`npm run load-test:locks`)
- [x] Pen test or OWASP top-10 review (`npm run security:audit` + `Epics/OWASP-Review.md`)
- [ ] PWA installable on Android Chrome + iOS Safari (Add to Home Screen)
