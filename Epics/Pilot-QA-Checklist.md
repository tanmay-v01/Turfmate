# Pilot QA Checklist (Phase 4d)

Run after staging deploy with `VITE_DEMO_MODE=false` and `DEMO_MODE=false`.

## Automated smoke

```bash
# Local (demo OTP)
npm run pilot:smoke --prefix server

# Staging API
API_URL=https://YOUR-RAILWAY-APP.up.railway.app npm run pilot:smoke --prefix server

# Env verification
API_URL=https://YOUR-RAILWAY-APP.up.railway.app npm run verify:pilot --prefix server
```

---

## Manual journey — pilot mode

| # | Step | Action | Pass |
|---|------|--------|------|
| 1 | OTP login | Real phone → SMS code (no demo panel) | [ ] |
| 2 | Home | Turfs load from API (Green Valley, Kanakia, Vasai) | [ ] |
| 3 | Book split | Razorpay test payment completes | [ ] |
| 4 | Locker | Split visible; refresh after 30s | [ ] |
| 5 | Chat | Game room messages persist after reload | [ ] |
| 6 | Owner login | Partner phone `9820012345` → owner dashboard | [ ] |
| 7 | Broadcast | Publish promo → appears in locker feed | [ ] |
| 8 | Support | WhatsApp FAB opens support chat | [ ] |
| 9 | Admin | `9999999999` approves pending KYC (if any) | [ ] |
| 10 | Deep link | `#join/ann-{bookingId}` opens join sheet | [ ] |

---

## Payment QA (Razorpay test)

- [ ] Test card `4111 1111 1111 1111` succeeds
- [ ] Failed payment does not create booking
- [ ] Split host advance recorded in `GET /api/bookings/me`
- [ ] Webhook signature verified when `RAZORPAY_WEBHOOK_SECRET` set

---

## OTP QA (MSG91)

- [ ] SMS arrives within 30s
- [ ] Wrong OTP rejected with clear error
- [ ] Resend respects 30s cooldown
- [ ] WhatsApp resend uses MSG91 (no fake `1234` toast in pilot mode)

---

## Regression (from [Demo User Journey](./Demo%20User%20Journey.md))

- [ ] Slot lock countdown in checkout
- [ ] Split hub share link copies `#join/...`
- [ ] Join split bottom sheet before charge
- [ ] Leaderboard updates after score finalize

---

## Sign-off

| Role | Name | Date |
|------|------|------|
| Product | | |
| Engineering | | |
| Partner owner | | |
