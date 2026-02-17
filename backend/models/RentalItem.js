// models/RentalItem.js
const mongoose = require('mongoose');

const rentalItemSchema = new mongoose.Schema({
  title: {
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
    enum: ['books', 'electronics', 'furniture', 'sports', 'clothing', 'other'],
    required: true
  },
  pricePerDay: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    type: String // Base64 or URL
  }],
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair', 'poor'],
    default: 'good'
  },
  available: {
    type: Boolean,
    default: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  ownerRoom: {
    type: String,
    required: true
  },
  ownerPhone: {
    type: String,
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  interestedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

rentalItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('RentalItem', rentalItemSchema);