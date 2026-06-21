require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../db/index');
const { seedDemoUsers } = require('./seedDemoUsers');

async function main() {
  console.log(`Running migrations (${db.driver})...`);
  await db.migrate();
  console.log('Seeding demo users...');
  await seedDemoUsers();
  console.log('Done.');
  await db.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
