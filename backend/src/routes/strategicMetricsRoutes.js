const express = require('express');
const router = express.Router();

const Task = require('../models/Task');
const User = require('../models/User');
const Resource = require('../models/Resource');
const { protect, authorize } = require('../middleware/authMiddleware');

const metric = (id, icon, label, value, target, color, trend = 'up') => {
  const progress = target ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return {
    id,
    icon,
    label,
    value,
    target,
    color,
    trend,
    change: trend === 'down' ? '-3%' : '+8%',
    progress,
    status: progress >= 85 ? 'excellent' : progress >= 60 ? 'on-track' : 'at-risk'
  };
};

router.get('/', protect, authorize('CEO'), async (req, res) => {
  try {
    const [tasks, users, resources] = await Promise.all([
      Task.find({}).lean(),
      User.find({}).lean(),
      Resource.find({}).lean()
    ]);

    const activeUsers = users.filter((user) => user.isActive !== false).length;
    const completedTasks = tasks.filter((task) => task.status === 'Completed').length;
    const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
    const averageProgress = tasks.length
      ? Math.round(tasks.reduce((sum, task) => sum + (Number(task.progress) || 0), 0) / tasks.length)
      : 0;
    const resourceTotal = resources.reduce((sum, resource) => sum + (Number(resource.total) || 0), 0);
    const resourceAllocated = resources.reduce((sum, resource) => sum + (Number(resource.allocated) || 0), 0);
    const utilization = resourceTotal ? Math.round((resourceAllocated / resourceTotal) * 100) : 0;

    const metrics = [
      metric(1, 'Target', 'Task Completion Rate', completionRate, 90, 'green'),
      metric(2, 'TrendingUp', 'Average Delivery Progress', averageProgress, 85, 'blue'),
      metric(3, 'PieChart', 'Resource Utilization', utilization, 80, 'purple'),
      metric(4, 'Target', 'Active Workforce', activeUsers, Math.max(activeUsers, 1), 'orange'),
      metric(5, 'DollarSign', 'Operational Efficiency', Math.round((completionRate + utilization) / 2), 85, 'green'),
      metric(6, 'TrendingUp', 'Execution Capacity', Math.min(100, activeUsers * 10), 100, 'blue')
    ];

    const summary = {
      overallProgress: metrics.length ? Math.round(metrics.reduce((sum, item) => sum + item.progress, 0) / metrics.length) : 0,
      onTrackCount: metrics.filter((item) => item.status === 'on-track').length,
      atRiskCount: metrics.filter((item) => item.status === 'at-risk').length,
      excellentCount: metrics.filter((item) => item.status === 'excellent').length
    };

    res.json({ success: true, metrics, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch strategic metrics' });
  }
});

module.exports = router;
