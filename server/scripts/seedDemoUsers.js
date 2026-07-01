const usersRepo = require('../repositories/users');

const DEMO_SEEDS = [
  {
    phone: '9876543210',
    role: 'PLAYER',
    profile: {
      fullName: 'Rahul Mehta',
      username: '@rahul_mehta',
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
  {
    phone: '9876543211',
    role: 'PLAYER',
    profile: {
      fullName: 'Amit Patel',
      username: '@amit_patel',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Amit',
      locationLabel: 'Bandra',
      locationLat: 19.059,
      locationLng: 72.829,
      filterRadiusKm: 10,
      sportsDna: [
        { sport: 'football', skill_level: 'Intermediate', preferred_position: 'Defender' },
        { sport: 'badminton', skill_level: 'Advanced', preferred_position: 'Singles' },
      ],
    },
  },
  {
    phone: '1111111111',
    role: 'OWNER',
    profile: {
      businessName: 'Green Valley Sports Group',
      ownerName: 'Manager Singh',
      kycStatus: 'APPROVED',
    },
  },
  {
    phone: '1111111112',
    role: 'OWNER',
    profile: {
      businessName: 'Kadam Sports Academy',
      ownerName: 'Coach Kadam',
      kycStatus: 'APPROVED',
    },
  },
  {
    phone: '9999999999',
    role: 'SUPER_ADMIN',
    profile: null,
  },
];

async function seedDemoUsers() {
  for (const seed of DEMO_SEEDS) {
    await usersRepo.upsertDemoUser(seed.phone, seed.role, seed.profile);
  }
}

module.exports = { seedDemoUsers };
