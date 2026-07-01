require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./db');
const config = require('./lib/config');
const dbStore = require('./db/index');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const turfRoutes = require('./routes/turfs');
const bookingRoutes = require('./routes/bookings');
const splitRoutes = require('./routes/splits');
const ownerRoutes = require('./routes/owners');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const lockerRoutes = require('./routes/locker');
const chatRoutes = require('./routes/chat');
const socialRoutes = require('./routes/social');
const leaderboardRoutes = require('./routes/leaderboard');
const broadcastRoutes = require('./routes/broadcasts');
const notificationRoutes = require('./routes/notifications');
const tournamentsRoutes = require('./routes/tournaments');
const { registerChatSocket } = require('./socket/chat');
const paymentsRepo = require('./repositories/payments');
const razorpayService = require('./services/razorpayService');
const bookingsRepo = require('./repositories/bookings');
const splitsRepo = require('./repositories/splits');
const broadcastsRepo = require('./repositories/broadcasts');
const { seedDemoUsers } = require('./scripts/seedDemoUsers');
const { seedTurfs } = require('./scripts/seedTurfs');
const { seedPilotPartners } = require('./scripts/seedPilotPartners');
const { authLimiter, apiLimiter } = require('./middleware/rateLimit');
const { requestLog } = require('./middleware/requestLog');
const { securityHeaders } = require('./middleware/securityHeaders');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');
const { validateProductionConfig } = require('./lib/validateProduction');
const healthRoutes = require('./routes/health');
const reliabilityEngine = require('./services/reliabilityEngine');
const logger = require('./lib/logger');

validateProductionConfig(config);

reliabilityEngine.start();

const app = express();
const server = http.createServer(app);
const PORT = config.port;
const CORS_ORIGINS = config.corsOrigin
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const { createAdapter } = require('@socket.io/redis-adapter');
const Redis = require('ioredis');

const io = new Server(server, {
  cors: {
    origin: CORS_ORIGINS,
    methods: ['GET', 'POST'],
  },
});

if (process.env.REDIS_URL) {
  const pubClient = new Redis(process.env.REDIS_URL);
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));
  logger.info('socketio_redis_adapter_enabled');
}

app.set('io', io);
app.disable('x-powered-by');

app.use(securityHeaders);
app.use(cors({ origin: CORS_ORIGINS, credentials: true }));

app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.body;
    if (razorpayService.isLive() && !razorpayService.verifyWebhookSignature(rawBody, signature)) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
    const event = JSON.parse(rawBody.toString());
    const result = await paymentsRepo.handleWebhookEvent(event);
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use(express.json());

app.use(healthRoutes);
app.use(requestLog);

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/turfs', turfRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/splits', splitRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tournaments', tournamentsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/locker', lockerRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/broadcasts', broadcastRoutes);
app.use('/api/notifications', notificationRoutes);

async function bootstrapPhase1() {
  try {
    await dbStore.migrate();
    if (process.env.SEED_PILOT_ON_START === 'true') {
      await seedPilotPartners();
      logger.info('pilot_partners_seeded');
    } else if (config.seedOnStart || config.demoMode) {
      await seedDemoUsers();
      await seedTurfs();
      logger.info('demo_data_seeded');
    }
    logger.info('database_ready', { driver: dbStore.driver });
  } catch (err) {
    global.migrationError = err.stack || err.message;
    logger.error('bootstrap_failed', { error: err.message });
  }
}
bootstrapPhase1();

