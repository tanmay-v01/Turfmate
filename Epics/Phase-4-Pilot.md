# Phase 4 — Pilot launch (Virar / Vasai)

**Goal:** Real users, real OTP, Razorpay test — no demo shortcuts in production.

**Geography:** 2–3 partner turfs in Virar / Vasai

---

## Slices

| Slice | Status | Summary |
|-------|--------|---------|
| **4a** | ✅ | Pilot mode: hide demo credentials, WhatsApp support link |
| **4b** | ⏳ | Staging env matrix (`VITE_DEMO_MODE=false` on Vercel preview) |
| **4c** | ⏳ | Onboard 2–3 live partner turfs via owner KYC |
| **4d** | ⏳ | QA: [Demo User Journey](./Demo%20User%20Journey.md) on staging with MSG91 + Razorpay test |

---

## 4a — Pilot mode UX

- Demo credential panels hidden when `VITE_DEMO_MODE=false`
- Google/Apple mock login disabled in pilot mode (real OTP only)
- `VITE_SUPPORT_WHATSAPP` — floating support button on logged-in player app
- OTP error copy no longer references demo code in pilot mode
- Local demo login fallback in `useAppState` only runs when `env.demoMode`

---

## Staging environment (Vercel + Railway)

### Frontend (Vercel)

| Variable | Pilot value |
|----------|-------------|
| `VITE_API_URL` | `https://<railway-api>/api` |
| `VITE_SOCKET_URL` | `https://<railway-api>` |
| `VITE_APP_URL` | `https://turfmate-gray.vercel.app` |
| `VITE_DEMO_MODE` | `false` |
| `VITE_RAZORPAY_KEY_ID` | `rzp_test_...` |
| `VITE_SUPPORT_WHATSAPP` | `9198XXXXXXXX` (no + or spaces) |

### API (Railway)

| Variable | Pilot value |
|----------|-------------|
| `DEMO_MODE` | `false` |
| `MSG91_AUTH_KEY` | live MSG91 key |
| `MSG91_TEMPLATE_ID` | OTP template id |
| `RAZORPAY_KEY_ID` | test key |
| `RAZORPAY_KEY_SECRET` | test secret |
| `APP_URL` | Vercel app URL |
| `CORS_ORIGIN` | Vercel app URL |
| `SEED_ON_START` | `false` (pilot — no demo seed) |

Redeploy after migrations `001`–`012` are applied.

---

## Owner onboarding (manual)

1. Owner signs up with real phone → completes owner KYC flow
2. Super admin approves via `GET /api/admin/kyc/pending`
3. Turf goes live in discovery feed
4. Train owner on: calendar, broadcast, revenue tab

Target partners: Green Valley Arena, Vasai Box Cricket (or local equivalents).

---

## Support playbook

| Issue | Action |
|-------|--------|
| Payment failed | Check Razorpay dashboard; retry booking |
| Split not filling | Host can cancel; auto-refund on expiry |
| OTP not received | Verify MSG91 credits; resend SMS |
| Dispute (no-show) | E15 manual refund via super admin |

**WhatsApp support:** number in `VITE_SUPPORT_WHATSAPP` — players tap floating button in app.

---

## Exit criteria

- [ ] 50+ real bookings in 30 days
- [ ] <2% payment failure rate
- [ ] No P0 bugs open >48h
- [ ] `VITE_DEMO_MODE=false` on production Vercel

---

## Next: Phase 5

Security hardening, PWA, load tests — see [Production Roadmap](./Production%20Roadmap.md).
