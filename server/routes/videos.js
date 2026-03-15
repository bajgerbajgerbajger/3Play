const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const Video = require('../models/Video');
const User = require('../models/User');
const { protect, optionalAuth, checkOwnership, requireVerified } = require('../middleware/auth');
const { uploadVideo, handleMulterError, moveToFinal, deleteFile, generateThumbnail, getVideoDuration, getVideoDimensions } = require('../middleware/upload');

const router = express.Router();

// Validation middleware
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

// @route   GET /api/videos
// @desc    Get all videos (with filters)
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('category').optional().isIn(['entertainment', 'education', 'music', 'gaming', 'sports', 'news', 'technology', 'other']),
  query('sort').optional().isIn(['newest', 'oldest', 'popular', 'views'])
], handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { category, sort = 'newest', search } = req.query;

    // Build query
    const query = {
      visibility: 'public',
      status: 'ready',
      isDeleted: false
    };

    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'popular':
        sortOption = { likes: -1 };
        break;
      case 'views':
        sortOption = { views: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const videos = await Video.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('owner', 'name avatar subscribers');

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
    console.error('Get videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch videos'
    });
  }
});

// @route   GET /api/videos/trending
// @desc    Get trending videos
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const videos = await Video.getTrending(limit);

    res.json({
      success: true,
      data: { videos }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending videos'
    });
  }
});

// @route   GET /api/videos/recommended
// @desc    Get recommended videos
// @access  Private
router.get('/recommended', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const videos = await Video.getRecommended(req.user._id, limit);

    res.json({
      success: true,
      data: { videos }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommended videos'
    });
  }
});

// @route   GET /api/videos/user
// @desc    Get current user's videos
// @access  Private
router.get('/user', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const videos = await Video.find({
      owner: req.user._id,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Video.countDocuments({
      owner: req.user._id,
      isDeleted: false
    });

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

// @route   GET /api/videos/:id
// @desc    Get single video
// @access  Public
router.get('/:id', [
  param('id').isMongoId()
], handleValidationErrors, optionalAuth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('owner', 'name avatar subscribers totalVideos');

    if (!video || video.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check visibility
    if (video.visibility === 'private') {
      if (!req.user || video.owner._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'This video is private'
        });
      }
    }

    // Check if user liked/disliked
    let userReaction = null;
    if (req.user) {
      if (video.likes.includes(req.user._id)) userReaction = 'like';
      else if (video.dislikes.includes(req.user._id)) userReaction = 'dislike';
    }

    res.json({
      success: true,
      data: {
        video: {
          ...video.toObject(),
          userReaction
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch video'
    });
  }
});

// @route   POST /api/videos
// @desc    Upload a new video
// @access  Private (verified users only)
router.post('/', protect, requireVerified, uploadVideo.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), handleMulterError, [
  body('title').trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ max: 5000 }),
  body('category').optional().isIn(['entertainment', 'education', 'music', 'gaming', 'sports', 'news', 'technology', 'other']),
  body('visibility').optional().isIn(['public', 'unlisted', 'private']),
  body('tags').optional().custom((value) => {
    if (typeof value === 'string') {
      const tags = value.split(',').map(t => t.trim()).filter(t => t);
      if (tags.length > 10) throw new Error('Maximum 10 tags allowed');
      if (tags.some(t => t.length > 30)) throw new Error('Each tag max 30 characters');
    }
    return true;
  })
], handleValidationErrors, async (req, res) => {
  try {
    const { title, description, category = 'other', visibility = 'public', tags } = req.body;

    // Check if video file exists
    if (!req.files || !req.files.video) {
      return res.status(400).json({
        success: false,
        message: 'Video file is required'
      });
    }

    const videoFile = req.files.video[0];
    const thumbnailFile = req.files.thumbnail?.[0];

    // Get video metadata
    const duration = await getVideoDuration(videoFile.path);
    const dimensions = await getVideoDimensions(videoFile.path);

    // Move video to final destination
    const videoFilename = `${Date.now()}-${videoFile.originalname}`;
    const videoPath = await moveToFinal(
      videoFile.path,
      path.join(__dirname, '..', 'uploads', 'videos'),
      videoFilename
    );

    // Handle thumbnail
    let thumbnailPath;
    if (thumbnailFile) {
      const thumbnailFilename = `${Date.now()}-${thumbnailFile.originalname}`;
      thumbnailPath = await moveToFinal(
        thumbnailFile.path,
        path.join(__dirname, '..', 'uploads', 'thumbnails'),
        thumbnailFilename
      );
    } else {
      // Generate thumbnail from video
      const thumbnailFilename = `${Date.now()}-generated.jpg`;
      const generatedPath = path.join(__dirname, '..', 'uploads', 'thumbnails', thumbnailFilename);
      await generateThumbnail(videoPath, generatedPath);
      thumbnailPath = generatedPath;
    }

    // Create video document
    const video = await Video.create({
      title,
      description,
      videoUrl: `/uploads/videos/${path.basename(videoPath)}`,
      thumbnailUrl: `/uploads/thumbnails/${path.basename(thumbnailPath)}`,
      duration,
      fileSize: videoFile.size,
      format: path.extname(videoFile.originalname).slice(1),
      resolution: dimensions,
      owner: req.user._id,
      category,
      visibility,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [],
      status: 'ready'
    });

    // Update user video count
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalVideos: 1 } });

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: { video }
    });

  } catch (error) {
    console.error('Upload error:', error);

    // Cleanup uploaded files on error
    if (req.files) {
      Object.values(req.files).forEach(files => {
        files.forEach(file => deleteFile(file.path));
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload video'
    });
  }
});

