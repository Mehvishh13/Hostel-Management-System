// models/Group.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['study', 'sports', 'events', 'entertainment', 'food', 'general'],
    default: 'general'
  },
  image: {
    type: String // Base64 or URL
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  privacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  settings: {
    onlyAdminsCanPost: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    hiddenFromHostelAdmin: {
      type: Boolean,
      default: false
    },
    allowMembersToInvite: {
      type: Boolean,
      default: true
    }
  },
  pendingRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  messages: [messageSchema],
  memberCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

groupSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.memberCount = this.members.length;
  next();
});

// Indexes matching the membership lookups in groupController.
groupSchema.index({ members: 1 });
groupSchema.index({ admins: 1 });
groupSchema.index({ creator: 1 });
groupSchema.index({ category: 1, privacy: 1 });

module.exports = mongoose.model('Group', groupSchema);