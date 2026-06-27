const express = require('express');
const router = express.Router();

const Project = require('../models/Project');
const Task = require('../models/Task');
const { protect, authorize } = require('../middleware/authMiddleware');

const getId = (value) => String(value?._id || value?.id || value);

const isOverdue = (task) => {
  if (!task.dueDate || task.status === 'Completed') return false;
  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) return false;
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
};

const toProjectDto = (project) => ({
  id: getId(project),
  _id: getId(project),
  name: project.name,
  description: project.description || '',
  department: project.department || '',
  lead: project.lead || '',
  dueDate: project.dueDate || '',
  priority: project.priority || 'medium',
  budget: project.budget || '',
  progress: Number(project.progress) || 0,
  status: project.status || 'pending',
  tasks: project.tasks || { completed: 0, total: 0 },
  createdAt: project.createdAt,
  updatedAt: project.updatedAt
});

const synthesizeProjectsFromTasks = async () => {
  const tasks = await Task.find({}).lean();
  const departments = [...new Set(tasks.map((task) => task.department).filter(Boolean))];

  return departments.map((department) => {
    const departmentTasks = tasks.filter((task) => task.department === department);
    const completed = departmentTasks.filter((task) => task.status === 'Completed').length;
    const total = departmentTasks.length;
    const progress = total ? Math.round((completed / total) * 100) : 0;
    const delayed = departmentTasks.some(isOverdue);
    const highRisk = delayed || departmentTasks.filter((task) => task.priority === 'high' && task.status !== 'Completed').length >= 2;
    const dueDates = departmentTasks
      .map((task) => task.dueDate)
      .filter(Boolean)
      .sort((a, b) => new Date(a) - new Date(b));

    return {
      id: `dept-${department}`,
      _id: `dept-${department}`,
      name: `${department} Delivery`,
      description: `Auto-generated project overview from ${department} tasks.`,
      department,
      lead: departmentTasks.find((task) => task.assignedToName)?.assignedToName || '',
      dueDate: dueDates[0] || '',
      priority: highRisk ? 'high' : 'medium',
      progress,
      status: completed === total && total > 0 ? 'completed' : highRisk ? (delayed ? 'delayed' : 'at-risk') : 'on-track',
      tasks: { completed, total },
      createdAt: departmentTasks[0]?.createdAt
    };
  });
};

router.use(protect, authorize('CEO', 'COO', 'Manager', 'Team Lead'));

router.get('/', async (req, res) => {
  try {
    const { department, status, search } = req.query;
    const query = {};

    if (department && department !== 'All') query.department = department;
    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { lead: { $regex: search, $options: 'i' } }
      ];
    }

    let projects = (await Project.find(query).sort({ createdAt: -1 }).lean()).map(toProjectDto);

    if (projects.length === 0) {
      projects = await synthesizeProjectsFromTasks();
      if (department && department !== 'All') {
        projects = projects.filter((project) => project.department === department);
      }
      if (status && status !== 'All') {
        projects = projects.filter((project) => project.status === status);
      }
      if (search) {
        const q = search.toLowerCase();
        projects = projects.filter((project) =>
          project.name.toLowerCase().includes(q) ||
          project.description.toLowerCase().includes(q) ||
          project.lead.toLowerCase().includes(q)
        );
      }
    }

    res.json({ success: true, projects, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch projects' });
  }
});

router.post('/', async (req, res) => {
  try {
    const userDepartment = req.user?.department;
    const requestedDepartment = req.body.department || userDepartment || 'Core Systems';
    const department = requestedDepartment;

    const project = await Project.create({
      name: req.body.name,
      description: req.body.description || '',
      department,
      lead: req.body.lead || req.user.name || '',
      dueDate: req.body.dueDate || '',
      priority: req.body.priority || 'medium',
      budget: req.body.budget || '',
      progress: Number(req.body.progress) || 0,
      status: req.body.status || 'pending',
      tasks: req.body.tasks || { completed: 0, total: 0 },
      createdBy: req.user._id
    });

    res.status(201).json(toProjectDto(project));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create project' });
  }
});

module.exports = router;
