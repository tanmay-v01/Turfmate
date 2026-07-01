const config = require('../lib/config');
const logger = require('../lib/logger');

if (!config.databaseUrl) {
  logger.warn('DATABASE_URL is not configured. Falling back to SQLite local database. Note: All data will be lost when the server restarts/rebuilds on cloud platforms like Railway. Please set DATABASE_URL to connect your PostgreSQL database.');
}

const store = config.databaseUrl
  ? require('./postgres')
  : require('./sqliteAuth');

module.exports = store;
