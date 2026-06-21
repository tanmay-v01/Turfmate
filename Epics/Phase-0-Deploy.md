# Phase 0 — Deploy checklist

**Goal:** Public demo URL + API health endpoint + CI. No real payments yet (`VITE_DEMO_MODE=true`).

---

## Checklist

### A. Repository

- [ ] `git init` and push to GitHub (see commands below)
- [x] CI workflow (`.github/workflows/ci.yml`) — build frontend + install server deps
- [x] `.gitignore` — excludes `.env`, `node_modules`, `*.db`
- [x] `.env.example` + `server/.env.example`

### B. Frontend → Vercel

1. Push repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → Import repository.
3. Framework: **Vite** (auto-detected via `vercel.json`).
4. **Environment variables** (Project → Settings → Environment Variables):

   | Name | Example value |
   |------|----------------|
   | `VITE_API_URL` | `https://turfmate-api-production.up.railway.app/api` |
   | `VITE_SOCKET_URL` | `https://turfmate-api-production.up.railway.app` |
   | `VITE_APP_URL` | `https://turfmate.vercel.app` |
   | `VITE_DEMO_MODE` | `true` |

5. Deploy. Test: app loads, login works with demo OTP.

**SPA / deep links:** `vercel.json` rewrites all routes to `index.html` so `#join/ann-id` split invites work.

### C. API → Railway

1. [railway.app/new](https://railway.app/new) → Deploy from GitHub repo.
2. Railway reads **`railway.toml`** at repo root.
3. **Environment variables** (Railway → Variables):

   | Name | Value |
   |------|--------|
   | `CORS_ORIGIN` | Your Vercel URL (no trailing slash), e.g. `https://turfmate.vercel.app` |
   | `NODE_ENV` | `production` |
   | `PORT` | `3001` (Railway may inject `PORT` — leave unset if Railway sets it automatically) |

4. After deploy, open **`https://YOUR-SERVICE.up.railway.app/health`** — expect:

   ```json
   { "ok": true, "service": "turfmate-api", "ts": 1234567890 }
   ```

5. Copy Railway public URL into Vercel `VITE_API_URL` / `VITE_SOCKET_URL` and **redeploy** Vercel.

**Note:** SQLite on Railway is ephemeral unless you attach a volume. Fine for Phase 0 demo; Phase 1 moves to Postgres.

### D. Custom domain (optional for Phase 0)

| Record | Points to |
|--------|-----------|
| `app.turfmate.in` CNAME | `cname.vercel-dns.com` (Vercel custom domain wizard) |
| `api.turfmate.in` CNAME | Railway custom domain target |

Update env vars to use custom domains, then redeploy both services.

### E. Verify end-to-end

- [ ] `GET /health` returns 200
- [ ] Vercel app loads on mobile
- [ ] Demo login `9876543210` / `1234` works
- [ ] Booking attempt hits API (Network tab → `/api/bookings/lock`) — may fail if DB empty; lock endpoint should respond
- [ ] Split invite link copies with correct `#join/` hash

---

## GitHub setup (one-time)

```bash
cd turfmate
git init
git add .
git commit -m "Phase 0: TurfMate demo foundation with deploy configs"
git branch -M main
git remote add origin https://github.com/YOUR_ORG/turfmate.git
git push -u origin main
```

Then connect the repo to Vercel and Railway.

---

## Local production preview

```bash
npm run build
npm run preview
# → http://localhost:4173

npm start --prefix server
# → http://localhost:3001/health
```

Set `.env.local`:

```
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
VITE_DEMO_MODE=true
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error in browser | Set `CORS_ORIGIN` on Railway to exact Vercel URL (https, no path) |
| API URL wrong | Must include `/api` suffix in `VITE_API_URL` |
| Demo login blocked | Set `VITE_DEMO_MODE=true` on Vercel |
| Railway build fails on sqlite3 | Nixpacks should compile native deps; ensure Node 20 |
| Blank page after deploy | Check Vercel build logs; ensure `dist` output |

---

## Phase 0 complete when

- [ ] Public Vercel URL shared with stakeholders
- [ ] Railway `/health` green
- [ ] CI green on `main`
- [ ] Custom domains configured (optional)

**Next:** [Production Roadmap — Phase 1](./Production%20Roadmap.md#phase-1--backend--data-model-weeks-36)
