// controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const { ok, created, fail, handleError } = require('../utils/apiResponse');

// Generate JWT Token
const generateToken = (id) => jwt.sign({ id }, jwtSecret, { expiresIn: jwtExpiresIn });

// The shape of a user as the API exposes it. Never includes the password hash.
const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  roomNumber: user.roomNumber,
  phoneNumber: user.phoneNumber
});

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

    const userExists = await User.findOne({ email });
    if (userExists) {
      return fail(res, 400, 'User already exists with this email');
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      roomNumber,
      phoneNumber
    });

    return created(res, {
      message: 'Registration successful',
      data: { user: publicUser(user), token: generateToken(user._id) }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return fail(res, 400, messages.join(', '));
    }

    if (error.code === 11000) {
      return fail(res, 400, 'Email already exists');
    }

    return handleError(
      res,
      error,
      'Registration Error',
      'Server error during registration. Please try again.'
    );
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // The same message for both branches, so the response cannot be used to
    // discover which email addresses are registered.
    if (!user || !(await user.comparePassword(password))) {
      return fail(res, 401, 'Invalid email or password');
    }

    return ok(res, {
      message: 'Login successful',
      data: { user: publicUser(user), token: generateToken(user._id) }
    });
  } catch (error) {
    return handleError(
      res,
      error,
      'Login Error',
      'Server error during login. Please try again.'
    );
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  return ok(res, { data: publicUser(req.user) });
};
