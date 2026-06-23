const db = require('../db');

function toSqliteSql(sql) {
  return sql.replace(/\$(\d+)/g, '?').replace(/::jsonb/g, '');
}

function query(sql, params = []) {
  sql = toSqliteSql(sql);
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve({ rows: rows || [] });
    });
  });
}

function getOne(sql, params = []) {
  sql = toSqliteSql(sql);
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
}

function getAll(sql, params = []) {
  return query(sql, params).then((r) => r.rows);
}

function run(sql, params = []) {
  sql = toSqliteSql(sql);
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve({ rowCount: this.changes, lastID: this.lastID });
    });
  });
}

async function tableHasColumn(table, column) {
  const cols = await getAll(`PRAGMA table_info(${table})`);
  return cols.some((c) => c.name === column);
}

async function migrate() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'PLAYER',
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      onboarding_complete INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS player_profiles (
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
    )`,
    `CREATE TABLE IF NOT EXISTS turf_owners (
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
    )`,
    `CREATE TABLE IF NOT EXISTS turfs (
      id TEXT PRIMARY KEY,
      owner_user_id TEXT,
      legacy_id TEXT UNIQUE,
      name TEXT NOT NULL,
      address TEXT,
      city TEXT,
      location_lat REAL,
      location_lng REAL,
      rating REAL DEFAULT 0,
      amenities TEXT DEFAULT '[]',
      images TEXT DEFAULT '[]',
      sports TEXT DEFAULT '[]',
      meta TEXT DEFAULT '{}',
      status TEXT DEFAULT 'ACTIVE'
    )`,
    `CREATE TABLE IF NOT EXISTS slot_locks (
      id TEXT PRIMARY KEY,
      turf_id TEXT NOT NULL,
      slot_key TEXT NOT NULL UNIQUE,
      locked_by TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(turf_id) REFERENCES turfs(id)
    )`,
    `CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      turf_id TEXT NOT NULL,
      host_id TEXT NOT NULL,
      booking_type TEXT NOT NULL,
      status TEXT NOT NULL,
      slot_key TEXT NOT NULL,
      total_cost INTEGER DEFAULT 0,
      platform_fee INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(turf_id) REFERENCES turfs(id),
      FOREIGN KEY(host_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS booking_roster (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      amount_paid INTEGER DEFAULT 0,
      payment_status TEXT DEFAULT 'SETTLED',
      is_host INTEGER DEFAULT 0,
      joined_at INTEGER NOT NULL,
      UNIQUE(booking_id, user_id),
      FOREIGN KEY(booking_id) REFERENCES bookings(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS split_escrow_details (
      booking_id TEXT PRIMARY KEY,
      players_needed INTEGER NOT NULL,
      cost_per_head INTEGER NOT NULL,
      amount_collected INTEGER NOT NULL DEFAULT 0,
      is_public INTEGER NOT NULL DEFAULT 1,
      expires_at INTEGER NOT NULL,
      slot_time TEXT,
      date_label TEXT,
      sport TEXT,
      FOREIGN KEY(booking_id) REFERENCES bookings(id)
    )`,
    `CREATE TABLE IF NOT EXISTS payment_orders (
      id TEXT PRIMARY KEY,
      razorpay_order_id TEXT UNIQUE,
      razorpay_payment_id TEXT,
      user_id TEXT NOT NULL,
      purpose TEXT NOT NULL,
      amount_paise INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      status TEXT NOT NULL DEFAULT 'CREATED',
      payload TEXT NOT NULL DEFAULT '{}',
      booking_id TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS payout_ledger (
      id TEXT PRIMARY KEY,
      booking_id TEXT,
      turf_id TEXT,
      owner_user_id TEXT NOT NULL,
      entry_type TEXT NOT NULL DEFAULT 'BOOKING_SETTLED',
      gross_inr INTEGER NOT NULL DEFAULT 0,
      commission_inr INTEGER NOT NULL DEFAULT 0,
      net_inr INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'PENDING_SETTLEMENT',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY(owner_user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS locker_posts (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL,
      content_type TEXT NOT NULL,
      content_text TEXT NOT NULL,
      extra_json TEXT NOT NULL DEFAULT '{}',
      location_lat REAL,
      location_lng REAL,
      expires_at INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(author_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS chat_rooms (
      id TEXT PRIMARY KEY,
      room_type TEXT NOT NULL DEFAULT 'game',
      booking_id TEXT,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      meta TEXT NOT NULL DEFAULT '{}',
      created_at INTEGER NOT NULL,
      FOREIGN KEY(booking_id) REFERENCES bookings(id)
    )`,
    `CREATE TABLE IF NOT EXISTS chat_members (
      room_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      joined_at INTEGER NOT NULL,
      last_read_at INTEGER,
      PRIMARY KEY(room_id, user_id),
      FOREIGN KEY(room_id) REFERENCES chat_rooms(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      sender_id TEXT,
      sender_name TEXT NOT NULL,
      content_type TEXT NOT NULL DEFAULT 'TEXT',
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(room_id) REFERENCES chat_rooms(id)
    )`,
    `CREATE TABLE IF NOT EXISTS friend_requests (
      id TEXT PRIMARY KEY,
      from_user_id TEXT NOT NULL,
      to_user_id TEXT,
      to_username TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      created_at INTEGER NOT NULL,
      FOREIGN KEY(from_user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS squads (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(owner_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS squad_members (
      squad_id TEXT NOT NULL,
      member_name TEXT NOT NULL,
      member_user_id TEXT,
      PRIMARY KEY(squad_id, member_name),
      FOREIGN KEY(squad_id) REFERENCES squads(id)
    )`,
    `CREATE TABLE IF NOT EXISTS player_sport_stats (
      user_id TEXT NOT NULL,
      sport TEXT NOT NULL,
      stats TEXT NOT NULL DEFAULT '{}',
      updated_at INTEGER NOT NULL,
      PRIMARY KEY(user_id, sport),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS match_results (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      sport TEXT NOT NULL,
      summary TEXT,
      delta TEXT NOT NULL DEFAULT '{}',
      created_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS owner_broadcasts (
      id TEXT PRIMARY KEY,
      owner_user_id TEXT NOT NULL,
      turf_id TEXT,
      turf_legacy_id TEXT,
      category TEXT NOT NULL DEFAULT 'PROMO',
      headline TEXT NOT NULL,
      body_text TEXT NOT NULL,
      promo_code TEXT,
      cta_text TEXT DEFAULT 'Book Now',
      sport TEXT DEFAULT 'football',
      expires_at INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at INTEGER NOT NULL,
      FOREIGN KEY(owner_user_id) REFERENCES users(id)
    )`,
  ];
  for (const sql of statements) {
    await run(sql);
  }

  // Legacy db.js bookings schema lacks slot_key — recreate Phase 1c tables
  const bookingsOk = await tableHasColumn('bookings', 'slot_key');
  if (!bookingsOk) {
    await run('DROP TABLE IF EXISTS booking_roster');
    await run('DROP TABLE IF EXISTS bookings');
    await run(`CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      turf_id TEXT NOT NULL,
      host_id TEXT NOT NULL,
      booking_type TEXT NOT NULL,
      status TEXT NOT NULL,
      slot_key TEXT NOT NULL,
      total_cost INTEGER DEFAULT 0,
      platform_fee INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(turf_id) REFERENCES turfs(id),
      FOREIGN KEY(host_id) REFERENCES users(id)
    )`);
    await run(`CREATE TABLE IF NOT EXISTS booking_roster (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      amount_paid INTEGER DEFAULT 0,
      payment_status TEXT DEFAULT 'SETTLED',
      is_host INTEGER DEFAULT 0,
      joined_at INTEGER NOT NULL,
      UNIQUE(booking_id, user_id),
      FOREIGN KEY(booking_id) REFERENCES bookings(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
  }

  const locksOk = await tableHasColumn('slot_locks', 'slot_key');
  if (!locksOk) {
    await run('DROP TABLE IF EXISTS slot_locks');
    await run(`CREATE TABLE IF NOT EXISTS slot_locks (
      id TEXT PRIMARY KEY,
      turf_id TEXT NOT NULL,
      slot_key TEXT NOT NULL UNIQUE,
      locked_by TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(turf_id) REFERENCES turfs(id)
    )`);
  }

  const ownerKycCols = [
    ['location_lat', 'REAL'],
    ['location_lng', 'REAL'],
    ['location_label', 'TEXT'],
    ['kyc_doc_name', 'TEXT'],
    ['account_holder', 'TEXT'],
    ['turf_name', 'TEXT'],
    ['reject_note', 'TEXT'],
    ['applied_at', 'INTEGER'],
  ];
  for (const [col, type] of ownerKycCols) {
    if (!(await tableHasColumn('turf_owners', col))) {
      await run(`ALTER TABLE turf_owners ADD COLUMN ${col} ${type}`);
    }
  }
}

async function close() {
  return Promise.resolve();
}

module.exports = {
  driver: 'sqlite',
  db,
  query,
  getOne,
  getAll,
  run,
  migrate,
  close,
};
