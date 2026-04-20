const express = require('express');
const { getProjectAnalytics, getUserAnalytics, getMyAnalytics, getActivityLog } = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/me', getMyAnalytics);
router.get('/project/:id', getProjectAnalytics);   // All users can view
router.get('/user/:id', getUserAnalytics);          // All users can view own
router.get('/activity', getActivityLog);

// Auth config check (for frontend OAuth button visibility)
router.get('/config', (req, res) => {
  res.json({
    googleEnabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID'),
    githubEnabled: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_ID !== 'YOUR_GITHUB_CLIENT_ID'),
  });
});

module.exports = router;
