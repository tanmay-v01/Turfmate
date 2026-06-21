# Phase 1 — Backend & Auth

**Goal:** Real OTP auth, JWT sessions, user profiles in Postgres (SQLite locally).

---

## What shipped (Slice 1)

| Area | Status |
|------|--------|
| Postgres schema | `server/migrations/001_phase1_core.sql` |
| DB layer | `server/db/` — Postgres when `DATABASE_URL` set, else SQLite |
| Auth API | `POST /api/auth/send-otp`, `POST /api/auth/verify-otp` |
| Users API | `GET/PATCH /api/users/me` (JWT Bearer) |
| Frontend | `authApi` + login wired in `useAppState` |
| Demo users | `9876543210`, `1111111111`, `9999999999` — OTP `1234` |

---

## Railway setup (Postgres)

1. Railway project → **+ New** → **Database** → **PostgreSQL**
2. Copy `DATABASE_URL` from Postgres service → paste into **Turfmate API** service variables
3. Add to API service:

   | Variable | Value |
   |----------|--------|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` or paste connection string |
   | `JWT_SECRET` | long random string (32+ chars) |
   | `DEMO_MODE` | `true` (until MSG91 live) |
   | `SEED_ON_START` | `true` (seeds demo users on deploy) |
   | `CORS_ORIGIN` | `https://turfmate-gray.vercel.app` |

4. Redeploy API. Check logs for `[Phase 1] Database driver: postgres`

---

## Local dev

```bash
cp server/.env.example server/.env
npm install --prefix server
npm run migrate --prefix server   # creates SQLite auth tables + seeds demo users
npm run dev:server
```

Test:

```bash
curl -X POST http://localhost:3001/api/auth/send-otp -H "Content-Type: application/json" -d "{\"phone\":\"9876543210\"}"
curl -X POST http://localhost:3001/api/auth/verify-otp -H "Content-Type: application/json" -d "{\"phone\":\"9876543210\",\"otp\":\"1234\"}"
```

---

## Next slices (Phase 1 continued)

| Slice | Work |
|-------|------|
| **1b** | Turfs/slots API from DB; seed Virar turfs |
| **1c** | Bookings + slot locks server-side (Redis optional) |
| **1d** | Split escrow persisted in Postgres |
| **1e** | Owner KYC + admin approval API |

---

## Exit criteria (full Phase 1)

- [x] OTP verify → JWT + profile in DB  
- [ ] Two browsers cannot double-book same slot  
- [ ] Split state in DB, not localStorage  
- [ ] Turfs loaded from API  
