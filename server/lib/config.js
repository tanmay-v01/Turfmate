/** Server-side configuration from environment */

const DEMO_PHONES = {
  '9876543210': 'PLAYER',
  '1111111111': 'OWNER',
  '9999999999': 'SUPER_ADMIN',
};

module.exports = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || '',
  sqlitePath: process.env.SQLITE_PATH || '',
  jwtSecret: process.env.JWT_SECRET || 'turfmate-dev-jwt-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  demoMode: process.env.DEMO_MODE !== 'false',
  otpTtlMs: 5 * 60 * 1000,
  demoOtp: '1234',
  msg91AuthKey: process.env.MSG91_AUTH_KEY || '',
  msg91TemplateId: process.env.MSG91_TEMPLATE_ID || '',
  demoPhones: DEMO_PHONES,
  migrateOnStart: process.env.MIGRATE_ON_START === 'true',
  seedOnStart: process.env.SEED_ON_START === 'true',
  seedPilotOnStart: process.env.SEED_PILOT_ON_START === 'true',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  appUrl: (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, ''),
  fcmServerKey: process.env.FCM_SERVER_KEY || '',
};
