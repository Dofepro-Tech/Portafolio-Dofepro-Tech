const dotenv = require('dotenv');

dotenv.config();

const parseOrigins = (value) => {
  if (!value || value === '*') {
    return '*';
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

module.exports = {
  port: toNumber(process.env.PORT, 3000),
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGINS),
  email: {
    deliveryMode: process.env.EMAIL_DELIVERY_MODE || 'log',
    to: process.env.CONTACT_TO_EMAIL || '',
    from: process.env.CONTACT_FROM_EMAIL || '',
    resendApiKey: process.env.RESEND_API_KEY || ''
  },
  rateLimit: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000
  }
};
