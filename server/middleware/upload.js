const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
const videosDir = path.join(uploadsDir, 'videos');
const thumbnailsDir = path.join(uploadsDir, 'thumbnails');
const tempDir = path.join(uploadsDir, 'temp');

[videosDir, thumbnailsDir, tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'video') {
      cb(null, tempDir);
    } else if (file.fieldname === 'thumbnail') {
      cb(null, tempDir);
    } else {
      cb(null, tempDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedVideoTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/x-flv',
    'video/mpeg'
  ];

  const allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

  if (file.fieldname === 'video') {
    if (allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video format. Allowed: MP4, WebM, OGG, MOV, AVI, MKV'), false);
    }
  } else if (file.fieldname === 'thumbnail') {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Allowed: JPEG, PNG, WebP, GIF'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

// Multer configuration for video uploads
exports.uploadVideo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB max
    files: 2 // video + thumbnail
  }
});

// Multer configuration for thumbnails only
exports.uploadThumbnail = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1
  }
});

// Multer configuration for avatar uploads
exports.uploadAvatar = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Allowed: JPEG, PNG, WebP'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1
  }
});

// Error handler for multer
exports.handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 2GB for videos and 10MB for thumbnails.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 2 files (1 video + 1 thumbnail).'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name. Use "video" for videos and "thumbnail" for thumbnails.'
      });
    }
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  next();
};

// Move file from temp to final destination
exports.moveToFinal = async (tempPath, finalDir, filename) => {
  const finalPath = path.join(finalDir, filename);
  await fs.promises.rename(tempPath, finalPath);
  return finalPath;
};

// Delete file
exports.deleteFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

// Generate thumbnail from video (using ffmpeg)
exports.generateThumbnail = async (videoPath, outputPath) => {
  const ffmpeg = require('fluent-ffmpeg');
  const ffmpegPath = require('ffmpeg-static');
  ffmpeg.setFfmpegPath(ffmpegPath);

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: ['10%'],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: '1280x720'
      })
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err));
  });
};

// Get video duration
exports.getVideoDuration = async (videoPath) => {
  const ffmpeg = require('fluent-ffmpeg');
  const ffmpegPath = require('ffmpeg-static');
  ffmpeg.setFfmpegPath(ffmpegPath);

  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) return reject(err);
      resolve(Math.floor(metadata.format.duration));
    });
  });
};

// Get video dimensions
exports.getVideoDimensions = async (videoPath) => {
  const ffmpeg = require('fluent-ffmpeg');
  const ffmpegPath = require('ffmpeg-static');
  ffmpeg.setFfmpegPath(ffmpegPath);

  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) return reject(err);
      const stream = metadata.streams.find(s => s.codec_type === 'video');
      resolve({
        width: stream?.width || 0,
        height: stream?.height || 0
      });
    });
  });
};
