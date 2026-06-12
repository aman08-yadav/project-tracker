/**
 * Basic controller unit tests
 * Run: npx jest --verbose
 */

// Mock express-validator BEFORE requiring controllers
jest.mock('express-validator', () => ({
  validationResult: jest.fn(() => ({ isEmpty: () => true, array: () => [] })),
  body: jest.fn(() => ({ trim: jest.fn().mockReturnThis(), isLength: jest.fn().mockReturnThis(), withMessage: jest.fn().mockReturnThis(), isEmail: jest.fn().mockReturnThis(), notEmpty: jest.fn().mockReturnThis(), optional: jest.fn().mockReturnThis(), isIn: jest.fn().mockReturnThis() })),
}));

// Mock dependencies before requiring controllers
jest.mock('../models/User', () => ({
  findById: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  updateMany: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));
jest.mock('../models/Task', () => ({
  findById: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
  insertMany: jest.fn(),
}));
jest.mock('../models/Project', () => ({
  findById: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
}));
jest.mock('../models/ActivityLog', () => ({
  create: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
}));
jest.mock('../models/FileMetadata', () => ({
  findById: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
}));
jest.mock('../models/Notification', () => ({
  create: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
  updateMany: jest.fn(),
}));
jest.mock('../models/NotificationPreferences', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));
jest.mock('../models/StudentRank', () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
}));
jest.mock('../models/ChatMessage', () => ({
  find: jest.fn(),
  create: jest.fn(),
}));
jest.mock('../utils/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-token'),
  verify: jest.fn().mockReturnValue({ userId: 'mock-user-id' }),
}));

const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const FileMetadata = require('../models/FileMetadata');
const Notification = require('../models/Notification');
const NotificationPreferences = require('../models/NotificationPreferences');
const StudentRank = require('../models/StudentRank');
const { validationResult } = require('express-validator');

// ── Helper factories ──────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

// ── Auth Controller Tests ─────────────────────────────────
describe('Auth Controller', () => {
  const { register, login, getMe } = require('../controllers/authController');

  beforeEach(() => jest.clearAllMocks());

  test('register creates new user and returns token', async () => {
    const user = { _id: 'u1', name: 'Test', email: 'test@test.com', role: 'student', avatar: '' };
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(user);
    validationResult.mockReturnValue({ isEmpty: () => true });

    const req = { body: { name: 'Test', email: 'test@test.com', password: 'pass123', role: 'student' }, session: {} };
    const res = mockRes();

    await register(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, token: 'mock-token' }));
  });

  test('register rejects duplicate email', async () => {
    User.findOne.mockResolvedValue({ _id: 'existing' });
    validationResult.mockReturnValue({ isEmpty: () => true });

    const req = { body: { name: 'Test', email: 'dup@test.com', password: 'pass123' }, session: {} };
    const res = mockRes();

    await register(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Email already registered.' }));
  });

  test('login with valid credentials returns token', async () => {
    const user = { _id: 'u1', name: 'Test', email: 'test@test.com', role: 'student', avatar: '', comparePassword: jest.fn().mockResolvedValue(true), save: jest.fn() };
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
    validationResult.mockReturnValue({ isEmpty: () => true });

    const req = { body: { email: 'test@test.com', password: 'pass123' }, session: {} };
    const res = mockRes();

    await login(req, res, mockNext);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, token: 'mock-token' }));
  });

  test('getMe returns current user info', async () => {
    const req = { user: { _id: 'u1', name: 'Test', email: 'test@test.com', role: 'student', avatar: '', projectIds: [], provider: 'local' } };
    const res = mockRes();

    await getMe(req, res, mockNext);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});

