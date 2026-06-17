const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
  getHolidays, 
  addHoliday, 
  updateHoliday, 
  deleteHoliday 
} = require('../controllers/holidayController');

// Get all holidays (All roles)
router.get('/', protect, getHolidays);

// Add holiday (CEO only)
router.post('/', protect, authorize('CEO'), addHoliday);

// Update holiday (CEO only)
router.put('/:holidayId', protect, authorize('CEO'), updateHoliday);

// Delete holiday (CEO only)
router.delete('/:holidayId', protect, authorize('CEO'), deleteHoliday);

module.exports = router;