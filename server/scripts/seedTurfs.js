const demoTurfs = require('../data/demoTurfs');
const turfsRepo = require('../repositories/turfs');

async function seedTurfs() {
  for (const turf of demoTurfs) {
    await turfsRepo.upsertTurf(turf);
  }
}

module.exports = { seedTurfs };
