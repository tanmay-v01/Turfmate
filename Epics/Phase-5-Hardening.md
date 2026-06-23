# Phase 5 — Production hardening

**Goal:** Security, performance, PWA installability, and observability for scale.

---

## Slices

| Slice | Status | Summary |
|-------|--------|---------|
| **5a** | ✅ | PWA manifest + install prompt; API rate limits; lazy route loading |
| **5b** | ✅ | Structured JSON request logs + `/health` with DB ping |
| **5c** | ⏳ | Account deletion API + data retention policy |
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

## Exit criteria (Phase 5)

- [ ] Load test: 100 concurrent checkout attempts, 0 double-books
- [ ] Pen test or OWASP top-10 review
- [ ] PWA installable on Android Chrome + iOS Safari (Add to Home Screen)

---

## Next slices

| Slice | Work |
|-------|------|
| **5c** | `DELETE /api/users/me` soft-delete + anonymize |
| **5d** | `scripts/load-test-locks.mjs` k6 or autocannon |