// ── Task Controller Tests ─────────────────────────────────
describe('Task Controller', () => {
  const { createTask, deleteTask } = require('../controllers/taskController');

  beforeEach(() => jest.clearAllMocks());

  test('createTask creates task and returns 201', async () => {
    const project = { _id: 'p1', members: [{ user: 'faculty1' }] };
    Project.findById.mockResolvedValue(project);
    Task.create.mockResolvedValue({ _id: 't1', title: 'Test Task', project: 'p1' });
    ActivityLog.create.mockResolvedValue({});
    Task.findById.mockReturnValue({ populate: jest.fn().mockReturnThis() });
    validationResult.mockReturnValue({ isEmpty: () => true });

    const req = {
      body: { title: 'Test Task', projectId: 'p1', priority: 'medium' },
      user: { _id: 'faculty1', role: 'faculty' },
      app: { get: jest.fn().mockReturnValue(null) },
    };
    const res = mockRes();

    await createTask(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(Task.create).toHaveBeenCalled();
  });

  test('deleteTask prevents non-faculty non-creator from deleting', async () => {
    const task = { _id: 't1', createdBy: { toString: () => 'other-user' }, deleteOne: jest.fn() };
    Task.findById.mockResolvedValue(task);

    const req = {
      params: { id: 't1' },
      user: { _id: 'student1', role: 'student' },
    };
    const res = mockRes();

    await deleteTask(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('deleteTask allows faculty to delete', async () => {
    const task = { _id: 't1', createdBy: { toString: () => 'other-user' }, deleteOne: jest.fn() };
    Task.findById.mockResolvedValue(task);

    const req = {
      params: { id: 't1' },
      user: { _id: 'faculty1', role: 'faculty' },
    };
    const res = mockRes();

    await deleteTask(req, res, mockNext);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: 'Task deleted.' }));
    expect(task.deleteOne).toHaveBeenCalled();
  });
});

// ── File Controller Tests ─────────────────────────────────
describe('File Controller', () => {
  const { getFiles, deleteFile } = require('../controllers/fileController');
  const fs = require('fs');

  beforeEach(() => jest.clearAllMocks());
  afterEach(() => jest.restoreAllMocks());

  test('getFiles returns files for faculty', async () => {
    const files = [{ _id: 'f1', originalName: 'test.pdf' }];
    FileMetadata.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(files),
    });

    const req = { user: { _id: 'u1', role: 'faculty', projectIds: [] }, query: {} };
    const res = mockRes();

    await getFiles(req, res, mockNext);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, files }));
  });

  test('deleteFile prevents non-owner non-faculty from deleting', async () => {
    const file = { _id: 'f1', uploadedBy: { toString: () => 'other-user' } };
    FileMetadata.findById.mockResolvedValue(file);

    const req = { params: { id: 'f1' }, user: { _id: 'student1', role: 'student' } };
    const res = mockRes();

    await deleteFile(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('deleteFile allows owner to delete', async () => {
    const file = { _id: 'f1', uploadedBy: { toString: () => 'student1' }, filePath: '/fake/path', project: 'p1', originalName: 'test.pdf', deleteOne: jest.fn() };
    FileMetadata.findById.mockResolvedValue(file);
    jest.spyOn(require('fs'), 'existsSync').mockReturnValue(false);
    ActivityLog.create.mockResolvedValue({});

    const req = { params: { id: 'f1' }, user: { _id: 'student1', role: 'student' } };
    const res = mockRes();

    await deleteFile(req, res, mockNext);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});

// ── Ranking Controller Tests ──────────────────────────────
describe('Ranking Controller', () => {
  const { getMyRank } = require('../controllers/rankingController');

  beforeEach(() => jest.clearAllMocks());

  test('getMyRank returns 403 if student not in project', async () => {
    const project = { _id: 'p1', members: [{ user: { toString: () => 'other-student' } }] };
    Project.findById.mockResolvedValue(project);

    const req = { params: { projectId: 'p1' }, user: { _id: 'student1', role: 'student' } };
    const res = mockRes();

    await getMyRank(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('getMyRank returns rank for project member', async () => {
    const project = { _id: 'p1', members: [{ user: { toString: () => 'student1' } }] };
    Project.findById.mockResolvedValue(project);
    const rank = { rank: 'A', score: 85 };
    StudentRank.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(rank) });

    const req = { params: { projectId: 'p1' }, user: { _id: 'student1', role: 'student' } };
    const res = mockRes();

    await getMyRank(req, res, mockNext);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, rank }));
  });

  test('getMyRank returns null rank when none assigned', async () => {
    const project = { _id: 'p1', members: [{ user: { toString: () => 'student1' } }] };
    Project.findById.mockResolvedValue(project);
    StudentRank.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

    const req = { params: { projectId: 'p1' }, user: { _id: 'student1', role: 'student' } };
    const res = mockRes();

    await getMyRank(req, res, mockNext);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, rank: null }));
  });
});

// ── Notification Preferences Controller Tests ─────────────
describe('Notification Preferences Controller', () => {
  const { getPreferences, updatePreferences } = require('../controllers/notificationPreferencesController');

  beforeEach(() => jest.clearAllMocks());

  test('getPreferences creates default prefs if none exist', async () => {
    NotificationPreferences.findOne.mockResolvedValue(null);
    NotificationPreferences.create.mockResolvedValue({ user: 'u1', inApp: {}, browserPush: {} });

    const req = { user: { _id: 'u1' } };
    const res = mockRes();

    await getPreferences(req, res, mockNext);

    expect(NotificationPreferences.create).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test('updatePreferences only allows whitelisted keys', async () => {
    const prefs = { inApp: { taskAssigned: true, taskCompleted: true }, browserPush: { enabled: false } };
    NotificationPreferences.findOne.mockResolvedValue(prefs);
    prefs.save = jest.fn();

    const req = {
      user: { _id: 'u1' },
      body: { inApp: { taskAssigned: false, evilKey: true }, browserPush: { enabled: true } },
    };
    const res = mockRes();

    await updatePreferences(req, res, mockNext);

    expect(prefs.inApp.taskAssigned).toBe(false);
    expect(prefs.inApp.evilKey).toBeUndefined(); // Rejected by whitelist
    expect(prefs.browserPush.enabled).toBe(true);
    expect(prefs.save).toHaveBeenCalled();
  });

  test('updatePreferences does nothing with invalid input', async () => {
    const prefs = { inApp: { taskAssigned: true }, browserPush: { enabled: false } };
    NotificationPreferences.findOne.mockResolvedValue(prefs);
    prefs.save = jest.fn();

    const req = { user: { _id: 'u1' }, body: {} };
    const res = mockRes();

    await updatePreferences(req, res, mockNext);

    expect(prefs.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});

// ── Error Middleware Tests ─────────────────────────────────
describe('Error Middleware', () => {
  const errorMiddleware = require('../middleware/errorMiddleware');

  beforeEach(() => jest.clearAllMocks());

  test('handles Mongoose validation errors', () => {
    const err = new Error('Validation failed');
    err.name = 'ValidationError';
    err.errors = { name: { message: 'Name is required' } };

    const res = mockRes();
    errorMiddleware(err, {}, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Name is required' }));
  });

  test('handles duplicate key errors', () => {
    const err = new Error('Duplicate key');
    err.code = 11000;
    err.keyValue = { email: 'test@test.com' };

    const res = mockRes();
    errorMiddleware(err, {}, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Email already exists.' }));
  });

  test('handles JWT errors', () => {
    const err = new Error('Invalid token');
    err.name = 'JsonWebTokenError';

    const res = mockRes();
    errorMiddleware(err, {}, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('handles generic 500 errors', () => {
    const err = new Error('Something broke');

    const res = mockRes();
    errorMiddleware(err, {}, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Something broke' }));
  });
});
