/**
 * controllers/bookingController.js
 * Full CRUD for resource bookings (student-facing)
 */

const Booking  = require('../models/Booking');
const Resource = require('../models/Resource');

// ── GET /bookings/new?resourceId=xxx ─────────────────────────────────────────
// Shows the booking creation form
const getNewBooking = async (req, res) => {
  try {
    const { resourceId } = req.query;
    let resource = null;

    if (resourceId) {
      resource = await Resource.findById(resourceId);
    }

    // Fetch all available resources for the dropdown
    const resources = await Resource.find({ isAvailable: true }).sort({ name: 1 });

    res.render('bookings/new', {
      title:    'New Booking',
      resource,
      resources,
      formData: {}
    });

  } catch (err) {
    console.error('New booking form error:', err);
    req.flash('error', 'Failed to load booking form.');
    res.redirect('/resources');
  }
};

// ── POST /bookings ────────────────────────────────────────────────────────────
// Creates a new booking with conflict detection
const createBooking = async (req, res) => {
  const { resourceId, date, startTime, endTime, purpose } = req.body;
  const userId = req.session.user._id;

  // Server-side validation
  const errors = [];
  if (!resourceId)           errors.push('Please select a resource.');
  if (!date)                 errors.push('Please select a date.');
  if (!startTime)            errors.push('Please select a start time.');
  if (!endTime)              errors.push('Please select an end time.');
  if (startTime >= endTime)  errors.push('End time must be after start time.');

  if (errors.length > 0) {
    const resources = await Resource.find({ isAvailable: true }).sort({ name: 1 });
    return res.render('bookings/new', {
      title:    'New Booking',
      errors,
      resources,
      resource: null,
      formData: req.body
    });
  }

  try {
    const resource = await Resource.findById(resourceId);
    if (!resource || !resource.isAvailable) {
      req.flash('error', 'Selected resource is not available.');
      return res.redirect('/resources');
    }

    // Normalize date to midnight UTC for consistent date-only comparisons
    const bookingDate = new Date(date);
    bookingDate.setUTCHours(0, 0, 0, 0);

    // Find existing confirmed bookings for this resource on the same date
    const existingBookings = await Booking.find({
      resource: resourceId,
      date:     bookingDate,
      status:   'confirmed'
    });

    // Check for time slot conflicts
    const hasConflict = existingBookings.some(b => b.conflictsWith(startTime, endTime));
    if (hasConflict) {
      const resources = await Resource.find({ isAvailable: true }).sort({ name: 1 });
      return res.render('bookings/new', {
        title:    'New Booking',
        errors:   ['That time slot is already booked. Please choose another time.'],
        resources,
        resource,
        formData: req.body
      });
    }

    // Create and save the booking
    const booking = new Booking({
      user:      userId,
      resource:  resourceId,
      date:      bookingDate,
      startTime,
      endTime,
      purpose:   purpose || '',
      status:    'confirmed'
    });
    await booking.save();

    req.flash('success', `Booking confirmed for ${resource.name}!`);
    res.redirect('/dashboard');

  } catch (err) {
    console.error('Create booking error:', err);
    req.flash('error', 'Failed to create booking. Please try again.');
    res.redirect('/bookings/new');
  }
};

// ── GET /bookings/:id/edit ────────────────────────────────────────────────────
// Shows edit form for an existing booking
const getEditBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('resource');

    if (!booking) {
      req.flash('error', 'Booking not found.');
      return res.redirect('/dashboard');
    }

    // Security: only the booking owner can edit
    if (booking.user.toString() !== req.session.user._id.toString()) {
      req.flash('error', 'You are not authorized to edit this booking.');
      return res.redirect('/dashboard');
    }

    const resources = await Resource.find({ isAvailable: true }).sort({ name: 1 });

    res.render('bookings/edit', {
      title:   'Edit Booking',
      booking,
      resources,
      formData: {}
    });

  } catch (err) {
    console.error('Edit booking form error:', err);
    req.flash('error', 'Failed to load booking.');
    res.redirect('/dashboard');
  }
};

