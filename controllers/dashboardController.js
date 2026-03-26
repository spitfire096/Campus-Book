/**
 * controllers/dashboardController.js
 * Home page and user dashboard
 */

const Booking  = require('../models/Booking');
const Resource = require('../models/Resource');

// ── GET / ─────────────────────────────────────────────────────────────────────
// Public home/landing page
const getHome = async (req, res) => {
  try {
    // Show a few featured resources on the landing page
    const featuredResources = await Resource.find({ isAvailable: true })
      .sort({ createdAt: -1 })
      .limit(3);

    res.render('home', {
      title: 'Smart Campus Resource Booking',
      featuredResources
    });

  } catch (err) {
    console.error('Home page error:', err);
    res.render('home', {
      title: 'Smart Campus Resource Booking',
      featuredResources: []
    });
  }
};

// ── GET /dashboard ────────────────────────────────────────────────────────────
// Personalized dashboard for logged-in users
const getDashboard = async (req, res) => {
  try {
    const userId = req.session.user._id;

    // Load this user's bookings, newest first, with resource details
    const bookings = await Booking.find({ user: userId })
      .populate('resource')
      .sort({ date: -1, startTime: -1 });

    // Separate into upcoming and past bookings
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const upcomingBookings = bookings.filter(b => new Date(b.date) >= today);
    const pastBookings     = bookings.filter(b => new Date(b.date) <  today);

    // Stats for the dashboard summary cards
    const totalResources = await Resource.countDocuments({ isAvailable: true });

    res.render('dashboard', {
      title:           'My Dashboard',
      upcomingBookings,
      pastBookings,
      totalBookings:   bookings.length,
      totalResources
    });

  } catch (err) {
    console.error('Dashboard error:', err);
    req.flash('error', 'Failed to load dashboard.');
    res.redirect('/');
  }
};

module.exports = { getHome, getDashboard };
