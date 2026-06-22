# Phase 3 — Real-time & social

**Goal:** Persist locker feed, chat, squads, and leaderboards server-side; sync across devices.

---

## Slices

| Slice | Status | Summary |
|-------|--------|---------|
| **3a** | ✅ | My Bookings synced from `GET /api/bookings/me` |
| **3b** | ⏳ | Locker feed API + open splits cross-device |
| **3c** | ⏳ | Socket.io chat rooms persisted |
| **3d** | ⏳ | Squads + friend requests in DB |
| **3e** | ⏳ | Score → leaderboard server sync |
| **3f** | ⏳ | Owner broadcasts with server-side `expiresAt` |

---

## 3a — My Bookings API sync

- `src/utils/bookingMapper.js` maps DB rows → UI booking cards
- `refreshMyBookings()` in `useAppState` — login + after payment + My Bookings page
- Endpoint: `GET /api/bookings/me` (JWT)

---

## Exit criteria (Phase 3)

- [ ] User A's split visible to User B without shared browser
- [ ] Chat messages sync across two devices
- [ ] Push notification on split invite (FCM)

---

## Infra preview (from Phase 2)

- Razorpay Route linked accounts for owner T+2 payouts
- Redis OTP store
- PostGIS radius search
