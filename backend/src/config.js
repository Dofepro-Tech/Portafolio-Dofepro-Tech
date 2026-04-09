const dotenv = require('dotenv');

dotenv.config();

const defaultAllowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://127.0.0.1:3000',
  'http://localhost:3000',
  'http://127.0.0.1:4173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  'https://dofepro-tech.github.io'
];

const parseOrigins = (value) => {
  if (!value) {
    return '*';
  }

  if (value === '*') {
    return '*';
  }

  return Array.from(
    new Set(
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
        .concat(defaultAllowedOrigins)
    )
  );
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
    baseUrl: process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1',
    model: process.env.AI_MODEL || 'openai/gpt-4o-mini',
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
