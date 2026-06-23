const express = require('express');
const { getHealthStatus } = require('../services/healthCheck');

const router = express.Router();

async function handleHealth(req, res) {
  try {
    const detailed = req.query.detailed === '1' || req.query.detailed === 'true';
    const status = await getHealthStatus({ detailed });
    res.status(status.ok ? 200 : 503).json(status);
  } catch (err) {
    res.status(503).json({
      ok: false,
      service: 'turfmate-api',
      ts: Date.now(),
      error: err.message,
    });
  }
}

router.get('/health', handleHealth);
router.get('/api/health', handleHealth);

module.exports = router;
