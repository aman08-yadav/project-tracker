const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const FileMetadata = require('../models/FileMetadata');
const ActivityLog = require('../models/ActivityLog');
const Project = require('../models/Project');
const { createNotification } = require('./notificationController');

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const { projectId, description } = req.body;
    if (!projectId) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'projectId is required.' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Check membership
    const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember && req.user.role !== 'faculty') {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ success: false, message: 'You are not a member of this project.' });
    }

    const fileMeta = await FileMetadata.create({
      originalName: req.file.originalname,
      storedName: req.file.filename,
      filePath: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id,
      project: projectId,
      description: description || '',
    });

    // Prisma analytics calls removed for MongoDB-only operation

    await ActivityLog.create({
      user: req.user._id, project: projectId, action: 'file_upload',
      metadata: { fileId: fileMeta._id, originalName: req.file.originalname, size: req.file.size },
    });

    // Notify project room via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(projectId).emit('file:uploaded', {
        file: { id: fileMeta._id, originalName: req.file.originalname, uploadedBy: req.user.name },
      });
    }

    res.status(201).json({ success: true, file: fileMeta });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

const getProjectFiles = async (req, res, next) => {
  try {
    const files = await FileMetadata.find({ project: req.params.id })
      .populate('uploadedBy', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, files });
  } catch (error) {
    next(error);
  }
};

const getFiles = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.projectId) filter.project = req.query.projectId;
    
    // Restrict students to files from their projects only
    if (req.user.role !== 'faculty') {
      if (req.query.projectId) {
        if (!req.user.projectIds.map(id => id.toString()).includes(req.query.projectId)) {
           return res.json({ success: true, files: [] });
        }
        filter.project = req.query.projectId;
      } else {
        filter.project = { $in: req.user.projectIds || [] };
      }
    }

    const files = await FileMetadata.find(filter)
      .populate('uploadedBy', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, files });
  } catch (error) {
    next(error);
  }
};

const deleteFile = async (req, res, next) => {
  try {
    const file = await FileMetadata.findById(req.params.id);
    if (!file) return res.status(404).json({ success: false, message: 'File not found.' });

    if (file.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this file.' });
    }

    // Delete from disk using fs
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    await ActivityLog.create({
      user: req.user._id, project: file.project, action: 'file_delete',
      metadata: { originalName: file.originalName },
    });

    await file.deleteOne();
    res.json({ success: true, message: 'File deleted.' });
  } catch (error) {
    next(error);
  }
};

const downloadFile = async (req, res, next) => {
  try {
    const file = await FileMetadata.findById(req.params.id);
    if (!file) return res.status(404).json({ success: false, message: 'File not found.' });
    if (!fs.existsSync(file.filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on disk.' });
    }
    res.download(file.filePath, file.originalName);
  } catch (error) {
    next(error);
  }
};

// ── Review (Approve/Reject) File — Faculty Only ──────────────
const reviewFile = async (req, res, next) => {
  try {
    const { status, reviewNote } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
    }

    const file = await FileMetadata.findById(req.params.id);
    if (!file) return res.status(404).json({ success: false, message: 'File not found.' });

    file.status = status;
    file.reviewedBy = req.user._id;
    file.reviewedAt = new Date();
    file.reviewNote = reviewNote || '';
    await file.save();

    await ActivityLog.create({
      user: req.user._id,
      project: file.project,
      action: status === 'approved' ? 'file_approved' : 'file_rejected',
      metadata: { fileId: file._id, originalName: file.originalName },
    });

    // Notify via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(file.project.toString()).emit('file:reviewed', {
        fileId: file._id, status, originalName: file.originalName, reviewedBy: req.user.name,
      });
    }

    // ── Send notification to file uploader ──────────────────
    if (file.uploadedBy.toString() !== req.user._id.toString()) {
      const notificationType = status === 'approved' ? 'file_approved' : 'file_rejected';
      const title = status === 'approved' ? 'File Approved' : 'File Rejected';
      const message = status === 'approved'
        ? `${req.user.name} approved your file: ${file.originalName}`
        : `${req.user.name} rejected your file: ${file.originalName}${reviewNote ? ` — ${reviewNote}` : ''}`;

      const notification = await createNotification({
        recipientId: file.uploadedBy,
        senderId: req.user._id,
        type: notificationType,
        title,
        message,
        projectId: file.project,
      });

      if (io && notification) {
        io.sendNotification(file.uploadedBy.toString(), notification);
      }
    }

    res.json({ success: true, message: `File ${status}.`, file });
  } catch (error) {
    next(error);
  }
};

// ── Get Pending Files (Faculty Dashboard) ────────────────────
const getPendingFiles = async (req, res, next) => {
  try {
    const files = await FileMetadata.find({ status: 'pending' })
      .populate('uploadedBy', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, files });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadFile, getProjectFiles, getFiles, deleteFile, downloadFile, reviewFile, getPendingFiles };
