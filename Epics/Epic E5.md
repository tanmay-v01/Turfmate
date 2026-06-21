# **Epic E5** 

## **Epic 5: Split Booking & Escrow (E5)**

**Description:** The "Split Hub" or Escrow Engine. This flow tracks the funding progress of a partially paid booking. It handles the UI for the Host to track joining players, the guest experience for paying into the split, and the automated refund logic if the game fails to fill before the deadline.

### **1\. UI Flow & Minute-to-Minute Screen Details**

#### **View 1: `split_hub` (The Host's Waiting Room)**

* **Visuals:** Clean white (`#FFFFFF`) background. A prominent status dashboard layout.  
* **Components:**  
  * **Header Card:**  
    * *Turf Details:* "Yashwant Nagar Arena \- Pitch A (5v5)"  
    * *Time slot:* "Sunday, Jun 21 • 18:00 \- 19:00"  
    * *Status Badge:* 🟡 "Pending Funding" (Turns 🟢 "Confirmed" when full).  
  * **The Escrow Progress UI (Centerpiece):**  
    * *Progress Bar:* A thick, rounded horizontal bar. Filled portion is Vibrant Green (`#4ADE80`), unfilled is light grey (`#E2E8F0`).  
    * *Math:* "₹240 / ₹1200 Collected" (Updates dynamically).  
    * *Player Count:* "2/10 Players Joined".  
  * **The Countdown Timer:**  
    * *Visual:* A pulsing red clock icon ⏰.  
    * *Text:* "Funding expires in 02:45:00". (Calculated as: Slot Start Time minus 2 hours).  
  * **The Roster Grid:**  
    * *UI:* A 2-column or 3-column grid of circular avatars.  
    * *Filled Slots:* Shows user avatar, username, and a small ✅ "Paid" badge.  
    * *Empty Slots:* Grey dashed circles with a `+` icon.  
  * **Action Row:**  
    * `[🔗 Copy Invite Link]` (Primary button, Vibrant Green).  
    * `[💬 Go to Game Chat]` (Secondary outline button, opens Module 6 chat).  
  * **Bottom Danger Zone:**  
    * *Button:* `[Cancel Split & Refund]` (Red text, transparent background).

    #### **View 2: `join_split_review` (The Guest Entry Point)**

* **Implementation:** `JoinSplitReviewSheet` overlay (not a separate route).

* **Context:** A player clicks a WhatsApp link shared by the Host, or taps "Join" from the Locker Room feed.  
* **Visuals:** A slide-up bottom sheet over the `home` or `locker_room` view.  
* **Components:**  
  * **Host Banner:** Avatar of the host. "@rahul\_cricket invited you to squad up\!"  
  * **Game Details:** Yashwant Nagar Arena • Sun, Jun 21 @ 18:00.  
  * **Scarcity Indicator:** 🔥 "Only 3 spots left\!" (Orange text).  
  * **Financials:**  
    * *Cost to Join:* **₹120**  
    * *Note:* "Held securely in escrow until the game fills."  
  * **Primary Button:** `[Pay ₹120 & Join Squad]` (Vibrant Green).  
* **Interaction:** Tapping Pay routes `useAppState.view` to `payment_gateway_mock` (from Epic 4). On success, routes the guest to the `split_hub` as a confirmed player.

  #### **View 3: `split_success_modal` (The Celebration)**

* **Context:** Appears instantly for all users viewing the `split_hub` when the final player pays.  
* **Visuals:** Full-screen overlay with Confetti animation.  
* **Components:**  
  * **Icon:** Huge Green Checkmark ✅ or a Trophy 🏆.  
  * **Header:** "Game On\!"  
  * **Text:** "The split is fully funded. The turf is officially booked."  
  * **Button:** `[Go to Locker Room Chat]`

    ### **2\. User Stories & Acceptance Criteria**

* **Story 5.1: Real-Time Escrow Progress Tracking**  
  * **As a** Host, **I want** to see a visual progress bar of how much money has been collected, **so that** I know exactly how close we are to securing the turf.  
  * **Acceptance Criteria:**  
    * **Given** a split requires 10 players at ₹120 each, **When** I am on the `split_hub`, **Then** the progress bar shows 10% filled (my advance).  
    * **Given** Player B pays their ₹120, **When** the `split_hub` state updates, **Then** the progress bar animates to 20%, the text updates to "₹240 / ₹1200", and Player B's avatar appears in the roster grid.  
  * **Priority:** Must Have  
* **Story 5.2: Inviting Players (Frictionless Sharing)**  
  * **As a** Host, **I want** a quick way to copy the game details, **so that** I can paste it into my existing WhatsApp groups.  
  * **Acceptance Criteria:**  
    * **Given** I tap `[🔗 Copy Invite Link]`, **Then** clipboard contains `…#join/{announcementId}` deep link text.
    * **Given** a user opens that hash URL while logged in, **Then** `JoinSplitReviewSheet` opens for that split.
  * **Priority:** Must Have  
* **Story 5.3: Guest Payment & Roster Update**  
  * **As a** guest player, **I want** to pay exactly my share and see my face on the roster, **so that** I know my spot is guaranteed.  
  * **Acceptance Criteria:**  
    * **Given** I am on `join_split_review`, **When** I tap Pay and complete the simulated gateway, **Then** my `{userId, amount: 120, status: 'paid'}` object is pushed into the `roster` array of that specific booking in `localStorage: tm_bookings`.  
    * **Given** payment is successful, **Then** I am routed to `split_hub` and added to the associated Game Chatroom.  
  * **Priority:** Must Have  
* **Story 5.4: Time Expiration & Auto-Refund (The Safety Net)**  
  * **As a** player who paid an advance, **I want** the system to automatically refund me if the game doesn't fill up in time, **so that** I don't lose money on a canceled game.  
  * **Acceptance Criteria:**  
    * **Given** a game is scheduled for 18:00, **When** the clock hits 16:00 (2 hours prior) and the roster is only 8/10 full, **Then** the split status changes from `pending` to `failed`.  
    * **Given** a split `failed`, **Then** the temporary turf lock is released, and all paid players receive a simulated push notification: *"Game canceled. ₹120 refunded to your source account."*  
  * **Priority:** Must Have (Critical for trust)  
* **Story 5.5: Host Manual Cancellation**  
  * **As a** Host, **I want** the ability to cancel the split early if I realize my friends can't make it, **so that** we aren't waiting around for the timer to expire.  
  * **Acceptance Criteria:**  
    * **Given** I am the Host on the `split_hub`, **When** I tap `[Cancel Split & Refund]` and confirm the action, **Then** the split is marked `canceled` and all currently joined players are auto-refunded.  
  * **Priority:** Should Have  
  * 

