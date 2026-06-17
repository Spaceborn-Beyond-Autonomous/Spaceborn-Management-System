const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getCeoDashboard,
  getManagerDashboard,
  getTeamLeadDashboard,
  getMemberDashboard,
  getDashboardStats,
} = require('../controllers/dashboardController');

router.get('/ceo', protect, authorize('CEO'), getCeoDashboard);
router.get('/manager', protect, authorize('CEO', 'Manager'), getManagerDashboard);
router.get('/team-lead', protect, authorize('CEO', 'Manager', 'Team Lead'), getTeamLeadDashboard);
router.get('/member', protect, authorize('CEO', 'Manager', 'Team Lead', 'Member'), getMemberDashboard);
router.get('/stats', protect, getDashboardStats);

module.exports = router;
