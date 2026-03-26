/**
 * app.js — Smart Campus Resource Booking System
 * Main Express application entry point
 */

require('dotenv').config({ path: '../.env' });
const express    = require('express');
const session    = require('express-session');
const flash      = require('connect-flash');
const path       = require('path');
const mongoose   = require('mongoose');

// ── Route Imports ────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/authRoutes');
const resourceRoutes  = require('./routes/resourceRoutes');
const bookingRoutes   = require('./routes/bookingRoutes');
const adminRoutes     = require('./routes/adminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// ── App Init ─────────────────────────────────────────────────────────────────
const app = express();

// ── Database Connection ───────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅  MongoDB connected successfully'))
  .catch(err => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });

// ── View Engine ───────────────────────────────────────────────────────────────
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// ── Middleware ────────────────────────────────────────────────────────────────
// Parse incoming request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (CSS, client-side JS)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Flash messages (must come after session)
app.use(flash());

// ── Global Template Variables ─────────────────────────────────────────────────
// Makes user session + flash messages available in ALL Pug templates
app.use((req, res, next) => {
  res.locals.currentUser    = req.session.user || null;
  res.locals.successMessage = req.flash('success');
  res.locals.errorMessage   = req.flash('error');
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/',           dashboardRoutes);
app.use('/auth',       authRoutes);
app.use('/resources',  resourceRoutes);
app.use('/bookings',   bookingRoutes);
app.use('/admin',      adminRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).render('error', {
    title: 'Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong.'
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀  Server running at http://localhost:${PORT}`);
});
