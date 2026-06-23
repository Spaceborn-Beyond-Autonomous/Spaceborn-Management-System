const express = require('express');
const router = express.Router();

const Task = require('../models/Task');
const ResourceRequest = require('../models/ResourceRequest');
const { protect, authorize } = require('../middleware/authMiddleware');

const isOverdue = (task) => {
  if (!task.dueDate || task.status === 'Completed') return false;
  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) return false;
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
};

router.get('/', protect, authorize('CEO', 'COO', 'Manager'), async (req, res) => {
  try {
    const { severity, status } = req.query;
    const departmentFilter = (req.user.role === 'Manager' || req.user.role === 'COO') ? { department: req.user.department } : {};
    const [tasks, requests] = await Promise.all([
      Task.find(departmentFilter).lean(),
      ResourceRequest.find(departmentFilter).lean()
    ]);

    const overdueByDepartment = new Map();
    tasks.filter(isOverdue).forEach((task) => {
      const department = task.department || 'General';
      overdueByDepartment.set(department, (overdueByDepartment.get(department) || 0) + 1);
    });

    let risks = [...overdueByDepartment.entries()].map(([department, count], index) => ({
      id: `overdue-${department}`,
      title: `${department} delivery deadlines slipping`,
      severity: count >= 3 ? 'high' : count === 2 ? 'medium' : 'low',
      probability: Math.min(95, 45 + count * 15),
      impact: `${count} overdue task${count === 1 ? '' : 's'} may affect delivery`,
      mitigation: 'Review blockers, rebalance ownership, and reset delivery dates.',
      trend: count >= 2 ? 'increasing' : 'stable',
      status: 'active',
      owner: `${department} Department`,
      mitigationStatus: 'in-progress',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      riskScore: Math.min(100, 40 + count * 15)
    }));

    const pendingRequests = requests.filter((request) => request.status === 'pending');
    if (pendingRequests.length > 0) {
      risks.push({
        id: 'resource-approvals',
        title: 'Pending resource approvals',
        severity: pendingRequests.length >= 5 ? 'high' : pendingRequests.length >= 2 ? 'medium' : 'low',
        probability: Math.min(90, 35 + pendingRequests.length * 10),
        impact: 'Team execution may slow down while resource requests wait.',
        mitigation: 'Prioritize high-impact resource requests and clear stale approvals.',
        trend: 'stable',
        status: 'monitoring',
        owner: (req.user.role === 'Manager' || req.user.role === 'COO') ? req.user.department : 'Platform and DevOps',
        mitigationStatus: 'planned',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        riskScore: Math.min(100, 30 + pendingRequests.length * 10)
      });
    }

    if (risks.length === 0) {
      risks = [{
        id: 'healthy-delivery',
        title: 'No material delivery risks detected',
        severity: 'low',
        probability: 15,
        impact: 'No immediate impact.',
        mitigation: 'Continue weekly monitoring.',
        trend: 'decreasing',
        status: 'monitoring',
        owner: 'Leadership',
        mitigationStatus: 'completed',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        riskScore: 15
      }];
    }

    if (severity && severity !== 'all') risks = risks.filter((risk) => risk.severity === severity);
    if (status && status !== 'all') risks = risks.filter((risk) => risk.status === status);

    res.json({ success: true, risks, data: risks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch risks' });
  }
});

module.exports = router;
