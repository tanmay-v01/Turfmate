const express = require('express');
const { authRequired, loadUser } = require('../middleware/auth');
const notificationsRepo = require('../repositories/notifications');

const router = express.Router();

router.post('/token', authRequired, loadUser, async (req, res) => {
  try {
    const { token, platform } = req.body;
    const result = await notificationsRepo.registerToken(req.user.id, token, platform || 'web');
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.get('/', authRequired, loadUser, async (req, res) => {
  try {
    const notifications = await notificationsRepo.listNotifications(req.user.id);
    res.json({ notifications, count: notifications.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/read-all', authRequired, loadUser, async (req, res) => {
  try {
    const result = await notificationsRepo.markAllRead(req.user.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/read', authRequired, loadUser, async (req, res) => {
  try {
    const result = await notificationsRepo.markRead(req.user.id, req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
