const express = require('express');
const router = express.Router();

const User = require('../models/User');
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

const normalizeDepartments = (departments) => {
  const normalized = departments.map(normalizeDepartment).filter(Boolean);
  return DEPARTMENTS
    .concat(normalized.filter((department) => !DEPARTMENTS.includes(department)))
    .filter((department, index, list) => list.indexOf(department) === index);
};

const getUserName = (user) =>
  user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

const getInitials = (name) =>
  (name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0])
    .join('')
    .toUpperCase();

const toEmployeeDto = (u) => {
  const name = getUserName(u);

  return {
    id: u._id,
    _id: u._id,
    employeeId: u.employeeId,
    name,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    department: normalizeDepartment(u.department),
    designation: u.designation || u.role,
    team: u.team || '',
    manager: u.manager || '',
    managerId: u.managerId,
    email: u.email,
    phone: u.phone || '',
    joinDate: u.joinDate || u.createdAt,
    status: u.isActive === false ? 'Inactive' : 'Active',
    employmentStatus: u.isActive === false ? 'terminated' : 'active',
    initials: getInitials(name)
  };
};

const buildEmployeeQuery = (req) => {
  const { department, role, status, search } = req.query;
  const query = {};

  if (req.user?.role === 'Member') {
    query._id = req.user._id;
  } else if (req.user?.role === 'Team Lead') {
    query.department = req.user.department;
    query.role = 'Member';
    query.isActive = true;
  } else {
    if (department && department !== 'All' && department !== 'all') query.department = normalizeDepartment(department);
    if (role && role !== 'All' && role !== 'all') query.role = role;
  }

  if (status && status !== 'All' && status !== 'all') {
    if (['Inactive', 'Terminated', 'terminated'].includes(status)) query.isActive = false;
    if (['Active', 'active'].includes(status)) query.isActive = true;
  }

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { fullName: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  return query;
};

const splitName = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || parts[0] || ''
  };
};

