# Phase 2 — Payments & trust

**Goal:** Razorpay orders, payment verification, webhooks, refunds, owner ledger, and live OTP.

---

## Shipped slices

| Slice | Status | Summary |
|-------|--------|---------|
| **2a** | ✅ | Payment orders, verify, webhook, checkout fulfillment |
| **2b** | ✅ | Split join via `SPLIT_JOIN` payment purpose |
| **2c** | ✅ | Refunds on split cancel / expiry (Razorpay + demo) |
| **2d** | ✅ | `payout_ledger` + owner revenue + admin platform ledger APIs |
| **2e** | ✅ | MSG91 OTP send (falls back to demo when keys unset) |

---

## API

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /api/payments/orders` | JWT | Create Razorpay order |
| `POST /api/payments/verify` | JWT | Verify payment + fulfill booking/split |
| `POST /api/payments/webhook` | Razorpay signature | `payment.captured` / `payment.failed` |
| `GET /api/owners/me/revenue` | OWNER | Owner payout ledger summary + entries |
| `GET /api/admin/ledger/platform` | SUPER_ADMIN | Platform commission + payment volume |

**Order purposes:** `BOOKING_PRIVATE`, `SPLIT_HOST`, `SPLIT_JOIN`

---

## Env (Railway + Vercel)

| Variable | Where | Notes |
|----------|-------|-------|
| `RAZORPAY_KEY_ID` | Railway API | Server + public key id |
| `RAZORPAY_KEY_SECRET` | Railway API | Never expose to client |
| `RAZORPAY_WEBHOOK_SECRET` | Railway API | Webhook HMAC |
| `VITE_RAZORPAY_KEY_ID` | Vercel | Same key id for Checkout.js |
| `MSG91_AUTH_KEY` | Railway API | Live OTP |
| `MSG91_TEMPLATE_ID` | Railway API | DLT-approved OTP template |

With Razorpay/MSG91 unset, `DEMO_MODE=true` uses demo orders and OTP `1234`.

---

## Migrations

- `005_payment_orders.sql`
- `006_payout_ledger.sql`

---

## Webhook setup (production)

1. Razorpay Dashboard → Webhooks → `https://<api-host>/api/payments/webhook`
2. Events: `payment.captured`, `payment.failed`
3. Set `RAZORPAY_WEBHOOK_SECRET` on Railway

---

## Phase 3 preview

- Razorpay Route linked accounts for owner T+2 payouts
- Redis OTP store
- PostGIS radius search
