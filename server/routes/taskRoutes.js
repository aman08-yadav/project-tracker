const express = require('express');
const { body } = require('express-validator');
const { createTask, getTasks, updateTaskStatus, updateTask, deleteTask } = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getTasks);
router.get('/project/:projectId', (req, res, next) => {
  req.query.projectId = req.params.projectId;
  return getTasks(req, res, next);
});
router.post('/', [
  body('title').trim().notEmpty().withMessage('Task title is required.'),
  body('projectId').notEmpty().withMessage('projectId is required.'),
  body('priority').optional().isIn(['low', 'medium', 'high']),
], createTask);
router.patch('/:id/status', [
  body('status').isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status.'),
], updateTaskStatus);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
