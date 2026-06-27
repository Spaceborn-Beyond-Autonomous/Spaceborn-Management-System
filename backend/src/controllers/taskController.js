const Task = require('../models/Task');
const User = require('../models/User');
const { formatResponse } = require('../utils/helpers');
const { notifyTaskAssigned } = require('../utils/notificationDispatcher');

const getUserName = (user) =>
  user?.name || user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();

const getAssignedUserQuery = (user) => {
  const query = [{ assignedTo: user.id }];
  const name = getUserName(user);

  if (name) query.push({ assignedToName: name });
  if (user.employeeId) query.push({ assignedToName: user.employeeId });

  return { $or: query };
};

// GET /api/tasks?department=&status=&search=
exports.getTasks = async (req, res) => {
  try {
    const { department, status, search } = req.query;

    const query = {};
    if (department) query.department = department;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { assignedToName: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query).sort({ dueDate: 1, createdAt: -1 });

    res.json(formatResponse(true, 'Tasks fetched successfully', {
      tasks
    }));
  } catch (err) {
    res.status(500).json(formatResponse(false, err.message));
  }
};

// POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      assignedToName,
      assignedToInitials,
      department,
      priority,
      dueDate,
      estimatedHours,
      progress,
      status,
      createdBy,
      createdAt
    } = req.body;

    if (!title) {
      return res.status(400).json(formatResponse(false, 'title is required'));
    }

    const coercedEstimatedHours = estimatedHours === undefined || estimatedHours === null || estimatedHours === ''
      ? 0
      : Number(estimatedHours);

    if (Number.isNaN(coercedEstimatedHours)) {
      return res.status(400).json(formatResponse(false, 'estimatedHours must be a number'));
    }

    const coercedProgress = progress === undefined || progress === null || progress === ''
      ? 0
      : Number(progress);

    if (Number.isNaN(coercedProgress) || coercedProgress < 0 || coercedProgress > 100) {
      return res.status(400).json(formatResponse(false, 'progress must be a number between 0 and 100'));
    }

    // Normalize assigned user fields if possible
    let finalAssignedToName = assignedToName;
    let finalAssignedToInitials = assignedToInitials;

    if (assignedTo) {
      const u = await User.findById(assignedTo).select('-password');
      if (u) {
        finalAssignedToName = finalAssignedToName || (u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim());
        finalAssignedToInitials = finalAssignedToInitials || `${(u.firstName || ' ')[0]}${(u.lastName || ' ')[0]}`.toUpperCase();
      }
    }

    const task = await Task.create({
      title,
      description: description || '',
      assignedTo,
      assignedToName: finalAssignedToName || '',
      assignedToInitials: finalAssignedToInitials || '',
      department: department || 'Core Systems',
      priority: priority || 'medium',
      // Schema stores dueDate as String; accept date or yyyy-mm-dd and store as provided.
      dueDate: dueDate || '',
      estimatedHours: Math.max(0, coercedEstimatedHours),
      progress: coercedProgress,
      status: status || 'Pending',
      createdBy,
      createdAt: createdAt || new Date().toISOString()
    });

    if (req.user?.role === 'Team Lead') {
      await notifyTaskAssigned(task);
    }

    res.status(201).json(formatResponse(true, 'Task created successfully', task));
  } catch (err) {
    console.error('createTask failed:', err);
    res.status(500).json({
      success: false,
      message: err?.message || 'Failed to create task',
      error: err
    });
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findByIdAndUpdate(id, updates, { new: true });
    if (!task) return res.status(404).json(formatResponse(false, 'Task not found'));

    res.json(formatResponse(true, 'Task updated successfully', task));
  } catch (err) {
    res.status(500).json(formatResponse(false, err.message));
  }
};

