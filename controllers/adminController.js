/**
 * controllers/adminController.js
 * Admin-only: manage resources, view all bookings, manage users
 */

const Resource = require('../models/Resource');
const Booking  = require('../models/Booking');
const User     = require('../models/User');

// ── GET /admin ────────────────────────────────────────────────────────────────
// Admin dashboard overview
const getAdminDashboard = async (req, res) => {
  try {
    const [totalUsers, totalResources, totalBookings, recentBookings] = await Promise.all([
      User.countDocuments(),
      Resource.countDocuments(),
      Booking.countDocuments(),
      Booking.find()
        .populate('user', 'name email')
        .populate('resource', 'name category')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    res.render('admin/index', {
      title: 'Admin Dashboard',
      totalUsers,
      totalResources,
      totalBookings,
      recentBookings
    });

  } catch (err) {
    console.error('Admin dashboard error:', err);
    req.flash('error', 'Failed to load admin dashboard.');
    res.redirect('/dashboard');
  }
};

// ── GET /admin/resources ──────────────────────────────────────────────────────
// List all resources (admin view)
const getAdminResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.render('admin/resources', {
      title: 'Manage Resources',
      resources
    });
  } catch (err) {
    console.error('Admin resources error:', err);
    req.flash('error', 'Failed to load resources.');
    res.redirect('/admin');
  }
};

// ── GET /admin/resources/new ──────────────────────────────────────────────────
const getNewResource = (req, res) => {
  res.render('admin/resource-form', {
    title:    'Add New Resource',
    resource: null, // null = create mode
    formData: {}
  });
};

// ── POST /admin/resources ─────────────────────────────────────────────────────
const createResource = async (req, res) => {
  const { name, category, description, capacity, location, features } = req.body;

  const errors = [];
  if (!name || name.trim().length < 2) errors.push('Resource name is required (min 2 chars).');
  if (!category)                        errors.push('Please select a category.');
  if (!capacity || capacity < 1)        errors.push('Capacity must be at least 1.');

  if (errors.length > 0) {
    return res.render('admin/resource-form', {
      title:    'Add New Resource',
      errors,
      resource: null,
      formData: req.body
    });
  }

  try {
    // Parse features: textarea with one feature per line
    const featureList = features
      ? features.split('\n').map(f => f.trim()).filter(Boolean)
      : [];

    const resource = new Resource({
      name:      name.trim(),
      category,
      description: description || '',
      capacity:  parseInt(capacity),
      location:  location || 'Main Campus',
      features:  featureList,
      createdBy: req.session.user._id
    });
    await resource.save();

    req.flash('success', `Resource "${resource.name}" added successfully!`);
    res.redirect('/admin/resources');

  } catch (err) {
    console.error('Create resource error:', err);
    const errorMsg = err.code === 11000
      ? 'A resource with that name already exists.'
      : 'Failed to create resource.';

    res.render('admin/resource-form', {
      title:    'Add New Resource',
      errors:   [errorMsg],
      resource: null,
      formData: req.body
    });
  }
};

// ── GET /admin/resources/:id/edit ─────────────────────────────────────────────
const getEditResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      req.flash('error', 'Resource not found.');
      return res.redirect('/admin/resources');
    }

    res.render('admin/resource-form', {
      title:    `Edit: ${resource.name}`,
      resource,
      formData: {}
    });

  } catch (err) {
    console.error('Edit resource form error:', err);
    req.flash('error', 'Failed to load resource.');
    res.redirect('/admin/resources');
  }
};

// ── POST /admin/resources/:id/edit ────────────────────────────────────────────
const updateResource = async (req, res) => {
  const { name, category, description, capacity, location, features, isAvailable } = req.body;

  const errors = [];
  if (!name || name.trim().length < 2) errors.push('Resource name is required.');
  if (!category)                        errors.push('Category is required.');

  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      req.flash('error', 'Resource not found.');
      return res.redirect('/admin/resources');
    }

    if (errors.length > 0) {
      return res.render('admin/resource-form', {
        title:    `Edit: ${resource.name}`,
        errors,
        resource,
        formData: req.body
      });
    }

    const featureList = features
      ? features.split('\n').map(f => f.trim()).filter(Boolean)
      : [];

    resource.name        = name.trim();
    resource.category    = category;
    resource.description = description || '';
    resource.capacity    = parseInt(capacity) || 1;
    resource.location    = location || 'Main Campus';
    resource.features    = featureList;
    resource.isAvailable = isAvailable === 'true' || isAvailable === true;

    await resource.save();
    req.flash('success', `Resource "${resource.name}" updated.`);
    res.redirect('/admin/resources');

  } catch (err) {
    console.error('Update resource error:', err);
    req.flash('error', 'Failed to update resource.');
    res.redirect('/admin/resources');
  }
};

// ── POST /admin/resources/:id/delete ─────────────────────────────────────────
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) {
      req.flash('error', 'Resource not found.');
    } else {
      // Also cancel all associated bookings
      await Booking.deleteMany({ resource: req.params.id });
      req.flash('success', `Resource "${resource.name}" and its bookings deleted.`);
    }
    res.redirect('/admin/resources');

  } catch (err) {
    console.error('Delete resource error:', err);
    req.flash('error', 'Failed to delete resource.');
    res.redirect('/admin/resources');
  }
};

// ── GET /admin/bookings ───────────────────────────────────────────────────────
// View ALL bookings across all users
const getAdminBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('resource', 'name category location')
      .sort({ date: -1 });

    res.render('admin/bookings', {
      title: 'All Bookings',
      bookings
    });

  } catch (err) {
    console.error('Admin bookings error:', err);
    req.flash('error', 'Failed to load bookings.');
    res.redirect('/admin');
  }
};

// ── GET /admin/users ──────────────────────────────────────────────────────────
const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.render('admin/users', {
      title: 'Manage Users',
      users
    });
  } catch (err) {
    console.error('Admin users error:', err);
    req.flash('error', 'Failed to load users.');
    res.redirect('/admin');
  }
};

// ── POST /admin/users/:id/delete ──────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    // Prevent deleting own account
    if (req.params.id === req.session.user._id.toString()) {
      req.flash('error', 'You cannot delete your own account.');
      return res.redirect('/admin/users');
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (user) {
      // Remove all bookings for this user
      await Booking.deleteMany({ user: req.params.id });
      req.flash('success', `User "${user.name}" deleted.`);
    } else {
      req.flash('error', 'User not found.');
    }
    res.redirect('/admin/users');

  } catch (err) {
    console.error('Delete user error:', err);
    req.flash('error', 'Failed to delete user.');
    res.redirect('/admin/users');
  }
};

module.exports = {
  getAdminDashboard,
  getAdminResources,
  getNewResource,
  createResource,
  getEditResource,
  updateResource,
  deleteResource,
  getAdminBookings,
  getAdminUsers,
  deleteUser
};
