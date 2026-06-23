const logger = require('../lib/logger');

const SKIP_PATHS = new Set(['/health', '/api/health']);

function requestLog(req, res, next) {
  if (SKIP_PATHS.has(req.path)) return next();

  const start = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level]('http_request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs,
      ip: req.ip || req.socket?.remoteAddress,
    });
  });
  next();
}

module.exports = { requestLog };
