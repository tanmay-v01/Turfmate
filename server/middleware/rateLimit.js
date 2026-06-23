/** In-memory sliding-window rate limiter (per IP). */

function createRateLimiter({
  windowMs = 60_000,
  max = 100,
  message = 'Too many requests — try again shortly',
} = {}) {
  const buckets = new Map();

  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now - bucket.start > windowMs) buckets.delete(key);
    }
  }, windowMs);
  if (sweep.unref) sweep.unref();

  return function rateLimitMiddleware(req, res, next) {
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || now - bucket.start > windowMs) {
      bucket = { start: now, count: 0 };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
    if (bucket.count > max) {
      return res.status(429).json({ error: message });
    }
    return next();
  };
}

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many OTP attempts — wait 15 minutes',
});

const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 180,
});

module.exports = { createRateLimiter, authLimiter, apiLimiter };
