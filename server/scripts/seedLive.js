const db = require('../db');
const usersRepo = require('../repositories/users');
const turfsRepo = require('../repositories/turfs');

const LIVE_SEEDS = [
  // PLAYERS
  {
    phone: 'rahul@demo.com',
    role: 'PLAYER',
    profile: {
      fullName: 'Rahul Mehta', username: '@rahul_cricket', avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rahul',
      locationLabel: 'Virar', locationLat: 19.456, locationLng: 72.812, filterRadiusKm: 10,
      sportsDna: [{ sport: 'football', skill_level: 'Intermediate', preferred_position: 'Midfielder' }, { sport: 'cricket', skill_level: 'Advanced', preferred_position: 'Batsman' }]
    },
  },
  {
    phone: 'amit@demo.com',
    role: 'PLAYER',
    profile: {
      fullName: 'Amit Sharma', username: '@amit_striker', avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Amit',
      locationLabel: 'Virar', locationLat: 19.458, locationLng: 72.810, filterRadiusKm: 15,
      sportsDna: [{ sport: 'football', skill_level: 'Advanced', preferred_position: 'Striker' }]
    },
  },
  {
    phone: 'sneha@demo.com',
    role: 'PLAYER',
    profile: {
      fullName: 'Sneha Patel', username: '@sneha_smash', avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sneha',
      locationLabel: 'Vasai', locationLat: 19.400, locationLng: 72.825, filterRadiusKm: 10,
      sportsDna: [{ sport: 'badminton', skill_level: 'Pro', preferred_position: 'Singles' }]
    },
  },
  {
    phone: 'vikram@demo.com',
    role: 'PLAYER',
    profile: {
      fullName: 'Vikram Singh', username: '@vikram_v', avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Vikram',
      locationLabel: 'Nala Sopara', locationLat: 19.418, locationLng: 72.818, filterRadiusKm: 5,
      sportsDna: [{ sport: 'cricket', skill_level: 'Beginner', preferred_position: 'Bowler' }]
    },
  },
  {
    phone: 'priya@demo.com',
    role: 'PLAYER',
    profile: {
      fullName: 'Priya Desai', username: '@priya_hoops', avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Priya',
      locationLabel: 'Virar', locationLat: 19.450, locationLng: 72.805, filterRadiusKm: 20,
      sportsDna: [{ sport: 'basketball', skill_level: 'Intermediate', preferred_position: 'Point Guard' }]
    },
  },
  // OWNERS
  {
    phone: 'greenvalley@demo.com',
    role: 'OWNER',
    profile: { businessName: 'Green Valley Arena', ownerName: 'Rajesh Kumar', kycStatus: 'APPROVED' },
    turfs: [
      {
        id: 'turf-1', name: 'Green Valley Arena', location: 'Virar West, Near Station',
        lat: 19.456, lng: 72.812, sports: ['football', 'cricket'],
        price_per_hour: 1200, rating: 4.8, type: '5v5 AstroTurf',
        images: '["https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=600"]',
        amenities: '["Parking", "Washroom", "Floodlights", "Bibs"]'
      }
    ]
  },
  {
    phone: 'urbansports@demo.com',
    role: 'OWNER',
    profile: { businessName: 'Urban Sports Club', ownerName: 'Manoj Tiwari', kycStatus: 'APPROVED' },
    turfs: [
      {
        id: 'turf-2', name: 'Urban Sports Club', location: 'Vasai East',
        lat: 19.395, lng: 72.835, sports: ['football'],
        price_per_hour: 1500, rating: 4.6, type: '7v7 Natural Grass',
        images: '["https://images.unsplash.com/photo-1518605368461-1e122b554e20?auto=format&fit=crop&q=80&w=600"]',
        amenities: '["Cafe", "Showers", "Parking"]'
      }
    ]
  },
  {
    phone: 'skylineturf@demo.com',
    role: 'OWNER',
    profile: { businessName: 'Skyline Turf', ownerName: 'Sunil Gavaskar', kycStatus: 'APPROVED' },
    turfs: [
      {
        id: 'turf-3', name: 'Skyline Rooftop Turf', location: 'Nala Sopara West',
        lat: 19.420, lng: 72.815, sports: ['cricket'],
        price_per_hour: 1000, rating: 4.2, type: 'Box Cricket',
        images: '["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=600"]',
        amenities: '["Equipment Provided", "Drinking Water"]'
      }
    ]
  },
  {
    phone: 'elitehub@demo.com',
    role: 'OWNER',
    profile: { businessName: 'Elite Badminton Hub', ownerName: 'Sania Mirza', kycStatus: 'APPROVED' },
    turfs: [
      {
        id: 'turf-4', name: 'Elite Badminton Courts', location: 'Virar East',
        lat: 19.460, lng: 72.825, sports: ['badminton'],
        price_per_hour: 500, rating: 4.9, type: 'Wooden Court (Indoor)',
        images: '["https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600"]',
        amenities: '["AC", "Locker Room", "Pro Shop"]'
      }
    ]
  },
  {
    phone: 'bullsbball@demo.com',
    role: 'OWNER',
    profile: { businessName: 'Bulls Basketball Center', ownerName: 'Michael Jordan', kycStatus: 'APPROVED' },
    turfs: [
      {
        id: 'turf-5', name: 'Bulls Indoor Arena', location: 'Vasai West',
        lat: 19.390, lng: 72.820, sports: ['basketball'],
        price_per_hour: 2000, rating: 4.7, type: 'Indoor Hardwood',
        images: '["https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&q=80&w=600"]',
        amenities: '["Scoreboard", "Spectator Seating", "AC"]'
      }
    ]
  },
];

async function seedLive() {
  console.log('Wiping existing turfs to prepare live demo...');
  await new Promise((resolve) => db.run('DELETE FROM turfs', resolve));
  await new Promise((resolve) => db.run('DELETE FROM users', resolve));
  await new Promise((resolve) => db.run('DELETE FROM player_profiles', resolve));
  await new Promise((resolve) => db.run('DELETE FROM turf_owners', resolve));
  
  console.log('Seeding Live Demo Users & Turfs...');

  for (const seed of LIVE_SEEDS) {
    console.log(`Upserting ${seed.role}: ${seed.phone}...`);
    await usersRepo.upsertDemoUser(seed.phone, seed.role, seed.profile);
    
    if (seed.turfs) {
      const user = await usersRepo.findByPhone(seed.phone);
      for (const t of seed.turfs) {
        await turfsRepo.upsertTurf({ ...t, owner_id: user.id });
        console.log(`  Seeded Turf: ${t.name}`);
      }
    }
  }

  // Handle Tanmay
  const tanmayPhone = 'tanmayv86@gmail.com';
  await usersRepo.upsertDemoUser(tanmayPhone, 'SUPER_ADMIN', null);
  
  console.log('Seeded Super Admin: tanmayv86@gmail.com (Login with OTP 123456 or whatever dev mode OTP allows)');
  console.log('Live Seed Complete!');
  process.exit(0);
}

setTimeout(seedLive, 1000);
