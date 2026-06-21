# TurfMate

B2B2C turf booking app — React (Vite) + optional Express/SQLite API.

## Quick start (local)

```bash
# Terminal 1 — frontend (http://localhost:3000)
cp .env.example .env.local
npm install
npm run dev

# Terminal 2 — API (http://localhost:3001)
cp server/.env.example server/.env
npm run dev:server
```

Demo login: player `9876543210`, OTP `1234` (requires `VITE_DEMO_MODE=true`).

## Phase 0 — deploy (foundation)

Full checklist: **[Epics/Phase-0-Deploy.md](./Epics/Phase-0-Deploy.md)**

| Service | Platform | Root / command |
|---------|----------|----------------|
| Frontend | **Vercel** | Build: `npm run build` · Output: `dist` |
| API | **Railway** | `railway.toml` → `npm start --prefix server` |

### Vercel env (Production demo)

```
VITE_API_URL=https://YOUR-API.up.railway.app/api
VITE_SOCKET_URL=https://YOUR-API.up.railway.app
VITE_APP_URL=https://YOUR-APP.vercel.app
VITE_DEMO_MODE=true
```

### Railway env

```
CORS_ORIGIN=https://YOUR-APP.vercel.app
NODE_ENV=production
PORT=3001
```

## Docs

- [Epics / Production Roadmap](./Epics/Production%20Roadmap.md) — Option C full launch
- [Epics / README](./Epics/README.md) — feature specs E1–E15
- [Demo User Journey](./Epics/Demo%20User%20Journey.md)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run dev:server` | API with hot reload |
| `npm run preview` | Preview production build locally |
