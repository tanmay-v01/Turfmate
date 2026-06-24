# OWASP Top 10 — TurfMate API review (Phase 5e)

Automated smoke: `npm run security:audit`  
Manual review date: 2026-06-24

| # | Risk | Status | Notes |
|---|------|--------|-------|
| A01 | Broken access control | ✅ | `authRequired` + `loadUser` on protected routes; role checks on admin/owner |
| A02 | Cryptographic failures | ✅ | JWT HS256; production requires `JWT_SECRET` ≥32 chars; HTTPS via host |
| A03 | Injection | ✅ | Parameterized queries throughout repositories |
| A04 | Insecure design | ⚠️ | Slot lock race mitigated by `UNIQUE(slot_key)` on locks + partial unique index on bookings |
| A05 | Security misconfiguration | ✅ | `validateProductionConfig` fails boot if demo/JWT/CORS mis-set in prod |
| A06 | Vulnerable components | ⚠️ | Run `npm audit` in CI; pin major deps |
| A07 | Auth failures | ✅ | OTP rate limit 20/15min; JWT expiry; deleted users rejected |
| A08 | Data integrity failures | ✅ | Razorpay webhook signature verify; booking slot unique index |
| A09 | Logging failures | ✅ | Structured JSON logs (`server/lib/logger.js`) |
| A10 | SSRF | N/A | No user-controlled outbound fetch |

## Headers (API)

Set via `server/middleware/securityHeaders.js`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` (production only)

## Pre-production checklist

- [ ] `NODE_ENV=production`
- [ ] `DEMO_MODE=false`
- [ ] `JWT_SECRET` — random 32+ chars (not default)
- [ ] `DATABASE_URL` — Postgres with backups
- [ ] `CORS_ORIGIN` — explicit Vercel app URL(s)
- [ ] `RAZORPAY_WEBHOOK_SECRET` set when payments live
- [ ] Run `npm run security:audit` against staging API
- [ ] Run `npm run load-test:locks` after deploy

## Remaining (post-pilot)

- WAF / Cloudflare in front of API
- Secrets vault (Railway env vars OK for pilot)
- Third-party pen test before scale