app.get('/api/debug-db', async (req, res) => {
  try {
    let tables = [];
    if (dbStore.driver === 'postgres') {
      const rows = await dbStore.getAll(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      tables = rows.map(r => r.table_name);
    } else {
      const rows = await dbStore.getAll(`
        SELECT name FROM sqlite_master WHERE type='table'
      `);
      tables = rows.map(r => r.name);
    }

    res.json({
      driver: dbStore.driver,
      databaseUrlConfigured: !!config.databaseUrl,
      migrationError: global.migrationError || null,
      tables,
      env: {
        NODE_ENV: config.nodeEnv,
        PORT: config.port,
        HAS_SMTP_HOST: !!config.smtpHost,
        HAS_SMTP_USER: !!config.smtpUser,
      }
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      stack: err.stack,
      driver: dbStore.driver,
      databaseUrlConfigured: !!config.databaseUrl,
      migrationError: global.migrationError || null,
    });
  }
});

setInterval(() => {
  bookingsRepo.cleanupExpiredLocks().catch(() => {});
  splitsRepo.cleanupExpiredSplits().catch(() => {});
  broadcastsRepo.cleanupExpired().catch(() => {});
}, 60 * 1000);

// Legacy social routes (feed, radar, squads)

app.get('/api/superadmin/metrics', (req, res) => {
  // Mock calculation of global metrics
  // In reality, this queries across all turfs
  const globalGross = 1500000; // 15 Lakhs
  const totalCommission = globalGross * 0.10; // 1.5 Lakhs
  const activeTurfs = 14;

  res.json({
    globalGross,
    totalCommission,
    activeTurfs
  });
});

const path = require('path');

app.use('/api/superadmin/turfs', (req, res) => {
  // Mock list of all onboarded turfs
  const turfs = [
    { id: 'T-001', name: 'Virar Super Arena', owner: 'Rahul C', status: 'ACTIVE', revenue: 120000 },
    { id: 'T-002', name: 'Vasai Box Cricket', owner: 'Rahul C', status: 'ACTIVE', revenue: 45000 },
    { id: 'T-003', name: 'Borivali Sports Hub', owner: 'Amit Patel', status: 'ACTIVE', revenue: 250000 },
    { id: 'T-004', name: 'Andheri Kicks', owner: 'Sneha M', status: 'SUSPENDED', revenue: 0 },
  ];
  res.json(turfs);
});

// --- MODULE 5: SOCIAL & RADAR APIs ---

// Fetch Locker Room Feed
app.get('/api/feed', (req, res) => {
  const { lat, lng, radius_km } = req.query;
  
  db.all(`SELECT * FROM posts ORDER BY CASE WHEN content_type = 'AUTO_SPLIT' THEN 1 ELSE 2 END, created_at DESC LIMIT 50`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create a Post (Megaphone FAB)
app.post('/api/feed/post', (req, res) => {
  const { authorId, contentType, contentText, lat, lng } = req.body;
  const postId = crypto.randomUUID();
  const now = Date.now();
  const yesterday = now - 24 * 60 * 60 * 1000;

  // Rate Limiting Check (Max 2 posts per 24 hours)
  db.get(`SELECT COUNT(*) as count FROM posts WHERE author_id = ? AND created_at > ?`, [authorId, yesterday], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row && row.count >= 2) {
      return res.status(429).json({ error: 'Rate limit exceeded: Max 2 posts per 24 hours to prevent spam.' });
    }

    db.run(
      `INSERT INTO posts (post_id, author_id, location_lat, location_lng, content_type, content_text, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [postId, authorId, lat, lng, contentType, contentText, now],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Post created successfully', postId });
      }
    );
  });
});

// Player Radar Matchmaking
app.get('/api/radar/search', (req, res) => {
  const { sport, skill, position } = req.query;
  db.all(`SELECT user_id, username, full_name, avatar_url, reliability_score, total_games_played, skill_tags, badges FROM profiles ORDER BY reliability_score DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create Squad
app.post('/api/squads/create', (req, res) => {
  const { ownerId, squadName, members } = req.body;
  const squadId = crypto.randomUUID();
  
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    db.run(`INSERT INTO squads (squad_id, owner_id, squad_name, created_at) VALUES (?, ?, ?, ?)`, [squadId, ownerId, squadName, Date.now()]);
    
    if (members && members.length > 0) {
      const stmt = db.prepare(`INSERT INTO squad_members (squad_id, user_id) VALUES (?, ?)`);
      members.forEach(memberId => stmt.run([squadId, memberId]));
      stmt.finalize();
    }
    
    db.run("COMMIT", (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Squad created', squadId });
    });
  });
});

// 5. Cron Job: Clean up expired locks & refunds
setInterval(() => {
  const now = Date.now();
  
  db.run(`UPDATE turf_slots SET status = 'AVAILABLE', locked_by = NULL WHERE status = 'TEMPORARY_LOCK' AND locked_at < ?`, [now]);

  db.all(`SELECT id, slot_id, turf_id FROM bookings WHERE status = 'PENDING_SPLIT' AND expires_at < ?`, [now], (err, expiredBookings) => {
    if (err || !expiredBookings.length) return;

    expiredBookings.forEach(b => {
      db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        db.run(`UPDATE bookings SET status = 'CANCELLED' WHERE id = ?`, [b.id]);
        db.run(`UPDATE split_payments SET payment_status = 'REFUNDED' WHERE booking_id = ?`, [b.id]);
        db.run(`UPDATE turf_slots SET status = 'AVAILABLE' WHERE id = ?`, [`${b.turf_id}_${b.slot_id}`]);
        db.run("COMMIT");
      });
    });
  });
}, 60000);

// --- MODULE 6: WEBSOCKETS (SOCKET.IO) ---
registerChatSocket(io);

// Catch-all API 404 and Global Error Handler
app.use('/api', notFoundHandler);
app.use(globalErrorHandler);

// Serve Static Frontend (Production)
app.use(express.static(path.join(__dirname, '../dist')));
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start the server (0.0.0.0 for Railway/Render containers)
server.listen(PORT, '0.0.0.0', () => {
  logger.info('server_started', { port: PORT, cors: CORS_ORIGINS });
});
