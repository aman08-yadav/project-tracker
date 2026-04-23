const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const Task = require('../models/Task');
const FileMetadata = require('../models/FileMetadata');

// ─── Project Analytics ─────────────────────────────────────────
const getProjectAnalytics = async (req, res, next) => {
  try {
    const { id: projectId } = req.params;

    const totalTasks = await Task.countDocuments({ project: projectId });
    const pendingTasks = await Task.countDocuments({ project: projectId, status: 'pending' });
    const inProgressTasks = await Task.countDocuments({ project: projectId, status: 'in-progress' });
    const completedTasks = await Task.countDocuments({ project: projectId, status: 'completed' });

    // Per-member breakdown
    const members = await User.find({ projectIds: projectId }, 'name email role avatar');
    const memberCount = members.length;

    const memberStats = await Promise.all(
      members.map(async (member) => {
        const uploads = await FileMetadata.countDocuments({ uploadedBy: member._id, project: projectId });
        const tasksCompleted = await Task.countDocuments({ assignedTo: member._id, project: projectId, status: 'completed' });
        const tasksTotal = await Task.countDocuments({ assignedTo: member._id, project: projectId });
        const activityCount = await ActivityLog.countDocuments({ user: member._id, project: projectId });
        return {
          user: { id: member._id, name: member.name, email: member.email, role: member.role, avatar: member.avatar },
          uploads,
          tasksCompleted,
          tasksTotal,
          activityCount,
        };
      })
    );

    const recentActivity = await ActivityLog.find({ project: projectId })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      analytics: {
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        memberCount,
        memberStats,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── User Analytics ────────────────────────────────────────────
// Returns FLAT object so dashboard can read analytics.tasksCompleted directly
const getUserAnalytics = async (req, res, next) => {
  try {
    const { id: userId } = req.params;

    const uploadsCount = await FileMetadata.countDocuments({ uploadedBy: userId });
    const tasksCompleted = await Task.countDocuments({ assignedTo: userId, status: 'completed' });
    const tasksInProgress = await Task.countDocuments({ assignedTo: userId, status: 'in-progress' });
    const tasksPending = await Task.countDocuments({ assignedTo: userId, status: 'pending' });
    const activityCount = await ActivityLog.countDocuments({ user: userId });

    const recentActivity = await ActivityLog.find({ user: userId })
      .populate('project', 'name')
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(15);

    // Count projects this user belongs to
    const user = await User.findById(userId).select('projectIds');
    const projectsCount = user?.projectIds?.length || 0;

    res.json({
      success: true,
      analytics: {
        uploadsCount,
        tasksCompleted,
        tasksInProgress,
        tasksPending,
        activityCount,
        projectsCount,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── My Analytics (shortcut) ──────────────────────────────────
const getMyAnalytics = async (req, res, next) => {
  req.params.id = req.user._id.toString();
  return getUserAnalytics(req, res, next);
};

// ─── Activity Log ──────────────────────────────────────────────
const getActivityLog = async (req, res, next) => {
  try {
    const { projectId, limit = 30, page = 1 } = req.query;
    const filter = {};
    if (projectId) filter.project = projectId;

    // If student, filter to their own activity
    if (req.user.role !== 'faculty') {
      filter.user = req.user._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await ActivityLog.countDocuments(filter);
    const logs = await ActivityLog.find(filter)
      .populate('user', 'name email avatar')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      logs,
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

// ─── Faculty: All Students Progress ───────────────────────────
const getAllStudentsProgress = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).select('name email avatar createdAt projectIds');

    const progress = await Promise.all(students.map(async (student) => {
      const tasksCompleted = await Task.countDocuments({ assignedTo: student._id, status: 'completed' });
      const tasksInProgress = await Task.countDocuments({ assignedTo: student._id, status: 'in-progress' });
      const tasksPending = await Task.countDocuments({ assignedTo: student._id, status: 'pending' });
      const totalTasks = tasksCompleted + tasksInProgress + tasksPending;
      const completionRate = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

      return {
        student: { id: student._id, name: student.name, email: student.email, avatar: student.avatar },
        projectsCount: student.projectIds?.length || 0,
        tasksCompleted,
        tasksInProgress,
        tasksPending,
        totalTasks,
        completionRate,
      };
    }));

    res.json({ success: true, progress });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProjectAnalytics, getUserAnalytics, getMyAnalytics, getActivityLog, getAllStudentsProgress };
