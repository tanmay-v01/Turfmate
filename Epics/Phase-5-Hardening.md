# Phase 5 — Production hardening

**Goal:** Security, performance, PWA installability, and observability for scale.

---

## Slices

| Slice | Status | Summary |
|-------|--------|---------|
| **5a** | ✅ | PWA manifest + install prompt; API rate limits; lazy route loading |
| **5b** | ⏳ | Structured request logging + health metrics |
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

## Exit criteria (Phase 5)

- [ ] Load test: 100 concurrent checkout attempts, 0 double-books
- [ ] Pen test or OWASP top-10 review
- [ ] PWA installable on Android Chrome + iOS Safari (Add to Home Screen)

---

## Next slices

| Slice | Work |
|-------|------|
| **5b** | `pino` or structured JSON logs; `/api/health` with DB ping |
| **5c** | `DELETE /api/users/me` soft-delete + anonymize |
| **5d** | `scripts/load-test-locks.mjs` k6 or autocannon |
