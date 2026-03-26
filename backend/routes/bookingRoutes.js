/**
 * routes/bookingRoutes.js
 * Booking CRUD routes — all require login
 */

const express      = require('express');
const router       = express.Router();
const bookingCtrl  = require('../controllers/bookingController');
const { requireLogin } = require('../middleware/authMiddleware');

// All booking routes require authentication
router.use(requireLogin);

// GET  /bookings/booked-slots — JSON: fetch taken slots for a resource+date
// (Defined before /:id routes to avoid param conflicts)
router.get('/booked-slots', bookingCtrl.getBookedSlots);

// GET  /bookings/new — show booking creation form
router.get('/new', bookingCtrl.getNewBooking);

// POST /bookings — create new booking
router.post('/', bookingCtrl.createBooking);

// GET  /bookings/:id/edit — show edit form
router.get('/:id/edit', bookingCtrl.getEditBooking);

// POST /bookings/:id/edit — update booking
router.post('/:id/edit', bookingCtrl.updateBooking);

// POST /bookings/:id/delete — delete booking
router.post('/:id/delete', bookingCtrl.deleteBooking);

module.exports = router;
