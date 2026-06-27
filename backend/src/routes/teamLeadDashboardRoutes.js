const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getTeamLeadProfile,
  getTeamLeadStats,
  submitTeamLeadDailyReport,
  getTeamLeadMembers,
  getTeamLeadPerformance,
} = require('../controllers/dashboardController');

router.use(protect, authorize('CEO', 'COO', 'Manager', 'Team Lead'));

router.get('/profile', getTeamLeadProfile);
router.get('/stats', getTeamLeadStats);
router.post('/daily-report', submitTeamLeadDailyReport);
router.get('/team-members', getTeamLeadMembers);
router.get('/performance', getTeamLeadPerformance);

module.exports = router;
