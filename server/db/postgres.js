const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const config = require('../lib/config');

let pool;

function getPool() {
  if (!pool) {
    const isLocalhost = config.databaseUrl.includes('localhost') || config.databaseUrl.includes('127.0.0.1');
    const ssl = !isLocalhost ? { rejectUnauthorized: false } : undefined;
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl,
    });
  }
  return pool;
}

async function query(text, params = []) {
  const result = await getPool().query(text, params);
  return result;
}

async function getOne(text, params = []) {
  const result = await query(text, params);
  return result.rows[0] || null;
}

async function getAll(text, params = []) {
  const result = await query(text, params);
  return result.rows;
}

async function run(text, params = []) {
  return query(text, params);
}

async function migrate() {
  const dir = path.join(__dirname, '../migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    await query(sql);
  }
}

async function close() {
  if (pool) await pool.end();
}

module.exports = {
  driver: 'postgres',
  query,
  getOne,
  getAll,
  run,
  migrate,
  close,
};
