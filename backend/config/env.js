// config/env.js - Loads and validates environment configuration.
// The app refuses to boot with a missing or weak JWT secret rather than
// silently falling back to a hardcoded one.
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const MIN_SECRET_LENGTH = 32;

function required(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(
      `Missing required environment variable ${name}. Copy backend/.env.example to backend/.env and fill it in.`
    );
  }
  return value.trim();
}

const jwtSecret = required('JWT_SECRET');

if (jwtSecret.length < MIN_SECRET_LENGTH) {
  throw new Error(
    `JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters. Generate one with: ` +
      `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
  );
}

const nodeEnv = process.env.NODE_ENV || 'development';

module.exports = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isDevelopment: nodeEnv === 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel-management',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  // Comma-separated list of origins allowed to call this API.
  clientOrigins: (process.env.CLIENT_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
};
