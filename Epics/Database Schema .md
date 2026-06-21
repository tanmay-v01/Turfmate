# **TurfMate Production Database Schema (PostgreSQL)**

**Objective:** Define the complete relational database architecture for TurfMate. This schema supports complex financial escrows, hyper-local spatial querying via PostGIS, real-time chat mapping, and B2B vendor management.

## **1\. Identity & Profile Domain**

### **users**

The core authentication table for all entities (Players, Owners, Admins).

* id: UUID (Primary Key)  
* phone: VARCHAR(15) (Unique)  
* role: ENUM ('PLAYER', 'OWNER', 'SUPER\_ADMIN')  
* status: ENUM ('ACTIVE', 'SUSPENDED', 'BANNED')  
* created\_at: TIMESTAMP

  ### **player\_profiles**

Stores player-specific data and location.

* user\_id: UUID (Foreign Key \-\> users.id, Primary Key)  
* full\_name: VARCHAR(100)  
* username: VARCHAR(50) (Unique)  
* avatar\_url: VARCHAR(255)  
* reliability\_score: DECIMAL(3,2) (Default: 5.00)  
* current\_location: GEOMETRY(Point, 4326\) *(PostGIS point for precise Lat/Lng)*  
* filter\_radius\_km: INTEGER (Default: 10\)  
* updated\_at: TIMESTAMP

  ### **player\_sports\_dna**

1-to-Many relationship (A player can play multiple sports at different skill levels).

* id: UUID (Primary Key)  
* user\_id: UUID (Foreign Key \-\> users.id)  
* sport\_name: ENUM ('FOOTBALL', 'CRICKET', 'PICKLEBALL', etc.)  
* skill\_level: ENUM ('BEGINNER', 'AMATEUR', 'PRO')  
* preferred\_position: VARCHAR(50) (e.g., 'Goalkeeper', 'Fast Bowler')

  ## **2\. B2B / Turf Management Domain**

  ### **turf\_owners**

Extended details for vendors/businesses.

* user\_id: UUID (Foreign Key \-\> users.id, Primary Key)  
* business\_name: VARCHAR(150)  
* business\_email: VARCHAR(150)  
* kyc\_status: ENUM ('PENDING', 'APPROVED', 'REJECTED')  
* pan\_number: VARCHAR(20)  
* bank\_account\_no: VARCHAR(50)  
* ifsc\_code: VARCHAR(20)

  ### **turfs**

The physical venue locations.

* id: UUID (Primary Key)  
* owner\_id: UUID (Foreign Key \-\> turf\_owners.user\_id)  
* name: VARCHAR(150)  
* address: TEXT  
* location: GEOMETRY(Point, 4326\) *(PostGIS point for distance queries)*  
* rating: DECIMAL(3,2) (Default: 0.00)  
* amenities: JSONB (e.g., \["Parking", "Washroom", "Bibs"\])  
* images: JSONB (Array of URLs)  
* status: ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED')

  ### **pitches**

Specific playing fields within a Turf (e.g., Pitch A, Pitch B).

* id: UUID (Primary Key)  
* turf\_id: UUID (Foreign Key \-\> turfs.id)  
* name: VARCHAR(50) (e.g., 'Pitch A \- 5v5')  
* size\_format: VARCHAR(20) (e.g., '5v5', 'Box')  
* base\_price\_per\_hour: INTEGER (in INR)  
* is\_active: BOOLEAN

  ### **pricing\_rules**

Handles dynamic/surge pricing algorithms.

* id: UUID (Primary Key)  
* pitch\_id: UUID (Foreign Key \-\> pitches.id)  
* day\_of\_week: INTEGER (0-6, Sunday-Saturday)  
* start\_time: TIME  
* end\_time: TIME  
* surge\_amount: INTEGER (Added to base price)

  ## **3\. Booking & Escrow Engine (The USP)**

  ### **bookings**

The master record for a reserved time slot.

* id: UUID (Primary Key)  
* turf\_id: UUID (Foreign Key \-\> turfs.id)  
* pitch\_id: UUID (Foreign Key \-\> pitches.id)  
* host\_id: UUID (Foreign Key \-\> users.id \- The person who initiated it)  
* booking\_type: ENUM ('PRIVATE\_FULL', 'SPLIT\_PAY', 'MANUAL\_OFFLINE')  
* status: ENUM ('PENDING\_FUNDING', 'CONFIRMED', 'CANCELLED\_BY\_HOST', 'CANCELLED\_BY\_SYSTEM', 'CANCELLED\_BY\_OWNER')  
* start\_time: TIMESTAMP  
* end\_time: TIMESTAMP  
* total\_cost: INTEGER  
* platform\_fee: INTEGER  
* created\_at: TIMESTAMP

  ### **split\_escrow\_details**

Exists only if booking\_type \= SPLIT\_PAY.

* booking\_id: UUID (Foreign Key \-\> bookings.id, Primary Key)  
* players\_needed: INTEGER  
* cost\_per\_head: INTEGER  
* is\_public: BOOLEAN (If true, broadcasts to Locker Room)  
* expires\_at: TIMESTAMP (Time when split fails and auto-refunds if not full)

  ### **booking\_roster**

