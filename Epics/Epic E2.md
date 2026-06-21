# **Epic E2** 

## **Epic 2: Player Onboarding (E2)**

**Description:** Capture vital demographic and geographic data to power the hyper-local matchmaking engine. This flow handles avatar selection, username creation, "Sports DNA" (sports \+ skill levels), and geofencing setup.

### **1\. UI Flow & Minute-to-Minute Screen Details**

#### **View 1: `profile_setup`**

* **Visuals:** White background. Stepper indicator at the top: `Step 1 of 3` (Vibrant Green `#4ADE80` pill).  
* **Components:**  
  * **Header:** "Set up your Locker Room identity" (H1, Dark Slate).  
  * **Avatar Picker:**  
    * *Default State:* Large circular grey placeholder (`#E2E8F0`) with a camera icon.  
    * *Interaction:* Tapping opens a bottom sheet with two options: "Upload Photo" or "Generate Avatar" (Simulates calling DiceBear API to generate a random 8-bit or stylized face).  
  * **Input 1 \- Full Name:**  
    * *Label:* "Full Name"  
    * *Input:* `placeholder="e.g. Rahul Sharma"`. Underline styling. Active focus turns underline green.  
  * **Input 2 \- Username:**  
    * *Label:* "Username"  
    * *Prefix:* `@` (Fixed, light grey, uneditable).  
    * *Input:* `placeholder="virar_striker"`. All lowercase, no spaces enforced.  
    * *Helper Text:* "This is how squads will tag you."  
  * **Sticky Bottom Button:** `Next`.  
    * *State:* Disabled (grey) until both Full Name (\>2 chars) and Username (\>3 chars) are filled.  
* **Interaction:** Tapping an active `Next` saves `{ name, username, avatar }` to local React state and transitions `useAppState.view` to `sports_dna`.

#### **View 2: `sports_dna`**

* **Visuals:** White background. Stepper indicator: `Step 2 of 3`.  
* **Components:**  
  * **Header:** "What's your game?" (H1).  
  * **Subtext:** "Select your primary sports to find relevant splits nearby." (Body).  
  * **Sports Grid:** A 2-column grid of selectable cards.  
    * *Cards:* Cricket, Football, Pickleball, Badminton.  
    * *UI:* Each card has an emoji/icon \+ text.  
    * *Selected State:* Tapping a card adds a 2px solid vibrant green border (`border-green-500`), a light green background tint (`bg-green-50`), and a ✅ icon in the top right.  
  * **Dynamic Skill Level Selector (Slide-down animation):**  
    * *Trigger:* Appears *only* under a selected sport. (e.g., If Football is tapped, this UI slides down below it).  
    * *Text:* "Your Football skill level?"  
    * *Pills:* `Beginner` (Blue), `Amateur` (Orange), `Pro` (Red). User must select one.  
  * **Sticky Bottom Button:** `Next`.  
    * *State:* Disabled until at least one sport *and* its corresponding skill level are selected.  
* **Interaction:** Tapping `Next` appends `sports_pref: [{sport: 'football', skill: 'amateur'}]` to state and transitions to `location_permission`.

#### **View 3: `location_permission`**

* **Visuals:** White background. Stepper indicator: `Step 3 of 3`. Full-screen graphic focus.  
* **Components:**  
  * **Hero Image:** A beautifully styled illustration of a map pin with green radar waves pulsing out.  
  * **Header:** "Find games in your area" (H1, centered).  
  * **Subtext:** "TurfMate uses your location to show available turfs and open splits within a 5-10km radius." (Body, centered).  
  * **Primary Button:** `Allow Location Access` (Large, Vibrant Green).  
  * **Secondary Action:** `Enter area manually` (Plain text link, Dark grey, underlined).  
* **Interaction A (Primary):** Taps `Allow Location Access`. Triggers browser/device `geolocation.getCurrentPosition()`.  
  * *On Success:* Displays a momentary green Confetti animation. Saves `lat/lng` to `localStorage: tm_profile` along with previously collected data. Sets `useAppState.view` to `home`.  
* **Interaction B (Secondary):** Taps `Enter area manually`. Transitions view to `location_manual`.

#### **View 4: `location_manual` (Fallback)**

* **Visuals:** White background. "Back" arrow `<` top left.  
* **Components:**  
  * **Header:** "Where do you play?"  
  * **Search Input:** `placeholder="Search neighborhood (e.g., Vasai, Virar)"`. Left-icon: 🔍.  
  * **Map Preview:** A mini Leaflet map component (height: 250px) showing Mumbai/Palghar region by default.  
  * **List Results:** Below the search bar, auto-populate simulated results based on typing (e.g., user types "Vir" \-\> list shows "Virar West", "Virar East").  
  * **Primary Button:** `Confirm Location`.  
* **Interaction:** User selects "Virar West". Map centers on Virar coordinates. Tapping `Confirm Location` saves mock coordinates to profile and transitions to `home`.

### **2\. User Stories & Acceptance Criteria**

* **Story 2.1: Enforcing Valid Identity Data**  
  * **As a** new player, **I want** to set up my profile name and username, **so that** other players can identify me in the Locker Room and on rosters.  
  * **Acceptance Criteria:**  
    * **Given** I am on `profile_setup`, **When** I enter "Ra" in the Full Name field, **Then** the `Next` button remains disabled.  
    * **Given** I type `@virar striker` (with a space), **Then** the input field auto-formats to `@virar_striker` or removes the space instantly.  
    * **Given** valid inputs are provided, **When** I tap Next, **Then** the data is cached in temporary React state.  
  * **Priority:** Must Have  
* **Story 2.2: Dynamic Sports DNA Capture**  
  * **As a** matchmaking engine, **I want** to capture not just the user's sport, but their skill level, **so that** I can prevent Beginners from accidentally joining Pro-level splits.  
  * **Acceptance Criteria:**  
    * **Given** I am on `sports_dna`, **When** I tap the "Cricket" card, **Then** it highlights in green and reveals a sub-menu asking for my skill level.  
    * **Given** I have selected "Football" but *not* selected a skill level for it, **When** I look at the `Next` button, **Then** it is disabled.  
  * **Priority:** Must Have  
* **Story 2.3: Native GPS Capture & Persistence**  
  * **As a** location-based app, **I want** to capture the user's exact GPS coordinates, **so that** the Home screen can instantly calculate distances to turfs.  
  * **Acceptance Criteria:**  
    * **Given** I am on `location_permission`, **When** I tap "Allow Location Access" and accept the browser prompt, **Then** my `lat/lng` is captured.  
    * **Given** GPS is successfully captured, **When** the process finishes, **Then** all collected data (name, username, sports, location) is written to `localStorage` key `tm_profile`, and I am routed to `home`.  
  * **Priority:** Must Have  
* **Story 2.4: Manual Location Fallback**  
  * **As a** privacy-conscious user, **I want** to manually type my city/neighborhood, **so that** I can use the app without granting background GPS tracking.  
  * **Acceptance Criteria:**  
    * **Given** I am on `location_permission`, **When** I tap "Enter area manually", **Then** I am routed to `location_manual`.  
    * **Given** I am on `location_manual`, **When** I select "Virar" from the search list, **Then** coordinates (e.g., 19.456, 72.812) are mapped to my profile and I am routed to `home`.  
  * **Priority:** Should Have

