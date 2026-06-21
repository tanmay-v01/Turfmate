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
  ];
  for (const sql of statements) {
    await run(sql);
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
