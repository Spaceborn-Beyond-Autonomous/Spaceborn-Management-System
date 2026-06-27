const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
  getHourBreaks, 
  applyBreak, 
  updateBreakStatus, 
  deleteBreak,
  getMyBreaks 
} = require('../controllers/hourBreakController');

// Get all hour breaks (All roles)
router.get('/', protect, getHourBreaks);

// Get my breaks
router.get('/my/:userId', protect, getMyBreaks);

// Apply for hour break (All roles)
router.post('/apply', protect, applyBreak);

// Update break status - approve/reject (enforced in controller based on requester role)
router.put('/:breakId/status', protect, updateBreakStatus);


// Delete break (All roles - own only)
router.delete('/:breakId', protect, deleteBreak);

module.exports = router;