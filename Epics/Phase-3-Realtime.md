# Phase 3 — Real-time & social

**Goal:** Persist locker feed, chat, squads, and leaderboards server-side; sync across devices.

---

## Slices

| Slice | Status | Summary |
|-------|--------|---------|
| **3a** | ✅ | My Bookings synced from `GET /api/bookings/me` |
| **3b** | ✅ | Locker feed API + open splits refresh every 30s on Locker tab |
| **3c** | ✅ | Socket.io chat rooms persisted in DB + inbox API |
| **3d** | ⏳ | Squads + friend requests in DB |
| **3e** | ⏳ | Score → leaderboard server sync |
| **3f** | ⏳ | Owner broadcasts with server-side `expiresAt` |

---

## 3a — My Bookings API sync

- `src/utils/bookingMapper.js` maps DB rows → UI booking cards
- `refreshMyBookings()` in `useAppState` — login + after payment + My Bookings page
- Endpoint: `GET /api/bookings/me` (JWT)

---

## 3b — Locker feed + cross-device splits

- Migration `007_locker_posts.sql` — social posts in DB
- `GET /api/locker/feed`, `POST /api/locker/posts` (JWT)
- `refreshLockerFeed()` merges `GET /api/splits/open` + locker posts
- Polls every 30s while on Locker Room; refreshes after split host/join/cancel

---

## 3c — Persisted game chat

- Migration `008_chat.sql` — `chat_rooms`, `chat_members`, `chat_messages`
- `GET /api/chat/rooms`, `POST /api/chat/rooms/:id/messages`, mark read
- Socket.io saves messages to DB; auto room on private/split booking
- `refreshChats()` on login + Chat tab (30s poll)
- Room id: `chat-booking-{bookingId}`

---

## Exit criteria (Phase 3)

- [x] User A's split visible to User B without shared browser
- [x] Chat messages sync across two devices (same booking room)
- [ ] Push notification on split invite (FCM)

---

## Infra preview (from Phase 2)

- Razorpay Route linked accounts for owner T+2 payouts
- Redis OTP store
- PostGIS radius search