// PATCH /api/tasks/:id/progress
exports.updateTaskProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, status } = req.body;

    if (progress === undefined || progress === null) {
      return res.status(400).json(formatResponse(false, 'progress is required'));
    }

    const coercedProgress = Number(progress);
    if (Number.isNaN(coercedProgress) || coercedProgress < 0 || coercedProgress > 100) {
      return res.status(400).json(formatResponse(false, 'progress must be a number between 0 and 100'));
    }

    const finalStatus = status || (coercedProgress >= 100 ? 'Completed' : coercedProgress > 0 ? 'In progress' : 'Pending');

    const task = await Task.findByIdAndUpdate(
      id,
      { progress: coercedProgress, status: finalStatus },
      { new: true }
    );

    if (!task) return res.status(404).json(formatResponse(false, 'Task not found'));

    res.json(formatResponse(true, 'Task progress updated', task));
  } catch (err) {
    res.status(500).json(formatResponse(false, err.message));
  }
};

// GET /api/tasks/my-tasks
// Tasks assigned to the authenticated user
exports.getMyTasks = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json(formatResponse(false, 'Unauthorized'));

    const tasks = await Task.find(getAssignedUserQuery(req.user)).sort({ dueDate: 1, createdAt: -1 });
    return res.json(formatResponse(true, 'My tasks fetched successfully', { tasks }));
  } catch (err) {
    return res.status(500).json(formatResponse(false, err.message));
  }
};

// GET /api/tasks/department-tasks
// Tasks visible to roles that operate by department (Team Lead/Manager/CEO)
exports.getDepartmentTasks = async (req, res) => {
  try {
    const { department } = req.query;
    const effectiveDepartment = (department || req.user?.department || '').trim();

    if (!effectiveDepartment) {
      return res.status(400).json(formatResponse(false, 'department is required'));
    }

    const tasks = await Task.find({ department: effectiveDepartment }).sort({ dueDate: 1, createdAt: -1 });
    return res.json(formatResponse(true, 'Department tasks fetched successfully', { tasks }));
  } catch (err) {
    return res.status(500).json(formatResponse(false, err.message));
  }
};

// GET /api/tasks/completed
// Completed tasks assigned to the authenticated user
exports.getCompletedTasks = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json(formatResponse(false, 'Unauthorized'));

    const tasks = await Task.find({
      ...getAssignedUserQuery(req.user),
      status: 'Completed'
    }).sort({ updatedAt: -1, dueDate: 1 });
    return res.json(formatResponse(true, 'Completed tasks fetched successfully', { tasks }));
  } catch (err) {
    return res.status(500).json(formatResponse(false, err.message));
  }
};

// GET /api/tasks/daily-logs
// Flatten logs from tasks assigned to the authenticated user
exports.getDailyLogsList = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json(formatResponse(false, 'Unauthorized'));

    const tasks = await Task.find({
      ...getAssignedUserQuery(req.user),
      'logs.0': { $exists: true }
    }).select('title logs');
    const logs = tasks
      .flatMap(task => (task.logs || []).map(log => ({
        ...log.toObject(),
        taskId: task._id,
        taskName: log.taskName || task.title,
      })))
      .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));

    return res.json(formatResponse(true, 'Daily logs fetched successfully', { logs }));
  } catch (err) {
    return res.status(500).json(formatResponse(false, err.message));
  }
};

// POST /api/tasks/daily-logs
// Add a daily log to one of the authenticated user's assigned tasks
exports.createDailyLogEntry = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json(formatResponse(false, 'Unauthorized'));

    const { taskId, taskName, progress, notes, content, date, hoursSpent } = req.body;
    if (!taskId) return res.status(400).json(formatResponse(false, 'taskId is required'));

    const task = await Task.findOne({
      _id: taskId,
      ...getAssignedUserQuery(req.user)
    });
    if (!task) return res.status(404).json(formatResponse(false, 'Task not found'));

    const coercedProgress = progress === undefined || progress === null || progress === ''
      ? task.progress || 0
      : Number(progress);

    if (Number.isNaN(coercedProgress) || coercedProgress < 0 || coercedProgress > 100) {
      return res.status(400).json(formatResponse(false, 'progress must be a number between 0 and 100'));
    }

    const log = {
      taskName: taskName || task.title,
      progress: coercedProgress,
      notes: notes || content || '',
      content: content || notes || '',
      date: date || new Date().toISOString(),
      hoursSpent: hoursSpent === undefined || hoursSpent === null || hoursSpent === '' ? 0 : Number(hoursSpent),
      userId,
      createdAt: new Date().toISOString(),
    };

    if (Number.isNaN(log.hoursSpent) || log.hoursSpent < 0) {
      return res.status(400).json(formatResponse(false, 'hoursSpent must be a positive number'));
    }

    task.logs.push(log);
    task.progress = coercedProgress;
    task.status = coercedProgress >= 100 ? 'Completed' : coercedProgress > 0 ? 'In progress' : 'Pending';
    await task.save();

    const createdLog = task.logs[task.logs.length - 1].toObject();
    return res.status(201).json(formatResponse(true, 'Daily log submitted successfully', {
      ...createdLog,
      taskId: task._id,
      taskName: createdLog.taskName || task.title,
    }));
  } catch (err) {
    return res.status(500).json(formatResponse(false, err.message));
  }
};

