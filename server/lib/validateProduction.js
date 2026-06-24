const logger = require('./logger');

const DEV_JWT_SECRET = 'turfmate-dev-jwt-change-in-production';

function validateProductionConfig(config) {
  const issues = [];

  if (config.nodeEnv === 'production') {
    if (!config.jwtSecret || config.jwtSecret === DEV_JWT_SECRET || config.jwtSecret.length < 32) {
      issues.push('JWT_SECRET must be a random string of at least 32 characters');
    }
    if (config.demoMode) {
      issues.push('DEMO_MODE must be false in production');
    }
    if (!config.databaseUrl) {
      issues.push('DATABASE_URL is required in production (use Postgres, not SQLite)');
    }
    const origins = config.corsOrigin.split(',').map((s) => s.trim());
    if (origins.includes('*') || origins.some((o) => o === 'null')) {
      issues.push('CORS_ORIGIN must list explicit app origins (no wildcard)');
    }
    if (config.razorpayKeyId && !config.razorpayWebhookSecret) {
      issues.push('RAZORPAY_WEBHOOK_SECRET is required when Razorpay is enabled');
    }
  }

  if (issues.length) {
    logger.error('production_config_invalid', { issues });
    if (config.nodeEnv === 'production') {
      throw new Error(`Production config invalid: ${issues.join('; ')}`);
    }
    logger.warn('production_config_warnings', { issues });
  }

  return issues;
}

module.exports = { validateProductionConfig, DEV_JWT_SECRET };
