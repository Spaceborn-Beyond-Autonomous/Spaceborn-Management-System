const express = require('express');
const router = express.Router();

const Roadmap = require('../models/Roadmap');
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware');

const initials = (name = 'U') => name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

const toDto = (roadmap) => ({
  id: String(roadmap._id),
  _id: roadmap._id,
  title: roadmap.title,
  version: roadmap.version,
  description: roadmap.description,
  department: roadmap.department,
  startDate: roadmap.startDate,
  targetDate: roadmap.targetDate,
  lastUpdated: roadmap.updatedAt,
  status: roadmap.status,
  sharedWith: roadmap.sharedWith || [],
  sharedAt: roadmap.sharedAt,
  sharedBy: roadmap.sharedBy,
  overallProgress: roadmap.overallProgress || 0,
  milestones: roadmap.milestones || [],
  features: roadmap.features || [],
  risks: roadmap.risks || [],
  weeklyUpdates: roadmap.weeklyUpdates || [],
  attachments: roadmap.attachments || [],
  blockers: roadmap.blockers || [],
  createdAt: roadmap.createdAt
});

const defaultRoadmapForDepartment = async (department, user) => {
  const tasks = await Task.find({ department }).lean();
  const completed = tasks.filter((task) => task.status === 'Completed').length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const today = new Date();
  const target = new Date();
  target.setMonth(target.getMonth() + 3);

  return {
    id: `default-${department}`,
    title: `${department || 'Team'} MVP Roadmap`,
    version: '1.0',
    description: `Delivery roadmap generated from ${department || 'team'} task progress.`,
    department,
    startDate: today.toISOString().split('T')[0],
    targetDate: target.toISOString().split('T')[0],
    lastUpdated: new Date().toISOString(),
    status: 'active',
    sharedWith: ['CEO', 'Manager'],
    sharedAt: new Date().toISOString(),
    sharedBy: {
      id: String(user._id),
      name: user.name,
      role: user.role,
      email: user.email,
      avatar: initials(user.name)
    },
    overallProgress: progress,
    milestones: [
      { id: 1, title: 'Foundation', dueDate: today.toISOString().split('T')[0], status: 'completed', description: 'Core setup and planning', progress: 100 },
      { id: 2, title: 'Delivery Execution', dueDate: target.toISOString().split('T')[0], status: progress >= 100 ? 'completed' : 'in-progress', description: 'Complete assigned task delivery', progress }
    ],
    features: tasks.slice(0, 6).map((task, index) => ({
      id: index + 1,
      name: task.title,
      priority: task.priority || 'medium',
      status: task.status === 'Completed' ? 'completed' : 'in-progress'
    })),
    risks: tasks.filter((task) => task.status === 'Overdue').slice(0, 3).map((task, index) => ({
      id: index + 1,
      description: task.title,
      impact: 'high',
      mitigation: 'Review blocker and reassign if needed',
      status: 'monitoring',
      owner: task.assignedToName || 'Team'
    })),
    weeklyUpdates: [],
    attachments: []
  };
};

router.use(protect);

router.get('/shared', async (req, res) => {
  try {
    const department = req.query.department || req.user.department || '';
    let roadmaps = await Roadmap.find({
      ...(department ? { department } : {}),
      status: { $in: ['shared', 'active'] }
    }).sort({ updatedAt: -1 });

    if (roadmaps.length === 0) {
      return res.json([await defaultRoadmapForDepartment(department, req.user)]);
    }

    res.json(roadmaps.map(toDto));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch roadmaps' });
  }
});

router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.department) query.department = req.query.department;
    if (req.query.status) query.status = req.query.status;

    const roadmaps = await Roadmap.find(query).sort({ updatedAt: -1 });
    if (roadmaps.length === 0 && req.query.department) {
      return res.json({ success: true, data: [await defaultRoadmapForDepartment(req.query.department, req.user)] });
    }

    res.json({ success: true, data: roadmaps.map(toDto) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch roadmaps' });
  }
});

router.post('/', async (req, res) => {
  try {
    const roadmap = await Roadmap.create({
      ...req.body,
      department: req.body.department || req.user.department || 'Engineering',
      sharedBy: {
        id: String(req.user._id),
        name: req.user.name,
        role: req.user.role,
        email: req.user.email,
        avatar: initials(req.user.name)
      },
      createdBy: req.user._id
    });
    res.status(201).json({ success: true, data: toDto(roadmap) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create roadmap' });
  }
});

router.post('/:id/share', async (req, res) => {
  try {
    const roadmap = await Roadmap.findByIdAndUpdate(
      req.params.id,
      { status: 'shared', sharedWith: ['CEO', 'Manager'], sharedAt: new Date() },
      { new: true }
    );
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });
    res.json({ success: true, data: toDto(roadmap) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to share roadmap' });
  }
});

module.exports = router;
