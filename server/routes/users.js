const express = require('express');
const { authRequired, loadUser } = require('../middleware/auth');
const usersRepo = require('../repositories/users');
const ownersRepo = require('../repositories/owners');
const { toClientProfile } = require('../utils/profileMapper');

const router = express.Router();

router.get('/me', authRequired, loadUser, async (req, res) => {
  try {
    const playerProfile = await usersRepo.getPlayerProfile(req.user.id);
    const ownerProfile = await usersRepo.getOwnerProfile(req.user.id);
    const ownerMeta = req.user.role === 'OWNER' ? await ownersRepo.getOwnerMetaForProfile(req.user.id) : {};
    res.json({
      user: {
        id: req.user.id,
        phone: req.user.phone,
        role: req.user.role,
        onboardingComplete: Boolean(req.user.onboarding_complete),
      },
      profile: toClientProfile(req.user, playerProfile, ownerProfile, ownerMeta),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/me', authRequired, loadUser, async (req, res) => {
  try {
    const body = req.body || {};
    if (req.user.role === 'PLAYER') {
      await usersRepo.updatePlayerProfile(req.user.id, {
        fullName: body.fullName ?? body.name,
        username: body.username,
        avatarUrl: body.avatarUrl ?? body.avatar,
        locationLabel: body.locationLabel ?? body.location,
        locationLat: body.locationLat ?? body.lat,
        locationLng: body.locationLng ?? body.lng,
        filterRadiusKm: body.filterRadiusKm ?? body.radius,
        sportsDna: body.sportsDna,
      });
      if (body.markOnboardingComplete) {
        await usersRepo.markOnboardingComplete(req.user.id);
      }
    }

    const user = await usersRepo.findById(req.user.id);
    const playerProfile = await usersRepo.getPlayerProfile(user.id);
    const ownerProfile = await usersRepo.getOwnerProfile(user.id);
    const ownerMeta = user.role === 'OWNER' ? await ownersRepo.getOwnerMetaForProfile(user.id) : {};

    res.json({
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        onboardingComplete: Boolean(user.onboarding_complete),
      },
      profile: toClientProfile(user, playerProfile, ownerProfile, ownerMeta),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/me/public-key', authRequired, loadUser, async (req, res) => {
  try {
    const { publicKey } = req.body;
    if (!publicKey) return res.status(400).json({ error: 'publicKey is required' });
    await usersRepo.updatePublicKey(req.user.id, publicKey);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/me', authRequired, loadUser, async (req, res) => {
  try {
    const result = await usersRepo.deleteAccount(req.user.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
