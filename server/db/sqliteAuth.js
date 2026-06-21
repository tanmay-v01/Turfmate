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