// ── POST /bookings/:id/edit ───────────────────────────────────────────────────
// Updates an existing booking
const updateBooking = async (req, res) => {
  const { date, startTime, endTime, purpose } = req.body;

  // Validation
  const errors = [];
  if (!date)                 errors.push('Please select a date.');
  if (!startTime)            errors.push('Please select a start time.');
  if (!endTime)              errors.push('Please select an end time.');
  if (startTime >= endTime)  errors.push('End time must be after start time.');

  try {
    const booking = await Booking.findById(req.params.id).populate('resource');

    if (!booking) {
      req.flash('error', 'Booking not found.');
      return res.redirect('/dashboard');
    }

    // Authorization check
    if (booking.user.toString() !== req.session.user._id.toString()) {
      req.flash('error', 'Unauthorized.');
      return res.redirect('/dashboard');
    }

    if (errors.length > 0) {
      const resources = await Resource.find({ isAvailable: true }).sort({ name: 1 });
      return res.render('bookings/edit', {
        title: 'Edit Booking',
        errors,
        booking,
        resources,
        formData: req.body
      });
    }

    const bookingDate = new Date(date);
    bookingDate.setUTCHours(0, 0, 0, 0);

    // Check conflicts — exclude the current booking from conflict check
    const existingBookings = await Booking.find({
      resource: booking.resource._id,
      date:     bookingDate,
      status:   'confirmed',
      _id:      { $ne: booking._id } // exclude self
    });

    const hasConflict = existingBookings.some(b => b.conflictsWith(startTime, endTime));
    if (hasConflict) {
      const resources = await Resource.find({ isAvailable: true }).sort({ name: 1 });
      return res.render('bookings/edit', {
        title:    'Edit Booking',
        errors:   ['That time slot is already booked.'],
        booking,
        resources,
        formData: req.body
      });
    }

    // Update fields
    booking.date      = bookingDate;
    booking.startTime = startTime;
    booking.endTime   = endTime;
    booking.purpose   = purpose || '';
    await booking.save();

    req.flash('success', 'Booking updated successfully!');
    res.redirect('/dashboard');

  } catch (err) {
    console.error('Update booking error:', err);
    req.flash('error', 'Failed to update booking.');
    res.redirect('/dashboard');
  }
};

// ── POST /bookings/:id/delete ─────────────────────────────────────────────────
// Deletes (cancels) a booking
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      req.flash('error', 'Booking not found.');
      return res.redirect('/dashboard');
    }

    // Authorization: owner or admin can delete
    const isOwner = booking.user.toString() === req.session.user._id.toString();
    const isAdmin = req.session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      req.flash('error', 'Unauthorized.');
      return res.redirect('/dashboard');
    }

    await Booking.findByIdAndDelete(req.params.id);
    req.flash('success', 'Booking cancelled successfully.');
    res.redirect('/dashboard');

  } catch (err) {
    console.error('Delete booking error:', err);
    req.flash('error', 'Failed to cancel booking.');
    res.redirect('/dashboard');
  }
};

// ── GET /bookings/booked-slots?resourceId=xxx&date=yyyy-mm-dd ─────────────────
// JSON endpoint: returns booked time slots for a resource on a given date
// Used by client-side JS to disable taken time slots in the UI
const getBookedSlots = async (req, res) => {
  try {
    const { resourceId, date } = req.query;

    if (!resourceId || !date) {
      return res.json({ slots: [] });
    }

    const bookingDate = new Date(date);
    bookingDate.setUTCHours(0, 0, 0, 0);

    const bookings = await Booking.find({
      resource: resourceId,
      date:     bookingDate,
      status:   'confirmed'
    }).select('startTime endTime -_id');

    res.json({ slots: bookings });

  } catch (err) {
    console.error('Get booked slots error:', err);
    res.status(500).json({ error: 'Failed to fetch booked slots.' });
  }
};

module.exports = {
  getNewBooking,
  createBooking,
  getEditBooking,
  updateBooking,
  deleteBooking,
  getBookedSlots
};
