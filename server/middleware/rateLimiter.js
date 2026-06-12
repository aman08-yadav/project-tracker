// ═══════════════════════════════════════════════════════════
//  RATE LIMITING — Prevents API abuse
// ═══════════════════════════════════════════════════════════
const rateLimit = require('express-rate-limit');

// ── General API limiter: 100 requests per 15 minutes ──────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// ── Auth limiter: 10 requests per 15 minutes (prevents brute force) ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' },
  skipSuccessfulRequests: false,
});

// ── Upload limiter: 20 uploads per hour ────────────────────
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Upload limit reached. Please try again later.' },
});

module.exports = { apiLimiter, authLimiter, uploadLimiter };
