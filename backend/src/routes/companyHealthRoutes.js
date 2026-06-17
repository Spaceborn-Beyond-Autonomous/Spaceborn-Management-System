const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Task = require('../models/Task');
const Leave = require('../models/Leave');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('CEO'), async (req, res) => {
  try {
    const [users, tasks, leaves] = await Promise.all([
      User.find({}).lean(),
      Task.find({}).lean(),
      Leave.find({}).lean()
    ]);

    const activeUsers = users.filter((user) => user.isActive !== false);
    const completedTasks = tasks.filter((task) => task.status === 'Completed').length;
    const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
    const retentionRate = users.length ? Math.round((activeUsers.length / users.length) * 100) : 100;
    const absenteeism = activeUsers.length ? Math.round((leaves.filter((leave) => leave.status === 'Approved').length / activeUsers.length) * 10) / 10 : 0;
    const departments = [...new Set(activeUsers.map((user) => user.department).filter(Boolean))];
    const overallScore = Math.round((completionRate + retentionRate + Math.max(0, 100 - absenteeism * 10)) / 3);

    const metrics = [
      { label: 'Employee Satisfaction', value: Math.max(70, retentionRate - 5), change: '+3%', status: 'good', icon: 'Smile', color: 'green', description: 'Estimated from retention and activity' },
      { label: 'Delivery Health', value: completionRate, change: '+8%', status: completionRate >= 70 ? 'good' : 'warning', icon: 'Activity', color: completionRate >= 70 ? 'green' : 'yellow', description: 'Completed tasks across company' },
      { label: 'Retention Rate', value: retentionRate, change: '+2%', status: 'good', icon: 'Users', color: 'green', description: 'Active employees vs total accounts' },
      { label: 'Absenteeism Rate', value: absenteeism, change: '-0.5%', status: absenteeism <= 5 ? 'good' : 'warning', icon: 'Calendar', color: absenteeism <= 5 ? 'green' : 'yellow', description: 'Approved leave volume per active employee' },
      { label: 'Employee NPS', value: Math.max(60, overallScore - 8), change: '+5', status: overallScore >= 75 ? 'good' : 'warning', icon: 'TrendingUp', color: overallScore >= 75 ? 'green' : 'yellow', description: 'Operational health proxy' },
      { label: 'Execution Capacity', value: activeUsers.length, change: '+1', status: 'good', icon: 'Users', color: 'green', description: 'Active workforce count' }
    ];

    const departmentHealth = departments.map((department) => {
      const departmentTasks = tasks.filter((task) => task.department === department);
      const deptCompleted = departmentTasks.filter((task) => task.status === 'Completed').length;
      const score = departmentTasks.length ? Math.round((deptCompleted / departmentTasks.length) * 100) : overallScore;
      return {
        name: department,
        score,
        trend: score >= overallScore ? '+2%' : '-1%',
        status: score >= 85 ? 'excellent' : score >= 65 ? 'good' : 'warning'
      };
    });

    res.json({
      success: true,
      metrics,
      overallScore,
      healthStatus: overallScore >= 80 ? 'Healthy Organization' : overallScore >= 60 ? 'Stable Organization' : 'Needs Attention',
      departmentHealth,
      riskLevel: overallScore >= 80 ? 'Low Risk Level' : overallScore >= 60 ? 'Medium Risk Level' : 'High Risk Level',
      trend: overallScore >= 75 ? '+5%' : '-2%',
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch company health' });
  }
});

module.exports = router;
