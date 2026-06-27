// routes/reports.js
const express = require('express');
const router = express.Router();
const { 
  submitReport, 
  getTodayReport, 
  getUserReports, 
  getDepartmentReports, 
  getAllReports, 
  updateReport, 
  deleteReport,
  getComplianceReport 
} = require('../controllers/reportController');

// Public routes for testing (remove protect later)
// No auth middleware for testing
router.post('/', submitReport);
router.get('/user/:userId/today', getTodayReport);
router.get('/user/:userId', getUserReports);
router.get('/department/:department', getDepartmentReports);
router.get('/compliance', getComplianceReport);
router.get('/', getAllReports);
router.put('/:id', updateReport);
router.delete('/:id', deleteReport);

module.exports = router;