# **Epic E14 (Minute-to-Minute Deep Dive)**

## **Epic 14: Owner Community Broadcasts (B2B Web)**

**Description:** The direct-to-consumer marketing tool for turf owners. This module allows the turf manager to create, preview, and publish promotional posts or flash sales directly into the hyper-local "Locker Room" feed of players within their radius.

### **1\. UI Flow & Minute-to-Minute Screen Details**

#### **Pre-requisite**

The owner is logged into the B2B web portal. They click `[📣 Broadcasts]` on the left-hand dark slate sidebar. The `useAppState.view` updates to `owner_broadcasts`.

#### **View 1: `owner_broadcasts` (The Marketing Hub)**

* **Visuals:** Clean, desktop-first layout on a light grey background (`#F8FAFC`).  
* **Components:**  
  * **Header:** "Community Broadcasts".  
  * **Stats Row (3 up):**  
    * *Active Promos:* `1`  
    * *Total Views (This Month):* `4,200`  
    * *Bookings from Promos:* `18`  
  * **The Campaign List:** A table of past and present broadcasts.  
    * *Columns:* Status (🟢 Active / 🔴 Expired), Headline, Publish Date, Clicks, Action (`[Deactivate]`).  
  * **Primary Action Button:** `[+ Create New Broadcast]` (Vibrant Green, top right).

    #### **View 2: `create_broadcast_modal` (The Campaign Builder)**

* **Context:** Slides out from the right side of the screen (Drawer UI) or opens as a large centered modal.  
* **Visuals:** Split layout. Form on the left, Live Mobile Preview on the right.  
* **Components (Left \- Input Form):**  
  * **Category Select:** Dropdown (`Flash Sale (Discount)`, `Tournament Announcement`, `General Update`).  
  * **Headline Input:** `placeholder="e.g., 50% Off Afternoon Slots Today!"` (Max 40 chars).  
  * **Body Text Area:** `placeholder="Describe your offer..."` (Max 200 chars).  
  * **Discount Code (Optional):** `placeholder="e.g., RAIN50"`.  
  * **Call to Action (CTA) Link:** Dropdown to choose where the button goes (`Link to Turf Calendar`, `Link to External Site`).  
  * **Action Row:** `[Publish Now]`, `[Save as Draft]`.  
* **Components (Right \- Live Preview):**  
  * *Visual:* An iPhone mockup frame displaying exactly how the post will look on the Player's Locker Room feed (Module 5/6).  
  * *Design Rules:* Updates in real-time as the owner types. Shows the "Verified Turf" gold badge and the orange promotional border.

    ### **2\. User Stories & Acceptance Criteria**

* **Story 14.1: Authoring a Flash Sale Broadcast**  
  * **As a** Turf Manager with empty afternoon slots, **I want** to push a discount offer directly to local players, **so that** I can generate last-minute revenue instead of letting the pitch sit empty.  
  * **Acceptance Criteria:**  
    * **Given** I am on `create_broadcast_modal`, **When** I fill out the headline "50% Off 2PM-5PM" and click `[Publish Now]`, **Then** a new object with `type: 'PROMO'` and `authorId: ownerId` is pushed to the `tm_announcements` array in `localStorage`.  
    * **Given** the post is published, **When** a player within a 10km radius opens their `locker_room` view, **Then** the promo post appears at the top of their feed.  
  * **Priority:** Must Have.  
* **Story 14.2: Premium Visual Hierarchy for Owners**  
  * **As the** platform, **I want** Turf Owner broadcasts to visually stand out from regular player posts, **so that** players recognize official discounts and click on them.  
  * **Acceptance Criteria:**  
    * **Given** a player is scrolling the `locker_room` feed, **When** the UI renders an announcement with `type: 'PROMO'`, **Then** the card applies a distinct styling (e.g., subtle gold/orange border, "Verified Turf" badge, and a bold CTA button).  
  * **Priority:** Should Have.  
* **Story 14.3: Real-Time Mobile Preview**  
  * **As a** non-technical Turf Owner, **I want** to see exactly what my post will look like on a player's phone before I hit send, **so that** I don't publish something that looks broken or typos.  
  * **Acceptance Criteria:**  
    * **Given** I am typing in the "Headline" or "Body" inputs of the `create_broadcast_modal`, **When** a keystroke is registered, **Then** the mocked mobile UI on the right side of the screen updates instantly reflecting the text.  
  * **Priority:** Should Have.  
* **Story 14.4: Auto-Expiration of Flash Sales**  
  * **As a** Turf Owner, **I want** my flash sales to automatically disappear after the day is over, **so that** players don't try to claim a Tuesday discount on a Friday.  
  * **Acceptance Criteria:**  
    * **Given** I create a broadcast, **When** I set the expiration time to "Today at 11:59 PM", **Then** the system logs this timestamp.  
    * **Given** the current system time passes the expiration timestamp, **Then** the `tm_announcements` object is flagged as inactive and no longer renders on any player's feed.  
  * **Priority:** Must Have.  
  * 

