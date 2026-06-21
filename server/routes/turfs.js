const express = require('express');
const turfsRepo = require('../repositories/turfs');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const lat = req.query.lat != null ? Number(req.query.lat) : null;
    const lng = req.query.lng != null ? Number(req.query.lng) : null;
    const radiusKm = req.query.radius_km != null ? Number(req.query.radius_km) : 20;
    const sport = req.query.sport || 'all';

    const turfs = await turfsRepo.listTurfs({ lat, lng, radiusKm, sport });
    res.json({ turfs, count: turfs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const lat = req.query.lat != null ? Number(req.query.lat) : null;
    const lng = req.query.lng != null ? Number(req.query.lng) : null;
    const turf = await turfsRepo.getTurfByLegacyId(req.params.id, lat, lng);
    if (!turf) return res.status(404).json({ error: 'Turf not found' });
    res.json({ turf });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
