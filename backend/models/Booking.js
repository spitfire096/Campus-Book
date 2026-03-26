/**
 * models/Booking.js
 * Mongoose schema for resource bookings
 * Relationships: Booking → User (many-to-one), Booking → Resource (many-to-one)
 */

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    // Which user made this booking
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'User reference is required']
    },

    // Which resource is being booked
    resource: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Resource',
      required: [true, 'Resource reference is required']
    },

    // Booking date (stored as Date object, time ignored for date-only queries)
    date: {
      type:     Date,
      required: [true, 'Booking date is required']
    },

    // Start time as HH:MM string (e.g., "09:00")
    startTime: {
      type:     String,
      required: [true, 'Start time is required'],
      match:    [/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format']
    },

    // End time as HH:MM string (e.g., "11:00")
    endTime: {
      type:     String,
      required: [true, 'End time is required'],
      match:    [/^\d{2}:\d{2}$/, 'End time must be in HH:MM format']
    },

    // Optional purpose/notes for the booking
    purpose: {
      type:  String,
      trim:  true,
      default: ''
    },

    // Booking lifecycle status
    status: {
      type:    String,
      enum:    ['pending', 'confirmed', 'cancelled'],
      default: 'confirmed'
    }
  },
  {
    timestamps: true
  }
);

// ── Virtual: Check if this booking conflicts with a given time range ──────────
// Called as: booking.conflictsWith(startTime, endTime)
bookingSchema.methods.conflictsWith = function (start, end) {
  // Convert "HH:MM" strings to comparable minutes-since-midnight
  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const thisStart = toMinutes(this.startTime);
  const thisEnd   = toMinutes(this.endTime);
  const newStart  = toMinutes(start);
  const newEnd    = toMinutes(end);

  // Overlap exists if one range starts before the other ends
  return thisStart < newEnd && newStart < thisEnd;
};

// ── Compound index: speeds up conflict detection queries ─────────────────────
bookingSchema.index({ resource: 1, date: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
