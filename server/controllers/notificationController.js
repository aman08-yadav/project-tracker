const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

// ─── Get Notifications for Current User ─────────────────────
const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const filter = { recipient: req.user._id };

    if (unreadOnly === 'true') {
      filter.read = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });

    const notifications = await Notification.find(filter)
      .populate('sender', 'name email avatar role')
      .populate('project', 'name')
      .populate('taskId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Unread Count ───────────────────────────────────────
const getUnreadCount = async (req, res, next) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });
    res.json({ success: true, unreadCount });
  } catch (error) {
    next(error);
  }
};

// ─── Mark Single Notification as Read ───────────────────────
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    res.json({ success: true, notification, unreadCount });
  } catch (error) {
    next(error);
  }
};

// ─── Mark All as Read ───────────────────────────────────────
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    res.json({ success: true, message: 'All notifications marked as read.', unreadCount: 0 });
  } catch (error) {
    next(error);
  }
};

// ─── Delete a Notification ──────────────────────────────────
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    res.json({ success: true, message: 'Notification deleted.', unreadCount });
  } catch (error) {
    next(error);
  }
};

// ─── Helper: Create and emit notification ───────────────────
// Called from other controllers (task, file, project)
const createNotification = async ({ recipientId, senderId, type, title, message, projectId, taskId, reviewNote }) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message,
      project: projectId || null,
      taskId: taskId || null,
    });

    const populated = await Notification.findById(notification._id)
      .populate('sender', 'name email avatar role')
      .populate('project', 'name')
      .populate('taskId', 'title');

    // ── Send email notification asynchronously (fire-and-forget) ──
    if (['task_assigned', 'task_completed', 'file_approved', 'file_rejected'].includes(type)) {
      sendEmailAsync({ recipientId, senderId, type, message, projectId, taskId, reviewNote });
    }

    return populated;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

// ── Send email asynchronously (non-blocking) ──────────────────
const sendEmailAsync = async ({ recipientId, senderId, type, message, projectId, taskId, reviewNote }) => {
  try {
    const [recipient, sender] = await Promise.all([
      User.findById(recipientId).select('email name'),
      User.findById(senderId).select('name'),
    ]);
    if (!recipient || !recipient.email) return;

    const senderName = sender?.name || 'Someone';
    let taskTitle = '';
    let projectName = '';
    let fileName = '';

    if (taskId) {
      const Task = require('../models/Task');
      const task = await Task.findById(taskId).select('title project').populate('project', 'name');
      if (task) {
        taskTitle = task.title;
        projectName = task.project?.name || '';
      }
    }

    // Extract file name from message if it's a file notification
    if (type === 'file_approved' || type === 'file_rejected') {
      const match = (message || '').match(/: (.+)$/);
      if (match) fileName = match[1];
    }

    const templateData = { senderName, taskTitle, projectName, fileName, reviewNote };
    await sendEmail(recipient.email, type, templateData);
  } catch (error) {
    console.error('[Email] Async send failed:', error.message);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
};
