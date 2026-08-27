// controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const exposeError = require('../utils/exposeError');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: jwtExpiresIn
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, roomNumber, phoneNumber } = req.body;

    // Public self-registration always creates a student. Admin and warden
    // accounts are provisioned out of band (see seed.js) so that a caller
    // cannot escalate by passing role in the request body.
    const role = 'student';

    // Validation
    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({
        message: 'Please provide all required fields'
      });
    }

    // Check if role is student and roomNumber is missing
    if (role === 'student' && !roomNumber) {
      return res.status(400).json({ 
        message: 'Room number is required for students' 
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        message: 'User already exists with this email' 
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      roomNumber: role === 'student' ? roomNumber : undefined,
      phoneNumber
    });

    res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      roomNumber: user.roomNumber,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Registration Error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: messages.join(', ') 
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already exists' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Server error during registration. Please try again.',
      error: exposeError(error) 
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      roomNumber: user.roomNumber,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login. Please try again.',
      error: exposeError(error) 
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      roomNumber: req.user.roomNumber,
      phoneNumber: req.user.phoneNumber
    });
  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user data' 
    });
  }
};