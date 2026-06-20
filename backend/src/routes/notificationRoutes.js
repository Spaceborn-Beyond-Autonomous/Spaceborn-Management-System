const express = require('express');
const router = express.Router();

const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

const toDto = (notification) => ({
  id: String(notification._id),
  _id: notification._id,
  userId: notification.userId,
  title: notification.title,
  message: notification.message,
  description: notification.description || notification.message,
  category: notification.category,
  priority: notification.priority,
  read: notification.read,
  readAt: notification.readAt,
  actionUrl: notification.actionUrl,
  actionLabel: notification.actionLabel,
  details: notification.details || {},
  createdAt: notification.createdAt
});

const listForUser = async (userId, query = {}) => {
  const filter = { userId };
  if (query.read !== undefined) filter.read = query.read === 'true';
  if (query.category && query.category !== 'All') filter.category = query.category;
  return Notification.find(filter).sort({ createdAt: -1 });
};

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const notifications = await listForUser(req.user._id, req.query);
    res.json({ success: true, data: notifications.map(toDto), notifications: notifications.map(toDto) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch notifications' });
  }
});

router.post('/', async (req, res) => {
  try {
    const notification = await Notification.create({
      userId: req.body.userId || req.user._id,
      title: req.body.title,
      message: req.body.message || req.body.description || req.body.title,
      description: req.body.description || '',
      category: req.body.category || 'System',
      priority: req.body.priority || 'medium',
      actionUrl: req.body.actionUrl || null,
      actionLabel: req.body.actionLabel || null,
      details: req.body.details || {}
    });

    res.status(201).json({ success: true, data: toDto(notification) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create notification' });
  }
});

router.post('/bulk', authorize('CEO', 'COO', 'Manager'), async (req, res) => {
  try {
    const userQuery = req.user.role === 'Manager' ? { department: req.user.department, isActive: true } : { isActive: true };
    const users = await User.find(userQuery).select('_id');
    const docs = users.map((user) => ({
      userId: user._id,
      title: req.body.title,
      message: req.body.message || req.body.description || req.body.title,
      description: req.body.description || '',
      category: req.body.category || 'System',
      priority: req.body.priority || 'medium',
      actionUrl: req.body.actionUrl || null,
      actionLabel: req.body.actionLabel || null,
      details: req.body.details || {}
    }));

    const created = docs.length ? await Notification.insertMany(docs) : [];
    res.status(201).json({ success: true, count: created.length, data: created.map(toDto) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to send notifications' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const canRead = String(req.user._id) === String(requestedUserId) || ['CEO', 'Manager', 'Team Lead'].includes(req.user.role);
    if (!canRead) return res.status(403).json({ success: false, message: 'Not authorized' });

    const notifications = await listForUser(requestedUserId, req.query);
    res.json({ success: true, data: notifications.map(toDto), notifications: notifications.map(toDto) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch notifications' });
  }
});

router.get('/unread-count', async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ success: true, count, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to count notifications' });
  }
});

router.get('/user/:userId/unread-count', async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.params.userId, read: false });
    res.json({ success: true, count, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to count notifications' });
  }
});

router.put('/mark-all-read', async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true, readAt: new Date() });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update notifications' });
  }
});

router.put('/user/:userId/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.params.userId, read: false }, { read: true, readAt: new Date() });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update notifications' });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true, readAt: new Date() },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: toDto(notification) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update notification' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: toDto(notification) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete notification' });
  }
});

module.exports = router;
