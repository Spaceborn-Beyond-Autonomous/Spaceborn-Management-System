const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// API Route registrations
// ======================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/config', require('./routes/configRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api', require('./routes/teamMembersRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/manager', require('./routes/managerRoutes'));
app.use('/api/team-lead', require('./routes/teamLeadDashboardRoutes'));
app.use('/api/member', require('./routes/memberDashboardRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/risks', require('./routes/riskRoutes'));
app.use('/api/strategic-metrics', require('./routes/strategicMetricsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/company-health', require('./routes/companyHealthRoutes'));
app.use('/api/executive-decisions', require('./routes/executiveDecisionRoutes'));
app.use('/api/roadmaps', require('./routes/roadmapRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/holidays', require('./routes/holidayRoutes'));
app.use('/api/hour-breaks', require('./routes/hourBreakRoutes'));
app.use('/api/meetings', require('./routes/meetingRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/reports', require('./routes/reports'));

// ======================
// Health Check Route
// ======================
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Space Born API Running (PostgreSQL / PGlite)' });
});

// ======================
// Unified Frontend Serving (Approach A)
// ======================
const frontendBuildPath = path.resolve(__dirname, '../../frontend/build');

if (fs.existsSync(frontendBuildPath)) {
  console.log('📦 Serving compiled React frontend from:', frontendBuildPath);
  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'Space Born API Running (Frontend build not found)' });
  });
}

module.exports = app;
