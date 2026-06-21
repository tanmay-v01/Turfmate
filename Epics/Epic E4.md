# **Epic E4** 

## **Epic 4: Slot Selection & Checkout (E4)**

**Description:** The transactional engine. This flow allows players to interact with a live calendar, view surge pricing, temporarily lock a slot, and choose their payment path (Private Full Booking vs. Split-Pay Setup) through a simulated checkout experience.

### **1\. UI Flow & Minute-to-Minute Screen Details**

#### **View 1: `turf_details` (The Interactive Calendar Section)**

* **Visuals:** White background. Sits below the Turf Amenities section from Epic 3\.  
* **Components:**  
  * **Date Selector (Horizontal Scroll):**  
    * *Default:* Today (e.g., "Sun, Jun 21"). Active date is a solid Vibrant Green (`#4ADE80`) pill with white text. Inactive dates are plain text.  
  * **Pitch Toggle:** (Only appears if turf has multiple). e.g., Pill toggle `[Pitch A (5v5)] | [Pitch B (7v7)]`.  
  * **Time Slot Grid:** A 2-column or 3-column grid of buttons representing 1-hour blocks (e.g., `18:00 - 19:00`).  
    * *State 1 (Available):* White background, light grey border, dark text. Shows price below time (e.g., "₹1200").  
    * *State 2 (Surge Pricing):* Same as available, but includes a small ⚡ orange icon and a higher price.  
    * *State 3 (Booked):* Solid light grey background (`#E2E8F0`), muted text, non-clickable.  
    * *State 4 (Split Active):* White background, thick Orange border (`#F97316`). Text says "2 Spots Left". (Clicking this routes to Epic 5's join flow).  
* **Interaction:** Tapping a State 1 (Available) slot instantly triggers the `booking_bottom_sheet`.

#### **View 2: `booking_bottom_sheet` (The Cart Decision)**

* **Visuals:** A card that slides up from the bottom of the screen, dimming the background.  
* **Components:**  
  * **Header:** "Yashwant Nagar Arena \- Pitch A".  
  * **Sub-header:** "Sunday, Jun 21 • 18:00 \- 19:00".  
  * **Lock Timer:** Small red text pulsing at the top right: "⏳ Slot reserved for 05:00".  
  * **Option A Card (Full Book):**  
    * *Icon:* 🔒 (Lock).  
    * *Text:* "Private Booking".  
    * *Subtext:* "Pay the full ₹1200 now. Best for complete teams."  
    * *Style:* Tapping selects it (Green border).  
  * **Option B Card (Split Book):**  
    * *Icon:* 🍕 (Slice).  
    * *Text:* "Split with Squad".  
    * *Subtext:* "Pay only your share. Invite friends or make it public."  
    * *Style:* Tapping selects it (Green border).  
  * **Primary Button:** `Continue to Checkout` (Disabled until Option A or B is selected).  
* **Interaction:** Tapping `Continue to Checkout` caches the choice and routes `useAppState.view` to either `checkout_full` or `checkout_split_setup`.

#### **View 3: `checkout_split_setup` (The Host Math)**

* **Visuals:** Clean white screen. `<` Back button top left.  
* **Components:**  
  * **Header:** "Setup your Split".  
  * **Player Stepper:**  
    * *Label:* "Total Players Needed" (Including you).  
    * *Input:* `[ - ] 10 [ + ]` buttons. (Min: 2, Max: Turf Capacity).  
  * **Dynamic Calculator UI:** A large, bold text block in the center.  
    * *Text:* "You pay **₹120** today." (Calculated live: Total ₹1200 / 10 players).  
  * **Visibility Toggle:**  
    * *Switch:* `[Public (Locker Room)]` vs `[Private (Invite Link)]`. Default is Public.  
  * **Primary Button:** `Pay Advance ₹120` (Vibrant Green).  
* **Interaction:** User clicks Pay. Transitions to `payment_gateway_mock`.

#### **View 4: `checkout_full` (Standard Math)**

* **Visuals:** Clean white screen. `<` Back button.  
* **Components:**  
  * **Itemized Bill:**  
    * Turf Fee: ₹1200  
    * Platform Fee (10%): ₹120  
    * Total Payable: **₹1320**  
  * **Promo Input:** Text field `placeholder="Enter Promo Code"`, button `[Apply]`.  
  * **Primary Button:** `Pay ₹1320`.  
* **Interaction:** Transitions to `payment_gateway_mock`.

#### **View 5: `payment_gateway_mock`**

* **Visuals:** Full screen overlay. Simulates Razorpay/Stripe UI.  
* **Components:**  
  * **Header:** "TurfMate Checkout".  
  * **Mock Options:** `[UPI]`, `[Credit Card]`, `[Net Banking]`.  
  * **Button:** `[Simulate Success]`.  
* **Interaction:** User taps `Simulate Success`.  
  * Shows a 2-second spinning loader.  
  * Shows a massive Green Checkmark ✅ "Payment Successful".  
  * Writes new booking object to `localStorage` (`tm_bookings`).  
  * **Routing Logic:** If Full Booking → success ticket button opens `chat` (private game room). If Split Booking → `split_hub` (Epic 5) or success ticket → Split Hub.

### **2\. User Stories & Acceptance Criteria**

* **Story 4.1: Interactive Slot Coloring & Interaction**  
  * **As a** player, **I want** to see clearly which time slots are available or booked, **so that** I don't waste time clicking unavailable times.  
  * **Acceptance Criteria:**  
    * **Given** I am looking at the Turf Calendar, **When** a slot is present in the `tm_bookings` database for that date, **Then** the button renders with a grey background and is `disabled`.  
    * **Given** I tap a white available slot, **Then** the `booking_bottom_sheet` opens.  
  * **Priority:** Must Have  
* **Story 4.2: Temporary Slot Locking (Cart Abandonment)**  
  * **As a** system, **I want** to temporarily lock a slot when a user initiates checkout, **so that** two users don't pay for the same slot simultaneously.  
  * **Acceptance Criteria:**  
    * **Given** User A opens the `booking_bottom_sheet` for 6:00 PM, **When** User B views the calendar on their device, **Then** the 6:00 PM slot appears yellow/locked for User B.  
    * **Given** User A is in the checkout flow, **When** 5 minutes pass without payment, **Then** the temporary lock is released and the slot returns to available. *(Note: For the demo React SPA, this can be simulated via local state timestamps).*  
  * **Priority:** Should Have (Critical for Prod, mockable for Demo)  
* **Story 4.3: Dynamic Split Math Calculation**  
  * **As a** Host initiating a split game, **I want** the app to calculate my per-head cost dynamically, **so that** I know exactly how much I have to pay as an advance.  
  * **Acceptance Criteria:**  
    * **Given** I am on `checkout_split_setup` for a ₹1000 turf, **When** I tap the `[+]` button to increase players from 5 to 10, **Then** the large text instantly changes from "You pay ₹200" to "You pay ₹100".  
  * **Priority:** Must Have  
* **Story 4.4: Payment Simulation & State Persistence**  
  * **As a** user completing a booking, **I want** my payment to save my booking securely, **so that** the turf owner sees my reservation.  
  * **Acceptance Criteria:**  
    * **Given** I am on `payment_gateway_mock`, **When** I tap "Simulate Success", **Then** a JSON object containing `{bookingId, turfId, slotTime, hostId, type: 'split/full'}` is appended to the `tm_bookings` array in `localStorage`.  
  * **Priority:** Must Have

