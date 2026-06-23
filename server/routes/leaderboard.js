const express = require('express');
const { authRequired, loadUser } = require('../middleware/auth');
const leaderboardRepo = require('../repositories/leaderboard');

const router = express.Router();

router.get('/', authRequired, loadUser, async (req, res) => {
  try {
    const scope = req.query.scope === 'area' ? 'area' : 'squad';
    const lat = req.query.lat != null ? Number(req.query.lat) : null;
    const lng = req.query.lng != null ? Number(req.query.lng) : null;
    const radiusKm = req.query.radius_km != null ? Number(req.query.radius_km) : 10;
    const entries = await leaderboardRepo.listLeaderboard({
      userId: req.user.id,
      scope,
      lat,
      lng,
      radiusKm,
    });
    res.json({ entries, count: entries.length, scope });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/matches', authRequired, loadUser, async (req, res) => {
  try {
    const matches = await leaderboardRepo.listRecentMatches(req.user.id);
    res.json({ matches, count: matches.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/matches', authRequired, loadUser, async (req, res) => {
  try {
    const { sport, summary, delta } = req.body;
    if (!sport || !delta) {
      return res.status(400).json({ error: 'sport and delta are required' });
    }
    const result = await leaderboardRepo.recordMatch({
      userId: req.user.id,
      sport,
      summary: summary || '',
      delta,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
