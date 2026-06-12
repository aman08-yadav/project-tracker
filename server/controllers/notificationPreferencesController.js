const NotificationPreferences = require('../models/NotificationPreferences');

// ─── Get User Preferences ────────────────────────────────────
const getPreferences = async (req, res, next) => {
  try {
    let prefs = await NotificationPreferences.findOne({ user: req.user._id });
    if (!prefs) {
      prefs = await NotificationPreferences.create({ user: req.user._id });
    }
    res.json({ success: true, preferences: prefs });
  } catch (error) {
    next(error);
  }
};

// ─── Update User Preferences ─────────────────────────────────
const updatePreferences = async (req, res, next) => {
  try {
    const { inApp, browserPush } = req.body;
    let prefs = await NotificationPreferences.findOne({ user: req.user._id });
    if (!prefs) {
      prefs = new NotificationPreferences({ user: req.user._id });
    }

    if (inApp) {
      Object.assign(prefs.inApp, inApp);
    }
    if (browserPush) {
      Object.assign(prefs.browserPush, browserPush);
    }
    await prefs.save();

    res.json({ success: true, preferences: prefs });
  } catch (error) {
    next(error);
  }
};

// ─── Check if notification type is enabled ───────────────────
const isNotificationEnabled = async (userId, category, type) => {
  try {
    const prefs = await NotificationPreferences.findOne({ user: userId });
    if (!prefs) return true; // Default: enabled
    if (category === 'inApp') return prefs.inApp[type] !== false;
    if (category === 'browserPush') return prefs.browserPush.enabled && prefs.browserPush[type] !== false;
    return true;
  } catch {
    return true;
  }
};

module.exports = { getPreferences, updatePreferences, isNotificationEnabled };
