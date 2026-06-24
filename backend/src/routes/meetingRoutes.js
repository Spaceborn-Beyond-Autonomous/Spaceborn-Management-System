const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createMeeting,
  getAllMeetings,
  getMyDepartmentMeetings,
  getMeeting,
  updateMeeting,
  deleteMeeting,
  addAttendee,
  syncTranscript
} = require('../controllers/meetingController');

// Create meeting - CEO, Manager, Team Lead
router.post('/', protect, authorize('CEO', 'COO', 'Manager', 'Team Lead'), createMeeting);

// Get all meetings - All roles
router.get('/', protect, getAllMeetings);

// Get meetings for my department - All roles
router.get('/my-department', protect, getMyDepartmentMeetings);

// Get single meeting - All roles
router.get('/:id', protect, getMeeting);

// Update meeting - Creator, CEO, Manager
router.put('/:id', protect, authorize('CEO', 'COO', 'Manager', 'Team Lead'), updateMeeting);

// Delete meeting - any authenticated user can delete
router.delete('/:id', protect, deleteMeeting);

// Join/attend meeting - All roles
router.post('/:id/attend', protect, addAttendee);

// Sync transcript and summarize - All roles
router.post('/:id/sync-transcript', protect, syncTranscript);

module.exports = router;
