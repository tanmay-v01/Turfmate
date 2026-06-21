# **Epic E12 (Minute-to-Minute Deep Dive)**

## **Epic 12: Turf Owner Onboarding & KYC (B2B Web)**

**Description:** The vendor acquisition flow. This sequence captures a new turf owner's business details, precise GPS coordinates via a draggable map pin, business verification documents (KYC), and bank details for automated split-payment settlements.

### **1\. UI Flow & Minute-to-Minute Screen Details**

#### **Pre-requisite**

The user enters via `login`, enters phone `1111111111` (or a new number), completes the OTP, and selects "I manage a Turf" on the `role_selection` screen (from Epic 1). The `useAppState.view` then routes to `owner_business`.

#### **View 1: `owner_business` (The Basics)**

* **Visuals:** Clean, professional desktop-first layout. White background (`#FFFFFF`) with a subtle grey sidebar showing progress: `1. Business Details (Active)` \-\> `2. Location` \-\> `3. KYC` \-\> `4. Payouts`.  
* **Components:**  
  * **Header:** "List your Turf on TurfMate".  
  * **Input 1 \- Business Name:** `placeholder="e.g., Virar Super Arena"`.  
  * **Input 2 \- Manager Name:** `placeholder="e.g., Vikram Sharma"`.  
  * **Input 3 \- Registered Email:** `placeholder="hello@virararena.com"`.  
  * **Primary Button:** `[Next: Pin Location]`. Disabled until all fields have \>2 characters.  
* **Interaction:** Tapping Next saves to temporary React state and routes to `owner_map`.

  #### **View 2: `owner_map` (Precise Geolocation)**

* **Context:** Because players will use the app to navigate to the turf, the pin must be exact.  
* **Visuals:** 70% of the screen is a Leaflet Map. 30% is a left-hand control panel.  
* **Components:**  
  * **Left Panel:** "Where is your turf located?"  
    * *Search Bar:* `placeholder="Search neighborhood (e.g., Virar West)"`. (Uses Nominatim to jump the map).  
    * *Helper Text:* "Drag the green pin exactly to your main entrance."  
  * **The Map (Leaflet):** Centered on Mumbai/Virar. A large, draggable custom Green Pin.  
* **Interaction:** As the owner drags the pin, a small text box updates live with the `Lat/Lng` coordinates. Tapping `[Next: Verification]` saves `{ lat, lng }` to state.

  #### **View 3: `owner_kyc` (Trust & Safety)**

* **Visuals:** Form-based layout. Security icons (e.g., 🔒) to reassure the owner.  
* **Components:**  
  * **Header:** "Verify your Business (KYC)".  
  * **Input 1 \- PAN Number:** `placeholder="ABCDE1234F"`. (Crucial for Indian escrow payouts).  
  * **Input 2 \- GSTIN:** `placeholder="Optional"` (If they have it, for tax invoices on commissions).  
  * **File Uploader:** A dashed dropzone. "Drag & Drop Registration Doc or ID".  
    * *Demo behavior:* Clicking it opens file picker. Selecting any file instantly shows a mock 100% progress bar and a "file\_uploaded.png" chip.  
  * **Primary Button:** `[Next: Payout Setup]`.

    #### **View 4: `owner_payout` (Bank Details)**

* **Visuals:** Similar form layout.  
* **Components:**  
  * **Header:** "Where should we send your earnings?"  
  * **Alert Banner:** "Payouts are settled on a T+1 basis (Next Business Day)."  
  * **Input 1 \- Account Number:** `type="password"` for security.  
  * **Input 2 \- Re-enter Account:** Verifies match.  
  * **Input 3 \- IFSC Code:** `placeholder="e.g., HDFC0001234"`.  
  * **Primary Button:** `[Submit Application]` (Vibrant Green).  
* **Interaction:** Tapping Submit merges all temporary state into a new object, pushes it to `localStorage: tm_owners` with a `status: 'pending'`, and routes to `owner_pending`.

  #### **View 5: `owner_pending` (The Waiting Room)**

* **Visuals:** Full screen status view. No navigation bar.  
* **Components:**  
  * **Illustration:** A large hourglass ⏳ or clipboard with a clock.  
  * **Header:** "Your application is under review\!"  
  * **Body:** "Our team is verifying your KYC documents. This usually takes 24-48 hours. We will notify you once your turf dashboard is unlocked."  
  * **Action:** `[Log Out]` (Takes them back to splash).

    ### **2\. User Stories & Acceptance Criteria**

* **Story 12.1: Precise Map Pinning**  
  * **As a** Turf Owner, **I want** to manually drag a map pin to my entrance, **so that** players using the TurfMate app are routed exactly to my gate, not just the general street.  
  * **Acceptance Criteria:**  
    * **Given** I am on `owner_map`, **When** I drag the Leaflet marker to new coordinates, **Then** the local state `{ lat, lng }` updates dynamically.  
    * **Given** I click Next, **Then** these coordinates are saved and will be used by the Haversine formula in Module 2 (Player Discovery) to calculate player distance.  
  * **Priority:** Must Have.  
* **Story 12.2: PAN & Bank Validation**  
  * **As the** platform, **I want** to ensure basic formatting validation on KYC and Bank details, **so that** automated payouts don't fail due to typos.  
  * **Acceptance Criteria:**  
    * **Given** I am on `owner_kyc`, **When** I enter a PAN number less than 10 characters, **Then** the `Next` button remains disabled and shows a red border.  
    * **Given** I am on `owner_payout`, **When** Account Number and Re-enter Account Number do not match exactly, **Then** an error message "Account numbers do not match" appears.  
  * **Priority:** Must Have.  
* **Story 12.3: Submission & Pending State Persistence**  
  * **As a** Turf Owner, **I want** my application to be securely saved and put in a pending state, **so that** the Super Admin can review it.  
  * **Acceptance Criteria:**  
    * **Given** I tap `Submit Application`, **When** the process completes, **Then** a new owner object is saved to `tm_owners` in `localStorage` with `status: 'pending_approval'`.  
    * **Given** my status is pending, **When** I log out and log back in with my phone number, **Then** the routing logic automatically detects my status and skips onboarding, landing me directly back on the `owner_pending` view.  
  * **Priority:** Must Have.  
  * 

