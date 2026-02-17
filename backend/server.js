// server.js - With detailed logging
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');


dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// MongoDB Connection
console.log('🔄 Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully!');
  console.log('📍 Database:', mongoose.connection.db.databaseName);
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.error('Make sure MongoDB is running!');
  process.exit(1);
});

// Import Routes
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// Import new routes
const rentalRoutes = require('./routes/rentals');
const groupRoutes = require('./routes/groups');

// Use new routes (add after existing routes)
app.use('/api/rentals', rentalRoutes);
app.use('/api/groups', groupRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hostel Management API is running!',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me',
      complaints: 'GET /api/complaints'
    }
  });
});

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.path);
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n🚀 ================================');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log('================================\n');
});