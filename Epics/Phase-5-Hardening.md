# Phase 5 — Production hardening

**Goal:** Security, performance, PWA installability, and observability for scale.

---

## Slices

| Slice | Status | Summary |
|-------|--------|---------|
| **5a** | ✅ | PWA manifest + install prompt; API rate limits; lazy route loading |
| **5b** | ✅ | Structured JSON request logs + `/health` with DB ping |
| **5c** | ✅ | Account deletion API + data retention policy |
| **5d** | ⏳ | Load test script (100 concurrent slot locks) |

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

## Exit criteria (Phase 5)

- [ ] Load test: 100 concurrent checkout attempts, 0 double-books
- [ ] Pen test or OWASP top-10 review
- [ ] PWA installable on Android Chrome + iOS Safari (Add to Home Screen)

---

## Next slices

| Slice | Work |
|-------|------|
| **5d** | `scripts/load-test-locks.mjs` k6 or autocannon |
