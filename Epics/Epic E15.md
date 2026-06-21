# **Epic E15 (Minute-to-Minute Deep Dive)**

## **Epic 15: Super Admin Moderation & Operations (B2B Web)**

**Description:** The "God Mode" control center for the platform operators. This module allows the TurfMate internal team to review and approve new vendor KYC applications, resolve financial disputes, moderate reported users, and monitor overall platform health.

### **1\. UI Flow & Minute-to-Minute Screen Details**

#### **Pre-requisite**

The operator navigates to login, enters `9999999999` and OTP `1234`. Routing sets `useAppState.view` to `super_admin` (not `super_admin_dashboard`).

#### **View 1: `super_admin_dashboard` (The Command Center)**

* **Visuals:** A dense, data-rich desktop layout. Dark sidebar (Pitch Black `#000000` to distinguish it clearly from the Owner Dashboard's Slate) with navigation: `[📊 Overview]`, `[📋 KYC Approvals]`, `[🚨 Disputes]`, `[🛡️ Moderation]`.  
* **Components:**  
  * **Header:** "TurfMate Operations Center".  
  * **Platform Health Cards:**  
    * *Gross GMV Today:* `₹45,200`  
    * *Platform Revenue (10%):* `₹4,520`  
    * *Pending KYCs:* `3` (Red badge if \> 0).  
    * *Active Turfs:* `14`  
  * **Live Activity Feed:** A real-time scrolling list of system events (e.g., "Booking \#882 created", "Split \#991 fully funded", "New User registered in Virar").

    #### **View 2: `admin_kyc_queue` (Vendor Onboarding Gatekeeper)**

* **Context:** The destination for the applications submitted in Epic 12\.  
* **Visuals:** Split-screen layout. A queue list on the left, details on the right.  
* **Components:**  
  * **The Queue:** List of `pending_approval` turf objects.  
  * **Detail Panel (Right):**  
    * *Business Info:* "Virar Super Arena", Owner Name, Phone, Email.  
    * *Map Check:* A mini Leaflet map showing where they pinned their turf. (Admin verifies it's not a fake location).  
    * *Document Viewer:* Previews of the uploaded PAN/GST PDFs.  
    * *Bank Details:* Auto-checks formatting of Account & IFSC.  
  * **Action Bar:**  
    * `[✅ Approve & Activate]` (Vibrant Green).  
    * `[❌ Reject with Note]` (Red, prompts for a reason like "Blurry PAN Card").

    #### **View 3: `admin_disputes` (Customer Support Hub)**

* **Context:** Handling edge cases like a turf owner cancelling a game but the system failing to refund, or a rainout dispute.  
* **Visuals:** Ticket-style table layout.  
* **Components:**  
  * **Search Bar:** `placeholder="Search Booking ID, Phone, or Username"`.  
  * **Booking Inspector Modal:**  
    * Shows exact financial breakdown of a specific booking.  
    * Shows the Escrow status (e.g., `Failed_Split`, `Settled`).  
  * **God-Mode Actions:**  
    * `[Force Refund]` (Bypasses normal logic to manually return funds to a user's wallet/bank).  
    * `[Adjust Commission]` (Allows overriding the 10% fee for a specific dispute).

    #### **View 4: `admin_moderation` (Trust & Safety)**

* **Context:** Handling user reports from the Locker Room (Epic 6\) or Chat Rooms (Epic 7).  
* **Visuals:** A feed of flagged content.  
* **Components:**  
  * **Flagged Items List:** Shows the reported message/post, the reporter, and the accused user.  
  * **User Inspector:** Pulls up a user's profile, showing their Reliability Score and history.  
  * **Penalty Actions:**  
    * `[Delete Post]`  
    * `[Reset Reliability Score]`  
    * `[Suspend Account (7 Days)]`  
    * `[Perma-Ban User]` (Updates user role to `banned`, instantly logging them out and hiding all their posts/splits).

    ### **2\. User Stories & Acceptance Criteria**

* **Story 15.1: Reviewing and Activating a New Turf**  
  * **As a** Super Admin, **I want** to review uploaded KYC documents and manually approve new turfs, **so that** fraudulent or low-quality venues do not appear on the public app map.  
  * **Acceptance Criteria:**  
    * **Given** I am on `admin_kyc_queue`, **When** I review the details for "Virar Super Arena" and click `[Approve & Activate]`, **Then** the owner's status in `tm_owners` changes from `pending` to `active`.  
    * **Given** the status is changed to active, **When** a player on the mobile app refreshes their home screen, **Then** the new turf's pins and availability instantly become visible in the Discovery module.  
  * **Priority:** Must Have.  
* **Story 15.2: Manual Escrow Override & Refunds**  
  * **As a** Customer Support Admin, **I want** to manually trigger a refund for a specific booking, **so that** I can resolve complaints if a Turf Owner's physical facility was closed during a booked slot.  
  * **Acceptance Criteria:**  
    * **Given** I search for Booking ID `#TM-8992`, **When** I click `[Force Refund]` and type "Turf closed due to flooding", **Then** the booking status in `tm_bookings` updates to `refunded`.  
    * **Given** the refund is forced, **Then** the system pushes a simulated notification to the affected players and deducts the amount from the Turf Owner's next settlement ledger (Clawback).  
  * **Priority:** Must Have.  
* **Story 15.3: User Moderation & Banning**  
  * **As a** Trust & Safety Admin, **I want** to ban users who spam the Locker Room or harass others in chat, **so that** the platform remains a safe environment.  
  * **Acceptance Criteria:**  
    * **Given** I review a reported post on `admin_moderation`, **When** I click `[Perma-Ban User]` on `@toxic_player`, **Then** their `isActive` flag in `tm_profile` is set to `false`.  
    * **Given** a user is banned, **When** the system re-renders the `locker_room` and `radar` feeds, **Then** all posts and split-invites associated with that user ID are completely hidden from all other users.  
  * **Priority:** Should Have.  
* **Story 15.4: Owner Impersonation (Debugging)**  
  * **As a** Super Admin, **I want** to securely log in as a specific turf owner, **so that** I can see exactly what they are seeing when they call in for technical support.  
  * **Acceptance Criteria:**  
    * **Given** I am viewing an active turf on the dashboard, **When** I click `[Impersonate Owner]`, **Then** my `useAppState` injects their `ownerId` and routes me directly to the `owner_dashboard` view.  
    * **Given** I am in impersonation mode, **Then** a persistent red banner sits at the top of the screen reading: *"Viewing as Virar Super Arena \- \[Exit\]"*.  
  * **Priority:** Could Have (Extremely useful for post-launch support).  
  * 

