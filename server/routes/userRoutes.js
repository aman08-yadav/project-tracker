const express = require('express');
const { getLeaderboard, getProfile, getAllUsers, updateProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Leaderboard is visible to all authenticated users
router.get('/leaderboard', authMiddleware, getLeaderboard);

// Profile visible to all authenticated users (own profile)
router.get('/profile/:id', authMiddleware, getProfile);
router.put('/profile/:id', authMiddleware, updateProfile);

// All users list — accessible to both roles (needed for add-member dropdown)
router.get('/', authMiddleware, getAllUsers);

module.exports = router;
