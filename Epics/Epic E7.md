# **Epic E7**

## **Epic 7: Chat & Messaging (E7)**

**Description:** Squad communication hub — game rooms auto-created on split bookings, sport lobbies, direct messages, friend requests, quick replies, and archived game chats. Connects Epic 5 (Split Hub) and Epic 6 (Locker Room) to live coordination before match day.

### **1. UI Flow & Minute-to-Minute Screen Details**

#### **View: `chat` (Inbox + Active Room)**

* **Route:** `useAppState.view` → `chat` (full-width layout)
* **Inbox tabs:** Games | Lobbies | DMs | Requests
* **Search:** Filters rooms by name / last message
* **Desktop:** Split pane — inbox left, active room right
* **Mobile:** Inbox → tap row → full-screen room with back

#### **Tab: Games**

* Lists `type: 'game'` chats where `isActive !== false`
* Auto-created on split book: id `chat-ann-{announcementId}`
* System welcome message on create
* **Archived games:** toggle shows past rooms (`isActive: false`)

#### **Tab: Lobbies**

* Community sport lobbies (football, cricket)
* Quick replies tuned per type

#### **Tab: DMs**

* Direct messages with friends
* Created on friend accept or via Locker “Message user” / Radar profile

#### **Tab: Requests**

* Incoming friend requests (`tm_friend_requests`)
* Accept → creates DM + removes request
* Decline → removes request

#### **Active Chat Room**

* **Header:** room name, type badge, members sheet, links to Split Hub / Turf Details
* **Game banner:** turf, time, roster chips (game rooms)
* **Messages:** date separators, system messages, me vs other styling
* **Quick replies:** sport-specific chips above input
* **Input:** text send, mock auto-reply when socket offline
* **Typing hint:** simulated on room open

### **2. Cross-Epic Links**

| From | Action | Chat behavior |
|------|--------|---------------|
| E4 Split book | `processBookingPayment` | Creates `chat-ann-*` game room |
| E4 Private book | `processBookingPayment` | Creates `chat-booking-*` → routes to chat on success |
| E5 Split Hub | “Game chat” button | Sets `activeChatId` → `chat` |
| E5 Join split | `confirmJoinSplit` | System message in game room |
| E5 Split filled | `SplitSuccessModal` | “Go to game chat” CTA |
| E6 LFG post | Message user | `openDmWithUser` → DM tab |
| E8 Radar | Message profile | `openDmWithUser` |
| E8 Friend accept | `acceptFriendRequest` | New DM channel |

### **3. User Stories & Acceptance Criteria**

* **Story 7.1: Auto Game Room on Split Book**
  * **Given** I complete a split checkout, **When** payment succeeds, **Then** a game chat appears in Games tab with a system welcome message.
  * **Priority:** Must Have

* **Story 7.2: Join Split System Message**
  * **Given** another player pays into my split, **When** `confirmJoinSplit` completes, **Then** the game room shows “{name} has joined the squad!”.
  * **Priority:** Must Have

* **Story 7.3: Friend Request → DM**
  * **Given** I accept a request in Chat → Requests, **When** I tap Accept, **Then** a DM opens and the request is removed.
  * **Priority:** Must Have

* **Story 7.4: Quick Replies**
  * **Given** I am in a game room, **When** I tap a quick reply chip, **Then** the message sends and a mock squad reply appears.
  * **Priority:** Should Have

* **Story 7.5: Archived Game Chats**
  * **Given** a game ended, **When** `isActive` is false, **Then** the room moves to “archived games” and input is read-only.
  * **Priority:** Should Have

### **4. State & Storage**

| Key | Contents |
|-----|----------|
| `tm_chats` | Array of chat rooms + messages |
| `tm_friend_requests` | Pending friend requests |
| `activeChatId` | Currently open room (null = inbox only) |

### **5. Implementation Notes (SPA)**

Epic docs may reference separate views (`admin_moderation`, etc.). Chat is a **single route** `chat` with tab + panel state — not separate view IDs.
