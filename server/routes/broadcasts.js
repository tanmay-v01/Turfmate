const express = require('express');
const { authRequired, loadUser, requireRole } = require('../middleware/auth');
const broadcastsRepo = require('../repositories/broadcasts');

const router = express.Router();

router.get('/active', async (_req, res) => {
  try {
    const broadcasts = await broadcastsRepo.listActiveBroadcasts();
    res.json({ broadcasts, count: broadcasts.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authRequired, loadUser, requireRole('OWNER'), async (req, res) => {
  try {
    const broadcasts = await broadcastsRepo.listOwnerBroadcasts(req.user.id);
    res.json({ broadcasts, count: broadcasts.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authRequired, loadUser, requireRole('OWNER'), async (req, res) => {
  try {
    const {
      turfLegacyId, category, headline, bodyText, promoCode, ctaText, sport, expirationHours,
    } = req.body;
    if (!turfLegacyId || !headline?.trim() || !bodyText?.trim()) {
      return res.status(400).json({ error: 'turfLegacyId, headline, and bodyText are required' });
    }
    const broadcast = await broadcastsRepo.createBroadcast({
      ownerUserId: req.user.id,
      turfLegacyId,
      category: category || 'PROMO',
      headline: headline.trim(),
      bodyText: bodyText.trim(),
      promoCode,
      ctaText,
      sport,
      expirationHours,
    });
    res.json({ broadcast });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/:id/deactivate', authRequired, loadUser, requireRole('OWNER'), async (req, res) => {
  try {
    const result = await broadcastsRepo.deactivateBroadcast(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
