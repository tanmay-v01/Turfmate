const express = require('express');
const { authRequired, loadUser } = require('../middleware/auth');
const splitsRepo = require('../repositories/splits');

const router = express.Router();

router.get('/open', async (_req, res) => {
  try {
    const splits = await splitsRepo.listOpenSplits();
    res.json({ splits, count: splits.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:bookingId', async (req, res) => {
  try {
    const row = await splitsRepo.getSplitBooking(req.params.bookingId);
    if (!row) return res.status(404).json({ error: 'Split not found' });
    res.json({ split: row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/initiate', authRequired, loadUser, async (req, res) => {
  try {
    const {
      turfId, slotId, date = 'Today', slotTime, totalAmount, hostAdvance,
      playersNeeded, isPublic = true, sport, inviteSquadId,
    } = req.body;
    if (!turfId || !slotId || totalAmount == null || hostAdvance == null || playersNeeded == null) {
      return res.status(400).json({ error: 'Missing required split fields' });
    }
    const result = await splitsRepo.initiateSplit({
      turfLegacyId: turfId,
      slotId,
      dateLabel: date,
      slotTime,
      userId: req.user.id,
      totalAmount: Number(totalAmount),
      hostAdvance: Number(hostAdvance),
      playersNeeded: Number(playersNeeded),
      isPublic,
      sport,
      inviteSquadId,
    });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/:bookingId/invite-squad', authRequired, loadUser, async (req, res) => {
  try {
    const { squadId } = req.body;
    if (!squadId) return res.status(400).json({ error: 'squadId is required' });

    const row = await splitsRepo.getSplitBooking(req.params.bookingId);
    if (!row) return res.status(404).json({ error: 'Split not found' });
    if (row.host_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the split host can send invites' });
    }

    const notificationsRepo = require('../repositories/notifications');
    const config = require('../lib/config');
    const annId = `ann-${req.params.bookingId}`;
    const inviteLink = `${config.appUrl}/#join/${annId}`;

    const result = await notificationsRepo.sendSplitSquadInvites({
      hostUserId: req.user.id,
      bookingId: req.params.bookingId,
      annId,
      squadId,
      turfName: row.name,
      costPerHead: Number(row.cost_per_head),
      inviteLink,
    });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/:bookingId/join', authRequired, loadUser, async (req, res) => {
  try {
    const { amount } = req.body;
    const result = await splitsRepo.joinSplit({
      bookingId: req.params.bookingId,
      userId: req.user.id,
      amount: amount != null ? Number(amount) : undefined,
    });

    const io = req.app.get('io');
    if (io && result.filled) {
      const chatRepo = require('../repositories/chat');
      io.to(chatRepo.bookingRoomId(req.params.bookingId)).emit('receive_message', {
        id: `sys-${Date.now()}`,
        roomId: chatRepo.bookingRoomId(req.params.bookingId),
        sender: 'TurfMate Bot',
        text: '🎉 Split fully funded — game confirmed!',
        type: 'SYSTEM_ALERT',
        time: new Date().toLocaleTimeString(),
      });
    }

    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/:bookingId/cancel', authRequired, loadUser, async (req, res) => {
  try {
    const result = await splitsRepo.cancelSplit({
      bookingId: req.params.bookingId,
      userId: req.user.id,
    });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
