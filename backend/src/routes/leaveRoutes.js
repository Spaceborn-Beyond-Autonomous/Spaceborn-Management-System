const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
  applyLeave, 
  getAllLeaves, 
  getMyLeaves, 
  updateLeaveStatus, 
  getLeaveBalance, 
  getPendingLeaves,
  cancelLeave 
} = require('../controllers/leaveController');

// Apply for leave (All roles)
router.post('/apply', protect, applyLeave);

// Get my leaves
router.get('/my/:userId', protect, getMyLeaves);

// Get all leaves (CEO, Manager)
router.get('/all', protect, authorize('CEO', 'COO', 'Manager'), getAllLeaves);

// Get pending leaves for approval (CEO, Manager)
router.get('/pending', protect, authorize('CEO', 'COO', 'Manager'), getPendingLeaves);

// Get leave balance
router.get('/balance/:userId', protect, getLeaveBalance);

// Approve/Reject leave (CEO, Manager)
router.put('/:leaveId/status', protect, authorize('CEO', 'COO', 'Manager'), updateLeaveStatus);

// Cancel leave (User own)
router.put('/:leaveId/cancel', protect, cancelLeave);

module.exports = router;
