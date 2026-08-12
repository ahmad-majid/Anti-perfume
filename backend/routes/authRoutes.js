const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const RefreshToken = require('../models/RefreshToken');
const crypto = require('crypto');

// Generate JWT Helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'anti_perfumes_super_secret_jwt_key_2026', {
    expiresIn: '15m',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email address' });
    }

    const user = await User.create({ username, email, password });

    if (user) {
      const refreshToken = crypto.randomBytes(40).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await RefreshToken.create({ user: user._id, token: refreshToken, expiresAt });

      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        refreshToken,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data provided' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      const refreshToken = crypto.randomBytes(40).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await RefreshToken.create({ user: user._id, token: refreshToken, expiresAt });

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        refreshToken,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Profile Retrieval Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required' });
  }

  try {
    const existingToken = await RefreshToken.findOne({ token: refreshToken });

    if (!existingToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    if (existingToken.expiresAt < new Date()) {
      await existingToken.deleteOne();
      return res.status(401).json({ message: 'Refresh token expired' });
    }

    const newRefreshTokenString = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await existingToken.deleteOne();
    await RefreshToken.create({
      user: existingToken.user,
      token: newRefreshTokenString,
      expiresAt,
    });

    res.json({
      token: generateToken(existingToken.user),
      refreshToken: newRefreshTokenString,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    await RefreshToken.deleteMany({ user: req.user._id });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
