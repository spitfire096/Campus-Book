/**
 * controllers/resourceController.js
 * Handles resource browsing, searching, and filtering for students
 */

const Resource = require('../models/Resource');

// ── GET /resources ────────────────────────────────────────────────────────────
// Lists all available resources with optional search + filter
const getResources = async (req, res) => {
  try {
    const { search, category, available } = req.query;

    // Build dynamic query object based on query parameters
    const query = {};

    // Text search across name and description
    if (search && search.trim()) {
      query.$or = [
        { name:        { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { location:    { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Filter by category (room, lab, equipment, study-space)
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by availability
    if (available === 'true') {
      query.isAvailable = true;
    }

    // Fetch resources matching the query, sorted by name
    const resources = await Resource.find(query).sort({ name: 1 });

    res.render('resources/index', {
      title:      'Campus Resources',
      resources,
      search:     search   || '',
      category:   category || 'all',
      available:  available || ''
    });

  } catch (err) {
    console.error('Get resources error:', err);
    req.flash('error', 'Failed to load resources.');
    res.redirect('/dashboard');
  }
};

// ── GET /resources/:id ────────────────────────────────────────────────────────
// Shows a single resource detail page
const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      req.flash('error', 'Resource not found.');
      return res.redirect('/resources');
    }

    res.render('resources/show', {
      title: resource.name,
      resource
    });

  } catch (err) {
    console.error('Get resource error:', err);
    req.flash('error', 'Failed to load resource.');
    res.redirect('/resources');
  }
};

module.exports = { getResources, getResource };
