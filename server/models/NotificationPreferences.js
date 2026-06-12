const mongoose = require('mongoose');

const notificationPreferencesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  // In-app notifications (always enabled, but user can see the setting)
  inApp: {
    taskAssigned: { type: Boolean, default: true },
    taskCompleted: { type: Boolean, default: true },
    taskUpdated: { type: Boolean, default: true },
    fileUploaded: { type: Boolean, default: true },
    fileApproved: { type: Boolean, default: true },
    fileRejected: { type: Boolean, default: true },
    memberAdded: { type: Boolean, default: true },
  },
  // Browser push notifications
  browserPush: {
    enabled: { type: Boolean, default: false },
    taskAssigned: { type: Boolean, default: true },
    taskCompleted: { type: Boolean, default: true },
    fileApproved: { type: Boolean, default: true },
    fileRejected: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

notificationPreferencesSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('NotificationPreferences', notificationPreferencesSchema);
