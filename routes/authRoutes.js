/**
 * routes/authRoutes.js
 * Authentication routes: register, login, logout
 */

const express    = require('express');
const router     = express.Router();
const authCtrl   = require('../controllers/authController');
const { requireGuest } = require('../middleware/authMiddleware');

// GET  /auth/register — show register form (guests only)
router.get('/register', requireGuest, authCtrl.getRegister);

// POST /auth/register — handle registration submission
router.post('/register', requireGuest, authCtrl.postRegister);

// GET  /auth/login — show login form (guests only)
router.get('/login', requireGuest, authCtrl.getLogin);

// POST /auth/login — handle login submission
router.post('/login', requireGuest, authCtrl.postLogin);

// GET  /auth/logout — destroy session and redirect
router.get('/logout', authCtrl.logout);

module.exports = router;
