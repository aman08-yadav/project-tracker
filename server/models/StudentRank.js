const mongoose = require('mongoose');

const studentRankSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  rank: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'],
    default: null,
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  remarks: {
    type: String,
    default: '',
    maxlength: 500,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filesApproved: {
    type: Number,
    default: 0,
  },
  filesRejected: {
    type: Number,
    default: 0,
  },
  tasksCompleted: {
    type: Number,
    default: 0,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

studentRankSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// One rank per student per project
studentRankSchema.index({ student: 1, project: 1 }, { unique: true });

module.exports = mongoose.model('StudentRank', studentRankSchema);
