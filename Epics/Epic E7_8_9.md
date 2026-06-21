# **Epics E7, E8 & E9 (Minute-to-Minute Deep Dive)**

> **Note:** Chat (E7) is documented in [Epic E7.md](./Epic%20E7.md). This file covers **E8 Radar** and **E9 Squads & Friends**.

## **Epics 8 & 9: Player Radar, Squads, & Friend Requests**

**Description:** The player discovery and retention engine. This flow allows users to find local players who match their "Sports DNA" (e.g., Amateur Footballers within 5km), vet them using a gamified "Reliability Score," send friend requests, and organize accepted friends into quick-invite groups (Squads).

### **1\. UI Flow & Minute-to-Minute Screen Details**

#### **View 1: `radar` (The Discovery Engine)**

* **Visuals:** Off-white background (`#F8FAFC`). Reached via the "Search 🔍" tab or "Player Radar" quick link on the Home screen.  
* **Components:**  
  * **Sticky Header:**  
    * *Title:* "Player Radar".  
    * *Search Bar:* `placeholder="Search by username..."`  
  * **Advanced Filter Ribbon:**  
    * *Chips:* `[⚽ Football]`, `[🏏 Cricket]`, `[Skill: All ▼]`, `[Distance: < 5km ▼]`.  
    * *Interaction:* Tapping "Skill" opens a mini-dropdown (`Beginner`, `Amateur`, `Pro`).  
  * **The Player List (Vertical Scroll):**  
    * **Player Card:** Plain white card, rounded edges.  
    * *Left:* Large Avatar with a small green dot (Online status indicator).  
    * *Center:* Username (`@virar_striker`) \+ Real Name.  
    * *Subtext:* "⚽ Amateur • 📍 1.2km away".  
    * *Right (Trust Metric):* A star badge `⭐ 4.8` (Reliability Score).  
* **Interaction:** Tapping a Player Card opens the `public_profile` modal.

  #### **View 2: `public_profile` (The Sports Resume)**

* **Visuals:** A slide-up bottom sheet taking up 80% of the screen height.  
* **Components:**  
  * **Hero Section:** Avatar, Name, Username.  
  * **The "Trust & Reliability" Dashboard (Crucial USP):**  
    * *Visual:* A 3-column stats block with light green backgrounds.  
    * *Stat 1:* `Games Played: 42`  
    * *Stat 2:* `No-Shows: 0` (Highlights their punctuality).  
    * *Stat 3:* `Reliability: ⭐ 4.9/5.0`.  
  * **Sports DNA Tags:** Pill-shaped tags displaying their sports and skills (e.g., `[🏏 Cricket - Pro]`, `[🎾 Pickleball - Beginner]`).  
  * **Endorsements/Badges:** Icons auto-awarded by the system (e.g., ⏰ "Early Bird", 🤝 "Team Player").  
  * **Action Footer (Sticky):**  
    * *Primary Button:* `[➕ Add to Squad]` (Vibrant Green).  
    * *Secondary Button:* `[💬 Message]` (Disabled/Hidden if not already friends, depending on privacy settings).  
* **Interaction:** Tapping `Add to Squad` changes the button to `[⏳ Request Sent]` (Greyed out) and updates `tm_friend_requests`.

  #### **View 3: `squad` (The Roster Manager)**

* **Visuals:** Clean white screen. Reached via the `AppNav` bottom bar.  
* **Components:**  
  * **Header & Tabs:**  
    * *Tabs:* `[My Friends]` | `[Requests 🔴]` | `[Custom Groups]`. Active tab has a thick green underline.  
  * **Tab State A: Requests:**  
    * *List:* Shows incoming requests.  
    * *Actions per row:* `[✅ Accept]` (Green outline), `[❌ Decline]` (Red outline).  
  * **Tab State B: My Friends:**  
    * *List:* Alphabetical list of accepted friends.  
    * *Row Action:* `[💬 DM]` icon.  
  * **Tab State C: Custom Groups (For 1-Tap Invites):**  
    * *Empty State:* "No groups yet. Group your friends to invite them to splits instantly."  
    * *Action:* Large dashed box `[+ Create New Group]`.

    #### **View 4: `create_group_modal`**

* **Visuals:** Full-screen modal over dimmed background.  
* **Components:**  
  * **Input:** `placeholder="Group Name (e.g., Sunday Footballers)"`.  
  * **Multi-Select List:** Scrollable list of the user's friends. Tapping a row adds a `✅` checkmark next to their name.  
  * **Primary Button:** `[Save Group (12 Players)]`.  
* **Interaction:** Saves group to local state. *Crucial Link to Epic 4/5:* When hosting a Private Split, the user can now tap this group name to instantly ping all 12 players with a payment link.

  ### **2\. User Stories & Acceptance Criteria**

* **Story 8.1: Player Radar Discovery & Filtering**  
  * **As a** team captain looking for a specific player, **I want** to filter nearby users by sport and skill, **so that** I don't invite a beginner to a highly competitive pro game.  
  * **Acceptance Criteria:**  
    * **Given** I am on the `radar` view, **When** I tap the `[🏏 Cricket]` and `[Skill: Pro]` filters, **Then** the list strictly renders users who have `{sport: 'cricket', skill: 'pro'}` in their `sports_pref` array.  
    * **Given** my `filterRadius` is 5km, **Then** users physically located \>5km away do not appear in the results.  
  * **Priority:** Must Have  
* **Story 8.2: Vetting via the Reliability Score**  
  * **As a** host fronting money for a split, **I want** to see a player's reliability score before inviting them, **so that** I don't invite chronic "no-shows" who will cost me money.  
  * **Acceptance Criteria:**  
    * **Given** I view a `public_profile`, **When** the component renders, **Then** it calculates their Reliability Score based on their `tm_bookings` history (Games Paid vs. Games Attended).  
    * **Given** a user's score drops below 3.0, **Then** their profile displays a red warning banner: `"⚠️ Low Reliability Rating"`.  
  * **Priority:** Should Have (Critical for platform trust)  
* **Story 8.3: The Friend Request Flow**  
  * **As a** player, **I want** to send and accept friend requests, **so that** I can build my local network securely without receiving spam from strangers.  
  * **Acceptance Criteria:**  
    * **Given** I tap `[➕ Add to Squad]` on @virar\_striker's profile, **Then** an object `{from: myId, to: virar_striker, status: 'pending'}` is pushed to `tm_friend_requests`.  
    * **Given** I am @virar\_striker, **When** I open the `squad` view \-\> Requests tab, **Then** I see the pending request and can tap `[✅ Accept]`.  
    * **Given** a request is accepted, **Then** both users are added to each other's `tm_friends` array, and Direct Messaging is unlocked for both.  
  * **Priority:** Must Have  
* **Story 8.4: Creating Custom 1-Tap Invite Groups**  
  * **As a** frequent organizer, **I want** to group my friends into specific rosters, **so that** I don't have to manually invite 10 different people one by one every time I book a turf.  
  * **Acceptance Criteria:**  
    * **Given** I am on the `create_group_modal`, **When** I select 5 friends and save it as "Office Cricket", **Then** a new group object is saved to `tm_squad_groups`.  
    * **Given** I am creating a Private Split (Epic 4), **When** I tap `[Invite Group]`, **Then** my "Office Cricket" group appears as an option, sending an instant automated chat/notification to all 5 members.  
  * **Priority:** Must Have  
  * 

