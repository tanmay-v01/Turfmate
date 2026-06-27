const express = require('express');
const { authRequired, loadUser } = require('../middleware/auth');
const chatRepo = require('../repositories/chat');
const usersRepo = require('../repositories/users');

const router = express.Router();

async function displayName(user) {
  const profile = await usersRepo.getPlayerProfile(user.id);
  return profile?.full_name || user.phone || 'Player';
}

router.get('/rooms', authRequired, loadUser, async (req, res) => {
  try {
    const rooms = await chatRepo.listUserRooms(req.user.id);
    res.json({ rooms, count: rooms.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/rooms/:roomId/messages', authRequired, loadUser, async (req, res) => {
  try {
    const member = await chatRepo.isMember(req.params.roomId, req.user.id);
    if (!member) return res.status(403).json({ error: 'Not a member of this chat' });
    const { beforeId, limit } = req.query;
    const messages = await chatRepo.getRoomMessages(req.params.roomId, {
      beforeId,
      limit: limit ? parseInt(limit) : 50,
    });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/rooms/:roomId/read', authRequired, loadUser, async (req, res) => {
  try {
    await chatRepo.markRoomRead(req.params.roomId, req.user.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/rooms/:roomId/messages', authRequired, loadUser, async (req, res) => {
  try {
    const { text, type = 'TEXT' } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'text is required' });
    const userName = await displayName(req.user);
    const message = await chatRepo.saveUserMessage({
      roomId: req.params.roomId,
      userId: req.user.id,
      userName,
      text: text.trim(),
      type,
    });
    const io = req.app.get('io');
    if (io) {
      io.to(req.params.roomId).emit('receive_message', { ...message, roomId: req.params.roomId });
    }
    res.json({ message });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
