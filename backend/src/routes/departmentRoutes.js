const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware');

const DEPARTMENTS = [
  'Platform and DevOps',
  'Core Systems',
  'Hardware & Integration',
  'Robotics & Simulation',
  'Founding Team',
  'AI/LLM & Perception'
];

const DEPARTMENT_RENAMES = {
  Operations: 'Platform and DevOps',
  Engineering: 'Core Systems',
  Design: 'Hardware & Integration',
  Sales: 'Robotics & Simulation',
  HR: 'Robotics & Simulation',
  Finance: 'Robotics & Simulation',
  Executive: 'Founding Team',
  Marketing: 'AI/LLM & Perception'
};

const normalizeDepartment = (department) => DEPARTMENT_RENAMES[department] || department;

router.get('/', protect, async (req, res) => {
  try {
    const [userDepartments, taskDepartments] = await Promise.all([
      User.distinct('department', (req.user.role === 'Manager' || req.user.role === 'COO') ? { department: req.user.department } : {}),
      Task.distinct('department', (req.user.role === 'Manager' || req.user.role === 'COO') ? { department: req.user.department } : {})
    ]);

    const rawDepartments = [...userDepartments, ...taskDepartments].map(normalizeDepartment);
    const departments = DEPARTMENTS
      .concat(rawDepartments.filter((department) => department && !DEPARTMENTS.includes(department)))
      .filter(Boolean)
      .filter((department, index, list) => list.indexOf(department) === index);

    res.json(departments);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch departments' });
  }
});

module.exports = router;
