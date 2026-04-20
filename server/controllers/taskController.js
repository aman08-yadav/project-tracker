const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const prisma = require('../config/prisma');

const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, projectId, assignedTo, priority, dueDate } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    const task = await Task.create({
      title, description, project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      priority: priority || 'medium',
      dueDate: dueDate || null,
    });

    // Update project analytics
    await prisma.projectAnalytics.upsert({
      where: { projectId },
      update: { totalTasks: { increment: 1 }, pendingTasks: { increment: 1 } },
      create: { projectId, totalTasks: 1, pendingTasks: 1 },
    });

    await ActivityLog.create({
      user: req.user._id, project: projectId, action: 'task_created',
      metadata: { taskId: task._id, title },
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) io.to(projectId).emit('task:created', { task });

    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { projectId, status, assignedTo } = req.query;
    const filter = {};
    if (projectId) filter.project = projectId;
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    // Update Prisma analytics
    const projectId = task.project.toString();
    const updates = {};
    if (oldStatus === 'pending') updates.pendingTasks = { decrement: 1 };
    if (oldStatus === 'in-progress') updates.inProgressTasks = { decrement: 1 };
    if (oldStatus === 'completed') updates.completedTasks = { decrement: 1 };
    if (status === 'pending') updates.pendingTasks = { ...(updates.pendingTasks || {}), increment: 1 };
    if (status === 'in-progress') updates.inProgressTasks = { increment: 1 };
    if (status === 'completed') {
      updates.completedTasks = { increment: 1 };
      // Update user analytics
      await prisma.userAnalytics.upsert({
        where: { userId: req.user._id.toString() },
        update: { tasksCompleted: { increment: 1 }, activityCount: { increment: 1 }, lastActive: new Date() },
        create: { userId: req.user._id.toString(), tasksCompleted: 1, activityCount: 1 },
      });
    }

    await prisma.projectAnalytics.upsert({
      where: { projectId },
      update: updates,
      create: { projectId },
    });

    const action = status === 'completed' ? 'task_completed' : 'task_updated';
    await ActivityLog.create({
      user: req.user._id, project: task.project, action,
      metadata: { taskId: task._id, title: task.title, oldStatus, newStatus: status },
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(projectId).emit('task:updated', { task, updatedBy: req.user.name });
    }

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json({ success: true, task: populated });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    const { title, description, assignedTo, priority, dueDate } = req.body;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    await task.save();

    await ActivityLog.create({
      user: req.user._id, project: task.project, action: 'task_updated',
      metadata: { taskId: task._id, title: task.title },
    });

    const io = req.app.get('io');
    if (io) io.to(task.project.toString()).emit('task:updated', { task });

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTasks, updateTaskStatus, updateTask, deleteTask };
