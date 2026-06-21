const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;
const CORS_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: CORS_ORIGINS,
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'turfmate-api', ts: Date.now() });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'turfmate-api', ts: Date.now() });
});

// 1. Lock a Slot
app.post('/api/bookings/lock', (req, res) => {
  const { turfId, slotId, userId } = req.body;
  const lockExpiration = Date.now() + 5 * 60 * 1000; // 5 minutes

  db.get(`SELECT status, locked_at, locked_by FROM turf_slots WHERE slot_id = ? AND turf_id = ?`, [slotId, turfId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (row && row.status === 'BOOKED') {
      return res.status(409).json({ error: 'Slot already booked' });
    }

    if (row && row.status === 'TEMPORARY_LOCK') {
      // Check if lock expired
      if (Date.now() < row.locked_at && row.locked_by !== userId) {
        return res.status(409).json({ error: 'Slot temporarily locked by another user' });
      }
    }

    // Insert or Replace lock
    db.run(
      `INSERT INTO turf_slots (id, turf_id, status, locked_by, locked_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET status=excluded.status, locked_by=excluded.locked_by, locked_at=excluded.locked_at`,
      [`${turfId}_${slotId}`, turfId, 'TEMPORARY_LOCK', userId, lockExpiration],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Slot locked for 5 minutes', lockedUntil: lockExpiration });
      }
    );
  });
});

