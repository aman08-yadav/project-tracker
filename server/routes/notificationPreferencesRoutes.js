const express = require('express');
const { getPreferences, updatePreferences } = require('../controllers/notificationPreferencesController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getPreferences);
router.put('/', updatePreferences);

module.exports = router;
