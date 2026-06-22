# Phase 2 — Payments & trust

**Goal:** Razorpay orders, payment verification, webhooks, and escrow-ready booking fulfillment.

---

## Slice 2a (shipped)

| Area | Status |
|------|--------|
| Payment orders table | `server/migrations/005_payment_orders.sql` |
| Razorpay service | `server/services/razorpayService.js` (demo orders when keys unset) |
| Payments API | `POST /api/payments/orders`, `POST /api/payments/verify` |
| Webhook | `POST /api/payments/webhook` (raw body, signature verify when live) |
| Frontend | `paymentsApi` + checkout wired via `processBookingPayment` |
| Demo mode | Auto-verify demo orders → completes booking/split in DB |

---

## API

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /api/payments/orders` | JWT | Create Razorpay order for booking intent |
| `POST /api/payments/verify` | JWT | Verify payment + fulfill booking/split |
| `POST /api/payments/webhook` | Razorpay signature | Async payment.captured / failed |

**Order purposes:** `BOOKING_PRIVATE`, `SPLIT_HOST`, `SPLIT_JOIN`

---

## Env (Railway + Vercel)

| Variable | Where | Notes |
|----------|-------|-------|
| `RAZORPAY_KEY_ID` | Railway API | Server + public key id |
| `RAZORPAY_KEY_SECRET` | Railway API | Never expose to client |
| `RAZORPAY_WEBHOOK_SECRET` | Railway API | Webhook HMAC |
| `VITE_RAZORPAY_KEY_ID` | Vercel | Same key id for Checkout.js |

With keys unset, `DEMO_MODE=true` uses `demo_order_*` ids and skips Razorpay UI.

---

## Next slices

| Slice | Work |
|-------|------|
| **2b** | Split join payments via `SPLIT_JOIN` purpose |
| **2c** | Refund on split fail/cancel (Razorpay refund API) |
| **2d** | Owner payout ledger + commission reporting |
| **2e** | MSG91 live OTP |

---

## Webhook setup (production)

1. Razorpay Dashboard → Webhooks → `https://<api-host>/api/payments/webhook`
2. Events: `payment.captured`, `payment.failed`
3. Set `RAZORPAY_WEBHOOK_SECRET` on Railway
