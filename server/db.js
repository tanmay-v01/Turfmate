const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.SQLITE_PATH
  ? path.resolve(process.env.SQLITE_PATH)
  : path.resolve(__dirname, 'turfmate.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database at', dbPath);
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    // --- MODULE 3/4 TABLES ---
    db.run(`
      CREATE TABLE IF NOT EXISTS tournaments (
        id TEXT PRIMARY KEY,
        name TEXT,
        sport TEXT,
        icon TEXT,
        date TEXT,
        location TEXT,
        entry_fee INTEGER,
        prize_pool INTEGER,
        max_teams INTEGER,
        registered_teams INTEGER,
        status TEXT,
        banner TEXT,
        organizer TEXT,
        description TEXT,
        brackets TEXT,
        created_at INTEGER,
        updated_at INTEGER
      )
    `);

    db.get('SELECT COUNT(*) as count FROM tournaments', [], (err, row) => {
      if (!err && row && row.count === 0) {
        db.run(`
          INSERT INTO tournaments (
            id, name, sport, icon, date, location, entry_fee, prize_pool, max_teams,
            registered_teams, status, banner, organizer, description, brackets,
            created_at, updated_at
          ) VALUES (
            't-seed1', 'Monsoon Football Championship', 'football', '⚽', 'June 28-30, 2026',
            'Green Valley Arena, Virar', 1500, 25000, 16, 11, 'open',
            'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600',
            'Virar Sports Association', 'The ultimate 5v5 football showdown in Virar.',
            NULL, 1718000000000, 1718000000000
          )
        `);
      }
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS turf_slots (
        id TEXT PRIMARY KEY,
        turf_id TEXT,
        status TEXT DEFAULT 'AVAILABLE',
        locked_by TEXT,
        locked_at INTEGER
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        turf_id TEXT,
        slot_id TEXT,
        status TEXT,
        total_amount INTEGER,
        amount_collected INTEGER DEFAULT 0,
        is_public BOOLEAN,
        host_id TEXT,
        players_needed INTEGER,
        expires_at INTEGER,
        source_type TEXT DEFAULT 'APP' -- 'APP' or 'MANUAL_OFFLINE'
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS split_payments (
        id TEXT PRIMARY KEY,
        booking_id TEXT,
        user_id TEXT,
        amount_paid INTEGER,
        payment_status TEXT DEFAULT 'HELD_IN_ESCROW',
        created_at INTEGER
      )
    `);

    // --- MODULE 5 TABLES ---
    
    // Profiles
    db.run(`
      CREATE TABLE IF NOT EXISTS profiles (
        user_id TEXT PRIMARY KEY,
        username TEXT,
        full_name TEXT,
        avatar_url TEXT,
        reliability_score REAL DEFAULT 5.0,
        total_games_played INTEGER DEFAULT 0,
        splits_hosted INTEGER DEFAULT 0,
        skill_tags TEXT, -- Stored as JSON: {"cricket": "amateur", "football": "pro"}
        badges TEXT -- Stored as JSON: ["Top Organizer", "Early Bird"]
      )
    `);

    // Feed Posts
    db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        post_id TEXT PRIMARY KEY,
        author_id TEXT,
        location_lat REAL,
        location_lng REAL,
        content_type TEXT, -- "LFG", "AUTO_SPLIT", "GENERAL", "TURF_ANNOUNCEMENT"
        content_text TEXT,
        associated_booking_id TEXT,
        created_at INTEGER
      )
    `);

    // Squads (Rosters)
    db.run(`
      CREATE TABLE IF NOT EXISTS squads (
        squad_id TEXT PRIMARY KEY,
        owner_id TEXT,
        squad_name TEXT,
        created_at INTEGER
      )
    `);

    // Squad Members
    db.run(`
      CREATE TABLE IF NOT EXISTS squad_members (
        squad_id TEXT,
        user_id TEXT,
        PRIMARY KEY(squad_id, user_id)
      )
    `);

    // Friends / Connections
    db.run(`
      CREATE TABLE IF NOT EXISTS friends (
        user_id_1 TEXT,
        user_id_2 TEXT,
        status TEXT DEFAULT 'ACCEPTED', -- 'PENDING', 'ACCEPTED', 'BLOCKED'
        PRIMARY KEY(user_id_1, user_id_2)
      )
    `);

    // --- MODULE 6: CHAT HUB TABLES ---

    db.run(`
      CREATE TABLE IF NOT EXISTS chat_rooms (
        room_id TEXT PRIMARY KEY,
        room_type TEXT, -- "GAME", "DIRECT", "SQUAD"
        associated_booking_id TEXT,
        status TEXT DEFAULT 'ACTIVE', -- "ACTIVE", "LOCKED", "ARCHIVED"
        room_name TEXT,
        avatar_url TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS chat_members (
        room_id TEXT,
        user_id TEXT,
        joined_at INTEGER,
        last_read_at INTEGER,
        PRIMARY KEY(room_id, user_id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        message_id TEXT PRIMARY KEY,
        room_id TEXT,
        sender_id TEXT, -- user_id or "SYSTEM_BOT"
        sender_name TEXT,
        content_type TEXT, -- "TEXT", "IMAGE", "SYSTEM_ALERT", "INVITE_CARD"
        content TEXT,
        created_at INTEGER
      )
    `);

    // --- MODULE 7: B2B OPERATIONS TABLES ---

    db.run(`
      CREATE TABLE IF NOT EXISTS turf_pitches (
        pitch_id TEXT PRIMARY KEY,
        turf_id TEXT,
        name TEXT,
        size TEXT, -- "5v5", "7v7", etc.
        is_active BOOLEAN DEFAULT 1
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS pricing_rules (
        rule_id TEXT PRIMARY KEY,
        pitch_id TEXT,
        day_of_week TEXT, -- JSON array string '[1,2,3,4,5,6,7]'
        start_time TEXT, -- '18:00'
        end_time TEXT, -- '23:00'
        price INTEGER
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS staff (
        staff_id TEXT PRIMARY KEY,
        turf_id TEXT,
        name TEXT,
        role TEXT, -- "OWNER", "DESK_MANAGER"
        phone TEXT
      )
    `);

    // --- MODULE 8: REVENUE & PAYOUT MANAGEMENT ---

    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        transaction_id TEXT PRIMARY KEY,
        booking_id TEXT,
        turf_id TEXT,
        amount_gross INTEGER,
        platform_fee INTEGER,
        amount_net INTEGER,
        type TEXT, -- "CREDIT" (Booking), "DEBIT" (Refund/Clawback)
        created_at INTEGER
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS settlements (
        settlement_id TEXT PRIMARY KEY,
        turf_id TEXT,
        total_amount INTEGER,
        bank_account_last4 TEXT,
        status TEXT, -- "PENDING", "PROCESSED", "FAILED"
        expected_date TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        phone TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'PLAYER',
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        onboarding_complete INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS player_profiles (
        user_id TEXT PRIMARY KEY,
        full_name TEXT,
        username TEXT UNIQUE,
        avatar_url TEXT,
        location_label TEXT,
        location_lat REAL,
        location_lng REAL,
        filter_radius_km INTEGER DEFAULT 10,
        reliability_score REAL DEFAULT 5.0,
        sports_dna TEXT DEFAULT '[]',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS turf_owners (
        user_id TEXT PRIMARY KEY,
        business_name TEXT,
        business_email TEXT,
        owner_name TEXT,
        kyc_status TEXT DEFAULT 'PENDING',
        pan_number TEXT,
        bank_account_no TEXT,
        ifsc_code TEXT,
        gstin TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);
  });
}

// Add Alter table to update existing schema if we had one
db.run("ALTER TABLE bookings ADD COLUMN source_type TEXT DEFAULT 'APP'", (err) => {
  // Ignored if column already exists
});

module.exports = db;