Tracks who is playing and who has paid.

* id: UUID (Primary Key)  
* booking\_id: UUID (Foreign Key \-\> bookings.id)  
* user\_id: UUID (Foreign Key \-\> users.id)  
* amount\_paid: INTEGER  
* payment\_status: ENUM ('PENDING', 'HELD\_IN\_ESCROW', 'SETTLED', 'REFUNDED')  
* is\_host: BOOLEAN  
* joined\_at: TIMESTAMP

  ## **4\. Financial Ledger Domain**

  ### **transactions**

The exact money-in and money-out log for users and owners.

* id: UUID (Primary Key)  
* booking\_id: UUID (Foreign Key \-\> bookings.id)  
* user\_id: UUID (Foreign Key \-\> users.id \- The payer)  
* gateway\_transaction\_id: VARCHAR(100) (e.g., Razorpay ID)  
* amount: INTEGER  
* transaction\_type: ENUM ('PAYMENT', 'REFUND', 'COMMISSION\_DEDUCTION', 'OWNER\_PAYOUT')  
* status: ENUM ('PROCESSING', 'SUCCESS', 'FAILED')  
* created\_at: TIMESTAMP

  ### **settlements**

Bulk payouts to Turf Owners.

* id: UUID (Primary Key)  
* owner\_id: UUID (Foreign Key \-\> turf\_owners.user\_id)  
* total\_amount: INTEGER  
* status: ENUM ('PROCESSING', 'SETTLED', 'FAILED')  
* expected\_date: DATE  
* settled\_date: TIMESTAMP

  ## **5\. Social & Community Domain (Locker Room & Squads)**

  ### **announcements (Locker Room Feed)**

* id: UUID (Primary Key)  
* author\_id: UUID (Foreign Key \-\> users.id)  
* turf\_id: UUID (Foreign Key \-\> turfs.id, Nullable \- Used for Owner promos)  
* associated\_booking\_id: UUID (Foreign Key \-\> bookings.id, Nullable)  
* post\_type: ENUM ('LFG', 'AUTO\_SPLIT', 'PROMO', 'HIGHLIGHT', 'GENERAL')  
* content: TEXT  
* post\_location: GEOMETRY(Point, 4326\) *(Used so posts only show up for local users)*  
* is\_active: BOOLEAN  
* created\_at: TIMESTAMP

  ### **friendships**

* user\_id\_1: UUID (Foreign Key \-\> users.id)  
* user\_id\_2: UUID (Foreign Key \-\> users.id)  
* status: ENUM ('PENDING', 'ACCEPTED', 'BLOCKED')  
* created\_at: TIMESTAMP  
* *(Primary Key is composite: user\_id\_1 \+ user\_id\_2)*

  ### **squad\_groups (Custom 1-Tap Invite Lists)**

* id: UUID (Primary Key)  
* owner\_id: UUID (Foreign Key \-\> users.id)  
* group\_name: VARCHAR(100) (e.g., 'Sunday Footballers')

  ### **squad\_members**

* group\_id: UUID (Foreign Key \-\> squad\_groups.id)  
* user\_id: UUID (Foreign Key \-\> users.id)  
* *(Primary Key is composite: group\_id \+ user\_id)*

  ## **6\. Messaging & Chat Domain**

  ### **chat\_rooms**

* id: UUID (Primary Key)  
* room\_type: ENUM ('GAME\_ROOM', 'DIRECT\_MESSAGE', 'LOBBY')  
* associated\_booking\_id: UUID (Foreign Key \-\> bookings.id, Nullable)  
* status: ENUM ('ACTIVE', 'ARCHIVED')

  ### **chat\_participants**

* room\_id: UUID (Foreign Key \-\> chat\_rooms.id)  
* user\_id: UUID (Foreign Key \-\> users.id)  
* last\_read\_at: TIMESTAMP  
* *(Primary Key is composite: room\_id \+ user\_id)*

  ### **messages**

* id: UUID (Primary Key)  
* room\_id: UUID (Foreign Key \-\> chat\_rooms.id)  
* sender\_id: UUID (Foreign Key \-\> users.id, Nullable if SYSTEM\_BOT)  
* message\_type: ENUM ('TEXT', 'IMAGE', 'SYSTEM\_ALERT')  
* content: TEXT  
* created\_at: TIMESTAMP

  ## **7\. Gamification & Leaderboards**

  ### **player\_lifetime\_stats**

* user\_id: UUID (Foreign Key \-\> users.id)  
* sport: ENUM ('FOOTBALL', 'CRICKET', etc.)  
* matches\_played: INTEGER (Default 0\)  
* goals\_scored: INTEGER (Default 0\)  
* runs\_scored: INTEGER (Default 0\)  
* wickets\_taken: INTEGER (Default 0\)  
* mvp\_awards: INTEGER (Default 0\)  
* *(Primary Key is composite: user\_id \+ sport)*  
  * 

