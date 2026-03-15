const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  isEdited: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  fileSize: {
    type: Number,
    default: 0
  },
  format: {
    type: String,
    default: 'mp4'
  },
  resolution: {
    width: Number,
    height: Number
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  viewsHistory: [{
    date: { type: Date, default: Date.now },
    count: { type: Number, default: 1 }
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  category: {
    type: String,
    enum: ['entertainment', 'education', 'music', 'gaming', 'sports', 'news', 'technology', 'other'],
    default: 'other'
  },
  visibility: {
    type: String,
    enum: ['public', 'unlisted', 'private'],
    default: 'public'
  },
  status: {
    type: String,
    enum: ['processing', 'ready', 'failed', 'blocked'],
    default: 'processing'
  },
  processingProgress: {
    type: Number,
    default: 0
  },
  isMonetized: {
    type: Boolean,
    default: false
  },
  ageRestricted: {
    type: Boolean,
    default: false
  },
  scheduledFor: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
videoSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

videoSchema.virtual('dislikeCount').get(function() {
  return this.dislikes.length;
});

videoSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Indexes for performance
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });
videoSchema.index({ owner: 1, createdAt: -1 });
videoSchema.index({ category: 1, views: -1 });
videoSchema.index({ createdAt: -1 });
videoSchema.index({ tags: 1 });
videoSchema.index({ visibility: 1, status: 1 });

// Pre-save middleware to update user video count
videoSchema.pre('save', async function(next) {
  if (this.isNew && this.status === 'ready') {
    await mongoose.model('User').findByIdAndUpdate(
      this.owner,
      { $inc: { totalVideos: 1 } }
    );
  }
  next();
});

// Method to increment views
videoSchema.methods.incrementViews = async function() {
  this.views += 1;

  // Update views history (last 30 days)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayEntry = this.viewsHistory.find(
    h => h.date.getTime() === today.getTime()
  );

  if (todayEntry) {
    todayEntry.count += 1;
  } else {
    this.viewsHistory.push({ date: today, count: 1 });
  }

  // Keep only last 30 days
  if (this.viewsHistory.length > 30) {
    this.viewsHistory = this.viewsHistory.slice(-30);
  }

  return this.save();
};

// Method to toggle like
videoSchema.methods.toggleLike = async function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  const dislikeIndex = this.dislikes.indexOf(userId);

  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push(userId);
    if (dislikeIndex > -1) {
      this.dislikes.splice(dislikeIndex, 1);
    }
  }

  return this.save();
};

// Method to toggle dislike
videoSchema.methods.toggleDislike = async function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  const dislikeIndex = this.dislikes.indexOf(userId);

  if (dislikeIndex > -1) {
    this.dislikes.splice(dislikeIndex, 1);
  } else {
    this.dislikes.push(userId);
    if (likeIndex > -1) {
      this.likes.splice(likeIndex, 1);
    }
  }

  return this.save();
};

// Static method to get trending videos
videoSchema.statics.getTrending = function(limit = 20) {
  return this.find({
    visibility: 'public',
    status: 'ready',
    isDeleted: false
  })
    .sort({ views: -1 })
    .limit(limit)
    .populate('owner', 'name avatar subscribers');
};

// Static method to get recommended videos
videoSchema.statics.getRecommended = function(userId, limit = 20) {
  return this.find({
    visibility: 'public',
    status: 'ready',
    isDeleted: false,
    owner: { $ne: userId }
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('owner', 'name avatar');
};

module.exports = mongoose.model('Video', videoSchema);