// @route   GET /api/videos/:id/stream
// @desc    Stream video
// @access  Public
router.get('/:id/stream', [
  param('id').isMongoId()
], handleValidationErrors, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video || video.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const videoPath = path.join(__dirname, '..', video.videoUrl);

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        message: 'Video file not found'
      });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Handle range request for streaming
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=31536000'
      });

      file.pipe(res);
    } else {
      // Full video request
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=31536000'
      });

      fs.createReadStream(videoPath).pipe(res);
    }

  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stream video'
    });
  }
});

// @route   GET /api/videos/:id/download
// @desc    Download video
// @access  Public
router.get('/:id/download', [
  param('id').isMongoId()
], handleValidationErrors, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video || video.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const videoPath = path.join(__dirname, '..', video.videoUrl);

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        message: 'Video file not found'
      });
    }

    const filename = `${video.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${video.format}`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'video/mp4');

    const fileStream = fs.createReadStream(videoPath);
    fileStream.pipe(res);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to download video'
    });
  }
});

// @route   POST /api/videos/:id/view
// @desc    Increment video views
// @access  Public
router.post('/:id/view', [
  param('id').isMongoId()
], handleValidationErrors, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video || video.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    await video.incrementViews();

    res.json({
      success: true,
      data: { views: video.views }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update views'
    });
  }
});

// @route   POST /api/videos/:id/like
// @desc    Like/unlike video
// @access  Private
router.post('/:id/like', protect, [
  param('id').isMongoId()
], handleValidationErrors, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video || video.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    await video.toggleLike(req.user._id);

    res.json({
      success: true,
      data: {
        likes: video.likes.length,
        dislikes: video.dislikes.length
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to like video'
    });
  }
});

// @route   POST /api/videos/:id/dislike
// @desc    Dislike/undislike video
// @access  Private
router.post('/:id/dislike', protect, [
  param('id').isMongoId()
], handleValidationErrors, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video || video.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    await video.toggleDislike(req.user._id);

    res.json({
      success: true,
      data: {
        likes: video.likes.length,
        dislikes: video.dislikes.length
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to dislike video'
    });
  }
});

// @route   POST /api/videos/:id/comments
// @desc    Add comment to video
// @access  Private
router.post('/:id/comments', protect, [
  param('id').isMongoId(),
  body('text').trim().isLength({ min: 1, max: 1000 })
], handleValidationErrors, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video || video.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    video.comments.push({
      user: req.user._id,
      text: req.body.text
    });

    await video.save();

    // Populate and return new comment
    await video.populate('comments.user', 'name avatar');
    const newComment = video.comments[video.comments.length - 1];

    res.status(201).json({
      success: true,
      data: { comment: newComment }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
});

// @route   DELETE /api/videos/:id
// @desc    Delete video
// @access  Private
router.delete('/:id', protect, [
  param('id').isMongoId()
], handleValidationErrors, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check ownership
    if (video.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this video'
      });
    }

    // Soft delete
    video.isDeleted = true;
    video.deletedAt = new Date();
    await video.save();

    // Delete files
    const videoPath = path.join(__dirname, '..', video.videoUrl);
    const thumbnailPath = path.join(__dirname, '..', video.thumbnailUrl);
    deleteFile(videoPath);
    deleteFile(thumbnailPath);

    // Update user video count
    await User.findByIdAndUpdate(video.owner, { $inc: { totalVideos: -1 } });

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete video'
    });
  }
});

// @route   PATCH /api/videos/:id
// @desc    Update video
// @access  Private
router.patch('/:id', protect, [
  param('id').isMongoId(),
  body('title').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ max: 5000 }),
  body('visibility').optional().isIn(['public', 'unlisted', 'private'])
], handleValidationErrors, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video || video.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check ownership
    if (video.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this video'
      });
    }

    const allowedUpdates = ['title', 'description', 'visibility', 'category', 'tags'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'tags' && typeof req.body[key] === 'string') {
          updates[key] = req.body[key].split(',').map(t => t.trim()).filter(t => t);
        } else {
          updates[key] = req.body[key];
        }
      }
    });

    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: { video: updatedVideo }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update video'
    });
  }
});

module.exports = router;
