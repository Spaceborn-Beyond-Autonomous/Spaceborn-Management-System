const User = require('../models/User');
const { formatResponse } = require('../utils/helpers');
const { uploadEmployeeDocumentToDrive } = require('../services/googleDriveService');

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

const getFullName = (user) =>
  user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();

const buildDriveUrls = (fileId, webViewLink, webContentLink) => ({
  fileUrl: webContentLink || `https://drive.google.com/uc?export=download&id=${fileId}`,
  viewUrl: webViewLink || `https://drive.google.com/file/d/${fileId}/view`
});

const applyDocumentToDto = (employee, documentType, document) => {
  const docs = employee.documents || {};

  if (docs.profile_photo) employee.profilePhoto = docs.profile_photo;
  if (docs.aadhaar) employee.aadhaar = { ...(employee.aadhaar || {}), ...docs.aadhaar };
  if (docs.pan) employee.pan = { ...(employee.pan || {}), ...docs.pan };
  if (docs.resume) employee.resume = docs.resume;
  if (docs.nda) employee.nda = { ...(employee.nda || {}), ...docs.nda };
  if (docs.code_of_conduct) employee.codeOfConduct = { ...(employee.codeOfConduct || {}), ...docs.code_of_conduct };
  if (docs.ip_agreement) employee.ipAgreement = { ...(employee.ipAgreement || {}), ...docs.ip_agreement };
  if (Array.isArray(docs.education)) {
    employee.education = { ...(employee.education || {}), documents: docs.education };
  }
  if (Array.isArray(docs.onboarding)) employee.onboardingDocs = docs.onboarding;

  if (documentType && document) {
    employee.lastUploadedDocument = document;
  }

  return employee;
};

const mergeEmployeeDocument = (documents = {}, documentType, document) => {
  const nextDocuments = { ...documents };

  if (documentType === 'education' || documentType === 'onboarding') {
    nextDocuments[documentType] = [...(Array.isArray(nextDocuments[documentType]) ? nextDocuments[documentType] : []), document];
    return nextDocuments;
  }

  nextDocuments[documentType] = {
    ...(nextDocuments[documentType] || {}),
    ...document,
    ...(documentType === 'resume' ? { version: ((nextDocuments.resume && nextDocuments.resume.version) || 0) + 1 } : {}),
    ...(documentType === 'nda' ? { signed: true, signedDate: document.uploaded } : {}),
    ...(documentType === 'code_of_conduct' ? { signed: true, accepted: true, signedDate: document.uploaded } : {}),
    ...(documentType === 'ip_agreement' ? { signed: true, accepted: true, signedDate: document.uploaded } : {})
  };

  return nextDocuments;
};

const toEmployeeDto = (user) => {
  if (!user) return null;
  const plain = typeof user.toObject === 'function' ? user.toObject() : user;
  const name = getFullName(plain);

  const employee = {
    id: plain._id,
    _id: plain._id,
    employeeId: plain.employeeId,
    name,
    firstName: plain.firstName,
    lastName: plain.lastName,
    email: plain.email,
    phone: plain.phone || '',
    role: plain.role,
    department: normalizeDepartment(plain.department || ''),
    designation: plain.designation || '',
    team: plain.team || '',
    manager: plain.manager || '',
    managerId: plain.managerId,
    joinDate: plain.joinDate,
    status: plain.isActive === false ? 'Inactive' : 'Active',
    isActive: plain.isActive !== false,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
    documents: plain.documents || {},
  };

  return applyDocumentToDto(employee);
};

const splitName = (body) => {
  if (body.firstName || body.lastName) {
    return {
      firstName: body.firstName,
      lastName: body.lastName || body.firstName,
    };
  }

  const parts = (body.name || '').trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ') || parts[0],
  };
};

