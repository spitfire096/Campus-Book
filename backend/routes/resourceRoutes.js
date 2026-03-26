/**
 * routes/resourceRoutes.js
 * Public resource browsing routes (search + filter)
 */

const express      = require('express');
const router       = express.Router();
const resourceCtrl = require('../controllers/resourceController');

// GET /resources — list/search/filter all resources (public)
router.get('/', resourceCtrl.getResources);

// GET /resources/:id — view single resource detail (public)
router.get('/:id', resourceCtrl.getResource);

module.exports = router;
