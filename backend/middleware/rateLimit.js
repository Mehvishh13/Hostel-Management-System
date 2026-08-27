// middleware/rateLimit.js - Throttles credential-guessing against auth routes.
const rateLimit = require('express-rate-limit');
const { isProduction } = require('../config/env');

// Login and registration are the endpoints worth brute-forcing, so they get
// a tight window. Disabled outside production would hide bugs, so it stays on
// everywhere but with a roomier limit while developing.
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 10 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts from this IP. Please try again in 15 minutes.'
  }
});

// Broad ceiling for everything else, so a single client cannot flood the API.
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 300 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.'
  }
});
