const express = require('express');
const { authRequired, loadUser } = require('../middleware/auth');
const lockerRepo = require('../repositories/locker');

const router = express.Router();

router.get('/feed', async (_req, res) => {
  try {
    const posts = await lockerRepo.listFeed();
    res.json({ posts, count: posts.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/posts', authRequired, loadUser, async (req, res) => {
  try {
    const { contentType, contentText, extra, lat, lng } = req.body;
    if (!contentType || !contentText?.trim()) {
      return res.status(400).json({ error: 'contentType and contentText are required' });
    }
    const post = await lockerRepo.createPost({
      userId: req.user.id,
      contentType,
      contentText: contentText.trim(),
      extra: extra || {},
      lat,
      lng,
    });
    res.json({ post });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
