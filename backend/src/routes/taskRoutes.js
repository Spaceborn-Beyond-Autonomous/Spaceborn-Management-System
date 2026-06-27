const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const {
  getTasks,
  createTask,
  updateTask,
  updateTaskProgress,
  getMyTasks,
  getDepartmentTasks,
  getCompletedTasks,
  getDailyLogsList,
  createDailyLogEntry,
  completeTaskById
} = require('../controllers/taskController');

// Team Lead and below typically need access; keep protected for now.
router.get('/', protect, getTasks);
router.get('/my-tasks', protect, getMyTasks);
router.get('/completed', protect, getCompletedTasks);
router.get('/daily-logs', protect, getDailyLogsList);
router.post('/daily-logs', protect, createDailyLogEntry);
router.get('/my-logs', protect, getDailyLogsList);
router.get('/department-tasks', protect, getDepartmentTasks);

// Compatibility endpoints used by src/services/taskService.js
router.get('/stats', protect, require('../controllers/taskController').getTaskStats);

router.get('/search', protect, require('../controllers/taskController').searchTasks);
router.patch('/bulk/status', protect, require('../controllers/taskController').bulkUpdateStatus);
router.delete('/bulk', protect, require('../controllers/taskController').bulkDeleteTasks);
router.get('/assignee/:assigneeId', protect, require('../controllers/taskController').getTasksByAssignee);
router.get('/department/:department', protect, require('../controllers/taskController').getTasksByDepartment);
router.get('/creator/:creatorId', protect, require('../controllers/taskController').getTasksByCreator);

router.get('/:id', protect, require('../controllers/taskController').getTaskById);
router.delete('/:id', protect, require('../controllers/taskController').deleteTask);
router.put('/:id/complete', protect, completeTaskById);
router.patch('/:id/status', protect, require('../controllers/taskController').updateTaskStatus);

router.post('/:taskId/logs', protect, require('../controllers/taskController').addDailyLog);
router.get('/:taskId/logs', protect, require('../controllers/taskController').getDailyLogs);

router.post('/:taskId/comments', protect, require('../controllers/taskController').addComment);
router.get('/:taskId/comments', protect, require('../controllers/taskController').getTaskComments);

router.post('/', protect, createTask);

router.put('/:id', protect, updateTask);
router.patch('/:id/progress', protect, updateTaskProgress);

module.exports = router;

