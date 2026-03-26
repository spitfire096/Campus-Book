/**
 * middleware/authMiddleware.js
 * Route protection guards based on session + user role
 */

/**
 * requireLogin — Blocks unauthenticated users.
 * Redirects to /auth/login with a flash message.
 */
const requireLogin = (req, res, next) => {
  if (req.session && req.session.user) {
    return next(); // User is logged in — proceed
  }
  req.flash('error', 'Please log in to access that page.');
  res.redirect('/auth/login');
};

/**
 * requireAdmin — Blocks non-admin users.
 * Must be used AFTER requireLogin in route chains.
 */
const requireAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next(); // Admin — proceed
  }
  req.flash('error', 'Access denied. Admin privileges required.');
  res.redirect('/dashboard');
};

/**
 * requireGuest — Blocks already-logged-in users from auth pages.
 * Prevents logged-in users from seeing /auth/login or /auth/register.
 */
const requireGuest = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard'); // Already logged in
  }
  next();
};

module.exports = { requireLogin, requireAdmin, requireGuest };
