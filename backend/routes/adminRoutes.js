/**
 * routes/adminRoutes.js
 * Admin-only management routes
 */

const express    = require('express');
const router     = express.Router();
const adminCtrl  = require('../controllers/adminController');
const { requireLogin, requireAdmin } = require('../middleware/authMiddleware');

// All admin routes require login + admin role
router.use(requireLogin, requireAdmin);

// ── Admin Dashboard ───────────────────────────────────────────────────────────
router.get('/', adminCtrl.getAdminDashboard);

// ── Resource Management ───────────────────────────────────────────────────────
router.get('/resources',              adminCtrl.getAdminResources);
router.get('/resources/new',          adminCtrl.getNewResource);
router.post('/resources',             adminCtrl.createResource);
router.get('/resources/:id/edit',     adminCtrl.getEditResource);
router.post('/resources/:id/edit',    adminCtrl.updateResource);
router.post('/resources/:id/delete',  adminCtrl.deleteResource);

// ── Booking Management ────────────────────────────────────────────────────────
router.get('/bookings', adminCtrl.getAdminBookings);

// ── User Management ───────────────────────────────────────────────────────────
router.get('/users',              adminCtrl.getAdminUsers);
router.post('/users/:id/delete',  adminCtrl.deleteUser);

module.exports = router;
