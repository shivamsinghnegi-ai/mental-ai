const rateLimit = require('express-rate-limit');

// Chat rate limiter: 20 requests per minute
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: 'Too many messages, please slow down',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter: 20 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: 'Too many login attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { chatLimiter, authLimiter };
