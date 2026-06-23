const express = require('express');
const { authRequired, loadUser } = require('../middleware/auth');
const socialRepo = require('../repositories/social');

const router = express.Router();

router.get('/friend-requests', authRequired, loadUser, async (req, res) => {
  try {
    const requests = await socialRepo.listIncomingRequests(req.user.id);
    res.json({ requests, count: requests.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/friend-requests', authRequired, loadUser, async (req, res) => {
  try {
    const { toUserId, toUsername, message } = req.body;
    if (!toUserId && !toUsername) {
      return res.status(400).json({ error: 'toUserId or toUsername is required' });
    }
    const result = await socialRepo.sendFriendRequest({
      fromUserId: req.user.id,
      toUserId,
      toUsername,
      message,
    });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/friend-requests/:id/accept', authRequired, loadUser, async (req, res) => {
  try {
    const result = await socialRepo.acceptRequest(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/friend-requests/:id/decline', authRequired, loadUser, async (req, res) => {
  try {
    const result = await socialRepo.declineRequest(req.params.id, req.user.id);
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.get('/squads', authRequired, loadUser, async (req, res) => {
  try {
    const squads = await socialRepo.listSquads(req.user.id);
    res.json({ squads, count: squads.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/squads', authRequired, loadUser, async (req, res) => {
  try {
    const { name, members } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'name is required' });
    const result = await socialRepo.createSquad({
      ownerId: req.user.id,
      name: name.trim(),
      members: members || [],
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
