# **Epic E6** 

## **Epic 6: Locker Room Social Feed (E6)**

**Description:** The hyper-local community timeline. This feed surfaces "Open Splits" needing players, "Looking for Group" (LFG) posts, and turf promotional broadcasts, strictly filtered by the user's active GPS play radius and sport preferences.

### **1\. UI Flow & Minute-to-Minute Screen Details**

#### **View 1: `locker_room` (The Main Feed)**

* **Visuals:** Off-white (`#F8FAFC`) background to make the white post cards pop. Sits under the main `AppNav` if on mobile.  
* **Components:**  
  * **Sticky Header:**  
    * *Title:* "The Locker Room" (H1, Dark Slate).  
    * *Location Context:* `📍 Virar (5km) ▼` (Reminds the user this is local).  
  * **Filter Ribbon (Horizontal Scroll):**  
    * *Chips:* `[All]`, `[🔥 Open Splits]`, `[⚽ Football]`, `[🏏 Cricket]`, `[📣 Promos]`.  
    * *Active State:* Vibrant green background, white text.  
  * **Floating Action Button (FAB):**  
    * *Location:* Bottom right, hovering above the nav bar.  
    * *Visual:* Vibrant Green circular button with a large white `+` icon.  
  * **The Feed (Vertical Scroll of Cards):**  
    * **Card Type A: The Auto-Split (System Generated)**  
      * *Visual:* Thick Vibrant Green (`#4ADE80`) left border.  
      * *Header:* Avatar of Host \+ "@rahul\_cricket is hosting a Split\!"  
      * *Body:* "Needs **2 more players** for 5v5 Football at Yashwant Arena. Tonight @ 18:00."  
      * *Footer Action:* Huge full-width button: `[💸 Pay ₹120 & Join Squad]`.  
    * **Card Type B: LFG / General Discussion (User Generated)**  
      * *Visual:* Plain white card, subtle shadow.  
      * *Header:* Avatar \+ "@virar\_striker • 2 hrs ago"  
      * *Body:* "My Sunday morning team needs a reliable fast bowler. Any takers? We play leather ball."  
      * *Footer Action:* `[💬 Message User]` (Outline button).  
    * **Card Type C: Turf Owner Promo (B2B Generated)**  
      * *Visual:* Subtle gold/orange accent border. "Verified Turf" badge.  
      * *Body:* "Flash Sale\! 50% off all afternoon slots today at Virar Super Arena due to cancellation."  
      * *Footer Action:* `[🔗 View Turf & Book]`.

    #### **View 2: `create_post_modal`**

* **Visuals:** A slide-up bottom sheet triggered by the FAB. Sits over a dimmed background.  
* **Components:**  
  * **Header:** "Post to the Locker Room" \+ `[x]` close button.  
  * **Category Selector:**  
    * *Label:* "What's this about?"  
    * *Dropdown:* `[Looking for Team]`, `[Selling Gear]`, `[General Chat]`.  
  * **Text Area:**  
    * *Input:* `placeholder="What's happening locally?..."`  
    * *Limits:* Character counter at bottom right (e.g., `45/280`).  
  * **Sport Tag (Optional):** Small `[+ Tag Sport]` pill that opens a mini-select for Football/Cricket/etc.  
  * **Primary Button:** `[Post to Feed]`.  
    * *State:* Disabled until at least 10 characters are typed.  
* **Interaction:** Tapping `Post to Feed` closes the modal, triggers a "Swoosh" sound/toast, and adds the object to `tm_announcements` in `localStorage`.

  ### **2\. User Stories & Acceptance Criteria**

* **Story 6.1: Radius & Sport Feed Filtering**  
  * **As a** player, **I want** to see a feed of posts that are strictly within my travel distance and relevant to my sports, **so that** I don't waste time looking at games I can't attend.  
  * **Acceptance Criteria:**  
    * **Given** my `filterRadius` is Virar (5km) and I am on the `locker_room` view, **When** the component mounts, **Then** it filters the `tm_announcements` array using the Haversine formula, hiding any posts originating \>5km away.  
    * **Given** I tap the `[⚽ Football]` filter chip, **Then** the UI instantly re-renders to only show cards tagged with `sport: 'football'`.  
  * **Priority:** Must Have  
* **Story 6.2: One-Tap Join from Feed (Connecting to Epic 5\)**  
  * **As a** player looking for a game, **I want** to tap a button on my feed to instantly pay and join an open split, **so that** I don't miss out on the last spot.  
  * **Acceptance Criteria:**  
    * **Given** I see an Auto-Split card on the feed, **When** I tap `[Pay ₹… & Join]`, **Then** `JoinSplitReviewSheet` slides up (Epic 5).
    * **Given** I complete the mock payment, **Then** I am routed directly to the `split_hub` view for that game, and the feed card dynamically updates for all other users to show `1 spot left` or `Full`.  
  * **Priority:** Must Have  
* **Story 6.3: Authoring a Manual Post (LFG)**  
  * **As a** team captain, **I want** to write a post to find a specific type of player, **so that** I can complete my squad for an upcoming tournament.  
  * **Acceptance Criteria:**  
    * **Given** I am on `locker_room`, **When** I tap the FAB, **Then** the `create_post_modal` opens.  
    * **Given** I type my message and select the "Looking for Team" category, **When** I click `Post to Feed`, **Then** a new JSON object `{id, author, text, type, lat, lng, timestamp}` is unshifted to the top of `tm_announcements` and appears instantly on the local feed.  
  * **Priority:** Must Have  
* **Story 6.4: Directly Messaging from a Post**  
  * **As a** player reading a user's post, **I want** to quickly send them a private message, **so that** we can discuss game details without spamming the public feed.  
  * **Acceptance Criteria:**  
    * **Given** I am looking at a Type B (LFG) card, **When** I tap `[💬 Message User]`, **Then** `openDmWithUser` opens `chat` in a DM with that host.
  * **Priority:** Should Have  
* **Story 6.5: Owner Promo Visibility**  
  * **As a** player, **I want** to see discounted turf slots in my feed, **so that** my squad can play for cheaper.  
  * **Acceptance Criteria:**  
    * **Given** a Turf Owner publishes a promo from their dashboard (Module 8), **When** I refresh my Locker Room feed, **Then** the promo card appears with a distinct gold styling, standing out from regular user posts.  
  * **Priority:** Could Have (Great for monetization/engagement)  
  * 

