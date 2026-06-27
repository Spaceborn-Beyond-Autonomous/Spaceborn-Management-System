const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  register,
  login,
  logout,
  getMe,
  requestPasswordReset,
  forgotPasswordImmediate,
  checkPendingPasswordReset,
  getPendingPasswordResetRequests,
  getPasswordResetStats,
  approvePasswordResetRequest,
  rejectPasswordResetRequest
} = require('../controllers/authController');

router.post('/register', protect, authorize('CEO', 'COO', 'Manager'), register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/verify', protect, getMe);

router.post('/request-password-reset', requestPasswordReset);
router.post('/forgot-password', requestPasswordReset);
router.post('/forgot-password/immediate', forgotPasswordImmediate);
router.get('/password-resets/check', checkPendingPasswordReset);
router.get('/password-resets/pending', protect, authorize('CEO', 'COO', 'Manager'), getPendingPasswordResetRequests);
router.get('/password-resets/stats', protect, authorize('CEO', 'COO', 'Manager'), getPasswordResetStats);
router.put('/password-resets/:id/approve', protect, authorize('CEO', 'COO', 'Manager'), approvePasswordResetRequest);
router.put('/password-resets/:id/reject', protect, authorize('CEO', 'COO', 'Manager'), rejectPasswordResetRequest);

module.exports = router;
