const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const [userDepartments, taskDepartments] = await Promise.all([
      User.distinct('department', req.user.role === 'Manager' ? { department: req.user.department } : {}),
      Task.distinct('department', req.user.role === 'Manager' ? { department: req.user.department } : {})
    ]);

    const departments = [...new Set([...userDepartments, ...taskDepartments])]
      .filter(Boolean)
      .sort();

    res.json(departments);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch departments' });
  }
});

module.exports = router;
