/**
 * seed.js — Demo Data Seeder for ProjectHub
 * Run: node seed.js (from server/ directory)
 * Creates demo faculty + student accounts, a project, and sample tasks
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const ActivityLog = require('./models/ActivityLog');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Wipe existing demo data
  await User.deleteMany({ email: { $in: ['faculty@demo.com','student@demo.com','student2@demo.com'] } });
  console.log('🗑️  Cleared existing demo users');

  // Create Faculty
  const faculty = await User.create({
    name: 'Dr. Rajesh Kumar',
    email: 'faculty@demo.com',
    password: 'demo1234',
    role: 'faculty',
    provider: 'local',
  });

  // Create Students
  const student1 = await User.create({
    name: 'Aman Singh',
    email: 'student@demo.com',
    password: 'demo1234',
    role: 'student',
    provider: 'local',
  });

  const student2 = await User.create({
    name: 'Priya Sharma',
    email: 'student2@demo.com',
    password: 'demo1234',
    role: 'student',
    provider: 'local',
  });

  console.log('👤 Created demo users');

  // Clear & Create Project
  await Project.deleteMany({ name: 'INT 219 Web Project' });
  const project = await Project.create({
    name: 'INT 219 Web Project',
    description: 'Full-stack project for Internet Technologies course',
    owner: faculty._id,
    members: [
      { user: faculty._id, role: 'faculty' },
      { user: student1._id, role: 'student' },
      { user: student2._id, role: 'student' }
    ],
  });

  // Link project to users
  await User.updateMany(
    { _id: { $in: [faculty._id, student1._id, student2._id] } },
    { $addToSet: { projectIds: project._id } }
  );

  console.log('📁 Created demo project');

  // Create Tasks
  const tasks = await Task.insertMany([
    { title: 'Set up Express backend', description: 'Initialize Node.js + Express server with middleware', status: 'completed', priority: 'high', project: project._id, assignedTo: student1._id, createdBy: faculty._id, dueDate: new Date(Date.now() - 7*24*60*60*1000) },
    { title: 'Design MongoDB schemas', description: 'Create Mongoose models for User, Project, Task', status: 'completed', priority: 'high', project: project._id, assignedTo: student1._id, createdBy: faculty._id },
    { title: 'Implement JWT Authentication', description: 'Login, register, and protected routes with JWT middleware', status: 'completed', priority: 'high', project: project._id, assignedTo: student2._id, createdBy: faculty._id },
    { title: 'Build Dashboard UI', description: 'Create dashboard with stat cards and charts', status: 'in-progress', priority: 'medium', project: project._id, assignedTo: student1._id, createdBy: faculty._id, dueDate: new Date(Date.now() + 3*24*60*60*1000) },
    { title: 'Set up file upload system', description: 'Configure Multer middleware for file uploads and static serving', status: 'in-progress', priority: 'medium', project: project._id, assignedTo: student2._id, createdBy: faculty._id },
    { title: 'Implement Socket.IO chat', description: 'Real-time project chat with room management', status: 'pending', priority: 'medium', project: project._id, assignedTo: student1._id, createdBy: faculty._id, dueDate: new Date(Date.now() + 5*24*60*60*1000) },
    { title: 'Build leaderboard system', description: 'Contribution scoring and analytics dashboard for student ranking', status: 'pending', priority: 'low', project: project._id, assignedTo: student2._id, createdBy: faculty._id },
    { title: 'Write project report', description: 'Document all technologies and features used', status: 'pending', priority: 'low', project: project._id, assignedTo: student1._id, createdBy: faculty._id },
  ]);

  console.log('✅ Created 8 demo tasks');

  // Create activity logs
  await ActivityLog.insertMany([
    { user: student1._id, project: project._id, action: 'task_completed', metadata: { title: 'Set up Express backend' } },
    { user: student2._id, project: project._id, action: 'task_completed', metadata: { title: 'Implement JWT Authentication' } },
    { user: student1._id, project: project._id, action: 'task_completed', metadata: { title: 'Design MongoDB schemas' } },
    { user: student1._id, project: project._id, action: 'task_updated', metadata: { title: 'Build Dashboard UI' } },
    { user: faculty._id, project: project._id, action: 'project_created', metadata: { title: 'INT 219 Web Project' } },
  ]);

  console.log('⚡ Created activity logs');
  console.log('\n🎉 Seeding complete!\n');
  console.log('Demo accounts:');
  console.log('  Faculty:  faculty@demo.com / demo1234');
  console.log('  Student:  student@demo.com / demo1234');
  console.log('  Student2: student2@demo.com / demo1234');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
