const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { formatResponse } = require('../utils/helpers');

// Get all accounts
router.get('/all', protect, authorize('CEO', 'COO', 'Manager'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(formatResponse(true, 'Accounts fetched', users));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
});

// Get account stats
router.get('/stats', protect, authorize('CEO', 'COO', 'Manager'), async (req, res) => {
  try {
    const total = await User.countDocuments();
    const byRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    res.json(formatResponse(true, 'Stats fetched', { totalCreated: total, byRole: Object.fromEntries(byRole.map(r => [r._id, r.count])) }));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
});

module.exports = router;
