const config = require('../lib/config');

const store = config.databaseUrl
  ? require('./postgres')
  : require('./sqliteAuth');

module.exports = store;
