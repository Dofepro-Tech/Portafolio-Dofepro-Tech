const buckets = new Map();

const createRateLimit = ({ maxRequests, windowMs }) => (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const currentBucket = buckets.get(ip) || [];
  const validAttempts = currentBucket.filter((timestamp) => now - timestamp < windowMs);

  if (validAttempts.length >= maxRequests) {
    return res.status(429).json({
      ok: false,
      message: 'Has superado el limite temporal de envios. Intenta nuevamente en unos minutos.'
    });
  }

  validAttempts.push(now);
  buckets.set(ip, validAttempts);
  return next();
};

module.exports = {
  createRateLimit
};
