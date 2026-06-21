# **Epic E1**

## **Epic 1: Phone OTP Auth & Session (E1)**

**Description:** Establish a frictionless, secure entry into the app. This flow handles the splash screen, value proposition carousel, phone number collection, OTP verification, and the routing logic that directs demo personas to their respective dashboards.

### **1\. UI Flow & Minute-to-Minute Screen Details**

#### **View 1: `splash`**

* **Visuals:** Full-screen solid dark green background (`#1B4332`). Centered white TurfMate logo (Text \+ Leaf/Turf icon).  
* **Interaction:** No user interaction. It holds for exactly 2 seconds.  
* **Routing:** Automatically transitions `useAppState.view` to `welcome_carousel`.

#### **View 2: `welcome_carousel`**

* **Visuals:** White background (`#F8FAFC`).  
* **Components:**  
  * **Top 70%:** Swipeable carousel.  
    * *Slide 1:* Image of players on a turf. Text: **"Find Local Turfs"** (H1, Dark Slate), "Discover venues within your play radius instantly." (Subtext, Gray).  
    * *Slide 2:* Image of a split bill. Text: **"Split the Cost"**, "Pay only your share and squad up with nearby players."  
  * **Bottom 30%:** Pagination dots (3 dots, active dot is vibrant green `#4ADE80`).  
  * **Sticky Bottom Button:** Large, full-width button.  
    * *Text:* `Get Started` (White text, Bold).  
    * *Background:* Vibrant Green (`#4ADE80`).  
* **Interaction:** Tapping `Get Started` sets view to `login`.

#### **View 3: `login`**

* **Visuals:** Clean white background. "Back" arrow `<` in the top left.  
* **Components:**  
  * **Header:** "Enter your phone number" (H1, left-aligned, Dark Slate).  
  * **Subtext:** "We'll send you an OTP to verify your account." (Body, Light Gray).  
  * **Input Field:**  
    * *Prefix:* `+91` (Fixed, uneditable, grey background box).  
    * *Input:* `placeholder="99999 99999"`. Huge typography (e.g., 24px). Opens the numeric keyboard immediately on load.  
  * **Primary Button:** `Send OTP`.  
    * *State 1 (Default):* Disabled. Background faded green/gray.  
    * *State 2 (Active):* Becomes vibrant green (`#4ADE80`) *only* when exactly 10 digits are typed.  
  * **Divider:** "OR" with horizontal lines.  
  * **Secondary Buttons:** "Continue with Google", "Continue with Apple" (Outline buttons with logos, mock functionality).  
* **Interaction:** User types 10 digits. Taps active `Send OTP`. View transitions to `otp_verify`. App state saves `tempPhone: "entered_number"`.

#### **View 4: `otp_verify`**

* **Visuals:** White background. "Back" arrow `<`.  
* **Components:**  
  * **Header:** "Verify OTP" (H1).  
  * **Subtext:** "Code sent to \+91 . `[Edit number]`" (Edit link goes back to `login`).  
  * **OTP Inputs:** 4 large, square input boxes centered on the screen.  
    * *Behavior:* Auto-focuses on the first box. Typing a number auto-advances the cursor to the next box.  
  * **Helper Text:** "Resend code in 00:30" (Countdown timer).  
  * **Primary Button:** `Verify`.  
    * *State:* Disabled until all 4 boxes have numbers.  
* **Interaction:** User enters `1234` and taps `Verify`. The routing logic (detailed in Story 1.4) triggers here.

#### **View 5: `role_selection` (Only for New Users)**

* **Visuals:** White background.  
* **Components:**  
  * **Header:** "How do you want to use TurfMate?" (H1).  
  * **Cards:** Two massive, selectable square cards side-by-side or stacked.  
    * *Card 1 (Player):* Icon of a football. "I want to Play". Subtext: "Book turfs and join games."  
    * *Card 2 (Owner):* Icon of a stadium. "I manage a Turf". Subtext: "List and manage your venue."  
    * *Selection State:* Tapping a card adds a thick vibrant green border (`border-green-500`) and a subtle drop shadow.  
  * **Primary Button:** `Continue` (Vibrant green, disabled until a card is selected).  
* **Interaction:** Tapping continue sets `userRole` in state and transitions to `profile_setup` (Module 2\) OR `owner_business` (Module 8).

### **2\. User Stories & Acceptance Criteria**

* **Story 1.1: Phone Number Validation**  
  * **As a** user, **I want** the app to validate my phone number format, **so that** I don't accidentally submit an incomplete number.  
  * **Acceptance Criteria:**  
    * **Given** I am on the `login` view, **When** I type fewer than 10 digits, **Then** the "Send OTP" button remains disabled and visually muted.  
    * **Given** I have typed exactly 10 digits, **When** I look at the "Send OTP" button, **Then** it turns vibrant green and becomes clickable.  
  * **Priority:** Must Have  
* **Story 1.2: OTP Auto-Advance Input**  
  * **As a** user, **I want** the OTP boxes to auto-advance as I type, **so that** I don't have to manually tap each box to enter the 4-digit code.  
  * **Acceptance Criteria:**  
    * **Given** I am on the `otp_verify` view, **When** I type '1' in the first box, **Then** the cursor automatically moves to the second box.  
    * **Given** I hit "Backspace" on an empty second box, **Then** the cursor moves back to the first box and deletes its content.  
  * **Priority:** Should Have  
* **Story 1.3: The Magic Demo Routing (Backend Simulation)**  
  * **As a** presenter/evaluator, **I want** specific phone numbers to instantly log me into specific roles, **so that** I can demo the app without going through the entire onboarding flow every time.  
  * **Acceptance Criteria:**  
    * **Given** I am on `otp_verify`, **When** the `tempPhone` state is `9876543210` and I enter OTP `1234`, **Then** save Player session to `localStorage` and transition `useAppState.view` to `home`.  
    * **Given** I am on `otp_verify`, **When** the `tempPhone` state is `1111111111` and I enter OTP `1234`, **Then** save Owner session and transition to `owner_dashboard`.  
    * **Given** I am on `otp_verify`, **When** the `tempPhone` state is `9999999999` and I enter OTP `1234`, **Then** save Admin session and transition to `super_admin`.  
  * **Priority:** Must Have (Critical for Demo)  
* **Story 1.4: New User Role Selection**  
  * **As a** brand new user, **I want** to choose if I am a player or a turf owner, **so that** the app shows me the correct setup screens.  
  * **Acceptance Criteria:**  
    * **Given** I am on `otp_verify` with an unrecognized phone number (e.g., `8888888888`), **When** I enter OTP `1234`, **Then** I am routed to the `role_selection` view.  
    * **Given** I am on `role_selection`, **When** I select "I want to Play" and tap Continue, **Then** my role is set to `player` and I am routed to `profile_setup`.  
  * **Priority:** Must Have