// GET /api/employees
router.get('/employees', protect, async (req, res) => {
  try {
    const employees = await User.find(buildEmployeeQuery(req))
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: employees.length,
      data: employees.map(toEmployeeDto)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/employees/departments
router.get('/employees/departments', protect, async (req, res) => {
  try {
    const query = req.user?.role === 'Team Lead'
      ? { department: req.user.department, role: 'Member', isActive: true }
      : {};
    const departments = await User.distinct('department', query);
    res.json({
      success: true,
      data: normalizeDepartments(departments)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/employees/stats
router.get('/employees/stats', protect, async (req, res) => {
  try {
    const employees = await User.find(buildEmployeeQuery(req)).select('-password');
    const departments = normalizeDepartments(employees.map((u) => u.department));
    const roles = [...new Set(employees.map((u) => u.role).filter(Boolean))];
    const now = new Date();

    res.json({
      success: true,
      data: {
        total: employees.length,
        active: employees.filter((u) => u.isActive !== false).length,
        inactive: employees.filter((u) => u.isActive === false).length,
        departments: departments.length,
        departmentList: departments,
        roles: roles.length,
        roleList: roles,
        newThisMonth: employees.filter((u) => {
          const joinDate = new Date(u.joinDate || u.createdAt);
          return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
        }).length,
        roleDistribution: roles.map((role) => ({
          role,
          count: employees.filter((u) => u.role === role).length
        })),
        departmentDistribution: departments.map((department) => ({
          department,
          count: employees.filter((u) => u.department === department).length
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/employees/role/:role
router.get('/employees/role/:role', protect, async (req, res) => {
  try {
    const employees = await User.find({ role: req.params.role, isActive: true }).select('-password');
    res.json({ success: true, data: employees.map(toEmployeeDto) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/employees/manager/:managerId
router.get('/employees/manager/:managerId', protect, async (req, res) => {
  try {
    const employees = await User.find({ managerId: req.params.managerId, isActive: true }).select('-password');
    res.json({ success: true, data: employees.map(toEmployeeDto) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/employees/:id
router.get('/employees/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, data: toEmployeeDto(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/employees
router.post('/employees', protect, async (req, res) => {
  try {
    const nameParts = splitName(req.body.name);
    const firstName = req.body.firstName || nameParts.firstName;
    const lastName = req.body.lastName || nameParts.lastName;

    if (!firstName || !lastName || !req.body.email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const role = req.body.role || 'Member';
    const employeeId = req.body.employeeId || await User.generateEmployeeId(role);
    const password = req.body.password || `${firstName}@123`;

    const user = await User.create({
      employeeId,
      password,
      firstName,
      lastName,
      email: req.body.email.toLowerCase(),
      phone: req.body.phone || '',
      role,
      department: req.body.department || req.user.department || 'Core Systems',
      designation: req.body.designation || role,
      team: req.body.team || '',
      manager: req.body.manager || req.user.name || '',
      managerId: req.body.managerId || req.user._id,
      joinDate: req.body.joinDate || new Date().toISOString().split('T')[0],
      isActive: req.body.status !== 'Terminated',
      createdBy: req.user._id,
      createdByName: req.user.name
    });

    res.status(201).json({ success: true, data: toEmployeeDto(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/employees/:id
router.put('/employees/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Employee not found' });

    const nameParts = splitName(req.body.name);
    if (req.body.firstName || nameParts.firstName) user.firstName = req.body.firstName || nameParts.firstName;
    if (req.body.lastName || nameParts.lastName) user.lastName = req.body.lastName || nameParts.lastName;
    if (req.body.email) user.email = req.body.email.toLowerCase();
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.role) user.role = req.body.role;
    if (req.body.department) user.department = req.body.department;
    if (req.body.designation !== undefined) user.designation = req.body.designation;
    if (req.body.team !== undefined) user.team = req.body.team;
    if (req.body.manager !== undefined) user.manager = req.body.manager;
    if (req.body.managerId !== undefined) user.managerId = req.body.managerId;
    if (req.body.joinDate !== undefined) user.joinDate = req.body.joinDate;
    if (req.body.status || req.body.employmentStatus) {
      user.isActive = !['Terminated', 'Inactive', 'terminated'].includes(req.body.status || req.body.employmentStatus);
    }

    await user.save();
    res.json({ success: true, data: toEmployeeDto(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/employees/:id
router.delete('/employees/:id', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, data: toEmployeeDto(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/team-members?department=...
router.get('/team-members', protect, async (req, res) => {
  try {
    const { department } = req.query;
    if (!department) {
      return res.status(400).json({ success: false, message: 'department is required' });
    }

    // Fetch employees in this department (CEO/Manager/Team Lead etc.)
    const employees = await User.find({ department, isActive: true }).select('-password');

    const normalized = employees.map((u) => ({
      id: u._id,
      name: u.fullName || [u.firstName, u.lastName].filter(Boolean).join(' ').trim(),
      role: u.role,
      department: u.department,
      email: u.email,
      initials: (u.fullName || `${u.firstName || ''} ${u.lastName || ''}`)
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((x) => x[0])
        .join('')
        .toUpperCase()
    }));

    res.json({ success: true, employees: normalized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/employees/department/:department
router.get('/employees/department/:department', protect, async (req, res) => {
  try {
    const { department } = req.params;
    if (!department) {
      return res.status(400).json({ success: false, message: 'department is required' });
    }

    const employees = await User.find({ department, isActive: true }).select('-password');

    const normalized = employees.map((u) => ({
      id: u._id,
      name: u.fullName || [u.firstName, u.lastName].filter(Boolean).join(' ').trim(),
      role: u.role,
      department: u.department,
      email: u.email,
      initials: (u.fullName || `${u.firstName || ''} ${u.lastName || ''}`)
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((x) => x[0])
        .join('')
        .toUpperCase()
    }));

    res.json({ success: true, employees: normalized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/team-members/all
// Returns all active employees for CEO/Manager dropdowns
router.get('/team-members/all', protect, async (req, res) => {
  try {
    const employees = await User.find({ isActive: true }).select('-password');

    const normalized = employees.map((u) => ({
      id: u._id,
      name: u.fullName || [u.firstName, u.lastName].filter(Boolean).join(' ').trim(),
      role: u.role,
      department: u.department,
      email: u.email,
      initials: (u.fullName || `${u.firstName || ''} ${u.lastName || ''}`)
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((x) => x[0])
        .join('')
        .toUpperCase()
    }));

    res.json({ success: true, employees: normalized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;


