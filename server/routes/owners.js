const express = require('express');
const { authRequired, loadUser, requireRole } = require('../middleware/auth');
const ownersRepo = require('../repositories/owners');
const ledgerRepo = require('../repositories/ledger');

const router = express.Router();

router.get('/me', authRequired, loadUser, async (req, res) => {
  try {
    const owner = await ownersRepo.getOwnerByUserId(req.user.id);
    if (!owner) return res.status(404).json({ error: 'Owner profile not found' });
    res.json({ owner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/apply', authRequired, loadUser, async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.businessName || !body.ownerName || !body.pan || !body.bankAccount || !body.ifsc) {
      return res.status(400).json({ error: 'Complete business, KYC, and payout details are required' });
    }
    const result = await ownersRepo.submitApplication(req.user.id, body);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.get('/me/revenue', authRequired, loadUser, requireRole('OWNER'), async (req, res) => {
  try {
    const revenue = await ledgerRepo.getOwnerRevenue(req.user.id);
    res.json(revenue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me/revenue', authRequired, loadUser, requireRole('OWNER'), async (req, res) => {
  try {
    const revenue = await ledgerRepo.getOwnerRevenue(req.user.id);
    res.json(revenue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
