# Phase 3 — Real-time & social

**Goal:** Persist locker feed, chat, squads, and leaderboards server-side; sync across devices.

---

## Slices

| Slice | Status | Summary |
|-------|--------|---------|
| **3a** | ✅ | My Bookings synced from `GET /api/bookings/me` |
| **3b** | ✅ | Locker feed API + open splits refresh every 30s on Locker tab |
| **3c** | ✅ | Socket.io chat rooms persisted in DB + inbox API |
| **3d** | ✅ | Squads + friend requests API persisted in DB |
| **3e** | ✅ | Score → leaderboard server sync via match API |
| **3f** | ✅ | Owner broadcasts with server-side `expiresAt` |
| **3g** | ✅ | Split invite push + inbox notifications (FCM when configured) |

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

## 3d — Squads + friend requests

- Migration `009_social.sql` — `friend_requests`, `squads`, `squad_members`
- `GET/POST /api/social/friend-requests`, accept/decline
- `GET/POST /api/social/squads`
- `refreshSocial()` on login; Radar send + Squad create wired to API

---

- [x] User A's split visible to User B without shared browser
- [x] Chat messages sync across two devices (same booking room)
- [x] Push notification on split invite (FCM)

---

## 3e — Score → leaderboard sync

- Migration `010_leaderboard.sql` — `player_sport_stats`, `match_results`
- `POST /api/leaderboard/matches` — save game + apply stat deltas
- `GET /api/leaderboard?scope=squad|area` — ranked friend/area stats
- `finalizeLiveGame()` posts to API; `refreshLeaderboard()` on login + Ranks page

---

## 3f — Owner broadcasts

- Migration `011_owner_broadcasts.sql` — `owner_broadcasts` with `expires_at`, `status`
- `GET /api/broadcasts/active` — locker feed promos (public)
- `GET/POST /api/broadcasts/me`, `POST /:id/deactivate` — owner campaigns (JWT + OWNER)
- `refreshLockerFeed()` merges active broadcasts at top of locker feed
- `OwnerBroadcast` publishes via API; server enforces expiry + cleanup interval

---

## 3g — Split invite push notifications

- Migration `012_push_notifications.sql` — `push_tokens`, `user_notifications`
- `POST /api/notifications/token`, `GET /api/notifications`, mark read
- `POST /api/splits/:bookingId/invite-squad` — notify squad members
- Split host checkout passes `inviteSquadId` → server persists inbox + FCM (`FCM_SERVER_KEY`)
- `registerPushToken()` + `refreshNotifications()` on login

---

## Exit criteria (Phase 3)

- Razorpay Route linked accounts for owner T+2 payouts
- Redis OTP store
- PostGIS radius search
