# Phase 4 — Pilot launch (Virar / Vasai)

**Goal:** Real users, real OTP, Razorpay test — no demo shortcuts in production.

**Geography:** 2–3 partner turfs in Virar / Vasai

---

## Slices

| Slice | Status | Summary |
|-------|--------|---------|
| **4a** | ✅ | Pilot mode: hide demo credentials, WhatsApp support link |
| **4b** | ✅ | Staging env templates + `verify:pilot` script |
| **4c** | ✅ | `seed:pilot` — 3 approved partner turfs + owner accounts |
| **4d** | ✅ | `pilot:smoke` + [Pilot QA Checklist](./Pilot-QA-Checklist.md) |

---

## 4a — Pilot mode UX

- Demo credential panels hidden when `VITE_DEMO_MODE=false`
- Google/Apple mock login disabled in pilot mode
- `VITE_SUPPORT_WHATSAPP` — floating support button
- Local demo login fallback only when `env.demoMode`

---

## 4b — Staging environment

**Templates:** `.env.staging.example` (Vercel) · `server/.env.staging.example` (Railway)

```bash
# Verify before go-live
API_URL=https://YOUR-RAILWAY-APP.up.railway.app npm run verify:pilot
```

### Vercel (frontend)

| Variable | Pilot value |
|----------|-------------|
| `VITE_API_URL` | `https://<railway>/api` |
| `VITE_SOCKET_URL` | `https://<railway>` |
| `VITE_APP_URL` | `https://turfmate-gray.vercel.app` |
| `VITE_DEMO_MODE` | `false` |
| `VITE_RAZORPAY_KEY_ID` | `rzp_test_...` |
| `VITE_SUPPORT_WHATSAPP` | `9198XXXXXXXX` |

### Railway (API)

| Variable | Pilot value |
|----------|-------------|
| `DEMO_MODE` | `false` |
| `SEED_ON_START` | `false` |
| `SEED_PILOT_ON_START` | `true` (once) then `false` |
| `MIGRATE_ON_START` | `true` |
| `MSG91_AUTH_KEY` + `MSG91_TEMPLATE_ID` | live OTP |
| `RAZORPAY_*` | test keys |
| `APP_URL` + `CORS_ORIGIN` | Vercel URL |

---

## 4c — Pilot partner turfs

```bash
npm run seed:pilot --prefix server
```

| Turf | Legacy ID | Owner phone | City |
|------|-----------|-------------|------|
| Green Valley Arena | `turf-1` | `9820012345` | Virar |
| Kanakia Sports Hub | `turf-2` | `9820012346` | Virar |
| Vasai Box Cricket Arena | `turf-pilot-vasai` | `9820012347` | Vasai |

Super admin: `9999999999` (OTP `1234` in demo mode only).

Owners are pre-approved (`kyc_status = APPROVED`) and turfs are `ACTIVE`.

---

## 4d — QA

```bash
npm run pilot:smoke --prefix server
API_URL=https://staging-api npm run pilot:smoke --prefix server
```

Manual checklist: [Pilot-QA-Checklist.md](./Pilot-QA-Checklist.md)

---

## Support playbook

| Issue | Action |
|-------|--------|
| Payment failed | Razorpay dashboard; retry booking |
| Split not filling | Host cancel; auto-refund on expiry |
| OTP not received | MSG91 credits; resend SMS |
| Dispute | Super admin manual refund (E15) |

---

## Exit criteria

- [ ] 50+ real bookings in 30 days
- [ ] <2% payment failure rate
- [ ] No P0 bugs open >48h
- [ ] `VITE_DEMO_MODE=false` on production Vercel
