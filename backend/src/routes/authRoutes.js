const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { register, login, logout, getMe } = require('../controllers/authController');

router.post('/register', protect, authorize('CEO', 'COO', 'Manager'), register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/verify', protect, getMe);

module.exports = router;
