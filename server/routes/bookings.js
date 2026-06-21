const express = require('express');
const { authRequired, loadUser } = require('../middleware/auth');
const bookingsRepo = require('../repositories/bookings');

const router = express.Router();

router.post('/lock', authRequired, loadUser, async (req, res) => {
  try {
    const { turfId, slotId, date = 'Today' } = req.body;
    if (!turfId || !slotId) {
      return res.status(400).json({ error: 'turfId and slotId are required' });
    }
    const result = await bookingsRepo.lockSlot({
      turfLegacyId: turfId,
      slotId,
      dateLabel: date,
      userId: req.user.id,
    });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/checkout', authRequired, loadUser, async (req, res) => {
  try {
    const { turfId, slotId, date = 'Today', slotTime, amount } = req.body;
    if (!turfId || !slotId || amount == null) {
      return res.status(400).json({ error: 'turfId, slotId, and amount are required' });
    }
    const result = await bookingsRepo.checkoutPrivate({
      turfLegacyId: turfId,
      slotId,
      dateLabel: date,
      slotTime,
      userId: req.user.id,
      amount: Number(amount),
    });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.get('/availability', async (req, res) => {
  try {
    const { turfId, date = 'Today' } = req.query;
    if (!turfId) return res.status(400).json({ error: 'turfId is required' });
    const availability = await bookingsRepo.getSlotAvailability(turfId, date);
    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authRequired, loadUser, async (req, res) => {
  try {
    const bookings = await bookingsRepo.listUserBookings(req.user.id);
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
