const express = require('express');
const { body } = require('express-validator');
const {
  createProject, getProjects, getProject,
  updateProject, deleteProject, addMember, removeMember, getStudents,
} = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// All project routes require authentication
router.use(authMiddleware);

// ─── Project CRUD ─────────────────────────────────────────────
router.get('/', getProjects);

// Only faculty can CREATE projects
router.post('/', roleMiddleware('faculty'), [
  body('name').trim().isLength({ min: 2 }).withMessage('Project name must be at least 2 characters.'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long.'),
], createProject);

router.get('/students', roleMiddleware('faculty'), getStudents);

router.get('/:id', getProject);

// Only faculty can UPDATE / DELETE
router.put('/:id', roleMiddleware('faculty'), updateProject);
router.delete('/:id', roleMiddleware('faculty'), deleteProject);

// Member management (faculty only)
router.post('/:id/members', roleMiddleware('faculty'), [
  body('memberId').notEmpty().withMessage('memberId is required.'),
], addMember);

router.delete('/:id/members/:memberId', roleMiddleware('faculty'), removeMember);

module.exports = router;
