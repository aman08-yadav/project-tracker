const User = require('../models/User');
const prisma = require('../config/prisma');

// ─── GET /api/v1/users/leaderboard ───────────────────────────
const getLeaderboard = async (req, res, next) => {
  try {
    // Fetch all analytics rows from PostgreSQL (Prisma)
    const analyticsRows = await prisma.userAnalytics.findMany({
      orderBy: [
        { tasksCompleted: 'desc' },
        { uploadsCount: 'desc' },
      ],
      take: 20,
    });

    if (analyticsRows.length === 0) {
      return res.json({ success: true, leaderboard: [] });
    }

    // Get user names from MongoDB
    const userIds = analyticsRows.map((r) => r.userId);
    const users = await User.find({ _id: { $in: userIds } }).select('name email avatar role');
    const userMap = {};
    users.forEach((u) => { userMap[u._id.toString()] = u; });

    const leaderboard = analyticsRows.map((row, idx) => {
      const user = userMap[row.userId] || {};
      const score =
        (row.tasksCompleted * 10) +
        (row.uploadsCount * 5) +
        (row.activityCount * 1);

      return {
        rank: idx + 1,
        userId: row.userId,
        name: user.name || 'Unknown',
        email: user.email || '',
        avatar: user.avatar || '',
        role: user.role || 'student',
        tasksCompleted: row.tasksCompleted,
        uploadsCount: row.uploadsCount,
        activityCount: row.activityCount,
        score,
        lastActive: row.lastActive,
      };
    });

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

    let analytics = null;
    try {
      analytics = await prisma.userAnalytics.findUnique({ where: { userId: id } });
    } catch (_) {}

    const score = analytics
      ? (analytics.tasksCompleted * 10) + (analytics.uploadsCount * 5) + (analytics.activityCount * 1)
      : 0;

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
      analytics: analytics || {},
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

module.exports = { getLeaderboard, getProfile, getAllUsers };