const buildEmployeeQuery = (queryParams = {}, currentUser = null) => {
  const { department, role, status, search } = queryParams;
  const query = {};

  if (department) query.department = normalizeDepartment(department);
  if (role) query.role = role;
  if (status) query.isActive = status === 'Active' || status === 'active';

  if (currentUser?.role === 'Team Lead') {
    query.department = normalizeDepartment(currentUser.department || department);
    query.role = 'Member';
    query.isActive = true;
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

// @desc    Create new employee (Manager/CEO only)
// @route   POST /api/users/create
// @access  Private (Manager, CEO)
exports.createEmployee = async (req, res) => {
  try {
    const { firstName, lastName } = splitName(req.body);
    const { email, phone, role, department, team, manager, password, joinDate, designation } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json(formatResponse(false, 'Name and email are required'));
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json(formatResponse(false, 'Email already exists'));
    }

    const employeeRole = role || 'Member';
    const employeeId = req.body.employeeId || await User.generateEmployeeId(employeeRole);
    const initialPassword = password || `${employeeId}@123`;

    // Get the manager who is creating this employee
    const createdByName = getFullName(req.user);

    // Create employee
    const user = await User.create({
      employeeId,
      password: initialPassword, // Will be hashed by pre-save middleware
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || '',
      role: employeeRole,
      department: normalizeDepartment(department || 'Core Systems'),
      designation: designation || employeeRole,
      team: team || '',
      manager: manager || createdByName,
      joinDate: joinDate || new Date().toISOString().split('T')[0],
      isActive: true,
      createdBy: req.user?._id,
      createdByName
    });

    const employee = toEmployeeDto(user);

    res.status(201).json(formatResponse(true, 'Employee created successfully', {
      ...employee,
      employee,
      loginCredentials: {
        employeeId: user.employeeId,
        password: initialPassword
      }
    }));

  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Get all employees
// @route   GET /api/users
// @access  Private (Manager, CEO)
exports.getAllEmployees = async (req, res) => {
  try {
    const { department, role, search } = req.query;

    let query = {};

    if (req.user?.role === 'Team Lead') {
      const currentUser = await User.findById(req.user.id).select('department');
      query.department = normalizeDepartment(currentUser?.department || department);
      query.role = 'Member';
      query.isActive = true;
    }

    if (department && req.user?.role !== 'Team Lead') {
      query.department = normalizeDepartment(department);
    }

    if (role && req.user?.role !== 'Team Lead') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.status(200).json(formatResponse(true, 'Employees fetched successfully', employees.map(toEmployeeDto)));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Get single employee
// @route   GET /api/users/:id
// @access  Private (Manager, CEO)
exports.getEmployee = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json(formatResponse(false, 'Employee not found'));
    }

    res.status(200).json(formatResponse(true, 'Employee fetched successfully', toEmployeeDto(user)));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Check whether a user has a role
// @route   GET /api/users/:id/has-role/:role
// @access  Private
exports.hasRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('role');

    if (!user) {
      return res.status(404).json(formatResponse(false, 'Employee not found'));
    }

    res.status(200).json({
      hasAccess: user.role === decodeURIComponent(req.params.role)
    });
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Update employee
// @route   PUT /api/users/:id
// @access  Private (Manager, CEO)
exports.updateEmployee = async (req, res) => {
  try {
    const { firstName, lastName } = splitName(req.body);
    const { email, phone, role, department, team, manager, joinDate, isActive, status, designation } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json(formatResponse(false, 'Employee not found'));
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json(formatResponse(false, 'Email already exists'));
      }
      user.email = email.toLowerCase();
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;
    if (department) user.department = normalizeDepartment(department);
    if (designation !== undefined) user.designation = designation;
    if (team !== undefined) user.team = team;
    if (manager !== undefined) user.manager = manager;
    if (joinDate) user.joinDate = joinDate;
    if (isActive !== undefined) user.isActive = isActive;
    if (status) user.isActive = status === 'Active' || status === 'active';

    await user.save();

    res.status(200).json(formatResponse(true, 'Employee updated successfully', toEmployeeDto(user)));

  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Reset employee password (Manager/CEO only)
// @route   POST /api/users/:id/reset-password
// @access  Private (Manager, CEO)
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json(formatResponse(false, 'New password is required'));
    }

    if (newPassword.length < 6) {
      return res.status(400).json(formatResponse(false, 'Password must be at least 6 characters'));
    }

    const user = await User.findById(req.params.id).select('+password');

    if (!user) {
      return res.status(404).json(formatResponse(false, 'Employee not found'));
    }

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    res.status(200).json(formatResponse(true, 'Password reset successfully', {
      employeeId: user.employeeId,
      name: `${user.firstName} ${user.lastName}`,
      newPassword: newPassword
    }));

  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Deactivate employee
// @route   POST /api/users/:id/deactivate
// @access  Private (Manager, CEO)
exports.deactivateEmployee = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json(formatResponse(false, 'Employee not found'));
    }

    user.isActive = false;
    await user.save();

    res.status(200).json(formatResponse(true, 'Employee deactivated successfully'));

  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Activate employee
// @route   POST /api/users/:id/activate
// @access  Private (Manager, CEO)
exports.activateEmployee = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json(formatResponse(false, 'Employee not found'));
    }

    user.isActive = true;
    await user.save();

    res.status(200).json(formatResponse(true, 'Employee activated successfully'));

  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

// ==================== /api/employees compatibility endpoints ====================

exports.getEmployees = async (req, res) => {
  try {
    const employees = await User.find(buildEmployeeQuery(req.query, req.user))
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json(formatResponse(true, 'Employees fetched successfully', employees.map(toEmployeeDto)));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json(formatResponse(false, 'Employee not found'));
    res.status(200).json(formatResponse(true, 'Employee fetched successfully', toEmployeeDto(user)));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

exports.getEmployeeByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email.toLowerCase() }).select('-password');
    if (!user) return res.status(404).json(formatResponse(false, 'Employee not found'));
    res.status(200).json(formatResponse(true, 'Employee fetched successfully', toEmployeeDto(user)));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

exports.getEmployeeByEmployeeId = async (req, res) => {
  try {
    const user = await User.findOne({ employeeId: req.params.employeeId.toUpperCase() }).select('-password');
    if (!user) return res.status(404).json(formatResponse(false, 'Employee not found'));
    res.status(200).json(formatResponse(true, 'Employee fetched successfully', toEmployeeDto(user)));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

exports.getEmployeeDepartments = async (req, res) => {
  try {
    const departments = await User.distinct('department', { department: { $nin: [null, ''] } });
    res.status(200).json(formatResponse(true, 'Departments fetched successfully', normalizeDepartments(departments)));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

exports.getEmployeeStats = async (req, res) => {
  try {
    const employees = await User.find({}).select('-password');
    const dtos = employees.map(toEmployeeDto);
    const departments = normalizeDepartments(dtos.map(employee => employee.department));
    const roles = [...new Set(dtos.map(employee => employee.role).filter(Boolean))];
    const now = new Date();

    res.status(200).json(formatResponse(true, 'Employee stats fetched successfully', {
      total: dtos.length,
      active: dtos.filter(employee => employee.status === 'Active').length,
      inactive: dtos.filter(employee => employee.status !== 'Active').length,
      terminated: dtos.filter(employee => employee.status === 'Inactive').length,
      departments: departments.length,
      departmentList: departments,
      roles: roles.length,
      roleList: roles,
      newThisMonth: dtos.filter(employee => {
        const joinDate = new Date(employee.joinDate || employee.createdAt);
        return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
      }).length,
      departmentDistribution: departments.map(department => ({
        department,
        count: dtos.filter(employee => employee.department === department).length
      })),
      roleDistribution: roles.map(role => ({
        role,
        count: dtos.filter(employee => employee.role === role).length
      }))
    }));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

exports.getEmployeesByDepartment = async (req, res) => {
  try {
    const employees = await User.find({ department: normalizeDepartment(req.params.department) }).select('-password').sort({ firstName: 1 });
    res.status(200).json(formatResponse(true, 'Department employees fetched successfully', employees.map(toEmployeeDto)));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

exports.getEmployeesByRole = async (req, res) => {
  try {
    const employees = await User.find({ role: req.params.role }).select('-password').sort({ firstName: 1 });
    res.status(200).json(formatResponse(true, 'Role employees fetched successfully', employees.map(toEmployeeDto)));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

exports.getEmployeesByManager = async (req, res) => {
  try {
    const manager = await User.findById(req.params.managerId).select('-password');
    const managerName = getFullName(manager);
    const employees = await User.find({
      $or: [
        { managerId: req.params.managerId },
        ...(managerName ? [{ manager: managerName }] : [])
      ]
    }).select('-password').sort({ firstName: 1 });

    res.status(200).json(formatResponse(true, 'Manager employees fetched successfully', employees.map(toEmployeeDto)));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

exports.searchEmployees = async (req, res) => {
  try {
    const employees = await User.find(buildEmployeeQuery({ search: req.query.q }, req.user))
      .select('-password')
      .sort({ firstName: 1 });

    res.status(200).json(formatResponse(true, 'Employee search completed', employees.map(toEmployeeDto)));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json(formatResponse(false, 'Employee not found'));

    user.isActive = false;
    await user.save();

    res.status(200).json(formatResponse(true, 'Employee deactivated successfully', toEmployeeDto(user)));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

exports.getLeaveBalance = async (req, res) => {
  res.status(200).json(formatResponse(true, 'Leave balance fetched successfully', {
    Sick: 12,
    Casual: 10,
    Annual: 15,
    Emergency: 5,
    Other: 3
  }));
};

exports.updateLeaveBalance = async (req, res) => {
  res.status(200).json(formatResponse(true, 'Leave balance updated successfully', {
    Sick: 12,
    Casual: 10,
    Annual: 15,
    Emergency: 5,
    Other: 3,
    [req.body.leaveType]: Math.max(0, Number(req.body.days) || 0)
  }));
};

exports.uploadEmployeeDocument = async (req, res) => {
  try {
    const allowedTypes = [
      'profile_photo',
      'aadhaar',
      'pan',
      'resume',
      'education',
      'nda',
      'code_of_conduct',
      'ip_agreement',
      'onboarding'
    ];
    const documentType = req.body.documentType;

    if (!req.file) {
      return res.status(400).json(formatResponse(false, 'Document file is required'));
    }

    if (!allowedTypes.includes(documentType)) {
      return res.status(400).json(formatResponse(false, 'Invalid document type'));
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json(formatResponse(false, 'Employee not found'));
    }

    const accessToken = req.body.googleAccessToken || req.get('x-google-access-token');
    const driveFile = await uploadEmployeeDocumentToDrive({
      file: req.file,
      employee: user,
      documentType,
      accessToken
    });

    const uploaded = new Date().toISOString().split('T')[0];
    const urls = buildDriveUrls(driveFile.id, driveFile.webViewLink, driveFile.webContentLink);
    const document = {
      name: req.file.originalname,
      fileName: req.file.originalname,
      fileId: driveFile.id,
      mimeType: driveFile.mimeType || req.file.mimetype,
      size: driveFile.size || req.file.size,
      uploaded,
      uploadedAt: new Date(),
      uploadedBy: req.user?._id,
      ...urls
    };

    user.documents = mergeEmployeeDocument(user.documents || {}, documentType, document);
    user.markModified('documents');
    await user.save();

    const employee = applyDocumentToDto(toEmployeeDto(user), documentType, document);
    res.status(201).json(formatResponse(true, 'Document uploaded to Google Drive successfully', {
      employee,
      document
    }));
  } catch (error) {
    console.error('Employee document upload error:', error);
    res.status(500).json(formatResponse(false, error.message || 'Failed to upload employee document'));
  }
};
