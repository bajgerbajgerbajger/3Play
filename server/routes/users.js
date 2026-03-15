const express = require('express');
const { body, param } = require('express-validator');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Video = require('../models/Video');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-email -refreshTokens -loginAttempts -lockUntil');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's public videos
    const videos = await Video.find({
      owner: user._id,
      visibility: 'public',
      status: 'ready',
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .limit(12);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          avatar: user.avatar,
          subscribers: user.subscribers.length,
          totalVideos: user.totalVideos,
          totalViews: user.totalViews,
          createdAt: user.createdAt
        },
        videos
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
});

// @route   GET /api/users/:id/videos
// @desc    Get user's videos
// @access  Public
router.get('/:id/videos', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const query = {
      owner: user._id,
      visibility: 'public',
      status: 'ready',
      isDeleted: false
    };

    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Video.countDocuments(query);

    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user videos'
    });
  }
});

// @route   POST /api/users/:id/subscribe
// @desc    Subscribe/unsubscribe to user
// @access  Private
router.post('/:id/subscribe', protect, async (req, res) => {
  try {
    const channelId = req.params.id;

    if (channelId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot subscribe to yourself'
      });
    }

    const channel = await User.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    const isSubscribed = channel.subscribers.includes(req.user._id);

    if (isSubscribed) {
      // Unsubscribe
      channel.subscribers = channel.subscribers.filter(
        id => id.toString() !== req.user._id.toString()
      );
      req.user.subscribedTo = req.user.subscribedTo.filter(
        id => id.toString() !== channelId
      );
    } else {
      // Subscribe
      channel.subscribers.push(req.user._id);
      req.user.subscribedTo.push(channelId);
    }

    await channel.save();
    await req.user.save();

    res.json({
      success: true,
      data: {
        subscribed: !isSubscribed,
        subscriberCount: channel.subscribers.length
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription'
    });
  }
});

// @route   PATCH /api/users/profile
// @desc    Update user profile
// @access  Private
router.patch('/profile', protect, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('bio').optional().trim().isLength({ max: 500 })
], handleValidationErrors, async (req, res) => {
  try {
    const allowedUpdates = ['name', 'bio'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// @route   GET /api/users/subscriptions/videos
// @desc    Get videos from subscribed channels
// @access  Private
router.get('/subscriptions/videos', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const videos = await Video.find({
      owner: { $in: req.user.subscribedTo },
      visibility: 'public',
      status: 'ready',
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('owner', 'name avatar');

    res.json({
      success: true,
      data: { videos }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription videos'
    });
  }
});

module.exports = router;
