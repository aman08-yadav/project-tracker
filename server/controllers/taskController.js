const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');

// ─── Create Task ──────────────────────────────────────────────
const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, projectId, assignedTo, priority, dueDate } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    // Check user is member/faculty of this project
    const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember && req.user.role !== 'faculty') {
      return res.status(403).json({ success: false, message: 'You are not a member of this project.' });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      priority: priority || 'medium',
      dueDate: dueDate || null,
    });

    await ActivityLog.create({
      user: req.user._id,
      project: projectId,
      action: 'task_created',
      metadata: { taskId: task._id, title },
    });

    // Emit real-time event
    const io = req.app.get('io');
    if (io) io.to(projectId).emit('task:created', { task });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email');

    res.status(201).json({ success: true, task: populated });
  } catch (error) {
    next(error);
  }
};

// ─── Get Tasks (with access control) ─────────────────────────
const getTasks = async (req, res, next) => {
  try {
    const { projectId, status, priority, assignedTo, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (projectId) {
      filter.project = projectId;
    } else if (req.user.role !== 'faculty') {
      // Students: see tasks in their projects OR tasks explicitly assigned to them
      const myProjects = req.user.projectIds || [];
      filter.$or = [
        { project: { $in: myProjects } },
        { assignedTo: req.user._id }
      ];
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Full-text search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Task.countDocuments(filter);

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      tasks,
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

// ─── Update Task Status ───────────────────────────────────────
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    // Students can only update tasks assigned to them
    if (req.user.role !== 'faculty' && task.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only update your own tasks.' });
    }

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    const action = status === 'completed' ? 'task_completed' : 'task_updated';
    await ActivityLog.create({
      user: req.user._id,
      project: task.project,
      action,
      metadata: { taskId: task._id, title: task.title, oldStatus, newStatus: status },
    });

    // Real-time socket emit
    const io = req.app.get('io');
    if (io) {
      io.to(task.project.toString()).emit('task:updated', { task, updatedBy: req.user.name, newStatus: status });
    }

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('project', 'name');

    res.json({ success: true, task: populated });
  } catch (error) {
    next(error);
  }
};

// ─── Update Task (full edit) ───────────────────────────────────
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    // Only faculty or task creator can fully edit
    if (req.user.role !== 'faculty' && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only faculty or task creator can edit tasks.' });
    }

    const { title, description, assignedTo, priority, dueDate, status } = req.body;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (status) task.status = status;
    await task.save();

    await ActivityLog.create({
      user: req.user._id,
      project: task.project,
      action: 'task_updated',
      metadata: { taskId: task._id, title: task.title },
    });

    const io = req.app.get('io');
    if (io) io.to(task.project.toString()).emit('task:updated', { task });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('project', 'name');

    res.json({ success: true, task: populated });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Task (faculty only) ────────────────────────────────
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    if (req.user.role !== 'faculty' && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only faculty or task creator can delete tasks.' });
    }

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTasks, updateTaskStatus, updateTask, deleteTask };
