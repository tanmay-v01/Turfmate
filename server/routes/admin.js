const express = require('express');
const { authRequired, loadUser, requireRole } = require('../middleware/auth');
const ownersRepo = require('../repositories/owners');

const router = express.Router();

router.use(authRequired, loadUser, requireRole('SUPER_ADMIN'));

router.get('/kyc/pending', async (_req, res) => {
  try {
    const owners = await ownersRepo.listPendingApplications();
    res.json({ owners, count: owners.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (_req, res) => {
  try {
    const stats = await ownersRepo.getPlatformStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/kyc/:userId/approve', async (req, res) => {
  try {
    const owner = await ownersRepo.approveApplication(req.params.userId);
    if (!owner) return res.status(404).json({ error: 'Application not found' });
    res.json({ message: 'Owner approved', owner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/kyc/:userId/reject', async (req, res) => {
  try {
    const note = req.body?.note || req.body?.reason || 'Application rejected';
    const owner = await ownersRepo.rejectApplication(req.params.userId, note);
    if (!owner) return res.status(404).json({ error: 'Application not found' });
    res.json({ message: 'Owner rejected', owner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
