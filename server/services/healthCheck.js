const dbStore = require('../db/index');
const config = require('../lib/config');
const ownersRepo = require('../repositories/owners');

async function pingDatabase() {
  const started = Date.now();
  try {
    if (dbStore.driver === 'postgres') {
      await dbStore.query('SELECT 1');
    } else {
      await dbStore.getOne('SELECT 1 AS ok');
    }
    return { ok: true, latencyMs: Date.now() - started };
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - started, error: err.message };
  }
}

async function getHealthStatus({ detailed = false } = {}) {
  const dbPing = await pingDatabase();
  const mem = process.memoryUsage();

  const body = {
    ok: dbPing.ok,
    service: 'turfmate-api',
    ts: Date.now(),
    uptimeSec: Math.floor(process.uptime()),
    db: {
      ok: dbPing.ok,
      driver: dbStore.driver,
      latencyMs: dbPing.latencyMs,
      ...(dbPing.error ? { error: dbPing.error } : {}),
    },
    memory: {
      rssMb: Math.round(mem.rss / 1024 / 1024),
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
    },
    env: config.nodeEnv,
    demoMode: config.demoMode,
  };

  if (detailed && dbPing.ok) {
    try {
      const stats = await ownersRepo.getPlatformStats();
      body.metrics = {
        activeTurfs: stats.activeTurfs,
        pendingKyc: stats.pendingKyc,
      };
    } catch {
      body.metrics = null;
    }
  }

  return body;
}

module.exports = { getHealthStatus, pingDatabase };
