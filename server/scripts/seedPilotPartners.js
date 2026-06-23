/**
 * Phase 4c — Seed approved pilot owners + live turfs (Virar / Vasai).
 * Usage: npm run seed:pilot --prefix server
 */
require('dotenv').config();
const dbStore = require('../db/index');
const usersRepo = require('../repositories/users');
const turfsRepo = require('../repositories/turfs');
const PILOT_PARTNERS = require('../data/pilotPartners');

async function seedPilotPartners() {
  await dbStore.migrate();

  await usersRepo.upsertDemoUser('9999999999', 'SUPER_ADMIN', null);

  for (const partner of PILOT_PARTNERS) {
    const user = await usersRepo.upsertDemoUser(partner.phone, 'OWNER', {
      businessName: partner.businessName,
      ownerName: partner.ownerName,
      kycStatus: 'APPROVED',
    });
    await turfsRepo.upsertTurf(partner.turf, user.id);
    console.log(`[pilot] ${partner.turf.name} (${partner.turf.id}) → ${partner.ownerName} +91${partner.phone}`);
  }

  console.log(`[pilot] Seeded ${PILOT_PARTNERS.length} partner turfs. Super admin: 9999999999`);
}

if (require.main === module) {
  seedPilotPartners()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[pilot] seed failed:', err.message);
      process.exit(1);
    });
}

module.exports = { seedPilotPartners };