// PUT /api/tasks/:id/complete
exports.completeTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndUpdate(
      id,
      { status: 'Completed', progress: 100 },
      { new: true }
    );

    if (!task) return res.status(404).json(formatResponse(false, 'Task not found'));
    return res.json(formatResponse(true, 'Task completed successfully', task));
  } catch (err) {
    return res.status(500).json(formatResponse(false, err.message));
  }
};

// ==================== Compatibility endpoints for src/services/taskService.js ====================

// GET /api/tasks/:id
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json(formatResponse(false, 'Task not found'));
    return res.json(formatResponse(true, 'Task fetched successfully', task));
  } catch (err) {
    return res.status(500).json(formatResponse(false, err.message));
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);
    if (!task) return res.status(404).json(formatResponse(false, 'Task not found'));
    return res.json(formatResponse(true, 'Task deleted successfully', task));
  } catch (err) {
    return res.status(500).json(formatResponse(false, err.message));
  }
};

// PATCH /api/tasks/:id/status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json(formatResponse(false, 'status is required'));

    const validStatuses = ['Pending', 'In progress', 'Completed', 'Overdue', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json(formatResponse(false, `Invalid status. Must be one of: ${validStatuses.join(', ')}`));
    }

    const task = await Task.findByIdAndUpdate(
      id,
      {
        status,
        // keep progress consistent when status changes
        ...(status === 'Completed' ? { progress: 100 } : {})
      },
      { new: true }
    );

    if (!task) return res.status(404).json(formatResponse(false, 'Task not found'));
    return res.json(formatResponse(true, 'Task status updated', task));
  } catch (err) {
    return res.status(500).json(formatResponse(false, err.message));
  }
};

// GET /api/tasks/assignee/:assigneeId
exports.getTasksByAssignee = async (req, res) => {
  try {
    const { assigneeId } = req.params;
    if (!assigneeId) return res.status(400).json(formatResponse(false, 'assigneeId is required'));

    const tasks = await Task.find({ assignedTo: assigneeId }).sort({ dueDate: 1, createdAt: -1 });
    return res.json(formatResponse(true, 'Tasks fetched successfully', tasks));
  } catch (err) {
    return res.status(500).json(formatResponse(false, err.message));
  }
};

// GET /api/tasks/department/:department
exports.getTasksByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    if (!department) return res.status(400).json(formatResponse(false, 'department is required'));

    const tasks = await Task.find({ department }).sort({ dueDate: 1, createdAt: -1 });
    return res.json(formatResponse(true, 'Department tasks fetched successfully', tasks));
  } catch (err) {
    return res.status(500).json(formatResponse(false, err.message));
  }
};

// GET /api/tasks/creator/:creatorId
exports.getTasksByCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;
    if (!creatorId) return res.status(400).json(formatResponse(false, 'creatorId is required'));

    const tasks = await Task.find({ createdBy: creatorId }).sort({ dueDate: 1, createdAt: -1 });
    return res.json(formatResponse(true, 'Created tasks fetched successfully', tasks));
  } catch (err) {
    return res.status(500).json(formatResponse(false, err.message));
  }
};

