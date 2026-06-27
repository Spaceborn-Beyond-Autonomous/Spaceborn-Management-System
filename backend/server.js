const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

const app = require('./src/app');

// ===== TEST ROUTES (No Auth Required) =====

app.post('/api/test-register', async (req, res) => {

  try {
    const { email, password, name, role, department, employeeId } = req.body;
    const resourceRoutes = require('./src/routes/resourceRoutes');
    // Use existing User model
    const User = require('./src/models/User');
    
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;
    
    const user = await User.create({
      employeeId,
      password,
      firstName,
      lastName,
      email,
      role: role || 'Member',
      department: department || 'Core Systems'
    });
    
    res.json({ success: true, message: 'User created!', userId: user.employeeId });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/test-login', async (req, res) => {
  try {
    const { employeeId, password } = req.body;
    
    const User = require('./src/models/User');
    
    const user = await User.findOne({ employeeId: employeeId.toUpperCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Wrong password' });
    }
    
    const token = user.getSignedJwtToken();
    const safeUser = {
      id: user._id,
      employeeId: user.employeeId,
      name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone,
      joinDate: user.joinDate,
      designation: user.designation,
      team: user.team,
      manager: user.manager
    };
    
    res.json({
      success: true,
      token,
      user: safeUser,
      data: { token, user: safeUser },
      name: safeUser.name,
      role: safeUser.role,
      employeeId: safeUser.employeeId
    });
  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
});
const reportRoutes = require('./src/routes/reports');
// Uncomment ONE at a time:
const resourceRoutes = require('./src/routes/resourceRoutes');
app.use('/api/auth', require('./src/routes/authRoutes'));        // Line A
app.use('/api/users', require('./src/routes/userRoutes'));       // Line B
app.use('/api/accounts', require('./src/routes/accountRoutes')); // Line C
app.use('/api/attendance', require('./src/routes/attendanceRoutes')); // Line D
// NOTE: taskRoutes is now mounted from backend/src/app.js
app.use('/api/leaves', require('./src/routes/leaveRoutes'));     // Line F
app.use('/api/holidays', require('./src/routes/holidayRoutes')); // Line G
app.use('/api/hour-breaks', require('./src/routes/hourBreakRoutes')); // Line H
//app.use('/api/notifications', require('./src/routes/notificationRoutes')); // Line I
//app.use('/api/departments', require('./src/routes/departmentRoutes')); // Line J
//app.use('/api/teams', require('./src/routes/teamRoutes'));       // Line K
//app.use('/api/performance', require('./src/routes/performanceRoutes')); // Line L
// NOTE: teamMembersRoutes is now mounted from backend/src/app.js
app.use('/api/meetings', require('./src/routes/meetingRoutes'));  // Line M

app.use('/api/resources', resourceRoutes);
const { protect, authorize } = require('./src/middleware/authMiddleware');
app.get('/api/test-reports', (req, res) => {
  res.json({ success: true, message: 'Reports route working' });
});
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Space Born API Running' });
});
// TEMP TEST
app.get('/api/test', (req, res) => {
  res.json({ ok: true });
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
