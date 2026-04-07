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
  assistant: {
    apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY || '',
    baseUrl: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.AI_MODEL || 'gpt-4.1-mini',
    maxTokens: toNumber(process.env.AI_MAX_TOKENS, 350),
    temperature: Number.isFinite(Number(process.env.AI_TEMPERATURE)) ? Number(process.env.AI_TEMPERATURE) : 0.35,
    timeoutMs: toNumber(process.env.AI_TIMEOUT_MS, 20000)
  },
  rateLimit: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000
  },
  assistantRateLimit: {
    maxRequests: 12,
    windowMs: 15 * 60 * 1000
  }
};
