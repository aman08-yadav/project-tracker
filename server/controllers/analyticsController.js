const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const Task = require('../models/Task');
const FileMetadata = require('../models/FileMetadata');

const getProjectAnalytics = async (req, res, next) => {
  try {
    const { id: projectId } = req.params;

    const totalTasks = await Task.countDocuments({ project: projectId });
    const pendingTasks = await Task.countDocuments({ project: projectId, status: 'pending' });
    const inProgressTasks = await Task.countDocuments({ project: projectId, status: 'in-progress' });
    const completedTasks = await Task.countDocuments({ project: projectId, status: 'completed' });
    
    // Per-member breakdown from MongoDB
    const members = await User.find({ projectIds: projectId }, 'name email role');
    const memberCount = members.length;

    const pgAnalytics = { totalTasks, pendingTasks, inProgressTasks, completedTasks, memberCount };

    const memberStats = await Promise.all(
      members.map(async (member) => {
        const uploads = await FileMetadata.countDocuments({ uploadedBy: member._id, project: projectId });
        const tasksCompleted = await Task.countDocuments({ assignedTo: member._id, project: projectId, status: 'completed' });
        const tasksTotal = await Task.countDocuments({ assignedTo: member._id, project: projectId });
        const activityCount = await ActivityLog.countDocuments({ user: member._id, project: projectId });
        return {
          user: { id: member._id, name: member.name, email: member.email, role: member.role },
          uploads,
          tasksCompleted,
          tasksTotal,
          activityCount,
        };
      })
    );

    const recentActivity = await ActivityLog.find({ project: projectId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      analytics: {
        project: pgAnalytics,
        memberStats,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserAnalytics = async (req, res, next) => {
  try {
    const { id: userId } = req.params;

    const uploads = await FileMetadata.countDocuments({ uploadedBy: userId });
    const tasksCompleted = await Task.countDocuments({ assignedTo: userId, status: 'completed' });
    const tasksInProgress = await Task.countDocuments({ assignedTo: userId, status: 'in-progress' });
    const tasksPending = await Task.countDocuments({ assignedTo: userId, status: 'pending' });
    const activityCount = await ActivityLog.countDocuments({ user: userId });

    const pgAnalytics = { tasksCompleted, activityCount, lastActive: new Date() };

    const recentActivity = await ActivityLog.find({ user: userId })
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .limit(15);

    res.json({
      success: true,
      analytics: {
        pg: pgAnalytics,
        uploads,
        tasksCompleted,
        tasksInProgress,
        tasksPending,
        activityCount,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMyAnalytics = async (req, res, next) => {
  req.params.id = req.user._id.toString();
  return getUserAnalytics(req, res, next);
};

const getActivityLog = async (req, res, next) => {
  try {
    const { projectId, limit = 30 } = req.query;
    const filter = {};
    if (projectId) filter.project = projectId;

    const logs = await ActivityLog.find(filter)
      .populate('user', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProjectAnalytics, getUserAnalytics, getMyAnalytics, getActivityLog };
