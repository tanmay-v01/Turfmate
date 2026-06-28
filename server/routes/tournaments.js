const express = require('express');
const router = express.Router();
const tournamentsRepo = require('../repositories/tournaments');
const { authRequired, loadUser } = require('../middleware/auth');

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
router.post('/', authRequired, loadUser, async (req, res) => {
  // Normally we would restrict this to SuperAdmins or verified Owners
  try {
    const tournament = await tournamentsRepo.createTournament(req.body);
    res.json({ tournament });
  } catch (err) {
    console.error('Error creating tournament:', err);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

// POST /api/tournaments/:id/register
router.post('/:id/register', authRequired, loadUser, async (req, res) => {
  try {
    const tournament = await tournamentsRepo.registerTeam(req.params.id);
    res.json({ tournament });
  } catch (err) {
    console.error('Error registering for tournament:', err);
    res.status(400).json({ error: err.message || 'Failed to register' });
  }
});

module.exports = router;
