/**
 * backend/app.js
 * Express application entry point.
 * Static assets are served from ../frontend (sibling folder).
 */

require('dotenv').config({ path: '../.env' });
const express  = require('express');
const session  = require('express-session');
const flash    = require('connect-flash');
const path     = require('path');
const mongoose = require('mongoose');

// ── Route imports ─────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/authRoutes');
const resourceRoutes  = require('./routes/resourceRoutes');
const bookingRoutes   = require('./routes/bookingRoutes');
const adminRoutes     = require('./routes/adminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// ── Database ──────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅  MongoDB connected'))
  .catch(err => { console.error('❌  MongoDB error:', err.message); process.exit(1); });

// ── View engine — Pug templates live in backend/views/ ────────────────────────
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve frontend/ folder as static assets (CSS, JS)
// Path resolves to the sibling frontend/ directory
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use(flash());

// ── Global template locals ────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.locals.currentUser    = req.session.user || null;
  res.locals.successMessage = req.flash('success');
  res.locals.errorMessage   = req.flash('error');
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/',          dashboardRoutes);
app.use('/auth',      authRoutes);
app.use('/resources', resourceRoutes);
app.use('/bookings',  bookingRoutes);
app.use('/admin',     adminRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).render('404', { title: 'Page Not Found' }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong.'
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀  Server running at http://localhost:${PORT}`));
