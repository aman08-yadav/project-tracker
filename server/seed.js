/**
 * seed.js — Full Demo Data Seeder for ProjectHub
 * Run: node seed.js (from server/ directory)
 * Creates demo faculty + student accounts, projects, tasks, notifications,
 * rankings, chat messages, activity logs, and sample file metadata.
 *
 * Set MONGODB_URI in your .env or pass it as an env var.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const FileMetadata = require('./models/FileMetadata');
const ActivityLog = require('./models/ActivityLog');
const Notification = require('./models/Notification');
const NotificationPreferences = require('./models/NotificationPreferences');
const StudentRank = require('./models/StudentRank');
const ChatMessage = require('./models/ChatMessage');

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set. Add it to your .env file.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  // ── Clear existing demo data ─────────────────────────────
  const demoEmails = [
    'faculty@demo.com',
    'student@demo.com',
    'student2@demo.com',
    'student3@demo.com',
  ];

  const existingUsers = await User.find({ email: { $in: demoEmails } }).select('_id');
  const userIds = existingUsers.map(u => u._id);

  await ChatMessage.deleteMany({ sender: { $in: userIds } });
  await Notification.deleteMany({ $or: [{ recipient: { $in: userIds } }, { sender: { $in: userIds } }] });
  await NotificationPreferences.deleteMany({ user: { $in: userIds } });
  await StudentRank.deleteMany({ assignedBy: { $in: userIds } });
  await FileMetadata.deleteMany({ uploadedBy: { $in: userIds } });
  await ActivityLog.deleteMany({ user: { $in: userIds } });
  await Task.deleteMany({ createdBy: { $in: userIds } });
  await Project.deleteMany({ owner: { $in: userIds } });
  await User.deleteMany({ email: { $in: demoEmails } });
  console.log('🗑️  Cleared existing demo data');

  // ── Users ────────────────────────────────────────────────
  const defaultPassword = process.env.DEFAULT_PASSWORD || 'student123';
  const facultyPassword = process.env.FACULTY_PASSWORD || 'faculty123';

  const faculty = await User.create({
    name: 'Dr. Rajesh Kumar',
    email: 'faculty@demo.com',
    password: facultyPassword,
    role: 'faculty',
    provider: 'local',
  });

  const student1 = await User.create({
    name: 'Aman Singh',
    email: 'student@demo.com',
    password: defaultPassword,
    role: 'student',
    provider: 'local',
  });

  const student2 = await User.create({
    name: 'Priya Sharma',
    email: 'student2@demo.com',
    password: defaultPassword,
    role: 'student',
    provider: 'local',
  });

  const student3 = await User.create({
    name: 'Rohit Verma',
    email: 'student3@demo.com',
    password: defaultPassword,
    role: 'student',
    provider: 'local',
  });

  console.log('👤 Created 4 demo users (1 faculty + 3 students)');

  // ── Projects ─────────────────────────────────────────────
  const project1 = await Project.create({
    name: 'INT 219 Web Project',
    description: 'Full-stack project for Internet Technologies course — a team contribution tracking system with real-time features.',
    owner: faculty._id,
    members: [
      { user: faculty._id, role: 'faculty' },
      { user: student1._id, role: 'student' },
      { user: student2._id, role: 'student' },
      { user: student3._id, role: 'student' },
    ],
  });

  const project2 = await Project.create({
    name: 'CS 301 AI Research',
    description: 'Research project on transformer-based NLP models for code generation.',
    owner: faculty._id,
    members: [
      { user: faculty._id, role: 'faculty' },
      { user: student1._id, role: 'student' },
      { user: student3._id, role: 'student' },
    ],
  });

  // Link projects to users
  const allMembers = [faculty._id, student1._id, student2._id, student3._id];
  await User.updateMany(
    { _id: { $in: allMembers } },
    { $addToSet: { projectIds: { $each: [project1._id, project2._id] } } }
  );
  // Fix: student2 is not in project2, student3 is
  await User.findByIdAndUpdate(student2._id, { $pull: { projectIds: project2._id } });

  console.log('📁 Created 2 demo projects');

  // ── Tasks ────────────────────────────────────────────────
  const tasks = await Task.insertMany([
    // Project 1 tasks
    { title: 'Set up Express backend', description: 'Initialize Node.js + Express server with middleware stack', status: 'completed', priority: 'high', project: project1._id, assignedTo: student1._id, createdBy: faculty._id, dueDate: new Date(Date.now() - 7*24*60*60*1000) },
    { title: 'Design MongoDB schemas', description: 'Create Mongoose models for User, Project, Task, and FileMetadata', status: 'completed', priority: 'high', project: project1._id, assignedTo: student1._id, createdBy: faculty._id },
    { title: 'Implement JWT Authentication', description: 'Login, register, and protected routes with JWT middleware', status: 'completed', priority: 'high', project: project1._id, assignedTo: student2._id, createdBy: faculty._id },
    { title: 'Build Dashboard UI', description: 'Create responsive dashboard with stat cards and contribution charts', status: 'in-progress', priority: 'medium', project: project1._id, assignedTo: student1._id, createdBy: faculty._id, dueDate: new Date(Date.now() + 3*24*60*60*1000) },
    { title: 'Set up file upload system', description: 'Configure Multer middleware for file uploads with faculty approval workflow', status: 'in-progress', priority: 'medium', project: project1._id, assignedTo: student2._id, createdBy: faculty._id },
    { title: 'Implement Socket.IO chat', description: 'Real-time project chat with room management and history', status: 'pending', priority: 'medium', project: project1._id, assignedTo: student3._id, createdBy: faculty._id, dueDate: new Date(Date.now() + 5*24*60*60*1000) },
    { title: 'Build leaderboard system', description: 'Contribution scoring and analytics dashboard for student ranking', status: 'pending', priority: 'low', project: project1._id, assignedTo: student2._id, createdBy: faculty._id },
    { title: 'Write project report', description: 'Document all technologies and features used in the project', status: 'pending', priority: 'low', project: project1._id, assignedTo: student3._id, createdBy: faculty._id },
    // Project 2 tasks
    { title: 'Literature review on Transformers', description: 'Survey recent papers on transformer architectures for code generation', status: 'completed', priority: 'high', project: project2._id, assignedTo: student1._id, createdBy: faculty._id },
    { title: 'Build data preprocessing pipeline', description: 'Clean and tokenize the training dataset for the model', status: 'in-progress', priority: 'high', project: project2._id, assignedTo: student3._id, createdBy: faculty._id, dueDate: new Date(Date.now() + 7*24*60*60*1000) },
  ]);

  console.log(`✅ Created ${tasks.length} demo tasks`);

  // ── File Metadata (sample uploads) ──────────────────────
  const files = await FileMetadata.insertMany([
    { originalName: 'backend-setup-guide.pdf', storedName: 'demo-file-1.pdf', filePath: '/uploads/demo-file-1.pdf', mimetype: 'application/pdf', size: 245000, uploadedBy: student1._id, project: project1._id, description: 'Backend setup documentation', status: 'approved', reviewedBy: faculty._id, reviewedAt: new Date(Date.now() - 5*24*60*60*1000), reviewNote: 'Well documented, great work!' },
    { originalName: 'auth-flow-diagram.png', storedName: 'demo-file-2.png', filePath: '/uploads/demo-file-2.png', mimetype: 'image/png', size: 89000, uploadedBy: student2._id, project: project1._id, description: 'JWT authentication flow diagram', status: 'approved', reviewedBy: faculty._id, reviewedAt: new Date(Date.now() - 3*24*60*60*1000), reviewNote: 'Clear and accurate diagram' },
    { originalName: 'dashboard-mockup.fig', storedName: 'demo-file-3.fig', filePath: '/uploads/demo-file-3.fig', mimetype: 'application/octet-stream', size: 1200000, uploadedBy: student1._id, project: project1._id, description: 'Dashboard UI mockup in Figma', status: 'pending' },
    { originalName: 'chat-prototype.zip', storedName: 'demo-file-4.zip', filePath: '/uploads/demo-file-4.zip', mimetype: 'application/zip', size: 3400000, uploadedBy: student3._id, project: project1._id, description: 'Chat prototype implementation', status: 'rejected', reviewedBy: faculty._id, reviewedAt: new Date(Date.now() - 1*24*60*60*1000), reviewNote: 'Missing error handling, please revise' },
    { originalName: 'transformer-survey.docx', storedName: 'demo-file-5.docx', filePath: '/uploads/demo-file-5.docx', mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 520000, uploadedBy: student1._id, project: project2._id, description: 'Literature review document', status: 'approved', reviewedBy: faculty._id, reviewedAt: new Date(Date.now() - 2*24*60*60*1000), reviewNote: 'Thorough survey, excellent citations' },
    { originalName: 'data-preprocessing.py', storedName: 'demo-file-6.py', filePath: '/uploads/demo-file-6.py', mimetype: 'text/x-python', size: 12000, uploadedBy: student3._id, project: project2._id, description: 'Python preprocessing script', status: 'pending' },
  ]);

  console.log(`📎 Created ${files.length} sample file records`);

  // ── Activity Logs ────────────────────────────────────────
  await ActivityLog.insertMany([
    { user: student1._id, project: project1._id, action: 'task_completed', metadata: { title: 'Set up Express backend' } },
    { user: student2._id, project: project1._id, action: 'task_completed', metadata: { title: 'Implement JWT Authentication' } },
    { user: student1._id, project: project1._id, action: 'task_completed', metadata: { title: 'Design MongoDB schemas' } },
    { user: student1._id, project: project1._id, action: 'task_updated', metadata: { title: 'Build Dashboard UI' } },
    { user: faculty._id, project: project1._id, action: 'project_created', metadata: { title: 'INT 219 Web Project' } },
    { user: student2._id, project: project1._id, action: 'file_upload', metadata: { title: 'auth-flow-diagram.png' } },
    { user: student3._id, project: project1._id, action: 'file_upload', metadata: { title: 'chat-prototype.zip' } },
    { user: student1._id, project: project2._id, action: 'task_completed', metadata: { title: 'Literature review on Transformers' } },
    { user: faculty._id, project: project2._id, action: 'project_created', metadata: { title: 'CS 301 AI Research' } },
  ]);

  console.log('⚡ Created activity logs');

  // ── Notifications ────────────────────────────────────────
  await Notification.insertMany([
    { recipient: student1._id, sender: faculty._id, type: 'task_assigned', title: 'New Task Assigned', message: 'Dr. Rajesh Kumar assigned you "Build Dashboard UI"', project: project1._id, taskId: tasks[3]._id, read: false },
    { recipient: student2._id, sender: faculty._id, type: 'task_assigned', title: 'New Task Assigned', message: 'Dr. Rajesh Kumar assigned you "Set up file upload system"', project: project1._id, taskId: tasks[4]._id, read: false },
    { recipient: student3._id, sender: faculty._id, type: 'task_assigned', title: 'New Task Assigned', message: 'Dr. Rajesh Kumar assigned you "Implement Socket.IO chat"', project: project1._id, taskId: tasks[5]._id, read: true },
    { recipient: faculty._id, sender: student1._id, type: 'task_completed', title: 'Task Completed', message: 'Aman Singh completed "Set up Express backend"', project: project1._id, taskId: tasks[0]._id, read: true },
    { recipient: faculty._id, sender: student2._id, type: 'task_completed', title: 'Task Completed', message: 'Priya Sharma completed "Implement JWT Authentication"', project: project1._id, taskId: tasks[2]._id, read: true },
    { recipient: student1._id, sender: faculty._id, type: 'file_approved', title: 'File Approved', message: 'Your file "backend-setup-guide.pdf" was approved — Well documented, great work!', project: project1._id, read: true },
    { recipient: student2._id, sender: faculty._id, type: 'file_approved', title: 'File Approved', message: 'Your file "auth-flow-diagram.png" was approved — Clear and accurate diagram', project: project1._id, read: false },
    { recipient: student3._id, sender: faculty._id, type: 'file_rejected', title: 'File Rejected', message: 'Your file "chat-prototype.zip" was rejected — Missing error handling, please revise', project: project1._id, read: false },
    { recipient: student1._id, sender: faculty._id, type: 'file_approved', title: 'File Approved', message: 'Your file "transformer-survey.docx" was approved — Thorough survey, excellent citations', project: project2._id, read: true },
  ]);

  console.log('🔔 Created sample notifications');

  // ── Notification Preferences ─────────────────────────────
  await NotificationPreferences.insertMany([
    { user: faculty._id, inApp: { taskAssigned: true, taskCompleted: true, taskUpdated: true, fileUploaded: true, fileApproved: true, fileRejected: true, memberAdded: true }, browserPush: { enabled: false, taskAssigned: true, taskCompleted: true, fileApproved: true, fileRejected: true } },
    { user: student1._id, inApp: { taskAssigned: true, taskCompleted: true, taskUpdated: true, fileUploaded: true, fileApproved: true, fileRejected: true, memberAdded: true }, browserPush: { enabled: true, taskAssigned: true, taskCompleted: true, fileApproved: true, fileRejected: true } },
    { user: student2._id, inApp: { taskAssigned: true, taskCompleted: true, taskUpdated: true, fileUploaded: true, fileApproved: true, fileRejected: true, memberAdded: true }, browserPush: { enabled: false, taskAssigned: true, taskCompleted: true, fileApproved: true, fileRejected: true } },
    { user: student3._id, inApp: { taskAssigned: true, taskCompleted: true, taskUpdated: true, fileUploaded: true, fileApproved: true, fileRejected: true, memberAdded: true }, browserPush: { enabled: false, taskAssigned: true, taskCompleted: true, fileApproved: true, fileRejected: true } },
  ]);

  console.log('⚙️  Created notification preferences');

  // ── Student Rankings ─────────────────────────────────────
  await StudentRank.insertMany([
    { student: student1._id, project: project1._id, rank: 'A', score: 85, remarks: 'Strong backend work and consistent contributions. Excellent documentation.', assignedBy: faculty._id, filesApproved: 1, filesRejected: 0, tasksCompleted: 2 },
    { student: student2._id, project: project1._id, rank: 'B+', score: 75, remarks: 'Good authentication implementation. Needs to improve file quality.', assignedBy: faculty._id, filesApproved: 1, filesRejected: 0, tasksCompleted: 1 },
    { student: student3._id, project: project1._id, rank: 'B-', score: 60, remarks: 'Working on chat feature but file was rejected. Please revise and resubmit.', assignedBy: faculty._id, filesApproved: 0, filesRejected: 1, tasksCompleted: 0 },
    { student: student1._id, project: project2._id, rank: 'A+', score: 95, remarks: 'Outstanding literature review. Top contributor to the research project.', assignedBy: faculty._id, filesApproved: 1, filesRejected: 0, tasksCompleted: 1 },
    { student: student3._id, project: project2._id, rank: 'B', score: 70, remarks: 'Good progress on data pipeline. Keep up the work.', assignedBy: faculty._id, filesApproved: 0, filesRejected: 0, tasksCompleted: 0 },
  ]);

  console.log('🏆 Created student rankings');

  // ── Chat Messages ────────────────────────────────────────
  await ChatMessage.insertMany([
    { project: project1._id, sender: faculty._id, senderName: 'Dr. Rajesh Kumar', text: 'Welcome to the INT 219 project! Please check your assigned tasks.' },
    { project: project1._id, sender: student1._id, senderName: 'Aman Singh', text: 'Thanks Dr. Kumar! I have started on the backend setup.' },
    { project: project1._id, sender: student2._id, senderName: 'Priya Sharma', text: 'I will work on the auth system this week.' },
    { project: project1._id, sender: student3._id, senderName: 'Rohit Verma', text: 'Should I start on the chat feature or wait for the backend?' },
    { project: project1._id, sender: student1._id, senderName: 'Aman Singh', text: 'The backend is ready. You can start on the chat feature now!' },
    { project: project2._id, sender: faculty._id, senderName: 'Dr. Rajesh Kumar', text: 'Let us discuss the transformer architecture for our research paper.' },
    { project: project2._id, sender: student1._id, senderName: 'Aman Singh', text: 'I have completed the literature review. Uploading the document now.' },
  ]);

  console.log('💬 Created chat messages');

  // ── Summary ──────────────────────────────────────────────
  console.log('\n🎉 Seeding complete!\n');
  console.log('═'.repeat(50));
  console.log('  DEMO ACCOUNTS');
  console.log('═'.repeat(50));
  console.log(`  Faculty:  faculty@demo.com   / ${facultyPassword}`);
  console.log(`  Student:  student@demo.com   / ${defaultPassword}`);
  console.log(`  Student:  student2@demo.com  / ${defaultPassword}`);
  console.log(`  Student:  student3@demo.com  / ${defaultPassword}`);
  console.log('═'.repeat(50));
  console.log('  PROJECTS');
  console.log('═'.repeat(50));
  console.log(`  1. ${project1.name} (4 members)`);
  console.log(`  2. ${project2.name} (3 members)`);
  console.log('═'.repeat(50));
  console.log(`  Data: ${tasks.length} tasks, ${files.length} files, 9 notifications`);
  console.log(`  Rankings for ${project1.name}: Aman=A, Priya=B+, Rohit=B-`);
  console.log(`  Rankings for ${project2.name}: Aman=A+, Rohit=B`);
  console.log('═'.repeat(50));

  await mongoose.disconnect();
}

seed().catch(err => { console.error('❌ Seed failed:', err.message); process.exit(1); });
