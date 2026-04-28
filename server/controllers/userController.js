const User = require('../models/User');
const Task = require('../models/Task');
const FileMetadata = require('../models/FileMetadata');
const ActivityLog = require('../models/ActivityLog');

// ─── GET /api/v1/users/leaderboard ───────────────────────────
const getLeaderboard = async (req, res, next) => {
  try {
    // Only show students on the leaderboard (faculty are evaluators, not competitors)
    const users = await User.find({ role: 'student' }).select('name email avatar role createdAt lastLogin');
    
    const leaderboardUnsorted = await Promise.all(users.map(async (user) => {
      const tasksCompleted = await Task.countDocuments({ assignedTo: user._id, status: 'completed' });
      const uploadsCount = await FileMetadata.countDocuments({ uploadedBy: user._id });
      // Only count meaningful project activities (not login/register)
      const activityCount = await ActivityLog.countDocuments({
        user: user._id,
        action: { $in: ['task_created', 'task_updated', 'task_completed', 'file_upload', 'file_delete'] }
      });
      
      const score = (tasksCompleted * 10) + (uploadsCount * 5) + (activityCount * 1);
      
      return {
        userId: user._id,
        name: user.name || 'Unknown',
        email: user.email || '',
        avatar: user.avatar || '',
        role: user.role || 'student',
        tasksCompleted,
        uploadsCount,
        activityCount,
        score,
        lastActive: user.lastLogin || user.createdAt,
      };
    }));

    // Only rank students who have actually contributed (score > 0)
    const active = leaderboardUnsorted.filter(u => u.score > 0);
    active.sort((a, b) => b.score - a.score);
    const leaderboard = active.slice(0, 20).map((r, idx) => ({ ...r, rank: idx + 1 }));

    res.json({ success: true, leaderboard });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/users/profile/:id ───────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate('projectIds', 'name description');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const tasksCompleted = await Task.countDocuments({ assignedTo: id, status: 'completed' });
    const uploadsCount = await FileMetadata.countDocuments({ uploadedBy: id });
    const activityCount = await ActivityLog.countDocuments({ user: id });
    const score = (tasksCompleted * 10) + (uploadsCount * 5) + (activityCount * 1);

    const analytics = { tasksCompleted, uploadsCount, activityCount };

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        provider: user.provider,
        projects: user.projectIds,
        createdAt: user.createdAt,
      },
      analytics,
      score,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/users (list all users) ──────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('name email role avatar createdAt');
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/users/profile/:id ───────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile.' });
    }

    const { name, password } = req.body;
    const user = await User.findById(id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (name) user.name = name;
    if (password && password.trim() !== '') {
      user.password = password;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeaderboard, getProfile, getAllUsers, updateProfile };
