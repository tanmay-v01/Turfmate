const express = require('express');
const config = require('../lib/config');
const otpService = require('../services/otpService');
const jwtService = require('../services/jwtService');
const usersRepo = require('../repositories/users');
const { normalizePhone, isValidPhone } = require('../utils/phone');
const { toClientProfile } = require('../utils/profileMapper');
const { seedDemoUsers } = require('../scripts/seedDemoUsers');

const router = express.Router();

const DEMO_PROFILES = {
  '9876543210': {
    role: 'PLAYER',
    profile: {
      fullName: 'Rahul Mehta',
      username: '@rahul_cricket',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rahul',
      locationLabel: 'Virar',
      locationLat: 19.456,
      locationLng: 72.812,
      filterRadiusKm: 10,
      sportsDna: [
        { sport: 'football', skill_level: 'Intermediate', preferred_position: 'Midfielder' },
        { sport: 'cricket', skill_level: 'Amateur', preferred_position: 'Batsman' },
      ],
    },
  },
  '1111111111': {
    role: 'OWNER',
    profile: {
      businessName: 'Green Valley Sports Group',
      ownerName: 'Manager Singh',
      kycStatus: 'APPROVED',
    },
  },
  '9999999999': {
    role: 'SUPER_ADMIN',
    profile: null,
  },
};

router.post('/send-otp', async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Enter a valid 10-digit mobile number' });
    }
    const sendResult = await otpService.createAndSendOtp(phone);
    res.json({
      ok: true,
      phone,
      expiresIn: Math.floor(config.otpTtlMs / 1000),
      channel: sendResult.channel,
      ...(sendResult.devHint && config.demoMode ? { devHint: sendResult.devHint } : {}),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const otp = String(req.body.otp || '').trim();

    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }
    if (!otpService.verifyOtp(phone, otp)) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    const demo = DEMO_PROFILES[phone];
    let user = await usersRepo.findByPhone(phone);

    if (demo) {
      user = await usersRepo.upsertDemoUser(phone, demo.role, demo.profile);
    } else if (!user) {
      user = await usersRepo.createUser({ phone, role: 'PLAYER', onboardingComplete: false });
    }

    const playerProfile = await usersRepo.getPlayerProfile(user.id);
    const ownerProfile = await usersRepo.getOwnerProfile(user.id);
    const token = jwtService.sign(user);
    const profile = toClientProfile(user, playerProfile, ownerProfile);

    res.json({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        onboardingComplete: Boolean(user.onboarding_complete),
      },
      profile,
    });
  } catch (err) {
    console.error('[auth/verify-otp]', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/seed-demo', async (req, res) => {
  if (!config.demoMode) {
    return res.status(403).json({ error: 'Demo seed disabled' });
  }
  try {
    await seedDemoUsers();
    res.json({ ok: true, message: 'Demo users seeded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
