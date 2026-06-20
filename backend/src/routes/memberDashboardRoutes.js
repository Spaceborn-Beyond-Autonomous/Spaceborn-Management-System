const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getMemberProfile,
  getMemberSprintOverview,
  getMemberUpcomingDeadlines,
} = require('../controllers/dashboardController');

router.use(protect, authorize('CEO', 'COO', 'Manager', 'Team Lead', 'Member'));

router.get('/profile', getMemberProfile);
router.get('/sprint-overview', getMemberSprintOverview);
router.get('/upcoming-deadlines', getMemberUpcomingDeadlines);

module.exports = router;
