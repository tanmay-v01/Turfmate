# **Epic E13 (Minute-to-Minute Deep Dive)**

## **Epic 13: Owner Slot & Revenue Management (B2B Web)**

**Description:** The operational command center for turf managers. This module provides a desktop-first dashboard to manage pitch inventory, view a color-coded master calendar, handle offline "walk-in" cash bookings, apply dynamic surge pricing, and track revenue after platform commissions.

### **1\. UI Flow & Minute-to-Minute Screen Details**

#### **Pre-requisite**

The owner logs in with `1111111111` and OTP `1234`. The system recognizes their role and routes `useAppState.view` to `owner_dashboard`. The layout features a persistent left-hand sidebar (Dark Slate `#1E293B`) with navigation links: `[🏠 Overview]`, `[📅 Calendar]`, `[⚙️ Pitches & Pricing]`, `[💰 Revenue]`.

#### **View 1: `owner_dashboard` (The Daily Brief)**

* **Visuals:** A clean, widget-based layout on a light grey background (`#F8FAFC`).  
* **Components:**  
  * **Header:** "Welcome back, Vikram • Virar Super Arena" \+ current date.  
  * **Top KPI Cards (4 up):**  
    * *Today's Expected Revenue:* `₹14,500` (Green text).  
    * *Slots Booked Today:* `12 / 16` (75% utilization).  
    * *Pending Splits:* `2` (Alerts the manager to potential empty slots if they fail).  
    * *Next Payout:* `₹22,000` (Settling tomorrow).  
  * **Live Schedule Timeline:** A vertical timeline showing *only today's* upcoming bookings. Highlights the immediate next booking: "Arriving in 15 mins: Rahul's 5v5 Split Game • Pitch A".  
  * **Actionable Alerts Panel:** "⚠️ Action Required: Pitch 2 floodlights reported broken by user" or "Approve Refund for Rained-Out Game".

    #### **View 2: `owner_calendar` (The Master Grid)**

* **Context:** The most heavily used screen. Must be real-time and foolproof to prevent double-booking.  
* **Visuals:** A massive, interactive matrix.  
* **Components:**  
  * **Date Picker:** Top right corner. `[< Prev Day]` `[Today]` `[Next Day >]`.  
  * **The Grid:**  
    * *X-Axis (Columns):* Pitches (e.g., Pitch A \- 5v5, Pitch B \- 7v7).  
    * *Y-Axis (Rows):* 1-hour time blocks (e.g., 18:00, 19:00).  
  * **Color-Coded Slot Blocks:**  
    * 🟢 **Vibrant Green:** Booked online via TurfMate App (Paid).  
    * 🟠 **Orange:** "Split-Pay in Progress" (Slot is temporarily locked, waiting for players).  
    * 🔵 **Blue:** Manual/Offline Booking (Walk-in cash customer).  
    * ⬜ **White:** Available.  
* **Interaction (Offline Booking):** Manager clicks a White slot. A modal opens: "Add Offline Booking". Manager enters "Customer Name: John", "Phone", "Amount Paid: ₹1000 Cash". Clicks `[Save]`. The slot turns Blue and is instantly disabled on the player-facing mobile app.

  #### **View 3: `owner_pricing` (Surge & Inventory Config)**

* **Visuals:** Settings-style layout with tabs.  
* **Components:**  
  * **Pitch Management List:** Shows active pitches. Toggle switches to mark a pitch `[Active]` or `[Under Maintenance]` (instantly blocking it off the app).  
  * **Pricing Matrix Rules:**  
    * *Base Price Input:* `₹1000 / hr`.  
    * *Rule Builder:* `[+ Add Surge Rule]`.  
    * *Rule UI:* Dropdowns for "Apply \[ ₹200 \] extra to \[ Weekends \] between \[ 18:00 \] and \[ 23:00 \]".  
  * **Save Button:** `[Update Pricing Engine]`.

    #### **View 4: `owner_revenue` (The Ledger)**

* **Visuals:** Financial reporting screen with charts and tables.  
* **Components:**  
  * **Header:** "Revenue & Payouts".  
  * **Line Chart:** "Revenue last 30 days".  
  * **Transaction Table (Paginated):**  
    * *Columns:* Date, Booking ID, Source (App vs Offline), Gross Amount, Platform Fee (10%), Net Payout, Status.  
    * *Row Example:* `Jun 21 | #TM-8992 | App | ₹1200 | -₹120 | ₹1080 | ✅ Settled`.  
  * **Download Actions:** `[Export CSV]`, `[Download Monthly GST Invoice]`.

    ### **2\. User Stories & Acceptance Criteria**

* **Story 13.1: Master Calendar & Offline Walk-ins**  
  * **As a** Turf Manager at the front desk, **I want** to manually block out time slots for cash-paying walk-in customers, **so that** players on the mobile app don't double-book a pitch that is currently occupied.  
  * **Acceptance Criteria:**  
    * **Given** I am on `owner_calendar`, **When** I click an available 20:00 slot and save a manual booking, **Then** the slot color changes to Blue (Offline).  
    * **Given** the slot is saved as offline, **When** a player views the turf on the mobile app (`turf_details`), **Then** the 20:00 slot appears greyed out and unclickable.  
  * **Priority:** Must Have.  
* **Story 13.2: Dynamic Surge Pricing Engine**  
  * **As a** Turf Owner, **I want** to set automated price increases for prime evening hours and weekends, **so that** I maximize my revenue during high-demand periods without manually changing prices every day.  
  * **Acceptance Criteria:**  
    * **Given** I am on `owner_pricing`, **When** I create a surge rule adding ₹200 for Saturdays between 18:00 and 22:00, **Then** the rule is saved to `localStorage` (e.g., `tm_turf_pricing`).  
    * **Given** a player views the calendar for Saturday, **When** they click the 19:00 slot, **Then** the checkout modal reflects the new surged price (e.g., ₹1200 instead of ₹1000) and displays a small ⚡ surge icon.  
  * **Priority:** Must Have.  
* **Story 13.3: Transparent Revenue & Commission Tracking**  
  * **As a** Turf Owner, **I want** to see a breakdown of exactly how much money was collected and how much TurfMate took as a commission, **so that** my accounting matches my bank settlements.  
  * **Acceptance Criteria:**  
    * **Given** I am on `owner_revenue`, **When** I view the Transaction Table, **Then** every app-based booking calculates and displays the 10% deduction (`COMMISSION_RATE`) from the Gross amount to show the Net payout.  
    * **Given** a split-pay game was canceled and players were refunded, **Then** that transaction row shows a `🔴 Refunded` status and ₹0 Net Revenue.  
  * **Priority:** Must Have.  
* **Story 13.4: Emergency Slot Blocking (Rainouts)**  
  * **As a** Turf Manager, **I want** a "panic button" to block out the rest of the day if it starts pouring rain or the lights break, **so that** automatic refunds are issued to affected players immediately.  
  * **Acceptance Criteria:**  
    * **Given** I am on the dashboard, **When** I trigger an Emergency Block for Pitch A from 18:00 to 23:00, **Then** all pending and confirmed app bookings in that window are moved to `canceled` status.  
    * **Given** a booking is canceled this way, **Then** the system pushes a simulated notification to the affected players and reverses the escrow funds.  
  * **Priority:** Should Have.  
  * 

