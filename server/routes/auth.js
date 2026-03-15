const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect, generateTokens } = require('../middleware/auth');
const { validatePassword } = require('../config/security');
const { sendPasswordResetEmail, sendVerificationEmail } = require('../services/emailService');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters')
    .matches(/^[a-zA-Z0-9\s]+$/).withMessage('Name can only contain letters, numbers and spaces'),
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error('Email already registered');
      }
    }),
  body('password')
    .custom((value) => {
      const validation = validatePassword(value);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      return true;
    })
], handleValidationErrors, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Create user (isVerified defaults to false)
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save({ validateBeforeSave: false });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token
    await user.addRefreshToken(refreshToken, req.headers['user-agent']);

    // Send verification email
    try {
      const emailResult = await sendVerificationEmail(user.email, user.name, verificationToken);

      // Log email preview URL in development
      if (process.env.NODE_ENV !== 'production' && emailResult.previewUrl) {
        console.log('Verification email preview:', emailResult.previewUrl);
      }
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError.message);
      // Don't fail registration if email fails, but log it
    }

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          isVerified: user.isVerified
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked. Please try again later.'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await user.incrementLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await User.findByIdAndUpdate(user._id, {
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 }
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token
    await user.addRefreshToken(refreshToken, req.headers['user-agent']);

    // Remove password from response
    user.password = undefined;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          isVerified: user.isVerified,
          subscribers: user.subscribers.length
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public (requires refresh token)
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret');

    // Find user and check if token exists
    const user = await User.findOne({
      _id: decoded.id,
      'refreshTokens.token': refreshToken
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Remove old refresh token
    await user.removeRefreshToken(refreshToken);

    // Generate new tokens
    const tokens = generateTokens(user._id);

    // Save new refresh token
    await user.addRefreshToken(tokens.refreshToken, req.headers['user-agent']);

    res.json({
      success: true,
      data: tokens
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired. Please log in again.'
      });
    }
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await req.user.removeRefreshToken(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// @route   POST /api/auth/logout-all
// @desc    Logout from all devices
// @access  Private
router.post('/logout-all', protect, async (req, res) => {
  try {
    req.user.refreshTokens = [];
    await req.user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Logged out from all devices'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('subscribers', 'name avatar')
      .populate('subscribedTo', 'name avatar');

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          isVerified: user.isVerified,
          subscribers: user.subscribers.length,
          subscribedTo: user.subscribedTo.length,
          totalViews: user.totalViews,
          totalVideos: user.totalVideos,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], handleValidationErrors, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists
      return res.json({
        success: true,
        message: 'If an account exists, a reset email has been sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save({ validateBeforeSave: false });

    // Send password reset email
    try {
      const emailResult = await sendPasswordResetEmail(user.email, user.name, resetToken);

      // Log email preview URL in development
      if (process.env.NODE_ENV !== 'production' && emailResult.previewUrl) {
        console.log('Password reset email preview:', emailResult.previewUrl);
      }
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError.message);
      // Don't reveal email sending failure to client for security
      // The token is still saved and can be resent if needed
    }

    res.json({
      success: true,
      message: 'If an account exists, a reset email has been sent',
      // Only include token in development for testing purposes
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request'
    });
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post('/reset-password/:token', [
  body('password')
    .custom((value) => {
      const validation = validatePassword(value);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      return true;
    })
], handleValidationErrors, async (req, res) => {
  try {
    const { password } = req.body;
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokens = []; // Invalidate all sessions

    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful. Please log in with your new password.'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});

// @route   PATCH /api/auth/change-password
// @desc    Change password (when logged in)
// @access  Private
router.patch('/change-password', protect, [
  body('currentPassword').notEmpty(),
  body('newPassword')
    .custom((value) => {
      const validation = validatePassword(value);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      return true;
    })
], handleValidationErrors, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    user.refreshTokens = []; // Invalidate all sessions

    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully. Please log in again.'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// @route   GET /api/auth/verify-email/:token
// @desc    Verify email address
// @access  Public
router.get('/verify-email/:token', async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Mark email as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Email verified successfully. You can now access all features.'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email'
    });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail()
], handleValidationErrors, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists
      return res.json({
        success: true,
        message: 'If an account exists, a verification email has been sent'
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.json({
        success: true,
        message: 'If an account exists, a verification email has been sent'
      });
    }

    // Check if previous token is still fresh (rate limiting - 5 minutes)
    if (user.verificationTokenExpires &&
        user.verificationTokenExpires > Date.now() + 23 * 60 * 60 * 1000) {
      return res.status(429).json({
        success: false,
        message: 'Please wait a few minutes before requesting another email'
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save({ validateBeforeSave: false });

    // Send verification email
    try {
      const emailResult = await sendVerificationEmail(user.email, user.name, verificationToken);

      // Log email preview URL in development
      if (process.env.NODE_ENV !== 'production' && emailResult.previewUrl) {
        console.log('Verification email preview:', emailResult.previewUrl);
      }
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError.message);
      // Don't reveal email sending failure to client
    }

    res.json({
      success: true,
      message: 'If an account exists, a verification email has been sent',
      // Only include token in development for testing purposes
      ...(process.env.NODE_ENV === 'development' && { verificationToken })
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request'
    });
  }
});

module.exports = router;