// GET /api/tasks/stats
exports.getTaskStats = async (req, res) => {
  try {
    const tasks = await Task.find({});
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In progress').length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    const overdue = tasks.filter(t => t.status === 'Overdue' || (t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed')).length;

    const highPriority = tasks.filter(t => t.priority === 'high' || t.priority === 'High').length;
    const mediumPriority = tasks.filter(t => t.priority === 'medium' || t.priority === 'Medium').length;
    const lowPriority = tasks.filter(t => t.priority === 'low' || t.priority === 'Low').length;

    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    const averageProgress = total ? Math.round(tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / total) : 0;

    return res.json(formatResponse(true, 'Task stats fetched successfully', {
      total,
      completed,
      inProgress,
      pending,
      overdue,
      highPriority,
      mediumPriority,
      lowPriority,
      completionRate,
      averageProgress
    }));
  } catch (err) {
    return res.status(500).json(formatResponse(false, err.message));
  }
};

// POST /api/tasks/:taskId/logs
exports.addDailyLog = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content, createdAt } = req.body;

    if (!content) return res.status(400).json(formatResponse(false, 'Log content is required'));

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json(formatResponse(false, 'Task not found'));

    // Store logs in-memory fields if present in schema; otherwise keep as placeholders.
    if (!task.logs) task.logs = [];
    task.logs.push({ content, createdAt: createdAt || new Date().toISOString() });
    await task.save();

    return res.status(201).json(formatResponse(true, 'Log added successfully', task));
  } catch (err) {
    return res.status(500).json(formatResponse(false, err.message));
  }
};

// GET /api/tasks/:taskId/logs
exports.getDailyLogs = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId).select('logs');
    if (!task) return res.status(404).json(formatResponse(false, 'Task not found'));
    return res.json(formatResponse(true, 'Logs fetched successfully', task.logs || []));
  } catch (err) {
    return res.status(500).json(formatResponse(false, err.message));
  }
};

// POST /api/tasks/:taskId/comments
exports.addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { comment, author, authorId, timestamp } = req.body;

    if (!comment) return res.status(400).json(formatResponse(false, 'Comment is required'));

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json(formatResponse(false, 'Task not found'));

    if (!task.comments) task.comments = [];
    task.comments.push({ comment, author, authorId, timestamp: timestamp || new Date().toISOString() });
    await task.save();

    return res.status(201).json(formatResponse(true, 'Comment added successfully', task));
  } catch (err) {
    return res.status(500).json(formatResponse(false, err.message));
  }
};

// GET /api/tasks/:taskId/comments
exports.getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId).select('comments');
    if (!task) return res.status(404).json(formatResponse(false, 'Task not found'));
    return res.json(formatResponse(true, 'Comments fetched successfully', task.comments || []));
  } catch (err) {
    return res.status(500).json(formatResponse(false, err.message));
  }
};

// PATCH /api/tasks/bulk/status
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { taskIds, status } = req.body;
    if (!Array.isArray(taskIds) || taskIds.length === 0) return res.status(400).json(formatResponse(false, 'taskIds is required'));
    if (!status) return res.status(400).json(formatResponse(false, 'status is required'));

    const validStatuses = ['Pending', 'In progress', 'Completed', 'Overdue', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json(formatResponse(false, `Invalid status. Must be one of: ${validStatuses.join(', ')}`));
    }

    const result = await Task.updateMany({ _id: { $in: taskIds } }, {
      status,
      ...(status === 'Completed' ? { progress: 100 } : {})
    });

    return res.json(formatResponse(true, 'Bulk status update completed', result));
  } catch (err) {
    return res.status(500).json(formatResponse(false, err.message));
  }
};

// DELETE /api/tasks/bulk
exports.bulkDeleteTasks = async (req, res) => {
  try {
    const { taskIds } = req.body;
    if (!Array.isArray(taskIds) || taskIds.length === 0) return res.status(400).json(formatResponse(false, 'taskIds is required'));

    const result = await Task.deleteMany({ _id: { $in: taskIds } });
    return res.json(formatResponse(true, 'Bulk delete completed', result));
  } catch (err) {
    return res.status(500).json(formatResponse(false, err.message));
  }
};

// GET /api/tasks/search?q=...
exports.searchTasks = async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json(formatResponse(true, 'Search completed', []));

    const tasks = await Task.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { assignedToName: { $regex: q, $options: 'i' } }
      ]
    }).sort({ dueDate: 1, createdAt: -1 });

    return res.json(formatResponse(true, 'Search completed', tasks));
  } catch (err) {
    return res.status(500).json(formatResponse(false, err.message));
  }
};



