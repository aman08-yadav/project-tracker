const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

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

    // Add project to user's list
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { projectIds: project._id } });

    // Log activity
    await ActivityLog.create({ user: req.user._id, project: project._id, action: 'project_created', metadata: { name } });

    res.status(201).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    let projects;
    if (req.user.role === 'faculty') {
      // Faculty sees all projects or ones they own/are member of
      projects = await Project.find({
        $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
      }).populate('owner', 'name email').populate('members.user', 'name email role');
    } else {
      projects = await Project.find({ 'members.user': req.user._id })
        .populate('owner', 'name email').populate('members.user', 'name email role');
    }
    res.json({ success: true, projects });
  } catch (error) {
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Check access
    const isMember = project.members.some(m => m.user._id.toString() === req.user._id.toString());
    if (!isMember && req.user.role !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

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

    await ActivityLog.create({ user: req.user._id, project: project._id, action: 'project_updated', metadata: { name } });

    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Only the owner can delete this project.' });
    }

    await project.deleteOne();
    res.json({ success: true, message: 'Project deleted.' });
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Only the owner can add members.' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ success: false, message: 'User with that email not found.' });

    const alreadyMember = project.members.some(m => m.user.toString() === userToAdd._id.toString());
    if (alreadyMember) return res.status(400).json({ success: false, message: 'User is already a member.' });

    project.members.push({ user: userToAdd._id, role: userToAdd.role });
    await project.save();

    await User.findByIdAndUpdate(userToAdd._id, { $addToSet: { projectIds: project._id } });

    await ActivityLog.create({ user: req.user._id, project: project._id, action: 'member_added', metadata: { addedUser: userToAdd.name } });

    res.json({ success: true, message: `${userToAdd.name} added to the project.`, project });
  } catch (error) {
    next(error);
  }
};

module.exports = { createProject, getProjects, getProject, updateProject, deleteProject, addMember };
