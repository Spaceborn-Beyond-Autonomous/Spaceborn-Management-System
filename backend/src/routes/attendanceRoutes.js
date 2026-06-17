// src/routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  autoMarkAttendance, 
  getAttendance, 
  getStats, 
  getDepartmentStats, 
  markAttendance,
  markLeaveAbsent,
  getRosterAttendance
} = require('../controllers/attendanceController');

// Auto-mark on login (called from frontend on successful login)
router.post('/auto-mark', autoMarkAttendance);

// Get attendance records
router.get('/', protect, getAttendance);

// Get stats
router.get('/stats', protect, getStats);

// Get department stats
router.get('/by-department', protect, getDepartmentStats);

// Mark attendance manually
router.post('/mark', protect, markAttendance);

// Mark leave as absent
router.post('/mark-leave-absent', protect, markLeaveAbsent);

// Roster attendance for CEO/Manager (computed: absent if not logged in, on-leave if approved leave)
router.get('/roster', protect, getRosterAttendance);


module.exports = router;