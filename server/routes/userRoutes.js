const express = require('express');
const { getLeaderboard, getProfile, getAllUsers } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/leaderboard', authMiddleware, getLeaderboard);
router.get('/profile/:id', authMiddleware, getProfile);
router.get('/', authMiddleware, getAllUsers);

module.exports = router;
