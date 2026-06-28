const express = require('express');
const router = express.Router();
const tournamentsRepo = require('../repositories/tournaments');
const { requireAuth } = require('../middleware/auth');

// GET /api/tournaments
router.get('/', async (req, res) => {
  try {
    const data = await tournamentsRepo.listTournaments();
    res.json({ tournaments: data });
  } catch (err) {
    console.error('Error fetching tournaments:', err);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// POST /api/tournaments
router.post('/', requireAuth, async (req, res) => {
  // Normally we would restrict this to SuperAdmins or verified Owners
  try {
    const tournament = await tournamentsRepo.createTournament(req.body);
    res.json({ tournament });
  } catch (err) {
    console.error('Error creating tournament:', err);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

module.exports = router;
