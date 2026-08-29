// server.js
// Environment is loaded and validated first: a missing or weak JWT_SECRET
// throws here rather than silently falling back to a hardcoded value.
const config = require('./config/env');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const { authLimiter, apiLimiter } = require('./middleware/rateLimit');

const app = express();

// Trust the first proxy hop so rate limiting sees real client IPs behind
// a load balancer instead of lumping every request under one address.
app.set('trust proxy', 1);

// CORS: allowlist only. Requests with no Origin (curl, server-to-server,
// same-origin) are permitted; browsers on unknown origins are refused.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.clientOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true
  })
);

// Rental listings carry base64 image data URIs, so they get a higher body
// limit than the rest of the API. Must be registered before the general
// json() below — body-parser skips re-parsing once req._body is set, so
// whichever matching parser runs first wins.
app.use('/api/rentals', express.json({ limit: '12mb' }));
app.use(express.json({ limit: '1mb' }));

// Request logging, development only. Credentials are redacted so passwords
// never reach the console or log files.
const REDACTED_FIELDS = ['password', 'newPassword', 'confirmPassword', 'token'];

function redact(body) {
  const safe = { ...body };
  for (const field of REDACTED_FIELDS) {
    if (field in safe) safe[field] = '[REDACTED]';
  }
  return safe;
}

if (config.isDevelopment) {
  app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('📦 Request Body:', JSON.stringify(redact(req.body), null, 2));
    }
    next();
  });
}

// Routes
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const rentalRoutes = require('./routes/rentals');
const groupRoutes = require('./routes/groups');

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/groups', groupRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Hostel Management API is running!',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me',
      complaints: 'GET /api/complaints',
      rentals: 'GET /api/rentals',
      groups: 'GET /api/groups'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Central error handler. Internal details are logged, never returned in
// production.
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);

  if (err && err.message && err.message.includes('not allowed by CORS')) {
    return res.status(403).json({ success: false, message: 'Origin not allowed' });
  }

  res.status(err.status || 500).json({
    success: false,
    message: 'Internal server error',
    error: config.isProduction ? undefined : err.message
  });
});

async function start() {
  console.log('🔄 Connecting to MongoDB...');
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ MongoDB Connected:', mongoose.connection.db.databaseName);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('Make sure MongoDB is running!');
    process.exit(1);
  }

  app.listen(config.port, () => {
    console.log('\n🚀 ================================');
    console.log(`✅ Server running on port ${config.port}`);
    console.log(`🌐 API URL: http://localhost:${config.port}`);
    console.log(`🔓 CORS allowlist: ${config.clientOrigins.join(', ')}`);
    console.log('================================\n');
  });
}

start();

module.exports = app;
