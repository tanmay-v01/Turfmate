# **Epic E3** 

## **Epic 3: Turf Search & Map Discovery (E3)**

**Description:** The core exploration engine. This flow allows players to manipulate their geofenced radius, toggle between map and list views, apply advanced filters (sports, pitch sizes), and view detailed turf profiles.

### **1\. UI Flow & Minute-to-Minute Screen Details**

#### **View 1: `home` (The Dashboard)**

* **Visuals:** Off-white background (`#F8FAFC`).  
* **Components:**  
  * **Sticky Header:**  
    * *Left:* User Avatar (mini).  
    * *Center:* Location Dropdown pill: `📍 Virar West (5km) ▼`. Tapping sets view to `play_radius`.  
    * *Right:* Notification Bell 🔔 (with red dot if active).  
  * **Live Ticker (Top):** Horizontal scrolling marquee (e.g., "🔥 3 open splits nearby • 🌧️ Pitch 2 at Yashwant Arena under maintenance").  
  * **Quick Action Row:** 3 large icon-buttons.  
    * `[🗺️ Explore Map]` (Sets view to `search_engine`)  
    * `[💸 Join Splits]` (Sets view to `locker_room`)  
    * `[👥 My Squad]` (Sets view to `squad`)  
  * **Quick Filters (Horizontal Scroll):** Chips `[All]`, `[⚽ Football]`, `[🏏 Cricket]`, `[🎾 Pickleball]`. Active chip is vibrant green (`#4ADE80`), others are white with grey borders.  
  * **"Turfs Near You" (Horizontal Carousel):**  
    * *Turf Card:* Rounded corners, subtle drop shadow. Top 60% is an image. Bottom 40% contains: H3 Turf Name, `⭐ 4.8`, and distance `1.2 km away`.  
* **Interaction:** Tapping a Quick Filter instantly re-renders the "Turfs Near You" carousel by filtering the `tm_turfs` local state. Tapping a Turf Card sets view to `turf_details`.

#### **View 2: `play_radius` (Radius Controller)**

* **Visuals:** Full-screen modal over a dimmed background.  
* **Components:**  
  * **Header:** "Set your Play Radius" \+ `[x]` close button.  
  * **Map Preview:** A Leaflet map (height: 50%) centered on the user's `lat/lng`. A green translucent circle `fillColor: '#4ADE80', fillOpacity: 0.2` is drawn on the map.  
  * **Radius Slider:**  
    * *Track:* Grey line, active part is green.  
    * *Range:* 2km to 20km. Step: 1km.  
    * *Dynamic Text:* "Showing turfs within **5 km**" (Updates live as slider moves).  
  * **Primary Button:** `Apply Radius`.  
* **Interaction:** Sliding the thumb updates the Leaflet circle radius in real-time. Tapping `Apply Radius` saves `filterRadius` to `tm_profile` state, closes the modal, and forces a re-calculation of distances on the `home` view using the Haversine formula.

#### **View 3: `search_engine` (Map vs. List)**

* **Visuals:** Full screen. No bottom navigation (hidden for maximum screen real estate). Top search bar row.  
* **Components:**  
  * **Search Header:** `<` Back arrow. Search input `placeholder="Search turfs..."`. `[Filter ⚙️]` button on the right.  
  * **View Toggle (Floating Bottom-Center):** Pill-shaped toggle. `[🗺️ Map] | [📋 List]`.  
  * **State A: Map View:** Full-screen Leaflet map. Custom markers (Vibrant Green TurfMate pins).  
  * **State B: List View:** Vertical scrolling list of wide Turf Cards.  
  * **Map Interaction \- Turf Preview Card:**  
    * *Trigger:* User taps a green pin on the map.  
    * *Action:* The pin slightly enlarges. A small "Preview Card" slides up from the bottom (above the view toggle).  
    * *Preview Card UI:* Turf image (left), Name & Price (right), `[View Details >]` button.  
  * **Filter Bottom Sheet:** Triggered by `[Filter ⚙️]`. Contains toggles for "Pitch Size" (5v5, 7v7, Box) and "Amenities" (Washroom, Parking).  
* **Interaction:** Tapping `[View Details >]` or a card in the List View sets view to `turf_details`.

#### **View 4: `turf_details`**

* **Visuals:** Clean, scrolling page.  
* **Components:**  
  * **Hero Image Gallery:** Top 30% of screen. Swipeable images. A `<` floating back button in top-left.  
  * **Header Section:** H1 "Yashwant Nagar Arena". Rating ⭐ 4.8 (120 reviews).  
  * **Location Row:** `📍 Virar West • 2.5km away`. `[Get Directions]` (External link to Google Maps).  
  * **Amenities Grid:** 2x2 or 3x2 grid of small icons \+ text (e.g., 🅿️ Parking, 🚰 Water, 🚿 Showers).  
  * **Sticky Bottom Footer:** Always visible on scroll.  
    * *Text:* "From ₹800 / hr".  
    * *Button:* `[Check Availability]` (Vibrant Green).  
* **Interaction:** Tapping `Check Availability` scrolls the user smoothly down to the interactive Booking/Slot calendar (which we will cover in Epic 4).

### **2\. User Stories & Acceptance Criteria**

* **Story 3.1: Dynamic Radius Calculation (Haversine)**  
  * **As a** player, **I want** the home screen to only show turfs within my selected radius, **so that** I don't see venues that are too far away to travel to.  
  * **Acceptance Criteria:**  
    * **Given** my `filterRadius` is set to 5km and my location is Virar, **When** the `home` view loads, **Then** a background utility calculates the distance to all turfs in `tm_turfs`.  
    * **Given** a turf is 6km away, **Then** it does not render in the "Turfs Near You" list.  
  * **Priority:** Must Have  
* **Story 3.2: Map & Preview Card Interaction**  
  * **As a** visual explorer, **I want** to tap pins on a map to see a quick summary of a turf, **so that** I don't have to load a full new page just to see its name and price.  
  * **Acceptance Criteria:**  
    * **Given** I am on `search_engine` in Map View, **When** I tap a custom Leaflet marker, **Then** the map centers slightly, and a `PreviewCard` component slides up from the bottom edge.  
    * **Given** the Preview Card is visible, **When** I tap anywhere else on the map, **Then** the Preview Card slides back down and disappears.  
  * **Priority:** Must Have  
* **Story 3.3: Live Play Radius Adjustments**  
  * **As a** player willing to travel further on weekends, **I want** a slider to easily expand my search area, **so that** I can discover new venues.  
  * **Acceptance Criteria:**  
    * **Given** I am on the `play_radius` modal, **When** I drag the slider from 5km to 15km, **Then** the visual circle on the Leaflet map expands in real-time to reflect the new boundary.  
    * **Given** I tap "Apply Radius", **Then** the modal closes and the global state updates instantly, re-rendering active components.  
  * **Priority:** Should Have  
* **Story 3.4: Quick Category Filtering**  
  * **As a** cricketer, **I want** to filter the dashboard to only show box cricket turfs, **so that** I don't waste time looking at 11-a-side football pitches.  
  * **Acceptance Criteria:**  
    * **Given** I am on the `home` view, **When** I tap the "Cricket" quick filter chip, **Then** the chip turns green and the Turf Carousel instantly filters out any venues that do not have `sports: ['cricket']` in their data array.  
  * **Priority:** Must Have

