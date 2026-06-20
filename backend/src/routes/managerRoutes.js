const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getManagerDepartmentProgress,
  getManagerUpcomingMeetings,
  getManagerResourceRequests,
  getManagerActionItems,
  getManagerRecentActivity,
} = require('../controllers/dashboardController');

router.use(protect, authorize('CEO', 'COO', 'Manager'));

router.get('/department-progress', getManagerDepartmentProgress);
router.get('/upcoming-meetings', getManagerUpcomingMeetings);
router.get('/resource-requests', getManagerResourceRequests);
router.get('/action-items', getManagerActionItems);
router.get('/recent-activity', getManagerRecentActivity);

module.exports = router;
