const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

const app = require('./src/app');

// ===== TEST / DEV ROUTES =====

app.post('/api/test-register', async (req, res) => {
  try {
    const { email, password, name, role, department, employeeId } = req.body;
    const User = require('./src/models/User');
    
    const nameParts = (name || '').trim().split(' ');
    const firstName = nameParts[0] || 'User';
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
    
    const user = await User.findOne({ employeeId: (employeeId || '').toUpperCase() });
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Space Born API Running (PostgreSQL / PGlite)' });
});

app.get('/api/test', (req, res) => {
  res.json({ ok: true, engine: 'PostgreSQL' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