// 2. Standard Checkout
app.post('/api/bookings/checkout', (req, res) => {
  const { turfId, slotId, userId, amount } = req.body;
  const bookingId = crypto.randomUUID();

  // Mark slot as booked
  db.run(`UPDATE turf_slots SET status = 'BOOKED' WHERE id = ?`, [`${turfId}_${slotId}`], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    // Create booking
    db.run(
      `INSERT INTO bookings (id, turf_id, slot_id, status, total_amount, amount_collected, is_public, host_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [bookingId, turfId, slotId, 'CONFIRMED', amount, amount, false, userId],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // --- MODULE 6: CREATE AUTO-GAME CHATROOM ---
        const roomId = `room-${bookingId}`;
        db.run(
          `INSERT INTO chat_rooms (room_id, room_type, associated_booking_id, room_name) VALUES (?, ?, ?, ?)`,
          [roomId, 'GAME', bookingId, `Game Hub`],
          (err) => {
            if (!err) {
              // Add host to chat members
              db.run(`INSERT INTO chat_members (room_id, user_id, joined_at) VALUES (?, ?, ?)`, [roomId, userId, Date.now()]);
            }
          }
        );

        res.json({ message: 'Booking confirmed', bookingId });
      }
    );
  });
});

// 3. Initiate Split (Host)
app.post('/api/splits/initiate', (req, res) => {
  const { turfId, slotId, hostId, totalAmount, hostAdvance, playersNeeded, isPublic, gameTime } = req.body;
  const bookingId = crypto.randomUUID();
  const paymentId = crypto.randomUUID();
  // Expires 2 hours before game (simulated for now, let's just use Date.now() + 2 hours for demo)
  const expiresAt = Date.now() + 2 * 60 * 60 * 1000; 

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    // Lock Slot as SPLIT_ACTIVE
    db.run(`UPDATE turf_slots SET status = 'SPLIT_ACTIVE' WHERE id = ?`, [`${turfId}_${slotId}`]);

    // Create Booking
    db.run(
      `INSERT INTO bookings (id, turf_id, slot_id, status, total_amount, amount_collected, is_public, host_id, players_needed, expires_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [bookingId, turfId, slotId, 'PENDING_SPLIT', totalAmount, hostAdvance, isPublic, hostId, playersNeeded, expiresAt]
    );

    // Record Escrow Payment
    db.run(
      `INSERT INTO split_payments (id, booking_id, user_id, amount_paid, payment_status, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [paymentId, bookingId, hostId, hostAdvance, 'HELD_IN_ESCROW', Date.now()]
    );

    // Create Chat Room
    db.run(`INSERT INTO chat_rooms (room_id, room_type, associated_booking_id, room_name) VALUES (?, ?, ?, ?)`, [`room-${bookingId}`, 'SPLIT', bookingId, `Split Match`]);
    db.run(`INSERT INTO chat_members (room_id, user_id, joined_at) VALUES (?, ?, ?)`, [`room-${bookingId}`, hostId, Date.now()]);

    db.run("COMMIT", (err) => {
      if (err) {
        db.run("ROLLBACK");
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Split initialized', bookingId });
    });
  });
});

// 4. Join Split
app.post('/api/splits/join', (req, res) => {
  const { bookingId, userId, amount } = req.body;
  const paymentId = crypto.randomUUID();

  db.get(`SELECT status, total_amount, amount_collected, players_needed FROM bookings WHERE id = ?`, [bookingId], (err, booking) => {
    if (err || !booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'PENDING_SPLIT') return res.status(400).json({ error: 'Split is no longer active' });

    // Race condition check: is it already full?
    if (booking.amount_collected + amount > booking.total_amount) {
       return res.status(409).json({ error: 'Sorry, this game just filled up!' });
    }

    db.serialize(() => {
      db.run("BEGIN TRANSACTION");
      
      const newCollected = booking.amount_collected + amount;
      let newStatus = 'PENDING_SPLIT';

      // Check if fully funded
      if (newCollected >= booking.total_amount) {
        newStatus = 'CONFIRMED';
        // When confirmed, ideally we update all HELD_IN_ESCROW to SETTLED
      }

      db.run(`UPDATE bookings SET amount_collected = ?, status = ? WHERE id = ?`, [newCollected, newStatus, bookingId]);
      
      db.run(
        `INSERT INTO split_payments (id, booking_id, user_id, amount_paid, payment_status, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [paymentId, bookingId, userId, amount, newStatus === 'CONFIRMED' ? 'SETTLED' : 'HELD_IN_ESCROW', Date.now()]
      );

      if (newStatus === 'CONFIRMED') {
         db.run(`UPDATE split_payments SET payment_status = 'SETTLED' WHERE booking_id = ?`, [bookingId]);
      }

      db.run("COMMIT", (err) => {
        if (err) {
           db.run("ROLLBACK");
           return res.status(500).json({ error: err.message });
        }
        // --- MODULE 6: SYSTEM BOT NOTIFICATION ---
        const roomId = `room-${bookingId}`;
        const sysMsgId = crypto.randomUUID();
        db.run(
          `INSERT INTO messages (message_id, room_id, sender_id, sender_name, content_type, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [sysMsgId, roomId, 'SYSTEM_BOT', 'TurfMate Bot', 'SYSTEM_ALERT', `🟢 ${userId} has paid and joined the split!`, Date.now()]
        );
        // Add member to chat
        db.run(`INSERT INTO chat_members (room_id, user_id, joined_at) VALUES (?, ?, ?)`, [roomId, userId, Date.now()]);
        
        // Broadcast via socket if room exists
        io.to(roomId).emit('receive_message', {
          id: sysMsgId, roomId, sender: 'TurfMate Bot', text: `🟢 ${userId} has paid and joined the split!`, type: 'SYSTEM_ALERT', time: new Date().toLocaleTimeString()
        });

        res.json({ message: 'Successfully joined split', status: newStatus });
      });
    });
  });
});

// --- MODULE 9: SUPER ADMIN APIs ---

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

app.get('/api/superadmin/turfs', (req, res) => {
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

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on('send_message', (data, callback) => {
    const { roomId, userId, userName, text, type = 'TEXT' } = data;
    
    // Simple Rate Limit for Images
    if (type === 'IMAGE') {
      const now = Date.now();
      const oneMinAgo = now - 60000;
      db.get(`SELECT COUNT(*) as count FROM messages WHERE room_id = ? AND sender_id = ? AND content_type = 'IMAGE' AND created_at > ?`, [roomId, userId, oneMinAgo], (err, row) => {
        if (row && row.count >= 3) {
          if (callback) callback({ error: 'Rate limit: Max 3 images per minute' });
          return;
        }
        processMessage();
      });
    } else {
      processMessage();
    }

    function processMessage() {
      const msgId = crypto.randomUUID();
      const now = Date.now();
      db.run(
        `INSERT INTO messages (message_id, room_id, sender_id, sender_name, content_type, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [msgId, roomId, userId, userName, type, text, now],
        (err) => {
          if (!err) {
            const messagePayload = {
              id: msgId,
              roomId,
              sender: userName,
              senderId: userId,
              text,
              type,
              time: new Date(now).toLocaleTimeString()
            };
            io.to(roomId).emit('receive_message', messagePayload);
            if (callback) callback({ success: true });
          }
        }
      );
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start the server (0.0.0.0 for Railway/Render containers)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`TurfMate API listening on port ${PORT} (CORS: ${CORS_ORIGINS.join(', ')})`);
});
