const express = require('express');
const { body } = require('express-validator');
const {
  createProject, getProjects, getProject,
  updateProject, deleteProject, addMember,
} = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getProjects);
router.post('/', [
  body('name').trim().isLength({ min: 2 }).withMessage('Project name must be at least 2 characters.'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long.'),
], createProject);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/members', [
  body('email').isEmail().withMessage('Valid email required.'),
], addMember);

module.exports = router;
