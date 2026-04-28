const express = require('express');
const {
  getProjectAnalytics, getUserAnalytics, getMyAnalytics,
  getActivityLog, getAllStudentsProgress,
} = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// ─── Protected routes ──────────────────────────────────────────
router.use(authMiddleware);

router.get('/me', getMyAnalytics);
router.get('/project/:id', getProjectAnalytics);
router.get('/user/:id', getUserAnalytics);
router.get('/activity', getActivityLog);

// Faculty only: view all students progress
router.get('/students-progress', roleMiddleware('faculty'), getAllStudentsProgress);

module.exports = router;
