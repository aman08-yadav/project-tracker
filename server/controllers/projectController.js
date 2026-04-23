const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// ─── Create Project (faculty only) ───────────────────────────
const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: req.user.role }],
    });

    // Add project to faculty's list
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { projectIds: project._id } });

    // Log activity
    await ActivityLog.create({ user: req.user._id, project: project._id, action: 'project_created', metadata: { name } });

    res.status(201).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// ─── Get Projects ─────────────────────────────────────────────
const getProjects = async (req, res, next) => {
  try {
    let filter;
    if (req.user.role === 'faculty') {
      // Faculty sees all projects they own or are member of
      filter = { $or: [{ owner: req.user._id }, { 'members.user': req.user._id }] };
    } else {
      // Students see only projects they are assigned to
      filter = { 'members.user': req.user._id };
    }

    const projects = await Project.find(filter)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role')
      .sort({ createdAt: -1 });

    res.json({ success: true, projects });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Project ───────────────────────────────────────
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Check access: faculty can see all, students only if member
    const isMember = project.members.some(m => m.user._id.toString() === req.user._id.toString());
    if (!isMember && req.user.role !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// ─── Update Project ───────────────────────────────────────────
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Only the owner can update this project.' });
    }

    const { name, description, status } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    await project.save();

    await ActivityLog.create({ user: req.user._id, project: project._id, action: 'project_updated', metadata: { name: project.name } });

    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Project ───────────────────────────────────────────
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Only the owner can delete this project.' });
    }

    await project.deleteOne();

    // Clean up projectIds from all users
    await User.updateMany({ projectIds: project._id }, { $pull: { projectIds: project._id } });

    res.json({ success: true, message: 'Project deleted.' });
  } catch (error) {
    next(error);
  }
};

// ─── Add Member (by user ID) ──────────────────────────────────
// Faculty selects a registered user by their ObjectId from dropdown
const addMember = async (req, res, next) => {
  try {
    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({ success: false, message: 'memberId is required.' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Only the owner/faculty can add members.' });
    }

    const userToAdd = await User.findById(memberId);
    if (!userToAdd) return res.status(404).json({ success: false, message: 'User not found.' });

    const alreadyMember = project.members.some(m => m.user.toString() === userToAdd._id.toString());
    if (alreadyMember) return res.status(400).json({ success: false, message: 'User is already a member.' });

    project.members.push({ user: userToAdd._id, role: userToAdd.role });
    await project.save();

    await User.findByIdAndUpdate(userToAdd._id, { $addToSet: { projectIds: project._id } });

    await ActivityLog.create({
      user: req.user._id,
      project: project._id,
      action: 'member_added',
      metadata: { addedUser: userToAdd.name, addedUserId: userToAdd._id },
    });

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(project._id.toString()).emit('notification', {
        message: `${userToAdd.name} has been added to the project`,
      });
    }

    // Return populated project
    const populated = await Project.findById(project._id)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role');

    res.json({ success: true, message: `${userToAdd.name} added to the project.`, project: populated });
  } catch (error) {
    next(error);
  }
};

// ─── Remove Member ─────────────────────────────────────────────
const removeMember = async (req, res, next) => {
  try {
    const { id: projectId, memberId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Only the owner/faculty can remove members.' });
    }

    // Cannot remove project owner
    if (project.owner.toString() === memberId) {
      return res.status(400).json({ success: false, message: 'Cannot remove the project owner.' });
    }

    project.members = project.members.filter(m => m.user.toString() !== memberId);
    await project.save();

    await User.findByIdAndUpdate(memberId, { $pull: { projectIds: project._id } });

    await ActivityLog.create({
      user: req.user._id,
      project: project._id,
      action: 'member_removed',
      metadata: { removedUserId: memberId },
    });

    res.json({ success: true, message: 'Member removed from project.' });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Students (for faculty to assign) ─────────────────
const getStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).select('name email avatar role createdAt');
    res.json({ success: true, users: students });
  } catch (error) {
    next(error);
  }
};

module.exports = { createProject, getProjects, getProject, updateProject, deleteProject, addMember, removeMember, getStudents };
