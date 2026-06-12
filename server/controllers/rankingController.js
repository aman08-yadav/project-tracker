const StudentRank = require('../models/StudentRank');
const FileMetadata = require('../models/FileMetadata');
const Task = require('../models/Task');
const User = require('../models/User');
const Project = require('../models/Project');
const { createNotification } = require('./notificationController');

// ─── GET Review Queue — All files pending review ─────────────
const getReviewQueue = async (req, res, next) => {
  try {
    const { projectId, status = 'pending' } = req.query;
    const filter = {};

    if (projectId) filter.project = projectId;
    if (status !== 'all') filter.status = status;

    const files = await FileMetadata.find(filter)
      .populate('uploadedBy', 'name email avatar')
      .populate('project', 'name')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    // Group by student for summary
    const studentSummary = {};
    files.forEach(f => {
      const sid = f.uploadedBy?._id?.toString();
      if (!sid) return;
      if (!studentSummary[sid]) {
        studentSummary[sid] = {
          student: f.uploadedBy,
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          files: [],
        };
      }
      studentSummary[sid].total++;
      studentSummary[sid][f.status]++;
      studentSummary[sid].files.push(f);
    });

    res.json({
      success: true,
      files,
      studentSummary: Object.values(studentSummary),
      stats: {
        total: files.length,
        pending: files.filter(f => f.status === 'pending').length,
        approved: files.filter(f => f.status === 'approved').length,
        rejected: files.filter(f => f.status === 'rejected').length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET Student Ranks for a Project ─────────────────────────
const getStudentRanks = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const ranks = await StudentRank.find({ project: projectId })
      .populate('student', 'name email avatar')
      .populate('assignedBy', 'name')
      .sort({ score: -1 });

    res.json({ success: true, ranks });
  } catch (error) {
    next(error);
  }
};

// ─── POST/PUT Assign Rank to a Student ───────────────────────
const assignRank = async (req, res, next) => {
  try {
    const { projectId, studentId, rank, score, remarks } = req.body;

    if (!projectId || !studentId) {
      return res.status(400).json({ success: false, message: 'projectId and studentId are required.' });
    }

    // Validate score range
    if (score !== undefined && (score < 0 || score > 100)) {
      return res.status(400).json({ success: false, message: 'Score must be between 0 and 100.' });
    }

    // Count files and tasks for this student in this project
    const filesApproved = await FileMetadata.countDocuments({
      uploadedBy: studentId, project: projectId, status: 'approved'
    });
    const filesRejected = await FileMetadata.countDocuments({
      uploadedBy: studentId, project: projectId, status: 'rejected'
    });
    const tasksCompleted = await Task.countDocuments({
      assignedTo: studentId, project: projectId, status: 'completed'
    });

    let studentRank = await StudentRank.findOne({ student: studentId, project: projectId });

    if (studentRank) {
      if (rank !== undefined) studentRank.rank = rank;
      if (score !== undefined) studentRank.score = score;
      if (remarks !== undefined) studentRank.remarks = remarks;
      studentRank.assignedBy = req.user._id;
      studentRank.filesApproved = filesApproved;
      studentRank.filesRejected = filesRejected;
      studentRank.tasksCompleted = tasksCompleted;
      await studentRank.save();
    } else {
      studentRank = await StudentRank.create({
        student: studentId,
        project: projectId,
        rank: rank || null,
        score: score || 0,
        remarks: remarks || '',
        assignedBy: req.user._id,
        filesApproved,
        filesRejected,
        tasksCompleted,
      });
    }

    // Send notification to student
    if (rank || score) {
      const notification = await createNotification({
        recipientId: studentId,
        senderId: req.user._id,
        type: 'task_updated',
        title: rank ? `Rank Assigned: ${rank}` : 'Score Updated',
        message: rank
          ? `You received rank ${rank} with score ${score || 0}/100`
          : `Your score has been updated to ${score}/100`,
        projectId,
      });

      const io = req.app.get('io');
      if (io && notification) {
        io.sendNotification(studentId, notification);
      }
    }

    const populated = await StudentRank.findById(studentRank._id)
      .populate('student', 'name email avatar')
      .populate('assignedBy', 'name');

    res.json({ success: true, rank: populated });
  } catch (error) {
    next(error);
  }
};

// ─── POST Bulk Assign Ranks ──────────────────────────────────
const bulkAssignRanks = async (req, res, next) => {
  try {
    const { projectId, ranks } = req.body; // ranks: [{ studentId, rank, score, remarks }]

    if (!projectId || !Array.isArray(ranks)) {
      return res.status(400).json({ success: false, message: 'projectId and ranks array are required.' });
    }

    const results = [];
    for (const entry of ranks) {
      if (!entry.studentId) continue;

      const filesApproved = await FileMetadata.countDocuments({
        uploadedBy: entry.studentId, project: projectId, status: 'approved'
      });
      const filesRejected = await FileMetadata.countDocuments({
        uploadedBy: entry.studentId, project: projectId, status: 'rejected'
      });
      const tasksCompleted = await Task.countDocuments({
        assignedTo: entry.studentId, project: projectId, status: 'completed'
      });

      let studentRank = await StudentRank.findOne({ student: entry.studentId, project: projectId });
      if (studentRank) {
        if (entry.rank !== undefined) studentRank.rank = entry.rank;
        if (entry.score !== undefined) studentRank.score = entry.score;
        if (entry.remarks !== undefined) studentRank.remarks = entry.remarks;
        studentRank.assignedBy = req.user._id;
        studentRank.filesApproved = filesApproved;
        studentRank.filesRejected = filesRejected;
        studentRank.tasksCompleted = tasksCompleted;
        await studentRank.save();
      } else {
        studentRank = await StudentRank.create({
          student: entry.studentId,
          project: projectId,
          rank: entry.rank || null,
          score: entry.score || 0,
          remarks: entry.remarks || '',
          assignedBy: req.user._id,
          filesApproved,
          filesRejected,
          tasksCompleted,
        });
      }
      results.push(studentRank);
    }

    res.json({ success: true, message: `${results.length} ranks assigned.`, ranks: results });
  } catch (error) {
    next(error);
  }
};

// ─── GET My Rank (student view) ──────────────────────────────
const getMyRank = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const rank = await StudentRank.findOne({ student: req.user._id, project: projectId })
      .populate('assignedBy', 'name');

    res.json({ success: true, rank: rank || null });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviewQueue,
  getStudentRanks,
  assignRank,
  bulkAssignRanks,
  getMyRank,
};
