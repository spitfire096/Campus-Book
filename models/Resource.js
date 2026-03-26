/**
 * models/Resource.js
 * Mongoose schema for campus resources (rooms, labs, equipment)
 */

const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    // Human-readable resource name
    name: {
      type:     String,
      required: [true, 'Resource name is required'],
      trim:     true,
      unique:   true
    },

    // Category classifies resources for filtering
    category: {
      type:     String,
      required: [true, 'Category is required'],
      enum:     ['room', 'lab', 'equipment', 'study-space'],
      lowercase: true
    },

    // Detailed description of what the resource offers
    description: {
      type:  String,
      trim:  true,
      default: ''
    },

    // How many people can use it simultaneously
    capacity: {
      type:    Number,
      default: 1,
      min:     [1, 'Capacity must be at least 1']
    },

    // Physical or logical location on campus
    location: {
      type:  String,
      trim:  true,
      default: 'Main Campus'
    },

    // Whether admin has marked this resource as active
    isAvailable: {
      type:    Boolean,
      default: true
    },

    // List of amenities/features (e.g., ['projector', 'whiteboard'])
    features: {
      type:    [String],
      default: []
    },

    // Reference to the admin who created this resource
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User'
    }
  },
  {
    timestamps: true
  }
);

// ── Index for fast text search across name + description ─────────────────────
resourceSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
