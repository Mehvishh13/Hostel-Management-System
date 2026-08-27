// routes/auth.js - Using Controller
const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../middleware/schemas');

const router = express.Router();

// Auth routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);

module.exports = router;
