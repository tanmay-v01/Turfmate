# TurfMate — Demo User Journey

**Path:** Login → Book split → Locker → Chat → Score → Leaderboard  
**Persona:** Rahul Mehta · **Phone:** `9876543210` · **OTP:** `1234`  
**Duration:** ~8–10 minutes

## Before you start

Clear stale demo data if needed: `tm_chats`, `tm_announcements`, `tm_bookings`, `tm_squad_groups` in Application → Local Storage, or use incognito.

---

## Step-by-step

| # | Screen | Action | Expected result |
|---|--------|--------|-----------------|
| 1 | Login → OTP | `9876543210` / `1234` | Land on **Home** |
| 2 | Home → Turf | Open **Green Valley Arena** | `turf_details` |
| 3 | Turf | Pick available slot → **book slot** | `CheckoutModal` + 5:00 lock timer |
| 4 | Checkout | **Split** → pay UPI | Success ticket; Locker post + game chat created |
| 5 | Success | **Manage Split Hub** | Escrow progress, roster, countdown |
| 6 | Split Hub | **Copy invite link** | Clipboard URL `#join/ann-…` |
| 7 | Locker | Nav **Locker** | Your split card at top |
| 8 | Locker | **Pay & join** on another split (optional) | `JoinSplitReviewSheet` → pay |
| 9 | Chat | Nav **Chat** → **Games** | Split game room + quick replies |
| 10 | Score | Nav **Score** → start football → goals (pick scorer) → end | Match summary + MVP |
| 11 | Leaderboard | Nav **Ranks** | Updated goals; toggle Squad / Virar scope |

---

## QA checkpoints

- [ ] Checkout shows slot lock countdown
- [ ] Split hub shows cancel (host) and share link with hash URL
- [ ] Join split uses bottom sheet, not instant charge
- [ ] Full roster triggers **Game On!** modal
- [ ] LFG **Message** opens DM with poster
- [ ] Radar **Add Friend** shows “Request sent”
- [ ] Squad **Create group** persists to `tm_squad_groups`
- [ ] Private checkout **Open Game Chat** routes to new room
- [ ] Super Admin **Impersonate** owner shows red banner + Exit

---

## Deep link test

Paste invite URL with hash `#join/{announcementId}` while logged in as player — join review sheet should open automatically.

---

## Pilot mode (Phase 4d)

When `VITE_DEMO_MODE=false`:

1. Use a **real phone** — no `9876543210` shortcut.
2. Turfs load from API — expect **Green Valley**, **Kanakia**, **Vasai Box Cricket** after `npm run seed:pilot`.
3. Payment uses **Razorpay test** keys.
4. Run automated smoke: `npm run pilot:smoke --prefix server`
5. Full checklist: [Pilot QA Checklist](./Pilot-QA-Checklist.md)
