/**
 * routes/dashboardRoutes.js
 * Home page and user dashboard routes
 */

const express       = require('express');
const router        = express.Router();
const dashCtrl      = require('../controllers/dashboardController');
const { requireLogin } = require('../middleware/authMiddleware');

// GET / — public landing page
router.get('/', dashCtrl.getHome);

// GET /dashboard — requires login
router.get('/dashboard', requireLogin, dashCtrl.getDashboard);

module.exports = router;
