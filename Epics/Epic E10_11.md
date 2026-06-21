# **Epics E10 & E11 (Minute-to-Minute Deep Dive)**

## **Epics 10 & 11: Live Score Calculator, Leaderboards, & Tournaments**

**Description:** The gamification and competitive engine. This module provides tools to score live matches on the side of the pitch, automatically compile those stats into persistent leaderboards (filtered by Squad or the local 5-10km radius), and allow users to browse and register for local structured tournaments.

### **1\. UI Flow & Minute-to-Minute Screen Details**

#### **View 1: `score_calculator` (The Pitch-side Dashboard)**

* **Context:** Opened via a quick-action button during an active booking.  
* **Visuals:** Designed for outdoor visibility. High contrast dark mode (`#121212`) or stark white with massive, bold typography. Sits full screen to prevent accidental swipes.  
* **Components:**  
  * **Header:** "Live Match • Yashwant Nagar Arena". `[End Match]` button in top right.  
  * **The Scoreboard (Football Example):**  
    * *Layout:* Split screen vertically (Team A on left, Team B on right).  
    * *Team Names:* Editable text inputs (e.g., `Team Virar` vs `Sunday Strikers`).  
    * *The Score:* Massive numbers (e.g., `2 - 1`) centered.  
    * *Action Buttons:* Huge `[+ Goal]` buttons under each score. Tapping opens a quick-select modal to attribute the goal to a specific player from the `roster`.  
  * **The Scoreboard (Cricket Box Example \- Toggleable based on sport):**  
    * *Layout:* Standard cricket ticker.  
    * *Stats:* Runs, Wickets, Overs (e.g., `45/2 (5.1)`).  
    * *Action Buttons:* `[+1]`, `[+2]`, `[+4]`, `[+6]`, `[Wicket]`.  
  * **The Timer:** Large stopwatch at the bottom center, `[Start] / [Pause]`.  
* **Interaction:** Tapping `[End Match]` triggers a confirmation modal. If confirmed, it routes to `match_summary`.

  #### **View 2: `match_summary` (Post-Game Stats)**

* **Visuals:** White background, celebratory confetti animation on load.  
* **Components:**  
  * **Final Score Header:** "Team Virar Wins\!"  
  * **Stat Allocation List:** Lists players who scored goals/took wickets.  
  * **MVP Selector:** A carousel of all players in the roster. "Vote for MVP".  
  * **Action Row:**  
    * *Primary:* `[Post Highlight to Locker Room]` (Vibrant Green).  
    * *Secondary:* `[Save & Close]`.  
* **Interaction:** Posting a highlight generates a Type-D (Highlight) card in `tm_announcements` with the final scorecard, pushing it to the local `locker_room` feed. Updates `tm_friend_stats` in localStorage.

  #### **View 3: `leaderboard` (Local Bragging Rights)**

* **Visuals:** Clean, premium feel with gold/silver/bronze accents. Reached via `AppNav`.  
* **Components:**  
  * **Header & Scope Toggle:**  
    * *Toggle:* `[My Squad] | [📍 Virar (10km)]`. Allows users to compare against friends or the whole city.  
  * **Sport & Stat Filters (Scrollable Row):**  
    * *Chips:* `[⚽ Goals]`, `[⚽ Assists]`, `[🏏 Runs]`, `[🏏 Wickets]`. Active chip is Green.  
  * **The Podium (Top 3):**  
    * *Visual:* Top 3 users displayed as avatars on a 3-step podium illustration. Gold crown on \#1.  
  * **The Ranks (List View):**  
    * *Rows:* \#4 downwards. `Rank • Avatar • Username • Stat Value`.  
    * *Sticky Bottom Row:* Always shows *your* current rank (e.g., "You are \#42 • 8 Goals").

    #### **View 4: `tournaments` (Structured Competition)**

* **Visuals:** Dynamic, image-heavy layout.  
* **Components:**  
  * **Header:** "Upcoming Tournaments".  
  * **Tournament Card:**  
    * *Image:* High-quality graphic banner (e.g., "Virar Monsoon Cup").  
    * *Tags:* `[🏏 Box Cricket]`, `[💰 ₹10,000 Prize]`, `[Starts Jun 28]`.  
    * *Status:* "8/16 Teams Registered".  
  * **Tournament Details (Slides over):**  
    * *Sections:* Overview, Rules, Prizes, Teams.  
    * *The Bracket Tab:* A visual knockout tree showing upcoming matchups.  
    * *Action:* `[Register Team (₹1500)]`.  
* **Interaction:** Tapping Register triggers the checkout flow (Module 4), deducting the entry fee and logging the team in `tm_tournaments`.

  ### **2\. User Stories & Acceptance Criteria**

* **Story 10.1: Pitch-Side Live Scoring**  
  * **As a** player on the sidelines, **I want** a simple interface to tap big buttons to add goals/runs, **so that** I can accurately track the game without needing pen and paper.  
  * **Acceptance Criteria:**  
    * **Given** I am on `score_calculator` in Football mode, **When** I tap `[+ Goal]` under Team A, **Then** a modal prompts me to select the scorer from the game roster.  
    * **Given** I select @virar\_striker, **Then** the score increments instantly, and an object `{player: 'virar_striker', stat: 'goal', time: '12:00'}` is saved to local `tm_live_game` state.  
  * **Priority:** Should Have (Highly engaging, but not block-booking critical).  
* **Story 10.2: Match Finalization & Stat Sync**  
  * **As a** player, **I want** the stats from my match to be permanently saved to my profile, **so that** my friends can see my lifetime goals/runs.  
  * **Acceptance Criteria:**  
    * **Given** I tap `[End Match]` and save the summary, **When** the state updates, **Then** all recorded stats are parsed and incremented in the `tm_friend_stats` object in `localStorage`.  
    * **Given** I choose to "Post Highlight", **Then** a formatted scorecard appears instantly on the `locker_room` feed for all users within 10km.  
  * **Priority:** Must Have (Core to gamification).  
* **Story 10.3: Dynamic Leaderboard Scope**  
  * **As a** competitive player, **I want** to see how I rank against just my friends, as well as everyone in my city, **so that** I can track my local standing.  
  * **Acceptance Criteria:**  
    * **Given** I am on the `leaderboard` view, **When** I toggle from `[My Squad]` to `[📍 Virar]`, **Then** the list re-renders, sorting all users in the DB within the geolocation bounds by the selected metric (e.g., total goals).  
    * **Given** I am ranked \#15, **Then** my personal row sticks to the bottom of the screen even while I scroll through the top 10\.  
  * **Priority:** Must Have.  
* **Story 11.1: Tournament Registration & Bracket Viewing**  
  * **As a** team captain, **I want** to find local tournaments and register my squad, **so that** we can compete for prize money.  
  * **Acceptance Criteria:**  
    * **Given** I am viewing a tournament detail page, **When** I tap the "Bracket" tab, **Then** I see a mock visual representation of a quarter-final/semi-final knockout tree.  
    * **Given** I tap `[Register Team]`, **When** I pay the simulated entry fee, **Then** my custom squad (from Epic 8\) is added to the tournament roster, and slots are decremented (e.g., from 8/16 to 9/16).  
  * **Priority:** Could Have (Great for v2, complex for initial MVP).  
  * 

