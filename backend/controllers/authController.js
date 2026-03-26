/**
 * controllers/authController.js
 * Handles user registration, login, and logout
 */

const User = require('../models/User');

// ── GET /auth/register ────────────────────────────────────────────────────────
const getRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Create Account',
    formData: {} // Empty form on first load
  });
};

// ── POST /auth/register ───────────────────────────────────────────────────────
const postRegister = async (req, res) => {
  const { name, email, password, confirmPassword, studentId } = req.body;

  // Server-side validation (backup for client-side)
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters.');
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Please enter a valid email address.');
  }
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }
  if (password !== confirmPassword) {
    errors.push('Passwords do not match.');
  }

  if (errors.length > 0) {
    return res.render('auth/register', {
      title: 'Create Account',
      errors,
      formData: { name, email, studentId } // Repopulate form
    });
  }

  try {
    // Check if email is already taken
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.render('auth/register', {
        title: 'Create Account',
        errors: ['An account with that email already exists.'],
        formData: { name, email, studentId }
      });
    }

    // Create + save new user (password hashing handled by pre-save hook)
    const user = new User({ name, email, password, studentId });
    await user.save();

    // Auto-login after registration
    req.session.user = user.toSafeObject();
    req.flash('success', `Welcome, ${user.name}! Your account has been created.`);
    res.redirect('/dashboard');

  } catch (err) {
    console.error('Registration error:', err);
    res.render('auth/register', {
      title: 'Create Account',
      errors: ['Server error. Please try again.'],
      formData: { name, email, studentId }
    });
  }
};

// ── GET /auth/login ───────────────────────────────────────────────────────────
const getLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Sign In',
    formData: {}
  });
};

// ── POST /auth/login ──────────────────────────────────────────────────────────
const postLogin = async (req, res) => {
  const { email, password } = req.body;

  // Server-side validation
  if (!email || !password) {
    return res.render('auth/login', {
      title: 'Sign In',
      errors: ['Please enter both email and password.'],
      formData: { email }
    });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.render('auth/login', {
        title: 'Sign In',
        errors: ['Invalid email or password.'],
        formData: { email }
      });
    }

    // Compare password using bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('auth/login', {
        title: 'Sign In',
        errors: ['Invalid email or password.'],
        formData: { email }
      });
    }

    // Save safe user object to session
    req.session.user = user.toSafeObject();
    req.flash('success', `Welcome back, ${user.name}!`);
    res.redirect('/dashboard');

  } catch (err) {
    console.error('Login error:', err);
    res.render('auth/login', {
      title: 'Sign In',
      errors: ['Server error. Please try again.'],
      formData: { email }
    });
  }
};

// ── GET /auth/logout ──────────────────────────────────────────────────────────
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Session destroy error:', err);
    res.redirect('/auth/login');
  });
};

module.exports = { getRegister, postRegister, getLogin, postLogin, logout };
